const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { effectiveDate } = require('../src/services/subsectionTransferService');
const { _private: { aplicarHistoricoSubsecoes } } = require('../src/services/escalaService');

test('proxima semana comeca na segunda seguinte, inclusive se hoje ja for segunda', () => {
  assert.equal(effectiveDate('PROXIMA_SEMANA', '2026-10-01'), '2026-10-05');
  assert.equal(effectiveDate('PROXIMA_SEMANA', '2026-10-05'), '2026-10-12');
});

test('proximo mes comeca na primeira segunda operacional', () => {
  assert.equal(effectiveDate('PROXIMO_MES', '2026-10-01'), '2026-11-02');
  assert.equal(effectiveDate('PROXIMO_MES', '2026-12-31'), '2027-01-04');
});

test('dias anteriores a vigencia mantem a subsecao de origem', () => {
  const rows = [
    { ESCFUNC_ID: 91, DT: '2026-10-04', ESCSUBSECAO_ID: 6 },
    { ESCFUNC_ID: 91, DT: '2026-10-05', ESCSUBSECAO_ID: 6 },
    { ESCFUNC_ID: 91, DT: '2026-10-12', ESCSUBSECAO_ID: 6 }
  ];
  aplicarHistoricoSubsecoes(rows, [
    { ESCFUNC_ID: 91, VIGENCIA: '2026-10-05', ORIGEM_ID: 5, DESTINO_ID: 6, ORIGEM_NOME: 'Caixa', DESTINO_NOME: 'Padaria Caixa' },
    { ESCFUNC_ID: 91, VIGENCIA: '2026-10-12', ORIGEM_ID: 6, DESTINO_ID: 7, ORIGEM_NOME: 'Padaria Caixa', DESTINO_NOME: 'Balcão' }
  ]);
  assert.deepEqual(rows.map((row) => row.ESCSUBSECAO_ID), [5, 6, 7]);
});

test('agendamento persiste evento e nao muda o vinculo atual', async () => {
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push({ sql, binds });
      if (/from sgn_esc_funcionario/i.test(sql)) return { rows: [{ ESCFUNC_ID: 91, ESCSECAO_ID: 2003, ESCSUBSECAO_ID: 5, DT_DEMISS: null }] };
      if (/from sgn_esc_subsecao/i.test(sql)) return { rows: [{ ESCSUBSECAO_ID: 6 }] };
      if (/from sgn_esc_transfer_sub/i.test(sql)) return { rows: [] };
      if (/returning transf_id/i.test(sql)) return { outBinds: { transfId: [7] } };
      return { rowsAffected: 1 };
    },
    async commit() { statements.push({ sql: 'COMMIT' }); },
    async rollback() { throw new Error('Unexpected rollback'); }
  };
  const loaded = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/subsectionTransferService.js'), 'utf8');
  const dependencies = {
    '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1, NUMBER: 2, BIND_OUT: 3, CLOB: 4 } },
    '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: '2026-11-02' }) },
    './catalogService': {}, './escalaService': {}, './monthlyReleaseService': {},
    './escalaEventService': { createOperationId: () => 'test-op', appendEvent: async (_connection, event) => statements.push({ sql: 'EVENT', event }) }
  };
  vm.runInNewContext(source, { module: loaded, require: (name) => dependencies[name], Intl, Date, JSON, Set });
  const result = await loaded.exports.agendar({
    lojaId: 35, escfuncId: 91, escsecaoId: 2003, destinoId: 6,
    vigencia: 'PROXIMA_SEMANA', actor: { sub: 1, login: 'lider35' }
  });
  assert.equal(result.status, 'PENDENTE');
  assert.equal(statements.some(({ sql }) => /update sgn_esc_funcionario/i.test(sql)), false);
  assert.equal(statements.find(({ sql }) => sql === 'EVENT').event.acao, 'AGENDAR_TRANSFERENCIA_SUBSECAO');
  assert.equal(statements.at(-1).sql, 'COMMIT');
});

