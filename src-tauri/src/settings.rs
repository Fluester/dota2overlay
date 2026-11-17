use crate::{
    models::{AppSettings, SettingsPatch, VisionCalibration, WindowBounds},
    storage::StoragePaths,
};
use std::fs;

pub const DEFAULT_OPACITY: f64 = 0.96;

pub fn sanitize_language(raw: Option<&str>) -> String {
    let norm = raw.unwrap_or("uk").trim().to_lowercase();
    match norm.as_str() {
        "ru" => "ru".to_string(),
        "en" => "en".to_string(),
        "ua" | "uk" => "uk".to_string(),
        _ => "uk".to_string(),
    }
}

pub fn clamp_opacity(value: f64) -> f64 {
    if !value.is_finite() {
        return DEFAULT_OPACITY;
    }
    let rounded = (value * 100.0).round() / 100.0;
    rounded.clamp(0.45, 1.0)
}

pub fn sanitize_match_phase(raw: Option<&str>) -> String {
    match raw.unwrap_or("auto") {
        "early" => "early".to_string(),
        "mid" => "mid".to_string(),
        "late" => "late".to_string(),
        _ => "auto".to_string(),
    }
}

pub fn sanitize_calibration(cal: VisionCalibration) -> VisionCalibration {
    let mode = match cal.mode.as_str() {
        "ingame" => "ingame".to_string(),
        "draft" => "draft".to_string(),
        _ => "auto".to_string(),
    };
    let offset_x = cal.offset_x.clamp(-80, 80);
    let offset_y = cal.offset_y.clamp(-80, 80);
    let scale = if cal.scale.is_finite() {
        ((cal.scale * 100.0).round() / 100.0).clamp(0.8, 1.2)
    } else {
        1.0
    };
    VisionCalibration {
        mode,
        offset_x,
        offset_y,
        scale,
    }
}

pub fn sanitize_settings(raw: AppSettings) -> AppSettings {
    AppSettings {
        language: sanitize_language(Some(&raw.language)),
        window_bounds: raw.window_bounds,
        opacity: clamp_opacity(raw.opacity),
        click_through: raw.click_through,
        mini_mode: raw.mini_mode,
        allies_expanded: raw.allies_expanded,
        match_phase: sanitize_match_phase(Some(&raw.match_phase)),
        vision_calibration: sanitize_calibration(raw.vision_calibration),
    }
}

pub fn load_settings(storage: &StoragePaths) -> AppSettings {
    let _ = storage.ensure_base_dirs();
    let settings_file = storage.settings_file_path();
    if settings_file.exists() {
        if let Ok(content) = fs::read_to_string(&settings_file) {
            if let Ok(parsed) = serde_json::from_str::<AppSettings>(&content) {
                return sanitize_settings(parsed);
            }
        }
    }

    let defaults = AppSettings::default();
    let _ = save_settings(storage, &defaults);
    defaults
}

pub fn save_settings(storage: &StoragePaths, settings: &AppSettings) -> bool {
    let _ = storage.ensure_base_dirs();
    let file = storage.settings_file_path();
    match serde_json::to_string_pretty(settings) {
        Ok(json) => fs::write(file, json).is_ok(),
        Err(_) => false,
    }
}

pub fn apply_patch(current: &mut AppSettings, patch: SettingsPatch) {
    if let Some(lang) = patch.language {
        current.language = sanitize_language(Some(&lang));
    }
    if let Some(bounds_opt) = patch.window_bounds {
        current.window_bounds = bounds_opt;
    }
    if let Some(op) = patch.opacity {
        current.opacity = clamp_opacity(op);
    }
    if let Some(ct) = patch.click_through {
        current.click_through = ct;
    }
    if let Some(mm) = patch.mini_mode {
        current.mini_mode = mm;
    }
    if let Some(ae) = patch.allies_expanded {
        current.allies_expanded = ae;
    }
    if let Some(phase) = patch.match_phase {
        current.match_phase = sanitize_match_phase(Some(&phase));
    }
    if let Some(cal_patch) = patch.vision_calibration {
        if let Some(mode) = cal_patch.mode {
            current.vision_calibration.mode = mode;
        }
        if let Some(ox) = cal_patch.offset_x {
            if ox.is_finite() {
                current.vision_calibration.offset_x = ox.round() as i32;
            }
        }
        if let Some(oy) = cal_patch.offset_y {
            if oy.is_finite() {
                current.vision_calibration.offset_y = oy.round() as i32;
            }
        }
        if let Some(sc) = cal_patch.scale {
            if sc.is_finite() {
                current.vision_calibration.scale = sc;
            }
        }
        current.vision_calibration = sanitize_calibration(current.vision_calibration.clone());
    }
}

