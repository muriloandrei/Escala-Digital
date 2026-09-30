const express = require('express');
const { z } = require('zod');
const { requireAuth, requireLojaAccess, requirePermission } = require('../middleware/auth');
const catalogService = require('../services/catalogService');
const accessService = require('../services/accessService');
const pendenciaFuncionarioService = require('../services/pendenciaFuncionarioService');
const auditService = require('../services/auditService');
const { validateStandardShift } = require('../domain/shiftValidation');

const router = express.Router();

const funcionarioEscalaSchema = z.object({
  BRIGADISTA: z.string().max(1).optional(),
  ESCSECAO_ID: z.number().int().positive().optional(),
  ESCSUBSECAO_ID: z.number().int().positive().nullable().optional(),
  HR_ENT1: z.string().max(5).nullable().optional(),
  HR_SAI1: z.string().max(5).nullable().optional(),
  HR_ENT2: z.string().max(5).nullable().optional(),
  HR_SAI2: z.string().max(5).nullable().optional(),
  DT_DEMISS: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()
}).strict();

const dataIsoSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Data invalida.');

const suspensaoFuncionarioSchema = z.object({
  tipo: z.enum(['AFASTAMENTO', 'TRANSFERENCIA', 'DESLIGAMENTO', 'OUTRO']),
  inicio: dataIsoSchema,
  fim: dataIsoSchema.nullable().optional(),
  justificativa: z.string().trim().min(10).max(500)
}).strict().refine((value) => !value.fim || value.fim >= value.inicio, {
  message: 'A data final deve ser igual ou posterior a inicial.', path: ['fim']
});

function podeGerirPendencias(req) {
  return ['ADMIN', 'RH'].includes(String(req.user?.perfil || '').toUpperCase());
}

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

const subsecaoSchema = z.object({
  DESCR: z.string().trim().min(1).max(100),
  STATUS: z.enum(['A', 'I']).optional()
}).strict();

