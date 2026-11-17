use crate::{
    models::{AppSettings, SettingsPatch, WindowBounds},
    settings::{self, LogicalRect},
    storage::StoragePaths,
    tray,
};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Monitor, Position, Size, WebviewWindow};

pub const OVERLAY_WIDTH: i32 = 380;
pub const OVERLAY_HEIGHT: i32 = 650;
pub const MINI_OVERLAY_HEIGHT: i32 = 110;

pub fn get_target_height(settings: &AppSettings) -> i32 {
    if settings.mini_mode {
        MINI_OVERLAY_HEIGHT
    } else {
        OVERLAY_HEIGHT
    }
}

fn monitor_to_logical_rect(m: &Monitor) -> LogicalRect {
    let scale = m.scale_factor().max(1.0);
    let wa = m.work_area();
    LogicalRect {
        x: (wa.position.x as f64 / scale).round() as i32,
        y: (wa.position.y as f64 / scale).round() as i32,
        width: (wa.size.width as f64 / scale).round() as i32,
        height: (wa.size.height as f64 / scale).round() as i32,
    }
}

pub fn get_safe_overlay_bounds(
    win: &WebviewWindow,
    saved_bounds: Option<&WindowBounds>,
    target_height: i32,
) -> LogicalRect {
    let primary_rect = win
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| monitor_to_logical_rect(&m))
        .unwrap_or(LogicalRect {
            x: 0,
            y: 0,
            width: 1920,
            height: 1040,
        });

    let all_areas: Vec<LogicalRect> = win
        .available_monitors()
        .unwrap_or_default()
        .iter()
        .map(monitor_to_logical_rect)
        .collect();

    settings::resolve_safe_window_bounds(
        saved_bounds,
        OVERLAY_WIDTH,
        target_height,
        primary_rect,
        &all_areas,
    )
}

pub fn get_window_logical_origin(win: &WebviewWindow) -> Option<WindowBounds> {
    let pos = win.outer_position().ok()?;
    let scale = win.scale_factor().ok().unwrap_or(1.0).max(1.0);
    Some(WindowBounds {
        x: (pos.x as f64 / scale).round() as i32,
        y: (pos.y as f64 / scale).round() as i32,
    })
}

pub fn get_window_logical_rect(win: &WebviewWindow) -> Option<LogicalRect> {
    let pos = win.outer_position().ok()?;
    let size = win.outer_size().ok()?;
    let scale = win.scale_factor().ok().unwrap_or(1.0).max(1.0);
    Some(LogicalRect {
        x: (pos.x as f64 / scale).round() as i32,
        y: (pos.y as f64 / scale).round() as i32,
        width: (size.width as f64 / scale).round() as i32,
        height: (size.height as f64 / scale).round() as i32,
    })
}

pub fn apply_window_resize(win: &WebviewWindow, x: i32, y: i32, width: i32, height: i32) {
    let was_resizable = win.is_resizable().unwrap_or(false);
    if !was_resizable {
        let _ = win.set_resizable(true);
    }
    let _ = win.set_min_size(Some(Size::Logical(LogicalSize::new(
        OVERLAY_WIDTH as f64,
        MINI_OVERLAY_HEIGHT as f64,
    ))));
    let _ = win.set_size(Size::Logical(LogicalSize::new(width as f64, height as f64)));
    let _ = win.set_position(Position::Logical(LogicalPosition::new(x as f64, y as f64)));
    if !was_resizable {
        let _ = win.set_resizable(false);
    }
}

pub fn assert_always_on_top(win: &WebviewWindow) {
    let _ = win.set_always_on_top(true);
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SetWindowPos, HWND_TOPMOST, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE,
        };
        if let Ok(hwnd) = win.hwnd() {
            unsafe {
                SetWindowPos(
                    hwnd.0 as _,
                    HWND_TOPMOST,
                    0,
                    0,
                    0,
                    0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
                );
            }
        }
    }
}

pub fn show_no_activate(win: &WebviewWindow) {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_SHOWNOACTIVATE};
        if let Ok(hwnd) = win.hwnd() {
            unsafe {
                ShowWindow(hwnd.0 as _, SW_SHOWNOACTIVATE);
            }
            assert_always_on_top(win);
            return;
        }
    }
    let _ = win.show();
    assert_always_on_top(win);
}

pub fn ensure_window_inside_displays(
    app: &AppHandle,
    win: &WebviewWindow,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
) {
    let current_settings = {
        let Ok(g) = settings_state.lock() else {
            return;
        };
        g.clone()
    };
    let target_height = get_target_height(&current_settings);
    let current = get_window_logical_rect(win);
    let current_bounds = current.map(|r| WindowBounds { x: r.x, y: r.y });
    let safe = get_safe_overlay_bounds(win, current_bounds.as_ref(), target_height);

    let needs_update = current
        .map(|c| c.x != safe.x || c.y != safe.y || c.height != target_height)
        .unwrap_or(true);

    if needs_update {
        apply_window_resize(win, safe.x, safe.y, OVERLAY_WIDTH, target_height);
        if let Ok(mut g) = settings_state.lock() {
            g.window_bounds = Some(WindowBounds {
                x: safe.x,
                y: safe.y,
            });
            settings::save_settings(storage, &g);
        }
        let _ = app.emit("overlay:settings-updated", &current_settings);
    }
}

pub fn apply_click_through_state(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
    enabled: bool,
    persist: bool,
) -> bool {
    let snapshot = {
        let Ok(mut g) = settings_state.lock() else {
            return enabled;
        };
        if persist {
            g.click_through = enabled;
            settings::save_settings(storage, &g);
        }
        g.clone()
    };

    if let Some(win) = app.get_webview_window("main") {
        let _ = win.set_ignore_cursor_events(enabled);
        assert_always_on_top(&win);
    }

    let _ = app.emit("overlay:click-through-changed", enabled);
    let _ = app.emit("overlay:settings-updated", &snapshot);
    tray::rebuild_tray_menu(app);
    enabled
}

