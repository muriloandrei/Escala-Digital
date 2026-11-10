function permiteEscala(status) {
  return ['A', 'F', 'P', 'Z'].includes(String(status || 'A').trim().toUpperCase());
}

module.exports = { permiteEscala };
