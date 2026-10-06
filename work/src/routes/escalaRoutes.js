const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess, requireAdmin, requirePermission } = require('../middleware/auth');
const escalaService = require('../services/escalaService');
const catalogService = require('../services/catalogService');
const accessService = require('../services/accessService');
const auditService = require('../services/auditService');
const escalaEventService = require('../services/escalaEventService');
const rmIntegrationService = require('../services/rmIntegrationService');
const { getOperationalPeriodIso } = require('../domain/operationalPeriod');
const { validateStandardShift } = require('../domain/shiftValidation');
const monthlyReleaseService = require('../services/monthlyReleaseService');
const { REGRAS_VIGENTES, validateEscalaPayload } = require('../rules/escalaRules');
const { buildDiaAlteracoes, normalizeScheduleDay } = require('../utils/scheduleDiff');
const { listNationalHolidays } = require('../domain/nationalHolidays');
const { validateQuickRestWorkEdit } = require('../domain/quickEdit');

const router = express.Router();

const saveSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  operacaoId: z.string().uuid().optional(),
  edicaoRapida: z.boolean().optional(),
  escalaOrigemId: z.number().int().positive().optional(),
  funcionarios: z.array(z.object({
    escfuncId: z.number().int().positive(),
    revisaoBase: z.number().int().min(0).optional(),
    chapa: z.string().min(1).max(8),
    nome: z.string().max(100).optional(),
    funcao: z.string().max(100).nullable().optional(),
    FUNCAO_DESCR: z.string().max(100).nullable().optional(),
    funcaoDescr: z.string().max(100).nullable().optional(),
    cargo: z.string().max(100).nullable().optional(),
    aprendiz: z.boolean().optional(),
    APRENDIZ: z.boolean().optional(),
    escsecaoId: z.coerce.number().int().positive().nullable().optional(),
    ESCSECAO_ID: z.coerce.number().int().positive().nullable().optional(),
    escfuncaoId: z.coerce.number().int().positive().nullable().optional(),
    ESCFUNCAO_ID: z.coerce.number().int().positive().nullable().optional(),
    escsecaoTurnoId: z.coerce.number().int().positive().nullable().optional(),
    dias: z.array(z.object({
      data: z.string().min(10).max(10),
      hrEnt1: z.string().max(5).nullable().optional(),
      hrSai1: z.string().max(5).nullable().optional(),
      hrEnt2: z.string().max(5).nullable().optional(),
      hrSai2: z.string().max(5).nullable().optional(),
      programacao: z.string().max(3).nullable().optional(),
      justificativa: z.string().max(500).nullable().optional()
    }))
  })),
  oficializada: z.number().int().min(0).max(1).optional(),
  justificativa: z.string().max(500).nullable().optional()
});
const diaSchema = z.object({
  HR_ENT1: z.string().max(5),
  HR_SAI1: z.string().max(5),
  HR_ENT2: z.string().max(5),
  HR_SAI2: z.string().max(5),
  PROGRAMACAO: z.string().max(3).optional().default('TRB')
}).strict();

const syncFuncionarioRmSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  escfuncId: z.number().int().positive()
});
const horarioFuncionarioSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  escfuncId: z.number().int().positive(),
  aplicarNaEscala: z.boolean().optional().default(true),
  HR_ENT1: z.string().regex(/^\d{2}:\d{2}$/),
  HR_SAI1: z.string().regex(/^\d{2}:\d{2}$/),
  HR_ENT2: z.string().regex(/^\d{2}:\d{2}$/),
  HR_SAI2: z.string().regex(/^\d{2}:\d{2}$/)
}).strict();
const fixoEscalaSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  escfuncId: z.number().int().positive(),
  escsecaoId: z.number().int().positive(),
  DT: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  PROGRAMACAO: z.string().max(3).optional().default('TRB'),
  HR_ENT1: z.string().max(5).nullable().optional(),
  HR_SAI1: z.string().max(5).nullable().optional(),
  HR_ENT2: z.string().max(5).nullable().optional(),
  HR_SAI2: z.string().max(5).nullable().optional(),
  JUSTIFICATIVA: z.string().max(500).nullable().optional()
});

router.use(requireAuth);

router.get('/feriados', requirePermission('escalas', 'visualizar'), (req, res) => {
  const { inicio, fim } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(inicio || '')) || !/^\d{4}-\d{2}-\d{2}$/.test(String(fim || '')) || String(fim) < String(inicio)) {
    return res.status(400).json({ error: 'Informe um periodo valido para consultar feriados.' });
  }
  return res.json({ feriados: listNationalHolidays(inicio, fim) });
});

