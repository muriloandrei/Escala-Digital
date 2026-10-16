function permiteEscala(status) {
  return ['A', 'F', 'P'].includes(String(status || 'A').trim().toUpperCase());
}

module.exports = { permiteEscala };
