const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, mesmaPessoa } = require('../scripts/reprocessar-folgas-duplicadas-rm');

test('lote de duplicadas exige primeiro envio e limite da previa para aplicar', () => {
  assert.deepEqual(parseArgs(['--primeiro=1415']), {
    primeiroId: 1415, apply: false, maxId: null, operador: null
  });
  assert.deepEqual(parseArgs(['--primeiro=1415', '--apply', '--by=opc', '--max-id=1584']), {
    primeiroId: 1415, apply: true, maxId: 1584, operador: 'opc'
  });
  for (const args of [[], ['--primeiro=0'], ['--primeiro=1415', '--apply'],
    ['--primeiro=1415', '--apply', '--by=opc'], ['--primeiro=1415', '--max-id=1584']]) {
    assert.throws(() => parseArgs(args), /Use --primeiro/);
  }
});

test('lote exclui da segunda passagem apenas a mesma loja, funcionario e mes', () => {
  const primeiro = { LOJA: 52, ESCFUNC_ID: 24541, MES_REF: new Date('2026-11-01T03:00:00Z') };
  assert.equal(mesmaPessoa({ ...primeiro, MES_REF: '2026-11-01' }, primeiro), true);
  assert.equal(mesmaPessoa({ ...primeiro, LOJA: 53 }, primeiro), false);
  assert.equal(mesmaPessoa({ ...primeiro, MES_REF: '2026-12-01' }, primeiro), false);
});
