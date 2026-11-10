const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService() {
  const operations = [];
  const connection = {
    async execute(sql) {
      if (/select escfunc_id, dt_demiss, status from sgn_esc_funcionario/i.test(sql)) {
        return { rows: [{ ESCFUNC_ID: 90, DT_DEMISS: null, STATUS: 'A' }] };
      }
      if (/join sgn_esc_funcao fn/i.test(sql)) {
        return { rows: [{ ESCFUNC_ID: 90, FUNCAO_DESCR: 'OPERADOR DE CAIXA' }] };
      }
      throw new Error(`Unexpected SQL: ${sql}`);
    },
    async commit() { operations.push('commit'); },
    async rollback() { operations.push('rollback'); }
  };
  const module = { exports: {} };
  const context = vm.createContext({
    module, console,
    require(name) {
      if (name === '../db/oracle') return {
        withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 }
      };
      if (name === './escalaEventService') return {
        createOperationId: () => 'retroactive-test',
        appendEvent: async () => { operations.push('event'); }
      };
      if (name === './catalogService') return {};
      if (name === '../domain/operationalPeriod') return require('../src/domain/operationalPeriod');
      if (name === '../domain/officializationDates') return require('../src/domain/officializationDates');
      if (name === '../domain/fixedCarry') return require('../src/domain/fixedCarry');
      if (name === '../domain/portariaSection') return require('../src/domain/portariaSection');
      if (name === '../domain/employeeStatus') return require('../src/domain/employeeStatus');
      if (name === '../domain/sectionRollout') return require('../src/domain/sectionRollout');
      if (name === '../utils/scheduleDiff') return require('../src/utils/scheduleDiff');
      if (name === '../domain/shiftValidation') return require('../src/domain/shiftValidation');
      if (name === '../rules/escalaRules') return {};
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8');
  vm.runInContext(source, context);
  vm.runInContext(`
    getLatestFuncionarioRevision = async () => 7;
    getEscalaFuncionarioAtualComConnection = async () => ({
      revisao: 7,
      header: { OFICIALIZADA: 1 },
      dias: [{ DT: '2026-10-12', PROGRAMACAO: 'TRB', HR_ENT1: '08:00',
        HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' }]
    });
    insertEscalaOracle = async (_connection, payload) => {
      globalThis.savedPayload = payload;
      return { escprogId: 99, revisao: payload.revisao };
    };
    appendMudancaEscala = async () => { globalThis.historyAppended = true; };
  `, context);
  return { service: module.exports, operations, context };
}

function payload(perfil) {
  return {
    lojaId: 35, mesRef: '2026-10-01', actor: { sub: 7, perfil },
    funcionarios: [{ escfuncId: 90, revisaoBase: 7, chapa: '035.0090',
      dias: [{ data: '2026-10-12', programacao: 'F', hrEnt1: null,
        hrSai1: null, hrEnt2: null, hrSai2: null }] }]
  };
}

test('only Admin can bypass historical date and finalized-month locks', async () => {
  const { service, operations, context } = loadService();
  assert.equal(service._private.podeEditarRetroativamente({ perfil: 'ADMIN' }), true);
  assert.equal(service._private.podeEditarRetroativamente({ perfil: 'LIDER' }), false);
  assert.equal(service._private.podeEditarRetroativamente({ perfil: 'GERENTE' }), false);
  assert.equal(service._private.podeEditarRetroativamente({ perfil: 'RH' }), false);
  await assert.rejects(service.saveEscalasFuncionariosRevision(payload('LIDER')), /Escala finalizada/);
  assert.deepEqual(operations, ['rollback']);

  const saved = await service.saveEscalasFuncionariosRevision(payload('ADMIN'));
  assert.equal(saved[0].revisao, 8);
  assert.equal(context.savedPayload.oficializada, 0);
  assert.equal(context.savedPayload.dias[0].programacao, 'F');
  assert.equal(context.historyAppended, true);
  assert.deepEqual(operations, ['rollback', 'event', 'commit']);
});

test('past-day lock remains active for non-Admin in an otherwise editable month', async () => {
  const { service, operations, context } = loadService();
  vm.runInContext('isMesFinalizado = () => false;', context);
  await assert.rejects(service.saveEscalasFuncionariosRevision(payload('GERENTE')), /Dias ja passados/);
  assert.deepEqual(operations, ['rollback']);
  const saved = await service.saveEscalasFuncionariosRevision(payload('ADMIN'));
  assert.equal(saved[0].revisao, 8);
  assert.deepEqual(operations, ['rollback', 'event', 'commit']);
});

test('leader cannot reofficialize a finalized month through the route', async () => {
  const router = require('../src/routes/escalaRoutes');
  const handler = router.stack.find((layer) => layer.route?.path === '/oficializar'
    && layer.route.methods.post).route.stack.at(-1).handle;
  const response = { statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
  await handler({ body: { lojaId: 35, mesRef: '2026-10-01', escsecaoId: 4524 },
    user: { perfil: 'LIDER', sub: 7 } }, response, (error) => { throw error; });
  assert.equal(response.statusCode, 403);
  assert.match(response.body.error, /Somente Admin/);
});
