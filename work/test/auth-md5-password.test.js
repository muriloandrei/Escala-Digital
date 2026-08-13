const test = require('node:test');
const assert = require('node:assert/strict');
const { _private } = require('../src/services/authService');

test('auth accepts raw legacy MD5 hash for first login', async () => {
  const password = 'senhaAntiga123';
  const md5 = _private.md5Hex(password);

  assert.equal(_private.isLegacyMd5Hash(md5), true);
  assert.equal(_private.isSupportedPasswordHash(md5), true);
  assert.equal(await _private.verifyPasswordHash(password, md5), true);
  assert.equal(await _private.verifyPasswordHash('senhaErrada', md5), false);
});
