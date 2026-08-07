const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess } = require('../middleware/auth');
const escalaService = require('../services/escalaService');
const catalogService = require('../services/catalogService');
const auditService = require('../services/auditService');
const rmIntegrationService = require('../services/rmIntegrationService');
const { REGRAS_VIGENTES, validateEscalaPayload } = require('../rules/escalaRules');

const router = express.Router();

const saveSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  escalaOrigemId: z.number().int().positive().optional(),
  funcionarios: z.array(z.object({
    escfuncId: z.number().int().positive(),
    chapa: z.string().min(1).max(8),
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

router.use(requireAuth);

router.get('/regras', async (req, res) => {
  res.json({ regras: REGRAS_VIGENTES });
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

router.get('/resumo', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const mesRef = req.query.mesRef || null;
    const escalas = await escalaService.listEscalasResumo({ lojaId, mesRef });
    return res.json({ escalas });
  } catch (error) {
    return next(error);
  }
});

router.get('/revisoes', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = Number(req.query.lojaId);
    const mesRef = req.query.mesRef;
    if (!lojaId || !mesRef) {
      return res.status(400).json({ error: 'lojaId e mesRef sao obrigatorios.' });
    }

    const revisoes = await escalaService.listEscalaRevisoes({ lojaId, mesRef });
    return res.json({ revisoes });
  } catch (error) {
    return next(error);
  }
});


router.get('/historico', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = req.query.lojaId ? Number(req.query.lojaId) : null;
    const mesRef = req.query.mesRef || null;
    const lojasPermitidas = req.user?.perfil === 'ADMIN' && (!req.user.lojas || req.user.lojas.length === 0) ? [] : (req.user.lojas || []);
    const historico = await escalaService.listHistoricoEscala({ lojaId, mesRef, lojasPermitidas });
    return res.json({ historico });
  } catch (error) {
    return next(error);
  }
});

router.get('/mensal', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = Number(req.query.lojaId);
    const mesRef = req.query.mesRef;
    if (!lojaId || !mesRef) {
      return res.status(400).json({ error: 'lojaId e mesRef sao obrigatorios.' });
    }

    const escala = await escalaService.getEscalaMensal({ lojaId, mesRef });
    return res.json({ escala });
  } catch (error) {
    return next(error);
  }
});

router.get('/mensal-lote', async (req, res, next) => {
  try {
    const mesRef = req.query.mesRef;
    if (!mesRef) {
      return res.status(400).json({ error: 'mesRef e obrigatorio.' });
    }

    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const escalas = [];
    for (const lojaId of lojas) {
      const escala = await escalaService.getEscalaMensal({ lojaId, mesRef });
      escalas.push({ lojaId, escala });
    }
    return res.json({ escalas });
  } catch (error) {
    return next(error);
  }
});

router.get('/rm/logs', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const logs = await rmIntegrationService.listRmLogs({
      lojaId: req.query.lojaId ? Number(req.query.lojaId) : null,
      mesRef: req.query.mesRef || null
    });
    return res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

router.post('/rm/reprocessar', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
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

router.post('/oficializar', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = z.object({
      lojaId: z.number().int().positive(),
      mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).parse(req.body);

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

router.post('/inativar', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
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
router.get('/', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const lojaId = Number(req.query.lojaId);
    const mesRef = req.query.mesRef;
    if (!lojaId || !mesRef) {
      return res.status(400).json({ error: 'lojaId e mesRef sao obrigatorios.' });
    }

    const escalas = await escalaService.listEscalas({ lojaId, mesRef });
    return res.json({ escalas });
  } catch (error) {
    return next(error);
  }
});

router.post('/funcionario/revisao', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = saveSchema.parse(req.body);
    if (payload.funcionarios.length !== 1) {
      return res.status(400).json({ error: 'Informe exatamente um funcionario para a revisao individual.' });
    }
    const ruleErrors = validateEscalaPayload(payload);
    if (ruleErrors.length > 0) return res.status(422).json({ errors: ruleErrors });
    const ausenciaErrors = await escalaService.validateAusencias({ funcionarios: payload.funcionarios });
    if (ausenciaErrors.length > 0) return res.status(422).json({ errors: ausenciaErrors });

    const saved = await escalaService.saveEscalaFuncionarioRevision({
      lojaId: payload.lojaId,
      mesRef: payload.mesRef,
      funcionario: payload.funcionarios[0],
      dias: payload.funcionarios[0].dias,
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
        escfuncId: payload.funcionarios[0].escfuncId,
        chapa: payload.funcionarios[0].chapa,
        diasAlterados: payload.funcionarios[0].dias.length,
        programacoes: [...new Set(payload.funcionarios[0].dias.map((dia) => dia.programacao || 'TRB'))],
        justificativa: payload.justificativa || payload.funcionarios[0].dias.find((dia) => dia.justificativa)?.justificativa || null
      }
    });
    return res.status(201).json({ saved: [saved] });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Formato da escala invalido.', details: error.errors });
    return next(error);
  }
});

router.get('/:escprogId/dias', async (req, res, next) => {
  try {
    const header = await escalaService.getEscalaHeader(Number(req.params.escprogId));
    if (!header) {
      return res.status(404).json({ error: 'Escala nao encontrada.' });
    }

    const loja = Number(header.LOJA);
    if (!canAccessLoja(req, loja)) {
      return res.status(403).json({ error: 'Usuario sem permissao para esta escala.' });
    }

    const dias = await escalaService.getEscalaDias(Number(req.params.escprogId));
    res.json({ dias });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:escprogId/dias/:escprogdiaId', async (req, res, next) => {
  try {
    const header = await escalaService.getEscalaHeader(Number(req.params.escprogId));
    if (!header) {
      return res.status(404).json({ error: 'Escala nao encontrada.' });
    }

    const loja = Number(header.LOJA);
    if (!canAccessLoja(req, loja)) {
      return res.status(403).json({ error: 'Usuario sem permissao para esta escala.' });
    }

    const data = diaSchema.parse(req.body);
    const dia = await escalaService.updateEscalaDia({
      escprogId: Number(req.params.escprogId),
      escprogdiaId: Number(req.params.escprogdiaId),
      data
    });

    if (!dia) {
      return res.status(404).json({ error: 'Dia da escala nao encontrado.' });
    }

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

router.post('/', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    const payload = saveSchema.parse(req.body);
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
