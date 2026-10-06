const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/escalaRoutes');
const escalaService = require('../src/services/escalaService');
const catalogService = require('../src/services/catalogService');
const accessService = require('../src/services/accessService');
const auditService = require('../src/services/auditService');

function handler(path) {
  return router.stack.find((layer) => layer.route?.path === path && layer.route.methods.post).route.stack.at(-1).handle;
}

function response() {
  return { code: 200, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; } };
}

test('quick route saves a holiday rest while returning critiques; regular draft still blocks them', async () => {
  const originals = {
    assertFuncionariosPermitidos: accessService.assertFuncionariosPermitidos,
    validateAusencias: escalaService.validateAusencias,
    getEscalaFuncionarioAtual: escalaService.getEscalaFuncionarioAtual,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasFuncionariosRevision: escalaService.saveEscalasFuncionariosRevision,
    registerAudit: auditService.registerAudit
  };
  const oldDays = Array.from({ length: 14 }, (_, index) => ({
    DT: `2026-10-${String(index + 5).padStart(2, '0')}`, PROGRAMACAO: 'TRB',
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }));
  const days = oldDays.map((day) => ({ data: day.DT, programacao: day.DT === '2026-10-12' ? 'F' : 'TRB',
    hrEnt1: day.DT === '2026-10-12' ? null : day.HR_ENT1,
    hrSai1: day.DT === '2026-10-12' ? null : day.HR_SAI1,
    hrEnt2: day.DT === '2026-10-12' ? null : day.HR_ENT2,
    hrSai2: day.DT === '2026-10-12' ? null : day.HR_SAI2 }));
  let saved = 0;
  accessService.assertFuncionariosPermitidos = async () => {};
  escalaService.validateAusencias = async () => [];
  escalaService.getEscalaFuncionarioAtual = async () => ({ revisao: 1, dias: oldDays });
  escalaService.listFixosEscala = async () => [];
  escalaService.saveEscalasFuncionariosRevision = async () => { saved += 1; return [{ revisao: 2, escprogId: 3 }]; };
  auditService.registerAudit = async () => {};
  const body = { lojaId: 10, mesRef: '2026-10-01', operacaoId: 'd676c4e3-a279-445c-bac4-4fb323387524',
    funcionarios: [{ escfuncId: 10, revisaoBase: 1, chapa: '000010', nome: 'Teste', funcao: 'OPERADOR DE CAIXA', escsecaoId: 20, escfuncaoId: 30, dias: days }],
    oficializada: 0 };
  try {
    const regular = response();
    await handler('/funcionarios/revisao')({ body, user: { sub: 1 } }, regular, (error) => { throw error; });
    assert.equal(regular.code, 422);
    assert.equal(saved, 0);
    const quick = response();
    await handler('/funcionarios/revisao')({ body: { ...body, edicaoRapida: true }, user: { sub: 1 } }, quick, (error) => { throw error; });
    assert.equal(quick.code, 201);
    assert.equal(saved, 1);
    assert.ok(quick.body.criticas.length > 0);
  } finally {
    accessService.assertFuncionariosPermitidos = originals.assertFuncionariosPermitidos;
    Object.assign(escalaService, {
      validateAusencias: originals.validateAusencias, getEscalaFuncionarioAtual: originals.getEscalaFuncionarioAtual,
      listFixosEscala: originals.listFixosEscala, saveEscalasFuncionariosRevision: originals.saveEscalasFuncionariosRevision
    });
    auditService.registerAudit = originals.registerAudit;
  }
});

