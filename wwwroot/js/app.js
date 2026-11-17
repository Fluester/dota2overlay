const MAX_ENEMY_SLOTS = 5;
const MAX_ALLY_SLOTS = 4;
const PRIMARY_RECOMMENDATIONS_LIMIT = 6;

const UI_TRANSLATIONS = {
  uk: {
    autoShort: 'Авто',
    posRoleLabels: {
      1: '1 — Кері',
      2: '2 — Мід',
      3: '3 — Офлейн',
      4: '4 — Сап',
      5: '5 — Фул сап'
    },
    posBtnLabels: {
      '': 'Авто',
      1: '1 Кері',
      2: '2 Мід',
      3: '3 Офлейн',
      4: '4 Сап',
      5: '5 Фул сап'
    },
    posBtnTitles: {
      '': 'Авто / Усі позиції',
      1: 'Позиція 1 — Кері (Carry)',
      2: 'Позиція 2 — Мід (Mid)',
      3: 'Позиція 3 — Офлейн (Offlane)',
      4: 'Позиція 4 — Сап (Soft Support)',
      5: 'Позиція 5 — Фул сап (Hard Support)'
    },
    slotPosManualTitle: 'Позиція: {posLabel} (клік: Авто | 1 | 2 | 3 | 4 | 5, ПКМ: Авто)',
    slotPosAutoTitle: 'Позиція: Авто ({posLabel}) — клік: обрати позицію 1–5',
    updateDbBtn: 'Оновити',
    updatingDbBtn: 'Оновл...',
    updateDbTitle: 'Оновити базу: завантажити свіжі дані OpenDota API (patch, heroes, items, abilities) та переаналізувати правила без перезапуску',
    patchCheckTitle: 'Клікніть, щоб перевірити оновлення патчу',
    patchUpdateAvailable: 'Доступний новий патч {remote} (локально {local})',
    patchOfflineTitle: 'Офлайн-режим (клікніть для повторної перевірки)',
    patchUpToDateTitle: 'База актуальна (OpenDota {patch})',
    clickThroughTitle: 'Клік крізь вікно (Alt+X)',
    clickThroughBanner: 'Кліки проходять крізь вікно (35%) — Alt+X або трей для розблокування',
    miniModeCollapseTitle: 'Компактний міні-режим HUD (380×110)',
    miniModeExpandTitle: 'Розгорнути повний оверлей (380×650)',
    gsiCfgBtnTitle: 'Налаштування вікна, GSI та .cfg файл',
    resetBtnTitle: 'Нова гра / Скинути все',
    hideBtnTitle: 'Сховати в трей (Alt+Q)',
    closeBtnTitle: 'Закрити додаток',
    scanDraftBtn: 'Скан драфту (Alt+S)',
    scanDraftTitle: 'Розпізнати 10 героїв із верхньої панелі екрана (Alt+S)',
    scanEnemyItemsBtn: 'Закуп (Alt+E)',
    scanEnemyItemsTitle: 'Розпізнати інвентар виділеного ворога внизу HUD (Alt+E)',
    hudCalBtnTitle: 'Калібрування рамок HUD і вибір екрана піку/матчу',
    testGsiBtn: 'Тест GSI',
    testGsiTitle: 'Імітувати GSI-пакет (Juggernaut + куплений BKB)',
    testAutodraftBtn: 'Тест авто-драфту',
    testAutodraftTitle: 'Імітувати розпізнавання 4 союзників і 5 ворогів',
    testEnemyItemsBtn: 'Тест ворожого закупа',
    testEnemyItemsTitle: 'Імітувати виявлення Butterfly у ворожої PA',
    gsiNoDotaBadge: 'Без Dota 2',
    regenCfgBtn: 'Оновити .cfg',
    opacityLabel: 'Прозорість',
    resetPosBtn: 'Скинути позицію',
    reanalyzeRulesBtn: 'Переаналізувати скіли та предмети',
    reanalyzingRulesBtn: 'Аналіз скілів та предметів...',
    calTitle: 'Калібрування HUD',
    calPreviewBtn: 'Превʼю',
    calResetBtn: 'Скинути',
    calScreenLabel: 'Екран:',
    calModeAuto: 'Авто',
    calModeIngame: 'У матчі',
    calModeDraft: 'Екран піку',
    calPreviewHint: 'Екран {res} · Профіль: {profile} (зелені=союзн., червоні=вороги, фіол.=закуп)',
    calPreviewError: 'Помилка превʼю: {error}',
    myHeroLabel: 'Мій герой:',
    clearMyHeroTitle: 'Прибрати мого героя',
    myHeroPlaceholder: 'Viper, Lifestealer, Jugg...',
    gsiTestBadge: 'GSI тест',
    gsiTestInvPrefix: 'Тест GSI',
    gsiInvPrefix: 'Інвентар',
    alliesLabel: 'Союзники',
    allySearchPlaceholder: 'Додати союзника (Underlord, CM, Lion...)',
    allySlotFilledTitle: 'Союзник {name} ({posLabel}) — клік по картці видаляє',
    allySlotEmptyTitle: 'Обрати союзника у слот {slot}',
    allySlotsFullBanner: 'Усі 4 слоти союзників зайняті.',
    enemiesLabel: 'Ворожий пік',
    enemySearchPlaceholder: 'Пошук ворога (pa, am, bb, pl, Invoker...)',
    enemySearchFullPlaceholder: 'Усі 5 слотів зайняті (клік по герою видаляє)',
    clearSearchTitle: 'Очистити пошук',
    enemySlotFilledTitle: '{name} ({posLabel}) — клік по картці видаляє',
    enemySlotEmptyTitle: 'Обрати ворога у слот {slot}',
    enemySlotsFullBanner: 'Усі 5 слотів зайняті — клікніть по герою вгорі, щоб замінити.',
    heroNotFound: 'Героя не знайдено.',
    pickedBadge: 'Обрано',
    enemyItemsLabel: 'Предмети ворога',
    addEnemyItemBtn: '+ Додати',
    addEnemyItemTitle: 'Вказати ворожий предмет вручну',
    spottedItemRemoveTitle: '{name} — клікніть, щоб прибрати',
    phaseLabel: 'Фаза:',
    phaseEarlyLabel: 'Early (0–15 хв)',
    phaseMidLabel: 'Mid (15–30 хв)',
    phaseLateLabel: 'Late (30+ хв)',
    counterPickLabel: 'Кого пікнути:',
    counterPickChipTitle: '{reason} (клік — обрати як «Мій герой»)',
    neutralItemsTitle: 'Нейтральні предмети:',
    miniNoPick: 'Немає активного піку',
    miniEmptyHint: 'Оберіть ворогів або Alt+S',
    miniExpandBtn: 'Розгорнути',
    miniTopAgainst: 'Топ-{count} проти {enemies}',
    miniTopPhase: 'Топ-{count} на поточну фазу',
    timingWord: 'Таймінг',
    againstWord: 'Проти',
    againstLabel: 'Проти:',
    emptyRecsTitle: 'Оберіть ворожих героїв',
    emptyRecsDescDev: 'Вкажіть пік вручну, натисніть Alt+S або скористайтесь тест-кнопками вище.',
    emptyRecsDescProd: 'Вкажіть пік вручну, запустіть матч Dota 2 (GSI) або натисніть Alt+S у грі.',
    threatsLabel: 'Загрози:',
    suppressedNotice: 'Враховано {hero}: приховано {items}',
    recsCountZero: 'Порад: 0',
    noSpecificCounters: 'Для обраного набору героїв не знайдено специфічних контр-предметів.',
    recsTopOfTotal: 'Топ-{top} з {total}',
    recsTotalCount: 'Порад: {total}',
    ownedBadge: 'Зібрано ✓',
    collapseTopBtn: 'Згорнути до топ-{limit}',
    showMoreBtn: 'Показати ще ({count})',
    analysisError: 'Помилка аналізу: {error}',
    newMatchGsiReset: 'Новий матч GSI: драфт скинуто',
    visionNotFound: 'Іконки Dota 2 на екрані не виявлені',
    visionEmptyHeroCache: 'Локальний кеш портретів героїв ще порожній — спершу дочекайтесь завантаження іконок.',
    visionEmptyItemCache: 'Локальний кеш іконок предметів порожній.',
    visionNoScreenSource: 'Не знайдено жодного джерела екрана для захоплення.',
    visionDesktopCapturerUnavailable: 'Захоплення екрана недоступне у поточному середовищі.',
    consumedShort: 'погл.',
    gsiPortBusy: 'Порт {port} вже зайнятий іншим процесом',
    patchFetchFailed: 'Не вдалося отримати дані про патч з OpenDota або Valve Datafeed',
    visionSimDraft: 'Тест-драфт: {allies} союз., {enemies} вор.',
    visionScanDraft: 'Скан ({profile}): {allies} союз., {enemies} вор.',
    visionProfileDraft: 'піки',
    visionProfileMatch: 'матч',
    visionSimItems: 'Тест закупа: +{items}',
    visionScanItemsFound: 'Скан HUD: знайдено {items}',
    visionScanItemsNone: 'Скан HUD: тригерів не виявлено',
    gsiActive: 'активний',
    gsiError: 'помилка',
    gsiDisabled: 'вимкнено',
    dotaFound: 'Dota 2 знайдено',
    dotaNotFound: 'Dota 2 не знайдена',
    dotaNotFoundStandalone: 'Папку Dota 2 не знайдено. Додаток працює в автономному режимі.',
    dotaNotFoundDebugSuffix: 'Доступний автономний режим тестування без встановленої гри.',
    cfgActiveInDota: 'Конфіг {file} активний у папці Dota 2.',
    cfgTargetHint: 'Цільова папка після встановлення гри: {folder}',
    gsiFooterError: 'GSI: помилка',
    gsiFooterStandalone: 'GSI :{port} · Автономно',
    gsiFooterDebug: 'Debug :{port} · без Dota 2',
    gsiFooterTitleDota: 'Статус підключення Dota 2 GSI та конфігу',
    gsiFooterTitleStandalone: 'Dota 2 не знайдена — активний автономний режим (ручний пік, Alt+S та генератор CFG).',
    gsiFooterTitleDebug: 'Dota 2 не знайдена — увімкнено автономний Debug-режим (усі кнопки тестів, ручний пік та аналізатор працюють без гри).',
    reanalyzeError: 'Помилка переаналізу бази.',
    reanalyzeReport: 'Оновлено ({patch}): {heroes} героїв, {abilities} здібностей{talents}, {items} предметів → {rules} правил{neutrals}.',
    reanalyzeTalentsPart: ', {count} талантів',
    reanalyzeNeutralsPart: ', {count} нейтралок',
    dbUpdatedVision: 'Базу оновлено ({patch})',
    dbReanalyzedVision: 'Переаналізовано ({patch})',
    updateErrorVision: 'Помилка оновлення: {error}',
    cacheStatusOd: 'OpenDota кеш OK · {count} героїв',
    cacheStatusLocal: 'Локальна база OK · {count} героїв',
    loadingLocalData: 'Завантаження локальних даних...',
    dataError: 'Помилка даних: {error}'
  },
  ru: {
    autoShort: 'Авто',
    posRoleLabels: {
      1: '1 — Керри',
      2: '2 — Мид',
      3: '3 — Оффлейн',
      4: '4 — Сап',
      5: '5 — Фулл сап'
    },
    posBtnLabels: {
      '': 'Авто',
      1: '1 Керри',
      2: '2 Мид',
      3: '3 Оффлейн',
      4: '4 Сап',
      5: '5 Фулл сап'
    },
    posBtnTitles: {
      '': 'Авто / Все позиции',
      1: 'Позиция 1 — Керри (Carry)',
      2: 'Позиция 2 — Мид (Mid)',
      3: 'Позиция 3 — Оффлейн (Offlane)',
      4: 'Позиция 4 — Сап (Soft Support)',
      5: 'Позиция 5 — Фулл сап (Hard Support)'
    },
    slotPosManualTitle: 'Позиция: {posLabel} (клик: Авто | 1 | 2 | 3 | 4 | 5, ПКМ: Авто)',
    slotPosAutoTitle: 'Позиция: Авто ({posLabel}) — клик: выбрать позицию 1–5',
    updateDbBtn: 'Обновить',
    updatingDbBtn: 'Обновл...',
    updateDbTitle: 'Обновить базу: загрузить свежие данные OpenDota API (patch, heroes, items, abilities) и переанализировать правила без перезапуска',
    patchCheckTitle: 'Кликните, чтобы проверить обновление патча',
    patchUpdateAvailable: 'Доступен новый патч {remote} (локально {local})',
    patchOfflineTitle: 'Офлайн-режим (кликните для повторной проверки)',
    patchUpToDateTitle: 'База актуальна (OpenDota {patch})',
    clickThroughTitle: 'Клик сквозь окно (Alt+X)',
    clickThroughBanner: 'Клики проходят сквозь окно (35%) — Alt+X или трей для разблокировки',
    miniModeCollapseTitle: 'Компактный мини-режим HUD (380×110)',
    miniModeExpandTitle: 'Развернуть полный оверлей (380×650)',
    gsiCfgBtnTitle: 'Настройки окна, GSI и .cfg файл',
    resetBtnTitle: 'Новая игра / Сбросить все',
    hideBtnTitle: 'Скрыть в трей (Alt+Q)',
    closeBtnTitle: 'Закрыть приложение',
    scanDraftBtn: 'Скан драфта (Alt+S)',
    scanDraftTitle: 'Распознать 10 героев с верхней панели экрана (Alt+S)',
    scanEnemyItemsBtn: 'Закуп (Alt+E)',
    scanEnemyItemsTitle: 'Распознать инвентарь выделенного врага внизу HUD (Alt+E)',
    hudCalBtnTitle: 'Калибровка рамок HUD и выбор экрана пика/матча',
    testGsiBtn: 'Тест GSI',
    testGsiTitle: 'Имитировать GSI-пакет (Juggernaut + купленный BKB)',
    testAutodraftBtn: 'Тест авто-драфта',
    testAutodraftTitle: 'Имитировать распознавание 4 союзников и 5 врагов',
    testEnemyItemsBtn: 'Тест вражеского закупа',
    testEnemyItemsTitle: 'Имитировать обнаружение Butterfly у вражеской PA',
    gsiNoDotaBadge: 'Без Dota 2',
    regenCfgBtn: 'Обновить .cfg',
    opacityLabel: 'Прозрачность',
    resetPosBtn: 'Сбросить позицию',
    reanalyzeRulesBtn: 'Переанализировать скиллы и предметы',
    reanalyzingRulesBtn: 'Анализ скиллов и предметов...',
    calTitle: 'Калибровка HUD',
    calPreviewBtn: 'Превью',
    calResetBtn: 'Сбросить',
    calScreenLabel: 'Экран:',
    calModeAuto: 'Авто',
    calModeIngame: 'В матче',
    calModeDraft: 'Экран пика',
    calPreviewHint: 'Экран {res} · Профиль: {profile} (зелен.=союзн., красн.=враги, фиол.=закуп)',
    calPreviewError: 'Ошибка превью: {error}',
    myHeroLabel: 'Мой герой:',
    clearMyHeroTitle: 'Убрать моего героя',
    myHeroPlaceholder: 'Viper, Lifestealer, Jugg...',
    gsiTestBadge: 'GSI тест',
    gsiTestInvPrefix: 'Тест GSI',
    gsiInvPrefix: 'Инвентарь',
    alliesLabel: 'Союзники',
    allySearchPlaceholder: 'Добавить союзника (Underlord, CM, Lion...)',
    allySlotFilledTitle: 'Союзник {name} ({posLabel}) — клик по карточке удаляет',
    allySlotEmptyTitle: 'Выбрать союзника в слот {slot}',
    allySlotsFullBanner: 'Все 4 слота союзников заняты.',
    enemiesLabel: 'Вражеский пик',
    enemySearchPlaceholder: 'Поиск врага (pa, am, bb, pl, Invoker...)',
    enemySearchFullPlaceholder: 'Все 5 слотов заняты (клик по герою удаляет)',
    clearSearchTitle: 'Очистить поиск',
    enemySlotFilledTitle: '{name} ({posLabel}) — клик по карточке удаляет',
    enemySlotEmptyTitle: 'Выбрать врага в слот {slot}',
    enemySlotsFullBanner: 'Все 5 слотов заняты — кликните по герою вверху для замены.',
    heroNotFound: 'Герой не найден.',
    pickedBadge: 'Выбрано',
    enemyItemsLabel: 'Предметы врага',
    addEnemyItemBtn: '+ Добавить',
    addEnemyItemTitle: 'Указать вражеский предмет вручную',
    spottedItemRemoveTitle: '{name} — кликните, чтобы убрать',
    phaseLabel: 'Фаза:',
    phaseEarlyLabel: 'Early (0–15 мин)',
    phaseMidLabel: 'Mid (15–30 мин)',
    phaseLateLabel: 'Late (30+ мин)',
    counterPickLabel: 'Кого пикнуть:',
    counterPickChipTitle: '{reason} (клик — выбрать как «Мой герой»)',
    neutralItemsTitle: 'Нейтральные предметы:',
    miniNoPick: 'Нет активного пика',
    miniEmptyHint: 'Выберите врагов или Alt+S',
    miniExpandBtn: 'Развернуть',
    miniTopAgainst: 'Топ-{count} против {enemies}',
    miniTopPhase: 'Топ-{count} на текущую фазу',
    timingWord: 'Тайминг',
    againstWord: 'Против',
    againstLabel: 'Против:',
    emptyRecsTitle: 'Выберите вражеских героев',
    emptyRecsDescDev: 'Укажите пик вручную, нажмите Alt+S или воспользуйтесь тест-кнопками выше.',
    emptyRecsDescProd: 'Укажите пик вручную, запустите матч Dota 2 (GSI) или нажмите Alt+S в игре.',
    threatsLabel: 'Угрозы:',
    suppressedNotice: 'Учтен {hero}: скрыто {items}',
    recsCountZero: 'Советов: 0',
    noSpecificCounters: 'Для выбранного набора героев не найдено специфических контр-предметов.',
    recsTopOfTotal: 'Топ-{top} из {total}',
    recsTotalCount: 'Советов: {total}',
    ownedBadge: 'Собрано ✓',
    collapseTopBtn: 'Свернуть до топ-{limit}',
    showMoreBtn: 'Показать еще ({count})',
    analysisError: 'Ошибка анализа: {error}',
    newMatchGsiReset: 'Новый матч GSI: драфт сброшен',
    visionNotFound: 'Иконки Dota 2 на экране не обнаружены',
    visionEmptyHeroCache: 'Локальный кэш портретов героев еще пуст — сначала дождитесь загрузки иконок.',
    visionEmptyItemCache: 'Локальный кэш иконок предметов пуст.',
    visionNoScreenSource: 'Не найдено ни одного источника экрана для захвата.',
    visionDesktopCapturerUnavailable: 'Захват экрана недоступен в текущей среде.',
    consumedShort: 'погл.',
    gsiPortBusy: 'Порт {port} уже занят другим процессом',
    patchFetchFailed: 'Не удалось получить данные о патче из OpenDota или Valve Datafeed',
    visionSimDraft: 'Тест-драфт: {allies} союз., {enemies} вр.',
    visionScanDraft: 'Скан ({profile}): {allies} союз., {enemies} вр.',
    visionProfileDraft: 'пики',
    visionProfileMatch: 'матч',
    visionSimItems: 'Тест закупа: +{items}',
    visionScanItemsFound: 'Скан HUD: найдено {items}',
    visionScanItemsNone: 'Скан HUD: триггеров не обнаружено',
    gsiActive: 'активен',
    gsiError: 'ошибка',
    gsiDisabled: 'отключен',
    dotaFound: 'Dota 2 найдена',
    dotaNotFound: 'Dota 2 не найдена',
    dotaNotFoundStandalone: 'Папка Dota 2 не найдена. Приложение работает в автономном режиме.',
    dotaNotFoundDebugSuffix: 'Доступен автономный режим тестирования без установленной игры.',
    cfgActiveInDota: 'Конфиг {file} активен в папке Dota 2.',
    cfgTargetHint: 'Целевая папка после установки игры: {folder}',
    gsiFooterError: 'GSI: ошибка',
    gsiFooterStandalone: 'GSI :{port} · Автономно',
    gsiFooterDebug: 'Debug :{port} · без Dota 2',
    gsiFooterTitleDota: 'Статус подключения Dota 2 GSI и конфига',
    gsiFooterTitleStandalone: 'Dota 2 не найдена — активен автономный режим (ручной пик, Alt+S и генератор CFG).',
    gsiFooterTitleDebug: 'Dota 2 не найдена — включен автономный Debug-режим (все кнопки тестов, ручной пик и анализатор работают без игры).',
    reanalyzeError: 'Ошибка переанализа базы.',
    reanalyzeReport: 'Обновлено ({patch}): {heroes} героев, {abilities} способностей{talents}, {items} предметов → {rules} правил{neutrals}.',
    reanalyzeTalentsPart: ', {count} талантов',
    reanalyzeNeutralsPart: ', {count} нейтралок',
    dbUpdatedVision: 'База обновлена ({patch})',
    dbReanalyzedVision: 'Переанализировано ({patch})',
    updateErrorVision: 'Ошибка обновления: {error}',
    cacheStatusOd: 'OpenDota кэш OK · {count} героев',
    cacheStatusLocal: 'Локальная база OK · {count} героев',
    loadingLocalData: 'Загрузка локальных данных...',
    dataError: 'Ошибка данных: {error}'
  },
  en: {
    autoShort: 'Auto',
    posRoleLabels: {
      1: '1 — Carry',
      2: '2 — Mid',
      3: '3 — Offlane',
      4: '4 — Soft Sup',
      5: '5 — Hard Sup'
    },
    posBtnLabels: {
      '': 'Auto',
      1: '1 Carry',
      2: '2 Mid',
      3: '3 Offlane',
      4: '4 Soft Sup',
      5: '5 Hard Sup'
    },
    posBtnTitles: {
      '': 'Auto / All positions',
      1: 'Position 1 — Carry',
      2: 'Position 2 — Mid',
      3: 'Position 3 — Offlane',
      4: 'Position 4 — Soft Support',
      5: 'Position 5 — Hard Support'
    },
    slotPosManualTitle: 'Position: {posLabel} (click: Auto | 1 | 2 | 3 | 4 | 5, right-click: Auto)',
    slotPosAutoTitle: 'Position: Auto ({posLabel}) — click: select position 1–5',
    updateDbBtn: 'Update',
    updatingDbBtn: 'Updating...',
    updateDbTitle: 'Update DB: download fresh OpenDota API constants (patch, heroes, items, abilities) and re-analyze rule database without restart',
    patchCheckTitle: 'Click to check for patch updates',
    patchUpdateAvailable: 'New patch {remote} available (local {local})',
    patchOfflineTitle: 'Offline mode (click to retry)',
    patchUpToDateTitle: 'Database up to date (OpenDota {patch})',
    clickThroughTitle: 'Click-Through Mode (Alt+X)',
    clickThroughBanner: 'Click-Through active (35%) — press Alt+X or use system tray to unlock',
    miniModeCollapseTitle: 'Compact Mini HUD Mode (380×110)',
    miniModeExpandTitle: 'Expand Full Overlay (380×650)',
    gsiCfgBtnTitle: 'Window settings, GSI & .cfg file',
    resetBtnTitle: 'New match / Reset all',
    hideBtnTitle: 'Hide to tray (Alt+Q)',
    closeBtnTitle: 'Close application',
    scanDraftBtn: 'Scan Draft (Alt+S)',
    scanDraftTitle: 'Recognize 10 heroes from the top HUD bar (Alt+S)',
    scanEnemyItemsBtn: 'Items (Alt+E)',
    scanEnemyItemsTitle: 'Recognize selected enemy inventory from bottom HUD (Alt+E)',
    hudCalBtnTitle: 'HUD frame calibration & draft/match screen mode',
    testGsiBtn: 'Test GSI',
    testGsiTitle: 'Simulate GSI packet (Juggernaut + owned BKB)',
    testAutodraftBtn: 'Test Auto-Draft',
    testAutodraftTitle: 'Simulate recognition of 4 allies and 5 enemies',
    testEnemyItemsBtn: 'Test Enemy Items',
    testEnemyItemsTitle: 'Simulate spotting Butterfly on enemy PA',
    gsiNoDotaBadge: 'No Dota 2',
    regenCfgBtn: 'Update .cfg',
    opacityLabel: 'Opacity',
    resetPosBtn: 'Reset Position',
    reanalyzeRulesBtn: 'Re-analyze abilities & items',
    reanalyzingRulesBtn: 'Analyzing abilities & items...',
    calTitle: 'HUD Calibration',
    calPreviewBtn: 'Preview',
    calResetBtn: 'Reset',
    calScreenLabel: 'Screen:',
    calModeAuto: 'Auto',
    calModeIngame: 'In-game',
    calModeDraft: 'Draft screen',
    calPreviewHint: 'Screen {res} · Profile: {profile} (green=allies, red=enemies, purple=items)',
    calPreviewError: 'Preview error: {error}',
    myHeroLabel: 'My Hero:',
    clearMyHeroTitle: 'Clear my hero',
    myHeroPlaceholder: 'Viper, Lifestealer, Jugg...',
    gsiTestBadge: 'GSI test',
    gsiTestInvPrefix: 'GSI Test',
    gsiInvPrefix: 'Inventory',
    alliesLabel: 'Allies',
    allySearchPlaceholder: 'Add ally (Underlord, CM, Lion...)',
    allySlotFilledTitle: 'Ally {name} ({posLabel}) — click card to remove',
    allySlotEmptyTitle: 'Select ally into slot {slot}',
    allySlotsFullBanner: 'All 4 ally slots are full.',
    enemiesLabel: 'Enemy Draft',
    enemySearchPlaceholder: 'Search enemy (pa, am, bb, pl, Invoker...)',
    enemySearchFullPlaceholder: 'All 5 slots full (click hero card to remove)',
    clearSearchTitle: 'Clear search',
    enemySlotFilledTitle: '{name} ({posLabel}) — click card to remove',
    enemySlotEmptyTitle: 'Select enemy into slot {slot}',
    enemySlotsFullBanner: 'All 5 slots are full — click a hero card above to replace.',
    heroNotFound: 'No matching hero found.',
    pickedBadge: 'Picked',
    enemyItemsLabel: 'Enemy Items',
    addEnemyItemBtn: '+ Add',
    addEnemyItemTitle: 'Add enemy item manually',
    spottedItemRemoveTitle: '{name} — click to remove',
    phaseLabel: 'Phase:',
    phaseEarlyLabel: 'Early (0–15m)',
    phaseMidLabel: 'Mid (15–30m)',
    phaseLateLabel: 'Late (30m+)',
    counterPickLabel: 'Counter-picks:',
    counterPickChipTitle: '{reason} (click to select as My Hero)',
    neutralItemsTitle: 'Neutral Items:',
    miniNoPick: 'No active draft',
    miniEmptyHint: 'Pick enemies or press Alt+S',
    miniExpandBtn: 'Expand',
    miniTopAgainst: 'Top-{count} vs {enemies}',
    miniTopPhase: 'Top-{count} for current phase',
    timingWord: 'Timing',
    againstWord: 'Against',
    againstLabel: 'Against:',
    emptyRecsTitle: 'Select Enemy Heroes',
    emptyRecsDescDev: 'Pick heroes manually, press Alt+S, or use the test buttons above.',
    emptyRecsDescProd: 'Pick heroes manually, start a Dota 2 match (GSI), or press Alt+S in-game.',
    threatsLabel: 'Threats:',
    suppressedNotice: '{hero} context: hidden {items}',
    recsCountZero: 'Tips: 0',
    noSpecificCounters: 'No specific counter-items found for the selected heroes.',
    recsTopOfTotal: 'Top-{top} of {total}',
    recsTotalCount: 'Tips: {total}',
    ownedBadge: 'Owned ✓',
    collapseTopBtn: 'Collapse to top-{limit}',
    showMoreBtn: 'Show more ({count})',
    analysisError: 'Analysis error: {error}',
    newMatchGsiReset: 'New GSI match: draft reset',
    visionNotFound: 'No Dota 2 icons detected on screen',
    visionEmptyHeroCache: 'Local hero portrait cache is empty — wait for icons to finish downloading.',
    visionEmptyItemCache: 'Local item icon cache is empty.',
    visionNoScreenSource: 'No screen capture source found.',
    visionDesktopCapturerUnavailable: 'Screen capture is unavailable in the current environment.',
    consumedShort: 'consumed',
    gsiPortBusy: 'Port {port} is already in use',
    patchFetchFailed: 'Failed to fetch patch data from OpenDota or Valve Datafeed',
    visionSimDraft: 'Test draft: {allies} allies, {enemies} enemies',
    visionScanDraft: 'Scan ({profile}): {allies} allies, {enemies} enemies',
    visionProfileDraft: 'draft',
    visionProfileMatch: 'match',
    visionSimItems: 'Test items: +{items}',
    visionScanItemsFound: 'HUD scan: found {items}',
    visionScanItemsNone: 'HUD scan: no triggers detected',
    gsiActive: 'active',
    gsiError: 'error',
    gsiDisabled: 'disabled',
    dotaFound: 'Dota 2 found',
    dotaNotFound: 'Dota 2 not found',
    dotaNotFoundStandalone: 'Dota 2 folder not found. Running in standalone mode.',
    dotaNotFoundDebugSuffix: 'Standalone testing mode is available without the game installed.',
    cfgActiveInDota: 'Config {file} is active in Dota 2 folder.',
    cfgTargetHint: 'Target folder after installing game: {folder}',
    gsiFooterError: 'GSI: error',
    gsiFooterStandalone: 'GSI :{port} · Standalone',
    gsiFooterDebug: 'Debug :{port} · no Dota 2',
    gsiFooterTitleDota: 'Dota 2 GSI connection & config status',
    gsiFooterTitleStandalone: 'Dota 2 not found — standalone mode active (manual draft, Alt+S & CFG generator).',
    gsiFooterTitleDebug: 'Dota 2 not found — standalone Debug mode active (all test buttons, manual draft & analyzer work without game).',
    reanalyzeError: 'Failed to re-analyze database.',
    reanalyzeReport: 'Updated ({patch}): {heroes} heroes, {abilities} abilities{talents}, {items} items → {rules} rules{neutrals}.',
    reanalyzeTalentsPart: ', {count} talents',
    reanalyzeNeutralsPart: ', {count} neutrals',
    dbUpdatedVision: 'DB updated ({patch})',
    dbReanalyzedVision: 'Re-analyzed ({patch})',
    updateErrorVision: 'Update error: {error}',
    cacheStatusOd: 'OpenDota cache OK · {count} heroes',
    cacheStatusLocal: 'Local DB OK · {count} heroes',
    loadingLocalData: 'Loading local data...',
    dataError: 'Data error: {error}'
  }
};

