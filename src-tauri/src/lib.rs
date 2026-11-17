mod data_sync;
mod gsi;
mod models;
mod settings;
mod storage;
mod tray;
mod vision;
mod window_ctrl;

use crate::{
    data_sync::DataServiceState,
    gsi::GsiServiceState,
    models::{
        AppSettings, AppStatus, CalibrationPreviewResult, CfgStatus, CountersSummary,
        GsiSimulateResponse, GsiStatus, PatchStatus, SettingsPatch, VisionDraftResult,
        VisionEnemyItemsResult, WindowBounds,
    },
    storage::StoragePaths,
    tray::TrayHolder,
    vision::VisionServiceState,
};
use serde_json::{json, Value};
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};
use tauri::{ipc::Response, AppHandle, Emitter, Manager, State, WindowEvent};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

const TOGGLE_HOTKEY: &str = "Alt+Q";
const SHOW_TOP_HOTKEY: &str = "Alt+Shift+Q";
const CLICK_THROUGH_HOTKEY: &str = "Alt+X";
const SCAN_DRAFT_HOTKEY: &str = "Alt+S";
const SCAN_ENEMY_ITEMS_HOTKEY: &str = "Alt+E";

pub struct AppState {
    pub storage: StoragePaths,
    pub settings: Mutex<AppSettings>,
    pub data: Arc<DataServiceState>,
    pub gsi: Arc<GsiServiceState>,
    pub vision: Arc<VisionServiceState>,
    pub move_save_seq: AtomicU64,
}

#[tauri::command]
fn hide_window(app: AppHandle) {
    window_ctrl::hide_overlay_window(&app);
}

#[tauri::command]
fn close_app(app: AppHandle, state: State<'_, AppState>) {
    state.gsi.stop();
    if let Ok(g) = state.settings.lock() {
        settings::save_settings(&state.storage, &g);
    }
    app.exit(0);
}

#[tauri::command]
fn toggle_click_through(app: AppHandle, state: State<'_, AppState>) -> bool {
    window_ctrl::toggle_click_through(&app, &state.settings, &state.storage)
}

#[tauri::command]
fn toggle_mini_mode(app: AppHandle, state: State<'_, AppState>) -> bool {
    window_ctrl::toggle_mini_mode(&app, &state.settings, &state.storage)
}

#[tauri::command]
fn reset_window_position(app: AppHandle, state: State<'_, AppState>) -> WindowBounds {
    window_ctrl::reset_window_position(&app, &state.settings, &state.storage)
}

#[tauri::command]
fn get_settings(state: State<'_, AppState>) -> AppSettings {
    state
        .settings
        .lock()
        .map(|g| g.clone())
        .unwrap_or_default()
}

#[tauri::command]
fn update_settings(
    app: AppHandle,
    state: State<'_, AppState>,
    patch: SettingsPatch,
) -> AppSettings {
    window_ctrl::update_settings_with_window_effects(&app, &state.settings, &state.storage, patch)
}

#[tauri::command]
fn app_get_status(app: AppHandle, state: State<'_, AppState>) -> AppStatus {
    let counters_path = state.storage.data_file("counters.json");
    let heroes_path = state.storage.data_file("heroes.json");
    let items_path = state.storage.data_file("items.json");

    let counters_summary = if counters_path.exists() {
        match state.storage.read_data_json("counters.json") {
            Some(parsed) => Some(CountersSummary {
                patch_target: parsed
                    .get("patch_target")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
                heroes_count: parsed
                    .get("heroes")
                    .and_then(|v| v.as_object())
                    .map(|m| m.len())
                    .unwrap_or(0),
                item_rules_count: parsed
                    .get("item_rules")
                    .and_then(|v| v.as_object())
                    .map(|m| m.len())
                    .unwrap_or(0),
                threat_tags_count: parsed
                    .get("threat_tags")
                    .and_then(|v| v.as_object())
                    .map(|m| m.len())
                    .unwrap_or(0),
                error: None,
            }),
            None => Some(CountersSummary {
                patch_target: None,
                heroes_count: 0,
                item_rules_count: 0,
                threat_tags_count: 0,
                error: Some("Failed to parse counters.json".to_string()),
            }),
        }
    } else {
        None
    };

    let hotkey_registered = app.global_shortcut().is_registered(TOGGLE_HOTKEY);
    let force_dev = std::env::args().any(|a| a == "--dev");

    AppStatus {
        version: env!("CARGO_PKG_VERSION").to_string(),
        is_packaged: !cfg!(debug_assertions) && !force_dev,
        hotkey: TOGGLE_HOTKEY.to_string(),
        hotkey_registered,
        has_local_heroes: heroes_path.exists(),
        has_local_items: items_path.exists(),
        counters: counters_summary,
    }
}

