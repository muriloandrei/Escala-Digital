const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProgress, groupProgressSections, readyLinkedSections, selectProgressSections } = require('../src/services/officializationService');

const period = { inicio: '2026-11-02', fim: '2026-11-08' };
const section = { ESCSECAO_ID: 12, COD_SECAO: '010.02.002', DESCR: 'Frente de Caixa' };
const person = { ESCFUNC_ID: 42, ESCSECAO_ID: 12, STATUS: 'A', NOME: 'Teste', CHAPA: '42' };

test('store scope flag includes other sections in officialization progress', () => {
  const sections = [section, { ESCSECAO_ID: 30, COD_SECAO: '010.02.009', DESCR: 'Mercearia' }];
  assert.deepEqual(selectProgressSections(sections, 10, false).map((item) => item.ESCSECAO_ID), [12]);
  assert.deepEqual(selectProgressSections(sections, 10, true).map((item) => item.ESCSECAO_ID), [12, 30]);
});

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

test('progress follows the active physical section during the Portaria migration', () => {
  const portaria = { ESCSECAO_ID: 13, COD_SECAO: '010.02.012', DESCR: 'Estacionamento' };
  const people = [{ ...person, ESCSECAO_ID: 13 }];
  const frontDays = week().map((day) => ({ ...day, OFICIALIZADA: 1 }));
  const front = buildProgress({ escala: { dias: frontDays }, secoes: [section, portaria],
    pessoas: people, periodo: period, lojaId: 10, mesRef: '2026-11-01' });
  assert.equal(front.secoes.length, 1);
  assert.equal(front.secoes[0].escsecaoId, 12);
  assert.equal(front.secoes[0].preenchidos, 7);
  assert.equal(front.secoes[0].oficializada, true);

  const projectedDays = frontDays.map((day) => ({ ...day, ESCSECAO_ID_ESCALA: 13 }));
  const oldSection = buildProgress({ escala: { dias: projectedDays }, secoes: [section, portaria],
    pessoas: [{ ...person, ESCSECAO_ID: 12 }], periodo: period, lojaId: 10, mesRef: '2026-11-01' });
  assert.equal(oldSection.secoes[0].escsecaoId, 13);
  assert.equal(oldSection.secoes[0].preenchidos, 7);
});

test('full suspension is excluded and partial suspension does not require missing days', () => {
  const input = { escala: { dias: week().slice(0, 3) }, secoes: [section], pessoas: [person], periodo: period, lojaId: 10, mesRef: '2026-11-01' };
  const partial = buildProgress({ ...input, suspensoes: [{ ESCFUNC_ID: 42, DT_INICIO: '2026-11-05', DT_FIM: '2026-11-08' }] });
  assert.equal(partial.secoes[0].completa, true);
  const full = buildProgress({ ...input, suspensoes: [{ ESCFUNC_ID: 42, DT_INICIO: '2026-11-02', DT_FIM: '2026-11-08' }] });
  assert.deepEqual(full.secoes, []);
});

test('admin report can include an empty section without treating it as officialized', () => {
  const result = buildProgress({ escala: { dias: [] }, secoes: [section], pessoas: [],
    periodo: period, lojaId: 10, mesRef: '2026-11-01', includeEmpty: true });
  assert.equal(result.secoes.length, 1);
  assert.equal(result.secoes[0].funcionarios, 0);
  assert.equal(result.secoes[0].percentual, 0);
  assert.equal(result.secoes[0].oficializada, false);
});

