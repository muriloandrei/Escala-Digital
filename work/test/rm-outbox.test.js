const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService({ enabled, rows, scheduleRows = [], fetchImpl = null }) {
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push({ sql, binds });
      if (/from sgn_esc_rm_envio where operacao_id/i.test(sql)) return { rows };
      if (/from sgn_esc_rm_envio e/i.test(sql)) return { rows };
      if (/from sgn_esc_rm_envio e\s+left join sgn_esc_funcionario/i.test(sql)) return { rows };
      if (/select max\(p\.revisao\) revisao_atual/i.test(sql)) return { rows: [{ REVISAO_ATUAL: 7, OFICIALIZADA: scheduleRows.length ? 1 : 0 }] };
      if (/update sgn_esc_rm_envio/i.test(sql)) return { rowsAffected: 1 };
      if (/insert into sgn_esc_rm_log/i.test(sql)) return { rowsAffected: 1 };
      if (/user_tab_columns/i.test(sql)) return { rows: [{ COLUMN_NAME: 'CPF' }, { COLUMN_NAME: 'ATIVA' }] };
      if (/from sgn_esc_prog p/i.test(sql)) return { rows: scheduleRows };
      throw new Error(`Unexpected SQL: ${sql}`);
    },
    async commit() {}
  };
  const module = { exports: {} };
  const dependencies = {
    '../config/env': { getEnv: () => ({ rm: {
      enabled, baseUrl: 'http://localhost:1', retries: 0, timeoutMs: 1000,
      funcionarioPath: '/funcionario', folgasPath: '/folgas',
      folgasPostCodcoligada: '0', timezoneOffset: '-03:00'
    } }) },
    '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } },
    '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: '2026-10-05', fim: '2026-11-01' }) }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/rmIntegrationService.js'), 'utf8');
  vm.runInNewContext(source, {
    module, require: (name) => dependencies[name], console,
    fetch: fetchImpl || (() => { throw new Error('Fetch inesperado'); }),
    AbortController, setTimeout, clearTimeout
  });
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
  const query = statements.find(({ sql }) => /where e\.status = 'PENDENTE'/i.test(sql));
  assert.equal(query.binds.limite, 20);
  assert.equal(query.binds.lojaId, 35);
  assert.match(query.sql, /order by e\.dt_hr_incl, e\.envio_id/i);
  await assert.rejects(service.processarPendenciasRm({ lojaId: 35 }), /Integracao RM desabilitada/);
  assert.equal(statements.some(({ sql }) => /update sgn_esc_rm_envio/i.test(sql)), false);
});

test('diagnostico de incertos filtra somente erro CODTABFOLGA e mostra revisao atual', async () => {
  const { service, statements } = loadService({ enabled: false, rows: [envio] });
  await service.listPendenciasRm({ lojaId: 35, incertos: true, erroTipo: 'CODTABFOLGA' });
  const query = statements.find(({ sql }) => /where e\.status = 'INCERTO'/i.test(sql));
  assert.match(query.sql, /revisao_atual/);
  assert.equal(query.binds.erroTipo, '%CODTABFOLGA%');
  assert.equal(query.binds.lojaId, 35);
});

