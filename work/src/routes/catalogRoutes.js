const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess } = require('../middleware/auth');
const catalogService = require('../services/catalogService');

const router = express.Router();

const funcionarioEscalaSchema = z.object({
  BRIGADISTA: z.string().max(1).optional(),
  HR_ENT1: z.string().max(5).nullable().optional(),
  HR_SAI1: z.string().max(5).nullable().optional(),
  HR_ENT2: z.string().max(5).nullable().optional(),
  HR_SAI2: z.string().max(5).nullable().optional()
}).strict();

router.use(requireAuth);

async function resolveLojaParam(req, res, next) {
  try {
    const lojaCodigo = await catalogService.resolveLojaCodigo(Number(req.params.lojaId));
    req.params.lojaId = String(lojaCodigo);
    return next();
  } catch (error) {
    return next(error);
  }
}

router.get('/lojas', async (req, res, next) => {
  try {
    const lojas = await catalogService.listLojas();
    const lojasUsuario = new Set((req.user.lojas || []).map(Number));
    const allowed = req.user.perfil === 'ADMIN'
      ? lojas
      : lojas.filter((loja) => {
        return lojasUsuario.has(Number(loja.LOJA)) || lojasUsuario.has(Number(loja.ESCLOJA_ID));
      });

    res.json({ lojas: allowed });
  } catch (error) {
    next(error);
  }
});

router.get('/lojas/:lojaId/funcionarios', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const funcionarios = await catalogService.listFuncionariosByLoja(Number(req.params.lojaId));
    res.json({ funcionarios });
  } catch (error) {
    next(error);
  }
});

router.patch('/lojas/:lojaId/funcionarios/:escfuncId', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const data = funcionarioEscalaSchema.parse(req.body);
    const funcionario = await catalogService.updateFuncionarioEscala({
      lojaId: Number(req.params.lojaId),
      escfuncId: Number(req.params.escfuncId),
      data
    });

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionario nao encontrado para a loja.' });
    }

    return res.json({ funcionario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de funcionario invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.get('/lojas/:lojaId/ausencias', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ error: 'Parametros inicio e fim sao obrigatorios.' });
    }

    const ausencias = await catalogService.listAusenciasByLojaMes(Number(req.params.lojaId), inicio, fim);
    return res.json({ ausencias });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
