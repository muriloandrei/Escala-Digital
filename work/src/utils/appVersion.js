const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function listFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  if (!stat.isDirectory()) return [];
  return fs.readdirSync(target).sort().flatMap((name) => listFiles(path.join(target, name)));
}

function getAppVersion(root) {
  const sources = ['src', 'public', 'views', 'package-lock.json'];
  const files = sources.flatMap((source) => listFiles(path.join(root, source)));
  const hash = crypto.createHash('sha256');
  for (const file of files) {
    hash.update(path.relative(root, file).replaceAll('\\', '/'));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 12);
}

module.exports = { getAppVersion };
