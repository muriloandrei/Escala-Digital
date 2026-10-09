const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
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

test('Frente de Caixa operational scope includes Portaria', () => {
  const predicate = _private.getEscopoOperacionalSecaoPredicate('s');
  assert.match(predicate, /PORTARIA/);
  assert.match(predicate, /s\.descr/);
});

test('Frente de Caixa leader sees Portaria even with older explicit section grants', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/accessService.js'), 'utf8');
  const module = { exports: {} };
  const connection = {
    execute: async (sql) => {
      if (sql.includes('from sgn_esc_usuario_secao us')) return { rows: [{ ESCSECAO_ID: 20 }] };
      if (sql.includes('from sgn_esc_secao s')) {
        assert.match(sql, /PORTARIA/);
        assert.doesNotMatch(sql, /FRENTE\.\*CAIXA/);
        return { rows: [{ ESCSECAO_ID: 25 }] };
      }
      throw new Error(`SQL inesperado: ${sql}`);
    }
  };
  const context = vm.createContext({
    module,
    require: (name) => name === '../db/oracle'
      ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
      : require(name)
  });
  vm.runInContext(source, context);
  vm.runInContext(`getUsuarioSecaoColumns = async () => new Set(['STATUS']); getSecaoLojaColumn = async () => 'LOJA'; getTableColumns = async () => new Set(['STATUS']);`, context);
  const permitted = await module.exports.getSecoesPermitidasUsuario({ sub: 7, login: 'lider.frente35', perfil: 'LIDER', lojas: [35] }, 35);
  assert.deepEqual(Array.from(permitted), [20, 25]);
});