#[tauri::command]
fn get_data_bundle(state: State<'_, AppState>) -> Response {
    let heroes_raw = state.storage.read_data_json("heroes.json").unwrap_or_else(|| json!([]));
    let items_raw = state.storage.read_data_json("items.json").unwrap_or_else(|| json!([]));
    let counters = state
        .storage
        .read_data_json("counters.json")
        .unwrap_or_else(|| json!({}));
    let od_heroes = state
        .storage
        .read_cache_json("opendota_heroes.json")
        .unwrap_or_else(|| json!({}));
    let od_items = state
        .storage
        .read_cache_json("opendota_items.json")
        .unwrap_or_else(|| json!({}));
    let sync_meta = state.storage.read_cache_json("sync_meta.json");
    let icon_map = state.data.get_icon_map();

    let payload = json!({
        "heroesRaw": heroes_raw,
        "itemsRaw": items_raw,
        "counters": counters,
        "odHeroesRaw": od_heroes,
        "odItemsRaw": od_items,
        "syncMeta": sync_meta,
        "iconMap": icon_map
    });
    Response::new(payload.to_string())
}

#[tauri::command]
fn get_rule_generator_inputs(state: State<'_, AppState>) -> Response {
    let heroes = state.storage.read_data_json("heroes.json").unwrap_or_else(|| json!([]));
    let items = state.storage.read_data_json("items.json").unwrap_or_else(|| json!([]));
    let base_counters = state
        .storage
        .read_data_json("counters.json")
        .unwrap_or_else(|| json!({}));
    let patches = state.storage.read_data_json("patches.json").unwrap_or_else(|| json!([]));
    let meta = state.storage.read_data_json("meta.json").unwrap_or_else(|| json!({}));
    let abilities = state
        .storage
        .read_data_json("abilities.json")
        .unwrap_or_else(|| json!([]));
    let od_heroes = state
        .storage
        .read_cache_json("opendota_heroes.json")
        .unwrap_or_else(|| json!({}));
    let od_items = state
        .storage
        .read_cache_json("opendota_items.json")
        .unwrap_or_else(|| json!({}));
    let od_abilities = state
        .storage
        .read_cache_json("opendota_abilities.json")
        .unwrap_or_else(|| json!({}));

    let payload = json!({
        "heroes": heroes,
        "items": items,
        "baseCounters": base_counters,
        "patches": patches,
        "meta": meta,
        "abilities": abilities,
        "odHeroesRaw": od_heroes,
        "odItemsRaw": od_items,
        "odAbilitiesRaw": od_abilities
    });
    Response::new(payload.to_string())
}

#[tauri::command]
fn save_counters_json(state: State<'_, AppState>, counters_json: String) -> Result<bool, String> {
    let parsed: Value =
        serde_json::from_str(&counters_json).map_err(|e| format!("Invalid JSON: {e}"))?;
    let formatted = serde_json::to_string_pretty(&parsed).map_err(|e| e.to_string())?;
    state.storage.write_data_string("counters.json", &formatted)?;
    state.data.reload_indexes(&state.storage);
    let data_ref = Arc::clone(&state.data);
    let vision_ref = Arc::clone(&state.vision);
    tauri::async_runtime::spawn(async move {
        vision_ref.refresh_templates(&data_ref);
    });
    Ok(true)
}

#[tauri::command]
async fn refresh_data(app: AppHandle, state: State<'_, AppState>) -> Result<Value, String> {
    let storage = state.storage.clone();
    let data = Arc::clone(&state.data);
    let vision = Arc::clone(&state.vision);
    let res = data_sync::sync_in_background(&app, &storage, &data, true).await;
    vision.refresh_templates(&data);
    Ok(res)
}

