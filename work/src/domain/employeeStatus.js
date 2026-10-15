function permiteEscala(status) {
  return ['A', 'F'].includes(String(status || 'A').trim().toUpperCase());
}

module.exports = { permiteEscala };