const state = {
  language: 'uk',
  heroes: [],
  heroesById: new Map(),
  counterItemsMeta: {},
  triggerItemsMeta: {},
  selectedEnemySlots: Array(MAX_ENEMY_SLOTS).fill(null),
  enemySlotPositions: Array(MAX_ENEMY_SLOTS).fill(null),
  activeEnemySlot: 0,
  selectedAllySlots: Array(MAX_ALLY_SLOTS).fill(null),
  allySlotPositions: Array(MAX_ALLY_SLOTS).fill(null),
  activeAllySlot: 0,
  alliesExpanded: false,
  myHeroId: null,
  myHeroFromGsi: false,
  myPosition: null,
  ownedItemKeys: [],
  ownedItemsDetails: [],
  hasAghanimsScepter: false,
  hasAghanimsShard: false,
  miniMode: false,
  gsiSimulated: false,
  gsiClockTime: null,
  matchPhase: 'auto',
  visionCalibration: { mode: 'auto', offsetX: 0, offsetY: 0, scale: 1.0 },
  detectedEnemyItems: [],
  showAllRecommendations: false,
  lastAnalysis: null,
  lastGsiStatus: null,
  lastGameMeta: null,
  enemyResults: [],
  enemyHighlightedIndex: 0,
  enemyDropdownOpen: false,
  allyResults: [],
  allyHighlightedIndex: 0,
  allyDropdownOpen: false,
  myHeroResults: [],
  myHeroHighlightedIndex: 0,
  myHeroDropdownOpen: false,
  enemyItemPickerOpen: false,
  patchStatus: null,
  isPackaged: false,
  devToolsVisible: false,
  appVersion: ''
};

