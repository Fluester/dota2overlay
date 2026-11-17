use crate::{
    data_sync::DataServiceState,
    models::{
        CalibrationPreviewResult, VisionCalibration, VisionDetectedItem, VisionDraftResult,
        VisionDraftSlotResult, VisionEnemyItemsResult, VisionHeroBrief,
    },
    window_ctrl,
};
use base64::{engine::general_purpose::STANDARD as BASE64_STD, Engine};
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageFormat, Rgba, RgbaImage};
use std::{
    collections::HashSet,
    io::Cursor,
    path::Path,
    sync::Mutex,
    thread,
    time::Duration,
};
use tauri::{AppHandle, Manager};

const REF_WIDTH: f64 = 1920.0;
const REF_HEIGHT: f64 = 1080.0;
const SIG_W: u32 = 12;
const SIG_H: u32 = 8;
const HIST_BINS_PER_CH: usize = 3;

const HERO_MATCH_THRESHOLD: f64 = 0.16;
const ITEM_MATCH_THRESHOLD: f64 = 0.15;
const MIN_SLOT_LUMA: f64 = 16.0;
const MIN_SLOT_STD: f64 = 0.06;
const MIN_SPATIAL_CORRELATION: f64 = 0.62;
const AUTOHIDE_SETTLE_MS: u64 = 65;

#[derive(Clone, Copy)]
struct RefRect {
    x: i32,
    y: i32,
    w: i32,
    h: i32,
}

fn top_bar_ally_slots() -> [RefRect; 5] {
    std::array::from_fn(|i| RefRect {
        x: 522 + (i as i32) * 67,
        y: 7,
        w: 60,
        h: 34,
    })
}

fn top_bar_enemy_slots() -> [RefRect; 5] {
    std::array::from_fn(|i| RefRect {
        x: 1067 + (i as i32) * 67,
        y: 7,
        w: 60,
        h: 34,
    })
}

fn draft_pick_ally_slots() -> [RefRect; 5] {
    std::array::from_fn(|i| RefRect {
        x: 224 + (i as i32) * 108,
        y: 22,
        w: 96,
        h: 54,
    })
}

fn draft_pick_enemy_slots() -> [RefRect; 5] {
    std::array::from_fn(|i| RefRect {
        x: 1152 + (i as i32) * 108,
        y: 22,
        w: 96,
        h: 54,
    })
}

const ENEMY_INVENTORY_SLOTS: [(usize, RefRect); 6] = [
    (0, RefRect { x: 1142, y: 974, w: 60, h: 43 }),
    (1, RefRect { x: 1207, y: 974, w: 60, h: 43 }),
    (2, RefRect { x: 1272, y: 974, w: 60, h: 43 }),
    (3, RefRect { x: 1142, y: 1020, w: 60, h: 43 }),
    (4, RefRect { x: 1207, y: 1020, w: 60, h: 43 }),
    (5, RefRect { x: 1272, y: 1020, w: 60, h: 43 }),
];

#[derive(Clone)]
struct ImageSignature {
    spatial: Vec<f32>,
    hist: [f32; 27],
    avg_luma: f64,
    spatial_mean: f64,
    spatial_std: f64,
}

#[derive(Clone)]
pub(crate) struct HeroTemplate {
    pub hero: VisionHeroBrief,
    sig: ImageSignature,
}

#[derive(Clone)]
pub(crate) struct ItemTemplate {
    pub key: String,
    pub name_en: String,
    pub img: String,
    pub local_img_path: String,
    pub is_trigger: bool,
    sig: ImageSignature,
}

pub struct VisionServiceState {
    hero_templates: Mutex<Option<Vec<HeroTemplate>>>,
    item_templates: Mutex<Option<Vec<ItemTemplate>>>,
}

impl VisionServiceState {
    pub fn new() -> Self {
        Self {
            hero_templates: Mutex::new(None),
            item_templates: Mutex::new(None),
        }
    }

    pub fn invalidate_cache(&self) {
        if let Ok(mut g) = self.hero_templates.lock() {
            *g = None;
        }
        if let Ok(mut g) = self.item_templates.lock() {
            *g = None;
        }
    }

    pub fn refresh_templates(&self, data_state: &DataServiceState) {
        let heroes = build_hero_templates(data_state);
        let items = build_item_templates(data_state);
        if let Ok(mut g) = self.hero_templates.lock() {
            *g = Some(heroes);
        }
        if let Ok(mut g) = self.item_templates.lock() {
            *g = Some(items);
        }
    }

