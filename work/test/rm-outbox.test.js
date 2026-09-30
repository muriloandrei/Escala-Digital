const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService({ enabled, rows }) {
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push({ sql, binds });
      if (/from sgn_esc_rm_envio where operacao_id/i.test(sql)) return { rows };
      if (/from sgn_esc_rm_envio e/i.test(sql)) return { rows };
      if (/from sgn_esc_rm_envio\s+where status = 'PENDENTE'/i.test(sql)) return { rows };
      if (/update sgn_esc_rm_envio/i.test(sql)) return { rowsAffected: 1 };
      if (/user_tab_columns/i.test(sql)) return { rows: [{ COLUMN_NAME: 'CPF' }, { COLUMN_NAME: 'ATIVA' }] };
      if (/from sgn_esc_prog p/i.test(sql)) return { rows: [] };
      throw new Error(`Unexpected SQL: ${sql}`);
    },
    async commit() {}
  };
  const module = { exports: {} };
  const dependencies = {
    '../config/env': { getEnv: () => ({ rm: { enabled } }) },
    '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } },
    '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: '2026-10-05', fim: '2026-11-01' }) }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/rmIntegrationService.js'), 'utf8');
  vm.runInNewContext(source, { module, require: (name) => dependencies[name], console });
  return { service: module.exports, statements };
}

const envio = {
  ENVIO_ID: 41, LOJA: 35, MES_REF: new Date('2026-10-01T00:00:00Z'),
  ESCSECAO_ID: 2003, ESCFUNC_ID: 90, REVISAO: 7, STATUS: 'PENDENTE'
};

test('oficializacao com RM desabilitado preserva a pendencia', async () => {
  const { service, statements } = loadService({ enabled: false, rows: [envio] });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-1' });
  assert.equal(result.status, 'PENDENTE');
  assert.equal(result.pendentes, 1);
  assert.equal(statements.some(({ sql }) => /update sgn_esc_rm_envio/i.test(sql)), false);
});

test('administrador consulta pendencias de todas as lojas sem filtro', async () => {
  const { service, statements } = loadService({ enabled: false, rows: [envio] });
  const result = await service.listEnviosRm({ lojasPermitidas: null });
  assert.equal(result.length, 1);
  const query = statements.find(({ sql }) => /from sgn_esc_rm_envio e/i.test(sql));
  assert.doesNotMatch(query.sql, /where e\.loja/);
});

test('retomada lista apenas pendencias com limite e nao envia sem apply', async () => {
  const { service, statements } = loadService({ enabled: false, rows: [envio] });
  const result = await service.listPendenciasRm({ lojaId: 35, limit: 20 });
  assert.equal(result.length, 1);
  const query = statements.find(({ sql }) => /where status = 'PENDENTE'/i.test(sql));
  assert.equal(query.binds.limite, 20);
  assert.equal(query.binds.lojaId, 35);
  assert.match(query.sql, /order by dt_hr_incl, envio_id/i);
  await assert.rejects(service.processarPendenciasRm({ lojaId: 35 }), /Integracao RM desabilitada/);
  assert.equal(statements.some(({ sql }) => /update sgn_esc_rm_envio/i.test(sql)), false);
});

test('revisao aprovada ausente fica incerta e nao e marcada como enviada', async () => {
  const { service, statements } = loadService({ enabled: true, rows: [envio] });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-2' });
  assert.equal(result.status, 'INCERTO');
  assert.equal(result.falhas, 1);
  const updates = statements.filter(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.equal(updates.length, 2);
  assert.equal(updates[1].binds.status, 'INCERTO');
  assert.match(updates[1].binds.erro, /Programacao oficializada nao encontrada/);
});

function loadEscalaService({ failQueue = false } = {}) {
  const operations = [];
  const connection = {
    async execute(sql, binds) {
      if (/user_tab_columns/i.test(sql)) {
        return { rows: binds.tableName === 'SGN_ESC_SECAO'
          ? [{ COLUMN_NAME: 'STATUS' }] : [{ COLUMN_NAME: 'ATIVA' }] };
      }
      if (/select max\(p\.revisao\)/i.test(sql)) return { rows: [{ REVISAO: 7 }] };
      if (/select distinct p\.escfunc_id/i.test(sql)) return { rows: [{ ESCFUNC_ID: 90 }] };
      if (/select escfunc_id from sgn_esc_funcionario/i.test(sql)) return { rows: [{ ESCFUNC_ID: 90 }] };
      if (/select p\.escprog_id, p\.escfunc_id, p\.revisao/i.test(sql)) {
        return { rows: [{ ESCPROG_ID: 100, ESCFUNC_ID: 90, REVISAO: 7 }] };
      }
      if (/update sgn_esc_prog set oficializada/i.test(sql)) {
        operations.push('approve');
        return { rowsAffected: 1 };
      }
      if (/insert into sgn_esc_rm_envio/i.test(sql)) {
        operations.push('queue');
        if (failQueue) throw new Error('outbox unavailable');
        return { rowsAffected: 1 };
      }
      throw new Error(`Unexpected SQL: ${sql}`);
    },
    async commit() { operations.push('commit'); },
    async rollback() { operations.push('rollback'); }
  };
  const module = { exports: {} };
  const dependencies = {
    '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } },
    './catalogService': {},
    './escalaEventService': {
      createOperationId: () => 'op-queue',
      appendEvent: async () => { operations.push('event'); }
    },
    '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: '2026-10-05', fim: '2026-11-01' }) },
    '../utils/scheduleDiff': { buildDiaAlteracoes: () => [] }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8');
  vm.runInNewContext(source, { module, require: (name) => dependencies[name], console });
  return { service: module.exports, operations };
}

test('oficializacao grava pendencia e evento antes do commit', async () => {
  const { service, operations } = loadEscalaService();
  const result = await service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 });
  assert.equal(result.affectedRows, 1);
  assert.equal(result.operacaoId, 'op-queue');
  assert.deepEqual(operations, ['approve', 'queue', 'event', 'commit']);
});

test('falha ao registrar pendencia reverte a oficializacao', async () => {
  const { service, operations } = loadEscalaService({ failQueue: true });
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 }),
    /outbox unavailable/
  );
  assert.deepEqual(operations, ['approve', 'queue', 'rollback']);
});
