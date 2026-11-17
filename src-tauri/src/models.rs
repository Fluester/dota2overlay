use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowBounds {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisionCalibration {
    #[serde(default = "default_cal_mode")]
    pub mode: String,
    #[serde(default)]
    pub offset_x: i32,
    #[serde(default)]
    pub offset_y: i32,
    #[serde(default = "default_cal_scale")]
    pub scale: f64,
}

fn default_cal_mode() -> String {
    "auto".to_string()
}

fn default_cal_scale() -> f64 {
    1.0
}

impl Default for VisionCalibration {
    fn default() -> Self {
        Self {
            mode: "auto".to_string(),
            offset_x: 0,
            offset_y: 0,
            scale: 1.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default = "default_lang")]
    pub language: String,
    #[serde(default)]
    pub window_bounds: Option<WindowBounds>,
    #[serde(default = "default_opacity")]
    pub opacity: f64,
    #[serde(default)]
    pub click_through: bool,
    #[serde(default)]
    pub mini_mode: bool,
    #[serde(default)]
    pub allies_expanded: bool,
    #[serde(default = "default_match_phase")]
    pub match_phase: String,
    #[serde(default)]
    pub vision_calibration: VisionCalibration,
}

fn default_lang() -> String {
    "uk".to_string()
}

fn default_opacity() -> f64 {
    0.96
}

fn default_match_phase() -> String {
    "auto".to_string()
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: "uk".to_string(),
            window_bounds: None,
            opacity: 0.96,
            click_through: false,
            mini_mode: false,
            allies_expanded: false,
            match_phase: "auto".to_string(),
            vision_calibration: VisionCalibration::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SettingsPatch {
    pub language: Option<String>,
    pub window_bounds: Option<Option<WindowBounds>>,
    pub opacity: Option<f64>,
    pub click_through: Option<bool>,
    pub mini_mode: Option<bool>,
    pub allies_expanded: Option<bool>,
    pub match_phase: Option<String>,
    pub vision_calibration: Option<VisionCalibrationPatch>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VisionCalibrationPatch {
    pub mode: Option<String>,
    pub offset_x: Option<f64>,
    pub offset_y: Option<f64>,
    pub scale: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerStatus {
    pub listening: bool,
    pub host: String,
    pub port: u16,
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CfgStatus {
    pub active: bool,
    pub dota_found: bool,
    pub saved_to_project_root: bool,
    pub port: u16,
    pub cfg_filename: String,
    pub cfg_path: String,
    pub target_folder_hint: String,
    pub message_uk: String,
    pub message_ru: String,
    pub message_en: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GsiHeroInfo {
    pub id: u32,
    pub key: String,
    #[serde(rename = "name_en")]
    pub name_en: String,
    pub icon: String,
    pub img: String,
    pub level: Option<u32>,
    pub aghanims_scepter: bool,
    pub aghanims_shard: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GsiOwnedItemDetail {
    pub key: String,
    pub name_en: String,
    pub img: String,
    #[serde(default, skip_serializing_if = "is_false")]
    pub consumed: bool,
}

fn is_false(b: &bool) -> bool {
    !*b
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GsiState {
    pub received_at_utc: String,
    pub is_simulated: bool,
    pub match_id: Option<String>,
    pub game_state: Option<String>,
    pub clock_time: Option<i64>,
    pub is_new_match: bool,
    pub reset_reason: Option<String>,
    pub has_aghanims_scepter: bool,
    pub has_aghanims_shard: bool,
    pub hero: Option<GsiHeroInfo>,
    pub owned_item_keys: Vec<String>,
    pub owned_items_details: Vec<GsiOwnedItemDetail>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GsiStatus {
    pub server: ServerStatus,
    pub cfg: Option<CfgStatus>,
    pub standalone_debug: bool,
    pub last_gsi_state: Option<GsiState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GsiSimulateResponse {
    pub ok: bool,
    pub via_http: bool,
    pub gsi_state: Option<GsiState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchStatus {
    pub local_patch: Option<String>,
    pub remote_patch: Option<String>,
    pub open_dota_major_patch: Option<String>,
    pub has_update: bool,
    pub updating: bool,
    pub checked_at_utc: Option<String>,
    pub offline: bool,
    pub error: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CountersSummary {
    pub patch_target: Option<String>,
    pub heroes_count: usize,
    pub item_rules_count: usize,
    pub threat_tags_count: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
    pub version: String,
    pub is_packaged: bool,
    pub hotkey: String,
    pub hotkey_registered: bool,
    pub has_local_heroes: bool,
    pub has_local_items: bool,
    pub counters: Option<CountersSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisionHeroBrief {
    pub id: u32,
    pub key: String,
    pub name_en: String,
    pub icon: String,
    pub img: String,
    #[serde(default)]
    pub local_icon_path: String,
    #[serde(default)]
    pub local_portrait_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisionDraftSlotResult {
    pub slot: usize,
    pub hero: Option<VisionHeroBrief>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub distance: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub correlation: Option<i64>,
    pub confidence: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisionDraftResult {
    pub ok: bool,
    #[serde(default)]
    pub not_found: bool,
    pub error_code: Option<String>,
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(default)]
    pub is_simulated: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub profile_used: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub screen_resolution: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_hidden: Option<bool>,
    #[serde(default)]
    pub allies_slots: Vec<VisionDraftSlotResult>,
    #[serde(default)]
    pub enemies_slots: Vec<VisionDraftSlotResult>,
    #[serde(default)]
    pub allies: Vec<VisionHeroBrief>,
    #[serde(default)]
    pub enemies: Vec<VisionHeroBrief>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisionDetectedItem {
    pub slot: usize,
    pub key: String,
    #[serde(rename = "name_en")]
    pub name_en: String,
    pub img: String,
    #[serde(default)]
    pub local_img_path: String,
    pub is_trigger: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub correlation: Option<i64>,
    pub confidence: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisionEnemyItemsResult {
    pub ok: bool,
    #[serde(default)]
    pub not_found: bool,
    pub error_code: Option<String>,
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(default)]
    pub is_simulated: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub screen_resolution: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_hidden: Option<bool>,
    #[serde(default)]
    pub detected_items: Vec<VisionDetectedItem>,
    #[serde(default)]
    pub detected_trigger_keys: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalibrationPreviewResult {
    pub ok: bool,
    pub error_code: Option<String>,
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub screen_resolution: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_profile: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preview_data_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedHeroEntry {
    pub id: u32,
    pub key: String,
    pub npc_name: String,
    pub name_en: String,
    pub remote_img: String,
    pub remote_icon: String,
    pub local_portrait_path: String,
    pub local_icon_path: String,
    pub has_local_portrait: bool,
    pub has_local_icon: bool,
    pub is_curated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedItemEntry {
    pub id: u32,
    pub key: String,
    pub name_en: String,
    pub cost: i64,
    pub is_neutral: bool,
    pub is_enchantment: bool,
    pub remote_img: String,
    pub local_img_path: String,
    pub has_local_img: bool,
    pub is_priority_rule: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncMeta {
    #[serde(rename = "lastSyncUtc")]
    pub last_sync_utc: Option<String>,
    pub source: Option<String>,
    #[serde(rename = "odHeroesCached")]
    pub od_heroes_cached: usize,
    #[serde(rename = "odItemsCached")]
    pub od_items_cached: usize,
    #[serde(rename = "lastDownloadedIcons")]
    pub last_downloaded_icons: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CachedIconMapPayload {
    pub hero_portraits: HashMap<u32, String>,
    pub hero_icons: HashMap<u32, String>,
    pub item_imgs: HashMap<String, String>,
}