    fn ensure_hero_templates(&self, data_state: &DataServiceState) -> Vec<HeroTemplate> {
        if let Ok(g) = self.hero_templates.lock() {
            if let Some(ref existing) = *g {
                return existing.clone();
            }
        }
        let built = build_hero_templates(data_state);
        if let Ok(mut g) = self.hero_templates.lock() {
            *g = Some(built.clone());
        }
        built
    }

    fn ensure_item_templates(&self, data_state: &DataServiceState) -> Vec<ItemTemplate> {
        if let Ok(g) = self.item_templates.lock() {
            if let Some(ref existing) = *g {
                return existing.clone();
            }
        }
        let built = build_item_templates(data_state);
        if let Ok(mut g) = self.item_templates.lock() {
            *g = Some(built.clone());
        }
        built
    }
}

fn scale_hud_rect(
    rect: RefRect,
    img_width: u32,
    img_height: u32,
    calibration: &VisionCalibration,
) -> (u32, u32, u32, u32) {
    let img_w_f = img_width as f64;
    let img_h_f = img_height as f64;
    let target_16x9_w = (img_h_f * 16.0) / 9.0;
    let x_offset = if img_w_f > target_16x9_w {
        (img_w_f - target_16x9_w) / 2.0
    } else {
        0.0
    };
    let effective_w = if img_w_f > target_16x9_w {
        target_16x9_w
    } else {
        img_w_f
    };

    let scale_x = effective_w / REF_WIDTH;
    let scale_y = img_h_f / REF_HEIGHT;

    let user_scale = calibration.scale;
    let user_offset_x = calibration.offset_x as f64;
    let user_offset_y = calibration.offset_y as f64;

    let ref_x = 960.0 + ((rect.x as f64) - 960.0) * user_scale + user_offset_x;
    let ref_y = (rect.y as f64) * user_scale + user_offset_y;
    let ref_w = (rect.w as f64) * user_scale;
    let ref_h = (rect.h as f64) * user_scale;

    let max_x = img_width.saturating_sub(2) as i64;
    let max_y = img_height.saturating_sub(2) as i64;
    let x = ((x_offset + ref_x * scale_x).round() as i64).clamp(0, max_x) as u32;
    let y = ((ref_y * scale_y).round() as i64).clamp(0, max_y) as u32;
    let w = ((ref_w * scale_x).round() as i64)
        .clamp(2, (img_width - x).max(2) as i64) as u32;
    let h = ((ref_h * scale_y).round() as i64)
        .clamp(2, (img_height - y).max(2) as i64) as u32;

    (x, y, w, h)
}

fn compute_signature(img: &DynamicImage) -> ImageSignature {
    let tiny = img.resize_exact(SIG_W, SIG_H, FilterType::Triangle).to_rgba8();
    let pixel_count = (SIG_W * SIG_H) as usize;
    let mut spatial = Vec::with_capacity(pixel_count * 3);
    let mut hist = [0f32; 27];
    let mut luma_sum = 0.0f64;

    for px in tiny.pixels() {
        let [r, g, b, _] = px.0;
        spatial.push((r as f32) / 255.0);
        spatial.push((g as f32) / 255.0);
        spatial.push((b as f32) / 255.0);

        luma_sum += 0.299 * (r as f64) + 0.587 * (g as f64) + 0.114 * (b as f64);

        let br = (((r as usize) * HIST_BINS_PER_CH) / 256).min(HIST_BINS_PER_CH - 1);
        let bg = (((g as usize) * HIST_BINS_PER_CH) / 256).min(HIST_BINS_PER_CH - 1);
        let bb = (((b as usize) * HIST_BINS_PER_CH) / 256).min(HIST_BINS_PER_CH - 1);
        hist[br * 9 + bg * 3 + bb] += 1.0;
    }

    for h in &mut hist {
        *h /= pixel_count as f32;
    }

    let spatial_len = spatial.len() as f64;
    let spatial_sum: f64 = spatial.iter().map(|&v| v as f64).sum();
    let spatial_mean = spatial_sum / spatial_len;
    let var_sum: f64 = spatial
        .iter()
        .map(|&v| {
            let d = (v as f64) - spatial_mean;
            d * d
        })
        .sum();

    ImageSignature {
        spatial,
        hist,
        avg_luma: luma_sum / (pixel_count as f64),
        spatial_mean,
        spatial_std: (var_sum / spatial_len).sqrt(),
    }
}

fn compute_spatial_correlation(a: &ImageSignature, b: &ImageSignature) -> f64 {
    let mut num = 0.0f64;
    let mut va = 0.0f64;
    let mut vb = 0.0f64;
    for (xa, xb) in a.spatial.iter().zip(b.spatial.iter()) {
        let da = (*xa as f64) - a.spatial_mean;
        let db = (*xb as f64) - b.spatial_mean;
        num += da * db;
        va += da * da;
        vb += db * db;
    }
    if va <= 1e-8 || vb <= 1e-8 {
        return 0.0;
    }
    num / (va * vb).sqrt()
}

