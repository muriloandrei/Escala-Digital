const express = require('express');
const { z } = require('zod');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const accessService = require('../services/accessService');

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

router.use(requireAuth);

router.get('/usuarios', async (req, res, next) => {
  try {
    const usuarios = await accessService.listUsuariosAcesso(req.user);
    res.json({ usuarios });
  } catch (error) {
    next(error);
  }
});

router.post('/usuarios', requireAdmin, async (req, res, next) => {
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
    return res.status(201).json({ usuario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados de usuario invalidos.', details: error.errors });
    }
    return next(error);
  }
});

router.patch('/usuarios/:usuarioId', requireAdmin, async (req, res, next) => {
  try {
    const data = usuarioUpdateSchema.parse(req.body);
    const usuario = await accessService.updateUsuarioAcesso(Number(req.params.usuarioId), data);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario nao encontrado.' });
    }
    return res.json({ usuario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados de usuario invalidos.', details: error.errors });
    }
    return next(error);
  }
});

module.exports = router;
