const express = require('express');
const { z } = require('zod');
const { requirePermission } = require('../middleware/auth');
const adesaoEscalasService = require('../services/adesaoEscalasService');

const router = express.Router();
const month = z.string().regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/);
const querySchema = z.object({
  mes_inicial: month,
  mes_final: month,
  loja: z.coerce.number().int().positive().optional()
}).strict().refine((value) => value.mes_inicial <= value.mes_final, {
  message: 'O mes inicial deve ser anterior ou igual ao mes final.'
}).refine((value) => {
  const [firstYear, firstMonth] = value.mes_inicial.split('-').map(Number);
  const [lastYear, lastMonth] = value.mes_final.split('-').map(Number);
  return (lastYear - firstYear) * 12 + lastMonth - firstMonth <= 35;
}, {
  message: 'O intervalo maximo e de 36 meses.'
});

router.get('/adesao-escalas', requirePermission('adesao-escalas'), async (req, res, next) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Parametros invalidos.', details: parsed.error.flatten() });
  try {
    const result = await adesaoEscalasService.getAdesaoEscalas(parsed.data, req.user);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