fn compute_signature_distance(a: &ImageSignature, b: &ImageSignature) -> f64 {
    let spatial_diff: f64 = a
        .spatial
        .iter()
        .zip(b.spatial.iter())
        .map(|(x, y)| ((*x as f64) - (*y as f64)).abs())
        .sum();
    let spatial_mean = spatial_diff / (a.spatial.len() as f64);

    let hist_diff: f64 = a
        .hist
        .iter()
        .zip(b.hist.iter())
        .map(|(x, y)| ((*x as f64) - (*y as f64)).abs())
        .sum();

    0.7 * spatial_mean + 0.3 * (hist_diff * 0.5)
}

fn build_hero_templates(data_state: &DataServiceState) -> Vec<HeroTemplate> {
    let Ok(guard) = data_state.indexed.lock() else {
        return Vec::new();
    };
    let mut templates = Vec::new();
    for h in guard.heroes_by_id.values() {
        if !h.has_local_portrait {
            continue;
        }
        let path = Path::new(&h.local_portrait_path);
        let Ok(img) = image::open(path) else {
            continue;
        };
        templates.push(HeroTemplate {
            hero: VisionHeroBrief {
                id: h.id,
                key: h.key.clone(),
                name_en: h.name_en.clone(),
                icon: if h.has_local_icon {
                    h.local_icon_path.clone()
                } else {
                    h.remote_icon.clone()
                },
                img: h.local_portrait_path.clone(),
                local_icon_path: if h.has_local_icon {
                    h.local_icon_path.clone()
                } else {
                    String::new()
                },
                local_portrait_path: h.local_portrait_path.clone(),
            },
            sig: compute_signature(&img),
        });
    }
    templates
}

fn build_item_templates(data_state: &DataServiceState) -> Vec<ItemTemplate> {
    let Ok(guard) = data_state.indexed.lock() else {
        return Vec::new();
    };
    let mut watch_keys: HashSet<String> = guard.enemy_trigger_keys.clone();
    watch_keys.extend(guard.item_rule_keys.iter().cloned());

    let mut templates = Vec::new();
    for key in watch_keys {
        let Some(it) = guard.items_by_key.get(&key) else {
            continue;
        };
        if !it.has_local_img {
            continue;
        }
        let Ok(img) = image::open(Path::new(&it.local_img_path)) else {
            continue;
        };
        templates.push(ItemTemplate {
            key: it.key.clone(),
            name_en: it.name_en.clone(),
            img: it.local_img_path.clone(),
            local_img_path: it.local_img_path.clone(),
            is_trigger: guard.enemy_trigger_keys.contains(&key),
            sig: compute_signature(&img),
        });
    }
    templates
}

fn should_auto_hide_window(win_y: i32, win_h: i32, display_h: i32, target_zone: &str) -> bool {
    match target_zone {
        "all" => true,
        "top" => win_y < ((display_h as f64) * 0.14).round() as i32,
        "bottom" => win_y + win_h > ((display_h as f64) * 0.82).round() as i32,
        _ => false,
    }
}

fn capture_primary_screen(
    app: &AppHandle,
    target_zone: &str,
    always_hide: bool,
) -> Result<(DynamicImage, bool), (&'static str, String)> {
    let monitors = xcap::Monitor::all().map_err(|e| ("NO_SCREEN_SOURCE", e.to_string()))?;
    if monitors.is_empty() {
        return Err((
            "NO_SCREEN_SOURCE",
            "No screen capture source found.".to_string(),
        ));
    }
    let primary = monitors
        .iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .cloned()
        .unwrap_or_else(|| monitors.into_iter().next().unwrap());

    let mon_h = primary.height().unwrap_or(1080) as i32;
    let scale = primary.scale_factor().unwrap_or(1.0).max(1.0);
    let logical_mon_h = ((mon_h as f64) / (scale as f64)).round() as i32;

    let mut temporarily_hidden = false;
    let win_opt = app.get_webview_window("main");
    if let Some(ref win) = win_opt {
        if win.is_visible().unwrap_or(false) {
            if let Some(rect) = window_ctrl::get_window_logical_rect(win) {
                if always_hide || should_auto_hide_window(rect.y, rect.height, logical_mon_h, target_zone) {
                    let _ = win.hide();
                    temporarily_hidden = true;
                    thread::sleep(Duration::from_millis(AUTOHIDE_SETTLE_MS));
                }
            }
        }
    }

    let captured = primary
        .capture_image()
        .map_err(|e| ("NO_SCREEN_SOURCE", e.to_string()));

    if temporarily_hidden {
        if let Some(ref win) = win_opt {
            window_ctrl::show_no_activate(win);
        }
    }

    let rgba: RgbaImage = captured?;
    Ok((DynamicImage::ImageRgba8(rgba), temporarily_hidden))
}

