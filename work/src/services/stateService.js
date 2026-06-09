const { readData, writeData } = require('../db/mockStore');
const { getEnv } = require('../config/env');

async function getState(userId) {
  const env = getEnv();
  if (env.dbDriver !== 'mock') {
    return {
      escalasSalvas: [],
      escalaConfig: {},
      mode: 'oracle',
      message: 'Estado local desativado. As escalas oficiais devem ser consultadas em SGN_ESC_PROG e SGN_ESC_PROG_DIA.'
    };
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
    return {
      ok: true,
      persisted: false,
      mode: 'oracle',
      message: 'Estado local ignorado em Oracle. Use /api/escalas para persistencia oficial.'
    };
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
    return {
      ok: true,
      persisted: false,
      mode: 'oracle',
      message: 'Configuracao de tela nao persistida no Oracle nesta versao.'
    };
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