const dom = {};

function normalizeLanguage(lang) {
  if (!lang || typeof lang !== 'string') return 'uk';
  const l = lang.trim().toLowerCase();
  if (l === 'ru') return 'ru';
  if (l === 'en') return 'en';
  return 'uk';
}

function t(key, params = {}) {
  const dict = UI_TRANSLATIONS[state.language] || UI_TRANSLATIONS.uk;
  let str = dict[key] !== undefined ? dict[key] : UI_TRANSLATIONS.uk[key];
  if (typeof str !== 'string') return String(key);
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v ?? ''));
  }
  return str;
}

function getPosRoleLabel(pos) {
  const dict = UI_TRANSLATIONS[state.language] || UI_TRANSLATIONS.uk;
  return (dict.posRoleLabels && dict.posRoleLabels[pos]) || `Pos ${pos}`;
}

function cacheDom() {
  dom.overlayShell = document.getElementById('overlay-shell');
  dom.clickThroughBanner = document.getElementById('click-through-banner');
  dom.lblClickThroughBanner = document.getElementById('lbl-click-through-banner');
  dom.langSwitcher = document.getElementById('lang-switcher');
  dom.btnClickThrough = document.getElementById('btn-click-through');
  dom.btnMiniMode = document.getElementById('btn-mini-mode');
  dom.btnMiniModeIcon = document.getElementById('btn-mini-mode-icon');
  dom.miniHudStrip = document.getElementById('mini-hud-strip');
  dom.miniPhaseLabel = document.getElementById('mini-phase-label');
  dom.miniHudHint = document.getElementById('mini-hud-hint');
  dom.miniItemsRow = document.getElementById('mini-items-row');
  dom.patchBadge = document.getElementById('patch-badge');
  dom.btnUpdateDb = document.getElementById('btn-update-db');
  dom.lblUpdateDb = document.getElementById('lbl-update-db');
  dom.btnGsiCfg = document.getElementById('btn-gsi-cfg');
  dom.btnReset = document.getElementById('btn-reset');
  dom.btnHide = document.getElementById('btn-hide');
  dom.btnClose = document.getElementById('btn-close');

  dom.btnScanDraft = document.getElementById('btn-scan-draft');
  dom.lblScanDraft = document.getElementById('lbl-scan-draft');
  dom.btnScanEnemyItems = document.getElementById('btn-scan-enemy-items');
  dom.lblScanEnemyItems = document.getElementById('lbl-scan-enemy-items');
  dom.btnHudCalibration = document.getElementById('btn-hud-calibration');
  dom.devToolsRow = document.getElementById('dev-tools-row');
  dom.btnTestGsi = document.getElementById('btn-test-gsi');
  dom.btnTestAutodraft = document.getElementById('btn-test-autodraft');
  dom.btnTestEnemyItems = document.getElementById('btn-test-enemy-items');

  dom.hudCalibrationDrawer = document.getElementById('hud-calibration-drawer');
  dom.lblCalTitle = document.getElementById('lbl-cal-title');
  dom.calProfileLabel = document.getElementById('cal-profile-label');
  dom.btnCalPreview = document.getElementById('btn-cal-preview');
  dom.btnCalReset = document.getElementById('btn-cal-reset');
  dom.btnCalClose = document.getElementById('btn-cal-close');
  dom.lblCalScreen = document.getElementById('lbl-cal-screen');
  dom.inputCalX = document.getElementById('input-cal-x');
  dom.inputCalY = document.getElementById('input-cal-y');
  dom.inputCalScale = document.getElementById('input-cal-scale');
  dom.calPreviewWrap = document.getElementById('cal-preview-wrap');
  dom.calibrationPreviewImg = document.getElementById('calibration-preview-img');
  dom.calPreviewHint = document.getElementById('cal-preview-hint');

  dom.gsiCfgDrawer = document.getElementById('gsi-cfg-drawer');
  dom.gsiServerStatus = document.getElementById('gsi-server-status');
  dom.gsiDebugBadge = document.getElementById('gsi-debug-badge');
  dom.gsiCfgMessage = document.getElementById('gsi-cfg-message');
  dom.gsiCfgPath = document.getElementById('gsi-cfg-path');
  dom.gsiCfgTargetHint = document.getElementById('gsi-cfg-target-hint');
  dom.btnRegenCfg = document.getElementById('btn-regen-cfg');
  dom.btnCloseCfg = document.getElementById('btn-close-cfg');
  dom.lblOpacity = document.getElementById('lbl-opacity');
  dom.rangeOpacity = document.getElementById('range-opacity');
  dom.opacityValueLabel = document.getElementById('opacity-value-label');
  dom.btnResetPos = document.getElementById('btn-reset-pos');
  dom.btnReanalyzeRules = document.getElementById('btn-reanalyze-rules');
  dom.lblReanalyzeRules = document.getElementById('lbl-reanalyze-rules');
  dom.reanalyzeReportText = document.getElementById('reanalyze-report-text');

  dom.lblMyHero = document.getElementById('lbl-my-hero');
  dom.myHeroSelectedWrap = document.getElementById('my-hero-selected-wrap');
  dom.myHeroImg = document.getElementById('my-hero-img');
  dom.myHeroName = document.getElementById('my-hero-name');
  dom.myHeroGsiBadge = document.getElementById('my-hero-gsi-badge');
  dom.btnClearMyHero = document.getElementById('btn-clear-my-hero');
  dom.myHeroSearchWrap = document.getElementById('my-hero-search-wrap');
  dom.myHeroInput = document.getElementById('my-hero-input');
  dom.myHeroDropdown = document.getElementById('my-hero-dropdown');
  dom.positionButtons = document.getElementById('position-buttons');
  dom.gsiInventoryStrip = document.getElementById('gsi-inventory-strip');
  dom.gsiInventoryText = document.getElementById('gsi-inventory-text');

  dom.btnToggleAllies = document.getElementById('btn-toggle-allies');
  dom.lblAllies = document.getElementById('lbl-allies');
  dom.alliesCount = document.getElementById('allies-count');
  dom.alliesMiniStrip = document.getElementById('allies-mini-strip');
  dom.alliesChevron = document.getElementById('allies-chevron');
  dom.alliesCollapseBody = document.getElementById('allies-collapse-body');
  dom.allySlots = document.getElementById('ally-slots');
  dom.allySearchInput = document.getElementById('ally-search-input');
  dom.allyDropdown = document.getElementById('ally-dropdown');

  dom.lblEnemies = document.getElementById('lbl-enemies');
  dom.selectedCount = document.getElementById('selected-count');
  dom.visionStatusText = document.getElementById('vision-status-text');
  dom.enemySlots = document.getElementById('enemy-slots');
  dom.searchInput = document.getElementById('hero-search-input');
  dom.btnClearSearch = document.getElementById('btn-clear-search');
  dom.dropdown = document.getElementById('autocomplete-dropdown');

  dom.lblEnemyItems = document.getElementById('lbl-enemy-items');
  dom.spottedItemsCount = document.getElementById('spotted-items-count');
  dom.btnAddEnemyItem = document.getElementById('btn-add-enemy-item');
  dom.spottedItemsList = document.getElementById('spotted-items-list');
  dom.enemyItemPicker = document.getElementById('enemy-item-picker');

  dom.lblPhase = document.getElementById('lbl-phase');
  dom.matchPhaseButtons = document.getElementById('match-phase-buttons');
  dom.matchClockBadge = document.getElementById('match-clock-badge');
  dom.counterPicksBar = document.getElementById('counter-picks-bar');
  dom.threatsBar = document.getElementById('threats-bar');
  dom.contextNoticeBar = document.getElementById('context-notice-bar');
  dom.recommendationsList = document.getElementById('recommendations-list');
  dom.neutralItemsBar = document.getElementById('neutral-items-bar');
  dom.cacheStatusText = document.getElementById('cache-status-text');
  dom.gsiFooterStatus = document.getElementById('gsi-footer-status');
  dom.itemsCountText = document.getElementById('items-count-text');
  dom.appVersionText = document.getElementById('app-version-text');
}

function applyUiLanguage() {
  document.documentElement.lang = state.language;

  if (dom.langSwitcher) {
    dom.langSwitcher.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === state.language);
    });
  }

  if (dom.lblUpdateDb && dom.btnUpdateDb && !dom.btnUpdateDb.disabled) {
    dom.lblUpdateDb.textContent = t('updateDbBtn');
  }
  if (dom.btnUpdateDb) dom.btnUpdateDb.title = t('updateDbTitle');
  if (dom.btnClickThrough) dom.btnClickThrough.title = t('clickThroughTitle');
  if (dom.lblClickThroughBanner) dom.lblClickThroughBanner.textContent = t('clickThroughBanner');
  if (dom.btnMiniMode) {
    dom.btnMiniMode.title = state.miniMode ? t('miniModeExpandTitle') : t('miniModeCollapseTitle');
  }
  if (dom.btnGsiCfg) dom.btnGsiCfg.title = t('gsiCfgBtnTitle');
  if (dom.btnReset) dom.btnReset.title = t('resetBtnTitle');
  if (dom.btnHide) dom.btnHide.title = t('hideBtnTitle');
  if (dom.btnClose) dom.btnClose.title = t('closeBtnTitle');

  if (dom.lblScanDraft) dom.lblScanDraft.textContent = t('scanDraftBtn');
  if (dom.btnScanDraft) dom.btnScanDraft.title = t('scanDraftTitle');
  if (dom.lblScanEnemyItems) dom.lblScanEnemyItems.textContent = t('scanEnemyItemsBtn');
  if (dom.btnScanEnemyItems) dom.btnScanEnemyItems.title = t('scanEnemyItemsTitle');
  if (dom.btnHudCalibration) dom.btnHudCalibration.title = t('hudCalBtnTitle');

  if (dom.btnTestGsi) {
    dom.btnTestGsi.textContent = t('testGsiBtn');
    dom.btnTestGsi.title = t('testGsiTitle');
  }
  if (dom.btnTestAutodraft) {
    dom.btnTestAutodraft.textContent = t('testAutodraftBtn');
    dom.btnTestAutodraft.title = t('testAutodraftTitle');
  }
  if (dom.btnTestEnemyItems) {
    dom.btnTestEnemyItems.textContent = t('testEnemyItemsBtn');
    dom.btnTestEnemyItems.title = t('testEnemyItemsTitle');
  }

  if (dom.gsiDebugBadge) dom.gsiDebugBadge.textContent = t('gsiNoDotaBadge');
  if (dom.btnRegenCfg) dom.btnRegenCfg.textContent = t('regenCfgBtn');
  if (dom.lblOpacity) dom.lblOpacity.textContent = t('opacityLabel');
  if (dom.btnResetPos) dom.btnResetPos.textContent = t('resetPosBtn');
  if (dom.lblReanalyzeRules && dom.btnReanalyzeRules && !dom.btnReanalyzeRules.disabled) {
    dom.lblReanalyzeRules.textContent = t('reanalyzeRulesBtn');
  }

  if (dom.lblCalTitle) dom.lblCalTitle.textContent = t('calTitle');
  if (dom.btnCalPreview) dom.btnCalPreview.textContent = t('calPreviewBtn');
  if (dom.btnCalReset) dom.btnCalReset.textContent = t('calResetBtn');
  if (dom.lblCalScreen) dom.lblCalScreen.textContent = t('calScreenLabel');
  if (dom.hudCalibrationDrawer) {
    const modeMap = { auto: t('calModeAuto'), ingame: t('calModeIngame'), draft: t('calModeDraft') };
    dom.hudCalibrationDrawer.querySelectorAll('.cal-mode-btn').forEach((btn) => {
      const m = btn.dataset.calMode;
      if (modeMap[m]) btn.textContent = modeMap[m];
    });
  }

  if (dom.lblMyHero) dom.lblMyHero.textContent = t('myHeroLabel');
  if (dom.btnClearMyHero) dom.btnClearMyHero.title = t('clearMyHeroTitle');
  if (dom.myHeroInput) dom.myHeroInput.placeholder = t('myHeroPlaceholder');

  const dict = UI_TRANSLATIONS[state.language] || UI_TRANSLATIONS.uk;
  if (dom.positionButtons) {
    dom.positionButtons.querySelectorAll('.pos-btn').forEach((btn) => {
      const posKey = btn.dataset.pos || '';
      if (dict.posBtnLabels && dict.posBtnLabels[posKey] !== undefined) {
        btn.textContent = dict.posBtnLabels[posKey];
      }
      if (dict.posBtnTitles && dict.posBtnTitles[posKey] !== undefined) {
        btn.title = dict.posBtnTitles[posKey];
      }
    });
  }

  if (dom.lblAllies) dom.lblAllies.textContent = t('alliesLabel');
  if (dom.allySearchInput) dom.allySearchInput.placeholder = t('allySearchPlaceholder');
  if (dom.lblEnemies) dom.lblEnemies.textContent = t('enemiesLabel');
  if (dom.btnClearSearch) dom.btnClearSearch.title = t('clearSearchTitle');
  if (dom.lblEnemyItems) dom.lblEnemyItems.textContent = t('enemyItemsLabel');
  if (dom.btnAddEnemyItem) {
    dom.btnAddEnemyItem.textContent = t('addEnemyItemBtn');
    dom.btnAddEnemyItem.title = t('addEnemyItemTitle');
  }
  if (dom.lblPhase) dom.lblPhase.textContent = t('phaseLabel');
  if (dom.matchPhaseButtons) {
    const autoBtn = dom.matchPhaseButtons.querySelector('[data-phase="auto"]');
    if (autoBtn) autoBtn.textContent = t('autoShort');
  }

  renderCalibrationControls();
  renderMyHeroPanel();
  renderAllyPanel();
  renderSlots();
  renderSpottedEnemyItems();
  if (state.patchStatus) renderPatchBadge(state.patchStatus);
  if (state.lastGsiStatus) renderGsiStatusDrawer(state.lastGsiStatus);
  if (state.lastGameMeta && dom.cacheStatusText) {
    const key = state.lastGameMeta.openDotaCached ? 'cacheStatusOd' : 'cacheStatusLocal';
    dom.cacheStatusText.textContent = t(key, { count: state.lastGameMeta.totalHeroes });
  } else if (dom.cacheStatusText) {
    dom.cacheStatusText.textContent = t('loadingLocalData');
  }
  if (dom.gsiFooterStatus && !state.lastGsiStatus) {
    dom.gsiFooterStatus.title = t('gsiFooterTitleDota');
  }
}

