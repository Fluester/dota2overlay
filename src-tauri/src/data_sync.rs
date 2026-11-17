use crate::{
    models::{CachedHeroEntry, CachedIconMapPayload, CachedItemEntry, PatchStatus, SyncMeta},
    storage::StoragePaths,
};
use reqwest::Client;
use serde_json::{json, Map, Value};
use std::{
    collections::{HashMap, HashSet},
    fs,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};
use tauri::{AppHandle, Emitter};
use tokio::sync::Semaphore;

pub const OPENDOTA_PATCH_URL: &str = "https://api.opendota.com/api/constants/patch";
pub const OPENDOTA_HEROES_URL: &str = "https://api.opendota.com/api/constants/heroes";
pub const OPENDOTA_ITEMS_URL: &str = "https://api.opendota.com/api/constants/items";
pub const OPENDOTA_ABILITIES_URL: &str = "https://api.opendota.com/api/constants/abilities";
pub const VALVE_PATCH_LIST_URL: &str =
    "https://www.dota2.com/datafeed/patchnoteslist?language=english";
pub const VALVE_PATCH_NOTES_URL: &str =
    "https://www.dota2.com/datafeed/patchnotes?language=english&version=";
pub const STEAM_CDN_BASE: &str = "https://cdn.cloudflare.steamstatic.com";

const CACHE_TTL_MS: i64 = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_SECS: u64 = 12;
const ICON_DOWNLOAD_CONCURRENCY: usize = 6;

#[derive(Debug, Clone)]
pub struct IndexedData {
    pub heroes_by_id: HashMap<u32, CachedHeroEntry>,
    pub items_by_key: HashMap<String, CachedItemEntry>,
    pub item_rule_keys: HashSet<String>,
    pub enemy_trigger_keys: HashSet<String>,
    pub neutral_rule_keys: HashSet<String>,
    pub od_heroes_cached: usize,
    pub od_items_cached: usize,
    pub last_sync_utc: Option<String>,
}

pub struct DataServiceState {
    pub indexed: Mutex<IndexedData>,
    pub sync_in_progress: AtomicBool,
    pub patch_updating: AtomicBool,
    pub latest_patch_status: Mutex<PatchStatus>,
}

impl DataServiceState {
    pub fn new(storage: &StoragePaths) -> Self {
        let indexed = build_indexed_data(storage);
        let local_patch = get_local_patch_version(storage);
        Self {
            indexed: Mutex::new(indexed),
            sync_in_progress: AtomicBool::new(false),
            patch_updating: AtomicBool::new(false),
            latest_patch_status: Mutex::new(PatchStatus {
                local_patch: Some(local_patch.clone()),
                remote_patch: Some(local_patch),
                open_dota_major_patch: None,
                has_update: false,
                updating: false,
                checked_at_utc: None,
                offline: false,
                error: None,
                error_code: None,
            }),
        }
    }

    pub fn reload_indexes(&self, storage: &StoragePaths) {
        let next = build_indexed_data(storage);
        if let Ok(mut guard) = self.indexed.lock() {
            *guard = next;
        }
        let local_patch = get_local_patch_version(storage);
        if let Ok(mut ps) = self.latest_patch_status.lock() {
            ps.local_patch = Some(local_patch);
        }
    }

    pub fn get_icon_map(&self) -> CachedIconMapPayload {
        let Ok(guard) = self.indexed.lock() else {
            return CachedIconMapPayload {
                hero_portraits: HashMap::new(),
                hero_icons: HashMap::new(),
                item_imgs: HashMap::new(),
            };
        };
        let mut hero_portraits = HashMap::new();
        let mut hero_icons = HashMap::new();
        for (id, h) in &guard.heroes_by_id {
            if h.has_local_portrait {
                hero_portraits.insert(*id, h.local_portrait_path.clone());
            }
            if h.has_local_icon {
                hero_icons.insert(*id, h.local_icon_path.clone());
            }
        }
        let mut item_imgs = HashMap::new();
        for (k, it) in &guard.items_by_key {
            if it.has_local_img {
                item_imgs.insert(k.clone(), it.local_img_path.clone());
            }
        }
        CachedIconMapPayload {
            hero_portraits,
            hero_icons,
            item_imgs,
        }
    }
}

pub fn normalize_steam_asset_url(raw: &str) -> String {
    let cleaned = raw.split('?').next().unwrap_or("").trim();
    if cleaned.is_empty() {
        return String::new();
    }
    if cleaned.starts_with("http://") || cleaned.starts_with("https://") {
        return cleaned.to_string();
    }
    if cleaned.starts_with('/') {
        format!("{STEAM_CDN_BASE}{cleaned}")
    } else {
        format!("{STEAM_CDN_BASE}/{cleaned}")
    }
}

