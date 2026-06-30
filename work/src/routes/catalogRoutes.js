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

const secaoTurnoSchema = z.object({
  HR_ENT1: z.string().regex(/^\d{2}:\d{2}$/),
  HR_SAI1: z.string().regex(/^\d{2}:\d{2}$/),
  HR_ENT2: z.string().regex(/^\d{2}:\d{2}$/),
  HR_SAI2: z.string().regex(/^\d{2}:\d{2}$/),
  QTDE_COLABORADORES: z.number().int().positive().max(500)
}).strict();

const secaoSchema = secaoTurnoSchema.extend({
  COD_SECAO: z.string().trim().min(1).max(10),
  DESCR: z.string().trim().min(1).max(100)
}).strict();

const secaoCadastroSchema = z.object({
  COD_SECAO: z.string().trim().min(1).max(10),
  DESCR: z.string().trim().min(1).max(100)
}).strict();

const turnoSecaoSchema = secaoTurnoSchema.extend({
  ESCSECAO_ID: z.number().int().positive()
}).strict();

const tipoDescansoSchema = z.object({
  DESCR: z.string().trim().min(1).max(100),
  SIGLA: z.string().trim().min(1).max(3),
  STATUS: z.enum(['A', 'I']).optional()
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
    const allowed = lojasUsuario.size === 0 && req.user.perfil === 'ADMIN'
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

router.get('/lojas/:lojaId/secoes', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const secoes = await catalogService.listSecoesByLoja(Number(req.params.lojaId));
    res.json({ secoes });
  } catch (error) {
    next(error);
  }
});

router.post('/lojas/:lojaId/secoes', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const data = secaoCadastroSchema.parse(req.body);
    const secao = await catalogService.createSecao({
      lojaId: Number(req.params.lojaId),
      data
    });
    return res.status(201).json({ secao });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de secao invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.put('/lojas/:lojaId/secoes/:escsecaoId', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const data = secaoCadastroSchema.parse(req.body);
    const secao = await catalogService.updateSecao({
      lojaId: Number(req.params.lojaId),
      escsecaoId: Number(req.params.escsecaoId),
      data
    });

    if (!secao) {
      return res.status(404).json({ error: 'Secao nao encontrada para a loja.' });
    }

    return res.json({ secao });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de secao invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.get('/lojas/:lojaId/turnos-secao', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const turnos = await catalogService.listTurnosByLoja(Number(req.params.lojaId));
    return res.json({ turnos });
  } catch (error) {
    return next(error);
  }
});

router.post('/lojas/:lojaId/turnos-secao', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const data = turnoSecaoSchema.parse(req.body);
    const turno = await catalogService.saveSecaoTurno({
      lojaId: Number(req.params.lojaId),
      escsecaoId: data.ESCSECAO_ID,
      data
    });

    if (!turno) {
      return res.status(404).json({ error: 'Secao nao encontrada para a loja.' });
    }

    return res.status(201).json({ turno });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de turno da secao invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.put('/lojas/:lojaId/turnos-secao/:escsecaoTurnoId', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const data = turnoSecaoSchema.parse(req.body);
    const turno = await catalogService.saveSecaoTurno({
      lojaId: Number(req.params.lojaId),
      escsecaoTurnoId: Number(req.params.escsecaoTurnoId),
      escsecaoId: data.ESCSECAO_ID,
      data
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno da secao nao encontrado para a loja.' });
    }

    return res.json({ turno });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de turno da secao invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.patch('/lojas/:lojaId/secoes/:escsecaoId/turno', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const data = secaoTurnoSchema.parse(req.body);
    const turno = await catalogService.saveSecaoTurno({
      lojaId: Number(req.params.lojaId),
      escsecaoId: Number(req.params.escsecaoId),
      data
    });

    if (!turno) {
      return res.status(404).json({ error: 'Secao nao encontrada para a loja.' });
    }

    return res.json({ turno });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de turno da secao invalidos.', details: error.errors });
    }
    return next(error);
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
