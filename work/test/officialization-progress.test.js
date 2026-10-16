const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProgress } = require('../src/services/officializationService');

const period = { inicio: '2026-11-02', fim: '2026-11-08' };
const section = { ESCSECAO_ID: 12, COD_SECAO: '010.02.002', DESCR: 'Frente de Caixa' };
const person = { ESCFUNC_ID: 42, ESCSECAO_ID: 12, STATUS: 'A', NOME: 'Teste', CHAPA: '42' };

function week() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date('2026-11-02T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + index);
    return {
      ESCFUNC_ID: 42, ESCSECAO_ID: 12, DT: date.toISOString().slice(0, 10),
      PROGRAMACAO: index === 2 || index === 5 ? 'FXF' : 'TRB',
      HR_ENT1: index === 2 || index === 5 ? null : '08:00',
      HR_SAI1: index === 2 || index === 5 ? null : '12:00',
      HR_ENT2: index === 2 || index === 5 ? null : '13:10',
      HR_SAI2: index === 2 || index === 5 ? null : '17:58',
      OFICIALIZADA: 0
    };
  });
}

test('section progress requires every employee day and individual critiques to be clear', () => {
  const input = { secoes: [section], pessoas: [person], periodo: period, lojaId: 10, mesRef: '2026-11-01' };
  const partial = buildProgress({ ...input, escala: { dias: week().slice(0, 6) } }).secoes[0];
  assert.equal(partial.completa, false);
  assert.equal(partial.podeOficializar, false);
  const complete = buildProgress({ ...input, escala: { dias: week() } }).secoes[0];
  assert.equal(complete.preenchidos, 7);
  assert.equal(complete.podeOficializar, true);
  const approved = buildProgress({ ...input, escala: { dias: week().map((day) => ({ ...day, OFICIALIZADA: 1 })) } });
  assert.equal(approved.secoes[0].oficializada, true);
  assert.equal(approved.oficializada, true);
});

test('section progress does not use historical days from another section', () => {
  const dias = week().map((day) => ({ ...day, ESCSECAO_ID: 99, OFICIALIZADA: 1 }));
  const result = buildProgress({ escala: { dias }, secoes: [section], pessoas: [person], periodo: period, lojaId: 10, mesRef: '2026-11-01' });
  assert.equal(result.secoes[0].percentual, 0);
  assert.equal(result.oficializada, false);
});

test('full suspension is excluded and partial suspension does not require missing days', () => {
  const input = { escala: { dias: week().slice(0, 3) }, secoes: [section], pessoas: [person], periodo: period, lojaId: 10, mesRef: '2026-11-01' };
  const partial = buildProgress({ ...input, suspensoes: [{ ESCFUNC_ID: 42, DT_INICIO: '2026-11-05', DT_FIM: '2026-11-08' }] });
  assert.equal(partial.secoes[0].completa, true);
  const full = buildProgress({ ...input, suspensoes: [{ ESCFUNC_ID: 42, DT_INICIO: '2026-11-02', DT_FIM: '2026-11-08' }] });
  assert.deepEqual(full.secoes, []);
});
