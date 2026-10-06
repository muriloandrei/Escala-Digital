const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getEnv } = require('./config/env');
const { isReactUiAllowed, requiresTraining } = require('./config/reactUiAccess');
const { initOraclePool, closeOraclePool, withConnection } = require('./db/oracle');
const { csrfSameOriginGuard } = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const escalaRoutes = require('./routes/escalaRoutes');
const stateRoutes = require('./routes/stateRoutes');
const accessRoutes = require('./routes/accessRoutes');
const diagnosticsRoutes = require('./routes/diagnosticsRoutes');
const monthlyReleaseService = require('./services/monthlyReleaseService');
const trainingProgressService = require('./services/trainingProgressService');
const { LAST_STAGE } = require('./config/trainingStages');
const subsectionTransferService = require('./services/subsectionTransferService');
const { getAppVersion } = require('./utils/appVersion');

const env = getEnv();
const app = express();

const appVersion = process.env.APP_VERSION || getAppVersion(path.join(__dirname, '..'));

function setNoStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

if (env.trustProxy !== false) {
  app.set('trust proxy', env.trustProxy);
}

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const startedAt = Date.now();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    if (req.path === '/favicon.ico' || (!req.path.startsWith('/api') && req.path !== '/app' && req.path !== '/health')) {
      return;
    }

    console.log(JSON.stringify({
      event: 'http_request',
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      user: req.user?.login || null
    }));
  });

  next();
});

app.use(express.static(path.join(__dirname, '..', 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    if (/\.(?:html|js|css)$/i.test(filePath)) {
      setNoStore(res);
    }
  }
}));
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  setNoStore(res);
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  try {
    await withConnection((connection) => connection.execute('select 1 from dual'));
    res.json({ status: 'ready', database: 'oracle' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable', database: 'oracle' });
  }
});

app.get('/api/app-version', (req, res) => {
  setNoStore(res);
  res.json({ version: appVersion });
});

const loginLimiter = rateLimit({
  windowMs: env.rateLimit.loginWindowMs,
  limit: env.rateLimit.loginLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' }
});

const apiLimiter = rateLimit({
  windowMs: env.rateLimit.apiWindowMs,
  limit: env.rateLimit.apiLimit,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/favicon.ico' || req.path === '/auth/login',
  message: { error: 'Muitas requisicoes. Aguarde alguns instantes e tente novamente.' }
});

function redirectToLoginWhenMissingSession(req, res, next) {
  if (!req.cookies.access_token) {
    return res.redirect('/');
  }

  return next();
}

async function requireCompletedTraining(req, res, next) {
  if (!requiresTraining(req.user, env.ui)) return next();
  try {
    const progress = await trainingProgressService.getProgress(Number(req.user.sub));
    if (!progress.persisted) return res.status(503).json({ error: 'A migration do treinamento precisa ser aplicada antes de liberar o acesso.' });
    if (progress.stage < LAST_STAGE) {
      if (req.originalUrl.startsWith('/api/')) return res.status(428).json({ error: 'Conclua o treinamento antes de usar o sistema.', startPath: '/nova/treinamento' });
      return res.redirect('/nova/treinamento');
    }
    return next();
  } catch (error) { return next(error); }
}

app.get('/app', redirectToLoginWhenMissingSession, requireAuth, requireCompletedTraining, (req, res) => {
  setNoStore(res);
  res.sendFile(path.join(__dirname, '..', 'views', 'app-original.html'));
});

const reactDist = path.join(__dirname, '..', 'dist', 'react');
function requireReactUiAccess(req, res, next) {
  if (isReactUiAllowed(req.user, env.ui)) return next();
  if (req.baseUrl === '/nova/assets') return res.status(403).end();
  return res.redirect('/app#/escalas-geradas');
}

app.use('/nova/assets', redirectToLoginWhenMissingSession, requireAuth, requireReactUiAccess, express.static(path.join(reactDist, 'assets'), {
  immutable: true,
  maxAge: '1y'
}));
app.get(/^\/nova(?:\/.*)?$/, redirectToLoginWhenMissingSession, requireAuth, requireReactUiAccess, async (req, res, next) => {
  if (req.path !== '/nova/treinamento') return requireCompletedTraining(req, res, next);
  return next();
}, (req, res) => {
  setNoStore(res);
  res.sendFile(path.join(reactDist, 'index.html'), (error) => {
    if (error && !res.headersSent) res.status(503).json({ error: 'Interface React ainda nao compilada.' });
  });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);
app.use('/api', csrfSameOriginGuard);
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth, requireCompletedTraining);
app.use('/api/catalog', catalogRoutes);
app.use('/api/escalas', escalaRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/acessos', accessRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api', notFound);

app.get('*', (req, res) => {
  res.redirect('/');
});

app.use(errorHandler);

function listen(port, attemptsLeft = 10) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);

    server.once('listening', () => {
      console.log(`Servidor de escala rodando em http://localhost:${port} usando Oracle`);
      resolve(server);
    });

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`Porta ${port} em uso. Tentando porta ${port + 1}...`);
        server.close(() => {
          listen(port + 1, attemptsLeft - 1).then(resolve).catch(reject);
        });
        return;
      }

      reject(error);
    });
  });
}

async function start() {
  await initOraclePool();

  const server = await listen(env.port);
  const monthlyReleaseInterval = monthlyReleaseService.startMonthlyReleaseScheduler(env);
  const transferInterval = subsectionTransferService.startScheduler(env.subsectionTransfers);

  async function shutdown() {
    if (monthlyReleaseInterval) clearInterval(monthlyReleaseInterval);
    if (transferInterval) clearInterval(transferInterval);
    server.close(async () => {
      await closeOraclePool();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  });
}

module.exports = {
  app,
  listen,
  start
};
