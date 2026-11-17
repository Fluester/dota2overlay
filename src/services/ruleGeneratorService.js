(function (root) {
const isNodeEnv = typeof require === 'function' && typeof module !== 'undefined' && Boolean(module.exports);
const fs = isNodeEnv ? require('fs') : null;
const path = isNodeEnv ? require('path') : null;
const storagePaths = isNodeEnv ? require('./storagePaths') : null;
const presets = isNodeEnv ? require('./rulePresets') : (root.__d2oRulePresets || {});
const {
  THREAT_TAGS_META,
  FALLBACK_TAG_MAPPING,
  BREAKABLE_PASSIVES_MAP,
  UNBREAKABLE_PASSIVES_SET,
  ITEM_POSITIONS,
  CURATED_ITEM_RULES,
  NEUTRAL_ITEM_RULES,
  HERO_COUNTER_CAPABILITIES,
  ALLY_SYNERGY_RULES,
  FLEX_SUPPORT_MATRIX,
  ENEMY_ITEM_TRIGGERS,
  ENEMY_META_ITEM_PROFILES,
  HERO_META_POSITIONS,
  HERO_INNATE_REDUNDANT,
  SPECIALIZED_HERO_OVERRIDES
} = presets;

function readJsonSafe(filePath, fallback = null) {
  if (!fs || !path) return fallback;
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[RuleGenerator] Помилка читання ${path.basename(filePath)}:`, err.message);
    return fallback;
  }
}

function writeJsonSafe(filePath, payload) {
  if (!fs || !path || !storagePaths) return;
  storagePaths.ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function normalizeAbilitiesCollection(raw, mapTarget) {
  if (!raw) return;
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (entry && entry.name) {
        mapTarget.set(String(entry.name), entry);
      }
    }
    return;
  }
  if (typeof raw === 'object') {
    for (const [key, entry] of Object.entries(raw)) {
      if (entry && typeof entry === 'object') {
        mapTarget.set(key, { name: key, ...entry });
      }
    }
  }
}

/**
 * Завантажує abilities.json та/або opendota_abilities.json із userData або вбудованої Data/.
 */
function loadAbilitiesDictionary() {
  const map = new Map();
  if (!storagePaths || !path) return map;
  const bundledDir = storagePaths.getBundledDataDir();
  const writableDir = storagePaths.getWritableDataDir();
  const writableCache = storagePaths.getCacheDir();

  const candidateFiles = [
    path.join(bundledDir, 'abilities.json'),
    path.join(bundledDir, 'cache', 'opendota_abilities.json'),
    path.join(writableDir, 'abilities.json'),
    path.join(writableCache, 'opendota_abilities.json')
  ];

  const seenPaths = new Set();
  for (const filePath of candidateFiles) {
    const resolved = path.resolve(filePath);
    if (seenPaths.has(resolved)) continue;
    seenPaths.add(resolved);
    const parsed = readJsonSafe(filePath, null);
    if (parsed) {
      normalizeAbilitiesCollection(parsed, map);
    }
  }

  return map;
}

function extractAttribText(ab) {
  const attrib = ab && Array.isArray(ab.attrib) ? ab.attrib : [];
  if (attrib.length === 0) return '';
  return attrib
    .map((a) => `${a.key || ''} ${a.header || ''} ${Array.isArray(a.value) ? a.value.join('/') : (a.value || '')}`)
    .join(' ');
}

function normalizeBehaviorArray(rawBehavior, odBehavior) {
  const combined = [
    ...(Array.isArray(rawBehavior) ? rawBehavior : rawBehavior ? [rawBehavior] : []),
    ...(Array.isArray(odBehavior) ? odBehavior : odBehavior ? [odBehavior] : [])
  ];
  const set = new Set();
  for (const b of combined) {
    const norm = String(b || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (norm) set.add(norm);
  }
  return Array.from(set);
}

function normalizeAbilityEntry(baseAb, odAb) {
  const ab = baseAb || {};
  const extra = odAb || {};
  const notes = Array.isArray(ab.notes_en) ? ab.notes_en.join(' ') : '';
  const behaviorArr = normalizeBehaviorArray(ab.behavior, extra.behavior);

  const name = ab.name || extra.name || '';
  const nameEn = ab.name_en || extra.dname || name || '';
  const descEn = ab.desc_en || extra.desc || '';
  const shardEn = ab.shard_en || '';
  const scepterEn = ab.scepter_en || '';
  const attribText = extractAttribText(extra);
  const dmgType = String(ab.damage_type || extra.dmg_type || '').toLowerCase();
  const dispellable = String(ab.dispellable || extra.dispellable || '').toLowerCase();
  const immunity = String(ab.immunity || '').toLowerCase();
  const bkbPierce = String(ab.bkbpierce || extra.bkbpierce || '').toLowerCase();
  const piercesBkb =
    bkbPierce === 'yes' ||
    immunity.includes('enemies_yes') ||
    /\bpierces? debuff immunity\b|\bpierces? spell immunity\b/i.test(`${descEn} ${notes} ${shardEn} ${scepterEn}`);

  const isInnate = Boolean(ab.is_innate || extra.is_innate);
  const isHiddenOrNotLearnable = behaviorArr.includes('hidden') || behaviorArr.includes('not_learnable');
  const isPassive = behaviorArr.includes('passive') && !behaviorArr.includes('unit_target') && !behaviorArr.includes('point_target') && !behaviorArr.includes('no_target');
  const hasScepterOrShard = Boolean(
    ab.has_shard || ab.has_scepter || ab.granted_by_shard || ab.granted_by_scepter || shardEn || scepterEn
  );
  const tags = Array.isArray(ab.tags) ? ab.tags.map((t) => String(t).toLowerCase()) : [];

  return {
    name,
    name_en: nameEn,
    desc_en: descEn,
    notes_en: notes,
    shard_en: shardEn,
    scepter_en: scepterEn,
    attrib_text: attribText,
    damage_type: dmgType,
    dispellable,
    immunity,
    pierces_bkb: piercesBkb,
    behavior: behaviorArr,
    is_innate: isInnate,
    is_hidden_or_not_learnable: isHiddenOrNotLearnable,
    is_passive: isPassive,
    has_scepter_or_shard: hasScepterOrShard,
    granted_by_shard: Boolean(ab.granted_by_shard),
    granted_by_scepter: Boolean(ab.granted_by_scepter),
    tags,
    combinedText: `${nameEn} ${descEn} ${shardEn} ${scepterEn} ${attribText}`.toLowerCase()
  };
}

/**
 * Перевіряє, чи вимикається пасивна або вроджена здібність ефектом Break (Silver Edge).
 */
function checkBreakablePassive(ab) {
  if (!ab || !ab.name) return null;
  if (UNBREAKABLE_PASSIVES_SET.has(ab.name)) return null;

  const preset = BREAKABLE_PASSIVES_MAP[ab.name];
  if (preset) {
    return {
      breakable: true,
      severity: preset.severity || 2,
      note_uk: preset.note_uk,
      note_ru: preset.note_ru || preset.note_uk,
      note_en: preset.note_en || preset.note_uk
    };
  }

  // Якщо в офіційних нотатках здібності прямо вказано, що Break вимикає її ефект
  if (
    (ab.is_passive || ab.is_innate) &&
    /\bbreak disables\b|\bbreak prevents\b/i.test(ab.notes_en || '') &&
    !/\bbreak does not disable\b/i.test((ab.notes_en || '').replace(/break does not disable the bonuses from existing stacks/i, ''))
  ) {
    return {
      breakable: true,
      severity: 2,
      note_uk: `${ab.is_innate ? 'Вроджена пасивка' : 'Пасивна здібність'} (${ab.name_en}), що вимикається ефектом Break.`,
      note_ru: `${ab.is_innate ? 'Врожденная пассивка' : 'Пассивная способность'} (${ab.name_en}), отключаемая эффектом Break.`,
      note_en: `${ab.is_innate ? 'Innate passive' : 'Passive ability'} (${ab.name_en}) disabled by Break.`
    };
  }

  return null;
}

/**
 * Розбирає дерево талантів 10, 15, 20 та 25 рівнів героя і знаходить пізні сплески загроз (Late / 30+ хв).
 */
function parseHeroTalents(hero) {
  const rawTalents = Array.isArray(hero.talents) ? hero.talents : [];
  const normalizedTalents = rawTalents.map((t, index) => {
    const level = t.level
      ? (t.level <= 4 ? [10, 15, 20, 25][t.level - 1] : Number(t.level))
      : index < 2 ? 10 : index < 4 ? 15 : index < 6 ? 20 : 25;
    return {
      id: t.id || null,
      level,
      name_en: t.name_en || '',
      name_uk: t.name_uk || ''
    };
  });

  const lateTalentSpikes = [];
  const addLateSpike = (tag, severity, level, talentName, note_uk, note_ru, note_en) => {
    if (!lateTalentSpikes.some((s) => s.tag === tag)) {
      lateTalentSpikes.push({
        tag,
        severity,
        phase: 'late',
        talent_level: level,
        source_ability: `Talent ${level} (${talentName})`,
        note_uk,
        note_ru: note_ru || note_uk,
        note_en: note_en || note_uk
      });
    }
  };

  for (const tal of normalizedTalents) {
    const txt = (tal.name_en || '').toLowerCase();
    if (!txt) continue;
    const isHighTier = tal.level >= 20;

    // 1. Таланти на ухилення або осліплення (Evasion / Miss)
    if (/\b(evasion|miss|blinding light|aoe laser)\b/i.test(txt)) {
      addLateSpike(
        'evasion',
        isHighTier ? 3 : 2,
        tal.level,
        tal.name_en,
        `Талант ${tal.level} рівня (${tal.name_en}) посилює ухилення/промахи в пізній грі — зростає потреба в MKB.`,
        `Талант ${tal.level} уровня (${tal.name_en}) усиливает уклонение/промахи в поздней игре — растет потребность в MKB.`,
        `Level ${tal.level} talent (${tal.name_en}) boosts evasion/miss chance in late game — increases need for MKB.`
      );
    }

    // 2. Таланти на ілюзії (додаткові копії, зменшення вхідної шкоди ілюзій, сильні ілюзії)
    if (/\b(illusion|juxtapose|mirror image|phantasm|wall of replica|conjure image)\b/i.test(txt) && isHighTier) {
      addLateSpike(
        'illusions',
        3,
        tal.level,
        tal.name_en,
        `Талант ${tal.level} рівня (${tal.name_en}) різко посилює ілюзії на 30+ хв.`,
        `Талант ${tal.level} уровня (${tal.name_en}) резко усиливает иллюзии на 30+ мин.`,
        `Level ${tal.level} talent (${tal.name_en}) significantly strengthens illusions at 30+ min.`
      );
    }

    // 3. Таланти на сильний хіл / вампіризм / регенерацію на 20–25 рівнях
    if (
      isHighTier &&
      /\b(lifesteal|spell lifesteal|heal|regen|dismember damage\/heal|voodoo restoration|feast heal|berserker's blood|dragon blood|life drain|purification|mist coil)\b/i.test(txt) &&
      !/\bmana regen\b|\bregen reduction\b/i.test(txt)
    ) {
      addLateSpike(
        'heal_regen',
        3,
        tal.level,
        tal.name_en,
        `Пізній талант ${tal.level} рівня (${tal.name_en}) дає потужний сплеск лікування/вампіризму.`,
        `Поздний талант ${tal.level} уровня (${tal.name_en}) дает мощный всплеск лечения/вампиризма.`,
        `Late level ${tal.level} talent (${tal.name_en}) grants a major healing/lifesteal spike.`
      );
    }

    // 4. Таланти на чисту шкоду або пробиття BKB (Pure / Pierces Debuff Immunity)
    if (/\b(pure|pierces? debuff immunity|pierces? spell immunity)\b/i.test(txt)) {
      const targetTag = /\breality rift\b/i.test(txt) ? 'unit_target_control' : 'magic_burst';
      addLateSpike(
        targetTag,
        3,
        tal.level,
        tal.name_en,
        `Талант ${tal.level} рівня (${tal.name_en}) дає чисту шкоду або пробиття BKB у лейті.`,
        `Талант ${tal.level} уровня (${tal.name_en}) дает чистый урон или пробитие BKB в лейте.`,
        `Level ${tal.level} talent (${tal.name_en}) grants pure damage or BKB-piercing in late game.`
      );
    }

    // 5. Таланти на розвіювання або незнімні сейв-бафи (Strong Dispel / Basic Dispel / Jingu Undispellable)
    if (
      /\b(strong dispel|self-dispel|jingu mastery undispellable)\b/i.test(txt) &&
      isHighTier
    ) {
      addLateSpike(
        'dispellable_save',
        2,
        tal.level,
        tal.name_en,
        `Талант ${tal.level} рівня (${tal.name_en}) змінює механіку розвіювання/сейву в пізній грі.`,
        `Талант ${tal.level} уровня (${tal.name_en}) меняет механику развеивания/сейва в поздней игре.`,
        `Level ${tal.level} talent (${tal.name_en}) upgrades dispel/save mechanics in late game.`
      );
    }

    // 6. Таланти на AoE Hex / Global Silence / довгий сайленс
    if (isHighTier && /\b(aoe hex|global silence|last word|silence duration)\b/i.test(txt)) {
      addLateSpike(
        'silence_zone',
        3,
        tal.level,
        tal.name_en,
        `Талант ${tal.level} рівня (${tal.name_en}) критично посилює масовий контроль/сайленс на 30+ хв.`,
        `Талант ${tal.level} уровня (${tal.name_en}) критически усиливает массовый контроль/сайленс на 30+ мин.`,
        `Level ${tal.level} talent (${tal.name_en}) critically empowers AoE control/silence at 30+ min.`
      );
    }
  }

  return {
    talents: normalizedTalents,
    talentsCount: normalizedTalents.length,
    lateTalentSpikes
  };
}

/**
 * Збирає та класифікує всі 4 категорії механік героя:
 * 1) Вроджені здібності (Innate, включно з Hidden / Not Learnable)
 * 2) Активні здібності (базові, ультимейт + Aghanim's Scepter / Shard)
 * 3) Пасивні здібності
 * 4) Таланти 10, 15, 20, 25 рівнів
 */
function collectHeroAbilitiesAndTalents(hero, abilitiesByName) {
  const merged = [];
  const seenNames = new Set();

  for (const ab of hero.abilities || []) {
    if (!ab) continue;
    const od = ab.name ? abilitiesByName.get(ab.name) : null;
    if (ab.name) seenNames.add(ab.name);
    merged.push(normalizeAbilityEntry(ab, od));
  }

  // Підхоплюємо приховані/додаткові скіли героя з abilities.json за префіксом ключа
  if (hero.key && abilitiesByName.size > 0) {
    const prefix = `${hero.key}_`;
    for (const [abKey, od] of abilitiesByName.entries()) {
      if (!abKey.startsWith(prefix) || seenNames.has(abKey)) continue;
      if (abKey.includes('special_bonus') || abKey.endsWith('_empty1') || abKey.endsWith('_empty2')) continue;
      if (!od || (!od.desc && !od.is_innate)) continue;
      seenNames.add(abKey);
      merged.push(normalizeAbilityEntry({ name: abKey }, od));
    }
  }

  const innateAbilities = merged.filter((a) => a.is_innate);
  const passiveAbilities = merged.filter((a) => !a.is_innate && a.is_passive);
  const activeAbilities = merged.filter((a) => !a.is_innate && !a.is_passive);
  const { talents, talentsCount, lateTalentSpikes } = parseHeroTalents(hero);

  return {
    heroAbilities: merged,
    innateAbilities,
    activeAbilities,
    passiveAbilities,
    talents,
    lateTalentSpikes,
    abilitiesCount: merged.length,
    innateCount: innateAbilities.length,
    activeCount: activeAbilities.length,
    passiveCount: passiveAbilities.length,
    talentsCount
  };
}

/**
 * Автоматично визначає теги загроз героя за 4 категоріями:
 * 1) Innate (вроджені, включно з Hidden / Not Learnable)
 * 2) Active (базові + ульт + Scepter/Shard)
 * 3) Passive (ухилення, крит/відбиття під Break, реген/вампіризм, манаберн, -броня)
 * 4) Talents (10, 15, 20, 25 рівні з привʼязкою пізніх сплесків до стадії Late)
 */
function detectThreatsAutomatically(hero, odRoles, parsedMechanics) {
  const {
    heroAbilities = [],
    innateAbilities = [],
    activeAbilities = [],
    passiveAbilities = [],
    lateTalentSpikes = []
  } = Array.isArray(parsedMechanics) ? { heroAbilities: parsedMechanics } : (parsedMechanics || {});

  const fullText = heroAbilities.map((ab) => ab.combinedText).join(' | ');
  const roles = new Set((odRoles || []).map((r) => String(r).toLowerCase()));
  const threats = [];

  const addThreat = (tag, severity, source_ability, note_uk, note_ru = null, note_en = null, extra = {}) => {
    const existing = threats.find((t) => t.tag === tag);
    if (!existing) {
      threats.push({
        tag,
        severity,
        source_ability,
        note_uk,
        note_ru: note_ru || note_uk,
        note_en: note_en || note_uk,
        ...extra
      });
    } else {
      if (severity > existing.severity) {
        existing.severity = severity;
        existing.source_ability = source_ability;
        existing.note_uk = note_uk;
        existing.note_ru = note_ru || note_uk;
        existing.note_en = note_en || note_uk;
      }
      if (extra.late_spike) {
        existing.late_spike = true;
        existing.talent_level = extra.talent_level;
      }
    }
  };

  // === КАТЕГОРІЯ 1: ВРОДЖЕНІ ЗДІБНОСТІ (Innate, включно з Hidden / Not Learnable) ===
  for (const inn of innateAbilities) {
    const breakCheck = checkBreakablePassive(inn);
    if (breakCheck && breakCheck.breakable) {
      addThreat('critical_passive', breakCheck.severity, inn.name_en, breakCheck.note_uk, breakCheck.note_ru, breakCheck.note_en);
    }

    if (
      /\b(heals?|lifesteal|spell lifesteal|health regeneration|hp regen|restores? .*health|health restoration)\b/i.test(inn.combinedText)
    ) {
      addThreat(
        'heal_regen',
        2,
        `${inn.name_en} (Innate)`,
        `Вроджена механіка (${inn.name_en}) посилює регенерацію або вампіризм.`,
        `Врожденная механика (${inn.name_en}) усиливает регенерацию или вампиризм.`,
        `Innate mechanic (${inn.name_en}) boosts health regeneration or lifesteal.`
      );
    }

    if (/\b(evasion|redirect enemy attacks)\b/i.test(inn.combinedText)) {
      addThreat(
        'evasion',
        2,
        `${inn.name_en} (Innate)`,
        `Вроджене ухилення (${inn.name_en}) потребує True Strike / MKB.`,
        `Врожденное уклонение (${inn.name_en}) требует True Strike / MKB.`,
        `Innate evasion (${inn.name_en}) requires True Strike / MKB.`
      );
    }

    if (/\b(burns? mana|mana burn)\b/i.test(inn.combinedText)) {
      addThreat(
        'mana_burn',
        2,
        `${inn.name_en} (Innate)`,
        `Вроджене спалювання мани (${inn.name_en}).`,
        `Врожденное сжигание маны (${inn.name_en}).`,
        `Innate mana burn (${inn.name_en}).`
      );
    }

    if (/\b(bonus movement speed|flying movement)\b/i.test(inn.combinedText) && roles.has('escape')) {
      addThreat(
        'high_mobility',
        2,
        `${inn.name_en} (Innate)`,
        `Вроджена мобільність (${inn.name_en}).`,
        `Врожденная мобильность (${inn.name_en}).`,
        `Innate mobility (${inn.name_en}).`
      );
    }
  }

  // === КАТЕГОРІЯ 2 ТА 3: АКТИВНІ (з Scepter/Shard) ТА ПАСИВНІ ЗДІБНОСТІ ===
  // 1. Ілюзії / призовні юніти
  const illusionAb = heroAbilities.find((ab) =>
    /\b(creates?|summons?|spawns?|splits?)[\w\s]{0,35}\b(illusion|illusions|mirror image|phantasm|juxtapose|conjure image|wall of replica|haunt|wolves|familiars|treants|spiderlings|eidolons|spirit bear|zombies|golem)\b/i.test(ab.combinedText) ||
    /\b(dark portrait|disruption|mirror image|phantasm|juxtapose|conjure image|divided we stand|tombstone)\b/i.test(ab.name_en)
  );
  if (illusionAb) {
    addThreat(
      'illusions',
      2,
      illusionAb.name_en,
      `Створює ілюзії або призовних юнітів (${illusionAb.name_en}), яких ефективно чистити AoE-слотами та блоком шкоди.`,
      `Создает иллюзии или призывных юнитов (${illusionAb.name_en}), которых эффективно зачищать AoE-предметами и блоком урона.`,
      `Creates illusions or summoned units (${illusionAb.name_en}) countered by AoE waveclear and damage block.`
    );
  }

  // 2. Невидимість (відфільтровуємо скіли, що лише розкривають чужий інвіз)
  const invisAb = heroAbilities.find((ab) => {
    if (
      /\b(reveals? invisible|revealed if invisible|detects? invisible|true sight)\b/i.test(ab.desc_en) &&
      !/\b(becomes invisible|turns invisible|grants? invisibility|goes invisible)\b/i.test(ab.desc_en)
    ) {
      return false;
    }
    return /\b(turns invisible|becomes invisible|goes invisible|grants? invisibility|invisibility when|shifts out of visibility|shadow walk|shadow dance|depth shroud|vendetta|moonlight shadow|skeleton walk|ghost walk|sand storm|cloak and dagger|nature's guise)\b/i.test(
      ab.combinedText
    );
  });
  if (invisAb) {
    addThreat(
      'invisibility',
      3,
      invisAb.name_en,
      `Використовує невидимість (${invisAb.name_en}) — потрібні Dust, Sentry або Gem.`,
      `Использует невидимость (${invisAb.name_en}) — нужны Dust, Sentry или Gem.`,
      `Uses invisibility (${invisAb.name_en}) — requires Dust, Sentry, or Gem.`
    );
  }

  // 3. Ухилення / промахи (Evasion -> MKB)
  const evasionAb = heroAbilities.find((ab) => {
    if (/\b(true strike|cannot miss)\b/i.test(ab.combinedText) && !/\b(evasion|chance to miss|miss chance|evade|blind)\b/i.test(ab.combinedText)) {
      return false;
    }
    return /\b(evasion|miss chance|chance to miss|evade attacks?|blinds? enemies|blinding light|magnetic field|windrun)\b/i.test(ab.combinedText);
  });
  if (evasionAb) {
    addThreat(
      'evasion',
      2,
      evasionAb.name_en,
      `Має ухилення або осліплення (${evasionAb.name_en}) — потрібен MKB або Bloodthorn.`,
      `Имеет уклонение или ослепление (${evasionAb.name_en}) — нужен MKB или Bloodthorn.`,
      `Has evasion or blind (${evasionAb.name_en}) — requires MKB or Bloodthorn.`
    );
  }

  // 4. Хіл / регенерація / вампіризм (-> Vessel / Skadi / Shiva's / Crella's Crozier)
  const healAb = heroAbilities.find((ab) =>
    /\b(heal|heals|healing|lifesteal|spell lifesteal|health regeneration|hp regeneration|restore health|restores? .*health|regaining the health|life drain|chemical rage|borrowed time)\b/i.test(ab.combinedText)
  );
  if (healAb) {
    addThreat(
      'heal_regen',
      2,
      healAb.name_en,
      `Має сильне лікування, регенерацію або вампіризм (${healAb.name_en}) — потрібні Spirit Vessel, Skadi, Shiva's або Crella's Crozier.`,
      `Имеет сильное лечение, регенерацию или вампиризм (${healAb.name_en}) — нужны Spirit Vessel, Skadi, Shiva's или Crella's Crozier.`,
      `Has strong healing, regen, or lifesteal (${healAb.name_en}) — requires Spirit Vessel, Skadi, Shiva's, or Crella's Crozier.`
    );
  }

  // 5. Пасивні здібності, які РЕАЛЬНО вимикаються ефектом Break (-> Silver Edge)
  for (const pas of [...passiveAbilities, ...activeAbilities]) {
    const breakCheck = checkBreakablePassive(pas);
    if (breakCheck && breakCheck.breakable) {
      addThreat('critical_passive', breakCheck.severity, pas.name_en, breakCheck.note_uk, breakCheck.note_ru, breakCheck.note_en);
    }
  }

  // 6. Відбиття / зменшення шкоди
  const reflectAb = heroAbilities.find((ab) =>
    /\b(reflects? .*damage|damage.*reflected|dispersion|spiked carapace|bristleback|returns? .*damage|counter helix|retaliate|corrosive skin)\b/i.test(ab.combinedText)
  );
  if (reflectAb) {
    addThreat(
      'damage_reflection',
      2,
      reflectAb.name_en,
      `Відбиває або поглинає вхідну шкоду (${reflectAb.name_en}).`,
      `Отражает или поглощает входящий урон (${reflectAb.name_en}).`,
      `Reflects or reduces incoming damage (${reflectAb.name_en}).`
    );
  }

  // 7. Потоковий контроль / ульти
  const channeledAb = heroAbilities.find((ab) =>
    ab.behavior.includes('channeled') ||
    /\bchanneled\b|\bchanneling\b/i.test(ab.desc_en)
  );
  if (channeledAb) {
    addThreat(
      'channeled_disable',
      2,
      channeledAb.name_en,
      `Має потокову здібність (${channeledAb.name_en}), яку можна перервати контролем.`,
      `Имеет прерываемую способность (${channeledAb.name_en}), которую можно сбить контролем.`,
      `Has a channeled ability (${channeledAb.name_en}) that can be interrupted by disables.`
    );
  }

  // 8. Безмовність (Silence)
  const silenceAb = heroAbilities.find(
    (ab) => /\b(silence|silences|silenced|silencing)\b/i.test(ab.combinedText) && !/\bdoes not silence\b|\bwhile silenced\b/i.test(ab.combinedText)
  );
  if (silenceAb) {
    addThreat(
      'silence_zone',
      2,
      silenceAb.name_en,
      `Накладає безмовність (${silenceAb.name_en}) — рятують Manta, Eul, Lotus або BKB.`,
      `Накладывает безмолвие (${silenceAb.name_en}) — спасают Manta, Eul, Lotus или BKB.`,
      `Applies silence (${silenceAb.name_en}) — countered by Manta, Eul's, Lotus, or BKB.`
    );
  }

  // 9. Магічний та чистий прокаст (з перевіркою типів шкоди magical / pure)
  const magicOrPureAbilities = activeAbilities.filter((ab) => ab.damage_type === 'magical' || ab.damage_type === 'pure');
  if (roles.has('nuker') || magicOrPureAbilities.length >= 2) {
    const firstNuke = magicOrPureAbilities[0];
    const hasPure = magicOrPureAbilities.some((ab) => ab.damage_type === 'pure');
    addThreat(
      'magic_burst',
      roles.has('nuker') && magicOrPureAbilities.length >= 2 ? 3 : 2,
      firstNuke ? firstNuke.name_en : 'Magic Burst',
      hasPure
        ? 'Завдає значної магічної та чистої шкоди зі здібностей (вкл. Scepter/Shard).'
        : 'Завдає значної магічної шкоди зі здібностей у командних бійках.',
      hasPure
        ? 'Наносит значительный магический и чистый урон со способностей (вкл. Scepter/Shard).'
        : 'Наносит значительный магический урон со способностей в командных драках.',
      hasPure
        ? 'Deals heavy magical and pure ability damage (including Scepter/Shard).'
        : 'Deals heavy magical burst damage in teamfights.'
    );
  }

  // 10. Періодична магічна шкода (DoT / Аури)
  const dotMagicAb = heroAbilities.find(
    (ab) => (ab.damage_type === 'magical' || ab.damage_type === 'pure') && /\b(per second|each second|over time|aura|burns?)\b/i.test(ab.combinedText)
  );
  if (dotMagicAb) {
    addThreat(
      'sustained_magic',
      2,
      dotMagicAb.name_en,
      `Постійна періодична шкода або аура (${dotMagicAb.name_en}).`,
      `Постоянный периодический урон или аура (${dotMagicAb.name_en}).`,
      `Sustained damage over time or aura (${dotMagicAb.name_en}).`
    );
  }

  // 11. Точковий контроль (включно з BKB-piercing ультами)
  const targetControlAb = activeAbilities.find(
    (ab) => ab.behavior.includes('unit_target') &&
      /\b(stun|stuns|hex|root|leash|taunt|fear|swap|banish|disable|pull|lasso|doom|rupture|reaper|duel|roar|grip|dismember)\b/i.test(ab.combinedText)
  );
  if (targetControlAb) {
    const bkbNoteUk = targetControlAb.pierces_bkb ? ' (пробиває BKB)' : '';
    const bkbNoteRu = targetControlAb.pierces_bkb ? ' (пробивает BKB)' : '';
    const bkbNoteEn = targetControlAb.pierces_bkb ? ' (pierces BKB)' : '';
    addThreat(
      'unit_target_control',
      targetControlAb.pierces_bkb ? 3 : 2,
      targetControlAb.name_en,
      `Небезпечна точкова здібність (${targetControlAb.name_en})${bkbNoteUk}, яку контрять Lotus Orb / Linken's Sphere.`,
      `Опасная направленная способность (${targetControlAb.name_en})${bkbNoteRu}, которую контрят Lotus Orb / Linken's Sphere.`,
      `Dangerous unit-target ability (${targetControlAb.name_en})${bkbNoteEn} countered by Lotus Orb / Linken's Sphere.`
    );
  }

  // 12. Рут / пастки / ізоляція
  const trapAb = activeAbilities.find((ab) =>
    /\b(root|roots|leash|trap|arena|ring|cogs|tether|sprout|entangle|kinetic field|chronosphere|wall of|pounce|dream coil|overgrowth|pit of malice|black hole)\b/i.test(ab.combinedText)
  );
  if (trapAb) {
    addThreat(
      'trap_isolation',
      2,
      trapAb.name_en,
      `Фіксує або ізолює в зоні (${trapAb.name_en}) — рятують Force Staff / Hurricane Pike / Wind Waker.`,
      `Фиксирует или изолирует в зоне (${trapAb.name_en}) — спасают Force Staff / Hurricane Pike / Wind Waker.`,
      `Roots or isolates targets in an area (${trapAb.name_en}) — countered by Force Staff / Hurricane Pike / Wind Waker.`
    );
  }

  // 13. Мобільність
  if (
    roles.has('escape') ||
    /\b(blink|leap|teleport|ball lightning|time walk|waveform|pounce|surge|skewer|timber chain|roll|astral step|rebound|swashbuckle|tree dance|shukuchi|icarus dive)\b/.test(fullText)
  ) {
    addThreat(
      'high_mobility',
      2,
      'Mobility',
      'Висока рухливість у бійці — ефективні Orchid/Bloodthorn, Scythe of Vyse або Gleipnir.',
      'Высокая подвижность в драке — эффективны Orchid/Bloodthorn, Scythe of Vyse или Gleipnir.',
      'High combat mobility — countered by Orchid/Bloodthorn, Scythe of Vyse, or Gleipnir.'
    );
  }

  // 14. Фізичний бурст та зріз броні
  const armorShredOrPhysAb = heroAbilities.find(
    (ab) =>
      (ab.damage_type === 'physical' && !ab.is_passive) ||
      /\b(reduces? .*armor|armor reduction|corrosive haze|meld|natural order|presence of the dark lord|weave|wave of terror|acid spray)\b/i.test(ab.combinedText)
  );
  if (roles.has('carry') || armorShredOrPhysAb) {
    addThreat(
      'physical_burst',
      roles.has('carry') ? 2 : 1,
      armorShredOrPhysAb ? armorShredOrPhysAb.name_en : 'Physical Damage',
      'Небезпечний фізичний урон із руки або сильне зниження броні.',
      'Опасный физический урон с руки или сильное снижение брони.',
      'High right-click physical damage or strong armor reduction.'
    );
  }

  // 15. Сейв-бафи на себе/союзників, що знімаються розвіюванням (відфільтровуємо дебафи на ворогів!)
  const saveAb = activeAbilities.find(
    (ab) =>
      ab.dispellable === 'basic' &&
      !/\b(enemy|enemies|target's armor is reduced|reduces? enemy)\b/i.test(ab.desc_en) &&
      /\b(shield|barrier|ethereal|ghost|windrun|surge|bloodlust|aphotic|guardian angel|repel|decrepify|bulldoze|refraction|magnetic)\b/i.test(ab.combinedText)
  );
  if (saveAb) {
    addThreat(
      'dispellable_save',
      2,
      saveAb.name_en,
      `Захисний сейв-баф (${saveAb.name_en}), що знімається розвіюванням (Nullifier / Eul / Disperser).`,
      `Защитный сейв-бафф (${saveAb.name_en}), снимаемый развеиванием (Nullifier / Eul / Disperser).`,
      `Defensive save buff (${saveAb.name_en}) removable by dispel (Nullifier / Eul's / Disperser).`
    );
  }

  // 16. Спалення мани
  const manaBurnAb = heroAbilities.find((ab) => /\b(burns? mana|mana burn|drains? mana|mana break|emp)\b/i.test(ab.combinedText));
  if (manaBurnAb) {
    addThreat(
      'mana_burn',
      2,
      manaBurnAb.name_en,
      `Випалює ману (${manaBurnAb.name_en}).`,
      `Выжигает ману (${manaBurnAb.name_en}).`,
      `Burns mana (${manaBurnAb.name_en}).`
    );
  }

  // === КАТЕГОРІЯ 4: ТАЛАНТИ (10, 15, 20, 25 рівні — пізній сплеск Late / 30+ хв) ===
  for (const spike of lateTalentSpikes) {
    addThreat(spike.tag, spike.severity, spike.source_ability, spike.note_uk, spike.note_ru, spike.note_en, {
      phase: 'late',
      late_spike: true,
      talent_level: spike.talent_level
    });
  }

  if (threats.length === 0) {
    addThreat(
      roles.has('support') ? 'unit_target_control' : 'physical_burst',
      1,
      'Base Kit',
      'Універсальний герой командного бою.',
      'Универсальный герой командного боя.',
      'Versatile teamfight hero.'
    );
  }

  threats.sort((a, b) => b.severity - a.severity);
  return threats.slice(0, 7);
}

function detectInnateRedundancies(hero, heroAbilities) {
  const curated = Array.isArray(HERO_INNATE_REDUNDANT[hero.key]) ? [...HERO_INNATE_REDUNDANT[hero.key]] : [];
  const seenKeys = new Set(curated.map((c) => c.item_key));
  const fullText = heroAbilities.map((ab) => ab.combinedText).join(' | ');

  if (!seenKeys.has('silver_edge') && /\bapplies break\b|\binflicts break\b|\bdisables? passive abilities\b/i.test(fullText)) {
    curated.push({
      item_key: 'silver_edge',
      reason_uk: 'У наборі героя вже є механіка Break проти пасивок.',
      reason_ru: 'В арсенале героя уже есть механика Break против пассивок.',
      reason_en: 'Hero kit already includes Break against passives.'
    });
    seenKeys.add('silver_edge');
  }
  if (!seenKeys.has('black_king_bar') && /\bdebuff immunity\b/i.test(fullText)) {
    curated.push({
      item_key: 'black_king_bar',
      reason_uk: 'Власна здібність героя дає Debuff Immunity.',
      reason_ru: 'Собственная способность героя дает Debuff Immunity.',
      reason_en: 'Hero ability already grants Debuff Immunity.'
    });
    seenKeys.add('black_king_bar');
  }
  if (!seenKeys.has('bfury') && /\bcleave\b/i.test(fullText) && hero.attack_type === 'Melee') {
    curated.push({
      item_key: 'bfury',
      reason_uk: 'Герой має вбудований сплеш (Cleave) для зачистки.',
      reason_ru: 'Герой имеет встроенный сплеш (Cleave) для зачистки.',
      reason_en: 'Hero has built-in cleave for waveclear.'
    });
    seenKeys.add('bfury');
  }

  return curated;
}

function mergeThreatsPreferringCurated(curatedThreats, autoThreats, lateTalentSpikes = []) {
  const result = [];
  const seenTags = new Set();
  const lateSpikeByTag = new Map((lateTalentSpikes || []).map((s) => [s.tag, s]));
  const hasCurated = Array.isArray(curatedThreats) && curatedThreats.length > 0;

  for (const t of curatedThreats || []) {
    if (!t || !t.tag || seenTags.has(t.tag)) continue;
    seenTags.add(t.tag);
    const copy = { ...t };
    const spike = lateSpikeByTag.get(t.tag);
    if (spike) {
      copy.late_spike = true;
      copy.talent_level = spike.talent_level;
    }
    result.push(copy);
  }

  for (const auto of autoThreats || []) {
    if (result.length >= 6) break;
    if (!auto || !auto.tag || seenTags.has(auto.tag)) continue;
    // Якщо профіль героя вже курований, додаємо з авто-детектора лише пізні сплески талантів (Late / 30+ хв)
    if (hasCurated && !auto.late_spike) {
      continue;
    }
    seenTags.add(auto.tag);
    result.push({ ...auto });
  }

  return result;
}

function buildRoleLabels(hero, odRoles) {
  const roles = odRoles && odRoles.length ? odRoles : (hero.roles || []).map((r) => r.name);
  const roleMapUk = {
    Carry: 'Кері',
    Support: 'Сапорт',
    Nuker: 'Нюкер',
    Disabler: 'Контроль',
    Initiator: 'Ініціатор',
    Durable: 'Танк',
    Escape: 'Мобільний',
    Pusher: 'Пушер'
  };
  const roleMapRu = {
    Carry: 'Керри',
    Support: 'Саппорт',
    Nuker: 'Нюкер',
    Disabler: 'Контроль',
    Initiator: 'Инициатор',
    Durable: 'Танк',
    Escape: 'Мобильный',
    Pusher: 'Пушер'
  };
  const top3 = roles.slice(0, 3);
  return {
    uk: top3.map((r) => roleMapUk[r] || r).join(' • ') || 'Герой Dota 2',
    ru: top3.map((r) => roleMapRu[r] || r).join(' • ') || 'Герой Dota 2',
    en: top3.join(' • ') || 'Dota 2 Hero'
  };
}

function buildItemCombinedText(item, odItem) {
  const stats = Array.isArray(item.stats)
    ? item.stats.map((s) => `${s.key || ''} ${s.label || ''} ${s.value || ''}`).join(' ')
    : '';
  const notes = Array.isArray(item.notes_en) ? item.notes_en.join(' ') : '';
  const odHints = odItem && Array.isArray(odItem.hint) ? odItem.hint.join(' ') : '';
  return `${item.name_en || ''} ${item.desc_en || ''} ${odHints} ${notes} ${stats}`.toLowerCase();
}

/**
 * Витягує контр-теги предметів із Data/items.json (UA / RU / EN).
 */
function detectItemCounterTags(item, odItem) {
  const text = buildItemCombinedText(item, odItem);
  const discovered = [];
  const addTag = (tag, weight, reason_uk, reason_ru, reason_en) => {
    if (!discovered.some((t) => t.tag === tag)) {
      discovered.push({
        tag,
        weight,
        reason_uk,
        reason_ru: reason_ru || reason_uk,
        reason_en: reason_en || reason_uk
      });
    }
  };

  if (/\bdisables? passive abilities\b|\bapplies break\b/i.test(text) && !/\bcan be broken\b|\bunbreakable\b/i.test(text)) {
    addTag(
      'critical_passive',
      10,
      `${item.name_en} накладає Break і вимикає ключові пасивки.`,
      `${item.name_en} накладывает Break и отключает ключевые пассивки.`,
      `${item.name_en} applies Break and disables key passives.`
    );
    addTag(
      'damage_reflection',
      8,
      `${item.name_en} вимикає пасивне повернення шкоди.`,
      `${item.name_en} отключает пассивный возврат урона.`,
      `${item.name_en} disables passive damage reflection.`
    );
  }
  if (/\btrue strike\b|\bchance to pierce through evasion\b|\bpierce through evasion\b/i.test(text)) {
    addTag(
      'evasion',
      10,
      `${item.name_en} пробиває ухилення та промахи.`,
      `${item.name_en} пробивает уклонение и промахи.`,
      `${item.name_en} pierces evasion and miss effects.`
    );
  } else if (/\bcannot miss\b/i.test(text)) {
    addTag(
      'evasion',
      7,
      `${item.name_en} не промахується по цілі під ухиленням.`,
      `${item.name_en} не промахивается по цели под уклонением.`,
      `${item.name_en} cannot miss against targets with evasion.`
    );
  }
  if (/\breduc(es|ing).*health restoration\b|\bhealth restoration.*reduced\b|\bheal reduction\b|\bhp regeneration.*reduced\b/i.test(text)) {
    addTag(
      'heal_regen',
      10,
      `${item.name_en} ріже лікування та регенерацію ворога.`,
      `${item.name_en} режет лечение и регенерацию врага.`,
      `${item.name_en} reduces enemy healing and regeneration.`
    );
  }
  if (/\breveals? invisible\b|\btrue sight\b/i.test(text)) {
    addTag(
      'invisibility',
      9,
      `${item.name_en} дає True Sight / розкриває невидимих ворогів.`,
      `${item.name_en} дает True Sight / раскрывает невидимых врагов.`,
      `${item.name_en} grants True Sight / reveals invisible enemies.`
    );
  }
  if (/\bdispels? the target\b|\bcontinuously dispels\b|\bdispel all enemies\b/i.test(text)) {
    addTag(
      'dispellable_save',
      8,
      `${item.name_en} розвіює захисні бафи ворога.`,
      `${item.name_en} развеивает защитные баффы врага.`,
      `${item.name_en} dispels enemy defensive buffs.`
    );
  }
  if (/\bstrong dispel\b/i.test(text)) {
    addTag(
      'unit_target_control',
      8,
      `${item.name_en} дає сильне розвіювання проти контролю.`,
      `${item.name_en} дает сильное развеивание против контроля.`,
      `${item.name_en} provides Strong Dispel against disables.`
    );
    addTag(
      'silence_zone',
      7,
      `${item.name_en} знімає сайленс і небезпечні ефекти.`,
      `${item.name_en} снимает сайленс и опасные эффекты.`,
      `${item.name_en} removes silence and dangerous debuffs.`
    );
  } else if (/\bbasic dispel\b/i.test(text)) {
    addTag(
      'silence_zone',
      7,
      `${item.name_en} знімає сайленс та базові дебафи.`,
      `${item.name_en} снимает сайленс и базовые дебаффы.`,
      `${item.name_en} removes silence and basic debuffs.`
    );
    addTag(
      'trap_isolation',
      6,
      `${item.name_en} скидає рути та сповільнення.`,
      `${item.name_en} сбрасывает руты и замедления.`,
      `${item.name_en} dispels roots and slows.`
    );
  }
  if (/\bsilences?\b/i.test(text) && !/\bsilence resistance\b|\bwhile silenced\b/i.test(text)) {
    addTag(
      'high_mobility',
      9,
      `${item.name_en} накладає сайленс і зупиняє мобільні скіли.`,
      `${item.name_en} накладывает сайленс и останавливает мобильные скиллы.`,
      `${item.name_en} silences and stops mobility spells.`
    );
    addTag(
      'channeled_disable',
      7,
      `${item.name_en} зриває активний каст ворога.`,
      `${item.name_en} сбивает активный каст врага.`,
      `${item.name_en} interrupts enemy channeled spells.`
    );
  }
  if (/\bdisarms?\b|\bprevent(s|ing).*from attacking\b/i.test(text) && !/\bunable to attack\b/i.test(text)) {
    addTag(
      'physical_burst',
      9,
      `${item.name_en} роззброює ворожого фізичного кору.`,
      `${item.name_en} обезоруживает вражеского физического кора.`,
      `${item.name_en} disarms enemy physical cores.`
    );
  }
  if (/\bturns? .* into a harmless\b|\bhex\b|\bstuns? a target\b/i.test(text)) {
    addTag(
      'high_mobility',
      8,
      `${item.name_en} фіксує рухливих цілей жорстким контролем.`,
      `${item.name_en} фиксирует подвижные цели жестким контролем.`,
      `${item.name_en} locks down mobile targets with hard disable.`
    );
  }
  if (/\bdebuff immunity\b|\bimmunity to reflected and pure damage\b/i.test(text)) {
    addTag(
      'magic_burst',
      9,
      `${item.name_en} дає імунітет до дебафів та опір магії.`,
      `${item.name_en} дает иммунитет к эффектам и сопротивление магии.`,
      `${item.name_en} grants debuff immunity and magic resistance.`
    );
    addTag(
      'unit_target_control',
      8,
      `${item.name_en} захищає від ворожого контролю.`,
      `${item.name_en} защищает от вражеского контроля.`,
      `${item.name_en} protects against enemy disables.`
    );
  }
  if (/\bmagic damage barrier\b|\ballies.*magic resistance\b|\ball damage barrier\b/i.test(text)) {
    addTag(
      'magic_burst',
      8,
      `${item.name_en} поглинає магічну шкоду.`,
      `${item.name_en} поглощает магический урон.`,
      `${item.name_en} absorbs magical damage.`
    );
  }
  if (/\bblocks? most targeted spells\b|\bre-casts most targeted spells\b/i.test(text)) {
    addTag(
      'unit_target_control',
      9,
      `${item.name_en} блокує або відбиває небезпечні точкові заклинання.`,
      `${item.name_en} блокирует или отражает опасные направленные заклинания.`,
      `${item.name_en} blocks or reflects dangerous unit-target spells.`
    );
  }
  if (/\bcleave\b|\bleaps between \d+ targets\b/i.test(text) && !item.is_neutral) {
    addTag(
      'illusions',
      8,
      `${item.name_en} завдає AoE-шкоди для зачистки ілюзій.`,
      `${item.name_en} наносит AoE-урон для зачистки иллюзий.`,
      `${item.name_en} deals AoE damage to clear illusions.`
    );
  }

  return discovered;
}

function inferPositionsAndTiming(item, detectedTags) {
  const preset = ITEM_POSITIONS[item.key];
  if (preset) return preset;

  const cost = Number(item.cost) || 0;
  const tagSet = new Set(detectedTags.map((t) => t.tag));
  let positions = [1, 2, 3, 4, 5];
  let primary = [2, 3];
  if (tagSet.has('evasion') || tagSet.has('critical_passive') || tagSet.has('illusions')) {
    positions = [1, 2, 3];
    primary = [1, 2];
  } else if (tagSet.has('invisibility') || tagSet.has('dispellable_save')) {
    positions = [2, 3, 4, 5];
    primary = [4, 5];
  }

  const timing_phase = cost >= 4200 ? 'late' : cost >= 2400 ? 'mid' : 'early';
  const timing_label_uk =
    timing_phase === 'late' ? 'Late (3–4 слот)' : timing_phase === 'mid' ? 'Mid (2–3 слот)' : 'Early (1-й слот)';
  const timing_label_ru =
    timing_phase === 'late' ? 'Late (3–4 слот)' : timing_phase === 'mid' ? 'Mid (2–3 слот)' : 'Early (1-й слот)';
  const timing_label_en =
    timing_phase === 'late' ? 'Late (3rd–4th item)' : timing_phase === 'mid' ? 'Mid (2nd–3rd item)' : 'Early (1st item)';

  return {
    positions,
    primary_positions: primary,
    role_hint_uk: `Pos ${primary.join('/')} (Авто-правило)`,
    role_hint_ru: `Pos ${primary.join('/')} (Авто-правило)`,
    role_hint_en: `Pos ${primary.join('/')} (Auto rule)`,
    timing_phase,
    timing_label_uk,
    timing_label_ru,
    timing_label_en
  };
}

function analyzeAndBuildItemRules({ items, odItemsByKey }) {
  const itemsByKey = new Map(items.map((it) => [it.key, it]));
  const mergedRules = JSON.parse(JSON.stringify(CURATED_ITEM_RULES));

  for (const [itemKey, rule] of Object.entries(mergedRules)) {
    const item = itemsByKey.get(itemKey);
    const odItem = odItemsByKey.get(itemKey);
    if (!item && !odItem) {
      delete mergedRules[itemKey];
      continue;
    }

    const posMeta = ITEM_POSITIONS[itemKey] || inferPositionsAndTiming(item || { key: itemKey, cost: 3000 }, rule.counters_tags || []);

    if (item) {
      rule.item_id = item.id;
      rule.name_en = (odItem && odItem.dname) || item.name_en || rule.name_en;
      const freshTags = detectItemCounterTags(item, odItem);
      const existingTagSet = new Set((rule.counters_tags || []).map((ct) => ct.tag));
      for (const ft of freshTags) {
        if (!existingTagSet.has(ft.tag) && ['heal_regen', 'evasion', 'critical_passive', 'invisibility'].includes(ft.tag)) {
          rule.counters_tags = [...(rule.counters_tags || []), ft];
          existingTagSet.add(ft.tag);
        }
      }
    }

    rule.positions = posMeta.positions;
    rule.primary_positions = posMeta.primary_positions;
    if (posMeta.role_hint_uk) rule.role_hint_uk = posMeta.role_hint_uk;
    if (posMeta.role_hint_ru) rule.role_hint_ru = posMeta.role_hint_ru;
    if (posMeta.role_hint_en) rule.role_hint_en = posMeta.role_hint_en;
    rule.timing_phase = posMeta.timing_phase || 'mid';
    rule.timing_label_uk = posMeta.timing_label_uk || 'Mid (2–3 слот)';
    rule.timing_label_ru = posMeta.timing_label_ru || 'Mid (2–3 слот)';
    rule.timing_label_en = posMeta.timing_label_en || 'Mid (2nd–3rd item)';
  }

  // Автоматично додаємо нові сильні контр-предмети з items.json (якщо з'являться в нових патчах)
  for (const item of items) {
    if (!item || !item.key || mergedRules[item.key]) continue;
    if (item.is_neutral || item.is_enchantment || item.key.startsWith('recipe_')) continue;
    const cost = Number(item.cost) || 0;
    if (cost < 2000) continue;

    const odItem = odItemsByKey.get(item.key);
    const freshTags = detectItemCounterTags(item, odItem);
    const highSignal = freshTags.filter((t) =>
      ['critical_passive', 'evasion', 'heal_regen', 'invisibility', 'dispellable_save'].includes(t.tag)
    );
    if (highSignal.length === 0) continue;

    const posMeta = inferPositionsAndTiming(item, freshTags);
    mergedRules[item.key] = {
      item_id: item.id,
      name_en: (odItem && odItem.dname) || item.name_en,
      category: 'recommended',
      summary_uk: highSignal.map((t) => t.reason_uk).join(' '),
      summary_ru: highSignal.map((t) => t.reason_ru || t.reason_uk).join(' '),
      summary_en: highSignal.map((t) => t.reason_en || t.reason_uk).join(' '),
      counters_tags: freshTags.slice(0, 3),
      synergy_threshold: null,
      positions: posMeta.positions,
      primary_positions: posMeta.primary_positions,
      role_hint_uk: posMeta.role_hint_uk,
      role_hint_ru: posMeta.role_hint_ru,
      role_hint_en: posMeta.role_hint_en,
      timing_phase: posMeta.timing_phase,
      timing_label_uk: posMeta.timing_label_uk,
      timing_label_ru: posMeta.timing_label_ru,
      timing_label_en: posMeta.timing_label_en
    };
  }

  return mergedRules;
}

function analyzeAndBuildNeutralRules(items, odItemsByKey) {
  const itemsByKey = new Map(items.map((it) => [it.key, it]));
  const result = {};

  // Перевіряємо всі нейтральні правила проти поточного items.json (видаляємо прибрані з гри нейтралки)
  for (const [key, rule] of Object.entries(NEUTRAL_ITEM_RULES)) {
    const it = itemsByKey.get(key);
    if (!it || !it.is_neutral || it.is_enchantment) continue;
    const tier = Number(it.neutral_tier ?? rule.tier);
    if (tier < 1 || tier > 4) continue;
    result[key] = {
      ...rule,
      tier,
      name_en: it.name_en || rule.name_en
    };
  }

  // Підхоплюємо нові нейтральні предмети Tier 1–4 з items.json
  for (const item of items) {
    if (!item || !item.key || !item.is_neutral || item.is_enchantment || result[item.key]) continue;
    const tier = Number(item.neutral_tier);
    if (!Number.isFinite(tier) || tier < 1 || tier > 4) continue;

    const detected = detectItemCounterTags(item, odItemsByKey.get(item.key));
    if (detected.length === 0) continue;

    result[item.key] = {
      tier,
      name_en: item.name_en,
      tags: detected.map((d) => d.tag).slice(0, 3),
      reason_uk: detected[0].reason_uk,
      reason_ru: detected[0].reason_ru || detected[0].reason_uk,
      reason_en: detected[0].reason_en || detected[0].reason_uk
    };
  }

  return result;
}

function buildEnemyItemTriggers(items, odItemsByKey) {
  const merged = JSON.parse(JSON.stringify(ENEMY_ITEM_TRIGGERS));
  const itemsByKey = new Map(items.map((it) => [it.key, it]));

  for (const [key, trig] of Object.entries(merged)) {
    const it = itemsByKey.get(key);
    const od = odItemsByKey.get(key);
    if (it || od) {
      trig.name_en = (od && od.dname) || (it && it.name_en) || trig.name_en;
    }
  }

  for (const item of items) {
    if (!item || !item.key || merged[item.key] || item.is_neutral || item.is_enchantment) continue;
    if ((Number(item.cost) || 0) < 2500) continue;
    const text = buildItemCombinedText(item, odItemsByKey.get(item.key));

    if (/\bturns? you invisible\b|\bmakes you invisible\b/i.test(text)) {
      merged[item.key] = {
        name_en: item.name_en,
        counters: [
          {
            item_key: 'dust',
            bonus: 15,
            force_priority: 'critical',
            reason_uk: `Ворожий ${item.name_en} дає невидимість — тримайте Dust.`,
            reason_ru: `Вражеский ${item.name_en} дает невидимость — держите Dust.`,
            reason_en: `Enemy ${item.name_en} grants invisibility — carry Dust.`
          },
          {
            item_key: 'ward_sentry',
            bonus: 12,
            force_priority: 'recommended',
            reason_uk: `Забезпечує True Sight проти ${item.name_en}.`,
            reason_ru: `Обеспечивает True Sight против ${item.name_en}.`,
            reason_en: `Provides True Sight against ${item.name_en}.`
          }
        ]
      };
    }
  }

  return merged;
}

function resolvePatchTarget({ targetVersion, patches, meta, baseCounters }) {
  if (targetVersion) return String(targetVersion);
  if (Array.isArray(patches) && patches.length > 0 && patches[0].version) {
    return String(patches[0].version);
  }
  if (meta && meta.latest_patch) return String(meta.latest_patch);
  if (baseCounters && baseCounters.patch_target) return String(baseCounters.patch_target);
  return '7.41f';
}

function inferDefaultPositionFromRoles(hero, odRoles) {
  const presetPos = HERO_META_POSITIONS[hero.key];
  if (Array.isArray(presetPos) && presetPos.length > 0) {
    return { defaultPosition: presetPos[0], positions: presetPos };
  }
  const roles = new Set((odRoles || []).map((r) => String(r).toLowerCase()));
  if (roles.has('carry') && !roles.has('support')) return { defaultPosition: 1, positions: [1, 2] };
  if (roles.has('nuker') && !roles.has('support') && !roles.has('durable')) return { defaultPosition: 2, positions: [2, 4] };
  if (roles.has('initiator') && roles.has('durable')) return { defaultPosition: 3, positions: [3, 4] };
  if (roles.has('support') && roles.has('initiator')) return { defaultPosition: 4, positions: [4, 5] };
  if (roles.has('support')) return { defaultPosition: 5, positions: [5, 4] };
  return { defaultPosition: 3, positions: [3, 2] };
}

function buildAbilitiesDictionaryFromSources(sources = []) {
  const map = new Map();
  for (const src of sources) {
    if (src) normalizeAbilitiesCollection(src, map);
  }
  return map;
}

/**
 * Чистий перерахунок бази правил без привʼязки до файлової системи (працює в Node та WebView2).
 */
function regenerateRulesFromData({
  targetVersion = null,
  heroes = [],
  items = [],
  baseCounters = {},
  patches = [],
  meta = {},
  odHeroesRaw = {},
  odItemsRaw = {},
  abilitiesByName = null,
  abilitySources = []
} = {}) {
  const odHeroesById = new Map(Object.values(odHeroesRaw || {}).map((h) => [Number(h.id), h]));
  const odItemsByKey = new Map(Object.entries(odItemsRaw || {}));
  const resolvedAbilities = abilitiesByName instanceof Map
    ? abilitiesByName
    : buildAbilitiesDictionaryFromSources(abilitySources);

  const updatedItemRules = analyzeAndBuildItemRules({ items, odItemsByKey });
  const updatedNeutralRules = analyzeAndBuildNeutralRules(items, odItemsByKey);
  const updatedEnemyTriggers = buildEnemyItemTriggers(items, odItemsByKey);

  const updatedHeroes = {};
  let abilitiesAnalyzed = 0;
  let innateAbilitiesCount = 0;
  let activeAbilitiesCount = 0;
  let passiveAbilitiesCount = 0;
  let talentsAnalyzed = 0;
  let lateTalentSpikesCount = 0;
  let threatsCount = 0;

  for (const hero of heroes) {
    const od = odHeroesById.get(Number(hero.id));
    const odRoles = od && Array.isArray(od.roles) ? od.roles : (hero.roles || []).map((r) => r.name);
    const override = SPECIALIZED_HERO_OVERRIDES[hero.key];

    const parsedMechanics = collectHeroAbilitiesAndTalents(hero, resolvedAbilities);
    abilitiesAnalyzed += parsedMechanics.abilitiesCount;
    innateAbilitiesCount += parsedMechanics.innateCount;
    activeAbilitiesCount += parsedMechanics.activeCount;
    passiveAbilitiesCount += parsedMechanics.passiveCount;
    talentsAnalyzed += parsedMechanics.talentsCount;
    lateTalentSpikesCount += parsedMechanics.lateTalentSpikes.length;

    const autoThreats = detectThreatsAutomatically(hero, odRoles, parsedMechanics);
    const redundantItems = detectInnateRedundancies(hero, parsedMechanics.heroAbilities);
    const posInfo = inferDefaultPositionFromRoles(hero, odRoles);

    let finalThreats = autoThreats;
    const autoRoleLabels = buildRoleLabels(hero, odRoles);
    let primaryRoleUk = autoRoleLabels.uk;
    let primaryRoleRu = autoRoleLabels.ru;
    let primaryRoleEn = autoRoleLabels.en;
    let priorityItems = [];
    let defaultPosition = posInfo.defaultPosition;
    let viablePositions = posInfo.positions;
    let typicalItems = [];

    if (override) {
      primaryRoleUk = override.primary_role_uk || primaryRoleUk;
      primaryRoleRu = override.primary_role_ru || primaryRoleUk;
      primaryRoleEn = override.primary_role_en || primaryRoleUk;
      priorityItems = override.priority_items || [];
      defaultPosition = override.default_position || defaultPosition;
      viablePositions = Array.isArray(override.positions) && override.positions.length > 0 ? override.positions : viablePositions;
      typicalItems = Array.isArray(override.typical_items) ? override.typical_items : [];
      finalThreats = mergeThreatsPreferringCurated(override.threats, autoThreats, parsedMechanics.lateTalentSpikes);
    }

    threatsCount += finalThreats.length;

    updatedHeroes[hero.key] = {
      id: hero.id,
      npc_name: hero.npc_name,
      name_en: (od && od.localized_name) || hero.name_en,
      attack_type: hero.attack_type,
      default_position: defaultPosition,
      positions: viablePositions,
      primary_role_uk: primaryRoleUk,
      primary_role_ru: primaryRoleRu,
      primary_role_en: primaryRoleEn,
      typical_items: typicalItems,
      redundant_items: redundantItems,
      threats: finalThreats,
      priority_items: priorityItems
    };
  }

  const patchTarget = resolvePatchTarget({ targetVersion, patches, meta, baseCounters });
  const updatedCounters = {
    schema_version: '5.0.0',
    patch_target: patchTarget,
    language: 'uk',
    supported_languages: ['uk', 'ru', 'en'],
    generated_at_utc: new Date().toISOString(),
    description: `Повна база правил Dota 2 (патч ${patchTarget}, UA/RU/EN): ${heroes.length} героїв, ${abilitiesAnalyzed} здібностей, ${talentsAnalyzed} талантів, ${Object.keys(updatedItemRules).length} контр-предметів та ${Object.keys(updatedNeutralRules).length} нейтралок.`,
    positions_meta: {
      '1': { label_short: 'Pos 1', label_uk: 'Кері (Carry)', label_ru: 'Керри (Carry)', label_en: 'Carry (Pos 1)' },
      '2': { label_short: 'Pos 2', label_uk: 'Мідер (Mid)', label_ru: 'Мидер (Mid)', label_en: 'Mid (Pos 2)' },
      '3': { label_short: 'Pos 3', label_uk: 'Офлейнер (Offlane)', label_ru: 'Оффлейнер (Offlane)', label_en: 'Offlane (Pos 3)' },
      '4': { label_short: 'Pos 4', label_uk: 'Сап (Soft Support)', label_ru: 'Сап (Soft Support)', label_en: 'Soft Support (Pos 4)' },
      '5': { label_short: 'Pos 5', label_uk: 'Фул сап (Hard Support)', label_ru: 'Фулл сап (Hard Support)', label_en: 'Hard Support (Pos 5)' }
    },
    threat_tags: THREAT_TAGS_META,
    fallback_tag_mapping: FALLBACK_TAG_MAPPING,
    ally_synergy_rules: ALLY_SYNERGY_RULES,
    flex_support_matrix: FLEX_SUPPORT_MATRIX,
    enemy_meta_item_profiles: ENEMY_META_ITEM_PROFILES,
    enemy_item_triggers: updatedEnemyTriggers,
    neutral_item_rules: updatedNeutralRules,
    hero_counter_capabilities: HERO_COUNTER_CAPABILITIES,
    item_rules: updatedItemRules,
    heroes: updatedHeroes
  };

  return {
    counters: updatedCounters,
    report: {
      ok: true,
      patchTarget,
      heroesAnalyzed: heroes.length,
      abilitiesAnalyzed,
      innateAbilitiesCount,
      activeAbilitiesCount,
      passiveAbilitiesCount,
      talentsAnalyzed,
      lateTalentSpikesCount,
      itemsAnalyzed: items.length,
      itemRulesCount: Object.keys(updatedItemRules).length,
      enemyTriggersCount: Object.keys(updatedEnemyTriggers).length,
      neutralRulesCount: Object.keys(updatedNeutralRules).length,
      threatsCount
    }
  };
}

/**
 * Повний автоматичний переаналіз усіх героїв, 4 категорій здібностей (Innate, Active+Shard/Scepter, Passive, Talents 10-25),
 * предметів та нейтралок Tier 1–4.
 * Зберігає counters.json у userData (або Data/) та перезавантажує dataService без перезапуску додатка.
 */
function regenerateRules({ targetVersion = null, writeToBundled = false, reloadDataCallback = null } = {}) {
  const readDataFile = (rel) => readJsonSafe(storagePaths.getReadableDataFile(rel), null);
  const heroes = readDataFile('heroes.json') || [];
  const items = readDataFile('items.json') || [];
  const baseCounters = readDataFile('counters.json') || {};
  const patches = readDataFile('patches.json') || [];
  const meta = readDataFile('meta.json') || {};

  const odHeroesRaw =
    readJsonSafe(path.join(storagePaths.getCacheDir(), 'opendota_heroes.json'), null) ||
    readJsonSafe(path.join(storagePaths.getBundledDataDir(), 'cache', 'opendota_heroes.json'), {});
  const odItemsRaw =
    readJsonSafe(path.join(storagePaths.getCacheDir(), 'opendota_items.json'), null) ||
    readJsonSafe(path.join(storagePaths.getBundledDataDir(), 'cache', 'opendota_items.json'), {});
  const abilitiesByName = loadAbilitiesDictionary();

  const { counters: updatedCounters, report } = regenerateRulesFromData({
    targetVersion,
    heroes,
    items,
    baseCounters,
    patches,
    meta,
    odHeroesRaw,
    odItemsRaw,
    abilitiesByName
  });

  const outputPath = writeToBundled
    ? path.join(storagePaths.getBundledDataDir(), 'counters.json')
    : path.join(storagePaths.getWritableDataDir(), 'counters.json');
  writeJsonSafe(outputPath, updatedCounters);

  let refreshedGameData = null;
  if (typeof reloadDataCallback === 'function') {
    refreshedGameData = reloadDataCallback();
  }

  return {
    ...report,
    outputPath,
    refreshedGameData
  };
}

const api = {
  loadAbilitiesDictionary,
  buildAbilitiesDictionaryFromSources,
  collectHeroAbilitiesAndTalents,
  checkBreakablePassive,
  parseHeroTalents,
  detectThreatsAutomatically,
  detectItemCounterTags,
  regenerateRulesFromData,
  regenerateRules
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  root.__d2oRuleGenerator = api;
}
})(typeof globalThis !== 'undefined' ? globalThis : window);