fn resolve_draft_profile(calibration: &VisionCalibration, gsi_game_state: Option<&str>) -> &'static str {
    match calibration.mode.as_str() {
        "draft" => return "draft",
        "ingame" => return "ingame",
        _ => {}
    }
    match gsi_game_state {
        Some("DOTA_GAMERULES_STATE_HERO_SELECTION")
        | Some("DOTA_GAMERULES_STATE_STRATEGY_TIME")
        | Some("DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD") => "draft",
        Some("DOTA_GAMERULES_STATE_GAME_IN_PROGRESS")
        | Some("DOTA_GAMERULES_STATE_PRE_GAME") => "ingame",
        _ => "auto",
    }
}

fn match_draft_profile_on_image(
    screen: &DynamicImage,
    ally_rects: &[RefRect; 5],
    enemy_rects: &[RefRect; 5],
    templates: &[HeroTemplate],
    calibration: &VisionCalibration,
) -> (
    Vec<VisionDraftSlotResult>,
    Vec<VisionDraftSlotResult>,
    Vec<VisionHeroBrief>,
    Vec<VisionHeroBrief>,
    i64,
) {
    let (width, height) = screen.dimensions();
    let mut used_hero_ids: HashSet<u32> = HashSet::new();

    let mut match_list = |rects: &[RefRect; 5]| -> Vec<VisionDraftSlotResult> {
        let mut results = Vec::with_capacity(5);
        for (idx, rect) in rects.iter().enumerate() {
            let (cx, cy, cw, ch) = scale_hud_rect(*rect, width, height, calibration);
            let crop = screen.crop_imm(cx, cy, cw, ch);
            let slot_sig = compute_signature(&crop);

            if slot_sig.avg_luma < MIN_SLOT_LUMA || slot_sig.spatial_std < MIN_SLOT_STD {
                results.push(VisionDraftSlotResult {
                    slot: idx,
                    hero: None,
                    distance: None,
                    correlation: None,
                    confidence: 0,
                    reason: Some("empty_or_uniform_slot".to_string()),
                });
                continue;
            }

            let mut best_hero: Option<&HeroTemplate> = None;
            let mut best_dist = f64::INFINITY;
            let mut best_corr = 0.0f64;

            for tpl in templates {
                if used_hero_ids.contains(&tpl.hero.id) {
                    continue;
                }
                let corr = compute_spatial_correlation(&slot_sig, &tpl.sig);
                if corr < MIN_SPATIAL_CORRELATION {
                    continue;
                }
                let dist = compute_signature_distance(&slot_sig, &tpl.sig);
                if dist < best_dist {
                    best_dist = dist;
                    best_hero = Some(tpl);
                    best_corr = corr;
                }
            }

            if let Some(best) = best_hero.filter(|_| best_dist <= HERO_MATCH_THRESHOLD) {
                used_hero_ids.insert(best.hero.id);
                results.push(VisionDraftSlotResult {
                    slot: idx,
                    hero: Some(best.hero.clone()),
                    distance: Some((best_dist * 1000.0).round() / 1000.0),
                    correlation: Some((best_corr * 100.0).round() as i64),
                    confidence: (((1.0 - best_dist) * 100.0).round()) as i64,
                    reason: None,
                });
            } else {
                results.push(VisionDraftSlotResult {
                    slot: idx,
                    hero: None,
                    distance: Some(if best_dist.is_finite() {
                        (best_dist * 1000.0).round() / 1000.0
                    } else {
                        1.0
                    }),
                    correlation: None,
                    confidence: 0,
                    reason: None,
                });
            }
        }
        results
    };

    let allies_slots = match_list(ally_rects);
    let enemies_slots = match_list(enemy_rects);
    let allies: Vec<VisionHeroBrief> = allies_slots
        .iter()
        .filter_map(|s| s.hero.clone())
        .collect();
    let enemies: Vec<VisionHeroBrief> = enemies_slots
        .iter()
        .filter_map(|s| s.hero.clone())
        .collect();
    let quality: i64 = allies_slots
        .iter()
        .chain(enemies_slots.iter())
        .map(|s| if s.hero.is_some() { s.confidence } else { 0 })
        .sum();

    (allies_slots, enemies_slots, allies, enemies, quality)
}

