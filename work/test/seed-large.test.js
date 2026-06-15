const test = require('node:test');
const assert = require('node:assert/strict');

const { buildLargeMockData } = require('../scripts/seed-large-mock-db');

test('large mock seed represents 70 stores with operational data', () => {
  const data = buildLargeMockData();

  assert.equal(data.SGN_ESC_LOJA.length, 70);
  assert.equal(data.SGN_ESC_FUNC.length, 560);
  assert.equal(data.SGN_ESC_USUARIO.length, 72);
  assert.ok(data.SGN_ESC_AUSENCIA.length > 0);
  assert.ok(data.SGN_ESC_FUNCAO.length > 0);
  assert.ok(data.SGN_ESC_SECAO.length > 0);

  const lojas = new Set(data.SGN_ESC_LOJA.map((loja) => Number(loja.LOJA)));
  assert.equal(lojas.has(101), true);
  assert.equal(lojas.has(170), true);
});