function getSelectedEnemyIds() {
  return state.selectedEnemySlots.filter((id) => id !== null);
}

function getSelectedAllyIds() {
  return state.selectedAllySlots.filter((id) => id !== null);
}

function getEnemyPositionsMap() {
  const map = {};
  state.selectedEnemySlots.forEach((heroId, idx) => {
    if (heroId !== null && state.enemySlotPositions[idx] !== null) {
      map[heroId] = state.enemySlotPositions[idx];
    }
  });
  return map;
}

function getAllyPositionsMap() {
  const map = {};
  state.selectedAllySlots.forEach((heroId, idx) => {
    if (heroId !== null && state.allySlotPositions[idx] !== null) {
      map[heroId] = state.allySlotPositions[idx];
    }
  });
  return map;
}

function cyclePositionValue(currentPos) {
  if (currentPos == null) return 1;
  if (currentPos >= 5) return null;
  return Number(currentPos) + 1;
}

function createSlotPositionBadge({ hero, manualPos, onCycle, onReset }) {
  const badge = document.createElement('span');
  badge.className = 'hero-slot-pos-badge';
  const defaultPos = (hero && hero.default_position) || 3;

  if (manualPos != null && manualPos >= 1 && manualPos <= 5) {
    badge.classList.add('is-manual');
    badge.textContent = String(manualPos);
    badge.title = t('slotPosManualTitle', { posLabel: getPosRoleLabel(manualPos) });
  } else {
    badge.textContent = t('autoShort');
    badge.title = t('slotPosAutoTitle', { posLabel: getPosRoleLabel(defaultPos) });
  }

  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    onCycle();
  });
  badge.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onReset();
  });

  return badge;
}

function getFirstEmptyIndex(slots) {
  return slots.findIndex((id) => id === null);
}

function hasAnyActiveState() {
  return (
    getSelectedEnemyIds().length > 0 ||
    getSelectedAllyIds().length > 0 ||
    state.myHeroId !== null ||
    state.myPosition !== null ||
    state.ownedItemKeys.length > 0 ||
    state.detectedEnemyItems.length > 0
  );
}

function updateResetButtonState() {
  dom.btnReset.disabled = !hasAnyActiveState();
}

function scoreHeroMatch(hero, query) {
  if (!query) return hero.isCurated ? 10 : 1;

  const q = query.trim().toLowerCase();
  if (!q) return hero.isCurated ? 10 : 1;

  const nameEn = (hero.name_en || '').toLowerCase();
  const key = (hero.key || '').toLowerCase();
  const aliases = Array.isArray(hero.aliases) ? hero.aliases : [];

  if (aliases.includes(q) || nameEn === q || key === q) return 100;
  if (nameEn.startsWith(q) || key.startsWith(q)) return 80;

  const words = nameEn.split(/[\s-]+/);
  if (words.some((w) => w.startsWith(q))) return 65;
  if (aliases.some((a) => a.startsWith(q))) return 55;
  if (nameEn.includes(q) || aliases.some((a) => a.includes(q))) return 35;

  return 0;
}

function searchHeroes(query) {
  const q = (query || '').trim().toLowerCase();
  const scored = [];

  for (const hero of state.heroes) {
    const matchScore = scoreHeroMatch(hero, q);
    if (matchScore > 0) scored.push({ hero, matchScore });
  }

  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.hero.isCurated !== b.hero.isCurated) return a.hero.isCurated ? -1 : 1;
    return a.hero.name_en.localeCompare(b.hero.name_en);
  });

  return scored.slice(0, 12).map((entry) => entry.hero);
}

function resolveVisionErrorMessage(result) {
  if (!result) return t('visionNotFound');
  if (result.notFound || result.errorCode === 'NO_DOTA_ICONS') return t('visionNotFound');
  if (result.errorCode === 'EMPTY_HERO_CACHE') return t('visionEmptyHeroCache');
  if (result.errorCode === 'EMPTY_ITEM_CACHE') return t('visionEmptyItemCache');
  if (result.errorCode === 'NO_SCREEN_SOURCE') return t('visionNoScreenSource');
  if (result.errorCode === 'DESKTOP_CAPTURER_UNAVAILABLE') return t('visionDesktopCapturerUnavailable');
  return result.error || t('visionNotFound');
}

function renderPatchBadge(patchStatus) {
  if (!patchStatus) return;
  state.patchStatus = patchStatus;

  const ver = patchStatus.localPatch || '—';
  dom.patchBadge.textContent = ver;

  if (patchStatus.hasUpdate) {
    dom.patchBadge.className = 'badge text-bg-warning text-dark patch-badge no-drag flex-shrink-0';
    dom.patchBadge.title = t('patchUpdateAvailable', { remote: patchStatus.remotePatch, local: ver });
    dom.btnUpdateDb.className = 'btn btn-warning btn-header-compact fw-semibold no-drag flex-shrink-0';
    dom.btnUpdateDb.classList.remove('d-none');
  } else {
    dom.patchBadge.className = 'badge text-bg-secondary patch-badge no-drag flex-shrink-0';
    dom.patchBadge.title = patchStatus.offline
      ? t('patchOfflineTitle')
      : t('patchUpToDateTitle', { patch: patchStatus.openDotaMajorPatch || ver });
    dom.btnUpdateDb.className = 'btn btn-header-quiet btn-header-compact fw-semibold no-drag flex-shrink-0';
    dom.btnUpdateDb.classList.remove('d-none');
  }
}

function renderMyHeroPanel() {
  const myHero = state.myHeroId ? state.heroesById.get(state.myHeroId) : null;

  if (myHero) {
    dom.myHeroImg.src = myHero.icon || myHero.img;
    dom.myHeroImg.alt = myHero.name_en;
    dom.myHeroName.textContent = myHero.name_en;
    dom.myHeroGsiBadge.classList.toggle('d-none', !state.myHeroFromGsi);
    dom.myHeroGsiBadge.textContent = state.gsiSimulated ? t('gsiTestBadge') : 'GSI';
    dom.myHeroSelectedWrap.classList.remove('d-none');
    dom.myHeroSearchWrap.classList.add('d-none');
  } else {
    dom.myHeroSelectedWrap.classList.add('d-none');
    dom.myHeroSearchWrap.classList.remove('d-none');
  }

  if (state.ownedItemsDetails.length > 0) {
    const names = state.ownedItemsDetails
      .map((it) => (it.consumed ? `${it.nameEn} (${t('consumedShort')})` : it.nameEn))
      .join(', ');
    dom.gsiInventoryText.textContent = `${state.gsiSimulated ? t('gsiTestInvPrefix') : t('gsiInvPrefix')}: ${names}`;
    dom.gsiInventoryStrip.classList.remove('d-none');
  } else {
    dom.gsiInventoryStrip.classList.add('d-none');
    dom.gsiInventoryText.textContent = '';
  }

  dom.positionButtons.querySelectorAll('.pos-btn').forEach((btn) => {
    const posVal = btn.dataset.pos ? Number(btn.dataset.pos) : null;
    btn.classList.toggle('is-active', posVal === state.myPosition);
  });

  updateResetButtonState();
}

function renderAllyPanel() {
  const allyIds = getSelectedAllyIds();
  dom.alliesCount.textContent = String(allyIds.length);
  dom.alliesMiniStrip.innerHTML = '';

  state.selectedAllySlots.forEach((id, idx) => {
    if (id === null) return;
    const h = state.heroesById.get(id);
    if (!h) return;
    const manualPos = state.allySlotPositions[idx];
    const effPos = manualPos || h.default_position || 3;
    const img = document.createElement('img');
    img.className = 'ally-mini-avatar';
    img.src = h.icon || h.img;
    img.alt = h.name_en;
    img.title = `${h.name_en} (${manualPos ? `Pos ${manualPos}` : `${t('autoShort')}: Pos ${effPos}`})`;
    dom.alliesMiniStrip.appendChild(img);
  });

  dom.alliesCollapseBody.classList.toggle('d-none', !state.alliesExpanded);
  dom.alliesChevron.className = state.alliesExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down';

  dom.allySlots.innerHTML = '';
  state.selectedAllySlots.forEach((heroId, index) => {
    const slotBtn = document.createElement('button');
    slotBtn.type = 'button';
    slotBtn.className = 'hero-slot';

    if (heroId !== null && state.heroesById.has(heroId)) {
      const hero = state.heroesById.get(heroId);
      const manualPos = state.allySlotPositions[index];
      const effPos = manualPos || hero.default_position || 3;
      slotBtn.classList.add('is-filled-ally');
      slotBtn.title = t('allySlotFilledTitle', { name: hero.name_en, posLabel: getPosRoleLabel(effPos) });

      const img = document.createElement('img');
      img.className = 'hero-slot-img';
      img.src = hero.img;
      img.alt = hero.name_en;

      const posBadge = createSlotPositionBadge({
        hero,
        manualPos,
        onCycle: async () => {
          state.allySlotPositions[index] = cyclePositionValue(state.allySlotPositions[index]);
          renderAllyPanel();
          await runDraftAnalysis();
        },
        onReset: async () => {
          state.allySlotPositions[index] = null;
          renderAllyPanel();
          await runDraftAnalysis();
        }
      });

      const nameSpan = document.createElement('span');
      nameSpan.className = 'hero-slot-name';
      nameSpan.textContent = hero.name_en;

      const rm = document.createElement('span');
      rm.className = 'hero-slot-remove';
      rm.innerHTML = '<i class="bi bi-x"></i>';

      slotBtn.appendChild(img);
      slotBtn.appendChild(posBadge);
      slotBtn.appendChild(nameSpan);
      slotBtn.appendChild(rm);
      slotBtn.addEventListener('click', () => removeAllyFromSlot(index));
    } else {
      if (state.allyDropdownOpen && state.activeAllySlot === index) {
        slotBtn.classList.add('is-active-slot');
      }
      slotBtn.title = t('allySlotEmptyTitle', { slot: index + 1 });
      const plus = document.createElement('i');
      plus.className = 'bi bi-plus';
      const num = document.createElement('span');
      num.className = 'hero-slot-empty-num';
      num.textContent = `S${index + 1}`;
      slotBtn.appendChild(plus);
      slotBtn.appendChild(num);
      slotBtn.addEventListener('click', () => {
        state.activeAllySlot = index;
        renderAllyPanel();
        openAllyAutocomplete(dom.allySearchInput.value);
        dom.allySearchInput.focus();
      });
    }
    dom.allySlots.appendChild(slotBtn);
  });

  updateResetButtonState();
}

function renderSlots() {
  const selectedIds = getSelectedEnemyIds();
  dom.selectedCount.textContent = String(selectedIds.length);
  dom.searchInput.placeholder =
    selectedIds.length >= MAX_ENEMY_SLOTS
      ? t('enemySearchFullPlaceholder')
      : t('enemySearchPlaceholder');
  dom.enemySlots.innerHTML = '';

  state.selectedEnemySlots.forEach((heroId, index) => {
    const slotBtn = document.createElement('button');
    slotBtn.type = 'button';
    slotBtn.className = 'hero-slot';

    if (heroId !== null && state.heroesById.has(heroId)) {
      const hero = state.heroesById.get(heroId);
      const manualPos = state.enemySlotPositions[index];
      const effPos = manualPos || hero.default_position || 3;
      slotBtn.classList.add('is-filled-enemy');
      slotBtn.title = t('enemySlotFilledTitle', { name: hero.name_en, posLabel: getPosRoleLabel(effPos) });

      const img = document.createElement('img');
      img.className = 'hero-slot-img';
      img.src = hero.img;
      img.alt = hero.name_en;
      img.loading = 'lazy';

      const posBadge = createSlotPositionBadge({
        hero,
        manualPos,
        onCycle: async () => {
          state.enemySlotPositions[index] = cyclePositionValue(state.enemySlotPositions[index]);
          renderSlots();
          await runDraftAnalysis();
        },
        onReset: async () => {
          state.enemySlotPositions[index] = null;
          renderSlots();
          await runDraftAnalysis();
        }
      });

      const nameSpan = document.createElement('span');
      nameSpan.className = 'hero-slot-name';
      nameSpan.textContent = hero.name_en;

      const removeBadge = document.createElement('span');
      removeBadge.className = 'hero-slot-remove';
      removeBadge.innerHTML = '<i class="bi bi-x"></i>';

      slotBtn.appendChild(img);
      slotBtn.appendChild(posBadge);
      slotBtn.appendChild(nameSpan);
      slotBtn.appendChild(removeBadge);
      slotBtn.addEventListener('click', () => removeEnemyFromSlot(index));
    } else {
      if (state.enemyDropdownOpen && state.activeEnemySlot === index) {
        slotBtn.classList.add('is-active-slot');
      }
      slotBtn.title = t('enemySlotEmptyTitle', { slot: index + 1 });

      const plusIcon = document.createElement('i');
      plusIcon.className = 'bi bi-plus-lg';
      const numLabel = document.createElement('span');
      numLabel.className = 'hero-slot-empty-num';
      numLabel.textContent = `${index + 1}`;

      slotBtn.appendChild(plusIcon);
      slotBtn.appendChild(numLabel);
      slotBtn.addEventListener('click', () => {
        state.activeEnemySlot = index;
        renderSlots();
        openEnemyAutocomplete(dom.searchInput.value);
        dom.searchInput.focus();
      });
    }

    dom.enemySlots.appendChild(slotBtn);
  });

  updateResetButtonState();
}

function renderSpottedEnemyItems() {
  const keys = state.detectedEnemyItems;
  dom.spottedItemsCount.textContent = String(keys.length);
  dom.spottedItemsList.innerHTML = '';

  if (keys.length === 0) {
    dom.spottedItemsList.classList.add('d-none');
  } else {
    for (const key of keys) {
      const meta = state.triggerItemsMeta[key] || state.counterItemsMeta[key] || { key, name_en: key, img: '' };
      const chip = document.createElement('span');
      chip.className = 'spotted-item-chip';
      chip.title = t('spottedItemRemoveTitle', { name: meta.name_en });

      if (meta.img) {
        const img = document.createElement('img');
        img.className = 'spotted-item-img';
        img.src = meta.img;
        img.alt = meta.name_en;
        chip.appendChild(img);
      }

      const label = document.createElement('span');
      label.textContent = meta.name_en;
      const rm = document.createElement('i');
      rm.className = 'bi bi-x';
      chip.appendChild(label);
      chip.appendChild(rm);

      chip.addEventListener('click', async () => {
        state.detectedEnemyItems = state.detectedEnemyItems.filter((k) => k !== key);
        renderSpottedEnemyItems();
        await runDraftAnalysis();
      });

      dom.spottedItemsList.appendChild(chip);
    }
    dom.spottedItemsList.classList.remove('d-none');
  }

  updateResetButtonState();
}

function renderEnemyItemPicker() {
  if (!state.enemyItemPickerOpen) {
    dom.enemyItemPicker.classList.add('d-none');
    dom.enemyItemPicker.innerHTML = '';
    return;
  }

  dom.enemyItemPicker.innerHTML = '';
  const allTriggers = Object.values(state.triggerItemsMeta || {});
  for (const item of allTriggers) {
    const isAdded = state.detectedEnemyItems.includes(item.key);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'autocomplete-item';
    if (isAdded) btn.classList.add('is-picked');

    if (item.img) {
      const img = document.createElement('img');
      img.className = 'spotted-item-img';
      img.src = item.img;
      img.alt = item.name_en;
      btn.appendChild(img);
    }

    const name = document.createElement('span');
    name.className = 'flex-grow-1 small text-truncate';
    name.textContent = item.name_en;
    btn.appendChild(name);

    if (isAdded) {
      const check = document.createElement('i');
      check.className = 'bi bi-check text-info';
      btn.appendChild(check);
    }

    btn.addEventListener('mousedown', async (e) => {
      e.preventDefault();
      if (isAdded) {
        state.detectedEnemyItems = state.detectedEnemyItems.filter((k) => k !== item.key);
      } else {
        state.detectedEnemyItems = [...state.detectedEnemyItems, item.key];
      }
      state.enemyItemPickerOpen = false;
      renderEnemyItemPicker();
      renderSpottedEnemyItems();
      await runDraftAnalysis();
    });

    dom.enemyItemPicker.appendChild(btn);
  }
  dom.enemyItemPicker.classList.remove('d-none');
}

