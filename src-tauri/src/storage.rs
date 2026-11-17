use flate2::read::GzDecoder;
use serde_json::Value;
use std::{
    fs,
    io::Read,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

const EMBED_COUNTERS_GZ: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/seed/counters.json.gz"));
const EMBED_HEROES_GZ: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/seed/heroes.json.gz"));
const EMBED_ITEMS_GZ: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/seed/items.json.gz"));
const EMBED_ABILITIES_GZ: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/seed/abilities.json.gz"));
const EMBED_PATCHES_GZ: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/seed/patches.json.gz"));
const EMBED_META_GZ: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/seed/meta.json.gz"));

#[derive(Debug, Clone)]
pub struct StoragePaths {
    pub user_data_root: PathBuf,
    pub bundled_data_dir: Option<PathBuf>,
}

impl StoragePaths {
    pub fn init(app: &AppHandle) -> Self {
        let user_data_root = resolve_user_data_root(app);
        let bundled_data_dir = resolve_bundled_data_dir(app);
        let storage = Self {
            user_data_root,
            bundled_data_dir,
        };
        let _ = storage.ensure_base_dirs();
        storage.seed_initial_data();
        storage
    }

    pub fn writable_data_dir(&self) -> PathBuf {
        self.user_data_root.join("Data")
    }

    pub fn cache_dir(&self) -> PathBuf {
        self.writable_data_dir().join("cache")
    }

    pub fn hero_icons_dir(&self) -> PathBuf {
        self.cache_dir().join("icons").join("heroes")
    }

    pub fn item_icons_dir(&self) -> PathBuf {
        self.cache_dir().join("icons").join("items")
    }

    pub fn settings_file_path(&self) -> PathBuf {
        self.writable_data_dir().join("settings.json")
    }

    pub fn cfg_fallback_dir(&self) -> PathBuf {
        self.user_data_root.clone()
    }

    pub fn data_file(&self, name: &str) -> PathBuf {
        self.writable_data_dir().join(name)
    }

    pub fn cache_file(&self, name: &str) -> PathBuf {
        self.cache_dir().join(name)
    }

    pub fn ensure_base_dirs(&self) -> std::io::Result<()> {
        fs::create_dir_all(self.writable_data_dir())?;
        fs::create_dir_all(self.cache_dir())?;
        fs::create_dir_all(self.hero_icons_dir())?;
        fs::create_dir_all(self.item_icons_dir())?;
        Ok(())
    }

    pub fn seed_initial_data(&self) {
        for name in [
            "counters.json",
            "heroes.json",
            "items.json",
            "abilities.json",
            "patches.json",
            "meta.json",
        ] {
            let _ = self.ensure_seeded_data_file(name);
        }
        // settings.json: копіюємо з bundled лише якщо в userData ще не створено
        let target_settings = self.settings_file_path();
        if !target_settings.exists() {
            if let Some(bundled) = &self.bundled_data_dir {
                let src = bundled.join("settings.json");
                if src.exists() {
                    let _ = fs::copy(src, &target_settings);
                }
            }
        }
    }

    pub fn load_bundled_or_embedded_bytes(&self, relative_name: &str) -> Option<Vec<u8>> {
        if let Some(bundled) = &self.bundled_data_dir {
            let src = bundled.join(relative_name);
            if src.exists() {
                if let Ok(bytes) = fs::read(&src) {
                    if !bytes.is_empty() {
                        return Some(bytes);
                    }
                }
            }
        }
        decompress_embedded_seed(relative_name)
    }

    pub fn ensure_seeded_data_file(&self, relative_name: &str) -> PathBuf {
        let target_file = self.writable_data_dir().join(relative_name);
        if let Some(parent) = target_file.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if target_file.exists() {
            if relative_name == "counters.json" {
                if let Some(seed_bytes) = self.load_bundled_or_embedded_bytes(relative_name) {
                    if should_refresh_counters(&seed_bytes, &target_file) {
                        let _ = fs::write(&target_file, seed_bytes);
                    }
                }
            }
            return target_file;
        }

        if let Some(seed_bytes) = self.load_bundled_or_embedded_bytes(relative_name) {
            if fs::write(&target_file, &seed_bytes).is_ok() {
                return target_file;
            }
        }
        target_file
    }

    pub fn read_data_string(&self, relative_name: &str) -> Option<String> {
        let target = self.ensure_seeded_data_file(relative_name);
        if let Ok(s) = fs::read_to_string(&target) {
            return Some(s);
        }
        let seed_bytes = self.load_bundled_or_embedded_bytes(relative_name)?;
        String::from_utf8(seed_bytes).ok()
    }

    pub fn read_data_json(&self, relative_name: &str) -> Option<Value> {
        let raw = self.read_data_string(relative_name)?;
        serde_json::from_str(&raw).ok()
    }

    pub fn read_cache_string(&self, relative_name: &str) -> Option<String> {
        let writable = self.cache_file(relative_name);
        if writable.exists() {
            if let Ok(s) = fs::read_to_string(&writable) {
                return Some(s);
            }
        }
        if let Some(bundled) = &self.bundled_data_dir {
            let bundled_cache = bundled.join("cache").join(relative_name);
            if bundled_cache.exists() {
                if let Ok(s) = fs::read_to_string(&bundled_cache) {
                    return Some(s);
                }
            }
        }
        None
    }

    pub fn read_cache_json(&self, relative_name: &str) -> Option<Value> {
        let raw = self.read_cache_string(relative_name)?;
        serde_json::from_str(&raw).ok()
    }

    pub fn write_data_string(&self, relative_name: &str, content: &str) -> Result<(), String> {
        let target = self.writable_data_dir().join(relative_name);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&target, content).map_err(|e| e.to_string())
    }

    pub fn write_json_pretty(&self, target: &Path, val: &Value) -> Result<(), String> {
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let formatted = serde_json::to_string_pretty(val).map_err(|e| e.to_string())?;
        fs::write(target, formatted).map_err(|e| e.to_string())
    }
}

