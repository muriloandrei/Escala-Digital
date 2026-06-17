const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess } = require('../middleware/auth');
const escalaService = require('../services/escalaService');
const catalogService = require('../services/catalogService');
const { validateEscalaPayload } = require('../rules/escalaRules');

const router = express.Router();

const saveSchema = z.object({
  lojaId: z.number().int().positive(),
  mesRef: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  escalaOrigemId: z.number().int().positive().optional(),
  funcionarios: z.array(z.object({
    escfuncId: z.number().int().positive(),
    
    // Tornamos tolerante: aceita string, converte pra número, e aceita minúsculo ou maiúsculo
    escsecaoId: z.coerce.number().int().positive().optional(),
    ESCSECAO_ID: z.coerce.number().int().positive().optional(),
    escfuncaoId: z.coerce.number().int().positive().optional(), // <-- Adicione aqui
    ESCFUNCAO_ID: z.coerce.number().int().positive().optional(), // <-- Adicione aqui
    
    
    chapa: z.string().min(1).max(8),
    escsecaoId: z.number().int().positive().nullable().optional(),
    escfuncaoId: z.number().int().positive().nullable().optional(),
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
    if (req.user.perfil !== 'ADMIN' && !req.user.lojas.includes(loja)) {
      return res.status(403).json({ error: 'Usuario sem permissao para esta escala.' });
    }

    const dias = await escalaService.getEscalaDias(Number(req.params.escprogId));
    res.json({ dias });
  } catch (error) {
    return next(error);
  }
});

router.post('/', resolveLojaRequest, requireLojaAccess, async (req, res, next) => {
  try {
    console.log("=== DADO BRUTO DO FRONTEND ===", JSON.stringify(req.body.funcionarios[0]));
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

    return res.status(201).json({ saved });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Formato da escala invalido.', details: error.errors });
    }
    return next(error);
  }
});

module.exports = router;
