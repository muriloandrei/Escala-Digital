const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { _private, isGlobalStoreAccessUser, getSecoesPermitidasUsuario, assertSecoesPermitidas } = require('../src/services/accessService');

test('admin and controladoria can see new stores even with existing store links', () => {
  assert.equal(isGlobalStoreAccessUser({ perfil: 'ADMIN', lojas: [1, 2] }), true);
  assert.equal(isGlobalStoreAccessUser({ perfil: 'CONTROLADORIA', lojas: [1, 2] }), true);
  assert.equal(isGlobalStoreAccessUser({ perfil: 'LIDER', lojas: [1, 2] }), false);
});

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

test('officialization is a separate configurable permission on schedules', () => {
  const gerente = _private.completarPermissoesPerfil({ NOME: 'GERENTE', PERMISSOES: [] });
  const permission = gerente.PERMISSOES.find((item) => item.PAGINA === 'escalas');
  assert.equal(permission.PODE_VISUALIZAR, 1);
  assert.equal(permission.PODE_CRIAR, 1);
  assert.equal(permission.PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas', PODE_OFICIALIZAR: 1 }, 'RH').PODE_OFICIALIZAR, 1);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas', PODE_EDITAR: 1, PODE_OFICIALIZAR: 0 }, 'RH').PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'funcionarios', PODE_OFICIALIZAR: 1 }, 'RH').PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas' }, 'ADMIN').PODE_OFICIALIZAR, 1);
});

test('section access follows assigned stores, not the login or individual section grants', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/accessService.js'), 'utf8');
  const module = { exports: {} };
  const connection = {
    execute: async (sql, binds) => {
      if (sql.includes('from user_tab_columns')) return { rows: [{ COLUMN_NAME: 'CODFILIAL' }] };
      assert.match(sql, /from sgn_esc_secao/);
      assert.match(sql, /codfilial = :lojaId/);
      assert.equal(binds.lojaId, 2);
      return { rows: [{ TOTAL: Number(binds.secao0 === 4200) }] };
    }
  };
  const context = vm.createContext({
    module,
    require: (name) => name === '../db/oracle'
      ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
      : name === '../domain/sectionRollout'
        ? require('../src/domain/sectionRollout')
        : require(name)
  });
  vm.runInContext(source, context);
  const user = { sub: 7, login: 'CPD', perfil: 'LIDER', lojas: [2] };
  assert.equal(await module.exports.getSecoesPermitidasUsuario(user, 2), null);
  assert.equal(await module.exports.getSecoesPermitidasUsuario(user), null);
  await module.exports.assertSecoesPermitidas(user, 2, [4200]);
  await assert.rejects(
    module.exports.assertSecoesPermitidas(user, 2, [4201]),
    { statusCode: 403 }
  );
  await assert.rejects(module.exports.getSecoesPermitidasUsuario(user, 3), { statusCode: 403 });
  assert.equal(await module.exports.getSecoesPermitidasUsuario({ sub: 1, perfil: 'ADMIN' }, 2), null);
});

test('RH sees every section only in stores assigned to the user', async () => {
  const rh = { sub: 20, perfil: 'RH', login: 'RH.CORPORATIVO', lojas: [301, 302] };
  assert.equal(await getSecoesPermitidasUsuario(rh, 301), null);
  assert.equal(await getSecoesPermitidasUsuario(rh), null);
  await assert.rejects(getSecoesPermitidasUsuario(rh, 303), { statusCode: 403 });
  await assert.rejects(assertSecoesPermitidas(rh, 303, [4200]), { statusCode: 403 });

  const source = fs.readFileSync(path.join(__dirname, '../src/services/accessService.js'), 'utf8');
  const module = { exports: {} };
  const connection = { execute: async (sql, binds) => {
    if (sql.includes('from user_tab_columns')) return { rows: [{ COLUMN_NAME: 'CODFILIAL' }] };
    assert.match(sql, /from sgn_esc_secao/);
    assert.match(sql, /codfilial = :lojaId/);
    assert.equal(binds.lojaId, 301);
    const requested = Object.entries(binds).filter(([key]) => /^secao\d+$/.test(key)).map(([, id]) => id);
    return { rows: [{ TOTAL: requested.filter((id) => [4200, 4201].includes(id)).length }] };
  } };
  const context = vm.createContext({ module, require: (name) => name === '../db/oracle'
    ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
    : name === '../domain/sectionRollout' ? require('../src/domain/sectionRollout') : require(name) });
  vm.runInContext(source, context);
  await module.exports.assertSecoesPermitidas(rh, 301, [4200, 4201]);
  await assert.rejects(module.exports.assertSecoesPermitidas(rh, 301, [4200, 9300]), { statusCode: 403 });
});

test('leader with several assigned stores can open each store without section links', async () => {
  const user = { sub: 64, login: 'CPD', perfil: 'LIDER', lojas: [2, 64] };
  assert.equal(await getSecoesPermitidasUsuario(user, 2), null);
  assert.equal(await getSecoesPermitidasUsuario(user, 64), null);
  await assert.rejects(getSecoesPermitidasUsuario(user, 65), { statusCode: 403 });
});