function getHeroLocalizedRoleSummary(hero) {
  if (!hero) return '';
  if (state.language === 'ru' && hero.primary_role_ru) return hero.primary_role_ru;
  if (state.language === 'en' && hero.primary_role_en) return hero.primary_role_en;
  if (state.language === 'uk' && hero.primary_role_uk) return hero.primary_role_uk;
  return (hero.roles || []).slice(0, 3).join(' · ') || (hero.primary_attr || '').toUpperCase();
}

function buildHeroDropdownItems({ container, results, highlightedIndex, disabledIdsSet, fullBannerText, onPick }) {
  container.innerHTML = '';

  if (fullBannerText) {
    const fullBanner = document.createElement('div');
    fullBanner.className = 'px-2 py-1 small text-warning border-bottom border-secondary-subtle';
    fullBanner.textContent = fullBannerText;
    container.appendChild(fullBanner);
  }

  if (results.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'p-2 small text-secondary text-center';
    empty.textContent = t('heroNotFound');
    container.appendChild(empty);
    container.classList.remove('d-none');
    return;
  }

  results.forEach((hero, index) => {
    const isPicked = disabledIdsSet.has(hero.id);
    const isDisabled = isPicked || Boolean(fullBannerText);

    const itemBtn = document.createElement('button');
    itemBtn.type = 'button';
    itemBtn.className = 'autocomplete-item';
    if (index === highlightedIndex) itemBtn.classList.add('is-highlighted');
    if (isDisabled) itemBtn.classList.add('is-picked');

    const img = document.createElement('img');
    img.className = 'autocomplete-hero-img';
    img.src = hero.img;
    img.alt = hero.name_en;

    const infoWrap = document.createElement('div');
    infoWrap.className = 'flex-grow-1 min-w-0';

    const titleLine = document.createElement('div');
    titleLine.className = 'fw-semibold text-truncate';
    titleLine.textContent = hero.name_en;

    const metaLine = document.createElement('div');
    metaLine.className = 'autocomplete-hero-meta text-truncate';
    metaLine.textContent = getHeroLocalizedRoleSummary(hero);

    infoWrap.appendChild(titleLine);
    infoWrap.appendChild(metaLine);
    itemBtn.appendChild(img);
    itemBtn.appendChild(infoWrap);

    if (isPicked) {
      const badge = document.createElement('span');
      badge.className = 'badge text-bg-secondary';
      badge.textContent = t('pickedBadge');
      itemBtn.appendChild(badge);
    }

    itemBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!isDisabled) onPick(hero.id);
    });

    container.appendChild(itemBtn);
  });

  const highlightedEl = container.querySelector('.autocomplete-item.is-highlighted');
  if (highlightedEl) highlightedEl.scrollIntoView({ block: 'nearest' });

  container.classList.remove('d-none');
}

function getAllDisabledForAllies() {
  const set = new Set([...getSelectedAllyIds(), ...getSelectedEnemyIds()]);
  if (state.myHeroId) set.add(state.myHeroId);
  return set;
}

function getAllDisabledForEnemies() {
  const set = new Set([...getSelectedEnemyIds(), ...getSelectedAllyIds()]);
  if (state.myHeroId) set.add(state.myHeroId);
  return set;
}

function renderEnemyDropdown() {
  if (!state.enemyDropdownOpen) {
    dom.dropdown.classList.add('d-none');
    dom.dropdown.innerHTML = '';
    return;
  }

  const fullBannerText =
    getSelectedEnemyIds().length >= MAX_ENEMY_SLOTS
      ? t('enemySlotsFullBanner')
      : null;

  buildHeroDropdownItems({
    container: dom.dropdown,
    results: state.enemyResults,
    highlightedIndex: state.enemyHighlightedIndex,
    disabledIdsSet: getAllDisabledForEnemies(),
    fullBannerText,
    onPick: selectEnemyHero
  });
}

function renderAllyDropdown() {
  if (!state.allyDropdownOpen) {
    dom.allyDropdown.classList.add('d-none');
    dom.allyDropdown.innerHTML = '';
    return;
  }

  const fullBannerText =
    getSelectedAllyIds().length >= MAX_ALLY_SLOTS
      ? t('allySlotsFullBanner')
      : null;

  buildHeroDropdownItems({
    container: dom.allyDropdown,
    results: state.allyResults,
    highlightedIndex: state.allyHighlightedIndex,
    disabledIdsSet: getAllDisabledForAllies(),
    fullBannerText,
    onPick: selectAllyHero
  });
}

function renderMyHeroDropdown() {
  if (!state.myHeroDropdownOpen) {
    dom.myHeroDropdown.classList.add('d-none');
    dom.myHeroDropdown.innerHTML = '';
    return;
  }

  buildHeroDropdownItems({
    container: dom.myHeroDropdown,
    results: state.myHeroResults,
    highlightedIndex: state.myHeroHighlightedIndex,
    disabledIdsSet: new Set([...getSelectedEnemyIds(), ...getSelectedAllyIds()]),
    fullBannerText: null,
    onPick: selectMyHero
  });
}

function closeAllPopups() {
  state.enemyDropdownOpen = false;
  state.allyDropdownOpen = false;
  state.myHeroDropdownOpen = false;
  state.enemyItemPickerOpen = false;
  renderSlots();
  renderAllyPanel();
  renderEnemyDropdown();
  renderAllyDropdown();
  renderMyHeroDropdown();
  renderEnemyItemPicker();
}

function openEnemyAutocomplete(query = '') {
  closeAllPopups();
  state.enemyResults = searchHeroes(query);
  state.enemyHighlightedIndex = 0;
  state.enemyDropdownOpen = true;
  renderEnemyDropdown();
}

function openAllyAutocomplete(query = '') {
  closeAllPopups();
  state.allyResults = searchHeroes(query);
  state.allyHighlightedIndex = 0;
  state.allyDropdownOpen = true;
  renderAllyDropdown();
}

function openMyHeroAutocomplete(query = '') {
  closeAllPopups();
  state.myHeroResults = searchHeroes(query);
  state.myHeroHighlightedIndex = 0;
  state.myHeroDropdownOpen = true;
  renderMyHeroDropdown();
}

async function selectMyHero(heroId) {
  state.myHeroId = heroId;
  state.myHeroFromGsi = false;
  dom.myHeroInput.value = '';
  closeAllPopups();
  renderMyHeroPanel();
  await runDraftAnalysis();
}

async function clearMyHero() {
  state.myHeroId = null;
  state.myHeroFromGsi = false;
  dom.myHeroInput.value = '';
  renderMyHeroPanel();
  await runDraftAnalysis();
}

async function selectAllyHero(heroId) {
  if (state.selectedAllySlots.includes(heroId)) return;

  let targetSlot = state.activeAllySlot;
  if (targetSlot < 0 || targetSlot >= MAX_ALLY_SLOTS || state.selectedAllySlots[targetSlot] !== null) {
    targetSlot = getFirstEmptyIndex(state.selectedAllySlots);
  }
  if (targetSlot === -1) return;

  state.selectedAllySlots[targetSlot] = heroId;
  state.allySlotPositions[targetSlot] = null;
  const nextEmpty = getFirstEmptyIndex(state.selectedAllySlots);
  state.activeAllySlot = nextEmpty !== -1 ? nextEmpty : 0;

  dom.allySearchInput.value = '';
  state.allyDropdownOpen = false;
  renderAllyPanel();
  renderAllyDropdown();
  await runDraftAnalysis();
}

async function removeAllyFromSlot(slotIndex) {
  state.selectedAllySlots[slotIndex] = null;
  state.allySlotPositions[slotIndex] = null;
  state.activeAllySlot = slotIndex;
  renderAllyPanel();
  await runDraftAnalysis();
}

async function selectEnemyHero(heroId) {
  if (state.selectedEnemySlots.includes(heroId)) return;

  let targetSlot = state.activeEnemySlot;
  if (targetSlot < 0 || targetSlot >= MAX_ENEMY_SLOTS || state.selectedEnemySlots[targetSlot] !== null) {
    targetSlot = getFirstEmptyIndex(state.selectedEnemySlots);
  }
  if (targetSlot === -1) return;

  state.selectedEnemySlots[targetSlot] = heroId;
  state.enemySlotPositions[targetSlot] = null;
  const nextEmpty = getFirstEmptyIndex(state.selectedEnemySlots);
  state.activeEnemySlot = nextEmpty !== -1 ? nextEmpty : 0;

  dom.searchInput.value = '';
  dom.btnClearSearch.classList.add('d-none');
  state.enemyDropdownOpen = false;

  renderSlots();
  renderEnemyDropdown();
  await runDraftAnalysis();

  if (nextEmpty !== -1) dom.searchInput.focus();
}

async function removeEnemyFromSlot(slotIndex) {
  state.selectedEnemySlots[slotIndex] = null;
  state.enemySlotPositions[slotIndex] = null;
  state.activeEnemySlot = slotIndex;
  renderSlots();
  await runDraftAnalysis();
  dom.searchInput.focus();
}

async function resetDraft() {
  state.selectedEnemySlots = Array(MAX_ENEMY_SLOTS).fill(null);
  state.enemySlotPositions = Array(MAX_ENEMY_SLOTS).fill(null);
  state.activeEnemySlot = 0;
  state.selectedAllySlots = Array(MAX_ALLY_SLOTS).fill(null);
  state.allySlotPositions = Array(MAX_ALLY_SLOTS).fill(null);
  state.activeAllySlot = 0;
  state.myHeroId = null;
  state.myHeroFromGsi = false;
  state.myPosition = null;
  state.ownedItemKeys = [];
  state.ownedItemsDetails = [];
  state.hasAghanimsScepter = false;
  state.hasAghanimsShard = false;
  state.gsiSimulated = false;
  state.gsiClockTime = null;
  state.detectedEnemyItems = [];
  state.showAllRecommendations = false;
  state.lastAnalysis = null;
  dom.visionStatusText.textContent = '';
  renderPhaseStrip();

  dom.searchInput.value = '';
  dom.allySearchInput.value = '';
  dom.myHeroInput.value = '';
  dom.btnClearSearch.classList.add('d-none');

  closeAllPopups();
  renderMyHeroPanel();
  renderAllyPanel();
  renderSlots();
  renderSpottedEnemyItems();
  await window.overlayApi.clearGsi();
  await runDraftAnalysis();
}

function formatClockTime(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds))) return '';
  const total = Math.max(0, Math.floor(Number(seconds)));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function renderPhaseStrip(effectivePhase = null) {
  if (dom.matchPhaseButtons) {
    dom.matchPhaseButtons.querySelectorAll('.phase-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.phase === state.matchPhase);
    });
  }
  if (dom.matchClockBadge) {
    if (state.gsiClockTime != null) {
      const phaseLabel = effectivePhase && effectivePhase !== 'auto' ? ` · ${effectivePhase.toUpperCase()}` : '';
      dom.matchClockBadge.textContent = `${formatClockTime(state.gsiClockTime)}${phaseLabel}`;
    } else if (effectivePhase && effectivePhase !== 'auto') {
      const labels = {
        early: t('phaseEarlyLabel'),
        mid: t('phaseMidLabel'),
        late: t('phaseLateLabel')
      };
      dom.matchClockBadge.textContent = labels[effectivePhase] || '';
    } else {
      dom.matchClockBadge.textContent = '';
    }
  }
}

function renderCounterPickHeroes(counterPickHeroes) {
  if (!dom.counterPicksBar) return;
  if (!counterPickHeroes || counterPickHeroes.length === 0 || state.myHeroId !== null) {
    dom.counterPicksBar.classList.add('d-none');
    dom.counterPicksBar.innerHTML = '';
    return;
  }

  dom.counterPicksBar.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'small text-success-emphasis fw-semibold me-1';
  label.textContent = t('counterPickLabel');
  dom.counterPicksBar.appendChild(label);

  for (const ch of counterPickHeroes) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'counter-pick-chip';
    btn.title = t('counterPickChipTitle', { reason: ch.reasonUk });

    const img = document.createElement('img');
    img.className = 'target-hero-mini-icon';
    img.src = ch.icon || ch.img;
    img.alt = ch.name_en;

    const name = document.createElement('span');
    name.textContent = ch.name_en;

    btn.appendChild(img);
    btn.appendChild(name);
    btn.addEventListener('click', () => selectMyHero(ch.id));
    dom.counterPicksBar.appendChild(btn);
  }

  dom.counterPicksBar.classList.remove('d-none');
}

function renderNeutralItemsBar(neutralRecommendations) {
  if (!dom.neutralItemsBar) return;
  if (!neutralRecommendations || neutralRecommendations.length === 0) {
    dom.neutralItemsBar.classList.add('d-none');
    dom.neutralItemsBar.innerHTML = '';
    return;
  }

  dom.neutralItemsBar.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'd-flex align-items-center justify-content-between mb-1';
  const title = document.createElement('span');
  title.className = 'small text-warning fw-semibold';
  title.innerHTML = `<i class="bi bi-gem me-1"></i>${t('neutralItemsTitle')}`;
  header.appendChild(title);
  dom.neutralItemsBar.appendChild(header);

  const wrap = document.createElement('div');
  wrap.className = 'd-flex flex-wrap gap-1';

  for (const nr of neutralRecommendations) {
    const chip = document.createElement('span');
    chip.className = 'neutral-chip';
    chip.title = `Tier ${nr.tier}: ${nr.reasonUk}`;

    if (nr.img) {
      const img = document.createElement('img');
      img.className = 'neutral-chip-img';
      img.src = nr.img;
      img.alt = nr.nameEn;
      chip.appendChild(img);
    }

    const txt = document.createElement('span');
    txt.textContent = `T${nr.tier} ${nr.nameEn}`;
    chip.appendChild(txt);

    chip.addEventListener('click', () => {
      dom.contextNoticeBar.textContent = `Tier ${nr.tier} ${nr.nameEn}: ${nr.reasonUk}`;
      dom.contextNoticeBar.classList.remove('d-none');
    });

    wrap.appendChild(chip);
  }

  dom.neutralItemsBar.appendChild(wrap);
  dom.neutralItemsBar.classList.remove('d-none');
}

function getMiniPhaseCaption(effectivePhase) {
  const phaseMap = {
    early: 'Early 0–15',
    mid: 'Mid 15–30',
    late: 'Late 30+',
    auto: t('autoShort')
  };
  const label = phaseMap[effectivePhase] || phaseMap[state.matchPhase] || t('autoShort');
  return state.gsiClockTime != null ? `${formatClockTime(state.gsiClockTime)} · ${label}` : label;
}

