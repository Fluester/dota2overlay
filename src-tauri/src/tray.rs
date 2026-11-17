use crate::{
    settings, window_ctrl, AppState,
};
use std::sync::Mutex;
use tauri::{
    image::Image,
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

const EMBED_TRAY_ICON_PNG: &[u8] = include_bytes!("../../wwwroot/assets/tray-icon.png");

pub struct TrayHolder {
    pub tray: Mutex<Option<TrayIcon>>,
}

impl TrayHolder {
    pub fn new() -> Self {
        Self {
            tray: Mutex::new(None),
        }
    }
}

struct TrayLabels {
    tooltip: &'static str,
    show_top: &'static str,
    hide_overlay: &'static str,
    show_overlay: &'static str,
    click_through: &'static str,
    mini_mode: &'static str,
    language: &'static str,
    reset_pos: &'static str,
    quit: &'static str,
}

fn labels_for_lang(lang: &str) -> TrayLabels {
    match lang {
        "ru" => TrayLabels {
            tooltip: "Dota 2 Counter Overlay (Клик — показать | Alt+Q — показать/скрыть | Alt+X — клик сквозь)",
            show_top: "Показать поверх всех окон",
            hide_overlay: "Скрыть оверлей (Alt+Q)",
            show_overlay: "Показать оверлей (Alt+Q)",
            click_through: "Клик сквозь окно (Alt+X)",
            mini_mode: "Компактный мини-режим (HUD)",
            language: "Язык / Language",
            reset_pos: "Сбросить позицию окна",
            quit: "Выход",
        },
        "en" => TrayLabels {
            tooltip: "Dota 2 Counter Overlay (Click — show | Alt+Q — show/hide | Alt+X — click-through)",
            show_top: "Bring to Front (Always on Top)",
            hide_overlay: "Hide Overlay (Alt+Q)",
            show_overlay: "Show Overlay (Alt+Q)",
            click_through: "Click-Through Mode (Alt+X)",
            mini_mode: "Compact Mini HUD Mode",
            language: "Language",
            reset_pos: "Reset Window Position",
            quit: "Quit",
        },
        _ => TrayLabels {
            tooltip: "Dota 2 Counter Overlay (Клік — показати | Alt+Q — показати/сховати | Alt+X — клік крізь)",
            show_top: "Показати поверх усіх вікон",
            hide_overlay: "Сховати оверлей (Alt+Q)",
            show_overlay: "Показати оверлей (Alt+Q)",
            click_through: "Клік крізь вікно (Alt+X)",
            mini_mode: "Компактний міні-режим (HUD)",
            language: "Мова / Language",
            reset_pos: "Скинути позицію вікна",
            quit: "Вихід",
        },
    }
}

fn build_menu(app: &AppHandle) -> tauri::Result<(Menu<tauri::Wry>, &'static str)> {
    let state = app.state::<AppState>();
    let current = state
        .settings
        .lock()
        .map(|g| g.clone())
        .unwrap_or_default();
    let lang = settings::sanitize_language(Some(&current.language));
    let t = labels_for_lang(&lang);

    let is_visible = app
        .get_webview_window("main")
        .and_then(|w| w.is_visible().ok())
        .unwrap_or(false);

    let item_show_top = MenuItem::with_id(app, "show_top", t.show_top, true, None::<&str>)?;
    let item_toggle_vis = MenuItem::with_id(
        app,
        "toggle_vis",
        if is_visible {
            t.hide_overlay
        } else {
            t.show_overlay
        },
        true,
        None::<&str>,
    )?;
    let item_click_through = CheckMenuItem::with_id(
        app,
        "click_through",
        t.click_through,
        true,
        current.click_through,
        None::<&str>,
    )?;
    let item_mini_mode = CheckMenuItem::with_id(
        app,
        "mini_mode",
        t.mini_mode,
        true,
        current.mini_mode,
        None::<&str>,
    )?;

    let lang_uk = CheckMenuItem::with_id(app, "lang_uk", "Українська (UA)", true, lang == "uk", None::<&str>)?;
    let lang_ru = CheckMenuItem::with_id(app, "lang_ru", "Русский (RU)", true, lang == "ru", None::<&str>)?;
    let lang_en = CheckMenuItem::with_id(app, "lang_en", "English (EN)", true, lang == "en", None::<&str>)?;
    let lang_sub = Submenu::with_items(app, t.language, true, &[&lang_uk, &lang_ru, &lang_en])?;

    let sep1 = PredefinedMenuItem::separator(app)?;
    let item_reset = MenuItem::with_id(app, "reset_pos", t.reset_pos, true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let item_quit = MenuItem::with_id(app, "quit", t.quit, true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &item_show_top,
            &item_toggle_vis,
            &item_click_through,
            &item_mini_mode,
            &lang_sub,
            &sep1,
            &item_reset,
            &sep2,
            &item_quit,
        ],
    )?;

    Ok((menu, t.tooltip))
}

pub fn create_system_tray(app: &AppHandle) {
    let Ok((menu, tooltip)) = build_menu(app) else {
        return;
    };
    let icon = Image::from_bytes(EMBED_TRAY_ICON_PNG).unwrap_or_else(|_| {
        app.default_window_icon()
            .cloned()
            .unwrap_or_else(|| Image::new_owned(vec![0; 4], 1, 1))
    });

    let tray_res = TrayIconBuilder::with_id("d2o-tray")
        .icon(icon)
        .tooltip(tooltip)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app_handle, event| {
            let state = app_handle.state::<AppState>();
            match event.id().as_ref() {
                "show_top" => {
                    if let Some(win) = app_handle.get_webview_window("main") {
                        window_ctrl::show_and_assert_top_most(
                            app_handle,
                            &win,
                            &state.settings,
                            &state.storage,
                        );
                    }
                }
                "toggle_vis" => {
                    window_ctrl::toggle_overlay_visibility(
                        app_handle,
                        &state.settings,
                        &state.storage,
                    );
                }
                "click_through" => {
                    window_ctrl::toggle_click_through(app_handle, &state.settings, &state.storage);
                }
                "mini_mode" => {
                    window_ctrl::toggle_mini_mode(app_handle, &state.settings, &state.storage);
                }
                "lang_uk" | "lang_ru" | "lang_en" => {
                    let next_lang = match event.id().as_ref() {
                        "lang_ru" => "ru",
                        "lang_en" => "en",
                        _ => "uk",
                    };
                    let patch = crate::models::SettingsPatch {
                        language: Some(next_lang.to_string()),
                        ..Default::default()
                    };
                    window_ctrl::update_settings_with_window_effects(
                        app_handle,
                        &state.settings,
                        &state.storage,
                        patch,
                    );
                }
                "reset_pos" => {
                    window_ctrl::reset_window_position(
                        app_handle,
                        &state.settings,
                        &state.storage,
                    );
                }
                "quit" => {
                    state.gsi.stop();
                    if let Ok(g) = state.settings.lock() {
                        settings::save_settings(&state.storage, &g);
                    }
                    app_handle.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray_icon, event| {
            let app_handle = tray_icon.app_handle();
            let state = app_handle.state::<AppState>();
            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    if let Some(win) = app_handle.get_webview_window("main") {
                        window_ctrl::show_and_assert_top_most(
                            app_handle,
                            &win,
                            &state.settings,
                            &state.storage,
                        );
                    }
                }
                TrayIconEvent::DoubleClick {
                    button: MouseButton::Left,
                    ..
                } => {
                    window_ctrl::reset_window_position(
                        app_handle,
                        &state.settings,
                        &state.storage,
                    );
                }
                _ => {}
            }
        })
        .build(app);

    if let Ok(tray) = tray_res {
        let holder = app.state::<TrayHolder>();
        let mut guard = holder.tray.lock().ok();
        if let Some(ref mut g) = guard {
            **g = Some(tray);
        }
    }
}

pub fn rebuild_tray_menu(app: &AppHandle) {
    let Some(holder) = app.try_state::<TrayHolder>() else {
        return;
    };
    let Ok(guard) = holder.tray.lock() else {
        return;
    };
    let Some(ref tray) = *guard else {
        return;
    };
    if let Ok((menu, tooltip)) = build_menu(app) {
        let _ = tray.set_tooltip(Some(tooltip));
        let _ = tray.set_menu(Some(menu));
    }
}