fn decompress_embedded_seed(name: &str) -> Option<Vec<u8>> {
    let gz: &[u8] = match name {
        "counters.json" => EMBED_COUNTERS_GZ,
        "heroes.json" => EMBED_HEROES_GZ,
        "items.json" => EMBED_ITEMS_GZ,
        "abilities.json" => EMBED_ABILITIES_GZ,
        "patches.json" => EMBED_PATCHES_GZ,
        "meta.json" => EMBED_META_GZ,
        _ => return None,
    };
    let mut decoder = GzDecoder::new(gz);
    let mut out = Vec::new();
    decoder.read_to_end(&mut out).ok()?;
    Some(out)
}

fn should_refresh_counters(seed_bytes: &[u8], target_file: &Path) -> bool {
    let Ok(seed_json) = serde_json::from_slice::<Value>(seed_bytes) else {
        return false;
    };
    let Ok(target_raw) = fs::read_to_string(target_file) else {
        return true;
    };
    let Ok(target_json) = serde_json::from_str::<Value>(&target_raw) else {
        return true;
    };

    if let Some(seed_schema) = seed_json.get("schema_version").and_then(|v| v.as_str()) {
        let target_schema = target_json
            .get("schema_version")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        if seed_schema != target_schema {
            return true;
        }
    }

    if seed_json
        .get("supported_languages")
        .and_then(|v| v.as_array())
        .is_some()
        && target_json
            .get("supported_languages")
            .and_then(|v| v.as_array())
            .is_none()
    {
        return true;
    }

    let seed_ts = seed_json
        .get("generated_at_utc")
        .and_then(|v| v.as_str())
        .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.timestamp_millis());
    let target_ts = target_json
        .get("generated_at_utc")
        .and_then(|v| v.as_str())
        .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.timestamp_millis());
    let same_patch = seed_json.get("patch_target") == target_json.get("patch_target");

    if let (Some(st), Some(tt)) = (seed_ts, target_ts) {
        if st > tt && same_patch {
            return true;
        }
    }

    false
}

fn parse_cli_user_data_dir() -> Option<PathBuf> {
    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        if let Some(rest) = arg.strip_prefix("--user-data-dir=") {
            let trimmed = rest.trim().trim_matches('"');
            if !trimmed.is_empty() {
                return Some(PathBuf::from(trimmed));
            }
        } else if arg == "--user-data-dir" {
            if let Some(next) = args.next() {
                let trimmed = next.trim().trim_matches('"');
                if !trimmed.is_empty() {
                    return Some(PathBuf::from(trimmed));
                }
            }
        }
    }
    None
}

fn resolve_user_data_root(app: &AppHandle) -> PathBuf {
    if let Some(custom) = parse_cli_user_data_dir() {
        return custom;
    }
    if let Ok(app_data) = app.path().app_data_dir() {
        return app_data;
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

fn resolve_bundled_data_dir(app: &AppHandle) -> Option<PathBuf> {
    if cfg!(debug_assertions) {
        let dev_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("Data");
        if dev_dir.exists() {
            return Some(dev_dir);
        }
    }
    if let Ok(res_dir) = app.path().resource_dir() {
        let candidate = res_dir.join("Data");
        if candidate.exists() {
            return Some(candidate);
        }
    }
    None
}
