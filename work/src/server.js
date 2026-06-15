const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getEnv } = require('./config/env');
const { initOraclePool, closeOraclePool } = require('./db/oracle');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const escalaRoutes = require('./routes/escalaRoutes');
const stateRoutes = require('./routes/stateRoutes');
const accessRoutes = require('./routes/accessRoutes');
const diagnosticsRoutes = require('./routes/diagnosticsRoutes');

const env = getEnv();
const app = express();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'oracle' });
});

function redirectToLoginWhenMissingSession(req, res, next) {
  if (!req.cookies.access_token) {
    return res.redirect('/login.html');
  }

  return next();
}

app.get('/app', redirectToLoginWhenMissingSession, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'app-original.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/escalas', escalaRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/acessos', accessRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api', notFound);

app.get('*', (req, res) => {
  res.redirect('/login.html');
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

  async function shutdown() {
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
