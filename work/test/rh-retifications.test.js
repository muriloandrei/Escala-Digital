const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const router = require('../src/routes/escalaRoutes');

function loadService(execute) {
  const statements = [];
  const connection = {
    async execute(sql, binds, options) {
      statements.push({ sql, binds, options });
      return execute(sql, binds);
    },
    async commit() { statements.push({ sql: 'COMMIT' }); },
    async rollback() { statements.push({ sql: 'ROLLBACK' }); }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/rhRetificationService.js'), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module,
    require(name) {
      if (name === '../db/oracle') return {
        withConnection: async (work) => work(connection),
        oracledb: { OUT_FORMAT_OBJECT: 1, STRING: 2 }
      };
      if (name === './escalaEventService') return { appendEvent: async () => statements.push({ sql: 'EVENT' }), createOperationId: () => 'op' };
      throw new Error(name);
    }
  });
  return { service: module.exports, statements };
}

test('RH queue uses post-officialization user events and keeps review status per changed day', async () => {
  const { service, statements } = loadService((sql) => /count\(\*\) as total/i.test(sql)
    ? { rows: [{ TOTAL: 4, PENDENTES: 2, CONFERIDAS: 1, CONTESTADAS: 1, CONFERIDAS_HOJE: 1, TROCAS_FOLGA: 2 }] }
    : { rows: [{ EVENTO_ID: 42, LOJA: 35, MES_REF: '2026-11-01', ESCSECAO_ID: 5, ESCFUNC_ID: 10,
      LOGIN: 'LIDER35', DT_HR_INCL: '2026-11-05T12:00:00', DIA: '2026-11-08',
      ANTES_PROG: 'TRB', NOVO_PROG: 'F', FUNCIONARIO_NOME: 'ANA', FUNCIONARIO_CHAPA: '035.0001',
      SECAO_NOME: 'Frente de Caixa', FUNCAO_NOME: 'OPERADOR', STATUS: null,
      DETALHE: JSON.stringify({ alteracoes: [{ data: '2026-11-08', anterior: { programacao: 'TRB' },
        novo: { programacao: 'F' }, justificativa: 'Troca de folga' }] }) }] });
  const result = await service.listRetifications({ lojaId: 35, mesRef: '2026-11-01', status: 'PENDENTE', search: 'Ana' });
  assert.equal(result.summary.pendentes, 2);
  assert.equal(result.rows[0].dia, '2026-11-08');
  assert.equal(result.rows[0].status, 'PENDENTE');
  assert.equal(result.rows[0].trocaFolga, true);
  assert.equal(result.rows[0].justificativa, 'Troca de folga');
  assert.match(statements[1].sql, /e\.loja = :lojaId/);
  assert.match(statements[1].sql, /e\.situacao = 'POS_OFICIALIZACAO'/);
  assert.match(statements[1].sql, /e\.origem = 'USUARIO'/);
  assert.match(statements[1].sql, /v\.status is null/);
  assert.equal(statements[1].binds.search, '%ANA%');
});

test('review writes a single pending day and contest creates a leader-visible event atomically', async () => {
  const { service, statements } = loadService((sql) => {
    if (/from sgn_esc_evento\s+where evento_id/i.test(sql)) return { rows: [{
      EVENTO_ID: 42, LOJA: 35, MES_REF: '2026-11-01', ESCSECAO_ID: 5, ESCFUNC_ID: 10,
      DETALHE: JSON.stringify({ alteracoes: [{ data: '2026-11-08' }] })
    }] };
    if (/select status from sgn_esc_rh_visto/i.test(sql)) return { rows: [] };
    return { rowsAffected: 1 };
  });
  const result = await service.reviewRetifications({ lojaId: 35, items: [{ eventoId: 42, dia: '2026-11-08' }],
    status: 'CONTESTADO', motivo: 'INTERJORNADA', observacao: 'Conferir descanso', actor: { sub: 7, login: 'RH35' } });
  assert.equal(result.reviewed, 1);
  assert.equal(statements.filter((item) => item.sql === 'COMMIT').length, 1);
  assert.equal(statements.filter((item) => item.sql === 'EVENT').length, 1);
  assert.equal(statements.find((item) => /insert into sgn_esc_rh_visto/i.test(item.sql)).binds.revisorLogin, 'RH35');
});

test('review refuses an already reviewed day without partial commit', async () => {
  const { service, statements } = loadService((sql) => {
    if (/from sgn_esc_evento\s+where evento_id/i.test(sql)) return { rows: [{
      DETALHE: JSON.stringify({ alteracoes: [{ data: '2026-11-08' }] })
    }] };
    if (/select status from sgn_esc_rh_visto/i.test(sql)) return { rows: [{ STATUS: 'CONFERIDO' }] };
    return { rows: [] };
  });
  await assert.rejects(service.reviewRetifications({ lojaId: 35, items: [{ eventoId: 42, dia: '2026-11-08' }],
    status: 'CONFERIDO', actor: { sub: 7, login: 'RH35' } }), /ja foi analisada/);
  assert.ok(statements.some((item) => item.sql === 'ROLLBACK'));
  assert.ok(!statements.some((item) => item.sql === 'COMMIT'));
});

test('review rejects a day outside the requested store', async () => {
  const { service, statements } = loadService(() => ({ rows: [] }));
  await assert.rejects(service.reviewRetifications({ lojaId: 35, items: [{ eventoId: 42, dia: '2026-11-08' }],
    status: 'CONFERIDO', actor: { sub: 7, login: 'RH35' } }), /nao encontrada/);
  assert.ok(statements.some((item) => item.sql === 'ROLLBACK'));
  assert.ok(!statements.some((item) => /insert into sgn_esc_rh_visto/i.test(item.sql)));
});

test('RH queue endpoints reject non-RH profiles', () => {
  for (const method of ['get', 'post']) {
    const route = router.stack.find((layer) => layer.route?.path === (method === 'get' ? '/retificacoes-rh' : '/retificacoes-rh/conferir')
      && layer.route.methods[method]).route;
    const guard = route.stack[0].handle;
    let nextCalled = false;
    const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    guard({ user: { perfil: 'LIDER' } }, response, () => { nextCalled = true; });
    assert.equal(response.code, 403);
    assert.equal(nextCalled, false);
    guard({ user: { perfil: 'RH' } }, response, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  }
});
