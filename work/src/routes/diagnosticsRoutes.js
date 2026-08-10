const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const diagnosticsService = require('../services/diagnosticsService');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/oracle', async (req, res, next) => {
  try {
    const result = await diagnosticsService.checkOracle();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/rm', async (req, res, next) => {
  try {
    const result = await diagnosticsService.checkRm();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
