const test = require('node:test');
const assert = require('node:assert/strict');
const { _private: { assertPreservaDatasEscala } } = require('../src/services/escalaService');

const gravados = [
  { DT: '2026-10-05', PROGRAMACAO: 'TRB' },
  { DT: '2026-10-06', PROGRAMACAO: 'F' },
  { DT: '2026-10-07', PROGRAMACAO: 'TRB' }
];

test('rascunho preserva todos os dias existentes ao trocar folgas e horarios', () => {
  assert.doesNotThrow(() => assertPreservaDatasEscala(gravados, [
    { data: '2026-10-05', programacao: 'F' },
    { data: '2026-10-06', programacao: 'TRB' },
    { data: '2026-10-07', programacao: 'TRB' }
  ]));
});

test('rascunho incompleto nao apaga dias futuros gravados', () => {
  assert.throws(
    () => assertPreservaDatasEscala(gravados, [{ data: '2026-10-05' }]),
    (error) => error.statusCode === 422 && error.details.faltantes.includes('2026-10-07')
  );
});

test('rascunho nao aceita data extra ou repetida', () => {
  assert.throws(
    () => assertPreservaDatasEscala(gravados, [
      ...gravados.map((dia) => ({ data: dia.DT })),
      { data: '2026-10-08' }
    ]),
    (error) => error.statusCode === 422 && error.details.extras.includes('2026-10-08')
  );
  assert.throws(
    () => assertPreservaDatasEscala([], [{ data: '2026-10-05' }, { data: '2026-10-05' }]),
    (error) => error.statusCode === 422 && /repetidas/.test(error.message)
  );
  assert.throws(
    () => assertPreservaDatasEscala([gravados[0], gravados[0]], [{ data: '2026-10-05' }]),
    (error) => error.statusCode === 422 && /gravada contem datas repetidas/.test(error.message)
  );
});

test('primeira gravacao pode criar dias quando ainda nao existe programacao', () => {
  assert.doesNotThrow(() => assertPreservaDatasEscala([], [{ data: '2026-10-05' }]));
});

test('somente a correcao de novembro pode acrescentar 01/11 sem perder dias existentes', () => {
  const atuais = [{ DT: '2026-11-02', PROGRAMACAO: 'TRB' }];
  const novos = [{ data: '2026-11-01', programacao: 'F' }, { data: '2026-11-02', programacao: 'TRB' }];
  assert.throws(() => assertPreservaDatasEscala(atuais, novos), /mesmos dias/);
  assert.doesNotThrow(() => assertPreservaDatasEscala(atuais, novos, ['2026-11-01']));
  assert.throws(() => assertPreservaDatasEscala(atuais, [
    ...novos, { data: '2026-11-03', programacao: 'TRB' }
  ], ['2026-11-01']), /mesmos dias/);
});