test('revisao aprovada ausente fica incerta e nao e marcada como enviada', async () => {
  const { service, statements } = loadService({ enabled: true, rows: [envio] });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-2' });
  assert.equal(result.status, 'INCERTO');
  assert.equal(result.falhas, 1);
  const updates = statements.filter(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.equal(updates.length, 1);
  assert.match(updates[0].sql, /status = 'SUPERADO'/);
  assert.match(updates[0].binds.erro, /revisao ativa mais recente/);
});

test('CODTABFOLGA ausente tenta tres consultas e sinaliza falha confirmada', async () => {
  let consultas = 0;
  const row = {
    ESCFUNC_ID: 90, CHAPA: '035.0090', CPF: '12345678901', CODCOLIGADA: 1,
    REVISAO: 7, DT: '2026-10-05', PROGRAMACAO: 'F', APOS_DEMISSAO: 0
  };
  const fetchImpl = async () => {
    consultas += 1;
    return { ok: true, status: 200, text: async () => JSON.stringify([{ CODSITUACAO: 'A' }]) };
  };
  const { service, statements } = loadService({ enabled: true, rows: [{ ...envio, MES_REF: '2026-10-01' }], scheduleRows: [row], fetchImpl });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-codtab' });
  assert.equal(consultas, 3);
  assert.equal(result.status, 'INCERTO');
  const updates = statements.filter(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.equal(updates[1].binds.status, 'FALHA');
  assert.match(updates[1].binds.erro, /CODTABFOLGA/);
});

test('usa CHAPA do retorno RM como CODTABFOLGA quando o campo nao vem na consulta', async () => {
  const row = {
    ESCFUNC_ID: 90, CHAPA: '035.0090', CPF: '12345678901', CODCOLIGADA: 1,
    REVISAO: 7, DT: '2026-10-05', PROGRAMACAO: 'F', APOS_DEMISSAO: 0
  };
  let enviado = null;
  const fetchImpl = async (url, options) => {
    if (url.includes('/funcionario')) {
      return { ok: true, status: 200, text: async () => JSON.stringify([{
        CPF: '12345678901', CODCOLIGADA: 1, CHAPA: '035.0090', CODSITUACAO: 'A'
      }]) };
    }
    if ((options.method || 'GET') === 'POST') {
      enviado = JSON.parse(options.body);
      return { ok: true, status: 200, text: async () => '{}' };
    }
    return { ok: true, status: 200, text: async () => JSON.stringify({
      messages: [{ code: '0003', type: 'info' }], data: null, length: 0
    }) };
  };
  const { service } = loadService({ enabled: true, rows: [{ ...envio, MES_REF: '2026-10-01' }], scheduleRows: [row], fetchImpl });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-chapa-fallback' });
  assert.equal(result.status, 'ENVIADO');
  assert.equal(enviado[0].CODTABFOLGA, '035.0090');
});

test('nao usa CHAPA divergente do retorno RM para enviar folgas', async () => {
  const row = {
    ESCFUNC_ID: 90, CHAPA: '035.0090', CPF: '12345678901', CODCOLIGADA: 1,
    REVISAO: 7, DT: '2026-10-05', PROGRAMACAO: 'F', APOS_DEMISSAO: 0
  };
  let posts = 0;
  const fetchImpl = async (_url, options) => {
    if ((options.method || 'GET') === 'POST') posts += 1;
    return { ok: true, status: 200, text: async () => JSON.stringify([{
      CPF: '12345678901', CODCOLIGADA: 1, CHAPA: '035.9999', CODSITUACAO: 'A'
    }]) };
  };
  const { service, statements } = loadService({ enabled: true, rows: [{ ...envio, MES_REF: '2026-10-01' }], scheduleRows: [row], fetchImpl });
  await service.processarOperacaoRm({ operacaoId: 'op-chapa-divergente' });
  assert.equal(posts, 0);
  const updates = statements.filter(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.equal(updates[1].binds.status, 'FALHA');
  assert.match(updates[1].binds.erro, /CHAPA correspondente/);
});

test('timeout no POST reconcilia no GET sem repetir uma escrita ja aplicada', async () => {
  const row = {
    ESCFUNC_ID: 90, CHAPA: '035.0090', CPF: '12345678901', CODCOLIGADA: 1,
    REVISAO: 7, DT: '2026-10-05', PROGRAMACAO: 'F', APOS_DEMISSAO: 0
  };
  let posts = 0;
  let consultasFolgas = 0;
  const fetchImpl = async (url, options) => {
    if (url.includes('/funcionario')) {
      return { ok: true, status: 200, text: async () => JSON.stringify([{ CODSITUACAO: 'A', CODTABFOLGA: '035.0090', CODCOLIGADA: 1 }]) };
    }
    if ((options.method || 'GET') === 'POST') {
      posts += 1;
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      throw error;
    }
    consultasFolgas += 1;
    const body = consultasFolgas === 1
      ? { messages: [{ code: '0003', type: 'info' }], data: null, length: 0 }
      : [{ DATA: '2026-10-05', CODCOLIGADA: 1, CODTABFOLGA: '035.0090',
        HORAINICIO: 0, HORAFIM: 1440, HORAINICIOSTR: '00:00', HORAFIMSTR: '24:00', CONSEXTRAINTER: 1 }];
    return { ok: true, status: 200, text: async () => JSON.stringify(body) };
  };
  const { service, statements } = loadService({ enabled: true, rows: [{ ...envio, MES_REF: '2026-10-01' }], scheduleRows: [row], fetchImpl });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-timeout' });
  assert.equal(result.status, 'ENVIADO', JSON.stringify({ posts, consultasFolgas, logs: statements.filter(({ sql }) => /insert into sgn_esc_rm_log/i.test(sql)).map(({ binds }) => binds) }));
  assert.equal(posts, 1);
  assert.equal(consultasFolgas, 2);
  const updates = statements.filter(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.equal(updates[1].binds.status, 'ENVIADO');
});

test('timeout no POST nao repete escrita quando GET ainda nao confirma', async () => {
  const row = {
    ESCFUNC_ID: 90, CHAPA: '035.0090', CPF: '12345678901', CODCOLIGADA: 1,
    REVISAO: 7, DT: '2026-10-05', PROGRAMACAO: 'F', APOS_DEMISSAO: 0
  };
  let posts = 0;
  let consultasFolgas = 0;
  const fetchImpl = async (url, options) => {
    if (url.includes('/funcionario')) {
      return { ok: true, status: 200, text: async () => JSON.stringify([{ CODSITUACAO: 'A', CODTABFOLGA: '035.0090', CODCOLIGADA: 1 }]) };
    }
    if ((options.method || 'GET') === 'POST') {
      posts += 1;
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      throw error;
    }
    consultasFolgas += 1;
    return { ok: true, status: 200, text: async () => JSON.stringify({
      messages: [{ code: '0003', type: 'info' }], data: null, length: 0
    }) };
  };
  const { service, statements } = loadService({ enabled: true, rows: [{ ...envio, MES_REF: '2026-10-01' }], scheduleRows: [row], fetchImpl });
  const result = await service.processarOperacaoRm({ operacaoId: 'op-timeout-stale' });
  assert.equal(result.status, 'INCERTO');
  assert.equal(posts, 1);
  assert.equal(consultasFolgas, 3);
  const updates = statements.filter(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.equal(updates[1].binds.status, 'INCERTO');
  assert.match(updates[1].binds.erro, /Timeout de escrita/);
});

function loadEscalaService({ failQueue = false, criticas = [], selectedIds = [90], dismissalDate = null,
  missingDay = null, periodStart = '2026-10-05', periodEnd = '2026-11-01' } = {}) {
  const operations = [];
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push({ sql, binds });
      if (/user_tab_columns/i.test(sql)) {
        return { rows: binds.tableName === 'SGN_ESC_SECAO'
          ? [{ COLUMN_NAME: 'STATUS' }] : [{ COLUMN_NAME: 'ATIVA' }] };
      }
      if (/select domingo_6h_habilitado from sgn_esc_loja/i.test(sql)) return { rows: [{ DOMINGO_6H_HABILITADO: 0 }] };
      if (/select max\(p\.revisao\)/i.test(sql)) return { rows: [{ REVISAO: 7 }] };
      if (/from sgn_esc_pendencia_func/i.test(sql)) return { rows: [] };
      if (/select distinct p\.escfunc_id/i.test(sql)) return { rows: [{ ESCFUNC_ID: 90 }] };
      if (/select escfunc_id, dt_demiss, status from sgn_esc_funcionario/i.test(sql)) return { rows: [{ ESCFUNC_ID: 90, DT_DEMISS: dismissalDate, STATUS: 'A' }] };
      if (/select p\.escprog_id, p\.escfunc_id, p\.revisao/i.test(sql)) {
        return { rows: selectedIds.map((id) => ({ ESCPROG_ID: 100 + id, ESCFUNC_ID: id, REVISAO: 7 })) };
      }
      if (/from sgn_esc_prog p\s+left join sgn_esc_funcionario f/i.test(sql)) {
        return { rows: Array.from({ length: 28 }, (_, index) => {
          const date = new Date(`${periodStart}T00:00:00Z`);
          date.setUTCDate(date.getUTCDate() + index);
          return { ESCFUNC_ID: 90, CHAPA: '000090', NOME: 'Teste', DT_DEMISS: dismissalDate,
            FUNCAO_DESCR: 'OPERADOR DE CAIXA', DT: date.toISOString().slice(0, 10),
            PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };
        }).filter((row) => row.DT !== missingDay) };
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
    '../domain/operationalPeriod': { getOperationalPeriodIso: () => ({ inicio: periodStart, fim: periodEnd }) },
    '../domain/officializationDates': require('../src/domain/officializationDates'),
    '../domain/fixedCarry': require('../src/domain/fixedCarry'),
    '../domain/portariaSection': require('../src/domain/portariaSection'),
    '../domain/employeeStatus': require('../src/domain/employeeStatus'),
    '../domain/sectionRollout': require('../src/domain/sectionRollout'),
    '../domain/shiftValidation': require('../src/domain/shiftValidation'),
    '../utils/scheduleDiff': { buildDiaAlteracoes: () => [] },
    '../rules/escalaRules': { validarCriticasEscopo: () => criticas }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8');
  const context = vm.createContext({ module, require: (name) => dependencies[name], console });
  vm.runInContext(source, context);
  vm.runInContext("getHojeIso = () => '2026-10-01';", context);
  return { service: module.exports, operations, statements };
}

test('oficializacao grava pendencia e evento antes do commit', async () => {
  const { service, operations } = loadEscalaService();
  const result = await service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 });
  assert.equal(result.affectedRows, 1);
  assert.equal(result.operacaoId, 'op-queue');
  assert.deepEqual(operations, ['approve', 'queue', 'event', 'commit']);
});

test('oficializacao ignora cabecalhos sem dias ao selecionar programacoes', async () => {
  const { service, statements } = loadEscalaService();
  await service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 });
  const selection = statements.find(({ sql }) => /select p\.escprog_id, p\.escfunc_id, p\.revisao/i.test(sql));
  assert.match(selection.sql, /exists \(select 1 from sgn_esc_prog_dia d where d\.escprog_id = p\.escprog_id\)/i);
});

test('falha ao registrar pendencia reverte a oficializacao', async () => {
  const { service, operations } = loadEscalaService({ failQueue: true });
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 }),
    /outbox unavailable/
  );
  assert.deepEqual(operations, ['approve', 'queue', 'rollback']);
});

