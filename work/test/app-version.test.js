const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { getAppVersion } = require('../src/utils/appVersion');

test('versao depende do conteudo da aplicacao, nao do mtime ou de segredos', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'escala-version-test-'));
  try {
    const source = path.join(root, 'src');
    fs.mkdirSync(source);
    const file = path.join(source, 'server.js');
    fs.writeFileSync(file, 'const app = true;');
    const first = getAppVersion(root);
    fs.utimesSync(file, new Date('2020-01-01'), new Date('2020-01-01'));
    assert.equal(getAppVersion(root), first);
    fs.writeFileSync(file, 'const app = false;');
    assert.notEqual(getAppVersion(root), first);
    const second = getAppVersion(root);
    fs.writeFileSync(path.join(root, '.env'), 'SECRET=changed');
    assert.equal(getAppVersion(root), second);
  } finally {
    if (!path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Diretorio temporario invalido.');
    fs.rmSync(root, { recursive: true, force: true });
  }
});
