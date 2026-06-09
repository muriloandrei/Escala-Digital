const { readData, writeData } = require('../db/mockStore');
const { getEnv } = require('../config/env');

async function getState(userId) {
  const env = getEnv();
  if (env.dbDriver !== 'mock') {
    const error = new Error('Persistencia generica ainda nao implementada para Oracle.');
    error.statusCode = 501;
    throw error;
  }

  const data = await readData();
  const state = data.APP_STATE?.[userId] || {};
  return {
    escalasSalvas: state.escalasSalvas || [],
    escalaConfig: state.escalaConfig || {}
  };
}

async function saveEscalas(userId, escalasSalvas) {
  const env = getEnv();
  if (env.dbDriver !== 'mock') {
    const error = new Error('Persistencia generica ainda nao implementada para Oracle.');
    error.statusCode = 501;
    throw error;
  }

  const data = await readData();
  data.APP_STATE = data.APP_STATE || {};
  data.APP_STATE[userId] = data.APP_STATE[userId] || {};
  data.APP_STATE[userId].escalasSalvas = escalasSalvas;
  await writeData(data);
  return { ok: true };
}

async function saveConfig(userId, escalaConfig) {
  const env = getEnv();
  if (env.dbDriver !== 'mock') {
    const error = new Error('Persistencia generica ainda nao implementada para Oracle.');
    error.statusCode = 501;
    throw error;
  }

  const data = await readData();
  data.APP_STATE = data.APP_STATE || {};
  data.APP_STATE[userId] = data.APP_STATE[userId] || {};
  data.APP_STATE[userId].escalaConfig = escalaConfig;
  await writeData(data);
  return { ok: true };
}

module.exports = {
  getState,
  saveEscalas,
  saveConfig
};