#[tauri::command]
fn gsi_get_status(state: State<'_, AppState>) -> GsiStatus {
    state.gsi.get_status()
}

#[tauri::command]
fn gsi_generate_cfg(state: State<'_, AppState>) -> CfgStatus {
    state.gsi.generate_cfg(&state.storage)
}

#[tauri::command]
async fn gsi_simulate(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<GsiSimulateResponse, String> {
    Ok(gsi::simulate_test_packet(&app, &state.gsi, &state.data).await)
}

#[tauri::command]
fn gsi_clear(state: State<'_, AppState>) -> GsiStatus {
    state.gsi.clear_state();
    state.gsi.get_status()
}

#[tauri::command]
fn patch_get_status(state: State<'_, AppState>) -> PatchStatus {
    state
        .data
        .latest_patch_status
        .lock()
        .map(|g| g.clone())
        .unwrap_or(PatchStatus {
            local_patch: None,
            remote_patch: None,
            open_dota_major_patch: None,
            has_update: false,
            updating: false,
            checked_at_utc: None,
            offline: false,
            error: None,
            error_code: None,
        })
}

#[tauri::command]
async fn patch_check(state: State<'_, AppState>) -> Result<PatchStatus, String> {
    let storage = state.storage.clone();
    let data = Arc::clone(&state.data);
    Ok(data_sync::check_for_updates(&storage, &data).await)
}

#[tauri::command]
async fn patch_apply_download(app: AppHandle, state: State<'_, AppState>) -> Result<Value, String> {
    let storage = state.storage.clone();
    let data = Arc::clone(&state.data);
    let res = data_sync::apply_patch_download(&storage, &data).await;
    if let Some(status) = res.get("status") {
        let _ = app.emit("overlay:patch-status", status);
    }
    Ok(res)
}

#[tauri::command]
async fn vision_scan_draft(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<VisionDraftResult, String> {
    let calibration = state
        .settings
        .lock()
        .map(|g| g.vision_calibration.clone())
        .unwrap_or_default();
    let gsi_game_state = state.gsi.last_game_state();
    let vision = Arc::clone(&state.vision);
    let data = Arc::clone(&state.data);
    let app_clone = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        vision::scan_draft_from_screen(
            &app_clone,
            &vision,
            &data,
            &calibration,
            gsi_game_state.as_deref(),
        )
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn vision_simulate_draft(state: State<'_, AppState>) -> VisionDraftResult {
    vision::simulate_draft_scan(&state.data)
}

#[tauri::command]
async fn vision_scan_enemy_items(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<VisionEnemyItemsResult, String> {
    let calibration = state
        .settings
        .lock()
        .map(|g| g.vision_calibration.clone())
        .unwrap_or_default();
    let vision = Arc::clone(&state.vision);
    let data = Arc::clone(&state.data);
    let app_clone = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        vision::scan_enemy_inventory_from_screen(&app_clone, &vision, &data, &calibration)
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn vision_simulate_enemy_items(state: State<'_, AppState>) -> VisionEnemyItemsResult {
    vision::simulate_enemy_inventory_scan(&state.data)
}

#[tauri::command]
async fn vision_calibration_preview(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<CalibrationPreviewResult, String> {
    let calibration = state
        .settings
        .lock()
        .map(|g| g.vision_calibration.clone())
        .unwrap_or_default();
    let gsi_game_state = state.gsi.last_game_state();
    let app_clone = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        vision::capture_calibration_preview(&app_clone, &calibration, gsi_game_state.as_deref())
    })
    .await
    .map_err(|e| e.to_string())
}

fn register_hotkeys(app: &AppHandle) {
    let gs = app.global_shortcut();

    if let Err(err) = gs.on_shortcut(TOGGLE_HOTKEY, |app_handle, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            let state = app_handle.state::<AppState>();
            window_ctrl::toggle_overlay_visibility(app_handle, &state.settings, &state.storage);
        }
    }) {
        eprintln!("[Dota2Overlay] Failed to register {TOGGLE_HOTKEY}: {err}");
    }

    let _ = gs.on_shortcut(SHOW_TOP_HOTKEY, |app_handle, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            let state = app_handle.state::<AppState>();
            if let Some(win) = app_handle.get_webview_window("main") {
                window_ctrl::show_and_assert_top_most(
                    app_handle,
                    &win,
                    &state.settings,
                    &state.storage,
                );
            }
        }
    });

    if let Err(err) = gs.on_shortcut(CLICK_THROUGH_HOTKEY, |app_handle, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            let state = app_handle.state::<AppState>();
            window_ctrl::toggle_click_through(app_handle, &state.settings, &state.storage);
        }
    }) {
        eprintln!("[Dota2Overlay] Failed to register {CLICK_THROUGH_HOTKEY}: {err}");
    }

    let _ = gs.on_shortcut(SCAN_DRAFT_HOTKEY, |app_handle, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            let handle = app_handle.clone();
            tauri::async_runtime::spawn_blocking(move || {
                let state = handle.state::<AppState>();
                let calibration = state
                    .settings
                    .lock()
                    .map(|g| g.vision_calibration.clone())
                    .unwrap_or_default();
                let gsi_game_state = state.gsi.last_game_state();
                let res = vision::scan_draft_from_screen(
                    &handle,
                    &state.vision,
                    &state.data,
                    &calibration,
                    gsi_game_state.as_deref(),
                );
                let _ = handle.emit("overlay:vision-draft", res);
            });
        }
    });

    let _ = gs.on_shortcut(SCAN_ENEMY_ITEMS_HOTKEY, |app_handle, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            let handle = app_handle.clone();
            tauri::async_runtime::spawn_blocking(move || {
                let state = handle.state::<AppState>();
                let calibration = state
                    .settings
                    .lock()
                    .map(|g| g.vision_calibration.clone())
                    .unwrap_or_default();
                let res = vision::scan_enemy_inventory_from_screen(
                    &handle,
                    &state.vision,
                    &state.data,
                    &calibration,
                );
                let _ = handle.emit("overlay:vision-enemy-items", res);
            });
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(state) = app.try_state::<AppState>() {
                if let Some(win) = app.get_webview_window("main") {
                    window_ctrl::show_and_assert_top_most(
                        app,
                        &win,
                        &state.settings,
                        &state.storage,
                    );
                }
            }
        }))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(TrayHolder::new())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let storage = StoragePaths::init(&app_handle);
            let _ = app_handle
                .asset_protocol_scope()
                .allow_directory(storage.writable_data_dir(), true);

            let loaded_settings = settings::load_settings(&storage);
            let data = Arc::new(DataServiceState::new(&storage));
            let gsi = Arc::new(GsiServiceState::new());
            let vision = Arc::new(VisionServiceState::new());

            app.manage(AppState {
                storage: storage.clone(),
                settings: Mutex::new(loaded_settings.clone()),
                data: Arc::clone(&data),
                gsi: Arc::clone(&gsi),
                vision: Arc::clone(&vision),
                move_save_seq: AtomicU64::new(0),
            });

            // Запускаємо локальний GSI HTTP-сервер на 127.0.0.1:3000
            gsi::start_server(
                app_handle.clone(),
                storage.clone(),
                Arc::clone(&gsi),
                Arc::clone(&data),
            );

            // Позиціонуємо та показуємо прозоре безрамкове вікно поверх усіх вікон
            if let Some(win) = app_handle.get_webview_window("main") {
                let state = app_handle.state::<AppState>();
                let target_height = window_ctrl::get_target_height(&loaded_settings);
                let safe = window_ctrl::get_safe_overlay_bounds(
                    &win,
                    loaded_settings.window_bounds.as_ref(),
                    target_height,
                );
                window_ctrl::apply_window_resize(
                    &win,
                    safe.x,
                    safe.y,
                    window_ctrl::OVERLAY_WIDTH,
                    target_height,
                );
                if loaded_settings.window_bounds.as_ref().map(|b| (b.x, b.y))
                    != Some((safe.x, safe.y))
                {
                    if let Ok(mut g) = state.settings.lock() {
                        g.window_bounds = Some(WindowBounds {
                            x: safe.x,
                            y: safe.y,
                        });
                        settings::save_settings(&state.storage, &g);
                    }
                }
                if loaded_settings.click_through {
                    let _ = win.set_ignore_cursor_events(true);
                    window_ctrl::show_no_activate(&win);
                } else {
                    let _ = win.show();
                    window_ctrl::assert_always_on_top(&win);
                }
            }

            tray::create_system_tray(&app_handle);
            register_hotkeys(&app_handle);

            // Фонове кешування Vision шаблонів
            {
                let v_ref = Arc::clone(&vision);
                let d_ref = Arc::clone(&data);
                tauri::async_runtime::spawn_blocking(move || {
                    v_ref.refresh_templates(&d_ref);
                });
            }

            // Фонова синхронізація OpenDota констант та іконок
            {
                let handle = app_handle.clone();
                let st = storage.clone();
                let d_ref = Arc::clone(&data);
                let v_ref = Arc::clone(&vision);
                tauri::async_runtime::spawn(async move {
                    let res = data_sync::sync_in_background(&handle, &st, &d_ref, false).await;
                    let changed = res
                        .get("updatedConstants")
                        .and_then(|v| v.as_bool())
                        .unwrap_or(false)
                        || res
                            .get("downloadedIcons")
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0)
                            > 0;
                    if changed {
                        v_ref.refresh_templates(&d_ref);
                    }
                });
            }

            // Фонова перевірка оновлення патчу Dota 2
            {
                let handle = app_handle.clone();
                let st = storage.clone();
                let d_ref = Arc::clone(&data);
                tauri::async_runtime::spawn(async move {
                    let status = data_sync::check_for_updates(&st, &d_ref).await;
                    let _ = handle.emit("overlay:patch-status", &status);
                });
            }

            Ok(())
        })
        .on_window_event(|win, event| {
            let app = win.app_handle();
            match event {
                WindowEvent::Moved(_) => {
                    let Some(state) = app.try_state::<AppState>() else {
                        return;
                    };
                    let Some(webview_win) = app.get_webview_window("main") else {
                        return;
                    };
                    let Some(bounds) = window_ctrl::get_window_logical_origin(&webview_win) else {
                        return;
                    };
                    let seq = state.move_save_seq.fetch_add(1, Ordering::SeqCst) + 1;
                    let app_clone = app.clone();
                    tauri::async_runtime::spawn(async move {
                        tokio::time::sleep(Duration::from_millis(250)).await;
                        let Some(st) = app_clone.try_state::<AppState>() else {
                            return;
                        };
                        if st.move_save_seq.load(Ordering::SeqCst) == seq {
                            if let Ok(mut g) = st.settings.lock() {
                                g.window_bounds = Some(bounds);
                                settings::save_settings(&st.storage, &g);
                            }
                        }
                    });
                }
                WindowEvent::Focused(false) => {
                    if let Some(webview_win) = app.get_webview_window("main") {
                        if webview_win.is_visible().unwrap_or(false) {
                            window_ctrl::assert_always_on_top(&webview_win);
                        }
                    }
                }
                WindowEvent::CloseRequested { .. } => {
                    if let Some(st) = app.try_state::<AppState>() {
                        st.gsi.stop();
                        if let Ok(g) = st.settings.lock() {
                            settings::save_settings(&st.storage, &g);
                        }
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            hide_window,
            close_app,
            toggle_click_through,
            toggle_mini_mode,
            reset_window_position,
            get_settings,
            update_settings,
            app_get_status,
            get_data_bundle,
            get_rule_generator_inputs,
            save_counters_json,
            refresh_data,
            gsi_get_status,
            gsi_generate_cfg,
            gsi_simulate,
            gsi_clear,
            patch_get_status,
            patch_check,
            patch_apply_download,
            vision_scan_draft,
            vision_simulate_draft,
            vision_scan_enemy_items,
            vision_simulate_enemy_items,
            vision_calibration_preview,
        ])
        .run(tauri::generate_context!())
        .expect("error while running dota2overlay tauri application");
}
