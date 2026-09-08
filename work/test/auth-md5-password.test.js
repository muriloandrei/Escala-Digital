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

test('auth falls back to an allowed store when main store is stale', () => {
  assert.equal(_private.resolveLojaPrincipal({ LOJA_PRINCIPAL: 24 }, [35, 36]), 35);
  assert.equal(_private.resolveLojaPrincipal({ LOJA_PRINCIPAL: 35 }, [35, 36]), 35);
  assert.equal(_private.resolveLojaPrincipal({ LOJA_PRINCIPAL: 24 }, []), null);
});

test('auth prefers store inferred from operational user login when it is allowed', () => {
  assert.equal(_private.inferLojaPrincipalUsuario({ PERFIL: 'LIDER', LOGIN: 'lider.frente35' }), 35);
  assert.equal(_private.resolveLojaPrincipal({ PERFIL: 'LIDER', LOGIN: 'lider.frente35', LOJA_PRINCIPAL: 24 }, [24, 35]), 35);
  assert.equal(_private.resolveLojaPrincipal({ PERFIL: 'GERENTE', LOGIN: 'gerente35', LOJA_PRINCIPAL: 24 }, [24, 35]), 35);
  assert.equal(_private.resolveLojaPrincipal({ PERFIL: 'GERENTE', LOGIN: 'gerente35', LOJA_PRINCIPAL: 24 }, [24]), 24);
});
