const monitored = new Set([
  'POST /api/escalas/gerar-secao',
  'POST /api/escalas/funcionario/horario/preview',
  'PATCH /api/escalas/funcionario/horario'
]);

function attachMutationDiagnostics(req, res, { warnAfterMs = 30000, log = console.warn } = {}) {
  if (!monitored.has(`${req.method} ${req.path}`)) return;
  const startedAt = Date.now();
  const details = () => ({
    requestId: req.id,
    method: req.method,
    path: req.path,
    durationMs: Date.now() - startedAt,
    user: req.user?.login || null
  });
  log(JSON.stringify({ event: 'mutation_started', ...details() }));
  const timer = setTimeout(() => {
    log(JSON.stringify({ event: 'mutation_slow', ...details() }));
  }, warnAfterMs);
  timer.unref?.();
  res.once('finish', () => clearTimeout(timer));
  res.once('close', () => {
    clearTimeout(timer);
    if (!res.writableEnded) log(JSON.stringify({ event: 'mutation_connection_closed', ...details() }));
  });
}

module.exports = { attachMutationDiagnostics };