const funcionarioSubsecaoSchema = z.object({
  ESCSECAO_ID: z.number().int().positive().optional(),
  ESCSUBSECAO_ID: z.number().int().positive().nullable(),
  MES_REF: dataIsoSchema.optional(),
  VIGENCIA: z.enum(['IMEDIATO', 'PROXIMA_SEMANA', 'PROXIMO_MES']).optional()
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

function assertValidSecaoTurno(data) {
  const errors = validateStandardShift(data);
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
    if (req.user?.perfil !== 'ADMIN' && !accessService.isGlobalStoreAccessUser(req.user) && !lojasUsuario.includes(lojaCodigo)) {
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

async function resolveLojaParam(req, res, next) {
  try {
    const lojaCodigo = await catalogService.resolveLojaCodigo(Number(req.params.lojaId));
    req.params.lojaId = String(lojaCodigo);
    return next();
  } catch (error) {
    return next(error);
  }
}

async function getSecoesPermitidas(req, lojaId = null) {
  return accessService.getSecoesPermitidasUsuario(req.user, lojaId);
}


router.get('/tipos-descanso', async (req, res, next) => {
  try {
    const tipos = await catalogService.listTiposDescanso({ includeInactive: req.query.includeInactive === '1' });
    return res.json({ tipos });
  } catch (error) {
    return next(error);
  }
});

router.post('/tipos-descanso', requirePermission('tipos-descanso', 'criar'), async (req, res, next) => {
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

router.post('/horarios-padrao', requirePermission('horarios-padrao', 'criar'), async (req, res, next) => {
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
    const allowed = accessService.isGlobalStoreAccessUser(req.user)
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
    const secoesPermitidas = await getSecoesPermitidas(req);
    const funcionarios = await catalogService.listFuncionariosByLojas(lojas, {
      mesRef: req.query.mesRef || null,
      includeInactive: req.query.includeInactive === '1',
      secoesPermitidas
    });
    return res.json({ funcionarios });
  } catch (error) {
    return next(error);
  }
});

router.get('/suspensoes-funcionarios', async (req, res, next) => {
  try {
    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const suspensoes = [];
    for (const lojaId of lojas) {
      const registros = await pendenciaFuncionarioService.listar({
        lojaId, incluirEncerradas: req.query.historico === '1'
      });
      suspensoes.push(...(podeGerirPendencias(req) ? registros : registros.map((registro) => ({
        ESCFUNC_ID: registro.ESCFUNC_ID,
        DT_INICIO: registro.DT_INICIO,
        DT_FIM: registro.DT_FIM,
        STATUS: registro.STATUS
      }))));
    }
    return res.json({ suspensoes });
  } catch (error) {
    return next(error);
  }
});

router.post('/lojas/:lojaId/funcionarios/:escfuncId/suspensoes', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    if (!podeGerirPendencias(req)) return res.status(403).json({ error: 'Somente Admin e RH podem suspender funcionarios da escala.' });
    const data = suspensaoFuncionarioSchema.parse(req.body);
    const lojaId = Number(req.params.lojaId);
    const escfuncId = Number(req.params.escfuncId);
    if (!Number.isInteger(escfuncId) || escfuncId <= 0) return res.status(400).json({ error: 'Funcionario invalido.' });
    const resultado = await pendenciaFuncionarioService.criar({ lojaId, escfuncId, ...data, usuario: req.user });
    await auditService.registerAudit({
      action: 'SUSPENDER_FUNCIONARIO_ESCALA', entity: 'FUNCIONARIO', user: req.user,
      lojaId, referenceId: escfuncId,
      details: { pendenciaId: resultado.id, tipo: data.tipo, inicio: data.inicio, fim: data.fim, justificativa: data.justificativa, impacto: resultado.impacto }
    });
    return res.status(201).json(resultado);
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados da suspensao invalidos.', details: error.errors });
    return next(error);
  }
});

router.post('/lojas/:lojaId/suspensoes/:pendenciaId/encerrar', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    if (!podeGerirPendencias(req)) return res.status(403).json({ error: 'Somente Admin e RH podem encerrar suspensoes.' });
    const lojaId = Number(req.params.lojaId);
    const pendenciaId = Number(req.params.pendenciaId);
    if (!Number.isInteger(pendenciaId) || pendenciaId <= 0) return res.status(400).json({ error: 'Pendencia invalida.' });
    const encerrada = await pendenciaFuncionarioService.encerrar({ lojaId, pendenciaId, usuario: req.user });
    if (!encerrada) return res.status(404).json({ error: 'Pendencia aberta nao encontrada nesta loja.' });
    await auditService.registerAudit({
      action: 'ENCERRAR_SUSPENSAO_FUNCIONARIO', entity: 'FUNCIONARIO', user: req.user,
      lojaId, referenceId: pendenciaId, details: { pendenciaId }
    });
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

router.get('/secoes', async (req, res, next) => {
  try {
    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const secoesPermitidas = await getSecoesPermitidas(req);
    const secoes = await catalogService.listSecoesByLojas(lojas, { secoesPermitidas });
    return res.json({ secoes });
  } catch (error) {
    return next(error);
  }
});

router.get('/turnos-secao', async (req, res, next) => {
  try {
    const lojas = await getLojasPermitidas(req, req.query.lojaId || 'all');
    const secoesPermitidas = await getSecoesPermitidas(req);
    const turnos = await catalogService.listTurnosByLojas(lojas, { secoesPermitidas });
    return res.json({ turnos });
  } catch (error) {
    return next(error);
  }
});

router.get('/lojas/:lojaId/funcionarios', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const secoesPermitidas = await getSecoesPermitidas(req, Number(req.params.lojaId));
    const funcionarios = await catalogService.listFuncionariosByLoja(Number(req.params.lojaId), {
      mesRef: req.query.mesRef || null,
      includeInactive: req.query.includeInactive === '1',
      secoesPermitidas
    });
    res.json({ funcionarios });
  } catch (error) {
    next(error);
  }
});

router.get('/lojas/:lojaId/secoes', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const secoesPermitidas = await getSecoesPermitidas(req, Number(req.params.lojaId));
    const secoes = await catalogService.listSecoesByLoja(Number(req.params.lojaId), {
      secoesPermitidas,
      includeInactive: req.query.includeInactive === '1'
    });
    res.json({ secoes });
  } catch (error) {
    next(error);
  }
});