pub fn scan_draft_from_image(
    screen: &DynamicImage,
    templates: &[HeroTemplate],
    calibration: &VisionCalibration,
    gsi_game_state: Option<&str>,
    auto_hidden: Option<bool>,
) -> VisionDraftResult {
    let (width, height) = screen.dimensions();
    let requested = resolve_draft_profile(calibration, gsi_game_state);

    let mut chosen = if requested == "draft" { "draft" } else { "ingame" };
    let (mut a_slots, mut e_slots, mut allies, mut enemies, mut quality) = if chosen == "draft" {
        match_draft_profile_on_image(
            screen,
            &draft_pick_ally_slots(),
            &draft_pick_enemy_slots(),
            templates,
            calibration,
        )
    } else {
        match_draft_profile_on_image(
            screen,
            &top_bar_ally_slots(),
            &top_bar_enemy_slots(),
            templates,
            calibration,
        )
    };

    if requested == "auto" {
        let candidate = match_draft_profile_on_image(
            screen,
            &draft_pick_ally_slots(),
            &draft_pick_enemy_slots(),
            templates,
            calibration,
        );
        if candidate.4 > quality {
            chosen = "draft";
            a_slots = candidate.0;
            e_slots = candidate.1;
            allies = candidate.2;
            enemies = candidate.3;
            quality = candidate.4;
        }
    }
    let _ = quality;

    let matched_count = allies.len() + enemies.len();
    if matched_count == 0 {
        return VisionDraftResult {
            ok: false,
            not_found: true,
            error_code: Some("NO_DOTA_ICONS".to_string()),
            error: Some("No Dota 2 icons detected on screen".to_string()),
            source: Some("vision".to_string()),
            is_simulated: false,
            profile_used: Some(chosen.to_string()),
            screen_resolution: Some(format!("{width}x{height}")),
            auto_hidden,
            allies_slots: a_slots,
            enemies_slots: e_slots,
            allies: Vec::new(),
            enemies: Vec::new(),
        };
    }

    VisionDraftResult {
        ok: true,
        not_found: false,
        error_code: None,
        error: None,
        source: Some("vision".to_string()),
        is_simulated: false,
        profile_used: Some(chosen.to_string()),
        screen_resolution: Some(format!("{width}x{height}")),
        auto_hidden,
        allies_slots: a_slots,
        enemies_slots: e_slots,
        allies,
        enemies,
    }
}

pub fn scan_draft_from_screen(
    app: &AppHandle,
    vision_state: &VisionServiceState,
    data_state: &DataServiceState,
    calibration: &VisionCalibration,
    gsi_game_state: Option<&str>,
) -> VisionDraftResult {
    let templates = vision_state.ensure_hero_templates(data_state);
    if templates.is_empty() {
        return VisionDraftResult {
            ok: false,
            not_found: false,
            error_code: Some("EMPTY_HERO_CACHE".to_string()),
            error: Some(
                "Local hero portrait cache is empty — wait for icons to finish downloading."
                    .to_string(),
            ),
            source: None,
            is_simulated: false,
            profile_used: None,
            screen_resolution: None,
            auto_hidden: None,
            allies_slots: Vec::new(),
            enemies_slots: Vec::new(),
            allies: Vec::new(),
            enemies: Vec::new(),
        };
    }

    let (screen, auto_hidden) = match capture_primary_screen(app, "top", false) {
        Ok(res) => res,
        Err((code, msg)) => {
            return VisionDraftResult {
                ok: false,
                not_found: false,
                error_code: Some(code.to_string()),
                error: Some(msg),
                source: None,
                is_simulated: false,
                profile_used: None,
                screen_resolution: None,
                auto_hidden: None,
                allies_slots: Vec::new(),
                enemies_slots: Vec::new(),
                allies: Vec::new(),
                enemies: Vec::new(),
            };
        }
    };

    scan_draft_from_image(&screen, &templates, calibration, gsi_game_state, Some(auto_hidden))
}

