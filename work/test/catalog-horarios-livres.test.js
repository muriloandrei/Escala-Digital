const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/catalogRoutes');
const catalogService = require('../src/services/catalogService');

test('cadastro aceita jornada livre sem intervalo e sinalizador de aprendiz', async () => {
  const originalLojas = catalogService.listLojas;
  const originalCreate = catalogService.createHorarioPadrao;
  let saved;
  catalogService.listLojas = async () => [{ LOJA: 10 }];
  catalogService.createHorarioPadrao = async (data) => { saved = data; return { ESCHORPAD_ID: 99, ...data }; };
  const handler = router.stack.find((layer) => layer.route?.path === '/horarios-padrao'
    && layer.route.methods.post).route.stack.at(-1).handle;
  const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  try {
    await handler({ body: { DESCR: 'Jornada 04:00', JORNADA_MINUTOS: 240,
      INTERVALO_MINUTOS: 0, LIBERAR_HORARIO_APRENDIZ: true, LOJAS: [10] } }, response,
    (error) => { throw error; });
    assert.equal(response.code, 201);
    assert.equal(saved.INTERVALO_MINUTOS, 0);
    assert.equal(saved.LIBERAR_HORARIO_APRENDIZ, true);
  } finally {
    catalogService.listLojas = originalLojas;
    catalogService.createHorarioPadrao = originalCreate;
  }
});
