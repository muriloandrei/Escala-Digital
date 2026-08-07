const dotenv = require('dotenv');

dotenv.config();

function parseTrustProxy(value) {
  const normalized = String(value || 'false').trim().toLowerCase();
  if (!normalized || normalized === 'false' || normalized === '0' || normalized === 'off') return false;
  if (normalized === 'true' || normalized === 'on') return 1;
  if (/^\d+$/.test(normalized)) return Number(normalized);
  return value;
}

function getEnv() {
  const required = ['JWT_SECRET', 'ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECT_STRING'];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variaveis de ambiente obrigatorias ausentes: ${missing.join(', ')}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    oracle: {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
      poolMax: Number(process.env.ORACLE_POOL_MAX || 10),
      poolIncrement: Number(process.env.ORACLE_POOL_INCREMENT || 1)
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
      cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true'
    },
    rateLimit: {
      apiWindowMs: Number(process.env.RATE_LIMIT_API_WINDOW_MS || 15 * 60 * 1000),
      apiLimit: Number(process.env.RATE_LIMIT_API_MAX || 1500),
      loginWindowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || 15 * 60 * 1000),
      loginLimit: Number(process.env.RATE_LIMIT_LOGIN_MAX || 30)
    },
    rm: {
      enabled: String(process.env.RM_API_ENABLED || 'false').trim().toLowerCase() === 'true',
      baseUrl: process.env.RM_API_BASE_URL || '',
      username: process.env.RM_API_USER || '',
      password: process.env.RM_API_PASSWORD || '',
      timeoutMs: Number(process.env.RM_API_TIMEOUT_MS || 15000),
      retries: Number(process.env.RM_API_RETRIES || 2)
    },
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY)
  };
}

module.exports = { getEnv, parseTrustProxy };
