const test = require('node:test');
const assert = require('node:assert/strict');
const { _private: { projetarDiasAusentes } } = require('../src/services/escalaService');
const { agruparCriticasPorSubsecao } = require('../src/rules/escalaRules');

const employee = {
  ESCFUNC_ID: 42, CHAPA: '010.0042', NOME: 'Funcionario afastado',
  ESCSECAO_ID: 20, COD_SECAO: '010.02.002', SECAO_DESCR: 'Frente de Caixa',
  ESCSUBSECAO_ID: 3, SUBSECAO_DESCR: 'Caixa', STATUS: 'A'
};

test('full-period absence appears as protected AFA without persisting days or creating critiques', () => {
  const days = projetarDiasAusentes([], [employee], [{
    ESCFUNC_ID: 42, DT_INIC: new Date(2026, 10, 1), DT_FIM: new Date(2026, 11, 31), MOTIVO: 'AFASTAMENTO'
  }], '2026-11-02', '2026-12-06');
  assert.equal(days.length, 35);
  assert.equal(days[0].DT, '2026-11-02');
  assert.equal(days.at(-1).DT, '2026-12-06');
  assert.ok(days.every((day) => day.PROGRAMACAO === 'AFA' && day.HR_ENT1 === 'AFA'
    && day.AUSENCIA_OBRIGATORIA === 1 && day.AUSENCIA_PROJETADA === 1
    && day.ESCSECAO_ID === 20 && day.ESCSUBSECAO_ID === 3 && !day.ESCPROGDIA_ID));
  const groups = agruparCriticasPorSubsecao({ escala: {
    secoes: [{ ESCSECAO_ID: 20, DESCR: 'Frente de Caixa' }],
    funcionarios: [employee], dias: days
  } });
  assert.deepEqual(groups, []);
});

test('absence projection fills only missing covered days and retains FER for vacation', () => {
  const days = projetarDiasAusentes([{
    ESCFUNC_ID: 42, ESCSECAO_ID: 20, DT: '2026-11-03', ESCPROGDIA_ID: 7
  }], [employee], [{
    ESCFUNC_ID: 42, DT_INIC: '2026-11-02', DT_FIM: '2026-11-04', MOTIVO: 'FERIAS'
  }], '2026-11-02', '2026-11-08');
  assert.deepEqual(days.map((day) => day.DT), ['2026-11-02', '2026-11-04']);
  assert.ok(days.every((day) => day.PROGRAMACAO === 'FER'));
});

test('absence projection respects dismissal and inactive status', () => {
  const absence = [{ ESCFUNC_ID: 42, DT_INIC: '2026-11-02', DT_FIM: '2026-11-08', MOTIVO: 'AFA' }];
  const days = projetarDiasAusentes([], [{ ...employee, DT_ADMISS: '2026-11-03', DT_DEMISS: '2026-11-04' }], absence,
    '2026-11-02', '2026-11-08');
  assert.deepEqual(days.map((day) => day.DT), ['2026-11-03', '2026-11-04']);
  assert.deepEqual(projetarDiasAusentes([], [{ ...employee, STATUS: 'I' }], absence,
    '2026-11-02', '2026-11-08'), []);
  for (const status of ['F', 'P']) {
    assert.equal(projetarDiasAusentes([], [{ ...employee, STATUS: status }], absence,
      '2026-11-02', '2026-11-08').length, 7);
  }
});
