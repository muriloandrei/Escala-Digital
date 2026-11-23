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

test('auth uses assigned stores and never infers scope from login or name', () => {
  const leader = { PERFIL: 'LIDER', LOGIN: 'lider.frente35', NOME: 'Lider Loja 35', LOJA_PRINCIPAL: 24 };
  assert.equal(_private.resolveLojaPrincipal(leader, [24, 35]), 24);
  assert.deepEqual(_private.resolveLojasSessao(leader, [24, 35, 24], 24), [24, 35]);
  assert.deepEqual(_private.resolveLojasSessao(leader, [24], 24), [24]);
  assert.equal(_private.resolveLojaPrincipal({ ...leader, LOJA_PRINCIPAL: 99 }, [24, 35]), 24);
  assert.deepEqual(_private.resolveLojasSessao({ PERFIL: 'LIDER', LOGIN: 'corporativo' }, [], null), []);
});

test('auth keeps all stores in session for controladoria', () => {
  assert.deepEqual(_private.resolveLojasSessao({ PERFIL: 'CONTROLADORIA', LOGIN: 'controladoria35', LOJA_PRINCIPAL: 24 }, [2, 24, 35], 2), [2, 24, 35]);
});
