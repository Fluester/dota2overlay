use crate::{
    data_sync::DataServiceState,
    models::{CfgStatus, GsiHeroInfo, GsiOwnedItemDetail, GsiSimulateResponse, GsiState, GsiStatus, ServerStatus},
    storage::StoragePaths,
};
use serde_json::{json, Value};
use std::{
    collections::HashSet,
    fs,
    io::Read,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    thread,
    time::Duration,
};
use tauri::{AppHandle, Emitter};

pub const GSI_HOST: &str = "127.0.0.1";
pub const GSI_PORT: u16 = 3000;
pub const CFG_FILENAME: &str = "gamestate_integration_overlay.cfg";
const LEGACY_CFG_FILENAME: &str = "gamestate_integration_dota2overlay.cfg";
const MAX_BODY_BYTES: usize = 1024 * 1024;

#[derive(Default)]
struct GsiInternalState {
    last_gsi_state: Option<GsiState>,
    last_match_id: Option<String>,
    last_game_state: Option<String>,
    last_reset_match_id: Option<String>,
    server_status: Option<ServerStatus>,
    cfg_status: Option<CfgStatus>,
}

pub struct GsiServiceState {
    inner: Mutex<GsiInternalState>,
    shutdown: AtomicBool,
}

impl GsiServiceState {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(GsiInternalState {
                server_status: Some(ServerStatus {
                    listening: false,
                    host: GSI_HOST.to_string(),
                    port: GSI_PORT,
                    error: None,
                    error_code: None,
                }),
                ..Default::default()
            }),
            shutdown: AtomicBool::new(false),
        }
    }

    pub fn stop(&self) {
        self.shutdown.store(true, Ordering::SeqCst);
        if let Ok(mut g) = self.inner.lock() {
            if let Some(ref mut srv) = g.server_status {
                srv.listening = false;
            }
        }
    }

    pub fn get_status(&self) -> GsiStatus {
        let g = self.inner.lock().ok();
        let server = g
            .as_ref()
            .and_then(|x| x.server_status.clone())
            .unwrap_or(ServerStatus {
                listening: false,
                host: GSI_HOST.to_string(),
                port: GSI_PORT,
                error: None,
                error_code: None,
            });
        let cfg = g.as_ref().and_then(|x| x.cfg_status.clone());
        let standalone_debug = cfg.as_ref().map(|c| !c.dota_found).unwrap_or(true);
        let last_gsi_state = g.as_ref().and_then(|x| x.last_gsi_state.clone());
        GsiStatus {
            server,
            cfg,
            standalone_debug,
            last_gsi_state,
        }
    }

    pub fn last_game_state(&self) -> Option<String> {
        self.inner
            .lock()
            .ok()
            .and_then(|g| g.last_gsi_state.as_ref().and_then(|s| s.game_state.clone()))
    }

    pub fn clear_state(&self) {
        if let Ok(mut g) = self.inner.lock() {
            g.last_gsi_state = None;
            g.last_match_id = None;
            g.last_game_state = None;
            g.last_reset_match_id = None;
        }
    }

    pub fn generate_cfg(&self, storage: &StoragePaths) -> CfgStatus {
        let port = {
            let g = self.inner.lock().ok();
            g.and_then(|x| x.server_status.as_ref().filter(|s| s.listening && s.port > 0).map(|s| s.port))
                .unwrap_or(GSI_PORT)
        };
        let status = generate_cfg_file(storage, port);
        if let Ok(mut g) = self.inner.lock() {
            g.cfg_status = Some(status.clone());
        }
        status
    }
}

pub fn build_cfg_content(port: u16) -> String {
    let active_port = if port > 0 { port } else { GSI_PORT };
    format!(
        "\"Dota 2 Counter Overlay Integration\"\n{{\n    \"uri\"           \"http://{GSI_HOST}:{active_port}/\"\n    \"timeout\"       \"5.0\"\n    \"buffer\"        \"0.1\"\n    \"throttle\"      \"0.5\"\n    \"heartbeat\"     \"30.0\"\n    \"data\"\n    {{\n        \"provider\"      \"1\"\n        \"map\"           \"1\"\n        \"player\"        \"1\"\n        \"hero\"          \"1\"\n        \"abilities\"     \"1\"\n        \"items\"         \"1\"\n        \"draft\"         \"1\"\n    }}\n}}\n"
    )
}

