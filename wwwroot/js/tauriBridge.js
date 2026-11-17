(function () {
  const tauri = window.__TAURI__ || {};
  const core = tauri.core || {};
  const eventApi = tauri.event || {};
  const windowApi = tauri.window || {};

  const invoke = core.invoke ? core.invoke.bind(core) : async () => null;
  const convertFileSrc = core.convertFileSrc ? core.convertFileSrc.bind(core) : (p) => p;
  const listen = eventApi.listen ? eventApi.listen.bind(eventApi) : async () => () => {};
  const getCurrentWindow = windowApi.getCurrentWindow ? windowApi.getCurrentWindow.bind(windowApi) : () => null;

  const STEAM_CDN_BASE = 'https://cdn.cloudflare.steamstatic.com';
  const HERO_ALIASES = {
    phantom_assassin: ['pa', 'мортра', 'морфа', 'mortred', 'фантомка'],
    antimage: ['am', 'магіна', 'магина', 'magina', 'anti mage', 'антимаг', 'антімаг'],
    bristleback: ['bb', 'bristle', 'брістл', 'бристл', 'їжак', 'ежик'],
    phantom_lancer: ['pl', 'lancer', 'лансер', 'пл'],
    bounty_hunter: ['bh', 'gondar', 'баунті', 'баунти', 'бх', 'гондар'],
    rattletrap: ['cw', 'clock', 'clockwerk', 'клок', 'клокверк'],
    zuus: ['zeus', 'зевс'],
    necrolyte: ['necro', 'necrophos', 'некр', 'некрофос'],
    skeleton_king: ['wk', 'sk', 'wraith', 'leoric', 'вк', 'леорік', 'леорик'],
    sand_king: ['sk', 'sand', 'ск', 'сенд кінг', 'сэнд кинг'],
    chaos_knight: ['ck', 'цк', 'хаос найт'],
    dragon_knight: ['dk', 'дк', 'дракон'],
    legion_commander: ['lc', 'legion', 'лк', 'легіонка', 'легионка'],
    crystal_maiden: ['cm', 'цм', 'рілай', 'рилай', 'цмка'],
    templar_assassin: ['ta', 'lanaya', 'та', 'ланая', 'темпларка'],
    keeper_of_the_light: ['kotl', 'котл', 'кіпер', 'кипер'],
    ancient_apparition: ['aa', 'аа', 'апарат', 'аппарат'],
    monkey_king: ['mk', 'мк', 'мавпа', 'обезьяна', 'манкі кінг', 'манки кинг'],
    faceless_void: ['fv', 'void', 'войд'],
    life_stealer: ['ls', 'naix', 'гуля', 'найкс'],
    furion: ['np', 'nature', 'natures prophet', 'фура', 'фуріон', 'фурион'],
    obsidian_destroyer: ['od', 'outworld', 'од', 'дестроєр', 'дестроер'],
    queenofpain: ['qop', 'akasha', 'квопа', 'акаша'],
    nevermore: ['sf', 'shadow fiend', 'сф', 'невермор', 'шадоу фінд', 'шадоу финд'],
    shadow_shaman: ['ss', 'rhasta', 'шаман', 'раста'],
    storm_spirit: ['ss', 'storm', 'шторм'],
    earthshaker: ['es', 'shaker', 'шейкер'],
    earth_spirit: ['es', 'kaolin', 'земеля'],
    ember_spirit: ['es', 'ember', 'ембер', 'эмбер'],
    void_spirit: ['vs', 'void spirit', 'войд спіріт', 'войд спирит'],
    vengefulspirit: ['vs', 'venge', 'венга'],
    windrunner: ['wr', 'windranger', 'вр', 'врка', 'віндрейнджер', 'виндрейнджер'],
    witch_doctor: ['wd', 'вд', 'доктор'],
    terrorblade: ['tb', 'тб', 'террорблейд'],
    lone_druid: ['ld', 'лд', 'друїд', 'друид'],
    death_prophet: ['dp', 'дп', 'банша', 'кробелус'],
    dark_willow: ['dw', 'фея', 'віллоу', 'виллоу'],
    dark_seer: ['ds', 'дс', 'дарк сір', 'дарк сир'],
    primal_beast: ['pb', 'праймал', 'біст', 'бист'],
    shredder: ['timber', 'timbersaw', 'тімбер', 'тимбер'],
    wisp: ['io', 'іо', 'ио', 'вісп', 'висп'],
    invoker: ['invo', 'voker', 'інвокер', 'инвокер', 'вокер'],
    morphling: ['morph', 'морф'],
    spectre: ['spec', 'спектра'],
    naga_siren: ['naga', 'нага'],
    spirit_breaker: ['sb', 'bara', 'бара', 'баратрум'],
    abyssal_underlord: ['underlord', 'pitlord', 'андерлорд', 'пітлорд', 'питлорд'],
    centaur: ['cw', 'cent', 'кентавр'],
    magnataur: ['mag', 'magnus', 'магнус'],
    pudge: ['пудж', 'падж'],
    lion: ['ліон', 'лион'],
    riki: ['рікі', 'рики'],
    huskar: ['хускар'],
    juggernaut: ['jugg', 'джаггер', 'джагер', 'юра'],
    slark: ['сларк', 'риба', 'рыба'],
    sniper: ['снайпер', 'дід', 'дед'],
    tinker: ['тінкер', 'тинкер'],
    axe: ['акс'],
    ursa: ['урса']
  };

  let cachedContext = null;
  let cachedSettings = { opacity: 0.96, clickThrough: false, language: 'uk' };
  let ruleGenLoadPromise = null;
  const dataUpdateSubscribers = new Set();

  function normalizeSteamAssetUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const cleaned = rawUrl.split('?')[0].trim();
    if (!cleaned) return '';
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
    if (cleaned.startsWith('/')) return `${STEAM_CDN_BASE}${cleaned}`;
    return `${STEAM_CDN_BASE}/${cleaned}`;
  }

  function resolveMaybeLocalPath(val, fallbackRemote = '') {
    if (val && typeof val === 'string') {
      if (/^[a-zA-Z]:[\\/]/.test(val) || val.startsWith('\\\\')) {
        return convertFileSrc(val);
      }
      return val;
    }
    return fallbackRemote || '';
  }

  function buildSearchAliases(hero) {
    const aliases = new Set();
    const key = (hero.key || '').toLowerCase();
    const nameEn = (hero.name_en || '').toLowerCase();
    const nameUk = (hero.name_uk || '').toLowerCase();

    if (key) aliases.add(key.replace(/_/g, ' '));
    if (nameEn) aliases.add(nameEn);
    if (nameUk) aliases.add(nameUk);

    const words = nameEn.split(/[\s-]+/).filter(Boolean);
    if (words.length >= 2) {
      aliases.add(words.map((w) => w[0]).join(''));
    }

    const customAliases = HERO_ALIASES[key];
    if (Array.isArray(customAliases)) {
      for (const alias of customAliases) aliases.add(alias.toLowerCase());
    }
    return Array.from(aliases);
  }

  function processBundle(bundle) {
    const heroesRaw = Array.isArray(bundle.heroesRaw) ? bundle.heroesRaw : [];
    const itemsRaw = Array.isArray(bundle.itemsRaw) ? bundle.itemsRaw : [];
    const counters = bundle.counters || {
      threat_tags: {},
      fallback_tag_mapping: {},
      item_rules: {},
      heroes: {}
    };
    const odHeroesRaw = bundle.odHeroesRaw || {};
    const odItemsRaw = bundle.odItemsRaw || {};
    const syncMeta = bundle.syncMeta || null;
    const iconMap = bundle.iconMap || { heroPortraits: {}, heroIcons: {}, itemImgs: {} };

    const odHeroesById = new Map();
    if (odHeroesRaw && typeof odHeroesRaw === 'object') {
      for (const entry of Object.values(odHeroesRaw)) {
        if (entry && entry.id != null) odHeroesById.set(Number(entry.id), entry);
      }
    }

    const odItemsByKey = new Map();
    if (odItemsRaw && typeof odItemsRaw === 'object') {
      for (const [k, entry] of Object.entries(odItemsRaw)) {
        if (entry && typeof entry === 'object') odItemsByKey.set(k, entry);
      }
    }

    const countersHeroes = counters.heroes || {};
    const heroesById = new Map();

    for (const hero of heroesRaw) {
      const idNum = Number(hero.id);
      const od = odHeroesById.get(idNum);
      const remoteImg = normalizeSteamAssetUrl((od && od.img) || hero.img);
      const remoteIcon = normalizeSteamAssetUrl((od && od.icon) || hero.icon);
      const localPortrait = iconMap.heroPortraits && iconMap.heroPortraits[idNum];
      const localIcon = iconMap.heroIcons && iconMap.heroIcons[idNum];

      const mergedHero = {
        ...hero,
        name_en: (od && od.localized_name) || hero.name_en,
        img: localPortrait ? convertFileSrc(localPortrait) : remoteImg,
        icon: localIcon ? convertFileSrc(localIcon) : remoteIcon,
        remoteImg,
        remoteIcon,
        openDotaRoles: od && Array.isArray(od.roles) ? od.roles : null,
        isCurated: Boolean(countersHeroes[hero.key]),
        aliases: buildSearchAliases(hero)
      };
      heroesById.set(idNum, mergedHero);
    }

    const itemsByKey = new Map();
    for (const item of itemsRaw) {
      const od = odItemsByKey.get(item.key);
      const remoteImg = normalizeSteamAssetUrl((od && od.img) || item.img);
      const localImg = iconMap.itemImgs && iconMap.itemImgs[item.key];
      itemsByKey.set(item.key, {
        ...item,
        name_en: (od && od.dname) || item.name_en,
        cost: od && typeof od.cost === 'number' ? od.cost : item.cost,
        img: localImg ? convertFileSrc(localImg) : remoteImg,
        remoteImg
      });
    }

    cachedContext = { heroesById, itemsByKey, counters };

    const rendererHeroes = Array.from(heroesById.values())
      .map((h) => {
        const counterHero = countersHeroes[h.key];
        return {
          id: h.id,
          key: h.key,
          npc_name: h.npc_name,
          name_en: h.name_en,
          name_uk: h.name_uk,
          img: h.img,
          icon: h.icon,
          primary_attr: h.primary_attr,
          attack_type: h.attack_type,
          default_position: (counterHero && counterHero.default_position) || 3,
          positions: (counterHero && counterHero.positions) || [3],
          primary_role_uk: counterHero ? counterHero.primary_role_uk : '',
          primary_role_ru: counterHero ? (counterHero.primary_role_ru || counterHero.primary_role_uk || '') : '',
          primary_role_en: counterHero ? (counterHero.primary_role_en || counterHero.primary_role_uk || '') : '',
          roles: h.openDotaRoles || (h.roles || []).map((r) => r.name),
          isCurated: h.isCurated,
          aliases: h.aliases
        };
      })
      .sort((a, b) => a.name_en.localeCompare(b.name_en));

    const itemRules = counters.item_rules || {};
    const triggerRules = counters.enemy_item_triggers || {};
    const counterItemsMeta = {};
    const triggerItemsMeta = {};

    for (const key of Object.keys(itemRules)) {
      const it = itemsByKey.get(key);
      if (it) {
        counterItemsMeta[key] = { key: it.key, name_en: it.name_en, img: it.img, cost: it.cost };
      }
    }

    for (const [key, trig] of Object.entries(triggerRules)) {
      const it = itemsByKey.get(key);
      triggerItemsMeta[key] = {
        key,
        name_en: (it && it.name_en) || trig.name_en || key,
        img: it ? it.img : '',
        cost: it ? it.cost : 0
      };
    }

    return {
      heroes: rendererHeroes,
      counterItemsMeta,
      triggerItemsMeta,
      threatTags: counters.threat_tags || {},
      positionsMeta: counters.positions_meta || {},
      patchTarget: counters.patch_target || null,
      meta: {
        totalHeroes: rendererHeroes.length,
        totalItems: itemsByKey.size,
        curatedHeroesCount: Object.keys(countersHeroes).length,
        cacheSyncedAt: syncMeta ? syncMeta.lastSyncUtc : null,
        openDotaCached: odHeroesById.size > 0
      }
    };
  }

  async function ensureAnalysisContext() {
    if (cachedContext) return cachedContext;
    const bundle = await invoke('get_data_bundle');
    processBundle(bundle);
    return cachedContext;
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureRuleGeneratorLoaded() {
    if (window.__d2oRuleGenerator && window.__d2oRulePresets) return;
    if (!ruleGenLoadPromise) {
      ruleGenLoadPromise = (async () => {
        await loadScriptOnce('vendor/engine/rulePresets.js');
        await loadScriptOnce('vendor/engine/ruleGeneratorService.js');
      })();
    }
    return ruleGenLoadPromise;
  }

  function normalizeVisionHero(h) {
    if (!h) return null;
    return {
      ...h,
      icon: resolveMaybeLocalPath(h.local_icon_path || h.icon, h.icon),
      img: resolveMaybeLocalPath(h.local_portrait_path || h.img, h.img)
    };
  }

  function normalizeVisionDraftResult(res) {
    if (!res) return res;
    return {
      ...res,
      allies: Array.isArray(res.allies) ? res.allies.map(normalizeVisionHero) : [],
      enemies: Array.isArray(res.enemies) ? res.enemies.map(normalizeVisionHero) : []
    };
  }

  function normalizeVisionItemsResult(res) {
    if (!res) return res;
    return {
      ...res,
      detectedItems: Array.isArray(res.detectedItems)
        ? res.detectedItems.map((it) => ({
            ...it,
            img: resolveMaybeLocalPath(it.localImgPath || it.img, it.img)
          }))
        : []
    };
  }

  function normalizeGsiState(gsiState) {
    if (!gsiState) return gsiState;
    const hero = gsiState.hero
      ? {
          ...gsiState.hero,
          icon: resolveMaybeLocalPath(gsiState.hero.icon),
          img: resolveMaybeLocalPath(gsiState.hero.img)
        }
      : null;
    const ownedItemsDetails = Array.isArray(gsiState.ownedItemsDetails)
      ? gsiState.ownedItemsDetails.map((d) => ({
          ...d,
          img: resolveMaybeLocalPath(d.img)
        }))
      : [];
    return { ...gsiState, hero, ownedItemsDetails };
  }

  function applyOverlayVisualOpacity(settings) {
    const shell = document.getElementById('overlay-shell');
    if (!shell) return;
    const s = settings || cachedSettings || {};
    const targetOpacity = s.clickThrough
      ? 0.35
      : Math.max(0.45, Math.min(1.0, Number(s.opacity) || 0.96));
    shell.style.opacity = String(targetOpacity);
  }

  async function runRuleRegeneration({ targetVersion = null } = {}) {
    await ensureRuleGeneratorLoaded();
    const inputs = await invoke('get_rule_generator_inputs');
    const abilitiesDict = window.__d2oRuleGenerator.buildAbilitiesDictionaryFromSources([
      inputs.abilities,
      inputs.odAbilitiesRaw
    ]);
    const { counters, report } = window.__d2oRuleGenerator.regenerateRulesFromData({
      targetVersion,
      heroes: inputs.heroes || [],
      items: inputs.items || [],
      baseCounters: inputs.baseCounters || {},
      patches: inputs.patches || [],
      meta: inputs.meta || {},
      odHeroesRaw: inputs.odHeroesRaw || {},
      odItemsRaw: inputs.odItemsRaw || {},
      abilitiesByName: abilitiesDict
    });

    await invoke('save_counters_json', { countersJson: JSON.stringify(counters) });
    const bundle = await invoke('get_data_bundle');
    const refreshedGameData = processBundle(bundle);
    return { ...report, refreshedGameData };
  }

  function registerTauriListener(eventName, transformFn, callback) {
    if (typeof callback !== 'function') return () => {};
    let unlistenFn = null;
    let disposed = false;
    listen(eventName, (ev) => {
      if (disposed) return;
      callback(transformFn ? transformFn(ev.payload) : ev.payload);
    }).then((fn) => {
      if (disposed) fn();
      else unlistenFn = fn;
    });
    return () => {
      disposed = true;
      if (unlistenFn) unlistenFn();
    };
  }

  // Слухаємо внутрішні події оновлення налаштувань/даних для прозорості та синхронізації кешу
  listen('overlay:settings-updated', (ev) => {
    if (ev && ev.payload) {
      cachedSettings = { ...cachedSettings, ...ev.payload };
      applyOverlayVisualOpacity(cachedSettings);
    }
  });

  listen('overlay:click-through-changed', (ev) => {
    cachedSettings = { ...cachedSettings, clickThrough: Boolean(ev && ev.payload) };
    applyOverlayVisualOpacity(cachedSettings);
  });

  listen('overlay:data-refresh-needed', async () => {
    try {
      const bundle = await invoke('get_data_bundle');
      const gameData = processBundle(bundle);
      for (const cb of dataUpdateSubscribers) cb(gameData);
    } catch {
      // Ігноруємо помилку фонового перезавантаження
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    applyOverlayVisualOpacity(cachedSettings);
    const header = document.querySelector('.overlay-header');
    if (header) {
      header.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.no-drag, button, input, select, textarea, a, .badge')) return;
        const win = getCurrentWindow();
        if (win && win.startDragging) {
          win.startDragging().catch(() => {});
        }
      });
    }
  });

  window.overlayApi = {
    hideWindow: () => {
      invoke('hide_window').catch(() => {});
    },
    closeApp: () => {
      invoke('close_app').catch(() => {});
    },
    toggleClickThrough: async () => {
      const enabled = await invoke('toggle_click_through');
      cachedSettings.clickThrough = Boolean(enabled);
      applyOverlayVisualOpacity(cachedSettings);
      return enabled;
    },
    toggleMiniMode: () => invoke('toggle_mini_mode'),
    resetWindowPosition: () => invoke('reset_window_position'),
    getSettings: async () => {
      const s = await invoke('get_settings');
      if (s) {
        cachedSettings = s;
        applyOverlayVisualOpacity(cachedSettings);
      }
      return s;
    },
    updateSettings: async (patch) => {
      const updated = await invoke('update_settings', { patch });
      if (updated) {
        cachedSettings = updated;
        applyOverlayVisualOpacity(cachedSettings);
      }
      return updated;
    },
    getStatus: () => invoke('app_get_status'),
    getGameData: async () => {
      const bundle = await invoke('get_data_bundle');
      return processBundle(bundle);
    },
    refreshData: async () => {
      const res = await invoke('refresh_data');
      const bundle = await invoke('get_data_bundle');
      const gameData = processBundle(bundle);
      for (const cb of dataUpdateSubscribers) cb(gameData);
      return res;
    },
    analyzeDraft: async (options) => {
      const ctx = await ensureAnalysisContext();
      const opts = options && typeof options === 'object' ? { ...options } : {};
      if (!opts.language) {
        opts.language = cachedSettings.language || 'uk';
      }
      return window.__d2oAnalyzer.analyzeEnemyDraft(opts, ctx);
    },

    // GSI
    getGsiStatus: async () => {
      const st = await invoke('gsi_get_status');
      if (st && st.lastGsiState) {
        st.lastGsiState = normalizeGsiState(st.lastGsiState);
      }
      return st;
    },
    generateGsiCfg: () => invoke('gsi_generate_cfg'),
    simulateGsi: async () => {
      const res = await invoke('gsi_simulate');
      if (res && res.gsiState) res.gsiState = normalizeGsiState(res.gsiState);
      return res;
    },
    clearGsi: () => invoke('gsi_clear'),

    // Patch & Rules
    getPatchStatus: () => invoke('patch_get_status'),
    checkPatchUpdate: () => invoke('patch_check'),
    applyPatchUpdate: async () => {
      const res = await invoke('patch_apply_download');
      if (!res || !res.ok) return res;
      const ruleReport = await runRuleRegeneration({ targetVersion: res.targetVersion });
      const refreshedGameData = ruleReport.refreshedGameData;
      for (const cb of dataUpdateSubscribers) cb(refreshedGameData);
      return {
        ...res,
        ruleReport,
        refreshedGameData
      };
    },
    reanalyzeRules: async () => {
      const report = await runRuleRegeneration();
      for (const cb of dataUpdateSubscribers) cb(report.refreshedGameData);
      return report;
    },

    // Vision
    scanDraft: async () => normalizeVisionDraftResult(await invoke('vision_scan_draft')),
    simulateDraftScan: async () => normalizeVisionDraftResult(await invoke('vision_simulate_draft')),
    scanEnemyInventory: async () =>
      normalizeVisionItemsResult(await invoke('vision_scan_enemy_items')),
    simulateEnemyInventory: async () =>
      normalizeVisionItemsResult(await invoke('vision_simulate_enemy_items')),
    getCalibrationPreview: () => invoke('vision_calibration_preview'),

    // Events
    onVisibilityChange: (cb) => registerTauriListener('overlay:visibility-changed', null, cb),
    onClickThroughChange: (cb) => registerTauriListener('overlay:click-through-changed', null, cb),
    onMiniModeChange: (cb) => registerTauriListener('overlay:mini-mode-changed', null, cb),
    onSettingsUpdated: (cb) => registerTauriListener('overlay:settings-updated', null, cb),
    onDataUpdated: (cb) => {
      if (typeof cb !== 'function') return () => {};
      dataUpdateSubscribers.add(cb);
      return () => dataUpdateSubscribers.delete(cb);
    },
    onGsiUpdate: (cb) => registerTauriListener('overlay:gsi-update', normalizeGsiState, cb),
    onPatchStatus: (cb) => registerTauriListener('overlay:patch-status', null, cb),
    onVisionDraft: (cb) => registerTauriListener('overlay:vision-draft', normalizeVisionDraftResult, cb),
    onVisionEnemyItems: (cb) =>
      registerTauriListener('overlay:vision-enemy-items', normalizeVisionItemsResult, cb)
  };
})();
