(function (root) {
const SEVERITY_FACTOR = {
  3: 1.0,
  2: 0.72,
  1: 0.48
};

const PRIORITY_META = {
  critical: {
    rank: 3,
    labelUk: 'Критично',
    labelRu: 'Критично',
    labelEn: 'Critical',
    badgeClass: 'text-bg-danger'
  },
  recommended: {
    rank: 2,
    labelUk: 'Рекомендовано',
    labelRu: 'Рекомендуется',
    labelEn: 'Recommended',
    badgeClass: 'text-bg-warning text-dark'
  },
  situational: {
    rank: 1,
    labelUk: 'Ситуативно',
    labelRu: 'Ситуативно',
    labelEn: 'Situational',
    badgeClass: 'text-bg-secondary'
  }
};

const CATEGORY_LABELS_BY_LANG = {
  uk: {
    critical: 'Критично',
    recommended: 'Рекомендовано',
    defensive: 'Захист',
    utility: 'Утиліта',
    consumable: 'Розхідник'
  },
  ru: {
    critical: 'Критично',
    recommended: 'Рекомендуется',
    defensive: 'Защита',
    utility: 'Утилита',
    consumable: 'Расходник'
  },
  en: {
    critical: 'Critical',
    recommended: 'Recommended',
    defensive: 'Defensive',
    utility: 'Utility',
    consumable: 'Consumable'
  }
};

const POSITION_LABELS_UK = {
  1: 'Кері (Pos 1)',
  2: 'Мідер (Pos 2)',
  3: 'Офлейнер (Pos 3)',
  4: 'Сап (Pos 4)',
  5: 'Фул сап (Pos 5)'
};

const POSITION_LABELS_BY_LANG = {
  uk: POSITION_LABELS_UK,
  ru: {
    1: 'Керри (Pos 1)',
    2: 'Мидер (Pos 2)',
    3: 'Оффлейнер (Pos 3)',
    4: 'Сап (Pos 4)',
    5: 'Фулл сап (Pos 5)'
  },
  en: {
    1: 'Carry (Pos 1)',
    2: 'Mid (Pos 2)',
    3: 'Offlane (Pos 3)',
    4: 'Soft Sup (Pos 4)',
    5: 'Hard Sup (Pos 5)'
  }
};

function normalizeLang(lang) {
  if (!lang || typeof lang !== 'string') return 'uk';
  const l = lang.trim().toLowerCase();
  if (l === 'ru') return 'ru';
  if (l === 'en') return 'en';
  return 'uk';
}

function pickLocalized(obj, baseField, lang = 'uk') {
  if (!obj || typeof obj !== 'object') return '';
  const l = normalizeLang(lang);
  if (l === 'ru' && obj[`${baseField}_ru`]) return obj[`${baseField}_ru`];
  if (l === 'en' && obj[`${baseField}_en`]) return obj[`${baseField}_en`];
  return obj[`${baseField}_uk`] || obj[`${baseField}_en`] || '';
}

function getPriorityLabel(priorityMeta, lang = 'uk') {
  const l = normalizeLang(lang);
  if (l === 'ru') return priorityMeta.labelRu || priorityMeta.labelUk;
  if (l === 'en') return priorityMeta.labelEn || priorityMeta.labelUk;
  return priorityMeta.labelUk;
}

const ITEM_UPGRADE_COVERS = {
  hurricane_pike: ['force_staff'],
  bloodthorn: ['orchid'],
  wind_waker: ['cyclone'],
  ethereal_blade: ['ghost'],
  disperser: ['diffusal_blade'],
  gungir: ['rod_of_atos'],
  devastator: ['witch_blade'],
  ultimate_scepter_2: ['ultimate_scepter']
};

const CONSUMED_UNIQUE_UPGRADE_KEYS = new Set([
  'ultimate_scepter',
  'ultimate_scepter_2',
  'aghanims_shard'
]);

// Дорогі анти-керрі слоти, чия вага знижується, якщо цільовий ворог грає на позиції сапорта (Pos 4 / Pos 5)
const EXPENSIVE_ANTI_CARRY_ITEMS = new Set([
  'monkey_king_bar',
  'silver_edge',
  'skadi',
  'heavens_halberd',
  'mjollnir',
  'bfury',
  'bloodthorn',
  'abyssal_blade',
  'blade_mail',
  'satanic',
  'crimson_guard',
  'assault',
  'devastator',
  'witch_blade'
]);

// Герої, проти яких Nullifier залишається важливим навіть коли вони на позиції сапорта (Pos 4/5)
const DEDICATED_SAVE_SUPPORTS = new Set([
  'omniknight',
  'necrolyte',
  'pugna',
  'dazzle',
  'abaddon',
  'oracle',
  'dark_seer',
  'lich',
  'largo',
  'treant',
  'ogre_magi'
]);

function confirmFallbackTagByAbilities(mappedTag, hero) {
  const abilities = Array.isArray(hero.abilities) ? hero.abilities : [];
  const fullText = abilities
    .map((ab) => `${ab.name_en || ''} ${ab.desc_en || ''}`.toLowerCase())
    .join(' | ');
  const roles = new Set(
    (hero.openDotaRoles || (hero.roles || []).map((r) => r.name)).map((r) => String(r).toLowerCase())
  );

  switch (mappedTag) {
    case 'illusions':
      return /\b(creates?|summons?|spawns?|splits?)[\w\s]{0,30}\b(illusion|illusions|mirror image|phantasm|juxtapose|conjure image|wall of replica|haunt)\b/i.test(fullText);
    case 'invisibility':
      if (/\b(reveals? invisible|revealed if invisible|detects? invisible|true sight)\b/i.test(fullText)) return false;
      return /\b(turns invisible|becomes invisible|goes invisible|grants? invisibility|shifts out of visibility|shadow walk|shadow dance|depth shroud|vendetta|moonlight shadow|skeleton walk|ghost walk|sand storm)\b/i.test(fullText);
    case 'evasion':
      return /\b(evasion|miss chance|chance to miss|evade)\b/.test(fullText);
    case 'channeled_disable':
      return abilities.some((ab) => Array.isArray(ab.behavior) && ab.behavior.includes('channeled'));
    case 'critical_passive':
      return abilities.some(
        (ab) => Array.isArray(ab.behavior) && ab.behavior.includes('passive') &&
          /\b(damage|armor|resist|attack|crit|bash|steal|health|regen|lifesteal|stack|cleave|shield)\b/i.test(ab.desc_en || '')
      );
    case 'damage_reflection':
      return /\b(reflect|returns? damage|counter helix|corrosive skin|dispersion|spiked carapace|retaliate)\b/.test(fullText);
    case 'heal_regen':
      return /\b(heal|heals|healing|lifesteal|health regeneration|hp regeneration|restore health|restores? .*health|regaining the health)\b/.test(fullText);
    case 'magic_burst':
      return roles.has('nuker') || abilities.filter((ab) => ab.damage_type === 'magical' || ab.damage_type === 'pure').length >= 2;
    case 'physical_burst':
      return roles.has('carry') || abilities.some((ab) => ab.damage_type === 'physical' && ab.behavior && !ab.behavior.includes('passive'));
    case 'high_mobility':
      return roles.has('escape') || /\b(blink|leap|teleport|ball lightning|time walk|waveform|pounce|surge|skewer|timber chain)\b/.test(fullText);
    case 'dispellable_save':
      return abilities.some((ab) => ab.dispellable === 'basic' && /\b(shield|barrier|invulner|ethereal|armor|attack speed|immune)\b/i.test(ab.desc_en || ''));
    default:
      return true;
  }
}

function buildFallbackThreats(hero, counters, lang = 'uk') {
  const l = normalizeLang(lang);
  const mapping = (counters && counters.fallback_tag_mapping) || {};
  const rawTags = Array.isArray(hero.threat_tags) ? hero.threat_tags : [];
  const roles = new Set(
    (hero.openDotaRoles || (hero.roles || []).map((r) => r.name)).map((r) => String(r).toLowerCase())
  );
  const mappedSet = new Set();

  for (const rawTag of rawTags) {
    const mapped = mapping[rawTag];
    if (mapped && confirmFallbackTagByAbilities(mapped, hero)) {
      mappedSet.add(mapped);
    }
  }

  for (const tag of ['invisibility', 'illusions', 'heal_regen', 'evasion', 'damage_reflection', 'high_mobility', 'magic_burst', 'channeled_disable']) {
    if (!mappedSet.has(tag) && confirmFallbackTagByAbilities(tag, hero)) {
      mappedSet.add(tag);
    }
  }

  const autoSourceByLang = {
    uk: 'Автовизначення за скілами та ролями',
    ru: 'Автоопределение по скиллам и ролям',
    en: 'Auto-detected from abilities and roles'
  };

  const threats = [];
  for (const tag of mappedSet) {
    let severity = 1;
    if (
      tag === 'illusions' ||
      tag === 'invisibility' ||
      (tag === 'magic_burst' && roles.has('nuker')) ||
      (tag === 'physical_burst' && roles.has('carry')) ||
      (tag === 'high_mobility' && roles.has('escape')) ||
      tag === 'heal_regen'
    ) {
      severity = 2;
    }

    const tagMeta = (counters.threat_tags && counters.threat_tags[tag]) || {};
    const noteLocalized =
      pickLocalized(tagMeta, 'description', l) ||
      pickLocalized(tagMeta, 'label', l) ||
      tag;
    threats.push({
      tag,
      severity,
      source_ability: autoSourceByLang[l] || autoSourceByLang.uk,
      note_uk: noteLocalized,
      note_ru: pickLocalized(tagMeta, 'description', 'ru') || noteLocalized,
      note_en: pickLocalized(tagMeta, 'description', 'en') || noteLocalized
    });
  }

  threats.sort((a, b) => b.severity - a.severity);
  return threats.slice(0, 4);
}

function inferHeroDefaultPosition(hero, counters) {
  const curated = counters && counters.heroes && counters.heroes[hero.key];
  if (curated && Number.isFinite(Number(curated.default_position))) {
    const p = Number(curated.default_position);
    if (p >= 1 && p <= 5) return p;
  }
  if (hero && Number.isFinite(Number(hero.default_position))) {
    const p = Number(hero.default_position);
    if (p >= 1 && p <= 5) return p;
  }
  const roles = new Set(
    (hero.openDotaRoles || (hero.roles || []).map((r) => r.name)).map((r) => String(r).toLowerCase())
  );
  if (roles.has('carry') && !roles.has('support')) return 1;
  if (roles.has('nuker') && !roles.has('support') && !roles.has('durable')) return 2;
  if (roles.has('initiator') && roles.has('durable')) return 3;
  if (roles.has('support') && roles.has('initiator')) return 4;
  if (roles.has('support')) return 5;
  return 3;
}

/**
 * Визначає ефективну позицію героя (Pos 1–5): ручну або «Авто» за основною роллю з бази.
 */
function resolveHeroEffectivePosition(hero, manualPosition, counters, lang = 'uk') {
  const l = normalizeLang(lang);
  const posLabels = POSITION_LABELS_BY_LANG[l] || POSITION_LABELS_UK;
  const autoWord = l === 'en' ? 'Auto' : 'Авто';

  const manualNum = manualPosition != null && manualPosition !== '' && manualPosition !== 'auto'
    ? Number(manualPosition)
    : null;
  if (manualNum && Number.isFinite(manualNum) && manualNum >= 1 && manualNum <= 5) {
    return {
      position: manualNum,
      isManual: true,
      labelUk: posLabels[manualNum] || `Pos ${manualNum}`
    };
  }

  const defaultPos = inferHeroDefaultPosition(hero, counters);
  return {
    position: defaultPos,
    isManual: false,
    labelUk: `${autoWord} (${posLabels[defaultPos] || `Pos ${defaultPos}`})`
  };
}

function resolveHeroThreatProfile(hero, counters, lang = 'uk') {
  const curated = counters && counters.heroes && counters.heroes[hero.key];
  if (curated) {
    return {
      isCurated: true,
      defaultPosition: curated.default_position || inferHeroDefaultPosition(hero, counters),
      positions: Array.isArray(curated.positions) ? curated.positions : [curated.default_position || 3],
      typicalItems: Array.isArray(curated.typical_items) ? curated.typical_items : [],
      threats: Array.isArray(curated.threats) ? curated.threats : [],
      priorityItemsByKey: new Map((curated.priority_items || []).map((pi) => [pi.item_key, pi]))
    };
  }

  const fallbackPos = inferHeroDefaultPosition(hero, counters);
  return {
    isCurated: false,
    defaultPosition: fallbackPos,
    positions: [fallbackPos],
    typicalItems: [],
    threats: buildFallbackThreats(hero, counters, lang),
    priorityItemsByKey: new Map()
  };
}

function isCarryOrCoreHero(hero, counters) {
  if (!hero) return false;
  const defPos = inferHeroDefaultPosition(hero, counters);
  if (defPos <= 3) return true;
  const roles = hero.openDotaRoles || (hero.roles || []).map((r) => r.name);
  return roles.some((r) => String(r).toLowerCase() === 'carry');
}

/**
 * Визначає режим нестандартного піку (кор-герой на позиції Pos 4 або Pos 5) і вроджені дублікати.
 */
function resolveMyHeroContext(myHero, myPosition, counters, lang = 'uk') {
  const l = normalizeLang(lang);
  const redundantMap = new Map();
  let flexAdaptation = null;
  const flexBoostsByKey = new Map();

  if (!myHero) {
    return { redundantMap, flexAdaptation, flexBoostsByKey };
  }

  const defaultRedundantText = {
    uk: 'Дублює вроджену механіку героя.',
    ru: 'Дублирует врожденную механику героя.',
    en: 'Duplicates hero innate mechanic.'
  };

  const heroEntry = counters && counters.heroes && counters.heroes[myHero.key];
  if (heroEntry && Array.isArray(heroEntry.redundant_items)) {
    for (const ri of heroEntry.redundant_items) {
      if (ri && ri.item_key) {
        redundantMap.set(ri.item_key, pickLocalized(ri, 'reason', l) || defaultRedundantText[l]);
      }
    }
  }

  const attackType = (myHero.attack_type || (heroEntry && heroEntry.attack_type) || '').toLowerCase();
  if (attackType === 'ranged' && !redundantMap.has('bfury')) {
    const rangedBfText = {
      uk: 'Battle Fury (cleave) призначений лише для мілі-героїв.',
      ru: 'Battle Fury (cleave) работает только у героев ближнего боя.',
      en: 'Battle Fury (cleave) only works on melee heroes.'
    };
    redundantMap.set('bfury', rangedBfText[l]);
  }

  // Адаптація нестандартних піків: Кор-герой на сапорт-позиції (Pos 4 або Pos 5)
  const flexMatrix = (counters && counters.flex_support_matrix) || {};
  const heroBuilds = flexMatrix.hero_builds || {};
  const specificFlex = heroBuilds[myHero.key];
  const isSupportPosition = myPosition === 4 || myPosition === 5;

  if (isSupportPosition && (specificFlex || isCarryOrCoreHero(myHero, counters))) {
    const farmItems = flexMatrix.suppress_farm_items || [];
    const farmSuppressText = {
      uk: `Для ${myHero.name_en} на Pos ${myPosition} стандартні фарм/кор-слоти замінено на утилітарні.`,
      ru: `Для ${myHero.name_en} на Pos ${myPosition} стандартные фарм/кор-слоты заменены на утилитарные.`,
      en: `For ${myHero.name_en} on Pos ${myPosition}, standard farm/core items are replaced with utility.`
    };
    for (const fk of farmItems) {
      if (!redundantMap.has(fk)) {
        redundantMap.set(fk, farmSuppressText[l]);
      }
    }
    if (specificFlex && Array.isArray(specificFlex.suppress_extra)) {
      const extraSuppressText = {
        uk: `Адаптація ${myHero.name_en} Pos ${myPosition}: фокус на сейв/утіліті команди.`,
        ru: `Адаптация ${myHero.name_en} Pos ${myPosition}: фокус на сейв/утилити команды.`,
        en: `${myHero.name_en} Pos ${myPosition} adaptation: focus on team save/utility.`
      };
      for (const ek of specificFlex.suppress_extra) {
        redundantMap.set(ek, extraSuppressText[l]);
      }
    }

    const buildItems = specificFlex
      ? specificFlex.recommended_items
      : [
          {
            item_key: 'solar_crest',
            score_bonus: 15,
            priority: 'critical',
            reason_uk: `${myHero.name_en} Pos ${myPosition}: підсилює союзного керрі щитом і швидкістю атаки.`,
            reason_ru: `${myHero.name_en} Pos ${myPosition}: усиливает союзного керри барьером и скоростью атаки.`,
            reason_en: `${myHero.name_en} Pos ${myPosition}: buffs allied carry with barrier and attack speed.`
          },
          {
            item_key: 'force_staff',
            score_bonus: 14,
            priority: 'critical',
            reason_uk: `${myHero.name_en} Pos ${myPosition}: базовий сапорт-сейв і мобільність.`,
            reason_ru: `${myHero.name_en} Pos ${myPosition}: базовый саппорт-сейв и мобильность.`,
            reason_en: `${myHero.name_en} Pos ${myPosition}: core support save and mobility.`
          },
          {
            item_key: 'glimmer_cape',
            score_bonus: 14,
            priority: 'recommended',
            reason_uk: 'Дешевий захист команди від магічного та фізичного фокусу.',
            reason_ru: 'Дешевая защита команды от магического и физического фокуса.',
            reason_en: 'Cost-effective team save against magic and physical focus.'
          },
          {
            item_key: 'lotus_orb',
            score_bonus: 13,
            priority: 'recommended',
            reason_uk: 'Диспел і захист союзних корів.',
            reason_ru: 'Диспел и защита союзных коров.',
            reason_en: 'Basic dispel and spell reflection for allied cores.'
          },
          {
            item_key: 'spirit_vessel',
            score_bonus: 12,
            priority: 'recommended',
            reason_uk: 'Ранній тиск та анти-хіл для роумінг-сапорта.',
            reason_ru: 'Раннее давление и анти-хил для роуминг-саппорта.',
            reason_en: 'Early pressure and anti-heal for roaming support.'
          }
        ];

    for (const bi of buildItems) {
      flexBoostsByKey.set(bi.item_key, bi);
    }

    const flexBannerText = {
      uk: `Адаптація ${myHero.name_en} (Pos ${myPosition}): кор-фарм предмети приховано, пріоритет на сапорт/утіліті.`,
      ru: `Адаптация ${myHero.name_en} (Pos ${myPosition}): кор-фарм предметы скрыты, приоритет на саппорт/утилити.`,
      en: `${myHero.name_en} (Pos ${myPosition}) adaptation: core farm items hidden, support/utility prioritized.`
    };

    flexAdaptation = {
      active: true,
      heroName: myHero.name_en,
      position: myPosition,
      noteUk: flexBannerText[l]
    };
  }

  return { redundantMap, flexAdaptation, flexBoostsByKey };
}

/**
 * Аналізує склад союзників (до 4 героїв) з урахуванням їхніх позицій (Pos 1–5):
 * - На Pos 3 союзні носії аур (Underlord, Abaddon, Dark Seer, Tidehunter тощо) значно ймовірніше зберуть Pipe/Crimson/Greaves, ніж на Pos 5.
 * - Тип шкоди союзних корів (Pos 1/2) визначає потребу в Assault Cuirass / Solar Crest / Vladmir's чи Veil of Discord / Kaya & Sange.
 */
function resolveAllySynergyContext(allyProfiles, myHero, counters, lang = 'uk') {
  const l = normalizeLang(lang);
  const rules = (counters && counters.ally_synergy_rules) || {};
  const auraCarriersSet = new Set(rules.aura_carriers || []);
  const auraItemsSet = new Set(rules.aura_items || ['pipe', 'crimson_guard', 'guardian_greaves', 'vladmir', 'assault']);
  const carriersByItem = rules.aura_carriers_by_item || {};

  const auraAllies = [];
  const auraDiscountByItem = new Map();
  const physicalAllies = [];
  const magicAllies = [];
  let physicalCorePower = 0;
  let magicCorePower = 0;

  for (const allyEntry of allyProfiles) {
    const { hero, profile, position = 3 } = allyEntry;
    if (myHero && hero.id === myHero.id) continue;

    // 1. Оцінка ймовірності купівлі командних аур союзником залежно від його позиції (Pos 1–5)
    const isGeneralAuraCarrier = auraCarriersSet.has(hero.key);
    for (const auraItemKey of auraItemsSet) {
      const itemCarriers = Array.isArray(carriersByItem[auraItemKey]) ? carriersByItem[auraItemKey] : null;
      const canCarryThisAura = itemCarriers ? itemCarriers.includes(hero.key) : isGeneralAuraCarrier;
      if (!canCarryThisAura) continue;

      let discountMult = 1.0;
      if (position === 3) {
        // Офлейнер (Pos 3) — основний носій командних аур (Pipe, Crimson, Greaves, Vladmir, AC)
        discountMult = 0.52;
      } else if (position === 4) {
        // Сап (Pos 4) — часто збирає Vladmir, Greaves або Pipe, але рідше важкі Crimson/AC
        discountMult = auraItemKey === 'vladmir' || auraItemKey === 'guardian_greaves' || auraItemKey === 'pipe' ? 0.68 : 0.88;
      } else if (position === 1 || position === 2) {
        // Кері / Мідер (Pos 1/2) — збирають лише Assault Cuirass (або Vladmir на Lycan/BM)
        if (auraItemKey === 'assault') discountMult = 0.58;
        else if (auraItemKey === 'vladmir' && (hero.key === 'lycan' || hero.key === 'beastmaster')) discountMult = 0.65;
      } else if (position === 5) {
        // Фул сап (Pos 5) — низький фарм-пріоритет: майже не збирає ранні Pipe/Crimson/AC, інколи бере пізній Vladmir
        discountMult = auraItemKey === 'vladmir' ? 0.82 : 0.95;
      }

      if (discountMult < 0.9) {
        const existing = auraDiscountByItem.get(auraItemKey);
        if (!existing || discountMult < existing.mult) {
          auraDiscountByItem.set(auraItemKey, {
            mult: discountMult,
            carrierName: `${hero.name_en} (Pos ${position})`
          });
        }
        if (!auraAllies.some((a) => a.id === hero.id)) {
          auraAllies.push({ ...hero, position });
        }
      }
    }

    // 2. Оцінка фізичного та магічного потенціалу команди за позиціями союзників (фокус на Pos 1 та Pos 2)
    const roles = new Set(
      (hero.openDotaRoles || (hero.roles || []).map((r) => r.name)).map((r) => String(r).toLowerCase())
    );
    const hasPhys = roles.has('carry') || profile.threats.some((t) => t.tag === 'physical_burst' && t.severity >= 2);
    const hasMagic = roles.has('nuker') || profile.threats.some((t) => (t.tag === 'magic_burst' || t.tag === 'sustained_magic') && t.severity >= 2);

    const physPosWeight = position === 1 ? 1.65 : position === 2 ? 1.45 : position === 3 ? 0.95 : 0.3;
    const magicPosWeight = position === 2 ? 1.65 : position === 1 ? 1.35 : position === 3 ? 1.0 : 0.55;

    if (hasPhys && physPosWeight >= 0.8) {
      physicalCorePower += physPosWeight;
      physicalAllies.push({ ...hero, position });
    }
    if (hasMagic) {
      magicCorePower += magicPosWeight;
      if (magicPosWeight >= 0.8 || magicAllies.length < 3) {
        magicAllies.push({ ...hero, position });
      }
    }
  }

  const physBadgeByLang = {
    uk: 'Синергія фіз-корів',
    ru: 'Синергия физ-коров',
    en: 'Phys Core Synergy'
  };
  const physPrefixByLang = {
    uk: 'Синергія з союзними корами',
    ru: 'Синергия с союзными корами',
    en: 'Synergy with allied cores'
  };
  const magicBadgeByLang = {
    uk: 'Синергія маг-корів',
    ru: 'Синергия маг-коров',
    en: 'Magic Core Synergy'
  };
  const magicPrefixByLang = {
    uk: 'Синергія з союзними магами',
    ru: 'Синергия с союзными магами',
    en: 'Synergy with allied casters'
  };

  const boostMap = new Map();
  if (physicalCorePower >= 1.5 && physicalAllies.length >= 1) {
    const names = physicalAllies.map((h) => `${h.name_en} (Pos ${h.position})`).join(', ');
    const scale = physicalCorePower >= 2.8 ? 1.25 : 1.0;
    for (const rule of rules.physical_ally_boost_items || []) {
      boostMap.set(rule.item_key, {
        bonus: Math.round((rule.bonus || 12) * scale * 10) / 10,
        badgeUk: physBadgeByLang[l],
        reasonUk: `${physPrefixByLang[l]} (${names}): ${pickLocalized(rule, 'reason', l)}`
      });
    }
  }

  if (magicCorePower >= 1.6 && magicAllies.length >= 1) {
    const names = magicAllies.map((h) => `${h.name_en} (Pos ${h.position})`).join(', ');
    const scale = magicCorePower >= 2.8 ? 1.25 : 1.0;
    for (const rule of rules.magic_ally_boost_items || []) {
      boostMap.set(rule.item_key, {
        bonus: Math.round((rule.bonus || 11) * scale * 10) / 10,
        badgeUk: magicBadgeByLang[l],
        reasonUk: `${magicPrefixByLang[l]} (${names}): ${pickLocalized(rule, 'reason', l)}`
      });
    }
  }

  return {
    auraAllies,
    auraItemsSet,
    auraDiscountByItem,
    physicalAllies,
    magicAllies,
    physicalCorePower,
    magicCorePower,
    boostMap
  };
}

/**
 * Обчислює множник значущості ворожого героя для конкретного контр-предмета залежно від позиції ворога (Pos 1–5).
 * Якщо ворожий герой на Pos 4 або Pos 5 (напр. Windranger або Monkey King сапорт), вага дорогих анти-керрі слотів (MKB, Silver Edge, Skadi, Halberd) суттєво знижується.
 */
function getEnemyPositionItemWeighting(enemyHero, enemyPosition, itemKey) {
  const pos = Number(enemyPosition) || 3;

  // Ворожі кори (Pos 1, 2, 3) отримують повний або підвищений пріоритет
  if (pos === 1) {
    return {
      multiplier: EXPENSIVE_ANTI_CARRY_ITEMS.has(itemKey) ? 1.22 : 1.14,
      allowPriorityEscalation: true,
      curatedBonusScale: 1.12
    };
  }
  if (pos === 2) {
    return {
      multiplier: EXPENSIVE_ANTI_CARRY_ITEMS.has(itemKey) ? 1.15 : 1.08,
      allowPriorityEscalation: true,
      curatedBonusScale: 1.06
    };
  }
  if (pos === 3) {
    return {
      multiplier: 1.04,
      allowPriorityEscalation: true,
      curatedBonusScale: 1.0
    };
  }

  // Ворожі сапорти (Pos 4 — Сап, Pos 5 — Фул сап)
  if (EXPENSIVE_ANTI_CARRY_ITEMS.has(itemKey)) {
    return {
      multiplier: pos === 4 ? 0.26 : 0.2,
      allowPriorityEscalation: false,
      curatedBonusScale: 0.22
    };
  }

  if (itemKey === 'nullifier' && !DEDICATED_SAVE_SUPPORTS.has(enemyHero.key)) {
    return {
      multiplier: pos === 4 ? 0.42 : 0.35,
      allowPriorityEscalation: false,
      curatedBonusScale: 0.35
    };
  }

  return {
    multiplier: pos === 4 ? 0.94 : 0.88,
    allowPriorityEscalation: true,
    curatedBonusScale: 0.9
  };
}

/**
 * Додає проактивні мета-бонуси проти типових предметів ворожих героїв (Butterfly, Orchid, Blade Mail, Satanic/Heart, Glimmer/Shadow Blade, Aeon Disk),
 * з урахуванням позиції ворога (Pos 1–3 для кор-предметів, Pos 4–5 для сапорт-сейвів).
 */
function buildProactiveMetaProfileBoosts(selectedProfiles, detectedEnemyItems, effectivePhase, counters, lang = 'uk') {
  const l = normalizeLang(lang);
  const profiles = (counters && counters.enemy_meta_item_profiles) || {};
  const spottedSet = new Set(detectedEnemyItems || []);
  const metaBoostsByItem = new Map();

  // У ранній грі (0–15 хв) дорогі лейтові мета-предмети ще не зібрані, тому множник менший
  const phaseFactor = effectivePhase === 'early' ? 0.35 : effectivePhase === 'late' ? 1.15 : 0.75;

  for (const [profileKey, prof] of Object.entries(profiles)) {
    if (!prof || !Array.isArray(prof.heroes) || !Array.isArray(prof.proactive_counters)) continue;
    if (prof.item_key && spottedSet.has(prof.item_key)) continue;

    const matchingEnemies = selectedProfiles.filter(({ hero, position }) => {
      if (!prof.heroes.includes(hero.key)) return false;
      // Кор-предмети (Butterfly, Satanic/Heart, Orchid, BKB, Blade Mail) релевантні лише коли ворог на кор-позиції (Pos 1–3)
      if (['butterfly', 'heart_satanic', 'orchid_bloodthorn', 'black_king_bar', 'blade_mail'].includes(profileKey)) {
        return position <= 3;
      }
      return true;
    });

    if (matchingEnemies.length === 0) continue;

    const enemyNames = matchingEnemies.map((e) => e.hero.name_en).join(', ');
    for (const pc of prof.proactive_counters) {
      const addedBonus = Math.round((pc.bonus || 4) * phaseFactor * 10) / 10;
      if (addedBonus < 1.5) continue;

      if (!metaBoostsByItem.has(pc.item_key)) {
        metaBoostsByItem.set(pc.item_key, {
          bonus: 0,
          reasons: []
        });
      }
      const entry = metaBoostsByItem.get(pc.item_key);
      entry.bonus = Math.min(8, entry.bonus + addedBonus);
      const reasonText = `${enemyNames}: ${pickLocalized(pc, 'reason', l)}`;
      if (!entry.reasons.includes(reasonText)) {
        entry.reasons.push(reasonText);
      }
    }
  }

  return metaBoostsByItem;
}

function buildOwnedItemsSet(ownedItemKeys) {
  const owned = new Set();
  if (!Array.isArray(ownedItemKeys)) return owned;

  for (const rawKey of ownedItemKeys) {
    if (!rawKey) continue;
    const key = String(rawKey).replace(/^item_/, '').trim();
    if (!key || key === 'empty') continue;
    owned.add(key);

    const covered = ITEM_UPGRADE_COVERS[key];
    if (Array.isArray(covered)) {
      for (const baseKey of covered) owned.add(baseKey);
    }
  }

  return owned;
}

function evaluatePositionFit(rule, myPosition, isFlexBoosted, lang = 'uk') {
  const l = normalizeLang(lang);
  const posNum = myPosition ? Number(myPosition) : null;
  if (isFlexBoosted && (posNum === 4 || posNum === 5)) {
    const flexBadge = {
      uk: `Адаптація Pos ${posNum}`,
      ru: `Адаптация Pos ${posNum}`,
      en: `Pos ${posNum} Flex`
    };
    return {
      fit: 'primary',
      multiplier: 1.45,
      isOffRole: false,
      positionBadgeUk: flexBadge[l],
      positionBadgeClass: 'text-bg-info'
    };
  }

  const primary = Array.isArray(rule.primary_positions) && rule.primary_positions.length > 0
    ? rule.primary_positions
    : [1, 2, 3, 4, 5];
  const allowed = Array.isArray(rule.positions) && rule.positions.length > 0
    ? rule.positions
    : primary;

  if (!posNum || posNum < 1 || posNum > 5) {
    return {
      fit: 'all',
      multiplier: 1.0,
      isOffRole: false,
      positionBadgeUk: null,
      positionBadgeClass: ''
    };
  }

  if (primary.includes(posNum)) {
    const isSignature = primary.length <= 2;
    const bestBadge = {
      uk: `Топ для Pos ${posNum}`,
      ru: `Топ для Pos ${posNum}`,
      en: `Best for Pos ${posNum}`
    };
    return {
      fit: 'primary',
      multiplier: isSignature ? 1.48 : 1.25,
      isOffRole: false,
      positionBadgeUk: bestBadge[l],
      positionBadgeClass: 'text-bg-success'
    };
  }

  if (allowed.includes(posNum)) {
    return {
      fit: 'secondary',
      multiplier: 1.0,
      isOffRole: false,
      positionBadgeUk: null,
      positionBadgeClass: ''
    };
  }

  const offroleBadge = {
    uk: `Для іншої ролі (Pos ${primary.join('/')})`,
    ru: `Для другой роли (Pos ${primary.join('/')})`,
    en: `Off-role (Pos ${primary.join('/')})`
  };

  return {
    fit: 'offrole',
    multiplier: 0.4,
    isOffRole: true,
    positionBadgeUk: offroleBadge[l],
    positionBadgeClass: 'text-bg-dark border border-secondary text-secondary'
  };
}

function buildItemExplanation({
  rule,
  matchedHeroes,
  heroReasons,
  tagReasons,
  synergyTriggered,
  triggerReasons,
  metaReasons,
  flexReason,
  allyBoostReason,
  allyAuraNote,
  lang = 'uk'
}) {
  const l = normalizeLang(lang);
  const parts = [];
  const againstWord = { uk: 'Проти', ru: 'Против', en: 'Against' }[l];

  if (triggerReasons.length > 0) {
    parts.push(triggerReasons[0]);
  }
  if (flexReason) {
    parts.push(flexReason);
  }
  if (allyBoostReason) {
    parts.push(allyBoostReason);
  }
  if (heroReasons.length > 0) {
    parts.push(heroReasons.slice(0, 2).join(' '));
  } else if (tagReasons.length > 0 && matchedHeroes.length > 0) {
    const names = matchedHeroes.map((h) => h.name_en).join(', ');
    parts.push(`${againstWord} ${names}: ${tagReasons[0]}`);
  } else if (metaReasons && metaReasons.length > 0) {
    parts.push(metaReasons[0]);
  } else if (parts.length === 0) {
    const summaryText = pickLocalized(rule, 'summary', l);
    if (summaryText) parts.push(summaryText);
  }

  if (synergyTriggered && rule.synergy_threshold) {
    const teamText = pickLocalized(rule.synergy_threshold, 'team_reason', l);
    if (teamText && !parts.some((p) => p.includes(teamText))) {
      parts.push(teamText);
    }
  }

  if (allyAuraNote) {
    parts.push(`(${allyAuraNote}).`);
  }

  return parts.join(' ');
}

function resolveEffectivePhase(matchPhase, clockTime) {
  if (matchPhase === 'early' || matchPhase === 'mid' || matchPhase === 'late') {
    return matchPhase;
  }
  if (clockTime != null && Number.isFinite(Number(clockTime))) {
    const t = Number(clockTime);
    if (t < 900) return 'early';
    if (t < 1800) return 'mid';
    return 'late';
  }
  return 'auto';
}

function getTimingMultiplier(itemTimingPhase, effectivePhase, itemCategory) {
  if (!effectivePhase || effectivePhase === 'auto') return 1.0;
  if (itemTimingPhase === effectivePhase) return 1.22;
  if (effectivePhase === 'early' && itemTimingPhase === 'late') return 0.72;
  if (effectivePhase === 'late' && itemTimingPhase === 'early' && itemCategory !== 'consumable') return 0.88;
  return 1.0;
}

/**
 * Обчислює множник загрози з урахуванням пізніх талантів (Late / 30+ хв).
 */
function getThreatPhaseMultiplier(threat, effectivePhase) {
  if (!threat) return 1.0;
  if (threat.phase === 'late') {
    if (effectivePhase === 'early') return 0.35;
    if (effectivePhase === 'mid') return 0.75;
    if (effectivePhase === 'late') return 1.35;
    return 0.85;
  }
  if (threat.late_spike && effectivePhase === 'late') {
    return 1.22;
  }
  return 1.0;
}

/**
 * Пропонує топ-3 контрпіки героїв на стадії драфту, коли «Мій герой» ще не обрано.
 */
function recommendCounterHeroes({ detectedThreats, excludedHeroIds, myPosition, counters, heroesById, lang = 'uk' }) {
  const l = normalizeLang(lang);
  const capabilities = (counters && counters.hero_counter_capabilities) || {};
  if (!detectedThreats || detectedThreats.length === 0) return [];

  const heroesByKey = new Map();
  for (const h of heroesById.values()) {
    heroesByKey.set(h.key, h);
  }

  const threatWeightMap = new Map(detectedThreats.map((t) => [t.tag, t.count]));
  const threatLabelMap = new Map(detectedThreats.map((t) => [t.tag, t.labelUk]));
  const candidates = [];

  for (const [heroKey, cap] of Object.entries(capabilities)) {
    const hero = heroesByKey.get(heroKey);
    if (!hero || excludedHeroIds.has(hero.id)) continue;

    let score = 0;
    const matchedTagsUk = [];
    for (const tag of cap.counters_tags || []) {
      const count = threatWeightMap.get(tag);
      if (!count) continue;
      score += 10 * count;
      matchedTagsUk.push(threatLabelMap.get(tag) || tag);
    }

    if (score === 0) continue;

    const positions = Array.isArray(cap.positions) ? cap.positions : [1, 2, 3, 4, 5];
    if (myPosition) {
      if (positions[0] === myPosition) score *= 1.45;
      else if (positions.includes(myPosition)) score *= 1.2;
      else score *= 0.5;
    }

    candidates.push({
      id: hero.id,
      key: hero.key,
      name_en: hero.name_en,
      icon: hero.icon,
      img: hero.img,
      positions,
      score: Math.round(score * 10) / 10,
      matchedTagsUk,
      reasonUk: pickLocalized(cap, 'reason', l)
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 3);
}

/**
 * Підбирає найкращі нейтральні предмети за тірами (Tier 1–4) під загрози ворожого піку та фазу гри.
 */
function recommendNeutralItems({ detectedThreats, effectivePhase, counters, itemsByKey, lang = 'uk' }) {
  const l = normalizeLang(lang);
  const rules = (counters && counters.neutral_item_rules) || {};
  if (!detectedThreats || detectedThreats.length === 0) return [];

  const threatWeightMap = new Map(detectedThreats.map((t) => [t.tag, t.count]));
  const scored = [];

  for (const [itemKey, rule] of Object.entries(rules)) {
    const itemData = itemsByKey.get(itemKey);
    if (!itemData) continue;

    let score = 0;
    for (const tag of rule.tags || []) {
      const count = threatWeightMap.get(tag);
      if (count) score += 10 * count;
    }

    if (score === 0) continue;

    const tier = Number(rule.tier) || 1;
    if (effectivePhase === 'early' && tier <= 2) score *= 1.35;
    else if (effectivePhase === 'mid' && (tier === 2 || tier === 3)) score *= 1.35;
    else if (effectivePhase === 'late' && tier >= 3) score *= 1.35;

    scored.push({
      itemKey,
      tier,
      nameEn: itemData.name_en || rule.name_en,
      img: itemData.img,
      reasonUk: pickLocalized(rule, 'reason', l),
      score: Math.round(score * 10) / 10
    });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tier - b.tier;
  });

  // Беремо по 1 найкращому предмету з кожного представленого тіра (до 4 предметів Tier 1–4)
  const byTierBest = [];
  const seenTiers = new Set();
  for (const entry of scored) {
    if (!seenTiers.has(entry.tier)) {
      seenTiers.add(entry.tier);
      byTierBest.push(entry);
    }
    if (byTierBest.length >= 4) break;
  }

  byTierBest.sort((a, b) => a.tier - b.tier);
  return byTierBest;
}

function classifyPriority({ score, maxCuratedPriority, synergyTriggered, itemCategory, forcedPriority }) {
  if (
    forcedPriority === 'critical' ||
    maxCuratedPriority === 'critical' ||
    score >= 22 ||
    (synergyTriggered && score >= 18 && itemCategory === 'critical')
  ) {
    return 'critical';
  }
  if (forcedPriority === 'recommended' || maxCuratedPriority === 'high' || score >= 12) {
    return 'recommended';
  }
  return 'situational';
}

function resolveManualPositionFromInput(heroId, index, positionsInput) {
  if (!positionsInput) return null;
  if (Array.isArray(positionsInput)) {
    return positionsInput[index] != null ? positionsInput[index] : null;
  }
  if (typeof positionsInput === 'object') {
    if (positionsInput[heroId] != null) return positionsInput[heroId];
    if (positionsInput[String(heroId)] != null) return positionsInput[String(heroId)];
  }
  return null;
}

/**
 * Аналізує ворожий пік (з позиціями Pos 1–5 або Авто), союзників (з позиціями Pos 1–5 або Авто),
 * мого героя + позицію (Pos 1–5), GSI та помічені предмети ворога (локалізація UA / RU / EN).
 */
function analyzeEnemyDraft(options, context) {
  const { heroesById, itemsByKey, counters } = context || {};
  const normalizedOpts = Array.isArray(options) ? { enemyHeroIds: options } : (options || {});
  const lang = normalizeLang(normalizedOpts.language || 'uk');

  const enemyHeroIds = normalizedOpts.enemyHeroIds || [];
  const allyHeroIds = normalizedOpts.allyHeroIds || [];
  const enemyPositionsInput = normalizedOpts.enemyPositions || null;
  const allyPositionsInput = normalizedOpts.allyPositions || null;
  const myHeroId = normalizedOpts.myHeroId != null ? Number(normalizedOpts.myHeroId) : null;
  const myPosition = normalizedOpts.myPosition != null ? Number(normalizedOpts.myPosition) : null;
  const matchPhase = normalizedOpts.matchPhase || 'auto';
  const clockTime = normalizedOpts.clockTime != null ? Number(normalizedOpts.clockTime) : null;
  const effectivePhase = resolveEffectivePhase(matchPhase, clockTime);
  const ownedSet = buildOwnedItemsSet(normalizedOpts.ownedItemKeys);
  if (normalizedOpts.hasAghanimsScepter) {
    ownedSet.add('ultimate_scepter');
    ownedSet.add('ultimate_scepter_2');
  }
  if (normalizedOpts.hasAghanimsShard) {
    ownedSet.add('aghanims_shard');
  }
  const detectedEnemyItems = Array.from(
    new Set(
      (Array.isArray(normalizedOpts.detectedEnemyItems) ? normalizedOpts.detectedEnemyItems : [])
        .map((k) => String(k).replace(/^item_/, '').trim())
        .filter(Boolean)
    )
  );

  if (!heroesById || !itemsByKey || !counters) {
    return {
      language: lang,
      selectedHeroes: [],
      allyHeroes: [],
      myHero: null,
      myPosition,
      effectivePhase,
      flexAdaptation: null,
      detectedThreats: [],
      suppressedItems: [],
      allySynergySummary: [],
      counterPickHeroes: [],
      neutralRecommendations: [],
      recommendations: []
    };
  }

  const myHero = myHeroId && Number.isFinite(myHeroId) ? heroesById.get(myHeroId) || null : null;
  const { redundantMap, flexAdaptation, flexBoostsByKey } = resolveMyHeroContext(myHero, myPosition, counters, lang);

  const uniqueEnemyIds = Array.from(
    new Set((Array.isArray(enemyHeroIds) ? enemyHeroIds : []).map((id) => Number(id)).filter(Number.isFinite))
  ).slice(0, 5);

  const uniqueAllyIds = Array.from(
    new Set((Array.isArray(allyHeroIds) ? allyHeroIds : []).map((id) => Number(id)).filter(Number.isFinite))
  )
    .filter((id) => id !== myHeroId && !uniqueEnemyIds.includes(id))
    .slice(0, 4);

  const selectedProfiles = uniqueEnemyIds
    .map((id, idx) => {
      const hero = heroesById.get(id);
      if (!hero) return null;
      const manualPos = resolveManualPositionFromInput(id, idx, enemyPositionsInput);
      const posInfo = resolveHeroEffectivePosition(hero, manualPos, counters, lang);
      return {
        hero,
        profile: resolveHeroThreatProfile(hero, counters, lang),
        position: posInfo.position,
        isManualPosition: posInfo.isManual,
        positionLabelUk: posInfo.labelUk
      };
    })
    .filter(Boolean);

  const allyProfiles = uniqueAllyIds
    .map((id, idx) => {
      const hero = heroesById.get(id);
      if (!hero) return null;
      const manualPos = resolveManualPositionFromInput(id, idx, allyPositionsInput);
      const posInfo = resolveHeroEffectivePosition(hero, manualPos, counters, lang);
      return {
        hero,
        profile: resolveHeroThreatProfile(hero, counters, lang),
        position: posInfo.position,
        isManualPosition: posInfo.isManual,
        positionLabelUk: posInfo.labelUk
      };
    })
    .filter(Boolean);

  if (selectedProfiles.length === 0 && detectedEnemyItems.length === 0) {
    return {
      language: lang,
      selectedHeroes: [],
      allyHeroes: allyProfiles.map(({ hero, position, isManualPosition }) => ({
        id: hero.id,
        key: hero.key,
        name_en: hero.name_en,
        icon: hero.icon,
        position,
        isManualPosition
      })),
      myHero: myHero ? { id: myHero.id, key: myHero.key, name_en: myHero.name_en, icon: myHero.icon, img: myHero.img } : null,
      myPosition,
      effectivePhase,
      flexAdaptation,
      detectedThreats: [],
      suppressedItems: [],
      allySynergySummary: [],
      counterPickHeroes: [],
      neutralRecommendations: [],
      recommendations: []
    };
  }

  const allySynergy = resolveAllySynergyContext(allyProfiles, myHero, counters, lang);
  const allySynergySummary = [];
  if (allySynergy.auraAllies.length > 0) {
    const auraPrefix = { uk: 'Носій аур', ru: 'Носитель аур', en: 'Aura carrier' }[lang];
    allySynergySummary.push(
      `${auraPrefix}: ${allySynergy.auraAllies.map((h) => `${h.name_en} (Pos ${h.position})`).join(', ')}`
    );
  }
  if (allySynergy.physicalCorePower >= 1.5 && allySynergy.physicalAllies.length > 0) {
    const physPotLabel = { uk: 'Фіз-потенціал', ru: 'Физ-потенциал', en: 'Phys potential' }[lang];
    allySynergySummary.push(`${physPotLabel} (${allySynergy.physicalAllies.map((h) => h.name_en).join(', ')})`);
  }
  if (allySynergy.magicCorePower >= 1.6 && allySynergy.magicAllies.length > 0) {
    const magPotLabel = { uk: 'Маг-потенціал', ru: 'Маг-потенциал', en: 'Magic potential' }[lang];
    allySynergySummary.push(`${magPotLabel} (${allySynergy.magicAllies.map((h) => h.name_en).join(', ')})`);
  }

  // Збираємо карту активних тригерів по виявлених ворожих предметах
  const enemyTriggerRules = counters.enemy_item_triggers || {};
  const triggerBoostsByCounterKey = new Map();
  for (const enemyItemKey of detectedEnemyItems) {
    const trig = enemyTriggerRules[enemyItemKey];
    if (!trig || !Array.isArray(trig.counters)) continue;
    for (const c of trig.counters) {
      if (!triggerBoostsByCounterKey.has(c.item_key)) {
        triggerBoostsByCounterKey.set(c.item_key, {
          totalBonus: 0,
          forcePriority: null,
          triggeredBy: [],
          reasons: []
        });
      }
      const entry = triggerBoostsByCounterKey.get(c.item_key);
      entry.totalBonus += c.bonus || 12;
      if (c.force_priority === 'critical' || (!entry.forcePriority && c.force_priority)) {
        entry.forcePriority = c.force_priority;
      }
      if (!entry.triggeredBy.includes(trig.name_en)) {
        entry.triggeredBy.push(trig.name_en);
      }
      const localizedReason = pickLocalized(c, 'reason', lang);
      if (localizedReason && !entry.reasons.includes(localizedReason)) {
        entry.reasons.push(localizedReason);
      }
    }
  }

  // Проактивні мета-профілі ворожих героїв
  const proactiveMetaBoosts = buildProactiveMetaProfileBoosts(
    selectedProfiles,
    detectedEnemyItems,
    effectivePhase,
    counters,
    lang
  );

  // Загрози ворогів
  const threatSummaryMap = new Map();
  const threatTagsMeta = counters.threat_tags || {};
  for (const { hero, profile, position } of selectedProfiles) {
    for (const threat of profile.threats) {
      if (threat.phase === 'late' && effectivePhase === 'early') continue;
      if (!threatSummaryMap.has(threat.tag)) {
        const meta = threatTagsMeta[threat.tag] || {};
        threatSummaryMap.set(threat.tag, {
          tag: threat.tag,
          labelUk: pickLocalized(meta, 'label', lang) || threat.tag,
          category: meta.category || 'other',
          count: 0,
          heroes: []
        });
      }
      const entry = threatSummaryMap.get(threat.tag);
      if (!entry.heroes.some((h) => h.id === hero.id)) {
        entry.count += 1;
        entry.heroes.push({ id: hero.id, key: hero.key, name_en: hero.name_en, icon: hero.icon, position });
      }
    }
  }
  const detectedThreats = Array.from(threatSummaryMap.values()).sort((a, b) => b.count - a.count);

  const itemRules = counters.item_rules || {};
  const recommendations = [];
  const suppressedItems = [];

  const consumedGsiText = {
    uk: 'Вже куплено або поглинуто (GSI)',
    ru: 'Уже куплено или поглощено (GSI)',
    en: 'Already owned or consumed (GSI)'
  }[lang];
  const auraNotePrefix = {
    uk: 'Ймовірно збере союзний',
    ru: 'Вероятно соберет союзный',
    en: 'Likely built by allied'
  }[lang];
  const spottedBadgePrefix = {
    uk: 'Виявлено у ворога',
    ru: 'Обнаружено у врага',
    en: 'Spotted on enemy'
  }[lang];

  for (const [itemKey, rule] of Object.entries(itemRules)) {
    const itemData = itemsByKey.get(itemKey);
    if (!itemData) continue;

    const isOwned = ownedSet.has(itemKey);
    if (isOwned && CONSUMED_UNIQUE_UPGRADE_KEYS.has(itemKey)) {
      suppressedItems.push({
        itemKey,
        nameEn: itemData.name_en || rule.name_en,
        reasonUk: consumedGsiText
      });
      continue;
    }
    if (!isOwned && redundantMap.has(itemKey)) {
      suppressedItems.push({
        itemKey,
        nameEn: itemData.name_en || rule.name_en,
        reasonUk: redundantMap.get(itemKey)
      });
      continue;
    }

    let baseScore = 0;
    const matchedHeroes = [];
    const heroReasons = [];
    const tagReasons = [];
    const matchedTagsMap = new Map();
    let maxCuratedPriority = null;

    const ruleTagMap = new Map((rule.counters_tags || []).map((ct) => [ct.tag, ct]));

    for (const { hero, profile, position } of selectedProfiles) {
      const heroMultiplier = profile.isCurated ? 1.0 : 0.8;
      const posWeighting = getEnemyPositionItemWeighting(hero, position, itemKey);
      const heroTagScores = [];

      for (const threat of profile.threats) {
        const ct = ruleTagMap.get(threat.tag);
        if (!ct) continue;
        const factor = SEVERITY_FACTOR[threat.severity] || 0.6;
        const phaseMult = getThreatPhaseMultiplier(threat, effectivePhase);
        const points = ct.weight * factor * heroMultiplier * posWeighting.multiplier * phaseMult;
        heroTagScores.push({ points, ct, threat });

        if (!matchedTagsMap.has(threat.tag)) {
          const meta = threatTagsMeta[threat.tag] || {};
          matchedTagsMap.set(threat.tag, {
            tag: threat.tag,
            labelUk: pickLocalized(meta, 'label', lang) || threat.tag
          });
        }
        const ctReason = pickLocalized(ct, 'reason', lang);
        if (ctReason && !tagReasons.includes(ctReason)) {
          tagReasons.push(ctReason);
        }
      }

      heroTagScores.sort((a, b) => b.points - a.points);
      let heroScore = 0;
      if (heroTagScores.length > 0) {
        heroScore += heroTagScores[0].points;
        if (heroTagScores.length > 1) heroScore += heroTagScores[1].points * 0.45;
      }

      const curatedOverride = profile.priorityItemsByKey.get(itemKey);
      if (curatedOverride) {
        heroScore += (curatedOverride.score_bonus || 0) * posWeighting.curatedBonusScale;
        const overrideReason = pickLocalized(curatedOverride, 'reason', lang);
        if (overrideReason && posWeighting.allowPriorityEscalation) {
          heroReasons.push(overrideReason);
        }
        if (posWeighting.allowPriorityEscalation) {
          if (
            curatedOverride.priority === 'critical' ||
            (curatedOverride.priority === 'high' && maxCuratedPriority !== 'critical')
          ) {
            maxCuratedPriority = curatedOverride.priority;
          }
        }
      }

      if (heroScore > 0) {
        baseScore += heroScore;
        matchedHeroes.push({
          id: hero.id,
          key: hero.key,
          name_en: hero.name_en,
          icon: hero.icon,
          img: hero.img,
          position,
          contribution: Math.round(heroScore * 10) / 10
        });
      }
    }

    let synergyTriggered = false;
    const synergy = rule.synergy_threshold;
    if (synergy && matchedHeroes.length >= (synergy.min_matching_heroes || 2)) {
      baseScore += synergy.bonus_weight || 0;
      synergyTriggered = true;
    }

    // 1. Враховуємо тригери ворожого закупа (Enemy Inventory Watcher)
    const triggerInfo = triggerBoostsByCounterKey.get(itemKey) || null;
    if (triggerInfo) {
      baseScore += triggerInfo.totalBonus;
    }

    // 1b. Враховуємо проактивні мета-профілі ворогів (якщо предмет уже релевантний проти драфту)
    const metaInfo = proactiveMetaBoosts.get(itemKey) || null;
    if (metaInfo && matchedHeroes.length > 0) {
      baseScore += metaInfo.bonus;
    }

    // 2. Враховуємо матрицю адаптації (Carry як Pos 4/5)
    const flexBoost = flexBoostsByKey.get(itemKey) || null;
    if (flexBoost) {
      baseScore += (flexBoost.score_bonus || 14) + 12;
    }

    // 3. Враховуємо синергію союзників (фіз / маг бафи залежно від Pos 1/2 союзників)
    const allyBoost = allySynergy.boostMap.get(itemKey) || null;
    if (allyBoost) {
      baseScore += allyBoost.bonus || 10;
    }

    if (matchedHeroes.length === 0 && !triggerInfo && !flexBoost && !allyBoost) {
      continue;
    }

    // 4. Зниження пріоритету командних аур, якщо серед союзників є природжений носій аур на релевантній позиції (напр. Pos 3)
    let allyAuraNote = null;
    const auraDiscount = allySynergy.auraDiscountByItem.get(itemKey);
    if (auraDiscount) {
      allyAuraNote = `${auraNotePrefix} ${auraDiscount.carrierName}`;
      baseScore *= auraDiscount.mult;
      if (maxCuratedPriority === 'critical' && auraDiscount.mult <= 0.65) {
        maxCuratedPriority = 'high';
      }
    }

    if (baseScore < 6 && !maxCuratedPriority && !triggerInfo && !flexBoost && !allyBoost) continue;

    const forcedPriority = (triggerInfo && triggerInfo.forcePriority) || (flexBoost && flexBoost.priority) || null;
    const priorityKey = classifyPriority({
      score: baseScore,
      maxCuratedPriority,
      synergyTriggered,
      itemCategory: rule.category,
      forcedPriority
    });
    const priorityMeta = PRIORITY_META[priorityKey];
    const posEval = evaluatePositionFit(rule, myPosition, Boolean(flexBoost), lang);
    const timingPhase = rule.timing_phase || 'mid';
    const timingMult = getTimingMultiplier(timingPhase, effectivePhase, rule.category);
    const positionScore = baseScore * posEval.multiplier * timingMult;

    matchedHeroes.sort((a, b) => b.contribution - a.contribution);

    recommendations.push({
      itemKey,
      itemId: itemData.id,
      nameEn: itemData.name_en || rule.name_en,
      nameUk: itemData.name_uk || itemData.name_en || rule.name_en,
      cost: itemData.cost || 0,
      img: itemData.img,
      category: rule.category || 'utility',
      categoryLabelUk: (CATEGORY_LABELS_BY_LANG[lang] && CATEGORY_LABELS_BY_LANG[lang][rule.category || 'utility']) || rule.category || 'utility',
      roleHintUk: pickLocalized(rule, 'role_hint', lang),
      timingPhase,
      timingLabelUk: pickLocalized(rule, 'timing_label', lang),
      positions: rule.positions || [1, 2, 3, 4, 5],
      primaryPositions: rule.primary_positions || [1, 2, 3, 4, 5],
      positionFit: posEval.fit,
      isOffRole: posEval.isOffRole,
      positionBadgeUk: posEval.positionBadgeUk,
      positionBadgeClass: posEval.positionBadgeClass,
      isOwned,
      enemyItemBadgeUk: triggerInfo ? `${spottedBadgePrefix}: ${triggerInfo.triggeredBy.join(', ')}` : null,
      allySynergyBadgeUk: allyBoost ? allyBoost.badgeUk : null,
      allyAuraNoteUk: allyAuraNote,
      priorityKey,
      priorityRank: priorityMeta.rank,
      priorityLabelUk: getPriorityLabel(priorityMeta, lang),
      priorityBadgeClass: priorityMeta.badgeClass,
      score: Math.round(positionScore * 10) / 10,
      baseScore: Math.round(baseScore * 10) / 10,
      synergyTriggered,
      targetHeroes: matchedHeroes,
      matchedTags: Array.from(matchedTagsMap.values()),
      whyBuildUk: buildItemExplanation({
        rule,
        matchedHeroes,
        heroReasons,
        tagReasons,
        synergyTriggered,
        triggerReasons: triggerInfo ? triggerInfo.reasons : [],
        metaReasons: metaInfo ? metaInfo.reasons : [],
        flexReason: flexBoost ? pickLocalized(flexBoost, 'reason', lang) : null,
        allyBoostReason: allyBoost ? allyBoost.reasonUk : null,
        allyAuraNote,
        lang
      })
    });
  }

  recommendations.sort((a, b) => {
    if (a.isOffRole !== b.isOffRole) return a.isOffRole ? 1 : -1;
    // Тригери виявленого ворожого закупа на релевантній ролі мають найвищий пріоритет
    const aHasTrigger = Boolean(a.enemyItemBadgeUk && !a.isOffRole);
    const bHasTrigger = Boolean(b.enemyItemBadgeUk && !b.isOffRole);
    if (aHasTrigger !== bHasTrigger) return aHasTrigger ? -1 : 1;

    if (myPosition) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.priorityRank !== a.priorityRank) return b.priorityRank - a.priorityRank;
    } else {
      if (b.priorityRank !== a.priorityRank) return b.priorityRank - a.priorityRank;
      if (b.score !== a.score) return b.score - a.score;
    }
    if (b.targetHeroes.length !== a.targetHeroes.length) {
      return b.targetHeroes.length - a.targetHeroes.length;
    }
    return a.cost - b.cost;
  });

  const excludedHeroIds = new Set([...uniqueEnemyIds, ...uniqueAllyIds]);
  if (myHero) excludedHeroIds.add(myHero.id);

  const counterPickHeroes = !myHero
    ? recommendCounterHeroes({
        detectedThreats,
        excludedHeroIds,
        myPosition,
        counters,
        heroesById,
        lang
      })
    : [];

  const neutralRecommendations = recommendNeutralItems({
    detectedThreats,
    effectivePhase,
    counters,
    itemsByKey,
    lang
  });

  return {
    language: lang,
    selectedHeroes: selectedProfiles.map(({ hero, profile, position, isManualPosition, positionLabelUk }) => ({
      id: hero.id,
      key: hero.key,
      name_en: hero.name_en,
      img: hero.img,
      icon: hero.icon,
      position,
      isManualPosition,
      positionLabelUk,
      isCurated: profile.isCurated
    })),
    allyHeroes: allyProfiles.map(({ hero, position, isManualPosition, positionLabelUk }) => ({
      id: hero.id,
      key: hero.key,
      name_en: hero.name_en,
      icon: hero.icon,
      img: hero.img,
      position,
      isManualPosition,
      positionLabelUk
    })),
    myHero: myHero ? { id: myHero.id, key: myHero.key, name_en: myHero.name_en, icon: myHero.icon, img: myHero.img } : null,
    myPosition,
    effectivePhase,
    flexAdaptation,
    allySynergySummary,
    detectedThreats,
    suppressedItems,
    counterPickHeroes,
    neutralRecommendations,
    recommendations: recommendations.slice(0, 14)
  };
}

const api = {
  POSITION_LABELS_UK,
  POSITION_LABELS_BY_LANG,
  resolveHeroEffectivePosition,
  analyzeEnemyDraft
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  root.__d2oAnalyzer = api;
}
})(typeof globalThis !== 'undefined' ? globalThis : window);