fn normalize_windows_path(raw: &str) -> String {
    raw.trim()
        .replace("\\\\", "\\")
        .replace('/', "\\")
        .trim_end_matches('\\')
        .to_string()
}

pub fn parse_library_folders_vdf(content: &str) -> Vec<String> {
    let mut libs = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        let tokens = extract_quoted_tokens(trimmed);
        if tokens.len() >= 2 {
            let k = tokens[0].to_ascii_lowercase();
            if k == "path" {
                let norm = normalize_windows_path(&tokens[1]);
                if !norm.is_empty() {
                    libs.push(norm);
                }
            } else if k.chars().all(|c| c.is_ascii_digit()) {
                let v = &tokens[1];
                if v.len() >= 2 && v.as_bytes()[1] == b':' {
                    let norm = normalize_windows_path(v);
                    if !norm.is_empty() {
                        libs.push(norm);
                    }
                }
            }
        }
    }
    libs
}

fn extract_quoted_tokens(line: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut in_quotes = false;
    let mut buf = String::new();
    for ch in line.chars() {
        if ch == '"' {
            if in_quotes {
                out.push(buf.clone());
                buf.clear();
                in_quotes = false;
            } else {
                in_quotes = true;
            }
        } else if in_quotes {
            buf.push(ch);
        }
    }
    out
}

#[cfg(windows)]
fn read_steam_path_from_registry() -> Option<String> {
    use winreg::{enums::HKEY_CURRENT_USER, RegKey};
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let key = hkcu.open_subkey("Software\\Valve\\Steam").ok()?;
    let val: String = key.get_value("SteamPath").ok()?;
    let norm = normalize_windows_path(&val);
    if norm.is_empty() {
        None
    } else {
        Some(norm)
    }
}

#[cfg(not(windows))]
fn read_steam_path_from_registry() -> Option<String> {
    None
}

pub fn collect_steam_library_paths() -> Vec<String> {
    let mut seen_lower = HashSet::new();
    let mut ordered = Vec::new();

    let mut add_candidate = |raw: &str| {
        let norm = normalize_windows_path(raw);
        if norm.is_empty() {
            return;
        }
        let lower = norm.to_ascii_lowercase();
        if seen_lower.insert(lower) {
            ordered.push(norm);
        }
    };

    let inspect_vdf = |steam_root: &str, out_libs: &mut Vec<String>| {
        let vdf = Path::new(steam_root).join("steamapps").join("libraryfolders.vdf");
        if let Ok(content) = fs::read_to_string(vdf) {
            for lib in parse_library_folders_vdf(&content) {
                out_libs.push(lib);
            }
        }
    };

    let mut discovered_vdf_libs = Vec::new();
    if let Some(reg_steam) = read_steam_path_from_registry() {
        add_candidate(&reg_steam);
        inspect_vdf(&reg_steam, &mut discovered_vdf_libs);
    }
    for lib in discovered_vdf_libs.drain(..) {
        add_candidate(&lib);
    }

    let standard_candidates = [
        r"C:\Program Files (x86)\Steam",
        r"C:\Program Files\Steam",
        r"C:\Steam",
        r"C:\Games\Steam",
        r"D:\Steam",
        r"D:\SteamLibrary",
        r"D:\Games\Steam",
        r"D:\Games\SteamLibrary",
        r"E:\Steam",
        r"E:\SteamLibrary",
        r"E:\Games\Steam",
        r"E:\Games\SteamLibrary",
        r"F:\Steam",
        r"F:\SteamLibrary",
        r"G:\SteamLibrary",
    ];

    for std_path in standard_candidates {
        add_candidate(std_path);
        inspect_vdf(std_path, &mut discovered_vdf_libs);
        for lib in discovered_vdf_libs.drain(..) {
            add_candidate(&lib);
        }
    }

    ordered
}