pub fn sanitize_file_key(key: &str) -> String {
    key.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '-' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

fn non_empty_file(path: &Path) -> bool {
    fs::metadata(path).map(|m| m.is_file() && m.len() > 0).unwrap_or(false)
}

pub fn build_indexed_data(storage: &StoragePaths) -> IndexedData {
    let heroes_raw = storage
        .read_data_json("heroes.json")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();
    let items_raw = storage
        .read_data_json("items.json")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();
    let counters = storage.read_data_json("counters.json").unwrap_or_else(|| json!({}));

    let od_heroes = storage.read_cache_json("opendota_heroes.json");
    let od_items = storage.read_cache_json("opendota_items.json");

    let mut od_heroes_by_id: HashMap<u32, Value> = HashMap::new();
    if let Some(Value::Object(map)) = &od_heroes {
        for entry in map.values() {
            if let Some(id) = entry.get("id").and_then(|v| v.as_u64()) {
                od_heroes_by_id.insert(id as u32, entry.clone());
            }
        }
    }

    let mut od_items_by_key: HashMap<String, Value> = HashMap::new();
    if let Some(Value::Object(map)) = &od_items {
        for (k, entry) in map {
            if entry.is_object() {
                od_items_by_key.insert(k.clone(), entry.clone());
            }
        }
    }

    let item_rule_keys: HashSet<String> = counters
        .get("item_rules")
        .and_then(|v| v.as_object())
        .map(|m| m.keys().cloned().collect())
        .unwrap_or_default();
    let enemy_trigger_keys: HashSet<String> = counters
        .get("enemy_item_triggers")
        .and_then(|v| v.as_object())
        .map(|m| m.keys().cloned().collect())
        .unwrap_or_default();
    let neutral_rule_keys: HashSet<String> = counters
        .get("neutral_item_rules")
        .and_then(|v| v.as_object())
        .map(|m| m.keys().cloned().collect())
        .unwrap_or_default();
    let curated_hero_keys: HashSet<String> = counters
        .get("heroes")
        .and_then(|v| v.as_object())
        .map(|m| m.keys().cloned().collect())
        .unwrap_or_default();

    let hero_icons_dir = storage.hero_icons_dir();
    let item_icons_dir = storage.item_icons_dir();

    let mut heroes_by_id = HashMap::new();
    for h in heroes_raw {
        let Some(id_u64) = h.get("id").and_then(|v| v.as_u64()) else {
            continue;
        };
        let id = id_u64 as u32;
        let key = h.get("key").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let npc_name = h
            .get("npc_name")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let od = od_heroes_by_id.get(&id);

        let name_en = od
            .and_then(|v| v.get("localized_name").and_then(|s| s.as_str()))
            .or_else(|| h.get("name_en").and_then(|s| s.as_str()))
            .unwrap_or(&key)
            .to_string();
        let remote_img = normalize_steam_asset_url(
            od.and_then(|v| v.get("img").and_then(|s| s.as_str()))
                .or_else(|| h.get("img").and_then(|s| s.as_str()))
                .unwrap_or(""),
        );
        let remote_icon = normalize_steam_asset_url(
            od.and_then(|v| v.get("icon").and_then(|s| s.as_str()))
                .or_else(|| h.get("icon").and_then(|s| s.as_str()))
                .unwrap_or(""),
        );

        let safe_key = sanitize_file_key(&key);
        let portrait_path = hero_icons_dir.join(format!("{safe_key}_portrait.png"));
        let icon_path = hero_icons_dir.join(format!("{safe_key}_icon.png"));

        let is_curated = curated_hero_keys.contains(&key);
        heroes_by_id.insert(
            id,
            CachedHeroEntry {
                id,
                key,
                npc_name,
                name_en,
                remote_img,
                remote_icon,
                has_local_portrait: non_empty_file(&portrait_path),
                has_local_icon: non_empty_file(&icon_path),
                local_portrait_path: portrait_path.to_string_lossy().to_string(),
                local_icon_path: icon_path.to_string_lossy().to_string(),
                is_curated,
            },
        );
    }

    let mut items_by_key = HashMap::new();
    for it in items_raw {
        let Some(key_str) = it.get("key").and_then(|v| v.as_str()) else {
            continue;
        };
        let key = key_str.to_string();
        let od = od_items_by_key.get(&key);
        let name_en = od
            .and_then(|v| v.get("dname").and_then(|s| s.as_str()))
            .or_else(|| it.get("name_en").and_then(|s| s.as_str()))
            .unwrap_or(&key)
            .to_string();
        let cost = od
            .and_then(|v| v.get("cost").and_then(|c| c.as_i64()))
            .or_else(|| it.get("cost").and_then(|c| c.as_i64()))
            .unwrap_or(0);
        let remote_img = normalize_steam_asset_url(
            od.and_then(|v| v.get("img").and_then(|s| s.as_str()))
                .or_else(|| it.get("img").and_then(|s| s.as_str()))
                .unwrap_or(""),
        );
        let safe_key = sanitize_file_key(&key);
        let img_path = item_icons_dir.join(format!("{safe_key}.png"));
        let is_neutral = it.get("is_neutral").and_then(|v| v.as_bool()).unwrap_or(false);
        let is_enchantment = it
            .get("is_enchantment")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        let is_priority_rule = item_rule_keys.contains(&key)
            || enemy_trigger_keys.contains(&key)
            || neutral_rule_keys.contains(&key);

        items_by_key.insert(
            key.clone(),
            CachedItemEntry {
                id: it.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32,
                key,
                name_en,
                cost,
                is_neutral,
                is_enchantment,
                remote_img,
                has_local_img: non_empty_file(&img_path),
                local_img_path: img_path.to_string_lossy().to_string(),
                is_priority_rule,
            },
        );
    }

    let sync_meta: Option<SyncMeta> = storage
        .read_cache_string("sync_meta.json")
        .and_then(|s| serde_json::from_str(&s).ok());

    IndexedData {
        heroes_by_id,
        items_by_key,
        item_rule_keys,
        enemy_trigger_keys,
        neutral_rule_keys,
        od_heroes_cached: od_heroes_by_id.len(),
        od_items_cached: od_items_by_key.len(),
        last_sync_utc: sync_meta.and_then(|m| m.last_sync_utc),
    }
}

pub fn build_http_client() -> Client {
    Client::builder()
        .timeout(Duration::from_secs(FETCH_TIMEOUT_SECS))
        .user_agent("dota2overlay/0.1.0")
        .build()
        .unwrap_or_else(|_| Client::new())
}

fn is_cache_fresh(storage: &StoragePaths, indexed: &IndexedData) -> bool {
    let Some(ts) = &indexed.last_sync_utc else {
        return false;
    };
    if !storage.cache_file("opendota_heroes.json").exists()
        || !storage.cache_file("opendota_items.json").exists()
    {
        return false;
    }
    let Ok(parsed) = chrono::DateTime::parse_from_rfc3339(ts) else {
        return false;
    };
    let elapsed_ms = chrono::Utc::now().timestamp_millis() - parsed.timestamp_millis();
    (0..CACHE_TTL_MS).contains(&elapsed_ms)
}

pub async fn sync_in_background(
    app: &AppHandle,
    storage: &StoragePaths,
    data_state: &Arc<DataServiceState>,
    force: bool,
) -> Value {
    if data_state
        .sync_in_progress
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return json!({ "skipped": true, "reason": "already_running" });
    }

    let result = sync_inner(app, storage, data_state, force).await;
    data_state.sync_in_progress.store(false, Ordering::SeqCst);
    result
}