router.get('/regras', requirePermission('regras', 'visualizar'), async (req, res) => {
  res.json({ regras: REGRAS_VIGENTES });
});

router.post('/liberar-mensal', requirePermission('escalas', 'criar'), async (req, res, next) => {
  try {
    if (!accessService.canCreateEscala(req.user)) {
      return res.status(403).json({ error: 'Perfil Lider nao pode liberar novas escalas.' });
    }
    const payload = z.object({
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      lojas: z.array(z.number().int().positive()).optional()
    }).parse(req.body);
    const lojasPermitidas = await getLojasPermitidas(req, 'all');
    const lojasSolicitadas = payload.lojas?.length ? payload.lojas : lojasPermitidas;
    const permitidasSet = new Set(lojasPermitidas.map(Number));
    const lojas = lojasSolicitadas.map(Number).filter((loja) => permitidasSet.has(loja));
    if (!lojas.length) return res.status(403).json({ error: 'Nenhuma loja permitida para liberacao.' });

    const resultados = await monthlyReleaseService.liberarEscalasMensais({ mesRef: payload.mesRef, lojas });
    await auditService.registerAudit({
      action: 'LIBERAR_ESCALA_MENSAL',
      user: req.user,
      mesRef: payload.mesRef,
      details: { lojas, resultados }
    });
    return res.json({ resultados });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de liberacao invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/gerar-secao', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      escsecaoId: z.number().int().positive(),
      escfuncIds: z.array(z.number().int().positive()).optional(),
      hojeIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    }).parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [payload.escsecaoId]);
    const resultado = await monthlyReleaseService.gerarEscalaSecao({ ...payload, actor: req.user });
    await auditService.registerAudit({
      action: 'GERAR_ESCALA_SECAO',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      details: resultado
    });
    return res.status(resultado.criada ? 201 : 422).json({ resultado });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de geracao da secao invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/resetar-secao', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      escsecaoId: z.number().int().positive(),
      escfuncIds: z.array(z.number().int().positive()).optional()
    }).parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [payload.escsecaoId]);
    const resultado = await monthlyReleaseService.resetarEscalaSecao({ ...payload, actor: req.user });
    await auditService.registerAudit({
      action: 'RESETAR_ESCALA_SECAO',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      details: resultado
    });
    return res.status(resultado.resetada ? 200 : 422).json({ resultado });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de reset da secao invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/fixos', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = fixoEscalaSchema.parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [payload.escsecaoId]);
    if (String(payload.PROGRAMACAO).toUpperCase() === 'TRB') {
      const funcionario = await getFuncionarioParaEdicaoHorario(req, payload, { permitirAprendiz: true });
      if (/APRENDIZ/i.test(String(funcionario.FUNCAO_DESCR || ''))) {
        const horarioCadastro = String(funcionario.HR_ENT1 || '08:00');
        const horarioValido = /^\d{2}:\d{2}$/.test(horarioCadastro)
          && Number(horarioCadastro.slice(0, 2)) < 24 && Number(horarioCadastro.slice(3)) < 60;
        const esperado = horarioValido ? horarioCadastro : '08:00';
        const inicio = Number(esperado.slice(0, 2)) * 60 + Number(esperado.slice(3));
        const fim = /^\d{2}:\d{2}$/.test(String(payload.HR_SAI1 || ''))
          ? Number(payload.HR_SAI1.slice(0, 2)) * 60 + Number(payload.HR_SAI1.slice(3)) : null;
        if (payload.HR_ENT1 !== esperado || fim - inicio !== 315 || payload.HR_ENT2 || payload.HR_SAI2) {
          return res.status(422).json({ error: 'Horario fixo do aprendiz deve manter 05:15 sem segundo periodo.' });
        }
      } else {
        const errors = validateStandardShift(payload);
        if (errors.length) return res.status(422).json({ error: 'Horario fixo invalido.', details: errors });
      }
    }
    const fixo = await escalaService.saveFixoEscala({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escfuncId: payload.escfuncId,
      escsecaoId: payload.escsecaoId,
      data: payload,
      actor: req.user
    });
    await auditService.registerAudit({
      action: 'CADASTRAR_FIXO_ESCALA',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      referenceId: fixo?.ESCFIXO_ID || fixo?.escfixo_id || null,
      details: {
        escfuncId: payload.escfuncId,
        escsecaoId: payload.escsecaoId,
        data: payload.DT,
        programacao: payload.PROGRAMACAO
      }
    });
    return res.status(201).json({ fixo });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados do fixo invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/fixos/remover', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      escfuncId: z.number().int().positive(),
      escsecaoId: z.number().int().positive(),
      DT: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [payload.escsecaoId]);
    const result = await escalaService.deleteFixoEscala({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escfuncId: payload.escfuncId,
      escsecaoId: payload.escsecaoId,
      dt: payload.DT,
      actor: req.user
    });
    await auditService.registerAudit({
      action: 'REMOVER_FIXO_ESCALA',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      details: payload
    });
    return res.json({ result });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados da remocao do fixo invalidos.', details: error.errors });
    return next(error);
  }
});

