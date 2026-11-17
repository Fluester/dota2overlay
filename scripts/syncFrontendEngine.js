const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGET_DIR = path.join(ROOT, 'wwwroot', 'vendor', 'engine');

const FILES = [
  { src: path.join(ROOT, 'src', 'engine', 'analyzer.js'), dest: path.join(TARGET_DIR, 'analyzer.js') },
  { src: path.join(ROOT, 'src', 'services', 'rulePresets.js'), dest: path.join(TARGET_DIR, 'rulePresets.js') },
  { src: path.join(ROOT, 'src', 'services', 'ruleGeneratorService.js'), dest: path.join(TARGET_DIR, 'ruleGeneratorService.js') }
];

fs.mkdirSync(TARGET_DIR, { recursive: true });
for (const entry of FILES) {
  fs.copyFileSync(entry.src, entry.dest);
}
console.log(`[syncFrontendEngine] Synced ${FILES.length} engine scripts to wwwroot/vendor/engine`);
