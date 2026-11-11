function isPostStore(lojaId) {
  const loja = Number(lojaId);
  return Number.isInteger(loja) && loja >= 700 && loja <= 799;
}

// Registros antigos de regime ficam preservados, mas nao entram mais na escala operacional.
async function listEffective() {
  return new Map();
}

module.exports = { isPostStore, listEffective };