async function resolveLojaRequest(req, res, next) {
  try {
    const rawLojaId = Number(req.params.lojaId || req.query.lojaId || req.body.lojaId);
    if (rawLojaId) {
      const lojaCodigo = await catalogService.resolveLojaCodigo(rawLojaId);
      if (req.params.lojaId) req.params.lojaId = String(lojaCodigo);
      if (req.query.lojaId) req.query.lojaId = String(lojaCodigo);
      if (req.body.lojaId) req.body.lojaId = lojaCodigo;
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

function canAccessLoja(req, loja) {
  const lojas = req.user?.lojas || [];
  return lojas.includes(Number(loja)) || accessService.isGlobalStoreAccessUser(req.user);
}

function getLojasPermitidasParaConsulta(req) {
  if (accessService.isGlobalStoreAccessUser(req.user)) return null;
  return req.user?.lojas || [];
}

async function getLojasPermitidas(req, requestedLojaId = 'all') {
  if (requestedLojaId && requestedLojaId !== 'all') {
    const lojaCodigo = await catalogService.resolveLojaCodigo(Number(requestedLojaId));
    if (!canAccessLoja(req, lojaCodigo)) {
      const error = new Error('Usuario sem permissao para esta loja.');
      error.statusCode = 403;
      throw error;
    }
    return [lojaCodigo];
  }

  if (accessService.isGlobalStoreAccessUser(req.user)) {
    const lojas = await catalogService.listLojas();
    return lojas.map((loja) => Number(loja.LOJA)).filter(Boolean);
  }

  return [...new Set((req.user?.lojas || []).map(Number).filter(Boolean))];
}

async function getSecoesPermitidas(req, lojaId = null) {
  return accessService.getSecoesPermitidasUsuario(req.user, lojaId);
}

async function assertPayloadDentroDoEscopo(req, payload) {
  await accessService.assertFuncionariosPermitidos(req.user, payload.lojaId, payload.funcionarios || []);
}

router.get('/resumo', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const mesRef = req.query.mesRef || null;
    const lojasPermitidas = getLojasPermitidasParaConsulta(req);
    const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
    const escalas = await escalaService.listEscalasResumo({ lojaId, mesRef, lojasPermitidas, secoesPermitidas });
    return res.json({ escalas });
  } catch (error) {
    return next(error);
  }
});

router.get('/revisoes', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = Number(req.query.lojaId);
    const mesRef = req.query.mesRef;
    if (!lojaId || !mesRef) {
      return res.status(400).json({ error: 'lojaId e mesRef sao obrigatorios.' });
    }

    const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
    const revisoes = await escalaService.listEscalaRevisoes({ lojaId, mesRef, secoesPermitidas });
    return res.json({ revisoes });
  } catch (error) {
    return next(error);
  }
});


router.get('/historico', requireAdmin, requirePermission('historico', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const mesRef = req.query.mesRef || null;
    const lojasPermitidas = getLojasPermitidasParaConsulta(req);
    const historico = await escalaService.listHistoricoEscala({ lojaId, mesRef, lojasPermitidas });
    return res.json({ historico });
  } catch (error) {
    console.warn('Falha ao consultar historico de escala:', error?.message || error);
    return res.status(503).json({ error: 'Historico de auditoria indisponivel. Tente novamente mais tarde.' });
  }
});

