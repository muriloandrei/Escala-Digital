const express = require('express');
const { requireAuth } = require('../middleware/auth');
const accessService = require('../services/accessService');

const router = express.Router();

router.use(requireAuth);

router.get('/usuarios', async (req, res, next) => {
  try {
    const usuarios = await accessService.listUsuariosAcesso();
    res.json({ usuarios });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