router.post('/lojas/:lojaId/secoes', resolveLojaParam, requireLojaAccess, requirePermission('secoes', 'criar'), async (req, res, next) => {
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

router.get('/lojas/:lojaId/secoes/:escsecaoId/subsecoes', resolveLojaParam, requireLojaAccess, requirePermission('secoes', 'visualizar'), async (req, res, next) => {
  try {
    const secoesPermitidas = await getSecoesPermitidas(req, Number(req.params.lojaId));
    await accessService.assertSecoesPermitidas(req.user, Number(req.params.lojaId), [Number(req.params.escsecaoId)]);
    const subsecoes = await catalogService.listSubsecoesBySecao({
      lojaId: Number(req.params.lojaId),
      escsecaoId: Number(req.params.escsecaoId),
      includeInactive: req.query.includeInactive === '1'
    });
    if (!subsecoes) return res.status(404).json({ error: 'Secao nao encontrada para a loja.' });
    if (Array.isArray(secoesPermitidas) && !secoesPermitidas.map(Number).includes(Number(req.params.escsecaoId))) {
      return res.status(403).json({ error: 'Secao nao liberada para o usuario.' });
    }
    return res.json({ subsecoes });
  } catch (error) {
    return next(error);
  }
});

router.post('/lojas/:lojaId/secoes/:escsecaoId/subsecoes', resolveLojaParam, requireLojaAccess, requirePermission('escalas', 'editar'), async (req, res, next) => {
  try {
    const data = subsecaoSchema.pick({ DESCR: true }).parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, Number(req.params.lojaId), [Number(req.params.escsecaoId)]);
    const subsecao = await catalogService.createSubsecao({
      lojaId: Number(req.params.lojaId),
      escsecaoId: Number(req.params.escsecaoId),
      data
    });
    if (!subsecao) return res.status(404).json({ error: 'Secao nao encontrada para a loja.' });
    return res.status(201).json({ subsecao });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Campos de subsecao invalidos.', details: error.errors });
    if (error.statusCode === 422) return res.status(422).json({ error: error.message });
    return next(error);
  }
});

router.put('/lojas/:lojaId/secoes/:escsecaoId/subsecoes/:escsubsecaoId', resolveLojaParam, requireLojaAccess, requirePermission('escalas', 'editar'), async (req, res, next) => {
  try {
    const data = subsecaoSchema.parse(req.body);
    await accessService.assertSecoesPermitidas(req.user, Number(req.params.lojaId), [Number(req.params.escsecaoId)]);
    const subsecao = await catalogService.updateSubsecao({
      lojaId: Number(req.params.lojaId),
      escsecaoId: Number(req.params.escsecaoId),
      escsubsecaoId: Number(req.params.escsubsecaoId),
      data
    });
    if (!subsecao) return res.status(404).json({ error: 'Subsecao nao encontrada para a secao.' });
    return res.json({ subsecao });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Campos de subsecao invalidos.', details: error.errors });
    if (error.statusCode === 422) return res.status(422).json({ error: error.message });
    return next(error);
  }
});

router.delete('/lojas/:lojaId/secoes/:escsecaoId/subsecoes/:escsubsecaoId', resolveLojaParam, requireLojaAccess, requirePermission('escalas', 'editar'), async (req, res, next) => {
  try {
    await accessService.assertSecoesPermitidas(req.user, Number(req.params.lojaId), [Number(req.params.escsecaoId)]);
    const subsecao = await catalogService.deleteSubsecao({
      lojaId: Number(req.params.lojaId),
      escsecaoId: Number(req.params.escsecaoId),
      escsubsecaoId: Number(req.params.escsubsecaoId)
    });
    if (!subsecao) return res.status(404).json({ error: 'Subsecao nao encontrada para a secao.' });
    return res.json({ subsecao });
  } catch (error) {
    if (error.statusCode === 422) return res.status(422).json({ error: error.message });
    return next(error);
  }
});

router.patch('/lojas/:lojaId/secoes/:escsecaoId/subsecoes/funcionarios/:escfuncId', resolveLojaParam, requireLojaAccess, requirePermission('escalas', 'editar'), async (req, res, next) => {
  try {
    const data = funcionarioSubsecaoSchema.pick({ ESCSUBSECAO_ID: true }).parse(req.body);
    const lojaId = Number(req.params.lojaId);
    const escsecaoId = Number(req.params.escsecaoId);
    const escfuncId = Number(req.params.escfuncId);
    await accessService.assertSecoesPermitidas(req.user, lojaId, [escsecaoId]);
    const funcionarios = await catalogService.listFuncionariosByLoja(lojaId, { secoesPermitidas: [escsecaoId] });
    const funcionarioPermitido = funcionarios.some((funcionario) => Number(funcionario.ESCFUNC_ID) === escfuncId && Number(funcionario.ESCSECAO_ID) === escsecaoId);
    if (!funcionarioPermitido) return res.status(404).json({ error: 'Funcionario nao encontrado para a secao.' });
    const funcionario = await catalogService.updateFuncionarioEscala({
      lojaId,
      escfuncId,
      data: { ESCSUBSECAO_ID: data.ESCSUBSECAO_ID },
      actor: req.user
    });
    return res.json({ funcionario });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Campos de funcionario invalidos.', details: error.errors });
    if (error.statusCode === 422) return res.status(422).json({ error: error.message });
    return next(error);
  }
});

router.patch('/lojas/:lojaId/funcionarios/:escfuncId/subsecao', resolveLojaParam, requireLojaAccess, requirePermission('escalas', 'editar'), async (req, res, next) => {
  try {
    const data = funcionarioSubsecaoSchema.parse(req.body);
    const lojaId = Number(req.params.lojaId);
    const escfuncId = Number(req.params.escfuncId);
    const secoesPermitidas = await getSecoesPermitidas(req, lojaId);
    const funcionarios = await catalogService.listFuncionariosByLoja(lojaId, { secoesPermitidas });
    const funcionarioAtual = funcionarios.find((funcionario) => Number(funcionario.ESCFUNC_ID) === escfuncId);
    if (!funcionarioAtual) return res.status(404).json({ error: 'Funcionario nao encontrado para a loja ou secoes permitidas.' });

    const escsecaoId = Number(data.ESCSECAO_ID || funcionarioAtual.ESCSECAO_ID);
    if (!escsecaoId || Number(funcionarioAtual.ESCSECAO_ID) !== escsecaoId) {
      return res.status(422).json({ error: 'Subsecao deve pertencer a secao atual do funcionario.' });
    }
    await accessService.assertSecoesPermitidas(req.user, lojaId, [escsecaoId]);

    const funcionario = await catalogService.updateFuncionarioEscala({
      lojaId,
      escfuncId,
      data: { ESCSUBSECAO_ID: data.ESCSUBSECAO_ID },
      actor: req.user,
      mesRef: data.MES_REF,
      vigencia: data.VIGENCIA
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionario nao encontrado para a loja.' });
    return res.json({ funcionario });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Campos de funcionario invalidos.', details: error.errors });
    if (error.statusCode === 422) return res.status(422).json({ error: error.message });
    return next(error);
  }
});

router.get('/lojas/:lojaId/turnos-secao', resolveLojaParam, requireLojaAccess, async (req, res, next) => {
  try {
    const secoesPermitidas = await getSecoesPermitidas(req, Number(req.params.lojaId));
    const turnos = await catalogService.listTurnosByLoja(Number(req.params.lojaId), { secoesPermitidas });
    return res.json({ turnos });
  } catch (error) {
    return next(error);
  }
});

router.post('/lojas/:lojaId/turnos-secao', resolveLojaParam, requireLojaAccess, requirePermission('turnos-secao', 'criar'), async (req, res, next) => {
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
    if (['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'].some((field) => data[field] !== undefined)) {
      return res.status(422).json({ error: 'Atualize o horario pela operacao de horario do funcionario para refletir na escala.' });
    }
    if (data.DT_DEMISS !== undefined) {
      return res.status(422).json({ error: 'Demissao e reativacao devem vir do RM. Use a suspensao operacional para uma pendencia temporaria.' });
    }
    const funcionario = await catalogService.updateFuncionarioEscala({
      lojaId: Number(req.params.lojaId),
      escfuncId: Number(req.params.escfuncId),
      data,
      actor: req.user
    });

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionario nao encontrado para a loja.' });
    }

    return res.json({ funcionario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Campos de funcionario invalidos.', details: error.errors });
    }
    if (error.statusCode === 422) return res.status(422).json({ error: error.message });
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