pub fn scan_enemy_inventory_from_image(
    screen: &DynamicImage,
    templates: &[ItemTemplate],
    calibration: &VisionCalibration,
    auto_hidden: Option<bool>,
) -> VisionEnemyItemsResult {
    let (width, height) = screen.dimensions();
    let mut detected_items = Vec::new();
    let mut detected_trigger_keys = Vec::new();
    let mut seen_keys = HashSet::new();

    for (slot_idx, slot_rect) in ENEMY_INVENTORY_SLOTS {
        let (cx, cy, cw, ch) = scale_hud_rect(slot_rect, width, height, calibration);
        let crop = screen.crop_imm(cx, cy, cw, ch);
        let slot_sig = compute_signature(&crop);
        if slot_sig.avg_luma < MIN_SLOT_LUMA || slot_sig.spatial_std < MIN_SLOT_STD {
            continue;
        }

        let mut best_entry: Option<&ItemTemplate> = None;
        let mut best_dist = f64::INFINITY;
        let mut best_corr = 0.0f64;

        for tpl in templates {
            let corr = compute_spatial_correlation(&slot_sig, &tpl.sig);
            if corr < MIN_SPATIAL_CORRELATION {
                continue;
            }
            let dist = compute_signature_distance(&slot_sig, &tpl.sig);
            if dist < best_dist {
                best_dist = dist;
                best_entry = Some(tpl);
                best_corr = corr;
            }
        }

        if let Some(best) = best_entry.filter(|_| best_dist <= ITEM_MATCH_THRESHOLD) {
            if seen_keys.insert(best.key.clone()) {
                detected_items.push(VisionDetectedItem {
                    slot: slot_idx,
                    key: best.key.clone(),
                    name_en: best.name_en.clone(),
                    img: best.img.clone(),
                    local_img_path: best.local_img_path.clone(),
                    is_trigger: best.is_trigger,
                    correlation: Some((best_corr * 100.0).round() as i64),
                    confidence: (((1.0 - best_dist) * 100.0).round()) as i64,
                });
                if best.is_trigger {
                    detected_trigger_keys.push(best.key.clone());
                }
            }
        }
    }

    if detected_items.is_empty() {
        return VisionEnemyItemsResult {
            ok: false,
            not_found: true,
            error_code: Some("NO_DOTA_ICONS".to_string()),
            error: Some("No Dota 2 icons detected on screen".to_string()),
            source: Some("vision".to_string()),
            is_simulated: false,
            screen_resolution: Some(format!("{width}x{height}")),
            auto_hidden,
            detected_items: Vec::new(),
            detected_trigger_keys: Vec::new(),
        };
    }

    VisionEnemyItemsResult {
        ok: true,
        not_found: false,
        error_code: None,
        error: None,
        source: Some("vision".to_string()),
        is_simulated: false,
        screen_resolution: Some(format!("{width}x{height}")),
        auto_hidden,
        detected_items,
        detected_trigger_keys,
    }
}

pub fn scan_enemy_inventory_from_screen(
    app: &AppHandle,
    vision_state: &VisionServiceState,
    data_state: &DataServiceState,
    calibration: &VisionCalibration,
) -> VisionEnemyItemsResult {
    let templates = vision_state.ensure_item_templates(data_state);
    if templates.is_empty() {
        return VisionEnemyItemsResult {
            ok: false,
            not_found: false,
            error_code: Some("EMPTY_ITEM_CACHE".to_string()),
            error: Some("Local item icon cache is empty.".to_string()),
            source: None,
            is_simulated: false,
            screen_resolution: None,
            auto_hidden: None,
            detected_items: Vec::new(),
            detected_trigger_keys: Vec::new(),
        };
    }

    let (screen, auto_hidden) = match capture_primary_screen(app, "bottom", false) {
        Ok(res) => res,
        Err((code, msg)) => {
            return VisionEnemyItemsResult {
                ok: false,
                not_found: false,
                error_code: Some(code.to_string()),
                error: Some(msg),
                source: None,
                is_simulated: false,
                screen_resolution: None,
                auto_hidden: None,
                detected_items: Vec::new(),
                detected_trigger_keys: Vec::new(),
            };
        }
    };

    scan_enemy_inventory_from_image(&screen, &templates, calibration, Some(auto_hidden))
}

fn draw_rect_outline(img: &mut RgbaImage, rect: (u32, u32, u32, u32), rgba: Rgba<u8>) {
    let (width, height) = img.dimensions();
    let (rx, ry, rw, rh) = rect;
    for t in 0..3u32 {
        let x0 = rx + t;
        let y0 = ry + t;
        let x1 = (rx + rw).saturating_sub(1 + t);
        let y1 = (ry + rh).saturating_sub(1 + t);
        if x1 < x0 || y1 < y0 {
            continue;
        }
        for x in x0..=x1 {
            if x < width && y0 < height {
                img.put_pixel(x, y0, rgba);
            }
            if x < width && y1 < height {
                img.put_pixel(x, y1, rgba);
            }
        }
        for y in y0..=y1 {
            if x0 < width && y < height {
                img.put_pixel(x0, y, rgba);
            }
            if x1 < width && y < height {
                img.put_pixel(x1, y, rgba);
            }
        }
    }
}