function renderMiniHudStrip() {
  if (!dom.miniHudStrip || !dom.miniItemsRow) return;

  const analysis = state.lastAnalysis;
  const recs = analysis && Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  const effectivePhase = (analysis && analysis.effectivePhase) || state.matchPhase || 'auto';

  if (dom.miniPhaseLabel) {
    dom.miniPhaseLabel.textContent = getMiniPhaseCaption(effectivePhase);
  }

  dom.miniItemsRow.innerHTML = '';

  if (recs.length === 0) {
    if (dom.miniHudHint) dom.miniHudHint.textContent = t('miniNoPick');
    const wrap = document.createElement('div');
    wrap.className = 'mini-empty-wrap';

    const label = document.createElement('span');
    label.className = 'text-truncate';
    label.textContent = t('miniEmptyHint');
    wrap.appendChild(label);

    const actions = document.createElement('div');
    actions.className = 'd-flex align-items-center gap-1 flex-shrink-0';

    const scanBtn = document.createElement('button');
    scanBtn.type = 'button';
    scanBtn.className = 'btn btn-outline-primary btn-header-compact';
    scanBtn.textContent = 'Alt+S';
    scanBtn.title = t('scanDraftTitle');
    scanBtn.addEventListener('click', () => dom.btnScanDraft && dom.btnScanDraft.click());

    const expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'btn btn-outline-secondary btn-header-compact';
    expandBtn.textContent = t('miniExpandBtn');
    expandBtn.addEventListener('click', () => dom.btnMiniMode && dom.btnMiniMode.click());

    actions.appendChild(scanBtn);
    actions.appendChild(expandBtn);
    wrap.appendChild(actions);
    dom.miniItemsRow.appendChild(wrap);
    return;
  }

  const unownedRecs = recs.filter((r) => !r.isOwned);
  const topItems = (unownedRecs.length > 0 ? unownedRecs : recs).slice(0, 5);

  if (dom.miniHudHint) {
    const enemyNames = (analysis.selectedHeroes || []).map((h) => h.name_en).slice(0, 3).join(', ');
    dom.miniHudHint.textContent = enemyNames
      ? t('miniTopAgainst', { count: topItems.length, enemies: enemyNames })
      : t('miniTopPhase', { count: topItems.length });
  }

  for (const rec of topItems) {
    const tile = document.createElement('div');
    tile.className = `mini-item-tile priority-${rec.priorityKey}`;

    const targetList = (rec.targetHeroes || []).map((tHero) => tHero.name_en).join(', ');
    const tooltipLines = [
      `${rec.nameEn}${rec.cost > 0 ? ` (${rec.cost}g)` : ''} — ${rec.priorityLabelUk}`,
      rec.timingLabelUk ? `${t('timingWord')}: ${rec.timingLabelUk}` : '',
      targetList ? `${t('againstWord')}: ${targetList}` : '',
      rec.enemyItemBadgeUk || '',
      rec.whyBuildUk || ''
    ].filter(Boolean);
    tile.title = tooltipLines.join('\n');

    if (rec.enemyItemBadgeUk) {
      const dot = document.createElement('span');
      dot.className = 'mini-trigger-dot';
      tile.appendChild(dot);
    }

    const img = document.createElement('img');
    img.className = 'mini-item-img';
    img.src = rec.img;
    img.alt = rec.nameEn;

    const cap = document.createElement('span');
    cap.className = 'mini-item-caption';
    cap.textContent = rec.cost > 0 ? `${rec.cost}g` : rec.nameEn;

    tile.appendChild(img);
    tile.appendChild(cap);
    dom.miniItemsRow.appendChild(tile);
  }
}

function renderEmptyRecommendations() {
  state.lastAnalysis = null;
  if (dom.counterPicksBar) {
    dom.counterPicksBar.classList.add('d-none');
    dom.counterPicksBar.innerHTML = '';
  }
  if (dom.neutralItemsBar) {
    dom.neutralItemsBar.classList.add('d-none');
    dom.neutralItemsBar.innerHTML = '';
  }
  renderPhaseStrip(state.matchPhase);
  dom.threatsBar.classList.add('d-none');
  dom.threatsBar.innerHTML = '';
  dom.contextNoticeBar.classList.add('d-none');
  dom.contextNoticeBar.textContent = '';
  dom.itemsCountText.textContent = '';

  dom.recommendationsList.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'empty-state-card mt-1';

  const icon = document.createElement('i');
  icon.className = 'bi bi-crosshair text-warning fs-5 d-block mb-1';

  const title = document.createElement('div');
  title.className = 'fw-semibold mb-1';
  title.textContent = t('emptyRecsTitle');

  const desc = document.createElement('p');
  desc.className = 'small text-secondary mb-0';
  desc.textContent = state.devToolsVisible ? t('emptyRecsDescDev') : t('emptyRecsDescProd');

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(desc);
  dom.recommendationsList.appendChild(card);
  renderMiniHudStrip();
}

function renderThreatsBar(detectedThreats, allySynergySummary) {
  const hasThreats = detectedThreats && detectedThreats.length > 0;
  const hasSynergy = allySynergySummary && allySynergySummary.length > 0;

  if (!hasThreats && !hasSynergy) {
    dom.threatsBar.classList.add('d-none');
    dom.threatsBar.innerHTML = '';
    return;
  }

  dom.threatsBar.innerHTML = '';
  if (hasThreats) {
    const label = document.createElement('span');
    label.className = 'small text-secondary me-1';
    label.textContent = t('threatsLabel');
    dom.threatsBar.appendChild(label);

    detectedThreats.slice(0, 4).forEach((threat) => {
      const pill = document.createElement('span');
      pill.className = 'threat-pill';
      if (threat.count >= 2) pill.classList.add('is-multi');
      pill.textContent = threat.count > 1 ? `${threat.labelUk} ×${threat.count}` : threat.labelUk;
      pill.title = threat.heroes.map((h) => h.name_en).join(', ');
      dom.threatsBar.appendChild(pill);
    });
  }

  if (hasSynergy) {
    for (const txt of allySynergySummary) {
      const pill = document.createElement('span');
      pill.className = 'threat-pill border-success text-success-emphasis';
      pill.textContent = txt;
      dom.threatsBar.appendChild(pill);
    }
  }

  dom.threatsBar.classList.remove('d-none');
}

function renderContextNotices(analysis) {
  const notices = [];
  if (analysis.flexAdaptation && analysis.flexAdaptation.active) {
    notices.push(analysis.flexAdaptation.noteUk);
  }
  const suppressed = analysis.suppressedItems || [];
  if (suppressed.length > 0 && analysis.myHero && !analysis.flexAdaptation) {
    notices.push(t('suppressedNotice', {
      hero: analysis.myHero.name_en,
      items: suppressed.map((s) => s.nameEn).join(', ')
    }));
  }

  if (notices.length === 0) {
    dom.contextNoticeBar.classList.add('d-none');
    dom.contextNoticeBar.textContent = '';
    return;
  }

  dom.contextNoticeBar.textContent = notices.join(' · ');
  dom.contextNoticeBar.classList.remove('d-none');
}

