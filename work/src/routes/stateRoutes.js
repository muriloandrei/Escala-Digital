const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const stateService = require('../services/stateService');

const router = express.Router();

const escalasSchema = z.object({
  escalasSalvas: z.array(z.any())
});

const configSchema = z.object({
  escalaConfig: z.record(z.any())
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const state = await stateService.getState(req.user.sub);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.put('/escalas', async (req, res, next) => {
  try {
    const payload = escalasSchema.parse(req.body);
    const result = await stateService.saveEscalas(req.user.sub, payload.escalasSalvas);
    res.json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Formato de escalas invalido.' });
    }
    return next(error);
  }
});

router.put('/config', async (req, res, next) => {
  try {
    const payload = configSchema.parse(req.body);
    const result = await stateService.saveConfig(req.user.sub, payload.escalaConfig);
    res.json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Formato de configuracao invalido.' });
    }
    return next(error);
  }
});

module.exports = router;
