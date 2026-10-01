const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { appendEvent, createOperationId } = require('../src/services/escalaEventService');
const { buildEscalaSnapshots, buildFixoSnapshots,
  _private: { assertEscalaSnapshot, assertFixoSnapshot, situacaoDaAlteracao } } = require('../src/services/escalaService');

test('schedule event is part of the caller transaction and keeps complete details', async () => {
  let captured;
  const connection = {
    async execute(sql, binds, options) {
      captured = { sql, binds, options };
      return { rowsAffected: 1 };
    }
  };
  const detail = 'A'.repeat(3000);
  await appendEvent(connection, {
    operacaoId: createOperationId(), lojaId: 35, mesRef: '2026-10-01',
    escsecaoId: 20, escfuncId: 100, actor: { sub: 42, login: 'lider35' },
    acao: 'EDITAR_DIA_ESCALA', origem: 'USUARIO',
    detalhe: { alteracoes: [{ antes: null, depois: detail }] }
  });
  assert.equal(captured.options.autoCommit, false);
  assert.match(captured.sql, /insert into sgn_esc_evento/i);
  assert.equal(JSON.parse(captured.binds.detalhe.val).alteracoes[0].depois, detail);
  assert.equal(captured.binds.usuarioId, 42);
  assert.equal(captured.binds.login, 'lider35');
  assert.match(captured.sql, /escsubsecao_id/);
});

test('schedule event insert failure reaches the caller for rollback', async () => {
  const connection = { async execute() { throw new Error('audit unavailable'); } };
  await assert.rejects(
    appendEvent(connection, { operacaoId: createOperationId(), lojaId: 35, mesRef: '2026-10-01', acao: 'TESTE' }),
    /audit unavailable/
  );
});

test('consulta de eventos restringe a secao solicitada e as permissoes do usuario', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaEventService.js'), 'utf8');
  let captured;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module,
    require(name) {
      if (name === 'node:crypto') return { randomUUID: () => 'op' };
      if (name === '../db/oracle') return {
        oracledb: { OUT_FORMAT_OBJECT: 1, STRING: 2 },
        withConnection: async (work) => work({
          async execute(sql, binds) {
            captured = { sql, binds };
            return /count\(distinct/i.test(sql)
              ? { rows: [{ COLABORADORES: 12, TOTAL: 30, MANUAIS: 8, ANTES: 10, DEPOIS: 4 }] }
              : { rows: [] };
          }
        })
      };
      throw new Error(`Dependencia inesperada: ${name}`);
    }
  });
  await module.exports.listEvents({
    lojasPermitidas: [35], secoesPermitidas: [2003], lojaId: 35,
    mesRef: '2026-10-01', escsecaoId: 2003
  });
  assert.match(captured.sql, /e\.escsecao_id in \(:secao0\)/);
  assert.match(captured.sql, /e\.escsecao_id = :escsecaoId/);
  assert.match(captured.sql, /e\.acao <> 'CONFIRMAR_RASCUNHO'/);
  assert.equal(captured.binds.secao0, 2003);
  assert.equal(captured.binds.escsecaoId, 2003);
  const resumo = await module.exports.summarizeEvents({
    lojasPermitidas: [35], secoesPermitidas: [2003], lojaId: 35,
    mesRef: '2026-10-01', escsecaoId: 2003
  });
  assert.equal(resumo.colaboradores, 12);
  assert.equal(resumo.total, 30);
  assert.equal(resumo.depois, 4);
  assert.match(captured.sql, /e\.escsecao_id = :escsecaoId/);
});

test('filtros de auditoria restringem lista e resumo no servidor', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaEventService.js'), 'utf8');
  const queries = [];
  const loaded = { exports: {} };
  vm.runInNewContext(source, {
    module: loaded,
    require(name) {
      if (name === 'node:crypto') return { randomUUID: () => 'op' };
      if (name === '../db/oracle') return {
        oracledb: { OUT_FORMAT_OBJECT: 1, STRING: 2 },
        withConnection: async (work) => work({
          async execute(sql, binds) {
            queries.push({ sql, binds });
            return { rows: [] };
          }
        })
      };
      throw new Error(name);
    }
  });
  const scope = {
    lojasPermitidas: [35], secoesPermitidas: [2003], lojaId: 35,
    escsubsecaoId: 804, acao: 'EDITAR_DIA_ESCALA', origem: 'USUARIO', situacao: 'RASCUNHO',
    login: 'Lider35', funcionario: 'Ana'
  };
  await loaded.exports.listEvents(scope);
  await loaded.exports.summarizeEvents(scope);
  assert.equal(queries.length, 2);
  for (const { sql, binds } of queries) {
    assert.match(sql, /e\.acao = :acao/);
    assert.match(sql, /e\.origem = :origem/);
    assert.match(sql, /e\.situacao = :situacao/);
    assert.match(sql, /e\.escsecao_id in \(:secao0\)/);
    assert.match(sql, /e\.escsubsecao_id = :escsubsecaoId/);
    assert.match(sql, /f_filter\.escfunc_id = e\.escfunc_id/);
    assert.equal(binds.login, '%LIDER35%');
    assert.equal(binds.funcionarioNome, '%ANA%');
    assert.equal(binds.escsubsecaoId, 804);
  }
});

test('generation detects a concurrent day edit even without a revision change', () => {
  const base = buildEscalaSnapshots([{
    ESCFUNC_ID: 100, REVISAO: 3, DT: new Date(2026, 9, 12),
    PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '12:00',
    HR_ENT2: '13:10', HR_SAI2: '17:58'
  }])[100];
  const current = { revisao: 3, dias: [{
    DT: new Date(2026, 9, 12), PROGRAMACAO: 'TRB',
    HR_ENT1: '09:00', HR_SAI1: '13:00', HR_ENT2: '14:10', HR_SAI2: '18:58'
  }] };
  assert.throws(() => assertEscalaSnapshot(base, current, { escfuncId: 100 }),
    (error) => error.statusCode === 409);
});

test('generation accepts an unchanged employee snapshot and detects a new competing schedule', () => {
  assert.doesNotThrow(() => assertEscalaSnapshot(null, null, { escfuncId: 100 }));
  assert.throws(() => assertEscalaSnapshot(null, { revisao: 0, dias: [] }, { escfuncId: 100 }),
    (error) => error.statusCode === 409);
});

test('generation rejects a fixed rest changed after its source snapshot', () => {
  const original = buildFixoSnapshots([{
    ESCFUNC_ID: 100, DT: new Date(2026, 9, 12), PROGRAMACAO: 'FXF'
  }])[100];
  const changed = buildFixoSnapshots([{
    ESCFUNC_ID: 100, DT: new Date(2026, 9, 13), PROGRAMACAO: 'FXF'
  }])[100];
  assert.doesNotThrow(() => assertFixoSnapshot(original, original, { escfuncId: 100 }));
  assert.throws(() => assertFixoSnapshot(original, changed, { escfuncId: 100 }),
    (error) => error.statusCode === 409);
});

test('event situation distinguishes creation, draft and post-officialization edits', () => {
  assert.equal(situacaoDaAlteracao(null), 'CRIACAO');
  assert.equal(situacaoDaAlteracao({ header: { OFICIALIZADA: 0 } }), 'RASCUNHO');
  assert.equal(situacaoDaAlteracao({ header: { OFICIALIZADA: 1 } }), 'POS_OFICIALIZACAO');
  assert.equal(situacaoDaAlteracao({ header: { OFICIALIZADA: 0 } }, 1), 'OFICIALIZADA');
});
