const test = require('node:test');
const assert = require('node:assert/strict');
const { _private } = require('../src/services/accessService');

test('explicit profile denial is not overwritten by role defaults', () => {
  const permission = _private.normalizePermission({
    PAGINA: 'escalas',
    PODE_VISUALIZAR: 0,
    PODE_CRIAR: 0,
    PODE_EDITAR: 0
  }, 'GERENTE');
  assert.equal(permission.PODE_VISUALIZAR, 0);
  assert.equal(permission.PODE_CRIAR, 0);
  assert.equal(permission.PODE_EDITAR, 0);
});

test('missing profile row receives operational defaults but officialization remains admin only', () => {
  const gerente = _private.completarPermissoesPerfil({ NOME: 'GERENTE', PERMISSOES: [] });
  const permission = gerente.PERMISSOES.find((item) => item.PAGINA === 'escalas');
  assert.equal(permission.PODE_VISUALIZAR, 1);
  assert.equal(permission.PODE_CRIAR, 1);
  assert.equal(permission.PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas', PODE_OFICIALIZAR: 1 }, 'RH').PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas' }, 'ADMIN').PODE_OFICIALIZAR, 1);
});
