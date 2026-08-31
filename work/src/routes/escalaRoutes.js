const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess, requirePermission } = require('../middleware/auth');
const escalaService = require('../services/escalaService');
const catalogService = require('../services/catalogService');
const accessService = require('../services/accessService');
const auditService = require('../services/auditService');
const rmIntegrationService = require('../services/rmIntegrationService');
const monthlyReleaseService = require('../services/monthlyReleaseService');
const { REGRAS_VIGENTES, validateEscalaPayload } = require('../rules/escalaRules');
const { buildDiaAlteracoes } = require('../utils/scheduleDiff');

const router = express.Router();

const saveSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  escalaOrigemId: z.number().int().positive().optional(),
  funcionarios: z.array(z.object({
    escfuncId: z.number().int().positive(),
    chapa: z.string().min(1).max(8),
    nome: z.string().max(100).optional(),
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
      escsecaoId: z.number().int().positive()
    }).parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [payload.escsecaoId]);
    const resultado = await monthlyReleaseService.gerarEscalaSecao(payload);
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
      escsecaoId: z.number().int().positive()
    }).parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, payload.lojaId, [payload.escsecaoId]);
    const resultado = await monthlyReleaseService.resetarEscalaSecao(payload);
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
    const fixo = await escalaService.saveFixoEscala({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escfuncId: payload.escfuncId,
      escsecaoId: payload.escsecaoId,
      data: payload
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
  return lojas.includes(Number(loja)) || (req.user?.perfil === 'ADMIN' && lojas.length === 0);
}

function getLojasPermitidasParaConsulta(req) {
  if (req.user?.perfil === 'ADMIN' && (!req.user.lojas || req.user.lojas.length === 0)) return null;
  return req.user?.lojas || [];
}

function getMonthEndIso(mesRef) {
  const ref = new Date(`${String(mesRef).slice(0, 10)}T00:00:00`);
  return new Date(ref.getFullYear(), ref.getMonth() + 1, 0).toISOString().slice(0, 10);
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

  if (req.user?.perfil === 'ADMIN' && (!req.user.lojas || req.user.lojas.length === 0)) {
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


router.get('/historico', requirePermission('historico', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const mesRef = req.query.mesRef || null;
    const lojasPermitidas = getLojasPermitidasParaConsulta(req);
    const historico = await escalaService.listHistoricoEscala({ lojaId, mesRef, lojasPermitidas });
    return res.json({ historico });
  } catch (error) {
    return next(error);
  }
});

router.get('/mensal', requirePermission('escalas', 'visualizar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = Number(req.query.lojaId);
    const mesRef = req.query.mesRef;
    if (!lojaId || !mesRef) {
      return res.status(400).json({ error: 'lojaId e mesRef sao obrigatorios.' });
    }

    const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
    const escala = await escalaService.getEscalaMensal({ lojaId, mesRef, secoesPermitidas });
    return res.json({ escala });
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
      revisao: z.number().int().min(0)
    }).parse(req.body);
    const rm = await rmIntegrationService.oficializarNoRm(payload);
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

router.post('/oficializar', requirePermission('escalas', 'oficializar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).parse(req.body);

    const preRequisitosRm = await rmIntegrationService.validarPreRequisitosRm(payload);
    if (preRequisitosRm.errors?.length) {
      return res.status(422).json({
        error: 'Existem pendencias antes de oficializar a escala no RM.',
        errors: preRequisitosRm.errors,
        details: preRequisitosRm
      });
    }

    const result = await escalaService.oficializarEscala(payload);
    if (!result.affectedRows) return res.status(404).json({ error: 'Escala ativa nao encontrada.' });
    const rm = await rmIntegrationService.oficializarNoRm({ ...payload, revisao: result.revisao });
    await auditService.registerAudit({
      action: 'OFICIALIZAR_ESCALA',
      user: req.user,
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      revisao: result.revisao,
      details: { oficializada: 1, rmStatus: rm.enabled ? (rm.falhas ? 'FALHA_PARCIAL' : 'ENVIADO') : 'IGNORADO', rmEnviados: rm.enviados, rmFalhas: rm.falhas }
    });
    return res.json({ ok: true, revisao: result.revisao, affectedRows: result.affectedRows, rm });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Parametros de oficializacao invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/inativar', requirePermission('escalas', 'inativar'), resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).parse(req.body);

    const result = await escalaService.inativarEscala(payload);
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
      oficializada: payload.oficializada || 0
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

    const consultaRm = await rmIntegrationService.consultarFolgasFuncionarioMes({
      cpf: funcionario.CPF,
      inicio: payload.mesRef,
      fim: getMonthEndIso(payload.mesRef),
      codColigadaFallback: funcionario.CODCOLIGADA
    });

    const saved = await escalaService.sincronizarEscalaFuncionarioComRm({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      escfuncId: payload.escfuncId,
      rmFolgaDatas: consultaRm.datas
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
      rm: { codTabFolga: consultaRm.codTabFolga, folgas: consultaRm.datas },
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
      data
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
      oficializada: payload.oficializada || 0
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
