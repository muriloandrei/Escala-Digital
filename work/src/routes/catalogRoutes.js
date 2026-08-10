const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess, requirePermission } = require('../middleware/auth');
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
  CLASSIFICACAO: z.enum(['FOLGA', 'FERIAS', 'AFASTAMENTO', 'OUTROS']).optional(),
  STATUS: z.enum(['A', 'I']).optional()
}).strict();

const horarioPadraoSchema = z.object({
  DESCR: z.string().trim().min(1).max(100),
  HR_ENT1: z.string().regex(/^\d{2}:\d{2}$/),
  HR_SAI1: z.string().regex(/^\d{2}:\d{2}$/),
  HR_ENT2: z.string().regex(/^\d{2}:\d{2}$/),
  HR_SAI2: z.string().regex(/^\d{2}:\d{2}$/),
  JORNADA_MINUTOS: z.number().int().positive().max(1440).optional(),
  INTERVALO_MINUTOS: z.number().int().positive().max(480).optional(),
  STATUS: z.enum(['A', 'I']).optional()
}).strict();

router.use(requireAuth);

function timeToMinutes(value) {
  if (!/^\d{2}:\d{2}$/.test(String(value || ''))) return null;
  const [hours, minutes] = String(value).split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, '0');
  const minutes = String(safeMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function validateSecaoTurno(data) {
  const ent1 = timeToMinutes(data.HR_ENT1);
  const sai1 = timeToMinutes(data.HR_SAI1);
  const ent2 = timeToMinutes(data.HR_ENT2);
  const sai2 = timeToMinutes(data.HR_SAI2);
  const errors = [];

  if ([ent1, sai1, ent2, sai2].some((value) => value === null)) {
    return ['Informe todos os horarios do turno no formato HH:MM.'];
  }

  const primeiraJornada = sai1 - ent1;
  const intervalo = ent2 - sai1;
  const segundaJornada = sai2 - ent2;
  const jornadaTotal = primeiraJornada + segundaJornada;

  if (primeiraJornada <= 0) errors.push('Saida 1 deve ser maior que Entrada 1.');
  if (segundaJornada <= 0) errors.push('Saida 2 deve ser maior que Entrada 2.');
  if (intervalo <= 0) errors.push('Entrada 2 deve ser maior que Saida 1.');
  if (primeiraJornada >= 360) errors.push(`Primeiro periodo deve ser menor que 06:00. Atual: ${minutesToTime(primeiraJornada)}.`);
  if (segundaJornada >= 360) errors.push(`Segundo periodo deve ser menor que 06:00. Atual: ${minutesToTime(segundaJornada)}.`);
  if (jornadaTotal !== 528) errors.push(`Jornada total deve ser exatamente 08:48. Atual: ${minutesToTime(jornadaTotal)}.`);
  if (intervalo < 70) errors.push(`Intervalo entre as jornadas deve ter no minimo 01:10. Atual: ${minutesToTime(intervalo)}.`);

  return errors;
}

function assertValidSecaoTurno(data) {
  const errors = validateSecaoTurno(data);
  if (!errors.length) return;
  const error = new Error('Campos de turno da secao invalidos.');
  error.statusCode = 422;
  error.details = errors;
  throw error;
}

async function getLojasPermitidas(req, requestedLojaId = 'all') {
  if (requestedLojaId && requestedLojaId !== 'all') {
    const lojaCodigo = await catalogService.resolveLojaCodigo(Number(requestedLojaId));
    const lojasUsuario = req.user?.lojas || [];
    if (req.user?.perfil !== 'ADMIN' && !lojasUsuario.includes(lojaCodigo)) {
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

async function resolveLojaParam(req, res, next) {
  try {
    const lojaCodigo = await catalogService.resolveLojaCodigo(Number(req.params.lojaId));
    req.params.lojaId = String(lojaCodigo);
    return next();
  } catch (error) {
    return next(error);
  }
}


router.get('/tipos-descanso', async (req, res, next) => {
  try {
    const tipos = await catalogService.listTiposDescanso({ includeInactive: req.query.includeInactive === '1' });
    return res.json({ tipos });
  } catch (error) {
    return next(error);
  }
});

router.post('/tipos-descanso', requirePermission('tipos-descanso', 'editar'), async (req, res, next) => {
  try {
    const data = tipoDescansoSchema.parse(req.body);
    const tipo = await catalogService.createTipoDescanso(data);
    return res.status(201).json({ tipo });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de tipo de descanso invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.patch('/tipos-descanso/:tipoId', requirePermission('tipos-descanso', 'editar'), async (req, res, next) => {
  try {
    const data = tipoDescansoSchema.partial().parse(req.body);
    const tipo = await catalogService.updateTipoDescanso(Number(req.params.tipoId), data);
    if (!tipo) return res.status(404).json({ error: 'Tipo de descanso nao encontrado.' });
    return res.json({ tipo });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de tipo de descanso invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.get('/horarios-padrao', async (req, res, next) => {
  try {
    const horarios = await catalogService.listHorariosPadrao({ includeInactive: req.query.includeInactive === '1' });
    return res.json({ horarios });
  } catch (error) {
    return next(error);
  }
});

router.post('/horarios-padrao', requirePermission('horarios-padrao', 'editar'), async (req, res, next) => {
  try {
    const data = horarioPadraoSchema.parse(req.body);
    const horario = await catalogService.createHorarioPadrao(data);
    return res.status(201).json({ horario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de horario padrao invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.patch('/horarios-padrao/:horarioId', requirePermission('horarios-padrao', 'editar'), async (req, res, next) => {
  try {
    const data = horarioPadraoSchema.partial().parse(req.body);
    const horario = await catalogService.updateHorarioPadrao(Number(req.params.horarioId), data);
    if (!horario) return res.status(404).json({ error: 'Horario padrao nao encontrado.' });
    return res.json({ horario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de horario padrao invalidos.', details: error.errors });
    }
    return next(error);
  }
});

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

router.get('/funcionarios', async (req, res, next) => {
  try {
    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const funcionarios = await catalogService.listFuncionariosByLojas(lojas, {
      mesRef: req.query.mesRef || null
    });
    return res.json({ funcionarios });
  } catch (error) {
    return next(error);
  }
});

router.get('/secoes', async (req, res, next) => {
  try {
    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const secoes = await catalogService.listSecoesByLojas(lojas);
    return res.json({ secoes });
  } catch (error) {
    return next(error);
  }
});

router.get('/turnos-secao', async (req, res, next) => {
  try {
    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const turnos = await catalogService.listTurnosByLojas(lojas);
    return res.json({ turnos });
  } catch (error) {
    return next(error);
  }
});

router.get('/lojas/:lojaId/funcionarios', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const funcionarios = await catalogService.listFuncionariosByLoja(Number(req.params.lojaId), {
      mesRef: req.query.mesRef || null
    });
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

router.post('/lojas/:lojaId/secoes', resolveLojaParam, requireLojaAccess, requirePermission('secoes', 'editar'), async (req, res, next) => {
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

router.put('/lojas/:lojaId/secoes/:escsecaoId', resolveLojaParam, requireLojaAccess, requirePermission('secoes', 'editar'), async (req, res, next) => {
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

router.post('/lojas/:lojaId/turnos-secao', resolveLojaParam, requireLojaAccess, requirePermission('turnos-secao', 'editar'), async (req, res, next) => {
  try {
    const data = turnoSecaoSchema.parse(req.body);
    assertValidSecaoTurno(data);
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
    if (error.statusCode === 422) {
      return res.status(422).json({ error: error.message, details: error.details });
    }
    return next(error);
  }
});

router.put('/lojas/:lojaId/turnos-secao/:escsecaoTurnoId', resolveLojaParam, requireLojaAccess, requirePermission('turnos-secao', 'editar'), async (req, res, next) => {
  try {
    const data = turnoSecaoSchema.parse(req.body);
    assertValidSecaoTurno(data);
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
    if (error.statusCode === 422) {
      return res.status(422).json({ error: error.message, details: error.details });
    }
    return next(error);
  }
});

router.patch('/lojas/:lojaId/secoes/:escsecaoId/turno', resolveLojaParam, requireLojaAccess, requirePermission('turnos-secao', 'editar'), async (req, res, next) => {
  try {
    const data = secaoTurnoSchema.parse(req.body);
    assertValidSecaoTurno(data);
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
    if (error.statusCode === 422) {
      return res.status(422).json({ error: error.message, details: error.details });
    }
    return next(error);
  }
});

router.patch('/lojas/:lojaId/funcionarios/:escfuncId', resolveLojaParam, requireLojaAccess, requirePermission('funcionarios', 'editar'), async (req, res, next) => {
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