async fn sync_inner(
    app: &AppHandle,
    storage: &StoragePaths,
    data_state: &Arc<DataServiceState>,
    force: bool,
) -> Value {
    let _ = storage.ensure_base_dirs();
    let fresh = {
        let Ok(guard) = data_state.indexed.lock() else {
            return json!({ "ok": false, "error": "mutex lock error" });
        };
        is_cache_fresh(storage, &guard)
    };

    let client = build_http_client();
    let mut updated_constants = false;

    if force || !fresh {
        let (res_h, res_i, res_a) = tokio::join!(
            client.get(OPENDOTA_HEROES_URL).send(),
            client.get(OPENDOTA_ITEMS_URL).send(),
            client.get(OPENDOTA_ABILITIES_URL).send(),
        );

        let od_heroes = match res_h {
            Ok(resp) if resp.status().is_success() => resp.json::<Value>().await.ok(),
            Ok(resp) => {
                return json!({
                    "ok": false,
                    "offline": true,
                    "error": format!("HTTP {} ({OPENDOTA_HEROES_URL})", resp.status().as_u16())
                });
            }
            Err(e) => {
                return json!({ "ok": false, "offline": true, "error": e.to_string() });
            }
        };

        let od_items = match res_i {
            Ok(resp) if resp.status().is_success() => resp.json::<Value>().await.ok(),
            Ok(resp) => {
                return json!({
                    "ok": false,
                    "offline": true,
                    "error": format!("HTTP {} ({OPENDOTA_ITEMS_URL})", resp.status().as_u16())
                });
            }
            Err(e) => {
                return json!({ "ok": false, "offline": true, "error": e.to_string() });
            }
        };

        let od_abilities = match res_a {
            Ok(resp) if resp.status().is_success() => resp.json::<Value>().await.ok(),
            _ => None,
        };

        if let Some(val) = od_heroes.filter(|v| v.is_object()) {
            let _ = storage.write_json_pretty(&storage.cache_file("opendota_heroes.json"), &val);
            updated_constants = true;
        }
        if let Some(val) = od_items.filter(|v| v.is_object()) {
            let _ = storage.write_json_pretty(&storage.cache_file("opendota_items.json"), &val);
            updated_constants = true;
        }
        if let Some(val) = od_abilities.filter(|v| v.is_object()) {
            let _ = storage.write_json_pretty(&storage.cache_file("opendota_abilities.json"), &val);
            updated_constants = true;
        }

        if updated_constants {
            data_state.reload_indexes(storage);
        }
    }

    let tasks: Vec<(String, PathBuf)> = {
        let Ok(guard) = data_state.indexed.lock() else {
            return json!({ "ok": false, "error": "mutex lock error" });
        };
        let mut priority = Vec::new();
        let mut regular = Vec::new();
        for h in guard.heroes_by_id.values() {
            let target = if h.is_curated {
                &mut priority
            } else {
                &mut regular
            };
            if !h.remote_img.is_empty() && !h.has_local_portrait {
                target.push((h.remote_img.clone(), PathBuf::from(&h.local_portrait_path)));
            }
            if !h.remote_icon.is_empty() && !h.has_local_icon {
                target.push((h.remote_icon.clone(), PathBuf::from(&h.local_icon_path)));
            }
        }
        for it in guard.items_by_key.values() {
            if it.remote_img.is_empty() || it.has_local_img {
                continue;
            }
            if it.is_priority_rule {
                priority.push((it.remote_img.clone(), PathBuf::from(&it.local_img_path)));
            } else if !it.is_neutral && !it.is_enchantment && it.cost > 0 {
                regular.push((it.remote_img.clone(), PathBuf::from(&it.local_img_path)));
            }
        }
        priority.extend(regular);
        priority
    };

    let semaphore = Arc::new(Semaphore::new(ICON_DOWNLOAD_CONCURRENCY));
    let mut handles = Vec::with_capacity(tasks.len());
    for (url, dest) in tasks {
        let permit_sem = Arc::clone(&semaphore);
        let http = client.clone();
        handles.push(tokio::spawn(async move {
            let Ok(_permit) = permit_sem.acquire().await else {
                return false;
            };
            if non_empty_file(&dest) {
                return false;
            }
            let Ok(resp) = http.get(&url).send().await else {
                return false;
            };
            if !resp.status().is_success() {
                return false;
            }
            let Ok(bytes) = resp.bytes().await else {
                return false;
            };
            if bytes.is_empty() {
                return false;
            }
            if let Some(parent) = dest.parent() {
                let _ = fs::create_dir_all(parent);
            }
            fs::write(&dest, &bytes).is_ok()
        }));
    }

    let mut downloaded_icons = 0usize;
    for handle in handles {
        if let Ok(true) = handle.await {
            downloaded_icons += 1;
        }
    }

    if downloaded_icons > 0 || updated_constants {
        data_state.reload_indexes(storage);
    }

    let (od_heroes_cached, od_items_cached) = {
        let guard = data_state.indexed.lock().ok();
        guard
            .map(|g| (g.od_heroes_cached, g.od_items_cached))
            .unwrap_or((0, 0))
    };

    let now_utc = chrono::Utc::now().to_rfc3339();
    let meta = json!({
        "lastSyncUtc": now_utc,
        "source": "OpenDota API + Steam CDN",
        "odHeroesCached": od_heroes_cached,
        "odItemsCached": od_items_cached,
        "lastDownloadedIcons": downloaded_icons
    });
    let _ = storage.write_json_pretty(&storage.cache_file("sync_meta.json"), &meta);

    if updated_constants || downloaded_icons > 0 {
        let _ = app.emit("overlay:data-refresh-needed", true);
    }

    json!({
        "ok": true,
        "updatedConstants": updated_constants,
        "downloadedIcons": downloaded_icons,
        "lastSyncUtc": now_utc
    })
}

