const test = require('node:test');
const assert = require('node:assert/strict');

const { _private } = require('../src/services/escalaService');

test('reconciliacao RM mantem folga RM e remove folga local ausente no RM', () => {
  const atual = [
    { DT: '2026-08-14', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-08-15', HR_ENT1: 'F', HR_SAI1: 'F', HR_ENT2: 'F', HR_SAI2: 'F', PROGRAMACAO: 'F' },
    { DT: '2026-08-16', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' }
  ];

  const result = _private.montarDiasReconciliadosRm(atual, ['2026-08-14']);

  assert.equal(result.alteracoes.length, 2);
  assert.deepEqual(result.dias.map((dia) => dia.programacao), ['F', 'TRB', 'TRB']);
  assert.equal(result.dias[1].hrEnt1, '08:00');
});

test('detecta alteracao manual em dia bloqueado', () => {
  const atual = [
    { DT: '2026-08-12', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-08-14', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' }
  ];
  const novo = [
    { data: '2026-08-12', hrEnt1: null, hrSai1: null, hrEnt2: null, hrSai2: null, programacao: 'F' },
    { data: '2026-08-14', hrEnt1: null, hrSai1: null, hrEnt2: null, hrSai2: null, programacao: 'F' }
  ];

  assert.deepEqual(_private.getAlteracoesDiasBloqueados(atual, novo, '2026-08-13'), ['2026-08-12']);
});