router.get('/eventos', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const query = z.object({
      lojaId: z.coerce.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      escfuncId: z.coerce.number().int().positive().optional(),
      escsecaoId: z.coerce.number().int().positive().optional(),
      escsubsecaoId: z.coerce.number().int().positive().optional(),
      acao: z.string().trim().max(80).optional(),
      origem: z.string().trim().max(40).optional(),
      situacao: z.string().trim().max(40).optional(),
      login: z.string().trim().max(100).optional(),
      funcionario: z.string().trim().max(100).optional(),
      limit: z.coerce.number().int().min(1).max(500).optional(),
      offset: z.coerce.number().int().min(0).optional()
    }).parse(req.query);
    const scope = {
      ...query,
      lojasPermitidas: [query.lojaId],
      secoesPermitidas: await getSecoesPermitidas(req, query.lojaId)
    };
    const [eventos, resumo] = await Promise.all([
      escalaEventService.listEvents(scope),
      (query.offset || 0) === 0 ? escalaEventService.summarizeEvents(scope) : Promise.resolve(null)
    ]);
    return res.json({ eventos, resumo });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Filtros de eventos invalidos.' });
    return next(error);
  }
});

router.get('/mensal', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = Number(req.query.lojaId);
    const mesRef = req.query.mesRef;
    if (!lojaId || !/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(String(mesRef || ''))) {
      return res.status(400).json({ error: 'lojaId e mesRef validos sao obrigatorios.' });
    }

    const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
    const escala = await escalaService.getEscalaMensal({ lojaId, mesRef, secoesPermitidas });
    return res.json({ escala, periodo: getOperationalPeriodIso(mesRef) });
  } catch (error) {
    return next(error);
  }
});

router.get('/mensal-lote', requirePermission('escalas', 'visualizar'), async (req, res, next) => {
  try {
    const mesRef = req.query.mesRef;
    if (!mesRef) {
      return res.status(400).json({ error: 'mesRef e obrigatorio.' });
    }

    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const escalas = [];
    for (const lojaId of lojas) {
      const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
      const escala = await escalaService.getEscalaMensal({ lojaId, mesRef, secoesPermitidas });
      escalas.push({ lojaId, escala });
    }
    return res.json({ escalas });
  } catch (error) {
    return next(error);
  }
});

router.get('/rm/logs', requirePermission('integracao-rm', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojasPermitidas = getLojasPermitidasParaConsulta(req);
    const logs = await rmIntegrationService.listRmLogs({
      lojaId: req.query.lojaId ? Number(req.query.lojaId) : null,
      mesRef: req.query.mesRef || null,
      lojasPermitidas
    });
    return res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

router.post('/rm/reprocessar', requirePermission('integracao-rm', 'reprocessar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      revisao: z.number().int().min(0),
      escfuncId: z.number().int().positive(),
      envioId: z.number().int().positive().optional()
    }).parse(req.body);
    const rm = await rmIntegrationService.reprocessarEnvioRm(payload);
    await auditService.registerAudit({
      action: 'REPROCESSAR_RM',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: payload.revisao,
      details: rm
    });
    return res.json({ ok: true, rm });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de reprocessamento invalidos.', details: error.errors });
    return next(error);
  }
});

router.get('/rm/envios', requirePermission('integracao-rm', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const envios = await rmIntegrationService.listEnviosRm({
      lojaId, mesRef: req.query.mesRef || null,
      lojasPermitidas: getLojasPermitidasParaConsulta(req)
    });
    return res.json({ envios });
  } catch (error) {
    return next(error);
  }
});

router.post('/oficializar', requireAdmin, requirePermission('escalas', 'oficializar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      escsecaoId: z.number().int().positive(),
      escfuncIds: z.array(z.number().int().positive()).min(1).optional()
    }).parse(req.body);

    const preRequisitosRm = await rmIntegrationService.validarPreRequisitosRm(payload);
    if (preRequisitosRm.errors?.length) {
      return res.status(422).json({
        error: 'Existem pendencias antes de oficializar a escala no RM.',
        errors: preRequisitosRm.errors,
        details: preRequisitosRm
      });
    }

    const result = await escalaService.oficializarEscala({ ...payload, actor: req.user });
    if (!result.affectedRows) return res.status(404).json({ error: 'Escala ativa nao encontrada.' });
    let rm;
    try {
      rm = await rmIntegrationService.processarOperacaoRm({ operacaoId: result.operacaoId });
    } catch (error) {
      rm = { enabled: true, status: 'PENDENTE', pendentes: result.affectedRows, enviados: 0, falhas: 0, error: error.message };
    }
    await auditService.registerAudit({
      action: 'OFICIALIZAR_ESCALA',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: result.revisao,
      details: { oficializada: 1, rmStatus: rm.status, rmEnviados: rm.enviados, rmFalhas: rm.falhas, operacaoId: result.operacaoId }
    });
    return res.json({ ok: true, revisao: result.revisao, affectedRows: result.affectedRows, operacaoId: result.operacaoId, rm });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de oficializacao invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/inativar', requireAdmin, requirePermission('escalas', 'inativar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).parse(req.body);

    const result = await escalaService.inativarEscala({ ...payload, actor: req.user });
    if (!result.affectedRows) return res.status(404).json({ error: 'Escala ativa nao encontrada.' });
    await auditService.registerAudit({
      action: 'INATIVAR_ESCALA',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: result.revisao,
      details: { ativa: 0, oficializada: 0 }
    });
    return res.json({ ok: true, revisao: result.revisao, affectedRows: result.affectedRows });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de inativacao invalidos.', details: error.errors });
    return next(error);
  }
});
router.get('/', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const mesRef = req.query.mesRef;
    if (!lojaId || !mesRef) {
      const lojasPermitidas = getLojasPermitidasParaConsulta(req);
      const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
      const escalas = await escalaService.listEscalasResumo({ lojaId, mesRef, lojasPermitidas, secoesPermitidas });
      return res.json({ escalas });
    }

    const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
    const escalas = await escalaService.listEscalas({ lojaId, mesRef, secoesPermitidas });
    return res.json({ escalas });
  } catch (error) {
    return next(error);
  }
});