pub fn parse_patch_version(ver: &str) -> (i64, i64, i64) {
    let raw = ver.trim().to_ascii_lowercase();
    let mut parts = raw.split('.');
    let major = parts
        .next()
        .and_then(|s| s.parse::<i64>().ok())
        .unwrap_or(0);
    let minor_part = parts.next().unwrap_or("");
    let digits: String = minor_part.chars().take_while(|c| c.is_ascii_digit()).collect();
    let minor = digits.parse::<i64>().unwrap_or(0);
    let letter = minor_part[digits.len()..]
        .chars()
        .next()
        .filter(|c| c.is_ascii_lowercase())
        .map(|c| (c as i64) - 96)
        .unwrap_or(0);
    (major, minor, letter)
}

pub fn compare_patch_versions(a: &str, b: &str) -> std::cmp::Ordering {
    parse_patch_version(a).cmp(&parse_patch_version(b))
}

pub fn get_local_patch_version(storage: &StoragePaths) -> String {
    if let Some(Value::Array(arr)) = storage.read_data_json("patches.json") {
        if let Some(ver) = arr
            .first()
            .and_then(|p| p.get("version"))
            .and_then(|v| v.as_str())
        {
            return ver.to_string();
        }
    }
    if let Some(meta) = storage.read_data_json("meta.json") {
        if let Some(ver) = meta.get("latest_patch").and_then(|v| v.as_str()) {
            return ver.to_string();
        }
    }
    "7.41f".to_string()
}