test('quick route moves a rest across two saves despite a temporary 5x2 critique', async () => {
  const originals = {
    assertFuncionariosPermitidos: accessService.assertFuncionariosPermitidos,
    validateAusencias: escalaService.validateAusencias,
    getEscalaFuncionarioAtual: escalaService.getEscalaFuncionarioAtual,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasFuncionariosRevision: escalaService.saveEscalasFuncionariosRevision,
    registerAudit: auditService.registerAudit
  };
  let revision = 1;
  let storedDays = Array.from({ length: 7 }, (_, index) => ({
    DT: `2026-11-${String(index + 16).padStart(2, '0')}`,
    PROGRAMACAO: index === 1 || index === 6 ? 'F' : 'TRB',
    HR_ENT1: index === 1 || index === 6 ? null : '08:00',
    HR_SAI1: index === 1 || index === 6 ? null : '12:00',
    HR_ENT2: index === 1 || index === 6 ? null : '13:10',
    HR_SAI2: index === 1 || index === 6 ? null : '17:58'
  }));
  const asPayloadDay = (day) => ({ data: day.DT, programacao: day.PROGRAMACAO,
    hrEnt1: day.HR_ENT1, hrSai1: day.HR_SAI1, hrEnt2: day.HR_ENT2, hrSai2: day.HR_SAI2 });
  accessService.assertFuncionariosPermitidos = async () => {};
  escalaService.validateAusencias = async () => [];
  escalaService.getEscalaFuncionarioAtual = async () => ({ revisao: revision, dias: storedDays });
  escalaService.listFixosEscala = async () => [];
  escalaService.saveEscalasFuncionariosRevision = async ({ funcionarios }) => {
    revision += 1;
    storedDays = funcionarios[0].dias.map((day) => ({ DT: day.data, PROGRAMACAO: day.programacao,
      HR_ENT1: day.hrEnt1, HR_SAI1: day.hrSai1, HR_ENT2: day.hrEnt2, HR_SAI2: day.hrSai2 }));
    return [{ revisao: revision, escprogId: 3 }];
  };
  auditService.registerAudit = async () => {};
  try {
    const call = async (date, programacao) => {
      const days = storedDays.map(asPayloadDay);
      const day = days.find((item) => item.data === date);
      day.programacao = programacao;
      day.hrEnt1 = programacao === 'F' ? null : '08:00';
      day.hrSai1 = programacao === 'F' ? null : '12:00';
      day.hrEnt2 = programacao === 'F' ? null : '13:10';
      day.hrSai2 = programacao === 'F' ? null : '17:58';
      const res = response();
      await handler('/funcionarios/revisao')({ body: { lojaId: 10, mesRef: '2026-11-01',
        edicaoRapida: true, oficializada: 0, funcionarios: [{ escfuncId: 10,
          revisaoBase: revision, chapa: '000010', nome: 'Teste', funcao: 'OPERADOR DE CAIXA',
          escsecaoId: 20, escfuncaoId: 30, dias: days }] }, user: { sub: 1 } }, res,
      (error) => { throw error; });
      return res;
    };
    const first = await call('2026-11-17', 'TRB');
    assert.equal(first.code, 201);
    assert.match(first.body.criticas.join(' '), /6 dias consecutivos/);
    assert.equal(storedDays[1].PROGRAMACAO, 'TRB');
    const second = await call('2026-11-18', 'F');
    assert.equal(second.code, 201);
    assert.equal(storedDays[2].PROGRAMACAO, 'F');
    assert.equal(revision, 3);
  } finally {
    accessService.assertFuncionariosPermitidos = originals.assertFuncionariosPermitidos;
    Object.assign(escalaService, {
      validateAusencias: originals.validateAusencias, getEscalaFuncionarioAtual: originals.getEscalaFuncionarioAtual,
      listFixosEscala: originals.listFixosEscala, saveEscalasFuncionariosRevision: originals.saveEscalasFuncionariosRevision
    });
    auditService.registerAudit = originals.registerAudit;
  }
});

test('fixed rest can be saved on a holiday', async () => {
  const originals = {
    assertSecoesPermitidas: accessService.assertSecoesPermitidas,
    saveFixoEscala: escalaService.saveFixoEscala,
    registerAudit: auditService.registerAudit
  };
  accessService.assertSecoesPermitidas = async () => {};
  escalaService.saveFixoEscala = async () => ({ ESCFIXO_ID: 1, PROGRAMACAO: 'FXF' });
  auditService.registerAudit = async () => {};
  try {
    const res = response();
    await handler('/fixos')({ body: { lojaId: 10, mesRef: '2026-10-01', escfuncId: 10,
      escsecaoId: 20, DT: '2026-10-12', PROGRAMACAO: 'FXF' }, user: { sub: 1 } }, res, (error) => { throw error; });
    assert.equal(res.code, 201);
  } finally {
    accessService.assertSecoesPermitidas = originals.assertSecoesPermitidas;
    escalaService.saveFixoEscala = originals.saveFixoEscala;
    auditService.registerAudit = originals.registerAudit;
  }
});

test('fixed apprentice work accepts only the existing 05:15 shift', async () => {
  const originals = {
    assertSecoesPermitidas: accessService.assertSecoesPermitidas,
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    saveFixoEscala: escalaService.saveFixoEscala,
    registerAudit: auditService.registerAudit
  };
  accessService.assertSecoesPermitidas = async () => {};
  catalogService.listFuncionariosByLoja = async () => [{ ESCFUNC_ID: 10, ESCSECAO_ID: 20,
    FUNCAO_DESCR: 'JOVEM APRENDIZ', HR_ENT1: '08:00' }];
  escalaService.saveFixoEscala = async () => ({ ESCFIXO_ID: 1, PROGRAMACAO: 'TRB' });
  auditService.registerAudit = async () => {};
  const body = { lojaId: 10, mesRef: '2026-10-01', escfuncId: 10, escsecaoId: 20,
    DT: '2026-10-12', PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '13:15', HR_ENT2: null, HR_SAI2: null };
  try {
    const accepted = response();
    await handler('/fixos')({ body, user: { sub: 1 } }, accepted, (error) => { throw error; });
    assert.equal(accepted.code, 201);
    const denied = response();
    await handler('/fixos')({ body: { ...body, HR_SAI1: '14:00' }, user: { sub: 1 } }, denied, (error) => { throw error; });
    assert.equal(denied.code, 422);
  } finally {
    accessService.assertSecoesPermitidas = originals.assertSecoesPermitidas;
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    escalaService.saveFixoEscala = originals.saveFixoEscala;
    auditService.registerAudit = originals.registerAudit;
  }
});