#[derive(Debug, Clone, Copy)]
pub struct LogicalRect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

pub fn resolve_safe_window_bounds(
    saved_bounds: Option<&WindowBounds>,
    width: i32,
    height: i32,
    primary_area: LogicalRect,
    all_areas: &[LogicalRect],
) -> LogicalRect {
    let areas: Vec<LogicalRect> = if all_areas.is_empty() {
        vec![primary_area]
    } else {
        all_areas.to_vec()
    };

    if let Some(saved) = saved_bounds {
        let win_right = saved.x + width;
        let win_bottom = saved.y + height;

        let visible_on_any = areas.iter().any(|wa| {
            let min_visible_x = (width as f64 * 0.6).round().max(220.0) as i32;
            let min_visible_y = (height as f64 * 0.35).round().max(180.0) as i32;
            let overlap_x = win_right.min(wa.x + wa.width) - saved.x.max(wa.x);
            let overlap_y = win_bottom.min(wa.y + wa.height) - saved.y.max(wa.y);
            let header_top_visible = saved.y >= wa.y && saved.y + 40 <= wa.y + wa.height;
            let horiz_margin = (width as f64 * 0.25).round() as i32;
            let header_horiz_visible =
                saved.x >= wa.x - horiz_margin && win_right <= wa.x + wa.width + horiz_margin;

            overlap_x >= min_visible_x
                && overlap_y >= min_visible_y
                && header_top_visible
                && header_horiz_visible
        });

        if visible_on_any {
            return LogicalRect {
                x: saved.x,
                y: saved.y,
                width,
                height,
            };
        }
    }

    let margin = 20;
    let x = primary_area
        .x
        .max(primary_area.x + primary_area.width - width - margin);
    let y = primary_area.y.max(
        (primary_area.y + 40).min(primary_area.y + primary_area.height - 100),
    );
    LogicalRect {
        x,
        y,
        width,
        height,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sanitizes_language_opacity_and_calibration() {
        assert_eq!(sanitize_language(Some("UA")), "uk");
        assert_eq!(sanitize_language(Some("ru")), "ru");
        assert_eq!(sanitize_language(Some("EN")), "en");
        assert_eq!(sanitize_language(Some("unknown")), "uk");
        assert_eq!(clamp_opacity(0.1), 0.45);
        assert_eq!(clamp_opacity(1.5), 1.0);
        let cal = sanitize_calibration(VisionCalibration {
            mode: "invalid".into(),
            offset_x: 150,
            offset_y: -120,
            scale: 2.5,
        });
        assert_eq!(cal.mode, "auto");
        assert_eq!(cal.offset_x, 80);
        assert_eq!(cal.offset_y, -80);
        assert_eq!(cal.scale, 1.2);
    }

    #[test]
    fn falls_back_offscreen_bounds_to_primary_top_right() {
        let primary = LogicalRect {
            x: 0,
            y: 0,
            width: 1920,
            height: 1040,
        };
        let offscreen = WindowBounds { x: 5000, y: 5000 };
        let resolved = resolve_safe_window_bounds(Some(&offscreen), 380, 650, primary, &[primary]);
        assert_eq!(resolved.x, 1920 - 380 - 20);
        assert_eq!(resolved.y, 40);
    }
}