test('criticas bloqueiam oficializacao sem enfileirar envio ao RM', async () => {
  const { service, operations } = loadEscalaService({ criticas: ['Teste: seis dias consecutivos.'] });
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 }),
    (error) => error.statusCode === 422 && error.details?.[0] === 'Teste: seis dias consecutivos.'
  );
  assert.deepEqual(operations, ['rollback']);
});

test('oficializacao da secao recusa um dia ausente na transacao', async () => {
  const { service, operations } = loadEscalaService({ missingDay: '2026-10-12' });
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 }),
    (error) => error.statusCode === 422 && /dias sem programacao/.test(error.message)
  );
  assert.deepEqual(operations, ['rollback']);
});

test('oficializacao com IDs recusa dia futuro ausente', async () => {
  const { service, operations } = loadEscalaService({ missingDay: '2026-10-12' });
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003, escfuncIds: [90] }),
    (error) => error.statusCode === 422 && /dias sem programacao/.test(error.message)
  );
  assert.deepEqual(operations, ['rollback']);
});

test('oficializacao de novembro ignora 01/11 ausente', async () => {
  const { service, operations } = loadEscalaService({
    missingDay: '2026-11-01', periodStart: '2026-11-01', periodEnd: '2026-11-08'
  });
  const result = await service.oficializarEscala({
    lojaId: 35, mesRef: '2026-11-01', escsecaoId: 2003, escfuncIds: [90]
  });
  assert.equal(result.affectedRows, 1);
  assert.deepEqual(operations, ['approve', 'queue', 'event', 'commit']);
});

