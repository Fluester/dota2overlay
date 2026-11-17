/**
 * CLI-скрипт для офлайн-генерації Data/counters.json (та синхронізації з userData, якщо папка існує)
 * через ruleGeneratorService. Розбирає всі 4 категорії механік (Innate, Active+Shard/Scepter, Passive, Talents 10–25),
 * усі предмети та нейтралки Tier 1–4.
 */

const fs = require('fs');
const path = require('path');
const storagePaths = require('../src/services/storagePaths');
const ruleGeneratorService = require('../src/services/ruleGeneratorService');

const report = ruleGeneratorService.regenerateRules({
  writeToBundled: true,
  reloadDataCallback: () => null
});

// Якщо в системі існує папка userData (%APPDATA%/com.dota2overlay.app/Data), синхронізуємо свіжі файли туди також
for (const appDirName of ['com.dota2overlay.app', 'dota2overlay']) {
  const appDataRoot = process.env.APPDATA ? path.join(process.env.APPDATA, appDirName) : null;
  if (appDataRoot && fs.existsSync(appDataRoot)) {
    const userDataDir = path.join(appDataRoot, 'Data');
    storagePaths.ensureDir(userDataDir);
    for (const fileName of ['counters.json', 'heroes.json', 'items.json', 'abilities.json', 'patches.json', 'meta.json']) {
      const src = path.join(storagePaths.getBundledDataDir(), fileName);
      const dst = path.join(userDataDir, fileName);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
      }
    }
    console.log(`Synced updated Data files to userData: ${userDataDir}`);
  }
}

console.log(
  `Updated Data/counters.json (Patch ${report.patchTarget}): ` +
    `${report.heroesAnalyzed} heroes, ${report.abilitiesAnalyzed} abilities ` +
    `(${report.innateAbilitiesCount} innate, ${report.activeAbilitiesCount} active, ${report.passiveAbilitiesCount} passive), ` +
    `${report.talentsAnalyzed} talents (${report.lateTalentSpikesCount} late spikes), ` +
    `${report.itemsAnalyzed} items -> ${report.itemRulesCount} item rules, ${report.neutralRulesCount} neutral rules.`
);
