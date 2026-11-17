# Dota 2 Counter Overlay

Compact always-on-top desktop overlay for **Dota 2** powered by **Tauri v2** (Rust backend + system **WebView2**, no bundled Chromium) providing real-time counter-item recommendations, draft counter-picks, role-aware build adaptation (`Pos 1–5`), ally aura/damage synergy, Game State Integration (`GSI`), HUD screen recognition, and live OpenDota API + Valve Datafeed patch synchronization.

**Languages / Мови / Языки:** Українська (`UA`) · Русский (`RU`) · English (`EN`)

---

## Download & Run (Windows x64 — System WebView2)

> **[Download Latest Release (GitHub Releases)](https://github.com/Fluester/dota2overlay/releases/latest)**

1. **Standalone Portable EXE (`Dota2CounterOverlay-0.1.0-portable-x64.exe`, ~6.05 MB — Recommended):**
   - Lightweight native Rust executable using Windows' built-in Microsoft Edge WebView2 (no bundled Chromium, no `%TEMP%` self-extraction).
   - Seed `Data/*.json` files are embedded directly inside the binary and unpacked to `%APPDATA%\com.dota2overlay.app\Data\` on first launch.
2. **Windows Installer (`Dota2CounterOverlay-0.1.0-setup-x64.exe`, ~4.81 MB):**
   - Standard NSIS installer (`asInvoker`) with WebView2 bootstrapper fallback if needed.
   - If Windows SmartScreen shows a blue warning on first launch (unsigned build): click **More info** (*Детальніше / Подробнее*) -> **Run anyway** (*Виконати в будь-якому разі / Выполнить в любом случае*).

---

## Key Features

- **Full Knowledge Base (Patch `7.41f`)**:
  - Covers all **127 heroes** across **4 mechanic categories**:
    - **Innate abilities** (including `Hidden` / `Not Learnable`)
    - **Active abilities & Ultimate** (including `Aghanim's Scepter` & `Aghanim's Shard` upgrades, damage types, debuff immunity piercing, dispels)
    - **Passive abilities** with verified `Break` (`Silver Edge`) eligibility (`breakable` vs unbreakable)
    - **Talents (10 / 15 / 20 / 25)** with late-game (`30+ min`) threat spikes
  - **51 curated & auto-parsed shop counter-item rules**, **16 enemy item triggers**, and **30 neutral item rules (Tier 1–4)** verified against the current item pool.
- **Position-Aware Analysis (`Auto | 1 | 2 | 3 | 4 | 5`)**:
  - Compact clickable position badges directly on all **5 enemy** and **4 ally** hero slots.
  - Reduces weight of expensive anti-carry items (`MKB`, `Silver Edge`, `Skadi`, `Halberd`, etc.) when core heroes are played as supports (`Pos 4/5`).
  - Evaluates allied aura carriers (`Pipe`, `Crimson Guard`, `Guardian Greaves`, `Vladmir's`, `Assault Cuirass`) and physical/magic core composition by position.
  - **Flex-pick support adaptation**: hides standard carry farm slots and surfaces support/utility items when playing a core hero on `Pos 4/5`.
- **Native Rust Dota 2 GSI Server (`127.0.0.1:3000`)**:
  - Automatically detects your Steam library (`HKCU\Software\Valve\Steam\SteamPath` + `libraryfolders.vdf`) & `dota 2 beta/game/dota/cfg/gamestate_integration/` directory and writes `gamestate_integration_overlay.cfg` (or falls back cleanly to `userData`).
  - Tracks your hero, owned & consumed Scepter/Shard items, match clock (`Early / Mid / Late`), resets draft slots on new matches, and pushes live updates to the overlay via Tauri events.
- **Native Rust Vision HUD Recognition (`xcap` + `image`)**:
  - Recognizes top-bar allied and enemy heroes (both match & draft pick screen profiles) and selected enemy inventory items with auto-hide capture and visual HUD calibration controls (`X`, `Y`, `Scale`, preview overlay).
- **Trilingual UI & Recommendation Engine (`UA | RU | EN`)**:
  - Instant header & system tray language switching persisted in `settings.json` inside `userData`.
  - Localized item explanations, priority badges, timing hints, neutral item descriptions, statuses, and error messages with no app restart required.
- **One-Click Database Update & Rule Re-Analysis**:
  - Rust backend fetches fresh `patch`, `heroes`, `items`, `abilities`, and icons from OpenDota API & Valve Datafeed and re-runs the 4-category rule analyzer in writable `userData/Data/` with no restart required.

---

## Global Hotkeys

| Hotkey | Action |
| :--- | :--- |
| `Alt+Q` | Show / hide overlay window |
| `Alt+Shift+Q` | Bring overlay to front (Always on Top) |
| `Alt+X` | Toggle Click-Through mode (`35%` opacity) |
| `Alt+S` | Scan hero draft from top HUD (`Vision`) |
| `Alt+E` | Scan selected enemy inventory (`Vision`) |

---

## Project Structure

```text
dota2overlay/
├── package.json                     # Tauri CLI scripts & rule build tooling
├── Data/                            # Seed data JSONs (embedded in Rust binary & userData)
│   ├── heroes.json
│   ├── items.json
│   ├── abilities.json
│   ├── patches.json
│   ├── counters.json
│   └── meta.json
├── scripts/
│   ├── buildCounters.js             # CLI generator for Data/counters.json & rule validation
│   └── syncFrontendEngine.js        # Syncs analyzer/rule generator UMD scripts to wwwroot
├── src/
│   ├── engine/
│   │   └── analyzer.js              # Counter-item scoring, position weights, ally synergy, i18n
│   └── services/
│       ├── storagePaths.js          # CLI Data path helper for buildCounters.js
│       ├── rulePresets.js           # Verified 127-hero, item, neutral & Break rules (UA/RU/EN)
│       └── ruleGeneratorService.js  # 4-category mechanic parser & rule regenerator
├── src-tauri/                       # Tauri v2 Rust backend
│   ├── Cargo.toml
│   ├── build.rs                     # Compresses Data/*.json seeds for single-file portability
│   ├── tauri.conf.json              # Frameless, transparent, always-on-top window & bundle config
│   ├── capabilities/default.json
│   └── src/
│       ├── main.rs
│       ├── lib.rs                   # Tauri setup, single-instance lock, hotkeys, IPC commands
│       ├── models.rs                # Shared serialized data structures
│       ├── storage.rs               # userData resolution & Data/*.json seed initialization
│       ├── settings.rs              # Settings sanitization & multi-monitor safe bounds
│       ├── gsi.rs                   # HTTP server (127.0.0.1:3000), Steam detection, .cfg writer
│       ├── data_sync.rs             # OpenDota/Valve sync & concurrent icon cache downloader
│       ├── vision.rs                # Native screen capture (xcap) & HUD icon template matching
│       ├── window_ctrl.rs           # HWND_TOPMOST, click-through, mini-mode & resize logic
│       └── tray.rs                  # Localized UA/RU/EN system tray icon & context menu
└── wwwroot/                         # Renderer UI (Bootstrap 5 + Bootstrap Icons + CSS/JS)
    ├── index.html
    ├── css/overlay.css
    ├── js/tauriBridge.js            # Tauri v2 IPC/events bridge preserving window.overlayApi
    ├── js/app.js
    └── assets/tray-icon.png
```

---

## Development & Build

### Prerequisites (Source Build Only)
- [Rust toolchain](https://rustup.rs/) (`rustc >= 1.90`, `cargo`)
- Microsoft Visual Studio C++ Build Tools & Windows SDK
- Microsoft Edge WebView2 Runtime (pre-installed on Windows 10/11)
- Node.js `>= 20.0.0` (for `@tauri-apps/cli` and `scripts/buildCounters.js`)

### Install & Run

```bash
npm install
npm start        # Sync engine scripts & launch Tauri dev window
npm run dev      # Alias for npm start
```

### Regenerate Knowledge Base (`Data/counters.json`)

```bash
npm run build:counters
```

### Build Release `.exe` & Installer

```bash
npm run build
```

Output artifacts:
- `src-tauri/target/release/dota2overlay.exe` *(standalone lightweight `.exe`)*
- `src-tauri/target/release/bundle/nsis/Dota 2 Counter Overlay_0.1.0_x64-setup.exe` *(NSIS setup installer)*

---

## Українською (Коротко)

Компактний оверлей для **Dota 2** на базі **Tauri v2** (бекенд на Rust + системний **WebView2**, без вбудованого Chromium), що забезпечує:
- Легкий `.exe` (~6 MB) поверх гри (`Always on Top`, без рамок, прозорість, режим «клік крізь вікно» `Alt+X`, системний трей **UA / RU / EN**).
- Підбір контр-предметів і контрпіків під **усі 127 героїв** (патч `7.41f`) з урахуванням вроджених здібностей (**Innate**), активних скілів + **Scepter/Shard**, пасивок під **Break** (`Silver Edge`) та талантів **10–25 рівнів**.
- Нативний Rust HTTP-сервер **Dota 2 GSI** (`127.0.0.1:3000`), автопошук Steam/`gamestate_integration_overlay.cfg`, **Vision-сканування** екрана (`Alt+S`, `Alt+E`) і фонове оновлення з OpenDota API.

## На русском (Кратко)

Компактный оверлей для **Dota 2** на базе **Tauri v2** (бэкенд на Rust + системный **WebView2**, без встроенного Chromium):
- Легкий `.exe` (~6 MB) поверх игры (`Always on Top`, без рамок, прозрачность, режим «клик сквозь окно» `Alt+X`, системный трей **UA / RU / EN**).
- Подбор контр-предметов и контрпиков под **всех 127 героев** (патч `7.41f`) с учетом врожденных способностей (**Innate**), активных скиллов + **Scepter/Shard**, пассивок под **Break** (`Silver Edge`) и талантов **10–25 уровней**.
- Нативный Rust HTTP-сервер **Dota 2 GSI** (`127.0.0.1:3000`), автопоиск Steam/`gamestate_integration_overlay.cfg`, **Vision-сканирование** экрана (`Alt+S`, `Alt+E`) и фоновое обновление через OpenDota API.
