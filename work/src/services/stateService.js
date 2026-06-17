async function getState() {
  return {
    escalasSalvas: [],
    escalaConfig: {},
    mode: 'oracle',
    message: 'Estado local desativado. As escalas oficiais devem ser consultadas em SGN_ESC_PROG e ESC_PROG_DIA.'
  };
}

async function saveEscalas() {
  return {
    ok: true,
    persisted: false,
    mode: 'oracle',
    message: 'Estado local ignorado. Use /api/escalas para persistencia oficial.'
  };
}

async function saveConfig() {
  return {
    ok: true,
    persisted: false,
    mode: 'oracle',
    message: 'Configuracao de tela nao persistida no Oracle nesta versao.'
  };
}

module.exports = {
  getState,
  saveEscalas,
  saveConfig
};
