const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/escalaRoutes');
const accessService = require('../src/services/accessService');
const officializationService = require('../src/services/officializationService');
const escalaService = require('../src/services/escalaService');
const rmIntegrationService = require('../src/services/rmIntegrationService');
const auditService = require('../src/services/auditService');

function response() {
  return { code: 200, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; } };
}

test('progress endpoint rejects roles outside RH, gerente and admin', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/progresso').route.stack.at(-1).handle;
  const result = response();
  await handle({ user: { perfil: 'OPERADOR' }, query: { lojaId: '10', mesRef: '2026-11-01' } }, result, (error) => { throw error; });
  assert.equal(result.code, 403);
});

test('leader can officialize only a whole enabled complete section', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/oficializar').route.stack.at(-1).handle;
  const originals = {
    getSecoesPermitidasUsuario: accessService.getSecoesPermitidasUsuario,
    assertSecoesPermitidas: accessService.assertSecoesPermitidas,
    getProgress: officializationService.getProgress,
    validarPreRequisitosRm: rmIntegrationService.validarPreRequisitosRm,
    processarOperacaoRm: rmIntegrationService.processarOperacaoRm,
    oficializarEscala: escalaService.oficializarEscala,
    registerAudit: auditService.registerAudit
  };
  let enabled = false;
  let complete = true;
  let writes = 0;
  accessService.getSecoesPermitidasUsuario = async () => [12];
  accessService.assertSecoesPermitidas = async () => {};
  officializationService.getProgress = async () => ({ habilitada: enabled,
    secoes: [{ escsecaoId: 12, completa: complete, criticas: 0 }] });
  rmIntegrationService.validarPreRequisitosRm = async () => ({ errors: [] });
  rmIntegrationService.processarOperacaoRm = async () => ({ status: 'PENDENTE' });
  escalaService.oficializarEscala = async (payload) => {
    assert.equal(payload.escfuncIds, undefined);
    writes += 1;
    return { affectedRows: 2, operacaoId: 'operation', revisao: 1 };
  };
  auditService.registerAudit = async () => {};
  const req = { body: { lojaId: 10, mesRef: '2026-11-01', escsecaoId: 12 }, user: { perfil: 'LIDER', sub: 1 } };
  try {
    const disabled = response();
    await handle(req, disabled, (error) => { throw error; });
    assert.equal(disabled.code, 403);
    enabled = true;
    complete = false;
    const incomplete = response();
    await handle(req, incomplete, (error) => { throw error; });
    assert.equal(incomplete.code, 422);
    complete = true;
    const partial = response();
    await handle({ ...req, body: { ...req.body, escfuncIds: [42] } }, partial, (error) => { throw error; });
    assert.equal(partial.code, 400);
    const approved = response();
    await handle(req, approved, (error) => { throw error; });
    assert.equal(approved.code, 200);
    assert.equal(writes, 1);
    const rh = response();
    await handle({ ...req, user: { perfil: 'RH', sub: 2 } }, rh, (error) => { throw error; });
    assert.equal(rh.code, 403);
  } finally {
    accessService.getSecoesPermitidasUsuario = originals.getSecoesPermitidasUsuario;
    accessService.assertSecoesPermitidas = originals.assertSecoesPermitidas;
    officializationService.getProgress = originals.getProgress;
    rmIntegrationService.validarPreRequisitosRm = originals.validarPreRequisitosRm;
    rmIntegrationService.processarOperacaoRm = originals.processarOperacaoRm;
    escalaService.oficializarEscala = originals.oficializarEscala;
    auditService.registerAudit = originals.registerAudit;
  }
});