test('envio RM pendente nao transmite dias posteriores a demissao', async () => {
  const { service, statements } = loadService({
    enabled: true,
    rows: [envio],
    scheduleRows: [{ ESCFUNC_ID: 90, DT: new Date('2026-10-05T00:00:00Z'), APOS_DEMISSAO: 1 }]
  });
  await assert.rejects(
    service.oficializarNoRm({ lojaId: 35, mesRef: '2026-10-01', revisao: 7, escfuncIds: [90], exigirEscala: true }),
    /Envio RM suspenso/
  );
  const query = statements.find(({ sql }) => /from sgn_esc_prog p/i.test(sql));
  assert.match(query.sql, /trunc\(d\.dt\) > trunc\(f\.dt_demiss\)/i);
});

test('demissao no RM bloqueia oficializacao de dias posteriores sem enfileirar envio', async () => {
  const { service, operations } = loadEscalaService({ dismissalDate: '2026-10-04' });
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003 }),
    (error) => error.statusCode === 422 && /demissao registrada no RM/i.test(error.message)
  );
  assert.deepEqual(operations, ['rollback']);
});

test('funcionario solicitado sem escala ativa bloqueia oficializacao', async () => {
  const { service, operations } = loadEscalaService();
  await assert.rejects(
    service.oficializarEscala({ lojaId: 35, mesRef: '2026-10-01', escsecaoId: 2003, escfuncIds: [90, 91] }),
    (error) => error.statusCode === 422 && error.details?.[0]?.includes('91')
  );
  assert.deepEqual(operations, ['rollback']);
});

