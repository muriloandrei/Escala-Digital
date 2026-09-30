(function () {
  function create({ apiRequest, escapeHtml, showInfoModal, hasPermission = () => false }) {
    const page = document.getElementById('alteracoes-page');
    const loja = document.getElementById('alteracoesLojaSelect');
    const mes = document.getElementById('alteracoesMesInput');
    const secao = document.getElementById('alteracoesSecaoSelect');
    const acao = document.getElementById('alteracoesAcaoSelect');
    const situacao = document.getElementById('alteracoesSituacaoSelect');
    const origem = document.getElementById('alteracoesOrigemSelect');
    const busca = document.getElementById('alteracoesBuscaInput');
    const resumo = document.getElementById('alteracoesResumo');
    const lista = document.getElementById('alteracoesLista');
    const mais = document.getElementById('alteracoesMaisBtn');
    const exportar = document.getElementById('alteracoesExportarBtn');
    const colaboradores = document.getElementById('alteracoesColaboradores');
    const total = document.getElementById('alteracoesTotal');
    const manuais = document.getElementById('alteracoesManuais');
    const antes = document.getElementById('alteracoesAntes');
    const depois = document.getElementById('alteracoesDepois');
    const pendenciasRm = document.getElementById('alteracoesPendenciasRm');
    let eventos = [];
    let carregando = false;
    let fim = false;
    let consulta = 0;

    const mesAtual = () => {
      const agora = new Date();
      return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
    };
    const texto = (value) => escapeHtml(String(value ?? ''));
    const horario = (dia) => {
      if (!dia) return 'Sem programação';
      if (dia.programacao && dia.programacao !== 'TRB') return dia.programacao;
      return [dia.hrEnt1, dia.hrSai1, dia.hrEnt2, dia.hrSai2].filter(Boolean).join(' / ') || 'Sem horário';
    };
    const dataHora = (value) => value ? new Date(value).toLocaleString('pt-BR') : '-';
    const escfuncId = (evento) => Number(evento.ESCFUNC_ID || 0);
    const detalhe = (evento) => evento.DETALHE || {};
    const rotulosAcao = {
      GERAR_ESCALA_SECAO: 'Gerou escala', RESETAR_ESCALA_SECAO: 'Resetou escala',
      EDITAR_ESCALA_FUNCIONARIO: 'Editou escala do colaborador',
      EDITAR_DIA_ESCALA: 'Editou dia da escala', EDITAR_HORARIO_ESCALA: 'Editou horários da escala',
      EDITAR_HORARIO_BASE: 'Alterou horário do colaborador',
      SALVAR_FIXO_ESCALA: 'Definiu folga ou horário fixo', REMOVER_FIXO_ESCALA: 'Removeu fixo',
      TRANSFERIR_SUBSECAO: 'Transferiu subseção',
      CRIAR_PENDENCIA_FUNCIONARIO: 'Suspendeu da escala',
      ENCERRAR_PENDENCIA_FUNCIONARIO: 'Encerrou suspensão',
      OFICIALIZAR_ESCALA: 'Oficializou escala', INATIVAR_ESCALA: 'Inativou escala'
    };
    const rotulosSituacao = {
      CRIACAO: 'Criação', RASCUNHO: 'Antes da oficialização',
      POS_OFICIALIZACAO: 'Após oficialização', OFICIALIZADA: 'Oficializada',
      CADASTRO: 'Cadastro'
    };

    async function carregarSecoes() {
      if (!secao) return;
      const lojaId = Number(loja?.value || 0);
      secao.innerHTML = '<option value="">Todas as seções</option>';
      if (!lojaId) return;
      const data = await apiRequest(`/api/catalog/lojas/${lojaId}/secoes?includeInactive=1`);
      if (Number(loja?.value || 0) !== lojaId) return;
      secao.innerHTML += (data.secoes || []).map((item) =>
        `<option value="${texto(item.ESCSECAO_ID)}">${texto([item.COD_SECAO, item.DESCR].filter(Boolean).join(' - '))}</option>`
      ).join('');
    }

    function filtrados(base = eventos) {
      const termo = String(busca?.value || '').trim().toLocaleLowerCase('pt-BR');
      return base.filter((evento) => {
        if (acao?.value && evento.ACAO !== acao.value) return false;
        if (situacao?.value && evento.SITUACAO !== situacao.value) return false;
        if (origem?.value && evento.ORIGEM !== origem.value) return false;
        const info = detalhe(evento);
        const alvo = [info.chapa, evento.FUNCIONARIO_CHAPA, evento.FUNCIONARIO_NOME,
          evento.SECAO_NOME, evento.LOGIN, evento.ACAO, rotulosAcao[evento.ACAO], evento.ESCFUNC_ID, info.justificativa]
          .join(' ').toLocaleLowerCase('pt-BR');
        return !termo || alvo.includes(termo);
      });
    }

    function render() {
      if (!lista) return;
      const rows = filtrados();
      colaboradores.textContent = String(new Set(rows.map(escfuncId).filter(Boolean)).size);
      total.textContent = String(rows.length);
      manuais.textContent = String(rows.filter((item) => item.ORIGEM === 'USUARIO').length);
      antes.textContent = String(rows.filter((item) => item.SITUACAO === 'CRIACAO' || item.SITUACAO === 'RASCUNHO').length);
      depois.textContent = String(rows.filter((item) => item.SITUACAO === 'POS_OFICIALIZACAO').length);
      resumo.textContent = `${rows.length} evento(s) exibido(s) de ${eventos.length} carregado(s).`;
      lista.innerHTML = rows.length ? rows.map((evento) => {
        const info = detalhe(evento);
        const alteracoes = Array.isArray(info.alteracoes) ? info.alteracoes : [];
        const link = escfuncId(evento) && evento.MES_REF
          ? `<a href="#/escala-funcionario/${encodeURIComponent(escfuncId(evento))}/${encodeURIComponent(evento.LOJA)}/${encodeURIComponent(evento.MES_REF)}">Abrir escala</a>`
          : '';
        const alteracoesHtml = alteracoes.length
          ? `<details><summary>${alteracoes.length} dia(s) alterado(s)</summary><div class="alteracoes-dias">${alteracoes.map((item) =>
              `<div><strong>${texto(item.data)}</strong><span>${texto(horario(item.anterior))}</span><span aria-hidden="true">&rarr;</span><span>${texto(horario(item.novo))}</span>${item.justificativa ? `<small>${texto(item.justificativa)}</small>` : ''}</div>`
            ).join('')}</div></details>`
          : `<div class="alteracoes-detalhe">${texto(JSON.stringify(info))}</div>`;
        return `<article class="alteracoes-item">
          <div class="alteracoes-item-cabecalho"><strong>${texto([info.chapa || evento.FUNCIONARIO_CHAPA, evento.FUNCIONARIO_NOME].filter(Boolean).join(' | ') || 'Escala')}</strong><span>${texto(rotulosAcao[evento.ACAO] || evento.ACAO)}</span><time>${texto(dataHora(evento.DT_HR_INCL))}</time></div>
          <div class="alteracoes-item-meta">Loja ${texto(evento.LOJA)} &middot; ${texto(evento.SECAO_NOME || 'Todas as seções')} &middot; ${texto(evento.LOGIN || 'Sistema')} &middot; ${texto(rotulosSituacao[evento.SITUACAO] || evento.SITUACAO)} &middot; revisão ${texto(evento.REVISAO_ANTERIOR ?? '-')} &rarr; ${texto(evento.REVISAO_NOVA ?? '-')} ${link}</div>
          ${alteracoesHtml}
        </article>`;
      }).join('') : '<p class="alteracoes-vazio">Nenhuma alteração encontrada para os filtros.</p>';
      mais?.classList.toggle('hidden', fim || carregando);
    }

    async function load(reset = true) {
      if (!page) return;
      const lojaId = Number(loja?.value || 0);
      if (!lojaId || !/^\d{4}-\d{2}$/.test(mes?.value || '')) {
        resumo.textContent = 'Selecione loja e período.';
        return;
      }
      const atual = ++consulta;
      if (reset) { eventos = []; fim = false; }
      carregando = true;
      resumo.textContent = 'Carregando alterações...';
      mais?.classList.add('hidden');
      try {
        const params = new URLSearchParams({ lojaId: String(lojaId), mesRef: `${mes.value}-01`, limit: '100', offset: String(eventos.length) });
        if (secao?.value) params.set('escsecaoId', secao.value);
        const rmParams = new URLSearchParams({ lojaId: String(lojaId), mesRef: `${mes.value}-01` });
        const [data, enviosRm] = await Promise.all([
          apiRequest(`/api/escalas/eventos?${params}`),
          hasPermission('integracao-rm', 'visualizar')
            ? apiRequest(`/api/escalas/rm/envios?${rmParams}`).catch(() => null)
            : Promise.resolve(null)
        ]);
        if (atual !== consulta) return;
        pendenciasRm.textContent = enviosRm
          ? String((enviosRm.envios || []).filter((item) => item.STATUS !== 'ENVIADO').length)
          : '-';
        const recebidos = Array.isArray(data.eventos) ? data.eventos : [];
        eventos.push(...recebidos);
        fim = recebidos.length < 100;
        const selecionada = acao?.value || '';
        const acoes = [...new Set(eventos.map((item) => item.ACAO).filter(Boolean))].sort();
        acao.innerHTML = '<option value="">Todas as ações</option>' + acoes.map((item) => `<option value="${texto(item)}">${texto(rotulosAcao[item] || item)}</option>`).join('');
        acao.value = selecionada;
      } catch (error) {
        if (atual === consulta) {
          resumo.textContent = 'Alterações indisponíveis. Tente novamente.';
          lista.innerHTML = '<p class="alteracoes-vazio">Não foi possível consultar as alterações.</p>';
          showInfoModal(error.message, 'error');
        }
        return;
      } finally {
        if (atual === consulta) carregando = false;
      }
      render();
    }

    function open(sourceSelect, preferredLoja, preferredMes) {
      if (!page || !loja) return;
      loja.innerHTML = [...(sourceSelect?.options || [])].filter((option) => Number(option.value) > 0)
        .map((option) => `<option value="${texto(option.value)}">${texto(option.textContent)}</option>`).join('');
      const preferida = String(preferredLoja || sourceSelect?.value || '');
      if ([...loja.options].some((option) => option.value === preferida)) loja.value = preferida;
      mes.value = /^\d{4}-\d{2}$/.test(preferredMes || '') ? preferredMes : mes.value || mesAtual();
      carregarSecoes().catch((error) => showInfoModal(error.message, 'error')).finally(() => load());
    }

    async function exportCsv() {
      if (!loja?.value || !/^\d{4}-\d{2}$/.test(mes?.value || '') || exportar.disabled) return;
      const lojaId = loja.value;
      const mesRef = `${mes.value}-01`;
      const originalLabel = exportar.innerHTML;
      exportar.disabled = true;
      exportar.textContent = 'Exportando...';
      try {
        const todos = [];
        let offset = 0;
        while (true) {
          const params = new URLSearchParams({ lojaId, mesRef, limit: '500', offset: String(offset) });
          if (secao?.value) params.set('escsecaoId', secao.value);
          const data = await apiRequest(`/api/escalas/eventos?${params}`);
          const lote = Array.isArray(data.eventos) ? data.eventos : [];
          todos.push(...lote);
          if (lote.length < 500) break;
          offset += lote.length;
        }
        const rows = filtrados(todos);
        if (!rows.length) {
          showInfoModal('Nenhuma alteração encontrada para exportar.', 'info');
          return;
        }
        const csvCell = (value) => {
          const cell = String(value ?? '');
          const safe = /^[=+\-@]/.test(cell) ? `'${cell}` : cell;
          return `"${safe.replaceAll('"', '""')}"`;
        };
        const lines = [['Data', 'Loja', 'Colaborador', 'Ação', 'Origem', 'Situação', 'Usuário', 'Revisão anterior', 'Revisão nova', 'Alterações']
          .map(csvCell).join(';')];
        for (const evento of rows) lines.push([
          dataHora(evento.DT_HR_INCL), evento.LOJA,
          [detalhe(evento).chapa || evento.FUNCIONARIO_CHAPA, evento.FUNCIONARIO_NOME].filter(Boolean).join(' | ') || evento.ESCFUNC_ID,
          evento.ACAO, evento.ORIGEM, evento.SITUACAO, evento.LOGIN,
          evento.REVISAO_ANTERIOR, evento.REVISAO_NOVA, JSON.stringify(detalhe(evento).alteracoes || detalhe(evento))
        ].map(csvCell).join(';'));
        const url = URL.createObjectURL(new Blob(['\ufeff', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `alteracoes-escala-${lojaId}-${mesRef.slice(0, 7)}.csv`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        showInfoModal(error.message, 'error');
      } finally {
        exportar.disabled = false;
        exportar.innerHTML = originalLabel;
      }
    }

    loja?.addEventListener('change', () => {
      carregarSecoes().catch((error) => showInfoModal(error.message, 'error')).finally(() => load());
    });
    mes?.addEventListener('change', () => load());
    secao?.addEventListener('change', () => load());
    acao?.addEventListener('change', render);
    situacao?.addEventListener('change', render);
    origem?.addEventListener('change', render);
    busca?.addEventListener('input', render);
    mais?.addEventListener('click', () => load(false));
    exportar?.addEventListener('click', exportCsv);
    return { open, load };
  }

  window.EscalaEventosPage = { create };
})();
