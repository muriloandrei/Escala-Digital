const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, evaluateState, deactivateSource } = require('../scripts/corrigir-escala-portaria-operador-311');

function state(overrides = {}) {
  return {
    source: {
      ESCPROG_ID: 80715, ESCFUNC_ID: 21632, LOJA: 311, MES_REF: '2026-11-01',
      ESCSECAO_ID: 5444, REVISAO: 17, ATIVA: 1, OFICIALIZADA: 0,
      SECAO_ANTIGA_CODIGO: '311.02.012', FILIAL_ANTIGA: 311,
      FUNCAO_PROGRAMADA: 'PORTEIRO', LOJA_ATUAL: 311, SECAO_ATUAL_ID: 5442,
      FUNCIONARIO_STATUS: 'A', DT_DEMISS: null, SECAO_ATUAL_CODIGO: '311.02.002',
      FILIAL_ATUAL: 311, SECAO_ATUAL_STATUS: 'A', FUNCAO_ATUAL: 'OPERADOR DE SUPERMERCADO',
      DIAS: 35, DIAS_FUTUROS: 35,
      ...overrides
    },
    active: [{ ESCPROG_ID: 80715, ESCSECAO_ID: 5444, REVISAO: 17, OFICIALIZADA: 0, DIAS: 35 }]
  };
}

test('specific correction is preview-only unless apply and operator are explicit', () => {
  assert.deepEqual(parseArgs([]), { apply: false, actor: null });
  assert.deepEqual(parseArgs(['--apply', '--by=opc']), { apply: true, actor: 'opc' });
  assert.throws(() => parseArgs(['--apply']), /--by=OPERADOR/);
});

test('only the exact future, nonofficialized Porteiro draft may be deactivated', () => {
  assert.equal(evaluateState(state()).action, 'DESATIVAR_E_GERAR');
  assert.equal(evaluateState(state({ DIAS_FUTUROS: 34 })).action, 'BLOQUEADA');
  assert.equal(evaluateState(state({ OFICIALIZADA: 1 })).action, 'BLOQUEADA');
  assert.equal(evaluateState(state({ OFICIALIZADA: null })).action, 'BLOQUEADA');
  assert.equal(evaluateState(state({ ATIVA: null })).action, 'BLOQUEADA');
  assert.equal(evaluateState(state({ ESCPROG_ID: 80716 })).action, 'BLOQUEADA');
  assert.equal(evaluateState(state({ SECAO_ATUAL_CODIGO: '311.02.012' })).action, 'BLOQUEADA');
  assert.equal(evaluateState(state({ FUNCAO_ATUAL: 'PORTEIRO' })).action, 'BLOQUEADA');
  const competing = state();
  competing.active.push({ ESCPROG_ID: 90000, ESCSECAO_ID: 5442, DIAS: 35 });
  assert.equal(evaluateState(competing).action, 'BLOQUEADA');
});

test('a retry generates only when old draft is inactive and no new scale exists', () => {
  const retry = state({ ATIVA: 0, DIAS_FUTUROS: 34 });
  retry.active = [];
  assert.equal(evaluateState(retry).action, 'GERAR');
  retry.active = [{ ESCPROG_ID: 90000, ESCSECAO_ID: 5442, DIAS: 35, OFICIALIZADA: 0 }];
  assert.equal(evaluateState(retry).action, 'CONCLUIDA');
});

function fakeConnection(snapshot, calls) {
  return {
    async execute(sql) {
      if (sql.includes('for update')) { calls.push('LOCK'); return { rows: [] }; }
      if (sql.includes('from sgn_esc_prog p') && sql.includes('join sgn_esc_funcionario f')) {
        return { rows: [snapshot.source] };
      }
      if (sql.includes('from sgn_esc_prog p') && sql.includes('nvl(p.ativa, 1) = 1')) {
        return { rows: snapshot.active };
      }
      if (sql.includes('update sgn_esc_prog set ativa = 0')) {
        calls.push('UPDATE');
        return { rowsAffected: 1 };
      }
      throw new Error(`SQL inesperado: ${sql}`);
    },
    async commit() { calls.push('COMMIT'); },
    async rollback() { calls.push('ROLLBACK'); }
  };
}

test('old schedule is deactivated with audit in one transaction', async () => {
  const calls = [];
  const result = await deactivateSource(fakeConnection(state(), calls), 'opc', async () => {
    calls.push('EVENT');
  });
  assert.equal(result, 'GERAR');
  assert.deepEqual(calls, ['LOCK', 'LOCK', 'UPDATE', 'EVENT', 'COMMIT']);
});

test('audit failure rolls back the deactivation', async () => {
  const calls = [];
  await assert.rejects(
    deactivateSource(fakeConnection(state(), calls), 'opc', async () => {
      calls.push('EVENT');
      throw new Error('auditoria indisponivel');
    }),
    /auditoria indisponivel/
  );
  assert.deepEqual(calls, ['LOCK', 'LOCK', 'UPDATE', 'EVENT', 'ROLLBACK']);
});

test('retry does not deactivate or audit the same schedule twice', async () => {
  const calls = [];
  const retry = state({ ATIVA: 0 });
  retry.active = [];
  const result = await deactivateSource(fakeConnection(retry, calls), 'opc', async () => {
    calls.push('EVENT');
  });
  assert.equal(result, 'GERAR');
  assert.deepEqual(calls, ['LOCK', 'LOCK']);
});
