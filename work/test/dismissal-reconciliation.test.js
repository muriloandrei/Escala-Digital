const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService({ dismissal = '2026-10-15', officialized = 1, days = ['2026-10-14', '2026-10-16'], failEvent = false } = {}) {
  const calls = [];
  const events = [];
  const state = { days: [...days], active: true, revision: 7 };
  const connection = {
    async execute(sql, binds) {
      calls.push({ sql, binds });
      if (/select distinct p\.escfunc_id/i.test(sql)) {
        assert.match(sql, /trunc\(d\.dt\) > trunc\(f\.dt_demiss\)/i);
        assert.match(sql, /p\.revisao = \(/i);
        if (binds.secaoPermitida0) {
          assert.match(sql, /p\.escsecao_id in \(:secaoPermitida0\)/i);
          assert.equal(binds.secaoPermitida0, 20);
        }
        return { rows: state.active && state.days.some((day) => day > dismissal) ? [{ ESCFUNC_ID: 90 }] : [] };
      }
      if (/update sgn_esc_rm_envio/i.test(sql)) return { rowsAffected: 1 };
      if (/update sgn_esc_prog set ativa = 0/i.test(sql)) {
        assert.equal(binds.escfuncId, 90);
        state.active = false;
        return { rowsAffected: 1 };
      }
      throw new Error(`SQL inesperado: ${sql}`);
    },
    async commit() { calls.push({ sql: 'COMMIT' }); },
    async rollback() { calls.push({ sql: 'ROLLBACK' }); }
  };
  const module = { exports: {} };
  const context = vm.createContext({
    module, console,
    require(name) {
      if (name === '../db/oracle') return { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } };
      if (name === './escalaEventService') return {
        createOperationId: () => 'op-demissao',
        appendEvent: async (_, event) => {
          if (failEvent) throw new Error('auditoria indisponivel');
          events.push(event);
        }
      };
      if (name === '../utils/scheduleDiff') return require('../src/utils/scheduleDiff');
      if (['./catalogService', '../domain/operationalPeriod', '../rules/escalaRules'].includes(name)) return {};
      throw new Error(`Dependencia inesperada: ${name}`);
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8'), context);
  context.connection = connection;
  context.state = state;
  context.dismissal = dismissal;
  context.officialized = officialized;
  vm.runInContext(`
    getAtivaSql = async () => 'nvl(p.ativa, 1) = 1';
    lockFuncionariosEscala = async () => new Map([[90, dismissal]]);
    getEscalaFuncionarioAtualComConnection = async () => state.active ? ({
      revisao: state.revision,
      header: { ESCPROG_ID: 100, ESCFUNC_ID: 90, REVISAO: state.revision, OFICIALIZADA: officialized },
      dias: state.days.map((data) => ({
        ESCPROG_ID: 100, ESCFUNC_ID: 90, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
        CHAPA: '000090', OFICIALIZADA: officialized, DT: data,
        PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '12:00',
        HR_ENT2: '13:10', HR_SAI2: '17:58'
      }))
    }) : null;
    getLatestFuncionarioRevision = async () => state.revision;
    insertEscalaOracle = async (_, payload) => {
      state.days = payload.dias.map((dia) => dia.data);
      state.revision = payload.revisao;
      connection.inserted = payload;
      return { escprogId: 101, revisao: payload.revisao };
    };
    hasProgAtivaColumn = async () => true;
  `, context);
  return { service: module.exports, connection, calls, events, state };
}

test('RM dismissal preserves history, creates only the employee revision and requires reapproval', async () => {
  const { service, connection, calls, events, state } = loadService();
  const result = await service._private.reconciliarDesligamentosComConnection(connection, {
    lojaId: 10, mesRef: '2026-10-01', secoesPermitidas: [20]
  });
  assert.equal(result.funcionarios, 1);
  assert.equal(result.dias, 1);
  assert.equal(result.oficializadas, 1);
  assert.deepEqual(Array.from(state.days), ['2026-10-14']);
  assert.equal(state.revision, 8);
  assert.equal(connection.inserted.oficializada, 0);
  assert.deepEqual(Array.from(connection.inserted.dias, (dia) => dia.data), ['2026-10-14']);
  assert.equal(connection.inserted.funcionario.escfuncId, 90);
  assert.equal(events[0].acao, 'AJUSTAR_DEMISSAO_RM');
  assert.equal(events[0].situacao, 'POS_OFICIALIZACAO');
  assert.equal(events[0].detalhe.alteracoes[0].data, '2026-10-16');
  assert.equal(events[0].detalhe.alteracoes[0].novo, null);
  assert.ok(calls.some(({ sql }) => /status = 'SUPERADO'/i.test(sql)));
  assert.equal(calls.filter(({ sql }) => sql === 'COMMIT').length, 1);

  const repeated = await service._private.reconciliarDesligamentosComConnection(connection, {
    lojaId: 10, mesRef: '2026-10-01', secoesPermitidas: [20]
  });
  assert.equal(repeated.funcionarios, 0);
  assert.equal(events.length, 1);
  assert.equal(calls.filter(({ sql }) => sql === 'COMMIT').length, 1);
});

test('RM dismissal before the period inactivates only the dismissed employee', async () => {
  const { service, connection, calls, state } = loadService({ dismissal: '2026-10-01', days: ['2026-10-05', '2026-10-06'] });
  const result = await service._private.reconciliarDesligamentosComConnection(connection, {
    lojaId: 10, mesRef: '2026-10-01'
  });
  assert.equal(result.dias, 2);
  assert.equal(state.active, false);
  assert.equal(connection.inserted, undefined);
  assert.ok(calls.some(({ sql }) => /update sgn_esc_prog set ativa = 0/i.test(sql)));
  assert.ok(calls.some(({ sql }) => sql === 'COMMIT'));
});

test('audit failure rolls back the automatic dismissal adjustment', async () => {
  const { service, connection, calls } = loadService({ failEvent: true });
  await assert.rejects(
    service._private.reconciliarDesligamentosComConnection(connection, { lojaId: 10, mesRef: '2026-10-01' }),
    /auditoria indisponivel/
  );
  assert.equal(calls.at(-1).sql, 'ROLLBACK');
  assert.equal(calls.some(({ sql }) => sql === 'COMMIT'), false);
});