pub fn capture_calibration_preview(
    app: &AppHandle,
    calibration: &VisionCalibration,
    gsi_game_state: Option<&str>,
) -> CalibrationPreviewResult {
    let (screen, _) = match capture_primary_screen(app, "all", true) {
        Ok(res) => res,
        Err((code, msg)) => {
            return CalibrationPreviewResult {
                ok: false,
                error_code: Some(code.to_string()),
                error: Some(msg),
                screen_resolution: None,
                active_profile: None,
                preview_data_url: None,
            };
        }
    };

    let (width, height) = screen.dimensions();
    let mut rgba = screen.to_rgba8();
    let profile = resolve_draft_profile(calibration, gsi_game_state);
    let ally_slots = if profile == "draft" {
        draft_pick_ally_slots()
    } else {
        top_bar_ally_slots()
    };
    let enemy_slots = if profile == "draft" {
        draft_pick_enemy_slots()
    } else {
        top_bar_enemy_slots()
    };

    for r in ally_slots {
        draw_rect_outline(
            &mut rgba,
            scale_hud_rect(r, width, height, calibration),
            Rgba([40, 220, 120, 255]),
        );
    }
    for r in enemy_slots {
        draw_rect_outline(
            &mut rgba,
            scale_hud_rect(r, width, height, calibration),
            Rgba([255, 75, 75, 255]),
        );
    }
    for (_, r) in ENEMY_INVENTORY_SLOTS {
        draw_rect_outline(
            &mut rgba,
            scale_hud_rect(r, width, height, calibration),
            Rgba([225, 90, 205, 255]),
        );
    }

    let target_h = ((360.0 * (height as f64) / (width as f64)).round() as u32).max(120);
    let preview = DynamicImage::ImageRgba8(rgba).resize_exact(360, target_h, FilterType::Triangle);
    let mut png_bytes = Vec::new();
    if let Err(e) = preview.write_to(&mut Cursor::new(&mut png_bytes), ImageFormat::Png) {
        return CalibrationPreviewResult {
            ok: false,
            error_code: Some("PNG_ENCODE_ERROR".to_string()),
            error: Some(e.to_string()),
            screen_resolution: Some(format!("{width}x{height}")),
            active_profile: None,
            preview_data_url: None,
        };
    }

    CalibrationPreviewResult {
        ok: true,
        error_code: None,
        error: None,
        screen_resolution: Some(format!("{width}x{height}")),
        active_profile: Some(if profile == "draft" { "draft" } else { "ingame" }.to_string()),
        preview_data_url: Some(format!(
            "data:image/png;base64,{}",
            BASE64_STD.encode(&png_bytes)
        )),
    }
}

pub fn simulate_draft_scan(data_state: &DataServiceState) -> VisionDraftResult {
    let Ok(guard) = data_state.indexed.lock() else {
        return VisionDraftResult {
            ok: false,
            not_found: false,
            error_code: Some("LOCK_ERROR".into()),
            error: Some("Mutex error".into()),
            source: None,
            is_simulated: true,
            profile_used: None,
            screen_resolution: None,
            auto_hidden: None,
            allies_slots: Vec::new(),
            enemies_slots: Vec::new(),
            allies: Vec::new(),
            enemies: Vec::new(),
        };
    };

    let find_by_key = |k: &str| -> Option<VisionHeroBrief> {
        guard.heroes_by_id.values().find(|h| h.key == k).map(|h| VisionHeroBrief {
            id: h.id,
            key: h.key.clone(),
            name_en: h.name_en.clone(),
            icon: if h.has_local_icon {
                h.local_icon_path.clone()
            } else {
                h.remote_icon.clone()
            },
            img: if h.has_local_portrait {
                h.local_portrait_path.clone()
            } else {
                h.remote_img.clone()
            },
            local_icon_path: if h.has_local_icon {
                h.local_icon_path.clone()
            } else {
                String::new()
            },
            local_portrait_path: if h.has_local_portrait {
                h.local_portrait_path.clone()
            } else {
                String::new()
            },
        })
    };

    let allies: Vec<VisionHeroBrief> = ["abyssal_underlord", "crystal_maiden", "lion", "tiny"]
        .iter()
        .filter_map(|k| find_by_key(k))
        .collect();
    let enemies: Vec<VisionHeroBrief> =
        ["phantom_assassin", "bristleback", "phantom_lancer", "riki", "zuus"]
            .iter()
            .filter_map(|k| find_by_key(k))
            .collect();

    VisionDraftResult {
        ok: true,
        not_found: false,
        error_code: None,
        error: None,
        source: Some("simulation".to_string()),
        is_simulated: true,
        profile_used: None,
        screen_resolution: None,
        auto_hidden: None,
        allies_slots: Vec::new(),
        enemies_slots: Vec::new(),
        allies,
        enemies,
    }
}

