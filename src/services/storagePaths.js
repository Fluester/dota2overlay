const fs = require('fs');
const path = require('path');

const PROJECT_ROOT_DIR = path.join(__dirname, '..', '..');
const BUNDLED_DATA_DIR = path.join(PROJECT_ROOT_DIR, 'Data');

let customUserDataRoot = null;

function isPackagedAsar() {
  return false;
}

function setUserDataDir(dirPath) {
  customUserDataRoot = dirPath ? path.resolve(dirPath) : null;
}

function getBundledDataDir() {
  return BUNDLED_DATA_DIR;
}

function getUserDataRoot() {
  if (customUserDataRoot) return customUserDataRoot;
  return PROJECT_ROOT_DIR;
}

function getWritableDataDir() {
  return path.join(getUserDataRoot(), 'Data');
}

function getCacheDir() {
  return path.join(getWritableDataDir(), 'cache');
}

function getSettingsFilePath() {
  return path.join(getWritableDataDir(), 'settings.json');
}

function getCfgFallbackDir() {
  if (customUserDataRoot) return customUserDataRoot;
  return getUserDataRoot();
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFileSafe(srcPath, destPath) {
  ensureDir(path.dirname(destPath));
  const buf = fs.readFileSync(srcPath);
  fs.writeFileSync(destPath, buf);
}

function ensureSeededDataFile(relativeName) {
  const writableDir = getWritableDataDir();
  const targetFile = path.join(writableDir, relativeName);
  const bundledFile = path.join(BUNDLED_DATA_DIR, relativeName);

  if (fs.existsSync(targetFile)) {
    return targetFile;
  }

  ensureDir(path.dirname(targetFile));

  if (fs.existsSync(bundledFile) && path.resolve(bundledFile) !== path.resolve(targetFile)) {
    try {
      copyFileSafe(bundledFile, targetFile);
      return targetFile;
    } catch (err) {
      console.warn(`[StoragePaths] Не вдалося скопіювати шаблон ${relativeName}:`, err.message);
      return bundledFile;
    }
  }

  return targetFile;
}

function getReadableDataFile(relativeName) {
  const writableFile = path.join(getWritableDataDir(), relativeName);
  if (fs.existsSync(writableFile)) return writableFile;
  return path.join(BUNDLED_DATA_DIR, relativeName);
}

module.exports = {
  PROJECT_ROOT_DIR,
  BUNDLED_DATA_DIR,
  isPackagedAsar,
  setUserDataDir,
  getBundledDataDir,
  getUserDataRoot,
  getWritableDataDir,
  getCacheDir,
  getSettingsFilePath,
  getCfgFallbackDir,
  ensureDir,
  ensureSeededDataFile,
  getReadableDataFile
};