router.post('/validar', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = saveSchema.parse(req.body);
    await assertPayloadDentroDoEscopo(req, payload);
    const ruleErrors = validateEscalaPayload(payload);
    const ausenciaErrors = await escalaService.validateAusencias({
      lojaId: payload.lojaId,
      funcionarios: payload.funcionarios
    });
    const errors = [...ruleErrors, ...ausenciaErrors];
    return res.json({ ok: errors.length === 0, errors });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Formato da escala invalido.', details: error.errors });
    }
    return next(error);
  }
});

router.post('/funcionarios/revisao', requirePermission('escalas-funcionarios', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = saveSchema.parse(req.body);
    if (!payload.funcionarios.length || payload.funcionarios.length > 500) {
      return res.status(400).json({ error: 'Informe de 1 a 500 funcionarios alterados.' });
    }
    await assertPayloadDentroDoEscopo(req, payload);
    let anteriores;
    if (payload.edicaoRapida) {
      if (payload.funcionarios.length !== 1 || payload.funcionarios[0].dias.length !== 1) {
        return res.status(422).json({ error: 'A edicao rapida exige exatamente um funcionario e um dia.' });
      }
      anteriores = [await escalaService.getEscalaFuncionarioAtual({
        lojaId: payload.lojaId, mesRef: payload.mesRef, escfuncId: payload.funcionarios[0].escfuncId
      })];
      if (!anteriores[0]) return res.status(422).json({ error: 'A edicao rapida exige uma escala existente para um funcionario.' });
      const quickError = validateQuickRestWorkEdit(payload.funcionarios[0], anteriores[0].dias);
      if (quickError) return res.status(422).json({ error: quickError });
      const alteracao = buildDiaAlteracoes(anteriores[0].dias, payload.funcionarios[0].dias)[0];
      const fixos = await escalaService.listFixosEscala({ lojaId: payload.lojaId, mesRef: payload.mesRef,
        escsecaoId: Number(payload.funcionarios[0].escsecaoId) });
      if (fixos.some((fixo) => Number(fixo.ESCFUNC_ID) === payload.funcionarios[0].escfuncId
        && normalizeScheduleDay(fixo).data === alteracao.data)) {
        return res.status(422).json({ error: 'Dia com fixo deve ser alterado pelo editor de fixos.' });
      }
      const dias = anteriores[0].dias.map(normalizeScheduleDay).map((dia) =>
        dia.data === alteracao.data ? payload.funcionarios[0].dias[0] : dia);
      payload.funcionarios[0].dias = dias;
    }
    const errors = validateEscalaPayload(payload);
    const ausenciaErrors = await escalaService.validateAusencias({ funcionarios: payload.funcionarios });
    if (ausenciaErrors.length || (!payload.edicaoRapida && errors.length)) return res.status(422).json({ errors: [...errors, ...ausenciaErrors] });
    if (!anteriores) anteriores = await Promise.all(payload.funcionarios.map((funcionario) =>
      escalaService.getEscalaFuncionarioAtual({
        lojaId: payload.lojaId, mesRef: payload.mesRef, escfuncId: funcionario.escfuncId
      })
    ));
    const operacaoId = payload.operacaoId || escalaEventService.createOperationId();
    const saved = await escalaService.saveEscalasFuncionariosRevision({ ...payload, operacaoId, actor: req.user });
    await Promise.all(saved.map((item, index) => auditService.registerAudit({
      action: 'EDITAR_ESCALA_FUNCIONARIO',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: item.revisao,
      referenceId: item.escprogId,
      details: {
        operacaoId,
        escfuncId: payload.funcionarios[index].escfuncId,
        chapa: payload.funcionarios[index].chapa,
        revisaoAnterior: anteriores[index]?.revisao ?? null,
        revisaoNova: item.revisao,
        alteracoes: buildDiaAlteracoes(anteriores[index]?.dias || [], payload.funcionarios[index].dias)
      }
    })));
    return res.status(201).json({ saved, operacaoId, criticas: payload.edicaoRapida ? errors : [] });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Formato da escala invalido.', details: error.errors });
    return next(error);
  }
});

