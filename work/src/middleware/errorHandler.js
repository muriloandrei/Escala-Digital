function notFound(req, res) {
  res.status(404).json({ error: 'Recurso nao encontrado.', requestId: req.id || null });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.statusCode || err.status || 500;
  const message = status >= 500 ? 'Erro interno do servidor.' : err.message;

  if (status >= 500) {
    console.error(JSON.stringify({
      event: 'server_error',
      requestId: req.id || null,
      method: req.method,
      path: req.originalUrl,
      status,
      code: err.code || null,
      errorNum: err.errorNum || null,
      message: err.message
    }));
  }

  return res.status(status).json({ error: message, requestId: req.id || null });
}

module.exports = { notFound, errorHandler };
