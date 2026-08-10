const express = require('express');
const { z } = require('zod');
const { requireAuth, requirePermission } = require('../middleware/auth');
const accessService = require('../services/accessService');
const auditService = require('../services/auditService');

const router = express.Router();

const usuarioUpdateSchema = z.object({
  NOME: z.string().min(1).max(100).optional(),
  PERFIL: z.string().min(1).max(30).optional(),
  STATUS: z.enum(['A', 'I']).optional(),
  LOJAS: z.array(z.number().int().positive()).optional()
}).strict();

const usuarioCreateSchema = z.object({
  LOGIN: z.string().min(3).max(60),
  NOME: z.string().min(1).max(100),
  PASSWORD: z.string().min(6).max(100),
  PERFIL: z.string().min(1).max(30),
  STATUS: z.enum(['A', 'I']).optional(),
  LOJAS: z.array(z.number().int().positive()).default([])
}).strict();

const permissaoSchema = z.object({
  PAGINA: z.string().min(1).max(60),
  PODE_VISUALIZAR: z.number().int().min(0).max(1).optional(),
  PODE_EDITAR: z.number().int().min(0).max(1).optional(),
  PODE_EXCLUIR: z.number().int().min(0).max(1).optional()
}).strict();

const perfilSchema = z.object({
  NOME: z.string().min(1).max(30),
  DESCR: z.string().max(100).nullable().optional(),
  STATUS: z.enum(['A', 'I']).optional(),
  PERMISSOES: z.array(permissaoSchema).optional()
}).strict();

router.use(requireAuth);

router.get('/perfis', requirePermission('roles', 'visualizar'), async (req, res, next) => {
  try {
    const result = await accessService.listPerfisAcesso();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.post('/perfis', requirePermission('roles', 'editar'), async (req, res, next) => {
  try {
    const data = perfilSchema.parse(req.body);
    const perfil = await accessService.createPerfilAcesso(data);
    await auditService.registerAudit({
      action: 'CRIAR_PERFIL',
      entity: 'ACESSO',
      user: req.user,
      referenceId: perfil.PERFIL_ID,
      details: { perfil: perfil.NOME, permissoes: (data.PERMISSOES || []).length }
    });
    return res.status(201).json({ perfil });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados de perfil invalidos.', details: error.errors });
    return next(error);
  }
});

router.patch('/perfis/:perfilId', requirePermission('roles', 'editar'), async (req, res, next) => {
  try {
    const data = perfilSchema.partial().parse(req.body);
    const perfil = await accessService.updatePerfilAcesso(Number(req.params.perfilId), data);
    if (!perfil) return res.status(404).json({ error: 'Perfil nao encontrado.' });
    await auditService.registerAudit({
      action: data.STATUS === 'I' ? 'INATIVAR_PERFIL' : 'EDITAR_PERFIL',
      entity: 'ACESSO',
      user: req.user,
      referenceId: perfil.PERFIL_ID,
      details: { perfil: perfil.NOME, status: perfil.STATUS, permissoes: (data.PERMISSOES || []).length }
    });
    return res.json({ perfil });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Dados de perfil invalidos.', details: error.errors });
    return next(error);
  }
});


router.get('/usuarios', requirePermission('acessos', 'visualizar'), async (req, res, next) => {
  try {
    const usuarios = await accessService.listUsuariosAcesso(req.user);
    res.json({ usuarios });
  } catch (error) {
    next(error);
  }
});

router.post('/usuarios', requirePermission('acessos', 'editar'), async (req, res, next) => {
  try {
    const data = usuarioCreateSchema.parse(req.body);
    const usuario = await accessService.createUsuarioAcesso({
      login: data.LOGIN,
      nome: data.NOME,
      password: data.PASSWORD,
      perfil: data.PERFIL,
      status: data.STATUS || 'A',
      lojas: data.LOJAS
    });
    await auditService.registerAudit({
      action: 'CRIAR_USUARIO',
      entity: 'ACESSO',
      user: req.user,
      referenceId: usuario.USUARIO_ID,
      details: { login: usuario.LOGIN, perfil: usuario.PERFIL, lojas: usuario.LOJAS.length }
    });
    return res.status(201).json({ usuario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados de usuario invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.patch('/usuarios/:usuarioId', requirePermission('acessos', 'editar'), async (req, res, next) => {
  try {
    const data = usuarioUpdateSchema.parse(req.body);
    const usuario = await accessService.updateUsuarioAcesso(Number(req.params.usuarioId), data);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario nao encontrado.' });
    }
    await auditService.registerAudit({
      action: data.STATUS === 'I' ? 'INATIVAR_USUARIO' : 'EDITAR_USUARIO',
      entity: 'ACESSO',
      user: req.user,
      referenceId: usuario.USUARIO_ID,
      details: { login: usuario.LOGIN, perfil: usuario.PERFIL, status: usuario.STATUS, lojas: usuario.LOJAS.length }
    });
    return res.json({ usuario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados de usuario invalidos.', details: error.errors });
    }
    return next(error);
  }
});

module.exports = router;