pub fn find_dota2_cfg_dir() -> Option<PathBuf> {
    for base_lib in collect_steam_library_paths() {
        let dota_game_dir = Path::new(&base_lib)
            .join("steamapps")
            .join("common")
            .join("dota 2 beta")
            .join("game");
        let dota_exe = dota_game_dir.join("bin").join("win64").join("dota2.exe");
        let dota_cfg_dir = dota_game_dir.join("dota").join("cfg");
        if dota_exe.exists() && dota_cfg_dir.is_dir() {
            return Some(dota_cfg_dir);
        }
    }
    None
}

pub fn generate_cfg_file(storage: &StoragePaths, target_port: u16) -> CfgStatus {
    let active_port = if target_port > 0 { target_port } else { GSI_PORT };
    let cfg_content = build_cfg_content(active_port);

    let fallback_dir = storage.cfg_fallback_dir();
    let legacy_cfg = fallback_dir.join(LEGACY_CFG_FILENAME);
    if legacy_cfg.exists() {
        let _ = fs::remove_file(legacy_cfg);
    }

    if let Some(dota_cfg_dir) = find_dota2_cfg_dir() {
        let gsi_dir = dota_cfg_dir.join("gamestate_integration");
        let _ = fs::create_dir_all(&gsi_dir);
        let target_path = gsi_dir.join(CFG_FILENAME);
        let _ = fs::write(&target_path, &cfg_content);

        return CfgStatus {
            active: true,
            dota_found: true,
            saved_to_project_root: false,
            port: active_port,
            cfg_filename: CFG_FILENAME.to_string(),
            cfg_path: target_path.to_string_lossy().to_string(),
            target_folder_hint: gsi_dir.to_string_lossy().to_string(),
            message_uk: format!("Dota 2 знайдено. Файл {CFG_FILENAME} активний (порт {active_port})."),
            message_ru: format!("Dota 2 найдена. Файл {CFG_FILENAME} активен (порт {active_port})."),
            message_en: format!("Dota 2 found. File {CFG_FILENAME} is active (port {active_port})."),
        };
    }

    let project_cfg_path = fallback_dir.join(CFG_FILENAME);
    let _ = fs::create_dir_all(&fallback_dir);
    match fs::write(&project_cfg_path, &cfg_content) {
        Ok(()) => CfgStatus {
            active: true,
            dota_found: false,
            saved_to_project_root: true,
            port: active_port,
            cfg_filename: CFG_FILENAME.to_string(),
            cfg_path: project_cfg_path.to_string_lossy().to_string(),
            target_folder_hint: "Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg\\gamestate_integration\\".to_string(),
            message_uk: format!("Dota 2 не знайдена на цьому ПК. Готовий {CFG_FILENAME} (порт {active_port}) збережено у userData — після встановлення гри скопіюйте його в папку gamestate_integration."),
            message_ru: format!("Dota 2 не найдена на этом ПК. Готовый {CFG_FILENAME} (порт {active_port}) сохранен в userData — после установки игры скопируйте его в папку gamestate_integration."),
            message_en: format!("Dota 2 not found on this PC. Ready {CFG_FILENAME} (port {active_port}) saved to userData — copy it to gamestate_integration after installing the game."),
        },
        Err(err) => CfgStatus {
            active: false,
            dota_found: false,
            saved_to_project_root: false,
            port: active_port,
            cfg_filename: CFG_FILENAME.to_string(),
            cfg_path: project_cfg_path.to_string_lossy().to_string(),
            target_folder_hint: "Steam\\steamapps\\common\\dota 2 beta\\game\\dota\\cfg\\gamestate_integration\\".to_string(),
            message_uk: format!("Не вдалося зберегти резервний {CFG_FILENAME}: {err}"),
            message_ru: format!("Не удалось сохранить резервный {CFG_FILENAME}: {err}"),
            message_en: format!("Failed to save fallback {CFG_FILENAME}: {err}"),
        },
    }
}

