const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/catalogRoutes');

const route = router.stack.find((layer) => layer.route?.path === '/lojas/:lojaId/funcionarios/:escfuncId/subsecao'
  && layer.route.methods.patch);
const handler = route.route.stack.at(-1).handle;

function response() {
  return {
    code: 200, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('subsection transfer rejects scheduled effective dates', async () => {
  const req = { params: { lojaId: '35', escfuncId: '90' }, user: { perfil: 'ADMIN' }, body: {
    ESCSECAO_ID: 2003, ESCSUBSECAO_ID: 6, VIGENCIA: 'PROXIMA_SEMANA'
  } };
  const res = response();
  await handler(req, res, (error) => { throw error; });
  assert.equal(res.code, 400);
  assert.match(res.body.error, /invalidos/);
});