test('edicao apos oficializacao supera envio pendente na mesma transacao', async () => {
  const statements = [];
  const module = { exports: {} };
  const dependencies = {
    '../db/oracle': { withConnection: async () => {}, oracledb: { OUT_FORMAT_OBJECT: 1 } },
    './catalogService': {},
    './escalaEventService': { appendEvent: async () => statements.push('event') },
    '../domain/operationalPeriod': {},
    '../domain/officializationDates': require('../src/domain/officializationDates'),
    '../domain/fixedCarry': require('../src/domain/fixedCarry'),
    '../domain/portariaSection': require('../src/domain/portariaSection'),
    '../domain/employeeStatus': require('../src/domain/employeeStatus'),
    '../domain/sectionRollout': require('../src/domain/sectionRollout'),
    '../domain/shiftValidation': require('../src/domain/shiftValidation'),
    '../utils/scheduleDiff': { buildDiaAlteracoes: () => [{ data: '2026-10-05' }] },
    '../rules/escalaRules': { validarCriticasEscopo: () => [] }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8');
  vm.runInNewContext(source, { module, require: (name) => dependencies[name], console });
  await module.exports._private.appendMudancaEscala({
    async execute(sql, binds) {
      assert.match(sql, /set status = 'SUPERADO'/);
      assert.match(sql, /status = 'PENDENTE'/);
      assert.equal(binds.revisaoAnterior, 7);
      statements.push('outbox');
    }
  }, {
    lojaId: 35, mesRef: '2026-10-01', funcionario: { escfuncId: 90 },
    anteriores: [{}], novos: [{}], revisaoAnterior: 7, revisaoNova: 8,
    situacao: 'POS_OFICIALIZACAO'
  });
  assert.deepEqual(statements, ['outbox', 'event']);
});