pub async fn check_for_updates(
    storage: &StoragePaths,
    data_state: &Arc<DataServiceState>,
) -> PatchStatus {
    let local_patch = get_local_patch_version(storage);
    let client = build_http_client();

    let (od_res, valve_res) = tokio::join!(
        client.get(OPENDOTA_PATCH_URL).send(),
        client.get(VALVE_PATCH_LIST_URL).send(),
    );

    let od_major = match od_res {
        Ok(r) if r.status().is_success() => r
            .json::<Value>()
            .await
            .ok()
            .and_then(|v| v.as_array().and_then(|a| a.last().cloned()))
            .and_then(|last| last.get("name").and_then(|n| n.as_str()).map(|s| s.to_string())),
        _ => None,
    };

    let valve_latest = match valve_res {
        Ok(r) if r.status().is_success() => r
            .json::<Value>()
            .await
            .ok()
            .and_then(|v| v.get("patches").and_then(|p| p.as_array()).and_then(|a| a.last().cloned()))
            .and_then(|last| {
                last.get("patch_number")
                    .or_else(|| last.get("patch_name"))
                    .and_then(|s| s.as_str())
                    .map(|s| s.to_string())
            }),
        _ => None,
    };

    let status = if od_major.is_none() && valve_latest.is_none() {
        PatchStatus {
            local_patch: Some(local_patch.clone()),
            remote_patch: Some(local_patch),
            open_dota_major_patch: None,
            has_update: false,
            updating: false,
            checked_at_utc: Some(chrono::Utc::now().to_rfc3339()),
            offline: true,
            error: Some("Failed to fetch patch data from OpenDota or Valve Datafeed".to_string()),
            error_code: Some("PATCH_FETCH_FAILED".to_string()),
        }
    } else {
        let mut remote_latest = od_major
            .clone()
            .or_else(|| valve_latest.clone())
            .unwrap_or_else(|| local_patch.clone());
        if let Some(ref vl) = valve_latest {
            if compare_patch_versions(vl, &remote_latest).is_gt() {
                remote_latest = vl.clone();
            }
        }
        let has_update = compare_patch_versions(&remote_latest, &local_patch).is_gt();
        PatchStatus {
            local_patch: Some(local_patch),
            remote_patch: Some(remote_latest),
            open_dota_major_patch: od_major,
            has_update,
            updating: false,
            checked_at_utc: Some(chrono::Utc::now().to_rfc3339()),
            offline: false,
            error: None,
            error_code: None,
        }
    };

    if let Ok(mut guard) = data_state.latest_patch_status.lock() {
        *guard = status.clone();
    }
    status
}

async fn fetch_json_checked(client: &Client, url: &str) -> Result<Value, String> {
    let resp = client.get(url).send().await.map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status().as_u16()));
    }
    resp.json::<Value>().await.map_err(|e| e.to_string())
}

pub async fn apply_patch_download(
    storage: &StoragePaths,
    data_state: &Arc<DataServiceState>,
) -> Value {
    if data_state
        .patch_updating
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        let current = data_state.latest_patch_status.lock().ok().map(|g| g.clone());
        return json!({ "ok": false, "reason": "already_updating", "status": current });
    }

    let out = apply_patch_download_inner(storage, data_state).await;
    data_state.patch_updating.store(false, Ordering::SeqCst);
    out
}

