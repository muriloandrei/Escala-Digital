const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { _private, isGlobalStoreAccessUser } = require('../src/services/accessService');

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

test('missing profile row receives operational defaults but officialization remains admin only', () => {
  const gerente = _private.completarPermissoesPerfil({ NOME: 'GERENTE', PERMISSOES: [] });
  const permission = gerente.PERMISSOES.find((item) => item.PAGINA === 'escalas');
  assert.equal(permission.PODE_VISUALIZAR, 1);
  assert.equal(permission.PODE_CRIAR, 1);
  assert.equal(permission.PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas', PODE_OFICIALIZAR: 1 }, 'RH').PODE_OFICIALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'escalas' }, 'ADMIN').PODE_OFICIALIZAR, 1);
});

test('Frente de Caixa leader sees only explicit section grants', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/accessService.js'), 'utf8');
  const module = { exports: {} };
  const connection = {
    execute: async (sql) => {
      if (sql.includes('from sgn_esc_usuario_secao us')) return { rows: [{ ESCSECAO_ID: 20 }] };
      throw new Error(`SQL inesperado: ${sql}`);
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
  vm.runInContext(`getUsuarioSecaoColumns = async () => new Set(['STATUS']); getSecaoLojaColumn = async () => 'LOJA'; getTableColumns = async () => new Set(['STATUS']);`, context);
  const permitted = await module.exports.getSecoesPermitidasUsuario({ sub: 7, login: 'lider.frente35', perfil: 'LIDER', lojas: [35] }, 35);
  assert.deepEqual(Array.from(permitted), [20]);
});

test('store user with FRENTE login is scoped to assigned sections', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/accessService.js'), 'utf8');
  const module = { exports: {} };
  const connection = {
    execute: async (sql, binds) => {
      assert.match(sql, /from sgn_esc_usuario_secao us/);
      assert.match(sql, /nvl\(us\.status, 'A'\) = 'A'/);
      assert.equal(binds.lojaId, 2);
      return { rows: binds.usuarioId === 7 ? [{ ESCSECAO_ID: 4200 }] : [] };
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
  vm.runInContext(`getUsuarioSecaoColumns = async () => new Set(['STATUS']); getSecaoLojaColumn = async () => 'CODFILIAL';`, context);
  const permitted = await module.exports.getSecoesPermitidasUsuario({ sub: 7, login: 'FRENTE02', perfil: 'OPERADOR', lojas: [2] }, 2);
  assert.deepEqual(Array.from(permitted), [4200]);
  const semVinculos = await module.exports.getSecoesPermitidasUsuario({ sub: 8, login: 'FRENTE02', perfil: 'OPERADOR', lojas: [2] }, 2);
  assert.deepEqual(Array.from(semVinculos), []);
  await assert.rejects(
    module.exports.assertSecoesPermitidas({ sub: 7, login: 'FRENTE02', perfil: 'OPERADOR', lojas: [2] }, 2, [4201]),
    { statusCode: 403 }
  );
  assert.equal(await module.exports.getSecoesPermitidasUsuario({ sub: 1, perfil: 'ADMIN' }, 2), null);
});

test('leader of another section sees only the explicitly assigned section', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/accessService.js'), 'utf8');
  const module = { exports: {} };
  const connection = {
    execute: async (sql) => {
      if (sql.includes('from sgn_esc_usuario_secao us')) {
        assert.match(sql, /s\.codfilial = :lojaId/);
        assert.match(sql, /nvl\(us\.status, 'A'\) = 'A'/);
        assert.doesNotMatch(sql, /s\.status = 'A'/);
        return { rows: [{ ESCSECAO_ID: 6402 }] };
      }
      throw new Error(`SQL inesperado: ${sql}`);
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
  vm.runInContext(`getUsuarioSecaoColumns = async () => new Set(['STATUS']); getSecaoLojaColumn = async () => 'CODFILIAL';`, context);
  const permitted = await module.exports.getSecoesPermitidasUsuario(
    { sub: 64, login: 'lider.estoque64', perfil: 'LIDER', lojas: [64] }, 64);
  assert.deepEqual(Array.from(permitted), [6402]);
});