router.get('/operacoes/:operacaoId', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const query = z.object({
      lojaId: z.coerce.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).parse(req.query);
    const operacaoId = z.string().uuid().parse(req.params.operacaoId);
    const confirmacao = await escalaService.getCommittedDraftOperation({
      ...query, operacaoId, usuarioId: Number(req.user.sub)
    });
    return res.json({ confirmada: Boolean(confirmacao), confirmacao });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados da operacao invalidos.' });
    return next(error);
  }
});

router.post('/funcionario/revisao', requirePermission('escalas-funcionarios', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = saveSchema.parse(req.body);
    if (payload.funcionarios.length !== 1) {
      return res.status(400).json({ error: 'Informe exatamente um funcionario para a revisao individual.' });
    }
    await assertPayloadDentroDoEscopo(req, payload);
    const ruleErrors = validateEscalaPayload(payload);
    if (ruleErrors.length > 0) return res.status(422).json({ errors: ruleErrors });
    const ausenciaErrors = await escalaService.validateAusencias({ funcionarios: payload.funcionarios });
    if (ausenciaErrors.length > 0) return res.status(422).json({ errors: ausenciaErrors });

    const funcionarioPayload = payload.funcionarios[0];
    const escalaAnterior = await escalaService.getEscalaFuncionarioAtual({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escfuncId: funcionarioPayload.escfuncId
    });
    const alteracoes = buildDiaAlteracoes(escalaAnterior?.dias || [], funcionarioPayload.dias);
    const saved = await escalaService.saveEscalaFuncionarioRevision({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      funcionario: funcionarioPayload,
      dias: funcionarioPayload.dias,
      oficializada: payload.oficializada || 0,
      actor: req.user
    });
    await auditService.registerAudit({
      action: 'EDITAR_ESCALA_FUNCIONARIO',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: saved.revisao,
      referenceId: saved.escprogId,
      details: {
        escfuncId: funcionarioPayload.escfuncId,
        chapa: funcionarioPayload.chapa,
        revisaoAnterior: escalaAnterior?.revisao ?? null,
        revisaoNova: saved.revisao,
        diasRecebidos: funcionarioPayload.dias.length,
        diasAlterados: alteracoes.length,
        alteracoes,
        programacoes: [...new Set(funcionarioPayload.dias.map((dia) => dia.programacao || 'TRB'))],
        justificativa: payload.justificativa || funcionarioPayload.dias.find((dia) => dia.justificativa)?.justificativa || null
      }
    });
    return res.status(201).json({ saved: [saved] });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Formato da escala invalido.', details: error.errors });
    return next(error);
  }
});

async function getFuncionarioParaEdicaoHorario(req, payload, { permitirAprendiz = false } = {}) {
  const secoesPermitidas = await getSecoesPermitidas(req, payload.lojaId);
  const funcionarios = await catalogService.listFuncionariosByLoja(payload.lojaId, {
    mesRef: payload.mesRef, secoesPermitidas
  });
  const funcionario = funcionarios.find((item) => Number(item.ESCFUNC_ID) === Number(payload.escfuncId));
  if (!funcionario) {
    const error = new Error('Funcionario nao encontrado para a loja ou secoes permitidas.');
    error.statusCode = 404;
    throw error;
  }
  await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [Number(funcionario.ESCSECAO_ID)]);
  if (!permitirAprendiz && /APRENDIZ/i.test(String(funcionario.FUNCAO_DESCR || ''))) {
    const error = new Error('O horario do aprendiz e fixo e nao pode ser alterado.');
    error.statusCode = 422;
    throw error;
  }
  return funcionario;
}