async fn apply_patch_download_inner(
    storage: &StoragePaths,
    data_state: &Arc<DataServiceState>,
) -> Value {
    let client = build_http_client();
    let (r_patches, r_heroes, r_items, r_abilities, r_valve) = tokio::join!(
        fetch_json_checked(&client, OPENDOTA_PATCH_URL),
        fetch_json_checked(&client, OPENDOTA_HEROES_URL),
        fetch_json_checked(&client, OPENDOTA_ITEMS_URL),
        fetch_json_checked(&client, OPENDOTA_ABILITIES_URL),
        fetch_json_checked(&client, VALVE_PATCH_LIST_URL),
    );

    let od_patches = match r_patches {
        Ok(v) => v,
        Err(e) => {
            return patch_error_response(data_state, e);
        }
    };
    let od_heroes = match r_heroes {
        Ok(v) => v,
        Err(e) => {
            return patch_error_response(data_state, e);
        }
    };
    let od_items = match r_items {
        Ok(v) => v,
        Err(e) => {
            return patch_error_response(data_state, e);
        }
    };
    let od_abilities = match r_abilities {
        Ok(v) => v,
        Err(e) => {
            return patch_error_response(data_state, e);
        }
    };
    let valve_list = r_valve.ok();

    let _ = storage.ensure_base_dirs();
    let _ = storage.write_json_pretty(&storage.cache_file("opendota_heroes.json"), &od_heroes);
    let _ = storage.write_json_pretty(&storage.cache_file("opendota_items.json"), &od_items);
    let _ = storage.write_json_pretty(&storage.cache_file("opendota_abilities.json"), &od_abilities);

    // 1. Update heroes.json in userData
    let mut local_heroes = storage
        .read_data_json("heroes.json")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    let mut hero_index_by_id: HashMap<u64, usize> = local_heroes
        .iter()
        .enumerate()
        .filter_map(|(idx, h)| h.get("id").and_then(|v| v.as_u64()).map(|id| (id, idx)))
        .collect();

    if let Some(od_h_map) = od_heroes.as_object() {
        for od_h in od_h_map.values() {
            let Some(id) = od_h.get("id").and_then(|v| v.as_u64()) else {
                continue;
            };
            let npc_name = od_h.get("name").and_then(|v| v.as_str()).unwrap_or("");
            let key = npc_name.strip_prefix("npc_dota_hero_").unwrap_or(npc_name);
            let loc_name = od_h
                .get("localized_name")
                .and_then(|v| v.as_str())
                .unwrap_or(key);
            let od_img = od_h
                .get("img")
                .and_then(|v| v.as_str())
                .map(normalize_steam_asset_url)
                .unwrap_or_default();
            let od_icon = od_h
                .get("icon")
                .and_then(|v| v.as_str())
                .map(normalize_steam_asset_url)
                .unwrap_or_default();

            if let Some(&idx) = hero_index_by_id.get(&id) {
                if let Some(obj) = local_heroes[idx].as_object_mut() {
                    obj.insert("name_en".into(), json!(loc_name));
                    if let Some(pa) = od_h.get("primary_attr") {
                        obj.insert("primary_attr".into(), pa.clone());
                    }
                    if let Some(at) = od_h.get("attack_type") {
                        obj.insert("attack_type".into(), at.clone());
                    }
                    if !od_img.is_empty() {
                        obj.insert("img".into(), json!(od_img));
                    }
                    if !od_icon.is_empty() {
                        obj.insert("icon".into(), json!(od_icon));
                    }
                    if let Some(Value::Array(abilities)) = obj.get_mut("abilities") {
                        for ab in abilities.iter_mut() {
                            let Some(ab_obj) = ab.as_object_mut() else {
                                continue;
                            };
                            let Some(ab_name) = ab_obj.get("name").and_then(|v| v.as_str()) else {
                                continue;
                            };
                            let Some(od_ab) = od_abilities.get(ab_name) else {
                                continue;
                            };
                            if od_ab
                                .get("is_innate")
                                .and_then(|v| v.as_bool())
                                .unwrap_or(false)
                            {
                                ab_obj.insert("is_innate".into(), json!(true));
                            }
                            if let Some(bp) = od_ab.get("bkbpierce") {
                                if !bp.is_null() {
                                    ab_obj.insert("bkbpierce".into(), bp.clone());
                                }
                            }
                            let mut beh_set: HashSet<String> = ab_obj
                                .get("behavior")
                                .and_then(|v| v.as_array())
                                .map(|a| {
                                    a.iter()
                                        .filter_map(|b| b.as_str())
                                        .map(|s| s.to_ascii_lowercase().replace(' ', "_"))
                                        .collect()
                                })
                                .unwrap_or_default();
                            if let Some(od_beh) = od_ab.get("behavior") {
                                let od_list: Vec<String> = match od_beh {
                                    Value::Array(a) => a
                                        .iter()
                                        .filter_map(|x| x.as_str().map(|s| s.to_string()))
                                        .collect(),
                                    Value::String(s) => vec![s.clone()],
                                    _ => Vec::new(),
                                };
                                for b in od_list {
                                    let norm = b.to_ascii_lowercase().replace(' ', "_");
                                    if matches!(
                                        norm.as_str(),
                                        "hidden" | "not_learnable" | "channeled" | "passive" | "aura"
                                    ) {
                                        beh_set.insert(norm);
                                    }
                                }
                            }
                            let mut beh_vec: Vec<String> = beh_set.into_iter().collect();
                            beh_vec.sort();
                            ab_obj.insert("behavior".into(), json!(beh_vec));
                        }
                    }
                }
            } else {
                let roles: Vec<Value> = od_h
                    .get("roles")
                    .and_then(|v| v.as_array())
                    .map(|arr| {
                        arr.iter()
                            .filter_map(|r| r.as_str().map(|s| json!({ "name": s, "level": 1 })))
                            .collect()
                    })
                    .unwrap_or_default();
                let new_hero = json!({
                    "id": id,
                    "key": key,
                    "npc_name": npc_name,
                    "name_en": loc_name,
                    "name_uk": loc_name,
                    "img": od_img,
                    "icon": od_icon,
                    "primary_attr": od_h.get("primary_attr").and_then(|v| v.as_str()).unwrap_or("all"),
                    "attack_type": od_h.get("attack_type").and_then(|v| v.as_str()).unwrap_or("Melee"),
                    "complexity": 1,
                    "roles": roles,
                    "abilities": [],
                    "talents": [],
                    "threat_tags": []
                });
                hero_index_by_id.insert(id, local_heroes.len());
                local_heroes.push(new_hero);
            }
        }
    }
    let _ = storage.write_json_pretty(&storage.data_file("heroes.json"), &Value::Array(local_heroes.clone()));

    // 1b. Update abilities.json in userData
    if let Some(od_ab_map) = od_abilities.as_object() {
        let hero_prefixes: Vec<String> = local_heroes
            .iter()
            .filter_map(|h| h.get("key").and_then(|k| k.as_str()).map(|k| format!("{k}_")))
            .collect();
        let mut known_ability_names: HashSet<String> = HashSet::new();
        for h in &local_heroes {
            if let Some(abs) = h.get("abilities").and_then(|v| v.as_array()) {
                for a in abs {
                    if let Some(name) = a.get("name").and_then(|v| v.as_str()) {
                        known_ability_names.insert(name.to_string());
                    }
                }
            }
        }
        let mut filtered = Map::new();
        for (ab_key, ab_val) in od_ab_map {
            if !ab_val.is_object() {
                continue;
            }
            if known_ability_names.contains(ab_key)
                || hero_prefixes.iter().any(|p| ab_key.starts_with(p))
            {
                filtered.insert(ab_key.clone(), ab_val.clone());
            }
        }
        let _ = storage.write_json_pretty(&storage.data_file("abilities.json"), &Value::Object(filtered));
    }

    // 2. Update items.json in userData
    let mut local_items = storage
        .read_data_json("items.json")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();
    let mut item_idx_by_key: HashMap<String, usize> = local_items
        .iter()
        .enumerate()
        .filter_map(|(i, it)| {
            it.get("key")
                .and_then(|v| v.as_str())
                .map(|k| (k.to_string(), i))
        })
        .collect();

    if let Some(od_it_map) = od_items.as_object() {
        for (key, od_it) in od_it_map {
            if !od_it.is_object() {
                continue;
            }
            let od_dname = od_it.get("dname").and_then(|v| v.as_str());
            let od_cost = od_it.get("cost").and_then(|v| v.as_i64());
            let od_img = od_it
                .get("img")
                .and_then(|v| v.as_str())
                .map(normalize_steam_asset_url)
                .unwrap_or_default();

            if let Some(&idx) = item_idx_by_key.get(key) {
                if let Some(obj) = local_items[idx].as_object_mut() {
                    if let Some(c) = od_cost.filter(|c| *c > 0) {
                        obj.insert("cost".into(), json!(c));
                    }
                    if let Some(dname) = od_dname {
                        obj.insert("name_en".into(), json!(dname));
                    }
                    if !od_img.is_empty() {
                        obj.insert("img".into(), json!(od_img));
                    }
                }
            } else if let (Some(id), Some(dname)) = (
                od_it.get("id").and_then(|v| v.as_u64()),
                od_dname,
            ) {
                let tier = od_it.get("tier").and_then(|v| v.as_u64());
                let hint = od_it
                    .get("hint")
                    .and_then(|v| v.as_array())
                    .map(|arr| {
                        arr.iter()
                            .filter_map(|s| s.as_str())
                            .collect::<Vec<_>>()
                            .join("\n")
                    })
                    .unwrap_or_default();
                let new_item = json!({
                    "id": id,
                    "key": key,
                    "npc_name": format!("item_{key}"),
                    "name_en": dname,
                    "name_uk": dname,
                    "img": od_img,
                    "cost": od_cost.unwrap_or(0),
                    "components": od_it.get("components").cloned().unwrap_or_else(|| json!([])),
                    "is_neutral": tier.is_some(),
                    "neutral_tier": tier,
                    "is_enchantment": false,
                    "desc_en": hint,
                    "desc_uk": ""
                });
                item_idx_by_key.insert(key.clone(), local_items.len());
                local_items.push(new_item);
            }
        }
    }
    let _ = storage.write_json_pretty(&storage.data_file("items.json"), &Value::Array(local_items.clone()));

    // 3. Update patches.json & meta.json
    let mut local_patches = storage
        .read_data_json("patches.json")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();
    let mut target_version = get_local_patch_version(storage);
    let mut od_major_patch: Option<String> = None;

    if let Some(last_od) = od_patches
        .as_array()
        .and_then(|a| a.last())
        .and_then(|o| o.get("name"))
        .and_then(|n| n.as_str())
    {
        od_major_patch = Some(last_od.to_string());
        if compare_patch_versions(last_od, &target_version).is_gt() {
            target_version = last_od.to_string();
        }
    }

    if let Some(last_valve) = valve_list
        .as_ref()
        .and_then(|v| v.get("patches"))
        .and_then(|p| p.as_array())
        .and_then(|a| a.last())
    {
        if let Some(v_num) = last_valve
            .get("patch_number")
            .or_else(|| last_valve.get("patch_name"))
            .and_then(|s| s.as_str())
        {
            if !compare_patch_versions(v_num, &target_version).is_lt() {
                target_version = v_num.to_string();
                let exists = local_patches
                    .iter()
                    .any(|p| p.get("version").and_then(|s| s.as_str()) == Some(v_num));
                if !exists {
                    let details_url = format!("{VALVE_PATCH_NOTES_URL}{v_num}");
                    let details = fetch_json_checked(&client, &details_url).await.ok();
                    let ts = last_valve
                        .get("patch_timestamp")
                        .and_then(|v| v.as_i64())
                        .unwrap_or_else(|| chrono::Utc::now().timestamp());
                    let date_str = chrono::DateTime::from_timestamp(ts, 0)
                        .map(|d| d.format("%Y-%m-%d").to_string())
                        .unwrap_or_else(|| chrono::Utc::now().format("%Y-%m-%d").to_string());
                    local_patches.insert(
                        0,
                        json!({
                            "version": v_num,
                            "timestamp": ts,
                            "date": date_str,
                            "general_sections": details.as_ref().and_then(|d| d.get("general_notes")).cloned().unwrap_or_else(|| json!([])),
                            "item_changes": details.as_ref().and_then(|d| d.get("items")).cloned().unwrap_or_else(|| json!([])),
                            "hero_changes": details.as_ref().and_then(|d| d.get("heroes")).cloned().unwrap_or_else(|| json!([])),
                        }),
                    );
                }
            }
        }
    }
    let _ = storage.write_json_pretty(&storage.data_file("patches.json"), &Value::Array(local_patches.clone()));

    let mut meta_obj = storage
        .read_data_json("meta.json")
        .and_then(|v| v.as_object().cloned())
        .unwrap_or_default();
    meta_obj.insert("latest_patch".into(), json!(target_version));
    meta_obj.insert("synced_at_utc".into(), json!(chrono::Utc::now().to_rfc3339()));
    meta_obj.insert("heroes_count".into(), json!(local_heroes.len()));
    meta_obj.insert("items_count".into(), json!(local_items.len()));
    meta_obj.insert("patches_count".into(), json!(local_patches.len()));
    meta_obj.insert(
        "source".into(),
        json!("Valve Official Dota 2 Datafeed + OpenDota Constants"),
    );
    let _ = storage.write_json_pretty(&storage.data_file("meta.json"), &Value::Object(meta_obj));

    let next_status = PatchStatus {
        local_patch: Some(target_version.clone()),
        remote_patch: Some(target_version.clone()),
        open_dota_major_patch: od_major_patch,
        has_update: false,
        updating: false,
        checked_at_utc: Some(chrono::Utc::now().to_rfc3339()),
        offline: false,
        error: None,
        error_code: None,
    };
    if let Ok(mut guard) = data_state.latest_patch_status.lock() {
        *guard = next_status.clone();
    }
    data_state.reload_indexes(storage);

    json!({
        "ok": true,
        "targetVersion": target_version,
        "status": next_status,
        "heroesCount": local_heroes.len(),
        "itemsCount": local_items.len(),
    })
}

fn patch_error_response(data_state: &Arc<DataServiceState>, err_msg: String) -> Value {
    let status = if let Ok(mut guard) = data_state.latest_patch_status.lock() {
        guard.updating = false;
        guard.error = Some(err_msg.clone());
        Some(guard.clone())
    } else {
        None
    };
    json!({
        "ok": false,
        "error": err_msg,
        "status": status
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compares_dota_patch_versions_accurately() {
        assert!(compare_patch_versions("7.41g", "7.41f").is_gt());
        assert!(compare_patch_versions("7.42", "7.41z").is_gt());
        assert!(compare_patch_versions("7.41", "7.41a").is_lt());
        assert!(compare_patch_versions("7.41f", "7.41f").is_eq());
    }

    #[test]
    fn normalizes_steam_cdn_asset_urls() {
        assert_eq!(
            normalize_steam_asset_url("/apps/dota2/images/dota_react/heroes/axe.png?v=1"),
            "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png"
        );
    }
}
