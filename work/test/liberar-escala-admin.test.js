const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/escalaRoutes');

test('liberacao mensal exige Admin antes da permissao de criar', () => {
  const route = router.stack.find((layer) => layer.route?.path === '/liberar-mensal').route;
  const handlers = route.stack.map((layer) => layer.handle);
  const adminIndex = handlers.findIndex((handler) => handler.name === 'requireAdmin');
  assert.ok(adminIndex >= 0);
  assert.ok(adminIndex < handlers.length - 1);
  const denied = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  handlers[adminIndex]({ user: { perfil: 'LIDER', permissoes: { escalas: { PODE_CRIAR: 1 } } } }, denied, () => {
    throw new Error('Lider nao pode liberar escala');
  });
  assert.equal(denied.code, 403);
  let next = false;
  handlers[adminIndex]({ user: { perfil: 'ADMIN' } }, denied, () => { next = true; });
  assert.equal(next, true);
});