router.post('/funcionario/horario/preview', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    if (!req.body?.mesRef || req.body?.aplicarNaEscala === false) {
      return res.status(422).json({ error: 'Informe o mes da escala. O horario-base e os dias editaveis devem ser atualizados juntos.' });
    }
    const payload = horarioFuncionarioSchema.parse(req.body);
    const errors = validateStandardShift(payload);
    if (errors.length) return res.status(422).json({ error: 'Horario do funcionario invalido.', details: errors });
    await getFuncionarioParaEdicaoHorario(req, payload);
    const impacto = await escalaService.previewHorarioFuncionarioEscala({
      lojaId: payload.lojaId, mesRef: payload.mesRef, escfuncId: payload.escfuncId,
      horario: payload
    });
    return res.json({ impacto });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados de horario invalidos.', details: error.errors });
    return next(error);
  }
});

router.patch('/funcionario/horario', requirePermission('escalas', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    if (!req.body?.mesRef || req.body?.aplicarNaEscala === false) {
      return res.status(422).json({ error: 'Informe o mes da escala. O horario-base e os dias editaveis devem ser atualizados juntos.' });
    }
    const payload = horarioFuncionarioSchema.parse(req.body);
    const errors = validateStandardShift(payload);
    if (errors.length) return res.status(422).json({ error: 'Horario do funcionario invalido.', details: errors });
    const funcionario = await getFuncionarioParaEdicaoHorario(req, payload);

    const horario = {
      HR_ENT1: payload.HR_ENT1,
      HR_SAI1: payload.HR_SAI1,
      HR_ENT2: payload.HR_ENT2,
      HR_SAI2: payload.HR_SAI2
    };
    const atualizacao = await escalaService.updateHorarioFuncionarioEscala({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      funcionario,
      horario,
      actor: req.user
    });
    const { funcionario: funcionarioAtualizado, saved, diasAlterados, mesesAtualizados } = atualizacao;

    await auditService.registerAudit({
      action: 'EDITAR_HORARIO_FUNCIONARIO',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef || null,
      revisao: saved?.revisao || null,
      referenceId: saved?.escprogId || payload.escfuncId,
      details: {
        escfuncId: payload.escfuncId,
        chapa: funcionarioAtualizado.CHAPA || funcionario.CHAPA,
        horario,
        aplicarNaEscala: true,
        escalaAtualizada: Boolean(saved),
        diasAlterados,
        mesesAtualizados
      }
    });

    return res.json({ funcionario: funcionarioAtualizado, escalaAtualizada: Boolean(saved), saved, diasAlterados, mesesAtualizados });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados de horario invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/funcionario/sincronizar-rm', requirePermission('escalas-funcionarios', 'editar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = syncFuncionarioRmSchema.parse(req.body);
    const secoesPermitidas = await getSecoesPermitidas(req, payload.lojaId);
    const funcionarios = await catalogService.listFuncionariosByLoja(payload.lojaId, { mesRef: payload.mesRef, secoesPermitidas });
    const funcionario = funcionarios.find((item) => Number(item.ESCFUNC_ID) === Number(payload.escfuncId));
    if (!funcionario) return res.status(404).json({ error: 'Funcionario nao encontrado para a loja informada.' });
    if (!funcionario.CPF) {
      return res.status(422).json({ error: `CPF nao cadastrado para o funcionario ${funcionario.CHAPA}. Atualize SGN_ESC_FUNCIONARIO.CPF antes de sincronizar com o RM.` });
    }

    const periodo = getOperationalPeriodIso(payload.mesRef);
    const consultaRm = await rmIntegrationService.consultarFolgasFuncionarioMes({
      cpf: funcionario.CPF,
      inicio: periodo.inicio,
      fim: periodo.fim,
      codColigadaFallback: funcionario.CODCOLIGADA
    });

    const saved = await escalaService.sincronizarEscalaFuncionarioComRm({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escfuncId: payload.escfuncId,
      rmFolgaDatas: consultaRm.datas,
      actor: req.user
    });

    await auditService.registerAudit({
      action: 'SINCRONIZAR_FUNCIONARIO_RM',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: saved.revisao,
      referenceId: saved.escprogId,
      details: {
        escfuncId: payload.escfuncId,
        chapa: funcionario.CHAPA,
        codTabFolga: consultaRm.codTabFolga,
        periodo,
        folgasRm: consultaRm.datas.length,
        alterado: saved.alterado,
        alteracoes: saved.alteracoes?.length || 0,
        revisaoAnterior: saved.revisaoAnterior ?? null,
        revisaoNova: saved.revisao
      }
    });

    return res.json({
      ok: true,
      funcionario: { escfuncId: payload.escfuncId, chapa: funcionario.CHAPA, nome: funcionario.NOME },
      rm: { codTabFolga: consultaRm.codTabFolga, folgas: consultaRm.datas, periodo },
      saved
    });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de sincronizacao invalidos.', details: error.errors });
    return next(error);
  }
});

