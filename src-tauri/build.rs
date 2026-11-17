use flate2::{write::GzEncoder, Compression};
use std::{
    env,
    fs::{self, File},
    io::Write,
    path::PathBuf,
};

fn compress_seed_json(data_dir: &PathBuf, out_seed_dir: &PathBuf, file_name: &str) {
    let src = data_dir.join(file_name);
    println!("cargo:rerun-if-changed={}", src.display());
    let raw = fs::read(&src).unwrap_or_else(|e| {
        panic!("Failed to read seed JSON {}: {}", src.display(), e);
    });
    let dest = out_seed_dir.join(format!("{file_name}.gz"));
    let out_file = File::create(&dest).unwrap_or_else(|e| {
        panic!("Failed to create compressed seed {}: {}", dest.display(), e);
    });
    let mut encoder = GzEncoder::new(out_file, Compression::best());
    encoder.write_all(&raw).unwrap();
    encoder.finish().unwrap();
}

fn main() {
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
    let data_dir = manifest_dir.join("..").join("Data");
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let out_seed_dir = out_dir.join("seed");
    fs::create_dir_all(&out_seed_dir).unwrap();

    for name in [
        "counters.json",
        "heroes.json",
        "items.json",
        "abilities.json",
        "patches.json",
        "meta.json",
    ] {
        compress_seed_json(&data_dir, &out_seed_dir, name);
    }

    tauri_build::build()
}
