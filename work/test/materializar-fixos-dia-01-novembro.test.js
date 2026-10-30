const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, blocker } = require('../scripts/materializar-fixos-dia-01-novembro-2026');

test('materializacao exige escopo e operador na aplicacao', () => {
  assert.deepEqual(parseArgs(['--loja=64']), { loja: 64, apply: false, actor: null });
  assert.deepEqual(parseArgs(['--all', '--apply', '--by=opc']), { loja: null, apply: true, actor: 'opc' });
  assert.throws(() => parseArgs(['--apply', '--by=opc']), /--loja/);
  assert.throws(() => parseArgs(['--all', '--apply']), /--loja/);
  assert.throws(() => parseArgs(['--loja=64', '--by=opc']), /--loja/);
});

test('materializacao bloqueia cadastros ambiguos, desligados ou afastados', () => {
  const valid = { FIXOS_NA_DATA: 1, PROGRAMACOES_NA_REVISAO: 1,
    ESCSECAO_ID: 12, SECAO_ESCALA: 12, DT_DEMISS: null,
    FUNCIONARIO_STATUS: 'A', AUSENCIA_01: 0, SUSPENSAO_01: 0, PROGRAMACAO: 'FXF' };
  assert.equal(blocker(valid), null);
  assert.match(blocker({ ...valid, FIXOS_NA_DATA: 2 }), /Mais de um fixo/);
  assert.match(blocker({ ...valid, PROGRAMACOES_NA_REVISAO: 2 }), /Mais de uma programacao/);
  assert.match(blocker({ ...valid, DT_DEMISS: '2026-10-31' }), /desligado/);
  assert.match(blocker({ ...valid, AUSENCIA_01: 1 }), /--only-absences/);
  assert.match(blocker({ ...valid, SUSPENSAO_01: 1 }), /suspensao/i);
});
