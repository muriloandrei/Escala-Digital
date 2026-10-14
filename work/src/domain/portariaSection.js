function isPortariaSection(section = {}) {
  const description = String(section.DESCR ?? section.descr ?? section.SECAO_DESCR ?? section.secao_descr ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const code = String(section.COD_SECAO ?? section.cod_secao ?? '').trim();
  return description.includes('PORTARIA') || /(?:^|[.])02[.]012$/.test(code);
}

module.exports = { isPortariaSection };
