const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/catalogRoutes');

const transferRoute = router.stack.find((layer) =>
  layer.route?.path === '/lojas/:lojaId/funcionarios/:escfuncId/subsecao' && layer.route.methods.patch
);
const transferHandler = transferRoute.route.stack.at(-1).handle;

for (const vigencia of ['PROXIMA_SEMANA', 'PROXIMO_MES']) {
  test(`future subsection transfer ${vigencia} does not change the current link`, async () => {
    let status;
    let body;
    const res = {
      status(code) { status = code; return this; },
      json(value) { body = value; return this; }
    };
    await transferHandler({ body: { ESCSECAO_ID: 1, ESCSUBSECAO_ID: 2, VIGENCIA: vigencia } }, res, (error) => { throw error; });
    assert.equal(status, 422);
    assert.match(body.error, /ainda nao disponivel/i);
  });
}
