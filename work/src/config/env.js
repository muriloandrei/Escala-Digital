const dotenv = require('dotenv');

dotenv.config();

function getEnv() {
  const dbDriver = process.env.DB_DRIVER || 'mock';
  const required = ['JWT_SECRET'];
  if (dbDriver === 'oracle') {
    required.push('ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECT_STRING');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variaveis de ambiente obrigatorias ausentes: ${missing.join(', ')}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    dbDriver,
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
    }
  };
}

module.exports = { getEnv };
