const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

function loadService(filename, connection, overrides = {}) {
  const servicePath = path.join(__dirname, '../src/services', filename);
  const serviceRequire = createRequire(servicePath);
  const mod = { exports: {} };
  const context = vm.createContext({ module: mod, console, require: (name) => {
    if (name === '../db/oracle') return { withConnection: (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } };
    return overrides[name] || serviceRequire(name);
  } });
  vm.runInContext(fs.readFileSync(servicePath, 'utf8'), context);
  return { service: mod.exports, context };
}

test('catalog uses latest monthly base at or before the requested month', async () => {
  const queries = [];
  const connection = { execute: async (sql, binds) => {
    queries.push({ sql, binds });
    return { rows: [] };
  } };
  const { service, context } = loadService('catalogService.js', connection);
  vm.runInContext(`
    resolveLojaCodigo = async (value) => value;
    getLojaCodcoligada = async () => null;
    getTableColumns = async (_connection, table) => table === 'SGN_ESC_HORARIO_BASE_MES'
      ? new Set(['ESCFUNC_ID', 'MES_REF']) : new Set(['ESCSUBSECAO_ID']);
  `, context);
  await service.listFuncionariosByLoja(302, { mesRef: '2026-11-01' });
  await service.listFuncionariosByLoja(302, { mesRef: '2026-12-01' });
  const monthlyQueries = queries.filter((item) => item.sql.includes('left join sgn_esc_horario_base_mes hb'));
  assert.equal(monthlyQueries.length, 2);
  assert.deepEqual(monthlyQueries.map((item) => item.binds.mesRef), ['2026-11-01', '2026-12-01']);
  assert.match(monthlyQueries[0].sql, /hbm\.mes_ref <= to_date\(:mesRef, 'YYYY-MM-DD'\)/);
  assert.match(monthlyQueries[0].sql, /case when hb\.mes_ref is not null then hb\.hr_ent1/);
  assert.doesNotMatch(monthlyQueries[0].sql, /hbm\.mes_ref >=/);
});

test('editing monthly base persists only the selected month without updating employee global hours', async () => {
  const queries = [];
  const connection = {
    execute: async (sql, binds) => {
      queries.push({ sql, binds });
      return sql.includes('from sgn_esc_funcionario') ? { rows: [{ STATUS: 'A', DT_DEMISS: null }] } : { rows: [] };
    },
    commit: async () => {}, rollback: async () => {}
  };
  const events = { createOperationId: () => 'test-operation', appendEvent: async () => {} };
  const { service, context } = loadService('escalaService.js', connection, { './escalaEventService': events });
  vm.runInContext(`calcularImpactoHorarioFuturo = async (_connection, input) => [{
    mesRef: input.mesRef, atual: null, dias: [], diasAlterados: 0, diasManuais: 0
  }];`, context);
  const horario = { HR_ENT1: '09:00', HR_SAI1: '13:00', HR_ENT2: '14:10', HR_SAI2: '18:58' };
  await service.updateHorarioFuncionarioEscala({ lojaId: 302, mesRef: '2026-12-01',
    funcionario: { ESCFUNC_ID: 30907, ESCSECAO_ID: 4781, CHAPA: '302.0588' }, horario,
    actor: { perfil: 'ADMIN' } });
  const merge = queries.find((item) => item.sql.includes('merge into sgn_esc_horario_base_mes'));
  assert.equal(merge.binds.mesRef, '2026-12-01');
  assert.equal(merge.binds.HR_ENT1, '09:00');
  assert.equal(queries.some((item) => /update sgn_esc_funcionario set\s+hr_ent1/i.test(item.sql)), false);
});
