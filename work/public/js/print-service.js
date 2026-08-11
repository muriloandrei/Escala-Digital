(function () {
  const printHtml = (printContainer, html) => {
    if (!printContainer) return;
    printContainer.innerHTML = html;
    window.print();
  };

  const printElementList = (printContainer, title, subtitle, elements, cloneClass = '') => {
    if (!printContainer || !elements?.length) return;
    printContainer.innerHTML = `<div class="print-title">${title}</div><div class="print-subtitle">${subtitle || ''}</div>`;
    elements.forEach((element) => {
      const clone = element.cloneNode(true);
      if (cloneClass) clone.classList.add(cloneClass);
      clone.removeAttribute('id');
      printContainer.appendChild(clone);
    });
    window.print();
  };

  const printTimeline = ({
    printContainer,
    dataSource,
    title,
    inicioTimeline,
    fimTimeline,
    intervaloMarcacao,
    timeToMinutes,
    minutesToTime,
    showInfoModal
  }) => {
    if (!printContainer) return;

    const config = {
      inicioTimeline: timeToMinutes(inicioTimeline),
      fimTimeline: timeToMinutes(fimTimeline),
      intervaloMarcacao: parseInt(intervaloMarcacao, 10) || 30
    };
    const duracaoTotalTimeline = config.fimTimeline - config.inicioTimeline;

    if (duracaoTotalTimeline <= 0 || !dataSource?.length) {
      showInfoModal?.('Nao ha dados suficientes na timeline para gerar um relatorio.', 'info');
      return;
    }

    const numMarcacoes = Math.floor(duracaoTotalTimeline / config.intervaloMarcacao) + 1;
    let headerHtml = '<tr><th class="col-info">Turno</th>';
    for (let min = config.inicioTimeline; min <= config.fimTimeline; min += config.intervaloMarcacao) {
      headerHtml += `<th>${minutesToTime(min)}</th>`;
    }
    headerHtml += '</tr>';

    let bodyHtml = '';
    dataSource.forEach((escala) => {
      const inicioEscalaMin = timeToMinutes(escala.inicio);
      const fimEscalaMin = timeToMinutes(escala.fim);
      const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo);
      const fimIntervaloMin = timeToMinutes(escala.fimIntervalo);

      const createBar = (startMin, endMin, colorClass) => {
        if (endMin <= startMin) return '';
        const leftPercent = ((startMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
        const widthPercent = ((endMin - startMin) / duracaoTotalTimeline) * 100;
        return `<div class="timeline-bar ${colorClass}" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>`;
      };

      let barsHtml = '';
      if (inicioIntervaloMin < fimIntervaloMin && inicioIntervaloMin > inicioEscalaMin && fimIntervaloMin < fimEscalaMin) {
        barsHtml += createBar(inicioEscalaMin, inicioIntervaloMin, 'bg-green-500');
        barsHtml += createBar(inicioIntervaloMin, fimIntervaloMin, 'bg-yellow-500');
        barsHtml += createBar(fimIntervaloMin, fimEscalaMin, 'bg-green-500');
      } else {
        barsHtml += createBar(inicioEscalaMin, fimEscalaMin, 'bg-green-500');
      }

      const infoTurno = `
        <div class="font-bold">${escala.quantidade} Colaborador(es)</div>
        <div class="text-xs text-gray-600">${escala.inicio} as ${escala.fim}</div>
        <div class="text-xs text-gray-500">Intervalo: ${escala.inicioIntervalo} - ${escala.fimIntervalo}</div>
      `;
      bodyHtml += `<tr><td class="col-info">${infoTurno}</td><td class="col-timeline" colspan="${numMarcacoes}"><div class="timeline-bar-container">${barsHtml}</div></td></tr>`;
    });

    const perfilCarga = new Array(duracaoTotalTimeline + 1).fill(0);
    dataSource.forEach((escala) => {
      const quantidade = parseInt(escala.quantidade, 10);
      const inicioEscalaMin = timeToMinutes(escala.inicio);
      const fimEscalaMin = timeToMinutes(escala.fim);
      const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo);
      const fimIntervaloMin = timeToMinutes(escala.fimIntervalo);
      for (let min = inicioEscalaMin; min < fimEscalaMin; min++) {
        const isBreak = inicioIntervaloMin < fimIntervaloMin && min >= inicioIntervaloMin && min < fimIntervaloMin;
        if (!isBreak) {
          const index = min - config.inicioTimeline;
          if (index >= 0 && index < perfilCarga.length) perfilCarga[index] += quantidade;
        }
      }
    });

    let summaryBarsHtml = '';
    let lastCount = -1;
    let blockStartMin = config.inicioTimeline;
    for (let i = 0; i <= duracaoTotalTimeline; i++) {
      const currentCount = perfilCarga[i] || 0;
      const currentMin = config.inicioTimeline + i;
      if (currentCount !== lastCount && i > 0) {
        if (lastCount > 0) {
          const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
          const widthPercent = ((currentMin - blockStartMin) / duracaoTotalTimeline) * 100;
          summaryBarsHtml += `<div class="summary-bar bg-blue-600" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount}</span></div>`;
        }
        blockStartMin = currentMin;
      }
      lastCount = currentCount;
    }
    if (lastCount > 0) {
      const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
      const widthPercent = ((config.fimTimeline - blockStartMin) / duracaoTotalTimeline) * 100;
      summaryBarsHtml += `<div class="summary-bar bg-blue-600" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount}</span></div>`;
    }

    const footerHtml = `
      <tr>
        <td class="col-info font-bold text-center">Total de Ativos</td>
        <td class="col-timeline" colspan="${numMarcacoes}"><div class="summary-bar-container">${summaryBarsHtml}</div></td>
      </tr>
    `;
    const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    printHtml(printContainer, `
      <div class="print-title">${title}</div>
      <div class="print-subtitle">Gerado em: ${dataGeracao}</div>
      <table class="print-timeline-table">
        <thead>${headerHtml}</thead>
        <tbody>${bodyHtml}</tbody>
        <tfoot>${footerHtml}</tfoot>
      </table>
    `);
  };

  window.EscalaPrintService = {
    printHtml,
    printElementList,
    printTimeline
  };
})();