function renderRecommendationCards(analysis) {
  const {
    selectedHeroes,
    detectedThreats,
    allySynergySummary,
    counterPickHeroes,
    neutralRecommendations,
    effectivePhase,
    recommendations
  } = analysis;
  state.lastAnalysis = analysis;

  if ((!selectedHeroes || selectedHeroes.length === 0) && state.detectedEnemyItems.length === 0) {
    renderEmptyRecommendations();
    return;
  }

  renderPhaseStrip(effectivePhase);
  renderCounterPickHeroes(counterPickHeroes);
  renderThreatsBar(detectedThreats, allySynergySummary);
  renderContextNotices(analysis);
  renderNeutralItemsBar(neutralRecommendations);
  renderMiniHudStrip();

  dom.recommendationsList.innerHTML = '';

  if (recommendations.length === 0) {
    dom.itemsCountText.textContent = t('recsCountZero');
    const empty = document.createElement('div');
    empty.className = 'empty-state-card';
    empty.textContent = t('noSpecificCounters');
    dom.recommendationsList.appendChild(empty);
    return;
  }

  const totalCount = recommendations.length;
  const hasOverflow = totalCount > PRIMARY_RECOMMENDATIONS_LIMIT;
  const visibleRecommendations =
    hasOverflow && !state.showAllRecommendations
      ? recommendations.slice(0, PRIMARY_RECOMMENDATIONS_LIMIT)
      : recommendations;
  const hiddenCount = totalCount - visibleRecommendations.length;

  dom.itemsCountText.textContent =
    hiddenCount > 0
      ? t('recsTopOfTotal', { top: visibleRecommendations.length, total: totalCount })
      : t('recsTotalCount', { total: totalCount });

  for (const rec of visibleRecommendations) {
    const card = document.createElement('article');
    card.className = `counter-card priority-${rec.priorityKey}`;
    if (rec.isOffRole) card.classList.add('is-offrole');
    if (rec.isOwned) card.classList.add('is-owned');

    const topRow = document.createElement('div');
    topRow.className = 'd-flex align-items-start gap-2';

    const itemImg = document.createElement('img');
    itemImg.className = 'counter-item-img';
    itemImg.src = rec.img;
    itemImg.alt = rec.nameEn;

    const titleCol = document.createElement('div');
    titleCol.className = 'flex-grow-1 min-w-0';

    const nameRow = document.createElement('div');
    nameRow.className = 'd-flex align-items-center justify-content-between gap-1 flex-wrap';

    const itemTitle = document.createElement('span');
    itemTitle.className = 'counter-item-title text-truncate';
    itemTitle.textContent = rec.nameEn;

    const badgesWrap = document.createElement('div');
    badgesWrap.className = 'd-flex align-items-center gap-1 flex-wrap';

    if (rec.isOwned) {
      const ownedBadge = document.createElement('span');
      ownedBadge.className = 'badge counter-priority-badge text-bg-success';
      ownedBadge.textContent = t('ownedBadge');
      badgesWrap.appendChild(ownedBadge);
    }

    if (rec.enemyItemBadgeUk) {
      const triggerBadge = document.createElement('span');
      triggerBadge.className = 'badge counter-priority-badge badge-enemy-trigger';
      triggerBadge.textContent = rec.enemyItemBadgeUk;
      badgesWrap.appendChild(triggerBadge);
    }

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge counter-priority-badge ${rec.priorityBadgeClass}`;
    priorityBadge.textContent = rec.priorityLabelUk;
    badgesWrap.appendChild(priorityBadge);

    nameRow.appendChild(itemTitle);
    nameRow.appendChild(badgesWrap);

    const subRow = document.createElement('div');
    subRow.className = 'd-flex align-items-center gap-1 mt-1 flex-wrap';

    if (rec.cost > 0) {
      const costSpan = document.createElement('span');
      costSpan.className = 'counter-item-cost';
      costSpan.textContent = `${rec.cost}g`;
      subRow.appendChild(costSpan);
    }

    if (rec.timingLabelUk) {
      const timeBadge = document.createElement('span');
      timeBadge.className = 'badge counter-priority-badge text-bg-dark border border-secondary-subtle text-info-emphasis';
      timeBadge.textContent = rec.timingLabelUk;
      subRow.appendChild(timeBadge);
    }

    if (rec.positionBadgeUk) {
      const posBadge = document.createElement('span');
      posBadge.className = `badge counter-priority-badge ${rec.positionBadgeClass}`;
      posBadge.textContent = rec.positionBadgeUk;
      subRow.appendChild(posBadge);
    } else if (rec.roleHintUk) {
      const roleSpan = document.createElement('span');
      roleSpan.className = 'counter-role-hint text-truncate';
      roleSpan.textContent = rec.roleHintUk;
      subRow.appendChild(roleSpan);
    }

    if (rec.allySynergyBadgeUk) {
      const synBadge = document.createElement('span');
      synBadge.className = 'badge counter-priority-badge text-bg-primary';
      synBadge.textContent = rec.allySynergyBadgeUk;
      subRow.appendChild(synBadge);
    }

    if (rec.allyAuraNoteUk) {
      const auraBadge = document.createElement('span');
      auraBadge.className = 'badge counter-priority-badge text-bg-dark border border-warning text-warning';
      auraBadge.textContent = rec.allyAuraNoteUk;
      subRow.appendChild(auraBadge);
    }

    titleCol.appendChild(nameRow);
    titleCol.appendChild(subRow);
    topRow.appendChild(itemImg);
    topRow.appendChild(titleCol);
    card.appendChild(topRow);

    if (rec.targetHeroes && rec.targetHeroes.length > 0) {
      const targetsRow = document.createElement('div');
      targetsRow.className = 'counter-targets-row';

      const targetsLabel = document.createElement('span');
      targetsLabel.className = 'counter-targets-label';
      targetsLabel.textContent = t('againstLabel');
      targetsRow.appendChild(targetsLabel);

      for (const target of rec.targetHeroes) {
        const chip = document.createElement('span');
        chip.className = 'target-hero-chip';
        chip.title = target.position
          ? `${target.name_en} (${getPosRoleLabel(target.position)})`
          : target.name_en;

        const miniImg = document.createElement('img');
        miniImg.className = 'target-hero-mini-icon';
        miniImg.src = target.icon || target.img;
        miniImg.alt = target.name_en;

        const heroName = document.createElement('span');
        heroName.textContent = target.name_en;

        chip.appendChild(miniImg);
        chip.appendChild(heroName);
        targetsRow.appendChild(chip);
      }

      card.appendChild(targetsRow);
    }

    const whyText = document.createElement('p');
    whyText.className = 'counter-why-text';
    whyText.textContent = rec.whyBuildUk;
    card.appendChild(whyText);

    dom.recommendationsList.appendChild(card);
  }

  if (hasOverflow) {
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.id = 'btn-toggle-more-cards';
    toggleBtn.className = 'btn btn-sm btn-outline-secondary w-100 py-1';
    toggleBtn.textContent = state.showAllRecommendations
      ? t('collapseTopBtn', { limit: PRIMARY_RECOMMENDATIONS_LIMIT })
      : t('showMoreBtn', { count: hiddenCount });
    toggleBtn.addEventListener('click', () => {
      state.showAllRecommendations = !state.showAllRecommendations;
      renderRecommendationCards(state.lastAnalysis);
    });
    dom.recommendationsList.appendChild(toggleBtn);
  }
}

async function runDraftAnalysis() {
  const heroIds = getSelectedEnemyIds();
  if (heroIds.length === 0 && state.detectedEnemyItems.length === 0) {
    renderEmptyRecommendations();
    return;
  }

  try {
    const analysis = await window.overlayApi.analyzeDraft({
      language: state.language,
      enemyHeroIds: heroIds,
      allyHeroIds: getSelectedAllyIds(),
      enemyPositions: getEnemyPositionsMap(),
      allyPositions: getAllyPositionsMap(),
      myHeroId: state.myHeroId,
      myPosition: state.myPosition,
      matchPhase: state.matchPhase,
      clockTime: state.gsiClockTime,
      ownedItemKeys: state.ownedItemKeys,
      hasAghanimsScepter: state.hasAghanimsScepter,
      hasAghanimsShard: state.hasAghanimsShard,
      detectedEnemyItems: state.detectedEnemyItems
    });
    renderRecommendationCards(analysis);
  } catch (err) {
    dom.recommendationsList.innerHTML = '';
    const errBox = document.createElement('div');
    errBox.className = 'alert alert-danger small mb-0';
    errBox.textContent = t('analysisError', { error: err.message });
    dom.recommendationsList.appendChild(errBox);
  }
}

async function applyGsiState(gsiState) {
  if (!gsiState) return;

  if (gsiState.isNewMatch) {
    const hadPreviousData =
      getSelectedEnemyIds().length > 0 ||
      getSelectedAllyIds().length > 0 ||
      state.detectedEnemyItems.length > 0 ||
      state.lastAnalysis !== null ||
      state.myHeroId !== null;

    state.selectedEnemySlots = Array(MAX_ENEMY_SLOTS).fill(null);
    state.enemySlotPositions = Array(MAX_ENEMY_SLOTS).fill(null);
    state.activeEnemySlot = 0;
    state.selectedAllySlots = Array(MAX_ALLY_SLOTS).fill(null);
    state.allySlotPositions = Array(MAX_ALLY_SLOTS).fill(null);
    state.activeAllySlot = 0;
    state.detectedEnemyItems = [];
    state.showAllRecommendations = false;
    state.lastAnalysis = null;
    state.myHeroId = null;
    state.myHeroFromGsi = false;
    state.ownedItemKeys = [];
    state.ownedItemsDetails = [];
    state.hasAghanimsScepter = false;
    state.hasAghanimsShard = false;

    if (dom.searchInput) dom.searchInput.value = '';
    if (dom.allySearchInput) dom.allySearchInput.value = '';
    if (dom.myHeroInput) dom.myHeroInput.value = '';
    if (dom.btnClearSearch) dom.btnClearSearch.classList.add('d-none');

    closeAllPopups();
    renderSpottedEnemyItems();

    if (dom.visionStatusText && hadPreviousData) {
      dom.visionStatusText.textContent = t('newMatchGsiReset');
    }
  }

  if (gsiState.hero && gsiState.hero.id) {
    state.myHeroId = gsiState.hero.id;
    state.myHeroFromGsi = true;
  }
  state.ownedItemKeys = Array.isArray(gsiState.ownedItemKeys) ? gsiState.ownedItemKeys : [];
  state.ownedItemsDetails = Array.isArray(gsiState.ownedItemsDetails) ? gsiState.ownedItemsDetails : [];
  state.hasAghanimsScepter = Boolean(gsiState.hasAghanimsScepter);
  state.hasAghanimsShard = Boolean(gsiState.hasAghanimsShard);
  state.gsiSimulated = Boolean(gsiState.isSimulated);
  state.gsiClockTime = typeof gsiState.clockTime === 'number' ? gsiState.clockTime : null;

  renderMyHeroPanel();
  renderPhaseStrip();
  await runDraftAnalysis();
}

async function applyVisionDraftResult(result) {
  if (!result) return;
  if (!result.ok) {
    dom.visionStatusText.textContent = resolveVisionErrorMessage(result);
    return;
  }

  const allies = (result.allies || []).slice(0, MAX_ALLY_SLOTS);
  const enemies = (result.enemies || []).slice(0, MAX_ENEMY_SLOTS);

  state.selectedAllySlots = Array(MAX_ALLY_SLOTS).fill(null);
  state.allySlotPositions = Array(MAX_ALLY_SLOTS).fill(null);
  allies.forEach((h, i) => {
    if (h && h.id) state.selectedAllySlots[i] = h.id;
  });

  state.selectedEnemySlots = Array(MAX_ENEMY_SLOTS).fill(null);
  state.enemySlotPositions = Array(MAX_ENEMY_SLOTS).fill(null);
  enemies.forEach((h, i) => {
    if (h && h.id) state.selectedEnemySlots[i] = h.id;
  });

  const profileLabel = result.profileUsed === 'draft' ? t('visionProfileDraft') : t('visionProfileMatch');
  dom.visionStatusText.textContent = result.isSimulated
    ? t('visionSimDraft', { allies: allies.length, enemies: enemies.length })
    : t('visionScanDraft', { profile: profileLabel, allies: allies.length, enemies: enemies.length });

  renderAllyPanel();
  renderSlots();
  await runDraftAnalysis();
}

async function applyVisionEnemyItemsResult(result, { ensurePaOnSim = false } = {}) {
  if (!result) return;
  if (!result.ok) {
    dom.visionStatusText.textContent = resolveVisionErrorMessage(result);
    return;
  }

  const keys = result.detectedTriggerKeys || [];
  for (const k of keys) {
    if (!state.detectedEnemyItems.includes(k)) {
      state.detectedEnemyItems.push(k);
    }
  }

  if (ensurePaOnSim && getSelectedEnemyIds().length === 0) {
    const pa = state.heroes.find((h) => h.key === 'phantom_assassin');
    if (pa) state.selectedEnemySlots[0] = pa.id;
    renderSlots();
  }

  dom.visionStatusText.textContent = result.isSimulated
    ? t('visionSimItems', { items: keys.join(', ') })
    : keys.length > 0
      ? t('visionScanItemsFound', { items: keys.join(', ') })
      : t('visionScanItemsNone');

  renderSpottedEnemyItems();
  await runDraftAnalysis();
}

function renderClickThroughState(isEnabled) {
  const active = Boolean(isEnabled);
  if (dom.overlayShell) dom.overlayShell.classList.toggle('is-click-through', active);
  if (dom.clickThroughBanner) dom.clickThroughBanner.classList.toggle('d-none', !active);
  if (dom.btnClickThrough) {
    dom.btnClickThrough.className = active
      ? 'btn btn-info btn-header-compact text-dark fw-semibold'
      : 'btn btn-header-quiet btn-header-compact';
  }
}

function renderMiniModeState(isMini) {
  const active = Boolean(isMini);
  state.miniMode = active;
  if (dom.overlayShell) dom.overlayShell.classList.toggle('is-mini-mode', active);
  if (dom.miniHudStrip) dom.miniHudStrip.classList.toggle('d-none', !active);
  if (dom.btnMiniMode) {
    dom.btnMiniMode.className = active
      ? 'btn btn-primary btn-header-icon'
      : 'btn btn-header-quiet btn-header-icon';
    dom.btnMiniMode.title = active
      ? t('miniModeExpandTitle')
      : t('miniModeCollapseTitle');
  }
  if (dom.btnMiniModeIcon) {
    dom.btnMiniModeIcon.className = active ? 'bi bi-arrows-expand' : 'bi bi-arrows-collapse';
  }
  if (active) {
    closeAllPopups();
    if (dom.gsiCfgDrawer) dom.gsiCfgDrawer.classList.add('d-none');
    if (dom.hudCalibrationDrawer) dom.hudCalibrationDrawer.classList.add('d-none');
    renderMiniHudStrip();
  }
}

async function applyWindowSettings(settings) {
  if (!settings) return;
  const prevLang = state.language;
  if (settings.language) {
    state.language = normalizeLanguage(settings.language);
  }

  renderClickThroughState(settings.clickThrough);
  renderMiniModeState(settings.miniMode);

  if (typeof settings.opacity === 'number' && dom.rangeOpacity && dom.opacityValueLabel) {
    const pct = Math.round(settings.opacity * 100);
    dom.rangeOpacity.value = String(pct);
    dom.opacityValueLabel.textContent = `${pct}%`;
  }

  if (typeof settings.alliesExpanded === 'boolean' && state.alliesExpanded !== settings.alliesExpanded) {
    state.alliesExpanded = settings.alliesExpanded;
    renderAllyPanel();
  }

  if (settings.matchPhase) {
    state.matchPhase = settings.matchPhase;
    renderPhaseStrip();
  }

  if (settings.visionCalibration) {
    state.visionCalibration = { ...settings.visionCalibration };
    renderCalibrationControls();
  }

  if (prevLang !== state.language) {
    applyUiLanguage();
    await runDraftAnalysis();
  }
}

function renderCalibrationControls() {
  const cal = state.visionCalibration || { mode: 'auto', offsetX: 0, offsetY: 0, scale: 1.0 };
  const labels = { auto: t('calModeAuto'), ingame: t('calModeIngame'), draft: t('calModeDraft') };
  if (dom.calProfileLabel) dom.calProfileLabel.textContent = labels[cal.mode] || t('calModeAuto');
  if (dom.inputCalX) dom.inputCalX.value = String(cal.offsetX || 0);
  if (dom.inputCalY) dom.inputCalY.value = String(cal.offsetY || 0);
  if (dom.inputCalScale) dom.inputCalScale.value = Number(cal.scale || 1).toFixed(2);
  if (dom.hudCalibrationDrawer) {
    dom.hudCalibrationDrawer.querySelectorAll('.cal-mode-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.calMode === cal.mode);
    });
  }
}

async function refreshCalibrationPreview() {
  if (!dom.btnCalPreview) return;
  dom.btnCalPreview.disabled = true;
  try {
    const res = await window.overlayApi.getCalibrationPreview();
    if (res && res.ok && res.previewDataUrl) {
      dom.calibrationPreviewImg.src = res.previewDataUrl;
      const profileName = res.activeProfile === 'draft' ? t('calModeDraft') : t('calModeIngame');
      dom.calPreviewHint.textContent = t('calPreviewHint', { res: res.screenResolution, profile: profileName });
      dom.calPreviewWrap.classList.remove('d-none');
    } else if (res && res.error) {
      dom.calPreviewHint.textContent = t('calPreviewError', { error: resolveVisionErrorMessage(res) });
      dom.calPreviewWrap.classList.remove('d-none');
    }
  } finally {
    dom.btnCalPreview.disabled = false;
  }
}

function renderDevToolsVisibility() {
  if (!dom.devToolsRow) return;
  dom.devToolsRow.classList.toggle('d-none', !state.devToolsVisible);
}

function toggleDevToolsPanel() {
  state.devToolsVisible = !state.devToolsVisible;
  renderDevToolsVisibility();
  window.overlayApi
    .getGsiStatus()
    .then((status) => renderGsiStatusDrawer(status))
    .catch(() => {});
  if (getSelectedEnemyIds().length === 0 && !state.lastAnalysis) {
    renderEmptyRecommendations();
  }
}

function getCfgLocalizedMessage(cfg) {
  if (!cfg) return '';
  if (state.language === 'ru' && cfg.messageRu) return cfg.messageRu;
  if (state.language === 'en' && cfg.messageEn) return cfg.messageEn;
  return cfg.messageUk || '';
}

function renderGsiStatusDrawer(gsiStatus) {
  if (!gsiStatus) return;
  state.lastGsiStatus = gsiStatus;

  const isListening = Boolean(gsiStatus.server && gsiStatus.server.listening);
  const dotaFound = Boolean(gsiStatus.cfg && gsiStatus.cfg.dotaFound);
  const cfgActive = Boolean(gsiStatus.cfg && (gsiStatus.cfg.active !== false));
  const hideDevLabels = Boolean(state.isPackaged && !state.devToolsVisible);

  if (gsiStatus.server) {
    const serverErrorMsg =
      gsiStatus.server.errorCode === 'EADDRINUSE'
        ? t('gsiPortBusy', { port: gsiStatus.server.port })
        : (gsiStatus.server.error || t('gsiDisabled'));
    const serverLabel = isListening
      ? `${gsiStatus.server.host}:${gsiStatus.server.port} (${t('gsiActive')})`
      : `${t('gsiError')}: ${serverErrorMsg}`;
    const dotaLabel = gsiStatus.cfg
      ? dotaFound
        ? t('dotaFound')
        : t('dotaNotFound')
      : '';
    dom.gsiServerStatus.textContent = dotaLabel ? `${serverLabel} · ${dotaLabel}` : serverLabel;
  }

  if (dom.gsiDebugBadge) {
    dom.gsiDebugBadge.classList.toggle('d-none', dotaFound || hideDevLabels);
  }

  const cfgMsg = getCfgLocalizedMessage(gsiStatus.cfg);
  if (gsiStatus.cfg) {
    dom.gsiCfgMessage.textContent = dotaFound
      ? cfgMsg
      : hideDevLabels
        ? (cfgMsg || t('dotaNotFoundStandalone'))
        : `${cfgMsg} ${t('dotaNotFoundDebugSuffix')}`;
    dom.gsiCfgPath.textContent = gsiStatus.cfg.cfgPath || '';
    dom.gsiCfgTargetHint.textContent = dotaFound
      ? t('cfgActiveInDota', { file: gsiStatus.cfg.cfgFilename || 'gamestate_integration_overlay.cfg' })
      : t('cfgTargetHint', { folder: gsiStatus.cfg.targetFolderHint });
  }

  if (dom.gsiFooterStatus) {
    if (!isListening) {
      dom.gsiFooterStatus.textContent = t('gsiFooterError');
      dom.gsiFooterStatus.className = 'gsi-footer-pill is-error';
    } else if (dotaFound && cfgActive) {
      dom.gsiFooterStatus.textContent = `GSI :${gsiStatus.server.port} · CFG OK`;
      dom.gsiFooterStatus.className = 'gsi-footer-pill is-ready';
    } else if (hideDevLabels) {
      dom.gsiFooterStatus.textContent = t('gsiFooterStandalone', { port: gsiStatus.server.port });
      dom.gsiFooterStatus.className = 'gsi-footer-pill is-fallback';
    } else {
      dom.gsiFooterStatus.textContent = t('gsiFooterDebug', { port: gsiStatus.server.port });
      dom.gsiFooterStatus.className = 'gsi-footer-pill is-fallback';
    }
    dom.gsiFooterStatus.title = dotaFound
      ? cfgMsg || t('gsiFooterTitleDota')
      : hideDevLabels
        ? t('gsiFooterTitleStandalone')
        : t('gsiFooterTitleDebug');
  }
}

function formatRuleReanalyzeReport(report) {
  if (!report || !report.ok) return t('reanalyzeError');
  const talentsPart = report.talentsAnalyzed
    ? t('reanalyzeTalentsPart', { count: report.talentsAnalyzed })
    : '';
  const neutralsPart = report.neutralRulesCount
    ? t('reanalyzeNeutralsPart', { count: report.neutralRulesCount })
    : '';
  return t('reanalyzeReport', {
    patch: report.patchTarget,
    heroes: report.heroesAnalyzed,
    abilities: report.abilitiesAnalyzed,
    talents: talentsPart,
    items: report.itemsAnalyzed,
    rules: report.itemRulesCount,
    neutrals: neutralsPart
  });
}

function applyGameData(payload) {
  if (!payload || !Array.isArray(payload.heroes)) return;

  state.heroes = payload.heroes;
  state.heroesById = new Map(payload.heroes.map((h) => [h.id, h]));
  state.counterItemsMeta = payload.counterItemsMeta || {};
  state.triggerItemsMeta = payload.triggerItemsMeta || {};
  state.lastGameMeta = payload.meta || null;

  if (dom.cacheStatusText && payload.meta) {
    const key = payload.meta.openDotaCached ? 'cacheStatusOd' : 'cacheStatusLocal';
    dom.cacheStatusText.textContent = t(key, { count: payload.meta.totalHeroes });
  }

  renderMyHeroPanel();
  renderAllyPanel();
  renderSlots();
  renderSpottedEnemyItems();
  if (state.enemyDropdownOpen) openEnemyAutocomplete(dom.searchInput.value);
  if (state.allyDropdownOpen) openAllyAutocomplete(dom.allySearchInput.value);
  if (state.myHeroDropdownOpen) openMyHeroAutocomplete(dom.myHeroInput.value);
  if (getSelectedEnemyIds().length > 0 || state.detectedEnemyItems.length > 0) runDraftAnalysis();
}

function bindEvents() {
  dom.btnHide.addEventListener('click', () => window.overlayApi.hideWindow());
  dom.btnClose.addEventListener('click', () => window.overlayApi.closeApp());
  dom.btnReset.addEventListener('click', resetDraft);
  dom.btnClearMyHero.addEventListener('click', clearMyHero);

  if (dom.langSwitcher) {
    dom.langSwitcher.addEventListener('click', async (e) => {
      const btn = e.target.closest('.lang-btn');
      if (!btn || !btn.dataset.lang) return;
      const nextLang = normalizeLanguage(btn.dataset.lang);
      if (nextLang === state.language) return;
      state.language = nextLang;
      applyUiLanguage();
      await window.overlayApi.updateSettings({ language: nextLang });
      await runDraftAnalysis();
    });
  }

  dom.btnClickThrough.addEventListener('click', async () => {
    const enabled = await window.overlayApi.toggleClickThrough();
    renderClickThroughState(enabled);
  });

  if (dom.btnMiniMode) {
    dom.btnMiniMode.addEventListener('click', async () => {
      const enabled = await window.overlayApi.toggleMiniMode();
      renderMiniModeState(enabled);
    });
  }

  dom.rangeOpacity.addEventListener('input', async (e) => {
    const pct = Number(e.target.value);
    dom.opacityValueLabel.textContent = `${pct}%`;
    await window.overlayApi.updateSettings({ opacity: pct / 100 });
  });

  dom.btnResetPos.addEventListener('click', async () => {
    await window.overlayApi.resetWindowPosition();
  });

  let patchClickTimer = null;
  dom.patchBadge.addEventListener('click', () => {
    if (patchClickTimer) clearTimeout(patchClickTimer);
    patchClickTimer = setTimeout(async () => {
      patchClickTimer = null;
      const status = await window.overlayApi.checkPatchUpdate();
      renderPatchBadge(status);
    }, 230);
  });
  dom.patchBadge.addEventListener('dblclick', () => {
    if (patchClickTimer) {
      clearTimeout(patchClickTimer);
      patchClickTimer = null;
    }
    toggleDevToolsPanel();
  });

  if (dom.appVersionText) {
    dom.appVersionText.addEventListener('dblclick', toggleDevToolsPanel);
  }
  if (dom.cacheStatusText) {
    dom.cacheStatusText.addEventListener('dblclick', toggleDevToolsPanel);
  }

  dom.btnUpdateDb.addEventListener('click', async () => {
    dom.btnUpdateDb.disabled = true;
    const updateIcon = dom.btnUpdateDb.querySelector('i');
    if (updateIcon) updateIcon.className = 'bi bi-hourglass-split';
    if (dom.lblUpdateDb) dom.lblUpdateDb.textContent = t('updatingDbBtn');
    try {
      const res = await window.overlayApi.applyPatchUpdate();
      if (res && res.ok) {
        if (res.refreshedGameData) applyGameData(res.refreshedGameData);
        if (res.status) renderPatchBadge(res.status);
        if (res.ruleReport) {
          const summaryMsg = formatRuleReanalyzeReport(res.ruleReport);
          if (dom.cacheStatusText) dom.cacheStatusText.textContent = summaryMsg;
          if (dom.visionStatusText) {
            dom.visionStatusText.textContent = t('dbUpdatedVision', { patch: res.ruleReport.patchTarget });
          }
          if (dom.reanalyzeReportText) {
            dom.reanalyzeReportText.textContent = summaryMsg;
            dom.reanalyzeReportText.classList.remove('d-none');
          }
        }
        await runDraftAnalysis();
      } else if (res && res.error && dom.visionStatusText) {
        const localizedErr = res.status && res.status.errorCode === 'PATCH_FETCH_FAILED'
          ? t('patchFetchFailed')
          : res.error;
        dom.visionStatusText.textContent = t('updateErrorVision', { error: localizedErr });
      }
    } finally {
      dom.btnUpdateDb.disabled = false;
      if (updateIcon) updateIcon.className = 'bi bi-arrow-repeat';
      if (dom.lblUpdateDb) dom.lblUpdateDb.textContent = t('updateDbBtn');
    }
  });

  if (dom.btnReanalyzeRules) {
    dom.btnReanalyzeRules.addEventListener('click', async () => {
      dom.btnReanalyzeRules.disabled = true;
      if (dom.lblReanalyzeRules) dom.lblReanalyzeRules.textContent = t('reanalyzingRulesBtn');
      try {
        const report = await window.overlayApi.reanalyzeRules();
        if (report && report.ok) {
          if (report.refreshedGameData) applyGameData(report.refreshedGameData);
          const summaryMsg = formatRuleReanalyzeReport(report);
          if (dom.cacheStatusText) dom.cacheStatusText.textContent = summaryMsg;
          if (dom.visionStatusText) {
            dom.visionStatusText.textContent = t('dbReanalyzedVision', { patch: report.patchTarget });
          }
          if (dom.reanalyzeReportText) {
            dom.reanalyzeReportText.textContent = summaryMsg;
            dom.reanalyzeReportText.classList.remove('d-none');
          }
          await runDraftAnalysis();
        }
      } catch (err) {
        if (dom.reanalyzeReportText) {
          dom.reanalyzeReportText.textContent = `${t('gsiError')}: ${err.message}`;
          dom.reanalyzeReportText.classList.remove('d-none');
        }
      } finally {
        dom.btnReanalyzeRules.disabled = false;
        if (dom.lblReanalyzeRules) dom.lblReanalyzeRules.textContent = t('reanalyzeRulesBtn');
      }
    });
  }

  const toggleGsiDrawer = async () => {
    const isHidden = dom.gsiCfgDrawer.classList.contains('d-none');
    dom.gsiCfgDrawer.classList.toggle('d-none', !isHidden);
    if (isHidden) {
      const status = await window.overlayApi.getGsiStatus();
      renderGsiStatusDrawer(status);
    }
  };

  dom.btnGsiCfg.addEventListener('click', toggleGsiDrawer);
  if (dom.gsiFooterStatus) {
    dom.gsiFooterStatus.addEventListener('click', toggleGsiDrawer);
  }

  dom.btnCloseCfg.addEventListener('click', () => dom.gsiCfgDrawer.classList.add('d-none'));

  dom.btnRegenCfg.addEventListener('click', async () => {
    await window.overlayApi.generateGsiCfg();
    const status = await window.overlayApi.getGsiStatus();
    renderGsiStatusDrawer(status);
  });

  dom.btnTestGsi.addEventListener('click', async () => {
    dom.btnTestGsi.disabled = true;
    try {
      const res = await window.overlayApi.simulateGsi();
      if (res && res.gsiState) await applyGsiState(res.gsiState);
    } finally {
      dom.btnTestGsi.disabled = false;
    }
  });

  dom.btnScanDraft.addEventListener('click', async () => {
    dom.btnScanDraft.disabled = true;
    try {
      const res = await window.overlayApi.scanDraft();
      await applyVisionDraftResult(res);
    } finally {
      dom.btnScanDraft.disabled = false;
    }
  });

  dom.btnTestAutodraft.addEventListener('click', async () => {
    const res = await window.overlayApi.simulateDraftScan();
    await applyVisionDraftResult(res);
  });

  dom.btnScanEnemyItems.addEventListener('click', async () => {
    dom.btnScanEnemyItems.disabled = true;
    try {
      const res = await window.overlayApi.scanEnemyInventory();
      await applyVisionEnemyItemsResult(res);
    } finally {
      dom.btnScanEnemyItems.disabled = false;
    }
  });

  dom.btnTestEnemyItems.addEventListener('click', async () => {
    const res = await window.overlayApi.simulateEnemyInventory();
    await applyVisionEnemyItemsResult(res, { ensurePaOnSim: true });
  });

  dom.btnHudCalibration.addEventListener('click', async () => {
    const isHidden = dom.hudCalibrationDrawer.classList.contains('d-none');
    dom.hudCalibrationDrawer.classList.toggle('d-none', !isHidden);
    if (isHidden) {
      renderCalibrationControls();
      await refreshCalibrationPreview();
    }
  });

  dom.btnCalClose.addEventListener('click', () => dom.hudCalibrationDrawer.classList.add('d-none'));
  dom.btnCalPreview.addEventListener('click', refreshCalibrationPreview);

  dom.btnCalReset.addEventListener('click', async () => {
    const updated = await window.overlayApi.updateSettings({
      visionCalibration: { mode: 'auto', offsetX: 0, offsetY: 0, scale: 1.0 }
    });
    await applyWindowSettings(updated);
    await refreshCalibrationPreview();
  });

  dom.hudCalibrationDrawer.addEventListener('click', async (e) => {
    const modeBtn = e.target.closest('.cal-mode-btn');
    if (!modeBtn) return;
    const updated = await window.overlayApi.updateSettings({
      visionCalibration: { mode: modeBtn.dataset.calMode }
    });
    await applyWindowSettings(updated);
    await refreshCalibrationPreview();
  });

  const handleCalibrationInputChange = async () => {
    const updated = await window.overlayApi.updateSettings({
      visionCalibration: {
        offsetX: Number(dom.inputCalX.value) || 0,
        offsetY: Number(dom.inputCalY.value) || 0,
        scale: Number(dom.inputCalScale.value) || 1.0
      }
    });
    await applyWindowSettings(updated);
  };
  dom.inputCalX.addEventListener('change', handleCalibrationInputChange);
  dom.inputCalY.addEventListener('change', handleCalibrationInputChange);
  dom.inputCalScale.addEventListener('change', handleCalibrationInputChange);

  dom.matchPhaseButtons.addEventListener('click', async (e) => {
    const btn = e.target.closest('.phase-btn');
    if (!btn) return;
    state.matchPhase = btn.dataset.phase || 'auto';
    renderPhaseStrip();
    await window.overlayApi.updateSettings({ matchPhase: state.matchPhase });
    await runDraftAnalysis();
  });

  dom.btnAddEnemyItem.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextOpen = !state.enemyItemPickerOpen;
    closeAllPopups();
    state.enemyItemPickerOpen = nextOpen;
    renderEnemyItemPicker();
  });

  dom.btnToggleAllies.addEventListener('click', () => {
    state.alliesExpanded = !state.alliesExpanded;
    renderAllyPanel();
    window.overlayApi.updateSettings({ alliesExpanded: state.alliesExpanded });
  });

  dom.positionButtons.addEventListener('click', async (e) => {
    const btn = e.target.closest('.pos-btn');
    if (!btn) return;
    state.myPosition = btn.dataset.pos ? Number(btn.dataset.pos) : null;
    renderMyHeroPanel();
    await runDraftAnalysis();
  });

  dom.myHeroInput.addEventListener('focus', () => openMyHeroAutocomplete(dom.myHeroInput.value));
  dom.myHeroInput.addEventListener('input', (e) => openMyHeroAutocomplete(e.target.value));
  dom.myHeroInput.addEventListener('keydown', (e) => {
    if (!state.myHeroDropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.myHeroResults.length > 0) {
        state.myHeroHighlightedIndex = (state.myHeroHighlightedIndex + 1) % state.myHeroResults.length;
        renderMyHeroDropdown();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.myHeroResults.length > 0) {
        state.myHeroHighlightedIndex =
          (state.myHeroHighlightedIndex - 1 + state.myHeroResults.length) % state.myHeroResults.length;
        renderMyHeroDropdown();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = state.myHeroResults[state.myHeroHighlightedIndex];
      if (chosen && !getSelectedEnemyIds().includes(chosen.id) && !getSelectedAllyIds().includes(chosen.id)) {
        selectMyHero(chosen.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAllPopups();
    }
  });

  dom.allySearchInput.addEventListener('focus', () => {
    if (getFirstEmptyIndex(state.selectedAllySlots) !== -1) openAllyAutocomplete(dom.allySearchInput.value);
  });
  dom.allySearchInput.addEventListener('input', (e) => openAllyAutocomplete(e.target.value));
  dom.allySearchInput.addEventListener('keydown', (e) => {
    if (!state.allyDropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.allyResults.length > 0) {
        state.allyHighlightedIndex = (state.allyHighlightedIndex + 1) % state.allyResults.length;
        renderAllyDropdown();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.allyResults.length > 0) {
        state.allyHighlightedIndex =
          (state.allyHighlightedIndex - 1 + state.allyResults.length) % state.allyResults.length;
        renderAllyDropdown();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = state.allyResults[state.allyHighlightedIndex];
      if (chosen && !getAllDisabledForAllies().has(chosen.id)) {
        selectAllyHero(chosen.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAllPopups();
    }
  });

  dom.searchInput.addEventListener('focus', () => {
    if (getFirstEmptyIndex(state.selectedEnemySlots) !== -1) openEnemyAutocomplete(dom.searchInput.value);
  });
  dom.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    dom.btnClearSearch.classList.toggle('d-none', val.length === 0);
    openEnemyAutocomplete(val);
  });
  dom.btnClearSearch.addEventListener('click', () => {
    dom.searchInput.value = '';
    dom.btnClearSearch.classList.add('d-none');
    openEnemyAutocomplete('');
    dom.searchInput.focus();
  });
  dom.searchInput.addEventListener('keydown', (e) => {
    if (!state.enemyDropdownOpen) {
      if (e.key === 'ArrowDown') openEnemyAutocomplete(dom.searchInput.value);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.enemyResults.length > 0) {
        state.enemyHighlightedIndex = (state.enemyHighlightedIndex + 1) % state.enemyResults.length;
        renderEnemyDropdown();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.enemyResults.length > 0) {
        state.enemyHighlightedIndex =
          (state.enemyHighlightedIndex - 1 + state.enemyResults.length) % state.enemyResults.length;
        renderEnemyDropdown();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = state.enemyResults[state.enemyHighlightedIndex];
      if (chosen && !getAllDisabledForEnemies().has(chosen.id)) {
        selectEnemyHero(chosen.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAllPopups();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('.draft-panel') &&
      !e.target.closest('.allies-panel') &&
      !e.target.closest('.my-context-panel') &&
      !e.target.closest('.enemy-items-panel')
    ) {
      closeAllPopups();
    }
  });

  if (window.overlayApi.onVisibilityChange) {
    window.overlayApi.onVisibilityChange((isVisible) => {
      if (isVisible && getFirstEmptyIndex(state.selectedEnemySlots) !== -1) {
        setTimeout(() => dom.searchInput.focus(), 50);
      }
    });
  }
  if (window.overlayApi.onClickThroughChange) {
    window.overlayApi.onClickThroughChange((isEnabled) => renderClickThroughState(isEnabled));
  }
  if (window.overlayApi.onMiniModeChange) {
    window.overlayApi.onMiniModeChange((isMini) => renderMiniModeState(isMini));
  }
  if (window.overlayApi.onSettingsUpdated) {
    window.overlayApi.onSettingsUpdated((settings) => applyWindowSettings(settings));
  }
  if (window.overlayApi.onDataUpdated) {
    window.overlayApi.onDataUpdated((updatedPayload) => applyGameData(updatedPayload));
  }
  if (window.overlayApi.onGsiUpdate) {
    window.overlayApi.onGsiUpdate((gsiState) => applyGsiState(gsiState));
  }
  if (window.overlayApi.onPatchStatus) {
    window.overlayApi.onPatchStatus((patchStatus) => renderPatchBadge(patchStatus));
  }
  if (window.overlayApi.onVisionDraft) {
    window.overlayApi.onVisionDraft((res) => applyVisionDraftResult(res));
  }
  if (window.overlayApi.onVisionEnemyItems) {
    window.overlayApi.onVisionEnemyItems((res) => applyVisionEnemyItemsResult(res));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  cacheDom();
  bindEvents();
  applyUiLanguage();
  renderEmptyRecommendations();

  try {
    const [appStatus, gameData, gsiStatus, patchStatus, windowSettings] = await Promise.all([
      window.overlayApi.getStatus(),
      window.overlayApi.getGameData(),
      window.overlayApi.getGsiStatus(),
      window.overlayApi.getPatchStatus(),
      window.overlayApi.getSettings()
    ]);
    state.isPackaged = Boolean(appStatus && appStatus.isPackaged);
    state.devToolsVisible = !state.isPackaged;
    state.appVersion = (appStatus && appStatus.version) || '';
    if (dom.appVersionText && state.appVersion) {
      dom.appVersionText.textContent = `v${state.appVersion}`;
      dom.appVersionText.classList.remove('d-none');
    }
    if (windowSettings && windowSettings.language) {
      state.language = normalizeLanguage(windowSettings.language);
    }
    renderDevToolsVisibility();
    applyUiLanguage();
    await applyWindowSettings(windowSettings);
    applyGameData(gameData);
    renderGsiStatusDrawer(gsiStatus);
    renderPatchBadge(patchStatus);
    if (gsiStatus && gsiStatus.lastGsiState) {
      await applyGsiState(gsiStatus.lastGsiState);
    }
  } catch (err) {
    dom.cacheStatusText.textContent = t('dataError', { error: err.message });
  }
});