router.get('/:escprogId/dias', requirePermission('escalas', 'visualizar'), async (req, res, next) => {
  try {
    const header = await escalaService.getEscalaHeader(Number(req.params.escprogId));
    if (!header) {
      return res.status(404).json({ error: 'Escala nao encontrada.' });
    }

    const loja = Number(header.LOJA);
    if (!canAccessLoja(req, loja)) {
      return res.status(403).json({ error: 'Usuario sem permissao para esta escala.' });
    }
    await accessService.assertSecoesPermitidas(req.user, loja, [header.ESCSECAO_ID || header.escsecao_id]);

    const dias = await escalaService.getEscalaDias(Number(req.params.escprogId));
    res.json({ dias });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:escprogId/dias/:escprogdiaId', requirePermission('escalas', 'editar'), async (req, res, next) => {
  try {
    const header = await escalaService.getEscalaHeader(Number(req.params.escprogId));
    if (!header) {
      return res.status(404).json({ error: 'Escala nao encontrada.' });
    }

    const loja = Number(header.LOJA);
    if (!canAccessLoja(req, loja)) {
      return res.status(403).json({ error: 'Usuario sem permissao para esta escala.' });
    }
    await accessService.assertSecoesPermitidas(req.user, loja, [header.ESCSECAO_ID || header.escsecao_id]);

    const data = diaSchema.parse(req.body);
    const diasAntes = await escalaService.getEscalaDias(Number(req.params.escprogId));
    const diaAnterior = diasAntes.find((item) => Number(item.ESCPROGDIA_ID || item.escprogdia_id) === Number(req.params.escprogdiaId));
    const dia = await escalaService.updateEscalaDia({
      escprogId: Number(req.params.escprogId),
      escprogdiaId: Number(req.params.escprogdiaId),
      data,
      actor: req.user
    });

    if (!dia) {
      return res.status(404).json({ error: 'Dia da escala nao encontrado.' });
    }

    const alteracoes = buildDiaAlteracoes(diaAnterior ? [diaAnterior] : [], [dia]);
    await auditService.registerAudit({
      action: 'EDITAR_DIA_ESCALA',
      user: req.user,
      lojaId: loja,
      mesRef: header.MES_REF,
      revisao: dia.REVISAO || header.REVISAO,
      referenceId: dia.NEW_ESCPROG_ID || Number(req.params.escprogId),
      details: {
        escprogId: Number(req.params.escprogId),
        escprogdiaId: Number(req.params.escprogdiaId),
        revisaoAnterior: header.REVISAO,
        revisaoNova: dia.REVISAO || header.REVISAO,
        alteracoes,
        programacao: data.PROGRAMACAO
      }
    });

    return res.json({ dia });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos do dia invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.post('/', requirePermission('escalas', 'criar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = saveSchema.parse(req.body);
    if (!accessService.canCreateEscala(req.user)) {
      return res.status(403).json({ error: 'Perfil Lider nao pode criar novas escalas.' });
    }
    await assertPayloadDentroDoEscopo(req, payload);
    const ruleErrors = validateEscalaPayload(payload);
    if (ruleErrors.length > 0) {
      return res.status(422).json({ errors: ruleErrors });
    }

    const ausenciaErrors = await escalaService.validateAusencias({
      lojaId: payload.lojaId,
      funcionarios: payload.funcionarios
    });
    if (ausenciaErrors.length > 0) {
      return res.status(422).json({ errors: ausenciaErrors });
    }

    const saved = await escalaService.saveEscalasBatch({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escalaOrigemId: payload.escalaOrigemId,
      funcionarios: payload.funcionarios,
      oficializada: payload.oficializada || 0,
      actor: req.user
    });

    await auditService.registerAudit({
      action: 'SALVAR_ESCALA',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: saved[0]?.revisao,
      referenceId: saved[0]?.escprogId,
      details: {
        funcionarios: payload.funcionarios.length,
        secoes: new Set(payload.funcionarios.map((funcionario) => funcionario.escsecaoId || funcionario.ESCSECAO_ID).filter(Boolean)).size,
        oficializada: payload.oficializada || 0
      }
    });

    return res.status(201).json({ saved });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Formato da escala invalido.', details: error.errors });
    }
    return next(error);
  }
});

module.exports = router;