for (const officialized of [false, true]) {
  test(`processador ${officialized ? 'recusa escala oficializada' : 'regera apenas futuro'}`, async () => {
    const calls = [];
    const connection = {
      async execute(sql, binds) {
        calls.push({ sql, binds });
        if (/from sgn_esc_transfer_sub where transf_id/i.test(sql)) return { rows: [{
          TRANSF_ID: 7, LOJA: 35, ESCFUNC_ID: 91, ESCSECAO_ID: 2003,
          ORIGEM_ID: 5, DESTINO_ID: 6, VIGENCIA: '2099-10-05',
          STATUS: 'E', TENTATIVAS: 1, USUARIO_ID: 1, LOGIN: 'lider35', MESES_GERADOS: '[]'
        }] };
        if (/user_tab_columns/i.test(sql)) return { rows: [{ TOTAL: 1 }] };
        if (/from sgn_esc_prog p/i.test(sql)) return { rows: [{ MES_REF: '2099-10-01' }] };
        return { rowsAffected: 1 };
      }
    };
    const loaded = { exports: {} };
    const source = fs.readFileSync(path.join(__dirname, '../src/services/subsectionTransferService.js'), 'utf8');
    const dependencies = {
      '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1, STRING: 2, CLOB: 3 } },
      '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: '2026-11-02' }) },
      './catalogService': {
        listFuncionariosByLoja: async () => [{ ESCFUNC_ID: 91, ESCSECAO_ID: 2003, ESCSUBSECAO_ID: 5 }],
        updateFuncionarioEscala: async (payload) => { calls.push({ sql: 'UPDATE_CATALOG', payload }); return {}; }
      },
      './escalaService': { isEscalaSecaoOficializada: async () => officialized },
      './monthlyReleaseService': {
        gerarEscalaSecao: async (payload) => { calls.push({ sql: 'GENERATE', payload }); return { criada: true }; }
      },
      './escalaEventService': {}
    };
    vm.runInNewContext(source, { module: loaded, require: (name) => dependencies[name], Intl, Date, JSON, Set, console });
    const result = await loaded.exports._private.processOne(7);
    if (officialized) {
      assert.equal(result.status, 'FALHA');
      assert.equal(calls.some(({ sql }) => sql === 'UPDATE_CATALOG'), false);
      assert.equal(calls.some(({ sql }) => sql === 'GENERATE'), false);
    } else {
      assert.equal(result.status, 'APLICADA');
      assert.equal(calls.find(({ sql }) => sql === 'GENERATE').payload.hojeIso, '2099-10-05');
      assert.equal(calls.filter(({ sql }) => sql === 'GENERATE').length, 1);
      assert.equal(calls.some(({ sql, binds }) => /status = 'C'/.test(sql) && binds.id === 7), true);
    }
  });
}

for (const status of ['F', 'P']) {
  test(`retomada administrativa ${status === 'F' ? 'preserva progresso parcial' : 'recusa transferencia ativa'}`, async () => {
    const calls = [];
    const connection = {
      async execute(sql, binds) {
        calls.push({ sql, binds });
        if (/select transf_id, escsecao_id, origem_id/i.test(sql)) return { rows: [{
          TRANSF_ID: 7, ESCSECAO_ID: 2003, ORIGEM_ID: 5, DESTINO_ID: 6,
          VIGENCIA: '2026-10-05', STATUS: status
        }] };
        return { rowsAffected: 1 };
      },
      async commit() { calls.push({ sql: 'COMMIT' }); },
      async rollback() { calls.push({ sql: 'ROLLBACK' }); }
    };
    const loaded = { exports: {} };
    const source = fs.readFileSync(path.join(__dirname, '../src/services/subsectionTransferService.js'), 'utf8');
    const dependencies = {
      '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } },
      '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: '2026-11-02' }) },
      './catalogService': {}, './escalaService': {}, './monthlyReleaseService': {},
      './escalaEventService': { createOperationId: () => 'retry-op', appendEvent: async (_connection, event) => calls.push({ sql: 'EVENT', event }) }
    };
    vm.runInNewContext(source, { module: loaded, require: (name) => dependencies[name], Intl, Date, JSON, Set });
    const retry = () => loaded.exports.retryFailed({ lojaId: 35, escfuncId: 91, transfId: 7, actor: { sub: 1, login: 'admin' } });
    if (status === 'F') {
      assert.equal((await retry()).status, 'PENDENTE');
      assert.equal(calls.some(({ sql }) => /meses_gerados\s*=/.test(sql)), false);
      assert.equal(calls.find(({ sql }) => sql === 'EVENT').event.acao, 'RETOMAR_TRANSFERENCIA_SUBSECAO');
      assert.equal(calls.at(-1).sql, 'COMMIT');
    } else {
      await assert.rejects(retry, (error) => error.statusCode === 409);
      assert.equal(calls.some(({ sql }) => /set status = 'P'/.test(sql)), false);
      assert.equal(calls.at(-1).sql, 'ROLLBACK');
    }
  });
}
