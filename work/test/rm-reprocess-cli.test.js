const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs } = require('../scripts/reprocessar-envios-rm-com-erro');

test('lote RM exige escopo, operador e limite aprovado para aplicar', () => {
  assert.deepEqual(parseArgs(['--all']), { lojaId: null, apply: false, operador: null, maxIdAprovado: null });
  assert.deepEqual(parseArgs(['--loja=63', '--apply', '--by=opc', '--max-id=387']), {
    lojaId: 63, apply: true, operador: 'opc', maxIdAprovado: 387
  });
  for (const args of [[], ['--all', '--loja=63'], ['--all', '--apply', '--by=opc'],
    ['--all', '--apply', '--max-id=387'], ['--all', '--by=opc'], ['--all', '--max-id=387']]) {
    assert.throws(() => parseArgs(args), /Use --loja/);
  }
});
