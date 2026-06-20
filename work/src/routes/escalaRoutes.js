const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess } = require('../middleware/auth');
const escalaService = require('../services/escalaService');
const catalogService = require('../services/catalogService');
const auditService = require('../services/auditService');
const { validateEscalaPayload } = require('../rules/escalaRules');

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
    dias: z.array(z.object({
      data: z.string().min(10).max(10),
      hrEnt1: z.string().max(5).nullable().optional(),
      hrSai1: z.string().max(5).nullable().optional(),
      hrEnt2: z.string().max(5).nullable().optional(),
      hrSai2: z.string().max(5).nullable().optional(),
      programacao: z.string().max(3).nullable().optional()
    }))
  })),
  oficializada: z.number().int().min(0).max(1).optional()
});
const diaSchema = z.object({
  HR_ENT1: z.string().max(5),
  HR_SAI1: z.string().max(5),
  HR_ENT2: z.string().max(5),
  HR_SAI2: z.string().max(5),
  PROGRAMACAO: z.string().max(3).optional().default('TRB')
}).strict();

router.use(requireAuth);

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
