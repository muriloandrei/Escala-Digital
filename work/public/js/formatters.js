(function () {
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatarDataTabela = (value) => {
    const iso = String(value || '').slice(0, 10);
    if (!iso) return '-';
    const partes = iso.split('-');
    return partes.length >= 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : iso;
  };

  const formatarMesTabela = (value) => {
    const iso = String(value || '').slice(0, 10);
    if (!iso) return '-';
    const partes = iso.split('-');
    return partes.length >= 2 ? `${partes[1]}/${partes[0]}` : iso;
  };

  window.EscalaFormatters = {
    escapeHtml,
    formatarDataTabela,
    formatarMesTabela
  };
})();
