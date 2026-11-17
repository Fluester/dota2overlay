/**
 * Повна курована та верифікована база пресетів правил Dota 2 (патч 7.41f, локалізація UA / RU / EN):
 * - Усі 127 героїв з актуальними ролями (Pos 1–5), типовими предметами, загрозами та контр-предметами
 * - Верифікована таблиця пасивок та вроджених здібностей, які РЕАЛЬНО вимикаються ефектом Break (Silver Edge)
 * - Усі контр-предмети та тригери ворожого закупа
 * - Повний пул актуальних нейтральних предметів Tier 1–4 з поточного items.json
 * - Розширений список носіїв командних аур і мета-профілів ворогів
 */

(function (root) {
const THREAT_TAGS_META = {
  "critical_passive": {
    "label_uk": "Критичні пасивки (Break)",
    "category": "passives",
    "default_weight": 10,
    "description_uk": "Пасивна або вроджена здібність героя є основою його виживаності чи шкоди і реально вимикається ефектом Break (Silver Edge).",
    "label_ru": "Критические пассивки (Break)",
    "label_en": "Critical Passives (Break)",
    "description_ru": "Пассивная или врожденная способность героя является основой его выживаемости или урона и реально отключается эффектом Break (Silver Edge).",
    "description_en": "The hero's passive or innate ability is the core of their survivability or damage and is genuinely disabled by Break (Silver Edge)."
  },
  "damage_reflection": {
    "label_uk": "Відбиття / поглинання шкоди",
    "category": "passives",
    "default_weight": 7,
    "description_uk": "Пасивне повернення або зменшення шкоди в бою (Dispersion, Bristleback, Counter Helix, Retaliate, Corrosive Skin).",
    "label_ru": "Отражение / поглощение урона",
    "label_en": "Damage Reflection / Absorption",
    "description_ru": "Пассивный возврат или снижение урона в бою (Dispersion, Bristleback, Counter Helix, Retaliate, Corrosive Skin).",
    "description_en": "Passive damage return or reduction in combat (Dispersion, Bristleback, Counter Helix, Retaliate, Corrosive Skin)."
  },
  "evasion": {
    "label_uk": "Ухилення та промахи",
    "category": "evasion",
    "default_weight": 9,
    "description_uk": "Високе вбудоване ухилення або осліплення (Immaterial, Windrun, Magnetic Field, Laser), що вимагає True Strike (MKB / Bloodthorn).",
    "label_ru": "Уклонение и промахи",
    "label_en": "Evasion & Misses",
    "description_ru": "Высокое встроенное уклонение или ослепление (Immaterial, Windrun, Magnetic Field, Laser), требующее True Strike (MKB / Bloodthorn).",
    "description_en": "High built-in evasion or blind (Immaterial, Windrun, Magnetic Field, Laser) that requires True Strike (MKB / Bloodthorn)."
  },
  "illusions": {
    "label_uk": "Ілюзії та призовні юніти",
    "category": "illusions",
    "default_weight": 9,
    "description_uk": "Створення великої кількості або дуже міцних ілюзій та підконтрольних істот, що потребує AoE-зачистки та блоку атак.",
    "label_ru": "Иллюзии и призывные юниты",
    "label_en": "Illusions & Summons",
    "description_ru": "Создание большого количества или очень крепких иллюзий и подконтрольных существ, требующее AoE-зачистки и блока атак.",
    "description_en": "Creating large numbers of or very durable illusions and controlled units, requiring AoE clear and attack damage block."
  },
  "invisibility": {
    "label_uk": "Невидимість",
    "category": "invisibility",
    "default_weight": 8,
    "description_uk": "Постійна невидимість або інвіз-ескейп/ініціація (потребує True Sight: Dust, Sentry, Gem).",
    "label_ru": "Невидимость",
    "label_en": "Invisibility",
    "description_ru": "Постоянная невидимость или инвиз-эскейп/инициация (требует True Sight: Dust, Sentry, Gem).",
    "description_en": "Permanent invisibility or invisibility escape/initiation (requires True Sight: Dust, Sentry, Gem)."
  },
  "heal_regen": {
    "label_uk": "Хіл, реген і вампіризм",
    "category": "heal",
    "default_weight": 9,
    "description_uk": "Екстремальне лікування, регенерація, вампіризм або перекачка здоровʼя (потребує анти-хілу: Vessel, Skadi, Shiva's, Crella's Crozier).",
    "label_ru": "Хил, реген и вампиризм",
    "label_en": "Healing, Regen & Lifesteal",
    "description_ru": "Экстремальное лечение, регенерация, вампиризм или перекачка здоровья (требует анти-хила: Vessel, Skadi, Shiva's, Crella's Crozier).",
    "description_en": "Extreme healing, regeneration, lifesteal, or attribute shifting (requires anti-heal: Vessel, Skadi, Shiva's, Crella's Crozier)."
  },
  "magic_burst": {
    "label_uk": "Магічний прокаст",
    "category": "magic_burst",
    "default_weight": 9,
    "description_uk": "Велика разова магічна або чиста шкода зі здібностей у командних бійках.",
    "label_ru": "Магический прокаст",
    "label_en": "Magic Burst",
    "description_ru": "Большой разовый магический или чистый урон от способностей в командных боях.",
    "description_en": "High burst magical or pure ability damage in teamfights."
  },
  "sustained_magic": {
    "label_uk": "Постійна магічна шкода",
    "category": "magic_burst",
    "default_weight": 7,
    "description_uk": "Тривала періодична (DoT) або аура-шкода у затяжному файті.",
    "label_ru": "Постоянный магический урон",
    "label_en": "Sustained Magic Damage",
    "description_ru": "Длительный периодический (DoT) или аура-урон в затяжном файте.",
    "description_en": "Sustained damage over time (DoT) or aura damage in extended fights."
  },
  "unit_target_control": {
    "label_uk": "Точковий контроль / Ульти",
    "category": "control",
    "default_weight": 8,
    "description_uk": "Націлені дизейбли або ультимати (Hex, Dismember, Doom, Fiend's Grip, Duel, Flaming Lasso, Reaper's Scythe).",
    "label_ru": "Точечный контроль / Ульты",
    "label_en": "Single-Target Control / Ultimates",
    "description_ru": "Направленные дизейблы или ультимейты (Hex, Dismember, Doom, Fiend's Grip, Duel, Flaming Lasso, Reaper's Scythe).",
    "description_en": "Point-target disables or ultimates (Hex, Dismember, Doom, Fiend's Grip, Duel, Flaming Lasso, Reaper's Scythe)."
  },
  "channeled_disable": {
    "label_uk": "Потокові здібності",
    "category": "control",
    "default_weight": 7,
    "description_uk": "Тривалий потоковий каст або ультимат (Black Hole, Freezing Field, Death Ward, Fiend's Grip, Shackles), який можна збити.",
    "label_ru": "Потоковые способности",
    "label_en": "Channeled Abilities",
    "description_ru": "Длительный потоковый каст или ультимейт (Black Hole, Freezing Field, Death Ward, Fiend's Grip, Shackles), который можно сбить.",
    "description_en": "Long channeled spell or ultimate (Black Hole, Freezing Field, Death Ward, Fiend's Grip, Shackles) that can be interrupted."
  },
  "trap_isolation": {
    "label_uk": "Пастки, рути та ізоляція",
    "category": "control",
    "default_weight": 8,
    "description_uk": "Фіксація на місці, привʼязка (Leash/Root), коги, арена чи хроносфера, де рятує Force Staff / Hurricane Pike.",
    "label_ru": "Ловушки, руты и изоляция",
    "label_en": "Traps, Roots & Isolation",
    "description_ru": "Фиксация на месте, привязка (Leash/Root), коги, арена или хроносфера, где спасает Force Staff / Hurricane Pike.",
    "description_en": "Lockdown in place, leash/root, cogs, arena, or Chronosphere where Force Staff / Hurricane Pike saves."
  },
  "silence_zone": {
    "label_uk": "Безмовність (Silence)",
    "category": "control",
    "default_weight": 7,
    "description_uk": "Надійний сайленс по області або цілі (Global Silence, Smoke Screen, Static Storm, Ancient Seal).",
    "label_ru": "Безмолвие (Silence)",
    "label_en": "Silence",
    "description_ru": "Надежный сайленс по области или цели (Global Silence, Smoke Screen, Static Storm, Ancient Seal).",
    "description_en": "Reliable area or single-target silence (Global Silence, Smoke Screen, Static Storm, Ancient Seal)."
  },
  "physical_burst": {
    "label_uk": "Фізичний бурст і мінус-броня",
    "category": "physical",
    "default_weight": 8,
    "description_uk": "Високий фізичний ДПС з руки, критичні удари або сильне зниження броні.",
    "label_ru": "Физический бурст и минус-броня",
    "label_en": "Physical Burst & Armor Reduction",
    "description_ru": "Высокий физический ДПС с руки, критические удары или сильное снижение брони.",
    "description_en": "High right-click physical DPS, critical strikes, or heavy armor reduction."
  },
  "high_mobility": {
    "label_uk": "Висока мобільність",
    "category": "mobility",
    "default_weight": 7,
    "description_uk": "Блінки, ривки та швидкі вриви, проти яких потрібен миттєвий контроль (Hex, Orchid/Bloodthorn, Atos/Gleipnir).",
    "label_ru": "Высокая мобильность",
    "label_en": "High Mobility",
    "description_ru": "Блинки, рывки и быстрые врывы, против которых нужен мгновенный контроль (Hex, Orchid/Bloodthorn, Atos/Gleipnir).",
    "description_en": "Blinks, dashes, and fast dives that require instant lockdown (Hex, Orchid/Bloodthorn, Atos/Gleipnir)."
  },
  "dispellable_save": {
    "label_uk": "Сейв-бафи (під Dispel)",
    "category": "buffs",
    "default_weight": 7,
    "description_uk": "Захисні або безтілесні бафи (Ghost Shroud, Windrun, Guardian Angel, Aphotic Shield, Decrepify), що знімаються Nullifier / Eul.",
    "label_ru": "Сейв-баффы (под Dispel)",
    "label_en": "Save Buffs (Dispellable)",
    "description_ru": "Защитные или бесплотные баффы (Ghost Shroud, Windrun, Guardian Angel, Aphotic Shield, Decrepify), снимаемые Nullifier / Eul.",
    "description_en": "Protective or ethereal buffs (Ghost Shroud, Windrun, Guardian Angel, Aphotic Shield, Decrepify) removed by Nullifier / Eul."
  },
  "mana_burn": {
    "label_uk": "Спалення мани",
    "category": "illusions",
    "default_weight": 6,
    "description_uk": "Швидке випалювання мани атаками, ілюзіями або здібностями (Mana Break, EMP, Mana Burn).",
    "label_ru": "Выжигание маны",
    "label_en": "Mana Burn",
    "description_ru": "Быстрое выжигание маны атаками, иллюзиями или способностями (Mana Break, EMP, Mana Burn).",
    "description_en": "Rapid mana burn from attacks, illusions, or abilities (Mana Break, EMP, Mana Burn)."
  }
};

const FALLBACK_TAG_MAPPING = {
  "illusions": "illusions",
  "invisibility": "invisibility",
  "evasion": "evasion",
  "heal_regen": "heal_regen",
  "magic_damage": "magic_burst",
  "pure_damage": "magic_burst",
  "physical_damage": "physical_burst",
  "stun_disable": "unit_target_control",
  "silence_hex": "silence_zone",
  "root_leash": "trap_isolation",
  "bkb_pierce": "unit_target_control",
  "channeled": "channeled_disable",
  "mobility_blink": "high_mobility",
  "attack_modifier": "physical_burst",
  "reflected_damage": "damage_reflection",
  "summons": "illusions",
  "defensive_buff": "dispellable_save",
  "mana_burn": "mana_burn"
};

const BREAKABLE_PASSIVES_MAP = {
  "bristleback_bristleback": {
    "severity": 3,
    "note_uk": "Break повністю вимикає зменшення шкоди зі спини та авто-залпи Quill Spray.",
    "note_ru": "Break полностью отключает снижение урона со спины и авто-залпы Quill Spray.",
    "note_en": "Break completely disables back damage reduction and automatic Quill Spray procs."
  },
  "bristleback_warpath": {
    "severity": 2,
    "note_uk": "Break блокує набір нових стаків Warpath.",
    "note_ru": "Break блокирует набор новых стаков Warpath.",
    "note_en": "Break prevents gaining new Warpath stacks."
  },
  "bristleback_prickly": {
    "severity": 2,
    "note_uk": "Break вимикає вроджений бонус шкоди й тривалості дебафів зі спини.",
    "note_ru": "Break отключает врожденный бонус урона и длительности дебаффов со спины.",
    "note_en": "Break disables the innate bonus damage and debuff duration when attacking from behind."
  },
  "spectre_dispersion": {
    "severity": 3,
    "note_uk": "Break вимикає 20%+ поглинання і відбиття шкоди Dispersion.",
    "note_ru": "Break отключает 20%+ поглощение и отражение урона Dispersion.",
    "note_en": "Break disables the 20%+ damage absorption and reflection of Dispersion."
  },
  "spectre_desolate": {
    "severity": 3,
    "note_uk": "Break вимикає вроджену чисту шкоду Desolate по одиночних цілях.",
    "note_ru": "Break отключает врожденный чистый урон Desolate по одиночным целям.",
    "note_en": "Break disables the innate Desolate pure damage against isolated targets."
  },
  "phantom_assassin_immaterial": {
    "severity": 3,
    "note_uk": "Break повністю вимикає пасивне ухилення Immaterial.",
    "note_ru": "Break полностью отключает пассивное уклонение Immaterial.",
    "note_en": "Break completely disables Immaterial passive evasion."
  },
  "phantom_assassin_coup_de_grace": {
    "severity": 3,
    "note_uk": "Break вимикає критичні удари Coup de Grace.",
    "note_ru": "Break отключает критические удары Coup de Grace.",
    "note_en": "Break disables Coup de Grace critical strikes."
  },
  "huskar_berserkers_blood": {
    "severity": 3,
    "note_uk": "Break позбавляє Huskar регенерації, швидкості атаки та опору магії від втраченого HP.",
    "note_ru": "Break лишает Huskar регенерации, скорости атаки и сопротивления магии от потерянного HP.",
    "note_en": "Break strips Huskar of health regen, attack speed, and magic resistance from missing HP."
  },
  "shredder_reactive_armor": {
    "severity": 3,
    "note_uk": "Break блокує набір стаків броні та регенерації Reactive Armor.",
    "note_ru": "Break блокирует набор стаков брони и регенерации Reactive Armor.",
    "note_en": "Break prevents gaining new Reactive Armor stacks of armor and regen."
  },
  "dragon_knight_dragon_blood": {
    "severity": 3,
    "note_uk": "Break вимикає вроджену пасивну броню та регенерацію Dragon Blood.",
    "note_ru": "Break отключает врожденную пассивную броню и регенерацию Dragon Blood.",
    "note_en": "Break disables the innate passive armor and regen of Dragon Blood."
  },
  "dragon_knight_wyrms_wrath": {
    "severity": 3,
    "note_uk": "Break вимикає посилення атак та бонуси Wyrm's Wrath.",
    "note_ru": "Break отключает усиление атак и бонусы Wyrm's Wrath.",
    "note_en": "Break disables attack enhancements and bonuses from Wyrm's Wrath."
  },
  "viper_corrosive_skin": {
    "severity": 3,
    "note_uk": "Break вимикає опір магії та зворотну отруту Corrosive Skin.",
    "note_ru": "Break отключает сопротивление магии и ответный яд Corrosive Skin.",
    "note_en": "Break disables the magic resistance and retaliatory poison of Corrosive Skin."
  },
  "viper_predator": {
    "severity": 2,
    "note_uk": "Break вимикає вроджену додаткову шкоду по поранених цілях.",
    "note_ru": "Break отключает врожденный дополнительный урон по раненым целям.",
    "note_en": "Break disables the innate bonus damage against wounded targets."
  },
  "tidehunter_kraken_shell": {
    "severity": 3,
    "note_uk": "Break вимикає блок шкоди та сильне саморозвіювання Kraken Shell.",
    "note_ru": "Break отключает блок урона и сильное саморазвеивание Kraken Shell.",
    "note_en": "Break disables the damage block and strong self-dispel of Kraken Shell."
  },
  "enchantress_untouchable": {
    "severity": 3,
    "note_uk": "Break повністю вимикає уповільнення атак Untouchable.",
    "note_ru": "Break полностью отключает замедление атак Untouchable.",
    "note_en": "Break completely disables the Untouchable attack slow."
  },
  "abaddon_frostmourne": {
    "severity": 2,
    "note_uk": "Break не дає накладати Curse of Avernus.",
    "note_ru": "Break не дает накладывать Curse of Avernus.",
    "note_en": "Break prevents applying Curse of Avernus."
  },
  "abaddon_borrowed_time": {
    "severity": 3,
    "note_uk": "Break блокує автоматичне спрацювання Borrowed Time (змушує прожимати вручну до стану/сайленсу).",
    "note_ru": "Break блокирует автоматическое срабатывание Borrowed Time (заставляет прожимать вручную до стана/сайленса).",
    "note_en": "Break blocks Borrowed Time from triggering automatically (forcing manual activation before stun/silence)."
  },
  "abaddon_withering_mist": {
    "severity": 2,
    "note_uk": "Break вимикає вроджене зниження хілу Withering Mist.",
    "note_ru": "Break отключает врожденное снижение хила Withering Mist.",
    "note_en": "Break disables the innate heal reduction of Withering Mist."
  },
  "phantom_lancer_juxtapose": {
    "severity": 3,
    "note_uk": "Break забороняє Phantom Lancer створювати нові ілюзії Juxtapose з ударів.",
    "note_ru": "Break запрещает Phantom Lancer создавать новые иллюзии Juxtapose с ударов.",
    "note_en": "Break prevents Phantom Lancer from spawning new Juxtapose illusions on attacks."
  },
  "slark_essence_shift": {
    "severity": 3,
    "note_uk": "Break вимикає крадіжку атрибутів Essence Shift при ударах.",
    "note_ru": "Break отключает кражу атрибутов Essence Shift при ударах.",
    "note_en": "Break disables Essence Shift attribute stealing on attacks."
  },
  "slark_shadow_dance": {
    "severity": 2,
    "note_uk": "Break вимикає пасивну регенерацію Barracuda поза видимістю ворога.",
    "note_ru": "Break отключает пассивную регенерацию Barracuda вне видимости врага.",
    "note_en": "Break disables Barracuda passive regeneration while out of enemy vision."
  },
  "monkey_king_jingu_mastery": {
    "severity": 3,
    "note_uk": "Break блокує набір зарядів Jingu Mastery на цілях.",
    "note_ru": "Break блокирует набор зарядов Jingu Mastery на целях.",
    "note_en": "Break prevents building Jingu Mastery charges on targets."
  },
  "ursa_fury_swipes": {
    "severity": 3,
    "note_uk": "Break не дає Ursa накладати нові стаки Fury Swipes.",
    "note_ru": "Break не дает Ursa накладывать новые стаки Fury Swipes.",
    "note_en": "Break prevents Ursa from applying new Fury Swipes stacks."
  },
  "ursa_maul": {
    "severity": 2,
    "note_uk": "Break вимикає вроджений бонус до атаки від поточного здоровʼя.",
    "note_ru": "Break отключает врожденный бонус к атаке от текущего здоровья.",
    "note_en": "Break disables the innate attack damage bonus based on current health."
  },
  "life_stealer_feast": {
    "severity": 3,
    "note_uk": "Break вимикає процентний вампіризм та шкоду по макс. HP від Feast.",
    "note_ru": "Break отключает процентный вампиризм и урон от макс. HP от Feast.",
    "note_en": "Break disables the percentage-based lifesteal and max HP damage of Feast."
  },
  "life_stealer_ghoul_frenzy": {
    "severity": 2,
    "note_uk": "Break вимикає вроджений бонус до швидкості атаки Ghoul Frenzy.",
    "note_ru": "Break отключает врожденный бонус к скорости атаки Ghoul Frenzy.",
    "note_en": "Break disables the innate attack speed bonus of Ghoul Frenzy."
  },
  "axe_counter_helix": {
    "severity": 2,
    "note_uk": "Break вимикає пасивні оберти Counter Helix.",
    "note_ru": "Break отключает пассивные вращения Counter Helix.",
    "note_en": "Break disables passive Counter Helix spins."
  },
  "axe_one_man_army": {
    "severity": 2,
    "note_uk": "Break вимикає вроджене отримання сили від броні One Man Army.",
    "note_ru": "Break отключает врожденное получение силы от брони One Man Army.",
    "note_en": "Break disables the innate strength gain from armor of One Man Army."
  },
  "centaur_return": {
    "severity": 2,
    "note_uk": "Break вимикає пасивну зворотну шкоду Retaliate.",
    "note_ru": "Break отключает пассивный ответный урон Retaliate.",
    "note_en": "Break disables passive Retaliate return damage."
  },
  "centaur_horsepower": {
    "severity": 2,
    "note_uk": "Break вимикає вроджену швидкість руху від сили Horsepower.",
    "note_ru": "Break отключает врожденную скорость передвижения от силы Horsepower.",
    "note_en": "Break disables the innate movement speed from strength of Horsepower."
  },
  "mars_bulwark": {
    "severity": 2,
    "note_uk": "Break вимикає пасивне зменшення фізичної шкоди щитом Bulwark.",
    "note_ru": "Break отключает пассивное снижение физического урона щитом Bulwark.",
    "note_en": "Break disables the passive physical damage reduction of Bulwark."
  },
  "mars_dauntless": {
    "severity": 2,
    "note_uk": "Break вимикає вроджену регенерацію Dauntless.",
    "note_ru": "Break отключает врожденную регенерацию Dauntless.",
    "note_en": "Break disables the innate regeneration of Dauntless."
  },
  "pudge_innate_graft_flesh": {
    "severity": 2,
    "note_uk": "Break блокує отримання нових стаків сили Flesh Heap.",
    "note_ru": "Break блокирует получение новых стаков силы Flesh Heap.",
    "note_en": "Break prevents gaining new Flesh Heap strength stacks."
  },
  "necrolyte_heartstopper_aura": {
    "severity": 2,
    "note_uk": "Break вимикає ауру випалювання здоровʼя Heartstopper Aura.",
    "note_ru": "Break отключает ауру выжигания здоровья Heartstopper Aura.",
    "note_en": "Break disables the health degeneration of Heartstopper Aura."
  },
  "necrolyte_sadist": {
    "severity": 2,
    "note_uk": "Break блокує набір нових стаків регенерації Sadist.",
    "note_ru": "Break блокирует набор новых стаков регенерации Sadist.",
    "note_en": "Break prevents gaining new Sadist regeneration stacks."
  },
  "troll_warlord_fervor": {
    "severity": 3,
    "note_uk": "Break не дає Troll Warlord набирати нові стаки швидкості атаки Fervor.",
    "note_ru": "Break не дает Troll Warlord набирать новые стаки скорости атаки Fervor.",
    "note_en": "Break prevents Troll Warlord from gaining new Fervor attack speed stacks."
  },
  "troll_warlord_berserkers_rage": {
    "severity": 2,
    "note_uk": "Break вимикає шанс привʼязки (Ensnare) та бонуси в мілі-стійці.",
    "note_ru": "Break отключает шанс привязки (Ensnare) и бонусы в мили-стойке.",
    "note_en": "Break disables the ensnare chance and melee stance bonuses."
  },
  "drow_ranger_marksmanship": {
    "severity": 3,
    "note_uk": "Break вимикає проки Marksmanship і бонусну спритність.",
    "note_ru": "Break отключает проки Marksmanship и бонусную ловкость.",
    "note_en": "Break disables Marksmanship procs and bonus agility."
  },
  "drow_ranger_trueshot": {
    "severity": 2,
    "note_uk": "Break вимикає вроджену ауру спритності Precision Aura.",
    "note_ru": "Break отключает врожденную ауру ловкости Precision Aura.",
    "note_en": "Break disables the innate agility bonus of Precision Aura."
  },
  "antimage_mana_break": {
    "severity": 2,
    "note_uk": "Break вимикає спалювання мани з атак Mana Break.",
    "note_ru": "Break отключает выжигание маны с атак Mana Break.",
    "note_en": "Break disables mana burn on attacks from Mana Break."
  },
  "antimage_counterspell": {
    "severity": 2,
    "note_uk": "Break вимикає пасивний опір магії від Counterspell.",
    "note_ru": "Break отключает пассивное сопротивление магии от Counterspell.",
    "note_en": "Break disables the passive magic resistance of Counterspell."
  },
  "antimage_persectur": {
    "severity": 2,
    "note_uk": "Break вимикає вроджене сповільнення Persecutor.",
    "note_ru": "Break отключает врожденное замедление Persecutor.",
    "note_en": "Break disables the innate slow of Persecutor."
  },
  "obsidian_destroyer_equilibrium": {
    "severity": 3,
    "note_uk": "Break вимикає вроджене відновлення мани Essence Flux — OD швидко залишається без мани.",
    "note_ru": "Break отключает врожденное восстановление маны Essence Flux — OD быстро остается без маны.",
    "note_en": "Break disables the innate mana restore of Essence Flux — OD quickly runs out of mana."
  },
  "elder_titan_natural_order": {
    "severity": 3,
    "note_uk": "Break вимикає ауру 100% зниження базової броні та магічного опору Natural Order.",
    "note_ru": "Break отключает ауру 100% снижения базовой брони и магического сопротивления Natural Order.",
    "note_en": "Break disables the 100% base armor and magic resistance reduction of Natural Order."
  },
  "abyssal_underlord_atrophy_aura": {
    "severity": 2,
    "note_uk": "Break вимикає ауру зниження базової атаки ворогів та отримання бонусного урону.",
    "note_ru": "Break отключает ауру снижения базовой атаки врагов и получение бонусного урона.",
    "note_en": "Break disables the enemy base attack damage reduction aura and bonus damage gain."
  },
  "razor_storm_surge": {
    "severity": 2,
    "note_uk": "Break вимикає пасивні розряди блискавок Storm Surge.",
    "note_ru": "Break отключает пассивные разряды молний Storm Surge.",
    "note_en": "Break disables passive Storm Surge lightning procs."
  },
  "spirit_breaker_greater_bash": {
    "severity": 2,
    "note_uk": "Break вимикає пасивний шанс башу з руки.",
    "note_ru": "Break отключает пассивный шанс баша с руки.",
    "note_en": "Break disables the passive right-click bash chance."
  },
  "faceless_void_time_lock": {
    "severity": 2,
    "note_uk": "Break вимикає пасивні баші Time Lock у куполі та бою.",
    "note_ru": "Break отключает пассивные баши Time Lock в куполе и бою.",
    "note_en": "Break disables passive Time Lock bashes inside Chronosphere and combat."
  },
  "slardar_bash": {
    "severity": 2,
    "note_uk": "Break блокує накопичення ударів для Bash of the Deep.",
    "note_ru": "Break блокирует накопление ударов для Bash of the Deep.",
    "note_en": "Break prevents counting attacks toward Bash of the Deep."
  },
  "slardar_seaborn_sentinel": {
    "severity": 2,
    "note_uk": "Break вимикає річкові бонуси броні, регену й атаки Seaborn Sentinel.",
    "note_ru": "Break отключает речные бонусы брони, регена и атаки Seaborn Sentinel.",
    "note_en": "Break disables the river armor, regen, and attack bonuses of Seaborn Sentinel."
  },
  "chaos_knight_chaos_strike": {
    "severity": 2,
    "note_uk": "Break вимикає крити та вампіризм Chaos Strike у самого CK.",
    "note_ru": "Break отключает криты и вампиризм Chaos Strike у самого CK.",
    "note_en": "Break disables Chaos Strike critical hits and lifesteal on CK himself."
  },
  "skeleton_king_mortal_strike": {
    "severity": 2,
    "note_uk": "Break вимикає критичний удар Mortal Strike.",
    "note_ru": "Break отключает критический удар Mortal Strike.",
    "note_en": "Break disables the Mortal Strike critical hit."
  },
  "skeleton_king_vampiric_spirit": {
    "severity": 2,
    "note_uk": "Break вимикає пасивний вампіризм (але не скасовує духа при смерті).",
    "note_ru": "Break отключает пассивный вампиризм (но не отменяет духа при смерти).",
    "note_en": "Break disables passive lifesteal (though it does not prevent the wraith form on death)."
  },
  "juggernaut_blade_dance": {
    "severity": 2,
    "note_uk": "Break вимикає критичні удари Blade Dance.",
    "note_ru": "Break отключает критические удары Blade Dance.",
    "note_en": "Break disables Blade Dance critical strikes."
  },
  "juggernaut_bladeform": {
    "severity": 2,
    "note_uk": "Break блокує набір нових стаків Bladeform.",
    "note_ru": "Break блокирует набор новых стаков Bladeform.",
    "note_en": "Break prevents gaining new Bladeform stacks."
  },
  "dawnbreaker_luminosity": {
    "severity": 2,
    "note_uk": "Break блокує набір стаків крита та лікування Luminosity.",
    "note_ru": "Break блокирует набор стаков крита и лечения Luminosity.",
    "note_en": "Break prevents building Luminosity crit and heal stacks."
  },
  "legion_commander_moment_of_courage": {
    "severity": 2,
    "note_uk": "Break вимикає контратаки з вампіризмом Moment of Courage у дуелі.",
    "note_ru": "Break отключает контратаки с вампиризмом Moment of Courage в дуэли.",
    "note_en": "Break disables Moment of Courage lifesteal counterattacks during Duel."
  },
  "broodmother_incapacitating_bite": {
    "severity": 2,
    "note_uk": "Break вимикає накладання промахів та сповільнення з укусів.",
    "note_ru": "Break отключает наложение промахов и замедления с укусов.",
    "note_en": "Break disables applying miss chance and slow on attacks."
  },
  "naga_siren_eelskin": {
    "severity": 2,
    "note_uk": "Break вимикає вроджене ухилення Eelskin.",
    "note_ru": "Break отключает врожденное уклонение Eelskin.",
    "note_en": "Break disables the innate evasion of Eelskin."
  },
  "naga_siren_rip_tide": {
    "severity": 2,
    "note_uk": "Break блокує лічильник атак Rip Tide на герої.",
    "note_ru": "Break блокирует счетчик атак Rip Tide на герое.",
    "note_en": "Break stops the Rip Tide attack counter on the hero."
  },
  "riki_innate_backstab": {
    "severity": 2,
    "note_uk": "Break вимикає множник шкоди від спритності при ударах у спину Backstab.",
    "note_ru": "Break отключает множитель урона от ловкости при ударах в спину Backstab.",
    "note_en": "Break disables the agility damage multiplier when attacking from behind with Backstab."
  },
  "riki_backstab": {
    "severity": 2,
    "note_uk": "Break вимикає невидимість Cloak and Dagger на час дії.",
    "note_ru": "Break отключает невидимость Cloak and Dagger на время действия.",
    "note_en": "Break disables Cloak and Dagger invisibility for its duration."
  },
  "bloodseeker_thirst": {
    "severity": 2,
    "note_uk": "Break вимикає бонусну швидкість бігу Thirst від поранених ворогів.",
    "note_ru": "Break отключает бонусную скорость бега Thirst от раненых врагов.",
    "note_en": "Break disables bonus movement speed from Thirst on wounded enemies."
  },
  "bloodseeker_sanguivore": {
    "severity": 2,
    "note_uk": "Break вимикає вроджене лікування за добивання Sanguivore.",
    "note_ru": "Break отключает врожденное лечение за добивания Sanguivore.",
    "note_en": "Break disables the innate heal on last hits from Sanguivore."
  },
  "visage_gravekeepers_cloak": {
    "severity": 2,
    "note_uk": "Break блокує відновлення нових шарів захисту Gravekeeper's Cloak.",
    "note_ru": "Break блокирует восстановление новых слоев защиты Gravekeeper's Cloak.",
    "note_en": "Break prevents Gravekeeper's Cloak from restoring new protection layers."
  },
  "pangolier_lucky_shot": {
    "severity": 2,
    "note_uk": "Break вимикає спрацювання Lucky Shot (-броня та -AS).",
    "note_ru": "Break отключает срабатывание Lucky Shot (-броня и -AS).",
    "note_en": "Break disables Lucky Shot procs (armor and attack speed reduction)."
  },
  "alchemist_corrosive_weaponry": {
    "severity": 2,
    "note_uk": "Break блокує накладання стаків Corrosive Weaponry.",
    "note_ru": "Break блокирует наложение стаков Corrosive Weaponry.",
    "note_en": "Break prevents applying Corrosive Weaponry stacks."
  },
  "beastmaster_inner_beast": {
    "severity": 2,
    "note_uk": "Break вимикає вроджену ауру швидкості атаки Inner Beast.",
    "note_ru": "Break отключает врожденную ауру скорости атаки Inner Beast.",
    "note_en": "Break disables the innate attack speed aura of Inner Beast."
  },
  "beastmaster_drums_of_slom": {
    "severity": 2,
    "note_uk": "Break вимикає удари барабанів і відхіл Drums of Slom.",
    "note_ru": "Break отключает удары барабанов и отхил Drums of Slom.",
    "note_en": "Break disables the drum strikes and healing of Drums of Slom."
  },
  "lycan_feral_impulse": {
    "severity": 2,
    "note_uk": "Break вимикає пасивний бонус шкоди й регену Feral Impulse.",
    "note_ru": "Break отключает пассивный бонус урона и регена Feral Impulse.",
    "note_en": "Break disables the passive bonus damage and regen of Feral Impulse."
  },
  "luna_moon_glaive": {
    "severity": 2,
    "note_uk": "Break вимикає відскоки глеф Moon Glaives.",
    "note_ru": "Break отключает отскоки глеф Moon Glaives.",
    "note_en": "Break disables Moon Glaives bounces."
  },
  "nevermore_dark_lord": {
    "severity": 2,
    "note_uk": "Break вимикає ауру зниження броні Presence of the Dark Lord.",
    "note_ru": "Break отключает ауру снижения брони Presence of the Dark Lord.",
    "note_en": "Break disables the armor reduction aura of Presence of the Dark Lord."
  },
  "night_stalker_hunter_in_the_night": {
    "severity": 2,
    "note_uk": "Break вимикає нічну швидкість бігу й атаки Hunter in the Night.",
    "note_ru": "Break отключает ночную скорость бега и атаки Hunter in the Night.",
    "note_en": "Break disables the nighttime movement and attack speed of Hunter in the Night."
  },
  "night_stalker_midnight_feast": {
    "severity": 2,
    "note_uk": "Break вимикає лікування з атак Midnight Feast.",
    "note_ru": "Break отключает лечение с атак Midnight Feast.",
    "note_en": "Break disables healing on attacks from Midnight Feast."
  }
};

const UNBREAKABLE_PASSIVES_SET = new Set([
  "medusa_mana_shield",
  "tiny_grow",
  "meepo_divided_we_stand",
  "ogre_magi_multicast",
  "ogre_magi_dumb_luck",
  "undying_ceaseless_dirge",
  "shadow_shaman_fowl_play",
  "wisp_equilibrium",
  "oracle_prognosticate",
  "witch_doctor_gris_gris",
  "winter_wyvern_eldwurms_edda",
  "marci_special_delivery",
  "chaos_knight_fundamental_forging",
  "tinker_eureka",
  "invoker_invoke",
  "lone_druid_spirit_bear",
  "kez_switch_weapons",
  "troll_warlord_switch_stance",
  "lich_death_charge",
  "chen_zealot",
  "earth_spirit_stone_caller",
  "monkey_king_mischief",
  "phantom_assassin_blur",
  "morphling_ebb_and_flow",
  "alchemist_goblins_greed",
  "bounty_hunter_big_game_hunter"
]);

const ITEM_POSITIONS = {
  "silver_edge": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "monkey_king_bar": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "spirit_vessel": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      3,
      4
    ],
    "role_hint_uk": "Pos 2/3/4 (Mid / Offlane / Roam)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 2/3/4 (Mid / Offlane / Roam)",
    "role_hint_en": "Pos 2/3/4 (Mid / Offlane / Roam)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "skadi": {
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Late (4+ слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Late (4+ слот)",
    "timing_label_en": "Late (4th+ item)"
  },
  "lotus_orb": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Offlane / Soft Support)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2–3 слот)",
    "role_hint_ru": "Pos 3/4 (Offlane / Soft Support)",
    "role_hint_en": "Pos 3/4 (Offlane / Soft Support)",
    "timing_label_ru": "Mid (2–3 слот)",
    "timing_label_en": "Mid (2nd–3rd item)"
  },
  "sphere": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Mid/Late (3-й слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Mid/Late (3-й слот)",
    "timing_label_en": "Mid/Late (3rd item)"
  },
  "force_staff": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Support / Offlane)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 4/5 (Support / Offlane)",
    "role_hint_en": "Pos 4/5 (Support / Offlane)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "hurricane_pike": {
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Ranged Core)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2–3 слот)",
    "role_hint_ru": "Pos 1/2 (Ranged Core)",
    "role_hint_en": "Pos 1/2 (Ranged Core)",
    "timing_label_ru": "Mid (2–3 слот)",
    "timing_label_en": "Mid (2nd–3rd item)"
  },
  "black_king_bar": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2,
      3
    ],
    "role_hint_uk": "Pos 1/2/3 (Core)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 1/2/3 (Core)",
    "role_hint_en": "Pos 1/2/3 (Core)",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "mjollnir": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Mid/Late (2–3 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Mid/Late (2–3 слот)",
    "timing_label_en": "Mid/Late (2nd–3rd item)"
  },
  "crimson_guard": {
    "positions": [
      3,
      4
    ],
    "primary_positions": [
      3
    ],
    "role_hint_uk": "Pos 3 (Offlane)",
    "timing_phase": "mid",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "shivas_guard": {
    "positions": [
      2,
      3
    ],
    "primary_positions": [
      3
    ],
    "role_hint_uk": "Pos 3 (Offlane / Mid)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid/Late (3-й слот)",
    "role_hint_ru": "Pos 3 (Offlane / Mid)",
    "role_hint_en": "Pos 3 (Offlane / Mid)",
    "timing_label_ru": "Mid/Late (3-й слот)",
    "timing_label_en": "Mid/Late (3rd item)"
  },
  "bfury": {
    "positions": [
      1
    ],
    "primary_positions": [
      1
    ],
    "role_hint_uk": "Pos 1 (Melee Carry)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 1 (Melee Carry)",
    "role_hint_en": "Pos 1 (Melee Carry)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "pipe": {
    "positions": [
      3,
      4
    ],
    "primary_positions": [
      3
    ],
    "role_hint_uk": "Pos 3 (Offlane)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "mage_slayer": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      2,
      3
    ],
    "role_hint_uk": "Pos 2/3 (Mid / Offlane)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 2/3 (Mid / Offlane)",
    "role_hint_en": "Pos 2/3 (Mid / Offlane)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "eternal_shroud": {
    "positions": [
      2,
      3
    ],
    "primary_positions": [
      3
    ],
    "role_hint_uk": "Pos 3 (Offlane / Frontline)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 3 (Offlane / Frontline)",
    "role_hint_en": "Pos 3 (Offlane / Frontline)",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "glimmer_cape": {
    "positions": [
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Support)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 4/5 (Support)",
    "role_hint_en": "Pos 4/5 (Support)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "dust": {
    "positions": [
      1,
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      3,
      4,
      5
    ],
    "role_hint_uk": "Усі позиції (Pos 2–5)",
    "timing_phase": "early",
    "timing_label_uk": "Early (з 1-ї хв)",
    "role_hint_ru": "Все позиции (Pos 2–5)",
    "role_hint_en": "All positions (Pos 2–5)",
    "timing_label_ru": "Early (с 1-й мин)",
    "timing_label_en": "Early (from min 1)"
  },
  "ward_sentry": {
    "positions": [
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Support)",
    "timing_phase": "early",
    "timing_label_uk": "Early (постійно)",
    "role_hint_ru": "Pos 4/5 (Support)",
    "role_hint_en": "Pos 4/5 (Support)",
    "timing_label_ru": "Early (постоянно)",
    "timing_label_en": "Early (constantly)"
  },
  "gem": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Offlane / Support)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (після 18 хв)",
    "role_hint_ru": "Pos 3/4 (Offlane / Support)",
    "role_hint_en": "Pos 3/4 (Offlane / Support)",
    "timing_label_ru": "Mid (после 18 мин)",
    "timing_label_en": "Mid (after 18 min)"
  },
  "nullifier": {
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "orchid": {
    "positions": [
      1,
      2,
      3,
      4
    ],
    "primary_positions": [
      2,
      4
    ],
    "role_hint_uk": "Pos 2/4 (Mid / Ganker)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 2/4 (Mid / Ganker)",
    "role_hint_en": "Pos 2/4 (Mid / Ganker)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "bloodthorn": {
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "timing_phase": "late",
    "timing_label_uk": "Late (4+ слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "timing_label_ru": "Late (4+ слот)",
    "timing_label_en": "Late (4th+ item)"
  },
  "sheepstick": {
    "positions": [
      2,
      3,
      4
    ],
    "primary_positions": [
      2,
      3
    ],
    "role_hint_uk": "Pos 2/3 (Mid / Offlane)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 2/3 (Mid / Offlane)",
    "role_hint_en": "Pos 2/3 (Mid / Offlane)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "cyclone": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Support / Mid)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 4/5 (Support / Mid)",
    "role_hint_en": "Pos 4/5 (Support / Mid)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "ghost": {
    "positions": [
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Support)",
    "timing_phase": "early",
    "timing_label_uk": "Early (сейв 1500g)",
    "role_hint_ru": "Pos 4/5 (Support)",
    "role_hint_en": "Pos 4/5 (Support)",
    "timing_label_ru": "Early (сейв 1500g)",
    "timing_label_en": "Early (1500g save)"
  },
  "heavens_halberd": {
    "positions": [
      3,
      4
    ],
    "primary_positions": [
      3
    ],
    "role_hint_uk": "Pos 3 (Offlane)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "blade_mail": {
    "positions": [
      2,
      3
    ],
    "primary_positions": [
      3
    ],
    "role_hint_uk": "Pos 3 (Offlane)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "guardian_greaves": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Аура + Диспель)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2–3 слот)",
    "role_hint_ru": "Pos 3/4 (Аура + Диспел)",
    "role_hint_en": "Pos 3/4 (Aura + Dispel)",
    "timing_label_ru": "Mid (2–3 слот)",
    "timing_label_en": "Mid (2nd–3rd item)"
  },
  "assault": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      3,
      1
    ],
    "role_hint_uk": "Pos 1/3 (Аура броні та AS)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/3 (Аура брони и AS)",
    "role_hint_en": "Pos 1/3 (Armor & AS Aura)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "solar_crest": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Баф кору / Сейв)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 4/5 (Бафф кору / Сейв)",
    "role_hint_en": "Pos 4/5 (Core Buff / Save)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "veil_of_discord": {
    "positions": [
      2,
      3,
      4
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Підсилення магії)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 3/4 (Усиление магии)",
    "role_hint_en": "Pos 3/4 (Spell Amp)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "kaya_and_sange": {
    "positions": [
      2,
      3
    ],
    "primary_positions": [
      2,
      3
    ],
    "role_hint_uk": "Pos 2/3 (Магічний кор)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 2/3 (Магический кор)",
    "role_hint_en": "Pos 2/3 (Magic Core)",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "manta": {
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Базовий диспел)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 1/2 (Базовый диспел)",
    "role_hint_en": "Pos 1/2 (Basic Dispel)",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "ultimate_scepter": {
    "positions": [
      1,
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      4
    ],
    "role_hint_uk": "Універсальний апгрейд скіла",
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2–3 слот)",
    "role_hint_ru": "Универсальный апгрейд скилла",
    "role_hint_en": "Universal Ability Upgrade",
    "timing_label_ru": "Mid (2–3 слот)",
    "timing_label_en": "Mid (2nd–3rd item)"
  },
  "phase_boots": {
    "positions": [
      1,
      2,
      3,
      4
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Мобільність та броня)",
    "timing_phase": "early",
    "timing_label_uk": "Early (старт)",
    "role_hint_ru": "Pos 3/4 (Мобильность и броня)",
    "role_hint_en": "Pos 3/4 (Mobility & Armor)",
    "timing_label_ru": "Early (старт)",
    "timing_label_en": "Early (starting)"
  },
  "crellas_crozier": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4,
      5
    ],
    "role_hint_uk": "Pos 3/4/5 (Анти-хіл аура + Ghost сейв)",
    "timing_phase": "late",
    "timing_label_uk": "Mid/Late (3-й слот)",
    "role_hint_ru": "Pos 3/4/5 (Анти-хил аура + Ghost сейв)",
    "role_hint_en": "Pos 3/4/5 (Anti-Heal Aura + Ghost Save)",
    "timing_label_ru": "Mid/Late (3-й слот)",
    "timing_label_en": "Mid/Late (3rd item)"
  },
  "consecrated_wraps": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4,
      5
    ],
    "role_hint_uk": "Pos 3/4/5 (Барʼєр та магічний опір)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 3/4/5 (Барьер и магическое сопротивление)",
    "role_hint_en": "Pos 3/4/5 (Barrier & Magic Resist)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "vladmir": {
    "positions": [
      1,
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Аура вампіризму, урону й броні)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 3/4 (Аура вампиризма, урона и брони)",
    "role_hint_en": "Pos 3/4 (Lifesteal, Damage & Armor Aura)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "boots_of_bearing": {
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Аура швидкості та імунітет до сповільнень)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid/Late (2–3 слот)",
    "role_hint_ru": "Pos 3/4 (Аура скорости и иммунитет к замедлениям)",
    "role_hint_en": "Pos 3/4 (Speed Aura & Slow Immunity)",
    "timing_label_ru": "Mid/Late (2–3 слот)",
    "timing_label_en": "Mid/Late (2nd–3rd item)"
  },
  "disperser": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Манаберн + подвійний диспел)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Манаберн + двойной диспел)",
    "role_hint_en": "Pos 1/2 (Mana Burn + Double Dispel)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "diffusal_blade": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "role_hint_uk": "Pos 1/2 (Спалення мани та сповільнення)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 1/2 (Выжигание маны и замедление)",
    "role_hint_en": "Pos 1/2 (Mana Burn & Slow)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "wind_waker": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      4
    ],
    "role_hint_uk": "Pos 2/4 (Сейв союзника в торнадо + диспел)",
    "timing_phase": "late",
    "timing_label_uk": "Late (4+ слот)",
    "role_hint_ru": "Pos 2/4 (Сейв союзника в торнадо + диспел)",
    "role_hint_en": "Pos 2/4 (Ally Cyclone Save + Dispel)",
    "timing_label_ru": "Late (4+ слот)",
    "timing_label_en": "Late (4th+ item)"
  },
  "ethereal_blade": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      4
    ],
    "role_hint_uk": "Pos 2/4 (Етер-сейв союзника або нюк)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 2/4 (Эзериал-сейв союзника или нюк)",
    "role_hint_en": "Pos 2/4 (Ally Ethereal Save or Nuke)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "gungir": {
    "positions": [
      2,
      3,
      4
    ],
    "primary_positions": [
      2,
      3,
      4
    ],
    "role_hint_uk": "Pos 2/3/4 (Масовий AoE-рут + радіус скілів)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid/Late (2–3 слот)",
    "role_hint_ru": "Pos 2/3/4 (Массовый AoE-рут + радиус скиллов)",
    "role_hint_en": "Pos 2/3/4 (AoE Root + AoE Bonus)",
    "timing_label_ru": "Mid/Late (2–3 слот)",
    "timing_label_en": "Mid/Late (2nd–3rd item)"
  },
  "rod_of_atos": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "role_hint_uk": "Pos 3/4 (Дальній рут по мобільних цілях)",
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 3/4 (Дальний рут по мобильным целям)",
    "role_hint_en": "Pos 3/4 (Long-Range Root vs Mobility)",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "abyssal_blade": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      3
    ],
    "role_hint_uk": "Pos 1/3 (Стан крізь BKB у ближньому бою)",
    "timing_phase": "late",
    "timing_label_uk": "Late (4+ слот)",
    "role_hint_ru": "Pos 1/3 (Стан сквозь BKB в ближнем бою)",
    "role_hint_en": "Pos 1/3 (BKB-Piercing Melee Stun)",
    "timing_label_ru": "Late (4+ слот)",
    "timing_label_en": "Late (4th+ item)"
  },
  "aeon_disk": {
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "role_hint_uk": "Pos 4/5 (Порятунок від ваншоту та сильний диспел)",
    "timing_phase": "mid",
    "timing_label_uk": "Mid/Late (2–3 слот)",
    "role_hint_ru": "Pos 4/5 (Спасение от ваншота и сильный диспел)",
    "role_hint_en": "Pos 4/5 (Burst Save & Strong Dispel)",
    "timing_label_ru": "Mid/Late (2–3 слот)",
    "timing_label_en": "Mid/Late (2nd–3rd item)"
  },
  "satanic": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1
    ],
    "role_hint_uk": "Pos 1 (Базовий диспел і 175% вампіризму)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1 (Базовый диспел и 175% вампиризма)",
    "role_hint_en": "Pos 1 (Basic Dispel & 175% Lifesteal)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "witch_blade": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      2,
      3
    ],
    "role_hint_uk": "Pos 2/3 (Mid / Int-Universal Core)",
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 2/3 (Mid / Int-Universal Core)",
    "role_hint_en": "Pos 2/3 (Mid / Int-Universal Core)",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "devastator": {
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      2,
      1
    ],
    "role_hint_uk": "Pos 2/1 (Магічний / Інт-кор)",
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 2/1 (Магический / Инт-кор)",
    "role_hint_en": "Pos 2/1 (Magic / Int Core)",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  }
};

const CURATED_ITEM_RULES = {
  "silver_edge": {
    "item_id": 249,
    "name_en": "Silver Edge",
    "category": "critical",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "Атака з інвізу накладає Break на 5 с — вимикає пасивні здібності та ріже виживаність ключових цілей.",
    "counters_tags": [
      {
        "tag": "critical_passive",
        "weight": 11,
        "reason_uk": "Повністю вимикає вирішальні пасивки ворога на 5 секунд.",
        "reason_ru": "Полностью отключает решающие пассивки врага на 5 секунд.",
        "reason_en": "Completely disables crucial enemy passives for 5 seconds."
      },
      {
        "tag": "damage_reflection",
        "weight": 9,
        "reason_uk": "Знімає пасивне відбиття та зниження шкоди (Bristleback / Dispersion).",
        "reason_ru": "Снимает пассивное отражение и снижение урона (Bristleback / Dispersion).",
        "reason_en": "Removes passive damage reflection and reduction (Bristleback / Dispersion)."
      },
      {
        "tag": "evasion",
        "weight": 6,
        "reason_uk": "Вимикає пасивне ухилення (Immaterial, Eelskin) на час дії Break.",
        "reason_ru": "Отключает пассивное уклонение (Immaterial, Eelskin) на время действия Break.",
        "reason_en": "Disables passive evasion (Immaterial, Eelskin) for the duration of Break."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 8,
      "team_reason_uk": "У ворога одразу кілька героїв, залежних від пасивок — Silver Edge стає критичним маст-хевом.",
      "team_reason_ru": "У врага сразу несколько героев, зависимых от пассивок — Silver Edge становится критическим маст-хэвом.",
      "team_reason_en": "The enemy has multiple passive-reliant heroes — Silver Edge becomes a critical must-have."
    },
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "Атака из инвиза накладывает Break на 5 с — отключает пассивные способности и режет выживаемость ключевых целей.",
    "summary_en": "Attacking from invisibility applies Break for 5s — disables passive abilities and cuts the survivability of key targets.",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "monkey_king_bar": {
    "item_id": 135,
    "name_en": "Monkey King Bar",
    "category": "critical",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "80% шанс пробити будь-яке ухилення та додаткова магічна шкода при ударах.",
    "counters_tags": [
      {
        "tag": "evasion",
        "weight": 11,
        "reason_uk": "Надійно пробиває вбудоване ухилення (Immaterial, Eelskin, Phantom Rush) та Radiance/Butterfly.",
        "reason_ru": "Надежно пробивает встроенное уклонение (Immaterial, Eelskin, Phantom Rush) и Radiance/Butterfly.",
        "reason_en": "Reliably pierces built-in evasion (Immaterial, Eelskin, Phantom Rush) and Radiance/Butterfly."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Кілька джерел промахів/ухилення у ворожому піку різко піднімають цінність True Strike.",
      "team_reason_ru": "Несколько источников промахов/уклонения во вражеском пике резко поднимают ценность True Strike.",
      "team_reason_en": "Multiple sources of miss/evasion in the enemy draft sharply increase the value of True Strike."
    },
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "80% шанс пробить любое уклонение и дополнительный магический урон при ударах.",
    "summary_en": "80% chance to pierce evasion and deal bonus magical damage on attacks.",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "spirit_vessel": {
    "item_id": 267,
    "name_en": "Spirit Vessel",
    "category": "critical",
    "role_hint_uk": "Pos 2/3/4 (Mid / Offlane / Roam)",
    "summary_uk": "Ріже відновлення здоров'я ворога на 70% і спалює по 4% від поточного HP щосекунди.",
    "counters_tags": [
      {
        "tag": "heal_regen",
        "weight": 12,
        "reason_uk": "Зменшує вхідний хіл, реген і перекачку здоров'я на 70%.",
        "reason_ru": "Уменьшает входящий хил, реген и перекачку здоровья на 70%.",
        "reason_en": "Reduces incoming healing, regen, and health gain by 70%."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 9,
      "team_reason_uk": "Ворожий драфт будується на лікуванні та сустейні — потрібен ранній Spirit Vessel на команду.",
      "team_reason_ru": "Вражеский драфт строится на лечении и сустейне — нужен ранний Spirit Vessel на команду.",
      "team_reason_en": "The enemy draft is built around healing and sustain — an early Spirit Vessel for the team is needed."
    },
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      3,
      4
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 2/3/4 (Mid / Offlane / Roam)",
    "role_hint_en": "Pos 2/3/4 (Mid / Offlane / Roam)",
    "summary_ru": "Режет восстановление здоровья врага на 70% и сжигает по 4% от текущего HP каждую секунду.",
    "summary_en": "Reduces enemy health restoration by 70% and burns 4% of current HP per second.",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "skadi": {
    "item_id": 160,
    "name_en": "Eye of Skadi",
    "category": "critical",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "Атаки знижують відновлення здоров'я на 50%, швидкість атаки на -25 та швидкість руху.",
    "counters_tags": [
      {
        "tag": "heal_regen",
        "weight": 9,
        "reason_uk": "Постійно ріже хіл і вампіризм на 50% без кулдауну і не знімається так просто, як урна.",
        "reason_ru": "Постоянно режет хил и вампиризм на 50% без кулдауна и не снимается так просто, как урна.",
        "reason_en": "Constantly cuts healing and lifesteal by 50% with no cooldown and cannot be dispelled like Vessel."
      },
      {
        "tag": "high_mobility",
        "weight": 5,
        "reason_uk": "Сповільнює рухливих корів крізь стат-файти.",
        "reason_ru": "Замедляет подвижных коров в затяжных разменах.",
        "reason_en": "Slows mobile cores in extended manfights."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Команді бракуватиме одного Vessel у лейті — Skadi закриває анти-хіл на керрі.",
      "team_reason_ru": "Команде не хватит одного Vessel в лейте — Skadi закрывает анти-хил на керри.",
      "team_reason_en": "One Vessel won't be enough in the late game — Skadi covers anti-heal on the carry."
    },
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Late (4+ слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "Атаки снижают восстановление здоровья на 50%, скорость атаки на -25 и скорость передвижения.",
    "summary_en": "Attacks reduce health restoration by 50%, attack speed by 25, and movement speed.",
    "timing_label_ru": "Late (4+ слот)",
    "timing_label_en": "Late (4th+ item)"
  },
  "lotus_orb": {
    "item_id": 226,
    "name_en": "Lotus Orb",
    "category": "critical",
    "role_hint_uk": "Pos 3/4 (Offlane / Soft Support)",
    "summary_uk": "Накладає базове розвіювання та відбиває точкові скіли назад у кастера протягом 5 секунд.",
    "counters_tags": [
      {
        "tag": "unit_target_control",
        "weight": 11,
        "reason_uk": "Віддзеркалює небезпечні точкові скіли (Hex, Finger, Track, Reaper's Scythe, Life Break).",
        "reason_ru": "Отражает опасные точечные скиллы (Hex, Finger, Track, Reaper's Scythe, Life Break).",
        "reason_en": "Reflects dangerous single-target spells (Hex, Finger, Track, Reaper's Scythe, Life Break)."
      },
      {
        "tag": "silence_zone",
        "weight": 6,
        "reason_uk": "Знімає дебафи та базовий контроль із союзників у момент касту.",
        "reason_ru": "Снимает дебаффы и базовый контроль с союзников в момент каста.",
        "reason_en": "Dispels debuffs and basic disables from allies on cast."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 8,
      "team_reason_uk": "У ворога забагато точкового контролю та небезпечних ультиматів — Lotus Orb рятує корів у кожній бійці.",
      "team_reason_ru": "У врага слишком много точечного контроля и опасных ультимейтов — Lotus Orb спасает коров в каждой драке.",
      "team_reason_en": "The enemy has too much single-target lockdown and dangerous ultimates — Lotus Orb saves cores in every fight."
    },
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2–3 слот)",
    "role_hint_ru": "Pos 3/4 (Offlane / Soft Support)",
    "role_hint_en": "Pos 3/4 (Offlane / Soft Support)",
    "summary_ru": "Накладывает базовое развеивание и отражает точечные скиллы обратно в кастера в течение 5 секунд.",
    "summary_en": "Applies a Basic Dispel and reflects single-target spells back at the caster for 5 seconds.",
    "timing_label_ru": "Mid (2–3 слот)",
    "timing_label_en": "Mid (2nd–3rd item)"
  },
  "sphere": {
    "item_id": 123,
    "name_en": "Linken's Sphere",
    "category": "defensive",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "Блокує один точковий скіл кожні 14 секунд; можна передати щит союзнику.",
    "counters_tags": [
      {
        "tag": "unit_target_control",
        "weight": 9,
        "reason_uk": "Автоматично блокує миттєвий точковий дизейбл або ульт (Dismember, Hex, Reaper's Scythe, Shadow Step).",
        "reason_ru": "Автоматически блокирует мгновенный точечный дизейбл или ульт (Dismember, Hex, Reaper's Scythe, Shadow Step).",
        "reason_en": "Automatically blocks an instant single-target disable or ultimate (Dismember, Hex, Reaper's Scythe, Shadow Step)."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Захищає від несподіваного точкового ініціювання в BKB або до нього.",
      "team_reason_ru": "Защищает от неожиданной точечной инициации в BKB или до него.",
      "team_reason_en": "Protects against sudden single-target initiation before or through BKB."
    },
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Mid/Late (3-й слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "Блокирует один точечный скилл каждые 14 секунд; можно передать щит союзнику.",
    "summary_en": "Blocks one single-target spell every 14 seconds; the shield can be transferred to an ally.",
    "timing_label_ru": "Mid/Late (3-й слот)",
    "timing_label_en": "Mid/Late (3rd item)"
  },
  "force_staff": {
    "item_id": 102,
    "name_en": "Force Staff",
    "category": "critical",
    "role_hint_uk": "Pos 4/5 (Support / Offlane)",
    "summary_uk": "Штовхає ціль на 600 одиниць: витягує з пасток, диму, когів та зони мілі-керрі.",
    "counters_tags": [
      {
        "tag": "trap_isolation",
        "weight": 12,
        "reason_uk": "Миттєво виштовхує з Power Cogs, після Meat Hook або з-під фокусу.",
        "reason_ru": "Мгновенно выталкивает из Power Cogs, после Meat Hook или из-под фокуса.",
        "reason_en": "Instantly pushes targets out of Power Cogs, after Meat Hook, or out of enemy focus."
      },
      {
        "tag": "silence_zone",
        "weight": 9,
        "reason_uk": "Дозволяє вийти із зони Smoke Screen чи Ice Wall без застосування здібностей.",
        "reason_ru": "Позволяет выйти из зоны Smoke Screen или Ice Wall без применения способностей.",
        "reason_en": "Allows escaping Smoke Screen or Ice Wall without casting abilities."
      },
      {
        "tag": "physical_burst",
        "weight": 6,
        "reason_uk": "Рве дистанцію проти мілі-керрі, що стрибнули за спину.",
        "reason_ru": "Рвет дистанцию против мили-керри, прыгнувших за спину.",
        "reason_en": "Creates distance against melee carries jumping the backline."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 8,
      "team_reason_uk": "Потрібно 2+ Force Staff на команду, щоб рятувати союзників із ізоляції та позиційних пасток.",
      "team_reason_ru": "Нужно 2+ Force Staff на команду, чтобы спасать союзников из изоляции и позиционных ловушек.",
      "team_reason_en": "2+ Force Staffs on the team are needed to save allies from isolation and positional traps."
    },
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 4/5 (Support / Offlane)",
    "role_hint_en": "Pos 4/5 (Support / Offlane)",
    "summary_ru": "Толкает цель на 600 единиц: вытягивает из ловушек, дыма, когов и зоны мили-керри.",
    "summary_en": "Pushes the target 600 units: pulls allies out of traps, smoke, cogs, and melee carry range.",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "hurricane_pike": {
    "item_id": 263,
    "name_en": "Hurricane Pike",
    "category": "utility",
    "role_hint_uk": "Pos 1/2 (Ranged Core)",
    "summary_uk": "Розриває дистанцію з мілі-ворогами, виштовхує з когів/диму та дає нескінченну дальність на 5 ударів.",
    "counters_tags": [
      {
        "tag": "trap_isolation",
        "weight": 9,
        "reason_uk": "Виводить рендж-керрі з Power Cogs або після вриву.",
        "reason_ru": "Выводит рендж-керри из Power Cogs или после врыва.",
        "reason_en": "Gets ranged carries out of Power Cogs or enemy dives."
      },
      {
        "tag": "physical_burst",
        "weight": 7,
        "reason_uk": "Відштовхує мілі-асасінів (PA, Riki, Spectre) на безпечну відстань.",
        "reason_ru": "Отталкивает мили-ассасинов (PA, Riki, Spectre) на безопасное расстояние.",
        "reason_en": "Pushes melee assassins (PA, Riki, Spectre) to a safe distance."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Надійний сейв-слот для рендж-кору проти агресивних вривів.",
      "team_reason_ru": "Надежный сейв-слот для рендж-кора против агрессивных врывов.",
      "team_reason_en": "Reliable save item for a ranged core against aggressive dives."
    },
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2–3 слот)",
    "role_hint_ru": "Pos 1/2 (Ranged Core)",
    "role_hint_en": "Pos 1/2 (Ranged Core)",
    "summary_ru": "Разрывает дистанцию с мили-врагами, выталкивает из когов/дыма и дает бесконечную дальность на 5 ударов.",
    "summary_en": "Creates distance from melee enemies, pushes out of cogs/smoke, and grants unlimited range for 5 attacks.",
    "timing_label_ru": "Mid (2–3 слот)",
    "timing_label_en": "Mid (2nd–3rd item)"
  },
  "black_king_bar": {
    "item_id": 116,
    "name_en": "Black King Bar",
    "category": "critical",
    "role_hint_uk": "Pos 1/2/3 (Core)",
    "summary_uk": "Базове розвіювання, +60% опору магії, імунітет до чистої та відбитої шкоди й більшості дебафів.",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 11,
        "reason_uk": "Дає 60% магічного опору та не дає зафіксувати ціль магічним прокастом.",
        "reason_ru": "Дает 60% магического сопротивления и не дает зафиксировать цель магическим прокастом.",
        "reason_en": "Grants 60% magic resistance and prevents magic burst lockdown."
      },
      {
        "tag": "damage_reflection",
        "weight": 8,
        "reason_uk": "Імунітет до відбитої шкоди (Dispersion / Blade Mail) під час Avatar.",
        "reason_ru": "Иммунитет к отраженному урону (Dispersion / Blade Mail) во время Avatar.",
        "reason_en": "Immunity to reflected damage (Dispersion / Blade Mail) during Avatar."
      },
      {
        "tag": "unit_target_control",
        "weight": 8,
        "reason_uk": "Блокує більшість дизейблів (Hex, Earth Spike, Cold Snap, Tornado).",
        "reason_ru": "Блокирует большинство дизейблов (Hex, Earth Spike, Cold Snap, Tornado).",
        "reason_en": "Blocks most disables (Hex, Earth Spike, Cold Snap, Tornado)."
      },
      {
        "tag": "silence_zone",
        "weight": 7,
        "reason_uk": "Дозволяє натиснути скіли та вийти зі Smoke Screen або Deafening Blast.",
        "reason_ru": "Позволяет нажать скиллы и выйти из Smoke Screen или Deafening Blast.",
        "reason_en": "Allows casting spells and walking out of Smoke Screen or Deafening Blast."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 9,
      "team_reason_uk": "Велика кількість магічної шкоди та контролю робить BKB обов'язковим слотом для корів.",
      "team_reason_ru": "Большое количество магического урона и контроля делает BKB обязательным слотом для коров.",
      "team_reason_en": "Heavy magic damage and lockdown make BKB a mandatory item for cores."
    },
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2,
      3
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 1/2/3 (Core)",
    "role_hint_en": "Pos 1/2/3 (Core)",
    "summary_ru": "Базовое развеивание, +60% сопротивления магии, иммунитет к чистому и отраженному урону и большинству дебаффов.",
    "summary_en": "Basic Dispel, +60% magic resistance, and immunity to pure and reflected damage as well as most debuffs.",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "mjollnir": {
    "item_id": 158,
    "name_en": "Mjollnir",
    "category": "critical",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "Масова зачистка ілюзій блискавками, а активний Static Charge б'є по всіх ілюзіях при атаках по носію.",
    "counters_tags": [
      {
        "tag": "illusions",
        "weight": 12,
        "reason_uk": "Миттєво виявляє справжнього героя та випалює ілюзії масовими розрядами.",
        "reason_ru": "Мгновенно выявляет настоящего героя и выжигает иллюзии массовыми разрядами.",
        "reason_en": "Instantly reveals the real hero and burns through illusions with AoE lightning procs."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 7,
      "team_reason_uk": "Кілька ілюзіоністів у ворогів — без ланцюгових блискавок і щита Mjollnir команда захлинеться в копіях.",
      "team_reason_ru": "Несколько иллюзионистов у врагов — без цепных молний и щита Mjollnir команда захлебнется в копиях.",
      "team_reason_en": "Multiple illusion heroes on the enemy team — without Mjollnir's chain lightning and shield, your team will be overwhelmed by copies."
    },
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Mid/Late (2–3 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "Массовая зачистка иллюзий молниями, а активный Static Charge бьет по всем иллюзиям при атаках по носителю.",
    "summary_en": "Mass illusion clear with chain lightning, while active Static Charge zaps all illusions attacking the carrier.",
    "timing_label_ru": "Mid/Late (2–3 слот)",
    "timing_label_en": "Mid/Late (2nd–3rd item)"
  },
  "crimson_guard": {
    "item_id": 242,
    "name_en": "Crimson Guard",
    "category": "defensive",
    "role_hint_uk": "Pos 3 (Offlane)",
    "summary_uk": "Активний щит блокує 70 + 2% макс. HP від кожної атаки по всій команді протягом 7 секунд.",
    "counters_tags": [
      {
        "tag": "illusions",
        "weight": 11,
        "reason_uk": "Повністю нівелює слабкі, але численні тички ілюзій PL, Naga та Spectre.",
        "reason_ru": "Полностью нивелирует слабые, но многочисленные тычки иллюзий PL, Naga и Spectre.",
        "reason_en": "Completely negates weak but numerous hits from PL, Naga, and Spectre illusions."
      },
      {
        "tag": "physical_burst",
        "weight": 6,
        "reason_uk": "Ріже швидкі фізичні серії атак по сапортах і будівлях.",
        "reason_ru": "Режет быстрые физические серии атак по саппортам и строениям.",
        "reason_en": "Mitigates rapid physical attack flurries against supports and buildings."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 7,
      "team_reason_uk": "Високий сумарний фіз-ДПС від копій і атак робить Crimson Guard дуже вигідним командним слотом.",
      "team_reason_ru": "Высокий суммарный физ-ДПС от копий и атак делает Crimson Guard очень выгодным командным слотом.",
      "team_reason_en": "High combined physical DPS from illusions and right-clicks makes Crimson Guard a high-value team item."
    },
    "positions": [
      3,
      4
    ],
    "primary_positions": [
      3
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "summary_ru": "Активный щит блокирует 70 + 2% макс. HP от каждой атаки по всей команде в течение 7 секунд.",
    "summary_en": "Active shield blocks 70 + 2% max HP damage from each attack for the whole team for 7 seconds.",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "shivas_guard": {
    "item_id": 119,
    "name_en": "Shiva's Guard",
    "category": "defensive",
    "summary_uk": "+17 броні, +75 до радіусу здібностей, пасивна аура -40 швидкості атаки ворогів і крижана хвиля Arctic Blast (-40% швидкості руху).",
    "counters_tags": [
      {
        "tag": "illusions",
        "weight": 10,
        "reason_uk": "Аура -40 Attack Speed і хвиля Arctic Blast миттєво сповільнюють та викривають ілюзії.",
        "reason_ru": "Аура -40 Attack Speed и волна Arctic Blast мгновенно замедляют и вскрывают иллюзии.",
        "reason_en": "The -40 attack speed aura and Arctic Blast wave instantly slow and reveal illusions."
      },
      {
        "tag": "physical_burst",
        "weight": 8,
        "reason_uk": "+17 броні та -40 AS ворогів різко знижують фізичну шкоду по команді.",
        "reason_ru": "+17 брони и -40 AS врагов резко снижают физический урон по команде.",
        "reason_en": "+17 armor and -40 enemy attack speed sharply reduce physical damage against your team."
      },
      {
        "tag": "heal_regen",
        "weight": 7,
        "reason_uk": "Зниження швидкості атаки ворогів послаблює їхній фізичний вампіризм у розмінах.",
        "reason_ru": "Снижение скорости атаки врагов ослабляет их физический вампиризм в разменах.",
        "reason_en": "Reducing enemy attack speed weakens their physical lifesteal in trades."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Аура -40 швидкості атаки та висока броня послаблюють фізичний тиск усієї ворожої команди.",
      "team_reason_ru": "Аура -40 скорости атаки и высокая броня ослабляют физическое давление всей вражеской команды.",
      "team_reason_en": "The -40 attack speed aura and high armor weaken the physical pressure of the entire enemy team."
    },
    "summary_ru": "+17 брони, +75 к радиусу способностей, пассивная аура -40 скорости атаки врагов и ледяная волна Arctic Blast (-40% скорости передвижения).",
    "summary_en": "+17 armor, +75 ability AoE, passive -40 enemy attack speed aura, and Arctic Blast ice wave (-40% movement speed)."
  },
  "bfury": {
    "item_id": 145,
    "name_en": "Battle Fury",
    "category": "utility",
    "role_hint_uk": "Pos 1 (Melee Carry)",
    "summary_uk": "Потужний сплеш-клів по області прорубує зграї ілюзій та прискорює темп фарму.",
    "counters_tags": [
      {
        "tag": "illusions",
        "weight": 8,
        "reason_uk": "Фізичний cleave швидко очищає хвилі ілюзій (особливо проти Phantom Lancer і Naga Siren).",
        "reason_ru": "Физический cleave быстро очищает волны иллюзий (особенно против Phantom Lancer и Naga Siren).",
        "reason_en": "Physical cleave quickly clears waves of illusions (especially against Phantom Lancer and Naga Siren)."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 4,
      "team_reason_uk": "Зручно тримати темп і не тонути в ілюзіях.",
      "team_reason_ru": "Удобно держать темп и не тонуть в иллюзиях.",
      "team_reason_en": "Helps maintain farm tempo and avoid getting swarmed by illusions."
    },
    "positions": [
      1
    ],
    "primary_positions": [
      1
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 1 (Melee Carry)",
    "role_hint_en": "Pos 1 (Melee Carry)",
    "summary_ru": "Мощный сплеш-клив по области прорубает толпы иллюзий и ускоряет темп фарма.",
    "summary_en": "Powerful AoE cleave cuts through packs of illusions and accelerates farm speed.",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "pipe": {
    "item_id": 90,
    "name_en": "Pipe of Insight",
    "category": "critical",
    "role_hint_uk": "Pos 3 (Offlane)",
    "summary_uk": "Командний бар'єр на 425 магічної шкоди у радіусі 1200 та пасивна аура +8% опору магії.",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 11,
        "reason_uk": "Поглинає масовий магічний прокаст усією командою (Zeus, Invoker).",
        "reason_ru": "Поглощает массовый магический прокаст всей командой (Zeus, Invoker).",
        "reason_en": "Absorbs AoE magic burst for the entire team (Zeus, Invoker)."
      },
      {
        "tag": "sustained_magic",
        "weight": 9,
        "reason_uk": "Зрізає постійне магічне пошкодження у тривалих бійках (Rot, Quill/Magic procs, Heartstopper/Pulse).",
        "reason_ru": "Срезает постоянный магический урон в затяжных драках (Rot, Quill/Magic procs, Heartstopper/Pulse).",
        "reason_en": "Mitigates sustained magic damage in drawn-out fights (Rot, Quill/Magic procs, Heartstopper/Pulse)."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 9,
      "team_reason_uk": "Проти 2+ магічних нюкерів Pipe of Insight часто виграє командні файти з першого натискання.",
      "team_reason_ru": "Против 2+ магических нюкеров Pipe of Insight часто выигрывает командные файты с первого нажатия.",
      "team_reason_en": "Against 2+ magic nukers, Pipe of Insight often wins teamfights with a single press."
    },
    "positions": [
      3,
      4
    ],
    "primary_positions": [
      3
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "summary_ru": "Командный барьер на 425 магического урона в радиусе 1200 и пассивная аура +8% сопротивления магии.",
    "summary_en": "Team barrier absorbing 425 magical damage in a 1200 radius and passive +8% magic resistance aura.",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "mage_slayer": {
    "item_id": 598,
    "name_en": "Mage Slayer",
    "category": "utility",
    "role_hint_uk": "Pos 2/3 (Mid / Offlane)",
    "summary_uk": "Атака по ворогу зменшує всю його шкоду від здібностей на 40% на 3 секунди.",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 9,
        "reason_uk": "Ріже вхідну шкоду від заклинань цілі на 40% після одного удару.",
        "reason_ru": "Режет входящий урон от заклинаний цели на 40% после одного удара.",
        "reason_en": "Cuts the target's outgoing spell damage by 40% after a single hit."
      },
      {
        "tag": "sustained_magic",
        "weight": 8,
        "reason_uk": "Сильно послаблює героїв із тривалою аурою або частим спамом скілів (Bristleback, Necrophos, Zeus).",
        "reason_ru": "Сильно ослабляет героев с длительной аурой или частым спамом скиллов (Bristleback, Necrophos, Zeus).",
        "reason_en": "Heavily weakens heroes with sustained auras or frequent spell spam (Bristleback, Necrophos, Zeus)."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Дешевий спосіб зрізати 40% шкоди одразу кільком кастерам у файті.",
      "team_reason_ru": "Дешевый способ срезать 40% урона сразу нескольким кастерам в файте.",
      "team_reason_en": "Cost-effective way to cut 40% spell damage from multiple casters in a fight."
    },
    "positions": [
      1,
      2,
      3
    ],
    "primary_positions": [
      2,
      3
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 2/3 (Mid / Offlane)",
    "role_hint_en": "Pos 2/3 (Mid / Offlane)",
    "summary_ru": "Атака по врагу уменьшает весь его урон от способностей на 40% на 3 секунды.",
    "summary_en": "Attacking an enemy reduces all their spell damage by 40% for 3 seconds.",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "eternal_shroud": {
    "item_id": 692,
    "name_en": "Eternal Shroud",
    "category": "defensive",
    "role_hint_uk": "Pos 3 (Offlane / Frontline)",
    "summary_uk": "Накопичує заряди опору магії від отриманої шкоди скілами та відновлює 25% магії у ману.",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 8,
        "reason_uk": "Допомагає переживати важкий магічний прокаст і не залишатися без мани.",
        "reason_ru": "Помогает переживать тяжелый магический прокаст и не оставаться без маны.",
        "reason_en": "Helps survive heavy magic burst without running out of mana."
      },
      {
        "tag": "sustained_magic",
        "weight": 8,
        "reason_uk": "Швидко розганяє стаки Endurance проти постійного магічного тиску.",
        "reason_ru": "Быстро разгоняет стаки Endurance против постоянного магического давления.",
        "reason_en": "Quickly stacks Endurance against constant magic pressure."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Робить танка майже невразливим до магічних спам-піків.",
      "team_reason_ru": "Делает танка почти неуязвимым к магическим спам-пикам.",
      "team_reason_en": "Makes frontliners nearly unkillable against magic spam lineups."
    },
    "positions": [
      2,
      3
    ],
    "primary_positions": [
      3
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 3 (Offlane / Frontline)",
    "role_hint_en": "Pos 3 (Offlane / Frontline)",
    "summary_ru": "Накапливает заряды сопротивления магии от полученного урона скиллами и восстанавливает 25% магии в ману.",
    "summary_en": "Builds magic resistance stacks from spell damage taken and restores 25% of magic damage as mana.",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "glimmer_cape": {
    "item_id": 254,
    "name_en": "Glimmer Cape",
    "category": "defensive",
    "role_hint_uk": "Pos 4/5 (Support)",
    "summary_uk": "Дає інвіз та магічний бар'єр на 375 шкоди союзнику (працює під час касту).",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 9,
        "reason_uk": "Сейвить союзників від смертельного магічного ультимату (Finger of Death, Reaper's Scythe, Sun Strike).",
        "reason_ru": "Сейвит союзников от смертельного магического ультимейта (Finger of Death, Reaper's Scythe, Sun Strike).",
        "reason_en": "Saves allies from lethal magic ultimates (Finger of Death, Reaper's Scythe, Sun Strike)."
      },
      {
        "tag": "unit_target_control",
        "weight": 7,
        "reason_uk": "Ховає ціль у невидимість і зриває фокус ворожих атак.",
        "reason_ru": "Прячет цель в невидимость и срывает фокус вражеских атак.",
        "reason_en": "Hides the target in invisibility and breaks enemy attack focus."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Недорогий і стабільний сейв сапорта проти сноуболу через магічний бурст.",
      "team_reason_ru": "Недорогой и стабильный сейв саппорта против сноуболла через магический бурст.",
      "team_reason_en": "Affordable and reliable support save against magic burst snowballing."
    },
    "positions": [
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 4/5 (Support)",
    "role_hint_en": "Pos 4/5 (Support)",
    "summary_ru": "Дает инвиз и магический барьер на 375 урона союзнику (работает во время каста).",
    "summary_en": "Grants invisibility and a 375 magic damage barrier to an ally (can be cast while channeling).",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "dust": {
    "item_id": 40,
    "name_en": "Dust of Appearance",
    "category": "consumable",
    "role_hint_uk": "Усі позиції (Pos 2–5)",
    "summary_uk": "Розкриває невидимих героїв у радіусі 1050 і сповільнює їх на -20% (ефект тримається 8 с після виходу із зони).",
    "counters_tags": [
      {
        "tag": "invisibility",
        "weight": 11,
        "reason_uk": "Обов'язковий розхідник для фіксації кілів по інвізерах (Riki, Bounty Hunter, Ghost Walk Invoker).",
        "reason_ru": "Обязательный расходник для фиксации киллов по инвизерам (Riki, Bounty Hunter, Ghost Walk Invoker).",
        "reason_en": "Mandatory consumable for securing kills on invisible heroes (Riki, Bounty Hunter, Ghost Walk Invoker)."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 7,
      "team_reason_uk": "Кілька героїв з інвізом — носіть Dust навіть на корах, щоб не відпускати фраги.",
      "team_reason_ru": "Несколько героев с инвизом — носите Dust даже на корах, чтобы не отпускать фраги.",
      "team_reason_en": "Multiple invisible heroes — carry Dust even on cores so kills don't slip away."
    },
    "positions": [
      1,
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      2,
      3,
      4,
      5
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (з 1-ї хв)",
    "role_hint_ru": "Все позиции (Pos 2–5)",
    "role_hint_en": "All positions (Pos 2–5)",
    "summary_ru": "Раскрывает невидимых героев в радиусе 1050 и замедляет их на -20% (эффект держится 8 с после выхода из зоны).",
    "summary_en": "Reveals invisible heroes in a 1050 radius and slows them by 20% (lingers for 8s after leaving the area).",
    "timing_label_ru": "Early (с 1-й мин)",
    "timing_label_en": "Early (from min 1)"
  },
  "ward_sentry": {
    "item_id": 43,
    "name_en": "Sentry Ward",
    "category": "consumable",
    "role_hint_uk": "Pos 4/5 (Support)",
    "summary_uk": "Стаціонарний True Sight у радіусі 1050 на 7 хвилин для захисту ліній, вишок і Рошана.",
    "counters_tags": [
      {
        "tag": "invisibility",
        "weight": 10,
        "reason_uk": "Не дає невидимим розвідникам безкарно підкрадатися до команди та ставити ініціацію.",
        "reason_ru": "Не дает невидимым разведчикам безнаказанно подкрадываться к команде и ставить инициацию.",
        "reason_en": "Prevents invisible scouts from sneaking up on your team and setting up initiation unpunished."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Кожен об'єкт і лінія мають прикриватися Sentry Ward проти подвійного інвізу.",
      "team_reason_ru": "Каждый объект и линия должны прикрываться Sentry Ward против двойного инвиза.",
      "team_reason_en": "Every objective and lane must be covered by Sentry Wards against multiple invisibility threats."
    },
    "positions": [
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (постійно)",
    "role_hint_ru": "Pos 4/5 (Support)",
    "role_hint_en": "Pos 4/5 (Support)",
    "summary_ru": "Стационарный True Sight в радиусе 1050 на 7 минут для защиты линий, вышек и Рошана.",
    "summary_en": "Stationary True Sight in a 1050 radius for 7 minutes to secure lanes, towers, and Roshan.",
    "timing_label_ru": "Early (постоянно)",
    "timing_label_en": "Early (constantly)"
  },
  "gem": {
    "item_id": 30,
    "name_en": "Gem of True Sight",
    "category": "utility",
    "role_hint_uk": "Pos 3/4 (Offlane / Support)",
    "summary_uk": "Постійний True Sight у радіусі 900 та активний розвідувальний промінь на 300 у тумані війни.",
    "counters_tags": [
      {
        "tag": "invisibility",
        "weight": 9,
        "reason_uk": "Контролює невидимість без ліміту на заряди та допомагає девардити карту.",
        "reason_ru": "Контролирует невидимость без лимита на заряды и помогает девардить карту.",
        "reason_en": "Counters invisibility with no charge limit and helps deward the entire map."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 8,
      "team_reason_uk": "У мід-геймі проти кількох інвізерів ранній Gem на надійному носії економить сотні золота на Sentry.",
      "team_reason_ru": "В мид-гейме против нескольких инвизеров ранний Gem на надежном носителе экономит сотни золота на Sentry.",
      "team_reason_en": "In the mid game against multiple invisible heroes, an early Gem on a tanky carrier saves hundreds of gold on Sentries."
    },
    "positions": [
      3,
      4,
      5
    ],
    "primary_positions": [
      3,
      4
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (після 18 хв)",
    "role_hint_ru": "Pos 3/4 (Offlane / Support)",
    "role_hint_en": "Pos 3/4 (Offlane / Support)",
    "summary_ru": "Постоянный True Sight в радиусе 900 и активный разведывательный луч на 300 в тумане войны.",
    "summary_en": "Permanent True Sight in a 900 radius and an active reveal ability with 300 radius in fog of war.",
    "timing_label_ru": "Mid (после 18 мин)",
    "timing_label_en": "Mid (after 18 min)"
  },
  "nullifier": {
    "item_id": 225,
    "name_en": "Nullifier",
    "category": "critical",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "Безперервно розвіює позитивні бафи та предмети сейву (Ghost Scepter, Ethereal, Glimmer, Aeon Disk) протягом 4 с.",
    "counters_tags": [
      {
        "tag": "dispellable_save",
        "weight": 12,
        "reason_uk": "Миттєво знімає Ghost Shroud Necrophos та всі сейв-предмети команди.",
        "reason_ru": "Мгновенно снимает Ghost Shroud Necrophos и все сейв-предметы команды.",
        "reason_en": "Instantly strips Necrophos's Ghost Shroud and all enemy save items."
      },
      {
        "tag": "invisibility",
        "weight": 5,
        "reason_uk": "Знімає ефекти Glimmer Cape і не дає засейвитися в етері.",
        "reason_ru": "Снимает эффекты Glimmer Cape и не дает засейвиться в эзериале.",
        "reason_en": "Removes Glimmer Cape buffs and prevents ethereal saves."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Гарантує завершення фокусу по цілях із вбудованим чи предметним сейвом.",
      "team_reason_ru": "Гарантирует завершение фокуса по целям со встроенным или предметным сейвом.",
      "team_reason_en": "Guarantees finishing off focused targets that rely on built-in or item saves."
    },
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "Непрерывно развеивает положительные баффы и предметы сейва (Ghost Scepter, Ethereal, Glimmer, Aeon Disk) в течение 4 с.",
    "summary_en": "Continuously dispels positive buffs and save items (Ghost Scepter, Ethereal, Glimmer, Aeon Disk) for 4s.",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "orchid": {
    "item_id": 98,
    "name_en": "Orchid Malevolence",
    "category": "utility",
    "role_hint_uk": "Pos 2/4 (Mid / Ganker)",
    "summary_uk": "Накладає безмовність на 5 с і додає 30% отриманої шкоди наприкінці дії.",
    "counters_tags": [
      {
        "tag": "high_mobility",
        "weight": 10,
        "reason_uk": "Не дає рухливим цілям втекти через блінк або перекачку (Morphling, Invoker, Riki).",
        "reason_ru": "Не дает подвижным целям сбежать через блинк или перекачку (Morphling, Invoker, Riki).",
        "reason_en": "Prevents mobile targets from escaping via blink or Attribute Shift (Morphling, Invoker, Riki)."
      },
      {
        "tag": "channeled_disable",
        "weight": 5,
        "reason_uk": "Запобігає касту рятівних скілів до спрацювання BKB/Manta.",
        "reason_ru": "Предотвращает каст спасительных скиллов до срабатывания BKB/Manta.",
        "reason_en": "Prevents casting defensive spells before BKB/Manta comes online."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Ранній сайленс зриває темп рухливим магам і скілозалежним корам.",
      "team_reason_ru": "Ранний сайленс срывает темп подвижным магам и скиллозависимым корам.",
      "team_reason_en": "Early silence disrupts the tempo of elusive spellcasters and ability-reliant cores."
    },
    "positions": [
      1,
      2,
      3,
      4
    ],
    "primary_positions": [
      2,
      4
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 2/4 (Mid / Ganker)",
    "role_hint_en": "Pos 2/4 (Mid / Ganker)",
    "summary_ru": "Накладывает безмолвие на 5 с и наносит 30% полученного урона в конце действия.",
    "summary_en": "Silences for 5s and deals 30% of damage taken as bonus damage when it ends.",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "bloodthorn": {
    "item_id": 250,
    "name_en": "Bloodthorn",
    "category": "utility",
    "role_hint_uk": "Pos 1/2 (Carry / Mid)",
    "summary_uk": "Сайленс на 5 с, True Strike по цілі для всієї команди (разом із ілюзіями/кріпами) + 60% вибухової шкоди.",
    "counters_tags": [
      {
        "tag": "evasion",
        "weight": 9,
        "reason_uk": "Активка дає True Strike усій команді по цілі з ухиленням.",
        "reason_ru": "Активка дает True Strike всей команде по цели с уклонением.",
        "reason_en": "Active grants the entire team True Strike against an evasive target."
      },
      {
        "tag": "high_mobility",
        "weight": 9,
        "reason_uk": "Закриває блінки/ескейпи та швидко стирає ціль за 5 секунд.",
        "reason_ru": "Закрывает блинки/эскейпы и быстро стирает цель за 5 секунд.",
        "reason_en": "Shuts down blinks/escapes and melts the target within 5 seconds."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Універсальна відповідь одночасно на ескейп та ухилення.",
      "team_reason_ru": "Универсальный ответ одновременно на эскейп и уклонение.",
      "team_reason_en": "All-in-one answer to both mobility escapes and evasion."
    },
    "positions": [
      1,
      2
    ],
    "primary_positions": [
      1,
      2
    ],
    "timing_phase": "late",
    "timing_label_uk": "Late (4+ слот)",
    "role_hint_ru": "Pos 1/2 (Carry / Mid)",
    "role_hint_en": "Pos 1/2 (Carry / Mid)",
    "summary_ru": "Сайленс на 5 с, True Strike по цели для всей команды (вместе с иллюзиями/крипами) + 60% взрывного урона.",
    "summary_en": "Silences for 5s, grants True Strike against the target for all allies (including illusions/creeps), and deals 60% burst damage at the end.",
    "timing_label_ru": "Late (4+ слот)",
    "timing_label_en": "Late (4th+ item)"
  },
  "sheepstick": {
    "item_id": 96,
    "name_en": "Scythe of Vyse",
    "category": "critical",
    "role_hint_uk": "Pos 2/3 (Mid / Offlane)",
    "summary_uk": "Миттєвий Hex на 2.8 с: забороняє атаки, скіли та предмети й миттєво знищує ілюзію.",
    "counters_tags": [
      {
        "tag": "high_mobility",
        "weight": 11,
        "reason_uk": "Миттєвий каст без снаряда — не дає Morphling, PA чи Invoker натиснути BKB або втекти.",
        "reason_ru": "Мгновенный каст без снаряда — не дает Morphling, PA или Invoker нажать BKB или сбежать.",
        "reason_en": "Instant cast with no projectile — prevents Morphling, PA, or Invoker from pressing BKB or escaping."
      },
      {
        "tag": "illusions",
        "weight": 6,
        "reason_uk": "При застосуванні на копію миттєво її знищує.",
        "reason_ru": "При применении на копию мгновенно ее уничтожает.",
        "reason_en": "Instantly destroys an illusion when cast on it."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Найнадійніший миттєвий ініціаційний контроль у пізній грі.",
      "team_reason_ru": "Самый надежный мгновенный инициационный контроль в поздней игре.",
      "team_reason_en": "The most reliable instant initiation lockdown in the late game."
    },
    "positions": [
      2,
      3,
      4
    ],
    "primary_positions": [
      2,
      3
    ],
    "timing_phase": "late",
    "timing_label_uk": "Late (3–4 слот)",
    "role_hint_ru": "Pos 2/3 (Mid / Offlane)",
    "role_hint_en": "Pos 2/3 (Mid / Offlane)",
    "summary_ru": "Мгновенный Hex на 2.8 с: запрещает атаки, скиллы и предметы и мгновенно уничтожает иллюзию.",
    "summary_en": "Instant 2.8s Hex: disables attacks, spells, and items, and instantly destroys illusions.",
    "timing_label_ru": "Late (3–4 слот)",
    "timing_label_en": "Late (3rd–4th item)"
  },
  "cyclone": {
    "item_id": 100,
    "name_en": "Eul's Scepter of Divinity",
    "category": "utility",
    "role_hint_uk": "Pos 4/5 (Support / Mid)",
    "summary_uk": "Підкидає ворога або себе в торнадо на 2.5 с, знімаючи дебафи та збиваючи потокові ульти.",
    "counters_tags": [
      {
        "tag": "channeled_disable",
        "weight": 9,
        "reason_uk": "Надійно збиває Dismember чи Tricks of the Trade з дистанції.",
        "reason_ru": "Надежно сбивает Dismember или Tricks of the Trade с дистанции.",
        "reason_en": "Reliably interrupts Dismember or Tricks of the Trade from range."
      },
      {
        "tag": "silence_zone",
        "weight": 7,
        "reason_uk": "Знімає базові дебафи/сало з себе та перечікує фокус асасінів.",
        "reason_ru": "Снимает базовые дебаффы/сайленс с себя и пережидает фокус ассасинов.",
        "reason_en": "Dispels basic debuffs/silences on yourself and stalls out assassin focus."
      },
      {
        "tag": "physical_burst",
        "weight": 7,
        "reason_uk": "Купує 2.5 секунди проти вриву PA або Riki.",
        "reason_ru": "Покупает 2.5 секунды против врыва PA или Riki.",
        "reason_en": "Buys 2.5 seconds against a PA or Riki jump."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Гнучкий бюджетний сейв і інтеррапт проти агресивного фокусу.",
      "team_reason_ru": "Гибкий бюджетный сейв и интеррапт против агрессивного фокуса.",
      "team_reason_en": "Flexible budget save and interrupt against aggressive focus."
    },
    "positions": [
      2,
      3,
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early/Mid (1–2 слот)",
    "role_hint_ru": "Pos 4/5 (Support / Mid)",
    "role_hint_en": "Pos 4/5 (Support / Mid)",
    "summary_ru": "Подбрасывает врага или себя в торнадо на 2.5 с, снимая дебаффы и сбивая потоковые ульты.",
    "summary_en": "Cyclones an enemy or yourself for 2.5s, dispelling debuffs and interrupting channeled ultimates.",
    "timing_label_ru": "Early/Mid (1–2 слот)",
    "timing_label_en": "Early/Mid (1st–2nd item)"
  },
  "ghost": {
    "item_id": 37,
    "name_en": "Ghost Scepter",
    "category": "defensive",
    "role_hint_uk": "Pos 4/5 (Support)",
    "summary_uk": "Повний імунітет до фізичних атак на 4 секунди за 1500 золота.",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 10,
        "reason_uk": "Повністю блокує стрибок і фізичні крити від PA, Riki чи ілюзіоністів.",
        "reason_ru": "Полностью блокирует прыжок и физические криты от PA, Riki или иллюзионистов.",
        "reason_en": "Completely blocks physical jumps and crits from PA, Riki, or illusion heroes."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Кілька фізичних мисливців на сапортів — Ghost Scepter є найдешевшим порятунком.",
      "team_reason_ru": "Несколько физических охотников на саппортов — Ghost Scepter является самым дешевым спасением.",
      "team_reason_en": "Multiple physical assassins hunting supports — Ghost Scepter is the cheapest lifesaver."
    },
    "positions": [
      4,
      5
    ],
    "primary_positions": [
      4,
      5
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (сейв 1500g)",
    "role_hint_ru": "Pos 4/5 (Support)",
    "role_hint_en": "Pos 4/5 (Support)",
    "summary_ru": "Полный иммунитет к физическим атакам на 4 секунды за 1500 золота.",
    "summary_en": "Complete immunity to physical attacks for 4 seconds for 1500 gold.",
    "timing_label_ru": "Early (сейв 1500g)",
    "timing_label_en": "Early (1500g save)"
  },
  "heavens_halberd": {
    "item_id": 210,
    "name_en": "Heaven's Halberd",
    "category": "utility",
    "role_hint_uk": "Pos 3 (Offlane)",
    "summary_uk": "Накладає Disarm на 3.5 с і забороняє атакувати з руки.",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 9,
        "reason_uk": "Вимикає автоатаки небезпечного фізичного кору (Huskar, PA) до того, як він завдасть шкоди.",
        "reason_ru": "Отключает автоатаки опасного физического кора (Huskar, PA) до того, как он нанесет урон.",
        "reason_en": "Shuts down right-clicks from a dangerous physical core (Huskar, PA) before they can deal damage."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Добре комбінується проти кількох автоатакерів.",
      "team_reason_ru": "Хорошо комбинируется против нескольких автоатакеров.",
      "team_reason_en": "Works well against lineups with multiple right-clickers."
    },
    "positions": [
      3,
      4
    ],
    "primary_positions": [
      3
    ],
    "timing_phase": "mid",
    "timing_label_uk": "Mid (2-й слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "summary_ru": "Накладывает Disarm на 3.5 с и запрещает атаковать с руки.",
    "summary_en": "Applies Disarm for 3.5s, preventing the target from attacking.",
    "timing_label_ru": "Mid (2-й слот)",
    "timing_label_en": "Mid (2nd item)"
  },
  "blade_mail": {
    "item_id": 127,
    "name_en": "Blade Mail",
    "category": "defensive",
    "role_hint_uk": "Pos 3 (Offlane)",
    "summary_uk": "Повертає 85% вхідної шкоди атакуючим; карає за безконтрольний бурст.",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 8,
        "reason_uk": "Змушує PA або інших скляних гармат зупиняти атаку або вбиватися об відбиття.",
        "reason_ru": "Заставляет PA или других стеклянных пушек останавливать атаку или убиваться об отражение.",
        "reason_en": "Forces PA or other glass cannons to stop attacking or kill themselves on reflected damage."
      },
      {
        "tag": "magic_burst",
        "weight": 6,
        "reason_uk": "Карає за неконтрольовану AoE-шкоду в бійці.",
        "reason_ru": "Наказывает за неконтролируемый AoE-урон в драке.",
        "reason_en": "Punishes uncontrolled AoE damage in teamfights."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 4,
      "team_reason_uk": "Допомагає стримувати високий неконтрольований фокус.",
      "team_reason_ru": "Помогает сдерживать высокий неконтролируемый фокус.",
      "team_reason_en": "Helps deter heavy, uncontrolled focus fire."
    },
    "positions": [
      2,
      3
    ],
    "primary_positions": [
      3
    ],
    "timing_phase": "early",
    "timing_label_uk": "Early (1-й слот)",
    "role_hint_ru": "Pos 3 (Offlane)",
    "role_hint_en": "Pos 3 (Offlane)",
    "summary_ru": "Возвращает 85% входящего урона атакующим; наказывает за бесконтрольный бурст.",
    "summary_en": "Returns 85% of incoming damage to attackers; punishes uncontrolled burst.",
    "timing_label_ru": "Early (1-й слот)",
    "timing_label_en": "Early (1st item)"
  },
  "guardian_greaves": {
    "item_id": 231,
    "name_en": "Guardian Greaves",
    "category": "defensive",
    "summary_uk": "Командний хіл, мана, базове розвіювання з себе та аура броні/регену на низькому HP.",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 7,
        "reason_uk": "Відновлює HP всій команді після магічного прокасту.",
        "reason_ru": "Восстанавливает HP всей команде после магического прокаста.",
        "reason_en": "Restores HP to the entire team after magic burst."
      },
      {
        "tag": "silence_zone",
        "weight": 7,
        "reason_uk": "Знімає базові дебафи/сайленс із власника в момент активації.",
        "reason_ru": "Снимает базовые дебаффы/сайленс с владельца в момент активации.",
        "reason_en": "Dispels basic debuffs/silence from the carrier upon activation."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "Підтримує команду в затяжних командних бійках.",
      "team_reason_ru": "Поддерживает команду в затяжных командных боях.",
      "team_reason_en": "Sustains the team through drawn-out teamfights."
    },
    "summary_ru": "Командный хил, мана, базовое развеивание с себя и аура брони/регена на низком HP.",
    "summary_en": "Team heal, mana restore, Basic Dispel on self, and bonus armor/regen aura at low HP."
  },
  "assault": {
    "item_id": 112,
    "name_en": "Assault Cuirass",
    "category": "utility",
    "summary_uk": "Аура +5 броні та +30 швидкості атаки союзникам і -5 броні ворогам.",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 8,
        "reason_uk": "Знижує вхідну фізичну шкоду по команді за рахунок аури броні.",
        "reason_ru": "Снижает входящий физический урон по команде за счет ауры брони.",
        "reason_en": "Reduces incoming physical damage to the team through its armor aura."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 4,
      "team_reason_uk": "Аура броні дуже цінна проти фізичного фокусу.",
      "team_reason_ru": "Аура брони очень ценна против физического фокуса.",
      "team_reason_en": "The armor aura is highly valuable against physical focus fire."
    },
    "summary_ru": "Аура +5 брони и +30 скорости атаки союзникам и -5 брони врагам.",
    "summary_en": "Aura granting +5 armor and +30 attack speed to allies and -5 armor to enemies."
  },
  "solar_crest": {
    "item_id": 229,
    "name_en": "Solar Crest",
    "category": "utility",
    "summary_uk": "Щит на 350 фізичної шкоди, +5 броні, +60 швидкості атаки та +15% швидкості руху союзнику.",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 8,
        "reason_uk": "Барʼєр на 350 фіз-шкоди та +5 броні рятують ціль від швидкого вбивства.",
        "reason_ru": "Барьер на 350 физ-урона и +5 брони спасают цель от быстрого убийства.",
        "reason_en": "The 350 physical damage barrier and +5 armor save the target from quick physical burst."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 4,
      "team_reason_uk": "Дає темп і виживаність вашому кору.",
      "team_reason_ru": "Дает темп и выживаемость вашему кору.",
      "team_reason_en": "Grants tempo and survivability to your core."
    },
    "summary_ru": "Щит на 350 физического урона, +5 брони, +60 скорости атаки и +15% скорости передвижения союзнику.",
    "summary_en": "Grants a 350 physical damage barrier, +5 armor, +60 attack speed, and +15% movement speed to an ally."
  },
  "veil_of_discord": {
    "item_id": 190,
    "name_en": "Veil of Discord",
    "category": "utility",
    "summary_uk": "Накладає в радіусі 900 дебаф, що збільшує вхідну шкоду від заклинань по ворогах на 10%.",
    "counters_tags": [
      {
        "tag": "illusions",
        "weight": 4,
        "reason_uk": "Допомагає команді швидше забирати щільні цілі магією.",
        "reason_ru": "Помогает команде быстрее забирать плотные цели магией.",
        "reason_en": "Helps the team burst down tanky targets faster with magic damage."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Накладывает в радиусе 900 дебафф, увеличивающий входящий урон от заклинаний по врагам на 10%.",
    "summary_en": "Applies a debuff in a 900 radius that increases spell damage taken by enemies by 10%."
  },
  "kaya_and_sange": {
    "item_id": 273,
    "name_en": "Kaya and Sange",
    "category": "utility",
    "summary_uk": "Посилює шкоду від заклинань, мана-сустейн і дає опір сповільненням/контролю.",
    "counters_tags": [
      {
        "tag": "silence_zone",
        "weight": 4,
        "reason_uk": "Додає щільності й стійкості магічним корам.",
        "reason_ru": "Добавляет плотности и стойкости магическим корам.",
        "reason_en": "Adds tankiness and durability to magic cores."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Усиливает урон от заклинаний, мана-сустейн и дает сопротивление замедлениям/контролю.",
    "summary_en": "Boosts spell damage, mana sustain, and resistance to slows/disables."
  },
  "manta": {
    "item_id": 147,
    "name_en": "Manta Style",
    "category": "defensive",
    "summary_uk": "Базове розвіювання при активації та 2 ілюзії для збивання фокусу й ухилення від снарядів.",
    "counters_tags": [
      {
        "tag": "silence_zone",
        "weight": 9,
        "reason_uk": "Миттєво знімає сайленс (Smoke Screen, Global Silence, Orchid) з кору.",
        "reason_ru": "Мгновенно снимает сайленс (Smoke Screen, Global Silence, Orchid) с кора.",
        "reason_en": "Instantly dispels silence (Smoke Screen, Global Silence, Orchid) from a core."
      },
      {
        "tag": "trap_isolation",
        "weight": 6,
        "reason_uk": "Скидає рути/дебафи та дозволяє заплутати фокус.",
        "reason_ru": "Сбрасывает руты/дебаффы и позволяет запутать фокус.",
        "reason_en": "Removes roots/debuffs and confuses enemy target focus."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 5,
      "team_reason_uk": "У ворогів багато сайленсів або рутів — Manta критична для вільного бою.",
      "team_reason_ru": "У врагов много сайленсов или рутов — Manta критична для свободного боя.",
      "team_reason_en": "The enemy has many silences or roots — Manta is critical for fighting freely."
    },
    "summary_ru": "Базовое развеивание при активации и 2 иллюзии для сбивания фокуса и уклонения от снарядов.",
    "summary_en": "Applies a Basic Dispel on activation and spawns 2 illusions to break focus and dodge projectiles."
  },
  "ultimate_scepter": {
    "item_id": 108,
    "name_en": "Aghanim's Scepter",
    "category": "utility",
    "summary_uk": "Ключове підсилення ультимату або нова утиліті-здібність під роль героя.",
    "counters_tags": [],
    "synergy_threshold": null,
    "summary_ru": "Ключевое усиление ультимейта или новая утилити-способность под роль героя.",
    "summary_en": "Key ultimate upgrade or new utility ability tailored to the hero's role."
  },
  "phase_boots": {
    "item_id": 50,
    "name_en": "Phase Boots",
    "category": "utility",
    "summary_uk": "Швидкий темп на карті, проходження крізь юнітів та бонусна броня.",
    "counters_tags": [],
    "synergy_threshold": null,
    "summary_ru": "Быстрый темп на карте, прохождение сквозь юнитов и бонусная броня.",
    "summary_en": "Fast map tempo, phase movement through units, and bonus armor."
  },
  "crellas_crozier": {
    "item_id": 1640,
    "name_en": "Crella's Crozier",
    "category": "utility",
    "summary_uk": "Пасивна аура ріже відновлення здоровʼя ворогів на 30% у радіусі 900; активка Rite of Rumusque дає Ghost Form на 4 с і підсилює анти-хіл до 90% з перенаправленням хілу власнику.",
    "counters_tags": [
      {
        "tag": "heal_regen",
        "weight": 11,
        "reason_uk": "Аура Putrefaction ріже хіл на 30% постійно і на 90% під час активації, крадучи втрачене відновлення ворогів.",
        "reason_ru": "Аура Putrefaction режет хил на 30% постоянно и на 90% во время активации, крадя потерянное восстановление врагов.",
        "reason_en": "Putrefaction aura reduces healing by 30% passively and 90% when active, stealing the enemies' prevented healing."
      },
      {
        "tag": "physical_burst",
        "weight": 8,
        "reason_uk": "Активна безтілесна форма дає 4 секунди повного імунітету до фізичних атак і краде швидкість руху.",
        "reason_ru": "Активная бесплотная форма дает 4 секунды полного иммунитета к физическим атакам и крадет скорость передвижения.",
        "reason_en": "Active ethereal form grants 4 seconds of complete immunity to physical attacks and steals movement speed."
      }
    ],
    "synergy_threshold": {
      "min_matching_heroes": 2,
      "bonus_weight": 6,
      "team_reason_uk": "Масова анти-хіл аура в радіусі 900 вимикає сустейн одразу кільком ворогам.",
      "team_reason_ru": "Массовая анти-хил аура в радиусе 900 отключает сустейн сразу нескольким врагам.",
      "team_reason_en": "AoE anti-heal aura in a 900 radius shuts down sustain on multiple enemies at once."
    },
    "summary_ru": "Пассивная аура режет восстановление здоровья врагов на 30% в радиусе 900; активка Rite of Rumusque дает Ghost Form на 4 с и усиливает анти-хил до 90% с перенаправлением хила владельцу.",
    "summary_en": "Passive aura reduces enemy health restoration by 30% in a 900 radius; active Rite of Rumusque grants Ghost Form for 4s and boosts anti-heal to 90%, redirecting stolen healing to the caster."
  },
  "consecrated_wraps": {
    "item_id": 1637,
    "name_en": "Consecrated Wraps",
    "category": "defensive",
    "summary_uk": "+12% опору магії, ривки швидкості +15% і накопичуваний універсальний барʼєр до 360 шкоди при отриманні удару від героїв.",
    "counters_tags": [
      {
        "tag": "magic_burst",
        "weight": 8,
        "reason_uk": "Універсальний щит до 360 шкоди та +12% опору магії рятують сапорта/офлейнера від прокасту.",
        "reason_ru": "Универсальный щит до 360 урона и +12% сопротивления магии спасают саппорта/оффлейнера от прокаста.",
        "reason_en": "Universal barrier up to 360 damage and +12% magic resistance save a support/offlaner from burst."
      },
      {
        "tag": "sustained_magic",
        "weight": 7,
        "reason_uk": "Заряди Hallowed регулярно дають барʼєр і швидкість у тривалих сутичках.",
        "reason_ru": "Заряды Hallowed регулярно дают барьер и скорость в затяжных стычках.",
        "reason_en": "Hallowed charges regularly provide barrier and movement speed in extended skirmishes."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "+12% сопротивления магии, рывки скорости +15% и накапливаемый универсальный барьер до 360 урона при получении удара от героев.",
    "summary_en": "+12% magic resistance, +15% movement speed bursts, and a stacking universal barrier up to 360 damage when hit by heroes."
  },
  "vladmir": {
    "item_id": 81,
    "name_en": "Vladmir's Offering",
    "category": "utility",
    "summary_uk": "Командна аура в радіусі 1200: +20% вампіризму, +18% базової шкоди, +3 броні та +1.75 регену мани.",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 6,
        "reason_uk": "Аура броні та вампіризму допомагає команді вигравати фізичні розміни.",
        "reason_ru": "Аура брони и вампиризма помогает команде выигрывать физические размены.",
        "reason_en": "The armor and lifesteal aura helps the team win physical trades."
      },
      {
        "tag": "sustained_magic",
        "weight": 5,
        "reason_uk": "Постійний вампіризм дозволяє корам відновлювати здоровʼя прямо під час бійки.",
        "reason_ru": "Постоянный вампиризм позволяет корам восстанавливать здоровье прямо во время драки.",
        "reason_en": "Constant lifesteal lets cores sustain health right through teamfights."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Командная аура в радиусе 1200: +20% вампиризма, +18% базового урона, +3 брони и +1.75 регена маны.",
    "summary_en": "Team aura in a 1200 radius: +20% lifesteal, +18% base damage, +3 armor, and +1.75 mana regen."
  },
  "boots_of_bearing": {
    "item_id": 931,
    "name_en": "Boots of Bearing",
    "category": "utility",
    "summary_uk": "Активка дає команді +50 швидкості атаки, +15% швидкості руху та 1.5 с повного імунітету до сповільнень у радіусі 1200.",
    "counters_tags": [
      {
        "tag": "trap_isolation",
        "weight": 8,
        "reason_uk": "Імунітет до сповільнень і ривок швидкості виводять команду з-під зонінгу (Upheaval, Tombstone, Gale).",
        "reason_ru": "Иммунитет к замедлениям и рывок скорости выводят команду из-под зонинга (Upheaval, Tombstone, Gale).",
        "reason_en": "Slow immunity and burst movement speed get the team out of zoning spells (Upheaval, Tombstone, Gale)."
      },
      {
        "tag": "illusions",
        "weight": 5,
        "reason_uk": "+50 швидкості атаки всій команді прискорює зачистку ілюзій і зомбі.",
        "reason_ru": "+50 скорости атаки всей команде ускоряет зачистку иллюзий и зомби.",
        "reason_en": "+50 attack speed for the entire team speeds up clearing illusions and Tombstone zombies."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Активка дает команде +50 скорости атаки, +15% скорости передвижения и 1.5 с полного иммунитета к замедлениям в радиусе 1200.",
    "summary_en": "Active grants allies +50 attack speed, +15% movement speed, and 1.5s of complete slow immunity in a 1200 radius."
  },
  "disperser": {
    "item_id": 1097,
    "name_en": "Disperser",
    "category": "recommended",
    "summary_uk": "Активка Suppress одночасно накладає Basic Dispel на ціль і власника, даючи +100% швидкості союзнику або сповільнюючи ворога; атаки палять по 40 мани.",
    "counters_tags": [
      {
        "tag": "silence_zone",
        "weight": 9,
        "reason_uk": "Миттєво знімає сайленс і коріння одночасно з себе та союзника з коротким КД 15 с.",
        "reason_ru": "Мгновенно снимает сайленс и корни одновременно с себя и союзника с коротким КД 15 с.",
        "reason_en": "Instantly dispels silence and roots from both yourself and an ally on a short 15s cooldown."
      },
      {
        "tag": "trap_isolation",
        "weight": 8,
        "reason_uk": "Скидає рути й дає максимальну швидкість із 40% опору сповільненням.",
        "reason_ru": "Сбрасывает руты и дает максимальную скорость с 40% сопротивления замедлениям.",
        "reason_en": "Removes roots and grants haste-like movement speed with 40% slow resistance."
      },
      {
        "tag": "mana_burn",
        "weight": 6,
        "reason_uk": "Випалює по 40 мани за удар і швидко садить мана-залежних ворогів.",
        "reason_ru": "Выжигает по 40 маны за удар и быстро садит мана-зависимых врагов.",
        "reason_en": "Burns 40 mana per hit and quickly drains mana-reliant enemies."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Активка Suppress одновременно накладывает Basic Dispel на цель и владельца, давая +100% скорости союзнику или замедляя врага; атаки жгут по 40 маны.",
    "summary_en": "Active Suppress simultaneously applies a Basic Dispel on both the target and caster, granting +100% movement speed to an ally or slowing an enemy; attacks burn 40 mana."
  },
  "diffusal_blade": {
    "item_id": 174,
    "name_en": "Diffusal Blade",
    "category": "recommended",
    "summary_uk": "Кожна атака спалює 40 мани ворога і завдає фізичної шкоди; активка сповільнює ціль на 4 секунди.",
    "counters_tags": [
      {
        "tag": "mana_burn",
        "weight": 6,
        "reason_uk": "Швидко випалює ману у маго-танків (Medusa, Necrophos, Bristleback, Timbersaw).",
        "reason_ru": "Быстро выжигает ману у маго-танков (Medusa, Necrophos, Bristleback, Timbersaw).",
        "reason_en": "Quickly burns through the mana pool of spell-reliant frontliners (Medusa, Necrophos, Bristleback, Timbersaw)."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Каждая атака сжигает 40 маны врага и наносит физический урон; активка замедляет цель на 4 секунды.",
    "summary_en": "Each attack burns 40 enemy mana and deals physical damage; active slows the target for 4 seconds."
  },
  "wind_waker": {
    "item_id": 604,
    "name_en": "Wind Waker",
    "category": "defensive",
    "summary_uk": "Піднімає в інвул-торнадо на 2.5 с себе, ворога АБО СОЮЗНИКА з базовим розвіюванням і можливістю рухати вихор.",
    "counters_tags": [
      {
        "tag": "trap_isolation",
        "weight": 10,
        "reason_uk": "Рятує союзників прямо з Chronosphere, Duel, Black Hole або Arena Of Blood.",
        "reason_ru": "Спасает союзников прямо из Chronosphere, Duel, Black Hole или Arena Of Blood.",
        "reason_en": "Saves allies right out of Chronosphere, Duel, Black Hole, or Arena Of Blood."
      },
      {
        "tag": "unit_target_control",
        "weight": 9,
        "reason_uk": "Витягує союзного кору з-під смертельного точкового фокусу.",
        "reason_ru": "Вытягивает союзного кора из-под смертельного точечного фокуса.",
        "reason_en": "Pulls an allied core out of lethal single-target focus."
      },
      {
        "tag": "silence_zone",
        "weight": 7,
        "reason_uk": "Миттєво знімає сайленс і дозволяє безпечно зміститися у вихорі.",
        "reason_ru": "Мгновенно снимает сайленс и позволяет безопасно сместиться в вихре.",
        "reason_en": "Instantly dispels silence and lets you reposition safely while cycloned."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Поднимает в инвул-торнадо на 2.5 с себя, врага ИЛИ СОЮЗНИКА с базовым развеиванием и возможностью двигать вихрь.",
    "summary_en": "Cyclones yourself, an enemy, OR AN ALLY into invulnerability for 2.5s with a Basic Dispel and free cyclone movement."
  },
  "ethereal_blade": {
    "item_id": 176,
    "name_en": "Ethereal Blade",
    "category": "defensive",
    "summary_uk": "Переводить союзника або ворога в ефірну форму на 4 с (100% імунітет до фізичної шкоди, -80% швидкості ворогу).",
    "counters_tags": [
      {
        "tag": "physical_burst",
        "weight": 10,
        "reason_uk": "Надійно рятує союзника від фізичного розстрілу (Omnislash, Duel, Chronosphere, Focus Fire).",
        "reason_ru": "Надежно спасает союзника от физического расстрела (Omnislash, Duel, Chronosphere, Focus Fire).",
        "reason_en": "Reliably saves an ally from physical burst (Omnislash, Duel, Chronosphere, Focus Fire)."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Переводит союзника или врага в эфирную форму на 4 с (100% иммунитет к физическому урону, -80% скорости врагу).",
    "summary_en": "Turns an ally or enemy ethereal for 4s (100% physical damage immunity, slows enemy movement by 80%)."
  },
  "gungir": {
    "item_id": 1466,
    "name_en": "Gleipnir",
    "category": "recommended",
    "summary_uk": "Активка Eternal Chains накладає масове коріння (Root) на 2 с у радіусі 400 та дає +75 до радіусу здібностей.",
    "counters_tags": [
      {
        "tag": "high_mobility",
        "weight": 8,
        "reason_uk": "Масовий рут по області фіксує кількох рухливих ворогів одночасно.",
        "reason_ru": "Массовый рут по области фиксирует нескольких подвижных врагов одновременно.",
        "reason_en": "AoE root locks down multiple mobile enemies at the same time."
      },
      {
        "tag": "illusions",
        "weight": 6,
        "reason_uk": "Зупиняє групу ілюзій на місці та розширює AoE ваших скілів.",
        "reason_ru": "Останавливает группу иллюзий на месте и расширяет AoE ваших скиллов.",
        "reason_en": "Locks packs of illusions in place and expands the AoE radius of your spells."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Активка Eternal Chains накладывает массовые корни (Root) на 2 с в радиусе 400 и дает +75 к радиусу способностей.",
    "summary_en": "Active Eternal Chains applies an AoE Root for 2s in a 400 radius and passively grants +75 ability AoE."
  },
  "rod_of_atos": {
    "item_id": 206,
    "name_en": "Rod of Atos",
    "category": "recommended",
    "summary_uk": "Дальній точковий рут (Cripple) на 2 секунди з великої дистанції за доступну ціну.",
    "counters_tags": [
      {
        "tag": "high_mobility",
        "weight": 8,
        "reason_uk": "Дешева рання фіксація мобільних героїв (Puck, Storm, Ember, Weaver) до появи у них BKB/Manta.",
        "reason_ru": "Дешевая ранняя фиксация мобильных героев (Puck, Storm, Ember, Weaver) до появления у них BKB/Manta.",
        "reason_en": "Cost-effective early lockdown against elusive heroes (Puck, Storm, Ember, Weaver) before they get BKB/Manta."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Дальний точечный рут (Cripple) на 2 секунды с большой дистанции за доступную цену.",
    "summary_en": "Long-range single-target root (Cripple) for 2 seconds at an affordable price."
  },
  "abyssal_blade": {
    "item_id": 208,
    "name_en": "Abyssal Blade",
    "category": "recommended",
    "summary_uk": "Активний стан Overwhelm на 1.6 с ПРОБИВАЄ Debuff Immunity (BKB), плюс пасивний Bash і +16% посилення відновлення.",
    "counters_tags": [
      {
        "tag": "high_mobility",
        "weight": 9,
        "reason_uk": "Миттєвий стан крізь BKB не дає втекти мобільним корам у пізній грі.",
        "reason_ru": "Мгновенный стан сквозь BKB не дает сбежать мобильным корам в поздней игре.",
        "reason_en": "Instant BKB-piercing stun prevents mobile cores from escaping in the late game."
      },
      {
        "tag": "channeled_disable",
        "weight": 8,
        "reason_uk": "Гарантовано збиває потокові ульти (Black Hole, Freezing Field, TP) навіть крізь BKB.",
        "reason_ru": "Гарантированно сбивает потоковые ульты (Black Hole, Freezing Field, TP) даже сквозь BKB.",
        "reason_en": "Guaranteed to interrupt channeled ultimates and TPs (Black Hole, Freezing Field, TP) even through BKB."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Активный стан Overwhelm на 1.6 с ПРОБИВАЕТ Debuff Immunity (BKB), плюс пассивный Bash и +16% усиления восстановления.",
    "summary_en": "Active 1.6s Overwhelm stun PIERCES Debuff Immunity (BKB), plus passive Bash and +16% health restoration amp."
  },
  "aeon_disk": {
    "item_id": 256,
    "name_en": "Aeon Disk",
    "category": "defensive",
    "summary_uk": "При падінні HP нижче 70% застосовує Strong Dispel і дає 2.5 с повної невразливості до будь-якої шкоди та +75% Status Resistance.",
    "counters_tags": [
      {
        "tag": "unit_target_control",
        "weight": 9,
        "reason_uk": "Сильне розвіювання скидає стан/хекс і не дає стерти вас за ініціацію (Chronosphere, Lasso, Duel, Roar).",
        "reason_ru": "Сильное развеивание сбрасывает стан/хекс и не дает стереть вас за инициацию (Chronosphere, Lasso, Duel, Roar).",
        "reason_en": "Strong Dispel removes stuns/hexes and prevents getting bursted down during enemy initiation (Chronosphere, Lasso, Duel, Roar)."
      },
      {
        "tag": "magic_burst",
        "weight": 8,
        "reason_uk": "Гарантовано рятує від миттєвого ваншоту прокастом.",
        "reason_ru": "Гарантированно спасает от мгновенного ваншота прокастом.",
        "reason_en": "Guaranteed save against instant one-shot spell burst."
      },
      {
        "tag": "physical_burst",
        "weight": 8,
        "reason_uk": "Переживає стрибок асасіна (PA, Riki, Clinkz) і дає час натиснути кнопки.",
        "reason_ru": "Переживает прыжок ассасина (PA, Riki, Clinkz) и дает время нажать кнопки.",
        "reason_en": "Survives an assassin's jump (PA, Riki, Clinkz) and buys time to press your spells/items."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "При падении HP ниже 70% применяет Strong Dispel и дает 2.5 с полной неуязвимости к любому урону и +75% Status Resistance.",
    "summary_en": "When HP drops below 70%, applies a Strong Dispel and grants 2.5s of complete damage immunity and +75% Status Resistance."
  },
  "satanic": {
    "item_id": 156,
    "name_en": "Satanic",
    "category": "defensive",
    "summary_uk": "Застосовує Basic Dispel при активації та дає 175% фізичного вампіризму на 6 секунд.",
    "counters_tags": [
      {
        "tag": "silence_zone",
        "weight": 8,
        "reason_uk": "Скидає сайленс/рути з керрі без витрати слоту на захист.",
        "reason_ru": "Сбрасывает сайленс/руты с керри без траты слота на защиту.",
        "reason_en": "Dispels silences/roots on a carry without sacrificing an offensive item slot."
      },
      {
        "tag": "damage_reflection",
        "weight": 8,
        "reason_uk": "175% вампіризму дозволяють керрі перебити зворотну шкоду Dispersion та Blade Mail.",
        "reason_ru": "175% вампиризма позволяют керри перебить ответный урон Dispersion и Blade Mail.",
        "reason_en": "175% lifesteal lets the carry out-heal reflected damage from Dispersion and Blade Mail."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Применяет Basic Dispel при активации и дает 175% физического вампиризма на 6 секунд.",
    "summary_en": "Applies a Basic Dispel on activation and grants 175% physical lifesteal for 6 seconds."
  },
  "witch_blade": {
    "item_id": 534,
    "name_en": "Witch Blade",
    "category": "recommended",
    "summary_uk": "Кожні 9 с заряджена атака має True Strike, сповільнює на 25% та отруює ціль від інтелекту власника.",
    "counters_tags": [
      {
        "tag": "evasion",
        "weight": 7,
        "reason_uk": "Заряджений удар із True Strike пробиває ухилення та накладає отруту.",
        "reason_ru": "Заряженный удар с True Strike пробивает уклонение и накладывает яд.",
        "reason_en": "Charged attack with True Strike pierces evasion and applies poison."
      },
      {
        "tag": "high_mobility",
        "weight": 5,
        "reason_uk": "Сповільнює рухливу ціль і наносить періодичну шкоду.",
        "reason_ru": "Замедляет подвижную цель и наносит периодический урон.",
        "reason_en": "Slows mobile targets and deals damage over time."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Каждые 9 с заряженная атака имеет True Strike, замедляет на 25% и отравляет цель от интеллекта владельца.",
    "summary_en": "Every 9s, a charged attack gains True Strike, slows by 25%, and poisons the target scaling with the caster's Intelligence."
  },
  "devastator": {
    "item_id": 1806,
    "name_en": "Parasma",
    "category": "recommended",
    "summary_uk": "Знижує магічний опір цілі на 20% з кожного удару, а заряджена атака бʼє з True Strike і сильною отрутою від інтелекту.",
    "counters_tags": [
      {
        "tag": "evasion",
        "weight": 8,
        "reason_uk": "Заряджена атака з True Strike та -20% магічного опору пробиває цілей з ухиленням.",
        "reason_ru": "Заряженная атака с True Strike и -20% магического сопротивления пробивает цели с уклонением.",
        "reason_en": "Charged attack with True Strike and -20% magic resistance pierces evasive targets."
      }
    ],
    "synergy_threshold": null,
    "summary_ru": "Снижает магическое сопротивление цели на 20% с каждого удара, а заряженная атака бьет с True Strike и сильным ядом от интеллекта.",
    "summary_en": "Reduces target magic resistance by 20% on every hit, while the charged attack strikes with True Strike and heavy Int-scaling poison."
  }
};

const NEUTRAL_ITEM_RULES = {
  "crippling_crossbow": {
    "tier": 1,
    "name_en": "Crippling Crossbow",
    "tags": [
      "heal_regen",
      "high_mobility"
    ],
    "reason_uk": "Активка Hobble ріже відновлення здоровʼя на -40% і сповільнює на 50% на 4 с — найкращий ранній анти-хіл.",
    "reason_ru": "Активка Hobble режет восстановление здоровья на -40% и замедляет на 50% на 4 с — лучший ранний анти-хил.",
    "reason_en": "Active Hobble cuts health restoration by 40% and slows by 50% for 4s — the best early anti-heal."
  },
  "poor_mans_shield": {
    "tier": 1,
    "name_en": "Poor Man's Shield",
    "tags": [
      "illusions",
      "physical_burst"
    ],
    "reason_uk": "100% шанс заблокувати 30/20 фізичної шкоди від атак героїв — ідеально проти ілюзій і харасу з руки.",
    "reason_ru": "100% шанс заблокировать 30/20 физического урона от атак героев — идеально против иллюзий и харасса с руки.",
    "reason_en": "100% chance to block 30/20 physical damage from hero attacks — ideal against illusions and right-click harass."
  },
  "pogo_stick": {
    "tier": 1,
    "name_en": "Tumbler's Toy",
    "tags": [
      "trap_isolation",
      "silence_zone"
    ],
    "reason_uk": "Безкоштовний стрибок Vault на 300 одиниць для виходу з когів, диму чи зонінгу.",
    "reason_ru": "Бесплатный прыжок Vault на 300 единиц для выхода из когов, дыма или зонинга.",
    "reason_en": "Mana-free 300-unit Vault leap to escape cogs, smoke, or zoning spells."
  },
  "essence_ring": {
    "tier": 1,
    "name_en": "Essence Ring",
    "tags": [
      "magic_burst",
      "unit_target_control"
    ],
    "reason_uk": "Миттєво додає +240 поточного та макс. HP на 10 с, рятуючи від раннього прокасту.",
    "reason_ru": "Мгновенно добавляет +240 текущего и макс. HP на 10 с, спасая от раннего прокаста.",
    "reason_en": "Instantly grants +240 current and max HP for 10s, saving you from early burst."
  },
  "medallion_of_courage": {
    "tier": 1,
    "name_en": "Medallion of Courage",
    "tags": [
      "physical_burst"
    ],
    "reason_uk": "Активка Valor дає +7 броні союзнику для сейву або знімає -4 броні з ворога.",
    "reason_ru": "Активка Valor дает +7 брони союзнику для сейва или снимает -4 брони с врага.",
    "reason_en": "Active Valor grants +7 armor to an ally as a save or reduces an enemy's armor by 4."
  },
  "seeds_of_serenity": {
    "tier": 1,
    "name_en": "Seeds of Serenity",
    "tags": [
      "sustained_magic",
      "heal_regen"
    ],
    "reason_uk": "Створює зону регенерації здоровʼя в радіусі 400 проти постійного спаму й отрут.",
    "reason_ru": "Создает зону регенерации здоровья в радиусе 400 против постоянного спама и ядов.",
    "reason_en": "Creates a 400-radius health regeneration zone against constant spell spam and poison."
  },
  "mana_draught": {
    "tier": 1,
    "name_en": "Mana Draught",
    "tags": [
      "mana_burn"
    ],
    "reason_uk": "Відновлює ману після випалювання, дозволяючи натиснути ключовий скіл.",
    "reason_ru": "Восстанавливает ману после выжигания, позволяя нажать ключевой скилл.",
    "reason_en": "Restores mana after mana burn so you can cast a crucial spell."
  },
  "defiant_shell": {
    "tier": 1,
    "name_en": "Defiant Shell",
    "tags": [
      "physical_burst",
      "illusions"
    ],
    "reason_uk": "Контратакує ворогів у відповідь на їхні удари в ближньому бою.",
    "reason_ru": "Контратакует врагов в ответ на их удары в ближнем бою.",
    "reason_en": "Counterattacks enemies in response to their melee hits."
  },
  "searing_signet": {
    "tier": 1,
    "name_en": "Searing Signet",
    "tags": [
      "illusions",
      "dispellable_save"
    ],
    "reason_uk": "Підпалює цілі на 6 с після магічної шкоди, збиваючи Refraction/Blink і підсвічуючи оригінал.",
    "reason_ru": "Поджигает цели на 6 с после магического урона, сбивая Refraction/Blink и подсвечивая оригинал.",
    "reason_en": "Ignites targets for 6s on magic damage, burning through Refraction, canceling Blink, and revealing the real hero."
  },
  "jidi_pollen_bag": {
    "tier": 2,
    "name_en": "Jidi Pollen Bag",
    "tags": [
      "heal_regen",
      "illusions"
    ],
    "reason_uk": "У радіусі 900 знижує відновлення здоровʼя всіх ворогів на -50% на 9 секунд і наносить періодичну шкоду.",
    "reason_ru": "В радиусе 900 снижает восстановление здоровья всех врагов на -50% на 9 секунд и наносит периодический урон.",
    "reason_en": "Reduces enemy health restoration by 50% in a 900 radius for 9 seconds and deals damage over time."
  },
  "cloak_of_flames": {
    "tier": 2,
    "name_en": "Cloak of Flames",
    "tags": [
      "illusions"
    ],
    "reason_uk": "Постійна аура 40 магічної шкоди/с у радіусі 375 швидко випалює ілюзії та сумонів.",
    "reason_ru": "Постоянная аура 40 магического урона/с в радиусе 375 быстро выжигает иллюзии и саммонов.",
    "reason_en": "Permanent 40 magic damage/s aura in a 375 radius quickly burns through illusions and summons."
  },
  "psychic_headband": {
    "tier": 2,
    "name_en": "Psychic Headband",
    "tags": [
      "trap_isolation",
      "physical_burst",
      "silence_zone"
    ],
    "reason_uk": "Відштовхує ворожого мілі-кору або ініціатора на 400 одиниць без витрати мани.",
    "reason_ru": "Отталкивает вражеского мили-кора или инициатора на 400 единиц без траты маны.",
    "reason_en": "Pushes an enemy melee core or initiator back 400 units for zero mana."
  },
  "serrated_shiv": {
    "tier": 2,
    "name_en": "Serrated Shiv",
    "tags": [
      "evasion",
      "heal_regen"
    ],
    "reason_uk": "Дає 20% шанс True Strike проти ухилення та наносить +8% від поточного HP цілі.",
    "reason_ru": "Дает 20% шанс True Strike против уклонения и наносит +8% от текущего HP цели.",
    "reason_en": "Grants a 20% True Strike chance against evasion and deals +8% of the target's current HP."
  },
  "unrelenting_eye": {
    "tier": 2,
    "name_en": "Unrelenting Eye",
    "tags": [
      "trap_isolation",
      "sustained_magic"
    ],
    "reason_uk": "Дає до +50% опору сповільненням проти вʼязких піків (Venomancer, Undying, Warlock).",
    "reason_ru": "Дает до +50% сопротивления замедлениям против вязких пиков (Venomancer, Undying, Warlock).",
    "reason_en": "Grants up to +50% slow resistance against heavy slow lineups (Venomancer, Undying, Warlock)."
  },
  "stormcrafter": {
    "tier": 2,
    "name_en": "Stormcrafter",
    "tags": [
      "illusions",
      "high_mobility"
    ],
    "reason_uk": "Пасивно бʼє блискавками по 2 цілях зі сповільненням, допомагаючи чистити копії та збивати Blink.",
    "reason_ru": "Пассивно бьет молниями по 2 целям с замедлением, помогая чистить копии и сбивать Blink.",
    "reason_en": "Passively zaps 2 targets with lightning and slows them, helping clear illusions and cancel Blink."
  },
  "gunpowder_gauntlets": {
    "tier": 2,
    "name_en": "Gunpowder Gauntlet",
    "tags": [
      "illusions"
    ],
    "reason_uk": "Додає +120 магічної шкоди та AoE-сплеш по скупченню ілюзій.",
    "reason_ru": "Добавляет +120 магического урона и AoE-сплеш по скоплению иллюзий.",
    "reason_en": "Adds +120 magical damage and AoE splash against clustered illusions."
  },
  "spellslinger": {
    "tier": 2,
    "name_en": "Spellslinger",
    "tags": [
      "mana_burn"
    ],
    "reason_uk": "Повертає 20% витраченої на скіли мани в умовах дефіциту ресурсів.",
    "reason_ru": "Возвращает 20% потраченной на скиллы маны в условиях дефицита ресурсов.",
    "reason_en": "Restores 20% of mana spent on spells when mana is scarce."
  },
  "dandelion_amulet": {
    "tier": 3,
    "name_en": "Dandelion Amulet",
    "tags": [
      "magic_burst",
      "sustained_magic"
    ],
    "reason_uk": "Кожні 12 с блокує до 300 магічної шкоди від сильних нюків.",
    "reason_ru": "Каждые 12 с блокирует до 300 магического урона от сильных нюков.",
    "reason_en": "Blocks up to 300 magic damage from heavy nukes every 12s."
  },
  "idol_of_screeauk": {
    "tier": 3,
    "name_en": "Idol of Scree'auk",
    "tags": [
      "physical_burst",
      "trap_isolation"
    ],
    "reason_uk": "Активка дає +35% ухилення, +50% опору сповільненням і проходження крізь юнітів на 6.5 с.",
    "reason_ru": "Активка дает +35% уклонения, +50% сопротивления замедлениям и прохождение сквозь юнитов на 6.5 с.",
    "reason_en": "Active grants +35% evasion, +50% slow resistance, and phased movement for 6.5s."
  },
  "prophets_pendulum": {
    "tier": 3,
    "name_en": "Prophet's Pendulum",
    "tags": [
      "magic_burst",
      "physical_burst",
      "unit_target_control"
    ],
    "reason_uk": "Відкладає 30% вхідної шкоди на 5 секунд, не даючи загинути за один прокаст чи стан.",
    "reason_ru": "Откладывает 30% входящего урона на 5 секунд, не давая погибнуть за один прокаст или стан.",
    "reason_en": "Delays 30% of incoming damage for 5 seconds, preventing instant death during a single stun or burst combo."
  },
  "metamorphic_mandible": {
    "tier": 3,
    "name_en": "Metamorphic Mandible",
    "tags": [
      "magic_burst",
      "sustained_magic",
      "high_mobility"
    ],
    "reason_uk": "Активка Pupate дає +50% опору магії та +20% швидкості руху на 5 с для виходу з-під прокасту.",
    "reason_ru": "Активка Pupate дает +50% сопротивления магии и +20% скорости передвижения на 5 с для выхода из-под прокаста.",
    "reason_en": "Active Pupate grants +50% magic resistance and +20% movement speed for 5s to escape spell burst."
  },
  "rattlecage": {
    "tier": 3,
    "name_en": "Rattlecage",
    "tags": [
      "physical_burst",
      "illusions"
    ],
    "reason_uk": "Після кожних 220 отриманої шкоди випускає снаряди, що сповільнюють атаку та рух ворогів.",
    "reason_ru": "После каждых 220 полученного урона выпускает снаряды, замедляющие атаку и передвижение врагов.",
    "reason_en": "Releases projectiles after every 220 damage taken that slow enemy attack and movement speed."
  },
  "conjurers_catalyst": {
    "tier": 3,
    "name_en": "Conjurer's Catalyst",
    "tags": [
      "illusions"
    ],
    "reason_uk": "Перетворює сильні заклинання на AoE-вибухи в радіусі 300 для зачистки ілюзій.",
    "reason_ru": "Превращает сильные заклинания в AoE-взрывы в радиусе 300 для зачистки иллюзий.",
    "reason_en": "Turns single-target spells into 300-radius AoE blasts to clear illusions."
  },
  "minotaur_horn": {
    "tier": 4,
    "name_en": "Minotaur Horn",
    "tags": [
      "magic_burst",
      "unit_target_control",
      "damage_reflection",
      "silence_zone"
    ],
    "reason_uk": "Міні-BKB на 2 с із базовим розвіюванням, +60% магічного опору та імунітетом до чистої/відбитої шкоди.",
    "reason_ru": "Мини-BKB на 2 с с базовым развеиванием, +60% магического сопротивления и иммунитетом к чистому/отраженному урону.",
    "reason_en": "Mini-BKB for 2s with Basic Dispel, +60% magic resistance, and immunity to pure/reflected damage."
  },
  "heavy_blade": {
    "tier": 4,
    "name_en": "Witchbane",
    "tags": [
      "dispellable_save",
      "silence_zone",
      "mana_burn"
    ],
    "reason_uk": "Активний масовий Basic Dispel у радіусі 300 знімає бафи з ворогів і сайленс із союзників + бʼє від макс. мани.",
    "reason_ru": "Активный массовый Basic Dispel в радиусе 300 снимает баффы с врагов и сайленс с союзников + бьет от макс. маны.",
    "reason_en": "Active 300-radius AoE Basic Dispel removes buffs from enemies and silences from allies while dealing max-mana damage."
  },
  "spider_legs": {
    "tier": 4,
    "name_en": "Spider Legs",
    "tags": [
      "trap_isolation",
      "high_mobility"
    ],
    "reason_uk": "Дає +20% швидкості та вільний рух через дерева, коги, арену й скелі на 12 с.",
    "reason_ru": "Дает +20% скорости и свободное передвижение через деревья, коги, арену и скалы на 12 с.",
    "reason_en": "Grants +20% movement speed and unobstructed movement over trees, cogs, arena, and cliffs for 12s."
  },
  "fallen_sky": {
    "tier": 4,
    "name_en": "Fallen Sky",
    "tags": [
      "high_mobility",
      "channeled_disable",
      "trap_isolation"
    ],
    "reason_uk": "Метеор-стрибок з AoE-станом на 1.6 с дозволяє миттєво збити потоковий ульт або вийти з пастки.",
    "reason_ru": "Метеор-прыжок с AoE-станом на 1.6 с позволяет мгновенно сбить потоковый ульт или выйти из ловушки.",
    "reason_en": "Meteor leap with a 1.6s AoE stun lets you instantly interrupt channeled ultimates or jump out of traps."
  },
  "demonicon": {
    "tier": 4,
    "name_en": "Book of the Dead",
    "tags": [
      "invisibility",
      "mana_burn"
    ],
    "reason_uk": "Прикликає демонів із вбудованим True Sight, розвіюванням і випалюванням мани.",
    "reason_ru": "Призывает демонов со встроенным True Sight, развеиванием и выжиганием маны.",
    "reason_en": "Summons demons with built-in True Sight, dispel, and mana burn."
  },
  "riftshadow_prism": {
    "tier": 4,
    "name_en": "Riftshadow Prism",
    "tags": [
      "unit_target_control",
      "physical_burst"
    ],
    "reason_uk": "Створює 100%-HP ілюзію на 20 с для збиття фокусу та байту точкових ультиматів.",
    "reason_ru": "Создает 100%-HP иллюзию на 20 с для сбития фокуса и байта точечных ультимейтов.",
    "reason_en": "Creates a 100%-HP illusion for 20s to break focus and bait single-target ultimates."
  },
  "desolator_2": {
    "tier": 4,
    "name_en": "Stygian Desolator",
    "tags": [
      "physical_burst"
    ],
    "reason_uk": "Знімає -13 броні з цілі для швидкого фокусу та знесення бази.",
    "reason_ru": "Снимает -13 брони с цели для быстрого фокуса и сноса базы.",
    "reason_en": "Reduces target armor by 13 for rapid focus fire and base pushing."
  }
};

const HERO_COUNTER_CAPABILITIES = {
  "viper": {
    "positions": [
      2,
      3
    ],
    "counters_tags": [
      "critical_passive",
      "damage_reflection",
      "heal_regen"
    ],
    "reason_uk": "Viper Strike накладає Break на пасивки та ріже темп",
    "reason_ru": "Viper Strike накладывает Break на пассивки и режет темп",
    "reason_en": "Viper Strike applies Break to passives and shuts down enemy tempo"
  },
  "hoodwink": {
    "positions": [
      4,
      5,
      2
    ],
    "counters_tags": [
      "critical_passive",
      "high_mobility"
    ],
    "reason_uk": "Sharpshooter накладає Break, а Bushwhack фіксує ухильних цілей",
    "reason_ru": "Sharpshooter накладывает Break, а Bushwhack фиксирует увертливые цели",
    "reason_en": "Sharpshooter applies Break, while Bushwhack locks down elusive targets"
  },
  "doom_bringer": {
    "positions": [
      3,
      1
    ],
    "counters_tags": [
      "critical_passive",
      "heal_regen",
      "high_mobility",
      "dispellable_save"
    ],
    "reason_uk": "Ульт Doom вимикає пасивки (Break), хіл і предмети/скіли",
    "reason_ru": "Ульт Doom отключает пассивки (Break), хил и предметы/скиллы",
    "reason_en": "Doom disables passives (Break), healing, items, and abilities"
  },
  "ancient_apparition": {
    "positions": [
      5,
      4,
      2
    ],
    "counters_tags": [
      "heal_regen"
    ],
    "reason_uk": "Ice Blast повністю блокує будь-який хіл і перекачку",
    "reason_ru": "Ice Blast полностью блокирует любой хил и перекачку",
    "reason_en": "Ice Blast completely blocks all healing and health gain"
  },
  "earthshaker": {
    "positions": [
      4,
      3,
      2
    ],
    "counters_tags": [
      "illusions",
      "channeled_disable",
      "high_mobility"
    ],
    "reason_uk": "Echo Slam і Aftershock миттєво карають за ілюзії та збивають касти",
    "reason_ru": "Echo Slam и Aftershock мгновенно наказывают за иллюзии и сбивают касты",
    "reason_en": "Echo Slam and Aftershock instantly punish illusions and interrupt casts"
  },
  "shredder": {
    "positions": [
      3,
      2
    ],
    "counters_tags": [
      "illusions",
      "physical_burst"
    ],
    "reason_uk": "Чистий AoE-урон знищує ілюзії та жирних силовиків",
    "reason_ru": "Чистый AoE-урон уничтожает иллюзии и плотных силовиков",
    "reason_en": "Pure AoE damage shreds illusions and tanky strength heroes"
  },
  "leshrac": {
    "positions": [
      2,
      3
    ],
    "counters_tags": [
      "illusions",
      "evasion"
    ],
    "reason_uk": "Масова магія Pulse Nova легко випалює копії та ігнорує ухилення",
    "reason_ru": "Массовая магия Pulse Nova легко выжигает копии и игнорирует уклонение",
    "reason_en": "AoE magic damage from Pulse Nova easily burns illusions and ignores evasion"
  },
  "sven": {
    "positions": [
      1,
      3
    ],
    "counters_tags": [
      "illusions",
      "physical_burst"
    ],
    "reason_uk": "Great Cleave прорубує ілюзії, а Warcry дає броню команді",
    "reason_ru": "Great Cleave прорубает иллюзии, а Warcry дает броню команде",
    "reason_en": "Great Cleave cuts through illusions while Warcry grants armor to the team"
  },
  "sand_king": {
    "positions": [
      3,
      4,
      2
    ],
    "counters_tags": [
      "illusions",
      "high_mobility"
    ],
    "reason_uk": "Постійний AoE-урон чистить ілюзії та відкриває файт через Burrowstrike",
    "reason_ru": "Постоянный AoE-урон чистит иллюзии и открывает файт через Burrowstrike",
    "reason_en": "Sustained AoE damage clears illusions and initiates fights with Burrowstrike"
  },
  "slardar": {
    "positions": [
      3,
      1,
      4
    ],
    "counters_tags": [
      "invisibility",
      "evasion",
      "heal_regen"
    ],
    "reason_uk": "Corrosive Haze постійно розкриває інвізерів і ріже броню",
    "reason_ru": "Corrosive Haze постоянно раскрывает инвизеров и режет броню",
    "reason_en": "Corrosive Haze continuously reveals invisible heroes and shreds armor"
  },
  "bounty_hunter": {
    "positions": [
      4,
      3
    ],
    "counters_tags": [
      "invisibility"
    ],
    "reason_uk": "Track тримає інвізерів у постійному True Sight",
    "reason_ru": "Track держит инвизеров в постоянном True Sight",
    "reason_en": "Track keeps invisible heroes under constant True Sight"
  },
  "zuus": {
    "positions": [
      2,
      4,
      5
    ],
    "counters_tags": [
      "invisibility",
      "evasion"
    ],
    "reason_uk": "Lightning Bolt та Thundergod's Wrath дають True Sight і бʼють крізь ухилення",
    "reason_ru": "Lightning Bolt и Thundergod's Wrath дают True Sight и бьют сквозь уклонение",
    "reason_en": "Lightning Bolt and Thundergod's Wrath provide True Sight and pierce evasion"
  },
  "lion": {
    "positions": [
      4,
      5,
      2
    ],
    "counters_tags": [
      "high_mobility",
      "illusions",
      "channeled_disable"
    ],
    "reason_uk": "Миттєвий Hex ловить мобільних героїв і миттєво знищує ілюзію",
    "reason_ru": "Мгновенный Hex ловит мобильных героев и мгновенно уничтожает иллюзию",
    "reason_en": "Instant Hex catches mobile heroes and immediately destroys illusions"
  },
  "shadow_shaman": {
    "positions": [
      4,
      5
    ],
    "counters_tags": [
      "high_mobility",
      "illusions",
      "channeled_disable",
      "critical_passive"
    ],
    "reason_uk": "Hex + Shackles фіксують мобільних корів (а талант 15 лвл додає Break на Hex)",
    "reason_ru": "Hex + Shackles фиксируют мобильных коров (а талант 15 лвл добавляет Break на Hex)",
    "reason_en": "Hex + Shackles lock down mobile cores (and the lvl 15 talent adds Break to Hex)"
  },
  "disruptor": {
    "positions": [
      5,
      4
    ],
    "counters_tags": [
      "high_mobility",
      "magic_burst"
    ],
    "reason_uk": "Glimpse та Static Storm карають за стрибки і вимикають кастерів",
    "reason_ru": "Glimpse и Static Storm наказывают за прыжки и выключают кастеров",
    "reason_en": "Glimpse and Static Storm punish mobility jumps and silence casters"
  },
  "puck": {
    "positions": [
      2,
      3
    ],
    "counters_tags": [
      "high_mobility",
      "channeled_disable"
    ],
    "reason_uk": "Dream Coil не дає тікати, а Waning Rift збиває касти сайленсом",
    "reason_ru": "Dream Coil не дает убегать, а Waning Rift сбивает касты сайленсом",
    "reason_en": "Dream Coil prevents escapes while Waning Rift silences and disrupts casts"
  },
  "silencer": {
    "positions": [
      5,
      4,
      2
    ],
    "counters_tags": [
      "magic_burst",
      "channeled_disable",
      "high_mobility"
    ],
    "reason_uk": "Global Silence зриває будь-яку магічну комбінацію та потокові ульти",
    "reason_ru": "Global Silence срывает любую магическую комбинацию и потоковые ульты",
    "reason_en": "Global Silence disrupts any magic combo and interrupts channeled ultimates"
  },
  "oracle": {
    "positions": [
      5,
      4
    ],
    "counters_tags": [
      "unit_target_control",
      "magic_burst",
      "dispellable_save"
    ],
    "reason_uk": "False Promise і Fortune's End рятують із фокусу та знімають ворожі бафи",
    "reason_ru": "False Promise и Fortune's End спасают из фокуса и снимают вражеские баффы",
    "reason_en": "False Promise and Fortune's End save allies from focus fire and dispel enemy buffs"
  },
  "abaddon": {
    "positions": [
      5,
      3,
      1
    ],
    "counters_tags": [
      "unit_target_control",
      "silence_zone",
      "channeled_disable"
    ],
    "reason_uk": "Aphotic Shield дає сильне розвіювання союзнику з будь-якого контролю",
    "reason_ru": "Aphotic Shield дает сильное развеивание союзнику из любого контроля",
    "reason_en": "Aphotic Shield applies a Strong Dispel on an ally to break any disable"
  },
  "omniknight": {
    "positions": [
      5,
      3
    ],
    "counters_tags": [
      "physical_burst",
      "magic_burst",
      "unit_target_control"
    ],
    "reason_uk": "Repel захищає кору від контролю/магії, а Guardian Angel — від фіз-шкоди",
    "reason_ru": "Repel защищает кора от контроля/магии, а Guardian Angel — от физ-урона",
    "reason_en": "Repel protects a core from disables/magic, while Guardian Angel grants physical immunity"
  },
  "antimage": {
    "positions": [
      1
    ],
    "counters_tags": [
      "magic_burst",
      "sustained_magic"
    ],
    "reason_uk": "Counterspell і високий опір магії карають магічні піки через Mana Void",
    "reason_ru": "Counterspell и высокое сопротивление магии наказывают магические пики через Mana Void",
    "reason_en": "Counterspell and high magic resistance punish magic lineups with Mana Void"
  },
  "life_stealer": {
    "positions": [
      1
    ],
    "counters_tags": [
      "magic_burst",
      "unit_target_control",
      "trap_isolation"
    ],
    "reason_uk": "Rage дає безкоштовний Debuff Immunity проти контролю і магії",
    "reason_ru": "Rage дает бесплатный Debuff Immunity против контроля и магии",
    "reason_en": "Rage provides built-in Debuff Immunity against disables and magic"
  },
  "axe": {
    "positions": [
      3
    ],
    "counters_tags": [
      "illusions",
      "high_mobility",
      "physical_burst"
    ],
    "reason_uk": "Call крізь BKB фіксує мобільних керрі та розкручується об ілюзії",
    "reason_ru": "Call сквозь BKB фиксирует мобильных керри и раскручивается об иллюзии",
    "reason_en": "BKB-piercing Berserker's Call locks down mobile carries and procs spins off illusions"
  },
  "winter_wyvern": {
    "positions": [
      5,
      4
    ],
    "counters_tags": [
      "physical_burst",
      "illusions"
    ],
    "reason_uk": "Cold Embrace рятує від фіз-фокусу, а Winter's Curse обертає керрі проти союзників",
    "reason_ru": "Cold Embrace спасает от физ-фокуса, а Winter's Curse обращает керри против союзников",
    "reason_en": "Cold Embrace saves allies from physical focus, while Winter's Curse turns enemy carries against their team"
  },
  "shadow_demon": {
    "positions": [
      5,
      4
    ],
    "counters_tags": [
      "dispellable_save",
      "physical_burst",
      "heal_regen"
    ],
    "reason_uk": "Demonic Purge знімає бафи крізь BKB, а Disruption сейвить із пасток",
    "reason_ru": "Demonic Purge снимает баффы сквозь BKB, а Disruption сейвит из ловушек",
    "reason_en": "Demonic Purge continuously dispels buffs through BKB, while Disruption saves allies from traps"
  },
  "rubick": {
    "positions": [
      4,
      2
    ],
    "counters_tags": [
      "channeled_disable",
      "unit_target_control"
    ],
    "reason_uk": "Telekinesis швидко зриває позицію, а Spell Steal повертає ворожі ульти",
    "reason_ru": "Telekinesis быстро срывает позицию, а Spell Steal возвращает вражеские ульты",
    "reason_en": "Telekinesis disrupts enemy positioning while Spell Steal turns enemy ultimates against them"
  },
  "rattletrap": {
    "positions": [
      4,
      5,
      3
    ],
    "counters_tags": [
      "channeled_disable",
      "magic_burst"
    ],
    "reason_uk": "Battery Assault та Hookshot крізь BKB збивають потокові ульти",
    "reason_ru": "Battery Assault и Hookshot сквозь BKB сбивают потоковые ульты",
    "reason_en": "Battery Assault and BKB-piercing Hookshot interrupt channeled ultimates"
  },
  "legion_commander": {
    "positions": [
      3
    ],
    "counters_tags": [
      "high_mobility",
      "unit_target_control"
    ],
    "reason_uk": "Press the Attack знімає контроль із союзника, а Duel фіксує ескейперів",
    "reason_ru": "Press the Attack снимает контроль с союзника, а Duel фиксирует эскейперов",
    "reason_en": "Press the Attack Strong Dispels an ally, while Duel locks down elusive heroes"
  },
  "nyx_assassin": {
    "positions": [
      4,
      5,
      2
    ],
    "counters_tags": [
      "magic_burst",
      "sustained_magic",
      "mana_burn"
    ],
    "reason_uk": "Spiked Carapace і випалювання мани карають інтелект-нюкерів та кастерів",
    "reason_ru": "Spiked Carapace и выжигание маны наказывают интеллект-нюкеров и кастеров",
    "reason_en": "Spiked Carapace and mana burn punish Intelligence nukers and spellcasters"
  },
  "treant": {
    "positions": [
      5,
      4
    ],
    "counters_tags": [
      "physical_burst",
      "high_mobility",
      "trap_isolation"
    ],
    "reason_uk": "Overgrowth фіксує ворожих керрі крізь BKB, а Living Armor захищає під фокусом",
    "reason_ru": "Overgrowth фиксирует вражеских керри сквозь BKB, а Living Armor защищает под фокусом",
    "reason_en": "Overgrowth locks down enemy carries through BKB, while Living Armor protects allies under focus"
  },
  "enigma": {
    "positions": [
      3,
      4
    ],
    "counters_tags": [
      "physical_burst",
      "trap_isolation",
      "heal_regen"
    ],
    "reason_uk": "Black Hole та Midnight Pulse (% від макс. HP) стирають жирних фронтовиків крізь BKB",
    "reason_ru": "Black Hole и Midnight Pulse (% от макс. HP) стирают плотных фронтовиков сквозь BKB",
    "reason_en": "Black Hole and Midnight Pulse (% max HP damage) melt tanky frontliners through BKB"
  },
  "obsidian_destroyer": {
    "positions": [
      2
    ],
    "counters_tags": [
      "physical_burst",
      "illusions",
      "heal_regen"
    ],
    "reason_uk": "Чистий урон Arcane Orb і Astral Imprisonment знищують танків із високою бронею",
    "reason_ru": "Чистый урон Arcane Orb и Astral Imprisonment уничтожают танков с высокой броней",
    "reason_en": "Arcane Orb pure damage and Astral Imprisonment shred high-armor tanks"
  },
  "drow_ranger": {
    "positions": [
      1
    ],
    "counters_tags": [
      "physical_burst",
      "silence_zone",
      "heal_regen"
    ],
    "reason_uk": "Marksmanship ігнорує базову броню, а Shard надає гіпотермію проти хілу",
    "reason_ru": "Marksmanship игнорирует базовую броню, а Shard дает гипотермию против хила",
    "reason_en": "Marksmanship ignores base armor, while Aghanim's Shard applies Hypothermia against healing"
  },
  "dark_seer": {
    "positions": [
      3
    ],
    "counters_tags": [
      "physical_burst",
      "illusions"
    ],
    "reason_uk": "Wall of Replica створює копії ворожих керрі з їхніми ж пасивками й аурами",
    "reason_ru": "Wall of Replica создает копии вражеских керри с их же пассивками и аурами",
    "reason_en": "Wall of Replica creates illusions of enemy carries with their own passives and auras"
  },
  "largo": {
    "positions": [
      5,
      4,
      3
    ],
    "counters_tags": [
      "sustained_magic",
      "unit_target_control"
    ],
    "reason_uk": "Island Elixir та Catchy Lick рятують союзників із позиції та перебивають DoT-шкоду",
    "reason_ru": "Island Elixir и Catchy Lick спасают союзников с позиции и перебивают DoT-урон",
    "reason_en": "Island Elixir and Catchy Lick save allies out of bad positioning and out-heal DoT damage"
  }
};

const ALLY_SYNERGY_RULES = {
  "aura_carriers": [
    "abyssal_underlord",
    "dark_seer",
    "tidehunter",
    "abaddon",
    "omniknight",
    "beastmaster",
    "centaur",
    "sand_king",
    "doom_bringer",
    "chen",
    "visage",
    "brewmaster",
    "enigma",
    "mars",
    "axe",
    "dawnbreaker",
    "lycan",
    "elder_titan",
    "primal_beast",
    "necrolyte",
    "death_prophet",
    "undying",
    "largo",
    "spirit_breaker",
    "kunkka"
  ],
  "aura_items": [
    "pipe",
    "crimson_guard",
    "guardian_greaves",
    "vladmir",
    "assault"
  ],
  "aura_carriers_by_item": {
    "pipe": [
      "abyssal_underlord",
      "dark_seer",
      "tidehunter",
      "centaur",
      "abaddon",
      "omniknight",
      "sand_king",
      "doom_bringer",
      "brewmaster",
      "enigma",
      "necrolyte",
      "undying",
      "elder_titan",
      "dawnbreaker",
      "viper",
      "death_prophet",
      "pudge",
      "primal_beast",
      "largo"
    ],
    "crimson_guard": [
      "abyssal_underlord",
      "centaur",
      "axe",
      "tidehunter",
      "mars",
      "bristleback",
      "dark_seer",
      "undying",
      "primal_beast",
      "kunkka",
      "sand_king",
      "abaddon",
      "omniknight",
      "spirit_breaker",
      "elder_titan"
    ],
    "guardian_greaves": [
      "abyssal_underlord",
      "dark_seer",
      "tidehunter",
      "chen",
      "enigma",
      "abaddon",
      "omniknight",
      "necrolyte",
      "death_prophet",
      "undying",
      "dazzle",
      "oracle",
      "jakiro",
      "largo"
    ],
    "vladmir": [
      "beastmaster",
      "lycan",
      "brewmaster",
      "visage",
      "chen",
      "broodmother",
      "enigma",
      "abaddon",
      "omniknight",
      "bounty_hunter",
      "vengefulspirit",
      "marci",
      "elder_titan",
      "tidehunter",
      "abyssal_underlord"
    ],
    "assault": [
      "alchemist",
      "dragon_knight",
      "life_stealer",
      "sven",
      "skeleton_king",
      "chaos_knight",
      "lycan",
      "beastmaster",
      "night_stalker",
      "slardar",
      "kunkka",
      "tiny",
      "legion_commander",
      "mars",
      "doom_bringer",
      "razor",
      "lone_druid",
      "elder_titan",
      "spirit_breaker",
      "bristleback"
    ]
  },
  "physical_ally_boost_items": [
    {
      "item_key": "assault",
      "bonus": 14,
      "reason_uk": "У союзних корів високий фізичний урон — Assault Cuirass різко посилить ДПС команди за рахунок -5 броні ворогам та +30 AS.",
      "reason_ru": "У союзных коров высокий физический урон — Assault Cuirass резко усилит ДПС команды за счет -5 брони врагам и +30 AS.",
      "reason_en": "Allied cores have high physical damage — Assault Cuirass will sharply boost team DPS with -5 enemy armor and +30 AS."
    },
    {
      "item_key": "solar_crest",
      "bonus": 12,
      "reason_uk": "Баф +60 AS, +5 броні та щит 350 HP ідеально розкриє ваших фізичних корів у бійці.",
      "reason_ru": "Бафф +60 AS, +5 брони и щит 350 HP идеально раскроет ваших физических коров в драке.",
      "reason_en": "The +60 AS, +5 armor buff, and 350 HP barrier will enable your physical cores in teamfights."
    },
    {
      "item_key": "vladmir",
      "bonus": 11,
      "reason_uk": "Аура +18% урону та +20% вампіризму посилює фізичний пік команди.",
      "reason_ru": "Аура +18% урона и +20% вампиризма усиливает физический пик команды.",
      "reason_en": "The +18% damage and +20% lifesteal aura amplifies your team's physical lineup."
    }
  ],
  "magic_ally_boost_items": [
    {
      "item_key": "veil_of_discord",
      "bonus": 13,
      "reason_uk": "У команді сильні магічні кори — Veil of Discord (+10% магічної шкоди по ворогах) посилить увесь прокаст союзників.",
      "reason_ru": "В команде сильные магические коры — Veil of Discord (+10% магического урона по врагам) усилит весь прокаст союзников.",
      "reason_en": "Your team has strong magic cores — Veil of Discord (+10% spell damage taken by enemies) will amplify all allied spell burst."
    },
    {
      "item_key": "kaya_and_sange",
      "bonus": 11,
      "reason_uk": "Синергія з магічним драфтом команди через підвищення шкоди від здібностей та сустейну.",
      "reason_ru": "Синергия с магическим драфтом команды через повышение урона от способностей и сустейна.",
      "reason_en": "Synergizes with your magic draft by boosting spell damage and sustain."
    }
  ]
};

const FLEX_SUPPORT_MATRIX = {
  "suppress_farm_items": [
    "bfury",
    "manta",
    "greater_crit",
    "armlet",
    "radiance",
    "skadi",
    "silver_edge",
    "mjollnir",
    "monkey_king_bar",
    "nullifier",
    "bloodthorn",
    "satanic",
    "butterfly",
    "disperser",
    "diffusal_blade",
    "abyssal_blade"
  ],
  "hero_builds": {
    "life_stealer": {
      "suppress_extra": [
        "black_king_bar"
      ],
      "recommended_items": [
        {
          "item_key": "phase_boots",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Темпові чоботи для швидкого розгону та виходу на позицію під Open Wounds.",
          "reason_ru": "Темповые сапоги для быстрого разгона и выхода на позицию под Open Wounds.",
          "reason_en": "Tempo boots for closing the gap and getting in position for Open Wounds."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 18,
          "priority": "critical",
          "reason_uk": "Lifestealer Pos 4/5: підсилює союзного кору перед вльотом в Infest.",
          "reason_ru": "Lifestealer Pos 4/5: усиливает союзного кора перед влетом в Infest.",
          "reason_en": "Lifestealer Pos 4/5: buffs your allied core before jumping in with Infest."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Знімає контроль із союзників та ідеально доповнює утиліті-роль.",
          "reason_ru": "Снимает контроль с союзников и идеально дополняет утилити-роль.",
          "reason_en": "Dispels disables on allies and fits a utility support role."
        },
        {
          "item_key": "force_staff",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Мобільність і порятунок союзних корів після виходу з Infest.",
          "reason_ru": "Мобильность и спасение союзных коров после выхода из Infest.",
          "reason_en": "Mobility and ally save after popping out of Infest."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 17,
          "priority": "critical",
          "reason_uk": "Aghanim дозволяє залізти в союзника або ворога на лікування/дизарм з малим КД.",
          "reason_ru": "Aghanim позволяет залезть в союзника или врага на лечение/дизарм с малым КД.",
          "reason_en": "Aghanim's Scepter lets you Infest allies or enemies to heal or disarm on a short cooldown."
        }
      ]
    },
    "weaver": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "spirit_vessel",
          "score_bonus": 17,
          "priority": "critical",
          "reason_uk": "Weaver Pos 4/5: агресивний роумінг через Shukuchi легко набирає заряди Vessel.",
          "reason_ru": "Weaver Pos 4/5: агрессивный роуминг через Shukuchi легко набирает заряды Vessel.",
          "reason_en": "Weaver Pos 4/5: aggressive roaming with Shukuchi easily collects Spirit Vessel charges."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "У комбінації зі Swarm (-броня) перетворює вашого кору на машину.",
          "reason_ru": "В комбинации со Swarm (-броня) превращает вашего кора в машину.",
          "reason_en": "Combined with The Swarm's armor reduction, turns your core into a powerhouse."
        },
        {
          "item_key": "force_staff",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Додатковий командний сейв поза Shukuchi.",
          "reason_ru": "Дополнительный командный сейв вне Shukuchi.",
          "reason_en": "Additional team save outside of Shukuchi."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Знімає точкові загрози та дозволяє безпечно реалізувати Aghanim.",
          "reason_ru": "Снимает точечные угрозы и позволяет безопасно реализовать Aghanim.",
          "reason_en": "Dispels single-target threats and lets you safely get off Aghanim's Time Lapse."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 17,
          "priority": "critical",
          "reason_uk": "Aghanim дає змогу повертати союзника у часі (Time Lapse), рятуючи від смерті.",
          "reason_ru": "Aghanim позволяет возвращать союзника во времени (Time Lapse), спасая от смерти.",
          "reason_en": "Aghanim's Scepter lets you cast Time Lapse on allies, saving them from lethal damage."
        }
      ]
    },
    "sven": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "force_staff",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Sven Pos 4/5: мобільність для влучання Storm Hammer та сейву команди.",
          "reason_ru": "Sven Pos 4/5: мобильность для попадания Storm Hammer и сейва команды.",
          "reason_en": "Sven Pos 4/5: mobility for landing Storm Hammer and saving allies."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "У поєднанні з Warcry робить союзного керрі практично невразливим до фіз-шкоди.",
          "reason_ru": "В сочетании с Warcry делает союзного керри практически неуязвимым к физ-урону.",
          "reason_en": "Combined with Warcry, makes your allied carry nearly immune to physical damage."
        },
        {
          "item_key": "glimmer_cape",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Швидкий командний сейв і позиціонування для стану.",
          "reason_ru": "Быстрый командный сейв и позиционирование для стана.",
          "reason_en": "Quick team save and positioning tool for landing stuns."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Додатковий захист фронтового кору та диспел.",
          "reason_ru": "Дополнительная защита фронтового кора и диспел.",
          "reason_en": "Extra frontline core protection and dispel."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Перетворює Storm Hammer на дальній політ із диспелом ворожих сейвів.",
          "reason_ru": "Превращает Storm Hammer в дальний полет с диспелом вражеских сейвов.",
          "reason_en": "Turns Storm Hammer into a long-range gap-closer that dispels enemy buffs."
        }
      ]
    },
    "muerta": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "force_staff",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Muerta Pos 4/5: дає мобільність та допомагає реалізовувати Dead Shot / The Calling.",
          "reason_ru": "Muerta Pos 4/5: дает мобильность и помогает реализовывать Dead Shot / The Calling.",
          "reason_en": "Muerta Pos 4/5: provides mobility and helps set up Dead Shot / The Calling."
        },
        {
          "item_key": "glimmer_cape",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Надійний сапорт-сейв із низьким бюджетом.",
          "reason_ru": "Надежный саппорт-сейв с низким бюджетом.",
          "reason_en": "Reliable budget support save."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Захищає кору та розганяє темп пушу.",
          "reason_ru": "Защищает кора и разгоняет темп пуша.",
          "reason_en": "Protects your core and accelerates push tempo."
        },
        {
          "item_key": "cyclone",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Додатковий контроль і комбінація під The Calling.",
          "reason_ru": "Дополнительный контроль и комбинация под The Calling.",
          "reason_en": "Extra lockdown to combo into The Calling."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Aghanim додає Parting Shot для контролю та виключення ворожого героя.",
          "reason_ru": "Aghanim добавляет Parting Shot для контроля и выключения вражеского героя.",
          "reason_en": "Aghanim's Scepter adds Parting Shot for reliable lockdown and isolating an enemy hero."
        }
      ]
    },
    "gyrocopter": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "force_staff",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Gyro Pos 4/5: мобільність для підтримки та сейву союзників.",
          "reason_ru": "Gyro Pos 4/5: мобильность для поддержки и сейва союзников.",
          "reason_en": "Gyro Pos 4/5: mobility for supporting and saving allies."
        },
        {
          "item_key": "glimmer_cape",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Базовий сапорт-сейв при ранній агресії.",
          "reason_ru": "Базовый саппорт-сейв при ранней агрессии.",
          "reason_en": "Core support save for early aggression."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Посилює союзного керрі в командній бійці.",
          "reason_ru": "Усиливает союзного керри в командной драке.",
          "reason_en": "Buffs your allied carry in teamfights."
        },
        {
          "item_key": "spirit_vessel",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Добре набирає заряди за рахунок Call Down і Rocket Barrage.",
          "reason_ru": "Хорошо набирает заряды за счет Call Down и Rocket Barrage.",
          "reason_en": "Easily collects charges through early skirmishes with Call Down and Rocket Barrage."
        }
      ]
    },
    "chaos_knight": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "solar_crest",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "CK Pos 4/5: зріз броні Reality Rift + баф на свого кору.",
          "reason_ru": "CK Pos 4/5: срез брони Reality Rift + бафф на своего кора.",
          "reason_en": "CK Pos 4/5: Reality Rift armor reduction paired with a buff on your core."
        },
        {
          "item_key": "force_staff",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Дозволяє вибратися після ініціації Reality Rift або засейвити союзника.",
          "reason_ru": "Позволяет выбраться после инициации Reality Rift или засейвить союзника.",
          "reason_en": "Lets you disengage after initiating with Reality Rift or save an ally."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Броня та диспел для агресивного сапорта.",
          "reason_ru": "Броня и диспел для агрессивного саппорта.",
          "reason_en": "Armor and dispel for an aggressive support."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Phantasm створює ілюзію кожного союзника та знімає дебафи.",
          "reason_ru": "Phantasm создает иллюзию каждого союзника и снимает дебаффы.",
          "reason_en": "Phantasm creates illusions of all allied heroes globally and dispels debuffs."
        }
      ]
    },
    "skeleton_king": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "solar_crest",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "WK Pos 4/5: прикриває союзного кору щитом, поки сам вбирає фокус із Reincarnation.",
          "reason_ru": "WK Pos 4/5: прикрывает союзного кора щитом, пока сам впитывает фокус с Reincarnation.",
          "reason_en": "WK Pos 4/5: shields your allied core while soaking focus fire with Reincarnation."
        },
        {
          "item_key": "force_staff",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Рятує беклайн та дозволяє позиційно давати Wraithfire Blast.",
          "reason_ru": "Спасает бэклайн и позволяет позиционно давать Wraithfire Blast.",
          "reason_en": "Saves the backline and helps position for Wraithfire Blast."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Знімає контроль із корів, поки ви стоїте на фронті.",
          "reason_ru": "Снимает контроль с коров, пока вы стоите на фронте.",
          "reason_en": "Dispels disables on your cores while you frontline."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Духи союзників продовжують битися після смерті протягом 7 секунд.",
          "reason_ru": "Духи союзников продолжают биться после смерти в течение 7 секунд.",
          "reason_en": "Allied heroes continue fighting as wraiths for 7 seconds after dying."
        }
      ]
    },
    "monkey_king": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "solar_crest",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "MK Pos 4/5: підсилює кору після розвідки по деревах.",
          "reason_ru": "MK Pos 4/5: усиливает кора после разведки по деревьям.",
          "reason_en": "MK Pos 4/5: buffs your core while scouting from the trees."
        },
        {
          "item_key": "spirit_vessel",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Ідеальний слот для роумінгу з Tree Dance.",
          "reason_ru": "Идеальный слот для роуминга с Tree Dance.",
          "reason_en": "Ideal item for aggressive roaming with Tree Dance."
        },
        {
          "item_key": "force_staff",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Додатковий ескейп та сейв для команди.",
          "reason_ru": "Дополнительный эскейп и сейв для команды.",
          "reason_en": "Extra escape and save tool for the team."
        },
        {
          "item_key": "cyclone",
          "score_bonus": 13,
          "priority": "recommended",
          "reason_uk": "Безпечний диспел та контроль у Wukong's Command.",
          "reason_ru": "Безопасный диспел и контроль в Wukong's Command.",
          "reason_en": "Safe dispel and spell reflection while fighting around Wukong's Command."
        }
      ]
    },
    "windrunner": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "force_staff",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "WR Pos 4/5: мобільність для ідеального кута Shackleshot та сейву команди.",
          "reason_ru": "WR Pos 4/5: мобильность для идеального угла Shackleshot и сейва команды.",
          "reason_en": "WR Pos 4/5: mobility to line up the perfect Shackleshot angle and save allies."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Підсилює союзного керрі та додає виживаності в ротації.",
          "reason_ru": "Усиливает союзного керри и добавляет выживаемости в ротации.",
          "reason_en": "Buffs your allied carry and adds survivability during rotations."
        },
        {
          "item_key": "cyclone",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Сетап під гарантований Shackleshot і базовий диспел.",
          "reason_ru": "Сетап под гарантированный Shackleshot и базовый диспел.",
          "reason_en": "Sets up a guaranteed Shackleshot and provides a Basic Dispel."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Знімає дебафи з корів у затяжному файті.",
          "reason_ru": "Снимает дебаффы с коров в затяжном файте.",
          "reason_en": "Dispels debuffs on cores in extended fights."
        }
      ]
    },
    "sniper": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "force_staff",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Sniper Pos 4/5: позиціонування та виштовхування союзників із-під фокусу.",
          "reason_ru": "Sniper Pos 4/5: позиционирование и выталкивание союзников из-под фокуса.",
          "reason_en": "Sniper Pos 4/5: positioning and pushing allies out of enemy focus."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Командна утилітарність після спаму Shrapnel.",
          "reason_ru": "Командная утилитарность после спама Shrapnel.",
          "reason_en": "Team utility while zoning from afar with Shrapnel."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Швидкий стан Assassinate з мінімальним каст-таймом для контролю.",
          "reason_ru": "Быстрый стан Assassinate с минимальным каст-таймом для контроля.",
          "reason_en": "Fast-cast Assassinate stun for long-range lockdown."
        },
        {
          "item_key": "glimmer_cape",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Сейв союзників і захист на беклайні.",
          "reason_ru": "Сейв союзников и защита на бэклайне.",
          "reason_en": "Ally save and backline protection."
        }
      ]
    },
    "luna": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "force_staff",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Luna Pos 4/5: мобільність для видачі Lucent Beam і сейву команди.",
          "reason_ru": "Luna Pos 4/5: мобильность для выдачи Lucent Beam и сейва команды.",
          "reason_en": "Luna Pos 4/5: mobility for casting Lucent Beam and saving allies."
        },
        {
          "item_key": "glimmer_cape",
          "score_bonus": 15,
          "priority": "critical",
          "reason_uk": "Дозволяє безпечно кастувати Eclipse у невидимості та рятувати союзників.",
          "reason_ru": "Позволяет безопасно кастовать Eclipse в невидимости и спасать союзников.",
          "reason_en": "Lets you safely cast Eclipse while invisible and save allies."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Поєднується з аурою Lunar Blessing для розгону вашого Pos 1.",
          "reason_ru": "Сочетается с аурой Lunar Blessing для разгона вашего Pos 1.",
          "reason_en": "Pairs with Lunar Blessing aura to supercharge your Pos 1."
        },
        {
          "item_key": "ultimate_scepter",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Дозволяє кастувати Eclipse на точку або союзного ініціатора.",
          "reason_ru": "Позволяет кастовать Eclipse на точку или союзного инициатора.",
          "reason_en": "Allows casting Eclipse on a target area or an allied initiator."
        }
      ]
    },
    "furion": {
      "suppress_extra": [],
      "recommended_items": [
        {
          "item_key": "spirit_vessel",
          "score_bonus": 17,
          "priority": "critical",
          "reason_uk": "Nature's Prophet Pos 4/5: прилітає в будь-яку бійку через Teleportation і одразу набирає заряди Vessel.",
          "reason_ru": "Nature's Prophet Pos 4/5: прилетает в любую драку через Teleportation и сразу набирает заряды Vessel.",
          "reason_en": "Nature's Prophet Pos 4/5: teleports into any fight globally and immediately collects Spirit Vessel charges."
        },
        {
          "item_key": "solar_crest",
          "score_bonus": 16,
          "priority": "critical",
          "reason_uk": "Миттєва допомога щитом у глобальних ганках.",
          "reason_ru": "Мгновенная помощь щитом в глобальных ганках.",
          "reason_en": "Instant barrier support during global ganks."
        },
        {
          "item_key": "force_staff",
          "score_bonus": 15,
          "priority": "recommended",
          "reason_uk": "Командний сейв після фіксації ворога у Sprout.",
          "reason_ru": "Командный сейв после фиксации врага в Sprout.",
          "reason_en": "Team save and utility alongside Sprout lockdown."
        },
        {
          "item_key": "lotus_orb",
          "score_bonus": 14,
          "priority": "recommended",
          "reason_uk": "Захищає корів при активному спліт-тиску.",
          "reason_ru": "Защищает коров при активном сплит-давлении.",
          "reason_en": "Protects cores while applying map pressure."
        }
      ]
    }
  }
};

const ENEMY_ITEM_TRIGGERS = {
  "butterfly": {
    "name_en": "Butterfly",
    "counters": [
      {
        "item_key": "monkey_king_bar",
        "bonus": 20,
        "force_priority": "critical",
        "reason_uk": "У ворога зʼявився Butterfly (+35% ухилення) — MKB стає критично необхідним.",
        "reason_ru": "У врага появился Butterfly (+35% уклонения) — MKB становится критически необходимым.",
        "reason_en": "The enemy has Butterfly (+35% evasion) — MKB becomes critically necessary."
      },
      {
        "item_key": "bloodthorn",
        "bonus": 12,
        "force_priority": "recommended",
        "reason_uk": "Дає True Strike по цілі з Butterfly на час дії сайленсу.",
        "reason_ru": "Дает True Strike по цели с Butterfly на время действия сайленса.",
        "reason_en": "Grants True Strike against a target with Butterfly for the duration of the silence."
      }
    ]
  },
  "orchid": {
    "name_en": "Orchid Malevolence",
    "counters": [
      {
        "item_key": "cyclone",
        "bonus": 14,
        "force_priority": "critical",
        "reason_uk": "Дешевий диспел від купленого ворогом Orchid Malevolence.",
        "reason_ru": "Дешевый диспел от купленного врагом Orchid Malevolence.",
        "reason_en": "Cost-effective self-dispel against an enemy Orchid Malevolence."
      },
      {
        "item_key": "manta",
        "bonus": 15,
        "force_priority": "critical",
        "reason_uk": "Знімає Soul Burn від ворожого Orchid при активації.",
        "reason_ru": "Снимает Soul Burn от вражеского Orchid при активации.",
        "reason_en": "Dispels Soul Burn from an enemy Orchid upon activation."
      },
      {
        "item_key": "lotus_orb",
        "bonus": 13,
        "force_priority": "critical",
        "reason_uk": "Знімає сайленс Orchid із себе або союзного кору.",
        "reason_ru": "Снимает сайленс Orchid с себя или союзного кора.",
        "reason_en": "Dispels Orchid silence from yourself or an allied core."
      },
      {
        "item_key": "black_king_bar",
        "bonus": 11,
        "force_priority": "critical",
        "reason_uk": "Скидає Orchid і не дає зафіксувати у фокусі.",
        "reason_ru": "Сбрасывает Orchid и не дает зафиксировать в фокусе.",
        "reason_en": "Dispels Orchid and prevents getting burst down under silence."
      }
    ]
  },
  "bloodthorn": {
    "name_en": "Bloodthorn",
    "counters": [
      {
        "item_key": "cyclone",
        "bonus": 15,
        "force_priority": "critical",
        "reason_uk": "Знімає смертельний сайленс Bloodthorn до накопичення шкоди.",
        "reason_ru": "Снимает смертельный сайленс Bloodthorn до накопления урона.",
        "reason_en": "Dispels lethal Bloodthorn silence before damage accumulates."
      },
      {
        "item_key": "manta",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "Миттєво очищує Soul Rend від ворожого Bloodthorn.",
        "reason_ru": "Мгновенно очищает Soul Rend от вражеского Bloodthorn.",
        "reason_en": "Instantly dispels Soul Rend from an enemy Bloodthorn."
      },
      {
        "item_key": "lotus_orb",
        "bonus": 15,
        "force_priority": "critical",
        "reason_uk": "Рятує союзників від вибухової шкоди Bloodthorn.",
        "reason_ru": "Спасает союзников от взрывного урона Bloodthorn.",
        "reason_en": "Saves allies from Bloodthorn burst damage."
      },
      {
        "item_key": "black_king_bar",
        "bonus": 13,
        "force_priority": "critical",
        "reason_uk": "Захищає від фокусу під Bloodthorn.",
        "reason_ru": "Защищает от фокуса под Bloodthorn.",
        "reason_en": "Protects against focus fire under Bloodthorn."
      }
    ]
  },
  "blade_mail": {
    "name_en": "Blade Mail",
    "counters": [
      {
        "item_key": "black_king_bar",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "Дає повний імунітет до відбитої шкоди від ворожого Blade Mail.",
        "reason_ru": "Дает полный иммунитет к отраженному урону от вражеского Blade Mail.",
        "reason_en": "Grants complete immunity to reflected damage from an enemy Blade Mail."
      },
      {
        "item_key": "cyclone",
        "bonus": 12,
        "force_priority": "recommended",
        "reason_uk": "Піднімає ворога в повітря, щоб перечекати його Blade Mail.",
        "reason_ru": "Поднимает врага в воздух, чтобы переждать его Blade Mail.",
        "reason_en": "Cyclones the enemy into the air to wait out their Blade Mail."
      }
    ]
  },
  "heart": {
    "name_en": "Heart of Tarrasque",
    "counters": [
      {
        "item_key": "spirit_vessel",
        "bonus": 17,
        "force_priority": "critical",
        "reason_uk": "У ворога Heart of Tarrasque — Vessel ріже реген на 70% і спалює 4% HP/с.",
        "reason_ru": "У врага Heart of Tarrasque — Vessel режет реген на 70% и сжигает 4% HP/с.",
        "reason_en": "The enemy has Heart of Tarrasque — Vessel cuts regen by 70% and burns 4% HP/s."
      },
      {
        "item_key": "skadi",
        "bonus": 15,
        "force_priority": "critical",
        "reason_uk": "Ріже відновлення здоровʼя від Heart на 50%.",
        "reason_ru": "Режет восстановление здоровья от Heart на 50%.",
        "reason_en": "Reduces health regeneration from Heart by 50%."
      },
      {
        "item_key": "shivas_guard",
        "bonus": 9,
        "force_priority": "recommended",
        "reason_uk": "Дає броню та уповільнює просування танка з Heart.",
        "reason_ru": "Дает броню и замедляет продвижение танка с Heart.",
        "reason_en": "Provides armor and slows down a frontliner with Heart."
      }
    ]
  },
  "satanic": {
    "name_en": "Satanic",
    "counters": [
      {
        "item_key": "spirit_vessel",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "Критичний анти-хіл проти 175% вампіризму Satanic.",
        "reason_ru": "Критический анти-хил против 175% вампиризма Satanic.",
        "reason_en": "Critical anti-heal against Satanic's 175% lifesteal."
      },
      {
        "item_key": "skadi",
        "bonus": 15,
        "force_priority": "critical",
        "reason_uk": "Ріже відновлення від Satanic на 50%.",
        "reason_ru": "Режет восстановление от Satanic на 50%.",
        "reason_en": "Cuts lifesteal recovery from Satanic by 50%."
      },
      {
        "item_key": "heavens_halberd",
        "bonus": 11,
        "force_priority": "recommended",
        "reason_uk": "Дизарм не дає ворогу відхілитися під активним Satanic.",
        "reason_ru": "Дизарм не дает врагу отхилиться под активным Satanic.",
        "reason_en": "Disarm prevents the enemy from lifestealing during active Satanic."
      }
    ]
  },
  "glimmer_cape": {
    "name_en": "Glimmer Cape",
    "counters": [
      {
        "item_key": "dust",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "Розкриває ворогів, що ховаються за Glimmer Cape.",
        "reason_ru": "Раскрывает врагов, прячущихся за Glimmer Cape.",
        "reason_en": "Reveals enemies hiding under Glimmer Cape."
      },
      {
        "item_key": "nullifier",
        "bonus": 17,
        "force_priority": "critical",
        "reason_uk": "Безперервно знімає інвіз та барʼєр Glimmer Cape.",
        "reason_ru": "Непрерывно снимает инвиз и барьер Glimmer Cape.",
        "reason_en": "Continuously dispels the invisibility and barrier of Glimmer Cape."
      },
      {
        "item_key": "ward_sentry",
        "bonus": 11,
        "force_priority": "recommended",
        "reason_uk": "Забезпечує True Sight у бійці проти Glimmer.",
        "reason_ru": "Обеспечивает True Sight в драке против Glimmer.",
        "reason_en": "Provides True Sight in fights against Glimmer Cape."
      }
    ]
  },
  "invis_sword": {
    "name_en": "Shadow Blade",
    "counters": [
      {
        "item_key": "dust",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "Ловить ворога з купленим Shadow Blade під час ініціації або втечі.",
        "reason_ru": "Ловит врага с купленным Shadow Blade во время инициации или побега.",
        "reason_en": "Catches enemies using Shadow Blade to initiate or escape."
      },
      {
        "item_key": "ward_sentry",
        "bonus": 13,
        "force_priority": "recommended",
        "reason_uk": "Захищає фланги та обʼєкти від виходу з Shadow Blade.",
        "reason_ru": "Защищает фланги и объекты от выхода из Shadow Blade.",
        "reason_en": "Protects flanks and objectives against Shadow Blade ganks."
      },
      {
        "item_key": "gem",
        "bonus": 10,
        "force_priority": "recommended",
        "reason_uk": "Надійний постійний контроль невидимості на карті.",
        "reason_ru": "Надежный постоянный контроль невидимости на карте.",
        "reason_en": "Reliable permanent invisibility detection across the map."
      }
    ]
  },
  "silver_edge": {
    "name_en": "Silver Edge",
    "counters": [
      {
        "item_key": "dust",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "Виявляє ініціацію з ворожого Silver Edge.",
        "reason_ru": "Выявляет инициацию с вражеского Silver Edge.",
        "reason_en": "Reveals enemy initiation from Silver Edge."
      },
      {
        "item_key": "ward_sentry",
        "bonus": 13,
        "force_priority": "recommended",
        "reason_uk": "Не дає ворогу непомітно підійти під Silver Edge.",
        "reason_ru": "Не дает врагу незаметно подойти под Silver Edge.",
        "reason_en": "Prevents enemies from sneaking up with Silver Edge."
      }
    ]
  },
  "ghost": {
    "name_en": "Ghost Scepter",
    "counters": [
      {
        "item_key": "nullifier",
        "bonus": 17,
        "force_priority": "critical",
        "reason_uk": "Миттєво знімає Ghost Form, дозволяючи добити сапорта з руки.",
        "reason_ru": "Мгновенно снимает Ghost Form, позволяя добить саппорта с руки.",
        "reason_en": "Instantly dispels Ghost Form, allowing right-clickers to finish off the support."
      }
    ]
  },
  "ethereal_blade": {
    "name_en": "Ethereal Blade",
    "counters": [
      {
        "item_key": "nullifier",
        "bonus": 17,
        "force_priority": "critical",
        "reason_uk": "Знімає безтілесний сейв Ethereal Blade із ворога.",
        "reason_ru": "Снимает бесплотный сейв Ethereal Blade с врага.",
        "reason_en": "Dispels the ethereal save of Ethereal Blade from an enemy."
      },
      {
        "item_key": "black_king_bar",
        "bonus": 11,
        "force_priority": "recommended",
        "reason_uk": "Захищає від магічного прокасту під Ethereal Blade.",
        "reason_ru": "Защищает от магического прокаста под Ethereal Blade.",
        "reason_en": "Protects against magic burst amplified by Ethereal Blade."
      }
    ]
  },
  "aeon_disk": {
    "name_en": "Aeon Disk",
    "counters": [
      {
        "item_key": "nullifier",
        "bonus": 18,
        "force_priority": "critical",
        "reason_uk": "Миттєво розвіює щит Combo Breaker від Aeon Disk.",
        "reason_ru": "Мгновенно развеивает щит Combo Breaker от Aeon Disk.",
        "reason_en": "Instantly dispels the Combo Breaker buff from Aeon Disk."
      }
    ]
  },
  "radiance": {
    "name_en": "Radiance",
    "counters": [
      {
        "item_key": "monkey_king_bar",
        "bonus": 13,
        "force_priority": "recommended",
        "reason_uk": "Компенсує ауру промахів від ворожого Radiance.",
        "reason_ru": "Компенсирует ауру промахов от вражеского Radiance.",
        "reason_en": "Counters the miss chance aura from an enemy Radiance."
      },
      {
        "item_key": "pipe",
        "bonus": 10,
        "force_priority": "recommended",
        "reason_uk": "Поглинає постійне горіння Radiance по команді.",
        "reason_ru": "Поглощает постоянное горение Radiance по команде.",
        "reason_en": "Absorbs the constant Radiance burn damage for the team."
      }
    ]
  },
  "black_king_bar": {
    "name_en": "Black King Bar",
    "counters": [
      {
        "item_key": "abyssal_blade",
        "bonus": 16,
        "force_priority": "critical",
        "reason_uk": "У ворога зʼявився BKB — активний стан Abyssal Blade пробиває Debuff Immunity.",
        "reason_ru": "У врага появился BKB — активный стан Abyssal Blade пробивает Debuff Immunity.",
        "reason_en": "The enemy has BKB — Abyssal Blade's active stun pierces Debuff Immunity."
      },
      {
        "item_key": "force_staff",
        "bonus": 12,
        "force_priority": "recommended",
        "reason_uk": "Допомагає відкайтити час дії ворожого BKB.",
        "reason_ru": "Помогает откайтить время действия вражеского BKB.",
        "reason_en": "Helps kite out the duration of an enemy BKB."
      },
      {
        "item_key": "ghost",
        "bonus": 12,
        "force_priority": "recommended",
        "reason_uk": "Дозволяє сапорту пережити фізичний фокус під ворожим BKB.",
        "reason_ru": "Позволяет саппорту пережить физический фокус под вражеским BKB.",
        "reason_en": "Allows a support to survive physical focus during an enemy BKB."
      }
    ]
  },
  "sphere": {
    "name_en": "Linken's Sphere",
    "counters": [
      {
        "item_key": "force_staff",
        "bonus": 13,
        "force_priority": "recommended",
        "reason_uk": "Дешево збиває ворожу Linken's Sphere з великої дистанції перед головним контролем.",
        "reason_ru": "Дешево сбивает вражескую Linken's Sphere с большой дистанции перед главным контролем.",
        "reason_en": "Cheaply pops an enemy Linken's Sphere from long range before main lockdown."
      },
      {
        "item_key": "heavens_halberd",
        "bonus": 13,
        "force_priority": "recommended",
        "reason_uk": "Надійно збиває Linken's Sphere або обеззброює ціль після її пробиття.",
        "reason_ru": "Надежно сбивает Linken's Sphere или обезоруживает цель после ее пробития.",
        "reason_en": "Reliably pops Linken's Sphere or disarms the target once Spellblock is broken."
      },
      {
        "item_key": "cyclone",
        "bonus": 12,
        "force_priority": "recommended",
        "reason_uk": "Миттєво знімає Spellblock із ворога перед видачею стану/хексу.",
        "reason_ru": "Мгновенно снимает Spellblock с врага перед выдачей стана/хекса.",
        "reason_en": "Instantly breaks Spellblock on an enemy before following up with a stun or hex."
      },
      {
        "item_key": "rod_of_atos",
        "bonus": 12,
        "force_priority": "recommended",
        "reason_uk": "Дальній каст Cripple легко збиває Linken's Sphere.",
        "reason_ru": "Дальний каст Cripple легко сбивает Linken's Sphere.",
        "reason_en": "Long-range Cripple cast easily pops Linken's Sphere."
      }
    ]
  },
  "wind_waker": {
    "name_en": "Wind Waker",
    "counters": [
      {
        "item_key": "nullifier",
        "bonus": 18,
        "force_priority": "critical",
        "reason_uk": "Миттєво приземляє ціль із торнадо Wind Waker і не дає їй відлетіти.",
        "reason_ru": "Мгновенно приземляет цель из торнадо Wind Waker и не дает ей улететь.",
        "reason_en": "Instantly grounds a target out of Wind Waker's cyclone and stops them from flying away."
      }
    ]
  }
};

const ENEMY_META_ITEM_PROFILES = {
  "butterfly": {
    "item_key": "butterfly",
    "label_uk": "Типовий носій Butterfly (35% ухилення)",
    "heroes": [
      "antimage",
      "luna",
      "medusa",
      "morphling",
      "terrorblade",
      "naga_siren",
      "phantom_lancer",
      "drow_ranger",
      "juggernaut",
      "slark",
      "faceless_void",
      "gyrocopter",
      "monkey_king",
      "weaver",
      "troll_warlord",
      "sniper",
      "meepo",
      "arc_warden",
      "phantom_assassin",
      "templar_assassin"
    ],
    "proactive_counters": [
      {
        "item_key": "monkey_king_bar",
        "bonus": 6,
        "reason_uk": "Герой зазвичай виходить у Butterfly — MKB перекриє майбутні 35% ухилення.",
        "reason_ru": "Герой обычно выходит в Butterfly — MKB перекроет будущие 35% уклонения.",
        "reason_en": "This hero typically builds Butterfly — MKB will counter their upcoming 35% evasion."
      },
      {
        "item_key": "bloodthorn",
        "bonus": 4,
        "reason_uk": "True Strike під сайленсом контрить типовий Butterfly.",
        "reason_ru": "True Strike под сайленсом контрит типичный Butterfly.",
        "reason_en": "True Strike during silence counters a typical Butterfly pickup."
      }
    ],
    "label_ru": "Типичный носитель Butterfly (35% уклонения)",
    "label_en": "Typical Butterfly builder (35% evasion)"
  },
  "orchid_bloodthorn": {
    "item_key": "orchid",
    "label_uk": "Типовий носій Orchid / Bloodthorn",
    "heroes": [
      "storm_spirit",
      "queenofpain",
      "clinkz",
      "puck",
      "void_spirit",
      "ember_spirit",
      "invoker",
      "furion",
      "broodmother",
      "windrunner",
      "spectre",
      "arc_warden",
      "bounty_hunter",
      "nyx_assassin",
      "visage",
      "kez"
    ],
    "proactive_counters": [
      {
        "item_key": "manta",
        "bonus": 5,
        "reason_uk": "Ворог часто купує ранній Orchid/Bloodthorn — Manta дасть надійне скидання сайленсу.",
        "reason_ru": "Враг часто покупает ранний Orchid/Bloodthorn — Manta даст надежное сбрасывание сайленса.",
        "reason_en": "This hero often buys an early Orchid/Bloodthorn — Manta provides a reliable silence dispel."
      },
      {
        "item_key": "cyclone",
        "bonus": 5,
        "reason_uk": "Дешевий само-диспел проти типового Orchid від цього героя.",
        "reason_ru": "Дешевый само-диспел против типичного Orchid от этого героя.",
        "reason_en": "Cost-effective self-dispel against a typical Orchid from this hero."
      },
      {
        "item_key": "lotus_orb",
        "bonus": 5,
        "reason_uk": "Знімає з союзників типовий Orchid/Bloodthorn.",
        "reason_ru": "Снимает с союзников типичный Orchid/Bloodthorn.",
        "reason_en": "Dispels a typical Orchid/Bloodthorn from allies."
      }
    ],
    "label_ru": "Типичный носитель Orchid / Bloodthorn",
    "label_en": "Typical Orchid / Bloodthorn builder"
  },
  "black_king_bar": {
    "item_key": "black_king_bar",
    "label_uk": "Стандартний носій BKB",
    "heroes": [
      "phantom_assassin",
      "sven",
      "ursa",
      "luna",
      "gyrocopter",
      "nevermore",
      "troll_warlord",
      "faceless_void",
      "dragon_knight",
      "templar_assassin",
      "drow_ranger",
      "marci",
      "monkey_king",
      "muerta",
      "leshrac",
      "storm_spirit",
      "queenofpain",
      "enigma",
      "crystal_maiden",
      "witch_doctor",
      "dawnbreaker",
      "legion_commander",
      "mars",
      "primal_beast",
      "huskar",
      "razor",
      "death_prophet",
      "kez"
    ],
    "proactive_counters": [
      {
        "item_key": "abyssal_blade",
        "bonus": 5,
        "reason_uk": "Активний стан Overwhelm пробиває стандартний BKB ворожого кору.",
        "reason_ru": "Активный стан Overwhelm пробивает стандартный BKB вражеского кора.",
        "reason_en": "Active Overwhelm stun pierces the enemy core's standard BKB."
      },
      {
        "item_key": "force_staff",
        "bonus": 4,
        "reason_uk": "Дозволяє кайтити ворога під час дії його BKB.",
        "reason_ru": "Позволяет кайтить врага во время действия его BKB.",
        "reason_en": "Allows kiting the enemy during their BKB duration."
      }
    ],
    "label_ru": "Стандартный носитель BKB",
    "label_en": "Standard BKB builder"
  },
  "heart_satanic": {
    "item_key": "satanic",
    "label_uk": "Типовий носій Heart / Satanic",
    "heroes": [
      "centaur",
      "pudge",
      "spectre",
      "bristleback",
      "alchemist",
      "huskar",
      "chaos_knight",
      "phantom_lancer",
      "naga_siren",
      "primal_beast",
      "kunkka",
      "abyssal_underlord",
      "tidehunter",
      "dragon_knight",
      "sven",
      "luna",
      "gyrocopter",
      "terrorblade",
      "troll_warlord",
      "ursa",
      "monkey_king",
      "morphling",
      "skeleton_king",
      "life_stealer",
      "doom_bringer"
    ],
    "proactive_counters": [
      {
        "item_key": "spirit_vessel",
        "bonus": 5,
        "reason_uk": "Герой зазвичай купує Satanic або Heart — анти-хіл критичний.",
        "reason_ru": "Герой обычно покупает Satanic или Heart — анти-хил критичен.",
        "reason_en": "This hero usually buys Satanic or Heart — anti-heal is critical."
      },
      {
        "item_key": "skadi",
        "bonus": 5,
        "reason_uk": "Ріже 50% відновлення від типового Satanic/Heart.",
        "reason_ru": "Режет 50% восстановления от типичного Satanic/Heart.",
        "reason_en": "Cuts 50% of regeneration and lifesteal from a typical Satanic/Heart."
      },
      {
        "item_key": "crellas_crozier",
        "bonus": 5,
        "reason_uk": "Аура -30%/-90% відновлення HP контрить Satanic та Heart.",
        "reason_ru": "Аура -30%/-90% восстановления HP контрит Satanic и Heart.",
        "reason_en": "The -30%/-90% health restoration aura counters Satanic and Heart."
      }
    ],
    "label_ru": "Типичный носитель Heart / Satanic",
    "label_en": "Typical Heart / Satanic builder"
  },
  "shadow_blade_glimmer": {
    "item_key": "invis_sword",
    "label_uk": "Типовий носій Shadow Blade / Silver Edge / Glimmer Cape",
    "heroes": [
      "slark",
      "sniper",
      "drow_ranger",
      "nevermore",
      "dragon_knight",
      "legion_commander",
      "alchemist",
      "tiny",
      "tusk",
      "kunkka",
      "spirit_breaker",
      "lina",
      "furion",
      "magnataur",
      "kez",
      "crystal_maiden",
      "witch_doctor",
      "lion",
      "shadow_shaman",
      "oracle",
      "dazzle",
      "bane",
      "lich",
      "jakiro",
      "disruptor",
      "winter_wyvern",
      "warlock",
      "silencer",
      "rubick",
      "grimstroke",
      "ringmaster",
      "largo"
    ],
    "proactive_counters": [
      {
        "item_key": "dust",
        "bonus": 5,
        "reason_uk": "Герой майже завжди виходить у Shadow Blade/Silver Edge або Glimmer Cape.",
        "reason_ru": "Герой почти всегда выходит в Shadow Blade/Silver Edge или Glimmer Cape.",
        "reason_en": "This hero almost always builds Shadow Blade/Silver Edge or Glimmer Cape."
      },
      {
        "item_key": "nullifier",
        "bonus": 4,
        "reason_uk": "Знімає Glimmer Cape та сейв-бафи сапорта.",
        "reason_ru": "Снимает Glimmer Cape и сейв-баффы саппорта.",
        "reason_en": "Dispels Glimmer Cape and support save buffs."
      }
    ],
    "label_ru": "Типичный носитель Shadow Blade / Silver Edge / Glimmer Cape",
    "label_en": "Typical Shadow Blade / Silver Edge / Glimmer Cape builder"
  },
  "blade_mail": {
    "item_key": "blade_mail",
    "label_uk": "Типовий носій Blade Mail",
    "heroes": [
      "axe",
      "legion_commander",
      "centaur",
      "spectre",
      "pudge",
      "rattletrap",
      "primal_beast",
      "kunkka",
      "bristleback",
      "huskar",
      "earth_spirit",
      "ember_spirit",
      "queenofpain",
      "necrolyte",
      "skeleton_king",
      "undying",
      "mars"
    ],
    "proactive_counters": [
      {
        "item_key": "black_king_bar",
        "bonus": 6,
        "reason_uk": "Дає 100% імунітет до відбитої шкоди від типового Blade Mail цього героя.",
        "reason_ru": "Дает 100% иммунитет к отраженному урону от типичного Blade Mail этого героя.",
        "reason_en": "Grants 100% immunity to reflected damage from this hero's typical Blade Mail."
      },
      {
        "item_key": "cyclone",
        "bonus": 4,
        "reason_uk": "Дозволяє підняти ворога в повітря й перечекати його Blade Mail.",
        "reason_ru": "Позволяет поднять врага в воздух и переждать его Blade Mail.",
        "reason_en": "Lets you cyclone the enemy into the air and wait out their Blade Mail."
      }
    ],
    "label_ru": "Типичный носитель Blade Mail",
    "label_en": "Typical Blade Mail builder"
  },
  "aeon_disk": {
    "item_key": "aeon_disk",
    "label_uk": "Типовий носій Aeon Disk",
    "heroes": [
      "oracle",
      "dazzle",
      "shadow_demon",
      "silencer",
      "disruptor",
      "enigma",
      "winter_wyvern",
      "warlock",
      "ancient_apparition",
      "bane",
      "rubick",
      "skywrath_mage",
      "keeper_of_the_light",
      "pugna",
      "zuus",
      "sniper",
      "ringmaster"
    ],
    "proactive_counters": [
      {
        "item_key": "nullifier",
        "bonus": 6,
        "reason_uk": "Миттєво розвіює баф Combo Breaker від типового Aeon Disk на цій цілі.",
        "reason_ru": "Мгновенно развеивает бафф Combo Breaker от типичного Aeon Disk на этой цели.",
        "reason_en": "Instantly dispels the Combo Breaker buff from a typical Aeon Disk on this target."
      }
    ],
    "label_ru": "Типичный носитель Aeon Disk",
    "label_en": "Typical Aeon Disk builder"
  }
};

const HERO_META_POSITIONS = {
  "abaddon": [
    5,
    3,
    4
  ],
  "abyssal_underlord": [
    3
  ],
  "alchemist": [
    1,
    3,
    2
  ],
  "ancient_apparition": [
    5,
    4
  ],
  "antimage": [
    1
  ],
  "arc_warden": [
    2,
    1
  ],
  "axe": [
    3
  ],
  "bane": [
    5,
    4
  ],
  "batrider": [
    4,
    3,
    2
  ],
  "beastmaster": [
    3,
    2
  ],
  "bloodseeker": [
    1,
    2,
    3
  ],
  "bounty_hunter": [
    4,
    3,
    5
  ],
  "brewmaster": [
    3
  ],
  "bristleback": [
    3,
    1
  ],
  "broodmother": [
    1,
    2,
    3
  ],
  "centaur": [
    3
  ],
  "chaos_knight": [
    1,
    3,
    4
  ],
  "chen": [
    5,
    4
  ],
  "clinkz": [
    1,
    2,
    4
  ],
  "crystal_maiden": [
    5,
    4
  ],
  "dark_seer": [
    3
  ],
  "dark_willow": [
    4,
    5,
    2
  ],
  "dawnbreaker": [
    3,
    4,
    2
  ],
  "dazzle": [
    5,
    4,
    2
  ],
  "death_prophet": [
    3,
    2,
    5
  ],
  "disruptor": [
    5,
    4
  ],
  "doom_bringer": [
    3,
    1
  ],
  "dragon_knight": [
    1,
    2,
    3
  ],
  "drow_ranger": [
    1
  ],
  "earth_spirit": [
    4,
    2
  ],
  "earthshaker": [
    4,
    2,
    3
  ],
  "elder_titan": [
    5,
    4,
    3
  ],
  "ember_spirit": [
    2
  ],
  "enchantress": [
    5,
    4,
    3
  ],
  "enigma": [
    3,
    4,
    5
  ],
  "faceless_void": [
    1
  ],
  "furion": [
    1,
    4,
    5,
    3
  ],
  "grimstroke": [
    5,
    4
  ],
  "gyrocopter": [
    1,
    4,
    5
  ],
  "hoodwink": [
    4,
    5,
    2
  ],
  "huskar": [
    2,
    3,
    1
  ],
  "invoker": [
    2,
    4
  ],
  "jakiro": [
    5,
    4
  ],
  "juggernaut": [
    1
  ],
  "keeper_of_the_light": [
    2,
    4,
    5
  ],
  "kez": [
    1,
    2
  ],
  "kunkka": [
    2,
    3
  ],
  "largo": [
    5,
    4,
    3
  ],
  "legion_commander": [
    3
  ],
  "leshrac": [
    2,
    3
  ],
  "lich": [
    5,
    4
  ],
  "life_stealer": [
    1,
    4
  ],
  "lina": [
    2,
    1,
    4
  ],
  "lion": [
    4,
    5
  ],
  "lone_druid": [
    1,
    2,
    3
  ],
  "luna": [
    1,
    4
  ],
  "lycan": [
    3,
    1,
    2
  ],
  "magnataur": [
    3,
    2,
    4
  ],
  "marci": [
    4,
    1,
    2,
    3
  ],
  "mars": [
    3,
    2
  ],
  "medusa": [
    1,
    3
  ],
  "meepo": [
    2,
    1
  ],
  "mirana": [
    4,
    5,
    1,
    2
  ],
  "monkey_king": [
    1,
    2,
    4
  ],
  "morphling": [
    1,
    2
  ],
  "muerta": [
    1,
    4,
    5
  ],
  "naga_siren": [
    1,
    4,
    3
  ],
  "necrolyte": [
    2,
    3
  ],
  "nevermore": [
    1,
    2
  ],
  "night_stalker": [
    3
  ],
  "nyx_assassin": [
    4,
    5,
    2
  ],
  "obsidian_destroyer": [
    2
  ],
  "ogre_magi": [
    5,
    4,
    3
  ],
  "omniknight": [
    5,
    3,
    4
  ],
  "oracle": [
    5,
    4
  ],
  "pangolier": [
    2,
    3
  ],
  "phantom_assassin": [
    1
  ],
  "phantom_lancer": [
    1
  ],
  "phoenix": [
    4,
    5,
    3
  ],
  "primal_beast": [
    2,
    3,
    4
  ],
  "puck": [
    2
  ],
  "pudge": [
    4,
    3,
    2,
    1
  ],
  "pugna": [
    4,
    5,
    2
  ],
  "queenofpain": [
    2,
    3
  ],
  "rattletrap": [
    4,
    5,
    3
  ],
  "razor": [
    3,
    2,
    1
  ],
  "riki": [
    1,
    2,
    4
  ],
  "ringmaster": [
    4,
    5
  ],
  "rubick": [
    4,
    2,
    5
  ],
  "sand_king": [
    3,
    2
  ],
  "shadow_demon": [
    5,
    4
  ],
  "shadow_shaman": [
    4,
    5
  ],
  "shredder": [
    2,
    3
  ],
  "silencer": [
    5,
    4,
    2
  ],
  "skeleton_king": [
    1,
    3,
    4
  ],
  "skywrath_mage": [
    4,
    2,
    5
  ],
  "slardar": [
    3,
    2,
    4
  ],
  "slark": [
    1,
    3
  ],
  "snapfire": [
    4,
    5,
    2
  ],
  "sniper": [
    2,
    1,
    4
  ],
  "spectre": [
    1
  ],
  "spirit_breaker": [
    4,
    3
  ],
  "storm_spirit": [
    2
  ],
  "sven": [
    1,
    4,
    3
  ],
  "techies": [
    4,
    5,
    2
  ],
  "templar_assassin": [
    1,
    2
  ],
  "terrorblade": [
    1,
    3
  ],
  "tidehunter": [
    3
  ],
  "tinker": [
    2,
    4,
    5
  ],
  "tiny": [
    2,
    4,
    1,
    3
  ],
  "treant": [
    5,
    4
  ],
  "troll_warlord": [
    1
  ],
  "tusk": [
    4,
    5,
    3
  ],
  "undying": [
    5,
    4,
    3
  ],
  "ursa": [
    1,
    3
  ],
  "vengefulspirit": [
    5,
    4,
    3,
    1
  ],
  "venomancer": [
    4,
    5,
    3
  ],
  "viper": [
    3,
    2
  ],
  "visage": [
    3,
    2,
    4
  ],
  "void_spirit": [
    2
  ],
  "warlock": [
    5,
    4
  ],
  "weaver": [
    1,
    4,
    5
  ],
  "windrunner": [
    1,
    2,
    4
  ],
  "winter_wyvern": [
    5,
    4,
    3
  ],
  "wisp": [
    5,
    4
  ],
  "witch_doctor": [
    5,
    4
  ],
  "zuus": [
    2,
    4,
    5
  ]
};

const HERO_INNATE_REDUNDANT = {
  "viper": [
    {
      "item_key": "silver_edge",
      "reason_uk": "Viper Strike вже накладає Break на пасивки ворога.",
      "reason_ru": "Viper Strike уже накладывает Break на пассивки врага.",
      "reason_en": "Viper Strike already applies Break to enemy passives."
    }
  ],
  "hoodwink": [
    {
      "item_key": "silver_edge",
      "reason_uk": "Sharpshooter вже накладає Break.",
      "reason_ru": "Sharpshooter уже накладывает Break.",
      "reason_en": "Sharpshooter already applies Break."
    }
  ],
  "doom_bringer": [
    {
      "item_key": "silver_edge",
      "reason_uk": "Ульт Doom вже вимикає пасивні здібності (Break).",
      "reason_ru": "Ульт Doom уже отключает пассивные способности (Break).",
      "reason_en": "Doom already disables passive abilities (Break)."
    },
    {
      "item_key": "spirit_vessel",
      "reason_uk": "Doom повністю блокує будь-який хіл цілі.",
      "reason_ru": "Doom полностью блокирует любой хил цели.",
      "reason_en": "Doom completely blocks all healing on the target."
    }
  ],
  "ancient_apparition": [
    {
      "item_key": "spirit_vessel",
      "reason_uk": "Ice Blast вже повністю забороняє лікування ворогів.",
      "reason_ru": "Ice Blast уже полностью запрещает лечение врагов.",
      "reason_en": "Ice Blast already completely prevents enemy healing."
    }
  ],
  "life_stealer": [
    {
      "item_key": "black_king_bar",
      "reason_uk": "Rage дає вбудований імунітет до дебафів і високий магічний опір.",
      "reason_ru": "Rage дает встроенный иммунитет к дебаффам и высокое магическое сопротивление.",
      "reason_en": "Rage provides built-in Debuff Immunity and high magic resistance."
    }
  ],
  "omniknight": [
    {
      "item_key": "black_king_bar",
      "reason_uk": "Repel дає вбудований Debuff Immunity і 60% опору магії.",
      "reason_ru": "Repel дает встроенный Debuff Immunity и 60% сопротивления магии.",
      "reason_en": "Repel grants built-in Debuff Immunity and 60% magic resistance."
    }
  ],
  "antimage": [
    {
      "item_key": "lotus_orb",
      "reason_uk": "Counterspell вже блокує та відбиває точкові скіли.",
      "reason_ru": "Counterspell уже блокирует и отражает точечные скиллы.",
      "reason_en": "Counterspell already blocks and reflects single-target spells."
    },
    {
      "item_key": "sphere",
      "reason_uk": "Counterspell перекриває захист від точкових заклинань.",
      "reason_ru": "Counterspell перекрывает защиту от точечных заклинаний.",
      "reason_en": "Counterspell already covers single-target spell protection."
    }
  ],
  "sven": [
    {
      "item_key": "bfury",
      "reason_uk": "Great Cleave вже дає потужний сплеш по області.",
      "reason_ru": "Great Cleave уже дает мощный сплеш по области.",
      "reason_en": "Great Cleave already provides powerful AoE cleave."
    }
  ],
  "kunkka": [
    {
      "item_key": "bfury",
      "reason_uk": "Tidebringer вже забезпечує сплеш-атаку.",
      "reason_ru": "Tidebringer уже обеспечивает сплеш-атаку.",
      "reason_en": "Tidebringer already provides AoE cleave damage."
    }
  ],
  "magnataur": [
    {
      "item_key": "bfury",
      "reason_uk": "Empower дає власний cleave без зайвого слоту.",
      "reason_ru": "Empower дает собственный cleave без лишнего слота.",
      "reason_en": "Empower grants built-in cleave without needing an extra item slot."
    }
  ],
  "shadow_demon": [
    {
      "item_key": "nullifier",
      "reason_uk": "Demonic Purge безперервно розвіює позитивні бафи з цілі.",
      "reason_ru": "Demonic Purge непрерывно развеивает положительные баффы с цели.",
      "reason_en": "Demonic Purge continuously dispels positive buffs from the target."
    }
  ]
};

const SPECIALIZED_HERO_OVERRIDES = {
  "abaddon": {
    "primary_role_uk": "Оффлейнер / Сапорт • Сейв-щит, пасивка та лікування в ульті",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Borrowed Time / Mist Coil",
        "note_uk": "Ульт перетворює вхідну шкоду на хіл і робить героя невбиваним під фокусом.",
        "note_ru": "Ульт превращает входящий урон в хил и делает героя неубиваемым под фокусом.",
        "note_en": "Ultimate turns incoming damage into healing and makes the hero unkillable under focus."
      },
      {
        "tag": "dispellable_save",
        "severity": 3,
        "source_ability": "Aphotic Shield",
        "note_uk": "Сильне розвіювання та поглинаючий щит із союзників.",
        "note_ru": "Сильное развеивание и поглощающий щит на союзников.",
        "note_en": "Strong Dispel and damage-absorbing shield on allies."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Curse of Avernus / Borrowed Time",
        "note_uk": "Break не дає пасивному спрацюванню Borrowed Time та сповільненню з атак.",
        "note_ru": "Break не дает пассивно сработать Borrowed Time и замедлению с атак.",
        "note_en": "Break disables passive Borrowed Time activation and attack slow."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Вимикає Curse of Avernus та авто-тригер Borrowed Time.",
        "reason_ru": "Отключает Curse of Avernus и авто-триггер Borrowed Time.",
        "reason_en": "Disables Curse of Avernus and the Borrowed Time auto-trigger."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Ріже хіл від Mist Coil та відновлення команди.",
        "reason_ru": "Режет хил от Mist Coil и восстановление команды.",
        "reason_en": "Reduces Mist Coil healing and team health restoration."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Дозволяє підняти Abaddon у повітря та перечекати Borrowed Time.",
        "reason_ru": "Позволяет поднять Abaddon в воздух и переждать Borrowed Time.",
        "reason_en": "Allows lifting Abaddon into the air to wait out Borrowed Time."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      3,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер / Саппорт • Сейв-щит, пассивка и лечение в ульте",
    "primary_role_en": "Offlaner / Support • Save shield, passive, and healing ultimate"
  },
  "alchemist": {
    "primary_role_uk": "Керрі • Екстремальний реген у Chemical Rage",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Chemical Rage",
        "note_uk": "Шалена регенерація HP та швидкість атаки під ультою.",
        "note_ru": "Бешеная регенерация HP и скорость атаки под ультой.",
        "note_en": "Insane HP regeneration and attack speed during ultimate."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Chemical Rage + Acid Spray",
        "note_uk": "Швидко знижує броню та бʼє з руки з високим темпом.",
        "note_ru": "Быстро снижает броню и бьет с руки с высоким темпом.",
        "note_en": "Quickly reduces armor and right-clicks at a high pace."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Unstable Concoction",
        "note_uk": "Тривалий точковий стан з руки.",
        "note_ru": "Длительный точечный стан с руки.",
        "note_en": "Long single-target stun."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Ріже реген Chemical Rage на 70% і спалює високе здоровʼя.",
        "reason_ru": "Режет реген Chemical Rage на 70% и сжигает большой запас здоровья.",
        "reason_en": "Reduces Chemical Rage regeneration by 70% and burns through high health."
      },
      {
        "item_key": "skadi",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Знижує регенерацію на 50% та уповільнює атаки Alchemist.",
        "reason_ru": "Снижает регенерацию на 50% и замедляет атаки Alchemist.",
        "reason_en": "Reduces regeneration by 50% and slows Alchemist's attacks."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Обеззброює Alchemist під час його ультимату.",
        "reason_ru": "Обезоруживает Alchemist во время его ультимейта.",
        "reason_en": "Disarms Alchemist during his ultimate."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3,
      2
    ],
    "typical_items": [
      "satanic",
      "invis_sword"
    ],
    "primary_role_ru": "Керри • Экстремальный реген в Chemical Rage",
    "primary_role_en": "Carry • Extreme regen in Chemical Rage"
  },
  "antimage": {
    "primary_role_uk": "Керрі • Мобільність, спалення мани та Counterspell",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Blink",
        "note_uk": "Короткий КД блінку унеможливлює погоню без миттєвого контролю/сайленсу.",
        "note_ru": "Короткий КД блинка делает погоню невозможной без мгновенного контроля/сайленса.",
        "note_en": "Short Blink cooldown makes chasing impossible without instant lockdown/silence."
      },
      {
        "tag": "mana_burn",
        "severity": 3,
        "source_ability": "Mana Break + Manta",
        "note_uk": "Разом з ілюзіями миттєво спалює всю ману та карає Mana Void.",
        "note_ru": "Вместе с иллюзиями мгновенно сжигает всю ману и наказывает через Mana Void.",
        "note_en": "Along with illusions, instantly burns all mana and punishes with Mana Void."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Mana Break + Blink",
        "note_uk": "Вирізає сапортів і магів із великим запасом мани.",
        "note_ru": "Вырезает саппортов и магов с большим запасом маны.",
        "note_en": "Shreds supports and mages with large mana pools."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Counterspell / Mana Break",
        "note_uk": "Пасивки дають високий опір магії та випалювання мани.",
        "note_ru": "Пассивки дают высокое сопротивление магии и выжигание маны.",
        "note_en": "Passives grant high magic resistance and mana burn."
      }
    ],
    "priority_items": [
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєвий Hex без снаряда не дає Anti-Mage натиснути Blink чи Counterspell.",
        "reason_ru": "Мгновенный Hex без снаряда не дает Anti-Mage нажать Blink или Counterspell.",
        "reason_en": "Instant projectile-free Hex prevents Anti-Mage from casting Blink or Counterspell."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Сайленс закриває Blink (працює до покупки Manta або після її витрати).",
        "reason_ru": "Сайленс закрывает Blink (работает до покупки Manta или после ее использования).",
        "reason_en": "Silence locks down Blink (works before Manta is purchased or after it is used)."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Рятує сапортів від фокусу та спалення мани (не відбивається Counterspell).",
        "reason_ru": "Спасает саппортов от фокуса и сжигания маны (не отражается Counterspell).",
        "reason_en": "Saves supports from focus and mana burn (not reflected by Counterspell)."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly"
    ],
    "primary_role_ru": "Керри • Мобильность, выжигание маны и Counterspell",
    "primary_role_en": "Carry • Mobility, mana burn, and Counterspell"
  },
  "arc_warden": {
    "primary_role_uk": "Керрі / Мідер • Двійник Tempest Double та зона ухилення",
    "threats": [
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Tempest Double",
        "note_uk": "Повноцінна копія героя подвоює шкоду та спам предметів.",
        "note_ru": "Полноценная копия героя удваивает урон и спам предметов.",
        "note_en": "Full hero clone doubles damage and item spam."
      },
      {
        "tag": "evasion",
        "severity": 3,
        "source_ability": "Magnetic Field",
        "note_uk": "Купол дає 100% ухилення союзникам усередині від зовнішніх атак.",
        "note_ru": "Купол дает 100% уклонение союзникам внутри от внешних атак.",
        "note_en": "Field grants 100% evasion to allies inside against attacks from outside."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Flux + Spark Wraith",
        "note_uk": "Висока магічна шкода в ізольованих цілей.",
        "note_ru": "Высокий магический урон по изолированным целям.",
        "note_en": "High magic damage against isolated targets."
      }
    ],
    "priority_items": [
      {
        "item_key": "monkey_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Пробиває 100% ухилення купола Magnetic Field ззовні.",
        "reason_ru": "Пробивает 100% уклонения купола Magnetic Field снаружи.",
        "reason_en": "Pierces the 100% evasion of the Magnetic Field bubble from outside."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє зблизитися всередину Magnetic Field або розірвати Flux.",
        "reason_ru": "Позволяет сблизиться внутрь Magnetic Field или разорвать Flux.",
        "reason_en": "Allows closing the gap into Magnetic Field or breaking Flux."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Блокує Flux, Spark Wraith та предмети контролю від клона.",
        "reason_ru": "Блокирует Flux, Spark Wraith и предметы контроля от клона.",
        "reason_en": "Blocks Flux, Spark Wraith, and control items from the clone."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      1
    ],
    "typical_items": [
      "butterfly",
      "orchid"
    ],
    "primary_role_ru": "Керри / Мидер • Двойник Tempest Double и зона уклонения",
    "primary_role_en": "Carry / Midlaner • Tempest Double clone and evasion field"
  },
  "axe": {
    "primary_role_uk": "Ініціатор / Оффлейнер • Провокація Call і крутилки Counter Helix",
    "threats": [
      {
        "tag": "damage_reflection",
        "severity": 3,
        "source_ability": "Counter Helix + Blade Mail",
        "note_uk": "Фізичні атаки по Axe провокують чистий урон Counter Helix і повернення через Blade Mail.",
        "note_ru": "Физические атаки по Axe провоцируют чистый урон Counter Helix и возврат через Blade Mail.",
        "note_en": "Physical attacks against Axe trigger pure Counter Helix damage and Blade Mail return."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Berserker's Call",
        "note_uk": "Жорстка провокація крізь BKB фіксує героїв на місці.",
        "note_ru": "Жесткая провокация сквозь BKB фиксирует героев на месте.",
        "note_en": "Hard taunt through BKB locks heroes in place."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Counter Helix",
        "note_uk": "Break вимикає пасивні оберти Counter Helix.",
        "note_ru": "Break отключает пассивные вращения Counter Helix.",
        "note_en": "Break disables passive Counter Helix spins."
      }
    ],
    "priority_items": [
      {
        "item_key": "cyclone",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Піднімає Axe в торнадо одразу після Call, зриваючи його Blade Mail.",
        "reason_ru": "Поднимает Axe в торнадо сразу после Call, срывая его Blade Mail.",
        "reason_en": "Lifts Axe into a cyclone right after Call, wasting his Blade Mail."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виштовхує союзника з-під фокусу або після стрибка Axe.",
        "reason_ru": "Выталкивает союзника из-под фокуса или после прыжка Axe.",
        "reason_en": "Pushes an ally out of focus or after Axe's blink initiation."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Вимикає Counter Helix і зменшує вхідну чисту шкоду в мілі-бою.",
        "reason_ru": "Отключает Counter Helix и уменьшает входящий чистый урон в ближнем бою.",
        "reason_en": "Disables Counter Helix and reduces incoming pure damage in melee combat."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [
      "blade_mail"
    ],
    "primary_role_ru": "Инициатор / Оффлейнер • Провокация Call и прокрутки Counter Helix",
    "primary_role_en": "Initiator / Offlaner • Call taunt and Counter Helix spins"
  },
  "bane": {
    "primary_role_uk": "Сапорт • Потоковий Fiend's Grip крізь BKB та точковий контроль",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Fiend's Grip",
        "note_uk": "Тривалий контроль крізь нечутливість до ефектів.",
        "note_ru": "Длительный контроль сквозь невосприимчивость к эффектам.",
        "note_en": "Long lockdown through debuff immunity."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Fiend's Grip / Nightmare",
        "note_uk": "Увесь контроль героя є точковим і виключає кору з бійки.",
        "note_ru": "Весь контроль героя является точечным и выключает кора из драки.",
        "note_en": "All of the hero's lockdown is single-target and takes a core out of the fight."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Відбиває Nightmare і Fiend's Grip назад у Bane або знімає сон із союзника.",
        "reason_ru": "Отражает Nightmare и Fiend's Grip обратно в Bane или снимает сон с союзника.",
        "reason_en": "Reflects Nightmare and Fiend's Grip back onto Bane or removes sleep from an ally."
      },
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Блокує миттєву ініціацію через Fiend's Grip.",
        "reason_ru": "Блокирует мгновенную инициацию через Fiend's Grip.",
        "reason_en": "Blocks instant initiation with Fiend's Grip."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Збиває каналізацію Fiend's Grip з безпечної дистанції.",
        "reason_ru": "Сбивает применение Fiend's Grip с безопасной дистанции.",
        "reason_en": "Interrupts Fiend's Grip channeling from a safe distance."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт • Потоковый Fiend's Grip сквозь BKB и точечный контроль",
    "primary_role_en": "Support • Channeled Fiend's Grip through BKB and single-target control"
  },
  "batrider": {
    "primary_role_uk": "Ініціатор • Flaming Lasso крізь BKB і стаки Napalm",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Flaming Lasso",
        "note_uk": "Точковий ультимат витягує ключового героя крізь BKB.",
        "note_ru": "Точечный ультимейт вытягивает ключевого героя сквозь BKB.",
        "note_en": "Single-target ultimate drags away a key hero through BKB."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Firefly",
        "note_uk": "Польотний рух через перешкоди для раптового захоплення.",
        "note_ru": "Полет через препятствия для внезапного захвата.",
        "note_en": "Flying movement over obstacles for sudden pickoffs."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Sticky Napalm + Firefly",
        "note_uk": "Стаки різко розганяють магічну шкоду.",
        "note_ru": "Стаки резко разгоняют магический урон.",
        "note_en": "Stacks rapidly amplify magic damage."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Головний сейв від Flaming Lasso — притягує самого Batrider і знімає стаки Napalm.",
        "reason_ru": "Главный сейв от Flaming Lasso — притягивает самого Batrider и снимает стаки Napalm.",
        "reason_en": "Primary save against Flaming Lasso — pulls Batrider himself and dispels Napalm stacks."
      },
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Автоматично зриває блінк-ініціацію з Flaming Lasso.",
        "reason_ru": "Автоматически срывает блинк-инициацию с Flaming Lasso.",
        "reason_en": "Automatically ruins blink initiation with Flaming Lasso."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Допомагає розірвати дистанцію та вивезти ціль із вогню.",
        "reason_ru": "Помогает разорвать дистанцию и вывезти цель из огня.",
        "reason_en": "Helps break distance and push the target out of the fire."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      3,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Инициатор • Flaming Lasso сквозь BKB и стаки Napalm",
    "primary_role_en": "Initiator • Flaming Lasso through BKB and Napalm stacks"
  },
  "broodmother": {
    "primary_role_uk": "Керрі / Мідер • Армія павуків, вампіризм та інвіз/спам",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Spawn Spiderlings",
        "note_uk": "Зграї павуків працюють як ілюзії — миттєво згризають тонких сапортів і вежі.",
        "note_ru": "Стаи пауков работают как иллюзии — мгновенно сгрызают тонких саппортов и башни.",
        "note_en": "Spider swarms act like illusions — instantly devouring squishy supports and towers."
      },
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Insatiable Hunger",
        "note_uk": "Величезний вампіризм з атак під ультою.",
        "note_ru": "Огромный вампиризм с атак под ультой.",
        "note_en": "Massive attack lifesteal during ultimate."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Insatiable Hunger + Spiderlings",
        "note_uk": "Агресивний фокус однієї цілі.",
        "note_ru": "Агрессивный фокус одной цели.",
        "note_en": "Aggressive single-target focus."
      }
    ],
    "priority_items": [
      {
        "item_key": "crimson_guard",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блок шкоди повністю зрізає урон від десятків павучків Broodmother.",
        "reason_ru": "Блок урона полностью срезает урон от десятков паучков Broodmother.",
        "reason_en": "Damage block completely negates damage from dozens of Broodmother's spiderlings."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ріже шалений вампіризм Insatiable Hunger на 70%.",
        "reason_ru": "Режет бешеный вампиризм Insatiable Hunger на 70%.",
        "reason_en": "Reduces the massive lifesteal of Insatiable Hunger by 70%."
      },
      {
        "item_key": "mjollnir",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Швидко випалює павуків блискавками та щитом Static Charge.",
        "reason_ru": "Быстро выжигает пауков молниями и щитом Static Charge.",
        "reason_en": "Quickly clears spiders with chain lightning and the Static Charge shield."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      3
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Керри / Мидер • Армия пауков, вампиризм и инвиз/спам",
    "primary_role_en": "Carry / Midlaner • Spider army, lifesteal, and invis/spam"
  },
  "chaos_knight": {
    "primary_role_uk": "Керрі • Надміцні ілюзії Phantasm та міцний стан",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Phantasm",
        "note_uk": "Ілюзії завдають 100% шкоди й за секунду стирають ціль після Reality Rift.",
        "note_ru": "Иллюзии наносят 100% урона и за секунду стирают цель после Reality Rift.",
        "note_en": "Illusions deal 100% damage and erase a target in a second after Reality Rift."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Reality Rift + Chaos Strike",
        "note_uk": "Миттєвий притягуючий бурст із критами.",
        "note_ru": "Мгновенный притягивающий бурст с критами.",
        "note_en": "Instant gap-closing burst with crits."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Chaos Strike",
        "note_uk": "Пасивний вампіризм із кожного крита.",
        "note_ru": "Пассивный вампиризм с каждого крита.",
        "note_en": "Passive lifesteal on every crit."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Chaos Bolt / Reality Rift",
        "note_uk": "Надійний точковий стан і стяжка.",
        "note_ru": "Надежный точечный стан и стяжка.",
        "note_en": "Reliable single-target stun and pull."
      }
    ],
    "priority_items": [
      {
        "item_key": "crimson_guard",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Гасить серію ударів від 4–5 копій Phantasm по всій команді.",
        "reason_ru": "Гасит серию ударов от 4–5 копий Phantasm по всей команде.",
        "reason_en": "Mitigates the barrage of attacks from 4–5 Phantasm illusions across the whole team."
      },
      {
        "item_key": "mjollnir",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Щит Static Charge та блискавки виявляють і чистять ілюзії CK.",
        "reason_ru": "Щит Static Charge и молнии выявляют и зачищают иллюзии CK.",
        "reason_en": "The Static Charge shield and lightning procs reveal and clear CK's illusions."
      },
      {
        "item_key": "shivas_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "+17 броні й аура -40 AS різко послаблюють фіз-урон ілюзій.",
        "reason_ru": "+17 брони и аура -40 AS резко ослабляют физ-урон иллюзий.",
        "reason_en": "+17 armor and the -40 AS aura sharply weaken the physical damage of illusions."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3,
      4
    ],
    "typical_items": [
      "satanic"
    ],
    "primary_role_ru": "Керри • Сверхпрочные иллюзии Phantasm и надежный стан",
    "primary_role_en": "Carry • Ultra-strong Phantasm illusions and reliable stun"
  },
  "clinkz": {
    "primary_role_uk": "Керрі / Асасін • Інвіз Skeleton Walk та стрілковий бурст",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Skeleton Walk",
        "note_uk": "Швидкі ротаційні ганки з невидимості по всій карті.",
        "note_ru": "Быстрые ротационные ганки из невидимости по всей карте.",
        "note_en": "Fast rotational ganks from invisibility across the map."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Strafe + Tar Bomb / Burning Barrage",
        "note_uk": "Вибуховий фізичний ДПС зі скелетами.",
        "note_ru": "Взрывной физический ДПС со скелетами.",
        "note_en": "Explosive physical DPS with skeletons."
      }
    ],
    "priority_items": [
      {
        "item_key": "dust",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Не дає Clinkz піти через Skeleton Walk після нападу.",
        "reason_ru": "Не дает Clinkz уйти через Skeleton Walk после нападения.",
        "reason_en": "Prevents Clinkz from escaping with Skeleton Walk after an attack."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виводить сапорта із зони обстрілу скелетів і Tar Bomb.",
        "reason_ru": "Выводит саппорта из зоны обстрела скелетов и Tar Bomb.",
        "reason_en": "Pushes a support out of the skeleton firing zone and Tar Bomb."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Повністю рятує від миттєвого розстрілу з Strafe.",
        "reason_ru": "Полностью спасает от мгновенного расстрела со Strafe.",
        "reason_en": "Completely saves from being instantly gunned down by Strafe."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      4
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Керри / Ассасин • Инвиз Skeleton Walk и стрелковый бурст",
    "primary_role_en": "Carry / Assassin • Skeleton Walk invis and ranged burst"
  },
  "crystal_maiden": {
    "primary_role_uk": "Сапорт • Потоковий Freezing Field та фіксація Frostbite",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Freezing Field",
        "note_uk": "Потужний потоковий AoE-ульт, який треба вчасно збити.",
        "note_ru": "Мощный потоковый AoE-ульт, который нужно вовремя сбить.",
        "note_en": "Powerful channeled AoE ultimate that must be interrupted in time."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Freezing Field + Crystal Nova",
        "note_uk": "Велика магічна шкода в радіусі бійки.",
        "note_ru": "Большой магический урон в радиусе драки.",
        "note_en": "High magic damage in the teamfight radius."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Frostbite",
        "note_uk": "Рут із забороною атак та руху.",
        "note_ru": "Рут с запретом атак и движения.",
        "note_en": "Root that prevents moving and attacking."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ігнорує Frostbite, Crystal Nova і більшість шкоди Freezing Field.",
        "reason_ru": "Игнорирует Frostbite, Crystal Nova и большую часть урона Freezing Field.",
        "reason_en": "Ignores Frostbite, Crystal Nova, and most of Freezing Field's damage."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Миттєво збиває Freezing Field або знімає з себе Frostbite.",
        "reason_ru": "Мгновенно сбивает Freezing Field или снимает с себя Frostbite.",
        "reason_en": "Instantly interrupts Freezing Field or self-dispels Frostbite."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Поглинає масову магічну шкоду ультимату.",
        "reason_ru": "Поглощает массовый магический урон ультимейта.",
        "reason_en": "Absorbs the massive AoE magic damage of the ultimate."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "black_king_bar",
      "glimmer_cape"
    ],
    "primary_role_ru": "Саппорт • Потоковый Freezing Field и фиксация Frostbite",
    "primary_role_en": "Support • Channeled Freezing Field and Frostbite root"
  },
  "dark_seer": {
    "primary_role_uk": "Оффлейнер • Vacuum + Wall of Replica (ілюзії) та Surge",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Wall of Replica",
        "note_uk": "Створює сильні ілюзії ваших же корів.",
        "note_ru": "Создает сильные иллюзии ваших же коров.",
        "note_en": "Creates strong illusions of your own cores."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Surge / Ion Shell",
        "note_uk": "Швидкість і щит знімаються розвіюванням.",
        "note_ru": "Скорость и щит снимаются развеиванием.",
        "note_en": "Speed surge and shell can be removed with a Dispel."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Ion Shell",
        "note_uk": "Постійна аура шкоди на фронті.",
        "note_ru": "Постоянная аура урона на передовой.",
        "note_en": "Constant damage aura on the frontline."
      }
    ],
    "priority_items": [
      {
        "item_key": "nullifier",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає Surge та Ion Shell, не даючи ворогам втекти.",
        "reason_ru": "Снимает Surge и Ion Shell, не давая врагам сбежать.",
        "reason_en": "Dispels Surge and Ion Shell, preventing enemies from escaping."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Виштовхує команду зі стяжки Vacuum + Wall.",
        "reason_ru": "Выталкивает команду из стяжки Vacuum + Wall.",
        "reason_en": "Pushes teammates out of the Vacuum + Wall combo."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Ріже шкоду від подвійних Ion Shell і прокасту під Vacuum.",
        "reason_ru": "Режет урон от двойных Ion Shell и прокаста под Vacuum.",
        "reason_en": "Reduces damage from double Ion Shells and the Vacuum combo."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер • Vacuum + Wall of Replica (иллюзии) и Surge",
    "primary_role_en": "Offlaner • Vacuum + Wall of Replica (illusions) and Surge"
  },
  "dazzle": {
    "primary_role_uk": "Сапорт • Безсмертя Shallow Grave та постійний хіл",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Shadow Wave",
        "note_uk": "Масово лікує союзників у близькому бою.",
        "note_ru": "Массово лечит союзников в ближнем бою.",
        "note_en": "Heals multiple allies in close combat."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Shallow Grave",
        "note_uk": "Не дає добити ціль протягом 5 секунд (потребує ре-контролю або затримки).",
        "note_ru": "Не дает добить цель в течение 5 секунд (требует ре-контроля или выжидания).",
        "note_en": "Prevents finishing off a target for 5 seconds (requires re-control or waiting it out)."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ріже хіл Shadow Wave на 70% і добиває ціль одразу після закінчення Grave.",
        "reason_ru": "Режет хил Shadow Wave на 70% и добивает цель сразу после окончания Grave.",
        "reason_en": "Reduces Shadow Wave healing by 70% and finishes off the target right after Grave ends."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Сайленс не дає Dazzle вчасно натиснути Shallow Grave на свого кору.",
        "reason_ru": "Сайленс не дает Dazzle вовремя нажать Shallow Grave на своего кора.",
        "reason_en": "Silence prevents Dazzle from casting Shallow Grave on his core in time."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Піднімає врятовану ціль, щоб перечекати Shallow Grave та добити після приземлення.",
        "reason_ru": "Поднимает спасенную цель, чтобы переждать Shallow Grave и добить после приземления.",
        "reason_en": "Lifts the saved target to wait out Shallow Grave and finish them upon landing."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      2
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт • Бессмертие Shallow Grave и постоянный хил",
    "primary_role_en": "Support • Shallow Grave immortality and constant heal"
  },
  "death_prophet": {
    "primary_role_uk": "Мідер / Оффлейнер • Висмоктування HP Spirit Siphon і сайленс",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Spirit Siphon",
        "note_uk": "Висмоктує здоровʼя у відсотках від макс. HP та робить DP дуже живучою.",
        "note_ru": "Высасывает здоровье в процентах от макс. HP и делает DP очень живучей.",
        "note_en": "Drains health as a percentage of max HP and makes DP very tanky."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "Silence",
        "note_uk": "Тривала масова безмовність по області.",
        "note_ru": "Длительное массовое безмолвие по области.",
        "note_en": "Long AoE silence."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Exorcism",
        "note_uk": "Духи завдають величезної фізичної шкоди в бійці та по вежах.",
        "note_ru": "Духи наносят огромный физический урон в драке и по башням.",
        "note_en": "Spirits deal massive physical damage in teamfights and to towers."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Зрізає лікування від Spirit Siphon на 70% і пробиває її крізь реген.",
        "reason_ru": "Срезает лечение от Spirit Siphon на 70% и пробивает ее сквозь реген.",
        "reason_en": "Cuts Spirit Siphon healing by 70% and bursts her through regeneration."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає Silence і відбиває Spirit Siphon.",
        "reason_ru": "Снимает Silence и отражает Spirit Siphon.",
        "reason_en": "Dispels Silence and reflects Spirit Siphon."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Захищає сапортів від фізичної шкоди духів Exorcism.",
        "reason_ru": "Защищает саппортов от физического урона духов Exorcism.",
        "reason_en": "Protects supports from the physical damage of Exorcism spirits."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2,
      5
    ],
    "typical_items": [
      "black_king_bar"
    ],
    "primary_role_ru": "Мидер / Оффлейнер • Высасывание HP Spirit Siphon и сайленс",
    "primary_role_en": "Midlaner / Offlaner • Spirit Siphon HP drain and silence"
  },
  "disruptor": {
    "primary_role_uk": "Сапорт • Статична буря (Silence) + Kinetic Field + Glimpse",
    "threats": [
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Static Storm",
        "note_uk": "АоЕ-сайленс (з Aghanim — і mute предметів) ламає командні файти.",
        "note_ru": "AoE-сайленс (с Aghanim — и mute предметов) ломает командные файты.",
        "note_en": "AoE silence (with Aghanim — also mutes items) ruins teamfights."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Kinetic Field + Glimpse",
        "note_uk": "Замикає в полі та повертає з телепорту чи блінку.",
        "note_ru": "Запирает в поле и возвращает с телепорта или блинка.",
        "note_en": "Traps in a barrier and glimpses enemies back from TP or blink."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Дозволяє вийти з Static Storm + Kinetic Field та не повертатися під Glimpse.",
        "reason_ru": "Позволяет выйти из Static Storm + Kinetic Field и не возвращаться под Glimpse.",
        "reason_en": "Allows walking out of Static Storm + Kinetic Field and avoids being pulled back by Glimpse."
      },
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Виштовхує союзників крізь стінки Kinetic Field / Static Storm до Aghanim.",
        "reason_ru": "Выталкивает союзников сквозь стенки Kinetic Field / Static Storm до покупки Aghanim.",
        "reason_en": "Pushes allies through Kinetic Field / Static Storm before Aghanim's."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт • Статическая буря (Silence) + Kinetic Field + Glimpse",
    "primary_role_en": "Support • Static Storm (Silence) + Kinetic Field + Glimpse"
  },
  "doom_bringer": {
    "primary_role_uk": "Оффлейнер / Керрі • Точковий Doom (Silence + Mute + Anti-heal + Break)",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Doom",
        "note_uk": "Вимикає одного героя з бійки на тривалий час.",
        "note_ru": "Выключает одного героя из драки на длительное время.",
        "note_en": "Takes one hero out of the fight for a long time."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Scorched Earth + Infernal Blade",
        "note_uk": "Постійний горілий урон по області.",
        "note_ru": "Постоянный периодический урон огнем по области.",
        "note_en": "Constant AoE burn damage."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Scorched Earth / Devour",
        "note_uk": "Стабільна регенерація у тривалому файті.",
        "note_ru": "Стабильная регенерация в затяжном файте.",
        "note_en": "Steady regeneration in extended fights."
      }
    ],
    "priority_items": [
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Блокує точковий ультимат Doom, змушуючи ворога витрачати додатковий скіл.",
        "reason_ru": "Блокирует направленный ультимейт Doom, заставляя врага тратить дополнительный скилл.",
        "reason_en": "Blocks the single-target Doom ultimate, forcing the enemy to pop it with another spell first."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Повертає Doom у самого Doom-брінгера (хоч і не рятує від першого касту).",
        "reason_ru": "Возвращает Doom в самого Doom (хотя и не спасает от первого каста).",
        "reason_en": "Reflects Doom back onto Doom himself (though it doesn't block the initial cast)."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Допомагає відвезти союзника під Doom із центру бійки.",
        "reason_ru": "Помогает увезти союзника под Doom из центра драки.",
        "reason_en": "Helps push a Doomed ally away from the center of the fight."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      1
    ],
    "typical_items": [
      "satanic"
    ],
    "primary_role_ru": "Оффлейнер / Керри • Точечный Doom (Silence + Mute + Anti-heal + Break)",
    "primary_role_en": "Offlaner / Carry • Single-target Doom (Silence + Mute + Anti-heal + Break)"
  },
  "dragon_knight": {
    "primary_role_uk": "Керрі / Оффлейнер • Пасивна броня і реген Wyrm's Wrath / Dragon Blood",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Wyrm's Wrath / Dragon Blood",
        "note_uk": "Велика пасивна броня, регенерація та дебафи на атаках.",
        "note_ru": "Большая пассивная броня, регенерация и дебаффы на атаках.",
        "note_en": "High passive armor, regeneration, and attack debuffs."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Dragon Blood",
        "note_uk": "Високий пасивний реген у лейні й файтах.",
        "note_ru": "Высокий пассивный реген на линии и в файтах.",
        "note_en": "High passive regen in lane and teamfights."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Dragon Tail",
        "note_uk": "Миттєвий точковий стан в Elder Dragon Form.",
        "note_ru": "Мгновенный точечный стан в Elder Dragon Form.",
        "note_en": "Instant single-target stun in Elder Dragon Form."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Вимикає пасивну броню та регенерацію DK — робить його набагато мʼякшим.",
        "reason_ru": "Отключает пассивную броню и регенерацию DK — делает его гораздо мягче.",
        "reason_en": "Disables DK's passive armor and regeneration, making him much squishier."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зрізає вбудовану регенерацію і пробиває броню процентною шкодою.",
        "reason_ru": "Срезает встроенную регенерацию и пробивает броню процентным уроном.",
        "reason_en": "Cuts his built-in regeneration and pierces armor with percentage-based damage."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      3
    ],
    "typical_items": [
      "black_king_bar",
      "satanic",
      "invis_sword"
    ],
    "primary_role_ru": "Керри / Оффлейнер • Пассивная броня и реген Wyrm's Wrath / Dragon Blood",
    "primary_role_en": "Carry / Offlaner • Passive armor and regen Wyrm's Wrath / Dragon Blood"
  },
  "drow_ranger": {
    "primary_role_uk": "Керрі • Пасивка Marksmanship, Gust (Silence) і величезний фіз-урон",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Marksmanship + Multishot",
        "note_uk": "Ігнорує базову броню та розстрілює на великій відстані.",
        "note_ru": "Игнорирует базовую броню и расстреливает на большой дистанции.",
        "note_en": "Ignores base armor and shreds from long range."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Marksmanship",
        "note_uk": "Втрачає бонусну спритність та пробиття броні під Break (або при зближенні).",
        "note_ru": "Теряет бонусную ловкость и пробитие брони под Break (или при сближении).",
        "note_en": "Loses bonus agility and armor piercing under Break (or when enemies close the gap)."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "Gust",
        "note_uk": "Відштовхує та накладає тривалу безмовність.",
        "note_ru": "Отталкивает и накладывает длительное безмолвие.",
        "note_en": "Knocks back and inflicts a long silence."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Швидке зближення на 400 радіусу миттєво вимикає Marksmanship Drow Ranger.",
        "reason_ru": "Быстрое сближение в радиус 400 мгновенно отключает Marksmanship Drow Ranger.",
        "reason_en": "Closing the gap within 400 range instantly disables Drow Ranger's Marksmanship."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює Drow на 3.5 с і зупиняє розстріл.",
        "reason_ru": "Обезоруживает Drow на 3.5 с и останавливает расстрел.",
        "reason_en": "Disarms Drow for 3.5s and stops her barrage."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Захищає сапортів від фокусу стрілами.",
        "reason_ru": "Защищает саппортов от фокуса стрелами.",
        "reason_en": "Protects supports from being focused down by arrows."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar",
      "invis_sword"
    ],
    "primary_role_ru": "Керри • Пассивка Marksmanship, Gust (Silence) и огромный физ-урон",
    "primary_role_en": "Carry • Marksmanship passive, Gust (Silence), and massive physical damage"
  },
  "enchantress": {
    "primary_role_uk": "Сапорт / Оффлейнер • Пасивка Untouchable (-AS) та лікування",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Untouchable",
        "note_uk": "Атакувати її без BKB чи Break майже неможливо через величезне зниження швидкості атаки.",
        "note_ru": "Атаковать ее без BKB или Break почти невозможно из-за огромного снижения скорости атаки.",
        "note_en": "Attacking her without BKB or Break is nearly impossible due to massive attack speed reduction."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Nature's Attendants",
        "note_uk": "Швидко відхілює себе і союзників світлячками.",
        "note_ru": "Быстро отхиливает себя и союзников светлячками.",
        "note_en": "Quickly heals herself and allies with nature's attendants."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Вимикає Untouchable на 5 с, дозволяючи легко вбити Enchantress з руки.",
        "reason_ru": "Отключает Untouchable на 5 с, позволяя легко убить Enchantress с руки.",
        "reason_en": "Disables Untouchable for 5s, allowing you to easily right-click Enchantress down."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Імунітет дає змогу бити крізь Untouchable.",
        "reason_ru": "Иммунитет позволяет бить сквозь Untouchable.",
        "reason_en": "Immunity allows attacking unimpeded through Untouchable."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зрізає лікування Nature's Attendants на 70%.",
        "reason_ru": "Срезает лечение Nature's Attendants на 70%.",
        "reason_en": "Reduces Nature's Attendants healing by 70%."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Саппорт / Оффлейнер • Пассивка Untouchable (-AS) и лечение",
    "primary_role_en": "Support / Offlaner • Untouchable passive (-AS) and healing"
  },
  "enigma": {
    "primary_role_uk": "Ініціатор • Потоковий Black Hole крізь BKB та ейдолони",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Black Hole",
        "note_uk": "Потоковий ульт контролює всю команду крізь BKB.",
        "note_ru": "Потоковый ульт контролирует всю команду сквозь BKB.",
        "note_en": "Channeled ultimate locks down the entire team through BKB."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Black Hole",
        "note_uk": "Стягує героїв в одну точку під масовий прокаст.",
        "note_ru": "Стягивает героев в одну точку под массовый прокаст.",
        "note_en": "Pulls heroes into a single point for AoE wombo-combos."
      },
      {
        "tag": "illusions",
        "severity": 1,
        "source_ability": "Demonic Summoning",
        "note_uk": "Ейдолони дають сильний пуш та фізичний тиск.",
        "note_ru": "Эйдолоны дают сильный пуш и физическое давление.",
        "note_en": "Eidolons provide strong push and physical pressure."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виштовхує союзника з краю Black Hole або тримає позицію ззаду для інтеррапту.",
        "reason_ru": "Выталкивает союзника с края Black Hole или помогает держать позицию сзади для сбития.",
        "reason_en": "Pushes an ally out from the edge of Black Hole or helps position safely to interrupt it."
      },
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Поглинає тиск від розмножених ейдолонів.",
        "reason_ru": "Поглощает урон от размножившихся эйдолонов.",
        "reason_en": "Absorbs the physical pressure from multiplied Eidolons."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      4,
      5
    ],
    "typical_items": [
      "black_king_bar",
      "aeon_disk"
    ],
    "primary_role_ru": "Инициатор • Потоковый Black Hole сквозь BKB и эйдолоны",
    "primary_role_en": "Initiator • Channeled Black Hole through BKB and eidolons"
  },
  "faceless_void": {
    "primary_role_uk": "Керрі • Chronosphere, Time Walk (хіл) та Time Lock",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Chronosphere",
        "note_uk": "Повністю зупиняє героїв у куполі для безкарного фокусу.",
        "note_ru": "Полностью останавливает героев в куполе для безнаказанного фокуса.",
        "note_en": "Completely freezes heroes inside the sphere for uncontested focus."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Time Walk",
        "note_uk": "Відкочує отриману шкоду за останні 2 секунди та стрибає в бій.",
        "note_ru": "Откатывает полученный урон за последние 2 секунды и прыгает в бой.",
        "note_en": "Backtracks damage taken in the last 2 seconds and jumps into the fight."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Time Lock + Chronosphere",
        "note_uk": "Баші під куполом стирають будь-якого кору.",
        "note_ru": "Баши под куполом стирают любого кора.",
        "note_en": "Bashes inside the sphere erase any core."
      }
    ],
    "priority_items": [
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює Void до купола або одразу після виходу.",
        "reason_ru": "Обезоруживает Void до купола или сразу после его окончания.",
        "reason_en": "Disarms Void before Chronosphere or right after it ends."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Сайленс не дає Void відкотити шкоду через Time Walk або поставити Chronosphere.",
        "reason_ru": "Сайленс не дает Void откатить урон через Time Walk или поставить Chronosphere.",
        "reason_en": "Silence prevents Void from backtracking damage with Time Walk or casting Chronosphere."
      },
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Миттєвий Hex ламає ініціацію Void і не дає прожати Time Walk.",
        "reason_ru": "Мгновенный Hex ломает инициацию Void и не дает нажать Time Walk.",
        "reason_en": "Instant Hex ruins Void's initiation and stops him from using Time Walk."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Зі сторони піднімає Void у повітря прямо всередині Chronosphere, рятуючи союзників.",
        "reason_ru": "Со стороны поднимает Void в воздух прямо внутри Chronosphere, спасая союзников.",
        "reason_en": "Lifts Void into the air from outside Chronosphere, saving trapped allies."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar"
    ],
    "primary_role_ru": "Керри • Chronosphere, Time Walk (хил) и Time Lock",
    "primary_role_en": "Carry • Chronosphere, Time Walk (heal), and Time Lock"
  },
  "wisp": {
    "primary_role_uk": "Сапорт • Tether + Overcharge безперервне лікування кору",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Tether + Overcharge",
        "note_uk": "Множить лікування та регенерацію союзного керрі.",
        "note_ru": "Умножает лечение и регенерацию союзного керри.",
        "note_en": "Multiplies healing and regeneration on an allied carry."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Relocate",
        "note_uk": "Глобальний порятунок або ганк вдвох.",
        "note_ru": "Глобальное спасение или ганк вдвоем.",
        "note_en": "Global save or two-man gank."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Ріже переданий хіл Tether на 70% і швидко знищує самого Io.",
        "reason_ru": "Режет передаваемый хил Tether на 70% и быстро уничтожает самого Io.",
        "reason_en": "Reduces Tether's transferred healing by 70% and quickly melts Io himself."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Саппорт • Tether + Overcharge непрерывное лечение кора",
    "primary_role_en": "Support • Tether + Overcharge continuous core healing"
  },
  "juggernaut": {
    "primary_role_uk": "Керрі • Omnislash, Healing Ward та Blade Fury",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Omnislash / Swiftslash",
        "note_uk": "Невразливий фіз-ультимат по ізольованій цілі.",
        "note_ru": "Неуязвимый физ-ультимейт по изолированной цели.",
        "note_en": "Invulnerable physical ultimate against an isolated target."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Healing Ward",
        "note_uk": "Відхілює всю команду у відсотках від макс. HP.",
        "note_ru": "Отхиливает всю команду в процентах от макс. HP.",
        "note_en": "Heals the entire team for a percentage of max HP."
      }
    ],
    "priority_items": [
      {
        "item_key": "ghost",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Повністю рятує від Omnislash (фіз-атаки не проходять у Ghost Form).",
        "reason_ru": "Полностью спасает от Omnislash (физ-атаки не проходят в Ghost Form).",
        "reason_en": "Completely saves from Omnislash (physical attacks deal no damage in Ghost Form)."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Підняття себе в Eul одразу перериває та збиває Omnislash.",
        "reason_ru": "Поднятие себя в Eul сразу прерывает и сбивает Omnislash.",
        "reason_en": "Using Eul's on yourself immediately interrupts or dodges Omnislash."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Робить Juggernaut вразливим або зриває точковий фокус.",
        "reason_ru": "Делает Juggernaut уязвимым или срывает направленный фокус.",
        "reason_en": "Makes Juggernaut vulnerable or disrupts his single-target focus."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly"
    ],
    "primary_role_ru": "Керри • Omnislash, Healing Ward и Blade Fury",
    "primary_role_en": "Carry • Omnislash, Healing Ward, and Blade Fury"
  },
  "keeper_of_the_light": {
    "primary_role_uk": "Мідер / Сапорт • Blinding Light (промахи) та спам магією",
    "threats": [
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Blinding Light",
        "note_uk": "Накладає високий шанс промаху в області.",
        "note_ru": "Накладывает высокий шанс промаха по области.",
        "note_en": "Applies a high miss chance in an AoE."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Illuminate + Spirit Form",
        "note_uk": "Сильний позиційний магічний спам.",
        "note_ru": "Сильный позиционный магический спам.",
        "note_en": "Strong positional magic spam."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає дебаф промахів Blinding Light і захищає від Solar Bind.",
        "reason_ru": "Снимает дебафф промахов Blinding Light и защищает от Solar Bind.",
        "reason_en": "Dispels the Blinding Light miss debuff and protects against Solar Bind."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      4,
      5
    ],
    "typical_items": [
      "aeon_disk"
    ],
    "primary_role_ru": "Мидер / Саппорт • Blinding Light (промахи) и спам магией",
    "primary_role_en": "Midlaner / Support • Blinding Light (miss chance) and magic spam"
  },
  "kez": {
    "primary_role_uk": "Керрі / Мідер • Мобільність, сайленс, інвіз Raven's Veil та фіз-бурст",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Falcon Rush / Shodo Sai",
        "note_uk": "Подвійні атаки та критичний удар.",
        "note_ru": "Двойные атаки и критический удар.",
        "note_en": "Double attacks and critical strike."
      },
      {
        "tag": "invisibility",
        "severity": 2,
        "source_ability": "Raven's Veil",
        "note_uk": "Отримує невидимість і базове розвіювання в бою.",
        "note_ru": "Получает невидимость и базовое развеивание в бою.",
        "note_en": "Gains invisibility and Basic Dispel in combat."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "Talon Toss",
        "note_uk": "Дальній сайленс по цілі.",
        "note_ru": "Дальний сайленс по цели.",
        "note_en": "Long-range single-target silence."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Grappling Claw / Falcon Rush",
        "note_uk": "Швидке зближення на гачку.",
        "note_ru": "Быстрое сближение на крюке.",
        "note_en": "Fast gap-close with grappling hook."
      }
    ],
    "priority_items": [
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Захищає сапортів від серії ударів Falcon Rush та Shodo Sai.",
        "reason_ru": "Защищает саппортов от серии ударов Falcon Rush и Shodo Sai.",
        "reason_en": "Protects supports from the flurry of Falcon Rush and Shodo Sai attacks."
      },
      {
        "item_key": "dust",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Розкриває Raven's Veil у ключовий момент фокусу.",
        "reason_ru": "Раскрывает Raven's Veil в ключевой момент фокуса.",
        "reason_en": "Reveals Kez through Raven's Veil at a crucial moment of focus."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Не дає перемикати стійки та тікати через Grappling Claw.",
        "reason_ru": "Не дает переключать стойки и убегать через Grappling Claw.",
        "reason_en": "Prevents switching stances and escaping with Grappling Claw."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2
    ],
    "typical_items": [
      "orchid",
      "black_king_bar",
      "invis_sword"
    ],
    "primary_role_ru": "Керри / Мидер • Мобильность, сайленс, инвиз Raven's Veil и физ-бурст",
    "primary_role_en": "Carry / Midlaner • Mobility, silence, Raven's Veil invis, and physical burst"
  },
  "largo": {
    "primary_role_uk": "Сапорт / Оффлейнер • Хіл Island Elixir, подовження бафів і перетягування",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Island Elixir",
        "note_uk": "Масово лікує союзних героїв під час пісенного ультимату.",
        "note_ru": "Массово лечит союзных героев во время песенного ультимейта.",
        "note_en": "Mass-heals allied heroes during the song ultimate."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Encore / Croak of Genius",
        "note_uk": "Подовжує бафи на собі та команді.",
        "note_ru": "Продлевает баффы на себе и команде.",
        "note_en": "Extends buff durations on self and team."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Catchy Lick",
        "note_uk": "Притягує ціль язиком із базовим розвіюванням.",
        "note_ru": "Притягивает цель языком с базовым развеиванием.",
        "note_en": "Pulls a target with his tongue and applies Basic Dispel."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Ріже командне лікування від Island Elixir на 70%.",
        "reason_ru": "Режет командное лечение от Island Elixir на 70%.",
        "reason_en": "Reduces team healing from Island Elixir by 70%."
      },
      {
        "item_key": "nullifier",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Знімає підсилені через Encore позитивні бафи ворогів.",
        "reason_ru": "Снимает усиленные через Encore положительные баффы врагов.",
        "reason_en": "Dispels enemy buffs amplified by Encore."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Саппорт / Оффлейнер • Хил Island Elixir, продление баффов и перетягивание",
    "primary_role_en": "Support / Offlaner • Island Elixir heal, buff extension, and pull"
  },
  "legion_commander": {
    "primary_role_uk": "Оффлейнер • Точковий Duel та хіл/диспел Press the Attack",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Duel",
        "note_uk": "Довга точкова дуель змушує битися та приносить бонусну шкоду.",
        "note_ru": "Долгая точечная дуэль заставляет драться и приносит бонусный урон.",
        "note_en": "Long single-target duel forces a fight and grants permanent bonus damage."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Duel + Moment of Courage",
        "note_uk": "Швидко знищує вразливих героїв за тривалість дуелі.",
        "note_ru": "Быстро уничтожает уязвимых героев за время дуэли.",
        "note_en": "Quickly deletes vulnerable heroes during the duel."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Press The Attack",
        "note_uk": "Знімає дебафи та сильно лікує себе/союзника.",
        "note_ru": "Снимает дебаффы и сильно лечит себя/союзника.",
        "note_en": "Dispels debuffs and heavily heals self/ally."
      }
    ],
    "priority_items": [
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Блокує миттєву блінк-дуель Legion Commander.",
        "reason_ru": "Блокирует мгновенную блинк-дуэль Legion Commander.",
        "reason_en": "Blocks Legion Commander's instant blink Duel."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ускладнює ініціацію та змушує LC двічі думати перед дуеллю.",
        "reason_ru": "Усложняет инициацию и заставляет LC дважды подумать перед дуэлью.",
        "reason_en": "Complicates initiation and forces LC to think twice before casting Duel."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Обеззброює LC або збиває Linken ворога перед файтом.",
        "reason_ru": "Обезоруживает LC или сбивает Linken врага перед файтом.",
        "reason_en": "Disarms LC or pops the enemy's Linken's before a fight."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [
      "black_king_bar",
      "invis_sword",
      "blade_mail"
    ],
    "primary_role_ru": "Оффлейнер • Точечный Duel и хил/диспел Press the Attack",
    "primary_role_en": "Offlaner • Single-target Duel and Press the Attack heal/dispel"
  },
  "leshrac": {
    "primary_role_uk": "Мідер • Постійна AoE магічна шкода Pulse Nova та Bloodstone-хіл",
    "threats": [
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Pulse Nova + Diabolic Edict",
        "note_uk": "Колосальний безперервний магічний ДПС навколо героя.",
        "note_ru": "Колоссальный непрерывный магический ДПС вокруг героя.",
        "note_en": "Colossal continuous magical DPS around the hero."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Split Earth + Lightning Storm",
        "note_uk": "Швидка серія магічних нюків і станів.",
        "note_ru": "Быстрая серия магических нюков и станов.",
        "note_en": "Rapid barrage of magic nukes and stuns."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Bloodstone + Pulse Nova",
        "note_uk": "Лікується на фул HP через магічний вампіризм.",
        "note_ru": "Лечится на фулл HP через магический вампиризм.",
        "note_en": "Heals to full HP through spell lifesteal."
      }
    ],
    "priority_items": [
      {
        "item_key": "pipe",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Зрізає безперервний AoE-урон Pulse Nova по всій команді.",
        "reason_ru": "Срезает непрерывный AoE-урон Pulse Nova по всей команде.",
        "reason_en": "Mitigates the continuous AoE magic damage of Pulse Nova across the team."
      },
      {
        "item_key": "mage_slayer",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Зменшує шкоду всіх заклинань Leshrac на 40%, одночасно ріжучи його відхіл.",
        "reason_ru": "Уменьшает урон всех заклинаний Leshrac на 40%, одновременно срезая его отхил.",
        "reason_en": "Reduces all of Leshrac's spell damage by 40% while simultaneously cutting his spell lifesteal."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Повністю ігнорує Pulse Nova та Split Earth у вирішальному фокусі.",
        "reason_ru": "Полностью игнорирует Pulse Nova и Split Earth в решающем фокусе.",
        "reason_en": "Completely ignores Pulse Nova and Split Earth during decisive focus."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3
    ],
    "typical_items": [
      "black_king_bar"
    ],
    "primary_role_ru": "Мидер • Постоянный AoE магический урон Pulse Nova и Bloodstone-хил",
    "primary_role_en": "Midlaner • Constant AoE magic damage Pulse Nova and Bloodstone heal"
  },
  "life_stealer": {
    "primary_role_uk": "Керрі • Вампіризм Feast, анти-танк шкода та вбудоване BKB (Rage)",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Feast + Open Wounds + Infest",
        "note_uk": "Високий відсотковий вампіризм від кожної атаки.",
        "note_ru": "Высокий процентный вампиризм от каждой атаки.",
        "note_en": "High percentage-based lifesteal on every attack."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Rage + Feast",
        "note_uk": "Стирає жирних танків процентним фізичним уроном.",
        "note_ru": "Стирает жирных танков процентным физическим уроном.",
        "note_en": "Melts tanky heroes with percentage-based physical damage."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Найкращий кайт Lifestealer — працює крізь його Rage і рве дистанцію.",
        "reason_ru": "Лучший кайт Lifestealer — работает сквозь его Rage и разрывает дистанцию.",
        "reason_en": "Best kiting tool against Lifestealer — works during his Rage and creates distance."
      },
      {
        "item_key": "skadi",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Уповільнює та ріже вампіризм Feast на 50% (ігнорує дебаф-імунітет частково через атаку).",
        "reason_ru": "Замедляет и режет вампиризм Feast на 50% (работает через атаки сквозь иммунитет к эффектам).",
        "reason_en": "Slows and reduces Feast lifesteal by 50% (applies through right-attacks)."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зупиняє атаки, коли Rage у КД.",
        "reason_ru": "Останавливает атаки, когда Rage на перезарядке.",
        "reason_en": "Stops his attacks while Rage is on cooldown."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4
    ],
    "typical_items": [
      "satanic"
    ],
    "primary_role_ru": "Керри • Вампиризм Feast, анти-танк урон и встроенное BKB (Rage)",
    "primary_role_en": "Carry • Feast lifesteal, anti-tank damage, and built-in BKB (Rage)"
  },
  "medusa": {
    "primary_role_uk": "Керрі • Спліт-атаки, Stone Gaze та пасивний Mana Shield",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Split Shot",
        "note_uk": "Розстрілює всю команду одночасно в пізній грі.",
        "note_ru": "Расстреливает всю команду одновременно в поздней игре.",
        "note_en": "Shoots the entire enemy team simultaneously in the late game."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Stone Gaze / Gorgon's Grasp",
        "note_uk": "Камʼяніє при погляді та привʼязує в бою.",
        "note_ru": "Обращает в камень при взгляде и привязывает в бою.",
        "note_en": "Turns enemies Looking at her to stone and roots in combat."
      }
    ],
    "priority_items": [
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Блокує масові фізичні стріли Split Shot по команді.",
        "reason_ru": "Блокирует массовые физические стрелы Split Shot по команде.",
        "reason_en": "Blocks the AoE physical arrows of Split Shot across the team."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Вимикає атаки Medusa на 3.5 с у розпал бійки.",
        "reason_ru": "Отключает атаки Medusa на 3.5 с в разгар драки.",
        "reason_en": "Disarms Medusa for 3.5s in the middle of a teamfight."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Допомагає розвернутися або вийти із зони Stone Gaze.",
        "reason_ru": "Помогает развернуться или выйти из зоны Stone Gaze.",
        "reason_en": "Helps turn away or push out of Stone Gaze."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3
    ],
    "typical_items": [
      "butterfly"
    ],
    "primary_role_ru": "Керри • Сплит-атаки, Stone Gaze и пассивный Mana Shield",
    "primary_role_en": "Carry • Split-shot attacks, Stone Gaze, and passive Mana Shield"
  },
  "meepo": {
    "primary_role_uk": "Керрі / Мідер • Кілька клонів, сітки Earthbind і вампіризм Ransack",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Divided We Stand",
        "note_uk": "Кожен клон бʼє і кастує, потребує жорсткого AoE та фокусу в одного.",
        "note_ru": "Каждый клон бьет и кастует, требует жесткого AoE и фокуса в одного.",
        "note_en": "Every clone attacks and casts spells; requires hard AoE and single-target focus."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Earthbind",
        "note_uk": "Нескінченний ланцюг сіток не дає рухатися.",
        "note_ru": "Бесконечная цепочка сеток не дает двигаться.",
        "note_en": "Endless chain of nets prevents movement."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Ransack",
        "note_uk": "Усі Meepo одночасно відхілюються з атак.",
        "note_ru": "Все Meepo одновременно отхиливаются с атак.",
        "note_en": "All Meepo clones simultaneously heal from attacks."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Виштовхує з нескінченних сіток Earthbind.",
        "reason_ru": "Выталкивает из бесконечных сеток Earthbind.",
        "reason_en": "Pushes targets out of endless Earthbind nets."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Дає ігнорувати сітки та вижити під Poof-прокастом.",
        "reason_ru": "Позволяет игнорировать сетки и выжить под Poof-прокастом.",
        "reason_en": "Allows ignoring nets and surviving the Poof burst."
      },
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Зрізає фізичні атаки від усіх клонів одразу.",
        "reason_ru": "Срезает физические атаки от всех клонов сразу.",
        "reason_en": "Blocks physical damage from all clones at once."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      1
    ],
    "typical_items": [
      "butterfly"
    ],
    "primary_role_ru": "Керри / Мидер • Несколько клонов, сетки Earthbind и вампиризм Ransack",
    "primary_role_en": "Carry / Midlaner • Multiple clones, Earthbind nets, and Ransack lifesteal"
  },
  "mirana": {
    "primary_role_uk": "Сапорт / Керрі • Глобальний інвіз команди Moonlight Shadow",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Moonlight Shadow",
        "note_uk": "Робить всю ворожу команду невидимою для ганків та порятунку.",
        "note_ru": "Делает всю вражескую команду невидимой для ганков и спасения.",
        "note_en": "Turns the entire enemy team invisible for ganks and saves."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Leap",
        "note_uk": "Швидке переміщення й ініціація.",
        "note_ru": "Быстрое перемещение и инициация.",
        "note_en": "Fast mobility and initiation."
      }
    ],
    "priority_items": [
      {
        "item_key": "dust",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Зриває масовий відступ ворожої команди під Moonlight Shadow.",
        "reason_ru": "Срывает массовое отступление вражеской команды под Moonlight Shadow.",
        "reason_en": "Foils the enemy team's mass retreat or smoke gank under Moonlight Shadow."
      },
      {
        "item_key": "ward_sentry",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обовʼязкові Sentry на ключових підходах проти глобального інвізу.",
        "reason_ru": "Обязательные Sentry на ключевых подходах против глобального инвиза.",
        "reason_en": "Mandatory Sentries on key approaches against global invisibility."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      1,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Саппорт / Керри • Глобальный инвиз команды Moonlight Shadow",
    "primary_role_en": "Support / Carry • Global team invisibility Moonlight Shadow"
  },
  "nyx_assassin": {
    "primary_role_uk": "Сапорт / Мідер • Інвіз Vendetta, магічний бурст і Carapace",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Vendetta",
        "note_uk": "Раптовий вихід із невидимості з величезним ударом.",
        "note_ru": "Внезапный выход из невидимости с огромным ударом.",
        "note_en": "Sudden strike from invisibility with massive burst."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Vendetta + Impale + Mind Flare",
        "note_uk": "Стирає інтелект-героїв і тонких сапортів за 1 прокаст.",
        "note_ru": "Стирает интеллект-героев и тонких саппортов за 1 прокаст.",
        "note_en": "Deletes intelligence heroes and squishy supports in one combo."
      },
      {
        "tag": "damage_reflection",
        "severity": 2,
        "source_ability": "Spiked Carapace",
        "note_uk": "Відбиває перший удар/нюк і станить атакуючого.",
        "note_ru": "Отражает первый удар/нюк и станит атакующего.",
        "note_en": "Reflects the first attack/nuke and stuns the attacker."
      }
    ],
    "priority_items": [
      {
        "item_key": "ward_sentry",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Захищає сапортів і корів від раптового заходу під Vendetta.",
        "reason_ru": "Защищает саппортов и коров от внезапного нападения под Vendetta.",
        "reason_en": "Protects supports and cores from sudden Vendetta ganks."
      },
      {
        "item_key": "dust",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Nyx втекти після розкриття.",
        "reason_ru": "Не дает Nyx сбежать после раскрытия.",
        "reason_en": "Prevents Nyx from escaping after revealing himself."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Блокує відбиття Carapace та всю серію станів.",
        "reason_ru": "Блокирует отражение Spiked Carapace и всю серию станов.",
        "reason_en": "Blocks Spiked Carapace reflection and his entire stun chain."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      2
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Саппорт / Мидер • Инвиз Vendetta, магический бурст и Carapace",
    "primary_role_en": "Support / Midlaner • Vendetta invis, magic burst, and Carapace"
  },
  "omniknight": {
    "primary_role_uk": "Сапорт / Оффлейнер • Імунітет Repel, фіз-імунітет Guardian Angel та хіл",
    "threats": [
      {
        "tag": "dispellable_save",
        "severity": 3,
        "source_ability": "Guardian Angel / Repel",
        "note_uk": "Повний захист цілі від фізичної шкоди в ульті.",
        "note_ru": "Полная защита цели от физического урона в ульте.",
        "note_en": "Complete protection from physical damage during ultimate."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Purification + Repel",
        "note_uk": "Сильне разове зцілення й реген.",
        "note_ru": "Сильное разовое исцеление и реген.",
        "note_en": "Strong burst heal and regeneration."
      }
    ],
    "priority_items": [
      {
        "item_key": "nullifier",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Безперервно знімає Guardian Angel з цілі, дозволяючи пробити фізичною шкодою.",
        "reason_ru": "Непрерывно снимает Guardian Angel с цели, позволяя пробить физическим уроном.",
        "reason_en": "Continuously dispels Guardian Angel from the target, allowing physical damage to go through."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зменшує ефективність Purification і Repel-регену.",
        "reason_ru": "Уменьшает эффективность Purification и регена от Repel.",
        "reason_en": "Reduces the effectiveness of Purification and Repel regeneration."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      3,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Саппорт / Оффлейнер • Иммунитет Repel, физ-иммунитет Guardian Angel и хил",
    "primary_role_en": "Support / Offlaner • Repel immunity, Guardian Angel physical immunity, and heal"
  },
  "oracle": {
    "primary_role_uk": "Сапорт • Порятунок False Promise з подвійним хілом",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "False Promise + Purifying Flames",
        "note_uk": "Лікує ціль під False Promise у подвійному розмірі.",
        "note_ru": "Лечит цель под False Promise в двойном размере.",
        "note_en": "Heals the target under False Promise for double the amount."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Fate's Edict",
        "note_uk": "Захист від магії або роззброєння ворога.",
        "note_ru": "Защита от магии или разоружение врага.",
        "note_en": "Magic damage immunity or enemy disarm."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Ріже подвоєний хіл під False Promise на 70% — врятований ворог майже гарантовано помре.",
        "reason_ru": "Режет удвоенный хил под False Promise на 70% — спасенный враг почти гарантированно умрет.",
        "reason_en": "Reduces the doubled healing during False Promise by 70% — the saved enemy is almost guaranteed to die."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт • Спасение False Promise с двойным хилом",
    "primary_role_en": "Support • False Promise save with double healing"
  },
  "puck": {
    "primary_role_uk": "Мідер • Екстремальна мобільність, масовий Silence і Dream Coil",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Phase Shift + Illusory Orb + Waning Rift",
        "note_uk": "Невловимий без миттєвого Hex або сайленсу.",
        "note_ru": "Неуязвим без мгновенного Hex или сайленса.",
        "note_en": "Elusive without instant Hex or silence."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "Waning Rift",
        "note_uk": "АоЕ-сайленс у комбінації.",
        "note_ru": "AoE-сайленс в комбинации.",
        "note_en": "AoE silence in combo."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Dream Coil",
        "note_uk": "Фіксує команду привʼязкою з великим станом при розриві.",
        "note_ru": "Фиксирует команду привязкой с большим станом при разрыве.",
        "note_en": "Tethers the enemy team with a heavy stun if broken."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Combos",
        "note_uk": "Вибухова магічна шкода в ранньому і середньому етапі.",
        "note_ru": "Взрывной магический урон в ранней и средней стадии.",
        "note_en": "Explosive magic damage in the early and mid game."
      }
    ],
    "priority_items": [
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєвий Hex ловить Puck до натискання Phase Shift.",
        "reason_ru": "Мгновенный Hex ловит Puck до нажатия Phase Shift.",
        "reason_en": "Instant Hex catches Puck before Phase Shift can be pressed."
      },
      {
        "item_key": "orchid",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Примушує Puck рано купувати Eul/BKB і блокує всі ескейпи.",
        "reason_ru": "Вынуждает Puck рано покупать Eul/BKB и блокирует все эскейпы.",
        "reason_en": "Forces Puck to buy an early Eul's/BKB and locks down all escape spells."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дає безпечно розірвати Dream Coil без стану.",
        "reason_ru": "Позволяет безопасно разорвать Dream Coil без стана.",
        "reason_en": "Allows safely breaking Dream Coil without taking the stun."
      }
    ],
    "default_position": 2,
    "positions": [
      2
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Мидер • Экстремальная мобильность, массовый Silence и Dream Coil",
    "primary_role_en": "Midlaner • Extreme mobility, AoE Silence, and Dream Coil"
  },
  "pugna": {
    "primary_role_uk": "Сапорт / Мідер • Потоковий Life Drain і астрал Decrepify",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Life Drain",
        "note_uk": "Висмоктує величезний обсяг здоровʼя або лікує свого кору.",
        "note_ru": "Высасывает огромный объем здоровья или лечит своего кора.",
        "note_en": "Drains a massive amount of health or heals his own core."
      },
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Life Drain",
        "note_uk": "Потоковий ультимат легко збити станом чи Eul.",
        "note_ru": "Потоковый ультимейт легко сбить станом или Eul.",
        "note_en": "Channeled ultimate is easily interrupted by a stun or Eul's."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Decrepify",
        "note_uk": "Астральний захист від фіз-ударів легко знімається Nullifier.",
        "note_ru": "Астральная защита от физ-ударов легко снимается Nullifier.",
        "note_en": "Ethereal protection against physical attacks is easily dispelled by Nullifier."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Nether Blast + Nether Ward",
        "note_uk": "Карає кастерів за витрачену ману.",
        "note_ru": "Наказывает кастеров за потраченную ману.",
        "note_en": "Punishes casters for spending mana."
      }
    ],
    "priority_items": [
      {
        "item_key": "nullifier",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Знімає Decrepify з Pugna та його союзників.",
        "reason_ru": "Снимает Decrepify с Pugna и его союзников.",
        "reason_en": "Dispels Decrepify from Pugna and his allies."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Зрізає лікування від Life Drain на 70%.",
        "reason_ru": "Срезает лечение от Life Drain на 70%.",
        "reason_en": "Reduces Life Drain healing by 70%."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      2
    ],
    "typical_items": [
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт / Мидер • Потоковый Life Drain и астрал Decrepify",
    "primary_role_en": "Support / Midlaner • Channeled Life Drain and Decrepify ethereal"
  },
  "sand_king": {
    "primary_role_uk": "Оффлейнер / Мідер • Sand Storm (інвіз), Burrowstrike та Epicenter",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 2,
        "source_ability": "Sand Storm",
        "note_uk": "Ховається в піщаній бурі, наносячи постійну AoE-шкоду.",
        "note_ru": "Прячется в песчаной буре, нанося постоянный AoE-урон.",
        "note_en": "Hides in a sandstorm while dealing constant AoE damage."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Epicenter + Burrowstrike",
        "note_uk": "Масивний магічний прокаст і стан по лінії.",
        "note_ru": "Массивный магический прокаст и стан по линии.",
        "note_en": "Massive magic burst and linear stun."
      },
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Sand Storm",
        "note_uk": "Тривала магічна шкода в центрі бійки.",
        "note_ru": "Длительный магический урон в центре драки.",
        "note_en": "Sustained magic damage in the center of the fight."
      }
    ],
    "priority_items": [
      {
        "item_key": "dust",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Розкриває Sand Storm і не дає SK безкарно сидіти в піску.",
        "reason_ru": "Раскрывает Sand Storm и не дает SK безнаказанно сидеть в песке.",
        "reason_en": "Reveals Sand King inside Sand Storm so he cannot sit in the sand unpunished."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Поглинає Epicenter і постійний урон Sand Storm.",
        "reason_ru": "Поглощает Epicenter и постоянный урон Sand Storm.",
        "reason_en": "Absorbs Epicenter pulses and the continuous magic damage of Sand Storm."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Повний захист від Burrowstrike + Epicenter.",
        "reason_ru": "Полная защита от Burrowstrike + Epicenter.",
        "reason_en": "Complete protection against the Burrowstrike + Epicenter combo."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер / Мидер • Sand Storm (инвиз), Burrowstrike и Epicenter",
    "primary_role_en": "Offlaner / Midlaner • Sand Storm (invis), Burrowstrike, and Epicenter"
  },
  "silencer": {
    "primary_role_uk": "Сапорт / Керрі • Глобальний Global Silence і Last Word",
    "threats": [
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Global Silence + Last Word",
        "note_uk": "Накладає безмовність на всю команду через всю карту.",
        "note_ru": "Накладывает безмолвие на всю команду через всю карту.",
        "note_en": "Silences the entire enemy team across the map."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєво знімає Global Silence та Last Word із ключового кору.",
        "reason_ru": "Мгновенно снимает Global Silence и Last Word с ключевого кора.",
        "reason_en": "Instantly dispels Global Silence and Last Word from a key core."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Надійно знімає глобальний сайленс із себе для сапорта/мага.",
        "reason_ru": "Надежно снимает глобальный сайленс с себя для саппорта или мага.",
        "reason_en": "Reliably self-dispels Global Silence for a support or spellcaster."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє кору скинути Global Silence у момент ініціації.",
        "reason_ru": "Позволяет кору сбросить Global Silence в момент инициации.",
        "reason_en": "Allows a core to purge Global Silence at the moment of initiation."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      2
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт / Керри • Глобальный Global Silence и Last Word",
    "primary_role_en": "Support / Carry • Global Silence and Last Word"
  },
  "skywrath_mage": {
    "primary_role_uk": "Сапорт / Мідер • Миттєвий точковий Silence і прокаст Mystic Flare",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Mystic Flare + Ancient Seal",
        "note_uk": "Знищує ціль без сейву за 1.5 секунди магією.",
        "note_ru": "Уничтожает цель без сейва за 1.5 секунды магией.",
        "note_en": "Vaporizes an unsaved target in 1.5 seconds with magic damage."
      },
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Ancient Seal",
        "note_uk": "Миттєвий довгий сайленс із підсиленням магічної шкоди.",
        "note_ru": "Мгновенный долгий сайленс с усилением магического урона.",
        "note_en": "Instant long silence with magic damage amplification."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Ancient Seal / Rod of Atos",
        "note_uk": "Комбо з точковим сайленсом і рутом.",
        "note_ru": "Комбо с точечным сайленсом и рутом.",
        "note_en": "Combo with single-target silence and root."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Миттєво виштовхує союзника з зони Mystic Flare (зводячи ульт до 0 шкоди).",
        "reason_ru": "Мгновенно выталкивает союзника из зоны Mystic Flare (сводя ульт к 0 урона).",
        "reason_en": "Instantly pushes an ally out of Mystic Flare (reducing the ultimate to zero damage)."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Барʼєр і інвіз рятують союзника від смерті під Mystic Flare.",
        "reason_ru": "Барьер и инвиз спасают союзника от смерти под Mystic Flare.",
        "reason_en": "The magic barrier and invisibility save an ally from dying to Mystic Flare."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає Ancient Seal і відбиває точковий сайленс.",
        "reason_ru": "Снимает Ancient Seal и отражает направленный сайленс.",
        "reason_en": "Dispels Ancient Seal and reflects the single-target silence."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      2,
      5
    ],
    "typical_items": [
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт / Мидер • Мгновенный точечный Silence и прокаст Mystic Flare",
    "primary_role_en": "Support / Midlaner • Instant single-target Silence and Mystic Flare burst"
  },
  "slark": {
    "primary_role_uk": "Керрі • Інвіз Shadow Dance, Pounce-привʼязка та пасивний реген",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Shadow Dance (Barracuda)",
        "note_uk": "Шалений реген поза видимістю ворога.",
        "note_ru": "Бешеный реген вне видимости врага.",
        "note_en": "Insane regeneration when out of enemy vision."
      },
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Shadow Dance / Depth Shroud",
        "note_uk": "Невразливість до таргетингу в хмарі (але AoE та Force рятують).",
        "note_ru": "Неуязвимость к таргетингу в облаке (но AoE и Force спасают).",
        "note_en": "Untargetable in shadow cloud (though AoE and Force Staff counter it)."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Pounce",
        "note_uk": "Привʼязка не дає блінкатися та тікати.",
        "note_ru": "Привязка не дает блинкаться и убегать.",
        "note_en": "Leash prevents blinking and escaping."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Pounce",
        "note_uk": "Мобільні заходи і втечі.",
        "note_ru": "Мобильные заходы и побеги.",
        "note_en": "Mobile engagements and escapes."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Одразу розриває привʼязку Pounce, рятуючи сапортів і рендж-корів.",
        "reason_ru": "Сразу разрывает привязку Pounce, спасая саппортов и рендж-коров.",
        "reason_en": "Immediately breaks the Pounce leash, saving supports and ranged cores."
      },
      {
        "item_key": "hurricane_pike",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Розриває Pounce і не дає Slark набивати Essence Shift.",
        "reason_ru": "Разрывает Pounce и не дает Slark набивать Essence Shift.",
        "reason_en": "Breaks Pounce and stops Slark from stacking Essence Shift."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає бити з руки та красти характеристики під Dark Pact.",
        "reason_ru": "Не дает бить с руки и красть характеристики под Dark Pact.",
        "reason_en": "Prevents right-clicking and stealing stats during Dark Pact."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3
    ],
    "typical_items": [
      "butterfly",
      "invis_sword"
    ],
    "primary_role_ru": "Керри • Инвиз Shadow Dance, Pounce-привязка и пассивный реген",
    "primary_role_en": "Carry • Shadow Dance invis, Pounce leash, and passive regen"
  },
  "storm_spirit": {
    "primary_role_uk": "Мідер • Безмежна мобільність Ball Lightning та магічний бурст",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Ball Lightning",
        "note_uk": "Влітає в беклайн через всю бійку без вікна реакції.",
        "note_ru": "Влетает в бэклайн через всю драку без окна реакции.",
        "note_en": "Zips into the backline across the entire fight with zero reaction window."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Overload + Static Remnant + Ball Lightning",
        "note_uk": "Швидко вбиває сапортів за час Electric Vortex.",
        "note_ru": "Быстро убивает саппортов за время Electric Vortex.",
        "note_en": "Quickly kills supports during Electric Vortex."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Electric Vortex",
        "note_uk": "Фіксує ціль під свій прокаст.",
        "note_ru": "Фиксирует цель под свой прокаст.",
        "note_en": "Locks down a target for his combo."
      }
    ],
    "priority_items": [
      {
        "item_key": "orchid",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Закриває Ball Lightning і робить Storm Spirit абсолютно беззахисним (поки немає BKB/Eul).",
        "reason_ru": "Закрывает Ball Lightning и делает Storm Spirit абсолютно беззащитным (пока нет BKB/Eul).",
        "reason_en": "Locks down Ball Lightning and leaves Storm Spirit completely helpless (until he gets BKB/Eul's)."
      },
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєвий Hex зупиняє вльоти та не дає відлетіти.",
        "reason_ru": "Мгновенный Hex останавливает влеты и не дает улететь.",
        "reason_en": "Instant Hex stops his zip-ins and prevents him from zipping away."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує Vortex, Overload та шкоду від прокасту.",
        "reason_ru": "Блокирует Electric Vortex, Overload и урон от прокаста.",
        "reason_en": "Blocks Electric Vortex, Overload, and his spell burst."
      }
    ],
    "default_position": 2,
    "positions": [
      2
    ],
    "typical_items": [
      "orchid",
      "black_king_bar"
    ],
    "primary_role_ru": "Мидер • Безграничная мобильность Ball Lightning и магический бурст",
    "primary_role_en": "Midlaner • Unlimited Ball Lightning mobility and magic burst"
  },
  "templar_assassin": {
    "primary_role_uk": "Мідер / Керрі • Meld-інвіз, Refraction та вибуховий фіз-урон",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Meld + Refraction",
        "note_uk": "Зрізає броню і вбиває тонких героїв з 2 ударів.",
        "note_ru": "Срезает броню и убивает тонких героев с 2 ударов.",
        "note_en": "Shreds armor and two-shots squishy heroes."
      },
      {
        "tag": "invisibility",
        "severity": 2,
        "source_ability": "Meld",
        "note_uk": "Засідка в нерухомій невидимості.",
        "note_ru": "Засада в неподвижной невидимости.",
        "note_en": "Stationary invisibility ambush."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Refraction",
        "note_uk": "Щит поглинає інстанси шкоди.",
        "note_ru": "Щит поглощает инстансы урона.",
        "note_en": "Shield absorbs damage instances."
      }
    ],
    "priority_items": [
      {
        "item_key": "dust",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає TA ховатися через Meld у бою.",
        "reason_ru": "Не дает TA прятаться через Meld в бою.",
        "reason_en": "Prevents TA from hiding with Meld in combat."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Тіки DoT швидко збивають усі заряди щита Refraction.",
        "reason_ru": "Тики DoT быстро сбивают все заряды щита Refraction.",
        "reason_en": "DoT ticks quickly burn through all Refraction shield instances."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Рятує сапортів від фокусу після удару Meld.",
        "reason_ru": "Спасает саппортов от фокуса после удара из Meld.",
        "reason_en": "Saves supports from being focused down after a Meld strike."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar"
    ],
    "primary_role_ru": "Мидер / Керри • Meld-инвиз, Refraction и взрывной физ-урон",
    "primary_role_en": "Midlaner / Carry • Meld invis, Refraction, and explosive physical damage"
  },
  "terrorblade": {
    "primary_role_uk": "Керрі • Ілюзії Metamorphosis, величезна броня та Sunder",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Conjure Image + Metamorphosis",
        "note_uk": "Сильні дальнобійні ілюзії з величезним фізичним ДПС.",
        "note_ru": "Сильные дальнобойные иллюзии с огромным физическим ДПС.",
        "note_en": "Strong ranged illusions with massive physical DPS."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Metamorphosis",
        "note_uk": "Колосальний фіз-урон по команді й будівлях.",
        "note_ru": "Колоссальный физ-урон по команде и строениям.",
        "note_en": "Colossal physical damage to heroes and buildings."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Sunder",
        "note_uk": "Міняється здоровʼям на лоу-HP із найближчим героєм.",
        "note_ru": "Меняется здоровьем на лоу-HP с ближайшим героем.",
        "note_en": "Swaps health at low HP with the nearest hero."
      }
    ],
    "priority_items": [
      {
        "item_key": "mjollnir",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Магічні блискавки ігнорують величезну базову броню TB та його ілюзій.",
        "reason_ru": "Магические молнии игнорируют огромную базовую броню TB и его иллюзий.",
        "reason_en": "Magic chain lightning ignores the massive base armor of TB and his illusions."
      },
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Блокує шкоду копій Conjure Image.",
        "reason_ru": "Блокирует урон копий Conjure Image.",
        "reason_en": "Blocks physical damage from Conjure Image illusions."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує Sunder і не дає Terrorblade перевернути бій на 10% HP.",
        "reason_ru": "Блокирует Sunder и не дает Terrorblade перевернуть бой на 10% HP.",
        "reason_en": "Blocks Sunder and stops Terrorblade from turning the fight at 10% HP."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3
    ],
    "typical_items": [
      "butterfly",
      "satanic"
    ],
    "primary_role_ru": "Керри • Иллюзии Metamorphosis, огромная броня и Sunder",
    "primary_role_en": "Carry • Metamorphosis illusions, massive armor, and Sunder"
  },
  "tidehunter": {
    "primary_role_uk": "Оффлейнер • Пасивне очищення Kraken Shell і Ravage",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Kraken Shell",
        "note_uk": "Блокує фіз-урон і самостійно знімає будь-який контроль після порогу шкоди.",
        "note_ru": "Блокирует физ-урон и самостоятельно снимает любой контроль после порога урона.",
        "note_en": "Blocks physical damage and automatically applies Strong Dispel after taking threshold damage."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Ravage + Gush",
        "note_uk": "Масовий AoE-стан на всю бійку.",
        "note_ru": "Массовый AoE-стан на всю драку.",
        "note_en": "Massive AoE stun across the entire teamfight."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Вимикає Kraken Shell — Tidehunter втрачає блок шкоди і саморозвіювання контролю.",
        "reason_ru": "Отключает Kraken Shell — Tidehunter теряет блок урона и саморазвеивание контроля.",
        "reason_en": "Disables Kraken Shell — Tidehunter loses both damage block and his Strong Dispel."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Захищає корів від ініціації через Ravage.",
        "reason_ru": "Защищает коров от инициации через Ravage.",
        "reason_en": "Protects cores from Ravage initiation."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [
      "satanic"
    ],
    "primary_role_ru": "Оффлейнер • Пассивное очищение Kraken Shell и Ravage",
    "primary_role_en": "Offlaner • Kraken Shell passive dispel and Ravage"
  },
  "shredder": {
    "primary_role_uk": "Мідер / Оффлейнер • Пасивка Reactive Armor, реген та чистий урон",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Reactive Armor",
        "note_uk": "Набирає величезну броню та регенерацію під атаками.",
        "note_ru": "Набирает огромную броню и регенерацию под атаками.",
        "note_en": "Stacks massive armor and regeneration when attacked."
      },
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Reactive Armor",
        "note_uk": "Без Break і анти-хілу майже не пробивається фізичною шкодою.",
        "note_ru": "Без Break и анти-хила почти не пробивается физическим уроном.",
        "note_en": "Nearly impervious to physical damage without Break and anti-heal."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Timber Chain",
        "note_uk": "Швидко втікає через дерева.",
        "note_ru": "Быстро убегает через деревья.",
        "note_en": "Quickly escapes through trees."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Вимикає Reactive Armor — Timbersaw миттєво втрачає всю пасивну броню та реген.",
        "reason_ru": "Отключает Reactive Armor — Timbersaw мгновенно теряет всю пассивную броню и реген.",
        "reason_en": "Disables Reactive Armor — Timbersaw instantly loses all passive armor and regeneration."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Ріже реген Reactive Armor на 70% і спалює HP магією.",
        "reason_ru": "Режет реген Reactive Armor на 70% и сжигает HP магией.",
        "reason_en": "Reduces Reactive Armor regeneration by 70% and burns HP with magic damage."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Мидер / Оффлейнер • Пассивка Reactive Armor, реген и чистый урон",
    "primary_role_en": "Midlaner / Offlaner • Reactive Armor passive, regen, and pure damage"
  },
  "tinker": {
    "primary_role_uk": "Мідер / Сапорт • Промахи Laser, щит та спам з телепортом",
    "threats": [
      {
        "tag": "evasion",
        "severity": 3,
        "source_ability": "Laser",
        "note_uk": "100% шанс промаху на 3+ секунди виключає фізичних корів.",
        "note_ru": "100% шанс промаха на 3+ секунды выключает физических коров.",
        "note_en": "100% miss chance for 3+ seconds shuts down physical cores."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Laser + March",
        "note_uk": "Високий чистий/магічний тиск.",
        "note_ru": "Высокое чистое/магическое давление.",
        "note_en": "High pure/magic damage pressure."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Warp Flare / Keen Conveyance",
        "note_uk": "Швидко стрибає по карті й ухиляється від фокусу.",
        "note_ru": "Быстро прыгает по карте и уклоняется от фокуса.",
        "note_en": "Rapidly teleports around the map and evades focus."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Скидає сліпоту Laser та захищає від Warp Flare.",
        "reason_ru": "Сбрасывает слепоту от Laser и защищает от Warp Flare.",
        "reason_en": "Dispels Laser blind and protects against Warp Flare."
      },
      {
        "item_key": "nullifier",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає захисний щит Defense Matrix та Blink/Glimmer.",
        "reason_ru": "Снимает защитный щит Defense Matrix и сбивает Blink/Glimmer.",
        "reason_en": "Dispels the Defense Matrix shield and cancels Blink/Glimmer."
      },
      {
        "item_key": "sheepstick",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Миттєво фіксує Tinker до відльоту.",
        "reason_ru": "Мгновенно фиксирует Tinker до отлета.",
        "reason_en": "Instantly locks down Tinker before he can blink or teleport away."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      4,
      5
    ],
    "typical_items": [],
    "primary_role_ru": "Мидер / Саппорт • Промахи Laser, щит и спам с телепортом",
    "primary_role_en": "Midlaner / Support • Laser blind, shield, and teleport spam"
  },
  "troll_warlord": {
    "primary_role_uk": "Керрі • Промахи Whirling Axes, пасивний Fervor та незнищенність Battle Trance",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Fervor + Battle Trance",
        "note_uk": "Максимальна швидкість атаки і величезний вампіризм в ульті.",
        "note_ru": "Максимальная скорость атаки и огромный вампиризм в ульте.",
        "note_en": "Max attack speed and massive lifesteal during ultimate."
      },
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Whirling Axes (Melee)",
        "note_uk": "Сокири накладають промахи по області.",
        "note_ru": "Топоры накладывают промахи по области.",
        "note_en": "Whirling Axes apply AoE blind."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Battle Trance",
        "note_uk": "Може відхілитися на повне HP під ультиматом.",
        "note_ru": "Может отхилиться на полное HP под ультимейтом.",
        "note_en": "Can heal back to full HP during ultimate."
      }
    ],
    "priority_items": [
      {
        "item_key": "heavens_halberd",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Обеззброює Troll у бою, коли він не втиснув BKB.",
        "reason_ru": "Обезоруживает Troll в бою, пока он не нажал BKB.",
        "reason_en": "Disarms Troll in combat when his BKB is not active."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Витягує союзника, якого Troll зафіксував під Battle Trance.",
        "reason_ru": "Вытягивает союзника, которого Troll зафиксировал под Battle Trance.",
        "reason_en": "Pulls out an ally who is being focused by Troll during Battle Trance."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Піднімає Troll у повітря та спалює секунди його Battle Trance.",
        "reason_ru": "Поднимает Troll в воздух и сжигает секунды его Battle Trance.",
        "reason_en": "Lifts Troll into the air, wasting precious seconds of his Battle Trance."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar",
      "satanic"
    ],
    "primary_role_ru": "Керри • Промахи Whirling Axes, пассивный Fervor и неубиваемость Battle Trance",
    "primary_role_en": "Carry • Whirling Axes blind, passive Fervor, and Battle Trance unkillability"
  },
  "ursa": {
    "primary_role_uk": "Керрі • Fury Swipes та Enrage (80% резисту + статус-резист)",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Overpower + Fury Swipes",
        "note_uk": "Миттєво розриває будь-кого в мілі-бою.",
        "note_ru": "Мгновенно разрывает любого в мили-бою.",
        "note_en": "Instantly shreds anyone in melee combat."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Enrage",
        "note_uk": "Потрібен кайт під час Enrage.",
        "note_ru": "Нужен кайт во время Enrage.",
        "note_en": "Must be kited during Enrage."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Кайтить Ursa під Enrage і не дає набити стаки Fury Swipes.",
        "reason_ru": "Кайтит Ursa под Enrage и не дает набить стаки Fury Swipes.",
        "reason_en": "Kites Ursa during Enrage and prevents him from stacking Fury Swipes."
      },
      {
        "item_key": "ghost",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Повністю рятує від серії швидких ударів Overpower.",
        "reason_ru": "Полностью спасает от серии быстрых ударов Overpower.",
        "reason_en": "Completely saves from the rapid flurry of Overpower attacks."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Перечікує Enrage у повітрі.",
        "reason_ru": "Позволяет переждать Enrage в воздухе.",
        "reason_en": "Waits out Enrage in the air."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3
    ],
    "typical_items": [
      "black_king_bar",
      "satanic"
    ],
    "primary_role_ru": "Керри • Fury Swipes и Enrage (80% резиста + статус-резист)",
    "primary_role_en": "Carry • Fury Swipes and Enrage (80% damage reduction + status resistance)"
  },
  "viper": {
    "primary_role_uk": "Мідер / Оффлейнер • Пасивка Corrosive Skin та токсин Viper Strike",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Corrosive Skin",
        "note_uk": "Дає високий опір магії та отруює кожного, хто завдає шкоди.",
        "note_ru": "Дает высокое сопротивление магии и отравляет каждого, кто наносит урон.",
        "note_en": "Grants high magic resistance and poisons anyone who deals damage."
      },
      {
        "tag": "damage_reflection",
        "severity": 2,
        "source_ability": "Corrosive Skin",
        "note_uk": "Контр-урон у відповідь на будь-які атаки чи заклинання.",
        "note_ru": "Контр-урон в ответ на любые атаки или заклинания.",
        "note_en": "Retaliates with corrosive damage against any attacks or spells."
      },
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Poison Attack + Viper Strike",
        "note_uk": "Сильно сповільнює та випалює здоровʼя.",
        "note_ru": "Сильно замедляет и выжигает здоровье.",
        "note_en": "Heavily slows and burns health."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виводить з калюжі Nethertoxin (де не працюють пасивки) та з-під фокусу Viper Strike.",
        "reason_ru": "Выводит из лужи Nethertoxin (где не работают пассивки) и из-под фокуса Viper Strike.",
        "reason_en": "Pushes targets out of the Nethertoxin pool (which applies Break) and away from Viper Strike focus."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує отруту Poison Attack, магічну шкоду Corrosive Skin і Nethertoxin.",
        "reason_ru": "Блокирует яд Poison Attack, магический урон Corrosive Skin и Nethertoxin.",
        "reason_en": "Blocks Poison Attack stacks and magic damage from Corrosive Skin and Nethertoxin."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зрізає постійну періодичну магічну шкоду отрут.",
        "reason_ru": "Срезает постоянный периодический магический урон от ядов.",
        "reason_en": "Mitigates the constant magic DoT from his poisons."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Мидер / Оффлейнер • Пассивка Corrosive Skin и токсин Viper Strike",
    "primary_role_en": "Midlaner / Offlaner • Corrosive Skin passive and Viper Strike toxin"
  },
  "weaver": {
    "primary_role_uk": "Керрі • Інвіз Shukuchi та відкат HP Time Lapse",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Shukuchi",
        "note_uk": "Кожні кілька секунд стає невидимим із максимальною швидкістю.",
        "note_ru": "Каждые несколько секунд становится невидимым с максимальной скоростью.",
        "note_en": "Turns invisible with max movement speed every few seconds."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Shukuchi",
        "note_uk": "Неможливо наздогнати без Dust/Sentry та контролю.",
        "note_ru": "Невозможно догнать без Dust/Sentry и контроля.",
        "note_en": "Impossible to catch without Dust/Sentry and lockdown."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Time Lapse",
        "note_uk": "Повертає повний запас здоровʼя на 5 секунд назад.",
        "note_ru": "Возвращает полный запас здоровья на 5 секунд назад.",
        "note_en": "Rewinds health and position back 5 seconds."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Geminate Attack",
        "note_uk": "Подвійна атака сильно бʼє тонких сапортів.",
        "note_ru": "Двойная атака сильно бьет тонких саппортов.",
        "note_en": "Double attack hits squishy supports hard."
      }
    ],
    "priority_items": [
      {
        "item_key": "dust",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Розкриває і сповільнює Weaver під час Shukuchi.",
        "reason_ru": "Раскрывает и замедляет Weaver во время Shukuchi.",
        "reason_en": "Reveals and slows Weaver during Shukuchi."
      },
      {
        "item_key": "orchid",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Сайленс не дає натиснути ні Shukuchi, ні Time Lapse.",
        "reason_ru": "Сайленс не дает нажать ни Shukuchi, ни Time Lapse.",
        "reason_en": "Silence prevents Weaver from casting either Shukuchi or Time Lapse."
      },
      {
        "item_key": "ward_sentry",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Фіксує переміщення Weaver у файті.",
        "reason_ru": "Фиксирует перемещение Weaver в файте.",
        "reason_en": "Locks down Weaver's mobility in teamfights."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4,
      5
    ],
    "typical_items": [
      "butterfly"
    ],
    "primary_role_ru": "Керри • Инвиз Shukuchi и откат HP Time Lapse",
    "primary_role_en": "Carry • Shukuchi invis and Time Lapse HP rewind"
  },
  "windrunner": {
    "primary_role_uk": "Керрі / Сапорт • 100% ухилення Windrun та Focus Fire",
    "threats": [
      {
        "tag": "evasion",
        "severity": 3,
        "source_ability": "Windrun",
        "note_uk": "100% ухилення від фізичних атак і висока швидкість бігу.",
        "note_ru": "100% уклонение от физических атак и высокая скорость бега.",
        "note_en": "100% evasion against physical attacks and high movement speed."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Focus Fire",
        "note_uk": "Максимальна швидкість атаки по одній цілі.",
        "note_ru": "Максимальная скорость атаки по одной цели.",
        "note_en": "Maximum attack speed against a single target."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Windrun",
        "note_uk": "Швидкий ескейп та маневрування.",
        "note_ru": "Быстрый эскейп и маневрирование.",
        "note_en": "Fast escape and maneuvering."
      }
    ],
    "priority_items": [
      {
        "item_key": "monkey_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Пробиває 100% ухилення Windrun.",
        "reason_ru": "Пробивает 100% уклонения Windrun.",
        "reason_en": "Pierces the 100% evasion of Windrun."
      },
      {
        "item_key": "nullifier",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Миттєво знімає Windrun і сповільнює Windranger.",
        "reason_ru": "Мгновенно снимает Windrun и замедляет Windranger.",
        "reason_en": "Instantly dispels Windrun and slows Windranger."
      },
      {
        "item_key": "blade_mail",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Карає WR під час ультимату Focus Fire (поки не натиснуте BKB).",
        "reason_ru": "Наказывает WR во время ультимейта Focus Fire (пока не нажато BKB).",
        "reason_en": "Punishes WR during her Focus Fire ultimate (unless BKB is active)."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      4
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Керри / Саппорт • 100% уклонение Windrun и Focus Fire",
    "primary_role_en": "Carry / Support • 100% Windrun evasion and Focus Fire"
  },
  "witch_doctor": {
    "primary_role_uk": "Сапорт • Потоковий Death Ward, прокляття Maledict і хіл",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Death Ward",
        "note_uk": "Тотем завдає колосальної чистої/фізичної шкоди, доки його не зібʼють.",
        "note_ru": "Тотем наносит колоссальный чистый/физический урон, пока его не собьют.",
        "note_en": "Death Ward deals colossal pure/physical damage until interrupted."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Voodoo Restoration",
        "note_uk": "Постійний командний хіл навколо себе.",
        "note_ru": "Постоянный командный хил вокруг себя.",
        "note_en": "Constant AoE team heal around himself."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Maledict",
        "note_uk": "Помножує будь-яку втрату HP вибуховою магічною шкодою.",
        "note_ru": "Умножает любую потерю HP взрывным магическим уроном.",
        "note_en": "Multiplies any HP loss with explosive burst magic damage."
      }
    ],
    "priority_items": [
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Збиває Death Ward на великій відстані або перечікує тік Maledict.",
        "reason_ru": "Сбивает Death Ward на большом расстоянии или позволяет переждать тик Maledict.",
        "reason_en": "Interrupts Death Ward from long range or dodges a Maledict burst tick."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Рятує союзників від смертельного вибуху Maledict.",
        "reason_ru": "Спасает союзников от смертельного взрыва Maledict.",
        "reason_en": "Saves allies from lethal Maledict burst ticks."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Виводить ціль із радіусу атаки Death Ward.",
        "reason_ru": "Выводит цель из радиуса атаки Death Ward.",
        "reason_en": "Pushes the target out of Death Ward's attack range."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "black_king_bar",
      "glimmer_cape"
    ],
    "primary_role_ru": "Саппорт • Потоковый Death Ward, проклятие Maledict и хил",
    "primary_role_en": "Support • Channeled Death Ward, Maledict curse, and heal"
  },
  "ringmaster": {
    "primary_role_uk": "Сапорт • Сейв Escape Act, страх Tame the Beasts та Spotlight",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Tame the Beasts",
        "note_uk": "Потоковий батіг викликає масовий страх і шкоду.",
        "note_ru": "Потоковый кнут вызывает массовый страх и урон.",
        "note_en": "Channeled whip inflicts AoE fear and damage."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Wheel of Wonder / Impalement Arts",
        "note_uk": "Висока магічна шкода та контроль у командній бійці.",
        "note_ru": "Высокий магический урон и контроль в командной драке.",
        "note_en": "High magic damage and crowd control in teamfights."
      },
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Spotlight",
        "note_uk": "Промінь змушує промахуватися атаками в зоні дії.",
        "note_ru": "Луч заставляет промахиваться атаками в зоне действия.",
        "note_en": "Spotlight beam causes attacks to miss in the area."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ігнорує Wheel of Wonder, Tame the Beasts та промахи Spotlight.",
        "reason_ru": "Игнорирует Wheel of Wonder, Tame the Beasts и промахи от Spotlight.",
        "reason_en": "Ignores Wheel of Wonder, Tame the Beasts, and Spotlight miss chance."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Виводить союзника з зони Wheel of Wonder або Spotlight.",
        "reason_ru": "Выводит союзника из зоны Wheel of Wonder или Spotlight.",
        "reason_en": "Pushes an ally out of the Wheel of Wonder or Spotlight area."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Саппорт • Сейв Escape Act, страх Tame the Beasts и Spotlight",
    "primary_role_en": "Support • Escape Act save, Tame the Beasts fear, and Spotlight"
  },
  "sven": {
    "primary_role_uk": "Керрі • Вибуховий фізичний бурст God's Strength, Cleave і Storm Hammer",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "God's Strength + Great Cleave",
        "note_uk": "Подвійна/потроєна шкода з руки стирає команду за кілька ударів.",
        "note_ru": "Двойной/тройной урон с руки стирает команду за несколько ударов.",
        "note_en": "Double/triple right-click damage wipes a team in a few swings."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Storm Hammer",
        "note_uk": "Точковий AoE-стан для ініціації.",
        "note_ru": "Точечный AoE-стан для инициации.",
        "note_en": "Targeted AoE stun for initiation."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Warcry",
        "note_uk": "Дає команді бонусну броню і швидкість, але знімається Nullifier.",
        "note_ru": "Дает команде бонусную броню и скорость, но снимается Nullifier.",
        "note_en": "Grants bonus armor and speed to the team, but is dispelled by Nullifier."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Кайтить Sven під час God's Strength і рятує від фокусу після Storm Hammer.",
        "reason_ru": "Кайтит Sven во время God's Strength и спасает от фокуса после Storm Hammer.",
        "reason_en": "Kites Sven during God's Strength and saves from focus after Storm Hammer."
      },
      {
        "item_key": "ghost",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Повністю блокує смертельні фізичні тички Sven.",
        "reason_ru": "Полностью блокирует смертельные физические тычки Sven.",
        "reason_en": "Completely blocks Sven's lethal physical right-clicks."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює Sven на 3.5 с, зриваючи його вікно God's Strength.",
        "reason_ru": "Обезоруживает Sven на 3.5 с, срывая его окно God's Strength.",
        "reason_en": "Disarms Sven for 3.5s, wasting his God's Strength window."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4,
      3
    ],
    "typical_items": [
      "black_king_bar",
      "satanic"
    ],
    "primary_role_ru": "Керри • Взрывной физический бурст God's Strength, Cleave и Storm Hammer",
    "primary_role_en": "Carry • Explosive God's Strength physical burst, Cleave, and Storm Hammer"
  },
  "skeleton_king": {
    "primary_role_uk": "Керрі / Оффлейнер • Пасивний крит, скелети й друге життя Reincarnation",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Mortal Strike",
        "note_uk": "Потужні критичні удари з руки.",
        "note_ru": "Мощные критические удары с руки.",
        "note_en": "Powerful right-click critical strikes."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Bone Guard",
        "note_uk": "Зграя скелетів тисне по лініях і в бійці.",
        "note_ru": "Стая скелетов давит по линиям и в драке.",
        "note_en": "Skeleton pack pushes lanes and pressures teamfights."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Mortal Strike / Vampiric Spirit",
        "note_uk": "Пасивні крити та вампіризм.",
        "note_ru": "Пассивные криты и вампиризм.",
        "note_en": "Passive crits and lifesteal."
      }
    ],
    "priority_items": [
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує шкоду від зграї скелетів Bone Guard.",
        "reason_ru": "Блокирует урон от стаи скелетов Bone Guard.",
        "reason_en": "Blocks physical damage from the pack of Bone Guard skeletons."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Вимикає атаки Wraith King на 3.5 с.",
        "reason_ru": "Отключает атаки Wraith King на 3.5 с.",
        "reason_en": "Disarms Wraith King for 3.5s."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      3,
      4
    ],
    "typical_items": [
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Керри / Оффлейнер • Пассивный крит, скелеты и вторая жизнь Reincarnation",
    "primary_role_en": "Carry / Offlaner • Passive crit, skeletons, and Reincarnation second life"
  },
  "bounty_hunter": {
    "primary_role_uk": "Роумер / Інвіз • Shadow Walk і Track",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Shadow Walk",
        "note_uk": "Агресивний роумінг, підсвітка позицій та ініціація зі стану невидимості.",
        "note_ru": "Агрессивный роуминг, подсветка позиций и инициация из невидимости.",
        "note_en": "Aggressive roaming, vision scouting, and initiation from invisibility."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Track",
        "note_uk": "Позначає ціль, розкриває її для ворожої команди та дає бонусне золото за фраг.",
        "note_ru": "Помечает цель, раскрывает ее для вражеской команды и дает бонусное золото за фраг.",
        "note_en": "Tracks the target, grants True Sight, and awards bonus gold on kill."
      }
    ],
    "priority_items": [
      {
        "item_key": "dust",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Розкриває Shadow Walk і карає Bounty Hunter за агресивну розвідку.",
        "reason_ru": "Раскрывает Shadow Walk и наказывает Bounty Hunter за агрессивную разведку.",
        "reason_en": "Reveals Shadow Walk and punishes Bounty Hunter for aggressive scouting."
      },
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Знімає Track із союзників і відбиває Shuriken Toss/Track назад у BH.",
        "reason_ru": "Снимает Track с союзников и отражает Shuriken Toss/Track обратно в BH.",
        "reason_en": "Dispels Track from allies and reflects Shuriken Toss/Track back onto BH."
      },
      {
        "item_key": "ward_sentry",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Прикриває варди, ліс і корів від несподіваного виходу з інвізу.",
        "reason_ru": "Прикрывает варды, лес и коров от неожиданного выхода из инвиза.",
        "reason_en": "Covers wards, jungle entrances, and cores against sudden invisibility ganks."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      3,
      5
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Роумер / Инвиз • Shadow Walk и Track",
    "primary_role_en": "Roamer / Invis • Shadow Walk and Track"
  },
  "bristleback": {
    "primary_role_uk": "Фронтлейнер • Пасивка спини та сустейн",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Bristleback / Warpath",
        "note_uk": "Без Break неможливо швидко пробити спину, а пасивні колючки ламають файт.",
        "note_ru": "Без Break невозможно быстро пробить спину, а пассивные колючки ломают файт.",
        "note_en": "Without Break, his back is nearly impossible to burst, and passive quill sprays wreck fights."
      },
      {
        "tag": "damage_reflection",
        "severity": 3,
        "source_ability": "Bristleback",
        "note_uk": "Зрізає шкоду з тилу й автоматично розкидає Quill Spray у відповідь.",
        "note_ru": "Срезает урон с тыла и автоматически раскидывает Quill Spray в ответ.",
        "note_en": "Reduces rear damage and automatically triggers Quill Spray in response."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Spell Lifesteal / Sustain",
        "note_uk": "Тримається в центрі бійки через вампіризм від голок (Bloodstone/Sange/Shroud).",
        "note_ru": "Держится в центре драки через вампиризм от иголок (Bloodstone/Sange/Shroud).",
        "note_en": "Sustains in the middle of fights through spell lifesteal from quills (Bloodstone/Sange/Shroud)."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Вимикає пасивку спини Bristleback і блокує автоматичні викиди Quill Spray.",
        "reason_ru": "Отключает пассивку спины Bristleback и блокирует автоматические залпы Quill Spray.",
        "reason_en": "Disables the Bristleback passive, stopping both damage reduction and automatic Quill Spray procs."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зрізає вампіризм і реген Bristleback на 70% і спалює високий запас HP.",
        "reason_ru": "Срезает вампиризм и реген Bristleback на 70% и сжигает высокий запас HP.",
        "reason_en": "Cuts Bristleback's spell lifesteal and regen by 70% while burning his high HP pool."
      },
      {
        "item_key": "mage_slayer",
        "priority": "situational",
        "score_bonus": 4,
        "reason_uk": "Зменшує шкоду від частих залпів Quill Spray на 40%.",
        "reason_ru": "Уменьшает урон от частых залпов Quill Spray на 40%.",
        "reason_en": "Reduces damage from frequent Quill Spray volleys by 40%."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      1
    ],
    "typical_items": [
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Фронтлейнер • Пассивка спины и сустейн",
    "primary_role_en": "Frontliner • Back passive and sustain"
  },
  "rattletrap": {
    "primary_role_uk": "Ініціатор • Hookshot та ізоляція в Power Cogs",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Power Cogs",
        "note_uk": "Замикає ціль у кільці когів, відрізаючи від союзників.",
        "note_ru": "Запирает цель в кольце когов, отрезая от союзников.",
        "note_en": "Traps a target inside Power Cogs, cutting them off from allies."
      },
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Battery Assault + Hookshot",
        "note_uk": "Постійні мікростани збивають касти та не дають розвернутися.",
        "note_ru": "Постоянные микростаны сбивают касты и не дают развернуться.",
        "note_en": "Constant mini-stuns interrupt casts and prevent turning."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Hookshot",
        "note_uk": "Дальнє оглушення крізь BKB при влучанні крюком.",
        "note_ru": "Дальнее оглушение сквозь BKB при попадании хуком.",
        "note_en": "Long-range stun through BKB upon landing Hookshot."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 10,
        "reason_uk": "Класичний контр-предмет проти Clockwerk: миттєво виштовхує з Power Cogs та із зони Battery Assault.",
        "reason_ru": "Классический контр-предмет против Clockwerk: мгновенно выталкивает из Power Cogs и из зоны Battery Assault.",
        "reason_en": "Classic counter-item against Clockwerk: instantly pushes you out of Power Cogs and Battery Assault range."
      },
      {
        "item_key": "hurricane_pike",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Рятівний вихід із когів для рендж-корів із подальшим кайтингом.",
        "reason_ru": "Спасительный выход из когов для рендж-коров с последующим кайтингом.",
        "reason_en": "Escape tool out of cogs for ranged cores with follow-up kiting."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Блокує мікростани Battery Assault та магічний урон когів.",
        "reason_ru": "Блокирует микростаны Battery Assault и магический урон когов.",
        "reason_en": "Blocks Battery Assault mini-stuns and magic damage from cogs."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      3
    ],
    "typical_items": [
      "blade_mail"
    ],
    "primary_role_ru": "Инициатор • Hookshot и изоляция в Power Cogs",
    "primary_role_en": "Initiator • Hookshot and isolation in Power Cogs"
  },
  "huskar": {
    "primary_role_uk": "Темповий керрі • Екстремальний реген і пасивка",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Berserker's Blood",
        "note_uk": "Шалений реген на низькому здоров'ї робить героя практично безсмертним без анти-хілу.",
        "note_ru": "Бешеный реген на низком здоровье делает героя практически бессмертным без анти-хила.",
        "note_en": "Insane low-HP regeneration makes the hero practically unkillable without anti-heal."
      },
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Berserker's Blood",
        "note_uk": "Пасивка одночасно дає і шалену швидкість атаки, і магічний опір, і реген.",
        "note_ru": "Пассивка одновременно дает и бешеную скорость атаки, и магическое сопротивление, и реген.",
        "note_en": "Passive simultaneously grants insane attack speed, magic resistance, and regen."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Life Break",
        "note_uk": "Точковий стрибок, що зносить великий відсоток HP і нав'язує бій.",
        "note_ru": "Точечный прыжок, сносящий большой процент HP и навязывающий бой.",
        "note_en": "Targeted leap that chunks a large percentage of HP and forces a fight."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Burning Spear",
        "note_uk": "Набиває величезну швидкість атак на лоу-HP.",
        "note_ru": "Набивает огромную скорость атак на лоу-HP.",
        "note_en": "Gains massive attack speed at low HP."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Критичний предмет проти Huskar: ріже реген Berserker's Blood на 70% і добиває на низькому HP.",
        "reason_ru": "Критический предмет против Huskar: режет реген Berserker's Blood на 70% и добивает на низком HP.",
        "reason_en": "Crucial counter to Huskar: cuts Berserker's Blood regen by 70% and finishes him off at low HP."
      },
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Вимикає Berserker's Blood — Huskar миттєво втрачає швидкість атаки, опір магії та реген.",
        "reason_ru": "Отключает Berserker's Blood — Huskar мгновенно теряет скорость атаки, сопротивление магии и реген.",
        "reason_en": "Disables Berserker's Blood — Huskar instantly loses his bonus attack speed, magic resistance, and regen."
      },
      {
        "item_key": "skadi",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Стабільно ріже регенерацію на 50% і гальмує швидкість атаки Huskar.",
        "reason_ru": "Стабильно режет регенерацию на 50% и замедляет скорость атаки Huskar.",
        "reason_en": "Consistently cuts regeneration by 50% and slows Huskar's attack speed."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Обеззброює Huskar на 3.5 с, не даючи стакати Burning Spear.",
        "reason_ru": "Обезоруживает Huskar на 3.5 с, не давая стакать Burning Spear.",
        "reason_en": "Disarms Huskar for 3.5s, preventing him from stacking Burning Spear."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3,
      1
    ],
    "typical_items": [
      "black_king_bar",
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Темповый керри • Экстремальный реген и пассивка",
    "primary_role_en": "Tempo Carry • Extreme regen and passive"
  },
  "invoker": {
    "primary_role_uk": "Універсал • Магічне комбо, контроль та інвіз",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Chaos Meteor / Sun Strike / EMP",
        "note_uk": "Величезна AoE-шкода та випалювання мани в комбінації.",
        "note_ru": "Огромный AoE-урон и выжигание маны в комбинации.",
        "note_en": "Massive AoE damage and mana burn in combination."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "Tornado / Deafening Blast / Cold Snap",
        "note_uk": "Каскадний контроль і обеззброєння в командних бійках.",
        "note_ru": "Каскадный контроль и обезоруживание в командных драках.",
        "note_en": "Cascading crowd control and disarm in teamfights."
      },
      {
        "tag": "invisibility",
        "severity": 2,
        "source_ability": "Ghost Walk",
        "note_uk": "Надійний ескейп або ініціація в невидимості з високим регеном.",
        "note_ru": "Надежный эскейп или инициация в невидимости с высоким регеном.",
        "note_en": "Reliable escape or invisibility initiation with high regen."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Повністю ламає комбо Invoker (Tornado, EMP, Chaos Meteor, Cold Snap).",
        "reason_ru": "Полностью ломает комбо Invoker (Tornado, EMP, Chaos Meteor, Cold Snap).",
        "reason_en": "Completely shuts down Invoker's spell combos (Tornado, EMP, Chaos Meteor, Cold Snap)."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Виводить з-під падіння Chaos Meteor, Sun Strike та стіни Ice Wall.",
        "reason_ru": "Выводит из-под падения Chaos Meteor, Sun Strike и стены Ice Wall.",
        "reason_en": "Pushes targets out of Chaos Meteor, Sun Strike, and Ice Wall."
      },
      {
        "item_key": "dust",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Не дає Invoker втекти під Ghost Walk після витрати скілів.",
        "reason_ru": "Не дает Invoker сбежать под Ghost Walk после траты скиллов.",
        "reason_en": "Prevents Invoker from escaping with Ghost Walk after spending his spells."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      4
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Универсал • Магическое комбо, контроль и инвиз",
    "primary_role_en": "Universal • Magic combo, control, and invis"
  },
  "lion": {
    "primary_role_uk": "Сапорт / Контролер • Миттєвий Hex, стан і Finger",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Hex + Finger of Death",
        "note_uk": "Миттєвий Hex без анімації переходить у довгий контроль і смертельний точковий ульт.",
        "note_ru": "Мгновенный Hex без анимации переходит в долгий контроль и смертельный точечный ульт.",
        "note_en": "Instant zero-cast-point Hex chains into long lockdown and a lethal single-target ultimate."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Finger of Death + Earth Spike",
        "note_uk": "Величезний точковий магічний прокаст по одній цілі.",
        "note_ru": "Огромный точечный магический прокаст по одной цели.",
        "note_en": "Massive single-target magic burst."
      },
      {
        "tag": "channeled_disable",
        "severity": 1,
        "source_ability": "Mana Drain",
        "note_uk": "Висмоктує ману та сильно сповільнює.",
        "note_ru": "Высасывает ману и сильно замедляет.",
        "note_en": "Drains mana and heavily slows."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Відбиває Hex, Earth Spike та Finger of Death назад у Lion і знімає контроль із союзників.",
        "reason_ru": "Отражает Hex, Earth Spike и Finger of Death обратно в Lion и снимает контроль с союзников.",
        "reason_en": "Reflects Hex, Earth Spike, and Finger of Death back onto Lion and dispels allies."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Зводить нанівець усю серію контролю та магічну шкоду Lion.",
        "reason_ru": "Сводит на нет всю серию контроля и магический урон Lion.",
        "reason_en": "Negates Lion's entire control chain and magic burst."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Рятує мобільних корів від миттєвої ініціації через Hex.",
        "reason_ru": "Спасает мобильных коров от мгновенной инициации через Hex.",
        "reason_en": "Saves mobile cores from instant Hex initiation."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Саппорт / Контроллер • Мгновенный Hex, стан и Finger",
    "primary_role_en": "Support / Disabler • Instant Hex, stun, and Finger"
  },
  "morphling": {
    "primary_role_uk": "Керрі • Перекачка в силу (хіл), бурст і мобільність",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Attribute Shift (Strength Gain)",
        "note_uk": "Перекачування в силу ефективно працює як величезне миттєве зцілення.",
        "note_ru": "Перекачка в силу эффективно работает как огромное мгновенное исцеление.",
        "note_en": "Attribute Shift into Strength effectively acts as a massive instant heal."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Waveform",
        "note_uk": "Невразливий ескейп і швидка зміна позиції.",
        "note_ru": "Неуязвимый эскейп и быстрая смена позиции.",
        "note_en": "Invulnerable waveform escape and rapid repositioning."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Adaptive Strike + Waveform",
        "note_uk": "Вибухова комбінація по тонких цілях.",
        "note_ru": "Взрывная комбинация по тонким целям.",
        "note_en": "Explosive shotgun combo against squishy targets."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Adaptive Strike / Morph",
        "note_uk": "Точковий стан/нюк і копіювання скілів.",
        "note_ru": "Точечный стан/нюк и копирование скиллов.",
        "note_en": "Single-target stun/nuke and spell copying."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Сильно ріже ефективність перекачки Morphling у силу (Health Restoration -70%).",
        "reason_ru": "Сильно режет эффективность перекачки Morphling в силу (восстановление здоровья -70%).",
        "reason_en": "Heavily reduces the effectiveness of Morphling's Strength Attribute Shift (-70% health restoration)."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує Waveform і не дає переключитися в силу під час фокусу.",
        "reason_ru": "Блокирует Waveform и не дает переключиться в силу во время фокуса.",
        "reason_en": "Locks down Waveform and prevents shifting into Strength when focused."
      },
      {
        "item_key": "skadi",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Постійно ріже відновлення здоров'я при перекачці та сповільнює кайтинг.",
        "reason_ru": "Постоянно режет восстановление здоровья при перекачке и замедляет для кайтинга.",
        "reason_en": "Constantly reduces health gain from Attribute Shift and slows him down."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2
    ],
    "typical_items": [
      "butterfly",
      "satanic"
    ],
    "primary_role_ru": "Керри • Перекачка в силу (хил), бурст и мобильность",
    "primary_role_en": "Carry • Strength Morph (heal), burst, and mobility"
  },
  "naga_siren": {
    "primary_role_uk": "Ілюзіоніст • Сплітпуш, сітка та ухилення Eelskin",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Mirror Image / Rip Tide",
        "note_uk": "Щільні ілюзії з великою шкодою та зниженням броні.",
        "note_ru": "Плотные иллюзии с большим уроном и снижением брони.",
        "note_en": "Tanky illusions with high damage and armor reduction."
      },
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Eelskin",
        "note_uk": "Кожна ілюзія поруч підвищує ухилення самої Наги.",
        "note_ru": "Каждая иллюзия рядом повышает уклонение самой Наги.",
        "note_en": "Each nearby illusion increases Naga's own evasion."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Ensnare",
        "note_uk": "Перериває дії та прив'язує ціль на місці (зокрема крізь Song).",
        "note_ru": "Прерывает действия и привязывает цель на месте (в том числе сквозь Song).",
        "note_en": "Interrupts actions and roots a target in place (even through Song of the Siren)."
      }
    ],
    "priority_items": [
      {
        "item_key": "mjollnir",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Магічні блискавки пробивають високу броню ілюзій Naga Siren.",
        "reason_ru": "Магические молнии пробивают высокую броню иллюзий Naga Siren.",
        "reason_en": "Magic chain lightning pierces the high armor of Naga Siren's illusions."
      },
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Гасить масову фізичну шкоду від копій Mirror Image.",
        "reason_ru": "Гасит массовый физический урон от копий Mirror Image.",
        "reason_en": "Mitigates AoE physical damage from Mirror Image illusions."
      },
      {
        "item_key": "shivas_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Уповільнює атаку ілюзій, зменшує темп Rip Tide та дає AoE-прокаст.",
        "reason_ru": "Замедляет атаку иллюзий, снижает частоту срабатывания Rip Tide и дает AoE-прокаст.",
        "reason_en": "Slows illusion attack speed, reduces Rip Tide proc rate, and provides AoE magic damage."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4,
      3
    ],
    "typical_items": [
      "butterfly",
      "satanic"
    ],
    "primary_role_ru": "Иллюзионист • Сплитпуш, сетка и уклонение Eelskin",
    "primary_role_en": "Illusionist • Split-push, net, and Eelskin evasion"
  },
  "necrolyte": {
    "primary_role_uk": "Сустейн-маг • Ампліфікація хілу, Ghost Shroud і Scythe",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Death Pulse + Ghost Shroud + Sadist",
        "note_uk": "Потужно лікує себе і команду, особливо під Ghost Shroud (+бонус до відновлення).",
        "note_ru": "Мощно лечит себя и команду, особенно под Ghost Shroud (+бонус к восстановлению).",
        "note_en": "Heavily heals himself and his team, especially during Ghost Shroud (+restoration amplification)."
      },
      {
        "tag": "dispellable_save",
        "severity": 3,
        "source_ability": "Ghost Shroud",
        "note_uk": "Безтілесний сейв від фізичних атак легко знімається розвіюванням.",
        "note_ru": "Бесплотный сейв от физических атак легко снимается развеиванием.",
        "note_en": "Ethereal save against physical attacks is easily removed with a Dispel."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Reaper's Scythe",
        "note_uk": "Точковий фінішер із довгим оглушенням та збільшеним часом відродження.",
        "note_ru": "Точечный финишер с долгим оглушением и увеличенным временем возрождения.",
        "note_en": "Single-target finisher with a long stun and execution threat."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Heartstopper Aura + Death Pulse",
        "note_uk": "Випалює відсотки здоров'я всіх поруч у затяжних файтах.",
        "note_ru": "Выжигает проценты здоровья всех рядом в затяжных файтах.",
        "note_en": "Burns a percentage of max HP from all nearby enemies in extended fights."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Зрізає на 70% весь хіл від Death Pulse і посилення лікування під Ghost Shroud.",
        "reason_ru": "Срезает на 70% весь хил от Death Pulse и усиление лечения под Ghost Shroud.",
        "reason_en": "Cuts all Death Pulse healing and Ghost Shroud restoration amplification by 70%."
      },
      {
        "item_key": "nullifier",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Знімає Ghost Shroud і не дає Necrophos перечекати фізичний фокус.",
        "reason_ru": "Снимает Ghost Shroud и не дает Necrophos переждать физический фокус.",
        "reason_en": "Dispels Ghost Shroud and stops Necrophos from waiting out physical focus."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Магічний бар'єр рятує союзника від смерті під Reaper's Scythe.",
        "reason_ru": "Магический барьер спасает союзника от смерти под Reaper's Scythe.",
        "reason_en": "The magic barrier saves an ally from dying to Reaper's Scythe."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3
    ],
    "typical_items": [
      "blade_mail"
    ],
    "primary_role_ru": "Сустейн-маг • Амплификация хила, Ghost Shroud и Scythe",
    "primary_role_en": "Sustain Mage • Heal amplification, Ghost Shroud, and Scythe"
  },
  "phantom_assassin": {
    "primary_role_uk": "Керрі • Фіз-крити та ухилення",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Coup de Grace / Immaterial",
        "note_uk": "Уся сила героя тримається на пасивних критах та ухиленні.",
        "note_ru": "Вся сила героя держится на пассивных критах и уклонении.",
        "note_en": "The hero's entire strength relies on passive crits and evasion."
      },
      {
        "tag": "evasion",
        "severity": 3,
        "source_ability": "Immaterial",
        "note_uk": "Високий базовий шанс ухилитися від фізичних атак.",
        "note_ru": "Высокий базовый шанс уклониться от физических атак.",
        "note_en": "High innate evasion against physical attacks."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Phantom Strike + Coup de Grace",
        "note_uk": "Миттєво скорочує дистанцію й вбиває сапортів за 1–2 крити.",
        "note_ru": "Мгновенно сокращает дистанцию и убивает саппортов за 1–2 крита.",
        "note_en": "Instantly closes the gap and deletes supports in 1–2 crits."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Вимкне крити (Coup de Grace) та ухилення (Immaterial) у Phantom Assassin на 5 секунд.",
        "reason_ru": "Отключает криты (Coup de Grace) и уклонение (Immaterial) у Phantom Assassin на 5 секунд.",
        "reason_en": "Disables Phantom Assassin's crits (Coup de Grace) and evasion (Immaterial) for 5 seconds."
      },
      {
        "item_key": "monkey_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Дозволяє фізичним корам пробивати ухилення PA (Immaterial) навіть коли Break на перезарядці.",
        "reason_ru": "Позволяет физическим корам пробивать уклонение PA (Immaterial), даже когда Break на перезарядке.",
        "reason_en": "Allows physical cores to pierce PA's evasion (Immaterial) even when Break is on cooldown."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Рятує сапортів від миттєвого вриву через Phantom Strike.",
        "reason_ru": "Спасает саппортов от мгновенного врыва через Phantom Strike.",
        "reason_en": "Saves supports from sudden Phantom Strike jumps."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar"
    ],
    "primary_role_ru": "Керри • Физ-криты и уклонение",
    "primary_role_en": "Carry • Physical crits and evasion"
  },
  "phantom_lancer": {
    "primary_role_uk": "Ілюзіоніст • Масова армія копій і спалення мани",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Juxtapose / Doppelganger",
        "note_uk": "За секунди створює рій ілюзій, у якому важко знайти оригінал.",
        "note_ru": "За секунды создает рой иллюзий, в котором трудно найти оригинал.",
        "note_en": "Creates a swarm of illusions in seconds, making it hard to find the real hero."
      },
      {
        "tag": "mana_burn",
        "severity": 3,
        "source_ability": "Diffusal Blade + Juxtapose",
        "note_uk": "Ілюзії миттєво спалюють ману та не дають натиснути скіли.",
        "note_ru": "Иллюзии мгновенно сжигают ману и не дают нажать скиллы.",
        "note_en": "Illusions instantly burn mana and prevent casting spells."
      },
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Phantom Rush",
        "note_uk": "Отримує бонусне ухилення під час ривка до цілі.",
        "note_ru": "Получает бонусное уклонение во время рывка к цели.",
        "note_en": "Gains bonus evasion while rushing toward a target."
      }
    ],
    "priority_items": [
      {
        "item_key": "mjollnir",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Ланцюгові блискавки та активний щит Static Charge миттєво чистять армію ілюзій Phantom Lancer.",
        "reason_ru": "Цепные молнии и активный щит Static Charge мгновенно зачищают армию иллюзий Phantom Lancer.",
        "reason_en": "Chain lightning and the active Static Charge shield rapidly clear Phantom Lancer's illusion army."
      },
      {
        "item_key": "crimson_guard",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Блокує фіксовану шкоду з кожної тички ілюзій PL по всій команді.",
        "reason_ru": "Блокирует фиксированный урон с каждой тычки иллюзий PL по всей команде.",
        "reason_en": "Blocks a flat amount of damage from every PL illusion hit across the whole team."
      },
      {
        "item_key": "shivas_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ріже швидкість атаки копій, дає броню та викриває справжнього PL хвилею.",
        "reason_ru": "Режет скорость атаки копий, дает броню и выявляет настоящего PL волной.",
        "reason_en": "Reduces illusion attack speed, grants armor, and helps reveal the real PL with its AoE wave."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "butterfly",
      "satanic"
    ],
    "primary_role_ru": "Иллюзионист • Массовая армия копий и выжигание маны",
    "primary_role_en": "Illusionist • Massive clone army and mana burn"
  },
  "pudge": {
    "primary_role_uk": "Ініціатор / Танк • Meat Hook, Dismember і великий пул HP",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Meat Hook",
        "note_uk": "Витягує союзника з позиції просто під ворожу команду.",
        "note_ru": "Вытягивает союзника из позиции прямо под вражескую команду.",
        "note_en": "Hooks an enemy out of position right into his team."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Dismember",
        "note_uk": "Точковий дизейбл, що пробиває BKB та лікує самого Pudge.",
        "note_ru": "Точечный дизейбл, пробивающий BKB и лечащий самого Pudge.",
        "note_en": "Single-target disable that pierces BKB and heals Pudge."
      },
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Dismember",
        "note_uk": "Потоковий ульт, який можна збити або перервати сейвом союзника.",
        "note_ru": "Потоковый ульт, который можно сбить или прервать сейвом союзника.",
        "note_en": "Channeled ultimate that can be interrupted or broken by saving the ally."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Dismember + Flesh Heap",
        "note_uk": "Отримує велику кількість HP і відхілюється під час ультимату.",
        "note_ru": "Получает большое количество HP и отхиливается во время ультимейта.",
        "note_en": "Gains a large amount of HP and heals during his ultimate."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Віддзеркалює Dismember назад у Pudge — змушує його припинити каст або витратити BKB.",
        "reason_ru": "Отражает Dismember обратно в Pudge — заставляет его прервать каст или потратить BKB.",
        "reason_en": "Reflects Dismember back onto Pudge — forcing him to cancel the channel or pop BKB."
      },
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Повертає союзника назад у безпечну позицію після влучання Meat Hook.",
        "reason_ru": "Возвращает союзника обратно в безопасную позицию после попадания Meat Hook.",
        "reason_en": "Pushes an ally back to safety after being caught by Meat Hook."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує точковий Dismember одразу після притягування хуком.",
        "reason_ru": "Блокирует направленный Dismember сразу после притягивания хуком.",
        "reason_en": "Blocks the single-target Dismember right after being hooked."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Ріже відхіл від Dismember та пробиває величезний запас HP процентною шкодою.",
        "reason_ru": "Режет отхил от Dismember и пробивает огромный запас HP процентным уроном.",
        "reason_en": "Cuts Dismember healing and shreds his massive HP pool with percentage-based damage."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      3,
      2,
      1
    ],
    "typical_items": [
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Инициатор / Танк • Meat Hook, Dismember и большой пул HP",
    "primary_role_en": "Initiator / Tank • Meat Hook, Dismember, and large HP pool"
  },
  "riki": {
    "primary_role_uk": "Інвіз-асасін • Smoke Screen і бекстаб",
    "threats": [
      {
        "tag": "invisibility",
        "severity": 3,
        "source_ability": "Cloak and Dagger",
        "note_uk": "Постійна невидимість робить переміщення без True Sight смертельним.",
        "note_ru": "Постоянная невидимость делает перемещение без True Sight смертельным.",
        "note_en": "Permanent invisibility makes moving without True Sight lethal."
      },
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Smoke Screen",
        "note_uk": "Хмара накладає безмовність і змушує промахуватися атаками.",
        "note_ru": "Тучка накладывает безмолвие и заставляет промахиваться атаками.",
        "note_en": "Smoke cloud silences and causes attacks to miss."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Smoke Screen + Blink Strike",
        "note_uk": "Утримує сапортів і магів у диму під серією ударів у спину.",
        "note_ru": "Удерживает саппортов и магов в дыму под серией ударов в спину.",
        "note_en": "Traps supports and mages inside the smoke under a flurry of backstabs."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Backstab / Tricks of the Trade",
        "note_uk": "Велика фізична шкода зі спини від спритності.",
        "note_ru": "Большой физический урон со спины от ловкости.",
        "note_en": "High agility-based physical backstab damage."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Виштовхує себе або союзника зі Smoke Screen Riki, рятуючи від сайленсу та ударів у спину.",
        "reason_ru": "Выталкивает себя или союзника из Smoke Screen Riki, спасая от сайленса и ударов в спину.",
        "reason_en": "Pushes yourself or an ally out of Riki's Smoke Screen, saving from silence and backstab hits."
      },
      {
        "item_key": "dust",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Не дає Riki піти в Cloak and Dagger після невдалого вриву.",
        "reason_ru": "Не дает Riki уйти в Cloak and Dagger после неудачного врыва.",
        "reason_en": "Prevents Riki from fading into Cloak and Dagger invisibility after a failed jump."
      },
      {
        "item_key": "ward_sentry",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Контролює підходи Riki у файтах і біля об'єктів.",
        "reason_ru": "Контролирует подходы Riki в файтах и возле важных объектов.",
        "reason_en": "Controls Riki's approaches during teamfights and around objectives."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Инвиз-ассасин • Smoke Screen и бэкстаб",
    "primary_role_en": "Invis Assassin • Smoke Screen and backstab"
  },
  "spectre": {
    "primary_role_uk": "Глобальний керрі • Dispersion та ілюзії",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Dispersion / Desolate",
        "note_uk": "Пасивки одночасно дають танковість, відбиття шкоди та чистий урон.",
        "note_ru": "Пассивки одновременно дают танковость, отражение урона и чистый урон.",
        "note_en": "Passives simultaneously grant tankiness, damage reflection, and pure damage."
      },
      {
        "tag": "damage_reflection",
        "severity": 3,
        "source_ability": "Dispersion",
        "note_uk": "Відбиває великий відсоток отриманої шкоди по всій команді поруч.",
        "note_ru": "Отражает большой процент полученного урона по всей команде рядом.",
        "note_en": "Reflects a large percentage of damage taken to all nearby enemies."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Haunt / Shadow Step",
        "note_uk": "Глобально влітає з ілюзіями в ізольованих сапортів.",
        "note_ru": "Глобально влетает с иллюзиями в изолированных саппортов.",
        "note_en": "Globally haunts onto isolated supports with illusions."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Desolate",
        "note_uk": "Бонусна чиста шкода, якщо ціль стоїть сама без союзників у радіусі 350.",
        "note_ru": "Бонусный чистый урон, если цель стоит одна без союзников в радиусе 350.",
        "note_en": "Bonus pure damage when the target is alone with no allies within 350 range."
      }
    ],
    "priority_items": [
      {
        "item_key": "silver_edge",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Вимикає Dispersion і Desolate — Spectre втрачає і виживаність, і значну частину шкоди.",
        "reason_ru": "Отключает Dispersion и Desolate — Spectre теряет и выживаемость, и значительную часть урона.",
        "reason_en": "Disables Dispersion and Desolate — Spectre loses both her tankiness and a huge chunk of damage."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Дає імунітет до відбитої шкоди Dispersion та чистої шкоди Desolate.",
        "reason_ru": "Дает иммунитет к отраженному урону Dispersion и чистому урону Desolate.",
        "reason_en": "Grants immunity to Dispersion reflected damage and Desolate pure damage."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 4,
        "reason_uk": "Допомагає сапортам притиснутися до союзника й не отримувати чисту шкоду Desolate.",
        "reason_ru": "Помогает саппортам прижаться к союзнику и не получать чистый урон от Desolate.",
        "reason_en": "Helps supports reposition next to an ally to negate Desolate pure damage."
      }
    ],
    "default_position": 1,
    "positions": [
      1
    ],
    "typical_items": [
      "orchid",
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Глобальный керри • Dispersion и иллюзии",
    "primary_role_en": "Global Carry • Dispersion and illusions"
  },
  "zuus": {
    "primary_role_uk": "Нюкер • Тотальний магічний прокаст і глобальний ульт",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Thundergod's Wrath / Lightning Bolt",
        "note_uk": "Миттєво зносить половину HP всій команді з будь-якої точки карти.",
        "note_ru": "Мгновенно сносит половину HP всей команде из любой точки карты.",
        "note_en": "Instantly chunks half the HP of the entire enemy team from anywhere on the map."
      },
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Arc Lightning / Static Field / Nimbus",
        "note_uk": "Постійно спамить % шкодою від поточного здоров'я.",
        "note_ru": "Постоянно спамит % уроном от текущего здоровья.",
        "note_en": "Constantly spams percentage damage based on current health."
      }
    ],
    "priority_items": [
      {
        "item_key": "pipe",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Бар'єр Pipe нівелює Thundergod's Wrath і масовий магічний спам Zeus.",
        "reason_ru": "Барьер Pipe нивелирует Thundergod's Wrath и массовый магический спам Zeus.",
        "reason_en": "Pipe's magic barrier neutralizes Thundergod's Wrath and Zeus's AoE magic spam."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Ізолює кору від величезного магічного прокасту та міні-станів Zeus.",
        "reason_ru": "Защищает кора от огромного магического прокаста и микростанов Zeus.",
        "reason_en": "Shields a core from Zeus's massive magic burst and mini-stuns."
      },
      {
        "item_key": "mage_slayer",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Зменшує всю шкоду зі здібностей Zeus на 40%.",
        "reason_ru": "Уменьшает весь урон от способностей Zeus на 40%.",
        "reason_en": "Reduces all spell damage dealt by Zeus by 40%."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      4,
      5
    ],
    "typical_items": [
      "aeon_disk"
    ],
    "primary_role_ru": "Нюкер • Тотальный магический прокаст и глобальный ульт",
    "primary_role_en": "Nuker • Total magic burst and global ultimate"
  },
  "ancient_apparition": {
    "primary_role_uk": "Фул сап / Сап • Глобальна заборона хілу Ice Blast та магічний бурст",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Ice Blast + Ice Vortex + Cold Feet",
        "note_uk": "Підсилює магічну шкоду в зоні Vortex та добиває на низькому HP.",
        "note_ru": "Усиливает магический урон в зоне Vortex и добивает на низком HP.",
        "note_en": "Amplifies magic damage in the Vortex area and finishes off low-HP targets."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Cold Feet",
        "note_uk": "Заморожує на місці, якщо ціль не встигне розірвати дистанцію.",
        "note_ru": "Замораживает на месте, если цель не успеет разорвать дистанцию.",
        "note_en": "Freezes in place if the target fails to break the tether distance."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Ice Blast + Bone Chill",
        "note_uk": "Обмороження блокує будь-який хіл і зменшує силу героя.",
        "note_ru": "Обморожение блокирует любой хил и уменьшает силу героя.",
        "note_en": "Frostbite blocks all healing and shatters the hero below the HP threshold."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєво розриває дистанцію Cold Feet до замороження.",
        "reason_ru": "Мгновенно разрывает дистанцию Cold Feet до заморозки.",
        "reason_en": "Instantly breaks Cold Feet tether distance before the freeze triggers."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Магічний барʼєр працює навіть під дебафом Ice Blast (коли хіл заблоковано).",
        "reason_ru": "Магический барьер работает даже под дебаффом Ice Blast (когда лечение заблокировано).",
        "reason_en": "The magic barrier works even under the Ice Blast debuff (when healing is blocked)."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Поглинає магічний урон Ice Blast і Chilling Touch барʼєром.",
        "reason_ru": "Поглощает магический урон Ice Blast и Chilling Touch барьером.",
        "reason_en": "Absorbs the magic damage of Ice Blast and Chilling Touch with its barrier."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "aeon_disk"
    ],
    "primary_role_ru": "Фулл сап / Сап • Глобальный запрет хила Ice Blast и магический бурст",
    "primary_role_en": "Pos 5 / Support • Global heal block Ice Blast and magic burst"
  },
  "beastmaster": {
    "primary_role_uk": "Офлейнер / Мідер • Primal Roar крізь BKB, сумони та барабани Drums of Slom",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Primal Roar",
        "note_uk": "Тривалий точковий стан крізь BKB відкриває фокус по головній цілі.",
        "note_ru": "Длительный точечный стан сквозь BKB открывает фокус по главной цели.",
        "note_en": "Long single-target stun through BKB opens up focus on a priority target."
      },
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Drums of Slom",
        "note_uk": "Інтенсивно лікує себе і підконтрольних юнітів у бою.",
        "note_ru": "Интенсивно лечит себя и подконтрольных юнитов в бою.",
        "note_en": "Intensely heals himself and controlled units in combat."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Call of the Wild (Boar / Hawk)",
        "note_uk": "Звірі та аура Inner Beast створюють сильний темп пушу.",
        "note_ru": "Звери и аура Inner Beast создают сильный темп пуша.",
        "note_en": "Summons and Inner Beast aura create a strong pushing tempo."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Drums of Slom / Inner Beast",
        "note_uk": "Break вимикає барабани Drums of Slom та ауру швидкості атаки.",
        "note_ru": "Break выключает барабаны Drums of Slom и ауру скорости атаки.",
        "note_en": "Break disables Drums of Slom and the attack speed aura."
      }
    ],
    "priority_items": [
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує миттєву блінк-ініціацію через Primal Roar.",
        "reason_ru": "Блокирует мгновенную блинк-инициацию через Primal Roar.",
        "reason_en": "Blocks instant blink initiation with Primal Roar."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Віддзеркалює Primal Roar у самого Beastmaster і знімає сповільнення кабана.",
        "reason_ru": "Отражает Primal Roar в самого Beastmaster и снимает замедление от кабана.",
        "reason_en": "Reflects Primal Roar back onto Beastmaster and dispels Boar poison slow."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ріже відхіл від Drums of Slom на 70%.",
        "reason_ru": "Режет отхил от Drums of Slom на 70%.",
        "reason_en": "Reduces healing from Drums of Slom by 70%."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер / Мидер • Primal Roar сквозь BKB, саммоны и барабаны Drums of Slom",
    "primary_role_en": "Offlaner / Midlaner • Primal Roar through BKB, summons, and Drums of Slom"
  },
  "bloodseeker": {
    "primary_role_uk": "Керрі / Мідер • Точковий Rupture крізь BKB, Blood Rite (Silence) і Sanguivore",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Rupture",
        "note_uk": "Чиста шкода за рух крізь BKB не дає змінювати позицію в бійці.",
        "note_ru": "Чистый урон за движение сквозь BKB не дает менять позицию в драке.",
        "note_en": "Pure damage on movement through BKB prevents repositioning in fights."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Rupture + Blood Rite",
        "note_uk": "Змушує стояти на місці під загрозою тривалого AoE-сайленсу.",
        "note_ru": "Заставляет стоять на месте под угрозой длительного AoE-сайленса.",
        "note_en": "Forces enemies to stand still or eat a long AoE silence."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "Blood Rite",
        "note_uk": "Великий радіус безмовності та чистої шкоди.",
        "note_ru": "Большой радиус безмолвия и чистого урона.",
        "note_en": "Large AoE silence and pure damage."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Sanguivore + Bloodrage",
        "note_uk": "Відновлює здоровʼя за добивання та у файтах.",
        "note_ru": "Восстанавливает здоровье за добивания и в файтах.",
        "note_en": "Restores health from last hits and during teamfights."
      }
    ],
    "priority_items": [
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує точковий ультимат Rupture.",
        "reason_ru": "Блокирует направленный ультимейт Rupture.",
        "reason_en": "Blocks the single-target Rupture ultimate."
      },
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Відбиває Rupture назад у Bloodseeker та знімає сайленс Blood Rite.",
        "reason_ru": "Отражает Rupture обратно в Bloodseeker и снимает сайленс от Blood Rite.",
        "reason_en": "Reflects Rupture back onto Bloodseeker and dispels Blood Rite silence."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє перечекати 2.5 с дії Rupture або підняти самого Bloodseeker.",
        "reason_ru": "Позволяет переждать 2.5 с действия Rupture или поднять самого Bloodseeker.",
        "reason_en": "Allows waiting out 2.5s of Rupture or lifting Bloodseeker himself."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Керри / Мидер • Точечный Rupture сквозь BKB, Blood Rite (Silence) и Sanguivore",
    "primary_role_en": "Carry / Midlaner • Single-target Rupture through BKB, Blood Rite (Silence), and Sanguivore"
  },
  "brewmaster": {
    "primary_role_uk": "Офлейнер • Розділення Primal Split, ухилення Drunken Brawler і контроль",
    "threats": [
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Drunken Brawler (Wind Stance)",
        "note_uk": "Високе ухилення у вітряній стійці.",
        "note_ru": "Высокое уклонение в ветреной стойке.",
        "note_en": "High evasion in Storm Brawler stance."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Primal Split",
        "note_uk": "Чотири духи дають тривалий торнадо, стан, сайленс і диспел.",
        "note_ru": "Четыре духа дают длительный торнадо, стан, сайленс и диспел.",
        "note_en": "Four spirits provide a long cyclone, stun, silence, and Dispel."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Cinder Brew + Thunder Clap",
        "note_uk": "Сильне сповільнення та підпалювання по області.",
        "note_ru": "Сильное замедление и поджигание по области.",
        "note_en": "Heavy AoE slow and burn."
      }
    ],
    "priority_items": [
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Сайленс не дає Brewmaster вчасно натиснути Primal Split під фокусом.",
        "reason_ru": "Сайленс не дает Brewmaster вовремя нажать Primal Split под фокусом.",
        "reason_en": "Silence prevents Brewmaster from casting Primal Split in time when focused."
      },
      {
        "item_key": "monkey_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Пробиває високе ухилення Drunken Brawler.",
        "reason_ru": "Пробивает высокое уклонение от Drunken Brawler.",
        "reason_en": "Pierces the high evasion of Drunken Brawler."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Захищає від торнадо та станів духів Primal Split.",
        "reason_ru": "Защищает от торнадо и станов духов Primal Split.",
        "reason_en": "Protects against Cyclone and stuns from Primal Split brewlings."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер • Разделение Primal Split, уклонение Drunken Brawler и контроль",
    "primary_role_en": "Offlaner • Primal Split, Drunken Brawler evasion, and control"
  },
  "centaur": {
    "primary_role_uk": "Офлейнер • Масовий Stampede, стан Hoof Stomp і відбиття Retaliate",
    "threats": [
      {
        "tag": "damage_reflection",
        "severity": 2,
        "source_ability": "Retaliate + Blade Mail",
        "note_uk": "Повертає фізичну шкоду при кожному ударі.",
        "note_ru": "Возвращает физический урон при каждом ударе.",
        "note_en": "Returns physical damage on every attack taken."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Double Edge + Hoof Stomp",
        "note_uk": "Сильний ближній прокаст від сили героя.",
        "note_ru": "Сильный ближний прокаст от силы героя.",
        "note_en": "Heavy melee burst scaling with Strength."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Stampede / Work Horse",
        "note_uk": "Командний розгін для вриву або порятунку союзників.",
        "note_ru": "Командный разгон для врыва или спасения союзников.",
        "note_en": "Teamwide haste for initiation or saving allies."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Процентна шкода швидко пробиває величезний запас HP Centaur.",
        "reason_ru": "Процентный урон быстро пробивает огромный запас HP Centaur.",
        "reason_en": "Percentage-based damage quickly shreds Centaur's massive HP pool."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує стан Hoof Stomp, урон Double Edge і відбиття.",
        "reason_ru": "Блокирует стан Hoof Stomp, урон Double Edge и ответный урон.",
        "reason_en": "Blocks Hoof Stomp stun, Double Edge burst, and Retaliate damage."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зупиняє врив Centaur під Stampede і збиває ініціацію.",
        "reason_ru": "Останавливает врыв Centaur под Stampede и сбивает инициацию.",
        "reason_en": "Stops Centaur's charge during Stampede and ruins his initiation."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Оффлейнер • Массовый Stampede, стан Hoof Stomp и ответка Retaliate",
    "primary_role_en": "Offlaner • Teamwide Stampede, Hoof Stomp stun, and Retaliate return damage"
  },
  "chen": {
    "primary_role_uk": "Фул сап / Сап • Армія лісових кріпів, глобальний хіл Hand of God і пуш",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Hand of God + Divine Favor",
        "note_uk": "Глобальне миттєве зцілення всієї команди та реген-аура.",
        "note_ru": "Глобальное мгновенное исцеление всей команды и реген-аура.",
        "note_en": "Global instant teamwide heal and regeneration aura."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Holy Persuasion + Zealot",
        "note_uk": "Зграя приручених кріпів з аурами тисне на вежі з ранньої гри.",
        "note_ru": "Стая прирученных крипов с аурами давит на башни с ранней игры.",
        "note_en": "Army of converted creeps with auras pressures towers from the early game."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Penitence + Creeps",
        "note_uk": "Прискорює атаки всієї команди по вибраній цілі.",
        "note_ru": "Ускоряет атаки всей команды по выбранной цели.",
        "note_en": "Grants bonus attack speed to all allies attacking the marked target."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Зрізає глобальний хіл Hand of God та реген Divine Favor на 70%.",
        "reason_ru": "Срезает глобальный хил Hand of God и реген Divine Favor на 70%.",
        "reason_en": "Cuts global Hand of God healing and Divine Favor regeneration by 70%."
      },
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Нівелює фізичний урон приручених кріпів по команді та вежах.",
        "reason_ru": "Нивелирует физический урон прирученных крипов по команде и башням.",
        "reason_en": "Mitigates physical damage from converted creeps against your team and towers."
      },
      {
        "item_key": "shivas_guard",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Аура -40 AS та хвиля сповільнюють весь зоопарк Chen.",
        "reason_ru": "Аура -40 AS и волна замедляют весь зоопарк Chen.",
        "reason_en": "The -40 AS aura and active wave slow down Chen's entire creep army."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Фулл сап / Сап • Армия лесных крипов, глобальный хил Hand of God и пуш",
    "primary_role_en": "Pos 5 / Support • Neutral creep army, global Hand of God heal, and push"
  },
  "dark_willow": {
    "primary_role_uk": "Сап / Кор • Невразливість Shadow Realm, лабіринт Bramble Maze та Terrorize",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Shadow Realm + Bedlam",
        "note_uk": "Величезний магічний бурст без можливості взяти її в таргет.",
        "note_ru": "Огромный магический бурст без возможности взять ее в таргет.",
        "note_en": "Massive magic burst while remaining untargetable."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Bramble Maze + Cursed Crown",
        "note_uk": "Коріння та відкладений AoE-стан контролюють зону бою.",
        "note_ru": "Корни и отложенный AoE-стан контролируют зону боя.",
        "note_en": "Brambles root and delayed AoE stun control the battlefield."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Shadow Realm + Pixie Dust",
        "note_uk": "Уникає точкових атак і прискорює реген у тіні.",
        "note_ru": "Избегает точечных атак и ускоряет реген в тени.",
        "note_en": "Evades single-target attacks and regenerates in Shadow Realm."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Повністю ігнорує шкоду Shadow Realm, Bedlam, Bramble Maze і страх Terrorize.",
        "reason_ru": "Полностью игнорирует урон Shadow Realm, Bedlam, Bramble Maze и страх от Terrorize.",
        "reason_en": "Completely ignores Shadow Realm, Bedlam, Bramble Maze, and the Terrorize fear."
      },
      {
        "item_key": "blade_mail",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Відбиває шкоду Bedlam і Shadow Realm навіть коли Willow поза таргетом.",
        "reason_ru": "Отражает урон Bedlam и Shadow Realm, даже когда Willow вне таргета.",
        "reason_en": "Reflects Bedlam and Shadow Realm damage even while Willow is untargetable."
      },
      {
        "item_key": "manta",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає відкладений стан Cursed Crown та коріння Bramble Maze.",
        "reason_ru": "Снимает отложенный стан Cursed Crown и корни Bramble Maze.",
        "reason_en": "Dispels the delayed Cursed Crown stun and Bramble Maze root."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Кор • Неуязвимость Shadow Realm, лабиринт Bramble Maze и Terrorize",
    "primary_role_en": "Support / Core • Shadow Realm untargetability, Bramble Maze, and Terrorize"
  },
  "dawnbreaker": {
    "primary_role_uk": "Офлейнер / Сап • Глобальний контр-ініціатор Solar Guardian і хіл Luminosity",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Luminosity + Solar Guardian",
        "note_uk": "Крити Luminosity та пульсація ультимату потужно лікують команду.",
        "note_ru": "Криты Luminosity и пульсация ультимейта мощно лечат команду.",
        "note_en": "Luminosity crits and ultimate pulses heavily heal the team."
      },
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Solar Guardian",
        "note_uk": "Глобальний потоковий приліт із масовим станом.",
        "note_ru": "Глобальный потоковый прилет с массовым станом.",
        "note_en": "Global channeled landing with an AoE stun."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Starbreaker + Luminosity",
        "note_uk": "Сильна серія фізичних ударів зі станом наприкінці.",
        "note_ru": "Сильная серия физических ударов со станом в конце.",
        "note_en": "Heavy flurry of physical strikes ending with a stun."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Luminosity",
        "note_uk": "Break не дає набирати стаки крита та лікування.",
        "note_ru": "Break не дает набирать стаки крита и лечения.",
        "note_en": "Break prevents stacking Luminosity crits and healing."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Ріже лікування від Luminosity та Solar Guardian на 70%.",
        "reason_ru": "Режет лечение от Luminosity и Solar Guardian на 70%.",
        "reason_en": "Reduces healing from Luminosity and Solar Guardian by 70%."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виштовхує із зони приземлення Solar Guardian та останнього удару Starbreaker.",
        "reason_ru": "Выталкивает из зоны приземления Solar Guardian и последнего удара Starbreaker.",
        "reason_en": "Pushes allies out of the Solar Guardian landing zone and the final smash of Starbreaker."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Вимикає набір стаків Luminosity в затяжному бою.",
        "reason_ru": "Отключает набор стаков Luminosity в затяжном бою.",
        "reason_en": "Disables Luminosity stack generation in extended fights."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      4,
      2
    ],
    "typical_items": [
      "black_king_bar"
    ],
    "primary_role_ru": "Оффлейнер / Сап • Глобальный контр-инициатор Solar Guardian и хил Luminosity",
    "primary_role_en": "Offlaner / Support • Global counter-initiation Solar Guardian and Luminosity heal"
  },
  "earth_spirit": {
    "primary_role_uk": "Сап / Мідер • Висока мобільність Rolling Boulder, сайленс і Magnetize",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Rolling Boulder",
        "note_uk": "Вривається і тікає через перешкоди кожні кілька секунд.",
        "note_ru": "Врывается и убегает через препятствия каждые несколько секунд.",
        "note_en": "Rolls in and escapes over terrain every few seconds."
      },
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Geomagnetic Grip",
        "note_uk": "Миттєвий сайленс по лінії (і передача через Magnetize).",
        "note_ru": "Мгновенный сайленс по линии (и передача через Magnetize).",
        "note_en": "Instant linear silence (shared across Magnetize targets)."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Magnetize",
        "note_uk": "Періодична магічна шкода, що оновлюється камінням.",
        "note_ru": "Периодический магический урон, обновляемый камнями.",
        "note_en": "Periodic magic damage refreshed by Stone Remnants."
      }
    ],
    "priority_items": [
      {
        "item_key": "manta",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Миттєво знімає сайленс Geomagnetic Grip та дебаф Magnetize.",
        "reason_ru": "Мгновенно снимает сайленс Geomagnetic Grip и дебафф Magnetize.",
        "reason_en": "Instantly dispels Geomagnetic Grip silence and the Magnetize debuff."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Очищує Magnetize і сайленс із союзного кору.",
        "reason_ru": "Очищает Magnetize и сайленс с союзного кора.",
        "reason_en": "Dispels Magnetize and silence from an allied core."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ігнорує прокаст і контроль Earth Spirit у командному файті.",
        "reason_ru": "Игнорирует прокаст и контроль Earth Spirit в командном файте.",
        "reason_en": "Ignores Earth Spirit's spell burst and control in teamfights."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      2
    ],
    "typical_items": [
      "blade_mail"
    ],
    "primary_role_ru": "Сап / Мидер • Высокая мобильность Rolling Boulder, сайленс и Magnetize",
    "primary_role_en": "Support / Midlaner • High mobility Rolling Boulder, silence, and Magnetize"
  },
  "earthshaker": {
    "primary_role_uk": "Сап / Офлейнер / Мідер • Миттєвий Echo Slam та ланцюжок станів Aftershock",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Echo Slam + Aftershock",
        "note_uk": "Миттєвий вибуховий AoE-урон по скупченню героїв та кріпів.",
        "note_ru": "Мгновенный взрывной AoE-урон по скоплению героев и крипов.",
        "note_en": "Instant explosive AoE damage against clustered heroes and creeps."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Fissure",
        "note_uk": "Перекриває шлях відступу камʼяною борозною.",
        "note_ru": "Перекрывает путь отступления каменной бороздой.",
        "note_en": "Blocks escape paths with a Fissure wall."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Не дає тримати в перманентному стані Aftershock і ріже шкоду Echo Slam.",
        "reason_ru": "Не дает держать в перманентном стане от Aftershock и режет урон Echo Slam.",
        "reason_en": "Prevents permanent Aftershock stun-locks and blocks Echo Slam damage."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Рятує команду від миттєвого магічного вибуху Echo Slam.",
        "reason_ru": "Спасает команду от мгновенного магического взрыва Echo Slam.",
        "reason_en": "Saves the team from the instant magic burst of Echo Slam."
      },
      {
        "item_key": "aeon_disk",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Гарантує виживання сапорта при стрибку Shaker з Blink Dagger.",
        "reason_ru": "Гарантирует выживание саппорта при прыжке Earthshaker с Blink Dagger.",
        "reason_en": "Guarantees a support's survival when Earthshaker jumps in with Blink Dagger."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      2,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Оффлейнер / Мидер • Мгновенный Echo Slam и цепочка станов Aftershock",
    "primary_role_en": "Support / Offlaner / Midlaner • Instant Echo Slam and Aftershock stun chain"
  },
  "elder_titan": {
    "primary_role_uk": "Сап / Офлейнер • Аура -100% базової броні/резисту Natural Order і сон Echo Stomp",
    "threats": [
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Natural Order",
        "note_uk": "Повністю обнуляє базову броню та базовий магічний опір поруч.",
        "note_ru": "Полностью обнуляет базовую броню и базовое магическое сопротивление рядом.",
        "note_en": "Completely strips base armor and base magic resistance from nearby enemies."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Astral Spirit + Natural Order",
        "note_uk": "З величезним бонусним уроном з духа бʼє як по голій цілі.",
        "note_ru": "С огромным бонусным уроном от духа бьет как по голой цели.",
        "note_en": "Hits like pure damage with massive bonus attack damage from Astral Spirit."
      },
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Echo Stomp",
        "note_uk": "Потоковий масовий сон під Earth Splitter.",
        "note_ru": "Потоковый массовый сон под Earth Splitter.",
        "note_en": "Channeled AoE sleep to set up Earth Splitter."
      }
    ],
    "priority_items": [
      {
        "item_key": "assault",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Natural Order знімає лише БАЗОВУ броню — бонусна броня від Assault Cuirass працює на 100%.",
        "reason_ru": "Natural Order снимает только БАЗОВУЮ броню — бонусная броня от Assault Cuirass работает на 100%.",
        "reason_en": "Natural Order only removes BASE armor — bonus armor from Assault Cuirass works at 100%."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Вимикає ауру Natural Order на самому Elder Titan.",
        "reason_ru": "Отключает ауру Natural Order на самом Elder Titan.",
        "reason_en": "Disables the Natural Order aura on Elder Titan himself."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виводить союзників із лінії розлому Earth Splitter.",
        "reason_ru": "Выводит союзников с линии разлома Earth Splitter.",
        "reason_en": "Pushes allies out of the Earth Splitter crack."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Оффлейнер • Аура -100% базовой брони/резиста Natural Order и сон Echo Stomp",
    "primary_role_en": "Support / Offlaner • Natural Order -100% base armor/resistance aura and Echo Stomp sleep"
  },
  "ember_spirit": {
    "primary_role_uk": "Мідер • Висока мобільність Fire Remnant, рут Searing Chains і Sleight of Fist",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Fire Remnant + Sleight of Fist",
        "note_uk": "Миттєво ухиляється від снарядів і відлітає на ремнант.",
        "note_ru": "Мгновенно уклоняется от снарядов и улетает на ремнант.",
        "note_en": "Instantly dodges projectiles and zips away to a Fire Remnant."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Searing Chains",
        "note_uk": "Привʼязує цілі під час Sleight of Fist.",
        "note_ru": "Привязывает цели во время Sleight of Fist.",
        "note_en": "Roots targets during Sleight of Fist."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Flame Guard + Immolation",
        "note_uk": "Постійне горіння та магічний щит у ближньому бою.",
        "note_ru": "Постоянное горение и магический щит в ближнем бою.",
        "note_en": "Constant burn damage and magic barrier in close combat."
      }
    ],
    "priority_items": [
      {
        "item_key": "orchid",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Сайленс повністю закриває активацію Fire Remnant і Sleight of Fist.",
        "reason_ru": "Сайленс полностью закрывает активацию Fire Remnant и Sleight of Fist.",
        "reason_en": "Silence completely locks down Activate Fire Remnant and Sleight of Fist."
      },
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєвий Hex фіксує Ember Spirit без шансу на ухилення.",
        "reason_ru": "Мгновенный Hex фиксирует Ember Spirit без шанса на уклонение.",
        "reason_en": "Instant Hex locks down Ember Spirit with no chance to dodge."
      },
      {
        "item_key": "nullifier",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Миттєво знімає щит Flame Guard та Eul.",
        "reason_ru": "Мгновенно снимает щит Flame Guard и эффект Eul.",
        "reason_en": "Instantly dispels the Flame Guard shield and Eul's cyclone."
      }
    ],
    "default_position": 2,
    "positions": [
      2
    ],
    "typical_items": [
      "orchid",
      "blade_mail"
    ],
    "primary_role_ru": "Мидер • Высокая мобильность Fire Remnant, рут Searing Chains и Sleight of Fist",
    "primary_role_en": "Midlaner • High mobility Fire Remnant, Searing Chains root, and Sleight of Fist"
  },
  "grimstroke": {
    "primary_role_uk": "Сап / Фул сап • Звʼязка двох героїв Soulbind, сайленс Phantom і Dark Portrait",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Soulbind",
        "note_uk": "Звʼязує двох героїв крізь BKB і дублює всі точкові заклинання по обох.",
        "note_ru": "Связывает двух героев сквозь BKB и дублирует все точечные заклинания по обоим.",
        "note_en": "Leashes two heroes together through BKB and duplicates all single-target spells on both."
      },
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Phantom's Embrace",
        "note_uk": "Дух накладає довгий сайленс і миттєво перезаряджається, якщо його не збити.",
        "note_ru": "Дух накладывает долгий сайленс и мгновенно перезаряжается, если его не сбить.",
        "note_en": "Phantom inflicts a long silence and instantly refreshes if not destroyed."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Dark Portrait (Shard/Scepter)",
        "note_uk": "Створює небезпечну темну копію вашого ж керрі.",
        "note_ru": "Создает опасную темную копию вашего же керри.",
        "note_en": "Creates a dangerous dark illusion of your own carry."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Знімає фантом сайленсу Phantom's Embrace та захищає під Soulbind.",
        "reason_ru": "Снимает фантом сайленса Phantom's Embrace и защищает под Soulbind.",
        "reason_en": "Removes the Phantom's Embrace silence phantom and protects during Soulbind."
      },
      {
        "item_key": "manta",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Миттєво скидає духа Phantom's Embrace та сповільнення Stroke of Fate.",
        "reason_ru": "Мгновенно сбрасывает духа Phantom's Embrace и замедление от Stroke of Fate.",
        "reason_en": "Instantly purges the Phantom's Embrace spirit and Stroke of Fate slow."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виводить звʼязану пару Soulbind із-під фокусу.",
        "reason_ru": "Выводит связанную пару Soulbind из-под фокуса.",
        "reason_en": "Pushes the Soulbind-tethered pair out of focus."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Сап / Фулл сап • Связка двух героев Soulbind, сайленс Phantom и Dark Portrait",
    "primary_role_en": "Support / Pos 5 • Two-hero leash Soulbind, Phantom silence, and Dark Portrait"
  },
  "gyrocopter": {
    "primary_role_uk": "Керрі / Сап • Масовий розстріл Flak Cannon і магічний бурст Call Down",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Flak Cannon + Side Gunner",
        "note_uk": "Одночасно бʼє по всій команді ворога в радіусі 1250.",
        "note_ru": "Одновременно бьет по всей команде врага в радиусе 1250.",
        "note_en": "Simultaneously hits the entire enemy team within a 1250 radius."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Rocket Barrage + Call Down",
        "note_uk": "Високий ранній і командний магічний прокаст.",
        "note_ru": "Высокий ранний и командный магический прокаст.",
        "note_en": "High early-game and teamfight magic burst."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Homing Missile",
        "note_uk": "Ракета змушує відступати або бити її.",
        "note_ru": "Ракета заставляет отступать или бить ее.",
        "note_en": "Homing Missile forces enemies to retreat or destroy it."
      }
    ],
    "priority_items": [
      {
        "item_key": "crimson_guard",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує шкоду від залпів Flak Cannon по всій команді.",
        "reason_ru": "Блокирует урон от залпов Flak Cannon по всей команде.",
        "reason_en": "Blocks damage from Flak Cannon volleys across the whole team."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює Gyrocopter під час увімкненого Flak Cannon (до BKB).",
        "reason_ru": "Обезоруживает Gyrocopter во время включенного Flak Cannon (до нажатия BKB).",
        "reason_en": "Disarms Gyrocopter while Flak Cannon is active (before BKB)."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Рятує з-під Rocket Barrage, Call Down та Homing Missile.",
        "reason_ru": "Спасает от урона Rocket Barrage, Call Down и Homing Missile.",
        "reason_en": "Protects against Rocket Barrage, Call Down, and Homing Missile."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4,
      5
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar",
      "satanic"
    ],
    "primary_role_ru": "Керри / Сап • Массовый расстрел Flak Cannon и магический бурст Call Down",
    "primary_role_en": "Carry / Support • AoE Flak Cannon barrage and Call Down magic burst"
  },
  "hoodwink": {
    "primary_role_uk": "Сап • Звʼязка до дерева Bushwhack, Break від Sharpshooter та ухилення",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Bushwhack + Acorn Shot",
        "note_uk": "Миттєво садить дерево й привʼязує до нього зі станом.",
        "note_ru": "Мгновенно сажает дерево и привязывает к нему со станом.",
        "note_en": "Instantly plants a tree and stuns enemies tethered to it."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Sharpshooter + Hunter's Boomerang",
        "note_uk": "Дальній постріл наносить величезну шкоду та накладає Break.",
        "note_ru": "Дальний выстрел наносит огромный урон и накладывает Break.",
        "note_en": "Long-range shot deals massive damage and applies Break."
      },
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Scurry + Mistwoods Wayfarer",
        "note_uk": "Перенаправляє атаки в дерева та бігає крізь ліс.",
        "note_ru": "Перенаправляет атаки в деревья и бегает сквозь лес.",
        "note_en": "Redirects attacks into trees and scurries through the forest."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Ламає дерева або виштовхує союзника з лінії пострілу Sharpshooter.",
        "reason_ru": "Ломает деревья или выталкивает союзника с линии выстрела Sharpshooter.",
        "reason_en": "Breaks trees or pushes an ally out of Sharpshooter's line of fire."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає стан Bushwhack та дебаф Break від Sharpshooter.",
        "reason_ru": "Снимает стан Bushwhack и дебафф Break от Sharpshooter.",
        "reason_en": "Dispels the Bushwhack stun and the Break debuff from Sharpshooter."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ігнорує Bushwhack та магічну шкоду Sharpshooter.",
        "reason_ru": "Игнорирует Bushwhack и магический урон от Sharpshooter.",
        "reason_en": "Ignores Bushwhack and the magic damage of Sharpshooter."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Сап • Привязка к дереву Bushwhack, Break от Sharpshooter и уклонение",
    "primary_role_en": "Support • Bushwhack tree stun, Sharpshooter Break, and evasion"
  },
  "jakiro": {
    "primary_role_uk": "Фул сап / Сап • Тривалий стан Ice Path, періодичне горіння Macropyre і пуш",
    "threats": [
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Macropyre + Dual Breath + Liquid Fire",
        "note_uk": "Випалює зону бою потужним періодичним магічним уроном.",
        "note_ru": "Выжигает зону боя мощным периодическим магическим уроном.",
        "note_en": "Scorches the battlefield with heavy periodic magic damage."
      },
      {
        "tag": "magic_burst",
        "severity": 2,
        "source_ability": "Ice Path + Macropyre",
        "note_uk": "Масовий контроль і шкода у вузьких проходах.",
        "note_ru": "Массовый контроль и урон в узких проходах.",
        "note_en": "AoE crowd control and damage in narrow chokepoints."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Ice Path",
        "note_uk": "Довга крижана доріжка перекриває позицію.",
        "note_ru": "Длинная ледяная дорожка перекрывает позицию.",
        "note_en": "Long Ice Path wall zones out enemies."
      }
    ],
    "priority_items": [
      {
        "item_key": "pipe",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Поглинає періодичну магічну шкоду Dual Breath та Macropyre по команді.",
        "reason_ru": "Поглощает периодический магический урон от Dual Breath и Macropyre по команде.",
        "reason_en": "Absorbs the magic DoT of Dual Breath and Macropyre across the team."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Швидко виводить союзників із вогняної доріжки Macropyre та Ice Path.",
        "reason_ru": "Быстро выводит союзников из огненной дорожки Macropyre и со льда Ice Path.",
        "reason_en": "Quickly pushes allies out of the Macropyre fire trail and Ice Path."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє битися прямо на Ice Path та Macropyre.",
        "reason_ru": "Позволяет драться прямо на Ice Path и в Macropyre.",
        "reason_en": "Allows fighting right inside Ice Path and Macropyre."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Фулл сап / Сап • Длительный стан Ice Path, периодическое горение Macropyre и пуш",
    "primary_role_en": "Pos 5 / Support • Long Ice Path stun, Macropyre DoT burn, and push"
  },
  "kunkka": {
    "primary_role_uk": "Мідер / Офлейнер • Повернення X Marks + Ghostship + Torrent і баф Rum",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "X Marks the Spot + Torrent",
        "note_uk": "Гарантовано повертає ціль у точку під корабель і фонтан.",
        "note_ru": "Гарантированно возвращает цель в точку под корабль и фонтан.",
        "note_en": "Guarantees returning the target to the spot for Ghostship and Torrent."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Ghostship + Torrent + Tidal Wave",
        "note_uk": "Масовий контроль і прокаст по всій команді.",
        "note_ru": "Массовый контроль и прокаст по всей команде.",
        "note_en": "Massive AoE crowd control and spell combo across the enemy team."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Tidebringer",
        "note_uk": "Потужний сплеш-удар по лінії та беклайну.",
        "note_ru": "Мощный сплеш-удар по линии и бэклайну.",
        "note_en": "Powerful cleave strike across the lane and backline."
      }
    ],
    "priority_items": [
      {
        "item_key": "cyclone",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Підняття себе в Eul у момент повернення X Marks повністю уникає X + Torrent комбо.",
        "reason_ru": "Поднятие себя в Eul в момент возврата X Marks полностью избегает комбо X + Torrent.",
        "reason_en": "Self-casting Eul's right as X Marks returns completely dodges the X + Torrent combo."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Блокує повернення X Marks the Spot і стан від Ghostship.",
        "reason_ru": "Блокирует возврат X Marks the Spot и стан от Ghostship.",
        "reason_en": "Blocks the X Marks the Spot return and the Ghostship stun."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Kunkka повісити X Marks the Spot на старті файту.",
        "reason_ru": "Не дает Kunkka повесить X Marks the Spot на старте файта.",
        "reason_en": "Prevents Kunkka from landing X Marks the Spot at the start of a fight."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3
    ],
    "typical_items": [
      "satanic",
      "invis_sword",
      "blade_mail"
    ],
    "primary_role_ru": "Мидер / Оффлейнер • Возврат X Marks + Ghostship + Torrent и бафф Rum",
    "primary_role_en": "Midlaner / Offlaner • X Marks return + Ghostship + Torrent and Rum buff"
  },
  "lich": {
    "primary_role_uk": "Фул сап / Сап • Відскоки Chain Frost, гіпноз Sinister Gaze та Frost Shield",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Chain Frost + Frost Blast + Ice Spire",
        "note_uk": "Куля Chain Frost знищує команду у скупченні.",
        "note_ru": "Шар Chain Frost уничтожает команду в скоплении.",
        "note_en": "Chain Frost orb devastates grouped-up teams."
      },
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Sinister Gaze",
        "note_uk": "Точковий потоковий гіпноз підтягує ціль.",
        "note_ru": "Точечный потоковый гипноз подтягивает цель.",
        "note_en": "Single-target channeled hypnosis pulls the target closer."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Frost Shield",
        "note_uk": "Дає 60% зменшення фізичної шкоди з атак (знімається Nullifier).",
        "note_ru": "Дает 60% уменьшения физического урона с атак (снимается Nullifier).",
        "note_en": "Grants 60% physical attack damage reduction (dispelled by Nullifier)."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєво розводить союзників у сторони, щоб перервати відскоки Chain Frost.",
        "reason_ru": "Мгновенно разводит союзников в стороны, чтобы прервать отскоки Chain Frost.",
        "reason_en": "Instantly separates allies to break Chain Frost bounces."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Рятує команду від серії відскоків Chain Frost.",
        "reason_ru": "Спасает команду от серии отскоков Chain Frost.",
        "reason_en": "Saves the team from a series of Chain Frost bounces."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Інвіз і магічний барʼєр рятують ціль від Chain Frost.",
        "reason_ru": "Инвиз и магический барьер спасают цель от Chain Frost.",
        "reason_en": "Invisibility and the magic barrier save the target from Chain Frost."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Фулл сап / Сап • Отскоки Chain Frost, гипноз Sinister Gaze и Frost Shield",
    "primary_role_en": "Pos 5 / Support • Chain Frost bounces, Sinister Gaze hypnosis, and Frost Shield"
  },
  "lina": {
    "primary_role_uk": "Мідер / Керрі / Сап • Вибуховий Laguna Blade, горіння Slow Burn і Fiery Soul",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Laguna Blade + Light Strike Array + Dragon Slave",
        "note_uk": "Знищує ціль за 1 секунду прокастом + допалює через Slow Burn.",
        "note_ru": "Уничтожает цель за 1 секунду прокастом + дожигает через Slow Burn.",
        "note_en": "Deletes a target in 1 second with spell burst + Slow Burn DoT."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Fiery Soul",
        "note_uk": "Величезна швидкість атаки та дальність розстрілу.",
        "note_ru": "Огромная скорость атаки и дальность расстрела.",
        "note_en": "Massive attack speed and long attack range."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Laguna Blade",
        "note_uk": "Точковий фінішер на величезну шкоду.",
        "note_ru": "Точечный финишер на огромный урон.",
        "note_en": "Single-target finisher with massive burst damage."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Захищає від Light Strike Array, Laguna Blade і горіння Slow Burn.",
        "reason_ru": "Защищает от Light Strike Array, Laguna Blade и горения от Slow Burn.",
        "reason_en": "Protects against Light Strike Array, Laguna Blade, and Slow Burn."
      },
      {
        "item_key": "blade_mail",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Карає Lina за каст Laguna Blade та швидкий розстріл під Fiery Soul.",
        "reason_ru": "Наказывает Lina за каст Laguna Blade и быстрый расстрел под Fiery Soul.",
        "reason_en": "Punishes Lina for casting Laguna Blade and rapid-firing under Fiery Soul."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Магічний барʼєр рятує союзників від Laguna Blade.",
        "reason_ru": "Магический барьер спасает союзников от Laguna Blade.",
        "reason_en": "The magic barrier saves allies from Laguna Blade."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      1,
      4
    ],
    "typical_items": [
      "invis_sword"
    ],
    "primary_role_ru": "Мидер / Керри / Сап • Взрывной Laguna Blade, горение Slow Burn и Fiery Soul",
    "primary_role_en": "Midlaner / Carry / Support • Explosive Laguna Blade, Slow Burn DoT, and Fiery Soul"
  },
  "lone_druid": {
    "primary_role_uk": "Керрі / Мідер • Ведмідь Spirit Bear, коріння Entangle та вампіризм Spirit Link",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Summon Spirit Bear + Demolish",
        "note_uk": "Ведмідь із 6 слотами миттєво ламає героїв та будівлі.",
        "note_ru": "Медведь с 6 слотами мгновенно ломает героев и строения.",
        "note_en": "Six-slotted Spirit Bear instantly shreds heroes and buildings."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Entangling Claws",
        "note_uk": "Коріння ведмедя не дає рухатися та використовувати мобільні скіли.",
        "note_ru": "Корни медведя не дают двигаться и использовать мобильные скиллы.",
        "note_en": "Bear's Entangle root prevents movement and mobility spells."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Spirit Link + True Form",
        "note_uk": "Передає вампіризм від ударів ведмедя самому друїду.",
        "note_ru": "Передает вампиризм от ударов медведя самому друиду.",
        "note_en": "Shares lifesteal and attack speed between the Spirit Bear and Lone Druid."
      }
    ],
    "priority_items": [
      {
        "item_key": "heavens_halberd",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Обеззброює Spirit Bear на 3.5 с — зупиняє і шкоду, і коріння, і відхіл друїда.",
        "reason_ru": "Обезоруживает Spirit Bear на 3.5 с — останавливает и урон, и корни, и отхил друида.",
        "reason_en": "Disarms the Spirit Bear for 3.5s — stopping its damage, Entangling Claws procs, and Druid's shared healing."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Виштовхує союзника з-під ведмедя під час Entangling Claws.",
        "reason_ru": "Выталкивает союзника из-под медведя во время Entangling Claws.",
        "reason_en": "Pushes an ally away from the Spirit Bear during Entangling Claws."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Повністю блокує фізичні атаки ведмедя по сапорту.",
        "reason_ru": "Полностью блокирует физические атаки медведя по саппорту.",
        "reason_en": "Completely blocks the Spirit Bear's physical attacks on a support."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Керри / Мидер • Медведь Spirit Bear, корни Entangle и вампиризм Spirit Link",
    "primary_role_en": "Carry / Midlaner • Spirit Bear, Entangle root, and Spirit Link lifesteal"
  },
  "luna": {
    "primary_role_uk": "Керрі • Магічний ульт Eclipse та фізичні відскоки Moon Glaives",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Eclipse + Lucent Beam",
        "note_uk": "Стирає героїв магічними променями у командному файті.",
        "note_ru": "Стирает героев магическими лучами в командном файте.",
        "note_en": "Melts heroes with magical beams in teamfights."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Moon Glaives + Lunar Blessing",
        "note_uk": "Глефи рикошетять по всій команді та базі.",
        "note_ru": "Глефы рикошетят по всей команде и базе.",
        "note_en": "Glaives bounce across the entire enemy team and base."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Повністю блокує магічний розстріл Eclipse і Lucent Beam.",
        "reason_ru": "Полностью блокирует магический расстрел Eclipse и Lucent Beam.",
        "reason_en": "Completely blocks the magic burst of Eclipse and Lucent Beam."
      },
      {
        "item_key": "crimson_guard",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Зрізає фізичну шкоду від відскоків Moon Glaives по команді.",
        "reason_ru": "Срезает физический урон от отскоков Moon Glaives по команде.",
        "reason_en": "Reduces physical damage from Moon Glaives bounces across the team."
      },
      {
        "item_key": "glimmer_cape",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ховає союзника в інвіз, зупиняючи влучання променів Eclipse.",
        "reason_ru": "Прячет союзника в инвиз, останавливая попадания лучей Eclipse.",
        "reason_en": "Hides an ally in invisibility, stopping Eclipse beams from hitting them."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar",
      "satanic"
    ],
    "primary_role_ru": "Керри • Магический ульт Eclipse и физические отскоки Moon Glaives",
    "primary_role_en": "Carry • Magical Eclipse ultimate and physical Moon Glaives bounces"
  },
  "lycan": {
    "primary_role_uk": "Офлейнер / Керрі • 650 швидкості у Shapeshift, вовки та реген Feral Impulse",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Shapeshift + Summon Wolves",
        "note_uk": "На максимальній швидкості з критами миттєво зʼїдає сапортів.",
        "note_ru": "На максимальной скорости с критами мгновенно съедает саппортов.",
        "note_en": "At max haste speed with crits, instantly devours supports."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Summon Wolves + Helm of the Overlord",
        "note_uk": "Зграя юнітів створює колосальний фізичний тиск.",
        "note_ru": "Стая юнитов создает колоссальное физическое давление.",
        "note_en": "Pack of summons creates colossal physical pressure."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Shapeshift",
        "note_uk": "Імунітет до сповільнень для нього і всіх підконтрольних істот.",
        "note_ru": "Иммунитет к замедлениям для него и всех подконтрольных существ.",
        "note_en": "Unslowable haste for himself and all controlled units."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Feral Impulse",
        "note_uk": "Високий пасивний реген у всієї зграї.",
        "note_ru": "Высокий пассивный реген у всей стаи.",
        "note_en": "High passive HP regen for the entire pack."
      }
    ],
    "priority_items": [
      {
        "item_key": "ghost",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Найкращий порятунок сапорта від забігу Lycan і вовків під Shapeshift.",
        "reason_ru": "Лучшее спасение саппорта от забега Lycan и волков под Shapeshift.",
        "reason_en": "Best support save against Lycan and his wolves charging in under Shapeshift."
      },
      {
        "item_key": "crimson_guard",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує серію ударів від вовків та приручених кріпів.",
        "reason_ru": "Блокирует серию ударов от волков и прирученных крипов.",
        "reason_en": "Blocks the flurry of attacks from wolves and summoned creeps."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює Lycan під час дії його короткого Shapeshift.",
        "reason_ru": "Обезоруживает Lycan во время действия его короткого Shapeshift.",
        "reason_en": "Disarms Lycan during his brief Shapeshift window."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      1,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер / Керри • 650 скорости в Shapeshift, волки и реген Feral Impulse",
    "primary_role_en": "Offlaner / Carry • 650 speed in Shapeshift, wolves, and Feral Impulse regen"
  },
  "magnataur": {
    "primary_role_uk": "Офлейнер / Мідер • Reverse Polarity крізь BKB, Skewer і баф Empower",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Reverse Polarity + Skewer + Horn Toss",
        "note_uk": "Стягує команду крізь BKB та вивозить ключову ціль на Skewer.",
        "note_ru": "Стягивает команду сквозь BKB и увозит ключевую цель на Skewer.",
        "note_en": "Pulls the enemy team together through BKB and skewers away a key target."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Empower",
        "note_uk": "Дає союзному керрі бонусну атаку та сплеш (знімається Nullifier).",
        "note_ru": "Дает союзному керри бонусную атаку и сплеш (снимается Nullifier).",
        "note_en": "Grants bonus damage and cleave to an allied carry (dispelled by Nullifier)."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Skewer + Blink",
        "note_uk": "Миттєвий врив і викрадення з позиції.",
        "note_ru": "Мгновенный врыв и похищение с позиции.",
        "note_en": "Instant initiation and kidnapping out of position."
      }
    ],
    "priority_items": [
      {
        "item_key": "aeon_disk",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Дозволяє пережити Reverse Polarity і дати контр-ініціацію.",
        "reason_ru": "Позволяет пережить Reverse Polarity и дать контр-инициацию.",
        "reason_en": "Allows surviving Reverse Polarity and turning with counter-initiation."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Збиває позицію Magnus або витягує союзника після Skewer.",
        "reason_ru": "Сбивает позицию Magnus или вытягивает союзника после Skewer.",
        "reason_en": "Disrupts Magnus's positioning or pulls an ally out after Skewer."
      },
      {
        "item_key": "nullifier",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає баф Empower із ворожого керрі.",
        "reason_ru": "Снимает бафф Empower с вражеского керри.",
        "reason_en": "Dispels the Empower buff from the enemy carry."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2,
      4
    ],
    "typical_items": [
      "invis_sword"
    ],
    "primary_role_ru": "Оффлейнер / Мидер • Reverse Polarity сквозь BKB, Skewer и бафф Empower",
    "primary_role_en": "Offlaner / Midlaner • Reverse Polarity through BKB, Skewer, and Empower buff"
  },
  "marci": {
    "primary_role_uk": "Сап / Керрі / Мідер • Стрибок Rebound, перекидання Dispose та серія Unleash",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Unleash + Bodyguard",
        "note_uk": "Швидка серія ударів під ультою стирає ціль за секунди.",
        "note_ru": "Быстрая серия ударов под ультой стирает цель за секунды.",
        "note_en": "Rapid Unleash combos erase a target in seconds."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Rebound",
        "note_uk": "Стрибає на величезну дистанцію через союзника.",
        "note_ru": "Прыгает на огромную дистанцию через союзника.",
        "note_en": "Rebounds across a huge distance off a unit."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Bodyguard",
        "note_uk": "Дає вампіризм та контратаки собі й союзному кору.",
        "note_ru": "Дает вампиризм и контратаки себе и союзному кору.",
        "note_en": "Grants lifesteal and counter-attacks to himself and an allied core."
      }
    ],
    "priority_items": [
      {
        "item_key": "ghost",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Повністю рятує від серії швидких фізичних ударів Unleash.",
        "reason_ru": "Полностью спасает от серии быстрых физических ударов Unleash.",
        "reason_en": "Completely saves from the rapid flurry of physical Unleash strikes."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Обеззброює Marci під час її вікна Unleash.",
        "reason_ru": "Обезоруживает Marci во время ее окна Unleash.",
        "reason_en": "Disarms Marci during her Unleash window."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Рятує союзника після перекидання через Dispose.",
        "reason_ru": "Спасает союзника после переброса через Dispose.",
        "reason_en": "Saves an ally after being thrown by Dispose."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      1,
      2,
      3
    ],
    "typical_items": [
      "black_king_bar"
    ],
    "primary_role_ru": "Сап / Керри / Мидер • Прыжок Rebound, переброс Dispose и серия Unleash",
    "primary_role_en": "Support / Carry / Midlaner • Rebound jump, Dispose throw, and Unleash flurry"
  },
  "mars": {
    "primary_role_uk": "Офлейнер • Ізоляція в Arena Of Blood, спис Spear of Mars і щит Bulwark",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Arena Of Blood + Spear of Mars",
        "note_uk": "Замикає в арені, блокуючи зовнішні снаряди та прибиваючи списом.",
        "note_ru": "Запирает в арене, блокируя внешние снаряды и прибивая копьем.",
        "note_en": "Traps enemies inside the Arena, blocking outside projectiles and pinning them with Spear."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "God's Rebuke",
        "note_uk": "Масовий критичний удар щитом по області.",
        "note_ru": "Массовый критический удар щитом по области.",
        "note_en": "AoE critical shield bash."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Bulwark / Dauntless",
        "note_uk": "Пасивно блокує 70% фізичної шкоди спереду.",
        "note_ru": "Пассивно блокирует 70% физического урона спереди.",
        "note_en": "Passively blocks 70% of physical attack damage from the front."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Дозволяє вільно вийти крізь стінки Arena Of Blood і не прибитися списом.",
        "reason_ru": "Позволяет свободно выйти сквозь стенки Arena Of Blood и не прибиться копьем.",
        "reason_en": "Allows walking freely through Arena Of Blood walls and avoids being pinned by Spear of Mars."
      },
      {
        "item_key": "cyclone",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Піднімає Mars після арени, не даючи йому влучити Spear of Mars.",
        "reason_ru": "Поднимает Mars после установки арены, не давая ему попасть копьем Spear of Mars.",
        "reason_en": "Lifts Mars right after Arena, preventing him from landing Spear of Mars."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Вимикає пасивний блок фізичної шкоди Bulwark.",
        "reason_ru": "Отключает пассивный блок физического урона Bulwark.",
        "reason_en": "Disables the passive physical damage block of Bulwark."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2
    ],
    "typical_items": [
      "black_king_bar",
      "blade_mail"
    ],
    "primary_role_ru": "Оффлейнер • Изоляция в Arena Of Blood, копье Spear of Mars и щит Bulwark",
    "primary_role_en": "Offlaner • Isolation in Arena Of Blood, Spear of Mars, and Bulwark shield"
  },
  "monkey_king": {
    "primary_role_uk": "Керрі / Мідер / Сап • Вампіризм Jingu Mastery, Tree Dance і арена Wukong's Command",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Jingu Mastery + Boundless Strike + Wukong's Command",
        "note_uk": "Заряджені удари Jingu + солдати в арені наносять колосальний фіз-урон.",
        "note_ru": "Заряженные удары Jingu + солдаты в арене наносят колоссальный физ-урон.",
        "note_en": "Charged Jingu strikes + Wukong's Command soldiers deal colossal physical damage."
      },
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Jingu Mastery",
        "note_uk": "Один удар Boundless Strike під Jingu відхілює MK на повне HP.",
        "note_ru": "Один удар Boundless Strike под Jingu отхиливает MK на полное HP.",
        "note_en": "A single Boundless Strike with Jingu Mastery heals MK to full HP."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Wukong's Command",
        "note_uk": "Кільце солдатів контролює велику територію.",
        "note_ru": "Кольцо солдат контролирует большую территорию.",
        "note_en": "Ring of soldiers zones and controls a large area."
      },
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Jingu Mastery",
        "note_uk": "Break не дає MK набирати 4 стаки Jingu Mastery.",
        "note_ru": "Break не дает MK набирать 4 стака Jingu Mastery.",
        "note_en": "Break prevents MK from gaining Jingu Mastery stacks."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Виштовхує Monkey King за межі власного кола Wukong's Command (арена миттєво зникає) або виводить союзника.",
        "reason_ru": "Выталкивает Monkey King за пределы его круга Wukong's Command (арена мгновенно исчезает) или выводит союзника.",
        "reason_en": "Pushes Monkey King outside his own Wukong's Command ring (instantly ending the ultimate) or saves an ally."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Ріже шалений вампіризм Jingu Mastery і збиває Tree Dance.",
        "reason_ru": "Режет бешеный вампиризм Jingu Mastery и сбивает Tree Dance.",
        "reason_en": "Cuts the massive lifesteal of Jingu Mastery and puts Tree Dance on cooldown."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Monkey King набивати стаки Jingu Mastery в дуелі.",
        "reason_ru": "Не дает Monkey King набивать стаки Jingu Mastery в дуэли.",
        "reason_en": "Prevents Monkey King from building Jingu Mastery stacks in manfights."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2,
      4
    ],
    "typical_items": [
      "butterfly",
      "black_king_bar",
      "satanic"
    ],
    "primary_role_ru": "Керри / Мидер / Сап • Вампиризм Jingu Mastery, Tree Dance и арена Wukong's Command",
    "primary_role_en": "Carry / Midlaner / Support • Jingu Mastery lifesteal, Tree Dance, and Wukong's Command arena"
  },
  "muerta": {
    "primary_role_uk": "Керрі / Сап • Магічний розстріл Pierce the Veil, страх Dead Shot і сайленс The Calling",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Pierce the Veil + Gunslinger",
        "note_uk": "Усі атаки в ульті стають магічними й бʼють по 2 цілях, ігноруючи фіз-броню.",
        "note_ru": "Все атаки в ульте становятся магическими и бьют по 2 целям, игнорируя физ-броню.",
        "note_en": "All attacks during ultimate deal magic damage and hit 2 targets, ignoring physical armor."
      },
      {
        "tag": "silence_zone",
        "severity": 2,
        "source_ability": "The Calling",
        "note_uk": "Коло привидів сповільнює та накладає безмовність.",
        "note_ru": "Круг призраков замедляет и накладывает безмолвие.",
        "note_en": "Ring of revenants slows and silences enemies."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Pierce the Veil",
        "note_uk": "Безтілесна форма в ульті дає 100% імунітет до фізичної шкоди.",
        "note_ru": "Бесплотная форма в ульте дает 100% иммунитет к физическому урону.",
        "note_en": "Ethereal form during ultimate grants 100% physical damage immunity."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Головний контр-предмет: під BKB магічні постріли Pierce the Veil майже не пробивають кору.",
        "reason_ru": "Главный контр-предмет: под BKB магические выстрелы Pierce the Veil почти не пробивают кора.",
        "reason_en": "Primary counter-item: under BKB, Pierce the Veil magic attacks deal minimal damage to your core."
      },
      {
        "item_key": "pipe",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Магічний щит та опір магії рятують команду під час ультимату Muerta.",
        "reason_ru": "Магический щит и сопротивление магии спасают команду во время ультимейта Muerta.",
        "reason_en": "The magic barrier and magic resistance save the team during Muerta's ultimate."
      },
      {
        "item_key": "mage_slayer",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Зрізає шкоду від скілів та посилень Muerta.",
        "reason_ru": "Срезает урон от скиллов и усилений Muerta.",
        "reason_en": "Reduces damage from Muerta's spells and buffs."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4,
      5
    ],
    "typical_items": [
      "black_king_bar"
    ],
    "primary_role_ru": "Керри / Сап • Магический расстрел Pierce the Veil, страх Dead Shot и сайленс The Calling",
    "primary_role_en": "Carry / Support • Magical Pierce the Veil barrage, Dead Shot fear, and The Calling silence"
  },
  "furion": {
    "primary_role_uk": "Керрі / Сап / Офлейнер • Пастка Sprout, глобальний Teleportation і ент-пуш",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Sprout",
        "note_uk": "Замикає в кільці дерев (з левелом — із привʼязкою Leash).",
        "note_ru": "Запирает в кольце деревьев (с уровнем — с привязкой Leash).",
        "note_en": "Traps in a ring of trees (with talent — applies Leash)."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Teleportation",
        "note_uk": "Прилітає в будь-яку точку карти кожні 20 секунд.",
        "note_ru": "Прилетает в любую точку карты каждые 20 секунд.",
        "note_en": "Teleports anywhere on the map every 20 seconds."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Nature's Call",
        "note_uk": "Енти блокують прохід і пушать лінії.",
        "note_ru": "Тренты блокируют проход и пушат линии.",
        "note_en": "Treants body-block paths and push lanes."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Прорубує дерева Sprout і миттєво визволяє себе або союзника з пастки.",
        "reason_ru": "Прорубает деревья Sprout и мгновенно освобождает себя или союзника из ловушки.",
        "reason_en": "Cuts through Sprout trees and pushes yourself or an ally out of the trap."
      },
      {
        "item_key": "bfury",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Миттєво зрубує дерево Sprout (Chop Tree) та чистить ентів.",
        "reason_ru": "Мгновенно срубает дерево Sprout (Chop Tree) и зачищает трентов.",
        "reason_en": "Instantly chops down a Sprout tree (Chop Tree) and clears Treants."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Фуріону відлетіти через Teleportation.",
        "reason_ru": "Не дает Nature's Prophet улететь через Teleportation.",
        "reason_en": "Prevents Nature's Prophet from escaping with Teleportation."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      4,
      5,
      3
    ],
    "typical_items": [
      "orchid",
      "invis_sword"
    ],
    "primary_role_ru": "Керри / Сап / Оффлейнер • Ловушка Sprout, глобальный Teleportation и трент-пуш",
    "primary_role_en": "Carry / Support / Offlaner • Sprout trap, global Teleportation, and treant push"
  },
  "night_stalker": {
    "primary_role_uk": "Офлейнер • Незнімальний аура-сайленс Crippling Fear і політ у Dark Ascension",
    "threats": [
      {
        "tag": "silence_zone",
        "severity": 3,
        "source_ability": "Crippling Fear",
        "note_uk": "Постійна зона безмовності навколо NS — звичайний диспел не допомагає, поки він поруч.",
        "note_ru": "Постоянная зона безмолвия вокруг NS — обычный диспел не помогает, пока он рядом.",
        "note_en": "Constant silence aura around NS — Basic Dispel won't help while he stays on top of you."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Dark Ascension + Hunter in the Night",
        "note_uk": "Літає над деревами з оглядом і величезною швидкістю вночі.",
        "note_ru": "Летает над деревьями с обзором и огромной скоростью ночью.",
        "note_en": "Flies over trees with unobstructed vision and massive speed at night."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Dark Ascension",
        "note_uk": "Величезна бонусна атака з руки під ультою.",
        "note_ru": "Огромная бонусная атака с руки под ультой.",
        "note_en": "Massive bonus right-click damage during ultimate."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Єдиний дешевий спосіб виштовхнути себе із зони аури сайленсу Crippling Fear.",
        "reason_ru": "Единственный дешевый способ вытолкнуть себя из зоны ауры сайленса Crippling Fear.",
        "reason_en": "The only cheap way to push yourself out of the Crippling Fear silence aura."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Дозволяє кастувати всередині Crippling Fear.",
        "reason_ru": "Позволяет применять способности внутри Crippling Fear.",
        "reason_en": "Allows casting spells freely inside Crippling Fear."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює Night Stalker під час його польоту Dark Ascension.",
        "reason_ru": "Обезоруживает Night Stalker во время его полета в Dark Ascension.",
        "reason_en": "Disarms Night Stalker during his Dark Ascension flight."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер • Неснимаемый аура-сайленс Crippling Fear и полет в Dark Ascension",
    "primary_role_en": "Offlaner • Undispellable Crippling Fear aura silence and flight in Dark Ascension"
  },
  "ogre_magi": {
    "primary_role_uk": "Фул сап / Сап / Мідер • Багаторазовий Multicast станів та предметів і Bloodlust",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Fireblast + Multicast",
        "note_uk": "Серія станів та предметів (Hex/Orchid/Dagon) з множником Multicast x2–x4.",
        "note_ru": "Серия станов и предметов (Hex/Orchid/Dagon) с множителем Multicast x2–x4.",
        "note_en": "Chain of stuns and active items (Hex/Orchid/Dagon) multiplied by x2–x4 Multicast."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Ignite + Multicast",
        "note_uk": "Масове горіння та сповільнення по всій команді.",
        "note_ru": "Массовое горение и замедление по всей команде.",
        "note_en": "AoE burn and slow across the entire enemy team."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Bloodlust / Fire Shield",
        "note_uk": "Розганяє швидкість атаки союзних корів.",
        "note_ru": "Разгоняет скорость атаки союзных коров.",
        "note_en": "Buffs attack and movement speed of allied cores."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Знімає Ignite і відбиває Fireblast та предметні хекси Ogre Magi.",
        "reason_ru": "Снимает Ignite и отражает Fireblast и предметные хексы Ogre Magi.",
        "reason_en": "Dispels Ignite and reflects Fireblast and item hexes back onto Ogre Magi."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Повністю захищає від серії станів Fireblast та Ignite.",
        "reason_ru": "Полностью защищает от серии станов Fireblast и горения Ignite.",
        "reason_en": "Completely protects against Multicast Fireblast stuns and Ignite."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Поглинає масове горіння Multicast Ignite.",
        "reason_ru": "Поглощает массовое горение от Multicast Ignite.",
        "reason_en": "Absorbs the widespread magic burn of Multicast Ignite."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Фулл сап / Сап / Мидер • Многократный Multicast станов и предметов и Bloodlust",
    "primary_role_en": "Pos 5 / Support / Midlaner • Multi-hit Multicast on stuns and items and Bloodlust"
  },
  "obsidian_destroyer": {
    "primary_role_uk": "Мідер • Чиста шкода Arcane Orb, астрал Astral Imprisonment і Sanity's Eclipse",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Sanity's Eclipse + Arcane Orb",
        "note_uk": "Чистий урон з кожної тички та масивний AoE-ульт по різниці мани.",
        "note_ru": "Чистый урон с каждой тычки и массивный AoE-ульт по разнице маны.",
        "note_en": "Pure damage on every right-click and a massive AoE ultimate scaling with mana difference."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Astral Imprisonment",
        "note_uk": "Ховає ціль або себе в астрал на 4 секунди.",
        "note_ru": "Прячет цель или себя в астрал на 4 секунды.",
        "note_en": "Banishes a target or himself into Astral Imprisonment for 4 seconds."
      },
      {
        "tag": "critical_passive",
        "severity": 3,
        "source_ability": "Essence Flux",
        "note_uk": "Break вимикає відновлення мани Essence Flux — без нього OD не може бити Arcane Orb.",
        "note_ru": "Break выключает восстановление маны Essence Flux — без него OD не может бить Arcane Orb.",
        "note_en": "Break disables Essence Flux mana restore — without it, OD runs out of mana for Arcane Orb."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Повністю блокує чисту шкоду Arcane Orb, Astral Imprisonment і Sanity's Eclipse.",
        "reason_ru": "Полностью блокирует чистый урон Arcane Orb, а также Astral Imprisonment и Sanity's Eclipse.",
        "reason_en": "Completely blocks Arcane Orb pure damage, Astral Imprisonment, and Sanity's Eclipse."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Вимикає Essence Flux — OD миттєво спалює власну ману за кілька ударів.",
        "reason_ru": "Отключает Essence Flux — OD мгновенно сжигает собственную ману за несколько ударов.",
        "reason_en": "Disables Essence Flux — OD quickly burns through his own mana pool in a few attacks."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає OD бити Arcane Orb або заховатися в Astral Imprisonment.",
        "reason_ru": "Не дает OD бить через Arcane Orb или спрятаться в Astral Imprisonment.",
        "reason_en": "Prevents OD from casting Arcane Orb or hiding in Astral Imprisonment."
      }
    ],
    "default_position": 2,
    "positions": [
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Мидер • Чистый урон Arcane Orb, астрал Astral Imprisonment и Sanity's Eclipse",
    "primary_role_en": "Midlaner • Pure damage Arcane Orb, Astral Imprisonment banish, and Sanity's Eclipse"
  },
  "pangolier": {
    "primary_role_uk": "Мідер / Офлейнер • Контроль крізь бійку Rolling Thunder, барʼєр Shield Crash і Lucky Shot",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Swashbuckle + Rolling Thunder",
        "note_uk": "Швидко прорізає бійку та катається у дебаф-імунітеті.",
        "note_ru": "Быстро прорезает драку и катается в дебафф-иммунитете.",
        "note_en": "Rolls through teamfights with debuff immunity and AoE knockback."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Swashbuckle + Lucky Shot",
        "note_uk": "Накладає ефекти атаки та знижує броню і швидкість бою.",
        "note_ru": "Накладывает эффекты атаки и снижает броню и скорость боя.",
        "note_en": "Applies attack modifiers and reduces armor and attack speed."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Shield Crash",
        "note_uk": "Набирає великий універсальний барʼєр.",
        "note_ru": "Набирает большой универсальный барьер.",
        "note_en": "Gains a large damage barrier from hitting enemy heroes."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Не дає Pangolier безперервно башити вас колесом Rolling Thunder.",
        "reason_ru": "Не дает Pangolier непрерывно оглушать вас колесом Rolling Thunder.",
        "reason_en": "Prevents Pangolier from chain-stunning you with Rolling Thunder."
      },
      {
        "item_key": "abyssal_blade",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Стан крізь Debuff Immunity зупиняє Pangolier прямо під час Rolling Thunder.",
        "reason_ru": "Стан сквозь иммунитет к эффектам останавливает Pangolier прямо во время Rolling Thunder.",
        "reason_en": "Debuff-immunity-piercing stun stops Pangolier right in his tracks during Rolling Thunder."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Зриває каст Rolling Thunder і Swashbuckle.",
        "reason_ru": "Срывает каст Rolling Thunder и Swashbuckle.",
        "reason_en": "Interrupts the cast of Rolling Thunder and locks down Swashbuckle."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Мидер / Оффлейнер • Контроль сквозь драку Rolling Thunder, барьер Shield Crash и Lucky Shot",
    "primary_role_en": "Midlaner / Offlaner • Teamfight control Rolling Thunder, Shield Crash barrier, and Lucky Shot"
  },
  "phoenix": {
    "primary_role_uk": "Сап / Офлейнер • Процентне лікування/спалення Sun Ray, Fire Spirits (-AS) і Supernova",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Sun Ray",
        "note_uk": "Лікує союзників і спалює ворогів у відсотках від макс. HP.",
        "note_ru": "Лечит союзников и выжигает врагов в процентах от макс. HP.",
        "note_en": "Heals allies and burns enemies for a percentage of max HP."
      },
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Fire Spirits + Icarus Dive + Supernova",
        "note_uk": "Величезна періодична магічна шкода та уповільнення атак.",
        "note_ru": "Огромный периодический магический урон и замедление атак.",
        "note_en": "Massive periodic magic damage and attack speed slow."
      },
      {
        "tag": "evasion",
        "severity": 2,
        "source_ability": "Fire Spirits",
        "note_uk": "Різко знижує швидкість атаки, не даючи розбити яйце Supernova.",
        "note_ru": "Резко снижает скорость атаки, не давая разбить яйцо Supernova.",
        "note_en": "Drastically slows attack speed, preventing enemies from destroying the Supernova egg."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Знімає уповільнення атак Fire Spirits і дозволяє швидко розбити яйце Supernova.",
        "reason_ru": "Снимает замедление атак от Fire Spirits и позволяет быстро разбить яйцо Supernova.",
        "reason_en": "Purges the Fire Spirits attack speed slow, allowing you to quickly destroy the Supernova egg."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Знімає дебаф Fire Spirits із вашого керрі, щоб він міг бити Supernova.",
        "reason_ru": "Снимает дебафф Fire Spirits с вашего керри, чтобы он мог бить Supernova.",
        "reason_en": "Dispels the Fire Spirits debuff from your carry so they can hit the Supernova egg."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ріже процентне лікування від Sun Ray на 70%.",
        "reason_ru": "Режет процентное лечение от Sun Ray на 70%.",
        "reason_en": "Reduces the percentage-based healing of Sun Ray by 70%."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Оффлейнер • Процентное лечение/выжигание Sun Ray, Fire Spirits (-AS) и Supernova",
    "primary_role_en": "Support / Offlaner • Percentage heal/burn Sun Ray, Fire Spirits (-AS), and Supernova"
  },
  "primal_beast": {
    "primary_role_uk": "Офлейнер / Мідер • Врив Onslaught, тупотіння Trample та потоковий Pulverize",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Pulverize",
        "note_uk": "Схоплює ціль і бʼє об землю з AoE-станами.",
        "note_ru": "Хватает цель и бьет о землю с AoE-станами.",
        "note_en": "Grabs a target and slams them repeatedly into the ground with AoE stuns."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Trample + Onslaught",
        "note_uk": "Витоптує героїв величезною магічною шкодою від власної атаки.",
        "note_ru": "Вытаптывает героев огромным магическим уроном от собственной атаки.",
        "note_en": "Tramples heroes with massive magic damage scaling with his attack damage."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Onslaught",
        "note_uk": "Дальній розгін для початку бійки.",
        "note_ru": "Дальний разгон для начала драки.",
        "note_en": "Long-range charge to initiate fights."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує шкоду Trample, стан Onslaught та захоплення Pulverize.",
        "reason_ru": "Блокирует магический урон Trample, стан Onslaught и захват Pulverize.",
        "reason_en": "Blocks Trample magic damage, Onslaught stun, and Pulverize."
      },
      {
        "item_key": "cyclone",
        "priority": "critical",
        "score_bonus": 7,
        "reason_uk": "Миттєво перериває потоковий Pulverize або розгін Onslaught.",
        "reason_ru": "Мгновенно прерывает прерываемый Pulverize или разгон Onslaught.",
        "reason_en": "Instantly interrupts channeled Pulverize or Onslaught charge."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Допомагає розірвати дистанцію під час Trample.",
        "reason_ru": "Помогает разорвать дистанцию во время Trample.",
        "reason_en": "Helps break distance during Trample."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3,
      4
    ],
    "typical_items": [
      "black_king_bar",
      "satanic",
      "blade_mail"
    ],
    "primary_role_ru": "Оффлейнер / Мидер • Врыв Onslaught, топот Trample и потоковый Pulverize",
    "primary_role_en": "Offlaner / Midlaner • Onslaught charge, Trample stomp, and channeled Pulverize"
  },
  "queenofpain": {
    "primary_role_uk": "Мідер • Чистий ультимат Sonic Wave крізь BKB, Blink і магічний вампіризм Succubus",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Sonic Wave + Scream Of Pain",
        "note_uk": "Хвиля чистої шкоди та масовий прокаст.",
        "note_ru": "Волна чистого урона и массовый прокаст.",
        "note_en": "Pure damage shockwave and heavy AoE spell burst."
      },
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Blink",
        "note_uk": "Миттєвий врив і відхід на велику дистанцію.",
        "note_ru": "Мгновенный врыв и отход на большую дистанцию.",
        "note_en": "Instant long-range blink in and out."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Succubus (Innate)",
        "note_uk": "Вроджений вампіризм від заклинань (включно з чистою шкодою) у ближньому бою.",
        "note_ru": "Врожденный вампиризм от заклинаний (включая чистый урон) в ближнем бою.",
        "note_en": "Innate spell lifesteal (including from pure damage) at close range."
      }
    ],
    "priority_items": [
      {
        "item_key": "orchid",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Сайленс закриває Blink і не дає Queen of Pain вистрибнути з фокусу.",
        "reason_ru": "Сайленс закрывает Blink и не дает Queen of Pain выпрыгнуть из-под фокуса.",
        "reason_en": "Silence locks down Blink and prevents Queen of Pain from jumping out of focus."
      },
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєвий Hex без анімації ловить QoP до натискання Blink/BKB.",
        "reason_ru": "Мгновенный Hex без анимации ловит QoP до нажатия Blink или BKB.",
        "reason_en": "Instant cast-point Hex catches QoP before she can press Blink or BKB."
      },
      {
        "item_key": "mage_slayer",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Ріже всю шкоду Scream Of Pain і Sonic Wave на 40% та зменшує її відхіл Succubus.",
        "reason_ru": "Режет весь урон Scream Of Pain и Sonic Wave на 40% и уменьшает ее отхил от Succubus.",
        "reason_en": "Reduces all damage from Scream Of Pain and Sonic Wave by 40% while cutting her Succubus spell lifesteal."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      3
    ],
    "typical_items": [
      "orchid",
      "black_king_bar",
      "blade_mail"
    ],
    "primary_role_ru": "Мидер • Чистый ультимейт Sonic Wave сквозь BKB, Blink и магический вампиризм Succubus",
    "primary_role_en": "Midlaner • Pure damage Sonic Wave ultimate through BKB, Blink, and Succubus spell lifesteal"
  },
  "razor": {
    "primary_role_uk": "Офлейнер / Керрі / Мідер • Висмоктування урону Static Link та буря Eye of the Storm",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Static Link",
        "note_uk": "Висмоктує всю атаку з вашого керрі крізь BKB, доки не розірвати дистанцію.",
        "note_ru": "Высасывает всю атаку из вашего керри сквозь BKB, пока не разорвать дистанцию.",
        "note_en": "Drains all attack damage from your carry through BKB until the link is broken."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Static Link + Eye of the Storm",
        "note_uk": "Зрізає броню кожним ударом блискавки й бʼє вкраденим уроном.",
        "note_ru": "Срезает броню каждым ударом молнии и бьет украденным уроном.",
        "note_en": "Zaps armor with every lightning strike and hits hard with stolen damage."
      },
      {
        "tag": "damage_reflection",
        "severity": 2,
        "source_ability": "Storm Surge",
        "note_uk": "Відповідає блискавками при атаках і направлених скілах.",
        "note_ru": "Отвечает молниями при атаках и направленных скиллах.",
        "note_en": "Zaps attackers and slows them when targeted by spells or attacks."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Миттєво допомагає розірвати звʼязок Static Link.",
        "reason_ru": "Мгновенно помогает разорвать связь Static Link.",
        "reason_en": "Helps immediately break the Static Link tether."
      },
      {
        "item_key": "hurricane_pike",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Відштовхує Razor та себе в різні боки (-850 дистанції), миттєво рвучи Static Link.",
        "reason_ru": "Отталкивает Razor и себя в разные стороны (разрыв 850 дистанции), мгновенно разрывая Static Link.",
        "reason_en": "Pushes Razor and yourself apart (creating 850 distance), instantly breaking Static Link."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Блокує накладання точкового Static Link на старті бійки.",
        "reason_ru": "Блокирует наложение направленного Static Link на старте драки.",
        "reason_en": "Blocks the single-target Static Link cast at the start of a fight."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2,
      1
    ],
    "typical_items": [
      "black_king_bar"
    ],
    "primary_role_ru": "Оффлейнер / Керри / Мидер • Высасывание урона Static Link и буря Eye of the Storm",
    "primary_role_en": "Offlaner / Carry / Midlaner • Static Link damage drain and Eye of the Storm"
  },
  "rubick": {
    "primary_role_uk": "Сап / Мідер • Миттєвий підйом Telekinesis і крадіжка ультів Spell Steal",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Telekinesis + Stolen Spells",
        "note_uk": "Миттєвий точковий підйом на великій дальності.",
        "note_ru": "Мгновенный точечный подъем на большой дальности.",
        "note_en": "Instant single-target lift from long range."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Fade Bolt + Arcane Supremacy + Spell Steal",
        "note_uk": "Використовує ваші ж ультимати з бонусним магічним підсиленням.",
        "note_ru": "Использует ваши же ультимейты с бонусным магическим усилением.",
        "note_en": "Steals and uses your own ultimates with bonus spell amplification."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Відбиває Telekinesis, Fade Bolt і вкрадені точкові скіли.",
        "reason_ru": "Отражает Telekinesis, Fade Bolt и украденные направленные скиллы.",
        "reason_en": "Reflects Telekinesis, Fade Bolt, and stolen single-target spells."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Захищає від каскаду вкрадених заклинань Rubick.",
        "reason_ru": "Защищает от каскада украденных заклинаний Rubick.",
        "reason_en": "Protects against Rubick's barrage of stolen spells."
      },
      {
        "item_key": "orchid",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Rubick вкрасти ультимат у ключовий момент.",
        "reason_ru": "Не дает Rubick украсть ультимейт в ключевой момент.",
        "reason_en": "Prevents Rubick from stealing a big ultimate at a crucial moment."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      2,
      5
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Сап / Мидер • Мгновенный подъем Telekinesis и кража ультов Spell Steal",
    "primary_role_en": "Support / Midlaner • Instant Telekinesis lift and Spell Steal ultimate theft"
  },
  "shadow_demon": {
    "primary_role_uk": "Фул сап / Сап • Ілюзії Disruption, Demonic Purge крізь BKB та Disseminate",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Disruption",
        "note_uk": "Створює 2 надпотужні ілюзії вашого керрі.",
        "note_ru": "Создает 2 сверхмощные иллюзии вашего керри.",
        "note_en": "Creates 2 ultra-strong illusions of your carry."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Demonic Purge + Disruption",
        "note_uk": "Безперервний диспел і сильне сповільнення крізь BKB.",
        "note_ru": "Непрерывный диспел и сильное замедление сквозь BKB.",
        "note_en": "Continuous Dispel and heavy slow through BKB."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Shadow Poison + Disseminate",
        "note_uk": "Накопичує смертельні стаки отрути й розподіляє отриману шкоду.",
        "note_ru": "Накапливает смертельные стаки яда и распределяет полученный урон.",
        "note_en": "Stacks lethal shadow poison and reflects damage taken across enemies."
      }
    ],
    "priority_items": [
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Блокує точковий Demonic Purge або Disruption.",
        "reason_ru": "Блокирует направленный Demonic Purge или Disruption.",
        "reason_en": "Blocks single-target Demonic Purge or Disruption."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Віддзеркалює Disruption і Demonic Purge у самого Shadow Demon.",
        "reason_ru": "Отражает Disruption и Demonic Purge в самого Shadow Demon.",
        "reason_en": "Reflects Disruption and Demonic Purge back onto Shadow Demon himself."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Зменшує шкоду від стаків Shadow Poison та Disseminate.",
        "reason_ru": "Уменьшает урон от стаков Shadow Poison и эффекта Disseminate.",
        "reason_en": "Mitigates magic damage from Shadow Poison stacks and Disseminate."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "aeon_disk"
    ],
    "primary_role_ru": "Фулл сап / Сап • Иллюзии Disruption, Demonic Purge сквозь BKB и Disseminate",
    "primary_role_en": "Pos 5 / Support • Disruption illusions, Demonic Purge through BKB, and Disseminate"
  },
  "nevermore": {
    "primary_role_uk": "Керрі / Мідер • Магічний бурст Shadowraze + Requiem of Souls і мінус-броня",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Requiem of Souls + Shadowraze",
        "note_uk": "Колосальний вибуховий урон зі страхом у командному бою.",
        "note_ru": "Колоссальный взрывной урон со страхом в командном бою.",
        "note_en": "Colossal burst damage and AoE fear in teamfights."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Necromastery + Presence of the Dark Lord",
        "note_uk": "Висока атака з душ та пасивна аура зниження броні.",
        "note_ru": "Высокая атака с душ и пассивная аура снижения брони.",
        "note_en": "High right-click damage from souls and passive armor reduction aura."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Presence of the Dark Lord",
        "note_uk": "Break вимикає ауру зниження броні.",
        "note_ru": "Break выключает ауру снижения брони.",
        "note_en": "Break disables the Presence of the Dark Lord armor reduction aura."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Рятує від ваншоту з комбінації Requiem of Souls + Shadowraze.",
        "reason_ru": "Спасает от ваншота с комбинации Requiem of Souls + Shadowraze.",
        "reason_en": "Saves from being one-shot by the Requiem of Souls + Shadowraze combo."
      },
      {
        "item_key": "assault",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Аура +5 броні компенсує пасивку Presence of the Dark Lord.",
        "reason_ru": "Аура +5 брони компенсирует пассивку Presence of the Dark Lord.",
        "reason_en": "The +5 armor aura offsets the Presence of the Dark Lord armor reduction."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Обеззброює фізичного Shadow Fiend на 3.5 с.",
        "reason_ru": "Обезоруживает физического Shadow Fiend на 3.5 с.",
        "reason_en": "Disarms right-click Shadow Fiend for 3.5s."
      }
    ],
    "default_position": 1,
    "positions": [
      1,
      2
    ],
    "typical_items": [
      "black_king_bar",
      "invis_sword"
    ],
    "primary_role_ru": "Керри / Мидер • Магический бурст Shadowraze + Requiem of Souls и минус-броня",
    "primary_role_en": "Carry / Midlaner • Shadowraze + Requiem of Souls magic burst and armor reduction"
  },
  "shadow_shaman": {
    "primary_role_uk": "Фул сап / Сап • Довгий контроль Hex + Shackles, змії Mass Serpent Ward і Fowl Play",
    "threats": [
      {
        "tag": "channeled_disable",
        "severity": 3,
        "source_ability": "Shackles",
        "note_uk": "Потокова сітка тримає ціль до 5 секунд.",
        "note_ru": "Потоковая сетка держит цель до 5 секунд.",
        "note_en": "Channeled Shackles lock a target down for up to 5 seconds."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Hex + Shackles",
        "note_uk": "Найдовший точковий контроль по одній цілі в грі.",
        "note_ru": "Самый долгий точечный контроль по одной цели в игре.",
        "note_en": "Longest single-target lockdown chain in the game."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Mass Serpent Ward",
        "note_uk": "Змії блокують героя у пастці та зносять вежі.",
        "note_ru": "Змеи блокируют героя в ловушке и сносят башни.",
        "note_en": "Serpent Wards trap heroes and melt towers."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Знімає Hex/Shackles із союзника і відбиває їх у самого Shaman.",
        "reason_ru": "Снимает Hex и Shackles с союзника и отражает их в самого Shadow Shaman.",
        "reason_en": "Dispels Hex/Shackles from an ally and reflects them back onto Shadow Shaman."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Не дає зафіксувати кору через Hex та Shackles.",
        "reason_ru": "Не дает зафиксировать кора через Hex и Shackles.",
        "reason_en": "Prevents locking down your core with Hex and Shackles."
      },
      {
        "item_key": "phase_boots",
        "priority": "high",
        "score_bonus": 5,
        "reason_uk": "Проходження крізь юнітів дозволяє легко вийти із пастки змій Mass Serpent Ward.",
        "reason_ru": "Прохождение сквозь юнитов позволяет легко выйти из ловушки змей Mass Serpent Ward.",
        "reason_en": "Phased movement allows easily walking out of a Mass Serpent Ward trap."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Фулл сап / Сап • Долгий контроль Hex + Shackles, змеи Mass Serpent Ward и Fowl Play",
    "primary_role_en": "Pos 5 / Support • Long Hex + Shackles lockdown, Mass Serpent Ward snakes, and Fowl Play"
  },
  "slardar": {
    "primary_role_uk": "Офлейнер / Мідер • Зріз броні Corrosive Haze (-20 броні + True Sight) і баші",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Corrosive Haze + Bash of the Deep",
        "note_uk": "Знімає 10–20 броні та вирубує ціль фізичними башами.",
        "note_ru": "Снимает 10–20 брони и вырубает цель физическими башами.",
        "note_en": "Strips 10–20 armor and locks down targets with physical bashes."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Bash of the Deep / Seaborn Sentinel",
        "note_uk": "Кожен 4-й удар оглушує ціль.",
        "note_ru": "Каждый 4-й удар оглушает цель.",
        "note_en": "Every 4th attack bashes the target."
      },
      {
        "tag": "high_mobility",
        "severity": 2,
        "source_ability": "Guardian Sprint",
        "note_uk": "Швидкий врив по річці та калюжах.",
        "note_ru": "Быстрый врыв по реке и лужам.",
        "note_en": "Fast sprint initiation across the river and puddles."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєво знімає дебаф Corrosive Haze (-20 броні) із себе чи союзника (до 25 лвл).",
        "reason_ru": "Мгновенно снимает дебафф Corrosive Haze (-20 брони) с себя или союзника (до 25 уровня).",
        "reason_en": "Instantly dispels the Corrosive Haze (-20 armor) debuff from yourself or an ally (before level 25)."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Повністю захищає сапорта від башів і фізичного урону під Corrosive Haze.",
        "reason_ru": "Полностью защищает саппорта от башей и физического урона под Corrosive Haze.",
        "reason_en": "Completely protects a support from bashes and physical damage under Corrosive Haze."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Slardar набивати удари Bash of the Deep.",
        "reason_ru": "Не дает Slardar набивать удары для Bash of the Deep.",
        "reason_en": "Prevents Slardar from stacking attacks for Bash of the Deep."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Оффлейнер / Мидер • Срез брони Corrosive Haze (-20 брони + True Sight) и баши",
    "primary_role_en": "Offlaner / Midlaner • Corrosive Haze armor reduction (-20 armor + True Sight) and bashes"
  },
  "snapfire": {
    "primary_role_uk": "Сап / Мідер • Артилерія Mortimer Kisses, розстріл Lil' Shredder і Cookie-стан",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Mortimer Kisses + Scatterblast",
        "note_uk": "Величезна магічна шкода з величезної дистанції.",
        "note_ru": "Огромный магический урон с огромной дистанции.",
        "note_en": "Massive magic artillery damage from extreme range."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Lil' Shredder",
        "note_uk": "Швидка серія пострілів зі зниженням броні (у 20-25 талантах — повноцінний DPS).",
        "note_ru": "Быстрая серия выстрелов со снижением брони (на 20-25 талантах — полноценный DPS).",
        "note_en": "Rapid barrage of armor-reducing shots (scales into full physical DPS with level 20–25 talents)."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Firesnap Cookie",
        "note_uk": "Стрибок зі станом у точці приземлення.",
        "note_ru": "Прыжок со станом в точке приземления.",
        "note_en": "Hop that stuns enemies at the landing spot."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Дозволяє ігнорувати калюжі й магічну шкоду Mortimer Kisses.",
        "reason_ru": "Позволяет игнорировать лужи и магический урон от Mortimer Kisses.",
        "reason_en": "Allows ignoring the lava pools and magic damage of Mortimer Kisses."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Виштовхує союзника з-під обстрілу Mortimer Kisses та Cookie.",
        "reason_ru": "Выталкивает союзника из-под обстрела Mortimer Kisses и прыжка Firesnap Cookie.",
        "reason_en": "Pushes an ally out of Mortimer Kisses artillery and Firesnap Cookie stuns."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Поглинає масовий обстріл ультимату.",
        "reason_ru": "Поглощает массовый обстрел ультимейта.",
        "reason_en": "Absorbs the heavy AoE magic bombardment of her ultimate."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Мидер • Артиллерия Mortimer Kisses, расстрел Lil' Shredder и Cookie-стан",
    "primary_role_en": "Support / Midlaner • Mortimer Kisses artillery, Lil' Shredder barrage, and Cookie stun"
  },
  "sniper": {
    "primary_role_uk": "Мідер / Керрі • Наддальній розстріл Take Aim + Headshot і Shrapnel",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Take Aim + Headshot + Keen Scope",
        "note_uk": "Розстрілює з безпечної дистанції з мікро-відштовхуванням Headshot.",
        "note_ru": "Расстреливает с безопасной дистанции с микро-отталкиванием Headshot.",
        "note_en": "Peppers enemies from a safe distance with Headshot knockbacks."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Shrapnel",
        "note_uk": "Заряджені зони сповільнення та огляду.",
        "note_ru": "Заряженные зоны замедления и обзора.",
        "note_en": "Charged Shrapnel zones that slow and grant vision."
      },
      {
        "tag": "unit_target_control",
        "severity": 2,
        "source_ability": "Assassinate",
        "note_uk": "Дальній добиваючий постріл.",
        "note_ru": "Дальний добивающий выстрел.",
        "note_en": "Long-range finishing snipe."
      }
    ],
    "priority_items": [
      {
        "item_key": "blade_mail",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Змушує Sniper припинити стріляти по вам або вбитися об власний ДПС.",
        "reason_ru": "Заставляет Sniper прекратить стрелять по вам или убиться о собственный DPS.",
        "reason_en": "Forces Sniper to stop shooting you or kill himself on his own DPS."
      },
      {
        "item_key": "heavens_halberd",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Обеззброює Sniper при скороченні дистанції.",
        "reason_ru": "Обезоруживает Sniper при сокращении дистанции.",
        "reason_en": "Disarms Sniper once you close the gap."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Рятує сапортів від фокусу під Take Aim.",
        "reason_ru": "Спасает саппортов от расстрела под Take Aim.",
        "reason_en": "Saves supports from being gunned down under Take Aim."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      1,
      4
    ],
    "typical_items": [
      "butterfly",
      "invis_sword",
      "aeon_disk"
    ],
    "primary_role_ru": "Мидер / Керри • Сверхдальний расстрел Take Aim + Headshot и Shrapnel",
    "primary_role_en": "Midlaner / Carry • Ultra-long range Take Aim + Headshot and Shrapnel"
  },
  "spirit_breaker": {
    "primary_role_uk": "Офлейнер / Сап • Глобальний розгін Charge of Darkness, Nether Strike крізь BKB і Bulldoze",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Charge of Darkness + Empowering Haste",
        "note_uk": "Глобальний таргетний врив крізь усю карту.",
        "note_ru": "Глобальный таргетный врыв через всю карту.",
        "note_en": "Global targeted charge across the entire map."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Nether Strike + Charge of Darkness",
        "note_uk": "Точковий ультимат і баш крізь BKB.",
        "note_ru": "Точечный ультимейт и баш сквозь BKB.",
        "note_en": "Single-target ultimate and bash through BKB."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Bulldoze",
        "note_uk": "Дає 70% опору ефектам контролю (Status Resistance), але знімається розвіюванням!",
        "note_ru": "Дает 70% сопротивления эффектам контроля (Status Resistance), но снимается развеиванием!",
        "note_en": "Grants 70% Status Resistance, but can be removed with a Dispel!"
      }
    ],
    "priority_items": [
      {
        "item_key": "cyclone",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Підняття Spirit Breaker у торнадо миттєво зупиняє Charge of Darkness і знімає з нього Bulldoze.",
        "reason_ru": "Поднятие Spirit Breaker в торнадо мгновенно останавливает Charge of Darkness и снимает с него Bulldoze.",
        "reason_en": "Lifting Spirit Breaker into a cyclone instantly stops Charge of Darkness and dispels his Bulldoze."
      },
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує глобальний запуск Charge of Darkness або Nether Strike.",
        "reason_ru": "Блокирует глобальный запуск Charge of Darkness или направленный Nether Strike.",
        "reason_en": "Blocks global Charge of Darkness casts or Nether Strike."
      },
      {
        "item_key": "nullifier",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Знімає баф Bulldoze (70% статус-резисту), роблячи Баратрума вразливим до контролю.",
        "reason_ru": "Снимает бафф Bulldoze (70% сопротивления эффектам), делая Spirit Breaker уязвимым к контролю.",
        "reason_en": "Dispels the Bulldoze buff (70% status resistance), leaving Spirit Breaker vulnerable to control."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      3
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Оффлейнер / Сап • Глобальный разгон Charge of Darkness, Nether Strike сквозь BKB и Bulldoze",
    "primary_role_en": "Offlaner / Support • Global Charge of Darkness, Nether Strike through BKB, and Bulldoze"
  },
  "techies": {
    "primary_role_uk": "Сап / Мідер • Врив із сайленсом/станом Blast Off!, Tazer (дизарм) та міни Proximity Mines",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Blast Off! + Proximity Mines + Sticky Bomb",
        "note_uk": "Величезний вибуховий магічний прокаст і зниження магічного опору мінами.",
        "note_ru": "Огромный взрывной магический прокаст и снижение магического сопротивления минами.",
        "note_en": "Massive explosive magic burst and magic resistance reduction from mines."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Proximity Mines + Reactive Tazer",
        "note_uk": "Заміновані проходи та обеззброєння при атаці.",
        "note_ru": "Заминированные проходы и обезоруживание при атаке.",
        "note_en": "Mined chokepoints and reactive disarm when attacked."
      }
    ],
    "priority_items": [
      {
        "item_key": "pipe",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Барʼєр Pipe поглинає вибух Blast Off! та комбінацію з Proximity Mines.",
        "reason_ru": "Барьер Pipe поглощает взрыв Blast Off! и комбинацию с Proximity Mines.",
        "reason_en": "Pipe's magic barrier absorbs the Blast Off! leap and Proximity Mines combo."
      },
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Дає імунітет до Blast Off!, Tazer та мін у бійці.",
        "reason_ru": "Дает иммунитет к Blast Off!, Reactive Tazer и минам в драке.",
        "reason_en": "Grants immunity to Blast Off!, Reactive Tazer, and mines during teamfights."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Виштовхує союзника з радіусу детонації червоних мін.",
        "reason_ru": "Выталкивает союзника из радиуса детонации красных мин.",
        "reason_en": "Pushes an ally out of the detonation radius of Proximity Mines."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      2
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Мидер • Врыв с сайленсом/станом Blast Off!, Tazer (дизарм) и мины Proximity Mines",
    "primary_role_en": "Support / Midlaner • Blast Off! silence/stun jump, Tazer (disarm), and Proximity Mines"
  },
  "tiny": {
    "primary_role_uk": "Мідер / Сап / Керрі • Миттєвий прокаст Avalanche + Toss та величезна броня Grow",
    "threats": [
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Avalanche + Toss",
        "note_uk": "Подвійна шкода Avalanche під час польоту в Toss стирає тонких героїв за секунду.",
        "note_ru": "Двойной урон Avalanche во время полета в Toss стирает тонких героев за секунду.",
        "note_en": "Double Avalanche damage during Toss deletes squishy heroes in a second."
      },
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Tree Grab + Grow",
        "note_uk": "Величезна атака з дерева по героях та будівлях.",
        "note_ru": "Огромная атака с бревном по героям и строениям.",
        "note_en": "Massive Tree Grab cleave damage against heroes and buildings."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Toss",
        "note_uk": "Закидає жертву просто в центр ворожої команди.",
        "note_ru": "Закидывает жертву прямо в центр вражеской команды.",
        "note_en": "Tosses a victim right into the center of his team."
      }
    ],
    "priority_items": [
      {
        "item_key": "black_king_bar",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Захищає від комбо Avalanche + Toss у командному бою.",
        "reason_ru": "Защищает от комбо Avalanche + Toss в командном бою.",
        "reason_en": "Protects against the Avalanche + Toss combo in teamfights."
      },
      {
        "item_key": "aeon_disk",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Рятує сапортів і корів від миттєвого ваншоту з Blink + Ava/Toss.",
        "reason_ru": "Спасает саппортов и коров от мгновенного ваншота с Blink + Ava/Toss.",
        "reason_en": "Saves supports and cores from an instant Blink + Ava/Toss one-shot."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Повертає союзника назад після того, як Tiny перекинув його через Toss.",
        "reason_ru": "Возвращает союзника обратно после того, как Tiny перебросил его через Toss.",
        "reason_en": "Pushes an ally back to safety after Tiny throws them with Toss."
      }
    ],
    "default_position": 2,
    "positions": [
      2,
      4,
      1,
      3
    ],
    "typical_items": [
      "invis_sword"
    ],
    "primary_role_ru": "Мидер / Сап / Керри • Мгновенный прокаст Avalanche + Toss и огромная броня Grow",
    "primary_role_en": "Midlaner / Support / Carry • Instant Avalanche + Toss burst and massive Grow armor"
  },
  "treant": {
    "primary_role_uk": "Фул сап / Сап • Масове коріння Overgrowth крізь BKB, інвіз у лісі та хіл Living Armor",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Overgrowth",
        "note_uk": "Масове коріння і дизарм у великому радіусі крізь BKB.",
        "note_ru": "Массовые корни и дизарм в большом радиусе сквозь BKB.",
        "note_en": "Large AoE root and disarm through BKB."
      },
      {
        "tag": "invisibility",
        "severity": 2,
        "source_ability": "Nature's Guise",
        "note_uk": "Ходить крізь дерева у невидимості (з Scepter — вардить дерева по всій карті).",
        "note_ru": "Ходит сквозь деревья в невидимости (со Scepter — вардит деревья по всей карте).",
        "note_en": "Walks through trees with invisibility (with Scepter — enchants trees for vision across the map)."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Living Armor + Leech Seed",
        "note_uk": "Лікує героїв і вежі по всій карті та додає броню.",
        "note_ru": "Лечит героев и башни по всей карте и добавляет броню.",
        "note_en": "Heals heroes and towers globally while granting bonus armor."
      }
    ],
    "priority_items": [
      {
        "item_key": "manta",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєво знімає коріння Overgrowth після того, як Treant вже натиснув ульт.",
        "reason_ru": "Мгновенно снимает корни Overgrowth после того, как Treant уже нажал ульт.",
        "reason_en": "Instantly purges the Overgrowth root after Treant has already cast his ultimate."
      },
      {
        "item_key": "lotus_orb",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Знімає Overgrowth із союзного керрі за 1 клік.",
        "reason_ru": "Снимает Overgrowth с союзного керри в один клик.",
        "reason_en": "Dispels Overgrowth from an allied carry in a single click."
      },
      {
        "item_key": "gem",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє бачити самого Treant у лісі та зрубувати його зачаровані дерева Eyes In The Forest.",
        "reason_ru": "Позволяет видеть самого Treant в лесу и срубать его зачарованные деревья Eyes In The Forest.",
        "reason_en": "Reveals Treant in the trees and allows chopping down his enchanted Eyes In The Forest trees."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [],
    "primary_role_ru": "Фулл сап / Сап • Массовые корни Overgrowth сквозь BKB, инвиз в лесу и хил Living Armor",
    "primary_role_en": "Pos 5 / Support • AoE Overgrowth root through BKB, tree invis, and Living Armor heal"
  },
  "tusk": {
    "primary_role_uk": "Сап / Офлейнер • Сейв у кулю Snowball, блок Ice Shards та Walrus PUNCH! крізь BKB",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Ice Shards",
        "note_uk": "Крижана дуга закриває прохід і не дає відступити.",
        "note_ru": "Ледяная дуга закрывает проход и не дает отступить.",
        "note_en": "Ice Shards barrier blocks paths and prevents retreat."
      },
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Walrus PUNCH! + Walrus Kick",
        "note_uk": "Підкидання та вибивання з позиції крізь BKB.",
        "note_ru": "Подбрасывание и выбивание из позиции сквозь BKB.",
        "note_en": "Launches into the air and knocks out of position through BKB."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Tag Team + Walrus PUNCH!",
        "note_uk": "Сильно підсилює фізичні тички по цілі.",
        "note_ru": "Сильно усиливает физические тычки по цели.",
        "note_en": "Heavily amplifies physical attack damage against targets in the aura."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Перештовхує героя прямо через перешкоду Ice Shards або після Walrus Kick.",
        "reason_ru": "Переталкивает героя прямо через преграду Ice Shards или после Walrus Kick.",
        "reason_en": "Pushes a hero right over the Ice Shards barrier or back after Walrus Kick."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Блокує Walrus PUNCH!, Walrus Kick або запуск Snowball.",
        "reason_ru": "Блокирует Walrus PUNCH!, Walrus Kick или запуск Snowball.",
        "reason_en": "Blocks Walrus PUNCH!, Walrus Kick, or the initial Snowball target."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Не дає Tusk вдарити фізичним ультом Walrus PUNCH!.",
        "reason_ru": "Не дает Tusk ударить физическим ультом Walrus PUNCH!.",
        "reason_en": "Prevents Tusk from landing his physical Walrus PUNCH! ultimate."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      3
    ],
    "typical_items": [
      "glimmer_cape"
    ],
    "primary_role_ru": "Сап / Оффлейнер • Сейв в шар Snowball, блок Ice Shards и Walrus PUNCH! сквозь BKB",
    "primary_role_en": "Support / Offlaner • Snowball save, Ice Shards block, and Walrus PUNCH! through BKB"
  },
  "abyssal_underlord": {
    "primary_role_uk": "Офлейнер • Командний портал Fiend's Gate, коріння Pit of Malice і процентний Firestorm",
    "threats": [
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Pit of Malice",
        "note_uk": "Велика зона періодичного коріння, що перериває мобільність.",
        "note_ru": "Большая зона периодических корней, прерывающая мобильность.",
        "note_en": "Large zone of periodic roots that shuts down mobility."
      },
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Firestorm",
        "note_uk": "Випалює відсотки від макс. HP по області.",
        "note_ru": "Выжигает проценты от макс. HP по области.",
        "note_en": "Burns a percentage of max HP in an AoE."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Atrophy Aura",
        "note_uk": "Зменшує базову фізичну атаку всіх ворогів поруч на 30%+.",
        "note_ru": "Уменьшает базовую физическую атаку всех врагов рядом на 30%+.",
        "note_en": "Reduces base physical attack damage of all nearby enemies by 30%+."
      }
    ],
    "priority_items": [
      {
        "item_key": "force_staff",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Виводить союзників із ями Pit of Malice та вогню Firestorm.",
        "reason_ru": "Выводит союзников из ямы Pit of Malice и огня Firestorm.",
        "reason_en": "Pushes allies out of Pit of Malice and Firestorm."
      },
      {
        "item_key": "silver_edge",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Вимикає Atrophy Aura, повертаючи вашому керрі повну базову атаку.",
        "reason_ru": "Отключает Atrophy Aura, возвращая вашему керри полную базовую атаку.",
        "reason_en": "Disables Atrophy Aura, restoring your carry's full base attack damage."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє вільно проходити через Pit of Malice і не горіти від Firestorm.",
        "reason_ru": "Позволяет свободно проходить через Pit of Malice и не гореть от Firestorm.",
        "reason_en": "Allows walking freely through Pit of Malice without burning to Firestorm."
      }
    ],
    "default_position": 3,
    "positions": [
      3
    ],
    "typical_items": [
      "satanic"
    ],
    "primary_role_ru": "Оффлейнер • Командный портал Fiend's Gate, корни Pit of Malice и процентный Firestorm",
    "primary_role_en": "Offlaner • Team portal Fiend's Gate, Pit of Malice root, and percentage-based Firestorm"
  },
  "undying": {
    "primary_role_uk": "Фул сап / Офлейнер • Крадіжка сили Decay, зомбі Tombstone і хіл Soul Rip",
    "threats": [
      {
        "tag": "illusions",
        "severity": 3,
        "source_ability": "Tombstone",
        "note_uk": "Надгробок плодить десятки зомбі, що сильно сповільнюють усю команду.",
        "note_ru": "Надгробие плодит десятки зомби, сильно замедляющих всю команду.",
        "note_en": "Tombstone spawns dozens of zombies that heavily slow the entire team."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Soul Rip + Decay + Flesh Golem",
        "note_uk": "Краде силу та миттєво лікує себе або саму Томбу.",
        "note_ru": "Крадет силу и мгновенно лечит себя или саму Томбу.",
        "note_en": "Steals Strength and bursts heal on himself or the Tombstone."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Decay + Flesh Golem",
        "note_uk": "Підсилює всю вхідну шкоду по ворогах.",
        "note_ru": "Усиливает весь входящий урон по врагам.",
        "note_en": "Amplifies all incoming damage taken by enemies."
      }
    ],
    "priority_items": [
      {
        "item_key": "hurricane_pike",
        "priority": "high",
        "score_bonus": 8,
        "reason_uk": "Дає рендж-герою 5 швидких ударів з безпечної дистанції, щоб миттєво розбити Tombstone.",
        "reason_ru": "Дает рендж-герою 5 быстрых ударов с безопасной дистанции, чтобы мгновенно разбить Tombstone.",
        "reason_en": "Gives a ranged hero 5 rapid attacks from a safe distance to quickly destroy Tombstone."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Рятує союзників, обліплених зомбі біля Tombstone.",
        "reason_ru": "Спасает союзников, облепленных зомби возле Tombstone.",
        "reason_en": "Pushes out allies swarmed by zombies near Tombstone."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Ріже відхіл Undying від Soul Rip та виснажує його великий пул HP.",
        "reason_ru": "Режет отхил Undying от Soul Rip и истощает его большой пул HP.",
        "reason_en": "Cuts Undying's Soul Rip healing and drains his large HP pool."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3
    ],
    "typical_items": [
      "blade_mail"
    ],
    "primary_role_ru": "Фулл сап / Оффлейнер • Кража силы Decay, зомби Tombstone и хил Soul Rip",
    "primary_role_en": "Pos 5 / Offlaner • Decay strength steal, Tombstone zombies, and Soul Rip heal"
  },
  "vengefulspirit": {
    "primary_role_uk": "Сап / Офлейнер / Керрі • Свап позиціями Nether Swap крізь BKB та ілюзія-двійник із Scepter",
    "threats": [
      {
        "tag": "unit_target_control",
        "severity": 3,
        "source_ability": "Nether Swap + Magic Missile",
        "note_uk": "Миттєво висмикує ключову ціль крізь BKB або рятує свого кору.",
        "note_ru": "Мгновенно выдергивает ключевую цель сквозь BKB или спасает своего кора.",
        "note_en": "Instantly swaps a key target out of position through BKB or saves an allied core."
      },
      {
        "tag": "illusions",
        "severity": 2,
        "source_ability": "Vengeance Aura (Aghanim's Scepter)",
        "note_uk": "Після смерті залишає сильну ілюзію, яка продовжує кастувати всі скіли.",
        "note_ru": "После смерти оставляет сильную иллюзию, продолжающую кастовать все скиллы.",
        "note_en": "Spawns a strong illusion upon death that continues casting all her spells."
      },
      {
        "tag": "physical_burst",
        "severity": 2,
        "source_ability": "Wave of Terror + Vengeance Aura",
        "note_uk": "Зрізає броню і посилює фізичний ДПС команди.",
        "note_ru": "Срезает броню и усиливает физический ДПС команды.",
        "note_en": "Reduces armor and boosts the team's physical DPS."
      }
    ],
    "priority_items": [
      {
        "item_key": "sphere",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Блокує раптовий Nether Swap по вашому кору з височини чи туману.",
        "reason_ru": "Блокирует внезапный Nether Swap по вашему кору с возвышенности или из тумана войны.",
        "reason_en": "Blocks a sudden Nether Swap on your core from high ground or fog of war."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Відбиває Magic Missile і миттєво повертає позицію при Nether Swap.",
        "reason_ru": "Отражает Magic Missile и мгновенно меняет местами обратно при Nether Swap.",
        "reason_en": "Reflects Magic Missile and immediately swaps positions back upon Nether Swap."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Допомагає повернути союзника після ворожого Nether Swap.",
        "reason_ru": "Помогает вернуть союзника обратно после вражеского Nether Swap.",
        "reason_en": "Helps push an ally back to safety after an enemy Nether Swap."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3,
      1
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Оффлейнер / Керри • Свап позициями Nether Swap сквозь BKB и иллюзия-двойник с Scepter",
    "primary_role_en": "Support / Offlaner / Carry • Nether Swap through BKB and Scepter illusion double"
  },
  "venomancer": {
    "primary_role_uk": "Сап / Офлейнер • Тотальне сповільнення й отрута Noxious Plague + Gale + Poison Sting",
    "threats": [
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Noxious Plague + Venomous Gale + Poison Sting",
        "note_uk": "Випалює всю команду отрутами у відсотках від макс. HP.",
        "note_ru": "Выжигает всю команду ядами в процентах от макс. HP.",
        "note_en": "Melts the entire enemy team with percentage max-HP poison."
      },
      {
        "tag": "trap_isolation",
        "severity": 2,
        "source_ability": "Plague Ward + Venomous Gale",
        "note_uk": "Варди збивають Blink Dagger і тримають у постійному сповільненні.",
        "note_ru": "Варды сбивают Blink Dagger и держат в постоянном замедлении.",
        "note_en": "Plague Wards cancel Blink Daggers and apply a constant slow."
      }
    ],
    "priority_items": [
      {
        "item_key": "pipe",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Обовʼязковий командний слот проти отрут Venomancer (Gale + Noxious Plague).",
        "reason_ru": "Обязательный командный слот против ядов Venomancer (Venomous Gale + Noxious Plague).",
        "reason_en": "Mandatory team item against Venomancer's poisons (Venomous Gale + Noxious Plague)."
      },
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Знімає Venomous Gale з союзників до появи 25 таланту.",
        "reason_ru": "Снимает Venomous Gale с союзников (до таланта 25 уровня).",
        "reason_en": "Dispels Venomous Gale from allies (before the level 25 talent)."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Повністю ігнорує шкоду і сповільнення від усіх отрут.",
        "reason_ru": "Полностью игнорирует урон и замедление от всех ядов.",
        "reason_en": "Completely ignores the damage and slow from all of his poisons."
      }
    ],
    "default_position": 4,
    "positions": [
      4,
      5,
      3
    ],
    "typical_items": [],
    "primary_role_ru": "Сап / Оффлейнер • Тотальное замедление и яд Noxious Plague + Gale + Poison Sting",
    "primary_role_en": "Support / Offlaner • Total slow and poison Noxious Plague + Gale + Poison Sting"
  },
  "visage": {
    "primary_role_uk": "Мідер / Офлейнер / Сап • Гаргульї Summon Familiars, шари броні Gravekeeper's Cloak і Soul Assumption",
    "threats": [
      {
        "tag": "physical_burst",
        "severity": 3,
        "source_ability": "Summon Familiars + Grave Chill",
        "note_uk": "Птахи під Grave Chill стирають ціль і вежі за лічені секунди.",
        "note_ru": "Птицы под Grave Chill стирают цель и башни за считанные секунды.",
        "note_en": "Familiars buffed by Grave Chill shred targets and towers in seconds."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Soul Assumption",
        "note_uk": "Кожні 4 секунди запускає потужний нюк за набраними зарядами шкоди.",
        "note_ru": "Каждые 4 секунды запускает мощный нюк по набранным зарядам урона.",
        "note_en": "Fires a high-damage nuke every 4 seconds from gathered damage charges."
      },
      {
        "tag": "critical_passive",
        "severity": 2,
        "source_ability": "Gravekeeper's Cloak",
        "note_uk": "Шари плаща блокують до 80% вхідної шкоди.",
        "note_ru": "Слои плаща блокируют до 80% входящего урона.",
        "note_en": "Cloak layers block up to 80% of incoming damage instances."
      }
    ],
    "priority_items": [
      {
        "item_key": "crimson_guard",
        "priority": "critical",
        "score_bonus": 9,
        "reason_uk": "Блок шкоди Crimson Guard майже в нуль гасить серію швидких атак гаргулій Visage.",
        "reason_ru": "Блок урона от Crimson Guard почти в ноль гасит серию быстрых атак гаргулий Visage.",
        "reason_en": "Crimson Guard's damage block almost completely negates the rapid attacks of Visage's Familiars."
      },
      {
        "item_key": "ghost",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Рятує сапортів від фокусу Familiars.",
        "reason_ru": "Спасает саппортов от фокуса Familiars.",
        "reason_en": "Saves supports from being focused by Familiars."
      },
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Періодичні тіки швидко збивають шари Gravekeeper's Cloak.",
        "reason_ru": "Периодические тики быстро сбивают слои Gravekeeper's Cloak.",
        "reason_en": "Periodic DoT ticks quickly strip away Gravekeeper's Cloak layers."
      }
    ],
    "default_position": 3,
    "positions": [
      3,
      2,
      4
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Мидер / Оффлейнер / Сап • Гаргульи Summon Familiars, слои брони Gravekeeper's Cloak и Soul Assumption",
    "primary_role_en": "Midlaner / Offlaner / Support • Summon Familiars gargoyles, Gravekeeper's Cloak armor layers, and Soul Assumption"
  },
  "void_spirit": {
    "primary_role_uk": "Мідер • Висока мобільність Astral Step + Dissimilate та фіз-барʼєр Resonant Pulse",
    "threats": [
      {
        "tag": "high_mobility",
        "severity": 3,
        "source_ability": "Astral Step + Dissimilate",
        "note_uk": "Два заряди ультимату й ховання у фази роблять його вкрай слизьким.",
        "note_ru": "Два заряда ультимейта и уход в фазу делают его крайне скользким.",
        "note_en": "Two Astral Step charges and Dissimilate phase make him extremely elusive."
      },
      {
        "tag": "magic_burst",
        "severity": 3,
        "source_ability": "Aether Remnant + Dissimilate + Resonant Pulse",
        "note_uk": "Швидко вбиває беклайн за час затягування ремнантом.",
        "note_ru": "Быстро убивает бэклайн за время затягивания ремнантом.",
        "note_en": "Quickly bursts the backline during Aether Remnant pull."
      },
      {
        "tag": "dispellable_save",
        "severity": 2,
        "source_ability": "Resonant Pulse",
        "note_uk": "Щит фізичної шкоди легко знімається розвіюванням.",
        "note_ru": "Щит физического урона легко снимается развеиванием.",
        "note_en": "Physical damage barrier is easily removed with a Dispel."
      }
    ],
    "priority_items": [
      {
        "item_key": "orchid",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Сайленс не дає Void Spirit піти в Dissimilate або відстрибнути на Astral Step.",
        "reason_ru": "Сайленс не дает Void Spirit уйти в Dissimilate или отпрыгнуть на Astral Step.",
        "reason_en": "Silence prevents Void Spirit from hiding in Dissimilate or escaping with Astral Step."
      },
      {
        "item_key": "sheepstick",
        "priority": "critical",
        "score_bonus": 8,
        "reason_uk": "Миттєвий Hex фіксує Void Spirit після першого вльоту.",
        "reason_ru": "Мгновенный Hex фиксирует Void Spirit после первого влета.",
        "reason_en": "Instant Hex locks down Void Spirit right after his initial jump."
      },
      {
        "item_key": "black_king_bar",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Захищає від притягування Aether Remnant і всього прокасту.",
        "reason_ru": "Защищает от притягивания Aether Remnant и всего прокаста.",
        "reason_en": "Protects against Aether Remnant pull and his entire spell combo."
      }
    ],
    "default_position": 2,
    "positions": [
      2
    ],
    "typical_items": [
      "orchid"
    ],
    "primary_role_ru": "Мидер • Высокая мобильность Astral Step + Dissimilate и физ-барьер Resonant Pulse",
    "primary_role_en": "Midlaner • High mobility Astral Step + Dissimilate and Resonant Pulse physical barrier"
  },
  "warlock": {
    "primary_role_uk": "Фул сап / Сап • Звʼязка шкоди Fatal Bonds, Голем крізь BKB та потоковий Upheaval",
    "threats": [
      {
        "tag": "sustained_magic",
        "severity": 3,
        "source_ability": "Fatal Bonds + Chaotic Offering + Eldritch Summoning",
        "note_uk": "Fatal Bonds розподіляє 20%+ шкоди між усією командою.",
        "note_ru": "Fatal Bonds распределяет 20%+ урона между всей командой.",
        "note_en": "Fatal Bonds shares 20%+ of all damage taken across linked enemies."
      },
      {
        "tag": "channeled_disable",
        "severity": 2,
        "source_ability": "Upheaval",
        "note_uk": "Потокове болото сповільнює всю зону бою та плодить імпів.",
        "note_ru": "Потоковое болото замедляет всю зону боя и плодит импов.",
        "note_en": "Channeled Upheaval heavily slows the entire fight area and spawns imps."
      },
      {
        "tag": "heal_regen",
        "severity": 2,
        "source_ability": "Shadow Word",
        "note_uk": "Сильне лікування на лінії та в бійці.",
        "note_ru": "Сильное лечение на линии и в драке.",
        "note_en": "Strong heal over time in lane and teamfights."
      }
    ],
    "priority_items": [
      {
        "item_key": "lotus_orb",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Знімає Fatal Bonds і Shadow Word із союзників.",
        "reason_ru": "Снимает Fatal Bonds и Shadow Word с союзников.",
        "reason_en": "Dispels Fatal Bonds and Shadow Word from allies."
      },
      {
        "item_key": "force_staff",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Виштовхує команду з болота Upheaval та з-під ударів Голема.",
        "reason_ru": "Выталкивает команду из замедления Upheaval и из-под ударов Голема.",
        "reason_en": "Pushes teammates out of the Upheaval slow and away from Chaotic Offering Golems."
      },
      {
        "item_key": "pipe",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Зменшує сумарну розподілену шкоду від Fatal Bonds і горіння Големів.",
        "reason_ru": "Уменьшает суммарный распределяемый урон от Fatal Bonds и горения Големов.",
        "reason_en": "Reduces total shared damage from Fatal Bonds and Golem burn."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Фулл сап / Сап • Связка урона Fatal Bonds, Голем сквозь BKB и потоковый Upheaval",
    "primary_role_en": "Pos 5 / Support • Fatal Bonds damage link, Golem through BKB, and channeled Upheaval"
  },
  "winter_wyvern": {
    "primary_role_uk": "Фул сап / Сап • Фіз-імунітет і хіл Cold Embrace та прокляття Winter's Curse крізь BKB",
    "threats": [
      {
        "tag": "heal_regen",
        "severity": 3,
        "source_ability": "Cold Embrace",
        "note_uk": "Дає 100% імунітет до фізичної шкоди та лікує у відсотках від макс. HP.",
        "note_ru": "Дает 100% иммунитет к физическому урону и лечит в процентах от макс. HP.",
        "note_en": "Grants 100% physical damage immunity and heals for a percentage of max HP."
      },
      {
        "tag": "trap_isolation",
        "severity": 3,
        "source_ability": "Winter's Curse",
        "note_uk": "Змушує команду бити власного союзника крізь BKB.",
        "note_ru": "Заставляет команду бить собственного союзника сквозь BKB.",
        "note_en": "Forces the enemy team to attack their own ally through BKB."
      },
      {
        "tag": "sustained_magic",
        "severity": 2,
        "source_ability": "Arctic Burn + Splinter Blast",
        "note_uk": "Спалює відсотки здоровʼя на великій дальності.",
        "note_ru": "Сжигает проценты здоровья на большой дальности.",
        "note_en": "Burns a percentage of current health from long range."
      }
    ],
    "priority_items": [
      {
        "item_key": "spirit_vessel",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Ріже відхіл під час Cold Embrace на 70% і наносить магічну шкоду крізь кригу.",
        "reason_ru": "Режет отхил во время Cold Embrace на 70% и наносит магический урон сквозь лед.",
        "reason_en": "Reduces healing during Cold Embrace by 70% and deals magic damage through the ice."
      },
      {
        "item_key": "sphere",
        "priority": "high",
        "score_bonus": 7,
        "reason_uk": "Блокує накладання точкового ультимату Winter's Curse.",
        "reason_ru": "Блокирует наложение направленного ультимейта Winter's Curse.",
        "reason_en": "Blocks the single-target Winter's Curse ultimate."
      },
      {
        "item_key": "wind_waker",
        "priority": "high",
        "score_bonus": 6,
        "reason_uk": "Дозволяє підняти союзника або ворога поруч і зірвати фокус під Winter's Curse.",
        "reason_ru": "Позволяет поднять союзника или врага рядом и сорвать фокус под Winter's Curse.",
        "reason_en": "Allows lifting a nearby ally or Winter Wyvern to disrupt focus during Winter's Curse."
      }
    ],
    "default_position": 5,
    "positions": [
      5,
      4,
      3
    ],
    "typical_items": [
      "glimmer_cape",
      "aeon_disk"
    ],
    "primary_role_ru": "Фулл сап / Сап • Физ-иммунитет и хил Cold Embrace и проклятие Winter's Curse сквозь BKB",
    "primary_role_en": "Pos 5 / Support • Cold Embrace physical immunity and heal and Winter's Curse through BKB"
  }
};

const EXTRA_ITEM_RULES = {};

const api = {
  THREAT_TAGS_META,
  FALLBACK_TAG_MAPPING,
  BREAKABLE_PASSIVES_MAP,
  UNBREAKABLE_PASSIVES_SET,
  ITEM_POSITIONS,
  CURATED_ITEM_RULES,
  EXTRA_ITEM_RULES,
  NEUTRAL_ITEM_RULES,
  HERO_COUNTER_CAPABILITIES,
  ALLY_SYNERGY_RULES,
  FLEX_SUPPORT_MATRIX,
  ENEMY_ITEM_TRIGGERS,
  ENEMY_META_ITEM_PROFILES,
  HERO_META_POSITIONS,
  HERO_INNATE_REDUNDANT,
  SPECIALIZED_HERO_OVERRIDES
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  root.__d2oRulePresets = api;
}
})(typeof globalThis !== 'undefined' ? globalThis : window);
