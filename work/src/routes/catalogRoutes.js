const express = require('express');
const { requireAuth, requireLojaAccess } = require('../middleware/auth');
const catalogService = require('../services/catalogService');

const router = express.Router();

router.use(requireAuth);

router.get('/lojas', async (req, res, next) => {
  try {
    const lojas = await catalogService.listLojas();
    const allowed = req.user.perfil === 'ADMIN'
      ? lojas
      : lojas.filter((loja) => req.user.lojas.includes(Number(loja.LOJA)));

    res.json({ lojas: allowed });
  } catch (error) {
    next(error);
  }
});

router.get('/lojas/:lojaId/funcionarios', requireLojaAccess, async (req, res, next) => {
  try {
    const funcionarios = await catalogService.listFuncionariosByLoja(Number(req.params.lojaId));
    res.json({ funcionarios });
  } catch (error) {
    next(error);
  }
});

router.get('/lojas/:lojaId/ausencias', requireLojaAccess, async (req, res, next) => {
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
