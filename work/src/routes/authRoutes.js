const express = require('express');
const { z } = require('zod');
const { getEnv } = require('../config/env');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const loginSchema = z.object({
  login: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200)
});

const lojaPrincipalSchema = z.object({
  lojaPrincipal: z.number().int().positive()
});

router.post('/login', async (req, res, next) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const { token, user } = await authService.login(credentials);
    const { auth, nodeEnv } = getEnv();
    const requestIsSecure = req.secure || String(req.get('x-forwarded-proto') || '').split(',')[0].trim() === 'https';

    if (auth.cookieSecure && !requestIsSecure) {
      const error = new Error('COOKIE_SECURE=true exige acesso via HTTPS. Use HTTPS/Nginx ou defina COOKIE_SECURE=false para acesso direto por HTTP.');
      error.statusCode = 500;
      throw error;
    }

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: auth.cookieSecure,
      sameSite: nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: auth.sessionMaxAgeMs
    });

    res.json({ user });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.statusCode = 400;
      error.message = 'Dados de login invalidos.';
    }
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.status(204).send();
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me/loja-principal', requireAuth, async (req, res, next) => {
  try {
    const { lojaPrincipal } = lojaPrincipalSchema.parse(req.body);
    const lojas = Array.isArray(req.user?.lojas) ? req.user.lojas.map(Number) : [];
    if (!lojas.includes(Number(lojaPrincipal))) {
      return res.status(403).json({ error: 'Loja principal deve estar entre as lojas permitidas do usuario.' });
    }
    const user = await authService.updateLojaPrincipal(Number(req.user.sub), Number(lojaPrincipal));
    return res.json({ user });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.statusCode = 400;
      error.message = 'Dados de loja principal invalidos.';
    }
    return next(error);
  }
});

module.exports = router;
