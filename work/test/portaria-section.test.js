const test = require('node:test');
const assert = require('node:assert/strict');
const { isPortariaSection } = require('../src/domain/portariaSection');

test('Portaria is recognized by section code even when its description differs', () => {
  assert.equal(isPortariaSection({ COD_SECAO: '010.02.012', DESCR: 'Controle de Acesso' }), true);
  assert.equal(isPortariaSection({ cod_secao: '02.012', descr: 'Controle de Acesso' }), true);
  assert.equal(isPortariaSection({ COD_SECAO: '010.03.003', DESCR: 'Portaria' }), true);
  assert.equal(isPortariaSection({ COD_SECAO: '010.02.0120', DESCR: 'Controle de Acesso' }), false);
  assert.equal(isPortariaSection({ COD_SECAO: '010.02.011', DESCR: 'Controle de Acesso' }), false);
});
