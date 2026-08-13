const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { _private } = require('../src/services/authService');

test('auth accepts bcrypt hash generated from legacy MD5 password', async () => {
  const password = 'senhaAntiga123';
  const md5 = _private.md5Hex(password);
  const wrappedHash = _private.MD5_BCRYPT_PREFIX + await bcrypt.hash(md5, 10);

  assert.equal(_private.isMd5BcryptHash(wrappedHash), true);
  assert.equal(await _private.verifyPasswordHash(password, wrappedHash), true);
  assert.equal(await _private.verifyPasswordHash('senhaErrada', wrappedHash), false);
});
