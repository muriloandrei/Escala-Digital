const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

process.env.JWT_SECRET ||= 'test-secret';
process.env.ORACLE_USER ||= 'test';
process.env.ORACLE_PASSWORD ||= 'test';
process.env.ORACLE_CONNECT_STRING ||= 'localhost/XEPDB1';

const { parseArgs, snapshotCandidatos } = require('../scripts/reenviar-revisoes-rm');

function loadService(candidates = [], { scheduleRows = [], fetchImpl = null } = {}) {
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push({ sql, binds });
      if (/user_tab_columns/i.test(sql)) return { rows: [{ COLUMN_NAME: 'ATIVA' }, { COLUMN_NAME: 'CPF' }] };
      if (/insert into sgn_esc_rm_log/i.test(sql)) return { rowsAffected: 1 };
      if (/update sgn_esc_rm_envio/i.test(sql)) return { rowsAffected: 1 };
      if (/group by p\.escfunc_id/i.test(sql)) return { rows: candidates };
      if (/from sgn_esc_prog p/i.test(sql)) return { rows: scheduleRows };
      throw new Error(`Unexpected SQL: ${sql}`);
    },
    async commit() {}
  };
  const module = { exports: {} };
  const context = vm.createContext({
    module, console, AbortController, setTimeout, clearTimeout,
    fetch: fetchImpl || (() => { throw new Error('Fetch inesperado'); }),
    require(name) {
      if (name === 'node:crypto') return { randomUUID: () => 'reenvio-test' };
      if (name === '../config/env') return { getEnv: () => ({ rm: {
        enabled: true, baseUrl: 'http://localhost:1', retries: 0, timeoutMs: 1000,
        funcionarioPath: '/funcionario', folgasPath: '/folgas', folgasMasterPath: '/folgas-mestre',
        folgasPostCodcoligada: '1', timezoneOffset: '-03:00'
      } }) };
      if (name === '../db/oracle') return { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } };
      if (name === '../domain/operationalPeriod') return require('../src/domain/operationalPeriod');
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/rmIntegrationService.js'), 'utf8'), context);
  return { service: module.exports, context, statements, connection };
}

const candidate = { ESCFUNC_ID: 90, CHAPA: '306.0090', NOME: 'FUNCIONARIO', ESCSECAO_ID: 300,
  REVISAO: 12, OFICIALIZADA: 0, CABECALHOS: 1, DIAS: 29, FOLGAS: 8,
  DIAS_APOS_DEMISSAO: 0, TEM_CPF: 1 };

test('preview da loja 306 consulta ultima revisao ativa e apenas 01 a 29 de novembro', async () => {
  const { service, statements } = loadService([candidate]);
  const result = await service.listarCandidatosReenvioRm({ lojaId: 306, mesRef: '2026-11-01' });
  assert.equal(result.length, 1);
  assert.equal(result[0].BLOQUEIO, null);
  assert.equal(result[0].OFICIALIZADA, 0);
  const query = statements.find(({ sql }) => /group by p\.escfunc_id/i.test(sql));
  assert.equal(query.binds.inicio, '2026-11-01');
  assert.equal(query.binds.fim, '2026-11-29');
  assert.match(query.sql, /max\(px\.revisao\)/i);
  assert.match(query.sql, /nvl\(px\.ativa, 1\) = 1/i);
  assert.doesNotMatch(query.sql, /p\.oficializada\s*=\s*1/i);
});

test('reenvio aceita revisao nao oficializada sem criar nova revisao', async () => {
  const { service, context } = loadService([candidate]);
  vm.runInContext('oficializarNoRm = async (args) => { globalThis.sent = args; return { enabled: true, enviados: 8, falhas: 0 }; }', context);
  const result = await service.reenviarRevisaoAtualRm({ lojaId: 306, mesRef: '2026-11-01', escfuncId: 90, revisaoEsperada: 12 });
  assert.equal(result.status, 'ENVIADO');
  assert.equal(result.oficializada, false);
  assert.equal(context.sent.incluirNaoOficializada, true);
  assert.equal(context.sent.exigirRevisaoAtual, true);
  assert.equal(context.sent.revisao, 12);
  assert.deepEqual(Array.from(context.sent.escfuncIds), [90]);
});

test('reenvio nao oficializado faz GET e POST apenas das folgas do periodo de novembro', async () => {
  const payloads = [];
  const fetchImpl = async (url, options) => {
    if (url.includes('/funcionario')) return { ok: true, status: 200, text: async () => JSON.stringify([{
      CPF: '12345678901', CODCOLIGADA: 1, CHAPA: '306.0090', CODSITUACAO: 'A'
    }]) };
    if (options.method === 'POST') payloads.push(JSON.parse(options.body));
    return { ok: true, status: 200, text: async () => JSON.stringify({
      messages: [{ code: '0003', type: 'info' }], data: null, length: 0
    }) };
  };
  const scheduleRows = ['2026-11-01', '2026-11-29'].map((date) => ({
    ESCFUNC_ID: 90, CHAPA: '306.0090', CPF: '12345678901', CODCOLIGADA: 1,
    REVISAO: 12, DT: date, PROGRAMACAO: 'F', APOS_DEMISSAO: 0
  }));
  const { service, statements } = loadService([candidate], { scheduleRows, fetchImpl });
  const result = await service.reenviarRevisaoAtualRm({ lojaId: 306, mesRef: '2026-11-01', escfuncId: 90, revisaoEsperada: 12 });
  assert.equal(result.status, 'ENVIADO');
  assert.equal(payloads.length, 1);
  assert.deepEqual(payloads[0].map((item) => item.DATA.slice(0, 10)), ['2026-11-01', '2026-11-29']);
  assert.equal(statements.some(({ sql }) => /insert into sgn_esc_prog/i.test(sql)), false);
  assert.equal(statements.some(({ sql }) => /update sgn_esc_rm_envio/i.test(sql)), false);
  assert.equal(statements.filter(({ sql }) => /insert into sgn_esc_rm_log/i.test(sql)).length, 1);
});

test('reenvio de revisao oficializada confirma a pendencia atual como enviada', async () => {
  const { service, context, statements } = loadService([{ ...candidate, OFICIALIZADA: 1 }]);
  vm.runInContext('oficializarNoRm = async () => ({ enabled: true, enviados: 8, falhas: 0 });', context);
  const result = await service.reenviarRevisaoAtualRm({ lojaId: 306, mesRef: '2026-11-01', escfuncId: 90, revisaoEsperada: 12 });
  assert.equal(result.status, 'ENVIADO');
  const update = statements.find(({ sql }) => /update sgn_esc_rm_envio/i.test(sql));
  assert.match(update.sql, /status = 'ENVIADO'/);
  assert.equal(update.binds.revisao, 12);
});

test('reenvio bloqueia revisao alterada, duplicada ou com dia apos demissao', async () => {
  const { service } = loadService([candidate]);
  await assert.rejects(service.reenviarRevisaoAtualRm({ lojaId: 306, mesRef: '2026-11-01', escfuncId: 90, revisaoEsperada: 11 }), /Revisao ativa mudou/);
  const duplicate = loadService([{ ...candidate, CABECALHOS: 2 }]);
  await assert.rejects(duplicate.service.reenviarRevisaoAtualRm({ lojaId: 306, mesRef: '2026-11-01', escfuncId: 90, revisaoEsperada: 12 }), /ambigua/);
  const dismissed = loadService([{ ...candidate, DIAS_APOS_DEMISSAO: 1 }]);
  await assert.rejects(dismissed.service.reenviarRevisaoAtualRm({ lojaId: 306, mesRef: '2026-11-01', escfuncId: 90, revisaoEsperada: 12 }), /demissao/);
});

test('consulta RM exige revisao corrente exata ao reenviar manualmente', async () => {
  const { service, statements, connection } = loadService();
  await service._private.getEscalaParaRm(connection, { lojaId: 306, mesRef: '2026-11-01', revisao: 12,
    escfuncIds: [90], exigirRevisaoAtual: true });
  const query = statements.find(({ sql }) => /select p\.loja, p\.mes_ref/i.test(sql));
  assert.match(query.sql, /p\.revisao = :revisao/i);
  assert.doesNotMatch(query.sql, /px\.revisao <= :revisao/i);
  assert.equal(query.binds.inicio, '2026-11-01');
  assert.equal(query.binds.fim, '2026-11-29');
});

test('CLI exige previa congelada e operador antes de aplicar', () => {
  assert.deepEqual(parseArgs(['--loja=306', '--mes=2026-11']), {
    lojaId: 306, mesRef: '2026-11-01', apply: false, operador: null, snapshot: null
  });
  const hash = snapshotCandidatos([candidate]);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(snapshotCandidatos([{ ...candidate, REVISAO: 13 }]) === hash, false);
  assert.equal(parseArgs(['--loja=306', '--mes=2026-11', '--apply', '--by=opc', `--snapshot=${hash}`]).snapshot, hash);
  assert.throws(() => parseArgs(['--loja=306', '--mes=2026-11', '--apply', '--by=opc']), /Use --loja/);
});

test('endpoints de consulta e reenvio sao exclusivos do Admin', () => {
  const router = require('../src/routes/escalaRoutes');
  for (const routePath of ['/rm/reenvio-candidatos', '/rm/reenviar-revisao']) {
    const route = router.stack.find((layer) => layer.route?.path === routePath).route;
    const response = { statusCode: 200, body: null,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; } };
    route.stack[0].handle({ user: { perfil: 'RH' } }, response, () => { throw new Error('RH nao deve passar.'); });
    assert.equal(response.statusCode, 403);
    assert.match(response.body.error, /administradores/);
  }
});