pub fn simulate_enemy_inventory_scan(data_state: &DataServiceState) -> VisionEnemyItemsResult {
    let item = data_state
        .indexed
        .lock()
        .ok()
        .and_then(|g| g.items_by_key.get("butterfly").cloned());

    let detected = match item {
        Some(b) => VisionDetectedItem {
            slot: 0,
            key: b.key,
            name_en: b.name_en,
            img: if b.has_local_img {
                b.local_img_path.clone()
            } else {
                b.remote_img
            },
            local_img_path: if b.has_local_img {
                b.local_img_path
            } else {
                String::new()
            },
            is_trigger: true,
            correlation: None,
            confidence: 99,
        },
        None => VisionDetectedItem {
            slot: 0,
            key: "butterfly".to_string(),
            name_en: "Butterfly".to_string(),
            img: String::new(),
            local_img_path: String::new(),
            is_trigger: true,
            correlation: None,
            confidence: 99,
        },
    };

    VisionEnemyItemsResult {
        ok: true,
        not_found: false,
        error_code: None,
        error: None,
        source: Some("simulation".to_string()),
        is_simulated: true,
        screen_resolution: None,
        auto_hidden: None,
        detected_items: vec![detected],
        detected_trigger_keys: vec!["butterfly".to_string()],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::imageops;

    fn make_patterned_sprite(w: u32, h: u32, r_mul: u32, g_mul: u32, b_mul: u32) -> DynamicImage {
        let mut img = RgbaImage::new(w, h);
        for (x, y, px) in img.enumerate_pixels_mut() {
            let nx = (x * 255) / w.max(1);
            let ny = (y * 255) / h.max(1);
            let r = if r_mul % 2 == 0 { nx } else { 255 - nx };
            let g = if g_mul % 2 == 0 { ny } else { 255 - ny };
            let b = (((x + y) * 255) / (w + h).max(1)) ^ ((b_mul * 40) % 255);
            *px = Rgba([r as u8, g as u8, b as u8, 255]);
        }
        DynamicImage::ImageRgba8(img)
    }

    #[test]
    fn matches_hero_draft_and_enemy_inventory_from_1080p_canvas() {
        let pa_sprite = make_patterned_sprite(60, 34, 3, 1, 2);
        let bb_sprite = make_patterned_sprite(60, 34, 1, 3, 2);
        let bkb_sprite = make_patterned_sprite(60, 43, 2, 2, 1);

        let hero_templates = vec![
            HeroTemplate {
                hero: VisionHeroBrief {
                    id: 44,
                    key: "phantom_assassin".into(),
                    name_en: "Phantom Assassin".into(),
                    icon: String::new(),
                    img: String::new(),
                    local_icon_path: String::new(),
                    local_portrait_path: String::new(),
                },
                sig: compute_signature(&pa_sprite),
            },
            HeroTemplate {
                hero: VisionHeroBrief {
                    id: 99,
                    key: "bristleback".into(),
                    name_en: "Bristleback".into(),
                    icon: String::new(),
                    img: String::new(),
                    local_icon_path: String::new(),
                    local_portrait_path: String::new(),
                },
                sig: compute_signature(&bb_sprite),
            },
        ];

        let item_templates = vec![ItemTemplate {
            key: "black_king_bar".into(),
            name_en: "Black King Bar".into(),
            img: String::new(),
            local_img_path: String::new(),
            is_trigger: true,
            sig: compute_signature(&bkb_sprite),
        }];

        let mut canvas = RgbaImage::from_pixel(1920, 1080, Rgba([10, 10, 10, 255]));
        let ally0 = top_bar_ally_slots()[0];
        let enemy0 = top_bar_enemy_slots()[0];
        let inv_slot0 = ENEMY_INVENTORY_SLOTS[0].1;

        imageops::overlay(&mut canvas, &pa_sprite.to_rgba8(), ally0.x as i64, ally0.y as i64);
        imageops::overlay(&mut canvas, &bb_sprite.to_rgba8(), enemy0.x as i64, enemy0.y as i64);
        imageops::overlay(&mut canvas, &bkb_sprite.to_rgba8(), inv_slot0.x as i64, inv_slot0.y as i64);

        let dyn_canvas = DynamicImage::ImageRgba8(canvas);
        let cal = VisionCalibration::default();

        let draft_res = scan_draft_from_image(&dyn_canvas, &hero_templates, &cal, None, Some(false));
        assert!(draft_res.ok);
        assert_eq!(draft_res.allies.len(), 1);
        assert_eq!(draft_res.allies[0].key, "phantom_assassin");
        assert_eq!(draft_res.enemies.len(), 1);
        assert_eq!(draft_res.enemies[0].key, "bristleback");

        let items_res = scan_enemy_inventory_from_image(&dyn_canvas, &item_templates, &cal, Some(false));
        assert!(items_res.ok);
        assert_eq!(items_res.detected_trigger_keys, vec!["black_king_bar"]);
    }
}
