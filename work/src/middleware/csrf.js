const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function normalizeOrigin(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return '';
  }
}

function getRequestOrigin(req) {
  const origin = req.get?.('origin');
  if (origin) return normalizeOrigin(origin);

  const referer = req.get?.('referer');
  return normalizeOrigin(referer);
}

function getExpectedOrigin(req) {
  const proto = String(req.get?.('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
  const host = req.get?.('host');
  if (!host) return '';
  return `${proto}://${host}`.toLowerCase();
}

function shouldBlockCsrf(req) {
  if (SAFE_METHODS.has(String(req.method || '').toUpperCase())) return false;
  if (!String(req.path || '').startsWith('/api')) return false;
  if (String(req.path || '') === '/api/auth/login') return false;

  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) return false;

  const expectedOrigin = getExpectedOrigin(req);
  return Boolean(expectedOrigin && requestOrigin !== expectedOrigin);
}

function csrfSameOriginGuard(req, res, next) {
  if (shouldBlockCsrf(req)) {
    return res.status(403).json({ error: 'Origem da requisicao nao permitida.', requestId: req.id || null });
  }

  return next();
}

module.exports = {
  csrfSameOriginGuard,
  _private: {
    normalizeOrigin,
    getRequestOrigin,
    getExpectedOrigin,
    shouldBlockCsrf
  }
};
