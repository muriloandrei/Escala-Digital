const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, blocker } = require('../scripts/materializar-folgas-fixas-pendentes');

const args = ['--loja=313', '--mes=2026-12-01', '--dia=2026-12-06', '--chapas=313.0290,313.0308'];

test('reparo de folga fixa exige escopo explicito e operador para aplicar', () => {
  assert.deepEqual(parseArgs(args), { loja: 313, mesRef: '2026-12-01', dia: '2026-12-06',
    chapas: ['313.0290', '313.0308'], apply: false, actor: undefined });
  assert.equal(parseArgs([...args, '--apply', '--by=opc']).apply, true);
  assert.throws(() => parseArgs([...args, '--apply']), /OPERADOR/);
  assert.throws(() => parseArgs([...args, '--by=opc']), /OPERADOR/);
  assert.throws(() => parseArgs([...args, '--chapas=313.0290']), /repetidos/);
  assert.throws(() => parseArgs([...args.slice(0, 2), '--dia=2027-02-01', args[3]]), /fora do periodo/);
});

test('reparo so materializa FXF ausente da revisao ativa', () => {
  const candidate = { funcionario: { ESCSECAO_ID: 1, STATUS: 'A', DT_ADMISS: '2026-09-01' },
    fixos: [{ ESCSECAO_ID: 1, PROGRAMACAO: 'FXF' }],
    escala: { header: { ESCSECAO_ID: 1, OFICIALIZADA: 0 }, dias: [{ DT: '2026-12-05', PROGRAMACAO: 'TRB' }] },
    ausencia: false, suspensao: false, dia: '2026-12-06', hojeIso: '2026-11-19' };
  assert.equal(blocker(candidate), null);
  assert.equal(blocker({ ...candidate, escala: { ...candidate.escala,
    dias: [...candidate.escala.dias, { DT: '2026-12-06', PROGRAMACAO: 'FXF' }] } }), 'JA_MATERIALIZADO');
  assert.match(blocker({ ...candidate, ausencia: true }), /afastamento/);
  assert.match(blocker({ ...candidate, suspensao: true }), /suspensao/);
  assert.match(blocker({ ...candidate, fixos: [{ ESCSECAO_ID: 2, PROGRAMACAO: 'FXF' }] }), /Secao/);
  assert.match(blocker({ ...candidate, fixos: [{ ESCSECAO_ID: 1, PROGRAMACAO: 'TRB' }] }), /apenas folga fixa/);
  assert.match(blocker({ ...candidate, dia: '2026-11-18' }), /retroativo/);
});