fn is_draft_game_state(gs: &str) -> bool {
    gs == "DOTA_GAMERULES_STATE_HERO_SELECTION" || gs == "DOTA_GAMERULES_STATE_STRATEGY_TIME"
}

fn normalize_match_id(raw: Option<&Value>) -> Option<String> {
    let val = raw?;
    let s = match val {
        Value::String(st) => st.trim().to_string(),
        Value::Number(num) => num.to_string(),
        _ => return None,
    };
    if s.is_empty() || s == "0" {
        None
    } else {
        Some(s)
    }
}

fn parse_gsi_payload(payload: &Value, data_state: &DataServiceState) -> Option<GsiState> {
    if !payload.is_object() {
        return None;
    }

    let guard = data_state.indexed.lock().ok()?;
    let hero_payload = payload.get("hero").and_then(|v| v.as_object());

    let raw_hero_id = hero_payload
        .and_then(|h| h.get("id"))
        .and_then(|v| v.as_u64())
        .map(|n| n as u32);
    let raw_hero_name = hero_payload
        .and_then(|h| h.get("name"))
        .and_then(|v| v.as_str())
        .map(|s| s.trim())
        .unwrap_or("");

    let matched_hero = raw_hero_id
        .and_then(|id| guard.heroes_by_id.get(&id))
        .or_else(|| {
            if raw_hero_name.is_empty() {
                None
            } else {
                guard.heroes_by_id.values().find(|h| {
                    h.npc_name == raw_hero_name
                        || format!("npc_dota_hero_{}", h.key) == raw_hero_name
                })
            }
        });

    let mut owned_item_keys: Vec<String> = Vec::new();
    let mut owned_items_details: Vec<GsiOwnedItemDetail> = Vec::new();
    let mut seen_keys: HashSet<String> = HashSet::new();

    let slot_names = [
        "slot0", "slot1", "slot2", "slot3", "slot4", "slot5",
        "backpack0", "backpack1", "backpack2",
        "stash0", "stash1", "stash2", "stash3", "stash4", "stash5",
    ];

    if let Some(items_obj) = payload.get("items").and_then(|v| v.as_object()) {
        for slot in slot_names {
            let Some(raw_item_name) = items_obj
                .get(slot)
                .and_then(|s| s.get("name"))
                .and_then(|n| n.as_str())
                .map(|s| s.trim())
            else {
                continue;
            };
            if raw_item_name.is_empty() || raw_item_name == "empty" {
                continue;
            }
            let item_key = raw_item_name
                .strip_prefix("item_")
                .unwrap_or(raw_item_name)
                .to_string();
            if !seen_keys.insert(item_key.clone()) {
                continue;
            }
            owned_item_keys.push(item_key.clone());
            let item_meta = guard.items_by_key.get(&item_key);
            owned_items_details.push(GsiOwnedItemDetail {
                key: item_key.clone(),
                name_en: item_meta
                    .map(|m| m.name_en.clone())
                    .unwrap_or_else(|| item_key.clone()),
                img: item_meta
                    .map(|m| {
                        if m.has_local_img {
                            m.local_img_path.clone()
                        } else {
                            m.remote_img.clone()
                        }
                    })
                    .unwrap_or_default(),
                consumed: false,
            });
        }
    }

    let has_consumed_scepter = hero_payload
        .and_then(|h| h.get("aghanims_scepter"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    let has_consumed_shard = hero_payload
        .and_then(|h| h.get("aghanims_shard"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    if seen_keys.contains("ultimate_scepter_2") && !seen_keys.contains("ultimate_scepter") {
        seen_keys.insert("ultimate_scepter".to_string());
        owned_item_keys.push("ultimate_scepter".to_string());
    }

    if has_consumed_scepter && !seen_keys.contains("ultimate_scepter") {
        seen_keys.insert("ultimate_scepter".to_string());
        owned_item_keys.push("ultimate_scepter".to_string());
        let meta = guard.items_by_key.get("ultimate_scepter");
        owned_items_details.push(GsiOwnedItemDetail {
            key: "ultimate_scepter".to_string(),
            name_en: meta
                .map(|m| m.name_en.clone())
                .unwrap_or_else(|| "Aghanim's Scepter".to_string()),
            img: meta
                .map(|m| {
                    if m.has_local_img {
                        m.local_img_path.clone()
                    } else {
                        m.remote_img.clone()
                    }
                })
                .unwrap_or_default(),
            consumed: true,
        });
    }

    if has_consumed_shard && !seen_keys.contains("aghanims_shard") {
        seen_keys.insert("aghanims_shard".to_string());
        owned_item_keys.push("aghanims_shard".to_string());
        let meta = guard.items_by_key.get("aghanims_shard");
        owned_items_details.push(GsiOwnedItemDetail {
            key: "aghanims_shard".to_string(),
            name_en: meta
                .map(|m| m.name_en.clone())
                .unwrap_or_else(|| "Aghanim's Shard".to_string()),
            img: meta
                .map(|m| {
                    if m.has_local_img {
                        m.local_img_path.clone()
                    } else {
                        m.remote_img.clone()
                    }
                })
                .unwrap_or_default(),
            consumed: true,
        });
    }

    let map_obj = payload.get("map").and_then(|v| v.as_object());
    let match_id = normalize_match_id(map_obj.and_then(|m| m.get("matchid")));
    let game_state = map_obj
        .and_then(|m| m.get("game_state"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let clock_time = map_obj
        .and_then(|m| m.get("clock_time"))
        .and_then(|v| v.as_i64());

    let hero_info = matched_hero.map(|mh| GsiHeroInfo {
        id: mh.id,
        key: mh.key.clone(),
        name_en: mh.name_en.clone(),
        icon: if mh.has_local_icon {
            mh.local_icon_path.clone()
        } else {
            mh.remote_icon.clone()
        },
        img: if mh.has_local_portrait {
            mh.local_portrait_path.clone()
        } else {
            mh.remote_img.clone()
        },
        level: hero_payload
            .and_then(|h| h.get("level"))
            .and_then(|v| v.as_u64())
            .map(|n| n as u32),
        aghanims_scepter: has_consumed_scepter,
        aghanims_shard: has_consumed_shard,
    });

    Some(GsiState {
        received_at_utc: chrono::Utc::now().to_rfc3339(),
        is_simulated: payload
            .get("__simulated")
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        match_id,
        game_state,
        clock_time,
        is_new_match: false,
        reset_reason: None,
        has_aghanims_scepter: has_consumed_scepter
            || seen_keys.contains("ultimate_scepter")
            || seen_keys.contains("ultimate_scepter_2"),
        has_aghanims_shard: has_consumed_shard || seen_keys.contains("aghanims_shard"),
        hero: hero_info,
        owned_item_keys,
        owned_items_details,
    })
}

pub fn handle_parsed_packet(
    payload: &Value,
    app: &AppHandle,
    gsi_state: &GsiServiceState,
    data_state: &DataServiceState,
) -> Option<GsiState> {
    let mut parsed = parse_gsi_payload(payload, data_state)?;

    if let Ok(mut g) = gsi_state.inner.lock() {
        let mut is_new_match = false;
        let mut reset_reason: Option<String> = None;
        let already_reset = parsed
            .match_id
            .as_ref()
            .zip(g.last_reset_match_id.as_ref())
            .map(|(a, b)| a == b)
            .unwrap_or(false);

        if let (Some(mid), Some(prev_mid)) = (&parsed.match_id, &g.last_match_id) {
            if mid != prev_mid {
                is_new_match = true;
                reset_reason = Some("matchid-changed".to_string());
            }
        } else if !already_reset {
            if let (Some(gs), Some(prev_gs)) = (&parsed.game_state, &g.last_game_state) {
                if is_draft_game_state(gs) && !is_draft_game_state(prev_gs) {
                    is_new_match = true;
                    reset_reason = Some("draft-phase-entered".to_string());
                }
            }
        }

        if is_new_match {
            if let Some(ref mid) = parsed.match_id {
                g.last_reset_match_id = Some(mid.clone());
            }
        }

        if let Some(ref mid) = parsed.match_id {
            g.last_match_id = Some(mid.clone());
        } else if reset_reason.as_deref() == Some("draft-phase-entered") {
            g.last_match_id = None;
        }

        if let Some(ref gs) = parsed.game_state {
            g.last_game_state = Some(gs.clone());
        }

        parsed.is_new_match = is_new_match;
        parsed.reset_reason = reset_reason;
        g.last_gsi_state = Some(parsed.clone());
    }

    let _ = app.emit("overlay:gsi-update", &parsed);
    Some(parsed)
}

pub fn start_server(
    app: AppHandle,
    storage: StoragePaths,
    gsi_state: Arc<GsiServiceState>,
    data_state: Arc<DataServiceState>,
) -> GsiStatus {
    let cfg = generate_cfg_file(&storage, GSI_PORT);
    if let Ok(mut g) = gsi_state.inner.lock() {
        g.cfg_status = Some(cfg);
    }

    let addr = format!("{GSI_HOST}:{GSI_PORT}");
    match tiny_http::Server::http(&addr) {
        Ok(server) => {
            if let Ok(mut g) = gsi_state.inner.lock() {
                g.server_status = Some(ServerStatus {
                    listening: true,
                    host: GSI_HOST.to_string(),
                    port: GSI_PORT,
                    error: None,
                    error_code: None,
                });
            }

            let gsi_ref = Arc::clone(&gsi_state);
            thread::spawn(move || {
                loop {
                    if gsi_ref.shutdown.load(Ordering::SeqCst) {
                        break;
                    }
                    match server.recv_timeout(Duration::from_millis(250)) {
                        Ok(Some(mut req)) => {
                            let method = req.method().as_str().to_ascii_uppercase();
                            if method == "GET" {
                                let body = json!({
                                    "ok": true,
                                    "service": "dota2overlay-gsi",
                                    "port": GSI_PORT
                                })
                                .to_string();
                                let resp = tiny_http::Response::from_string(body)
                                    .with_status_code(200)
                                    .with_header(
                                        tiny_http::Header::from_bytes(
                                            b"Content-Type",
                                            b"application/json; charset=utf-8",
                                        )
                                        .unwrap(),
                                    );
                                let _ = req.respond(resp);
                                continue;
                            }

                            if method != "POST" {
                                let resp = tiny_http::Response::from_string(
                                    r#"{"error":"Method Not Allowed"}"#,
                                )
                                .with_status_code(405)
                                .with_header(
                                    tiny_http::Header::from_bytes(
                                        b"Content-Type",
                                        b"application/json",
                                    )
                                    .unwrap(),
                                );
                                let _ = req.respond(resp);
                                continue;
                            }

                            let mut buf = Vec::new();
                            let mut limited = req.as_reader().take((MAX_BODY_BYTES + 1) as u64);
                            let read_res = limited.read_to_end(&mut buf);
                            if buf.len() > MAX_BODY_BYTES {
                                let resp = tiny_http::Response::from_string(
                                    r#"{"error":"Payload Too Large"}"#,
                                )
                                .with_status_code(413)
                                .with_header(
                                    tiny_http::Header::from_bytes(
                                        b"Content-Type",
                                        b"application/json",
                                    )
                                    .unwrap(),
                                );
                                let _ = req.respond(resp);
                                continue;
                            }

                            if read_res.is_err() {
                                let resp = tiny_http::Response::from_string(
                                    r#"{"ok":false,"error":"read failed"}"#,
                                )
                                .with_status_code(400);
                                let _ = req.respond(resp);
                                continue;
                            }

                            let parsed_json = if buf.is_empty() {
                                Ok(json!({}))
                            } else {
                                serde_json::from_slice::<Value>(&buf)
                            };

                            match parsed_json {
                                Ok(payload) => {
                                    handle_parsed_packet(&payload, &app, &gsi_ref, &data_state);
                                    let resp = tiny_http::Response::from_string(r#"{"ok":true}"#)
                                        .with_status_code(200)
                                        .with_header(
                                            tiny_http::Header::from_bytes(
                                                b"Content-Type",
                                                b"application/json",
                                            )
                                            .unwrap(),
                                        );
                                    let _ = req.respond(resp);
                                }
                                Err(err) => {
                                    let resp = tiny_http::Response::from_string(
                                        json!({ "ok": false, "error": err.to_string() }).to_string(),
                                    )
                                    .with_status_code(400)
                                    .with_header(
                                        tiny_http::Header::from_bytes(
                                            b"Content-Type",
                                            b"application/json",
                                        )
                                        .unwrap(),
                                    );
                                    let _ = req.respond(resp);
                                }
                            }
                        }
                        Ok(None) => {}
                        Err(_) => {
                            if gsi_ref.shutdown.load(Ordering::SeqCst) {
                                break;
                            }
                        }
                    }
                }
            });
        }
        Err(err) => {
            let err_str = err.to_string();
            let is_in_use = err_str.to_ascii_lowercase().contains("in use")
                || err_str.contains("10048");
            if let Ok(mut g) = gsi_state.inner.lock() {
                g.server_status = Some(ServerStatus {
                    listening: false,
                    host: GSI_HOST.to_string(),
                    port: GSI_PORT,
                    error: Some(if is_in_use {
                        format!("Port {GSI_PORT} is already in use")
                    } else {
                        err_str
                    }),
                    error_code: Some(
                        if is_in_use { "EADDRINUSE" } else { "SERVER_ERROR" }.to_string(),
                    ),
                });
            }
        }
    }

    gsi_state.get_status()
}

pub async fn simulate_test_packet(
    app: &AppHandle,
    gsi_state: &GsiServiceState,
    data_state: &DataServiceState,
) -> GsiSimulateResponse {
    let sample = json!({
        "__simulated": true,
        "provider": {
            "name": "Dota 2",
            "appid": 570,
            "version": 47,
            "timestamp": chrono::Utc::now().timestamp()
        },
        "map": {
            "name": "start",
            "matchid": "0",
            "clock_time": 1420,
            "game_state": "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS"
        },
        "hero": {
            "id": 8,
            "name": "npc_dota_hero_juggernaut",
            "level": 18,
            "alive": true
        },
        "items": {
            "slot0": { "name": "item_phase_boots" },
            "slot1": { "name": "item_bfury" },
            "slot2": { "name": "item_manta" },
            "slot3": { "name": "item_black_king_bar" },
            "slot4": { "name": "empty" },
            "slot5": { "name": "empty" }
        }
    });

    let listening = gsi_state
        .inner
        .lock()
        .ok()
        .and_then(|g| g.server_status.as_ref().map(|s| s.listening))
        .unwrap_or(false);

    if listening {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(3))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());
        let url = format!("http://{GSI_HOST}:{GSI_PORT}/");
        if let Ok(resp) = client.post(url).json(&sample).send().await {
            if resp.status().is_success() {
                let state = gsi_state
                    .inner
                    .lock()
                    .ok()
                    .and_then(|g| g.last_gsi_state.clone());
                return GsiSimulateResponse {
                    ok: true,
                    via_http: true,
                    gsi_state: state,
                };
            }
        }
    }

    let parsed = handle_parsed_packet(&sample, app, gsi_state, data_state);
    GsiSimulateResponse {
        ok: true,
        via_http: false,
        gsi_state: parsed,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_modern_and_legacy_steam_library_vdf() {
        let vdf = r#"
"libraryfolders"
{
    "0"
    {
        "path"        "C:\\Program Files (x86)\\Steam"
    }
    "1"        "D:\\SteamLibrary"
}
"#;
        let libs = parse_library_folders_vdf(vdf);
        assert_eq!(libs.len(), 2);
        assert_eq!(libs[0], r"C:\Program Files (x86)\Steam");
        assert_eq!(libs[1], r"D:\SteamLibrary");
    }

    #[test]
    fn builds_valid_gsi_cfg_with_target_port() {
        let cfg = build_cfg_content(3000);
        assert!(cfg.contains("http://127.0.0.1:3000/"));
        assert!(cfg.contains("\"items\"         \"1\""));
        assert!(cfg.contains("\"draft\"         \"1\""));
    }
}