test('RM-projected absence is visible without counting as a persisted officialization day', () => {
  const absence = { ESCFUNC_ID: 42, DT_INIC: '2026-11-05', DT_FIM: '2026-11-08' };
  const projected = week().slice(3).map((day) => ({
    ...day, PROGRAMACAO: 'AFA', HR_ENT1: 'AFA', HR_SAI1: 'AFA',
    HR_ENT2: 'AFA', HR_SAI2: 'AFA', AUSENCIA_OBRIGATORIA: 1, AUSENCIA_PROJETADA: 1
  }));
  const escala = { dias: [...week().slice(0, 3), ...projected], ausencias: [absence] };
  const progress = buildProgress({ escala, secoes: [section], pessoas: [person],
    periodo: period, lojaId: 10, mesRef: '2026-11-01' });
  assert.equal(progress.secoes[0].preenchidos, 3);
  assert.equal(progress.secoes[0].completa, false);
  const fullAbsence = buildProgress({ escala: { dias: projected, ausencias: [{ ...absence, DT_INIC: period.inicio }] },
    secoes: [section], pessoas: [person], periodo: period, lojaId: 10, mesRef: '2026-11-01' });
  assert.deepEqual(fullAbsence.secoes, []);
});

test('progress groups old Estacionamento under Frente de Caixa but keeps Transportes independent', () => {
  const front = { escsecaoId: 1, codigo: '035.02.002', secao: 'Frente de Caixa', funcionarios: 2,
    previstos: 70, preenchidos: 70, criticas: 0, completa: true, oficializada: true };
  const transport = { escsecaoId: 2, codigo: '035.02.004', secao: 'Transportes', funcionarios: 1,
    previstos: 35, preenchidos: 35, criticas: 0, completa: true, oficializada: true };
  const portaria = { escsecaoId: 3, codigo: '035.02.012', secao: 'Estacionamento', funcionarios: 1,
    previstos: 35, preenchidos: 0, criticas: 2, completa: false, oficializada: false };
  const groups = groupProgressSections([portaria, transport, front], { lojaId: 35 });
  assert.equal(groups.length, 2);
  assert.equal(groups[0].codigo, transport.codigo);
  assert.equal(groups[0].oficializada, true);
  assert.equal(groups[1].codigo, front.codigo);
  assert.equal(groups[1].previstos, 105);
  assert.equal(groups[1].preenchidos, 70);
  assert.equal(groups[1].percentual, 67);
  assert.equal(groups[1].criticas, 2);
  assert.equal(groups[1].oficializada, false);
  assert.deepEqual(groups[1].partes.map((part) => part.secao), ['Frente de Caixa', 'Porteiro']);
  assert.deepEqual(groups[1].partes.map((part) => part.escsecaoId), [1, 3]);
  assert.deepEqual(groupProgressSections([portaria, transport, front], { lojaId: 999 }).map((group) => group.secao),
    ['Estacionamento', 'Transportes', 'Frente de Caixa']);
  assert.deepEqual(groupProgressSections([portaria, transport, front], { lojaId: 35, finalized: true })
    .map((group) => group.secao), ['Estacionamento', 'Transportes', 'Frente de Caixa']);
});

test('linked officialization includes only ready operational sections in both directions', () => {
  const sections = [
    { escsecaoId: 1, codigo: '035.02.002', secao: 'Frente de Caixa', podeOficializar: true },
    { escsecaoId: 2, codigo: '035.02.004', secao: 'Transportes', podeOficializar: true },
    { escsecaoId: 3, codigo: '035.03.001', secao: 'Serviços a Clientes', podeOficializar: false },
    { escsecaoId: 4, codigo: '035.02.012', secao: 'Estacionamento', podeOficializar: true },
    { escsecaoId: 5, codigo: '035.03.008', secao: 'Fiscal Remoto', podeOficializar: true }
  ];
  assert.deepEqual(readyLinkedSections(sections, 1, 35).map((secao) => secao.escsecaoId), [2, 4]);
  assert.equal(readyLinkedSections(sections, 1, 35)[1].secao, 'Porteiro');
  assert.deepEqual(readyLinkedSections(sections, 2, 35).map((secao) => secao.escsecaoId), [1, 4]);
  sections[2].podeOficializar = true;
  assert.deepEqual(readyLinkedSections(sections, 1, 35).map((secao) => secao.escsecaoId), [2, 3, 4]);
  assert.deepEqual(readyLinkedSections(sections, 4, 999).map((secao) => secao.escsecaoId), []);
  assert.deepEqual(readyLinkedSections(sections, 5, 35).map((secao) => secao.escsecaoId), []);
});