pub fn toggle_click_through(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
) -> bool {
    let next = settings_state
        .lock()
        .map(|g| !g.click_through)
        .unwrap_or(false);
    apply_click_through_state(app, settings_state, storage, next, true)
}

pub fn apply_mini_mode_state(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
    enabled: bool,
    persist: bool,
) -> bool {
    let mut snapshot = {
        let Ok(mut g) = settings_state.lock() else {
            return enabled;
        };
        if persist {
            g.mini_mode = enabled;
            settings::save_settings(storage, &g);
        }
        g.clone()
    };

    if let Some(win) = app.get_webview_window("main") {
        let current = get_window_logical_origin(&win).or_else(|| snapshot.window_bounds.clone());
        let target_height = if enabled {
            MINI_OVERLAY_HEIGHT
        } else {
            OVERLAY_HEIGHT
        };
        let safe = get_safe_overlay_bounds(&win, current.as_ref(), target_height);
        apply_window_resize(&win, safe.x, safe.y, OVERLAY_WIDTH, target_height);

        let moved = current
            .map(|c| c.x != safe.x || c.y != safe.y)
            .unwrap_or(true);
        if moved {
            if let Ok(mut g) = settings_state.lock() {
                g.window_bounds = Some(WindowBounds {
                    x: safe.x,
                    y: safe.y,
                });
                settings::save_settings(storage, &g);
                snapshot = g.clone();
            }
        }
        assert_always_on_top(&win);
    }

    let _ = app.emit("overlay:mini-mode-changed", enabled);
    let _ = app.emit("overlay:settings-updated", &snapshot);
    tray::rebuild_tray_menu(app);
    enabled
}

pub fn toggle_mini_mode(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
) -> bool {
    let next = settings_state
        .lock()
        .map(|g| !g.mini_mode)
        .unwrap_or(false);
    apply_mini_mode_state(app, settings_state, storage, next, true)
}

pub fn reset_window_position(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
) -> WindowBounds {
    let target_height = settings_state
        .lock()
        .map(|g| get_target_height(&g))
        .unwrap_or(OVERLAY_HEIGHT);

    let safe = if let Some(win) = app.get_webview_window("main") {
        get_safe_overlay_bounds(&win, None, target_height)
    } else {
        LogicalRect {
            x: 1520,
            y: 40,
            width: OVERLAY_WIDTH,
            height: target_height,
        }
    };

    let next_bounds = WindowBounds {
        x: safe.x,
        y: safe.y,
    };

    if let Ok(mut g) = settings_state.lock() {
        g.window_bounds = Some(next_bounds.clone());
        settings::save_settings(storage, &g);
    }

    if let Some(win) = app.get_webview_window("main") {
        apply_window_resize(&win, safe.x, safe.y, OVERLAY_WIDTH, target_height);
        show_and_assert_top_most(app, &win, settings_state, storage);
    }

    next_bounds
}

pub fn show_and_assert_top_most(
    app: &AppHandle,
    win: &WebviewWindow,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
) {
    ensure_window_inside_displays(app, win, settings_state, storage);
    let click_through = settings_state
        .lock()
        .map(|g| g.click_through)
        .unwrap_or(false);

    if win.is_minimized().unwrap_or(false) {
        let _ = win.unminimize();
    }

    if click_through {
        show_no_activate(win);
        let _ = win.set_ignore_cursor_events(true);
    } else {
        let _ = win.show();
        assert_always_on_top(win);
        let _ = win.set_focus();
    }

    let _ = app.emit("overlay:visibility-changed", true);
    tray::rebuild_tray_menu(app);
}

pub fn hide_overlay_window(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.hide();
    }
    let _ = app.emit("overlay:visibility-changed", false);
    tray::rebuild_tray_menu(app);
}

pub fn toggle_overlay_visibility(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
) {
    let Some(win) = app.get_webview_window("main") else {
        return;
    };
    let visible = win.is_visible().unwrap_or(false);
    let minimized = win.is_minimized().unwrap_or(false);
    if visible && !minimized {
        hide_overlay_window(app);
    } else {
        show_and_assert_top_most(app, &win, settings_state, storage);
    }
}

pub fn update_settings_with_window_effects(
    app: &AppHandle,
    settings_state: &Mutex<AppSettings>,
    storage: &StoragePaths,
    patch: SettingsPatch,
) -> AppSettings {
    let has_opacity = patch.opacity.is_some();
    let has_click_through = patch.click_through;
    let has_mini_mode = patch.mini_mode;
    let has_lang = patch.language.is_some();

    let mut updated = {
        let Ok(mut g) = settings_state.lock() else {
            return AppSettings::default();
        };
        settings::apply_patch(&mut g, patch);
        settings::save_settings(storage, &g);
        g.clone()
    };

    if let Some(ct) = has_click_through {
        apply_click_through_state(app, settings_state, storage, ct, false);
    }
    if let Some(mm) = has_mini_mode {
        apply_mini_mode_state(app, settings_state, storage, mm, false);
    }
    if has_lang {
        tray::rebuild_tray_menu(app);
    }

    if let Ok(g) = settings_state.lock() {
        updated = g.clone();
    }
    if has_opacity || has_click_through.is_some() || has_mini_mode.is_some() || has_lang {
        let _ = app.emit("overlay:settings-updated", &updated);
    } else {
        let _ = app.emit("overlay:settings-updated", &updated);
    }
    updated
}
