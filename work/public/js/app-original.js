// --- SELETORES DE PAGINAS E NAVEGACAO ---
        const timelinePage = document.getElementById('timeline-page');
        const registrosPage = document.getElementById('registros-page');
        const funcionariosPage = document.getElementById('funcionarios-page');
        const escalaCriacaoPage = document.getElementById('escala-criacao-page');
        const secoesPage = document.getElementById('secoes-page');
        const secaoFormPage = document.getElementById('secao-form-page');
        const subsecoesPage = document.getElementById('subsecoes-page');
        const turnosSecaoPage = document.getElementById('turnos-secao-page');
        const escalaDetalhePage = document.getElementById('escala-detalhe-page');
        const escalasFuncionariosPage = document.getElementById('escalas-funcionarios-page');
        const escalaFuncionarioEdicaoPage = document.getElementById('escala-funcionario-edicao-page');
        const historicoPage = document.getElementById('historico-page');
        const tiposDescansoPage = document.getElementById('tipos-descanso-page');
        const regrasPage = document.getElementById('regras-page');
        const horariosPadraoPage = document.getElementById('horarios-padrao-page');
        const integracaoRmPage = document.getElementById('integracao-rm-page');
        const acessosPage = document.getElementById('acessos-page');
        const liberacaoSecoesPage = document.getElementById('liberacao-secoes-page');
        const rolesPage = document.getElementById('roles-page');
        const settingsPage = document.getElementById('settings-page');
        
        const navTimeline = document.getElementById('nav-timeline');
        const navEscalasCriadas = document.getElementById('nav-escalas-criadas');
        const navRegistros = document.getElementById('nav-registros');
        const navEscalasFuncionarios = document.getElementById('nav-escalas-funcionarios');
        const navFuncionarios = document.getElementById('nav-funcionarios');
        const navSecoes = document.getElementById('nav-secoes');
        const navTurnosSecao = document.getElementById('nav-turnos-secao');
        const navHistorico = document.getElementById('nav-historico');
        const navTiposDescanso = document.getElementById('nav-tipos-descanso');
        const navRegras = document.getElementById('nav-regras');
        const navAcessos = document.getElementById('nav-acessos');
        const navLiberacaoSecoes = document.getElementById('nav-liberacao-secoes');
        const navRoles = document.getElementById('nav-roles');
        const navHorariosPadrao = document.getElementById('nav-horarios-padrao');
        const navIntegracaoRm = document.getElementById('nav-integracao-rm');
        const navSettings = document.getElementById('nav-settings');
        
        const salvarSettingsBtn = document.getElementById('salvarSettingsBtn');
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const goToTimelineBtn = document.getElementById('goToTimelineBtn');
        const voltarEscalasCriacaoBtn = document.getElementById('voltarEscalasCriacaoBtn');
        const criacaoEscalaLoja = document.getElementById('criacaoEscalaLoja');
        const criacaoEscalaMes = document.getElementById('criacaoEscalaMes');
        const criacaoEscalaAno = document.getElementById('criacaoEscalaAno');
        const iniciarCriacaoEscalaBtn = document.getElementById('iniciarCriacaoEscalaBtn');
        const criacaoEscalaStatus = document.getElementById('criacaoEscalaStatus');
        const criacaoSecoesCard = document.getElementById('criacaoSecoesCard');
        const criacaoSecoesLista = document.getElementById('criacaoSecoesLista');
        const gerarTimelineCriacaoBtn = document.getElementById('gerarTimelineCriacaoBtn');
        const criacaoTimelineCard = document.getElementById('criacaoTimelineCard');
        const carregarFuncionariosCriacaoBtn = document.getElementById('carregarFuncionariosCriacaoBtn');
        const imprimirTimelineCriacaoBtn = document.getElementById('imprimirTimelineCriacaoBtn');
        const gerarDetalhadaCriacaoBtn = document.getElementById('gerarDetalhadaCriacaoBtn');
        const consultarBancoBtn = document.getElementById('consultarBancoBtn');
        const sincronizarBancoBtn = document.getElementById('sincronizarBancoBtn');
        const tabelaBancoBody = document.getElementById('tabela-banco-body');
        const bancoResumo = document.getElementById('bancoResumo');
        const escalasPesquisaInput = document.getElementById('escalasPesquisaInput');
        const escalasFiltroLoja = document.getElementById('escalasFiltroLoja');
        const escalasFiltroMes = document.getElementById('escalasFiltroMes');
        const escalasFiltroAno = document.getElementById('escalasFiltroAno');
        const escalasFiltroStatus = document.getElementById('escalasFiltroStatus');
        const funcionariosLojaSelect = document.getElementById('funcionariosLojaSelect');
        const carregarFuncionariosTelaBtn = document.getElementById('carregarFuncionariosTelaBtn');
        const funcionariosTitulo = document.getElementById('funcionariosTitulo');
        const tabelaFuncionariosBody = document.getElementById('tabela-funcionarios-body');
        const funcionariosPesquisaInput = document.getElementById('funcionariosPesquisaInput');
        const funcionariosSecaoFiltro = document.getElementById('funcionariosSecaoFiltro');
        const funcionariosFuncaoFiltro = document.getElementById('funcionariosFuncaoFiltro');
        const funcionariosMesFiltro = document.getElementById('funcionariosMesFiltro');
        const funcionariosAnoFiltro = document.getElementById('funcionariosAnoFiltro');
        const secoesLojaSelect = document.getElementById('secoesLojaSelect');
        const novaSecaoBtn = document.getElementById('novaSecaoBtn');
        const carregarSecoesBtn = document.getElementById('carregarSecoesBtn');
        const secoesTitulo = document.getElementById('secoesTitulo');
        const tabelaSecoesBody = document.getElementById('tabela-secoes-body');
        const secoesPesquisaInput = document.getElementById('secoesPesquisaInput');
        const secaoFormTitulo = document.getElementById('secaoFormTitulo');
        const voltarSecoesBtn = document.getElementById('voltarSecoesBtn');
        const secaoForm = document.getElementById('secaoForm');
        const secaoFormId = document.getElementById('secaoFormId');
        const secaoFormLoja = document.getElementById('secaoFormLoja');
        const secaoFormCodigo = document.getElementById('secaoFormCodigo');
        const secaoFormDescr = document.getElementById('secaoFormDescr');
        const subsecoesTitulo = document.getElementById('subsecoesTitulo');
        const subsecoesResumo = document.getElementById('subsecoesResumo');
        const subsecoesListaResumo = document.getElementById('subsecoesListaResumo');
        const voltarSubsecoesBtn = document.getElementById('voltarSubsecoesBtn');
        const subsecoesLista = document.getElementById('subsecoesLista');
        const subsecoesBuscaInput = document.getElementById('subsecoesBuscaInput');
        const novaSubsecaoInlineBtn = document.getElementById('novaSubsecaoInlineBtn');
        const subsecoesDetalheTitulo = document.getElementById('subsecoesDetalheTitulo');
        const subsecoesDetalheResumo = document.getElementById('subsecoesDetalheResumo');
        const subsecoesVincularFuncionarioBtn = document.getElementById('subsecoesVincularFuncionarioBtn');
        const subsecoesVincularPanel = document.getElementById('subsecoesVincularPanel');
        const subsecoesFuncionarioBusca = document.getElementById('subsecoesFuncionarioBusca');
        const subsecoesFuncionariosSugestoes = document.getElementById('subsecoesFuncionariosSugestoes');
        const subsecoesTransferirSelect = document.getElementById('subsecoesTransferirSelect');
        const subsecoesTransferirSelecionadosBtn = document.getElementById('subsecoesTransferirSelecionadosBtn');
        const subsecoesSelecionarTodos = document.getElementById('subsecoesSelecionarTodos');
        const subsecoesFuncionariosBody = document.getElementById('subsecoesFuncionariosBody');
        const turnosSecaoLojaSelect = document.getElementById('turnosSecaoLojaSelect');
        const novoTurnoSecaoBtn = document.getElementById('novoTurnoSecaoBtn');
        const gerarEscalaTurnosBtn = document.getElementById('gerarEscalaTurnosBtn');
        const carregarTurnosSecaoBtn = document.getElementById('carregarTurnosSecaoBtn');
        const turnosSecaoTitulo = document.getElementById('turnosSecaoTitulo');
        const tabelaTurnosSecaoBody = document.getElementById('tabela-turnos-secao-body');
        const turnosOperacionaisLista = document.getElementById('turnosOperacionaisLista');
        const turnosPesquisaInput = document.getElementById('turnosPesquisaInput');
        const turnosSecaoFiltro = document.getElementById('turnosSecaoFiltro');
        const turnoSecaoForm = document.getElementById('turnoSecaoForm');
        const turnoSecaoFormPage = document.getElementById('turno-secao-form-page');
        const voltarTurnosSecaoBtn = document.getElementById('voltarTurnosSecaoBtn');
        const turnoSecaoFormTitulo = document.getElementById('turnoSecaoFormTitulo');
        const turnoSecaoFormId = document.getElementById('turnoSecaoFormId');
        const turnoSecaoFormSecao = document.getElementById('turnoSecaoFormSecao');
        const turnoSecaoFormQtde = document.getElementById('turnoSecaoFormQtde');
        const turnoSecaoFormHrEnt1 = document.getElementById('turnoSecaoFormHrEnt1');
        const turnoSecaoFormHrSai1 = document.getElementById('turnoSecaoFormHrSai1');
        const turnoSecaoFormHrEnt2 = document.getElementById('turnoSecaoFormHrEnt2');
        const turnoSecaoFormHrSai2 = document.getElementById('turnoSecaoFormHrSai2');
        const novoTurnoCriacaoBtn = document.getElementById('novoTurnoCriacaoBtn');
        const detalheMesSelect = document.getElementById('detalheMesSelect');
        const detalheFuncionarioSelect = document.getElementById('detalheFuncionarioSelect');
        const voltarEscalasBtn = document.getElementById('voltarEscalasBtn');
        const escalaDetalheTitulo = document.getElementById('escalaDetalheTitulo');
        const escalaDetalheResumo = document.getElementById('escalaDetalheResumo');
        const escalaSecaoTabs = document.getElementById('escalaSecaoTabs');
        const escalaSubsetorTabs = document.getElementById('escalaSubsetorTabs');
        const escalaBancoMensalContent = document.getElementById('escalaBancoMensalContent');
        const escalaBancoMensalPanel = document.getElementById('escalaBancoMensalPanel');
        const escalaBancoDiariaPanel = document.getElementById('escalaBancoDiariaPanel');
        const escalaViewMensalBtn = document.getElementById('escalaViewMensalBtn');
        const escalaViewDiariaBtn = document.getElementById('escalaViewDiariaBtn');
        const escalaSecaoMensalTitulo = document.getElementById('escalaSecaoMensalTitulo');
        const escalaBancoTimelineContent = document.getElementById('escalaBancoTimelineContent');
        const escalaBancoDiaSelect = document.getElementById('escalaBancoDiaSelect');
        const escalaBancoDiaAnteriorBtn = document.getElementById('escalaBancoDiaAnteriorBtn');
        const escalaBancoDiaAtualLabel = document.getElementById('escalaBancoDiaAtualLabel');
        const escalaBancoDiaProximoBtn = document.getElementById('escalaBancoDiaProximoBtn');
        const escalaHeaderDayNav = document.querySelector('.scale-header-day-nav');
        const resetarEscalaSecaoBancoBtn = document.getElementById('resetarEscalaSecaoBancoBtn');
        const escalaBancoDetalhadaCard = document.getElementById('escalaBancoDetalhadaCard');
        const escalaBancoDetalhadaContent = document.getElementById('escalaBancoDetalhadaContent');
        const escalaSecaoTimelineTitulo = document.getElementById('escalaSecaoTimelineTitulo');
        const escalaSecaoDetalheTitulo = document.getElementById('escalaSecaoDetalheTitulo');
        const gerarDetalhadaBancoBtn = document.getElementById('gerarDetalhadaBancoBtn');
        const criticasDetalheBancoBtn = document.getElementById('criticasDetalheBancoBtn');
        const salvarRascunhoBancoBtn = document.getElementById('salvarRascunhoBancoBtn');
        const oficializarBancoBtn = document.getElementById('oficializarBancoBtn');
        const abrirImpressaoEscalaBtn = document.getElementById('abrirImpressaoEscalaBtn');
        const imprimirDetalheBancoBtn = document.getElementById('imprimirDetalheBancoBtn');
        const impressaoEscalaModal = document.getElementById('impressaoEscalaModal');
        const impressaoEscalaTabs = document.getElementById('impressaoEscalaTabs');
        const impressaoCargoSelect = document.getElementById('impressaoCargoSelect');
        const impressaoColaboradorSelect = document.getElementById('impressaoColaboradorSelect');
        const impressaoFormatoGrid = document.getElementById('impressaoFormatoGrid');
        const impressaoSemanaSelect = document.getElementById('impressaoSemanaSelect');
        const impressaoDiaSelect = document.getElementById('impressaoDiaSelect');
        const impressaoPeriodoInicio = document.getElementById('impressaoPeriodoInicio');
        const impressaoPeriodoFim = document.getElementById('impressaoPeriodoFim');
        const impressaoOrientacaoSelect = document.getElementById('impressaoOrientacaoSelect');
        const impressaoEscalaPreview = document.getElementById('impressaoEscalaPreview');
        const cancelarImpressaoEscalaBtn = document.getElementById('cancelarImpressaoEscalaBtn');
        const fecharImpressaoEscalaBtn = document.getElementById('fecharImpressaoEscalaBtn');
        const imprimirAgoraEscalaBtn = document.getElementById('imprimirAgoraEscalaBtn');
        const validarDetalheBancoBtn = document.getElementById('validarDetalheBancoBtn');
        const salvarDetalheBancoBtn = document.getElementById('salvarDetalheBancoBtn');
        const escalaFuncionarioPesquisa = document.getElementById('escalaFuncionarioPesquisa');
        const escalaFuncionarioLoja = document.getElementById('escalaFuncionarioLoja');
        const escalaFuncionarioMes = document.getElementById('escalaFuncionarioMes');
        const escalaFuncionarioAno = document.getElementById('escalaFuncionarioAno');
        const tabelaEscalaFuncionariosBody = document.getElementById('tabelaEscalaFuncionariosBody');
        const escalaFuncionarioListaResumo = document.getElementById('escalaFuncionarioListaResumo');
        const escalaFuncionarioEdicaoTitulo = document.getElementById('escalaFuncionarioEdicaoTitulo');
        const escalaFuncionarioEdicaoResumo = document.getElementById('escalaFuncionarioEdicaoResumo');
        const escalaFuncionarioDetalhadaContent = document.getElementById('escalaFuncionarioDetalhadaContent');
        const voltarEscalaFuncionariosBtn = document.getElementById('voltarEscalaFuncionariosBtn');
        const atualizarFuncionarioRmBtn = document.getElementById('atualizarFuncionarioRmBtn');
        const distribuirFolgasFuncionarioBtn = document.getElementById('distribuirFolgasFuncionarioBtn');
        const validarEscalaFuncionarioBtn = document.getElementById('validarEscalaFuncionarioBtn');
        const imprimirEscalaFuncionarioBtn = document.getElementById('imprimirEscalaFuncionarioBtn');
        const salvarEscalaFuncionarioBtn = document.getElementById('salvarEscalaFuncionarioBtn');
        const escalaFuncionarioEdicaoMes = document.getElementById('escalaFuncionarioEdicaoMes');
        const escalaFuncionarioEdicaoAno = document.getElementById('escalaFuncionarioEdicaoAno');
        const escalaFuncionarioMesTabs = document.getElementById('escalaFuncionarioMesTabs');
        const escalaFuncionarioAnoAtualLabel = document.getElementById('escalaFuncionarioAnoAtualLabel');
        const escalaFuncionarioAnoAnteriorBtn = document.getElementById('escalaFuncionarioAnoAnteriorBtn');
        const escalaFuncionarioAnoProximoBtn = document.getElementById('escalaFuncionarioAnoProximoBtn');
        const tabelaRegrasBody = document.getElementById('tabelaRegrasBody');
        const novoHorarioPadraoBtn = document.getElementById('novoHorarioPadraoBtn');
        const horariosPadraoPesquisaInput = document.getElementById('horariosPadraoPesquisaInput');
        const horariosPadraoStatusFiltro = document.getElementById('horariosPadraoStatusFiltro');
        const tabelaHorariosPadraoBody = document.getElementById('tabelaHorariosPadraoBody');
        const rmPesquisaInput = document.getElementById('rmPesquisaInput');
        const rmLojaSelect = document.getElementById('rmLojaSelect');
        const rmMesSelect = document.getElementById('rmMesSelect');
        const rmAnoSelect = document.getElementById('rmAnoSelect');
        const rmResumo = document.getElementById('rmResumo');
        const tabelaRmLogsBody = document.getElementById('tabelaRmLogsBody');
        const historicoPesquisaInput = document.getElementById('historicoPesquisaInput');
        const historicoLojaSelect = document.getElementById('historicoLojaSelect');
        const historicoMesSelect = document.getElementById('historicoMesSelect');
        const historicoAnoSelect = document.getElementById('historicoAnoSelect');
        const historicoResumo = document.getElementById('historicoResumo');
        const tabelaHistoricoBody = document.getElementById('tabelaHistoricoBody');
        const novoTipoDescansoBtn = document.getElementById('novoTipoDescansoBtn');
        const tiposDescansoPesquisaInput = document.getElementById('tiposDescansoPesquisaInput');
        const tiposDescansoStatusFiltro = document.getElementById('tiposDescansoStatusFiltro');
        const tabelaTiposDescansoBody = document.getElementById('tabelaTiposDescansoBody');
        const carregarAcessosBtn = document.getElementById('carregarAcessosBtn');
        const acessosPesquisaInput = document.getElementById('acessosPesquisaInput');
        const acessosPageSizeSelect = document.getElementById('acessosPageSizeSelect');
        const acessosPaginationResumo = document.getElementById('acessosPaginationResumo');
        const acessosPaginaAnteriorBtn = document.getElementById('acessosPaginaAnteriorBtn');
        const acessosProximaPaginaBtn = document.getElementById('acessosProximaPaginaBtn');
        const acessosPaginaAtual = document.getElementById('acessosPaginaAtual');
        const tabelaAcessosBody = document.getElementById('tabela-acessos-body');
        const liberacaoSecoesLojaSelect = document.getElementById('liberacaoSecoesLojaSelect');
        const liberacaoSecoesUsuarioSelect = document.getElementById('liberacaoSecoesUsuarioSelect');
        const liberacaoSecoesPesquisaInput = document.getElementById('liberacaoSecoesPesquisaInput');
        const liberacaoSecoesResumo = document.getElementById('liberacaoSecoesResumo');
        const liberacaoSecoesDisponiveisLista = document.getElementById('liberacaoSecoesDisponiveisLista');
        const liberacaoSecoesLiberadasLista = document.getElementById('liberacaoSecoesLiberadasLista');
        const liberacaoSecoesDisponiveisCount = document.getElementById('liberacaoSecoesDisponiveisCount');
        const liberacaoSecoesLiberadasCount = document.getElementById('liberacaoSecoesLiberadasCount');
        const liberacaoSecoesAddBtn = document.getElementById('liberacaoSecoesAddBtn');
        const liberacaoSecoesAddAllBtn = document.getElementById('liberacaoSecoesAddAllBtn');
        const liberacaoSecoesRemoveBtn = document.getElementById('liberacaoSecoesRemoveBtn');
        const liberacaoSecoesRemoveAllBtn = document.getElementById('liberacaoSecoesRemoveAllBtn');
        const salvarLiberacaoSecoesBtn = document.getElementById('salvarLiberacaoSecoesBtn');
        let novoUsuarioBtn = null;
        const currentPageTitle = document.getElementById('currentPageTitle');
        const currentPageParent = document.getElementById('currentPageParent');
        const loggedUserName = document.getElementById('loggedUserName');
        const loggedUserStores = document.getElementById('loggedUserStores');
        const loggedUserInitials = document.getElementById('loggedUserInitials');
        const loggedUserRole = document.getElementById('loggedUserRole');
        const logoutAppBtn = document.getElementById('logoutAppBtn');
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        const abrirTurnoModalBtn = document.getElementById('abrirTurnoModalBtn');
        const turnoModal = document.getElementById('turnoModal');
        const closeTurnoModalBtn = document.getElementById('closeTurnoModalBtn');
        const homeLojaSelect = document.getElementById('homeLojaSelect');
        const funcionariosLojaCount = document.getElementById('funcionariosLojaCount');
        const turnosCriadosCount = document.getElementById('turnosCriadosCount');
        const turnosRestantesCount = document.getElementById('turnosRestantesCount');

        const { pageTitles, pageParents, permissionBindings, permissionPageByRoute } = window.EscalaNavigationConfig;
        const hasPermission = (page, action = 'visualizar') => window.EscalaPermissions?.can(page, action) !== false;
        const navigationController = window.EscalaNavigation.createNavigationController({
            config: { pageTitles, pageParents, permissionBindings, permissionPageByRoute },
            hasPermission,
            showInfoModal: (...args) => showInfoModal(...args),
            showInputModal: (...args) => showInputModal(...args)
        });
        const applyPermissionBindings = navigationController.bindPermissionElements;
        const buildPermissionDeniedButton = navigationController.buildPermissionDeniedButton;
        const checkRoutePermission = navigationController.checkRoutePermission;
        const setCurrentPageTitle = (key) => navigationController.setTitle({ titleElement: currentPageTitle, parentElement: currentPageParent }, key);
        let escalaCriacaoPageController = null;
        let escalaDetalhePageController = null;
        let escalaFuncionarioPageController = null;
        let catalogosPageController = null;
        let accessPageController = null;
        let rmPageController = null;

        function hideAllPages() {
            timelinePage.classList.add('hidden');
            registrosPage.classList.add('hidden');
            funcionariosPage.classList.add('hidden');
            escalaCriacaoPage?.classList.add('hidden');
            secoesPage.classList.add('hidden');
            secaoFormPage.classList.add('hidden');
            subsecoesPage?.classList.add('hidden');
            turnosSecaoPage.classList.add('hidden');
            turnoSecaoFormPage.classList.add('hidden');
            escalaDetalhePage.classList.add('hidden');
            escalasFuncionariosPage?.classList.add('hidden');
            escalaFuncionarioEdicaoPage?.classList.add('hidden');
            historicoPage?.classList.add('hidden');
            tiposDescansoPage?.classList.add('hidden');
            regrasPage?.classList.add('hidden');
            horariosPadraoPage?.classList.add('hidden');
            integracaoRmPage?.classList.add('hidden');
            acessosPage.classList.add('hidden');
            liberacaoSecoesPage?.classList.add('hidden');
            rolesPage.classList.add('hidden');
            settingsPage.classList.add('hidden');
            navLinks.forEach(link => link.classList.remove('active'));
        }

        function expandActiveNavGroup(activeLink) {
            document.querySelectorAll('.nav-group').forEach(group => group.classList.remove('open'));
            const group = activeLink?.closest('.nav-group');
            if (group) group.classList.add('open');
        }

        function showTimelinePage() {
            hideAllPages();
            timelinePage.classList.remove('hidden');
            navTimeline?.classList.add('active');
            expandActiveNavGroup(navTimeline);
            setCurrentPageTitle('home');
        }

        function setRegistrosMode(mode) {
            registrosPage.dataset.mode = mode;
        }

        function showEscalasCriadasPage() {
            hideAllPages();
            registrosPage.classList.remove('hidden');
            navEscalasCriadas.classList.add('active');
            expandActiveNavGroup(navEscalasCriadas);
            setCurrentPageTitle('escalasCriadas');
            setRegistrosMode('criadas');
            renderizarTabelaRegistros();
        }

        function showEscalasGeradasPage() {
            hideAllPages();
            registrosPage.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalasGeradas');
            setRegistrosMode('geradas');
            consultarEscalasBancoLocal().catch(error => {
                if (tabelaBancoBody) tabelaBancoBody.innerHTML = '<tr><td colspan="10" class="text-center text-red-600 py-8">Erro ao carregar escalas: ' + escapeHtml(error.message || 'falha na consulta') + '</td></tr>';
            });
        }

        function showEscalasFuncionariosPage() {
            hideAllPages();
            escalasFuncionariosPage?.classList.remove('hidden');
            navEscalasFuncionarios?.classList.add('active');
            expandActiveNavGroup(navEscalasFuncionarios);
            setCurrentPageTitle('escalasFuncionarios');
            escalaFuncionarioPageController?.prepararFiltros?.();
            escalaFuncionarioPageController?.carregarLista?.().catch(error => showInfoModal(error.message, 'error'));
        }

        function showEscalaFuncionarioEdicaoPage(escfuncId, lojaId, mesRef) {
            hideAllPages();
            escalaFuncionarioEdicaoPage?.classList.remove('hidden');
            navEscalasFuncionarios?.classList.add('active');
            expandActiveNavGroup(navEscalasFuncionarios);
            setCurrentPageTitle('escalaFuncionarioEdicao');
            escalaFuncionarioPageController?.carregarEdicao?.(escfuncId, lojaId, mesRef).catch(error => showInfoModal(error.message, 'error'));
        }

        function copiarOptionsSelect(origem, destino, selectedValue = '') {
            if (!origem || !destino) return;
            destino.innerHTML = Array.from(origem.options || []).map(option => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.textContent) + '</option>').join('');
            if (selectedValue !== '') destino.value = String(selectedValue);
        }

        function prepararPaginaCriacaoEscala(params = {}) {
            copiarOptionsSelect(lojaEscalaSelect, criacaoEscalaLoja, params.loja || escalasFiltroLoja?.value || lojaEscalaSelect.value);
            copiarOptionsSelect(mesSelect, criacaoEscalaMes, params.mes ?? escalasFiltroMes?.value ?? mesSelect.value);
            copiarOptionsSelect(anoSelect, criacaoEscalaAno, params.ano || escalasFiltroAno?.value || anoSelect.value);
            restaurarCriacaoEscalaEditavel();
            if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Informe os dados para carregar as secoes e montar a timeline.';
            criacaoSecoesCard?.classList.add('hidden');
            criacaoTimelineCard?.classList.add('hidden');
            if (criacaoSecoesLista) criacaoSecoesLista.innerHTML = '';
            const timeline = document.getElementById('criacaoTimelineContent');
            if (timeline) timeline.innerHTML = '';
        }

        function showEscalaCriacaoPage(params = {}) {
            hideAllPages();
            escalaCriacaoPage?.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalasGeradas');
            escalaCriacaoPageController?.prepararPaineis?.();
            restaurarCriacaoEscalaEditavel();

            if (escalaRascunhoAtivo && escalaRascunhoContexto) {
                copiarOptionsSelect(lojaEscalaSelect, criacaoEscalaLoja, escalaRascunhoContexto.loja);
                copiarOptionsSelect(mesSelect, criacaoEscalaMes, String(new Date(escalaRascunhoContexto.mesRef + 'T00:00:00').getMonth()));
                copiarOptionsSelect(anoSelect, criacaoEscalaAno, String(new Date(escalaRascunhoContexto.mesRef + 'T00:00:00').getFullYear()));
                escalaCriacaoPageController?.renderizarSecoes?.();
                criacaoSecoesCard?.classList.remove('hidden');
                criacaoTimelineCard?.classList.toggle('hidden', dadosEscala.length === 0);
                if (dadosEscala.length > 0) renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Loja ' + escalaRascunhoContexto.loja + ' | ' + formatarMesTabela(escalaRascunhoContexto.mesRef) + ' | rascunho não salvo';
                return;
            }

            prepararPaginaCriacaoEscala(params);
        }

        function showFuncionariosPage() {
            hideAllPages();
            funcionariosPage.classList.remove('hidden');
            navFuncionarios.classList.add('active');
            expandActiveNavGroup(navFuncionarios);
            setCurrentPageTitle('funcionarios');
            if (funcionariosMesFiltro && !funcionariosMesFiltro.options.length) copiarOptionsSelect(mesSelect, funcionariosMesFiltro, String(new Date().getMonth()));
            catalogosPageController?.carregarFuncionarios?.(false).catch(error => showInfoModal(error.message, 'error'));
        }

        function showSecoesPage() {
            hideAllPages();
            secoesPage.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('secoes');
            catalogosPageController?.carregarSecoes?.(false).catch(error => showInfoModal(error.message, 'error'));
        }

        function showSecaoFormPage(escsecaoId = '') {
            hideAllPages();
            secaoFormPage.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('secaoForm');
            catalogosPageController?.prepararFormularioSecao?.(escsecaoId);
        }

        function showSubsecoesSecaoPage(escsecaoId = '') {
            hideAllPages();
            subsecoesPage?.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('subsecoes');
            carregarSubsecoesSecaoPage(escsecaoId).catch(error => showInfoModal(error.message, 'error'));
        }

        function showTurnosSecaoPage() {
            hideAllPages();
            turnosSecaoPage.classList.remove('hidden');
            navTurnosSecao.classList.add('active');
            expandActiveNavGroup(navTurnosSecao);
            setCurrentPageTitle('turnosSecao');
            novoTurnoSecaoBtn?.classList.toggle('hidden', !hasPermission('turnos-secao', 'criar'));
            gerarEscalaTurnosBtn?.classList.add('hidden');
            catalogosPageController?.carregarTurnosSecao?.(false).catch(error => showInfoModal(error.message, 'error'));
        }

        async function showTurnoSecaoFormPage(escsecaoturnoId = '') {
            hideAllPages();
            turnoSecaoFormPage.classList.remove('hidden');
            navTurnosSecao.classList.add('active');
            expandActiveNavGroup(navTurnosSecao);
            setCurrentPageTitle('turnoSecaoForm');

            const loja = turnosSecaoLojaSelect?.value && turnosSecaoLojaSelect.value !== 'all' ? turnosSecaoLojaSelect.value : lojaEscalaSelect.value;
            if (loja) {
                if (secoesLojaCache.length === 0 || String(secoesLojaCache[0]?.LOJA || '') !== String(loja)) {
                    await carregarSecoesDaLoja(true);
                }
                if (turnosSecaoCache.length === 0 || String(turnosSecaoCache[0]?.LOJA || '') !== String(loja) || !turnosSecaoCache.some(item => String(item.LOJA) === String(loja))) {
                    await carregarTurnosSecaoDaLoja(true);
                }
            }

            if (!escsecaoturnoId || escsecaoturnoId === 'novo') {
                turnoSecaoFormTitulo.textContent = 'Novo Turno';
                preencherFormularioTurnoSecao(null);
                return;
            }

            const turno = turnosSecaoCache.find(item => Number(item.ESCSECAOTURNO_ID) === Number(escsecaoturnoId));
            if (!turno) {
                showInfoModal('Turno não encontrado para edição.', 'error');
                window.location.hash = '/turnos-secao';
                return;
            }

            turnoSecaoFormTitulo.textContent = 'Editar Turno';
            preencherFormularioTurnoSecao(turno);
        }

        function abrirPaginaDetalheEscala() {
            hideAllPages();
            escalaDetalhePage.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalaBanco');
        }

        function showEscalaDetalhePage(escprogId) {
            abrirPaginaDetalheEscala();
            escalaDetalhePageController?.carregarIndividual?.(escprogId).catch(error => showInfoModal(error.message, 'error'));
        }

        function showEscalaDetalheMensalPage(lojaId, mesRef) {
            abrirPaginaDetalheEscala();
            escalaDetalhePageController?.carregarMensal?.(lojaId, mesRef).catch(error => showInfoModal(error.message, 'error'));
        }


        function showHistoricoPage(params = {}) {
            hideAllPages();
            historicoPage?.classList.remove('hidden');
            navHistorico?.classList.add('active');
            expandActiveNavGroup(navHistorico);
            setCurrentPageTitle('historico');
            prepararFiltrosHistorico(params);
            carregarHistoricoTela().catch(error => showInfoModal(error.message, 'error'));
        }

        function showTiposDescansoPage() {
            hideAllPages();
            tiposDescansoPage?.classList.remove('hidden');
            navTiposDescanso?.classList.add('active');
            expandActiveNavGroup(navTiposDescanso);
            setCurrentPageTitle('tiposDescanso');
            catalogosPageController?.carregarTiposDescanso?.().catch(error => showInfoModal(error.message, 'error'));
        }

        function showRegrasPage() {
            hideAllPages();
            regrasPage?.classList.remove('hidden');
            navRegras?.classList.add('active');
            expandActiveNavGroup(navRegras);
            setCurrentPageTitle('regras');
            catalogosPageController?.carregarRegras?.().catch(error => showInfoModal(error.message, 'error'));
        }

        function showHorariosPadraoPage() {
            hideAllPages();
            horariosPadraoPage?.classList.remove('hidden');
            navHorariosPadrao?.classList.add('active');
            expandActiveNavGroup(navHorariosPadrao);
            setCurrentPageTitle('horariosPadrao');
            catalogosPageController?.carregarHorariosPadrao?.().catch(error => showInfoModal(error.message, 'error'));
        }

        function showIntegracaoRmPage() {
            hideAllPages();
            integracaoRmPage?.classList.remove('hidden');
            navIntegracaoRm?.classList.add('active');
            expandActiveNavGroup(navIntegracaoRm);
            setCurrentPageTitle('integracaoRm');
            rmPageController?.prepararFiltros?.();
            rmPageController?.carregarLogs?.().catch(error => showInfoModal(error.message, 'error'));
        }
        function showAcessosPage() {
            hideAllPages();
            acessosPage.classList.remove('hidden');
            navAcessos.classList.add('active');
            expandActiveNavGroup(navAcessos);
            setCurrentPageTitle('acessos');
            accessPageController?.carregarAcessos?.(false);
        }

        function showLiberacaoSecoesPage() {
            hideAllPages();
            liberacaoSecoesPage?.classList.remove('hidden');
            navLiberacaoSecoes?.classList.add('active');
            expandActiveNavGroup(navLiberacaoSecoes);
            setCurrentPageTitle('liberacaoSecoes');
            carregarLiberacaoSecoesTela().catch(error => showInfoModal(error.message, 'error'));
        }

        function showRolesPage() {
            hideAllPages();
            rolesPage.classList.remove('hidden');
            navRoles.classList.add('active');
            expandActiveNavGroup(navRoles);
            setCurrentPageTitle('roles');
            accessPageController?.renderizarPerfis?.().catch(error => showInfoModal(error.message, 'error'));
        }

        function showSettingsPage() {
            hideAllPages();
            settingsPage.classList.remove('hidden');
            navSettings.classList.add('active');
            expandActiveNavGroup(navSettings);
            setCurrentPageTitle('configuracoes');
        }

        function navigateToPage(pageKey) {
            const routeForPermission = '/' + pageKey;
            if (!checkRoutePermission(routeForPermission)) return;

            if (pageKey.startsWith('escalas/nova/')) {
                if (!canCreateEscalaSessao()) {
                    showEscalasGeradasPage();
                    showInfoModal('Perfil Lider nao pode criar novas escalas.', 'error');
                    return;
                }
                const [, , loja, mesRef] = pageKey.split('/');
                const dataRef = mesRef ? new Date(mesRef + 'T00:00:00') : null;
                if (escalaRascunhoAtivo && escalaRascunhoContexto) {
                    showEscalaCriacaoPage({ loja, mes: dataRef ? String(dataRef.getMonth()) : '', ano: dataRef ? String(dataRef.getFullYear()) : '' });
                } else {
                    showEscalasGeradasPage();
                    iniciarNovaEscalaRascunho({ loja, mesRef }).catch(error => showInfoModal(error.message, 'error'));
                }
                return;
            }
            if (pageKey === 'escalas/nova') {
                if (!canCreateEscalaSessao()) {
                    showEscalasGeradasPage();
                    showInfoModal('Perfil Lider nao pode criar novas escalas.', 'error');
                    return;
                }
                showEscalasGeradasPage();
                iniciarNovaEscalaRascunho().catch(error => showInfoModal(error.message, 'error'));
                return;
            }
            if (pageKey.startsWith('escala-funcionario/')) {
                const [, escfuncId, lojaId, mesRef] = pageKey.split('/');
                showEscalaFuncionarioEdicaoPage(escfuncId, lojaId, mesRef);
                return;
            }
            if (pageKey.startsWith('historico/')) {
                const [, lojaId, mesRef] = pageKey.split('/');
                showHistoricoPage({ lojaId, mesRef });
                return;
            }
            if (pageKey.startsWith('escala-banco-mensal/')) {
                const [, lojaId, mesRef] = pageKey.split('/');
                showEscalaDetalheMensalPage(lojaId, mesRef);
                return;
            }
            if (pageKey.startsWith('escala-banco/')) {
                showEscalaDetalhePage(pageKey.split('/')[1]);
                return;
            }
            if (pageKey.startsWith('secoes/') && pageKey.endsWith('/subsecoes')) {
                showSubsecoesSecaoPage(pageKey.split('/')[1]);
                return;
            }
            if (pageKey.startsWith('secoes/')) {
                showSecaoFormPage(pageKey.split('/')[1]);
                return;
            }
            if (pageKey.startsWith('turnos-secao/')) {
                showTurnoSecaoFormPage(pageKey.split('/')[1]);
                return;
            }

            const routes = {
                home: showEscalasGeradasPage,
                escalas: showEscalasGeradasPage,
                'escalas-criadas': showEscalasGeradasPage,
                'escalas-geradas': showEscalasGeradasPage,
                'escalas-funcionarios': showEscalasFuncionariosPage,
                funcionarios: showFuncionariosPage,
                secoes: showSecoesPage,
                'turnos-secao': showTurnosSecaoPage,
                historico: showHistoricoPage,
                'tipos-descanso': showTiposDescansoPage,
                regras: showRegrasPage,
                'horarios-padrao': showHorariosPadraoPage,
                'integracao-rm': showIntegracaoRmPage,
                acessos: showAcessosPage,
                'liberacao-secoes': showLiberacaoSecoesPage,
                roles: showRolesPage,
                configuracoes: showSettingsPage
            };

            (routes[pageKey] || routes.home)();
        }

        let hashNavigationLock = false;
        let currentHashRoute = (window.location.hash || '#/escalas-geradas').replace(/^#\/?/, '') || 'escalas-geradas';

        async function handleHashNavigation() {
            const pageKey = (window.location.hash || '#/escalas-geradas').replace(/^#\/?/, '') || 'escalas-geradas';
            if (hashNavigationLock) {
                currentHashRoute = pageKey;
                navigateToPage(pageKey);
                hashNavigationLock = false;
                return;
            }

            if (escalaRascunhoAtivo && !pageKey.startsWith('escalas/nova')) {
                const confirmacao = await navigationController.confirmDiscardDraft(true);
                if (!confirmacao) {
                    hashNavigationLock = true;
                    window.location.hash = '/' + currentHashRoute;
                    return;
                }

                escalaRascunhoAtivo = false;
                escalaRascunhoContexto = null;
                restaurarCriacaoEscalaEditavel();
            }

            currentHashRoute = pageKey;
            navigateToPage(pageKey);
        }
        navTimeline?.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navEscalasCriadas?.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navRegistros.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navEscalasFuncionarios?.addEventListener('click', () => { window.location.hash = '/escalas-funcionarios'; });
        navFuncionarios.addEventListener('click', () => { window.location.hash = '/funcionarios'; });
        navSecoes.addEventListener('click', () => { window.location.hash = '/secoes'; });
        navTurnosSecao.addEventListener('click', () => { window.location.hash = '/turnos-secao'; });
        navRegras?.addEventListener('click', () => { window.location.hash = '/regras'; });
        navAcessos.addEventListener('click', () => { window.location.hash = '/acessos'; });
        navLiberacaoSecoes?.addEventListener('click', () => { window.location.hash = '/liberacao-secoes'; });
        navRoles.addEventListener('click', () => { window.location.hash = '/roles'; });
        navHorariosPadrao?.addEventListener('click', () => { window.location.hash = '/horarios-padrao'; });
        navIntegracaoRm?.addEventListener('click', () => { window.location.hash = '/integracao-rm'; });
        navSettings.addEventListener('click', () => { window.location.hash = '/configuracoes'; });
        document.querySelectorAll('.nav-parent').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.nav-group')?.classList.toggle('open');
            });
        });
        voltarEscalasBtn?.addEventListener('click', () => { window.location.hash = '/escalas'; });
        voltarEscalasCriacaoBtn?.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        voltarTurnosSecaoBtn?.addEventListener('click', () => { window.location.hash = '/turnos-secao'; });
        window.addEventListener('hashchange', handleHashNavigation);
        salvarSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!hasPermission('configuracoes', 'editar')) return showInfoModal('Usuario sem permissao para editar configuracoes.', 'error');
            salvarConfiguracoes();
        });
        goToTimelineBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!canCreateEscalaSessao()) return showInfoModal('Usuario sem permissao para criar escalas.', 'error');
            iniciarNovaEscalaRascunho().catch(error => showInfoModal(error.message, 'error'));
        });
        iniciarCriacaoEscalaBtn?.addEventListener('click', async (e) => { e.preventDefault(); iniciarCriacaoEscalaPagina().catch(error => showInfoModal(error.message, 'error')); });
        gerarTimelineCriacaoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!hasPermission('escalas', 'editar')) return showInfoModal('Usuario sem permissao para editar escalas.', 'error');
            gerarTimelineCriacaoPagina().catch(error => showInfoModal(error.message, 'error'));
        });
        carregarFuncionariosCriacaoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!hasPermission('escalas', 'editar')) return showInfoModal('Usuario sem permissao para editar escalas.', 'error');
            try {
                await carregarFuncionariosDaLoja(true, escalaRascunhoContexto?.loja || criacaoEscalaLoja?.value || '');
                prepararPaineisCriacao();
                resetSkeletonModalState();
                esqueletoModal.classList.remove('hidden');
                gerarTabelaEsqueleto();
                esqueletoModal.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        imprimirTimelineCriacaoBtn?.addEventListener('click', () => imprimirTimelineMelhorado(dadosEscala, 'Linha do Tempo de Turnos'));
        gerarDetalhadaCriacaoBtn?.addEventListener('click', (e) => { e.preventDefault(); gerarEscalaDetalhadaBtn.click(); });

        consultarBancoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await consultarEscalasBancoLocal();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        sincronizarBancoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await sincronizarEscalasSalvasComBanco();
                await consultarEscalasBancoLocal();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        // --- LOGICA DA ESCALA ---
        const formContainer = document.getElementById('form-container');
        const formTitle = document.getElementById('form-title');
        const horaInicioTimelineInput = document.getElementById('horaInicioTimeline');
        const horaFimTimelineInput = document.getElementById('horaFimTimeline');
        const intervaloMarcacaoInput = document.getElementById('intervaloMarcacao');
        const quantidadeInput = document.getElementById('quantidade');
        const secaoTurnoSelect = document.getElementById('secaoTurnoSelect');
        const inicioEscalaInput = document.getElementById('inicioEscala');
        const fimEscalaInput = document.getElementById('fimEscala');
        const inicioIntervaloInput = document.getElementById('inicioIntervalo');
        const fimIntervaloInput = document.getElementById('fimIntervalo');
        const addEscalaBtn = document.getElementById('addEscalaBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const printBtn = document.getElementById('printBtn');
        const abrirModalEscalaBtn = document.getElementById('abrirModalEscalaBtn');
        const esqueletoModal = document.getElementById('esqueletoModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const lojaEscalaSelect = document.getElementById('lojaEscalaSelect');
        const carregarFuncionariosBtn = document.getElementById('carregarFuncionariosBtn');
        const funcionariosStatus = document.getElementById('funcionariosStatus');
        const mesSelect = document.getElementById('mesSelect');
        const anoSelect = document.getElementById('anoSelect');
        const tabelaEsqueletoContainer = document.getElementById('tabela-esqueleto-container');
        const gerarEscalaDetalhadaBtn = document.getElementById('gerarEscalaDetalhadaBtn');
        const editarDistribuicaoBtn = document.getElementById('editarDistribuicaoBtn');
        const autoDistribuirFolgasBtn = document.getElementById('autoDistribuirFolgasBtn');
        const imprimirEsqueletoBtn = document.getElementById('imprimirEsqueletoBtn');
        const detalhadaModal = document.getElementById('detalhadaModal');
        const detalhadaModalBody = document.getElementById('detalhada-modal-body');
        const detalhadaMesAno = document.getElementById('detalhadaMesAno');
        const closeDetalhadaModalBtn = document.getElementById('closeDetalhadaModalBtn');
        const imprimirDetalhadaBtn = document.getElementById('imprimirDetalhadaBtn');
        const validarEscalaBtn = document.getElementById('validarEscalaBtn');
        const regraJornadaTrabalhoInput = document.getElementById('regraJornadaTrabalho');
        const regraMaxHoraExtraInput = document.getElementById('regraMaxHoraExtra');
        const regraMinIntervaloInput = document.getElementById('regraMinIntervalo');
        const regraMaxIntervaloInput = document.getElementById('regraMaxIntervalo');
        const regraMaxJornadaContinuaInput = document.getElementById('regraMaxJornadaContinua');
        const regraDescansoEntreTurnosInput = document.getElementById('regraDescansoEntreTurnos');
        const regraDescansoPosFolgaInput = document.getElementById('regraDescansoPosFolga');
        const regraMaxDiasConsecutivosInput = document.getElementById('regraMaxDiasConsecutivos');
        const getMaxDiasConsecutivos5x2 = () => Math.min(Number(regraMaxDiasConsecutivosInput?.value || 5) || 5, 5);
        const visualizarTimelineBtn = document.getElementById('visualizarTimelineBtn');
        const timelineVisualizerModal = document.getElementById('timelineVisualizerModal');
        const closeTimelineVisualizerBtn = document.getElementById('closeTimelineVisualizerBtn');
        const printTimelineVisualizerBtn = document.getElementById('printTimelineVisualizerBtn');
        const printContainer = document.getElementById('print-container');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const zoomResetBtn = document.getElementById('zoomResetBtn');
        const timelineZoomInBtn = document.getElementById('timelineZoomInBtn');
        const timelineZoomOutBtn = document.getElementById('timelineZoomOutBtn');
        const timelineZoomResetBtn = document.getElementById('timelineZoomResetBtn');

        const prepararPaineisCriacao = () => {
            if (!escalaCriacaoPage || !esqueletoModal || !detalhadaModal) return;
            if (esqueletoModal.parentElement !== escalaCriacaoPage) escalaCriacaoPage.appendChild(esqueletoModal);
            if (detalhadaModal.parentElement !== escalaCriacaoPage) escalaCriacaoPage.appendChild(detalhadaModal);
            esqueletoModal.classList.add('embedded-scale-panel', 'mt-6');
            detalhadaModal.classList.add('embedded-scale-panel', 'mt-6');
            const skeletonTitle = esqueletoModal.querySelector('#esqueleto-modal-header h3');
            const detailedTitle = detalhadaModal.querySelector('h3');
            if (skeletonTitle) skeletonTitle.textContent = 'Distribuição de Funcionários e Folgas';
            if (detailedTitle) detailedTitle.textContent = 'Escala de Trabalho Detalhada';
        };

        let esqueletoZoomLevel = 1.0;
        let mainTimelineZoomLevel = 1.0;
        let dadosEscala = [];
        let modoEdicao = { ativo: false, index: null };
        let colaboradorShifts = [];
        let escalaCarregadaId = null;
        let escalaCarregadaParaVisualizacao = null;
        let detailedScaleHasBeenGenerated = false;
        let distribuicaoFolgasBloqueada = false;
        let distribuicaoEdicaoAtiva = false;
        let escalaDetalhadaValidada = false;
        let escalaFuncionarioEdicaoValidada = false;
        let escalaFuncionarioEdicaoAlterada = false;
        let escalaDetalheBancoValidada = false;
        let escalaDetalheBancoAlterados = new Map();
        let currentLoadedScale = null;
        let funcionariosLojaCache = [];
        let ausenciasLojaCache = [];
        let secoesLojaCache = [];
        let turnosSecaoCache = [];
        let turnoSecaoExpandidaKey = null;
        let escalaDetalheAtual = { escprogId: null, lojaId: null, mesRef: null, modo: 'individual', visao: 'mensal', dias: [], secaoAtiva: null, secoes: [], subsetorAtivo: null, subsetores: [] };
        let lojasPermitidasCache = [];
        let lojaPrincipalCache = null;
        let usuarioSessaoCache = null;
        let usuariosAcessoCache = [];
        let acessosPaginationState = { page: 1, pageSize: 20, total: 0, totalPages: 1, search: '' };
        let acessosPesquisaTimeout = null;
        let liberacaoSecoesCache = { usuarios: [], secoes: [], liberadas: new Set(), selecionadasDisponiveis: new Set(), selecionadasLiberadas: new Set(), tableReady: false };
        let secoesTelaCache = [];
        const SUBSECAO_SEM_VINCULO_KEY = 'SEM_SUBSECAO';
        let subsecoesPageState = { loja: '', secao: null, subsecoes: [], funcionarios: [], selecionadaId: null, criando: false, editandoId: null, selecionados: new Set(), painelVinculoAberto: false, menuAberto: null };
        let turnosTelaCache = [];
        let turnosFuncionariosTelaCache = [];
        let funcionariosTelaCache = [];
        let escalasFuncionariosCache = [];
        let escalaFuncionarioEdicaoAtual = null;
        let escalaFuncionarioMesesDisponiveisCache = new Map();
        let regrasEscalaCache = [];
        let horariosPadraoCache = [];
        let rmLogsCache = [];
        let tiposDescansoCache = [];
        let historicoCache = [];
        let perfisAcessoCache = [];
        let perfilPaginasCache = [];
        function isPerfilLiderSessao() {
            return String(usuarioSessaoCache?.perfil || '').trim().toUpperCase() === 'LIDER';
        }
        function canCreateEscalaSessao() {
            return hasPermission('escalas', 'criar') && !isPerfilLiderSessao();
        }
        const getLojaCodigo = (loja) => loja?.LOJA ?? loja?.loja;
        const getLojaPrincipalStorageKey = () => {
            const id = usuarioSessaoCache?.sub || usuarioSessaoCache?.id || usuarioSessaoCache?.usuarioId || usuarioSessaoCache?.login || 'anonimo';
            return 'escala_loja_principal_' + String(id);
        };
        const getLojaPrincipal = () => {
            const permitidas = lojasPermitidasCache.map(Number).filter(Boolean);
            const atual = Number(lojaPrincipalCache || 0);
            if (atual && permitidas.includes(atual)) return String(atual);
            const salva = Number(localStorage.getItem(getLojaPrincipalStorageKey()) || 0);
            if (salva && permitidas.includes(salva)) return String(salva);
            return permitidas.length ? String(permitidas[0]) : '';
        };
        const setLojaPrincipal = (loja) => {
            const value = Number(loja || 0);
            if (!value || !lojasPermitidasCache.includes(value)) return '';
            lojaPrincipalCache = String(value);
            localStorage.setItem(getLojaPrincipalStorageKey(), String(value));
            return String(value);
        };
        const atualizarBadgeLojaPrincipal = () => {
            if (!loggedUserStores) return;
            const lojas = Array.isArray(usuarioSessaoCache?.lojas) ? usuarioSessaoCache.lojas : lojasPermitidasCache;
            const lojaPrincipal = getLojaPrincipal();
            const labelPrincipal = lojaPrincipal ? `Loja principal ${lojaPrincipal}` : 'Sem loja principal';
            loggedUserStores.innerHTML = '<span class="material-symbols-outlined">storefront</span>' + labelPrincipal;
            loggedUserStores.title = lojas.length > 0 ? `Lojas permitidas: ${lojas.join(', ')}` : 'Sem loja vinculada';
            loggedUserStores.disabled = lojas.length <= 1;
        };
        
        const { timeToMinutes, minutesToTime, hoursToMinutes } = window.EscalaRulesCore;
        const { showInfoModal, hideInfoModal, showInputModal } = window.EscalaModal;
        const { escapeHtml, formatarDataTabela, formatarMesTabela } = window.EscalaFormatters;

        const restaurarCriacaoEscalaEditavel = () => {
            distribuicaoFolgasBloqueada = false;
            distribuicaoEdicaoAtiva = false;
            detailedScaleHasBeenGenerated = false;
            escalaDetalhadaValidada = false;
            criacaoSecoesLista?.querySelectorAll('input[type="checkbox"]').forEach(input => { input.disabled = false; });
            document.querySelectorAll('#criacaoTimelineContent button').forEach(button => { button.disabled = false; });
            if (gerarTimelineCriacaoBtn) gerarTimelineCriacaoBtn.disabled = false;
            if (novoTurnoCriacaoBtn) novoTurnoCriacaoBtn.disabled = false;
            if (carregarFuncionariosCriacaoBtn) carregarFuncionariosCriacaoBtn.disabled = false;
            if (autoDistribuirFolgasBtn) {
                autoDistribuirFolgasBtn.disabled = false;
                autoDistribuirFolgasBtn.classList.remove('hidden');
            }
            gerarEscalaDetalhadaBtn?.classList.add('hidden');
            editarDistribuicaoBtn?.classList.add('hidden');
            esqueletoModal?.classList.remove('distribution-locked');
            const tabelaEsqueleto = document.getElementById('tabela-esqueleto');
            tabelaEsqueleto?.classList.remove('is-readonly');
            tabelaEsqueleto?.querySelectorAll('.collaborator-select').forEach(select => { select.disabled = false; });
        };
        
        const contarTurnosCriados = (ignorarIndex = null) => dadosEscala.reduce((total, escala, index) => {
            if (index === ignorarIndex) return total;
            return total + (parseInt(escala.quantidade, 10) || 0);
        }, 0);

        const contarTurnosCriadosPorSecao = (secaoId, ignorarIndex = null) => dadosEscala.reduce((total, escala, index) => {
            if (index === ignorarIndex) return total;
            if (String(escala.secaoId || '') !== String(secaoId || '')) return total;
            return total + (parseInt(escala.quantidade, 10) || 0);
        }, 0);

        const atualizarContadoresHome = () => {
            const funcionariosNaLoja = funcionariosLojaCache.length;
            const turnosCriados = contarTurnosCriados();
            const turnosRestantes = Math.max(funcionariosNaLoja - turnosCriados, 0);

            if (funcionariosLojaCount) funcionariosLojaCount.textContent = funcionariosNaLoja;
            if (turnosCriadosCount) turnosCriadosCount.textContent = turnosCriados;
            if (turnosRestantesCount) turnosRestantesCount.textContent = turnosRestantes;
        };

        const abrirModalTurno = () => {
            if (turnoModal) turnoModal.classList.remove('hidden');
            quantidadeInput.focus();
        };

        const fecharModalTurno = () => {
            if (turnoModal) turnoModal.classList.add('hidden');
        };

        const getSecaoTurnoPadrao = (secao) => (secao?.TURNOS || [])[0] || null;

        const getSecaoLabel = (secao) => {
            const codigo = secao?.COD_SECAO ? `${secao.COD_SECAO} - ` : '';
            return `${codigo}${secao?.DESCR || `Secao ${secao?.ESCSECAO_ID || ''}`}`;
        };

        const popularSelectSecaoFormulario = (selectedId = '') => {
            if (!turnoSecaoFormSecao) return;
            turnoSecaoFormSecao.innerHTML = '<option value="">Selecione uma seção</option>';
            secoesLojaCache.forEach((secao) => {
                const option = document.createElement('option');
                option.value = secao.ESCSECAO_ID || '';
                option.textContent = getSecaoLabel(secao);
                option.dataset.codigo = secao.COD_SECAO || '';
                option.dataset.descr = secao.DESCR || '';
                turnoSecaoFormSecao.appendChild(option);
            });
            turnoSecaoFormSecao.value = selectedId ? String(selectedId) : '';
        };

        const popularSelectSecoesTurno = () => {
            if (!secaoTurnoSelect) return;
            secaoTurnoSelect.innerHTML = '<option value="">Selecione uma secao com turno cadastrado</option>';
            turnosSecaoCache.forEach((turno) => {
                const option = document.createElement('option');
                option.value = turno.ESCSECAO_ID;
                option.textContent = `${turno.COD_SECAO ? `${turno.COD_SECAO} - ` : ''}${turno.DESCR || 'Seção'} | ${turno.HR_ENT1} - ${turno.HR_SAI1} / ${turno.HR_ENT2} - ${turno.HR_SAI2}`;
                option.dataset.turnoId = turno.ESCSECAOTURNO_ID || '';
                option.dataset.secaoDescr = turno.DESCR || '';
                option.dataset.hrEnt1 = turno.HR_ENT1 || '';
                option.dataset.hrSai1 = turno.HR_SAI1 || '';
                option.dataset.hrEnt2 = turno.HR_ENT2 || '';
                option.dataset.hrSai2 = turno.HR_SAI2 || '';
                option.dataset.qtde = turno.QTDE_COLABORADORES || '';
                secaoTurnoSelect.appendChild(option);
            });
        };

        const aplicarSecaoSelecionadaNoFormulario = () => {
            const option = secaoTurnoSelect?.selectedOptions?.[0];
            quantidadeInput.value = option?.dataset.qtde || '';
            inicioEscalaInput.value = option?.dataset.hrEnt1 || '';
            inicioIntervaloInput.value = option?.dataset.hrSai1 || '';
            fimIntervaloInput.value = option?.dataset.hrEnt2 || '';
            fimEscalaInput.value = option?.dataset.hrSai2 || '';
        };

        const getFuncionarioOptionValue = (funcionario) => String(funcionario?.ESCFUNC_ID || funcionario?.CHAPA || '');

        const isFuncionarioDaSecao = (funcionario, secaoId) => {
            return String(funcionario?.ESCSECAO_ID || '') === String(secaoId || '');
        };

        const renderFuncionarioOptionsPorSecao = (secaoId, selectedFuncionarioValue = '') => {
            const funcionariosDaSecao = funcionariosLojaCache.filter(funcionario => isFuncionarioDaSecao(funcionario, secaoId));
            return funcionariosDaSecao.map(item => {
                const value = getFuncionarioOptionValue(item);
                const label = `${item.NOME} (${item.CHAPA})`;
                const selected = value === selectedFuncionarioValue ? 'selected' : '';
                return `<option value="${escapeHtml(value)}" data-escfunc-id="${escapeHtml(item.ESCFUNC_ID)}" data-chapa="${escapeHtml(item.CHAPA)}" data-escsecao-id="${escapeHtml(item.ESCSECAO_ID || '')}" data-escfuncao-id="${escapeHtml(item.ESCFUNCAO_ID || '')}" data-name="${escapeHtml(label)}" ${selected}>${escapeHtml(label)}</option>`;
            }).join('');
        };

        const atualizarOpcoesFuncionariosEsqueleto = () => {
            const selects = Array.from(tabelaEsqueletoContainer.querySelectorAll('.collaborator-select'));
            const selecionados = new Set(selects.map(select => select.value).filter(Boolean));

            selects.forEach(select => {
                Array.from(select.options).forEach(option => {
                    option.disabled = !!option.value && option.value !== select.value && selecionados.has(option.value);
                });
            });
        };

        const getFuncionarioSelecionadoPorLinha = (index) => {
            const row = tabelaEsqueletoContainer.querySelector(`tr[data-colab-index="${index}"]`);
            const escfuncId = row?.dataset.escfuncId;
            const chapa = row?.dataset.chapa;

            return funcionariosLojaCache.find(funcionario =>
                String(funcionario.ESCFUNC_ID || '') === String(escfuncId || '')
                || String(funcionario.CHAPA || '') === String(chapa || '')
            ) || null;
        };

        const limparAusenciasObrigatoriasDoEsqueleto = () => {
            tabelaEsqueletoContainer.querySelectorAll('.escala-cell[data-ausencia-obrigatoria="1"]').forEach(cell => {
                const dia = parseInt(cell.dataset.dia, 10);
                const isSunday = new Date(anoSelect.value, mesSelect.value, dia).getDay() === 0;
                cell.textContent = '';
                delete cell.dataset.ausenciaObrigatoria;
                cell.removeAttribute('title');
                cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold');
                if (isSunday) cell.classList.add('bg-yellow-100');
            });
        };

        const validarTurnoSimples = (turno) => {
            return window.EscalaRulesCore.validarTurnoSimples(turno, {
                minIntervalo: regraMinIntervaloInput.value,
                maxIntervalo: regraMaxIntervaloInput.value,
                maxJornadaContinua: regraMaxJornadaContinuaInput.value
            });
        };

        const validarTurnoCadastroSecao = (turno) => {
            const ent1 = timeToMinutes(turno.HR_ENT1);
            const sai1 = timeToMinutes(turno.HR_SAI1);
            const ent2 = timeToMinutes(turno.HR_ENT2);
            const sai2 = timeToMinutes(turno.HR_SAI2);
            const errors = [];
            const primeiraJornada = sai1 - ent1;
            const intervalo = ent2 - sai1;
            const segundaJornada = sai2 - ent2;
            const jornadaTotal = primeiraJornada + segundaJornada;

            if (!turno.HR_ENT1 || !turno.HR_SAI1 || !turno.HR_ENT2 || !turno.HR_SAI2) {
                errors.push('Informe Entrada 1, Saida 1, Entrada 2 e Saida 2.');
                return errors;
            }
            if (primeiraJornada <= 0) errors.push('Saida 1 deve ser maior que Entrada 1.');
            if (segundaJornada <= 0) errors.push('Saida 2 deve ser maior que Entrada 2.');
            if (intervalo <= 0) errors.push('Entrada 2 deve ser maior que Saida 1.');
            if (primeiraJornada > 360) errors.push(`Primeiro periodo nao pode passar de 06:00. Atual: ${minutesToTime(primeiraJornada)}.`);
            if (segundaJornada > 360) errors.push(`Segundo periodo nao pode passar de 06:00. Atual: ${minutesToTime(segundaJornada)}.`);
            if (jornadaTotal !== 528) errors.push(`Jornada total deve ser exatamente 08:48. Atual: ${minutesToTime(jornadaTotal)}.`);
            if (intervalo < 70) errors.push(`Intervalo entre as jornadas deve ter no minimo 01:10. Atual: ${minutesToTime(intervalo)}.`);
            return errors;
        };

        const calcularHorarioCompletoPorEntrada = (entrada1) => {
            const inicio = timeToMinutes(entrada1);
            if (Number.isNaN(inicio)) return null;
            return {
                HR_ENT1: minutesToTime(inicio),
                HR_SAI1: minutesToTime(inicio + 240),
                HR_ENT2: minutesToTime(inicio + 310),
                HR_SAI2: minutesToTime(inicio + 598)
            };
        };

        const getTipoDescansoOptions = () => {
            const ativos = tiposDescansoCache.filter(tipo => tipo.STATUS !== 'I');
            return ativos.length
                ? ativos.map(tipo => ({ value: tipo.SIGLA, label: tipo.DESCR + ' (' + tipo.SIGLA + ')' }))
                : [{ value: 'F', label: 'Folga (F)' }];
        };

        const abrirModalEdicaoDiaPadrao = async ({
            title,
            ids,
            dia = {},
            descansoAtual = false,
            panelClass = 'bg-white rounded-lg shadow-xl w-11/12 max-w-5xl flex flex-col employee-day-modal'
        }) => {
            if (!tiposDescansoCache.length) await carregarTiposDescansoCache(false);
            const getDiaValue = (key, fallback = '') => dia[key] || fallback;
            const values = await showInputModal({
                title,
                panelClass,
                inputs: [
                    { label: 'Tipo do dia', type: 'choice-group', id: ids.tipoDia, value: descansoAtual ? 'DESCANSO' : 'TRABALHO', options: [{ value: 'TRABALHO', label: 'Trabalho' }, { value: 'DESCANSO', label: 'Descanso' }], required: true, wrapperClass: 'employee-modal-span-4' },
                    { label: 'Tipo de descanso', type: 'select', id: ids.descanso, value: descansoAtual ? getValorDescanso(dia) : 'F', options: getTipoDescansoOptions(), dependsOn: ids.tipoDia, showWhen: 'DESCANSO', required: true, wrapperClass: 'employee-modal-span-4' },
                    { label: 'Entrada 1', type: 'time', id: ids.hrEnt1, value: descansoAtual ? '08:00' : getDiaValue('HR_ENT1', '08:00'), dependsOn: ids.tipoDia, showWhen: 'TRABALHO', required: true, wrapperClass: 'employee-modal-span-2' },
                    { label: 'Saida 1', type: 'time', id: ids.hrSai1, value: descansoAtual ? '' : getDiaValue('HR_SAI1'), dependsOn: ids.tipoDia, showWhen: 'TRABALHO', required: true, wrapperClass: 'employee-modal-span-2' },
                    { label: 'Entrada 2', type: 'time', id: ids.hrEnt2, value: descansoAtual ? '' : getDiaValue('HR_ENT2'), dependsOn: ids.tipoDia, showWhen: 'TRABALHO', required: true, wrapperClass: 'employee-modal-span-2' },
                    { label: 'Saida 2', type: 'time', id: ids.hrSai2, value: descansoAtual ? '' : getDiaValue('HR_SAI2'), dependsOn: ids.tipoDia, showWhen: 'TRABALHO', required: true, wrapperClass: 'employee-modal-span-2' },
                    { label: 'Justificativa da mudanca', type: 'textarea', id: ids.justificativa, value: '', required: true, rows: 3, placeholder: 'Descreva o motivo da alteracao deste dia.', wrapperClass: 'employee-modal-span-4' }
                ],
                confirmText: 'Salvar Dia',
                secondaryActions: [{
                    id: 'replicar-mes',
                    label: 'Replicar para o Mês',
                    className: 'input-modal-secondary-action px-4 py-2 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold transition'
                }],
                onRender: (body) => {
                    const ent1 = body.querySelector('#' + ids.hrEnt1);
                    const preencher = () => {
                        const calculado = calcularHorarioCompletoPorEntrada(ent1?.value);
                        if (!calculado) return;
                        body.querySelector('#' + ids.hrSai1).value = calculado.HR_SAI1;
                        body.querySelector('#' + ids.hrEnt2).value = calculado.HR_ENT2;
                        body.querySelector('#' + ids.hrSai2).value = calculado.HR_SAI2;
                    };
                    ent1?.addEventListener('input', preencher);
                }
            });
            if (!values) return null;
            if (values[ids.tipoDia] === 'TRABALHO') {
                const erros = validarTurnoCadastroSecao({
                    HR_ENT1: values[ids.hrEnt1],
                    HR_SAI1: values[ids.hrSai1],
                    HR_ENT2: values[ids.hrEnt2],
                    HR_SAI2: values[ids.hrSai2]
                });
                if (erros.length) {
                    showInfoModal(erros, 'error');
                    return null;
                }
            }
            if (values._modalAction === 'replicar-mes') {
                const confirmacao = await showInputModal({
                    title: 'Replicar alteração para o mês',
                    inputs: [{ type: 'message', text: 'Este horário será aplicado aos demais dias trabalhados e futuros deste funcionário no mês. Folgas, férias, afastamentos e dias já passados serão mantidos.' }],
                    cancelText: 'Cancelar',
                    confirmText: 'Replicar'
                });
                if (!confirmacao) return null;
                if (values[ids.tipoDia] === 'DESCANSO') {
                    showInfoModal('Replicar para o mês é permitido apenas para alterações de horário de trabalho.', 'info');
                    return null;
                }
                values.REPLICAR_MES = true;
            }
            return values;
        };

        const setSalvarEscalaDisponivel = (disponivel) => {
            escalaDetalhadaValidada = !!disponivel;
            salvarEscalaBtn?.classList.toggle('hidden', !escalaDetalhadaValidada);
        };

        const limparCriticasDetalhada = () => {
            detalhadaModalBody.querySelectorAll('.critical-status-chip').forEach(chip => chip.remove());
            detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada').forEach(colabDiv => {
                delete colabDiv.dataset.criticas;
            });
        };

        const registrarCriticasColaborador = (colabDiv, criticas) => {
            if (!colabDiv || !criticas?.length) return;
            const header = colabDiv.querySelector('.header-info');
            const title = header?.querySelector('h3');
            if (!header || !title) return;
            header.classList.add('detailed-employee-header');
            colabDiv.dataset.criticas = JSON.stringify(criticas);
            let chip = header.querySelector('.critical-status-chip');
            if (!chip) {
                chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'critical-status-chip';
                header.appendChild(chip);
            }
            chip.textContent = 'CRITICA';
            chip.title = 'Ver criticas do funcionario';
            chip.setAttribute('aria-label', 'Ver criticas do funcionario');
        };

        const aplicarCriticasDetalhada = (errors) => {
            limparCriticasDetalhada();
            if (!errors.length) return;
            detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada').forEach(colabDiv => {
                const nome = colabDiv.querySelector('h3')?.textContent || '';
                const criticas = errors.filter(error => String(error).startsWith(nome + ':') || String(error).startsWith(nome + ' no dia'));
                registrarCriticasColaborador(colabDiv, criticas);
            });
        };

        const invalidarValidacaoDetalhada = () => {
            setSalvarEscalaDisponivel(false);
        };

        
        const renderizarTimelineCompleta = (targetElementId = 'timeline-content', customDadosEscala = dadosEscala) => {
            const timelineContent = document.getElementById(targetElementId);
            if (!timelineContent) return;
            timelineContent.style.position = 'relative';

            const intervalo = parseInt(intervaloMarcacaoInput.value) || 30;
            const config = {
                inicioTimeline: timeToMinutes(horaInicioTimelineInput.value),
                fimTimeline: timeToMinutes(horaFimTimelineInput.value),
                intervaloMarcacao: intervalo,
            };
            const duracaoTotalTimeline = config.fimTimeline - config.inicioTimeline;

            if (duracaoTotalTimeline <= 0) {
                timelineContent.innerHTML = '<p class="text-red-500">A hora de fim deve ser maior que a hora de início.</p>';
                return;
            }

            const numMarcacoes = duracaoTotalTimeline / config.intervaloMarcacao;
            const minWidth = Math.max(1200, numMarcacoes * 60);
            timelineContent.style.minWidth = `${minWidth}px`;
            
            // --- Constrói a grade de linhas de intervalo ---
            const breakTimesInMinutes = new Set();
            customDadosEscala.forEach(escala => {
                if (escala.inicioIntervalo) breakTimesInMinutes.add(timeToMinutes(escala.inicioIntervalo));
                if (escala.fimIntervalo) breakTimesInMinutes.add(timeToMinutes(escala.fimIntervalo));
            });

            // O contêiner da grade agora começa em 12rem (w-48) para alinhar com a área das barras
            let gridHtml = '<div style="position: absolute; top: 0; bottom: 0; left: 12rem; right: 0; pointer-events: none; z-index: 1;">';
            breakTimesInMinutes.forEach(min => {
                if (min >= config.inicioTimeline && min <= config.fimTimeline) {
                    // O percentual agora é calculado em relação à área da grade (que já exclui o label)
                    const percentLeft = ((min - config.inicioTimeline) / duracaoTotalTimeline) * 100;
                    gridHtml += `<div class="timeline-grid-line" style="position: absolute; top: 0; bottom: 0; left: ${percentLeft}%;"></div>`;
                }
            });
            gridHtml += '</div>';

            const headerHtml = renderizarCabecalho(config, duracaoTotalTimeline, customDadosEscala);
            const bodyHtml = renderizarCorpo(config, duracaoTotalTimeline, customDadosEscala, targetElementId);
            const summaryHtml = renderizarLinhaDeSoma(config, duracaoTotalTimeline, customDadosEscala);

            timelineContent.innerHTML = gridHtml + headerHtml + bodyHtml + summaryHtml;
        };


        const renderizarCabecalho = (config, duracaoTotalTimeline) => { let markersHtml = ''; for (let min = config.inicioTimeline; min <= config.fimTimeline; min += config.intervaloMarcacao) { const percentLeft = ((min - config.inicioTimeline) / duracaoTotalTimeline) * 100; markersHtml += `<div class="absolute text-xs text-gray-500" style="left: ${percentLeft}%;"><span class="transform -translate-x-1/2 inline-block">${minutesToTime(min)}</span></div>`; } return `<div class="relative z-10 mb-3"><div class="flex items-center h-10"><div class="w-48 flex-shrink-0 pr-4"></div><div class="flex-1 h-full relative border-b-2 border-gray-200">${markersHtml}</div></div></div>`; };
        const renderizarCorpo = (config, duracaoTotalTimeline, customDadosEscala, targetElementId) => { let bodyHtml = '<div>'; if (customDadosEscala.length === 0) { bodyHtml += `<p class="text-center text-gray-500 mt-4">Nenhum turno adicionado.</p>`; } else { customDadosEscala.forEach((escala, index) => { const inicioEscalaMin = timeToMinutes(escala.inicio); const fimEscalaMin = timeToMinutes(escala.fim); const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo); const fimIntervaloMin = timeToMinutes(escala.fimIntervalo); let barsHtml = ''; const createBar = (startMin, endMin, color) => { if (endMin <= startMin) return ''; const duration = endMin - startMin; const leftPercent = ((startMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (leftPercent < 0 || widthPercent <= 0) return ''; return `<div class="absolute h-full ${color} rounded" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>`; }; if (inicioIntervaloMin < fimIntervaloMin && inicioIntervaloMin > inicioEscalaMin && fimIntervaloMin < fimEscalaMin) { barsHtml += createBar(inicioEscalaMin, inicioIntervaloMin, 'bg-green-500'); barsHtml += createBar(inicioIntervaloMin, fimIntervaloMin, 'bg-yellow-500'); barsHtml += createBar(fimIntervaloMin, fimEscalaMin, 'bg-green-500'); } else { barsHtml += createBar(inicioEscalaMin, fimEscalaMin, 'bg-green-500'); } let tempoInfoHtml = `<span class="text-xs text-gray-500 block">${escala.inicio} -<span class="text-gray-400"> ${escala.inicioIntervalo} - ${escala.fimIntervalo}</span> - ${escala.fim}</span>`; let actionsHtml = ''; if (targetElementId === 'timeline-content') { actionsHtml = `<div class="row-actions hidden mt-2 space-x-2"><button class="action-btn edit-btn" data-index="${index}">Editar</button><button class="action-btn delete-btn" data-index="${index}">Excluir</button></div>`; } else if (targetElementId === 'criacaoTimelineContent') { actionsHtml = `<div class="row-actions creation-row-actions mt-2"><button class="action-btn edit-btn" data-index="${index}"><span class="material-symbols-outlined">edit</span>Editar turno</button><button class="action-btn delete-btn" data-index="${index}"><span class="material-symbols-outlined">remove_circle</span>Remover secao</button></div>`; } bodyHtml += `<div class="timeline-row flex items-center py-1 ${targetElementId === 'timeline-content' ? 'cursor-pointer' : ''}"><div class="w-48 flex-shrink-0 pr-4 flex flex-col justify-center"><div><span class="font-bold text-gray-700">${escala.quantidade} Colab.</span><span class="text-xs text-gray-600 block">${escapeHtml(escala.secaoNome || "Sem secao")}</span>${tempoInfoHtml}</div>${actionsHtml}</div><div class="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden" style="z-index: 2;">${barsHtml}</div></div>`; }); } bodyHtml += `</div>`; return bodyHtml; };
        const renderizarLinhaDeSoma = (config, duracaoTotalTimeline, customDadosEscala) => { if (customDadosEscala.length === 0) return ''; const perfilCarga = new Array(duracaoTotalTimeline + 1).fill(0); customDadosEscala.forEach(escala => { const quantidade = parseInt(escala.quantidade); const inicioEscalaMin = timeToMinutes(escala.inicio); const fimEscalaMin = timeToMinutes(escala.fim); const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo); const fimIntervaloMin = timeToMinutes(escala.fimIntervalo); for (let min = inicioEscalaMin; min < fimEscalaMin; min++) { const isBreak = (inicioIntervaloMin < fimIntervaloMin && min >= inicioIntervaloMin && min < fimIntervaloMin); if (!isBreak) { const index = min - config.inicioTimeline; if (index >= 0 && index < perfilCarga.length) perfilCarga[index] += quantidade; } } }); let summaryHtml = ''; let lastCount = -1; let blockStartMin = config.inicioTimeline; for (let i = 0; i <= duracaoTotalTimeline; i++) { const currentCount = perfilCarga[i] || 0; const currentMin = config.inicioTimeline + i; if (currentCount !== lastCount && i > 0) { const duration = currentMin - blockStartMin; const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (widthPercent > 0) { const color = lastCount > 0 ? 'bg-blue-600' : 'bg-transparent'; summaryHtml += `<div class="absolute h-full ${color} flex items-center justify-center" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount > 0 ? lastCount : ''}</span></div>`; } blockStartMin = currentMin; } lastCount = currentCount; } const duration = (config.inicioTimeline + duracaoTotalTimeline) - blockStartMin; const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (widthPercent > 0) { const color = lastCount > 0 ? 'bg-blue-600' : 'bg-transparent'; summaryHtml += `<div class="absolute h-full ${color} flex items-center justify-center" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount > 0 ? lastCount : ''}</span></div>`; } return `<div class="summary-row border-t-2 border-gray-300 mt-4 pt-4"><div class="flex items-center my-2 h-10"><div class="w-48 flex-shrink-0 text-center pr-4"><span class="font-bold text-lg text-gray-700">Total</span><span class="text-xs text-gray-500 block">Ativos</span></div><div class="flex-1 h-full bg-gray-200 rounded relative overflow-hidden" style="z-index: 2;">${summaryHtml}</div></div></div>`; };
        
        const manipularEnvioFormulario = () => {
            let errors = [];
            const secaoOption = secaoTurnoSelect?.selectedOptions?.[0];
            const novaEscala = {
                secaoId: secaoTurnoSelect?.value || '',
                secaoNome: secaoOption?.textContent || '',
                quantidade: quantidadeInput.value,
                inicio: inicioEscalaInput.value,
                fim: fimEscalaInput.value,
                inicioIntervalo: inicioIntervaloInput.value,
                fimIntervalo: fimIntervaloInput.value
            };
            if (!novaEscala.secaoId) errors.push("Selecione uma secao com turno cadastrado.");
            if (!novaEscala.quantidade || !novaEscala.inicio || !novaEscala.fim) errors.push("A secao selecionada precisa ter quantidade, entrada e saida cadastradas.");
            if (timeToMinutes(novaEscala.fim) <= timeToMinutes(novaEscala.inicio)) errors.push("A saida do turno deve ser maior que a entrada.");
            const quantidadeNova = parseInt(novaEscala.quantidade, 10) || 0;
            const totalProjetado = contarTurnosCriados(modoEdicao.ativo ? modoEdicao.index : null) + quantidadeNova;
            if (funcionariosLojaCache.length > 0 && totalProjetado > funcionariosLojaCache.length) {
                errors.push(`A loja possui ${funcionariosLojaCache.length} funcionario(s) carregado(s). Reduza a quantidade para nao ultrapassar o total disponivel.`);
            }
            const funcionariosDaSecao = funcionariosLojaCache.filter(funcionario => isFuncionarioDaSecao(funcionario, novaEscala.secaoId));
            const totalSecaoProjetado = contarTurnosCriadosPorSecao(novaEscala.secaoId, modoEdicao.ativo ? modoEdicao.index : null) + quantidadeNova;
            if (funcionariosDaSecao.length > 0 && totalSecaoProjetado > funcionariosDaSecao.length) {
                errors.push(`A secao selecionada possui ${funcionariosDaSecao.length} funcionario(s). Reduza a quantidade deste turno ou revise o cadastro da secao.`);
            }
            if (funcionariosDaSecao.length === 0 && quantidadeNova > 0) {
                errors.push('A secao selecionada nao possui funcionarios cadastrados para distribuicao.');
            }
            errors = errors.concat(validarTurnoSimples(novaEscala));
            if (errors.length > 0) {
                showInfoModal(errors, 'error');
                return;
            }
            if (modoEdicao.ativo) {
                dadosEscala[modoEdicao.index] = novaEscala;
            } else {
                dadosEscala.push(novaEscala);
            }
            dadosEscala.sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio));
            cancelarModoEdicao();
            renderizarTimelineCompleta('timeline-content');
            atualizarContadoresHome();
            fecharModalTurno();
        };
        const entrarModoEdicao = (index) => { modoEdicao.ativo = true; modoEdicao.index = index; const escala = dadosEscala[index]; if (secaoTurnoSelect) secaoTurnoSelect.value = escala.secaoId || ''; quantidadeInput.value = escala.quantidade; inicioEscalaInput.value = escala.inicio; fimEscalaInput.value = escala.fim; inicioIntervaloInput.value = escala.inicioIntervalo; fimIntervaloInput.value = escala.fimIntervalo; formTitle.textContent = "Editando Turno"; addEscalaBtn.textContent = "Salvar Alteracoes"; cancelEditBtn.classList.remove('hidden'); abrirModalTurno(); };
        const cancelarModoEdicao = () => { modoEdicao.ativo = false; modoEdicao.index = null; formContainer.reset(); if (secaoTurnoSelect) secaoTurnoSelect.value = ''; aplicarSecaoSelecionadaNoFormulario(); formTitle.textContent = "Adicionar Turno"; addEscalaBtn.textContent = "Adicionar"; cancelEditBtn.classList.add('hidden'); };        const popularSeletoresData = () => { const hoje = new Date(); const anoAtual = hoje.getFullYear(); const mesAtual = hoje.getMonth(); anoSelect.innerHTML = ''; for (let i = anoAtual - 5; i <= anoAtual + 5; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; if (i === anoAtual) option.selected = true; anoSelect.appendChild(option); } const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']; mesSelect.innerHTML = ''; nomesMeses.forEach((nome, index) => { const option = document.createElement('option'); option.value = index; option.textContent = nome; if (index === mesAtual) option.selected = true; mesSelect.appendChild(option); }); };
        
        const atualizarContagemEsqueleto = () => {
            const skeletonTable = document.getElementById('tabela-esqueleto');
            if (!skeletonTable) return;
            const ano = parseInt(anoSelect.value);
            const mes = parseInt(mesSelect.value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const bodyRows = skeletonTable.querySelectorAll('tbody tr');
            if(bodyRows.length === 0) return;

            bodyRows.forEach(row => {
                const dayCells = row.querySelectorAll('.escala-cell');
                const folgas = Array.from(dayCells).filter(cell => cell.textContent.toUpperCase() === 'F').length;
                const diasTrabalhados = diasNoMes - folgas;
                row.querySelector('.dias-trabalhados-cell').textContent = diasTrabalhados;
                row.querySelector('.folgas-cell').textContent = folgas;
            });

            for (let dia = 1; dia <= diasNoMes; dia++) {
                let folgasNoDia = 0;
                bodyRows.forEach(row => {
                    const cell = row.cells[dia]; 
                    if (cell && cell.textContent.toUpperCase() === 'F') {
                        folgasNoDia++;
                    }
                });
                const trabalhandoNoDia = bodyRows.length - folgasNoDia;

                const folgaCell = skeletonTable.querySelector(`tfoot [data-day-count-folga="${dia}"]`);
                const trabalhandoCell = skeletonTable.querySelector(`tfoot [data-day-count-trabalhando="${dia}"]`);
                if (folgaCell) folgaCell.textContent = folgasNoDia;
                if (trabalhandoCell) trabalhandoCell.textContent = trabalhandoNoDia;
            }

            let grandTotalTrabalhados = 0;
            let grandTotalFolgas = 0;

            skeletonTable.querySelectorAll('tbody .dias-trabalhados-cell').forEach(cell => {
                grandTotalTrabalhados += parseInt(cell.textContent || '0', 10);
            });

            skeletonTable.querySelectorAll('tbody .folgas-cell').forEach(cell => {
                grandTotalFolgas += parseInt(cell.textContent || '0', 10);
            });

            const grandTotalTrabalhadosCell = skeletonTable.querySelector('#grandTotalDiasTrabalhados');
            const grandTotalFolgasCell = skeletonTable.querySelector('#grandTotalFolgas');

            if (grandTotalTrabalhadosCell) {
                grandTotalTrabalhadosCell.textContent = grandTotalTrabalhados;
            }
            if (grandTotalFolgasCell) {
                grandTotalFolgasCell.textContent = grandTotalFolgas;
            }
        };

        const atribuirFuncionariosAosTurnos = () => {
            const usados = new Set();
            return colaboradorShifts.map((escala) => {
                const secaoId = Number(escala.secaoId || 0);
                const index = funcionariosLojaCache.findIndex((funcionario, funcionarioIndex) => {
                    return !usados.has(funcionarioIndex) && Number(funcionario.ESCSECAO_ID || 0) === secaoId;
                });

                if (index >= 0) {
                    usados.add(index);
                    return funcionariosLojaCache[index];
                }

                return null;
            });
        };

        const gerarTabelaEsqueleto = () => {
            colaboradorShifts = [];
            dadosEscala.forEach(escala => {
                for (let i = 0; i < parseInt(escala.quantidade || 0); i++) {
                    colaboradorShifts.push(JSON.parse(JSON.stringify(escala)));
                }
            });
            if (colaboradorShifts.length === 0) {
                tabelaEsqueletoContainer.innerHTML = `<p class="text-center text-gray-600 p-8">Adicione pelo menos um turno com colaboradores na tela principal para gerar a escala.</p>`;
                return;
            }
            const funcionariosAtribuidos = atribuirFuncionariosAosTurnos();
            const ano = parseInt(anoSelect.value);
            const mes = parseInt(mesSelect.value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const nomesMesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            let tableHtml = '<table id="tabela-esqueleto" class="w-full table-auto border-collapse"><thead><tr><th class="sticky left-0 bg-gray-100 z-10 w-48">Colaborador</th>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = new Date(ano, mes, dia);
                const diaSemana = data.getDay();
                tableHtml += `<th class="${diaSemana === 0 ? 'bg-yellow-200' : ''}"><div>${dia}-${nomesMesesAbrev[mes]}</div><div>${diasDaSemana[diaSemana]}</div></th>`;
            }
            tableHtml += '<th class="bg-gray-200">Dias Trab.</th><th class="bg-gray-200">Folgas</th></tr></thead><tbody>';
            colaboradorShifts.forEach((escala, index) => {
                const funcionario = funcionariosAtribuidos[index];
                const nomeBase = funcionario ? `${funcionario.NOME} (${funcionario.CHAPA})` : `Colaborador ${index + 1}`;
                const escfuncId = funcionario ? funcionario.ESCFUNC_ID : '';
                const chapa = funcionario ? funcionario.CHAPA : '';
                const escsecaoId = escala.secaoId || (funcionario ? funcionario.ESCSECAO_ID : '');
                const escfuncaoId = funcionario ? funcionario.ESCFUNCAO_ID : '';
                const selectedFuncionarioValue = funcionario ? getFuncionarioOptionValue(funcionario) : '';
                const funcionarioOptions = renderFuncionarioOptionsPorSecao(escala.secaoId, selectedFuncionarioValue);
                const placeholder = funcionarioOptions ? `Colaborador ${index + 1}` : 'Nenhum funcionario nesta secao';
                const horarios = ` ${escala.inicio} - ${escala.inicioIntervalo} - ${escala.fimIntervalo} - ${escala.fim}`;
                tableHtml += `<tr data-colab-index="${index}" data-turno-id="${escapeHtml(escala.turnoId || '')}" data-escfunc-id="${escapeHtml(escfuncId)}" data-chapa="${escapeHtml(chapa)}" data-escsecao-id="${escapeHtml(escsecaoId)}" data-escfuncao-id="${escapeHtml(escfuncaoId)}"><td data-name="${escapeHtml(nomeBase)}" class="sticky left-0 bg-white font-semibold z-10"><select class="collaborator-select" aria-label="Selecionar colaborador"><option value="">${escapeHtml(placeholder)}</option>${funcionarioOptions}</select><span class="collaborator-name-span hidden">${escapeHtml(nomeBase)}</span><span class="collaborator-time-span text-gray-500">${escapeHtml(horarios)}</span></td>`;
                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const data = new Date(ano, mes, dia);
                    tableHtml += `<td class="escala-cell ${data.getDay() === 0 ? 'bg-yellow-100' : ''}" data-dia="${dia}"></td>`;
                }
                tableHtml += '<td class="dias-trabalhados-cell"></td><td class="folgas-cell"></td></tr>';
            });
            tableHtml += '</tbody><tfoot>';
            let folgaRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Folgas</td>';
            let trabRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Trabalhando</td>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                folgaRow += `<td data-day-count-folga="${dia}">0</td>`;
                trabRow += `<td data-day-count-trabalhando="${dia}">0</td>`;
            }
            folgaRow += '<td></td><td></td></tr>';
            trabRow += '<td></td><td></td></tr>';
            
            let grandTotalRow = '<tr class="bg-gray-500 text-black font-bold"><td class="sticky left-0 bg-gray-500 z-10">TOTAL GERAL</td>';
            grandTotalRow += `<td colspan="${diasNoMes}"></td>`;
            grandTotalRow += '<td id="grandTotalDiasTrabalhados">0</td>';
            grandTotalRow += '<td id="grandTotalFolgas">0</td></tr>';

            tableHtml += folgaRow + trabRow + grandTotalRow + '</tfoot></table>';
            tabelaEsqueletoContainer.innerHTML = tableHtml;
            atualizarOpcoesFuncionariosEsqueleto();
            aplicarAusenciasNoEsqueleto();
            atualizarContagemEsqueleto();
        };
        
        const gerarEscalaDetalhada = () => { escalaCarregadaId = null; const skeletonRows = document.querySelectorAll('#tabela-esqueleto tbody tr'); if (skeletonRows.length === 0) { showInfoModal("Gere o esqueleto da escala primeiro.", "error"); return; } const ano = parseInt(anoSelect.value); const mes = parseInt(mesSelect.value); const diasNoMes = new Date(ano, mes + 1, 0).getDate(); const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; let allDetailsHtml = ''; skeletonRows.forEach(row => { const colabIndex = parseInt(row.dataset.colabIndex); const escfuncId = row.dataset.escfuncId || ''; const chapa = row.dataset.chapa || ''; const escsecaoId = row.dataset.escsecaoId || ''; const escfuncaoId = row.dataset.escfuncaoId || ''; const colaboradorNome = row.querySelector('td[data-name]').dataset.name; const escala = colaboradorShifts[colabIndex]; if (!escala) return; const folgas = new Set(); row.querySelectorAll('.escala-cell').forEach(cell => { if (cell.textContent.toUpperCase() === 'F') { folgas.add(parseInt(cell.dataset.dia)); } }); const intervaloMin = timeToMinutes(escala.fimIntervalo) - timeToMinutes(escala.inicioIntervalo); const hIntervalo = minutesToTime(intervaloMin); const hTrabalhadasMin = (timeToMinutes(escala.fim) - timeToMinutes(escala.inicio)) - intervaloMin; const hTrabalhadas = minutesToTime(hTrabalhadasMin); let detailTable = `<div class="colaborador-escala-detalhada" data-colab-index="${colabIndex}" data-escfunc-id="${escfuncId}" data-chapa="${chapa}" data-escsecao-id="${escsecaoId}" data-escfuncao-id="${escfuncaoId}" data-turno-id="${escala.turnoId || ''}"><div class="header-info"><h3 class="font-bold text-lg">${colaboradorNome}</h3><p class="print-aware-inline">Ciente: ___________________________________________</p></div><table class="w-full"><thead><tr class="bg-gray-50"><th>D.SEM</th>${Array.from({length: diasNoMes}, (_, i) => `<th>${diasDaSemana[new Date(ano, mes, i + 1).getDay()]}</th>`).join('')}</tr><tr class="bg-gray-50"><th>DIA</th>${Array.from({length: diasNoMes}, (_, i) => `<th data-day-col="${i + 1}"><button type="button" class="detailed-day-button detalhada-dia-edit" data-dia="${i + 1}">${i + 1}</button></th>`).join('')}</tr></thead><tbody>`; const fields = [ { label: 'ENT.', value: escala.inicio, key: 'inicio', editable: true }, { label: 'SAÍ.INT.', value: escala.inicioIntervalo, key: 'inicioIntervalo', editable: true }, { label: 'INTER.', value: hIntervalo, key: 'intervalo', editable: false }, { label: 'RET.INT.', value: escala.fimIntervalo, key: 'fimIntervalo', editable: true }, { label: 'SAÍ.', value: escala.fim, key: 'fim', editable: true }, { label: 'H.TRAB', value: hTrabalhadas, key: 'trabalhadas', bold: true, editable: false }, ]; fields.forEach(field => { detailTable += `<tr class="${field.bold ? 'font-bold bg-gray-50' : ''}" data-key="${field.key}"><td>${field.label}</td>`; for (let dia = 1; dia <= diasNoMes; dia++) { const isDomingo = new Date(ano, mes, dia).getDay() === 0; const isFolga = folgas.has(dia); const cellContent = isFolga ? 'F' : field.value; let bgColor = ''; if (isFolga) { bgColor = isDomingo ? 'bg-orange-500 text-white' : 'bg-red-100'; } else if (isDomingo) { bgColor = 'bg-yellow-100'; } detailTable += `<td class="${bgColor}">${cellContent}</td>`; } detailTable += `</tr>`; }); detailTable += `</tbody></table></div>`; allDetailsHtml += detailTable; }); detalhadaModalBody.innerHTML = allDetailsHtml; detalhadaMesAno.textContent = `${mesSelect.options[mesSelect.selectedIndex].text} / ${ano}`; if (detalhadaModal.classList.contains('hidden')) { detalhadaModal.classList.remove('hidden'); } detailedScaleHasBeenGenerated = true; gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada'; setSalvarEscalaDisponivel(false); limparCriticasDetalhada(); };
        
        // =========================================================================
        // FUNCAO DE IMPRESSAO DA TIMELINE (VERSAO CORRIGIDA E MELHORADA)
        // =========================================================================
        const imprimirTimelineMelhorado = (dataSource = dadosEscala, title = 'Relatorio de Linha do Tempo') => {
            window.EscalaPrintService.printTimeline({
                printContainer,
                dataSource,
                title,
                inicioTimeline: horaInicioTimelineInput.value,
                fimTimeline: horaFimTimelineInput.value,
                intervaloMarcacao: intervaloMarcacaoInput.value,
                timeToMinutes,
                minutesToTime,
                showInfoModal
            });
        };

        const prepareSkeletonForPrint = () => {
            const tableElement = document.getElementById('tabela-esqueleto');
            if (!tableElement) return;
            const month = mesSelect.options[mesSelect.selectedIndex].text;
            const year = anoSelect.value;
            window.EscalaPrintService.printElementList(printContainer, 'Esqueleto da Escala', month + ' / ' + year, [tableElement], 'print-skeleton-table');
        };

        const prepareDetailedForPrint = () => {
            const detailedElements = Array.from(detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada'));
            if (detailedElements.length === 0) return;
            const month = mesSelect.options[mesSelect.selectedIndex].text;
            const year = anoSelect.value;
            window.EscalaPrintService.printElementList(printContainer, 'Escala Detalhada', month + ' / ' + year, detailedElements);
        };
        
        // --- EVENTOS E ACOES PRINCIPAIS ---

        abrirModalEscalaBtn.addEventListener('click', () => {
            resetSkeletonModalState();
            esqueletoZoomLevel = 1.0;
            applyEsqueletoZoom();
            esqueletoModal.classList.remove('hidden');
            gerarTabelaEsqueleto();
        });

        const definirBloqueioDistribuicao = (bloqueada) => {
            distribuicaoFolgasBloqueada = !!bloqueada;
            distribuicaoEdicaoAtiva = false;
            const table = document.getElementById('tabela-esqueleto');
            table?.classList.toggle('is-readonly', distribuicaoFolgasBloqueada);
            table?.querySelectorAll('.collaborator-select').forEach(select => { select.disabled = distribuicaoFolgasBloqueada; });
            criacaoSecoesLista?.querySelectorAll('input[type="checkbox"]').forEach(input => { input.disabled = distribuicaoFolgasBloqueada; });
            document.querySelectorAll('#criacaoTimelineContent .delete-btn').forEach(button => { button.disabled = distribuicaoFolgasBloqueada; });
            if (gerarTimelineCriacaoBtn) gerarTimelineCriacaoBtn.disabled = distribuicaoFolgasBloqueada;
            if (autoDistribuirFolgasBtn) autoDistribuirFolgasBtn.disabled = distribuicaoFolgasBloqueada;
            gerarEscalaDetalhadaBtn?.classList.toggle('hidden', !distribuicaoFolgasBloqueada);
            editarDistribuicaoBtn?.classList.toggle('hidden', !distribuicaoFolgasBloqueada);
            if (editarDistribuicaoBtn) editarDistribuicaoBtn.innerHTML = '<span class="material-symbols-outlined align-middle text-base">edit</span> Editar';
            autoDistribuirFolgasBtn?.classList.remove('hidden');
            esqueletoModal?.classList.toggle('distribution-locked', distribuicaoFolgasBloqueada);
        };

        const liberarEdicaoDistribuicao = () => {
            distribuicaoFolgasBloqueada = false;
            distribuicaoEdicaoAtiva = true;
            const table = document.getElementById('tabela-esqueleto');
            table?.classList.remove('is-readonly');
            table?.querySelectorAll('.collaborator-select').forEach(select => { select.disabled = false; });
            criacaoSecoesLista?.querySelectorAll('input[type="checkbox"]').forEach(input => { input.disabled = false; });
            document.querySelectorAll('#criacaoTimelineContent .delete-btn').forEach(button => { button.disabled = false; });
            if (gerarTimelineCriacaoBtn) gerarTimelineCriacaoBtn.disabled = false;
            autoDistribuirFolgasBtn?.classList.add('hidden');
            if (editarDistribuicaoBtn) {
                editarDistribuicaoBtn.classList.remove('hidden');
                editarDistribuicaoBtn.innerHTML = '<span class="material-symbols-outlined align-middle text-base">save</span> Salvar';
            }
            gerarEscalaDetalhadaBtn?.classList.add('hidden');
            detailedScaleHasBeenGenerated = false;
            detalhadaModalBody.innerHTML = '';
            detalhadaModal.classList.add('hidden');
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            invalidarValidacaoDetalhada();
            showInfoModal('Edição liberada. Distribua novamente as folgas 5x2 antes de gerar a escala detalhada.', 'info');
        };

        const salvarEdicaoDistribuicao = () => {
            const semFuncionario = Array.from(document.querySelectorAll('#tabela-esqueleto tbody tr')).filter(row => !row.dataset.escfuncId || !row.dataset.chapa);
            if (semFuncionario.length) {
                showInfoModal('Selecione todos os funcionarios antes de salvar a distribuicao.', 'error');
                return;
            }
            definirBloqueioDistribuicao(true);
            gerarEscalaDetalhada();
            const errors = executarValidacaoDetalhada();
            if (errors.length) {
                showInfoModal(errors, 'error');
                return;
            }
            showInfoModal('Distribuicao salva e escala detalhada validada.', 'success');
        };

        editarDistribuicaoBtn?.addEventListener('click', () => {
            if (distribuicaoFolgasBloqueada && !distribuicaoEdicaoAtiva) {
                liberarEdicaoDistribuicao();
                return;
            }
            salvarEdicaoDistribuicao();
        });

        const resetSkeletonModalState = () => {
            escalaCarregadaParaVisualizacao = null;
            definirBloqueioDistribuicao(false);
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            const skeletonTable = document.getElementById('tabela-esqueleto');
            if (skeletonTable) skeletonTable.classList.remove('is-readonly');
            esqueletoModal.classList.add('hidden');
        };

        closeModalBtn.addEventListener('click', resetSkeletonModalState);

        gerarEscalaDetalhadaBtn.addEventListener('click', () => {
            if (escalaCarregadaParaVisualizacao) {
                carregarEscalaDetalhada(escalaCarregadaParaVisualizacao);
                resetSkeletonModalState();
            } else if (detailedScaleHasBeenGenerated) {
                detalhadaModal.classList.remove('hidden');
            } else {
                gerarEscalaDetalhada();
            }
        });

        closeDetalhadaModalBtn.addEventListener('click', () => { 
            detalhadaModal.classList.add('hidden'); 
            escalaCarregadaId = null;
            currentLoadedScale = null;
        });

        mesSelect.addEventListener('change', async () => {
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            await carregarAusenciasDaLoja(getLojaContextoEscala());
            gerarTabelaEsqueleto();
        });
        anoSelect.addEventListener('change', async () => {
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            await carregarAusenciasDaLoja(getLojaContextoEscala());
            gerarTabelaEsqueleto();
        });

        printBtn.addEventListener('click', () => imprimirTimelineMelhorado(dadosEscala, 'Linha do Tempo de Turnos'));
        imprimirEsqueletoBtn.addEventListener('click', prepareSkeletonForPrint);
        imprimirDetalhadaBtn.addEventListener('click', prepareDetailedForPrint);
        printTimelineVisualizerBtn.addEventListener('click', () => {
            const visualizerContent = document.getElementById('timeline-visualizer-content');
            const visualizerTitle = document.getElementById('timelineVisualizerTitle').textContent;
            const tempDataSource = JSON.parse(visualizerContent.dataset.source || '[]');
            imprimirTimelineMelhorado(tempDataSource, visualizerTitle);
        });
        
        
        visualizarTimelineBtn.addEventListener('click', () => {
            const visualizerContent = document.getElementById('timeline-visualizer-content');
            document.getElementById('timelineVisualizerTitle').textContent = `Visualização da Linha do Tempo`;
            renderizarTimelineCompleta('timeline-visualizer-content', dadosEscala);
            visualizerContent.dataset.source = JSON.stringify(dadosEscala); // Salva os dados para impressão
            timelineVisualizerModal.classList.remove('hidden');
        });
        closeTimelineVisualizerBtn.addEventListener('click', () => {
            timelineVisualizerModal.classList.add('hidden');
        });
        
        // --- LOGICA DE SINCRONIZACAO E VALIDACAO (ATUALIZADA) ---

        if (false) validarEscalaBtn.addEventListener('click', () => {
            let allErrors = [];
            const ausenciasAplicadas = aplicarAusenciasNaDetalhada();
            allErrors = allErrors.concat(validarDescansos());
            allErrors = allErrors.concat(validarDomingosDetalhada());
            allErrors = allErrors.concat(validarDiasConsecutivos());
            allErrors = allErrors.concat(validarJornada());
            
            if (allErrors.length > 0) {
                showInfoModal(allErrors, 'error');
            } else if (ausenciasAplicadas.length > 0) {
                showInfoModal(['Ausências aplicadas como folga obrigatória.', ...ausenciasAplicadas], 'success');
            } else {
                showInfoModal("A escala foi validada com sucesso. Nenhuma inconsistência encontrada.", 'success');
            }
        });
        
        const executarValidacaoDetalhada = async () => {
            let allErrors = [];
            const ausenciasAplicadas = aplicarAusenciasNaDetalhada();
            allErrors = allErrors.concat(validarDescansos());
            allErrors = allErrors.concat(validarDomingosDetalhada());
            allErrors = allErrors.concat(validarDiasConsecutivos());
            allErrors = allErrors.concat(validarJornada());
            const dados = parseEscalaFromModal();
            if (dados.length > 0) {
                const lojaId = Number(escalaRascunhoContexto?.loja || lojaEscalaSelect.value);
                const mes = Number(mesSelect.value);
                const ano = Number(anoSelect.value);
                const payload = montarPayloadBancoEscala({ id: Date.now(), lojaId, mes, ano, dados });
                try {
                    const backendValidation = await apiRequest('/api/escalas/validar', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                    allErrors = allErrors.concat(backendValidation.errors || []);
                } catch (error) {
                    allErrors.push(error.details ? error.details.join(' ') : error.message);
                }
            }
            allErrors = [...new Set(allErrors.filter(Boolean))];
            aplicarCriticasDetalhada(allErrors);
            setSalvarEscalaDisponivel(allErrors.length === 0);
            if (allErrors.length > 0) {
                showInfoModal(allErrors, 'error');
            } else if (ausenciasAplicadas.length > 0) {
                showInfoModal(['Ausencias aplicadas como folga obrigatoria.', ...ausenciasAplicadas], 'success');
            } else {
                showInfoModal('A escala foi validada com sucesso. Nenhuma inconsistencia encontrada.', 'success');
            }
            return allErrors;
        };

        validarEscalaBtn.addEventListener('click', async () => {
            validarEscalaBtn.disabled = true;
            try {
                await executarValidacaoDetalhada();
            } finally {
                validarEscalaBtn.disabled = false;
            }
        });

        const validarSequenciaParaTraz = (row, folgaIndex) => {
            const maxDias = getMaxDiasConsecutivos5x2();
            const nomeColab = row.querySelector('.collaborator-name-span').textContent;
            const dayCells = row.querySelectorAll('.escala-cell');
            let diasTrabalhadosConsecutivos = 0;

            for (let i = folgaIndex - 1; i >= 0; i--) {
                const cell = dayCells[i];
                if (cell.textContent.toUpperCase() !== 'F') {
                    diasTrabalhadosConsecutivos++;
                } else {
                    break;
                }
            }

            if (diasTrabalhadosConsecutivos > maxDias) {
                return `${nomeColab}: A sequência de ${diasTrabalhadosConsecutivos} dias de trabalho que termina antes desta folga excede o máximo de ${maxDias}.`;
            }

            return null;
        };
        
        const validarSequenciaDetalhadaParaTraz = (colabContainer, folgaIndex) => {
            const maxDias = getMaxDiasConsecutivos5x2();
            const nomeColab = colabContainer.querySelector('h3').textContent;
            const inicioRow = colabContainer.querySelector('tbody tr[data-key="inicio"]');
            if (!inicioRow) return null;

            const dayCells = inicioRow.querySelectorAll('td:not(:first-child)');
            let diasTrabalhadosConsecutivos = 0;

            for (let i = folgaIndex - 1; i >= 0; i--) {
                const cell = dayCells[i];
                if (cell.textContent.toUpperCase() !== 'F') {
                    diasTrabalhadosConsecutivos++;
                } else {
                    break;
                }
            }

            if (diasTrabalhadosConsecutivos > maxDias) {
                return `${nomeColab}: A sequência de ${diasTrabalhadosConsecutivos} dias de trabalho que termina antes desta folga excede o máximo de ${maxDias}.`;
            }
            return null;
        };

        const validarDescansos = () => {
            let errors = [];
            const descansoEntreTurnosRegra = timeToMinutes(regraDescansoEntreTurnosInput.value);
            const descansoPosFolgaRegra = hoursToMinutes(regraDescansoPosFolgaInput.value);
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');

            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                let ultimoTurno = null;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const entCell = colabDiv.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${dia + 1})`);
                    if (!entCell) break; 
                    
                    if (entCell.textContent.toUpperCase() !== 'F') {
                        const turnoAtual = {
                            dia: dia,
                            inicio: timeToMinutes(entCell.textContent),
                            fim: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="fim"] td:nth-child(${dia + 1})`).textContent)
                        };

                        if (ultimoTurno) {
                            const diasDeDiferenca = turnoAtual.dia - ultimoTurno.dia;
                            const descansoEmMinutos = (24 * 60 - ultimoTurno.fim) + turnoAtual.inicio + ((diasDeDiferenca - 1) * 24 * 60);
                            
                            if (diasDeDiferenca === 1 && descansoEmMinutos < descansoEntreTurnosRegra) {
                                errors.push(`${nomeColab}: Descanso de ${minutesToTime(descansoEmMinutos)} entre dias ${ultimoTurno.dia} e ${turnoAtual.dia} é menor que o mínimo de ${regraDescansoEntreTurnosInput.value}.`);
                            } else if (diasDeDiferenca > 1 && descansoEmMinutos < descansoPosFolgaRegra) {
                                const descansoEmHoras = Math.floor(descansoEmMinutos / 60);
                                const restoMinutos = descansoEmMinutos % 60;
                                errors.push(`${nomeColab}: Descanso de ${descansoEmHoras}h${restoMinutos}m após folga(s) (dias ${ultimoTurno.dia}-${turnoAtual.dia}) é menor que ${regraDescansoPosFolgaInput.value}h.`);
                            }
                        }
                        ultimoTurno = turnoAtual;
                    }
                }
            });
            return errors;
        };
        
        const validarJornada = () => {
            let errors = [];
            const jornadaPadraoMin = timeToMinutes(regraJornadaTrabalhoInput.value);
            const maxHoraExtraMin = timeToMinutes(regraMaxHoraExtraInput.value);
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');

            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const entCell = colabDiv.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${dia + 1})`);
                    if (!entCell || entCell.textContent.toUpperCase() === 'F') {
                        continue;
                    }

                    const turnoDoDia = {
                        inicio: timeToMinutes(entCell.textContent),
                        fim: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="fim"] td:nth-child(${dia + 1})`).textContent),
                        inicioIntervalo: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="inicioIntervalo"] td:nth-child(${dia + 1})`).textContent),
                        fimIntervalo: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="fimIntervalo"] td:nth-child(${dia + 1})`).textContent),
                    };

                    const duracaoIntervalo = turnoDoDia.fimIntervalo - turnoDoDia.inicioIntervalo;
                    const horasTrabalhadas = (turnoDoDia.fim - turnoDoDia.inicio) - (duracaoIntervalo > 0 ? duracaoIntervalo : 0);
                    const horaExtra = horasTrabalhadas - jornadaPadraoMin;

                    if (horaExtra > maxHoraExtraMin) {
                        errors.push(`${nomeColab} no dia ${dia}: Excedeu o máximo de horas extras. Realizado: ${minutesToTime(horaExtra)}, Máximo permitido: ${regraMaxHoraExtraInput.value}.`);
                    }
                }
            });
            return errors;
        };

        const validarDomingosDetalhada = () => {
            const errors = [];
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');
            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                const inicioRow = colabDiv.querySelector('tbody tr[data-key="inicio"]');
                if (!inicioRow) return;
                let ultimoDomingoTrabalhado = null;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;
                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const data = new Date(Number(anoSelect.value), Number(mesSelect.value), dia);
                    if (data.getDay() !== 0) continue;
                    const cell = inicioRow.cells[dia];
                    const trabalha = cell && cell.textContent.trim().toUpperCase() !== 'F';
                    if (!trabalha) continue;
                    if (ultimoDomingoTrabalhado && Math.round((data - ultimoDomingoTrabalhado) / 86400000) === 7) {
                        errors.push(`${nomeColab}: dois domingos trabalhados em sequencia (${ultimoDomingoTrabalhado.getDate()} e ${dia}).`);
                    }
                    ultimoDomingoTrabalhado = data;
                }
            });
            return errors;
        };

        const validarDiasConsecutivos = () => {
            let errors = [];
            const maxDias = getMaxDiasConsecutivos5x2();
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');

            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                let diasTrabalhadosConsecutivos = 0;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const entCell = colabDiv.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${dia + 1})`);
                    if (entCell && entCell.textContent.toUpperCase() !== 'F') {
                        diasTrabalhadosConsecutivos++;
                    } else {
                        if (diasTrabalhadosConsecutivos > maxDias) {
                            errors.push(`${nomeColab}: Sequência de ${diasTrabalhadosConsecutivos} dias de trabalho (terminando no dia ${dia - 1}) excede o máximo de ${maxDias}.`);
                        }
                        diasTrabalhadosConsecutivos = 0;
                    }
                }

                if (diasTrabalhadosConsecutivos > maxDias) {
                     errors.push(`${nomeColab}: Sequência de ${diasTrabalhadosConsecutivos} dias de trabalho (no final do mês) excede o máximo de ${maxDias}.`);
                }
            });
            return errors;
        };

        const atualizarDiaDetalhada = (colabDiv, dia, dadosDia) => {
            const rows = {
                inicio: colabDiv.querySelector('tbody tr[data-key="inicio"]'),
                inicioIntervalo: colabDiv.querySelector('tbody tr[data-key="inicioIntervalo"]'),
                intervalo: colabDiv.querySelector('tbody tr[data-key="intervalo"]'),
                fimIntervalo: colabDiv.querySelector('tbody tr[data-key="fimIntervalo"]'),
                fim: colabDiv.querySelector('tbody tr[data-key="fim"]'),
                trabalhadas: colabDiv.querySelector('tbody tr[data-key="trabalhadas"]')
            };
            const isDomingo = new Date(Number(anoSelect.value), Number(mesSelect.value), dia).getDay() === 0;
            const setCell = (row, value, descanso) => {
                const cell = row?.cells[dia];
                if (!cell) return;
                cell.textContent = value;
                cell.classList.remove('bg-red-100', 'bg-orange-500', 'bg-yellow-100', 'text-white');
                if (descanso) cell.classList.add(isDomingo ? 'bg-orange-500' : 'bg-red-100');
                if (descanso && isDomingo) cell.classList.add('text-white');
                if (!descanso && isDomingo) cell.classList.add('bg-yellow-100');
            };
            if (dadosDia.tipo === 'DESCANSO') {
                ['inicio', 'inicioIntervalo', 'intervalo', 'fimIntervalo', 'fim', 'trabalhadas'].forEach(key => setCell(rows[key], dadosDia.sigla, true));
                return;
            }
            const intervalo = timeToMinutes(dadosDia.HR_ENT2) - timeToMinutes(dadosDia.HR_SAI1);
            const trabalhadas = (timeToMinutes(dadosDia.HR_SAI2) - timeToMinutes(dadosDia.HR_ENT1)) - intervalo;
            setCell(rows.inicio, dadosDia.HR_ENT1, false);
            setCell(rows.inicioIntervalo, dadosDia.HR_SAI1, false);
            setCell(rows.intervalo, minutesToTime(intervalo), false);
            setCell(rows.fimIntervalo, dadosDia.HR_ENT2, false);
            setCell(rows.fim, dadosDia.HR_SAI2, false);
            setCell(rows.trabalhadas, minutesToTime(trabalhadas), false);
        };

        const abrirModalEdicaoDiaDetalhada = async (colabDiv, dia) => {
            if (isDiaMesBloqueadoParaEdicao(anoSelect.value, mesSelect.value, dia)) {
                showInfoModal('Dias ja passados nao podem ser alterados manualmente.', 'info');
                return;
            }
            const inicioCell = colabDiv.querySelector('tbody tr[data-key="inicio"]')?.cells[dia];
            if (!inicioCell) return;
            const descansoAtual = !/^\d{2}:\d{2}$/.test(inicioCell.textContent.trim());
            const values = await abrirModalEdicaoDiaPadrao({
                title: 'Editar dia ' + dia,
                ids: { tipoDia: 'DET_TIPO_DIA', descanso: 'DET_DESCANSO', hrEnt1: 'DET_HR_ENT1', hrSai1: 'DET_HR_SAI1', hrEnt2: 'DET_HR_ENT2', hrSai2: 'DET_HR_SAI2', justificativa: 'DET_JUSTIFICATIVA' },
                dia: {
                    HR_ENT1: inicioCell.textContent.trim(),
                    HR_SAI1: colabDiv.querySelector('tbody tr[data-key="inicioIntervalo"]')?.cells[dia]?.textContent.trim(),
                    HR_ENT2: colabDiv.querySelector('tbody tr[data-key="fimIntervalo"]')?.cells[dia]?.textContent.trim(),
                    HR_SAI2: colabDiv.querySelector('tbody tr[data-key="fim"]')?.cells[dia]?.textContent.trim()
                },
                descansoAtual,
                panelClass: 'bg-white rounded-lg shadow-xl w-11/12 max-w-5xl flex flex-col employee-day-modal'
            });
            if (!values) return;
            const diasParaAtualizar = values.REPLICAR_MES
                ? Array.from({ length: new Date(Number(anoSelect.value), Number(mesSelect.value) + 1, 0).getDate() }, (_, index) => index + 1)
                    .filter((numeroDia) => {
                        if (isDiaMesBloqueadoParaEdicao(anoSelect.value, mesSelect.value, numeroDia)) return false;
                        const cell = colabDiv.querySelector('tbody tr[data-key="inicio"]')?.cells[numeroDia];
                        if (!cell) return false;
                        return numeroDia === dia || /^\d{2}:\d{2}$/.test(cell.textContent.trim());
                    })
                : [dia];
            if (values.DET_TIPO_DIA === 'DESCANSO') {
                diasParaAtualizar.forEach((numeroDia) => atualizarDiaDetalhada(colabDiv, numeroDia, { tipo: 'DESCANSO', sigla: String(values.DET_DESCANSO || 'F').toUpperCase() }));
            } else {
                const turno = { HR_ENT1: values.DET_HR_ENT1, HR_SAI1: values.DET_HR_SAI1, HR_ENT2: values.DET_HR_ENT2, HR_SAI2: values.DET_HR_SAI2 };
                diasParaAtualizar.forEach((numeroDia) => atualizarDiaDetalhada(colabDiv, numeroDia, { tipo: 'TRABALHO', ...turno }));
            }
            invalidarValidacaoDetalhada();
            registrarCriticasColaborador(colabDiv, ['Ajuste manual pendente de Validar Escala.']);
        };


        // --- LOGICA DE EDICAO, SELECAO E COPIAR/COLAR ---

        detalhadaModalBody.addEventListener('click', (event) => {
            const criticalChip = event.target.closest('.critical-status-chip');
            if (criticalChip) {
                const colabDiv = criticalChip.closest('.colaborador-escala-detalhada');
                const criticas = JSON.parse(colabDiv?.dataset.criticas || '[]');
                showInfoModal(criticas.length ? criticas : 'Nenhuma critica pendente.', criticas.length ? 'error' : 'info');
                return;
            }
            const dayButton = event.target.closest('.detalhada-dia-edit');
            if (!dayButton) return;
            const colabDiv = dayButton.closest('.colaborador-escala-detalhada');
            abrirModalEdicaoDiaDetalhada(colabDiv, Number(dayButton.dataset.dia)).catch(error => showInfoModal(error.message, 'error'));
        });

        tabelaEsqueletoContainer.addEventListener('change', (e) => {
            if (!e.target.classList.contains('collaborator-select')) return;

            const select = e.target;
            const row = select.closest('tr[data-colab-index]');
            const nameCell = row?.querySelector('td[data-name]');
            const selectedOption = select.selectedOptions[0];
            const nomeSelecionado = selectedOption?.dataset.name || selectedOption?.textContent || `Colaborador ${Number(row?.dataset.colabIndex || 0) + 1}`;

            if (!row || !nameCell) return;

            const secaoDaLinha = row.dataset.escsecaoId || colaboradorShifts[Number(row.dataset.colabIndex || 0)]?.secaoId || '';
            const secaoSelecionada = selectedOption?.dataset.escsecaoId || '';
            if (select.value && String(secaoDaLinha) !== String(secaoSelecionada)) {
                select.value = '';
                showInfoModal('Selecione um funcionario da mesma secao do turno.', 'error');
                return;
            }

            row.dataset.escfuncId = selectedOption?.dataset.escfuncId || '';
            row.dataset.chapa = selectedOption?.dataset.chapa || '';
            row.dataset.escsecaoId = secaoDaLinha;
            row.dataset.escfuncaoId = selectedOption?.dataset.escfuncaoId || '';
            nameCell.dataset.name = nomeSelecionado;
            const hiddenName = nameCell.querySelector('.collaborator-name-span');
            if (hiddenName) hiddenName.textContent = nomeSelecionado;

            const detailedH3 = document.querySelector(`.colaborador-escala-detalhada[data-colab-index="${row.dataset.colabIndex}"] h3`);
            if (detailedH3) {
                detailedH3.textContent = nomeSelecionado;
                const detailedContainer = detailedH3.closest('.colaborador-escala-detalhada');
                if (detailedContainer) {
                    detailedContainer.dataset.escfuncId = row.dataset.escfuncId;
                    detailedContainer.dataset.chapa = row.dataset.chapa;
                    detailedContainer.dataset.escsecaoId = row.dataset.escsecaoId;
                    detailedContainer.dataset.escfuncaoId = row.dataset.escfuncaoId;
                }
            }

            atualizarOpcoesFuncionariosEsqueleto();
            limparAusenciasObrigatoriasDoEsqueleto();
            aplicarAusenciasNoEsqueleto();
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            detalhadaModalBody.innerHTML = '';
        });

        tabelaEsqueletoContainer.addEventListener('click', (e) => { 
            const table = e.target.closest('#tabela-esqueleto');
            if (table && table.classList.contains('is-readonly')) {
                return;
            }

            if (e.target.classList.contains('escala-cell')) {
                const cell = e.target;
                if (cell.dataset.ausenciaObrigatoria === '1') {
                    showInfoModal(cell.title || 'Este dia possui ausência cadastrada e deve permanecer como folga.', 'info');
                    return;
                }
                const row = cell.parentElement;
                const colabIndex = row.dataset.colabIndex;
                
                const dayCells = Array.from(row.querySelectorAll('.escala-cell'));
                const clickedCellIndex = dayCells.indexOf(cell);
                
                const isFolgaPrevia = cell.textContent.toUpperCase() === 'F';
                const isSunday = new Date(anoSelect.value, mesSelect.value, clickedCellIndex + 1).getDay() === 0;

                cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');

                if (isFolgaPrevia) {
                    cell.textContent = '';
                    if(isSunday) cell.classList.add('bg-yellow-100');
                } else {
                    cell.textContent = 'F';
                    if(isSunday) {
                        cell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                    } else {
                        cell.classList.add('bg-red-300', 'text-white', 'font-bold');
                    }
                }
                
                if (detailedScaleHasBeenGenerated) {
                    const detailedContainer = document.querySelector(`.colaborador-escala-detalhada[data-colab-index="${colabIndex}"]`);
                    if(detailedContainer) {
                        const detailedRows = detailedContainer.querySelectorAll('tbody tr');
                        const isAgoraFolga = cell.textContent.toUpperCase() === 'F';
                        const cellIndexInTable = cell.cellIndex;
                        
                        if(isAgoraFolga) {
                             detailedRows.forEach(dRow => {
                                const dCell = dRow.cells[cellIndexInTable];
                                if(dCell) {
                                    dCell.textContent = 'F';
                                    dCell.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                                    if(isSunday) {
                                        dCell.classList.add('bg-orange-500', 'text-white');
                                    } else {
                                        dCell.classList.add('bg-red-100');
                                    }
                                }
                            });
                        } else {
                            const originalShift = colaboradorShifts[colabIndex];
                             const hIntervaloMin = timeToMinutes(originalShift.fimIntervalo) - timeToMinutes(originalShift.inicioIntervalo);
                            const hTrabalhadasMin = (timeToMinutes(originalShift.fim) - timeToMinutes(originalShift.inicio)) - hIntervaloMin;

                            const restoredValues = {
                                'inicio': originalShift.inicio,
                                'inicioIntervalo': originalShift.inicioIntervalo,
                                'intervalo': minutesToTime(hIntervaloMin > 0 ? hIntervaloMin : 0),
                                'fimIntervalo': originalShift.fimIntervalo,
                                'fim': originalShift.fim,
                                'trabalhadas': minutesToTime(hTrabalhadasMin > 0 ? hTrabalhadasMin : 0)
                            };

                            detailedRows.forEach(dRow => {
                                const dCell = dRow.cells[cellIndexInTable];
                                const key = dRow.dataset.key;
                                if(dCell) {
                                    dCell.textContent = restoredValues[key];
                                    dCell.classList.remove('bg-red-100', 'bg-orange-500', 'text-white');
                                    if (isSunday) {
                                        dCell.classList.add('bg-yellow-100');
                                    }
                                }
                            });
                        }
                    }
                }
                atualizarContagemEsqueleto();
                
                if (!isFolgaPrevia) {
                    const errorMessage = validarSequenciaParaTraz(row, clickedCellIndex);
                    if (errorMessage) {
                        setTimeout(() => showInfoModal([errorMessage], 'error'), 100);
                    }
                }
            }
        });

        tabelaEsqueletoContainer.addEventListener('blur', (e) => {
            const table = e.target.closest('#tabela-esqueleto');
            if (table && table.classList.contains('is-readonly')) {
                return;
            }

            if (e.target.matches('.collaborator-name-span')) {
                const nameSpan = e.target;
                const nameCell = nameSpan.parentElement;
                const newName = nameSpan.textContent.trim();
                nameCell.dataset.name = newName;
                
                if (detailedScaleHasBeenGenerated) {
                    const colabIndex = nameCell.parentElement.dataset.colabIndex;
                    const detailedH3 = document.querySelector(`.colaborador-escala-detalhada[data-colab-index="${colabIndex}"] h3`);
                    if(detailedH3) {
                        detailedH3.textContent = newName;
                    }
                }
            }
        }, true);

        abrirTurnoModalBtn?.addEventListener('click', abrirModalTurno);
        closeTurnoModalBtn?.addEventListener('click', () => {
            cancelarModoEdicao();
            fecharModalTurno();
        });
        turnoModal?.addEventListener('click', (event) => {
            if (event.target === turnoModal) {
                cancelarModoEdicao();
                fecharModalTurno();
            }
        });
        addEscalaBtn.addEventListener('click', manipularEnvioFormulario);
        secaoTurnoSelect?.addEventListener('change', aplicarSecaoSelecionadaNoFormulario);
        const recarregarEscalasComFiltro = async () => {
            await consultarEscalasBancoLocal().catch(error => showInfoModal(error.message, 'error'));
        };
        escalasFiltroLoja?.addEventListener('change', recarregarEscalasComFiltro);
        escalasFiltroMes?.addEventListener('change', recarregarEscalasComFiltro);
        escalasFiltroAno?.addEventListener('change', recarregarEscalasComFiltro);
        escalasFiltroStatus?.addEventListener('change', recarregarEscalasComFiltro);
        escalasPesquisaInput?.addEventListener('input', () => {
            clearTimeout(escalasPesquisaInput._filterTimer);
            escalasPesquisaInput._filterTimer = setTimeout(() => consultarEscalasBancoLocal().catch(error => showInfoModal(error.message, 'error')), 180);
        });

        cancelEditBtn.addEventListener('click', () => {
            cancelarModoEdicao();
            fecharModalTurno();
        });
        carregarFuncionariosBtn.addEventListener('click', () => carregarFuncionariosDaLoja(false));
        lojaEscalaSelect.addEventListener('change', async () => {
            try {
                funcionariosLojaSelect.value = lojaEscalaSelect.value;
                if (homeLojaSelect) homeLojaSelect.value = lojaEscalaSelect.value;
                if (secoesLojaSelect) secoesLojaSelect.value = lojaEscalaSelect.value;
                if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = lojaEscalaSelect.value;
                await carregarSecoesDaLoja(true);
                await carregarTurnosSecaoDaLoja(true);
                await carregarFuncionariosDaLoja(true);
                if (!funcionariosPage.classList.contains('hidden')) {
                    await carregarFuncionariosTela();
                }
                if (!secoesPage.classList.contains('hidden')) {
                    await carregarSecoesTela(false);
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        funcionariosLojaSelect.addEventListener('change', async () => {
            try {
                await carregarFuncionariosTela(false);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        homeLojaSelect?.addEventListener('change', async () => {
            lojaEscalaSelect.value = homeLojaSelect.value;
            funcionariosLojaSelect.value = homeLojaSelect.value;
            if (secoesLojaSelect) secoesLojaSelect.value = homeLojaSelect.value;
            if (secaoFormLoja) secaoFormLoja.value = homeLojaSelect.value;
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = homeLojaSelect.value;
            await carregarSecoesDaLoja(true);
            await carregarTurnosSecaoDaLoja(true);
            await carregarFuncionariosDaLoja(true);
        });
        secoesLojaSelect?.addEventListener('change', async () => {
            await carregarSecoesTela(false);
        });
        secaoFormLoja?.addEventListener('change', async () => {
            const loja = secaoFormLoja.value;
            lojaEscalaSelect.value = loja;
            funcionariosLojaSelect.value = loja;
            if (homeLojaSelect) homeLojaSelect.value = loja;
            if (secoesLojaSelect) secoesLojaSelect.value = loja;
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = loja;
            secaoFormId.value = '';
            secaoFormCodigo.value = '';
            await carregarSecoesDaLoja(true);
            popularSelectSecaoFormulario('');
        });
        turnosSecaoLojaSelect?.addEventListener('change', async () => {
            await carregarTurnosSecaoTela(false);
        });
        secaoFormDescr?.addEventListener('change', () => aplicarSecaoSelecionadaNoCadastro());
        carregarFuncionariosTelaBtn?.addEventListener('click', async () => {
            try {
                await carregarFuncionariosTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        carregarSecoesBtn?.addEventListener('click', async () => {
            try {
                await carregarSecoesTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        carregarAcessosBtn.addEventListener('click', async () => {
            try {
                await carregarAcessosTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        acessosPesquisaInput?.addEventListener('input', () => {
            clearTimeout(acessosPesquisaTimeout);
            acessosPesquisaTimeout = setTimeout(() => {
                carregarAcessosTela(false, 1).catch(error => showInfoModal(error.message, 'error'));
            }, 350);
        });
        acessosPageSizeSelect?.addEventListener('change', () => {
            carregarAcessosTela(false, 1).catch(error => showInfoModal(error.message, 'error'));
        });
        acessosPaginaAnteriorBtn?.addEventListener('click', () => {
            carregarAcessosTela(false, Math.max(1, acessosPaginationState.page - 1)).catch(error => showInfoModal(error.message, 'error'));
        });
        acessosProximaPaginaBtn?.addEventListener('click', () => {
            carregarAcessosTela(false, Math.min(acessosPaginationState.totalPages, acessosPaginationState.page + 1)).catch(error => showInfoModal(error.message, 'error'));
        });
        const getPerfilAcessoOptions = async (selected = '') => {
            if (!perfisAcessoCache.length) await carregarPerfisAcesso();
            const ativos = perfisAcessoCache.filter(perfil => perfil.STATUS !== 'I' || String(perfil.NOME) === String(selected));
            return ativos.map(perfil => ({ value: perfil.NOME, label: perfil.NOME + (perfil.STATUS === 'I' ? ' (Inativo)' : '') }));
        };

        const getLojasPermitidasOptions = (selected = []) => {
            const selecionadas = new Set((selected || []).map(String));
            return lojasPermitidasCache.map(loja => ({ value: String(loja), label: 'Loja ' + loja, checked: selecionadas.has(String(loja)) }));
        };

        const popularLojasLiberacaoSecoes = () => {
            if (!liberacaoSecoesLojaSelect) return;
            const atual = liberacaoSecoesLojaSelect.value;
            liberacaoSecoesLojaSelect.innerHTML = lojasPermitidasCache
                .map(loja => `<option value="${escapeHtml(loja)}">Loja ${escapeHtml(loja)}</option>`)
                .join('');
            if (atual && lojasPermitidasCache.includes(Number(atual))) {
                liberacaoSecoesLojaSelect.value = atual;
            } else if (lojasPermitidasCache.length) {
                liberacaoSecoesLojaSelect.value = String(lojasPermitidasCache[0]);
            }
        };

        carregarAcessosBtn.parentElement.addEventListener('click', async (event) => {
            if (event.target.closest('#novoUsuarioBtn')) {
                try {
                    const perfilOptions = await getPerfilAcessoOptions('OPERADOR');
                    const lojaInicial = lojasPermitidasCache.length === 1 ? [String(lojasPermitidasCache[0])] : [];
                    const values = await showInputModal({
                        title: 'Novo Usuário',
                        inputs: [
                            { label: 'Login', type: 'text', id: 'LOGIN', required: true },
                            { label: 'Nome', type: 'text', id: 'NOME', required: true },
                            { label: 'Senha inicial', type: 'password', id: 'PASSWORD', required: true },
                            { label: 'Perfil de Acesso', type: 'select', id: 'PERFIL', value: perfilOptions[0]?.value || 'OPERADOR', options: perfilOptions, required: true },
                            { label: 'Lojas permitidas', type: 'checkbox-group', id: 'LOJAS', value: lojaInicial, options: getLojasPermitidasOptions(lojaInicial), required: true }
                        ],
                        confirmText: 'Criar'
                    });
                    if (!values) return;
                    await apiRequest('/api/acessos/usuarios', {
                        method: 'POST',
                        body: JSON.stringify({
                            LOGIN: values.LOGIN,
                            NOME: values.NOME,
                            PASSWORD: values.PASSWORD,
                            PERFIL: values.PERFIL,
                            LOJAS: (values.LOJAS || []).map(loja => Number(loja)).filter(Boolean)
                        })
                    });
                    await carregarAcessosTela(false);
                    showInfoModal('Usuário criado com sucesso.', 'success');
                } catch (error) {
                    showInfoModal(error.message, 'error');
                }
            }
        });
        
        // --- L?GICA DE SALVAR/CARREGAR/DELETAR ---
        const salvarEscalaBtn = document.getElementById('salvarEscalaBtn');
        const tabelaRegistrosBody = document.getElementById('tabela-registros-body');
        let escalasSalvasCache = [];
        let escalaConfigCache = {};
        let escalaRascunhoAtivo = false;
        let escalaRascunhoContexto = null;
        const getLojaContextoEscala = () => String(escalaRascunhoContexto?.loja || lojaEscalaSelect?.value || '');

        const apiRequest = window.EscalaApi.request.bind(window.EscalaApi);
        const formatApiError = (error) => {
            if (Array.isArray(error?.details)) return error.details.join(' ');
            if (Array.isArray(error?.details?.errors)) return error.details.errors.join(' ');
            return error?.message || 'Erro na comunicação com o servidor.';
        };
        const getApiErrorMessages = (error) => {
            if (Array.isArray(error?.details) && error.details.length) return error.details;
            if (Array.isArray(error?.details?.errors) && error.details.errors.length) return error.details.errors;
            return [error?.message || 'Erro na comunicação com o servidor.'];
        };
        let appVersionAtual = null;
        const verificarVersaoApp = async () => {
            try {
                const data = await apiRequest('/api/app-version', { timeoutMs: 8000 });
                const version = String(data?.version || '');
                if (!version) return;
                if (!appVersionAtual) {
                    appVersionAtual = version;
                    return;
                }
                if (appVersionAtual !== version) {
                    window.location.reload();
                }
            } catch (error) {
                // A verificacao e silenciosa para nao atrapalhar o trabalho do usuario.
            }
        };
        verificarVersaoApp();
        setInterval(verificarVersaoApp, 60000);
        const carregarUsuarioSessao = async () => {
            const data = await apiRequest('/api/auth/me');
            const user = data.user || {};
            usuarioSessaoCache = user;
            lojaPrincipalCache = user.lojaPrincipal ? String(user.lojaPrincipal) : lojaPrincipalCache;
            window.EscalaPermissions?.setUser(user);
            applyPermissionBindings();
            if (goToTimelineBtn) goToTimelineBtn.classList.toggle('hidden', !canCreateEscalaSessao());
            const lojas = Array.isArray(user.lojas) ? user.lojas : [];

            if (loggedUserName) {
                loggedUserName.textContent = user.nome || user.login || 'Usuário';
            }

            if (loggedUserInitials) {
                const nome = String(user.nome || user.login || 'Usuário').trim();
                const partes = nome.split(/\s+/).filter(Boolean);
                loggedUserInitials.textContent = ((partes[0]?.[0] || 'U') + (partes.length > 1 ? partes[partes.length - 1][0] : partes[0]?.[1] || 'S')).toUpperCase();
            }

            if (loggedUserRole) loggedUserRole.textContent = user.perfil === 'ADMIN' ? 'Admin' : (user.perfil || 'Usuário');

            atualizarBadgeLojaPrincipal();
        };

        const configurarAcoesAdmin = () => {
            if (!hasPermission('acessos', 'criar') || novoUsuarioBtn) return;

            novoUsuarioBtn = document.createElement('button');
            novoUsuarioBtn.type = 'button';
            novoUsuarioBtn.id = 'novoUsuarioBtn';
            novoUsuarioBtn.className = 'action-button';
            novoUsuarioBtn.dataset.permissionPage = 'acessos';
            novoUsuarioBtn.dataset.permissionAction = 'criar';
            novoUsuarioBtn.innerHTML = '<span class="material-symbols-outlined">person_add</span>Novo Usuário';
            carregarAcessosBtn.parentElement.appendChild(novoUsuarioBtn);
            window.EscalaPermissions?.applyDocument(novoUsuarioBtn.parentElement);
        };

        logoutAppBtn?.addEventListener('click', async () => {
            try {
                await apiRequest('/api/auth/logout', { method: 'POST' });
            } finally {
                window.location.href = '/';
            }
        });

        sidebarToggleBtn?.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-mobile-open');
        });

        document.querySelector('.sidebar')?.addEventListener('click', (event) => {
            if (!event.target.closest('a')) return;
            document.body.classList.remove('sidebar-mobile-open');
        });

        loggedUserStores?.addEventListener('click', async () => {
            if (lojasPermitidasCache.length <= 1) return;
            const atual = getLojaPrincipal();
            const values = await showInputModal({
                title: 'Loja principal',
                inputs: [
                    { type: 'message', text: 'Selecione a loja usada como padrão ao abrir telas com filtro de loja.' },
                    {
                        label: 'Loja principal',
                        type: 'select',
                        id: 'loja-principal',
                        value: atual,
                        options: lojasPermitidasCache.map((loja) => ({ value: String(loja), label: 'Loja ' + loja })),
                        required: true
                    }
                ],
                cancelText: 'Cancelar',
                confirmText: 'Salvar'
            });
            if (!values) return;
            const loja = setLojaPrincipal(values['loja-principal']);
            if (!loja) return;
            try {
                const data = await apiRequest('/api/auth/me/loja-principal', {
                    method: 'PATCH',
                    body: JSON.stringify({ lojaPrincipal: Number(loja) })
                });
                usuarioSessaoCache = data.user || usuarioSessaoCache;
                lojaPrincipalCache = String(usuarioSessaoCache?.lojaPrincipal || loja);
                window.EscalaPermissions?.setUser(usuarioSessaoCache);
            } catch (error) {
                if (Number(error.status) !== 501) {
                    showInfoModal(error.message, 'error');
                    return;
                }
            }
            [lojaEscalaSelect, funcionariosLojaSelect, homeLojaSelect, escalasFiltroLoja, secoesLojaSelect, secaoFormLoja, turnosSecaoLojaSelect, escalaFuncionarioLoja, historicoLojaSelect, liberacaoSecoesLojaSelect]
                .forEach((select) => {
                    if (select && Array.from(select.options || []).some((option) => option.value === loja)) select.value = loja;
                });
            atualizarBadgeLojaPrincipal();
            handleHashNavigation();
        });

        const carregarEstadoServidor = async () => {
            const state = await apiRequest('/api/state');
            escalasSalvasCache = Array.isArray(state.escalasSalvas) ? state.escalasSalvas : [];
            escalaConfigCache = state.escalaConfig || {};
        };

        const salvarConfigNoServidor = async (settings) => {
            escalaConfigCache = settings || {};
            await apiRequest('/api/state/config', {
                method: 'PUT',
                body: JSON.stringify({ escalaConfig: escalaConfigCache })
            });
        };

        const carregarLojasEscala = async () => {
            const data = await apiRequest('/api/catalog/lojas');
            const lojas = data.lojas || [];
            const lojaAtual = lojaEscalaSelect.value || funcionariosLojaSelect.value || escalasFiltroLoja?.value;
            lojasPermitidasCache = lojas.map(loja => Number(getLojaCodigo(loja))).filter(Boolean);
            lojaEscalaSelect.innerHTML = '';
            funcionariosLojaSelect.innerHTML = '';
            if (homeLojaSelect) homeLojaSelect.innerHTML = '';
            if (escalasFiltroLoja) escalasFiltroLoja.innerHTML = '';
            if (secoesLojaSelect) secoesLojaSelect.innerHTML = '';
            if (secaoFormLoja) secaoFormLoja.innerHTML = '';
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.innerHTML = '';
            if (escalaFuncionarioLoja) escalaFuncionarioLoja.innerHTML = '';
            if (historicoLojaSelect) historicoLojaSelect.innerHTML = '';
            if (liberacaoSecoesLojaSelect) liberacaoSecoesLojaSelect.innerHTML = '';

            if (lojas.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhuma loja permitida';
                lojaEscalaSelect.appendChild(option);
                funcionariosLojaSelect.appendChild(option.cloneNode(true));
                homeLojaSelect?.appendChild(option.cloneNode(true));
                escalasFiltroLoja?.appendChild(option.cloneNode(true));
                secoesLojaSelect?.appendChild(option.cloneNode(true));
                secaoFormLoja?.appendChild(option.cloneNode(true));
                turnosSecaoLojaSelect?.appendChild(option.cloneNode(true));
                liberacaoSecoesLojaSelect?.appendChild(option.cloneNode(true));
                lojaEscalaSelect.disabled = true;
                funcionariosLojaSelect.disabled = true;
                if (homeLojaSelect) homeLojaSelect.disabled = true;
                if (escalasFiltroLoja) escalasFiltroLoja.disabled = true;
                if (secoesLojaSelect) secoesLojaSelect.disabled = true;
                if (secaoFormLoja) secaoFormLoja.disabled = true;
                if (liberacaoSecoesLojaSelect) liberacaoSecoesLojaSelect.disabled = true;
                carregarFuncionariosBtn.disabled = true;
                if (carregarFuncionariosTelaBtn) carregarFuncionariosTelaBtn.disabled = true;
                funcionariosStatus.textContent = 'Usuario sem loja permitida';
                return [];
            }

            lojaEscalaSelect.disabled = false;
            funcionariosLojaSelect.disabled = false;
            if (homeLojaSelect) homeLojaSelect.disabled = false;
            if (escalasFiltroLoja) escalasFiltroLoja.disabled = false;
            if (secoesLojaSelect) secoesLojaSelect.disabled = false;
            if (secaoFormLoja) secaoFormLoja.disabled = false;
            if (historicoLojaSelect) historicoLojaSelect.disabled = false;
            if (liberacaoSecoesLojaSelect) liberacaoSecoesLojaSelect.disabled = false;
            carregarFuncionariosBtn.disabled = false;
            if (carregarFuncionariosTelaBtn) carregarFuncionariosTelaBtn.disabled = false;

            [funcionariosLojaSelect, secoesLojaSelect, turnosSecaoLojaSelect, escalaFuncionarioLoja, historicoLojaSelect].forEach(select => {
                if (!select) return;
                const option = document.createElement('option');
                option.value = 'all';
                option.textContent = 'Todas as lojas';
                select.appendChild(option);
            });

            if (escalasFiltroLoja) {
                const todasOption = document.createElement('option');
                todasOption.value = 'all';
                todasOption.textContent = 'Todas as lojas';
                escalasFiltroLoja.appendChild(todasOption);
            }

            lojas.forEach(loja => {
                const lojaCodigo = getLojaCodigo(loja);
                const option = document.createElement('option');
                option.value = lojaCodigo;
                option.textContent = `Loja ${lojaCodigo}`;
                lojaEscalaSelect.appendChild(option);
                funcionariosLojaSelect.appendChild(option.cloneNode(true));
                homeLojaSelect?.appendChild(option.cloneNode(true));
                escalasFiltroLoja?.appendChild(option.cloneNode(true));
                secoesLojaSelect?.appendChild(option.cloneNode(true));
                secaoFormLoja?.appendChild(option.cloneNode(true));
                turnosSecaoLojaSelect?.appendChild(option.cloneNode(true));
                escalaFuncionarioLoja?.appendChild(option.cloneNode(true));
                historicoLojaSelect?.appendChild(option.cloneNode(true));
                liberacaoSecoesLojaSelect?.appendChild(option.cloneNode(true));
            });

            const lojaPrincipal = getLojaPrincipal() || setLojaPrincipal(getLojaCodigo(lojas[0]));
            const lojaSelecionada = lojasPermitidasCache.includes(Number(lojaAtual))
                ? String(lojaAtual)
                : lojaPrincipal;
            lojaEscalaSelect.value = lojaSelecionada;
            funcionariosLojaSelect.value = lojaSelecionada;
            if (homeLojaSelect) homeLojaSelect.value = lojaSelecionada;
            if (escalasFiltroLoja) escalasFiltroLoja.value = lojaSelecionada;
            if (secoesLojaSelect) secoesLojaSelect.value = lojaSelecionada;
            if (secaoFormLoja) secaoFormLoja.value = lojaSelecionada;
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = lojaSelecionada;
            if (escalaFuncionarioLoja) escalaFuncionarioLoja.value = lojaSelecionada;
            if (historicoLojaSelect) historicoLojaSelect.value = lojaSelecionada;
            if (liberacaoSecoesLojaSelect) liberacaoSecoesLojaSelect.value = lojaSelecionada;
            atualizarBadgeLojaPrincipal();
            return lojas;
        };

        const carregarSecoesDaLoja = async (silent = false, lojaInformada = '') => {
            const loja = lojaInformada || (secoesLojaSelect?.value && secoesLojaSelect.value !== 'all' ? secoesLojaSelect.value : lojaEscalaSelect.value);
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                secoesLojaCache = [];
                popularSelectSecaoFormulario('');
                return [];
            }

            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`);
                secoesLojaCache = data.secoes || [];
                popularSelectSecaoFormulario(secaoFormId?.value || '');
                if (!silent && secoesLojaCache.length === 0) {
                    showInfoModal('Nenhuma secao encontrada para a loja selecionada.', 'info');
                }
                return secoesLojaCache;
            } catch (error) {
                secoesLojaCache = [];
                popularSelectSecaoFormulario('');
                if (!silent) showInfoModal(error.message, 'error');
                return [];
            }
        };

        const carregarTurnosSecaoDaLoja = async (silent = false, lojaInformada = '') => {
            const lojaFiltro = turnosSecaoLojaSelect?.value;
            const loja = lojaInformada || (lojaFiltro && lojaFiltro !== 'all' ? lojaFiltro : lojaEscalaSelect.value);
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                turnosSecaoCache = [];
                popularSelectSecoesTurno();
                return [];
            }

            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao`);
                turnosSecaoCache = data.turnos || [];
                popularSelectSecoesTurno();
                if (!silent && turnosSecaoCache.length === 0) {
                    showInfoModal('Nenhum turno encontrado para a loja selecionada.', 'info');
                }
                return turnosSecaoCache;
            } catch (error) {
                turnosSecaoCache = [];
                popularSelectSecoesTurno();
                if (!silent) showInfoModal(error.message, 'error');
                return [];
            }
        };

        const preencherFormularioSecao = (secao = null) => {
            secaoFormId.value = secao?.ESCSECAO_ID || '';
            secaoFormLoja.value = secao?.CODFILIAL || secao?.LOJA || (secoesLojaSelect?.value !== 'all' ? secoesLojaSelect?.value : lojaEscalaSelect.value) || '';
            secaoFormCodigo.value = secao?.COD_SECAO || '';
            secaoFormDescr.value = secao?.DESCR || '';
        };

        // esconderFormularioTurnoSecao and mostrarFormularioTurnoSecao removed as form is on a separate page

        const preencherFormularioTurnoSecao = (turno = null) => {
            turnoSecaoFormId.value = turno?.ESCSECAOTURNO_ID || '';
            popularSelectSecaoFormulario(turno?.ESCSECAO_ID || '');
            turnoSecaoFormQtde.value = turno?.QTDE_COLABORADORES || 1;
            turnoSecaoFormHrEnt1.value = turno?.HR_ENT1 || '';
            turnoSecaoFormHrSai1.value = turno?.HR_SAI1 || '';
            turnoSecaoFormHrEnt2.value = turno?.HR_ENT2 || '';
            turnoSecaoFormHrSai2.value = turno?.HR_SAI2 || '';
            turnoSecaoFormTitulo.textContent = turno ? 'Editar Turno' : 'Novo Turno';
        };

        const aplicarSecaoSelecionadaNoCadastro = () => {
            const escsecaoId = turnoSecaoFormSecao?.value || '';
            const secao = secaoTela || secoesLojaCache.find(item => Number(item.ESCSECAO_ID) === Number(escsecaoId));
            if (!secao) {
                turnoSecaoFormSecao.value = '';
                return;
            }
        };

        const prepararFormularioSecao = async (escsecaoId = '') => {
            const loja = secoesLojaSelect?.value || lojaEscalaSelect.value;
            if (secaoFormLoja && loja) secaoFormLoja.value = loja;
            if (loja && (secoesLojaCache.length === 0 || String(secoesLojaCache[0]?.LOJA || '') !== String(loja))) {
                await carregarSecoesDaLoja(true);
            }

            if (!escsecaoId || escsecaoId === 'nova') {
                secaoFormTitulo.textContent = 'Nova Seção';
                preencherFormularioSecao(null);
                return;
            }

            const secao = secoesLojaCache.find(item => Number(item.ESCSECAO_ID) === Number(escsecaoId));
            if (!secao) {
                showInfoModal('Seção não encontrada para edição.', 'error');
                window.location.hash = '/secoes';
                return;
            }

            secaoFormTitulo.textContent = `Editar Seção - ${secao.DESCR || secao.COD_SECAO}`;
            preencherFormularioSecao(secao);
        };

        const aplicarFiltrosSecoesTela = () => {
            const termo = normalizarTextoFiltro(secoesPesquisaInput?.value);
            const loja = secoesLojaSelect?.value || 'all';
            const filtradas = secoesTelaCache.filter(secao => {
                if (loja !== 'all' && String(secao.CODFILIAL || secao.LOJA) !== String(loja)) return false;
                return !termo || normalizarTextoFiltro((secao.COD_SECAO || '') + ' ' + (secao.DESCR || '')).includes(termo);
            });
            secoesTitulo.textContent = filtradas.length + ' seção(ões) encontrada(s)';
            tabelaSecoesBody.innerHTML = filtradas.length ? filtradas.map(secao => '<tr data-escsecao-id="' + escapeHtml(secao.ESCSECAO_ID || '') + '">' +
                '<td data-label="Código">' + escapeHtml(secao.COD_SECAO || '') + '</td>' +
                '<td data-label="Descrição">' + escapeHtml(secao.DESCR || '') + '</td>' +
                '<td data-label="Loja">Loja ' + escapeHtml(secao.CODFILIAL || secao.LOJA || '') + '</td>' +
                '<td data-label="Codcoligada">' + escapeHtml(secao.CODCOLIGADA || '') + '</td>' +
                '<td data-label="Subseções">' + (isSecaoFrenteCaixa(secao.DESCR) ? '<span class="subsection-count-chip">' + escapeHtml(String((secao.SUBSECOES || []).length)) + ' cadastrada(s)</span>' : '<span class="text-gray-500">-</span>') + '</td>' +
                '<td data-label="Ações" class="actions-cell">' +
                    '<button class="action-btn-table banco-action edit-secao" data-id="' + escapeHtml(secao.ESCSECAO_ID || '') + '" data-loja="' + escapeHtml(secao.CODFILIAL || secao.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button>' +
                    (isSecaoFrenteCaixa(secao.DESCR) ? '<button class="action-btn-table banco-action subsecoes-secao" data-id="' + escapeHtml(secao.ESCSECAO_ID || '') + '" data-loja="' + escapeHtml(secao.CODFILIAL || secao.LOJA || '') + '"><span class="material-symbols-outlined">account_tree</span>Subseções</button>' : '') +
                '</td></tr>').join('') : '<tr><td colspan="6" class="text-center text-gray-500 py-8">Nenhuma seção encontrada.</td></tr>';
            if (!hasPermission('secoes', 'editar')) {
                tabelaSecoesBody.querySelectorAll('.edit-secao').forEach(button => button.remove());
                tabelaSecoesBody.querySelectorAll('.subsecoes-secao').forEach(button => button.remove());
            }
            tabelaSecoesBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        };

        const carregarSecoesTela = async () => {
            const loja = secoesLojaSelect?.value && secoesLojaSelect.value !== 'all' ? secoesLojaSelect.value : 'all';
            const data = await apiRequest('/api/catalog/secoes?lojaId=' + encodeURIComponent(loja));
            secoesTelaCache = data.secoes || [];
            aplicarFiltrosSecoesTela();
        };

        const abrirCrudSubsecoesSecao = async (secao) => {
            if (!secao) return;
            const loja = secao.CODFILIAL || secao.LOJA || secoesLojaSelect?.value || lojaEscalaSelect.value;
            let manterAberto = true;
            while (manterAberto) {
                const data = await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/secoes/' + encodeURIComponent(secao.ESCSECAO_ID) + '/subsecoes?includeInactive=1');
                const subsecoes = data.subsecoes || [];
                const ativas = subsecoes.filter(item => String(item.STATUS || 'A') === 'A');
                const listaHtml = '<div class="subsection-modal-list">' + (subsecoes.length ? subsecoes.map(item =>
                    '<div class="subsection-modal-row"><strong>' + escapeHtml(item.DESCR || '') + '</strong><span>' + (String(item.STATUS || 'A') === 'A' ? 'Ativa' : 'Inativa') + '</span></div>'
                ).join('') : '<p>Nenhuma subseção cadastrada.</p>') + '</div>';
                const values = await showInputModal({
                    title: 'Subseções - ' + (secao.DESCR || secao.COD_SECAO),
                    inputs: [
                        { type: 'html', html: listaHtml },
                        { label: 'Ação', type: 'select', id: 'SUBSECAO_ACAO', value: 'ADICIONAR', options: [
                            { value: 'ADICIONAR', label: 'Adicionar subseção' },
                            { value: 'EDITAR', label: 'Editar descrição' },
                            { value: 'INATIVAR', label: 'Inativar subseção' },
                            { value: 'FECHAR', label: 'Fechar' }
                        ] },
                        { label: 'Subseção', type: 'select', id: 'SUBSECAO_ID', value: ativas[0]?.ESCSUBSECAO_ID || '', options: ativas.map(item => ({ value: String(item.ESCSUBSECAO_ID), label: item.DESCR })) },
                        { label: 'Descrição', type: 'text', id: 'SUBSECAO_DESCR', value: '', maxlength: 100 }
                    ],
                    confirmText: 'Executar',
                    cancelText: 'Sair',
                    panelClass: 'bg-white rounded-lg shadow-xl w-11/12 max-w-2xl flex flex-col'
                });
                if (!values || values.SUBSECAO_ACAO === 'FECHAR') break;
                if (values.SUBSECAO_ACAO === 'ADICIONAR') {
                    const descr = String(values.SUBSECAO_DESCR || '').trim();
                    if (!descr) {
                        showInfoModal('Informe a descrição da subseção.', 'error');
                        continue;
                    }
                    await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/secoes/' + encodeURIComponent(secao.ESCSECAO_ID) + '/subsecoes', {
                        method: 'POST',
                        body: JSON.stringify({ DESCR: descr })
                    });
                    showInfoModal('Subseção adicionada.', 'success');
                    continue;
                }
                const subsecaoId = values.SUBSECAO_ID;
                if (!subsecaoId) {
                    showInfoModal('Selecione uma subseção.', 'error');
                    continue;
                }
                if (values.SUBSECAO_ACAO === 'EDITAR') {
                    const descr = String(values.SUBSECAO_DESCR || '').trim();
                    if (!descr) {
                        showInfoModal('Informe a nova descrição.', 'error');
                        continue;
                    }
                    await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/secoes/' + encodeURIComponent(secao.ESCSECAO_ID) + '/subsecoes/' + encodeURIComponent(subsecaoId), {
                        method: 'PUT',
                        body: JSON.stringify({ DESCR: descr, STATUS: 'A' })
                    });
                    showInfoModal('Subseção atualizada.', 'success');
                    continue;
                }
                if (values.SUBSECAO_ACAO === 'INATIVAR') {
                    await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/secoes/' + encodeURIComponent(secao.ESCSECAO_ID) + '/subsecoes/' + encodeURIComponent(subsecaoId), {
                        method: 'DELETE'
                    });
                    showInfoModal('Subseção inativada.', 'success');
                    continue;
                }
                manterAberto = false;
            }
            await carregarSecoesTela(false);
        };

        const getSubsecoesPageBaseUrl = () => '/api/catalog/lojas/' + encodeURIComponent(subsecoesPageState.loja) + '/secoes/' + encodeURIComponent(subsecoesPageState.secao?.ESCSECAO_ID || '') + '/subsecoes';
        const canManageSubsecoesPage = () => hasPermission('secoes', 'editar') || hasPermission('escalas', 'editar');
        const getFuncionarioSubsecaoExplicitamente = (funcionario) => Number(funcionario?.ESCSUBSECAO_ID || 0);
        const hasSubsecaoExplicitaNaSecao = () => subsecoesPageState.funcionarios.some(funcionario => getFuncionarioSubsecaoExplicitamente(funcionario) > 0);
        const getSubsecaoSelecionadaPage = () => String(subsecoesPageState.selecionadaId) === SUBSECAO_SEM_VINCULO_KEY
            ? { ESCSUBSECAO_ID: SUBSECAO_SEM_VINCULO_KEY, DESCR: 'Sem subseção', STATUS: 'A', virtual: true }
            : subsecoesPageState.subsecoes.find(item => Number(item.ESCSUBSECAO_ID) === Number(subsecoesPageState.selecionadaId)) || null;
        const getFuncionariosDaSecaoSubsecoes = () => subsecoesPageState.funcionarios.filter(funcionario => Number(funcionario.ESCSECAO_ID) === Number(subsecoesPageState.secao?.ESCSECAO_ID));
        const getFuncionarioSubsecaoPageId = (funcionario) => {
            const explicita = getFuncionarioSubsecaoExplicitamente(funcionario);
            const idsCadastrados = new Set(subsecoesPageState.subsecoes.map(item => Number(item.ESCSUBSECAO_ID || 0)).filter(Boolean));
            if (explicita > 0) return idsCadastrados.has(explicita) ? explicita : SUBSECAO_SEM_VINCULO_KEY;
            return SUBSECAO_SEM_VINCULO_KEY;
        };
        const getFuncionarioSubsecaoPageIdLegado = (funcionario) => {
            const atual = getFuncionarioSubsecaoPageId(funcionario);
            if (atual !== SUBSECAO_SEM_VINCULO_KEY || hasSubsecaoExplicitaNaSecao()) return atual;
            const catalogo = subsecoesPageState.subsecoes.map(item => ({
                key: String(item.ESCSUBSECAO_ID),
                nome: item.DESCR,
                raw: item
            }));
            const fallback = classificarSubsecaoFuncionario(funcionario, catalogo);
            return Number(fallback?.key || 0);
        };
        const getFuncionariosSubsecaoSelecionada = () => {
            const selecionadaId = String(subsecoesPageState.selecionadaId || '');
            return getFuncionariosDaSecaoSubsecoes()
                .filter(funcionario => String(getFuncionarioSubsecaoPageId(funcionario)) === selecionadaId)
                .sort((a, b) => String(a.NOME || '').localeCompare(String(b.NOME || '')));
        };
        const getFuncionariosDisponiveisSubsecao = () => {
            const selecionadaId = String(subsecoesPageState.selecionadaId || '');
            const termo = normalizarTextoFiltro(subsecoesFuncionarioBusca?.value);
            return getFuncionariosDaSecaoSubsecoes()
                .filter(funcionario => String(getFuncionarioSubsecaoPageId(funcionario)) !== selecionadaId)
                .filter(funcionario => !termo || normalizarTextoFiltro((funcionario.NOME || '') + ' ' + (funcionario.CHAPA || '') + ' ' + (funcionario.FUNCAO_DESCR || '')).includes(termo))
                .sort((a, b) => String(a.NOME || '').localeCompare(String(b.NOME || '')))
                .slice(0, 20);
        };
        const getFuncionarioIniciaisSubsecao = (funcionario) => String(funcionario?.NOME || '?')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(parte => parte[0])
            .join('')
            .toUpperCase() || '?';

        const carregarSubsecoesSecaoPage = async (escsecaoId = '') => {
            const lojaAtual = secoesLojaSelect?.value && secoesLojaSelect.value !== 'all' ? secoesLojaSelect.value : (lojaEscalaSelect?.value || '');
            if (!secoesTelaCache.length || (lojaAtual && !secoesTelaCache.some(item => String(item.CODFILIAL || item.LOJA) === String(lojaAtual)))) {
                await carregarSecoesTela();
            }
            let secao = secoesTelaCache.find(item => Number(item.ESCSECAO_ID) === Number(escsecaoId));
            if (!secao && escsecaoId) {
                const lojasBusca = lojaAtual && lojaAtual !== 'all' ? [lojaAtual] : lojasPermitidasCache;
                for (const loja of lojasBusca) {
                    const data = await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/secoes');
                    secao = (data.secoes || []).find(item => Number(item.ESCSECAO_ID) === Number(escsecaoId));
                    if (secao) break;
                }
            }
            if (!secao) {
                showInfoModal('Seção não encontrada.', 'error');
                window.location.hash = '/secoes';
                return;
            }
            const loja = secao.CODFILIAL || secao.LOJA || lojaAtual || lojaEscalaSelect?.value;
            subsecoesPageState = {
                loja: String(loja),
                secao,
                subsecoes: [],
                funcionarios: [],
                selecionadaId: null,
                criando: false,
                editandoId: null,
                selecionados: new Set(),
                painelVinculoAberto: false,
                menuAberto: null
            };
            subsecoesTitulo.textContent = 'Subseções: ' + (secao.DESCR || secao.COD_SECAO || '');
            subsecoesResumo.textContent = 'Loja ' + loja + ' | ' + (secao.COD_SECAO || 'sem código');
            const [subData, funcData] = await Promise.all([
                apiRequest(getSubsecoesPageBaseUrl() + '?includeInactive=1'),
                apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/funcionarios')
            ]);
            subsecoesPageState.subsecoes = subData.subsecoes || [];
            subsecoesPageState.funcionarios = funcData.funcionarios || [];
            const temSemSubsecao = getFuncionariosDaSecaoSubsecoes().some(funcionario => String(getFuncionarioSubsecaoPageId(funcionario)) === SUBSECAO_SEM_VINCULO_KEY);
            const primeiraAtiva = subsecoesPageState.subsecoes.find(item => String(item.STATUS || 'A') === 'A') || subsecoesPageState.subsecoes[0];
            subsecoesPageState.selecionadaId = temSemSubsecao ? SUBSECAO_SEM_VINCULO_KEY : primeiraAtiva?.ESCSUBSECAO_ID || null;
            renderizarSubsecoesPage();
        };

        const recarregarSubsecoesPage = async () => {
            if (!subsecoesPageState.secao?.ESCSECAO_ID || !subsecoesPageState.loja) return;
            const [subData, funcData] = await Promise.all([
                apiRequest(getSubsecoesPageBaseUrl() + '?includeInactive=1'),
                apiRequest('/api/catalog/lojas/' + encodeURIComponent(subsecoesPageState.loja) + '/funcionarios')
            ]);
            subsecoesPageState.subsecoes = subData.subsecoes || [];
            subsecoesPageState.funcionarios = funcData.funcionarios || [];
            if (!subsecoesPageState.subsecoes.some(item => Number(item.ESCSUBSECAO_ID) === Number(subsecoesPageState.selecionadaId))) {
                const temSemSubsecao = getFuncionariosDaSecaoSubsecoes().some(funcionario => String(getFuncionarioSubsecaoPageId(funcionario)) === SUBSECAO_SEM_VINCULO_KEY);
                subsecoesPageState.selecionadaId = temSemSubsecao ? SUBSECAO_SEM_VINCULO_KEY : subsecoesPageState.subsecoes.find(item => String(item.STATUS || 'A') === 'A')?.ESCSUBSECAO_ID || subsecoesPageState.subsecoes[0]?.ESCSUBSECAO_ID || null;
            }
            renderizarSubsecoesPage();
        };

        const salvarSubsecaoInline = async (id = null) => {
            if (!canManageSubsecoesPage()) return showInfoModal('Usuario sem permissao para editar subsecoes.', 'error');
            const input = subsecoesLista?.querySelector(id ? `[data-edit-subsecao="${CSS.escape(String(id))}"]` : '[data-new-subsecao]');
            const descr = String(input?.value || '').trim();
            if (!descr) return showInfoModal('Informe o nome da subseção.', 'error');
            if (id) {
                const atual = subsecoesPageState.subsecoes.find(item => Number(item.ESCSUBSECAO_ID) === Number(id));
                await apiRequest(getSubsecoesPageBaseUrl() + '/' + encodeURIComponent(id), {
                    method: 'PUT',
                    body: JSON.stringify({ DESCR: descr, STATUS: String(atual?.STATUS || 'A') })
                });
            } else {
                const result = await apiRequest(getSubsecoesPageBaseUrl(), {
                    method: 'POST',
                    body: JSON.stringify({ DESCR: descr })
                });
                subsecoesPageState.selecionadaId = result.subsecao?.ESCSUBSECAO_ID || subsecoesPageState.selecionadaId;
            }
            subsecoesPageState.criando = false;
            subsecoesPageState.editandoId = null;
            await recarregarSubsecoesPage();
        };

        const atualizarStatusSubsecaoPage = async (subsecaoId, status) => {
            const subsecao = subsecoesPageState.subsecoes.find(item => Number(item.ESCSUBSECAO_ID) === Number(subsecaoId));
            if (!subsecao) return;
            await apiRequest(getSubsecoesPageBaseUrl() + '/' + encodeURIComponent(subsecaoId), {
                method: 'PUT',
                body: JSON.stringify({ DESCR: subsecao.DESCR, STATUS: status })
            });
            await recarregarSubsecoesPage();
        };

        const atualizarFuncionarioSubsecaoApi = async ({ loja, escsecaoId, escfuncId, escsubsecaoId }) => {
            if (!loja || !escfuncId) {
                throw new Error('Não foi possível identificar loja ou funcionário para transferir.');
            }
            const payload = {
                ESCSUBSECAO_ID: escsubsecaoId ? Number(escsubsecaoId) : null
            };
            if (escsecaoId) payload.ESCSECAO_ID = Number(escsecaoId);
            return apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/funcionarios/' + encodeURIComponent(escfuncId) + '/subsecao', {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
        };

        const atualizarFuncionarioSubsecaoPage = async (escfuncId, subsecaoId) => {
            if (!canManageSubsecoesPage()) return showInfoModal('Usuario sem permissao para editar subsecoes.', 'error');
            await atualizarFuncionarioSubsecaoApi({
                loja: subsecoesPageState.loja,
                escsecaoId: subsecoesPageState.secao?.ESCSECAO_ID,
                escfuncId,
                escsubsecaoId: subsecaoId
            });
            subsecoesPageState.selecionados.delete(String(escfuncId));
            await recarregarSubsecoesPage();
        };

        const abrirModalTransferenciaSubsecao = async (funcionario, options = {}) => {
            if (!funcionario) return;
            const origemEscala = options.origemEscala === true;
            const subsecoesAtivas = (options.subsecoes || subsecoesPageState.subsecoes || []).filter(item => String(item.STATUS || 'A') === 'A');
            const atualId = funcionario.ESCSUBSECAO_ID || getFuncionarioSubsecaoPageId(funcionario);
            const destinos = subsecoesAtivas
                .filter(item => String(item.ESCSUBSECAO_ID) !== String(atualId))
                .map(item => ({ value: String(item.ESCSUBSECAO_ID), label: item.DESCR }));
            if (!destinos.length) {
                showInfoModal('Nenhuma subseção de destino disponível.', 'info');
                return;
            }
            const values = await showInputModal({
                title: 'Transferir ' + (funcionario.NOME || funcionario.nome || funcionario.CHAPA || funcionario.chapa || 'funcionário'),
                inputs: [
                    { type: 'message', text: origemEscala ? 'A transferência muda a subseção do funcionário e recalcula a escala para evitar buracos e conflitos. Se a vigência for no meio do mês, apenas os dias a partir dela serão regerados.' : 'O funcionário será movido para a subseção selecionada. Ele sai da lista atual e passa a aparecer na nova subseção.' },
                    { label: 'Nova Subseção', type: 'select', id: 'ESCSUBSECAO_ID', value: destinos[0]?.value || '', options: destinos, required: true },
                    { label: 'A partir de quando?', type: 'select', id: 'VIGENCIA', value: 'IMEDIATO', options: [
                        { value: 'IMEDIATO', label: 'Imediatamente' },
                        { value: 'PROXIMA_SEMANA', label: 'A partir da próxima semana' },
                        { value: 'PROXIMO_MES', label: 'A partir do próximo mês' }
                    ] }
                ],
                confirmText: 'Confirmar Transferência',
                cancelText: 'Cancelar',
                panelClass: 'bg-white rounded-lg shadow-xl w-11/12 max-w-md flex flex-col'
            });
            if (!values?.ESCSUBSECAO_ID) return;
            const loja = origemEscala ? escalaDetalheAtual.lojaId : subsecoesPageState.loja;
            const escsecaoId = origemEscala ? (funcionario.ESCSECAO_ID || funcionario.escsecaoId || escalaDetalheAtual.secaoAtiva) : subsecoesPageState.secao?.ESCSECAO_ID;
            await atualizarFuncionarioSubsecaoApi({
                loja,
                escsecaoId,
                escfuncId: funcionario.ESCFUNC_ID || funcionario.escfuncId,
                escsubsecaoId: values.ESCSUBSECAO_ID
            });
            if (origemEscala && values.VIGENCIA !== 'PROXIMO_MES' && escalaDetalheAtual.mesRef) {
                const inicio = values.VIGENCIA === 'PROXIMA_SEMANA' ? getProximaSegundaIsoBanco() : getHojeIsoBanco();
                await apiRequest('/api/escalas/gerar-secao', {
                    method: 'POST',
                    body: JSON.stringify({
                        lojaId: Number(escalaDetalheAtual.lojaId),
                        mesRef: escalaDetalheAtual.mesRef,
                        escsecaoId: Number(escsecaoId),
                        hojeIso: inicio
                    }),
                    timeoutMs: 120000
                });
                await carregarDetalheEscalaMensal(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef);
                escalaDetalheAtual.secaoAtiva = String(escsecaoId);
                escalaDetalheAtual.subsetorAtivo = String(values.ESCSUBSECAO_ID);
                prepararSecoesDetalheEscala();
            } else if (origemEscala) {
                await carregarDetalheEscalaMensal(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef);
                escalaDetalheAtual.secaoAtiva = String(escsecaoId);
                escalaDetalheAtual.subsetorAtivo = String(values.ESCSUBSECAO_ID);
                prepararSecoesDetalheEscala();
            } else {
                subsecoesPageState.selecionadaId = values.ESCSUBSECAO_ID;
                subsecoesPageState.selecionados.clear();
                subsecoesPageState.menuAberto = null;
                await recarregarSubsecoesPage();
            }
            showInfoModal('Funcionário transferido de subseção.', 'success');
        };

        const excluirSubsecaoPage = async (subsecaoId) => {
            const subsecao = subsecoesPageState.subsecoes.find(item => Number(item.ESCSUBSECAO_ID) === Number(subsecaoId));
            if (!subsecao) return;
            const confirmacao = await showInputModal({
                title: 'Excluir subseção',
                inputs: [{ type: 'message', text: 'A subseção "' + (subsecao.DESCR || '') + '" será removida. Funcionários vinculados a ela voltarão para Sem subseção.' }],
                confirmText: 'Excluir',
                cancelText: 'Cancelar'
            });
            if (!confirmacao) return;
            await apiRequest(getSubsecoesPageBaseUrl() + '/' + encodeURIComponent(subsecaoId), { method: 'DELETE' });
            subsecoesPageState.selecionadaId = SUBSECAO_SEM_VINCULO_KEY;
            subsecoesPageState.selecionados.clear();
            await recarregarSubsecoesPage();
        };

        const renderizarSubsecoesSugestoes = () => {
            if (!subsecoesFuncionariosSugestoes) return;
            if (!subsecoesPageState.painelVinculoAberto) {
                subsecoesFuncionariosSugestoes.innerHTML = '';
                return;
            }
            const funcionarios = getFuncionariosDisponiveisSubsecao();
            subsecoesFuncionariosSugestoes.innerHTML = funcionarios.length ? funcionarios.map(funcionario => `
                <div class="subsection-suggestion">
                    <div class="subsection-employee-cell">
                        <span class="subsection-avatar">${escapeHtml(getFuncionarioIniciaisSubsecao(funcionario))}</span>
                        <div>
                            <span class="subsection-employee-name">${escapeHtml(funcionario.NOME || '')}</span>
                            <span class="subsection-manage-meta">${escapeHtml(funcionario.CHAPA || '')} | ${escapeHtml(funcionario.FUNCAO_DESCR || '')}</span>
                        </div>
                    </div>
                    <button type="button" class="action-button compact vincular-funcionario-subsecao" data-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}">
                        <span class="material-symbols-outlined">add</span>Vincular
                    </button>
                </div>
            `).join('') : '<div class="subsection-empty-state">Nenhum funcionário disponível para esta busca.</div>';
        };

        const renderizarSubsecoesPage = () => {
            const termo = normalizarTextoFiltro(subsecoesBuscaInput?.value);
            const totalSemSubsecao = getFuncionariosDaSecaoSubsecoes().filter(funcionario => String(getFuncionarioSubsecaoPageId(funcionario)) === SUBSECAO_SEM_VINCULO_KEY).length;
            const itensLista = [
                { ESCSUBSECAO_ID: SUBSECAO_SEM_VINCULO_KEY, DESCR: 'Sem subseção', STATUS: 'A', virtual: true },
                ...subsecoesPageState.subsecoes
            ];
            const subsecoes = itensLista.filter(item => !termo || normalizarTextoFiltro(item.DESCR).includes(termo));
            const totalAtivas = subsecoesPageState.subsecoes.filter(item => String(item.STATUS || 'A') === 'A').length;
            const podeGerenciar = canManageSubsecoesPage();
            if (subsecoesListaResumo) subsecoesListaResumo.textContent = totalAtivas + ' ativa(s) de ' + subsecoesPageState.subsecoes.length;
            novaSubsecaoInlineBtn?.classList.toggle('hidden', !podeGerenciar);

            const novoHtml = subsecoesPageState.criando && podeGerenciar ? `
                <div class="subsection-inline-form">
                    <input type="text" data-new-subsecao maxlength="100" placeholder="Nome da nova subseção" autofocus>
                    <div class="subsection-actions">
                        <button type="button" class="subsection-icon-button save-new-subsecao" title="Salvar"><span class="material-symbols-outlined">check</span></button>
                        <button type="button" class="subsection-icon-button danger cancel-subsecao-inline" title="Cancelar"><span class="material-symbols-outlined">close</span></button>
                    </div>
                </div>
            ` : '';
            subsecoesLista.innerHTML = novoHtml + (subsecoes.length ? subsecoes.map(item => {
                const id = String(item.ESCSUBSECAO_ID || '');
                const ativa = String(item.STATUS || 'A') === 'A';
                const virtual = item.virtual === true;
                const selecionada = String(id) === String(subsecoesPageState.selecionadaId);
                const qtd = virtual ? totalSemSubsecao : getFuncionariosDaSecaoSubsecoes().filter(funcionario => String(getFuncionarioSubsecaoPageId(funcionario)) === String(id)).length;
                if (!virtual && Number(subsecoesPageState.editandoId) === Number(id)) {
                    return `
                        <div class="subsection-inline-form">
                            <input type="text" data-edit-subsecao="${escapeHtml(id)}" maxlength="100" value="${escapeHtml(item.DESCR || '')}">
                            <div class="subsection-actions">
                                <button type="button" class="subsection-icon-button save-edit-subsecao" data-id="${escapeHtml(id)}" title="Salvar"><span class="material-symbols-outlined">check</span></button>
                                <button type="button" class="subsection-icon-button danger cancel-subsecao-inline" title="Cancelar"><span class="material-symbols-outlined">close</span></button>
                            </div>
                        </div>
                    `;
                }
                return `
                    <button type="button" class="subsection-manage-item ${selecionada ? 'active' : ''} ${ativa ? '' : 'inactive'}" data-id="${escapeHtml(id)}">
                        <span>
                            <span class="subsection-manage-name">${escapeHtml(item.DESCR || '')}</span>
                            <span class="subsection-manage-meta">${qtd} funcionário(s)${virtual ? ' pendente(s)' : ' | ' + (ativa ? 'ativa' : 'inativa')}</span>
                        </span>
                        <span class="subsection-actions ${podeGerenciar && !virtual ? '' : 'hidden'}">
                            <span role="button" tabindex="0" class="subsection-toggle ${ativa ? 'active' : ''}" data-toggle-id="${escapeHtml(id)}" title="${ativa ? 'Inativar' : 'Ativar'}"></span>
                            <span role="button" tabindex="0" class="subsection-icon-button edit-subsecao-inline" data-id="${escapeHtml(id)}" title="Editar"><span class="material-symbols-outlined">edit</span></span>
                            <span role="button" tabindex="0" class="subsection-icon-button danger delete-subsecao-inline" data-id="${escapeHtml(id)}" title="Excluir"><span class="material-symbols-outlined">delete</span></span>
                        </span>
                    </button>
                `;
            }).join('') : '<div class="subsection-empty-state">Nenhuma subseção encontrada.</div>');

            const selecionada = getSubsecaoSelecionadaPage();
            const funcionariosSelecionados = selecionada ? getFuncionariosSubsecaoSelecionada() : [];
            if (subsecoesDetalheTitulo) subsecoesDetalheTitulo.textContent = selecionada?.DESCR || 'Selecione uma subseção';
            if (subsecoesDetalheResumo) subsecoesDetalheResumo.textContent = selecionada ? funcionariosSelecionados.length + ' funcionário(s) alocado(s) nesta subseção' : 'Os funcionários alocados aparecerão aqui.';
            subsecoesVincularFuncionarioBtn?.toggleAttribute('disabled', !selecionada || selecionada.virtual);
            subsecoesVincularFuncionarioBtn?.classList.toggle('hidden', !podeGerenciar || Boolean(selecionada?.virtual));
            subsecoesVincularPanel?.classList.toggle('hidden', !podeGerenciar || Boolean(selecionada?.virtual) || !subsecoesPageState.painelVinculoAberto || !selecionada);
            if (subsecoesTransferirSelect) {
                subsecoesTransferirSelect.innerHTML = '<option value="">Transferir para...</option>' + subsecoesPageState.subsecoes
                    .filter(item => String(item.STATUS || 'A') === 'A' && Number(item.ESCSUBSECAO_ID) !== Number(subsecoesPageState.selecionadaId))
                    .map(item => '<option value="' + escapeHtml(item.ESCSUBSECAO_ID || '') + '">' + escapeHtml(item.DESCR || '') + '</option>')
                    .join('');
            }
            if (subsecoesSelecionarTodos) {
                subsecoesSelecionarTodos.checked = funcionariosSelecionados.length > 0 && funcionariosSelecionados.every(funcionario => subsecoesPageState.selecionados.has(String(funcionario.ESCFUNC_ID)));
                subsecoesSelecionarTodos.disabled = !podeGerenciar || funcionariosSelecionados.length === 0;
            }
            subsecoesTransferirSelecionadosBtn?.toggleAttribute('disabled', subsecoesPageState.selecionados.size === 0);
            subsecoesTransferirSelect?.classList.toggle('hidden', !podeGerenciar);
            subsecoesTransferirSelecionadosBtn?.classList.toggle('hidden', !podeGerenciar);
            subsecoesFuncionariosBody.innerHTML = funcionariosSelecionados.length ? funcionariosSelecionados.map(funcionario => `
                <tr>
                    <td>${podeGerenciar ? `<input type="checkbox" class="subsecao-funcionario-check" data-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}" ${subsecoesPageState.selecionados.has(String(funcionario.ESCFUNC_ID)) ? 'checked' : ''}>` : '-'}</td>
                    <td data-label="Funcionário">
                        <div class="subsection-employee-cell subsection-employee-with-menu">
                            <span class="subsection-avatar">${escapeHtml(getFuncionarioIniciaisSubsecao(funcionario))}</span>
                            <span class="subsection-employee-name">${escapeHtml(funcionario.NOME || '')}</span>
                            ${podeGerenciar ? `<span class="subsection-kebab-wrap"><button type="button" class="subsection-kebab-btn" data-menu-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}" aria-label="Mais ações"><span class="material-symbols-outlined">more_vert</span></button><span class="subsection-kebab-menu ${String(subsecoesPageState.menuAberto) === String(funcionario.ESCFUNC_ID) ? '' : 'hidden'}">
                                <button type="button" class="subsection-menu-action ver-detalhes-funcionario" data-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}"><span class="material-symbols-outlined">badge</span>Ver detalhes</button>
                                <button type="button" class="subsection-menu-action editar-horarios-funcionario" data-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}"><span class="material-symbols-outlined">schedule</span>Editar horários</button>
                                <button type="button" class="subsection-menu-action transferir-funcionario-subsecao" data-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}"><span class="material-symbols-outlined">swap_horiz</span>Transferir de Subseção</button>
                                ${selecionada?.virtual ? '' : `<button type="button" class="subsection-menu-action danger remover-funcionario-subsecao" data-id="${escapeHtml(funcionario.ESCFUNC_ID || '')}"><span class="material-symbols-outlined">person_remove</span>Remover da Subseção</button>`}
                            </span></span>` : ''}
                        </div>
                    </td>
                    <td data-label="Matrícula">${escapeHtml(funcionario.CHAPA || '')}</td>
                    <td data-label="Cargo">${escapeHtml(funcionario.FUNCAO_DESCR || '')}</td>
                </tr>
            `).join('') : '<tr><td colspan="4" class="subsection-empty-state">Nenhum funcionário alocado nesta subseção.</td></tr>';
            renderizarSubsecoesSugestoes();
        };

        secoesPesquisaInput?.addEventListener('input', aplicarFiltrosSecoesTela);
        secoesLojaSelect?.addEventListener('change', () => carregarSecoesTela().catch(error => showInfoModal(error.message, 'error')));

        tabelaSecoesBody?.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-secao');
            const subsecoesButton = event.target.closest('.subsecoes-secao');
            if (!editButton && !subsecoesButton) return;
            if (!hasPermission('secoes', 'editar')) return showInfoModal('Usuario sem permissao para editar secoes.', 'error');

            if (subsecoesButton) {
                if (subsecoesButton.dataset.loja) secoesLojaSelect.value = subsecoesButton.dataset.loja;
                window.location.hash = `/secoes/${subsecoesButton.dataset.id}/subsecoes`;
                return;
            }

            if (editButton.dataset.loja) secoesLojaSelect.value = editButton.dataset.loja;
            window.location.hash = `/secoes/${editButton.dataset.id}`;
        });

        novaSecaoBtn?.addEventListener('click', () => {
            if (!hasPermission('secoes', 'criar')) return showInfoModal('Usuario sem permissao para criar secoes.', 'error');
            window.location.hash = '/secoes/nova';
        });

        voltarSecoesBtn?.addEventListener('click', () => {
            window.location.hash = '/secoes';
        });

        voltarSubsecoesBtn?.addEventListener('click', () => {
            window.location.hash = '/secoes';
        });

        subsecoesBuscaInput?.addEventListener('input', renderizarSubsecoesPage);
        subsecoesFuncionarioBusca?.addEventListener('input', renderizarSubsecoesSugestoes);
        novaSubsecaoInlineBtn?.addEventListener('click', () => {
            if (!canManageSubsecoesPage()) return showInfoModal('Usuario sem permissao para criar subsecoes.', 'error');
            subsecoesPageState.criando = true;
            subsecoesPageState.editandoId = null;
            renderizarSubsecoesPage();
            subsecoesLista?.querySelector('[data-new-subsecao]')?.focus();
        });
        subsecoesVincularFuncionarioBtn?.addEventListener('click', () => {
            subsecoesPageState.painelVinculoAberto = !subsecoesPageState.painelVinculoAberto;
            renderizarSubsecoesPage();
            if (subsecoesPageState.painelVinculoAberto) subsecoesFuncionarioBusca?.focus();
        });
        subsecoesLista?.addEventListener('click', async (event) => {
            const toggle = event.target.closest('[data-toggle-id]');
            const edit = event.target.closest('.edit-subsecao-inline');
            const excluir = event.target.closest('.delete-subsecao-inline');
            const saveNew = event.target.closest('.save-new-subsecao');
            const saveEdit = event.target.closest('.save-edit-subsecao');
            const cancel = event.target.closest('.cancel-subsecao-inline');
            const item = event.target.closest('.subsection-manage-item');
            try {
                if (saveNew) return await salvarSubsecaoInline();
                if (saveEdit) return await salvarSubsecaoInline(saveEdit.dataset.id);
                if (cancel) {
                    subsecoesPageState.criando = false;
                    subsecoesPageState.editandoId = null;
                    renderizarSubsecoesPage();
                    return;
                }
                if (toggle) {
                    event.preventDefault();
                    event.stopPropagation();
                    const atual = subsecoesPageState.subsecoes.find(subsecao => Number(subsecao.ESCSUBSECAO_ID) === Number(toggle.dataset.toggleId));
                    await atualizarStatusSubsecaoPage(toggle.dataset.toggleId, String(atual?.STATUS || 'A') === 'A' ? 'I' : 'A');
                    return;
                }
                if (edit) {
                    event.preventDefault();
                    event.stopPropagation();
                    subsecoesPageState.criando = false;
                    subsecoesPageState.editandoId = edit.dataset.id;
                    renderizarSubsecoesPage();
                    subsecoesLista?.querySelector(`[data-edit-subsecao="${CSS.escape(String(edit.dataset.id))}"]`)?.focus();
                    return;
                }
                if (excluir) {
                    event.preventDefault();
                    event.stopPropagation();
                    await excluirSubsecaoPage(excluir.dataset.id);
                    return;
                }
                if (item) {
                    subsecoesPageState.selecionadaId = item.dataset.id;
                    subsecoesPageState.selecionados.clear();
                    subsecoesPageState.painelVinculoAberto = false;
                    renderizarSubsecoesPage();
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        subsecoesLista?.addEventListener('keydown', async (event) => {
            if (event.key !== 'Enter') return;
            const novo = event.target.closest('[data-new-subsecao]');
            const editando = event.target.closest('[data-edit-subsecao]');
            try {
                if (novo) await salvarSubsecaoInline();
                if (editando) await salvarSubsecaoInline(editando.dataset.editSubsecao);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        subsecoesFuncionariosSugestoes?.addEventListener('click', async (event) => {
            const button = event.target.closest('.vincular-funcionario-subsecao');
            if (!button || !subsecoesPageState.selecionadaId) return;
            try {
                await atualizarFuncionarioSubsecaoPage(button.dataset.id, subsecoesPageState.selecionadaId);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        subsecoesSelecionarTodos?.addEventListener('change', () => {
            const funcionarios = getFuncionariosSubsecaoSelecionada();
            funcionarios.forEach(funcionario => {
                const key = String(funcionario.ESCFUNC_ID);
                if (subsecoesSelecionarTodos.checked) subsecoesPageState.selecionados.add(key);
                else subsecoesPageState.selecionados.delete(key);
            });
            renderizarSubsecoesPage();
        });
        subsecoesFuncionariosBody?.addEventListener('change', async (event) => {
            const checkbox = event.target.closest('.subsecao-funcionario-check');
            try {
                if (checkbox) {
                    if (checkbox.checked) subsecoesPageState.selecionados.add(String(checkbox.dataset.id));
                    else subsecoesPageState.selecionados.delete(String(checkbox.dataset.id));
                    renderizarSubsecoesPage();
                    return;
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        subsecoesFuncionariosBody?.addEventListener('click', async (event) => {
            const menuButton = event.target.closest('.subsection-kebab-btn');
            const detalhe = event.target.closest('.ver-detalhes-funcionario');
            const editarHorarios = event.target.closest('.editar-horarios-funcionario');
            const transferir = event.target.closest('.transferir-funcionario-subsecao');
            const remover = event.target.closest('.remover-funcionario-subsecao');
            if (menuButton) {
                event.stopPropagation();
                subsecoesPageState.menuAberto = String(subsecoesPageState.menuAberto) === String(menuButton.dataset.menuId) ? null : menuButton.dataset.menuId;
                renderizarSubsecoesPage();
                return;
            }
            const actionId = detalhe?.dataset.id || editarHorarios?.dataset.id || transferir?.dataset.id || remover?.dataset.id;
            const funcionario = subsecoesPageState.funcionarios.find(item => Number(item.ESCFUNC_ID) === Number(actionId));
            if (!funcionario) return;
            try {
                subsecoesPageState.menuAberto = null;
                if (detalhe) {
                    showInfoModal([
                        'Nome: ' + (funcionario.NOME || ''),
                        'Matrícula: ' + (funcionario.CHAPA || ''),
                        'Cargo: ' + (funcionario.FUNCAO_DESCR || ''),
                        'Horário: ' + [funcionario.HR_ENT1, funcionario.HR_SAI1, funcionario.HR_ENT2, funcionario.HR_SAI2].filter(Boolean).join(' / ')
                    ], 'info');
                    return;
                }
                if (editarHorarios) {
                    if (!hasPermission('funcionarios', 'editar')) return showInfoModal('Usuario sem permissao para editar horarios do funcionario.', 'error');
                    const values = await showInputModal({
                        title: 'Editar horários - ' + (funcionario.NOME || funcionario.CHAPA || ''),
                        inputs: [
                            { label: 'Entrada 1', type: 'time', id: 'HR_ENT1', value: funcionario.HR_ENT1 || '' },
                            { label: 'Saída 1', type: 'time', id: 'HR_SAI1', value: funcionario.HR_SAI1 || '' },
                            { label: 'Entrada 2', type: 'time', id: 'HR_ENT2', value: funcionario.HR_ENT2 || '' },
                            { label: 'Saída 2', type: 'time', id: 'HR_SAI2', value: funcionario.HR_SAI2 || '' }
                        ],
                        confirmText: 'Salvar'
                    });
                    if (!values) return;
                    await apiRequest('/api/catalog/lojas/' + encodeURIComponent(subsecoesPageState.loja) + '/funcionarios/' + encodeURIComponent(funcionario.ESCFUNC_ID), {
                        method: 'PATCH',
                        body: JSON.stringify({
                            HR_ENT1: values.HR_ENT1 || null,
                            HR_SAI1: values.HR_SAI1 || null,
                            HR_ENT2: values.HR_ENT2 || null,
                            HR_SAI2: values.HR_SAI2 || null
                        })
                    });
                    await recarregarSubsecoesPage();
                    showInfoModal('Horários atualizados.', 'success');
                    return;
                }
                if (transferir) {
                    await abrirModalTransferenciaSubsecao(funcionario);
                    return;
                }
                if (remover) {
                    await atualizarFuncionarioSubsecaoPage(remover.dataset.id, null);
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        subsecoesTransferirSelecionadosBtn?.addEventListener('click', async () => {
            const destino = subsecoesTransferirSelect?.value;
            if (!destino) return showInfoModal('Selecione a subseção de destino.', 'error');
            if (!subsecoesPageState.selecionados.size) return showInfoModal('Selecione pelo menos um funcionário.', 'error');
            try {
                const selecionados = [...subsecoesPageState.selecionados];
                for (const escfuncId of selecionados) {
                    await atualizarFuncionarioSubsecaoApi({
                        loja: subsecoesPageState.loja,
                        escsecaoId: subsecoesPageState.secao?.ESCSECAO_ID,
                        escfuncId,
                        escsubsecaoId: destino
                    });
                }
                subsecoesPageState.selecionadaId = destino;
                subsecoesPageState.selecionados.clear();
                await recarregarSubsecoesPage();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        secaoForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!hasPermission('secoes', 'editar')) return showInfoModal('Usuario sem permissao para salvar secoes.', 'error');
            const loja = secaoFormLoja.value;
            const escsecaoId = secaoFormId.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                showInfoModal('Selecione uma loja permitida para salvar a seção.', 'error');
                return;
            }

            try {
                const payload = {
                    COD_SECAO: secaoFormCodigo.value.trim(),
                    DESCR: secaoFormDescr.value.trim()
                };
                const url = escsecaoId
                    ? `/api/catalog/lojas/${encodeURIComponent(loja)}/secoes/${encodeURIComponent(escsecaoId)}`
                    : `/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`;
                await apiRequest(url, {
                    method: escsecaoId ? 'PUT' : 'POST',
                    body: JSON.stringify(payload)
                });
                lojaEscalaSelect.value = loja;
                funcionariosLojaSelect.value = loja;
                if (homeLojaSelect) homeLojaSelect.value = loja;
                if (secoesLojaSelect) secoesLojaSelect.value = loja;
                await carregarSecoesTela(false);
                showInfoModal('Seção salva com sucesso.', 'success');
                window.location.hash = '/secoes';
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const popularFiltroSecoesTurnos = () => {
            if (!turnosSecaoFiltro) return;
            const atual = turnosSecaoFiltro.value || 'all';
            const map = new Map(turnosTelaCache.map(turno => [String(turno.ESCSECAO_ID), (turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '') + (turno.DESCR || 'Seção')]));
            turnosSecaoFiltro.innerHTML = '<option value="all">Todas as seções</option>' + [...map.entries()].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,nome]) => '<option value="' + escapeHtml(id) + '">' + escapeHtml(nome) + '</option>').join('');
            if (map.has(atual)) turnosSecaoFiltro.value = atual;
        };

        const aplicarFiltrosTurnosTela = () => {
            const termo = normalizarTextoFiltro(turnosPesquisaInput?.value);
            const loja = turnosSecaoLojaSelect?.value || 'all';
            const secao = turnosSecaoFiltro?.value || 'all';
            const filtrados = turnosTelaCache.filter(turno => {
                if (loja !== 'all' && String(turno.LOJA) !== String(loja)) return false;
                if (secao !== 'all' && String(turno.ESCSECAO_ID) !== String(secao)) return false;
                return !termo || normalizarTextoFiltro((turno.COD_SECAO || '') + ' ' + (turno.DESCR || '')).includes(termo);
            });
            turnosSecaoTitulo.textContent = filtrados.length + ' turno(s) encontrado(s)';
            tabelaTurnosSecaoBody.innerHTML = filtrados.length ? filtrados.map(turno => '<tr data-turno-id="' + escapeHtml(turno.ESCSECAOTURNO_ID || '') + '">' +
                '<td data-label="Seção">' + escapeHtml((turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '') + (turno.DESCR || '')) + '</td>' +
                '<td data-label="Colaboradores">' + escapeHtml(turno.QTDE_COLABORADORES || '') + '</td><td data-label="Entrada 1">' + escapeHtml(turno.HR_ENT1 || '') + '</td><td data-label="Saída 1">' + escapeHtml(turno.HR_SAI1 || '') + '</td><td data-label="Entrada 2">' + escapeHtml(turno.HR_ENT2 || '') + '</td><td data-label="Saída 2">' + escapeHtml(turno.HR_SAI2 || '') + '</td>' +
                '<td data-label="Ações" class="actions-cell"><button class="action-btn-table banco-action edit-turno-secao" data-id="' + escapeHtml(turno.ESCSECAOTURNO_ID || '') + '" data-loja="' + escapeHtml(turno.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button></td></tr>').join('') : '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhum turno encontrado.</td></tr>';
            if (!hasPermission('turnos-secao', 'editar')) {
                tabelaTurnosSecaoBody.querySelectorAll('.edit-turno-secao').forEach(button => button.remove());
            }
            tabelaTurnosSecaoBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
            renderizarTurnosOperacionais(filtrados);
        };

        const normalizarHorarioTurnoTela = (value) => {
            const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
            if (!match) return '';
            return match[1].padStart(2, '0') + ':' + match[2];
        };

        const funcionarioPertenceAoTurno = (funcionario, turno) => {
            if (String(funcionario.ESCSECAO_ID || '') !== String(turno.ESCSECAO_ID || '')) return false;
            const horariosFuncionario = [funcionario.HR_ENT1, funcionario.HR_SAI1, funcionario.HR_ENT2, funcionario.HR_SAI2].map(normalizarHorarioTurnoTela);
            if (horariosFuncionario.some(value => !value)) return false;
            const horariosTurno = [turno.HR_ENT1, turno.HR_SAI1, turno.HR_ENT2, turno.HR_SAI2].map(normalizarHorarioTurnoTela);
            return horariosFuncionario.every((value, index) => value === horariosTurno[index]);
        };

        const getTurnoPeriodoLabel = (turno) => [turno.HR_ENT1, turno.HR_SAI1, turno.HR_ENT2, turno.HR_SAI2].map(normalizarHorarioTurnoTela).filter(Boolean).join(' / ');

        const renderizarTimelineTurnosSecao = (turnos, funcionarios) => {
            const inicioTimeline = 0;
            const fimTimeline = 24 * 60;
            const duracaoTimeline = fimTimeline - inicioTimeline;
            const markers = [];
            for (let min = 0; min <= fimTimeline; min += 120) {
                const left = ((min - inicioTimeline) / duracaoTimeline) * 100;
                markers.push('<span style="left:' + left + '%">' + minutesToTime(min === 1440 ? 0 : min) + '</span>');
            }

            const funcionariosOrdenados = [...(funcionarios || [])].sort((left, right) => {
                return timeToMinutes(left.HR_ENT1 || '23:59') - timeToMinutes(right.HR_ENT1 || '23:59')
                    || String(left.NOME || '').localeCompare(String(right.NOME || ''));
            });

            if (!funcionariosOrdenados.length) {
                return '<div class="turno-section-timeline-empty">Nenhum funcionário encontrado para montar a timeline.</div>';
            }

            const mkBar = (start, end, cls, label, tooltip) => {
                const width = Math.max(0, ((end - start) / duracaoTimeline) * 100);
                const left = Math.max(0, ((start - inicioTimeline) / duracaoTimeline) * 100);
                if (width <= 0) return '';
                return '<span class="' + cls + '" style="left:' + left + '%;width:' + width + '%" title="' + escapeHtml(tooltip || label) + '">' + escapeHtml(label) + '</span>';
            };

            const rows = funcionariosOrdenados.map((funcionario) => {
                const turno = (turnos || []).find(item => funcionarioPertenceAoTurno(funcionario, item));
                const ent1Label = normalizarHorarioTurnoTela(funcionario.HR_ENT1 || turno?.HR_ENT1 || '00:00') || '00:00';
                const sai1Label = normalizarHorarioTurnoTela(funcionario.HR_SAI1 || turno?.HR_SAI1 || funcionario.HR_ENT1 || '00:00') || '00:00';
                const ent2Label = normalizarHorarioTurnoTela(funcionario.HR_ENT2 || turno?.HR_ENT2 || funcionario.HR_SAI1 || '00:00') || '00:00';
                const sai2Label = normalizarHorarioTurnoTela(funcionario.HR_SAI2 || turno?.HR_SAI2 || funcionario.HR_ENT2 || '00:00') || '00:00';
                const ent1 = timeToMinutes(ent1Label);
                const sai1 = timeToMinutes(sai1Label);
                const ent2 = timeToMinutes(ent2Label);
                const sai2 = timeToMinutes(sai2Label);
                const tooltip = [
                    funcionario.NOME || '',
                    funcionario.FUNCAO_DESCR || funcionario.FUNCAO || '',
                    [ent1Label, sai1Label, ent2Label, sai2Label].filter(Boolean).join(' / ')
                ].filter(Boolean).join('\n');
                const bars = mkBar(ent1, sai1, 'turno-section-timeline-bar', ent1Label + ' - ' + sai1Label, tooltip)
                    + mkBar(sai1, ent2, 'turno-section-timeline-break', '', tooltip)
                    + mkBar(ent2, sai2, 'turno-section-timeline-bar', ent2Label + ' - ' + sai2Label, tooltip);
                return '<div class="turno-section-timeline-row">' +
                    '<div class="turno-section-timeline-person" title="' + escapeHtml(tooltip) + '"><strong>' + escapeHtml((funcionario.CHAPA || '') + ' - ' + (funcionario.NOME || '')) + '</strong></div>' +
                    '<div class="turno-section-timeline-track">' + bars + '</div>' +
                    '</div>';
            }).join('');

            return '<div class="turno-section-timeline">' +
                '<div class="turno-section-timeline-axis"><div></div><div class="turno-section-timeline-markers">' + markers.join('') + '</div></div>' +
                rows +
                '</div>';
        };

        const renderizarDetalheTurnosSecao = (grupo) => {
            const funcionarios = turnosFuncionariosTelaCache
                .filter(funcionario => String(funcionario.ESCSECAO_ID || '') === String(grupo.secaoId || ''));
            const turnosHtml = grupo.turnos.map((turno) => {
                const funcionariosTurno = funcionarios.filter(funcionario => funcionarioPertenceAoTurno(funcionario, turno));
                const periodo = getTurnoPeriodoLabel(turno);
                const editar = hasPermission('turnos-secao', 'editar')
                    ? '<button type="button" class="action-btn-table banco-action edit-turno-secao" data-id="' + escapeHtml(turno.ESCSECAOTURNO_ID || '') + '" data-loja="' + escapeHtml(turno.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar Turno</button>'
                    : '';
                return '<section class="turno-inline-section">' +
                    '<header><div><strong>' + escapeHtml(periodo) + '</strong><span>' + escapeHtml(funcionariosTurno.length) + ' funcionário(s)</span></div>' + editar + '</header>' +
                    '<div class="turno-inline-workers">' + (funcionariosTurno.length ? funcionariosTurno.map(funcionario =>
                        '<span class="turno-worker-inline" title="' + escapeHtml(funcionario.FUNCAO_DESCR || funcionario.FUNCAO || '') + '">' + escapeHtml((funcionario.CHAPA || '') + ' - ' + (funcionario.NOME || '')) + '</span>'
                    ).join('') : '<span class="turnos-operacionais-vazio">Nenhum funcionário neste turno.</span>') + '</div>' +
                    '</section>';
            }).join('');

            return '<div class="turno-operacional-detail" data-secao-key="' + escapeHtml(grupo.key) + '">' +
                '<div class="turno-inline-grid">' + (turnosHtml || '<p class="turnos-operacionais-vazio">Nenhum turno encontrado.</p>') + '</div>' +
                '<div class="turno-inline-timeline-block"><h3>Timeline dos turnos no dia</h3>' + renderizarTimelineTurnosSecao(grupo.turnos, funcionarios) + '</div>' +
                '</div>';
        };

        const renderizarTurnosOperacionais = (turnos) => {
            if (!turnosOperacionaisLista) return;
            if (!turnos || turnos.length === 0) {
                turnosOperacionaisLista.innerHTML = '';
                return;
            }

            const lojaAtual = turnosSecaoLojaSelect?.value || 'all';
            if (lojaAtual === 'all') {
                turnosOperacionaisLista.innerHTML = '<div class="turnos-operacionais-empty">Selecione uma loja específica para visualizar os funcionários por turno.</div>';
                return;
            }

            const grupos = new Map();
            turnos.forEach((turno) => {
                const key = String(turno.ESCSECAO_ID || turno.COD_SECAO || turno.DESCR || '');
                if (!grupos.has(key)) {
                    grupos.set(key, {
                        key,
                        loja: turno.LOJA,
                        secaoId: turno.ESCSECAO_ID,
                        titulo: (turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '') + (turno.DESCR || 'Seção'),
                        turnos: [],
                        funcionarios: new Map()
                    });
                }
                const grupo = grupos.get(key);
                grupo.turnos.push(turno);
                turnosFuncionariosTelaCache
                    .filter(funcionario => String(funcionario.ESCSECAO_ID || '') === String(turno.ESCSECAO_ID || ''))
                    .forEach(funcionario => grupo.funcionarios.set(String(funcionario.ESCFUNC_ID || funcionario.CHAPA), funcionario));
            });

            turnosOperacionaisLista.innerHTML = '<div class="turnos-operacionais-table">' + [...grupos.values()].map((grupo) => {
                const expandida = String(turnoSecaoExpandidaKey || '') === String(grupo.key);
                return '<article class="turno-operacional-row compact-section-row">' +
                    '<div class="turno-operacional-section"><strong>' + escapeHtml(grupo.titulo) + '</strong><span>' + escapeHtml(grupo.turnos.length) + ' turno(s) cadastrado(s)</span></div>' +
                    '<div class="turno-operacional-count"><strong>' + escapeHtml(grupo.funcionarios.size) + '</strong><span>funcionários</span></div>' +
                    '<div class="turno-operacional-workers"><span class="turnos-operacionais-vazio">' + (expandida ? 'Funcionários e timeline abertos abaixo.' : 'Detalhe os funcionários e horários apenas quando necessário.') + '</span></div>' +
                    '<div class="turno-operacional-actions"><button type="button" class="action-btn-table banco-action mostrar-funcionarios-turno" aria-expanded="' + (expandida ? 'true' : 'false') + '" data-secao-key="' + escapeHtml(grupo.key) + '"><span class="material-symbols-outlined">' + (expandida ? 'expand_less' : 'group') + '</span>' + (expandida ? 'Esconder Funcionários' : 'Mostrar Funcionários') + '</button></div>' +
                    (expandida ? renderizarDetalheTurnosSecao(grupo) : '') +
                    '</article>';
            }).join('') + '</div>';
        };

        const resolverLojaTurnosOperacional = () => {
            const selecionada = turnosSecaoLojaSelect?.value || '';
            if (selecionada && selecionada !== 'all') return selecionada;
            const principal = getLojaPrincipal();
            if (principal) return principal;
            return lojaEscalaSelect?.value || '';
        };

        const escalaLiberacaoFoiCriada = (resultado) => {
            const resultados = resultado?.resultados || [];
            const criadas = resultados.filter(item => item.criada);
            if (criadas.length) {
                const criticas = criadas.flatMap(item => item.criticas || []).filter(Boolean);
                if (criticas.length) {
                    showInfoModal([
                        'Escala criada como rascunho com criticas. Revise a escala antes de oficializar.',
                        ...criticas
                    ], 'error');
                }
                return true;
            }
            const mensagens = resultados.flatMap((item) => [
                item.motivo || item.erro || 'A escala não foi criada.',
                ...(item.criticas || [])
            ]).filter(Boolean);
            showInfoModal(mensagens.length ? mensagens : 'A escala não foi criada.', 'error');
            return false;
        };

        const carregarTurnosSecaoTela = async () => {
            const loja = turnosSecaoLojaSelect?.value && turnosSecaoLojaSelect.value !== 'all' ? turnosSecaoLojaSelect.value : 'all';
            const data = await apiRequest('/api/catalog/turnos-secao?lojaId=' + encodeURIComponent(loja));
            turnosTelaCache = data.turnos || [];
            turnosFuncionariosTelaCache = [];
            if (loja !== 'all') {
                const funcionariosData = await apiRequest('/api/catalog/funcionarios?lojaId=' + encodeURIComponent(loja));
                turnosFuncionariosTelaCache = funcionariosData.funcionarios || [];
            }
            popularFiltroSecoesTurnos();
            aplicarFiltrosTurnosTela();
        };

        turnosPesquisaInput?.addEventListener('input', aplicarFiltrosTurnosTela);
        turnosSecaoFiltro?.addEventListener('change', aplicarFiltrosTurnosTela);
        turnosSecaoLojaSelect?.addEventListener('change', () => {
            turnoSecaoExpandidaKey = null;
            carregarTurnosSecaoTela().catch(error => showInfoModal(error.message, 'error'));
        });

        tabelaTurnosSecaoBody?.addEventListener('click', (event) => {
            const editButton = event.target.closest('.edit-turno-secao');
            if (!editButton) return;
            if (!hasPermission('turnos-secao', 'editar')) return showInfoModal('Usuario sem permissao para editar turnos por secao.', 'error');
            if (editButton.dataset.loja) turnosSecaoLojaSelect.value = editButton.dataset.loja;
            window.location.hash = `/turnos-secao/${editButton.dataset.id}`;
        });

        turnosOperacionaisLista?.addEventListener('click', (event) => {
            const editButton = event.target.closest('.edit-turno-secao');
            const detailButton = event.target.closest('.mostrar-funcionarios-turno');
            if (detailButton) {
                const secaoKey = String(detailButton.dataset.secaoKey || '');
                turnoSecaoExpandidaKey = String(turnoSecaoExpandidaKey || '') === secaoKey ? null : secaoKey;
                aplicarFiltrosTurnosTela();
                return;
            }
            if (!editButton) return;
            if (!hasPermission('turnos-secao', 'editar')) return showInfoModal('Usuario sem permissao para editar turnos por secao.', 'error');
            if (editButton.dataset.loja) turnosSecaoLojaSelect.value = editButton.dataset.loja;
            window.location.hash = `/turnos-secao/${editButton.dataset.id}`;
        });

        novoTurnoSecaoBtn?.addEventListener('click', () => {
            if (!hasPermission('turnos-secao', 'criar')) return showInfoModal('Usuario sem permissao para criar turnos por secao.', 'error');
            window.location.hash = '/turnos-secao/novo';
        });

        gerarEscalaTurnosBtn?.addEventListener('click', async () => {
            const loja = resolverLojaTurnosOperacional();
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                showInfoModal('Selecione uma loja permitida para abrir a escala do mês.', 'error');
                return;
            }

            const hoje = new Date();
            const mesRef = formatDateForDb(hoje.getFullYear(), hoje.getMonth(), 1);
            try {
                const existentes = await carregarResumoEscalas(loja, mesRef);
                if (existentes.length > 0) {
                    window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
                    return;
                }

                if (!canCreateEscalaSessao()) {
                    showInfoModal('A escala deste mês ainda não foi liberada para esta loja. Solicite a liberação ao RH ou gerente.', 'info');
                    return;
                }

                let liberacao;
                try {
                    liberacao = await apiRequest('/api/escalas/liberar-mensal', {
                        method: 'POST',
                        body: JSON.stringify({ mesRef, lojas: [Number(loja)] })
                    });
                } catch (error) {
                    showInfoModal(getApiErrorMessages(error), 'error');
                    return;
                }
                if (!escalaLiberacaoFoiCriada(liberacao)) return;
                window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
            } catch (error) {
                showInfoModal(getApiErrorMessages(error), 'error');
            }
        });

        carregarTurnosSecaoBtn?.addEventListener('click', async () => {
            try {
                await carregarTurnosSecaoTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        turnoSecaoForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!hasPermission('turnos-secao', 'editar')) return showInfoModal('Usuario sem permissao para salvar turnos por secao.', 'error');
            const loja = turnosSecaoLojaSelect?.value || lojaEscalaSelect.value;
            const turnoId = turnoSecaoFormId.value;
            const escsecaoId = turnoSecaoFormSecao.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                showInfoModal('Selecione uma loja permitida para salvar o turno.', 'error');
                return;
            }
            if (!escsecaoId) {
                showInfoModal('Selecione uma seção para salvar o turno.', 'error');
                return;
            }

            try {
                const payload = {
                    ESCSECAO_ID: Number(escsecaoId),
                    QTDE_COLABORADORES: Number(turnoSecaoFormQtde.value),
                    HR_ENT1: turnoSecaoFormHrEnt1.value,
                    HR_SAI1: turnoSecaoFormHrSai1.value,
                    HR_ENT2: turnoSecaoFormHrEnt2.value,
                    HR_SAI2: turnoSecaoFormHrSai2.value
                };
                const errosTurno = validarTurnoCadastroSecao(payload);
                if (errosTurno.length > 0) {
                    showInfoModal(errosTurno, 'error');
                    return;
                }
                const url = turnoId
                    ? `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao/${encodeURIComponent(turnoId)}`
                    : `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao`;
                await apiRequest(url, {
                    method: turnoId ? 'PUT' : 'POST',
                    body: JSON.stringify(payload)
                });
                await carregarTurnosSecaoTela(false);
                showInfoModal('Turno salvo com sucesso.', 'success');
                window.location.hash = '/turnos-secao';
            } catch (error) {
                showInfoModal(error.details || error.message, 'error');
            }
        });

        const popularFiltrosFuncionarios = () => {
            const preencher = (select, values, label) => {
                if (!select) return;
                const atual = select.value || 'all';
                select.innerHTML = '<option value="all">Todas as ' + label + '</option>' + [...values].filter(Boolean).sort().map(value => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
                if ([...values].includes(atual)) select.value = atual;
            };
            preencher(funcionariosSecaoFiltro, new Set(funcionariosTelaCache.map(f => f.SECAO_DESCR || String(f.ESCSECAO_ID || ''))), 'seções');
            preencher(funcionariosFuncaoFiltro, new Set(funcionariosTelaCache.map(f => f.FUNCAO_DESCR || String(f.ESCFUNCAO_ID || ''))), 'funções');
        };

        const aplicarFiltrosFuncionariosTela = () => {
            const termo = normalizarTextoFiltro(funcionariosPesquisaInput?.value);
            const loja = funcionariosLojaSelect?.value || 'all';
            const secao = funcionariosSecaoFiltro?.value || 'all';
            const funcao = funcionariosFuncaoFiltro?.value || 'all';
            const filtrados = funcionariosTelaCache.filter(f => {
                const secaoNome = f.SECAO_DESCR || String(f.ESCSECAO_ID || '');
                const funcaoNome = f.FUNCAO_DESCR || String(f.ESCFUNCAO_ID || '');
                if (loja !== 'all' && String(f.LOJA) !== String(loja)) return false;
                if (secao !== 'all' && secaoNome !== secao) return false;
                if (funcao !== 'all' && funcaoNome !== funcao) return false;
                return !termo || normalizarTextoFiltro([f.NOME, f.CHAPA, secaoNome, funcaoNome].join(' ')).includes(termo);
            });
            funcionariosTitulo.textContent = filtrados.length + ' funcionário(s) encontrado(s)';
            tabelaFuncionariosBody.innerHTML = filtrados.length ? filtrados.map(f => '<tr data-escfunc-id="' + escapeHtml(f.ESCFUNC_ID || '') + '">' +
                '<td data-label="Chapa">' + escapeHtml(f.CHAPA || '') + '</td><td data-label="Nome">' + escapeHtml(f.NOME || '') + '</td><td data-label="Loja">' + escapeHtml(f.LOJA || '') + '</td><td data-label="Seção">' + escapeHtml(f.SECAO_DESCR || f.ESCSECAO_ID || '') + '</td><td data-label="Função">' + escapeHtml(f.FUNCAO_DESCR || f.ESCFUNCAO_ID || '') + '</td><td data-label="Brigadista">' + escapeHtml(f.BRIGADISTA || '') + '</td><td data-label="Entrada 1">' + escapeHtml(f.HR_ENT1 || '') + '</td><td data-label="Saída 1">' + escapeHtml(f.HR_SAI1 || '') + '</td><td data-label="Entrada 2">' + escapeHtml(f.HR_ENT2 || '') + '</td><td data-label="Saída 2">' + escapeHtml(f.HR_SAI2 || '') + '</td>' +
                '<td data-label="Ações" class="actions-cell"><button class="action-btn-table banco-action edit-funcionario" data-id="' + escapeHtml(f.ESCFUNC_ID || '') + '" data-loja="' + escapeHtml(f.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button></td></tr>').join('') : '<tr><td colspan="11" class="text-center text-gray-500 py-8">Nenhum funcionário encontrado.</td></tr>';
            if (!hasPermission('funcionarios', 'editar')) {
                tabelaFuncionariosBody.querySelectorAll('.edit-funcionario').forEach(button => button.remove());
            }
            tabelaFuncionariosBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        };

        const carregarFuncionariosTela = async () => {
            const loja = funcionariosLojaSelect?.value && funcionariosLojaSelect.value !== 'all' ? funcionariosLojaSelect.value : 'all';
            const mesRef = funcionariosMesFiltro ? formatDateForDb(new Date().getFullYear(), Number(funcionariosMesFiltro.value), 1) : '';
            const params = new URLSearchParams({ lojaId: loja });
            if (mesRef) params.set('mesRef', mesRef);
            const data = await apiRequest('/api/catalog/funcionarios?' + params.toString());
            funcionariosTelaCache = data.funcionarios || [];
            funcionariosLojaCache = funcionariosTelaCache;
            popularFiltrosFuncionarios();
            aplicarFiltrosFuncionariosTela();
        };

        funcionariosPesquisaInput?.addEventListener('input', aplicarFiltrosFuncionariosTela);
        funcionariosSecaoFiltro?.addEventListener('change', aplicarFiltrosFuncionariosTela);
        funcionariosFuncaoFiltro?.addEventListener('change', aplicarFiltrosFuncionariosTela);
        funcionariosMesFiltro?.addEventListener('change', () => carregarFuncionariosTela().catch(error => showInfoModal(error.message, 'error')));
        funcionariosLojaSelect?.addEventListener('change', () => carregarFuncionariosTela().catch(error => showInfoModal(error.message, 'error')));

        tabelaFuncionariosBody.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-funcionario');
            if (!editButton) return;
            if (!hasPermission('funcionarios', 'editar')) return showInfoModal('Usuario sem permissao para editar funcionarios.', 'error');

            const funcionario = funcionariosTelaCache.find(item => Number(item.ESCFUNC_ID) === Number(editButton.dataset.id));
            const loja = funcionario?.LOJA;
            if (!loja || !funcionario) {
                showInfoModal('Funcionário não encontrado para edição.', 'error');
                return;
            }
            if (secoesLojaCache.length === 0 || String(secoesLojaCache[0]?.LOJA || secoesLojaCache[0]?.CODFILIAL || '') !== String(loja)) {
                await carregarSecoesDaLoja(true, loja);
            }

            const values = await showInputModal({
                title: `Editar escala - ${funcionario.NOME}`,
                inputs: [
                    { label: 'Seção', type: 'select', id: 'ESCSECAO_ID', value: String(funcionario.ESCSECAO_ID || ''), options: secoesLojaCache.map(secao => ({ value: String(secao.ESCSECAO_ID || ''), label: (secao.COD_SECAO ? secao.COD_SECAO + ' - ' : '') + (secao.DESCR || '') })), required: true },
                    { label: 'Brigadista (S/N)', type: 'text', id: 'BRIGADISTA', value: funcionario.BRIGADISTA || '' },
                    { label: 'Entrada 1', type: 'time', id: 'HR_ENT1', value: funcionario.HR_ENT1 || '' },
                    { label: 'Saída 1', type: 'time', id: 'HR_SAI1', value: funcionario.HR_SAI1 || '' },
                    { label: 'Entrada 2', type: 'time', id: 'HR_ENT2', value: funcionario.HR_ENT2 || '' },
                    { label: 'Saída 2', type: 'time', id: 'HR_SAI2', value: funcionario.HR_SAI2 || '' }
                ],
                confirmText: 'Salvar'
            });

            if (!values) return;

            try {
                const payload = {
                    BRIGADISTA: String(values.BRIGADISTA || '').trim().toUpperCase().slice(0, 1),
                    ESCSECAO_ID: Number(values.ESCSECAO_ID),
                    HR_ENT1: values.HR_ENT1 || null,
                    HR_SAI1: values.HR_SAI1 || null,
                    HR_ENT2: values.HR_ENT2 || null,
                    HR_SAI2: values.HR_SAI2 || null
                };
                await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios/${encodeURIComponent(funcionario.ESCFUNC_ID)}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
                await carregarFuncionariosDaLoja(true);
                await carregarFuncionariosTela(false);
                showInfoModal('Funcionário atualizado com sucesso.', 'success');
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });


        const carregarRegrasTela = async () => {
            const data = await apiRequest('/api/escalas/regras');
            regrasEscalaCache = data.regras || [];
            if (!tabelaRegrasBody) return;
            tabelaRegrasBody.innerHTML = regrasEscalaCache.length ? regrasEscalaCache.map(regra => `
                <tr>
                    <td data-label="C&oacute;digo">${escapeHtml(regra.codigo || '')}</td>
                    <td data-label="Regra">${escapeHtml(regra.titulo || '')}</td>
                    <td data-label="Descri&ccedil;&atilde;o">${escapeHtml(regra.descricao || '')}</td>
                </tr>`).join('') : '<tr><td colspan="3" class="text-center text-gray-500 py-8">Nenhuma regra cadastrada.</td></tr>';
        };

        const calcularMinutosHorarioPadrao = (values) => {
            const intervalo = Math.max(0, timeToMinutes(values.HR_ENT2) - timeToMinutes(values.HR_SAI1));
            const jornada = Math.max(0, (timeToMinutes(values.HR_SAI2) - timeToMinutes(values.HR_ENT1)) - intervalo);
            return { intervalo, jornada };
        };

        const carregarHorariosPadraoCache = async (includeInactive = false) => {
            const data = await apiRequest('/api/catalog/horarios-padrao' + (includeInactive ? '?includeInactive=1' : ''));
            horariosPadraoCache = data.horarios || [];
            return horariosPadraoCache;
        };

        const renderizarHorariosPadraoTela = () => {
            if (!tabelaHorariosPadraoBody) return;
            const termo = normalizarTextoFiltro(horariosPadraoPesquisaInput?.value);
            const status = horariosPadraoStatusFiltro?.value || 'all';
            const rows = horariosPadraoCache.filter((horario) => {
                const matchTermo = !termo || normalizarTextoFiltro(horario.DESCR || '').includes(termo);
                const matchStatus = status === 'all' || String(horario.STATUS) === status;
                return matchTermo && matchStatus;
            });
            tabelaHorariosPadraoBody.innerHTML = rows.length ? rows.map((horario) => `
                <tr>
                    <td data-label="Descri&ccedil;&atilde;o">${escapeHtml(horario.DESCR || '')}</td>
                    <td data-label="Entrada 1">${escapeHtml(horario.HR_ENT1 || '')}</td>
                    <td data-label="Sa&iacute;da 1">${escapeHtml(horario.HR_SAI1 || '')}</td>
                    <td data-label="Entrada 2">${escapeHtml(horario.HR_ENT2 || '')}</td>
                    <td data-label="Sa&iacute;da 2">${escapeHtml(horario.HR_SAI2 || '')}</td>
                    <td data-label="Jornada">${minutesToTime(Number(horario.JORNADA_MINUTOS || 0))}</td>
                    <td data-label="Intervalo">${minutesToTime(Number(horario.INTERVALO_MINUTOS || 0))}</td>
                    <td data-label="Status">${horario.STATUS === 'A' ? 'Ativo' : 'Inativo'}</td>
                    <td data-label="A&ccedil;&otilde;es" class="actions-cell">
                        <button class="action-btn-table banco-action editar-horario-padrao" data-id="${escapeHtml(horario.ESCHORPAD_ID)}"><span class="material-symbols-outlined">edit</span>Editar</button>
                        <button class="action-btn-table banco-action danger-action toggle-horario-padrao" data-id="${escapeHtml(horario.ESCHORPAD_ID)}" data-status="${escapeHtml(horario.STATUS)}"><span class="material-symbols-outlined">block</span>${horario.STATUS === 'A' ? 'Inativar' : 'Reativar'}</button>
                    </td>
                </tr>`).join('') : '<tr><td colspan="9" class="text-center text-gray-500 py-8">Nenhum hor&aacute;rio encontrado.</td></tr>';
            if (!hasPermission('horarios-padrao', 'editar')) {
                tabelaHorariosPadraoBody.querySelectorAll('.editar-horario-padrao').forEach(button => button.remove());
            }
            if (!hasPermission('horarios-padrao', 'inativar')) {
                tabelaHorariosPadraoBody.querySelectorAll('.toggle-horario-padrao').forEach(button => button.remove());
            }
            tabelaHorariosPadraoBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        };

        const carregarHorariosPadraoTela = async () => {
            await carregarHorariosPadraoCache(true);
            renderizarHorariosPadraoTela();
        };

        const abrirModalHorarioPadrao = async (horario = null) => {
            const values = await showInputModal({
                title: horario ? 'Editar Horario Padrao' : 'Novo Horario Padrao',
                inputs: [
                    { label: 'Descricao', type: 'text', id: 'DESCR', value: horario?.DESCR || '', required: true },
                    { label: 'Entrada 1', type: 'time', id: 'HR_ENT1', value: horario?.HR_ENT1 || '08:00', required: true },
                    { label: 'Saida 1', type: 'time', id: 'HR_SAI1', value: horario?.HR_SAI1 || '12:00', required: true },
                    { label: 'Entrada 2', type: 'time', id: 'HR_ENT2', value: horario?.HR_ENT2 || '13:10', required: true },
                    { label: 'Saida 2', type: 'time', id: 'HR_SAI2', value: horario?.HR_SAI2 || '17:58', required: true },
                    { label: 'Status', type: 'select', id: 'STATUS', value: horario?.STATUS || 'A', options: [{ value: 'A', label: 'Ativo' }, { value: 'I', label: 'Inativo' }], required: true }
                ],
                confirmText: 'Salvar'
            });
            if (!values) return;
            const calculo = calcularMinutosHorarioPadrao(values);
            if (calculo.jornada !== 528 || calculo.intervalo !== 70) {
                showInfoModal('Horario padrao deve ter jornada 08:48 e 1:10 de almoco.', 'error');
                return;
            }
            const payload = { ...values, JORNADA_MINUTOS: calculo.jornada, INTERVALO_MINUTOS: calculo.intervalo };
            if (horario) await apiRequest('/api/catalog/horarios-padrao/' + encodeURIComponent(horario.ESCHORPAD_ID), { method: 'PATCH', body: JSON.stringify(payload) });
            else await apiRequest('/api/catalog/horarios-padrao', { method: 'POST', body: JSON.stringify(payload) });
            await carregarHorariosPadraoTela();
            showInfoModal('Horario padrao salvo com sucesso.', 'success');
        };

        const prepararFiltrosRm = () => {
            copiarOptionsSelect(escalasFiltroLoja || lojaEscalaSelect, rmLojaSelect, escalasFiltroLoja?.value || 'all');
            copiarOptionsSelect(mesSelect, rmMesSelect, escalasFiltroMes?.value || String(new Date().getMonth()));
            copiarOptionsSelect(anoSelect, rmAnoSelect, escalasFiltroAno?.value || String(new Date().getFullYear()));
            if (rmLojaSelect && !Array.from(rmLojaSelect.options).some(option => option.value === 'all')) {
                rmLojaSelect.insertAdjacentHTML('afterbegin', '<option value="all">Todas as lojas</option>');
                rmLojaSelect.value = 'all';
            }
        };

        const aplicarFiltroRmTela = () => {
            if (!tabelaRmLogsBody) return;
            const termo = normalizarTextoFiltro(rmPesquisaInput?.value);
            const rows = rmLogsCache.filter((log) => !termo || normalizarTextoFiltro([log.CHAPA, log.ACAO, log.STATUS, log.MENSAGEM].join(' ')).includes(termo));
            if (rmResumo) rmResumo.textContent = rows.length + ' registro(s) encontrado(s).';
            tabelaRmLogsBody.innerHTML = rows.length ? rows.map((log) => {
                const mesRef = String(log.MES_REF || '').slice(0, 10);
                const falha = String(log.STATUS || '').toUpperCase() === 'FALHA';
                return `
                    <tr>
                        <td data-label="Data">${formatarDataTabela(log.DT_HR_INCL)}</td>
                        <td data-label="Loja">${escapeHtml(log.LOJA || '-')}</td>
                        <td data-label="Mes">${mesRef ? getNomeMesTabela(mesRef) + ' ' + mesRef.slice(0, 4) : '-'}</td>
                        <td data-label="Revisao">${escapeHtml(log.REVISAO ?? '-')}</td>
                        <td data-label="Chapa">${escapeHtml(log.CHAPA || '-')}</td>
                        <td data-label="Acao">${escapeHtml(log.ACAO || '-')}</td>
                        <td data-label="Status"><span class="escala-status-chip ${falha ? 'danger-chip' : 'official-chip'}">${escapeHtml(log.STATUS || '-')}</span></td>
                        <td data-label="Mensagem">${escapeHtml(log.MENSAGEM || '-')}</td>
                        <td data-label="Acoes" class="actions-cell">${falha && hasPermission('integracao-rm', 'reprocessar') ? `<button class="action-btn-table banco-action rm-reprocessar" data-loja="${escapeHtml(log.LOJA || '')}" data-mes-ref="${escapeHtml(mesRef)}" data-revisao="${escapeHtml(log.REVISAO ?? 0)}"><span class="material-symbols-outlined">sync</span>Reprocessar</button>` : '-'}</td>
                    </tr>`;
            }).join('') : '<tr><td colspan="9" class="text-center text-gray-500 py-8">Nenhum log encontrado.</td></tr>';
        };

        const carregarRmLogsTela = async () => {
            const params = new URLSearchParams();
            if (rmLojaSelect?.value && rmLojaSelect.value !== 'all') params.set('lojaId', rmLojaSelect.value);
            if (rmMesSelect?.value !== 'all' && rmAnoSelect?.value !== 'all') {
                params.set('mesRef', formatDateForDb(Number(rmAnoSelect.value), Number(rmMesSelect.value), 1));
            }
            const data = await apiRequest('/api/escalas/rm/logs' + (params.toString() ? '?' + params.toString() : ''));
            rmLogsCache = data.logs || [];
            aplicarFiltroRmTela();
        };

        const carregarTiposDescansoCache = async (includeInactive = false) => {
            const data = await apiRequest('/api/catalog/tipos-descanso' + (includeInactive ? '?includeInactive=1' : ''));
            tiposDescansoCache = data.tipos || [];
            return tiposDescansoCache;
        };

        const renderizarTiposDescansoTela = () => {
            if (!tabelaTiposDescansoBody) return;
            const termo = normalizarTextoFiltro(tiposDescansoPesquisaInput?.value);
            const status = tiposDescansoStatusFiltro?.value || 'all';
            const rows = tiposDescansoCache.filter((tipo) => {
                const matchTermo = !termo || normalizarTextoFiltro((tipo.DESCR || "") + " " + (tipo.SIGLA || "") + " " + (tipo.CLASSIFICACAO || "")).includes(termo);
                const matchStatus = status === 'all' || String(tipo.STATUS) === status;
                return matchTermo && matchStatus;
            });
            tabelaTiposDescansoBody.innerHTML = rows.length ? rows.map((tipo) => `
                <tr>
                    <td data-label="ID">${escapeHtml(tipo.ESCTIPODESC_ID)}</td>
                    <td data-label="Motivo">${escapeHtml(tipo.DESCR || "")}</td>
                    <td data-label="Sigla"><span class="escala-status-chip pending-chip">${escapeHtml(tipo.SIGLA || "")}</span></td>
                    <td data-label="Classificacao">${escapeHtml(tipo.CLASSIFICACAO || "OUTROS")}</td>
                    <td data-label="Status">${tipo.STATUS === "A" ? "Ativo" : "Inativo"}</td>
                    <td data-label="Ações" class="actions-cell">
                        <button class="action-btn-table banco-action editar-tipo-descanso" data-id="${escapeHtml(tipo.ESCTIPODESC_ID)}"><span class="material-symbols-outlined">edit</span>Editar</button>
                        <button class="action-btn-table banco-action danger-action toggle-tipo-descanso" data-id="${escapeHtml(tipo.ESCTIPODESC_ID)}" data-status="${escapeHtml(tipo.STATUS)}"><span class="material-symbols-outlined">block</span>${tipo.STATUS === "A" ? "Inativar" : "Reativar"}</button>
                    </td>
                </tr>`).join("") : '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhum tipo de descanso encontrado.</td></tr>';
            if (!hasPermission('tipos-descanso', 'editar')) {
                tabelaTiposDescansoBody.querySelectorAll('.editar-tipo-descanso').forEach(button => button.remove());
            }
            if (!hasPermission('tipos-descanso', 'inativar')) {
                tabelaTiposDescansoBody.querySelectorAll('.toggle-tipo-descanso').forEach(button => button.remove());
            }
            tabelaTiposDescansoBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        };

        const carregarTiposDescansoTela = async () => {
            await carregarTiposDescansoCache(true);
            renderizarTiposDescansoTela();
        };

        horariosPadraoPesquisaInput?.addEventListener('input', renderizarHorariosPadraoTela);
        horariosPadraoStatusFiltro?.addEventListener('change', renderizarHorariosPadraoTela);
        novoHorarioPadraoBtn?.addEventListener('click', () => {
            if (!hasPermission('horarios-padrao', horario ? 'editar' : 'criar')) return showInfoModal('Usuario sem permissao para salvar horarios padrao.', 'error');
            abrirModalHorarioPadrao().catch(error => showInfoModal(error.message, 'error'));
        });
        tabelaHorariosPadraoBody?.addEventListener('click', async (event) => {
            const edit = event.target.closest('.editar-horario-padrao');
            const toggle = event.target.closest('.toggle-horario-padrao');
            const button = edit || toggle;
            if (!button) return;
            if (!hasPermission('horarios-padrao', toggle ? 'inativar' : 'editar')) {
                showInfoModal('Usuario sem permissao para alterar horarios padrao.', 'error');
                return;
            }
            const horario = horariosPadraoCache.find(item => Number(item.ESCHORPAD_ID) === Number(button.dataset.id));
            if (!horario) return;
            try {
                if (edit) return abrirModalHorarioPadrao(horario);
                await apiRequest('/api/catalog/horarios-padrao/' + encodeURIComponent(horario.ESCHORPAD_ID), { method: 'PATCH', body: JSON.stringify({ STATUS: horario.STATUS === 'A' ? 'I' : 'A' }) });
                await carregarHorariosPadraoTela();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        rmPesquisaInput?.addEventListener('input', aplicarFiltroRmTela);
        [rmLojaSelect, rmMesSelect, rmAnoSelect].forEach(select => select?.addEventListener('change', () => carregarRmLogsTela().catch(error => showInfoModal(error.message, 'error'))));
        tabelaRmLogsBody?.addEventListener('click', async (event) => {
            const button = event.target.closest('.rm-reprocessar');
            if (!button) return;
            if (!hasPermission('integracao-rm', 'reprocessar')) {
                showInfoModal('Usuario sem permissao para reprocessar integracao RM.', 'error');
                return;
            }
            try {
                await apiRequest('/api/escalas/rm/reprocessar', {
                    method: 'POST',
                    body: JSON.stringify({ lojaId: Number(button.dataset.loja), mesRef: button.dataset.mesRef, revisao: Number(button.dataset.revisao || 0) })
                });
                await carregarRmLogsTela();
                showInfoModal('Reprocessamento enviado para o RM.', 'success');
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const abrirModalTipoDescanso = async (tipo = null) => {
            const values = await showInputModal({
                title: tipo ? "Editar Tipo de Descanso" : "Novo Tipo de Descanso",
                inputs: [
                    { label: "Motivo", type: "text", id: "TIPO_DESCR", value: tipo?.DESCR || "", required: true },
                    { label: "Sigla", type: "text", id: "TIPO_SIGLA", value: tipo?.SIGLA || "", required: true },
                    { label: "Classificacao", type: "select", id: "TIPO_CLASSIFICACAO", value: tipo?.CLASSIFICACAO || "OUTROS", options: [{ value: "FOLGA", label: "Folga" }, { value: "FERIAS", label: "Ferias" }, { value: "AFASTAMENTO", label: "Afastamento" }, { value: "OUTROS", label: "Outros" }], required: true },
                    { label: "Status", type: "select", id: "TIPO_STATUS", value: tipo?.STATUS || "A", options: [{ value: "A", label: "Ativo" }, { value: "I", label: "Inativo" }], required: true }
                ],
                confirmText: "Salvar"
            });
            if (!values) return;
            const payload = { DESCR: values.TIPO_DESCR, SIGLA: String(values.TIPO_SIGLA || "").toUpperCase().slice(0, 3), CLASSIFICACAO: values.TIPO_CLASSIFICACAO || "OUTROS", STATUS: values.TIPO_STATUS };
            if (tipo) {
                await apiRequest(`/api/catalog/tipos-descanso/${encodeURIComponent(tipo.ESCTIPODESC_ID)}`, { method: "PATCH", body: JSON.stringify(payload) });
            } else {
                await apiRequest("/api/catalog/tipos-descanso", { method: "POST", body: JSON.stringify(payload) });
            }
            await carregarTiposDescansoTela();
            showInfoModal("Tipo de descanso salvo com sucesso.", "success");
        };

        tiposDescansoPesquisaInput?.addEventListener('input', renderizarTiposDescansoTela);
        tiposDescansoStatusFiltro?.addEventListener('change', renderizarTiposDescansoTela);
        novoTipoDescansoBtn?.addEventListener('click', () => {
            if (!hasPermission('tipos-descanso', tipo ? 'editar' : 'criar')) return showInfoModal('Usuario sem permissao para salvar tipos de descanso.', 'error');
            abrirModalTipoDescanso().catch(error => showInfoModal(error.message, 'error'));
        });
        tabelaTiposDescansoBody?.addEventListener('click', async (event) => {
            const edit = event.target.closest('.editar-tipo-descanso');
            const toggle = event.target.closest('.toggle-tipo-descanso');
            const button = edit || toggle;
            if (!button) return;
            if (!hasPermission('tipos-descanso', toggle ? 'inativar' : 'editar')) {
                showInfoModal('Usuario sem permissao para alterar tipos de descanso.', 'error');
                return;
            }
            const tipo = tiposDescansoCache.find(item => Number(item.ESCTIPODESC_ID) === Number(button.dataset.id));
            if (!tipo) return;
            try {
                if (edit) return abrirModalTipoDescanso(tipo);
                await apiRequest('/api/catalog/tipos-descanso/' + encodeURIComponent(tipo.ESCTIPODESC_ID), { method: 'PATCH', body: JSON.stringify({ STATUS: tipo.STATUS === 'A' ? 'I' : 'A' }) });
                await carregarTiposDescansoTela();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const prepararFiltrosHistorico = (params = {}) => {
            if (historicoLojaSelect && historicoLojaSelect.options.length === 0) copiarOptionsSelect(escalasFiltroLoja || lojaEscalaSelect, historicoLojaSelect);
            if (historicoLojaSelect) historicoLojaSelect.value = params.lojaId || escalasFiltroLoja?.value || historicoLojaSelect.value || lojaEscalaSelect?.value;
            copiarOptionsSelect(mesSelect, historicoMesSelect, params.mesRef ? String(new Date(params.mesRef + "T00:00:00").getMonth()) : (escalasFiltroMes?.value || mesSelect?.value));
            copiarOptionsSelect(anoSelect, historicoAnoSelect, params.mesRef ? String(new Date(params.mesRef + "T00:00:00").getFullYear()) : (escalasFiltroAno?.value || anoSelect?.value));
        };

        const formatarDetalheHistorico = (detalhe) => {
            const texto = String(detalhe || '').trim();
            if (!texto) return '-';
            try {
                const parsed = JSON.parse(texto);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return Object.entries(parsed)
                        .filter(([, value]) => value !== undefined && value !== null && value !== '')
                        .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
                        .join('; ');
                }
                return JSON.stringify(parsed);
            } catch (_) {
                return texto;
            }
        };

        const aplicarFiltroHistoricoTela = () => {
            if (!tabelaHistoricoBody) return;
            const termo = normalizarTextoFiltro(historicoPesquisaInput?.value);
            const rows = historicoCache.filter((item) => !termo || normalizarTextoFiltro([item.ACAO, item.NOME_USUARIO, item.LOGIN, item.DETALHE].join(" ")).includes(termo));
            if (historicoResumo) historicoResumo.textContent = rows.length + " registro(s) encontrado(s).";
            tabelaHistoricoBody.innerHTML = rows.length ? rows.map((item) => `
                <tr>
                    <td data-label="Data">${formatarDataTabela(item.DT_HR_INCL)}</td>
                    <td data-label="Ação">${escapeHtml(item.ACAO || "-")}</td>
                    <td data-label="Loja">${item.LOJA ? "Loja " + escapeHtml(item.LOJA) : "-"}</td>
                    <td data-label="Mês">${item.MES_REF ? getNomeMesTabela(item.MES_REF) + " " + String(item.MES_REF).slice(0,4) : "-"}</td>
                    <td data-label="Revisão">${escapeHtml(item.REVISAO ?? "-")}</td>
                    <td data-label="Usuário">${escapeHtml(item.NOME_USUARIO || item.LOGIN || "Sistema")}</td>
                    <td data-label="Detalhe" class="history-detail-cell">${escapeHtml(formatarDetalheHistorico(item.DETALHE))}</td>
                </tr>`).join("") : '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhum histórico encontrado.</td></tr>';
        };

        const carregarHistoricoTela = async () => {
            if (!historicoLojaSelect || !historicoMesSelect || !historicoAnoSelect) return;
            const loja = historicoLojaSelect.value && historicoLojaSelect.value !== "all" ? historicoLojaSelect.value : "";
            const mesRef = historicoMesSelect.value !== "all" && historicoAnoSelect.value !== "all" ? formatDateForDb(Number(historicoAnoSelect.value), Number(historicoMesSelect.value), 1) : "";
            const params = new URLSearchParams();
            if (loja) params.set("lojaId", loja);
            if (mesRef) params.set("mesRef", mesRef);
            const data = await apiRequest("/api/escalas/historico" + (params.toString() ? "?" + params.toString() : ""));
            historicoCache = data.historico || [];
            aplicarFiltroHistoricoTela();
        };
        const prepararFiltrosEscalaFuncionarios = () => {
            if (!escalaFuncionarioMes || !escalaFuncionarioAno) return;
            if (!escalaFuncionarioMes.options.length) copiarOptionsSelect(mesSelect, escalaFuncionarioMes, String(new Date().getMonth()));
            if (!escalaFuncionarioAno.options.length) copiarOptionsSelect(anoSelect, escalaFuncionarioAno, String(new Date().getFullYear()));
        };

        const getMesRefEscalaFuncionario = () => formatDateForDb(Number(escalaFuncionarioAno.value), Number(escalaFuncionarioMes.value), 1);

        const aplicarFiltroListaEscalaFuncionarios = () => {
            const termo = normalizarTextoFiltro(escalaFuncionarioPesquisa?.value);
            const rows = escalasFuncionariosCache.filter(item => !termo || normalizarTextoFiltro(item.nome + ' ' + item.chapa).includes(termo));
            escalaFuncionarioListaResumo.textContent = rows.length + ' funcionário(s) com escala no período.';
            tabelaEscalaFuncionariosBody.innerHTML = rows.length ? rows.map(item => '<tr><td>' + escapeHtml(item.chapa) + '</td><td>' + escapeHtml(item.nome) + '</td><td>Loja ' + escapeHtml(item.loja) + '</td><td>' + escapeHtml(item.secao) + '</td><td>' + escapeHtml(item.funcao) + '</td><td>' + escapeHtml(item.revisao ?? '-') + '</td><td><span class="escala-status-chip ' + (item.oficializada ? 'official-chip' : 'pending-chip') + '">' + (item.oficializada ? 'Sim' : 'Nao') + '</span></td><td><span class="escala-status-chip ' + getStatusClassEscala(item.status) + '">' + escapeHtml(item.status) + '</span></td><td class="actions-cell"><button class="action-btn-table banco-action editar-escala-funcionario" data-escfunc-id="' + escapeHtml(item.escfuncId) + '" data-loja="' + escapeHtml(item.loja) + '" data-mes-ref="' + escapeHtml(item.mesRef) + '"><span class="material-symbols-outlined">edit_calendar</span>Editar</button></td></tr>').join('') : '<tr><td colspan="9" class="text-center text-gray-500 py-8">Nenhum funcionario com escala encontrado.</td></tr>';
            if (!hasPermission('escalas-funcionarios', 'editar')) {
                tabelaEscalaFuncionariosBody.querySelectorAll('.editar-escala-funcionario').forEach(button => button.remove());
            }
            tabelaEscalaFuncionariosBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        };

        const carregarEscalasFuncionarios = async () => {
            prepararFiltrosEscalaFuncionarios();
            const mesRef = getMesRefEscalaFuncionario();
            const loja = escalaFuncionarioLoja?.value && escalaFuncionarioLoja.value !== 'all' ? escalaFuncionarioLoja.value : 'all';
            tabelaEscalaFuncionariosBody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-500 py-8">Carregando...</td></tr>';
            const data = await apiRequest('/api/escalas/mensal-lote?lojaId=' + encodeURIComponent(loja) + '&mesRef=' + encodeURIComponent(mesRef));
            const resultados = (data.escalas || []).map((item) => {
                const lojaId = item.lojaId;
                const escala = item.escala || {};
                const grupos = new Map();
                (escala.dias || []).forEach(dia => {
                    const key = String(dia.ESCFUNC_ID || dia.CHAPA || '');
                    if (!grupos.has(key)) grupos.set(key, { escfuncId: dia.ESCFUNC_ID, chapa: dia.CHAPA, nome: dia.NOME || dia.CHAPA, loja: lojaId, secao: dia.SECAO_DESCR || dia.COD_SECAO || '', funcao: dia.FUNCAO_DESCR || '', status: escala.status || '-', revisao: dia.REVISAO ?? escala.revisao ?? '-', oficializada: Number(dia.OFICIALIZADA ?? escala.oficializada ?? escala.OFICIALIZADA ?? 0) === 1, mesRef });
                });
                return [...grupos.values()];
            });
            escalasFuncionariosCache = resultados.flat().sort((a,b)=>a.nome.localeCompare(b.nome));
            aplicarFiltroListaEscalaFuncionarios();
        };

        [escalaFuncionarioLoja, escalaFuncionarioMes, escalaFuncionarioAno].forEach(select => select?.addEventListener('change', () => carregarEscalasFuncionarios().catch(error => showInfoModal(error.message, 'error'))));
        escalaFuncionarioPesquisa?.addEventListener('input', aplicarFiltroListaEscalaFuncionarios);
        tabelaEscalaFuncionariosBody?.addEventListener('click', event => {
            const button = event.target.closest('.editar-escala-funcionario');
            if (button) {
                if (!hasPermission('escalas-funcionarios', 'editar')) return showInfoModal('Usuario sem permissao para editar escala do funcionario.', 'error');
                window.location.hash = '/escala-funcionario/' + button.dataset.escfuncId + '/' + button.dataset.loja + '/' + button.dataset.mesRef;
            }
        });
        voltarEscalaFuncionariosBtn?.addEventListener('click', () => { window.location.hash = '/escalas-funcionarios'; });


        const isProgramacaoDescanso = (programacao) => String(programacao || 'TRB').toUpperCase() !== 'TRB';
        const getValorDescanso = (dia) => {
            const valor = String(dia?.PROGRAMACAO || dia?.HR_ENT1 || 'F').trim().toUpperCase();
            const normalized = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (['F', 'FOLGA'].includes(normalized)) return 'F';
            if (['FER', 'FERIAS'].includes(normalized)) return 'FER';
            if (['AFA', 'AFASTAMENTO'].includes(normalized)) return 'AFA';
            if (['FXF', 'FOLGA_FIXA'].includes(normalized)) return 'F';
            return valor.slice(0, 3);
        };
        const getClasseDescanso = (dia) => {
            const programacao = String(dia?.PROGRAMACAO || dia?.programacao || '').toUpperCase();
            if (Number(dia?.FIXO_ESCALA || dia?.fixoEscala || 0) === 1 || ['FXF', 'FOLGA_FIXA'].includes(programacao)) return 'rest-cell-fixo';
            const sigla = getValorDescanso(dia);
            if (sigla === 'FER') return 'rest-cell-ferias';
            if (sigla === 'AFA') return 'rest-cell-afastamento';
            return 'rest-cell-folga';
        };
        const getHojeIsoApp = () => {
            const hoje = new Date();
            return hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
        };
        const getHojeIsoBanco = () => getHojeIsoApp();
        const getProximaSegundaIsoBanco = () => {
            const hoje = new Date(getHojeIsoApp() + 'T00:00:00');
            const day = hoje.getDay();
            const diff = day === 1 ? 7 : ((8 - day) % 7 || 7);
            hoje.setDate(hoje.getDate() + diff);
            return hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
        };
        const isDataBloqueadaParaEdicao = (dataIso) => String(dataIso || '').slice(0, 10) < getHojeIsoApp();
        const isDiaMesBloqueadoParaEdicao = (ano, mes, dia) => isDataBloqueadaParaEdicao(formatDateForDb(Number(ano), Number(mes), Number(dia)));
        const isFolgaSemanalApp = (dia) => ['F', 'FOLGA', 'FXF', 'FOLGA_FIXA'].includes(String(dia?.PROGRAMACAO || dia?.programacao || 'TRB').trim().toUpperCase());
        const isFolgaSemanalAutomaticaApp = (dia) => ['F', 'FOLGA'].includes(String(dia?.PROGRAMACAO || dia?.programacao || 'TRB').trim().toUpperCase());
        const getWeekKeyIsoApp = (dataIso) => {
            const date = new Date(String(dataIso || '').slice(0, 10) + 'T00:00:00');
            const day = date.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;
            date.setDate(date.getDate() + diffToMonday);
            return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        };
        const criticasIncluemDia = (criticas = [], registro = {}, numeroDia = null) => {
            const dataIso = String(registro?.DT || registro?.data || '').slice(0, 10);
            const dataBr = dataIso ? formatarDataTabela(dataIso) : '';
            const diaNumero = Number(numeroDia || String(dataIso).slice(8, 10));
            return (criticas || []).some((critica) => {
                const texto = String(critica || '');
                const textoLower = texto.toLowerCase();
                if (dataIso && texto.includes(dataIso)) return true;
                if (dataBr && texto.includes(dataBr)) return true;
                if (diaNumero && textoLower.includes('dia ' + diaNumero + ':')) return true;
                if (diaNumero && textoLower.includes('dia ' + diaNumero + ' ')) return true;
                return false;
            });
        };

        const normalizarDataCriticaBanco = (valor = '') => {
            const texto = String(valor || '');
            const iso = texto.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
            if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
            const br = texto.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
            if (br) return `${br[3]}-${br[2]}-${br[1]}`;
            return '';
        };

        const getCriticaCanonicalKeyBanco = (critica = '') => {
            const original = String(critica || '').trim();
            const texto = original.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const funcionario = texto.split(':')[0].trim();
            const datas = [...original.matchAll(/\b(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/g)]
                .map((match) => normalizarDataCriticaBanco(match[0]))
                .filter(Boolean)
                .sort();
            if (texto.includes('domingo') && datas.length >= 2) {
                return `${funcionario}|DOMINGO_1X1|${datas.join('|')}`;
            }
            if (texto.includes('cobertura minima') && datas.length >= 1) {
                return `COBERTURA_MINIMA|${datas[0]}`;
            }
            const dia = texto.match(/\bdia\s+(\d{1,2})\b/)?.[1] || '';
            if (texto.includes('folgas na semana')) {
                return `${funcionario}|MAX_2_FOLGAS_SEMANA|${dia}|${datas.join('|')}`;
            }
            if (texto.includes('jornada total') && datas.length >= 1) {
                return `${funcionario}|JORNADA_TOTAL|${datas[0]}`;
            }
            return texto.replace(/\s+/g, ' ');
        };

        const deduplicarCriticasBanco = (criticas = []) => {
            const map = new Map();
            (criticas || []).filter(Boolean).forEach((critica) => {
                const key = getCriticaCanonicalKeyBanco(critica);
                if (!map.has(key)) map.set(key, critica);
            });
            return [...map.values()];
        };

        const validarDiasEscalaFuncionario = (dias, nome) => {
            const errors = [];
            let ultimoTrabalho = null;
            let ultimoDomingo = null;
            const folgasPorSemana = new Map();
            const descansosPorSemana = new Map();
            const diasPorSemana = new Map();
            [...(dias || [])].sort((a,b)=>String(a.DT || a.data).localeCompare(String(b.DT || b.data))).forEach((dia) => {
                const dataIso = String(dia.DT || dia.data || '').slice(0,10);
                const data = new Date(dataIso + 'T00:00:00');
                const weekKey = getWeekKeyIsoApp(dataIso);
                diasPorSemana.set(weekKey, (diasPorSemana.get(weekKey) || 0) + 1);
                if (isProgramacaoDescanso(dia.PROGRAMACAO)) {
                    descansosPorSemana.set(weekKey, (descansosPorSemana.get(weekKey) || 0) + 1);
                }
                if (isFolgaSemanalAutomaticaApp(dia)) {
                    const totalFolgasSemana = (folgasPorSemana.get(weekKey) || 0) + 1;
                    folgasPorSemana.set(weekKey, totalFolgasSemana);
                    if (totalFolgasSemana > 2) errors.push(`${nome}: Dia ${Number(dataIso.slice(8, 10))}: possui ${totalFolgasSemana} folgas na semana iniciada em ${weekKey}; limite permitido: 2, contando domingo.`);
                }
                if (isProgramacaoDescanso(dia.PROGRAMACAO)) return;
                errors.push(...validarTurnoSimples({inicio:dia.HR_ENT1,inicioIntervalo:dia.HR_SAI1,fimIntervalo:dia.HR_ENT2,fim:dia.HR_SAI2}).map(e=>formatarDataTabela(dia.DT)+': '+e));
                if (ultimoTrabalho) {
                    const diasDiff = Math.round((data - ultimoTrabalho.data) / 86400000);
                    const descanso = ((diasDiff - 1) * 1440) + (1440 - timeToMinutes(ultimoTrabalho.HR_SAI2)) + timeToMinutes(dia.HR_ENT1);
                    if (diasDiff === 1 && descanso < timeToMinutes(regraDescansoEntreTurnosInput.value)) errors.push(`${nome}: interjornada menor que ${regraDescansoEntreTurnosInput.value} entre ${formatarDataTabela(ultimoTrabalho.DT)} e ${formatarDataTabela(dia.DT)}.`);
                    if (diasDiff > 1 && descanso < hoursToMinutes(regraDescansoPosFolgaInput.value)) errors.push(`${nome}: descanso apos folga menor que ${regraDescansoPosFolgaInput.value}h entre ${formatarDataTabela(ultimoTrabalho.DT)} e ${formatarDataTabela(dia.DT)}.`);
                }
                if (data.getDay() === 0) {
                    if (ultimoDomingo && Math.round((data - ultimoDomingo) / 86400000) === 7) errors.push(`${nome}: dois domingos trabalhados em sequencia (${formatarDataTabela(ultimoDomingo.toISOString())} e ${formatarDataTabela(dia.DT)}).`);
                    ultimoDomingo = data;
                }
                ultimoTrabalho = dia;
            });
            diasPorSemana.forEach((totalDiasSemana, weekKey) => {
                const minimoDescansosSemana = Math.min(2, Math.round((Number(totalDiasSemana) || 0) * 2 / 7));
                const totalDescansosSemana = descansosPorSemana.get(weekKey) || 0;
                if (minimoDescansosSemana > 0 && totalDescansosSemana < minimoDescansosSemana) {
                    errors.push(`${nome}: possui ${totalDescansosSemana} descanso(s) na semana iniciada em ${weekKey}; minimo esperado no 5x2: ${minimoDescansosSemana}.`);
                }
            });
            return errors;
        };

        const getTurnosFuncionarioAtual = () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return [];
            return (turnosSecaoCache || []).filter(turno => Number(turno.ESCSECAO_ID) === Number(atual.escsecaoId));
        };

        const isEscalaFuncionarioFinalizada = () => escalaFuncionarioEdicaoAtual?.status === 'FINALIZADA';

        const atualizarBotaoSalvarEscalaFuncionario = () => {
            const podeSalvar = escalaFuncionarioEdicaoAlterada && escalaFuncionarioEdicaoValidada && !isEscalaFuncionarioFinalizada();
            salvarEscalaFuncionarioBtn?.classList.toggle('hidden', !podeSalvar);
            if (salvarEscalaFuncionarioBtn) salvarEscalaFuncionarioBtn.disabled = !podeSalvar;
        };

        const invalidarValidacaoEscalaFuncionario = (critica = 'Ajuste manual pendente de validação.') => {
            escalaFuncionarioEdicaoValidada = false;
            escalaFuncionarioEdicaoAlterada = true;
            if (escalaFuncionarioEdicaoAtual) escalaFuncionarioEdicaoAtual.criticas = [critica];
            atualizarBotaoSalvarEscalaFuncionario();
        };

        const renderizarEscalaFuncionarioEdicao = () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const ref = new Date(atual.mesRef + 'T00:00:00');
            const diasNoMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
            const diasSemana = ['D','S','T','Q','Q','S','S'];
            const map = new Map(atual.dias.map(dia => [Number(String(dia.DT).slice(8,10)), dia]));
            const getWeekClass = (dia) => dia > 1 && new Date(ref.getFullYear(), ref.getMonth(), dia).getDay() === 1 ? ' week-start' : '';
            const getDiaTitle = (dia) => dia ? montarTooltipHorarioEscala(dia, { nome: atual.nome, funcao: atual.funcao, secao: atual.secao }) : '';
            const fields = [{key:'HR_ENT1',label:'ENT.'},{key:'HR_SAI1',label:'SAI.INT.'},{key:'INTERVALO',label:'INTER.'},{key:'HR_ENT2',label:'RET.INT.'},{key:'HR_SAI2',label:'SAI.'},{key:'TRABALHADAS',label:'H.TRAB'}];
            const criticasManuais = atual.dias
                .filter(dia => dia.CRITICA_MANUAL)
                .map(dia => 'Dia ' + Number(String(dia.DT).slice(8, 10)) + ': ajuste manual pendente de validacao.');
            const criticas = (atual.criticas && atual.criticas.length) ? atual.criticas : criticasManuais;
            atual.criticas = criticas;
            const criticaButton = criticas.length ? '<button type="button" class="critical-status-chip funcionario-critical-chip" title="Ver criticas do funcionario" aria-label="Ver criticas do funcionario">CRITICA</button>' : '';
            let table = '<article class="bank-employee-scale"><header><div><h3>' + escapeHtml(atual.nome) + '</h3><p>' + escapeHtml(atual.chapa + ' | ' + atual.secao + ' | ' + atual.funcao) + '</p><p class="print-aware-inline">Ciente: ___________________________________________</p></div>' + criticaButton + '</header><div class="bank-scale-scroll"><table><thead><tr><th>D.SEM</th>';
            for(let d=1;d<=diasNoMes;d++) table += '<th class="employee-day-header' + getWeekClass(d) + '">' + diasSemana[new Date(ref.getFullYear(),ref.getMonth(),d).getDay()] + '</th>';
            table += '</tr><tr><th>DIA</th>';
            for(let d=1;d<=diasNoMes;d++) {
                const dia = map.get(d);
                const bloqueado = isDiaMesBloqueadoParaEdicao(ref.getFullYear(), ref.getMonth(), d) || isEscalaFuncionarioFinalizada();
                const title = bloqueado ? 'Dia bloqueado para edicao' : 'Editar dia ' + d;
                table += '<th class="employee-day-header' + getWeekClass(d) + '"><button type="button" class="bank-day-header-button funcionario-dia-edit" data-dia="' + d + '" title="' + title + '"' + (bloqueado ? ' disabled' : '') + '>' + d + '</button></th>';
            }
            table += '</tr></thead><tbody>';
            fields.forEach(field => {
                table += '<tr class="' + (field.key === 'INTERVALO' ? 'bank-interval-row' : '') + '"><th>' + field.label + '</th>';
                for(let d=1;d<=diasNoMes;d++){
                    const dia=map.get(d);
                    if(!dia){table+='<td class="scale-day-cell empty">-</td>';continue;}
                    const descanso=isProgramacaoDescanso(dia.PROGRAMACAO);
                    let value=getValorDescanso(dia);
                    if(!descanso){
                        if(field.key==='INTERVALO') value=minutesToTime(Math.max(0,timeToMinutes(dia.HR_ENT2)-timeToMinutes(dia.HR_SAI1)));
                        else if(field.key==='TRABALHADAS') value=minutesToTime(Math.max(0,(timeToMinutes(dia.HR_SAI2)-timeToMinutes(dia.HR_ENT1))-(timeToMinutes(dia.HR_ENT2)-timeToMinutes(dia.HR_SAI1))));
                        else value=dia[field.key]||'--';
                    }
                    const domingo=new Date(ref.getFullYear(),ref.getMonth(),d).getDay()===0;
                    const cls = [
                        descanso ? 'day-off' : '',
                        descanso ? getClasseDescanso(dia) : '',
                        !descanso && Number(dia.FIXO_ESCALA || 0) === 1 ? 'fixed-work-cell' : '',
                        domingo ? 'sunday' : '',
                        getWeekClass(d).trim(),
                        dia.CRITICA_MANUAL ? 'manual-critical-day' : ''
                    ].filter(Boolean).join(' ');
                    const marker = dia.CRITICA_MANUAL && field.key === 'HR_ENT1' ? '<span class="critical-marker" title="Critica: ajuste manual">!</span>' : '';
                    table+='<td class="' + cls + '" data-dia="' + d + '" data-schedule-tooltip="' + escapeHtml(getDiaTitle(dia)) + '">' + marker + escapeHtml(value) + '</td>';
                }
                table+='</tr>';
            });
            escalaFuncionarioDetalhadaContent.innerHTML = table + '</tbody></table></div></article>';
            renderizarTabsPeriodoFuncionario();
        };

        const getChaveMesesFuncionario = (escfuncId, lojaId, ano) => String(escfuncId || '') + '|' + String(lojaId || '') + '|' + String(ano || '');

        const renderizarTabsPeriodoFuncionario = () => {
            if (!escalaFuncionarioMesTabs || !escalaFuncionarioEdicaoMes || !escalaFuncionarioEdicaoAno) return;
            const ano = Number(escalaFuncionarioEdicaoAno.value) || new Date().getFullYear();
            const mesAtual = Number(escalaFuncionarioEdicaoMes.value);
            const mesesDisponiveis = escalaFuncionarioMesesDisponiveisCache.get(getChaveMesesFuncionario(escalaFuncionarioEdicaoAtual?.escfuncId, escalaFuncionarioEdicaoAtual?.lojaId, ano)) || new Set();
            if (escalaFuncionarioAnoAtualLabel) escalaFuncionarioAnoAtualLabel.textContent = String(ano);
            escalaFuncionarioMesTabs.innerHTML = Array.from({ length: 12 }, (_, mes) => {
                const dataRef = formatDateForDb(ano, mes, 1);
                const nomeCompleto = getNomeMesTabela(dataRef);
                const nome = nomeCompleto.slice(0, 3);
                const temEscala = mesesDisponiveis.has(mes);
                const ativo = mes === mesAtual;
                const classe = ['employee-month-tab', ativo ? 'active' : '', temEscala ? 'has-scale' : 'no-scale'].filter(Boolean).join(' ');
                return '<button type="button" class="' + classe + '" data-mes="' + mes + '" data-has-scale="' + (temEscala ? '1' : '0') + '" title="' + escapeHtml(nomeCompleto) + '">' + escapeHtml(nome) + '</button>'; 
            }).join('');
        };

        const carregarMesesDisponiveisFuncionario = async (escfuncId, lojaId, ano) => {
            const chave = getChaveMesesFuncionario(escfuncId, lojaId, ano);
            if (escalaFuncionarioMesesDisponiveisCache.has(chave)) return escalaFuncionarioMesesDisponiveisCache.get(chave);
            const resultados = await Promise.all(Array.from({ length: 12 }, async (_, mes) => {
                const mesRef = formatDateForDb(ano, mes, 1);
                try {
                    const data = await apiRequest('/api/escalas/mensal?lojaId=' + encodeURIComponent(lojaId) + '&mesRef=' + encodeURIComponent(mesRef));
                    const dias = data?.escala?.dias || [];
                    return dias.some(dia => String(dia.ESCFUNC_ID) === String(escfuncId)) ? mes : null;
                } catch (error) {
                    return null;
                }
            }));
            const meses = new Set(resultados.filter(mes => mes !== null));
            escalaFuncionarioMesesDisponiveisCache.set(chave, meses);
            return meses;
        };

        const sincronizarFiltrosEdicaoFuncionario = (mesRef) => {
            if (!escalaFuncionarioEdicaoMes || !escalaFuncionarioEdicaoAno) return;
            if (!escalaFuncionarioEdicaoMes.options.length) copiarOptionsSelect(mesSelect, escalaFuncionarioEdicaoMes);
            if (!escalaFuncionarioEdicaoAno.options.length) copiarOptionsSelect(anoSelect, escalaFuncionarioEdicaoAno);
            const data = new Date(mesRef + 'T00:00:00');
            escalaFuncionarioEdicaoMes.value = String(data.getMonth());
            escalaFuncionarioEdicaoAno.value = String(data.getFullYear());
            if (escalaFuncionarioAnoAtualLabel) escalaFuncionarioAnoAtualLabel.textContent = String(data.getFullYear());
        };

        const carregarEscalaFuncionarioEdicao = async (escfuncId, lojaId, mesRef) => {
            sincronizarFiltrosEdicaoFuncionario(mesRef);
            const data = await apiRequest('/api/escalas/mensal?lojaId=' + encodeURIComponent(lojaId) + '&mesRef=' + encodeURIComponent(mesRef));
            const escala = data.escala || {};
            const dias = (escala.dias || []).filter(dia => String(dia.ESCFUNC_ID) === String(escfuncId)).map(dia => ({...dia}));
            if (!dias.length) throw new Error('Escala do funcionário não encontrada.');
            const base=dias[0];
            escalaFuncionarioEdicaoAtual={escfuncId:Number(escfuncId),lojaId:Number(lojaId),mesRef,status:escala.status,revisao:escala.revisao,chapa:base.CHAPA,nome:base.NOME||base.CHAPA,secao:base.SECAO_DESCR||base.COD_SECAO||'',funcao:base.FUNCAO_DESCR||'',escsecaoId:base.ESCSECAO_ID,escfuncaoId:base.ESCFUNCAO_ID,dias};
            escalaFuncionarioEdicaoValidada = false;
            escalaFuncionarioEdicaoAlterada = false;
            atualizarBotaoSalvarEscalaFuncionario();
            escalaFuncionarioEdicaoTitulo.textContent='Escala - '+escalaFuncionarioEdicaoAtual.nome;
            escalaFuncionarioEdicaoResumo.textContent='Loja '+lojaId+' | '+getNomeMesTabela(mesRef)+' '+mesRef.slice(0,4)+' | Revisão '+escala.revisao+' | '+escala.status;
            const finalizada=escala.status==='FINALIZADA';
            if (distribuirFolgasFuncionarioBtn) distribuirFolgasFuncionarioBtn.disabled = finalizada;
            if (atualizarFuncionarioRmBtn) atualizarFuncionarioRmBtn.disabled = finalizada;
            atualizarBotaoSalvarEscalaFuncionario();
            await carregarTiposDescansoCache(false);
            await carregarMesesDisponiveisFuncionario(escfuncId, lojaId, Number(mesRef.slice(0, 4)));
            await carregarAusenciasDaLoja(lojaId, mesRef);
            aplicarAusenciasNaEscalaFuncionarioAtual();
            const lojaTurnoAtual = turnosSecaoLojaSelect?.value;
            if (!turnosSecaoCache.length || String(lojaTurnoAtual || '') !== String(lojaId)) {
                if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = String(lojaId);
                await carregarTurnosSecaoDaLoja(true);
            }
            renderizarEscalaFuncionarioEdicao();
        };

        [escalaFuncionarioEdicaoMes, escalaFuncionarioEdicaoAno].forEach(select => select?.addEventListener('change', () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual || !escalaFuncionarioEdicaoMes || !escalaFuncionarioEdicaoAno) return;
            const novoMesRef = formatDateForDb(Number(escalaFuncionarioEdicaoAno.value), Number(escalaFuncionarioEdicaoMes.value), 1);
            window.location.hash = '/escala-funcionario/' + atual.escfuncId + '/' + atual.lojaId + '/' + novoMesRef;
        }));

        escalaFuncionarioMesTabs?.addEventListener('click', event => {
            const button = event.target.closest('.employee-month-tab');
            const atual = escalaFuncionarioEdicaoAtual;
            if (!button || !atual) return;
            if (button.dataset.hasScale !== '1') {
                showInfoModal('Este funcionario nao possui escala cadastrada neste mes.', 'info');
                return;
            }
            const novoMesRef = formatDateForDb(Number(escalaFuncionarioEdicaoAno.value), Number(button.dataset.mes), 1);
            window.location.hash = '/escala-funcionario/' + atual.escfuncId + '/' + atual.lojaId + '/' + novoMesRef;
        });

        const navegarAnoEscalaFuncionario = async (delta) => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual || !escalaFuncionarioEdicaoAno) return;
            const novoAno = (Number(escalaFuncionarioEdicaoAno.value) || new Date().getFullYear()) + delta;
            escalaFuncionarioEdicaoAno.value = String(novoAno);
            const meses = await carregarMesesDisponiveisFuncionario(atual.escfuncId, atual.lojaId, novoAno);
            renderizarTabsPeriodoFuncionario();
            if (!meses.size) {
                showInfoModal('Este funcionario nao possui escala cadastrada neste ano.', 'info');
                return;
            }
            const primeiroMes = [...meses].sort((a, b) => a - b)[0];
            const novoMesRef = formatDateForDb(novoAno, primeiroMes, 1);
            window.location.hash = '/escala-funcionario/' + atual.escfuncId + '/' + atual.lojaId + '/' + novoMesRef;
        };

        escalaFuncionarioAnoAnteriorBtn?.addEventListener('click', () => navegarAnoEscalaFuncionario(-1).catch(error => showInfoModal(error.message, 'error')));
        escalaFuncionarioAnoProximoBtn?.addEventListener('click', () => navegarAnoEscalaFuncionario(1).catch(error => showInfoModal(error.message, 'error')));

        const aplicarEdicaoDiasFuncionario = (diaSelecionado, values) => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const diaInicio = Math.max(1, Number(values.IND_APLICAR_DE || diaSelecionado));
            const diaFim = Math.max(diaInicio, Number(values.IND_APLICAR_ATE || values.IND_APLICAR_DE || diaSelecionado));
            atual.justificativaAlteracao = String(values.IND_JUSTIFICATIVA || '').trim();
            const tipoDia = values.IND_TIPO_DIA || 'TRABALHO';
            const descansoSigla = String(values.IND_TIPO_DESCANSO || 'F').toUpperCase();
            const turnoSelecionado = getTurnosFuncionarioAtual().find(turno => String(turno.ESCSECAOTURNO_ID) === String(values.IND_TURNO_ID));
            const horarioPadrao = horariosPadraoCache.find(horario => String(horario.ESCHORPAD_ID) === String(values.IND_HORARIO_PADRAO_ID));
            atual.dias.forEach((dia) => {
                const numeroDia = Number(String(dia.DT).slice(8,10));
                const dataIso = String(dia.DT || '').slice(0, 10);
                if (isDataBloqueadaParaEdicao(dataIso)) return;
                if (values.REPLICAR_MES) {
                    if (numeroDia < diaSelecionado) return;
                    if (numeroDia !== diaSelecionado && isProgramacaoDescanso(dia.PROGRAMACAO)) return;
                } else if (numeroDia < diaInicio || numeroDia > diaFim) {
                    return;
                }
                dia.JUSTIFICATIVA_ALTERACAO = atual.justificativaAlteracao;
                dia.CRITICA_MANUAL = 1;
                if (tipoDia === 'DESCANSO') {
                    dia.PROGRAMACAO = descansoSigla;
                    dia.HR_ENT1 = descansoSigla;
                    dia.HR_SAI1 = descansoSigla;
                    dia.HR_ENT2 = descansoSigla;
                    dia.HR_SAI2 = descansoSigla;
                    return;
                }
                dia.PROGRAMACAO = 'TRB';
                if (values.IND_MODO_TRABALHO === 'TURNO' && turnoSelecionado) {
                    dia.HR_ENT1 = turnoSelecionado.HR_ENT1;
                    dia.HR_SAI1 = turnoSelecionado.HR_SAI1;
                    dia.HR_ENT2 = turnoSelecionado.HR_ENT2;
                    dia.HR_SAI2 = turnoSelecionado.HR_SAI2;
                } else if (values.IND_MODO_TRABALHO === 'PADRAO' && horarioPadrao) {
                    dia.HR_ENT1 = horarioPadrao.HR_ENT1;
                    dia.HR_SAI1 = horarioPadrao.HR_SAI1;
                    dia.HR_ENT2 = horarioPadrao.HR_ENT2;
                    dia.HR_SAI2 = horarioPadrao.HR_SAI2;
                } else {
                    dia.HR_ENT1 = values.IND_HR_ENT1;
                    dia.HR_SAI1 = values.IND_HR_SAI1;
                    dia.HR_ENT2 = values.IND_HR_ENT2;
                    dia.HR_SAI2 = values.IND_HR_SAI2;
                }
            });
            invalidarValidacaoEscalaFuncionario('Ajuste manual pendente de validação.');
            renderizarEscalaFuncionarioEdicao();
        };

        escalaFuncionarioDetalhadaContent?.addEventListener('click', async event => {
            const criticalButton = event.target.closest('.funcionario-critical-chip');
            if (criticalButton) {
                const criticas = escalaFuncionarioEdicaoAtual?.criticas || [];
                showInfoModal(criticas.length ? criticas : 'Nenhuma critica pendente.', criticas.length ? 'error' : 'info');
                return;
            }
            const button=event.target.closest('.funcionario-dia-edit');
            if(!button||!escalaFuncionarioEdicaoAtual)return;
            if (button.disabled || isDataBloqueadaParaEdicao(escalaFuncionarioEdicaoAtual.mesRef.slice(0, 8) + String(button.dataset.dia).padStart(2, '0'))) {
                showInfoModal('Dias ja passados nao podem ser alterados manualmente.', 'info');
                return;
            }
            const dia=escalaFuncionarioEdicaoAtual.dias.find(item=>Number(String(item.DT).slice(8,10))===Number(button.dataset.dia));
            if(!dia)return;
            const numeroDia = Number(button.dataset.dia);
            const descansoAtual = isProgramacaoDescanso(dia.PROGRAMACAO);
            const values=await abrirModalEdicaoDiaPadrao({
                title:'Editar dia '+formatarDataTabela(dia.DT)+(dia.AUSENCIA_OBRIGATORIA ? ' - ausencia obrigatoria' : ''),
                ids:{ tipoDia:'IND_TIPO_DIA', descanso:'IND_TIPO_DESCANSO', hrEnt1:'IND_HR_ENT1', hrSai1:'IND_HR_SAI1', hrEnt2:'IND_HR_ENT2', hrSai2:'IND_HR_SAI2', justificativa:'IND_JUSTIFICATIVA' },
                dia,
                descansoAtual
            });
            if(!values)return;
            aplicarEdicaoDiasFuncionario(numeroDia, values);
        });

        const distribuirFolgasFuncionario = () => {
            if (!hasPermission('escalas-funcionarios', 'editar')) {
                showInfoModal('Usuario sem permissao para editar escala do funcionario.', 'error');
                return;
            }
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const dias = [...atual.dias].sort((a,b) => String(a.DT).localeCompare(String(b.DT)));
            const horarioBase = dias.find(d => !isProgramacaoDescanso(d.PROGRAMACAO) && d.HR_ENT1 !== 'F') || { HR_ENT1:'08:00', HR_SAI1:'12:00', HR_ENT2:'13:00', HR_SAI2:'16:20' };
            const diasEditaveis = dias.filter(d => !isDataBloqueadaParaEdicao(String(d.DT).slice(0, 10)));
            if (!diasEditaveis.length) {
                showInfoModal('Nao ha dias futuros disponiveis para redistribuir neste mes.', 'info');
                return;
            }
            diasEditaveis.forEach(d => { d.PROGRAMACAO='TRB'; d.HR_ENT1=horarioBase.HR_ENT1; d.HR_SAI1=horarioBase.HR_SAI1; d.HR_ENT2=horarioBase.HR_ENT2; d.HR_SAI2=horarioBase.HR_SAI2; });
            const semanas = new Map();
            diasEditaveis.forEach(dia => {
                const data = new Date(String(dia.DT).slice(0,10) + 'T00:00:00');
                const segunda = new Date(data); segunda.setDate(data.getDate() - ((data.getDay()+6)%7));
                const key = segunda.toISOString().slice(0,10);
                if (!semanas.has(key)) semanas.set(key, []);
                semanas.get(key).push({dia,data});
            });
            [...semanas.values()].forEach((semana,index) => {
                const disponiveis = semana.sort((a,b)=>a.data-b.data);
                if (!disponiveis.length) return;
                const domingo = disponiveis.find(item => item.data.getDay()===0);
                const folgas = [];
                if (domingo && index % 2 === Number(atual.escfuncId) % 2) folgas.push(domingo);
                const weekdays = disponiveis.filter(item => item.data.getDay()!==0);
                const candidatos = [Number(atual.escfuncId)+index, Number(atual.escfuncId)+index+3, Number(atual.escfuncId)+index+1];
                candidatos.forEach(seed => { if (folgas.length>=2 || !weekdays.length) return; const item=weekdays[seed%weekdays.length]; if (!folgas.includes(item)) folgas.push(item); });
                if (folgas.length<2) disponiveis.forEach(item=>{if(folgas.length<2&&!folgas.includes(item))folgas.push(item);});
                folgas.forEach(({dia}) => { dia.PROGRAMACAO='F'; dia.HR_ENT1=dia.HR_SAI1=dia.HR_ENT2=dia.HR_SAI2='F'; });
            });
            const folgasSemana = new Map();
            dias.forEach(dia => {
                if (isFolgaSemanalApp(dia)) {
                    const weekKey = getWeekKeyIsoApp(String(dia.DT).slice(0, 10));
                    folgasSemana.set(weekKey, (folgasSemana.get(weekKey) || 0) + 1);
                }
            });
            let consecutivos=0;
            dias.forEach(dia => {
                if(isProgramacaoDescanso(dia.PROGRAMACAO)){consecutivos=0;return;}
                consecutivos++;
                const weekKey = getWeekKeyIsoApp(String(dia.DT).slice(0,10));
                if(consecutivos>5 && !isDataBloqueadaParaEdicao(String(dia.DT).slice(0,10)) && (folgasSemana.get(weekKey) || 0) < 2){
                    dia.PROGRAMACAO='F';dia.HR_ENT1=dia.HR_SAI1=dia.HR_ENT2=dia.HR_SAI2='F';
                    folgasSemana.set(weekKey, (folgasSemana.get(weekKey) || 0) + 1);
                    consecutivos=0;
                }
            });
            invalidarValidacaoEscalaFuncionario('Distribuição de folgas pendente de validação.');
            renderizarEscalaFuncionarioEdicao();
            showInfoModal('Folgas 5x2 distribuídas. Revise e valide antes de salvar.','success');
        };
        distribuirFolgasFuncionarioBtn?.addEventListener('click',distribuirFolgasFuncionario);

        const validarEscalaFuncionarioAtual = () => {
            const atual=escalaFuncionarioEdicaoAtual;if(!atual)return false; const errors=validarDiasEscalaFuncionario(atual.dias, atual.nome); let consecutivos=0;
            [...atual.dias].sort((a,b)=>String(a.DT).localeCompare(String(b.DT))).forEach(dia=>{if(isProgramacaoDescanso(dia.PROGRAMACAO)){consecutivos=0;return;} consecutivos++; if(consecutivos>getMaxDiasConsecutivos5x2())errors.push('Mais de '+getMaxDiasConsecutivos5x2()+' dias consecutivos em '+formatarDataTabela(dia.DT)+'.');});
            atual.criticas = errors;
            escalaFuncionarioEdicaoValidada = errors.length === 0;
            if (!errors.length) atual.dias.forEach(dia => { delete dia.CRITICA_MANUAL; });
            renderizarEscalaFuncionarioEdicao();
            atualizarBotaoSalvarEscalaFuncionario();
            showInfoModal(errors.length?errors:'A escala do funcionário foi validada com sucesso.',errors.length?'error':'success'); return errors.length===0;
        };
        validarEscalaFuncionarioBtn?.addEventListener('click',validarEscalaFuncionarioAtual);
        imprimirEscalaFuncionarioBtn?.addEventListener('click',()=>{if(!escalaFuncionarioEdicaoAtual)return;printContainer.innerHTML='<div class="print-title">Escala - '+escapeHtml(escalaFuncionarioEdicaoAtual.nome)+'</div>'+escalaFuncionarioDetalhadaContent.innerHTML;window.print();});

        atualizarFuncionarioRmBtn?.addEventListener('click', async () => {
            if (!hasPermission('escalas-funcionarios', 'editar')) {
                showInfoModal('Usuario sem permissao para atualizar escala do funcionario.', 'error');
                return;
            }
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const confirmacao = await showInputModal({
                title: 'Atualizar Funcionario pelo RM',
                inputs: [{ type: 'message', text: 'O sistema consultara as folgas do RM para este funcionario e criara uma nova revisao somente se houver divergencia com a escala local.' }],
                cancelText: 'Cancelar',
                confirmText: 'Atualizar'
            });
            if (!confirmacao) return;
            atualizarFuncionarioRmBtn.disabled = true;
            try {
                const result = await apiRequest('/api/escalas/funcionario/sincronizar-rm', {
                    method: 'POST',
                    body: JSON.stringify({
                        lojaId: atual.lojaId,
                        mesRef: atual.mesRef,
                        escfuncId: atual.escfuncId
                    })
                });
                const alteracoes = result.saved?.alteracoes?.length || 0;
                const folgasRm = result.rm?.folgas?.length || 0;
                const mensagem = result.saved?.alterado
                    ? 'Funcionario atualizado pelo RM. Folgas RM: ' + folgasRm + '. Dias alterados: ' + alteracoes + '. Nova revisao: ' + result.saved.revisao + '.'
                    : 'Funcionario ja estava sincronizado com o RM. Folgas RM: ' + folgasRm + '.';
                showInfoModal(mensagem, result.saved?.alterado ? 'success' : 'info');
                await carregarEscalaFuncionarioEdicao(atual.escfuncId, atual.lojaId, atual.mesRef);
            } catch (error) {
                showInfoModal(error.details ? error.details.join(' ') : 'Nao foi possivel atualizar o funcionario pelo RM: ' + error.message, 'error');
            } finally {
                if (atualizarFuncionarioRmBtn) atualizarFuncionarioRmBtn.disabled = isEscalaFuncionarioFinalizada();
            }
        });

        salvarEscalaFuncionarioBtn?.addEventListener('click', async () => {
            if (!hasPermission('escalas-funcionarios', 'editar')) {
                showInfoModal('Usuário sem permissão para salvar escala do funcionário.', 'error');
                return;
            }
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            if (!escalaFuncionarioEdicaoAlterada) {
                showInfoModal('Nenhuma alteração pendente para salvar.', 'info');
                atualizarBotaoSalvarEscalaFuncionario();
                return;
            }
            if (!escalaFuncionarioEdicaoValidada || (atual.criticas || []).length) {
                showInfoModal('Valide a escala e corrija todas as críticas antes de salvar.', 'error');
                atualizarBotaoSalvarEscalaFuncionario();
                return;
            }
            const funcionario = {
                escfuncId: atual.escfuncId,
                chapa: atual.chapa,
                escsecaoId: atual.escsecaoId,
                escfuncaoId: atual.escfuncaoId,
                dias: atual.dias.map((dia) => {
                    const descanso = isProgramacaoDescanso(dia.PROGRAMACAO);
                    const sigla = getValorDescanso(dia);
                    return {
                        data: String(dia.DT).slice(0, 10),
                        hrEnt1: descanso ? null : dia.HR_ENT1,
                        hrSai1: descanso ? null : dia.HR_SAI1,
                        hrEnt2: descanso ? null : dia.HR_ENT2,
                        hrSai2: descanso ? null : dia.HR_SAI2,
                        programacao: descanso ? sigla : 'TRB',
                        justificativa: dia.JUSTIFICATIVA_ALTERACAO || atual.justificativaAlteracao || null
                    };
                })
            };
            salvarEscalaFuncionarioBtn.disabled = true;
            try {
                await apiRequest('/api/escalas/funcionario/revisao', {
                    method: 'POST',
                    body: JSON.stringify({
                        lojaId: atual.lojaId,
                        mesRef: atual.mesRef,
                        funcionarios: [funcionario],
                        oficializada: 1,
                        justificativa: atual.justificativaAlteracao || null
                    })
                });
                showInfoModal('Escala do funcionário salva em uma nova revisão oficializada.', 'success');
                await carregarEscalaFuncionarioEdicao(atual.escfuncId, atual.lojaId, atual.mesRef);
            } catch (error) {
                showInfoModal(error.details ? error.details.join(' ') : 'Não foi possível salvar a escala do funcionário: ' + error.message, 'error');
            } finally {
                atualizarBotaoSalvarEscalaFuncionario();
            }
        });

        function renderizarPaginacaoAcessos(pagination = {}) {
            acessosPaginationState = {
                ...acessosPaginationState,
                page: Number(pagination.page || acessosPaginationState.page || 1),
                pageSize: Number(pagination.pageSize || acessosPaginationState.pageSize || 20),
                total: Number(pagination.total || 0),
                totalPages: Math.max(1, Number(pagination.totalPages || 1))
            };

            const { page, pageSize, total, totalPages } = acessosPaginationState;
            const inicio = total === 0 ? 0 : ((page - 1) * pageSize) + 1;
            const fim = Math.min(total, page * pageSize);
            if (acessosPaginationResumo) {
                acessosPaginationResumo.textContent = total === 0
                    ? '0 usuário(s)'
                    : `${inicio}-${fim} de ${total} usuário(s)`;
            }
            if (acessosPaginaAtual) acessosPaginaAtual.textContent = `Página ${page} de ${totalPages}`;
            if (acessosPaginaAnteriorBtn) acessosPaginaAnteriorBtn.disabled = page <= 1;
            if (acessosProximaPaginaBtn) acessosProximaPaginaBtn.disabled = page >= totalPages;
            if (acessosPageSizeSelect && String(acessosPageSizeSelect.value) !== String(pageSize)) {
                acessosPageSizeSelect.value = String(pageSize);
            }
        }

        function renderizarAcessosTela(usuarios) {
            tabelaAcessosBody.innerHTML = '';

            if (!usuarios || usuarios.length === 0) {
                tabelaAcessosBody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">Nenhum usuário encontrado.</td></tr>';
                return;
            }

            usuarios.forEach(usuario => {
                const statusLabel = usuario.STATUS === 'A' ? 'Ativo' : 'Inativo';
                const lojasArray = Array.isArray(usuario.LOJAS) ? usuario.LOJAS : [];
                const lojas = lojasArray.length <= 4 ? lojasArray.join(', ') : `${lojasArray.length} lojas selecionadas`;
                const isAdmin = hasPermission('acessos', 'editar') || hasPermission('acessos', 'inativar');
                const row = `
                    <tr data-usuario-id="${usuario.USUARIO_ID}">
                        <td data-label="Login">${escapeHtml(usuario.LOGIN || '')}</td>
                        <td data-label="Nome">${escapeHtml(usuario.NOME || '')}</td>
                        <td data-label="Perfil de Acesso">${escapeHtml(usuario.PERFIL || '')}</td>
                        <td data-label="Status">${escapeHtml(statusLabel)}</td>
                        <td data-label="Lojas Permitidas">
                            <span title="${escapeHtml(lojasArray.join(', '))}">${escapeHtml(lojas || '-')}</span>
                        </td>
                        <td data-label="Acoes" class="actions-cell">
                            ${isAdmin ? `
                                <button class="action-btn-table edit-usuario" data-id="${usuario.USUARIO_ID}" title="Editar usuário">
                                    <span class="material-symbols-outlined">edit</span>
                                    Editar
                                </button>
                                <button class="action-btn-table toggle-usuario" data-id="${usuario.USUARIO_ID}" data-status="${usuario.STATUS}" title="Alterar status">
                                    <span class="material-symbols-outlined">block</span>
                                    ${usuario.STATUS === 'A' ? 'Inativar' : 'Reativar'}
                                </button>
                            ` : '-'}
                        </td>
                    </tr>
                `;
                tabelaAcessosBody.innerHTML += row;
            });
            if (!hasPermission('acessos', 'editar')) {
                tabelaAcessosBody.querySelectorAll('.edit-usuario').forEach(button => button.remove());
            }
            if (!hasPermission('acessos', 'inativar')) {
                tabelaAcessosBody.querySelectorAll('.toggle-usuario').forEach(button => button.remove());
            }
            tabelaAcessosBody.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        
        }

        async function carregarAcessosTela(showSuccess = true, page = acessosPaginationState.page) {
            const pageSize = Number(acessosPageSizeSelect?.value || acessosPaginationState.pageSize || 20);
            const search = String(acessosPesquisaInput?.value || '').trim();
            const params = new URLSearchParams({
                page: String(Math.max(1, Number(page) || 1)),
                pageSize: String(pageSize)
            });
            if (search) params.set('search', search);
            acessosPaginationState = { ...acessosPaginationState, page: Number(params.get('page')), pageSize, search };

            tabelaAcessosBody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">Carregando usuários...</td></tr>';
            const data = await apiRequest('/api/acessos/usuarios?' + params.toString());
            if ((data.usuarios || []).length === 0 && data.pagination?.total > 0 && Number(data.pagination?.page || 1) > Number(data.pagination?.totalPages || 1)) {
                await carregarAcessosTela(false, data.pagination.totalPages);
                return;
            }
            usuariosAcessoCache = data.usuarios || [];
            renderizarPaginacaoAcessos(data.pagination || {});
            renderizarAcessosTela(usuariosAcessoCache);
            if (showSuccess) {
                showInfoModal(`${usuariosAcessoCache.length} usuário(s) carregado(s) nesta página.`, 'success');
            }
        
        }

        const getSecaoLiberacaoLabel = (secao) => {
            const codigo = secao.COD_SECAO ? String(secao.COD_SECAO) : String(secao.ESCSECAO_ID || '');
            return `${codigo} - ${secao.DESCR || 'Secao'}`;
        };

        const renderLiberacaoSecoesLista = (target, secoes, tipo) => {
            if (!target) return;
            if (!secoes.length) {
                target.innerHTML = '<p class="section-access-empty">Nenhuma secao encontrada.</p>';
                return;
            }
            const selecionadas = tipo === 'liberadas'
                ? liberacaoSecoesCache.selecionadasLiberadas
                : liberacaoSecoesCache.selecionadasDisponiveis;
            target.innerHTML = secoes.map((secao) => {
                const id = String(secao.ESCSECAO_ID);
                const active = selecionadas.has(id) ? ' active' : '';
                return `<button type="button" class="section-access-item${active}" data-list="${tipo}" data-id="${escapeHtml(id)}"><strong>${escapeHtml(getSecaoLiberacaoLabel(secao))}</strong><span>Loja ${escapeHtml(secao.LOJA || liberacaoSecoesLojaSelect?.value || '')}</span></button>`;
            }).join('');
        };

        const renderLiberacaoSecoes = () => {
            const termo = normalizarTextoFiltro(liberacaoSecoesPesquisaInput?.value || '');
            const liberadasIds = liberacaoSecoesCache.liberadas;
            const filtrar = (secao) => !termo || normalizarTextoFiltro(getSecaoLiberacaoLabel(secao)).includes(termo);
            const disponiveis = liberacaoSecoesCache.secoes.filter(secao => !liberadasIds.has(String(secao.ESCSECAO_ID)) && filtrar(secao));
            const liberadas = liberacaoSecoesCache.secoes.filter(secao => liberadasIds.has(String(secao.ESCSECAO_ID)) && filtrar(secao));
            renderLiberacaoSecoesLista(liberacaoSecoesDisponiveisLista, disponiveis, 'disponiveis');
            renderLiberacaoSecoesLista(liberacaoSecoesLiberadasLista, liberadas, 'liberadas');
            if (liberacaoSecoesDisponiveisCount) liberacaoSecoesDisponiveisCount.textContent = String(disponiveis.length);
            if (liberacaoSecoesLiberadasCount) liberacaoSecoesLiberadasCount.textContent = String(liberadas.length);
            if (liberacaoSecoesResumo) {
                const usuario = liberacaoSecoesCache.usuarios.find(item => String(item.USUARIO_ID) === String(liberacaoSecoesUsuarioSelect?.value));
                liberacaoSecoesResumo.textContent = usuario
                    ? `${usuario.NOME || usuario.LOGIN} possui ${liberacaoSecoesCache.liberadas.size} secao(oes) liberada(s) na loja ${liberacaoSecoesLojaSelect?.value || '-'}.`
                    : 'Selecione um usuario para visualizar as secoes liberadas.';
            }
            if (salvarLiberacaoSecoesBtn) {
                salvarLiberacaoSecoesBtn.disabled = !liberacaoSecoesCache.tableReady || !liberacaoSecoesUsuarioSelect?.value || !hasPermission('liberacao-secoes', 'editar');
            }
        };

        const popularUsuariosLiberacaoSecoes = (usuarios = []) => {
            if (!liberacaoSecoesUsuarioSelect) return;
            const atual = liberacaoSecoesUsuarioSelect.value;
            liberacaoSecoesUsuarioSelect.innerHTML = usuarios.length
                ? usuarios.map(usuario => `<option value="${escapeHtml(usuario.USUARIO_ID)}">${escapeHtml(usuario.LOGIN || '')} - ${escapeHtml(usuario.NOME || '')}</option>`).join('')
                : '<option value="">Nenhum usuario para esta loja</option>';
            if (usuarios.some(usuario => String(usuario.USUARIO_ID) === String(atual))) {
                liberacaoSecoesUsuarioSelect.value = atual;
            } else if (usuarios.length) {
                liberacaoSecoesUsuarioSelect.value = String(usuarios[0].USUARIO_ID);
            }
        };

        const carregarLiberacaoSecoesTela = async () => {
            if (!liberacaoSecoesPage) return;
            if (!lojasPermitidasCache.length) await carregarLojasEscala();
            popularLojasLiberacaoSecoes();
            const lojaId = liberacaoSecoesLojaSelect?.value || lojasPermitidasCache[0] || '';
            if (!lojaId) return;
            const params = new URLSearchParams({ lojaId });
            const data = await apiRequest('/api/acessos/secoes-usuario?' + params.toString());
            liberacaoSecoesCache = {
                usuarios: data.usuarios || [],
                secoes: data.secoes || [],
                liberadas: new Set((data.secoesLiberadas || []).map(String)),
                selecionadasDisponiveis: new Set(),
                selecionadasLiberadas: new Set(),
                tableReady: data.tableReady !== false
            };
            popularUsuariosLiberacaoSecoes(liberacaoSecoesCache.usuarios);

            const usuarioSelecionado = liberacaoSecoesUsuarioSelect?.value;
            if (usuarioSelecionado) {
                const nextParams = new URLSearchParams({ lojaId, usuarioId: usuarioSelecionado });
                const usuarioData = await apiRequest('/api/acessos/secoes-usuario?' + nextParams.toString());
                liberacaoSecoesCache.liberadas = new Set((usuarioData.secoesLiberadas || []).map(String));
                liberacaoSecoesCache.tableReady = usuarioData.tableReady !== false;
            }

            if (!liberacaoSecoesCache.tableReady) {
                showInfoModal('Tabela SGN_ESC_USUARIO_SECAO nao encontrada. Rode a migration antes de salvar liberacoes.', 'info');
            }
            renderLiberacaoSecoes();
        };

        const moverLiberacaoSecoes = (origem, destino, todos = false) => {
            const ids = todos
                ? liberacaoSecoesCache.secoes
                    .filter(secao => origem === 'disponiveis' ? !liberacaoSecoesCache.liberadas.has(String(secao.ESCSECAO_ID)) : liberacaoSecoesCache.liberadas.has(String(secao.ESCSECAO_ID)))
                    .map(secao => String(secao.ESCSECAO_ID))
                : [...(origem === 'disponiveis' ? liberacaoSecoesCache.selecionadasDisponiveis : liberacaoSecoesCache.selecionadasLiberadas)];
            ids.forEach(id => {
                if (destino === 'liberadas') liberacaoSecoesCache.liberadas.add(id);
                else liberacaoSecoesCache.liberadas.delete(id);
            });
            liberacaoSecoesCache.selecionadasDisponiveis.clear();
            liberacaoSecoesCache.selecionadasLiberadas.clear();
            renderLiberacaoSecoes();
        };

        const toggleSelecaoLiberacaoSecao = (event) => {
            const button = event.target.closest('.section-access-item');
            if (!button) return;
            const targetSet = button.dataset.list === 'liberadas'
                ? liberacaoSecoesCache.selecionadasLiberadas
                : liberacaoSecoesCache.selecionadasDisponiveis;
            const id = String(button.dataset.id || '');
            if (targetSet.has(id)) targetSet.delete(id);
            else targetSet.add(id);
            renderLiberacaoSecoes();
        };

        liberacaoSecoesDisponiveisLista?.addEventListener('click', toggleSelecaoLiberacaoSecao);
        liberacaoSecoesLiberadasLista?.addEventListener('click', toggleSelecaoLiberacaoSecao);
        liberacaoSecoesPesquisaInput?.addEventListener('input', renderLiberacaoSecoes);
        liberacaoSecoesLojaSelect?.addEventListener('change', () => {
            if (liberacaoSecoesUsuarioSelect) liberacaoSecoesUsuarioSelect.value = '';
            carregarLiberacaoSecoesTela().catch(error => showInfoModal(error.message, 'error'));
        });
        liberacaoSecoesUsuarioSelect?.addEventListener('change', () => carregarLiberacaoSecoesTela().catch(error => showInfoModal(error.message, 'error')));
        liberacaoSecoesAddBtn?.addEventListener('click', () => moverLiberacaoSecoes('disponiveis', 'liberadas'));
        liberacaoSecoesAddAllBtn?.addEventListener('click', () => moverLiberacaoSecoes('disponiveis', 'liberadas', true));
        liberacaoSecoesRemoveBtn?.addEventListener('click', () => moverLiberacaoSecoes('liberadas', 'disponiveis'));
        liberacaoSecoesRemoveAllBtn?.addEventListener('click', () => moverLiberacaoSecoes('liberadas', 'disponiveis', true));
        salvarLiberacaoSecoesBtn?.addEventListener('click', async () => {
            if (!hasPermission('liberacao-secoes', 'editar')) {
                showInfoModal('Usuario sem permissao para editar liberacao de secoes.', 'error');
                return;
            }
            const usuarioId = Number(liberacaoSecoesUsuarioSelect?.value);
            const lojaId = Number(liberacaoSecoesLojaSelect?.value);
            if (!usuarioId || !lojaId) {
                showInfoModal('Selecione loja e usuario antes de salvar.', 'error');
                return;
            }
            salvarLiberacaoSecoesBtn.disabled = true;
            try {
                const data = await apiRequest('/api/acessos/secoes-usuario', {
                    method: 'PUT',
                    body: JSON.stringify({
                        USUARIO_ID: usuarioId,
                        LOJA: lojaId,
                        SECOES: [...liberacaoSecoesCache.liberadas].map(Number)
                    })
                });
                liberacaoSecoesCache.liberadas = new Set((data.secoesLiberadas || []).map(String));
                showInfoModal('Liberacao de secoes salva com sucesso.', 'success');
                renderLiberacaoSecoes();
            } catch (error) {
                showInfoModal(formatApiError(error), 'error');
            } finally {
                salvarLiberacaoSecoesBtn.disabled = !hasPermission('liberacao-secoes', 'editar');
            }
        });

        tabelaAcessosBody.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-usuario');
            const toggleButton = event.target.closest('.toggle-usuario');
            const actionButton = editButton || toggleButton;
            if (!actionButton) return;
            if (editButton && !hasPermission('acessos', 'editar')) {
                showInfoModal('Usuario sem permissao para editar usuarios.', 'error');
                return;
            }
            if (toggleButton && !hasPermission('acessos', 'inativar')) {
                showInfoModal('Usuario sem permissao para inativar usuarios.', 'error');
                return;
            }

            const usuario = usuariosAcessoCache.find(item => Number(item.USUARIO_ID) === Number(actionButton.dataset.id));
            if (!usuario) {
                showInfoModal('Usuário não encontrado.', 'error');
                return;
            }

            try {
                if (toggleButton) {
                    const novoStatus = usuario.STATUS === 'A' ? 'I' : 'A';
                    await apiRequest(`/api/acessos/usuarios/${encodeURIComponent(usuario.USUARIO_ID)}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ STATUS: novoStatus })
                    });
                    await carregarAcessosTela(false);
                    showInfoModal(novoStatus === 'A' ? 'Usuário reativado.' : 'Usuário inativado.', 'success');
                    return;
                }

                const perfilOptions = await getPerfilAcessoOptions(usuario.PERFIL || 'OPERADOR');
                const values = await showInputModal({
                    title: `Editar usuário - ${usuario.LOGIN}`,
                    inputs: [
                        { label: 'Nome', type: 'text', id: 'NOME', value: usuario.NOME || '', required: true },
                        { label: 'Perfil de Acesso', type: 'select', id: 'PERFIL', value: usuario.PERFIL || perfilOptions[0]?.value || 'OPERADOR', options: perfilOptions, required: true },
                        { label: 'Status', type: 'select', id: 'STATUS', value: usuario.STATUS || 'A', options: [{ value: 'A', label: 'Ativo' }, { value: 'I', label: 'Inativo' }], required: true },
                        { label: 'Lojas permitidas', type: 'checkbox-group', id: 'LOJAS', value: (usuario.LOJAS || []).map(String), options: getLojasPermitidasOptions(usuario.LOJAS || []), required: true }
                    ],
                    confirmText: 'Salvar'
                });
                if (!values) return;

                await apiRequest(`/api/acessos/usuarios/${encodeURIComponent(usuario.USUARIO_ID)}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        NOME: values.NOME,
                        PERFIL: values.PERFIL,
                        STATUS: values.STATUS,
                        LOJAS: (values.LOJAS || []).map(loja => Number(loja)).filter(Boolean)
                    })
                });
                if (String(usuario.USUARIO_ID) === String(usuarioSessaoCache?.sub)) {
                    await carregarUsuarioSessao();
                    await carregarLojasEscala();
                    await carregarFuncionariosDaLoja(false);
                }
                await carregarAcessosTela(false);
                showInfoModal('Usuário atualizado com sucesso.', 'success');
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const carregarAusenciasDaLoja = async (lojaInformada = '', mesRefInformado = '') => {
            const loja = lojaInformada || lojaEscalaSelect.value;
            const periodoData = mesRefInformado ? new Date(mesRefInformado + 'T00:00:00') : null;
            const ano = periodoData ? periodoData.getFullYear() : parseInt(anoSelect.value, 10);
            const mes = periodoData ? periodoData.getMonth() : parseInt(mesSelect.value, 10);
            if (!loja || Number.isNaN(ano) || Number.isNaN(mes)) {
                ausenciasLojaCache = [];
                return [];
            }

            const inicio = formatDateForDb(ano, mes, 1);
            const fim = formatDateForDb(ano, mes, new Date(ano, mes + 1, 0).getDate());
            const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/ausencias?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
            ausenciasLojaCache = data.ausencias || [];
            return ausenciasLojaCache;
        };

        const ausenciaCobreDia = (ausencia, dataIso) => {
            const inicio = String(ausencia.DT_INIC || '').slice(0, 10);
            const fim = String(ausencia.DT_FIM || ausencia.DT_INIC || '').slice(0, 10);
            return inicio <= dataIso && fim >= dataIso;
        };

        const encontrarAusenciaFuncionario = (escfuncId, chapa, dataIso) => {
            return ausenciasLojaCache.find(ausencia => {
                const mesmoFuncionario = Number(ausencia.ESCFUNC_ID) === Number(escfuncId) || String(ausencia.CHAPA) === String(chapa);
                return mesmoFuncionario && ausenciaCobreDia(ausencia, dataIso);
            });
        };

        const getSiglaDescansoPorMotivo = (motivo) => {
            const normalizado = normalizarTextoFiltro(motivo || '');
            const tipo = tiposDescansoCache.find(item => {
                const descr = normalizarTextoFiltro(item.DESCR || '');
                const sigla = normalizarTextoFiltro(item.SIGLA || '');
                return normalizado.includes(descr) || descr.includes(normalizado) || normalizado === sigla;
            });
            return String(tipo?.SIGLA || (normalizado.includes('ferias') ? 'FER' : 'F')).toUpperCase().slice(0, 3);
        };

        const aplicarAusenciasNaEscalaFuncionarioAtual = () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual || ausenciasLojaCache.length === 0) return [];
            const mensagens = [];
            atual.dias.forEach(dia => {
                const dataIso = String(dia.DT || '').slice(0, 10);
                const ausencia = encontrarAusenciaFuncionario(atual.escfuncId, atual.chapa, dataIso);
                if (!ausencia) return;
                const sigla = getSiglaDescansoPorMotivo(ausencia.MOTIVO);
                dia.PROGRAMACAO = sigla;
                dia.HR_ENT1 = sigla;
                dia.HR_SAI1 = sigla;
                dia.HR_ENT2 = sigla;
                dia.HR_SAI2 = sigla;
                dia.AUSENCIA_OBRIGATORIA = 1;
                dia.MOTIVO_AUSENCIA = ausencia.MOTIVO || 'ausencia';
                mensagens.push(dataIso + ' (' + dia.MOTIVO_AUSENCIA + ')');
            });
            return mensagens;
        };

        const marcarCelulaFolgaAusencia = (cell, isSunday, motivo) => {
            cell.textContent = 'F';
            cell.dataset.ausenciaObrigatoria = '1';
            cell.title = `Ausência: ${motivo || 'ausência'}`;
            cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');
            if (isSunday) {
                cell.classList.add('bg-orange-600', 'text-white', 'font-bold');
            } else {
                cell.classList.add('bg-red-300', 'text-white', 'font-bold');
            }
        };

        const aplicarAusenciasNoEsqueleto = () => {
            const table = document.getElementById('tabela-esqueleto');
            if (!table || ausenciasLojaCache.length === 0) return [];

            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);
            const mensagens = [];

            table.querySelectorAll('tbody tr').forEach(row => {
                const escfuncId = row.dataset.escfuncId;
                const chapa = row.dataset.chapa;
                const nome = row.querySelector('.collaborator-name-span')?.textContent || chapa;
                if (!escfuncId && !chapa) return;

                row.querySelectorAll('.escala-cell').forEach(cell => {
                    const dia = parseInt(cell.dataset.dia, 10);
                    const dataIso = formatDateForDb(ano, mes, dia);
                    const ausencia = encontrarAusenciaFuncionario(escfuncId, chapa, dataIso);
                    if (!ausencia) return;

                    const isSunday = new Date(ano, mes, dia).getDay() === 0;
                    marcarCelulaFolgaAusencia(cell, isSunday, ausencia.MOTIVO);
                    mensagens.push(`${nome}: folga obrigatória em ${dataIso} (${ausencia.MOTIVO || 'ausência'}).`);
                });
            });

            atualizarContagemEsqueleto();
            return mensagens;
        };

        const aplicarAusenciasNaDetalhada = () => {
            if (ausenciasLojaCache.length === 0) return [];

            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);
            const mensagens = [];

            detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada').forEach(colabDiv => {
                const escfuncId = colabDiv.dataset.escfuncId;
                const chapa = colabDiv.dataset.chapa;
                const nome = colabDiv.querySelector('h3')?.textContent || chapa;
                if (!escfuncId && !chapa) return;

                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;
                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const dataIso = formatDateForDb(ano, mes, dia);
                    const ausencia = encontrarAusenciaFuncionario(escfuncId, chapa, dataIso);
                    if (!ausencia) continue;

                    const isSunday = new Date(ano, mes, dia).getDay() === 0;
                    colabDiv.querySelectorAll('tbody tr').forEach(row => {
                        const cell = row.cells[dia];
                        if (!cell) return;
                        cell.textContent = 'F';
                        cell.dataset.ausenciaObrigatoria = '1';
                        cell.title = `Ausência: ${ausencia.MOTIVO || 'ausência'}`;
                        cell.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                        if (isSunday) {
                            cell.classList.add('bg-orange-500', 'text-white');
                        } else {
                            cell.classList.add('bg-red-100');
                        }
                    });
                    mensagens.push(`${nome}: folga obrigatória em ${dataIso} (${ausencia.MOTIVO || 'ausência'}).`);
                }
            });

            return mensagens;
        };

        const carregarFuncionariosDaLoja = async (silent = false, lojaInformada = '') => {
            const loja = lojaInformada || lojaEscalaSelect.value;
            if (!loja) {
                funcionariosLojaCache = [];
                ausenciasLojaCache = [];
                funcionariosStatus.textContent = 'Nenhuma loja selecionada';
                atualizarContadoresHome();
                return [];
            }

            funcionariosStatus.textContent = 'Carregando...';
            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios`);
                funcionariosLojaCache = data.funcionarios || [];
                await carregarAusenciasDaLoja(loja);
                aplicarAusenciasNoEsqueleto();
                atualizarContadoresHome();
                funcionariosStatus.textContent = `${funcionariosLojaCache.length} funcionário(s), ${ausenciasLojaCache.length} ausência(s)`;
                if (!silent) {
                    showInfoModal(`${funcionariosLojaCache.length} funcionário(s) carregado(s) da loja ${loja}.`, 'success');
                }
                return funcionariosLojaCache;
            } catch (error) {
                funcionariosLojaCache = [];
                funcionariosStatus.textContent = 'Erro ao carregar';
                atualizarContadoresHome();
                if (!silent) {
                    showInfoModal(error.message, 'error');
                }
                return [];
            }
        };

        const getEscalasSalvas = () => {
            return escalasSalvasCache;
        };

        const salvarEscalasNoStorage = async (escalas) => {
            escalasSalvasCache = Array.isArray(escalas) ? escalas : [];
            await apiRequest('/api/state/escalas', {
                method: 'PUT',
                body: JSON.stringify({ escalasSalvas: escalasSalvasCache })
            });
        };

        const contarFuncionariosEscalaSalva = (escala) => {
            return (escala.dados || []).filter(colaborador => colaborador.escfuncId && colaborador.chapa).length;
        };

        const criarResumoEscalaSalva = (escala) => {
            const loja = escala.lojaId || '-';
            const mes = escala.mesAno || (Number.isInteger(escala.mes) && escala.ano ? `${String(escala.mes + 1).padStart(2, '0')}/${escala.ano}` : '-');
            const funcionarios = contarFuncionariosEscalaSalva(escala);
            const criadoPor = escala.criadoPorNome || escala.criadoPorLogin || '-';

            return `
                <span class="record-meta-line">Setor: ${escala.setor || '-'}</span>
                <span class="record-meta-line">Loja ${loja} | ${mes} | ${funcionarios} funcionário(s)</span>
                <span class="record-meta-line">Criado por: ${criadoPor}</span>
            `;
        };

        async function carregarPerfisAcesso() {
            const data = await apiRequest('/api/acessos/perfis');
            perfisAcessoCache = data.perfis || [];
            perfilPaginasCache = data.paginas || [];
            return data;
        
        }

        const montarPermissoesPerfil = (perfil = null) => {
            const existentes = new Map((perfil?.PERMISSOES || []).map(p => [String(p.PAGINA), p]));
            return perfilPaginasCache.map((pagina) => {
                const atual = existentes.get(String(pagina.key)) || {};
                const podeEditar = Number(atual.PODE_EDITAR ?? 0);
                return {
                    PAGINA: pagina.key,
                    LABEL: pagina.label,
                    PODE_VISUALIZAR: Number(atual.PODE_VISUALIZAR ?? 1),
                    PODE_CRIAR: Number(atual.PODE_CRIAR ?? podeEditar),
                    PODE_EDITAR: podeEditar,
                    PODE_OFICIALIZAR: Number(atual.PODE_OFICIALIZAR ?? podeEditar),
                    PODE_REPROCESSAR: Number(atual.PODE_REPROCESSAR ?? podeEditar),
                    PODE_EXCLUIR: Number(atual.PODE_EXCLUIR ?? 0),
                    PODE_ADMINISTRAR: Number(atual.PODE_ADMINISTRAR ?? 0)
                };
            });
        };

        const abrirModalPerfilAcesso = async (perfil = null) => {
            const permissoes = montarPermissoesPerfil(perfil);
            const html = '<div class="permissions-grid">' + permissoes.map((permissao) => `
                <div class="permission-row" data-page="${escapeHtml(permissao.PAGINA)}">
                    <strong>${escapeHtml(permissao.LABEL)}</strong>
                    <label><input type="checkbox" data-perm="PODE_VISUALIZAR" ${permissao.PODE_VISUALIZAR ? 'checked' : ''}> Visualizar</label>
                    <label><input type="checkbox" data-perm="PODE_CRIAR" ${permissao.PODE_CRIAR ? 'checked' : ''}> Criar</label>
                    <label><input type="checkbox" data-perm="PODE_EDITAR" ${permissao.PODE_EDITAR ? 'checked' : ''}> Editar</label>
                    <label><input type="checkbox" data-perm="PODE_OFICIALIZAR" ${permissao.PODE_OFICIALIZAR ? 'checked' : ''}> Oficializar</label>
                    <label><input type="checkbox" data-perm="PODE_REPROCESSAR" ${permissao.PODE_REPROCESSAR ? 'checked' : ''}> Reprocessar</label>
                    <label><input type="checkbox" data-perm="PODE_EXCLUIR" ${permissao.PODE_EXCLUIR ? 'checked' : ''}> Inativar</label>
                    <label><input type="checkbox" data-perm="PODE_ADMINISTRAR" ${permissao.PODE_ADMINISTRAR ? 'checked' : ''}> Administrar</label>
                </div>`).join('') + '</div>';
            const values = await showInputModal({
                title: perfil ? 'Editar Perfil de Acesso' : 'Novo Perfil de Acesso',
                inputs: [
                    { label: 'Nome do perfil', type: 'text', id: 'PERFIL_NOME', value: perfil?.NOME || '', required: true },
                    { label: 'Descrição', type: 'text', id: 'PERFIL_DESCR', value: perfil?.DESCR || '' },
                    { label: 'Status', type: 'select', id: 'PERFIL_STATUS', value: perfil?.STATUS || 'A', options: [{ value: 'A', label: 'Ativo' }, { value: 'I', label: 'Inativo' }], required: true },
                    { type: 'html', html }
                ],
                confirmText: 'Salvar'
            });
            if (!values) return;
            const rows = Array.from(document.querySelectorAll('#inputModalBody .permission-row'));
            const payload = {
                NOME: String(values.PERFIL_NOME || '').trim().toUpperCase(),
                DESCR: values.PERFIL_DESCR || null,
                STATUS: values.PERFIL_STATUS,
                PERMISSOES: rows.map(row => ({
                    PAGINA: row.dataset.page,
                    PODE_VISUALIZAR: row.querySelector('[data-perm="PODE_VISUALIZAR"]')?.checked ? 1 : 0,
                    PODE_CRIAR: row.querySelector('[data-perm="PODE_CRIAR"]')?.checked ? 1 : 0,
                    PODE_EDITAR: row.querySelector('[data-perm="PODE_EDITAR"]')?.checked ? 1 : 0,
                    PODE_OFICIALIZAR: row.querySelector('[data-perm="PODE_OFICIALIZAR"]')?.checked ? 1 : 0,
                    PODE_REPROCESSAR: row.querySelector('[data-perm="PODE_REPROCESSAR"]')?.checked ? 1 : 0,
                    PODE_EXCLUIR: row.querySelector('[data-perm="PODE_EXCLUIR"]')?.checked ? 1 : 0,
                    PODE_ADMINISTRAR: row.querySelector('[data-perm="PODE_ADMINISTRAR"]')?.checked ? 1 : 0
                }))
            };
            if (perfil) {
                await apiRequest('/api/acessos/perfis/' + encodeURIComponent(perfil.PERFIL_ID), { method: 'PATCH', body: JSON.stringify(payload) });
            } else {
                await apiRequest('/api/acessos/perfis', { method: 'POST', body: JSON.stringify(payload) });
            }
            await renderizarRolesSettings();
            showInfoModal('Perfil de acesso salvo com sucesso.', 'success');
        };

        async function renderizarRolesSettings() {
            if (!hasPermission('roles', 'visualizar')) return;
            const container = document.getElementById('rolesSettingsContainer');
            if (!container) return;
            await carregarPerfisAcesso();
            const canCreateRoles = hasPermission('roles', 'criar');
            const canEditRoles = hasPermission('roles', 'editar');
            const canInactivateRoles = hasPermission('roles', 'inativar');
            const rows = perfisAcessoCache.map((perfil) => {
                const permissoesAtivas = (perfil.PERMISSOES || []).filter(p => Number(p.PODE_VISUALIZAR) || Number(p.PODE_CRIAR) || Number(p.PODE_EDITAR) || Number(p.PODE_OFICIALIZAR) || Number(p.PODE_REPROCESSAR) || Number(p.PODE_EXCLUIR) || Number(p.PODE_ADMINISTRAR)).length;
                return `
                    <tr>
                        <td data-label="Perfil de Acesso">${escapeHtml(perfil.NOME || '')}</td>
                        <td data-label="Descrição">${escapeHtml(perfil.DESCR || '-')}</td>
                        <td data-label="Status">${perfil.STATUS === 'A' ? 'Ativo' : 'Inativo'}</td>
                        <td data-label="Permissões">${permissoesAtivas} página(s)</td>
                        <td data-label="Ações" class="actions-cell">
                            <button class="action-btn-table banco-action editar-perfil-acesso" data-id="${escapeHtml(perfil.PERFIL_ID)}"><span class="material-symbols-outlined">edit</span>Editar</button>
                            <button class="action-btn-table banco-action danger-action toggle-perfil-acesso" data-id="${escapeHtml(perfil.PERFIL_ID)}" data-status="${escapeHtml(perfil.STATUS)}"><span class="material-symbols-outlined">block</span>${perfil.STATUS === 'A' ? 'Inativar' : 'Reativar'}</button>
                        </td>
                    </tr>`;
            }).join('');
            container.innerHTML = `
                <div class="table-card-header creation-card-header inner-card-header">
                    <p class="table-card-subtitle">Defina visualizacao, edicao e inativacao por pagina.</p>
                    <button type="button" class="action-button" id="novoPerfilAcessoBtn"><span class="material-symbols-outlined">add</span>Novo Perfil</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>Perfil de Acesso</th><th>Descrição</th><th>Status</th><th>Permissões</th><th>Ações</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhum perfil encontrado.</td></tr>'}</tbody>
                </table>`;
            if (!canCreateRoles) {
                container.querySelector('#novoPerfilAcessoBtn')?.remove();
            }
            if (!canEditRoles) {
                container.querySelectorAll('.editar-perfil-acesso').forEach(button => button.remove());
            }
            if (!canInactivateRoles) {
                container.querySelectorAll('.toggle-perfil-acesso').forEach(button => button.remove());
            }
            container.querySelectorAll('.actions-cell').forEach(cell => {
                if (!cell.textContent.trim()) cell.textContent = '-';
            });
        
        }

        document.getElementById('rolesSettingsContainer')?.addEventListener('click', async (event) => {
            const novo = event.target.closest('#novoPerfilAcessoBtn');
            const edit = event.target.closest('.editar-perfil-acesso');
            const toggle = event.target.closest('.toggle-perfil-acesso');
            try {
                if (novo && !hasPermission('roles', 'criar')) {
                    showInfoModal('Usuario sem permissao para criar perfis.', 'error');
                    return;
                }
                if (edit && !hasPermission('roles', 'editar')) {
                    showInfoModal('Usuario sem permissao para editar perfis.', 'error');
                    return;
                }
                if (toggle && !hasPermission('roles', 'inativar')) {
                    showInfoModal('Usuario sem permissao para inativar perfis.', 'error');
                    return;
                }
                if (novo) return abrirModalPerfilAcesso();
                const button = edit || toggle;
                if (!button) return;
                const perfil = perfisAcessoCache.find(item => Number(item.PERFIL_ID) === Number(button.dataset.id));
                if (!perfil) return;
                if (edit) return abrirModalPerfilAcesso(perfil);
                await apiRequest('/api/acessos/perfis/' + encodeURIComponent(perfil.PERFIL_ID), { method: 'PATCH', body: JSON.stringify({ STATUS: perfil.STATUS === 'A' ? 'I' : 'A' }) });
                await renderizarRolesSettings();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const renderizarTabelaRegistros = () => {
            if (!tabelaRegistrosBody) return;
            const escalas = getEscalasSalvas();
            tabelaRegistrosBody.innerHTML = '';

            if (escalas.length === 0) {
                tabelaRegistrosBody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-8">Nenhuma escala salva.</td></tr>`;
                return;
            }

            escalas.forEach(escala => {
                const row = `
                    <tr>
                        <td data-label="Data">${escala.dataSalva}</td>
                        <td data-label="Nome">${escala.nome}</td>
                        <td data-label="Setor">${criarResumoEscalaSalva(escala)}</td>
                        <td data-label="Ações" class="actions-cell">
                            <button class="action-btn-table load" data-id="${escala.id}" title="Carregar e Editar Escala Detalhada">
                                <span class="material-symbols-outlined">edit_calendar</span>
                                Ver escala
                            </button>
                            <button class="action-btn-table view-skeleton" data-id="${escala.id}" title="Visualizar Esqueleto da Escala">
                                <span class="material-symbols-outlined">calendar_view_month</span>
                                Ver Esqueleto
                            </button>
                             <button class="action-btn-table view-timeline" data-id="${escala.id}" title="Visualizar Linha do Tempo">
                                <span class="material-symbols-outlined">timeline</span>
                                Ver Timeline
                            </button>
                            <button class="action-btn-table delete" data-id="${escala.id}" title="Excluir Escala">
                                <span class="material-symbols-outlined">delete</span>
                                Excluir
                            </button>
                        </td>
                    </tr>
                `;
                tabelaRegistrosBody.innerHTML += row;
            });
        };

        const carregarEscalaDetalhada = (escalaSalva, isNew = false) => {
            const { ano, mes, dados, mesAno, id } = escalaSalva;
            
            if (isNew) {
                escalaCarregadaId = null;
                currentLoadedScale = null;
            } else {
                escalaCarregadaId = id;
                currentLoadedScale = escalaSalva;
            }

            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            let allDetailsHtml = '';

            dados.forEach((colaborador, index) => {
                let detailTable = `<div class="colaborador-escala-detalhada" data-colab-index="${index}" data-escfunc-id="${colaborador.escfuncId || ''}" data-chapa="${colaborador.chapa || ''}" data-escsecao-id="${colaborador.escsecaoId || ''}" data-escfuncao-id="${colaborador.escfuncaoId || ''}"><div class="header-info"><h3 class="font-bold text-lg">${colaborador.nome}</h3><p class="print-aware-inline">Ciente: ___________________________________________</p></div><table><thead><tr class="bg-gray-50"><th>D.SEM</th>${Array.from({length: diasNoMes}, (_, i) => `<th>${diasDaSemana[new Date(ano, mes, i + 1).getDay()]}</th>`).join('')}</tr><tr class="bg-gray-50"><th>DIA</th>${Array.from({length: diasNoMes}, (_, i) => `<th data-day-col="${i + 1}"><button type="button" class="detailed-day-button detalhada-dia-edit" data-dia="${i + 1}">${i + 1}</button></th>`).join('')}</tr></thead><tbody>`;
                const fields = [ 'inicio', 'inicioIntervalo', 'intervalo', 'fimIntervalo', 'fim', 'trabalhadas' ];
                const labels = { inicio: 'ENT.', inicioIntervalo: 'SAÍ.INT.', intervalo: 'INTER.', fimIntervalo: 'RET.INT.', fim: 'SAÍ.', trabalhadas: 'H.TRAB' };
                const isBold = { trabalhadas: true };

                fields.forEach(key => {
                    const boldClass = isBold[key] ? 'font-bold bg-gray-50' : '';
                    detailTable += `<tr class="${boldClass}" data-key="${key}"><td>${labels[key]}</td>`;
                    for(let dia = 1; dia <= diasNoMes; dia++) {
                        const cellContent = colaborador.turnos[dia]?.[key] || '';
                        const isDomingo = new Date(ano, mes, dia).getDay() === 0;
                        const isFolga = cellContent.toUpperCase() === 'F';
                        let bgColor = '';
                        if (isFolga) {
                            bgColor = isDomingo ? 'bg-orange-500 text-white' : 'bg-red-100';
                        } else if (isDomingo) {
                            bgColor = 'bg-yellow-100';
                        }
                        const editableAttr = '';
                        detailTable += `<td class="${bgColor}" ${editableAttr}>${cellContent}</td>`;
                    }
                    detailTable += `</tr>`;
                });
                detailTable += `</tbody></table></div>`;
                allDetailsHtml += detailTable;
            });

            detalhadaModalBody.innerHTML = allDetailsHtml;
            detalhadaMesAno.textContent = mesAno;
            detailedScaleHasBeenGenerated = true;
            gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada';
            detalhadaModal.classList.remove('hidden');
        }
        
        const carregarEsqueletoSalvo = (escalaSalva) => {
            escalaCarregadaParaVisualizacao = escalaSalva;
            gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada';
            detailedScaleHasBeenGenerated = true;

            const { ano, mes, dados } = escalaSalva;
            mesSelect.value = mes;
            anoSelect.value = ano;

            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const nomesMesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

            let tableHtml = '<table id="tabela-esqueleto" class="w-full table-auto border-collapse is-readonly"><thead><tr><th class="sticky left-0 bg-gray-100 z-10 w-48">Colaborador</th>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = new Date(ano, mes, dia);
                const diaSemana = data.getDay();
                tableHtml += `<th class="${diaSemana === 0 ? 'bg-yellow-200' : ''}"><div>${dia}-${nomesMesesAbrev[mes]}</div><div>${diasDaSemana[diaSemana]}</div></th>`;
            }
            tableHtml += '<th class="bg-gray-200">Dias Trab.</th><th class="bg-gray-200">Folgas</th></tr></thead><tbody>';

            colaboradorShifts = [];
            dados.forEach((colaborador, index) => {
                let shiftInfo = '';
                let shiftData = {};
                for(let dia = 1; dia <= diasNoMes; dia++) {
                    const turnoDia = colaborador.turnos[dia];
                    if (turnoDia && turnoDia.inicio && turnoDia.inicio.toUpperCase() !== 'F') {
                        shiftInfo = ` ${turnoDia.inicio || ''} - ${turnoDia.inicioIntervalo || ''} - ${turnoDia.fimIntervalo || ''} - ${turnoDia.fim || ''}`;
                        shiftData = {inicio: turnoDia.inicio, inicioIntervalo: turnoDia.inicioIntervalo, fimIntervalo: turnoDia.fimIntervalo, fim: turnoDia.fim};
                        break;
                    }
                }
                colaboradorShifts.push(shiftData);
                
                tableHtml += `<tr data-colab-index="${index}"><td data-name="${colaborador.nome}" class="collaborator-name sticky left-0 bg-white font-semibold"><span class="collaborator-name-span">${colaborador.nome}</span><span class="collaborator-time-span text-gray-500">${shiftInfo}</span></td>`;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const data = new Date(ano, mes, dia);
                    const turnoDoDia = colaborador.turnos[dia];
                    let cellContent = '';
                    let cellClass = `escala-cell ${data.getDay() === 0 ? 'bg-yellow-100' : ''}`;
                    if (turnoDoDia && turnoDoDia.inicio && turnoDoDia.inicio.toUpperCase() === 'F') {
                        cellContent = 'F';
                        if(data.getDay() === 0) {
                           cellClass = 'escala-cell bg-orange-600 text-white font-bold';
                        } else {
                           cellClass += ' bg-red-300 text-white font-bold';
                        }
                    }
                    tableHtml += `<td class="${cellClass}" data-dia="${dia}">${cellContent}</td>`;
                }
                tableHtml += '<td class="dias-trabalhados-cell"></td><td class="folgas-cell"></td></tr>';
            });

            tableHtml += '</tbody><tfoot>';
            let folgaRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Folgas</td>';
            let trabRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Trabalhando</td>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                folgaRow += `<td data-day-count-folga="${dia}">0</td>`;
                trabRow += `<td data-day-count-trabalhando="${dia}">0</td>`;
            }
            folgaRow += '<td></td><td></td></tr>';
            trabRow += '<td></td><td></td></tr>';

            let grandTotalRow = '<tr class="bg-gray-500 text-black font-bold"><td class="sticky left-0 bg-gray-500 z-10">TOTAL GERAL</td>';
            grandTotalRow += `<td colspan="${diasNoMes}"></td>`;
            grandTotalRow += '<td id="grandTotalDiasTrabalhados">0</td>';
            grandTotalRow += '<td id="grandTotalFolgas">0</td></tr>';

            tableHtml += folgaRow + trabRow + grandTotalRow + '</tfoot></table>';
            
            esqueletoZoomLevel = 1.0;
            applyEsqueletoZoom();
            tabelaEsqueletoContainer.innerHTML = tableHtml;
            atualizarContagemEsqueleto();
            esqueletoModal.classList.remove('hidden');
        };

        const parseEscalaFromModal = () => {
             const divsColaboradores = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');
            let escalaDetalhada = [];
            divsColaboradores.forEach(div => {
                let colabData = {
                    nome: div.querySelector('h3').textContent,
                    escfuncId: div.dataset.escfuncId ? parseInt(div.dataset.escfuncId, 10) : null,
                    chapa: div.dataset.chapa || '',
                    escsecaoId: div.dataset.escsecaoId ? parseInt(div.dataset.escsecaoId, 10) : null,
                    escfuncaoId: div.dataset.escfuncaoId ? parseInt(div.dataset.escfuncaoId, 10) : null,
                    escsecaoTurnoId: div.dataset.turnoId ? parseInt(div.dataset.turnoId, 10) : null,
                    turnos: {}
                };
                div.querySelectorAll('tbody tr').forEach(row => {
                    const key = row.dataset.key;
                    row.querySelectorAll('td:not(:first-child)').forEach((cell, index) => {
                        const dia = index + 1;
                        if (!colabData.turnos[dia]) colabData.turnos[dia] = {};
                        colabData.turnos[dia][key] = cell.textContent;
                    });
                });
                escalaDetalhada.push(colabData);
            });
            return escalaDetalhada;
        }

        const formatDateForDb = (ano, mes, dia) => {
            return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        };

        const montarPayloadBancoEscala = (escalaSalva) => {
            const lojaId = parseInt(escalaSalva.lojaId || lojaEscalaSelect.value, 10);
            const mesRef = formatDateForDb(escalaSalva.ano, escalaSalva.mes, 1);
            const funcionarios = (escalaSalva.dados || [])
                .filter(colaborador => colaborador.escfuncId && colaborador.chapa)
                .map(colaborador => ({
                    escfuncId: colaborador.escfuncId,
                    chapa: colaborador.chapa,
                    nome: colaborador.nome || colaborador.chapa,
                    escsecaoId: colaborador.escsecaoId || null,
                    escfuncaoId: colaborador.escfuncaoId || null,
                    escsecaoTurnoId: colaborador.escsecaoTurnoId || null,
                    dias: Object.keys(colaborador.turnos || {}).map(dia => {
                        const turno = colaborador.turnos[dia] || {};
                        const programacaoDia = String(turno.inicio || '').trim().toUpperCase();
                        const isFolga = !/^\d{2}:\d{2}$/.test(programacaoDia);
                        const data = formatDateForDb(escalaSalva.ano, escalaSalva.mes, parseInt(dia, 10));
                        return {
                            data,
                            hrEnt1: isFolga ? null : (turno.inicio || null),
                            hrSai1: isFolga ? null : (turno.inicioIntervalo || null),
                            hrEnt2: isFolga ? null : (turno.fimIntervalo || null),
                            hrSai2: isFolga ? null : (turno.fim || null),
                            programacao: isFolga ? (programacaoDia || 'F') : 'TRB'
                        };
                    }).filter(dia => !isDataBloqueadaParaEdicao(dia.data))
                }));

            return { lojaId, mesRef, escalaOrigemId: escalaSalva.id, funcionarios, oficializada: 0 };
        };

        const aplicarLojaDaEscalaSalva = async (escalaSalva) => {
            if (!escalaSalva.lojaId || !lojasPermitidasCache.includes(Number(escalaSalva.lojaId))) return;

            lojaEscalaSelect.value = String(escalaSalva.lojaId);
            funcionariosLojaSelect.value = String(escalaSalva.lojaId);
            await carregarFuncionariosDaLoja(true);
        };

        const sincronizarEscalaComBanco = async (escalaSalva) => {
            const payload = montarPayloadBancoEscala(escalaSalva);
            if (!payload.lojaId || payload.funcionarios.length === 0) {
                return { saved: [] };
            }

            return apiRequest('/api/escalas', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        };

        const tentarSincronizarEscalaComBanco = async (escalaSalva) => {
            try {
                const result = await sincronizarEscalaComBanco(escalaSalva);
                return {
                    ok: true,
                    nome: escalaSalva.nome,
                    count: result.saved ? result.saved.length : 0
                };
            } catch (error) {
                return {
                    ok: false,
                    nome: escalaSalva.nome,
                    message: error.details ? error.details.join(' ') : error.message
                };
            }
        };

        const sincronizarEscalasSalvasComBanco = async () => {
            const escalas = getEscalasSalvas();
            if (escalas.length === 0) {
                showInfoModal('Nenhuma escala salva para sincronizar.', 'info');
                return;
            }

            const resultados = [];
            for (const escala of escalas) {
                resultados.push(await tentarSincronizarEscalaComBanco(escala));
            }

            const mensagens = resultados.map(resultado => {
                if (resultado.ok && resultado.count > 0) {
                    return `${resultado.nome}: sincronizada (${resultado.count} funcionário(s)).`;
                }
                if (resultado.ok) {
                    return `${resultado.nome}: sem funcionários vinculados para sincronizar.`;
                }
                return `${resultado.nome}: não sincronizada - ${resultado.message}`;
            });

            const hasError = resultados.some(resultado => !resultado.ok);
            showInfoModal(mensagens, hasError ? 'error' : 'success');
        };

        const popularFiltrosEscalas = () => {
            if (!escalasFiltroMes || !escalasFiltroAno) return;
            const mesAtual = escalasFiltroMes.value || 'all';
            const anoAtual = escalasFiltroAno.value || String(anoSelect.value || new Date().getFullYear());
            const mesOptions = ['<option value="all">Todos os meses</option>'].concat(
                Array.from(mesSelect.options || []).map(option => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.textContent) + '</option>')
            );
            escalasFiltroMes.innerHTML = mesOptions.join('');
            escalasFiltroMes.value = Array.from(escalasFiltroMes.options).some(option => option.value === mesAtual) ? mesAtual : 'all';

            const anoOptions = ['<option value="all">Todos os anos</option>'].concat(
                Array.from(anoSelect.options || []).map(option => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.textContent) + '</option>')
            );
            escalasFiltroAno.innerHTML = anoOptions.join('');
            escalasFiltroAno.value = Array.from(escalasFiltroAno.options).some(option => option.value === anoAtual) ? anoAtual : 'all';
        };

        const getEscalasFiltroLojasSelecionadas = () => {
            const filtro = escalasFiltroLoja?.value || 'all';
            if (filtro !== 'all') return [Number(filtro)].filter(Boolean);
            return lojasPermitidasCache.length ? [...lojasPermitidasCache] : Array.from(lojaEscalaSelect.options || []).map(option => Number(option.value)).filter(Boolean);
        };

        const normalizarTextoFiltro = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

        const getNomeMesTabela = (value) => {
            const iso = String(value || '').slice(0, 10);
            const partes = iso.split('-');
            if (partes.length < 2) return '';
            const data = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
            const nome = data.toLocaleDateString('pt-BR', { month: 'long' });
            return nome.charAt(0).toUpperCase() + nome.slice(1);
        };

        const aplicarFiltrosEscalasBanco = (escalas) => {
            const termo = normalizarTextoFiltro(escalasPesquisaInput?.value);
            const statusFiltro = String(escalasFiltroStatus?.value || 'all').toUpperCase();
            const anoFiltro = String(escalasFiltroAno?.value || 'all');
            const mesFiltro = String(escalasFiltroMes?.value || 'all');
            return (escalas || []).filter((escala) => {
                const mesRef = String(escala.MES_REF || '').slice(0, 10);
                const [ano, mesNumero] = mesRef.split('-');
                const status = String(escala.STATUS || '').toUpperCase();
                if (statusFiltro !== 'ALL' && status !== statusFiltro) return false;
                if (anoFiltro !== 'all' && ano !== anoFiltro) return false;
                if (mesFiltro !== 'all' && String(Number(mesNumero) - 1) !== mesFiltro) return false;
                if (!termo) return true;
                const busca = normalizarTextoFiltro([
                    escala.LOJA ? 'Loja ' + escala.LOJA : '',
                    escala.LOJA,
                    formatarMesTabela(escala.MES_REF),
                    getNomeMesTabela(escala.MES_REF),
                    status
                ].join(' '));
                return busca.includes(termo);
            });
        };


        const getStatusClassEscala = (status) => {
            const normalized = String(status || '').toUpperCase();
            if (normalized === 'FINALIZADA') return 'status-finalizada';
            if (normalized === 'AGENDADA') return 'status-agendada';
            if (normalized === 'MODIFICADA') return 'status-modificada';
            if (normalized === 'ATIVA') return 'status-ativa';
            return 'status-neutro';
        };

        const renderizarTabelaBanco = (escalas) => {
            tabelaBancoBody.innerHTML = '';

            if (!escalas || escalas.length === 0) {
                const action = canCreateEscalaSessao()
                    ? '<div class="empty-table-action"><button type="button" class="action-button banco-criar-vazio"><span class="material-symbols-outlined">add</span>Gerar Escala</button></div>'
                    : '<div class="text-gray-500 mt-2">Nenhuma escala liberada para as seções do seu perfil.</div>';
                tabelaBancoBody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-8"><strong>Nenhuma escala encontrada para os filtros selecionados.</strong>' + action + '</td></tr>';
                return;
            }

            escalas.forEach(escala => {
                const mesRef = String(escala.MES_REF || '').slice(0, 10);
                const loja = escala.LOJA || '';
                const status = String(escala.STATUS || '-').toUpperCase();
                const finalizada = status === 'FINALIZADA';
                const oficializada = Number(escala.OFICIALIZADA || 0) === 1;
                const canOfficializeEscalas = hasPermission('escalas', 'oficializar');
                const canInactivateEscalas = hasPermission('escalas', 'inativar');
                const oficializarAction = !canOfficializeEscalas
                    ? ''
                    : finalizada
                    ? '<button class="action-btn-table banco-action" disabled title="Escala finalizada"><span class="material-symbols-outlined">lock</span>Finalizada</button>'
                    : oficializada
                        ? '<button class="action-btn-table banco-action officialize-action" disabled title="Escala oficializada"><span class="material-symbols-outlined">verified</span>Oficializada</button>'
                        : '<button class="action-btn-table banco-action officialize-action banco-oficializar" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Oficializar escala"><span class="material-symbols-outlined">verified</span>Oficializar</button>';
                const inativarAction = !canInactivateEscalas || finalizada
                    ? ''
                    : '<button class="action-btn-table banco-action danger-action banco-inativar" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Inativar escala"><span class="material-symbols-outlined">delete</span>Inativar</button>';
                const row = [
                    '<tr>',
                    '<td data-label="Data Inicial">' + formatarDataTabela(escala.MES_REF) + '</td>',
                    '<td data-label="Mês">' + getNomeMesTabela(escala.MES_REF) + '</td>',
                    '<td data-label="Loja">Loja ' + escapeHtml(loja) + '</td>',
                    '<td data-label="Status"><span class="escala-status-chip ' + getStatusClassEscala(status) + '">' + escapeHtml(status || '-') + '</span></td>',
                    '<td data-label="Oficializada"><span class="escala-status-chip ' + (oficializada ? 'official-chip' : 'pending-chip') + '">' + (oficializada ? 'Sim' : 'Não') + '</span></td>',
                    '<td data-label="Secoes">' + escapeHtml(escala.SECOES || 0) + '</td>',
                    '<td data-label="Funcionarios">' + escapeHtml(escala.FUNCIONARIOS || 0) + '</td>',
                    '<td data-label="Modificada em">' + formatarDataTabela(escala.MODIFICADA_EM) + '</td>',
                    '<td data-label="Modificada por">' + escapeHtml(escala.MODIFICADO_POR || 'Sistema') + '</td>',
                    '<td data-label="Acoes" class="actions-cell">',
                    '<button class="action-btn-table banco-action banco-abrir" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Abrir escala mais recente"><span class="material-symbols-outlined">open_in_new</span>Abrir Escala</button>',
                    oficializarAction,
                    inativarAction,
                    '<button class="action-btn-table banco-action banco-historico" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Ver relatório de alterações"><span class="material-symbols-outlined">history</span>Histórico</button>',
                    '</td>',
                    '</tr>'
                ].join('');
                tabelaBancoBody.innerHTML += row;
            });
        };

        const carregarHistoricoRevisoesBanco = async (loja, mesRef) => {
            const data = await apiRequest('/api/escalas/revisoes?lojaId=' + encodeURIComponent(loja) + '&mesRef=' + encodeURIComponent(mesRef));
            const revisoes = data.revisoes || [];
            if (!revisoes.length) {
                showInfoModal('Nenhuma revisao encontrada para esta escala.', 'info');
                return;
            }

            const rows = revisoes.map(revisao => [
                '<tr>',
                '<td>' + escapeHtml(revisao.REVISAO || '-') + '</td>',
                '<td>' + escapeHtml(revisao.STATUS || '-') + '</td>',
                '<td>' + escapeHtml(revisao.SECOES || 0) + '</td>',
                '<td>' + escapeHtml(revisao.FUNCIONARIOS || 0) + '</td>',
                '<td>' + formatarDataTabela(revisao.CRIADA_EM) + '</td>',
                '<td>' + formatarDataTabela(revisao.MODIFICADA_EM) + '</td>',
                '<td>' + escapeHtml(revisao.MODIFICADO_POR || 'Sistema') + '</td>',
                '</tr>'
            ].join('')).join('');

            await showInputModal({
                title: 'Histórico de revisões - Loja ' + loja + ' - ' + formatarMesTabela(mesRef),
                inputs: [{
                    type: 'html',
                    html: '<div class="revision-history-modal"><table class="data-table compact-table"><thead><tr><th>Revisão</th><th>Status</th><th>Seções</th><th>Funcionários</th><th>Criada em</th><th>Modificada em</th><th>Modificada por</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
                }],
                confirmText: 'Fechar',
                cancelText: ''
            });
        };

        const montarResumoEscalasFallback = (escalas, lojaId, mesRef) => {
            const rows = escalas || [];
            if (!rows.length) return [];

            const revisao = Math.max(...rows.map(row => Number(row.REVISAO || 0)));
            const rowsRevisao = rows.filter(row => Number(row.REVISAO || 0) === revisao);
            const base = rowsRevisao[0] || rows[0] || {};
            const secoes = new Set(rowsRevisao.map(row => row.ESCSECAO_ID || row.COD_SECAO).filter(Boolean));
            const funcionarios = new Set(rowsRevisao.map(row => row.ESCFUNC_ID || row.CHAPA).filter(Boolean));

            return [{
                MES_REF: base.MES_REF || mesRef,
                LOJA: base.LOJA || lojaId,
                STATUS: base.STATUS || (revisao > 0 ? 'MODIFICADA' : 'ATIVA'),
                REVISAO: revisao ?? base.REVISAO ?? 0,
                SECOES: secoes.size,
                FUNCIONARIOS: funcionarios.size || rowsRevisao.length,
                MODIFICADA_EM: base.DT_HR_INCL || base.MES_REF || mesRef,
                MODIFICADO_POR: base.MODIFICADO_POR || 'Sistema'
            }];
        };

        const carregarResumoEscalas = async (lojaId, mesRef) => {
            const params = new URLSearchParams({ lojaId: String(lojaId) });
            if (mesRef) params.set('mesRef', mesRef);
            try {
                const data = await apiRequest('/api/escalas/resumo?' + params.toString());
                return data.escalas || [];
            } catch (error) {
                const notFound = error.status === 404 || /nao encontrado|not found|recurso/i.test(error.message || '');
                if (!notFound || !mesRef) throw error;

                const fallbackParams = new URLSearchParams({ lojaId: String(lojaId), mesRef });
                const data = await apiRequest('/api/escalas?' + fallbackParams.toString());
                return montarResumoEscalasFallback(data.escalas || [], lojaId, mesRef);
            }
        };

        const consultarEscalasBancoLocal = async () => {
            const lojasSelecionadas = getEscalasFiltroLojasSelecionadas();
            if (!lojasSelecionadas.length) {
                tabelaBancoBody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-8">Nenhuma loja permitida para consulta.</td></tr>';
                return;
            }

            tabelaBancoBody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-8">Carregando escalas do banco...</td></tr>';
            const ano = String(escalasFiltroAno?.value || 'all');
            const mes = String(escalasFiltroMes?.value || 'all');
            const mesRef = ano !== 'all' && mes !== 'all' ? formatDateForDb(Number(ano), Number(mes), 1) : null;
            const resultados = [];
            for (const lojaId of lojasSelecionadas) {
                const escalas = await carregarResumoEscalas(lojaId, mesRef);
                resultados.push(...escalas);
            }
            const dedup = new Map();
            resultados.forEach((escala) => {
                const key = [escala.LOJA, String(escala.MES_REF || '').slice(0, 10)].join('|');
                dedup.set(key, escala);
            });
            renderizarTabelaBanco(aplicarFiltrosEscalasBanco(Array.from(dedup.values())));
        };

        const getFuncionarioDetalheKey = (dia) => String(dia.ESCFUNC_ID || dia.CHAPA || dia.NOME || '');
        const getSecaoDetalheKey = (dia) => String(dia.ESCSECAO_ID || dia.COD_SECAO || dia.SECAO_DESCR || 'SEM_SECAO');
        const getSecaoDetalheNome = (dia) => {
            const codigo = dia.COD_SECAO ? dia.COD_SECAO + ' - ' : '';
            return codigo + (dia.SECAO_DESCR || 'Sem seção');
        };
        const getSecaoLiberadaKey = (secao) => String(secao.ESCSECAO_ID || secao.COD_SECAO || secao.DESCR || 'SEM_SECAO');
        const getSecaoLiberadaNome = (secao) => {
            const codigo = secao.COD_SECAO ? secao.COD_SECAO + ' - ' : '';
            return codigo + (secao.DESCR || secao.SECAO_DESCR || 'Sem seção');
        };
        const SUBSECOES_FRENTE_CAIXA_PADRAO = [
            'Balcao Atendimento',
            'Caixa',
            'Casa de Massa',
            'Empacotador',
            'Fiscal Caixa',
            'Padaria Caixa',
            'Porteiro',
            'Self',
            'Vasilhame'
        ];
        const normalizarTextoComparacao = (texto = '') => String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        const isSecaoFrenteCaixa = (nome = '') => normalizarTextoComparacao(nome).includes('frente de caixa');
        const getSubsecoesCatalogoSecao = (secaoId = escalaDetalheAtual.secaoAtiva) => {
            const secao = (escalaDetalheAtual.secoesLiberadas || []).find(item => String(item.ESCSECAO_ID || '') === String(secaoId || ''));
            const cadastradas = (secao?.SUBSECOES || []).filter(item => String(item.STATUS || 'A') === 'A');
            const base = cadastradas.length ? cadastradas : SUBSECOES_FRENTE_CAIXA_PADRAO.map((descr, index) => ({ ESCSUBSECAO_ID: 'PADRAO_' + index, DESCR: descr }));
            return base.map(item => ({
                key: String(item.ESCSUBSECAO_ID || normalizarTextoComparacao(item.DESCR || '')),
                nome: item.DESCR || 'Subseção',
                raw: item
            }));
        };
        const classificarSubsecaoFuncionario = (funcionario = {}, subsecoes = []) => {
            const subsecaoExplicita = funcionario.ESCSUBSECAO_ID || funcionario.escsubsecaoId;
            const temCampoSubsecao = Object.prototype.hasOwnProperty.call(funcionario, 'ESCSUBSECAO_ID') || Object.prototype.hasOwnProperty.call(funcionario, 'escsubsecaoId');
            if (subsecaoExplicita) {
                const matchExplicito = (subsecoes || []).find(item => String(item.key || item.ESCSUBSECAO_ID || item.raw?.ESCSUBSECAO_ID || '') === String(subsecaoExplicita));
                if (matchExplicito) return matchExplicito;
                return { key: SUBSECAO_SEM_VINCULO_KEY, nome: 'Sem subseção' };
            }
            if (temCampoSubsecao) {
                return { key: SUBSECAO_SEM_VINCULO_KEY, nome: 'Sem subseção' };
            }
            const funcao = normalizarTextoComparacao(funcionario.FUNCAO_DESCR || funcionario.FUNCAO || funcionario.funcao || '');
            const ordered = [...(subsecoes || [])].sort((left, right) => {
                const a = normalizarTextoComparacao(left.nome);
                const b = normalizarTextoComparacao(right.nome);
                if (a === 'caixa') return 1;
                if (b === 'caixa') return -1;
                return b.length - a.length;
            });
            const regras = [
                { termos: ['balcao', 'atendimento'], alvo: 'balcao atendimento' },
                { termos: ['casa de massa'], alvo: 'casa de massa' },
                { termos: ['empacotador'], alvo: 'empacotador' },
                { termos: ['fiscal'], alvo: 'fiscal caixa' },
                { termos: ['padaria'], alvo: 'padaria caixa' },
                { termos: ['porteiro'], alvo: 'porteiro' },
                { termos: ['self'], alvo: 'self' },
                { termos: ['vasilhame'], alvo: 'vasilhame' },
                { termos: ['caixa'], alvo: 'caixa' }
            ];
            for (const regra of regras) {
                if (!regra.termos.some(termo => funcao.includes(termo))) continue;
                const match = ordered.find(item => normalizarTextoComparacao(item.nome) === regra.alvo);
                if (match) return match;
            }
            return ordered.find(item => funcao.includes(normalizarTextoComparacao(item.nome))) || {
                key: String(funcionario.ESCFUNCAO_ID || funcionario.FUNCAO_DESCR || funcionario.FUNCAO || 'SEM_CARGO'),
                nome: funcionario.FUNCAO_DESCR || funcionario.FUNCAO || 'Sem cargo'
            };
        };
        const getSubsetorDetalhe = (dia) => classificarSubsecaoFuncionario(dia, getSubsecoesCatalogoSecao(dia.ESCSECAO_ID || escalaDetalheAtual.secaoAtiva));
        const getSubsetorDetalheKey = (dia) => String(getSubsetorDetalhe(dia).key);
        const getSubsetorDetalheNome = (dia) => String(getSubsetorDetalhe(dia).nome);
        const isProgramacaoProtegidaBanco = (programacao) => ['FER', 'AFA', 'FXF', 'FIX'].includes(String(programacao || '').toUpperCase());
        const isDiaFixoBanco = (dia) => Number(dia?.FIXO_ESCALA || 0) === 1;
        const isDiaProtegidoBanco = (dia) => isProgramacaoProtegidaBanco(dia?.PROGRAMACAO) || dia?.AUSENCIA_OBRIGATORIA || Number(dia?.FIXO_ESCALA || 0) === 1;

        const resetarEstadoEdicaoBanco = () => {
            escalaDetalheBancoValidada = false;
            escalaDetalheBancoAlterados = new Map();
            salvarDetalheBancoBtn?.classList.add('hidden');
            escalaBancoDetalhadaCard?.classList.add('hidden');
            criticasDetalheBancoBtn?.classList.add('hidden');
            gerarDetalhadaBancoBtn?.classList.add('hidden');
        };

        const marcarDiaBancoAlterado = (dia) => {
            if (!dia?.ESCFUNC_ID) return;
            dia.CRITICA_MANUAL = 1;
            escalaDetalheAtual.criticasPorFuncionario?.delete(String(dia.ESCFUNC_ID));
            escalaDetalheBancoAlterados.set(String(dia.ESCFUNC_ID), {
                escfuncId: Number(dia.ESCFUNC_ID),
                chapa: dia.CHAPA,
                escsecaoId: dia.ESCSECAO_ID,
                escfuncaoId: dia.ESCFUNCAO_ID
            });
            escalaDetalheBancoValidada = false;
            salvarDetalheBancoBtn?.classList.add('hidden');
        };

        const agruparDiasPorFuncionario = (dias) => {
            const grupos = new Map();
            (dias || []).forEach((dia) => {
                const key = getFuncionarioDetalheKey(dia);
                if (!grupos.has(key)) {
                    grupos.set(key, {
                        key,
                        nome: dia.NOME || dia.CHAPA || key,
                        chapa: dia.CHAPA || '',
                        funcao: dia.FUNCAO_DESCR || '',
                        escfuncId: dia.ESCFUNC_ID || '',
                        ESCFUNC_ID: dia.ESCFUNC_ID || '',
                        ESCSECAO_ID: dia.ESCSECAO_ID || '',
                        ESCSUBSECAO_ID: dia.ESCSUBSECAO_ID || '',
                        SUBSECAO_DESCR: dia.SUBSECAO_DESCR || '',
                        NOME: dia.NOME || '',
                        CHAPA: dia.CHAPA || '',
                        FUNCAO_DESCR: dia.FUNCAO_DESCR || '',
                        dias: new Map()
                    });
                }
                const numeroDia = Number(String(dia.DT || '').slice(8, 10));
                if (numeroDia) grupos.get(key).dias.set(numeroDia, dia);
            });
            return [...grupos.values()].sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
        };

        const getFuncionariosSecaoAtualBanco = (options = {}) => {
            const filtrarSubsetor = options.filtrarSubsetor !== false;
            const subsecoes = getSubsecoesCatalogoSecao(escalaDetalheAtual.secaoAtiva);
            return (escalaDetalheAtual.funcionarios || [])
                .filter(funcionario => String(funcionario.ESCSECAO_ID || '') === String(escalaDetalheAtual.secaoAtiva || ''))
                .filter(funcionario => {
                    if (!filtrarSubsetor || !escalaDetalheAtual.subsetorAtivo || !isSecaoFrenteCaixa(escalaDetalheAtual.secoes.find(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva))?.nome || '')) return true;
                    return String(classificarSubsecaoFuncionario(funcionario, subsecoes).key) === String(escalaDetalheAtual.subsetorAtivo);
                })
                .sort((a, b) => String(a.NOME || '').localeCompare(String(b.NOME || '')) || String(a.CHAPA || '').localeCompare(String(b.CHAPA || '')));
        };

        const getSecaoAtualBanco = () => escalaDetalheAtual.secoes.find(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva)) || null;
        const isSecaoAtualFrenteCaixaBanco = () => isSecaoFrenteCaixa(getSecaoAtualBanco()?.nome || getSecaoAtualBanco()?.DESCR || '');
        const getSubsecoesRawSecaoAtualBanco = () => {
            const secao = (escalaDetalheAtual.secoesLiberadas || []).find(item => String(item.ESCSECAO_ID || '') === String(escalaDetalheAtual.secaoAtiva || ''));
            return (secao?.SUBSECOES || []).filter(item => String(item.STATUS || 'A') === 'A');
        };
        const getFuncionarioBancoPorId = (escfuncId) => {
            const id = String(escfuncId || '');
            const funcionario = (escalaDetalheAtual.funcionarios || []).find(item => String(item.ESCFUNC_ID || '') === id);
            if (funcionario) return funcionario;
            const dia = (escalaDetalheAtual.dias || []).find(item => String(item.ESCFUNC_ID || '') === id);
            return dia ? {
                ESCFUNC_ID: dia.ESCFUNC_ID,
                ESCSECAO_ID: dia.ESCSECAO_ID,
                ESCSUBSECAO_ID: dia.ESCSUBSECAO_ID,
                CHAPA: dia.CHAPA,
                NOME: dia.NOME,
                FUNCAO_DESCR: dia.FUNCAO_DESCR
            } : null;
        };
        const renderizarMenuFuncionarioEscalaBanco = (funcionario) => {
            if (!isSecaoAtualFrenteCaixaBanco() || !canManageSubsecoesPage()) return '';
            const id = funcionario.ESCFUNC_ID || funcionario.escfuncId;
            if (!id) return '';
            return '<span class="subsection-kebab-wrap scale-kebab-wrap">' +
                '<button type="button" class="subsection-kebab-btn scale-kebab-btn" data-scale-menu-id="' + escapeHtml(id) + '" aria-label="Mais ações"><span class="material-symbols-outlined">more_vert</span></button>' +
                '<span class="subsection-kebab-menu ' + (String(escalaDetalheAtual.menuFuncionarioAberto || '') === String(id) ? '' : 'hidden') + '">' +
                '<button type="button" class="subsection-menu-action scale-ver-detalhes-funcionario" data-id="' + escapeHtml(id) + '"><span class="material-symbols-outlined">badge</span>Ver detalhes</button>' +
                '<button type="button" class="subsection-menu-action scale-editar-horarios-funcionario" data-id="' + escapeHtml(id) + '"><span class="material-symbols-outlined">schedule</span>Editar horários</button>' +
                '<button type="button" class="subsection-menu-action scale-transferir-funcionario-subsecao" data-id="' + escapeHtml(id) + '"><span class="material-symbols-outlined">swap_horiz</span>Transferir de Subseção</button>' +
                '</span></span>';
        };

        const getFixosSecaoAtualBanco = () => {
            return (escalaDetalheAtual.fixos || [])
                .filter(fixo => String(fixo.ESCSECAO_ID || fixo.escsecao_id || '') === String(escalaDetalheAtual.secaoAtiva || ''));
        };

        const normalizarDataIsoBanco = (value) => {
            if (value instanceof Date) {
                return value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
            }
            return String(value || '').slice(0, 10);
        };

        const getFixoDiaKeyBanco = (escfuncId, dataIso) => String(escfuncId || '') + '|' + normalizarDataIsoBanco(dataIso);

        const mapearFixosSecaoAtualBanco = () => {
            const map = new Map();
            getFixosSecaoAtualBanco().forEach((fixo) => {
                const escfuncId = fixo.ESCFUNC_ID || fixo.escfunc_id || '';
                const dataIso = normalizarDataIsoBanco(fixo.DT || fixo.dt);
                if (escfuncId && dataIso) map.set(getFixoDiaKeyBanco(escfuncId, dataIso), fixo);
            });
            return map;
        };

        const getCampoFixoBanco = (fixo, campo) => {
            const snake = campo.toLowerCase();
            const camel = snake.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            return fixo?.[campo] || fixo?.[snake] || fixo?.[camel] || '';
        };

        const recarregarSecaoAtualEscalaBanco = async (lojaId, mesRef, secaoAtiva) => {
            await carregarDetalheEscalaMensal(lojaId, mesRef);
            escalaDetalheAtual.secaoAtiva = secaoAtiva;
            prepararSecoesDetalheEscala();
            renderizarSecaoAtivaEscala();
        };

        const salvarFixoSecaoBanco = async (payload, mensagemSucesso = 'Fixo cadastrado para a geração da seção.', options = {}) => {
            const lojaId = escalaDetalheAtual.lojaId;
            const mesRef = escalaDetalheAtual.mesRef;
            const secaoAtiva = escalaDetalheAtual.secaoAtiva;
            const response = await apiRequest('/api/escalas/fixos', {
                method: 'POST',
                body: JSON.stringify({
                    lojaId: Number(lojaId),
                    mesRef,
                    escsecaoId: Number(secaoAtiva),
                    ...payload
                })
            });
            if (options.recarregar === false) {
                const fixoSalvo = response.fixo || {
                    ESCFUNC_ID: payload.escfuncId,
                    ESCSECAO_ID: secaoAtiva,
                    DT: payload.DT,
                    PROGRAMACAO: payload.PROGRAMACAO === 'F' ? 'FXF' : payload.PROGRAMACAO,
                    HR_ENT1: payload.HR_ENT1,
                    HR_SAI1: payload.HR_SAI1,
                    HR_ENT2: payload.HR_ENT2,
                    HR_SAI2: payload.HR_SAI2,
                    JUSTIFICATIVA: payload.JUSTIFICATIVA
                };
                const novoKey = getFixoDiaKeyBanco(fixoSalvo.ESCFUNC_ID || fixoSalvo.escfunc_id || payload.escfuncId, fixoSalvo.DT || fixoSalvo.dt || payload.DT);
                escalaDetalheAtual.fixos = (escalaDetalheAtual.fixos || []).filter((fixo) => {
                    const key = getFixoDiaKeyBanco(fixo.ESCFUNC_ID || fixo.escfunc_id, fixo.DT || fixo.dt);
                    return key !== novoKey;
                });
                escalaDetalheAtual.fixos.push(fixoSalvo);
                if (options.renderizar !== false) renderizarSecaoAtivaEscala();
            } else {
                await recarregarSecaoAtualEscalaBanco(lojaId, mesRef, secaoAtiva);
            }
            if (mensagemSucesso) showInfoModal(mensagemSucesso, 'success');
        };

        const removerFixoSecaoBanco = async (payload, mensagemSucesso = '', options = {}) => {
            const lojaId = escalaDetalheAtual.lojaId;
            const mesRef = escalaDetalheAtual.mesRef;
            const secaoAtiva = escalaDetalheAtual.secaoAtiva;
            await apiRequest('/api/escalas/fixos/remover', {
                method: 'POST',
                body: JSON.stringify({
                    lojaId: Number(lojaId),
                    mesRef,
                    escsecaoId: Number(secaoAtiva),
                    ...payload
                })
            });
            if (options.recarregar === false) {
                const removerKey = getFixoDiaKeyBanco(payload.escfuncId, payload.DT);
                escalaDetalheAtual.fixos = (escalaDetalheAtual.fixos || []).filter((fixo) => {
                    const key = getFixoDiaKeyBanco(fixo.ESCFUNC_ID || fixo.escfunc_id, fixo.DT || fixo.dt);
                    return key !== removerKey;
                });
                if (options.renderizar !== false) renderizarSecaoAtivaEscala();
            } else {
                await recarregarSecaoAtualEscalaBanco(lojaId, mesRef, secaoAtiva);
            }
            if (mensagemSucesso) showInfoModal(mensagemSucesso, 'success');
        };

        const removerFixoDiaGeradoBanco = async (dia, { renderizar = true } = {}) => {
            if (!dia || !isDiaFixoBanco(dia)) return false;
            await removerFixoSecaoBanco({
                escfuncId: Number(dia.ESCFUNC_ID),
                DT: String(dia.DT || '').slice(0, 10)
            }, '', { recarregar: false, renderizar: false });
            dia.FIXO_ESCALA = 0;
            dia.JUSTIFICATIVA_ALTERACAO = null;
            if (String(dia.PROGRAMACAO || '').toUpperCase() === 'FXF') {
                dia.PROGRAMACAO = 'F';
                dia.HR_ENT1 = 'F';
                dia.HR_SAI1 = 'F';
                dia.HR_ENT2 = 'F';
                dia.HR_SAI2 = 'F';
            } else if (String(dia.PROGRAMACAO || '').toUpperCase() === 'FIX') {
                dia.PROGRAMACAO = 'TRB';
            }
            if (renderizar) renderizarSecaoAtivaEscala();
            return true;
        };

        const abrirModalFixoSecaoBanco = async (defaults = {}) => {
            const funcionarios = getFuncionariosSecaoAtualBanco();
            if (!funcionarios.length) {
                showInfoModal('Nenhum funcionário encontrado para cadastrar fixo nesta seção.', 'info');
                return;
            }
            const dataRef = new Date((escalaDetalheAtual.mesRef || formatDateForDb(new Date().getFullYear(), new Date().getMonth(), 1)) + 'T00:00:00');
            const hoje = new Date();
            const dataPadrao = dataRef.getFullYear() === hoje.getFullYear() && dataRef.getMonth() === hoje.getMonth()
                ? getHojeIsoApp()
                : formatDateForDb(dataRef.getFullYear(), dataRef.getMonth(), 1);
            const funcionarioSelecionado = String(defaults.escfuncId || funcionarios[0]?.ESCFUNC_ID || '');
            const dataSelecionada = String(defaults.dataIso || defaults.DT || dataPadrao).slice(0, 10);
            const tipoSelecionado = String(defaults.tipo || defaults.PROGRAMACAO || 'F').toUpperCase() === 'TRB' ? 'TRB' : 'F';
            const values = await showInputModal({
                title: 'Adicionar fixo',
                inputs: [
                    { label: 'Funcionário', type: 'select', id: 'FIXO_ESCFUNC_ID', value: funcionarioSelecionado, options: funcionarios.map(funcionario => ({ value: String(funcionario.ESCFUNC_ID), label: (funcionario.CHAPA || '') + ' - ' + (funcionario.NOME || '') })), required: true },
                    { label: 'Dia', type: 'date', id: 'FIXO_DT', value: dataSelecionada, required: true },
                    { label: 'Tipo', type: 'choice-group', id: 'FIXO_TIPO', value: tipoSelecionado, options: [{ value: 'F', label: 'Folga fixa' }, { value: 'TRB', label: 'Horário fixo' }], required: true },
                    { label: 'Entrada 1', type: 'time', id: 'FIXO_HR_ENT1', value: defaults.HR_ENT1 || defaults.hrEnt1 || '08:00', dependsOn: 'FIXO_TIPO', showWhen: 'TRB', required: true },
                    { label: 'Saída 1', type: 'time', id: 'FIXO_HR_SAI1', value: defaults.HR_SAI1 || defaults.hrSai1 || '12:00', dependsOn: 'FIXO_TIPO', showWhen: 'TRB', required: true },
                    { label: 'Entrada 2', type: 'time', id: 'FIXO_HR_ENT2', value: defaults.HR_ENT2 || defaults.hrEnt2 || '13:10', dependsOn: 'FIXO_TIPO', showWhen: 'TRB', required: true },
                    { label: 'Saída 2', type: 'time', id: 'FIXO_HR_SAI2', value: defaults.HR_SAI2 || defaults.hrSai2 || '17:58', dependsOn: 'FIXO_TIPO', showWhen: 'TRB', required: true },
                    { label: 'Justificativa', type: 'textarea', id: 'FIXO_JUSTIFICATIVA', rows: 3, required: true, placeholder: 'Informe o motivo deste fixo.', value: defaults.JUSTIFICATIVA || defaults.justificativa || '' }
                ],
                confirmText: 'Salvar fixo'
            });
            if (!values) return;
            await salvarFixoSecaoBanco({
                escfuncId: Number(values.FIXO_ESCFUNC_ID),
                DT: values.FIXO_DT,
                PROGRAMACAO: values.FIXO_TIPO,
                HR_ENT1: values.FIXO_HR_ENT1 || null,
                HR_SAI1: values.FIXO_HR_SAI1 || null,
                HR_ENT2: values.FIXO_HR_ENT2 || null,
                HR_SAI2: values.FIXO_HR_SAI2 || null,
                JUSTIFICATIVA: values.FIXO_JUSTIFICATIVA
            });
        };

        const montarPayloadDetalheBancoAtual = () => {
            const funcionarios = agruparDiasPorFuncionario(escalaDetalheAtual.dias || [])
                .filter(funcionario => funcionario.escfuncId && funcionario.chapa)
                .map(funcionario => {
                    const diasOrdenados = [...funcionario.dias.values()].sort((a, b) => String(a.DT).localeCompare(String(b.DT)));
                    const base = diasOrdenados[0] || {};
                    return {
                        escfuncId: Number(funcionario.escfuncId),
                        chapa: funcionario.chapa,
                        nome: funcionario.nome,
                        escsecaoId: base.ESCSECAO_ID || null,
                        escfuncaoId: base.ESCFUNCAO_ID || null,
                        dias: diasOrdenados.map(dia => {
                            const descanso = isProgramacaoDescanso(dia.PROGRAMACAO);
                            const sigla = getValorDescanso(dia);
                            return {
                                data: String(dia.DT).slice(0, 10),
                                hrEnt1: descanso ? null : dia.HR_ENT1,
                                hrSai1: descanso ? null : dia.HR_SAI1,
                                hrEnt2: descanso ? null : dia.HR_ENT2,
                                hrSai2: descanso ? null : dia.HR_SAI2,
                                programacao: descanso ? sigla : 'TRB',
                                justificativa: dia.JUSTIFICATIVA_ALTERACAO || null
                            };
                        })
                    };
                });
            return {
                lojaId: Number(escalaDetalheAtual.lojaId),
                mesRef: escalaDetalheAtual.mesRef,
                funcionarios,
                oficializada: 0
            };
        };

        const getCriticasFuncionarioBanco = (funcionario) => {
            const criticasValidacao = escalaDetalheAtual.criticasPorFuncionario?.get(String(funcionario.escfuncId)) || [];
            return criticasValidacao;
        };

        const getCriticasFuncionariosBanco = (funcionarios = []) => {
            const criticas = [];
            (funcionarios || []).forEach((funcionario) => {
                getCriticasFuncionarioBanco(funcionario).forEach((critica) => criticas.push(critica));
            });
            return deduplicarCriticasBanco(criticas);
        };

        const getCriticasSecaoBanco = (secaoKey) => {
            const diasSecao = (escalaDetalheAtual.dias || []).filter(dia => getSecaoDetalheKey(dia) === String(secaoKey));
            return getCriticasFuncionariosBanco(agruparDiasPorFuncionario(diasSecao));
        };

        const getTodasCriticasBanco = () => {
            return getCriticasFuncionariosBanco(agruparDiasPorFuncionario(escalaDetalheAtual.dias || []));
        };

        const getCriticasBancoAgrupadasPorSecao = () => {
            return (escalaDetalheAtual.secoes || [])
                .map((secao) => ({
                    secao,
                    criticas: getCriticasSecaoBanco(secao.key)
                }))
                .filter((grupo) => grupo.criticas.length > 0);
        };

        const exibirCriticasBancoAgrupadas = () => {
            const grupos = getCriticasBancoAgrupadasPorSecao();
            if (!grupos.length) {
                showInfoModal('Nenhuma critica pendente.', 'success');
                return;
            }

            const html = '<div class="critical-section-list">' + grupos.map((grupo) => {
                return '<section class="critical-section-group">' +
                    '<header><strong>' + escapeHtml(grupo.secao.nome || 'Seção') + '</strong><span>' + escapeHtml(grupo.criticas.length) + ' crítica(s)</span></header>' +
                    '<ul>' + grupo.criticas.map((critica) => '<li>' + escapeHtml(critica) + '</li>').join('') + '</ul>' +
                    '</section>';
            }).join('') + '</div>';

            showInputModal({
                title: 'Críticas por Seção',
                inputs: [{ type: 'html', html }],
                cancelText: '',
                confirmText: 'Fechar',
                panelClass: 'bg-white rounded-lg shadow-xl w-11/12 max-w-4xl flex flex-col'
            });
        };

        const atualizarAcoesValidacaoBanco = () => {
            const criticas = getTodasCriticasBanco();
            const temDiasGerados = (escalaDetalheAtual.dias || []).length > 0;
            criticasDetalheBancoBtn?.classList.toggle('hidden', criticas.length === 0);
            gerarDetalhadaBancoBtn?.classList.toggle('hidden', criticas.length > 0 || !temDiasGerados);
            salvarDetalheBancoBtn?.classList.toggle('hidden', true);
            if (salvarRascunhoBancoBtn) salvarRascunhoBancoBtn.disabled = !temDiasGerados || criticas.length > 0;
            if (oficializarBancoBtn) oficializarBancoBtn.disabled = !temDiasGerados || criticas.length > 0 || escalaDetalheAtual.status === 'FINALIZADA';
        };

        const validarDetalheBancoSilencioso = async () => {
            const errors = [];
            escalaDetalheAtual.criticasPorFuncionario = new Map();
            agruparDiasPorFuncionario(escalaDetalheAtual.dias || []).forEach((funcionario) => {
                const dias = [...funcionario.dias.values()].sort((a, b) => String(a.DT).localeCompare(String(b.DT)));
                const criticas = validarDiasEscalaFuncionario(dias, funcionario.nome);
                if (criticas.length) escalaDetalheAtual.criticasPorFuncionario.set(String(funcionario.escfuncId), criticas);
                errors.push(...criticas);
            });
            try {
                const backendValidation = await apiRequest('/api/escalas/validar', {
                    method: 'POST',
                    body: JSON.stringify(montarPayloadDetalheBancoAtual())
                });
                errors.push(...(backendValidation.errors || []));
            } catch (error) {
                errors.push(error.details ? error.details.join(' ') : error.message);
            }
            const uniqueErrors = deduplicarCriticasBanco(errors);
            agruparDiasPorFuncionario(escalaDetalheAtual.dias || []).forEach((funcionario) => {
                const criticasFuncionario = uniqueErrors.filter(error => String(error).startsWith(funcionario.nome + ':') || String(error).startsWith(funcionario.nome + ' no dia'));
                if (criticasFuncionario.length) escalaDetalheAtual.criticasPorFuncionario.set(String(funcionario.escfuncId), criticasFuncionario);
            });
            escalaDetalheBancoValidada = uniqueErrors.length === 0;
            atualizarAcoesValidacaoBanco();
            return uniqueErrors;
        };

        const validarDetalheBancoAtual = async () => {
            const uniqueErrors = await validarDetalheBancoSilencioso();
            if (escalaDetalheBancoValidada) {
                (escalaDetalheAtual.dias || []).forEach(dia => { delete dia.CRITICA_MANUAL; });
            }
            renderizarSecaoAtivaEscala();
            showInfoModal(uniqueErrors.length ? uniqueErrors : 'A escala foi validada com sucesso.', uniqueErrors.length ? 'error' : 'success');
            return escalaDetalheBancoValidada;
        };

        const criarTimelineSecaoBanco = (dias) => {
            const turnos = new Map();
            agruparDiasPorFuncionario(dias).forEach((funcionario) => {
                const frequencias = new Map();
                funcionario.dias.forEach((dia) => {
                    if (String(dia.PROGRAMACAO || '').toUpperCase() === 'F') return;
                    const turno = [dia.HR_ENT1 || '', dia.HR_SAI1 || '', dia.HR_ENT2 || '', dia.HR_SAI2 || ''];
                    if (!turno[0] || !turno[3]) return;
                    const signature = turno.join('|');
                    frequencias.set(signature, (frequencias.get(signature) || 0) + 1);
                });
                const principal = [...frequencias.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
                if (!principal) return;
                if (!turnos.has(principal)) turnos.set(principal, 0);
                turnos.set(principal, turnos.get(principal) + 1);
            });
            const exemplo = dias[0] || {};
            return [...turnos.entries()].map(([signature, quantidade]) => {
                const [inicio, inicioIntervalo, fimIntervalo, fim] = signature.split('|');
                return {
                    secaoId: getSecaoDetalheKey(exemplo),
                    secaoNome: getSecaoDetalheNome(exemplo),
                    quantidade: String(quantidade),
                    inicio,
                    inicioIntervalo,
                    fimIntervalo,
                    fim
                };
            });
        };

        const getDiasDisponiveisSecaoBanco = (dias) => {
            const map = new Map();
            (dias || []).forEach((dia) => {
                const iso = String(dia.DT || '').slice(0, 10);
                if (iso) map.set(iso, dia.DT);
            });
            return [...map.keys()].sort();
        };

        const formatarDiaTimelineBanco = (iso) => {
            if (!iso) return 'Selecione um dia';
            const date = new Date(iso + 'T00:00:00');
            const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear() + ' ' + dias[date.getDay()];
        };

        const getDuracaoHorario = (inicio, fim) => {
            const total = timeToMinutes(fim || '00:00') - timeToMinutes(inicio || '00:00');
            return Math.max(0, total);
        };

        const getCargoTooltipHorario = (registro = {}, funcionario = {}) => {
            return registro.FUNCAO_DESCR || registro.FUNCAO || funcionario.funcao || funcionario.secao || registro.SECAO_DESCR || registro.DESCR || '';
        };

        const montarTooltipHorarioEscala = (registro = {}, funcionario = {}) => {
            const nome = registro.NOME || funcionario.nome || '';
            const cargo = getCargoTooltipHorario(registro, funcionario);
            const descanso = isProgramacaoDescanso(registro.PROGRAMACAO);
            if (descanso) {
                return [
                    '<div class="schedule-tooltip-card">',
                    '<strong class="schedule-tooltip-name">' + escapeHtml(nome || 'Funcionário') + '</strong>',
                    cargo ? '<span class="schedule-tooltip-role">' + escapeHtml(cargo) + '</span>' : '',
                    '<div class="schedule-tooltip-divider"></div>',
                    '<div class="schedule-tooltip-section"><strong>Descanso</strong>',
                    '<div class="schedule-tooltip-row"><span>Tipo:</span><b>' + escapeHtml(getValorDescanso(registro)) + '</b></div>',
                    registro.JUSTIFICATIVA_ALTERACAO ? '<div class="schedule-tooltip-note">' + escapeHtml(registro.JUSTIFICATIVA_ALTERACAO) + '</div>' : '',
                    '</div>',
                    '</div>'
                ].join('');
            }

            const turno1 = getDuracaoHorario(registro.HR_ENT1, registro.HR_SAI1);
            const intervalo = getDuracaoHorario(registro.HR_SAI1, registro.HR_ENT2);
            const turno2 = getDuracaoHorario(registro.HR_ENT2, registro.HR_SAI2);
            const carga = turno1 + turno2;
            return [
                '<div class="schedule-tooltip-card">',
                '<strong class="schedule-tooltip-name">' + escapeHtml(nome || 'Funcionário') + '</strong>',
                cargo ? '<span class="schedule-tooltip-role">' + escapeHtml(cargo) + '</span>' : '',
                '<div class="schedule-tooltip-divider"></div>',
                '<div class="schedule-tooltip-section"><strong>Turno 1</strong>',
                '<div class="schedule-tooltip-row"><span>Horário:</span><b>' + escapeHtml((registro.HR_ENT1 || '--') + ' - ' + (registro.HR_SAI1 || '--')) + '</b></div>',
                '<div class="schedule-tooltip-row"><span>Duração:</span><b>' + escapeHtml(minutesToTime(turno1)) + '</b></div>',
                '</div>',
                '<div class="schedule-tooltip-divider"></div>',
                '<div class="schedule-tooltip-section"><strong>Intervalo</strong>',
                '<div class="schedule-tooltip-row"><span>Horário:</span><b>' + escapeHtml((registro.HR_SAI1 || '--') + ' - ' + (registro.HR_ENT2 || '--')) + '</b></div>',
                '<div class="schedule-tooltip-row"><span>Duração:</span><b>' + escapeHtml(minutesToTime(intervalo)) + '</b></div>',
                '</div>',
                '<div class="schedule-tooltip-divider"></div>',
                '<div class="schedule-tooltip-section"><strong>Turno 2</strong>',
                '<div class="schedule-tooltip-row"><span>Horário:</span><b>' + escapeHtml((registro.HR_ENT2 || '--') + ' - ' + (registro.HR_SAI2 || '--')) + '</b></div>',
                '<div class="schedule-tooltip-row"><span>Duração:</span><b>' + escapeHtml(minutesToTime(turno2)) + '</b></div>',
                '</div>',
                '<div class="schedule-tooltip-divider"></div>',
                '<div class="schedule-tooltip-row schedule-tooltip-total"><span>Carga horária total:</span><b>' + escapeHtml(minutesToTime(carga)) + '</b></div>',
                '</div>'
            ].join('');
        };

        const getTooltipHorarioAttr = (registro, funcionario = {}) => {
            return ' data-schedule-tooltip="' + escapeHtml(montarTooltipHorarioEscala(registro, funcionario)) + '"';
        };

        let scheduleTooltipElement = null;
        let scheduleTooltipTarget = null;
        let scheduleTooltipTimer = null;
        let scheduleTooltipLastEvent = null;
        let scheduleTooltipSuspended = false;

        const ensureScheduleTooltip = () => {
            if (scheduleTooltipElement) return scheduleTooltipElement;
            scheduleTooltipElement = document.createElement('div');
            scheduleTooltipElement.className = 'schedule-hover-tooltip hidden';
            document.body.appendChild(scheduleTooltipElement);
            return scheduleTooltipElement;
        };

        const positionScheduleTooltip = (event) => {
            if (!scheduleTooltipElement || scheduleTooltipElement.classList.contains('hidden')) return;
            const margin = 14;
            const rect = scheduleTooltipElement.getBoundingClientRect();
            let left = event.clientX + margin;
            let top = event.clientY + margin;
            if (left + rect.width > window.innerWidth - margin) left = event.clientX - rect.width - margin;
            if (top + rect.height > window.innerHeight - margin) top = window.innerHeight - rect.height - margin;
            scheduleTooltipElement.style.left = Math.max(margin, left) + 'px';
            scheduleTooltipElement.style.top = Math.max(margin, top) + 'px';
        };

        const esconderScheduleTooltip = () => {
            clearTimeout(scheduleTooltipTimer);
            ensureScheduleTooltip().classList.add('hidden');
            scheduleTooltipTarget = null;
            scheduleTooltipLastEvent = null;
        };

        document.addEventListener('mouseover', (event) => {
            if (scheduleTooltipSuspended) return;
            const target = event.target.closest('[data-schedule-tooltip]');
            if (!target) return;
            scheduleTooltipTarget = target;
            scheduleTooltipLastEvent = event;
            clearTimeout(scheduleTooltipTimer);
            scheduleTooltipTimer = setTimeout(() => {
                if (scheduleTooltipSuspended || scheduleTooltipTarget !== target) return;
                const tooltip = ensureScheduleTooltip();
                tooltip.innerHTML = target.dataset.scheduleTooltip || '';
                tooltip.classList.remove('hidden');
                positionScheduleTooltip(scheduleTooltipLastEvent || event);
            }, 750);
        });

        document.addEventListener('mousemove', (event) => {
            if (!scheduleTooltipTarget) return;
            scheduleTooltipLastEvent = event;
            positionScheduleTooltip(event);
        });

        document.addEventListener('mouseout', (event) => {
            if (!scheduleTooltipTarget || scheduleTooltipTarget.contains(event.relatedTarget)) return;
            esconderScheduleTooltip();
        });

        document.addEventListener('dragstart', (event) => {
            if (!event.target.closest('[data-schedule-tooltip]')) return;
            scheduleTooltipSuspended = true;
            esconderScheduleTooltip();
        });

        document.addEventListener('dragend', () => {
            esconderScheduleTooltip();
            setTimeout(() => { scheduleTooltipSuspended = false; }, 250);
        });

        const aplicarVisaoEscalaBanco = () => {
            const visao = escalaDetalheAtual.visao === 'diaria' ? 'diaria' : 'mensal';
            escalaBancoMensalPanel?.classList.toggle('hidden', visao !== 'mensal');
            escalaBancoDiariaPanel?.classList.toggle('hidden', visao !== 'diaria');
            escalaViewMensalBtn?.classList.toggle('active', visao === 'mensal');
            escalaViewDiariaBtn?.classList.toggle('active', visao === 'diaria');
            escalaHeaderDayNav?.classList.toggle('hidden', visao !== 'diaria');
            abrirImpressaoEscalaBtn?.classList.toggle('hidden', !escalaDetalheAtual.secaoAtiva);
        };

        const moverDiaTimelineBanco = (direcao) => {
            if (!escalaBancoDiaSelect) return;
            const options = Array.from(escalaBancoDiaSelect.options || []);
            if (!options.length) return;
            const index = Math.max(0, options.findIndex(option => option.value === escalaBancoDiaSelect.value));
            const proximo = Math.min(options.length - 1, Math.max(0, index + direcao));
            escalaBancoDiaSelect.value = options[proximo].value;
            renderizarSecaoAtivaEscala();
        };

        const garantirDiaTimelineBancoSelecionado = (dias) => {
            if (!escalaBancoDiaSelect) return '';
            const diasDisponiveis = getDiasDisponiveisSecaoBanco(dias);
            const atual = escalaBancoDiaSelect.value;
            escalaBancoDiaSelect.innerHTML = diasDisponiveis.map((iso) => {
                const numero = Number(iso.slice(8, 10));
                const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][new Date(iso + 'T00:00:00').getDay()];
                return '<option value="' + escapeHtml(iso) + '">' + escapeHtml(String(numero).padStart(2, '0') + ' - ' + semana) + '</option>';
            }).join('');
            if (!diasDisponiveis.length) {
                if (escalaBancoDiaAtualLabel) escalaBancoDiaAtualLabel.textContent = 'Selecione um dia';
                return '';
            }
            if (diasDisponiveis.includes(atual)) {
                escalaBancoDiaSelect.value = atual;
                if (escalaBancoDiaAtualLabel) escalaBancoDiaAtualLabel.textContent = formatarDiaTimelineBanco(atual);
                return atual;
            }
            const hojeIso = new Date().toISOString().slice(0, 10);
            const preferido = diasDisponiveis.includes(hojeIso) ? hojeIso : diasDisponiveis[0] || '';
            escalaBancoDiaSelect.value = preferido;
            if (escalaBancoDiaAtualLabel) escalaBancoDiaAtualLabel.textContent = formatarDiaTimelineBanco(preferido);
            return preferido;
        };

        const renderizarTimelineDiariaBanco = (dias) => {
            if (!escalaBancoTimelineContent) return;
            const diaSelecionado = garantirDiaTimelineBancoSelecionado(dias);
            const registrosDia = (dias || [])
                .filter((dia) => String(dia.DT || '').slice(0, 10) === diaSelecionado)
                .sort((a, b) => {
                    const aDescanso = isProgramacaoDescanso(a.PROGRAMACAO);
                    const bDescanso = isProgramacaoDescanso(b.PROGRAMACAO);
                    if (aDescanso !== bDescanso) return aDescanso ? 1 : -1;
                    return timeToMinutes(a.HR_ENT1 || '23:59') - timeToMinutes(b.HR_ENT1 || '23:59') || String(a.NOME || '').localeCompare(String(b.NOME || ''));
                });

            if (!diaSelecionado || registrosDia.length === 0) {
                escalaBancoTimelineContent.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhum funcionário encontrado para o dia selecionado.</p>';
                return;
            }

            const somenteLeitura = escalaDetalheAtual.status === 'FINALIZADA';
            const inicioTimeline = 0;
            const fimTimeline = 24 * 60;
            const duracaoTimeline = fimTimeline - inicioTimeline;
            const markers = [];
            for (let min = 0; min <= fimTimeline; min += 120) {
                const left = ((min - inicioTimeline) / duracaoTimeline) * 100;
                markers.push('<span style="left:' + left + '%">' + minutesToTime(min === 1440 ? 0 : min) + '</span>');
            }
            const rows = registrosDia.map((dia) => {
                const descanso = isProgramacaoDescanso(dia.PROGRAMACAO);
                const bloqueado = isDataBloqueadaParaEdicao(String(dia.DT || '').slice(0, 10)) || somenteLeitura;
                const funcionario = agruparDiasPorFuncionario(escalaDetalheAtual.dias || []).find(item => String(item.escfuncId) === String(dia.ESCFUNC_ID));
                const criticasFuncionario = funcionario ? getCriticasFuncionarioBanco(funcionario) : [];
                const temCritica = criticasIncluemDia(criticasFuncionario, dia) || criticasFuncionario.some((critica) => !/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|dia\s+\d+/i.test(String(critica || '')));
                const attrs = !bloqueado ? ' data-escprog-id="' + escapeHtml(dia.ESCPROG_ID || '') + '" data-escprogdia-id="' + escapeHtml(dia.ESCPROGDIA_ID || '') + '"' : '';
                const tooltipAttr = getTooltipHorarioAttr(dia);
                let bars = '';
                if (descanso) {
                    bars = '<button type="button" class="daily-schedule-rest daily-bank-edit ' + getClasseDescanso(dia) + '"' + tooltipAttr + attrs + '>' + escapeHtml(getValorDescanso(dia)) + '</button>';
                } else {
                    const ent1 = timeToMinutes(dia.HR_ENT1 || '00:00');
                    const sai1 = timeToMinutes(dia.HR_SAI1 || dia.HR_ENT1 || '00:00');
                    const ent2 = timeToMinutes(dia.HR_ENT2 || dia.HR_SAI1 || '00:00');
                    const sai2 = timeToMinutes(dia.HR_SAI2 || dia.HR_ENT2 || '00:00');
                    const mkBar = (start, end, cls, label) => {
                        const width = Math.max(0, ((end - start) / duracaoTimeline) * 100);
                        const left = Math.max(0, ((start - inicioTimeline) / duracaoTimeline) * 100);
                        if (width <= 0) return '';
                        return '<button type="button" class="' + cls + ' daily-bank-edit" style="left:' + left + '%;width:' + width + '%"' + tooltipAttr + attrs + '>' + escapeHtml(label) + '</button>';
                    };
                    bars = mkBar(ent1, sai1, 'daily-schedule-bar', (dia.HR_ENT1 || '') + ' - ' + (dia.HR_SAI1 || ''))
                        + mkBar(sai1, ent2, 'daily-schedule-break', '')
                        + mkBar(ent2, sai2, 'daily-schedule-bar', (dia.HR_ENT2 || '') + ' - ' + (dia.HR_SAI2 || ''));
                }
                return '<div class="daily-schedule-row" data-escfunc-id="' + escapeHtml(dia.ESCFUNC_ID || '') + '" data-funcao-descr="' + escapeHtml(dia.FUNCAO_DESCR || '') + '">' +
                    '<div class="daily-schedule-person"' + tooltipAttr + '><strong>' + escapeHtml((dia.CHAPA || '') + ' - ' + (dia.NOME || '')) + '</strong></div>' +
                    '<div class="daily-schedule-track' + (temCritica ? ' manual-critical-day' : '') + '">' + bars + '</div>' +
                    '</div>';
            }).join('');
            escalaBancoTimelineContent.innerHTML = '<div class="daily-schedule"><div class="daily-schedule-axis"><div></div><div class="daily-schedule-markers">' + markers.join('') + '</div></div>' + rows + '</div>';
        };

        const renderizarMensalSecaoBanco = (dias) => {
            if (!escalaBancoMensalContent) return;
            const dataRef = escalaDetalheAtual.mesRef ? new Date(escalaDetalheAtual.mesRef + 'T00:00:00') : null;
            const ano = dataRef?.getFullYear() || new Date().getFullYear();
            const mes = dataRef?.getMonth() || 0;
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            const funcionariosPendentes = getFuncionariosSecaoAtualBanco();
            const funcionarios = agruparDiasPorFuncionario(dias);
            const funcionariosMap = new Set(funcionarios.map((funcionario) => String(funcionario.escfuncId || '')));
            funcionariosPendentes.forEach((funcionario) => {
                const escfuncId = String(funcionario.ESCFUNC_ID || '');
                if (!escfuncId || funcionariosMap.has(escfuncId)) return;
                funcionarios.push({
                    key: escfuncId,
                    nome: funcionario.NOME || funcionario.CHAPA || escfuncId,
                    chapa: funcionario.CHAPA || '',
                    funcao: funcionario.FUNCAO_DESCR || funcionario.FUNCAO || '',
                    escfuncId,
                    dias: new Map()
                });
                funcionariosMap.add(escfuncId);
            });
            funcionarios.sort((a, b) => String(a.nome).localeCompare(String(b.nome)) || String(a.chapa).localeCompare(String(b.chapa)));
            const criticasSecao = getCriticasFuncionariosBanco(funcionarios);
            const fixosPendentes = getFixosSecaoAtualBanco();
            const fixosMap = mapearFixosSecaoAtualBanco();
            const getWeekClass = (dia) => dia > 1 && new Date(ano, mes, dia).getDay() === 1 ? ' week-start' : '';
            const getDiaTitle = (registro) => registro ? montarTooltipHorarioEscala(registro) : '';
            const calcularQualidadeDia = (total, trabalhando) => {
                if (!total) return '-';
                return Math.round((Number(trabalhando || 0) / Number(total || 1)) * 100) + '%';
            };
            const getFuncionarioTitle = (funcionario) => {
                const primeiroDia = [...funcionario.dias.values()].find(Boolean) || {};
                const horario = primeiroDia && !isProgramacaoDescanso(primeiroDia.PROGRAMACAO)
                    ? [primeiroDia.HR_ENT1, primeiroDia.HR_SAI1, primeiroDia.HR_ENT2, primeiroDia.HR_SAI2].filter(Boolean).join(' / ')
                    : 'Sem horário de trabalho no primeiro dia exibido';
                return [
                    'Nome: ' + (funcionario.nome || ''),
                    'Chapa: ' + (funcionario.chapa || ''),
                    'Setor: ' + (funcionario.funcao || primeiroDia.SECAO_DESCR || primeiroDia.DESCR || ''),
                    'Horário: ' + horario
                ].join('\n');
            };
            const diasEditaveis = Array.from({ length: diasNoMes }, (_, index) => index + 1)
                .filter((dia) => !isDiaMesBloqueadoParaEdicao(ano, mes, dia));
            const temDiasPendentesGeracao = funcionariosPendentes.length > 0
                && escalaDetalheAtual.status !== 'FINALIZADA'
                && !escalaDetalheAtual.oficializada
                && diasEditaveis.some((dia) => funcionarios.some((funcionario) => !funcionario.dias.has(dia)));
            const renderizarBannerGeracaoSecao = (totalFuncionarios) => '<div class="pending-section-scale pending-section-shell section-generation-banner">' +
                '<div class="pending-section-shell-header">' +
                '<div><strong>Escala liberada para distribuição das Folgas Fixas e Horários Fixos.</strong><span>Folga Fixa: Clique nos dias para distribuir as Folgas Fixas.</span><span>Horário Fixo: Clique duas vezes para inserir um horário fixo.</span><span>' + escapeHtml(String(totalFuncionarios)) + ' funcionário(s) nesta seção. ' + escapeHtml(String(fixosPendentes.length)) + ' fixo(s) cadastrado(s).</span></div>' +
                '<div class="pending-section-actions"><button type="button" class="action-button gerar-escala-secao-banco" data-secao-key="' + escapeHtml(escalaDetalheAtual.secaoAtiva || '') + '"><span class="material-symbols-outlined">calendar_month</span>Gerar Escala da Seção</button></div>' +
                '</div></div>';

            if (!funcionarios.length) {
                const secao = escalaDetalheAtual.secoes.find(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva));
                const total = funcionariosPendentes.length || Number(secao?.funcionarios || 0);
                let html = '<div class="pending-section-scale pending-section-shell">' +
                    '<div class="pending-section-shell-header">' +
                    '<div><strong>Escala liberada para distribuição das Folgas Fixas e Horários Fixos.</strong><span>Folga Fixa: Clique nos dias para distribuir as Folgas Fixas.</span><span>Horário Fixo: Clique duas vezes para inserir um horário fixo.</span><span>' + escapeHtml(String(total)) + ' funcionário(s) nesta seção. ' + escapeHtml(String(fixosPendentes.length)) + ' fixo(s) cadastrado(s).</span></div>' +
                    '<div class="pending-section-actions"><button type="button" class="action-button gerar-escala-secao-banco" data-secao-key="' + escapeHtml(escalaDetalheAtual.secaoAtiva || '') + '"><span class="material-symbols-outlined">calendar_month</span>Gerar Escala da Seção</button></div>' +
                    '</div>';

                if (!funcionariosPendentes.length) {
                    html += '<p class="pending-section-empty">Nenhum funcionário encontrado para esta seção.</p></div>';
                    escalaBancoMensalContent.innerHTML = html;
                    return;
                }

                html += '<div class="monthly-scale-scroll pending-skeleton-scroll"><table class="monthly-scale-table pending-skeleton-table"><thead>';
                html += '<tr class="monthly-quality-row"><th class="employee-col monthly-summary-label"><span>Qualidade do planejamento (%)</span></th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) {
                    let folgasFixas = 0;
                    funcionariosPendentes.forEach((funcionario) => {
                        const dataIso = formatDateForDb(ano, mes, dia);
                        const fixo = fixosMap.get(getFixoDiaKeyBanco(funcionario.ESCFUNC_ID, dataIso));
                        const programacao = String(fixo?.PROGRAMACAO || fixo?.programacao || '').toUpperCase();
                        if (fixo && programacao !== 'TRB') folgasFixas += 1;
                    });
                    const trabalhando = Math.max(0, funcionariosPendentes.length - folgasFixas);
                    html += '<th class="monthly-quality' + getWeekClass(dia) + '" title="Cobertura planejada: ' + trabalhando + '/' + funcionariosPendentes.length + '">' + escapeHtml(calcularQualidadeDia(funcionariosPendentes.length, trabalhando)) + '</th>';
                }
                html += '</tr><tr class="monthly-totals-row"><th class="employee-col monthly-summary-label"><span>' + escapeHtml(String(funcionariosPendentes.length)) + ' funcionário(s)</span></th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) {
                    let folgasFixas = 0;
                    let horariosFixos = 0;
                    funcionariosPendentes.forEach((funcionario) => {
                        const dataIso = formatDateForDb(ano, mes, dia);
                        const fixo = fixosMap.get(getFixoDiaKeyBanco(funcionario.ESCFUNC_ID, dataIso));
                        const programacao = String(fixo?.PROGRAMACAO || fixo?.programacao || '').toUpperCase();
                        if (!fixo) return;
                        if (programacao === 'TRB') horariosFixos += 1;
                        else folgasFixas += 1;
                    });
                    html += '<th class="monthly-quality' + getWeekClass(dia) + '" title="Folgas fixas: ' + folgasFixas + ' | Horários fixos: ' + horariosFixos + '">' +
                        '<span class="monthly-total-box folga">' + folgasFixas + ' F</span>' +
                        '<span class="monthly-total-box trabalho">' + horariosFixos + ' H</span>' +
                        '</th>';
                }
                html += '</tr><tr class="monthly-weekday-row"><th class="employee-col">Funcionário</th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) {
                    html += '<th class="' + getWeekClass(dia).trim() + '">' + diasSemana[new Date(ano, mes, dia).getDay()] + '</th>';
                }
                html += '</tr><tr class="monthly-day-row"><th class="employee-col"></th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) {
                    html += '<th class="' + getWeekClass(dia).trim() + '">' + dia + '</th>';
                }
                html += '</tr></thead><tbody>';

                funcionariosPendentes.forEach((funcionario) => {
                    const funcionarioLabel = (funcionario.CHAPA || '') + ' - ' + (funcionario.NOME || '');
                    html += '<tr data-escfunc-id="' + escapeHtml(funcionario.ESCFUNC_ID || '') + '" data-funcao-descr="' + escapeHtml(funcionario.FUNCAO_DESCR || funcionario.FUNCAO || '') + '"><th class="employee-col" title="' + escapeHtml(funcionarioLabel) + '"><span class="scale-employee-name-row"><strong>' + escapeHtml(funcionarioLabel) + '</strong>' + renderizarMenuFuncionarioEscalaBanco(funcionario) + '</span></th>';
                    for (let dia = 1; dia <= diasNoMes; dia += 1) {
                        const dataIso = formatDateForDb(ano, mes, dia);
                        const bloqueado = isDiaMesBloqueadoParaEdicao(ano, mes, dia) || escalaDetalheAtual.status === 'FINALIZADA';
                        const fixo = fixosMap.get(getFixoDiaKeyBanco(funcionario.ESCFUNC_ID, dataIso));
                        const programacao = String(fixo?.PROGRAMACAO || fixo?.programacao || '').toUpperCase();
                        const isHorarioFixo = programacao === 'TRB';
                        const value = fixo ? (isHorarioFixo ? (getCampoFixoBanco(fixo, 'HR_ENT1') || 'Fixo') : getValorDescanso(fixo)) : '';
                        const title = fixo
                            ? (isHorarioFixo ? montarTooltipHorarioEscala({
                                ...fixo,
                                NOME: funcionario.NOME,
                                FUNCAO_DESCR: funcionario.FUNCAO_DESCR,
                                HR_ENT1: getCampoFixoBanco(fixo, 'HR_ENT1'),
                                HR_SAI1: getCampoFixoBanco(fixo, 'HR_SAI1'),
                                HR_ENT2: getCampoFixoBanco(fixo, 'HR_ENT2'),
                                HR_SAI2: getCampoFixoBanco(fixo, 'HR_SAI2')
                            }) : 'Folga fixa')
                            : '';
                        const cellClass = [
                            'pending-skeleton-cell',
                            fixo ? (isHorarioFixo ? 'pending-fixed-work fixed-work-cell' : 'pending-fixed-rest rest-cell rest-cell-fixo') : 'pending-empty-cell',
                            getWeekClass(dia).trim(),
                            bloqueado ? 'locked-day' : ''
                        ].filter(Boolean).join(' ');
                        const attrs = !bloqueado
                            ? ' role="button" tabindex="0" data-pending-fixed="1" data-escfunc-id="' + escapeHtml(funcionario.ESCFUNC_ID || '') + '" data-data-iso="' + escapeHtml(dataIso) + '" data-has-fixo="' + (fixo ? '1' : '0') + '" data-programacao="' + escapeHtml(programacao || '') + '" data-hr-ent1="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_ENT1')) + '" data-hr-sai1="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_SAI1')) + '" data-hr-ent2="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_ENT2')) + '" data-hr-sai2="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_SAI2')) + '"'
                            : '';
                        html += '<td class="' + cellClass + '" data-schedule-tooltip="' + escapeHtml(title) + '"' + attrs + '>' + escapeHtml(value) + '</td>';
                    }
                    html += '</tr>';
                });

                html += '</tbody></table></div></div>';
                escalaBancoMensalContent.innerHTML = html;
                return;
            }

            let html = (temDiasPendentesGeracao ? renderizarBannerGeracaoSecao(funcionariosPendentes.length || funcionarios.length) : '') +
                '<div class="monthly-scale-scroll"><table class="monthly-scale-table"><thead>';
            html += '<tr class="monthly-quality-row"><th class="employee-col monthly-summary-label"><span>Qualidade do planejamento (%)</span></th>';
            for (let dia = 1; dia <= diasNoMes; dia += 1) {
                let trabalhando = 0;
                funcionarios.forEach((funcionario) => {
                    const registro = funcionario.dias.get(dia);
                    if (registro && !isProgramacaoDescanso(registro.PROGRAMACAO)) trabalhando += 1;
                });
                html += '<th class="monthly-quality' + getWeekClass(dia) + '" title="Cobertura planejada: ' + trabalhando + '/' + funcionarios.length + '">' + escapeHtml(calcularQualidadeDia(funcionarios.length, trabalhando)) + '</th>';
            }
            html += '</tr><tr class="monthly-totals-row"><th class="employee-col monthly-summary-label' + (criticasSecao.length ? ' has-critical' : '') + '">' +
                '<span>' + funcionarios.length + ' funcionário(s)</span>' +
                '</th>';
            for (let dia = 1; dia <= diasNoMes; dia += 1) {
                let folgas = 0;
                let trabalhando = 0;
                funcionarios.forEach((funcionario) => {
                    const registro = funcionario.dias.get(dia);
                    if (!registro) return;
                    if (isProgramacaoDescanso(registro.PROGRAMACAO)) folgas += 1;
                    else trabalhando += 1;
                });
                html += '<th class="monthly-quality' + getWeekClass(dia) + '" title="Trabalhando: ' + trabalhando + ' | Folgas: ' + folgas + '">' +
                    '<span class="monthly-total-box folga">' + folgas + ' F</span>' +
                    '<span class="monthly-total-box trabalho">' + trabalhando + ' T</span>' +
                    '</th>';
            }
            html += '</tr><tr class="monthly-weekday-row"><th class="employee-col">Funcionário</th>';
            for (let dia = 1; dia <= diasNoMes; dia += 1) {
                html += '<th class="' + getWeekClass(dia).trim() + '">' + diasSemana[new Date(ano, mes, dia).getDay()] + '</th>';
            }
            html += '</tr><tr class="monthly-day-row"><th class="employee-col"></th>';
            for (let dia = 1; dia <= diasNoMes; dia += 1) {
                html += '<th class="' + getWeekClass(dia).trim() + '">' + dia + '</th>';
            }
            html += '</tr></thead><tbody>';

            funcionarios.forEach((funcionario) => {
                const criticas = getCriticasFuncionarioBanco(funcionario);
                html += '<tr data-escfunc-id="' + escapeHtml(funcionario.escfuncId || '') + '" data-funcao-descr="' + escapeHtml(funcionario.funcao || '') + '"><th class="employee-col" title="' + escapeHtml(getFuncionarioTitle(funcionario)) + '"><span class="scale-employee-name-row"><strong>' + escapeHtml((funcionario.chapa || '') + ' - ' + (funcionario.nome || '')) + '</strong>' + renderizarMenuFuncionarioEscalaBanco(funcionario) + '</span></th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) {
                    const registro = funcionario.dias.get(dia);
                    if (!registro) {
                        const dataIso = formatDateForDb(ano, mes, dia);
                        const bloqueado = isDiaMesBloqueadoParaEdicao(ano, mes, dia) || escalaDetalheAtual.status === 'FINALIZADA';
                        const fixo = fixosMap.get(getFixoDiaKeyBanco(funcionario.escfuncId, dataIso));
                        const programacao = String(fixo?.PROGRAMACAO || fixo?.programacao || '').toUpperCase();
                        const isHorarioFixo = programacao === 'TRB';
                        const value = fixo ? (isHorarioFixo ? (getCampoFixoBanco(fixo, 'HR_ENT1') || 'Fixo') : getValorDescanso(fixo)) : '';
                        const cellClass = [
                            'pending-skeleton-cell',
                            fixo ? (isHorarioFixo ? 'pending-fixed-work fixed-work-cell' : 'pending-fixed-rest rest-cell rest-cell-fixo') : 'pending-empty-cell',
                            getWeekClass(dia).trim(),
                            bloqueado ? 'locked-day' : ''
                        ].filter(Boolean).join(' ');
                        const attrs = !bloqueado
                            ? ' role="button" tabindex="0" data-pending-fixed="1" data-escfunc-id="' + escapeHtml(funcionario.escfuncId || '') + '" data-data-iso="' + escapeHtml(dataIso) + '" data-has-fixo="' + (fixo ? '1' : '0') + '" data-programacao="' + escapeHtml(programacao || '') + '" data-hr-ent1="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_ENT1')) + '" data-hr-sai1="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_SAI1')) + '" data-hr-ent2="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_ENT2')) + '" data-hr-sai2="' + escapeHtml(getCampoFixoBanco(fixo, 'HR_SAI2')) + '"'
                            : '';
                        html += '<td class="' + cellClass + '"' + attrs + '>' + escapeHtml(value) + '</td>';
                        continue;
                    }
                    const descanso = isProgramacaoDescanso(registro.PROGRAMACAO);
                    const bloqueado = isDiaMesBloqueadoParaEdicao(ano, mes, dia) || escalaDetalheAtual.status === 'FINALIZADA';
                    const critica = criticasIncluemDia(criticas, registro, dia);
                    const value = descanso ? getValorDescanso(registro) : (registro.HR_ENT1 || '--');
                    const cellClass = [
                        descanso ? 'rest-cell' : 'work-cell',
                        descanso ? getClasseDescanso(registro) : '',
                        Number(registro.FIXO_ESCALA || 0) === 1 ? 'fixed-work-cell' : '',
                        getWeekClass(dia).trim(),
                        critica ? 'manual-critical-day' : '',
                        bloqueado ? 'locked-day' : ''
                    ].filter(Boolean).join(' ');
                    const editAttrs = !bloqueado
                        ? ' role="button" tabindex="0" data-escprog-id="' + escapeHtml(registro.ESCPROG_ID || '') + '" data-escprogdia-id="' + escapeHtml(registro.ESCPROGDIA_ID || '') + '" data-escfunc-id="' + escapeHtml(funcionario.escfuncId || '') + '" draggable="' + (descanso && !isDiaProtegidoBanco(registro) ? 'true' : 'false') + '"'
                        : '';
                    html += '<td class="' + cellClass + ' monthly-editable-day" data-schedule-tooltip="' + escapeHtml(getDiaTitle(registro)) + '"' + editAttrs + '>' + escapeHtml(value) + '</td>';
                }
                html += '</tr>';
            });

            html += '</tbody></table></div>';
            escalaBancoMensalContent.innerHTML = html;
        };

        const renderizarTabsSecoesEscala = () => {
            if (!escalaSecaoTabs) return;
            escalaSecaoTabs.innerHTML = escalaDetalheAtual.secoes.map((secao) => {
                const ativa = String(secao.key) === String(escalaDetalheAtual.secaoAtiva);
                const temCritica = getCriticasSecaoBanco(secao.key).length > 0;
                return '<button type="button" class="section-tab' + (ativa ? ' active' : '') + (temCritica ? ' has-critical' : '') + '" role="tab" aria-selected="' + ativa + '" data-secao-key="' + escapeHtml(secao.key) + '">' + escapeHtml(secao.nome) + '<span>' + secao.funcionarios + '</span></button>';
            }).join('');
        };

        const prepararSubsetoresDetalheEscala = (diasSecao, nomeSecao) => {
            if (!escalaSubsetorTabs) return diasSecao;
            if (!isSecaoFrenteCaixa(nomeSecao)) {
                escalaDetalheAtual.subsetores = [];
                escalaDetalheAtual.subsetorAtivo = null;
                escalaSubsetorTabs.classList.add('hidden');
                escalaSubsetorTabs.innerHTML = '';
                return diasSecao;
            }

            const map = new Map();
            const subsecoes = getSubsecoesCatalogoSecao(escalaDetalheAtual.secaoAtiva);
            getFuncionariosSecaoAtualBanco({ filtrarSubsetor: false }).forEach((funcionario) => {
                const subsetor = classificarSubsecaoFuncionario(funcionario, subsecoes);
                if (!map.has(subsetor.key)) {
                    map.set(subsetor.key, { key: subsetor.key, nome: subsetor.nome, funcionarios: new Set(), funcaoIds: new Set() });
                }
                map.get(subsetor.key).funcionarios.add(String(funcionario.ESCFUNC_ID || funcionario.CHAPA || funcionario.NOME || ''));
                if (funcionario.ESCFUNCAO_ID) map.get(subsetor.key).funcaoIds.add(String(funcionario.ESCFUNCAO_ID));
            });
            (diasSecao || []).forEach((dia) => {
                const subsetor = getSubsetorDetalhe(dia);
                if (!map.has(subsetor.key)) {
                    map.set(subsetor.key, { key: subsetor.key, nome: subsetor.nome, funcionarios: new Set(), funcaoIds: new Set() });
                }
                map.get(subsetor.key).funcionarios.add(getFuncionarioDetalheKey(dia));
                if (dia.ESCFUNCAO_ID) map.get(subsetor.key).funcaoIds.add(String(dia.ESCFUNCAO_ID));
            });

            escalaDetalheAtual.subsetores = [...map.values()]
                .map(item => ({ ...item, funcionarios: item.funcionarios.size, funcaoIds: [...item.funcaoIds] }))
                .sort((a, b) => a.nome.localeCompare(b.nome));

            if (!escalaDetalheAtual.subsetores.some(item => String(item.key) === String(escalaDetalheAtual.subsetorAtivo))) {
                escalaDetalheAtual.subsetorAtivo = escalaDetalheAtual.subsetores[0]?.key || null;
            }

            escalaSubsetorTabs.classList.toggle('hidden', escalaDetalheAtual.subsetores.length === 0);
            escalaSubsetorTabs.innerHTML = escalaDetalheAtual.subsetores.map((subsetor) => {
                const ativa = String(subsetor.key) === String(escalaDetalheAtual.subsetorAtivo);
                return '<button type="button" class="subsection-tab' + (ativa ? ' active' : '') + '" role="tab" aria-selected="' + ativa + '" data-subsetor-key="' + escapeHtml(subsetor.key) + '">' + escapeHtml(subsetor.nome) + '<span>' + subsetor.funcionarios + '</span></button>';
            }).join('');

            return escalaDetalheAtual.subsetorAtivo
                ? (diasSecao || []).filter(dia => String(getSubsetorDetalheKey(dia)) === String(escalaDetalheAtual.subsetorAtivo))
                : diasSecao;
        };

        const renderizarDetalhadaSecaoBanco = (dias) => {
            if (!escalaBancoDetalhadaContent) return;
            const dataRef = escalaDetalheAtual.mesRef ? new Date(escalaDetalheAtual.mesRef + 'T00:00:00') : null;
            const ano = dataRef?.getFullYear() || new Date().getFullYear();
            const mes = dataRef?.getMonth() || 0;
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            const somenteLeitura = escalaDetalheAtual.status === 'FINALIZADA';
            const getWeekClass = (dia) => dia > 1 && new Date(ano, mes, dia).getDay() === 1 ? ' week-start' : '';
            const getDiaTitle = (registro, funcionario = {}) => registro ? montarTooltipHorarioEscala(registro, funcionario) : '';
            const fields = [
                { key: 'HR_ENT1', label: 'ENT.' },
                { key: 'HR_SAI1', label: 'SAÍ.INT.' },
                { key: 'INTERVALO', label: 'INTER.' },
                { key: 'HR_ENT2', label: 'RET.INT.' },
                { key: 'HR_SAI2', label: 'SAÍ.' },
                { key: 'TRABALHADAS', label: 'H.TRAB', bold: true }
            ];
            const html = agruparDiasPorFuncionario(dias).map((funcionario) => {
                const criticas = getCriticasFuncionarioBanco(funcionario);
                const criticaButton = criticas.length ? '<button type="button" class="critical-status-chip banco-critical-chip" data-escfunc-id="' + escapeHtml(funcionario.escfuncId || '') + '" title="Ver criticas do funcionario">CRITICA</button>' : '';
                let table = '<article class="bank-employee-scale" data-escfunc-id="' + escapeHtml(funcionario.escfuncId || '') + '" data-funcao-descr="' + escapeHtml(funcionario.funcao || '') + '"><header><div><h3>' + escapeHtml(funcionario.nome) + '</h3><p>' + escapeHtml(funcionario.chapa) + (funcionario.funcao ? ' | ' + escapeHtml(funcionario.funcao) : '') + '</p><p class="print-aware-inline">Ciente: ___________________________________________</p></div>' + criticaButton + '</header><div class="bank-scale-scroll"><table><thead><tr><th>D.SEM</th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) table += '<th class="' + getWeekClass(dia).trim() + '">' + diasSemana[new Date(ano, mes, dia).getDay()] + '</th>';
                table += '</tr><tr><th>DIA</th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) {
                    const registro = funcionario.dias.get(dia);
                    const bloqueado = isDiaMesBloqueadoParaEdicao(ano, mes, dia);
                    const dayContent = !somenteLeitura && registro ? '<button type="button" class="bank-day-header-button bank-day-edit" data-escprog-id="' + escapeHtml(registro.ESCPROG_ID || '') + '" data-escprogdia-id="' + escapeHtml(registro.ESCPROGDIA_ID || '') + '" title="' + (bloqueado ? 'Dia bloqueado para edicao' : 'Editar dia ' + dia) + '"' + (bloqueado ? ' disabled' : '') + '>' + dia + '</button>' : dia;
                    table += '<th class="' + getWeekClass(dia).trim() + '">' + dayContent + '</th>';
                }
                table += '</tr></thead><tbody>';
                fields.forEach((field) => {
                    table += '<tr class="' + [field.bold ? 'font-bold' : '', field.key === 'INTERVALO' ? 'bank-interval-row' : ''].filter(Boolean).join(' ') + '"><th>' + field.label + '</th>'; 
                    for (let numeroDia = 1; numeroDia <= diasNoMes; numeroDia += 1) {
                        const registro = funcionario.dias.get(numeroDia);
                        if (!registro) { table += '<td class="empty">-</td>'; continue; }
                        const folga = isProgramacaoDescanso(registro.PROGRAMACAO);
                        let value = getValorDescanso(registro);
                        if (!folga) {
                            if (field.key === 'INTERVALO') value = minutesToTime(Math.max(0, timeToMinutes(registro.HR_ENT2) - timeToMinutes(registro.HR_SAI1)));
                            else if (field.key === 'TRABALHADAS') value = minutesToTime(Math.max(0, (timeToMinutes(registro.HR_SAI2) - timeToMinutes(registro.HR_ENT1)) - (timeToMinutes(registro.HR_ENT2) - timeToMinutes(registro.HR_SAI1))));
                            else value = registro[field.key] || '--';
                        }
                        const domingo = new Date(ano, mes, numeroDia).getDay() === 0;
                        const temCriticaDia = criticasIncluemDia(criticas, registro, numeroDia);
                        const cellClass = [
                            folga ? 'day-off' : '',
                            folga ? getClasseDescanso(registro) : '',
                            !folga && Number(registro.FIXO_ESCALA || 0) === 1 ? 'fixed-work-cell' : '',
                            domingo ? 'sunday' : '',
                            getWeekClass(numeroDia).trim(),
                            temCriticaDia ? 'manual-critical-day' : ''
                        ].filter(Boolean).join(' ');
                        const marker = temCriticaDia && field.key === 'HR_ENT1' ? '<span class="critical-marker" title="Crítica validada">!</span>' : '';
                        table += '<td class="' + cellClass + '" data-schedule-tooltip="' + escapeHtml(getDiaTitle(registro, funcionario)) + '">' + marker + escapeHtml(value) + '</td>';
                    }
                    table += '</tr>';
                });
                return table + '</tbody></table></div></article>';
            }).join('');
            escalaBancoDetalhadaContent.innerHTML = html || '<p class="text-center text-gray-500 py-8">Nenhum colaborador encontrado nesta seção.</p>';
        };

        const getNomeSecaoSemCodigo = (nome = '') => {
            const texto = String(nome || '').trim();
            const semCodigo = texto.replace(/^\d{3}\.\d{2}\.\d{3}\s*-\s*/i, '').trim();
            return semCodigo || texto || 'Seção';
        };

        const capturarPosicaoEscalaBanco = () => {
            const mensalScroll = escalaBancoMensalContent?.querySelector('.monthly-scale-scroll');
            const diariaScroll = escalaBancoTimelineContent?.querySelector('.daily-timeline-scroll, .timeline-scroll-container');
            return {
                pageY: window.scrollY || 0,
                mensalLeft: mensalScroll?.scrollLeft || 0,
                mensalTop: mensalScroll?.scrollTop || 0,
                diariaLeft: diariaScroll?.scrollLeft || 0,
                diariaTop: diariaScroll?.scrollTop || 0
            };
        };

        const restaurarPosicaoEscalaBanco = (posicao) => {
            if (!posicao) return;
            requestAnimationFrame(() => {
                const mensalScroll = escalaBancoMensalContent?.querySelector('.monthly-scale-scroll');
                const diariaScroll = escalaBancoTimelineContent?.querySelector('.daily-timeline-scroll, .timeline-scroll-container');
                if (mensalScroll) {
                    mensalScroll.scrollLeft = posicao.mensalLeft || 0;
                    mensalScroll.scrollTop = posicao.mensalTop || 0;
                }
                if (diariaScroll) {
                    diariaScroll.scrollLeft = posicao.diariaLeft || 0;
                    diariaScroll.scrollTop = posicao.diariaTop || 0;
                }
                window.scrollTo({ top: posicao.pageY || 0, left: 0, behavior: 'auto' });
            });
        };

        const renderizarSecaoAtivaEscala = () => {
            const posicaoEscala = capturarPosicaoEscalaBanco();
            const secao = escalaDetalheAtual.secoes.find(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva));
            const diasSecao = (escalaDetalheAtual.dias || []).filter(dia => getSecaoDetalheKey(dia) === String(escalaDetalheAtual.secaoAtiva));
            const nome = secao?.nome || 'Seção';
            const nomeSemCodigo = getNomeSecaoSemCodigo(nome);
            const dias = prepararSubsetoresDetalheEscala(diasSecao, nome);
            if (escalaSecaoMensalTitulo) escalaSecaoMensalTitulo.textContent = 'Escala - ' + nomeSemCodigo;
            if (escalaSecaoTimelineTitulo) escalaSecaoTimelineTitulo.textContent = 'Timeline diária - ' + nomeSemCodigo;
            if (escalaSecaoDetalheTitulo) escalaSecaoDetalheTitulo.textContent = 'Escala detalhada - ' + nomeSemCodigo;
            renderizarTabsSecoesEscala();
            renderizarMensalSecaoBanco(dias);
            renderizarTimelineDiariaBanco(dias);
            renderizarDetalhadaSecaoBanco(dias);
            aplicarVisaoEscalaBanco();
            resetarEscalaSecaoBancoBtn?.classList.toggle('hidden', escalaDetalheAtual.status === 'FINALIZADA' || escalaDetalheAtual.oficializada || !escalaDetalheAtual.secaoAtiva);
            atualizarAcoesValidacaoBanco();
            restaurarPosicaoEscalaBanco(posicaoEscala);
        };

        const prepararSecoesDetalheEscala = () => {
            const map = new Map();
            (escalaDetalheAtual.secoesLiberadas || []).forEach((secao) => {
                const key = getSecaoLiberadaKey(secao);
                if (!map.has(key)) {
                    map.set(key, {
                        key,
                        nome: getSecaoLiberadaNome(secao),
                        funcionarios: new Set(),
                        totalLiberado: Number(secao.FUNCIONARIOS || 0),
                        gerados: Number(secao.GERADOS || 0)
                    });
                }
            });
            (escalaDetalheAtual.funcionarios || []).forEach((funcionario) => {
                const key = String(funcionario.ESCSECAO_ID || 'SEM_SECAO');
                if (!map.has(key)) {
                    map.set(key, {
                        key,
                        nome: getSecaoLiberadaNome({
                            ESCSECAO_ID: funcionario.ESCSECAO_ID,
                            COD_SECAO: funcionario.COD_SECAO,
                            DESCR: funcionario.SECAO_DESCR
                        }),
                        funcionarios: new Set(),
                        totalLiberado: 0,
                        gerados: 0
                    });
                }
                map.get(key).funcionarios.add(getFuncionarioDetalheKey(funcionario));
            });
            (escalaDetalheAtual.dias || []).forEach((dia) => {
                const key = getSecaoDetalheKey(dia);
                if (!map.has(key)) map.set(key, { key, nome: getSecaoDetalheNome(dia), funcionarios: new Set() });
                map.get(key).funcionarios.add(getFuncionarioDetalheKey(dia));
            });
            escalaDetalheAtual.secoes = [...map.values()].map(item => ({
                ...item,
                funcionarios: item.funcionarios.size || item.totalLiberado || 0,
                gerados: item.gerados || 0
            })).sort((a, b) => a.nome.localeCompare(b.nome));
            if (!escalaDetalheAtual.secoes.some(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva))) escalaDetalheAtual.secaoAtiva = escalaDetalheAtual.secoes[0]?.key || null;
            renderizarSecaoAtivaEscala();
        };

        const carregarDetalheEscalaBanco = async (escprogId) => {
            resetarEstadoEdicaoBanco();
            escalaDetalheAtual = { escprogId, lojaId: null, mesRef: null, modo: 'individual', visao: 'mensal', status: null, dias: [], secoes: [], secaoAtiva: null, subsetorAtivo: null, subsetores: [] };
            escalaDetalheTitulo.textContent = 'Escala ' + escprogId;
            escalaDetalheResumo.textContent = 'Carregando dias da escala...';
            const data = await apiRequest('/api/escalas/' + encodeURIComponent(escprogId) + '/dias');
            escalaDetalheAtual.dias = data.dias || [];
            escalaDetalheAtual.mesRef = String(escalaDetalheAtual.dias[0]?.DT || '').slice(0, 7) + '-01';
            escalaDetalheResumo.textContent = escalaDetalheAtual.dias.length + ' dia(s) encontrado(s).';
            prepararSecoesDetalheEscala();
        };

        const carregarDetalheEscalaMensal = async (lojaId, mesRef) => {
            resetarEstadoEdicaoBanco();
            escalaDetalheAtual = { escprogId: null, lojaId, mesRef, modo: 'mensal', visao: 'mensal', status: null, dias: [], funcionarios: [], fixos: [], secoesLiberadas: [], secoes: [], secaoAtiva: null, subsetorAtivo: null, subsetores: [] };
            escalaDetalheTitulo.textContent = 'Escala Loja ' + lojaId + ' - ' + formatarMesTabela(mesRef);
            escalaDetalheResumo.textContent = 'Carregando escala mensal...';
            const data = await apiRequest('/api/escalas/mensal?lojaId=' + encodeURIComponent(lojaId) + '&mesRef=' + encodeURIComponent(mesRef));
            const escala = data.escala || {};
            let secoesCatalogo = [];
            try {
                const catalogo = await apiRequest('/api/catalog/lojas/' + encodeURIComponent(lojaId) + '/secoes');
                secoesCatalogo = catalogo.secoes || [];
            } catch (error) {
                secoesCatalogo = [];
            }
            escalaDetalheAtual.dias = escala.dias || [];
            escalaDetalheAtual.funcionarios = escala.funcionarios || [];
            escalaDetalheAtual.fixos = escala.fixos || [];
            escalaDetalheAtual.secoesLiberadas = (escala.secoes || []).map((secao) => {
                const catalogo = secoesCatalogo.find(item => String(item.ESCSECAO_ID || '') === String(secao.ESCSECAO_ID || ''));
                return { ...secao, SUBSECOES: catalogo?.SUBSECOES || [] };
            });
            escalaDetalheAtual.status = escala.status || null;
            escalaDetalheAtual.oficializada = Number(escala.oficializada || escala.OFICIALIZADA || 0) === 1;
            escalaDetalheResumo.textContent = escalaDetalheAtual.dias.length + ' dia(s), revisão ' + (escala.revisao || '-') + ', status ' + (escala.status || '-');
            prepararSecoesDetalheEscala();
            validarDetalheBancoSilencioso().then(() => renderizarSecaoAtivaEscala()).catch(() => atualizarAcoesValidacaoBanco());
        };

        escalaSecaoTabs?.addEventListener('click', (event) => {
            const tab = event.target.closest('.section-tab');
            if (!tab) return;
            escalaDetalheAtual.secaoAtiva = tab.dataset.secaoKey;
            escalaDetalheAtual.subsetorAtivo = null;
            renderizarSecaoAtivaEscala();
        });

        escalaSubsetorTabs?.addEventListener('click', (event) => {
            const tab = event.target.closest('.subsection-tab');
            if (!tab) return;
            escalaDetalheAtual.subsetorAtivo = tab.dataset.subsetorKey;
            renderizarSecaoAtivaEscala();
        });

        escalaBancoDiaSelect?.addEventListener('change', () => {
            renderizarSecaoAtivaEscala();
        });

        escalaViewMensalBtn?.addEventListener('click', () => {
            escalaDetalheAtual.visao = 'mensal';
            aplicarVisaoEscalaBanco();
        });

        escalaViewDiariaBtn?.addEventListener('click', () => {
            escalaDetalheAtual.visao = 'diaria';
            aplicarVisaoEscalaBanco();
        });

        escalaBancoDiaAnteriorBtn?.addEventListener('click', () => moverDiaTimelineBanco(-1));
        escalaBancoDiaProximoBtn?.addEventListener('click', () => moverDiaTimelineBanco(1));

        let impressaoEscalaState = {
            tipo: 'mensal',
            formato: 'todos',
            cargo: 'TODOS',
            colaborador: 'TODOS',
            orientacao: 'landscape'
        };

        const getDiasMesImpressao = () => {
            const dataRef = escalaDetalheAtual.mesRef ? new Date(escalaDetalheAtual.mesRef + 'T00:00:00') : new Date();
            const ano = dataRef.getFullYear();
            const mes = dataRef.getMonth();
            const total = new Date(ano, mes + 1, 0).getDate();
            return Array.from({ length: total }, (_, index) => formatDateForDb(ano, mes, index + 1));
        };

        const getSemanasImpressao = () => {
            const semanas = new Map();
            getDiasMesImpressao().forEach((dataIso) => {
                const data = new Date(dataIso + 'T00:00:00');
                const day = data.getDay();
                const monday = new Date(data);
                monday.setDate(data.getDate() + (day === 0 ? -6 : 1 - day));
                const key = monday.toISOString().slice(0, 10);
                if (!semanas.has(key)) semanas.set(key, []);
                semanas.get(key).push(dataIso);
            });
            return [...semanas.entries()].map(([key, dias]) => ({ key, dias }));
        };

        const getFuncionariosImpressaoBanco = () => {
            const diasSecao = (escalaDetalheAtual.dias || []).filter(dia => getSecaoDetalheKey(dia) === String(escalaDetalheAtual.secaoAtiva));
            const diasFiltrados = escalaDetalheAtual.subsetorAtivo
                ? diasSecao.filter(dia => String(getSubsetorDetalheKey(dia)) === String(escalaDetalheAtual.subsetorAtivo))
                : diasSecao;
            const map = new Map();
            getFuncionariosSecaoAtualBanco().forEach((funcionario) => {
                map.set(String(funcionario.ESCFUNC_ID || ''), {
                    id: String(funcionario.ESCFUNC_ID || ''),
                    chapa: funcionario.CHAPA || '',
                    nome: funcionario.NOME || '',
                    cargo: funcionario.FUNCAO_DESCR || funcionario.FUNCAO || ''
                });
            });
            agruparDiasPorFuncionario(diasFiltrados).forEach((funcionario) => {
                const atual = map.get(String(funcionario.escfuncId || '')) || {};
                map.set(String(funcionario.escfuncId || ''), {
                    id: String(funcionario.escfuncId || ''),
                    chapa: funcionario.chapa || atual.chapa || '',
                    nome: funcionario.nome || atual.nome || '',
                    cargo: funcionario.funcao || atual.cargo || ''
                });
            });
            return [...map.values()]
                .filter((funcionario) => funcionario.id)
                .sort((a, b) => String(a.nome).localeCompare(String(b.nome)) || String(a.chapa).localeCompare(String(b.chapa)));
        };

        const getCargoImpressaoLabel = (cargo) => String(cargo || '').trim() || 'Sem cargo';

        const getPeriodoImpressao = () => {
            const dias = getDiasMesImpressao();
            if (!dias.length) return { inicio: '', fim: '' };
            if (impressaoEscalaState.tipo === 'semanal') {
                const semana = getSemanasImpressao().find((item) => item.key === impressaoEscalaState.semana) || getSemanasImpressao()[0];
                return { inicio: semana?.dias[0] || dias[0], fim: semana?.dias[semana.dias.length - 1] || dias[dias.length - 1] };
            }
            if (impressaoEscalaState.tipo === 'diario') {
                const dia = impressaoEscalaState.dia || escalaBancoDiaSelect?.value || dias[0];
                return { inicio: dia, fim: dia };
            }
            if (impressaoEscalaState.tipo === 'periodo') {
                return {
                    inicio: impressaoPeriodoInicio?.value || dias[0],
                    fim: impressaoPeriodoFim?.value || dias[dias.length - 1]
                };
            }
            return { inicio: dias[0], fim: dias[dias.length - 1] };
        };

        const removerControlesCloneImpressao = (root) => {
            root.querySelectorAll('button, .employee-kebab-wrapper, .subsection-kebab-menu, .critical-status-chip').forEach((node) => {
                if (node.classList?.contains('daily-schedule-bar') || node.classList?.contains('daily-schedule-break') || node.classList?.contains('daily-schedule-rest')) {
                    const span = document.createElement('span');
                    span.className = node.className;
                    span.setAttribute('style', node.getAttribute('style') || '');
                    span.textContent = node.textContent || '';
                    node.replaceWith(span);
                    return;
                }
                node.remove();
            });
        };

        const filtrarLinhasCloneImpressao = (root, filtros = {}) => {
            const cargo = String(filtros.cargo ?? impressaoEscalaState.cargo ?? 'TODOS');
            const colaborador = String(filtros.colaborador ?? impressaoEscalaState.colaborador ?? 'TODOS');
            if (cargo === 'TODOS' && colaborador === 'TODOS') return;
            root.querySelectorAll('[data-escfunc-id]').forEach((node) => {
                const nodeId = String(node.dataset.escfuncId || '');
                const nodeCargo = getCargoImpressaoLabel(node.dataset.funcaoDescr || '');
                if (colaborador !== 'TODOS' && nodeId !== colaborador) node.remove();
                else if (cargo !== 'TODOS' && nodeCargo !== cargo) node.remove();
            });
            root.querySelectorAll('thead .monthly-quality-row, thead .monthly-totals-row').forEach((row) => row.remove());
        };

        const removerColunasForaPeriodoImpressao = (root, inicio, fim) => {
            if (!inicio || !fim) return;
            const dataRef = escalaDetalheAtual.mesRef ? new Date(escalaDetalheAtual.mesRef + 'T00:00:00') : new Date();
            const ano = dataRef.getFullYear();
            const mes = dataRef.getMonth();
            const total = new Date(ano, mes + 1, 0).getDate();
            const remover = [];
            for (let dia = 1; dia <= total; dia += 1) {
                const dataIso = formatDateForDb(ano, mes, dia);
                if (dataIso < inicio || dataIso > fim) remover.push(dia);
            }
            root.querySelectorAll('tr').forEach((row) => {
                const cells = Array.from(row.children);
                remover.slice().reverse().forEach((dia) => {
                    const cell = cells[dia];
                    if (cell) cell.remove();
                });
            });
        };

        const getCabecalhoImpressaoHtml = (titulo) => {
            const agora = new Date();
            const secao = getSecaoAtualBanco();
            const periodo = getPeriodoImpressao();
            const meta = 'Impresso em: ' + agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const subtitulo = [
                'Loja ' + (escalaDetalheAtual.lojaId || '-'),
                formatarMesTabela(escalaDetalheAtual.mesRef || ''),
                secao?.nome || '',
                periodo.inicio && periodo.fim ? formatarDataTabela(periodo.inicio) + ' a ' + formatarDataTabela(periodo.fim) : ''
            ].filter(Boolean).join(' | ');
            return '<div class="print-meta">' + escapeHtml(meta) + '<br>Página 1 de 1</div><div class="print-title">' + escapeHtml(titulo) + '</div><div class="print-subtitle">' + escapeHtml(subtitulo) + '</div>';
        };

        const getCloneMensalImpressao = (filtros = {}) => {
            const table = escalaBancoMensalContent?.querySelector('.monthly-scale-table');
            if (!table) return null;
            const wrapper = document.createElement('div');
            wrapper.className = 'monthly-scale-scroll';
            wrapper.appendChild(table.cloneNode(true));
            removerControlesCloneImpressao(wrapper);
            filtrarLinhasCloneImpressao(wrapper, filtros);
            const periodo = getPeriodoImpressao();
            removerColunasForaPeriodoImpressao(wrapper, periodo.inicio, periodo.fim);
            return wrapper;
        };

        const getCloneDetalhadoImpressao = (filtros = {}) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'bank-detailed-scale';
            const artigos = Array.from(escalaBancoDetalhadaContent?.querySelectorAll('.bank-employee-scale') || []);
            artigos.forEach((artigo) => wrapper.appendChild(artigo.cloneNode(true)));
            removerControlesCloneImpressao(wrapper);
            filtrarLinhasCloneImpressao(wrapper, filtros);
            const periodo = getPeriodoImpressao();
            removerColunasForaPeriodoImpressao(wrapper, periodo.inicio, periodo.fim);
            return wrapper.children.length ? wrapper : null;
        };

        const getCloneTimelineImpressao = (filtros = {}) => {
            const wrapper = document.createElement('div');
            const timeline = escalaBancoTimelineContent?.querySelector('.daily-schedule');
            if (!timeline) return null;
            wrapper.appendChild(timeline.cloneNode(true));
            removerControlesCloneImpressao(wrapper);
            filtrarLinhasCloneImpressao(wrapper, filtros);
            return wrapper;
        };

        const getHtmlCargosSeparadosImpressao = () => {
            const funcionarios = getFuncionariosImpressaoBanco();
            const cargos = [...new Set(funcionarios.map((funcionario) => getCargoImpressaoLabel(funcionario.cargo)))].sort((a, b) => a.localeCompare(b));
            const cargoSelecionado = String(impressaoEscalaState.cargo || 'TODOS');
            const cargosFiltrados = cargoSelecionado === 'TODOS' ? cargos : cargos.filter((cargo) => cargo === cargoSelecionado);
            const html = cargosFiltrados.map((cargo) => {
                const clone = getCloneMensalImpressao({ cargo, colaborador: impressaoEscalaState.colaborador });
                if (!clone) return '';
                return '<section class="print-role-section"><h4>' + escapeHtml(cargo) + '</h4>' + clone.outerHTML + '</section>';
            }).filter(Boolean).join('');
            return html ? { outerHTML: html } : null;
        };

        const getConteudoImpressaoBanco = () => {
            const tipo = impressaoEscalaState.tipo;
            const formato = impressaoEscalaState.formato;
            const tituloBase = tipo === 'diario'
                ? 'Escala de Trabalho - Diario'
                : tipo === 'semanal'
                    ? 'Escala de Trabalho - Semanal'
                    : tipo === 'periodo'
                        ? 'Escala de Trabalho - Periodo'
                        : 'Escala de Trabalho - Mensal';
            const clone = tipo === 'diario'
                ? getCloneTimelineImpressao()
                : formato === 'colaborador'
                    ? getCloneDetalhadoImpressao()
                    : formato === 'cargos'
                        ? getHtmlCargosSeparadosImpressao()
                    : getCloneMensalImpressao();
            if (!clone) return getCabecalhoImpressaoHtml(tituloBase) + '<div class="print-preview-empty">Nenhum dado disponível para imprimir com os filtros selecionados.</div>';
            return getCabecalhoImpressaoHtml(tituloBase) + clone.outerHTML;
        };

        const atualizarCamposPeriodoImpressao = () => {
            const tipo = impressaoEscalaState.tipo;
            impressaoEscalaModal?.querySelector('.print-week-field')?.classList.toggle('hidden', tipo !== 'semanal');
            impressaoEscalaModal?.querySelector('.print-day-field')?.classList.toggle('hidden', tipo !== 'diario');
            impressaoEscalaModal?.querySelector('.print-period-field')?.classList.toggle('hidden', tipo !== 'periodo');
        };

        const preencherFiltrosImpressaoBanco = () => {
            const funcionarios = getFuncionariosImpressaoBanco();
            const cargos = [...new Set(funcionarios.map((funcionario) => getCargoImpressaoLabel(funcionario.cargo)))].sort((a, b) => a.localeCompare(b));
            if (impressaoCargoSelect) {
                impressaoCargoSelect.innerHTML = '<option value="TODOS">Todos os cargos (' + cargos.length + ')</option>' + cargos.map((cargo) => '<option value="' + escapeHtml(cargo) + '">' + escapeHtml(cargo) + '</option>').join('');
                impressaoCargoSelect.value = cargos.includes(impressaoEscalaState.cargo) ? impressaoEscalaState.cargo : 'TODOS';
                impressaoEscalaState.cargo = impressaoCargoSelect.value;
            }
            const colaboradores = impressaoEscalaState.cargo === 'TODOS' ? funcionarios : funcionarios.filter((funcionario) => getCargoImpressaoLabel(funcionario.cargo) === impressaoEscalaState.cargo);
            if (impressaoColaboradorSelect) {
                impressaoColaboradorSelect.innerHTML = '<option value="TODOS">Todos os colaboradores (' + colaboradores.length + ')</option>' + colaboradores.map((funcionario) => '<option value="' + escapeHtml(funcionario.id) + '">' + escapeHtml((funcionario.chapa ? funcionario.chapa + ' - ' : '') + funcionario.nome) + '</option>').join('');
                impressaoColaboradorSelect.value = colaboradores.some((funcionario) => funcionario.id === impressaoEscalaState.colaborador) ? impressaoEscalaState.colaborador : 'TODOS';
                impressaoEscalaState.colaborador = impressaoColaboradorSelect.value;
            }
            const dias = getDiasMesImpressao();
            if (impressaoDiaSelect) {
                impressaoDiaSelect.innerHTML = dias.map((dataIso) => '<option value="' + escapeHtml(dataIso) + '">' + escapeHtml(formatarDiaTimelineBanco(dataIso)) + '</option>').join('');
                impressaoDiaSelect.value = impressaoEscalaState.dia || escalaBancoDiaSelect?.value || dias[0] || '';
                impressaoEscalaState.dia = impressaoDiaSelect.value;
            }
            const semanas = getSemanasImpressao();
            if (impressaoSemanaSelect) {
                impressaoSemanaSelect.innerHTML = semanas.map((semana, index) => '<option value="' + escapeHtml(semana.key) + '">Semana ' + (index + 1) + ' - ' + escapeHtml(formatarDataTabela(semana.dias[0]) + ' a ' + formatarDataTabela(semana.dias[semana.dias.length - 1])) + '</option>').join('');
                impressaoSemanaSelect.value = semanas.some((semana) => semana.key === impressaoEscalaState.semana) ? impressaoEscalaState.semana : semanas[0]?.key || '';
                impressaoEscalaState.semana = impressaoSemanaSelect.value;
            }
            if (impressaoPeriodoInicio && !impressaoPeriodoInicio.value) impressaoPeriodoInicio.value = dias[0] || '';
            if (impressaoPeriodoFim && !impressaoPeriodoFim.value) impressaoPeriodoFim.value = dias[dias.length - 1] || '';
        };

        const atualizarPreviewImpressaoBanco = () => {
            if (!impressaoEscalaPreview) return;
            impressaoEscalaState.orientacao = impressaoOrientacaoSelect?.value || 'landscape';
            impressaoEscalaPreview.classList.toggle('portrait', impressaoEscalaState.orientacao === 'portrait');
            impressaoEscalaPreview.innerHTML = getConteudoImpressaoBanco();
        };

        const abrirPainelImpressaoBanco = () => {
            impressaoEscalaState = {
                ...impressaoEscalaState,
                tipo: escalaDetalheAtual.visao === 'diaria' ? 'diario' : 'mensal',
                formato: escalaDetalheAtual.visao === 'diaria' ? 'todos' : impressaoEscalaState.formato || 'todos',
                cargo: 'TODOS',
                colaborador: 'TODOS',
                dia: escalaBancoDiaSelect?.value || impressaoEscalaState.dia,
                orientacao: impressaoOrientacaoSelect?.value || 'landscape'
            };
            preencherFiltrosImpressaoBanco();
            atualizarCamposPeriodoImpressao();
            impressaoEscalaTabs?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.printType === impressaoEscalaState.tipo));
            impressaoFormatoGrid?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.printFormat === impressaoEscalaState.formato));
            impressaoEscalaModal?.classList.remove('hidden');
            atualizarPreviewImpressaoBanco();
        };

        const fecharPainelImpressaoBanco = () => {
            impressaoEscalaModal?.classList.add('hidden');
        };

        resetarEscalaSecaoBancoBtn?.addEventListener('click', async () => {
            if (!escalaDetalheAtual.lojaId || !escalaDetalheAtual.mesRef || !escalaDetalheAtual.secaoAtiva) return;
            const confirmacao = await showInputModal({
                title: 'Resetar Escala',
                inputs: [{ type: 'message', text: 'A seção voltará para a etapa de liberação, mantendo os funcionários e os fixos cadastrados.' }],
                confirmText: 'Resetar',
                cancelText: 'Cancelar'
            });
            if (!confirmacao) return;
            resetarEscalaSecaoBancoBtn.disabled = true;
            try {
                await apiRequest('/api/escalas/resetar-secao', {
                    method: 'POST',
                    body: JSON.stringify({
                        lojaId: Number(escalaDetalheAtual.lojaId),
                        mesRef: escalaDetalheAtual.mesRef,
                        escsecaoId: Number(escalaDetalheAtual.secaoAtiva)
                    }),
                    timeoutMs: 120000
                });
                await recarregarSecaoAtualEscalaBanco(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef, escalaDetalheAtual.secaoAtiva);
                showInfoModal('Escala da seção resetada para liberação.', 'success');
            } catch (error) {
                showInfoModal(getApiErrorMessages(error), 'error');
            } finally {
                resetarEscalaSecaoBancoBtn.disabled = false;
            }
        });

        abrirImpressaoEscalaBtn?.addEventListener('click', abrirPainelImpressaoBanco);
        cancelarImpressaoEscalaBtn?.addEventListener('click', fecharPainelImpressaoBanco);
        fecharImpressaoEscalaBtn?.addEventListener('click', fecharPainelImpressaoBanco);
        impressaoEscalaModal?.addEventListener('click', (event) => {
            if (event.target === impressaoEscalaModal) fecharPainelImpressaoBanco();
        });
        impressaoEscalaTabs?.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-print-type]');
            if (!button) return;
            impressaoEscalaState.tipo = button.dataset.printType;
            impressaoEscalaTabs.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
            atualizarCamposPeriodoImpressao();
            preencherFiltrosImpressaoBanco();
            atualizarPreviewImpressaoBanco();
        });
        impressaoFormatoGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-print-format]');
            if (!button) return;
            impressaoEscalaState.formato = button.dataset.printFormat;
            impressaoFormatoGrid.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
            atualizarPreviewImpressaoBanco();
        });
        impressaoCargoSelect?.addEventListener('change', () => {
            impressaoEscalaState.cargo = impressaoCargoSelect.value;
            impressaoEscalaState.colaborador = 'TODOS';
            preencherFiltrosImpressaoBanco();
            atualizarPreviewImpressaoBanco();
        });
        impressaoColaboradorSelect?.addEventListener('change', () => {
            impressaoEscalaState.colaborador = impressaoColaboradorSelect.value;
            atualizarPreviewImpressaoBanco();
        });
        impressaoSemanaSelect?.addEventListener('change', () => {
            impressaoEscalaState.semana = impressaoSemanaSelect.value;
            atualizarPreviewImpressaoBanco();
        });
        impressaoDiaSelect?.addEventListener('change', () => {
            impressaoEscalaState.dia = impressaoDiaSelect.value;
            if (escalaBancoDiaSelect && escalaDetalheAtual.visao === 'diaria') {
                escalaBancoDiaSelect.value = impressaoEscalaState.dia;
                renderizarSecaoAtivaEscala();
            }
            atualizarPreviewImpressaoBanco();
        });
        impressaoPeriodoInicio?.addEventListener('change', atualizarPreviewImpressaoBanco);
        impressaoPeriodoFim?.addEventListener('change', atualizarPreviewImpressaoBanco);
        impressaoOrientacaoSelect?.addEventListener('change', atualizarPreviewImpressaoBanco);
        imprimirAgoraEscalaBtn?.addEventListener('click', () => {
            if (!printContainer) return;
            const pageSize = impressaoEscalaState.orientacao === 'portrait' ? 'portrait' : 'landscape';
            printContainer.innerHTML = '<style>@page { size: ' + pageSize + '; margin: 8mm; }</style>' + getConteudoImpressaoBanco();
            window.print();
        });

        imprimirDetalheBancoBtn?.addEventListener('click', () => {
            if (!escalaBancoDetalhadaContent) return;
            printContainer.innerHTML = '<div class="print-title">' + escapeHtml(escalaSecaoDetalheTitulo?.textContent || 'Escala detalhada') + '</div>' + escalaBancoDetalhadaContent.innerHTML;
            window.print();
        });

        validarDetalheBancoBtn?.addEventListener('click', async () => {
            validarDetalheBancoBtn.disabled = true;
            try {
                await validarDetalheBancoAtual();
            } finally {
                validarDetalheBancoBtn.disabled = false;
            }
        });

        const salvarAlteracoesDetalheBanco = async ({ oficializar = false } = {}) => {
            if (!hasPermission('escalas', 'editar')) {
                showInfoModal('Usuario sem permissao para salvar escalas.', 'error');
                return;
            }
            if (!escalaDetalheBancoAlterados.size) {
                if (oficializar && hasPermission('escalas', 'oficializar')) {
                    const result = await apiRequest('/api/escalas/oficializar', {
                        method: 'POST',
                        body: JSON.stringify({ lojaId: Number(escalaDetalheAtual.lojaId), mesRef: escalaDetalheAtual.mesRef }),
                        timeoutMs: 120000
                    });
                    showInfoModal('Escala oficializada. ' + (result.rm?.message || ''), result.rm?.ok === false ? 'error' : 'success');
                    window.location.hash = '/escalas-geradas';
                    return;
                }
                showInfoModal('Nenhuma alteração pendente para salvar.', 'info');
                return;
            }
            if (!escalaDetalheBancoValidada && !(await validarDetalheBancoAtual())) return;

            if (salvarDetalheBancoBtn) salvarDetalheBancoBtn.disabled = true;
            if (salvarRascunhoBancoBtn) salvarRascunhoBancoBtn.disabled = true;
            if (oficializarBancoBtn) oficializarBancoBtn.disabled = true;
            try {
                for (const funcionario of escalaDetalheBancoAlterados.values()) {
                    const dias = (escalaDetalheAtual.dias || [])
                        .filter(dia => String(dia.ESCFUNC_ID) === String(funcionario.escfuncId))
                        .map(dia => {
                            const descanso = isProgramacaoDescanso(dia.PROGRAMACAO);
                            const sigla = getValorDescanso(dia);
                            return {
                                data: String(dia.DT).slice(0, 10),
                                hrEnt1: descanso ? null : dia.HR_ENT1,
                                hrSai1: descanso ? null : dia.HR_SAI1,
                                hrEnt2: descanso ? null : dia.HR_ENT2,
                                hrSai2: descanso ? null : dia.HR_SAI2,
                                programacao: descanso ? sigla : 'TRB',
                                justificativa: dia.JUSTIFICATIVA_ALTERACAO || null
                            };
                        });
                    await apiRequest('/api/escalas/funcionario/revisao', {
                        method: 'POST',
                        body: JSON.stringify({
                            lojaId: Number(escalaDetalheAtual.lojaId),
                            mesRef: escalaDetalheAtual.mesRef,
                            funcionarios: [{ ...funcionario, dias }],
                            oficializada: oficializar ? 1 : 0,
                            justificativa: dias.find(dia => dia.justificativa)?.justificativa || null
                        })
                    });
                }
                if (oficializar && hasPermission('escalas', 'oficializar')) {
                    await apiRequest('/api/escalas/oficializar', {
                        method: 'POST',
                        body: JSON.stringify({ lojaId: Number(escalaDetalheAtual.lojaId), mesRef: escalaDetalheAtual.mesRef }),
                        timeoutMs: 120000
                    });
                }
                showInfoModal(oficializar ? 'Alterações salvas, oficializadas e enviadas para o RM.' : 'Rascunho salvo em nova revisão.', 'success');
                escalaDetalheBancoAlterados = new Map();
                window.location.hash = '/escalas-geradas';
            } catch (error) {
                showInfoModal(error.details?.length ? error.details : 'Não foi possível salvar a revisão individual: ' + error.message, 'error');
            } finally {
                if (salvarDetalheBancoBtn) salvarDetalheBancoBtn.disabled = false;
                if (salvarRascunhoBancoBtn) salvarRascunhoBancoBtn.disabled = false;
                if (oficializarBancoBtn) oficializarBancoBtn.disabled = false;
            }
        };

        salvarDetalheBancoBtn?.addEventListener('click', () => salvarAlteracoesDetalheBanco({ oficializar: false }));
        salvarRascunhoBancoBtn?.addEventListener('click', () => salvarAlteracoesDetalheBanco({ oficializar: false }));
        oficializarBancoBtn?.addEventListener('click', () => salvarAlteracoesDetalheBanco({ oficializar: true }));

        gerarDetalhadaBancoBtn?.addEventListener('click', () => {
            escalaBancoDetalhadaCard?.classList.toggle('hidden');
            if (!escalaBancoDetalhadaCard?.classList.contains('hidden')) {
                escalaBancoDetalhadaCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        criticasDetalheBancoBtn?.addEventListener('click', () => {
            exibirCriticasBancoAgrupadas();
        });

        let escalaBancoSingleClickTimer = null;
        let escalaBancoPendingClickTimer = null;
        let escalaBancoDragData = null;
        let escalaBancoIgnorarProximoClick = false;

        const getDiaBancoPorId = (escprogdiaId) => {
            return (escalaDetalheAtual.dias || []).find(item => String(item.ESCPROGDIA_ID || '') === String(escprogdiaId));
        };

        const getHorarioTrabalhoReferenciaBanco = (diaReferencia) => {
            const dataReferencia = new Date(String(diaReferencia?.DT || '').slice(0, 10) + 'T00:00:00');
            const horariosValidos = (escalaDetalheAtual.dias || [])
                .filter((dia) => String(dia.ESCFUNC_ID || '') === String(diaReferencia?.ESCFUNC_ID || ''))
                .filter((dia) => !isProgramacaoDescanso(dia.PROGRAMACAO))
                .filter((dia) => [dia.HR_ENT1, dia.HR_SAI1, dia.HR_ENT2, dia.HR_SAI2].every((value) => /^\d{2}:\d{2}$/.test(String(value || ''))))
                .sort((left, right) => {
                    const leftDiff = Math.abs(new Date(String(left.DT || '').slice(0, 10) + 'T00:00:00') - dataReferencia);
                    const rightDiff = Math.abs(new Date(String(right.DT || '').slice(0, 10) + 'T00:00:00') - dataReferencia);
                    return leftDiff - rightDiff;
                });
            const horario = horariosValidos[0] || {};
            return {
                HR_ENT1: horario.HR_ENT1 || '08:00',
                HR_SAI1: horario.HR_SAI1 || '12:00',
                HR_ENT2: horario.HR_ENT2 || '13:10',
                HR_SAI2: horario.HR_SAI2 || '17:58'
            };
        };

        const aplicarTrabalhoBancoDia = (dia, horario) => {
            dia.PROGRAMACAO = 'TRB';
            dia.HR_ENT1 = horario.HR_ENT1;
            dia.HR_SAI1 = horario.HR_SAI1;
            dia.HR_ENT2 = horario.HR_ENT2;
            dia.HR_SAI2 = horario.HR_SAI2;
            dia.JUSTIFICATIVA_ALTERACAO = 'Ajuste rapido de folga';
            marcarDiaBancoAlterado(dia);
        };

        const aplicarFolgaBancoDia = (dia, sigla = 'F') => {
            const descansoSigla = String(sigla || 'F').trim().toUpperCase();
            dia.PROGRAMACAO = descansoSigla;
            dia.HR_ENT1 = descansoSigla;
            dia.HR_SAI1 = descansoSigla;
            dia.HR_ENT2 = descansoSigla;
            dia.HR_SAI2 = descansoSigla;
            dia.JUSTIFICATIVA_ALTERACAO = 'Ajuste rapido de folga';
            marcarDiaBancoAlterado(dia);
        };

        const alternarFolgaRapidaBanco = async (escprogdiaId) => {
            const dia = getDiaBancoPorId(escprogdiaId);
            if (!dia) return;
            if (isDiaProtegidoBanco(dia)) {
                showInfoModal('Este dia possui férias, afastamento ou folga fixa e não pode ser alterado automaticamente.', 'info');
                return;
            }
            if (isProgramacaoDescanso(dia.PROGRAMACAO)) {
                aplicarTrabalhoBancoDia(dia, getHorarioTrabalhoReferenciaBanco(dia));
            } else {
                aplicarFolgaBancoDia(dia, 'F');
            }
            await validarDetalheBancoSilencioso();
            renderizarSecaoAtivaEscala();
        };

        const trocarFolgaBanco = async (origemId, destinoId) => {
            const origem = getDiaBancoPorId(origemId);
            const destino = getDiaBancoPorId(destinoId);
            if (!origem || !destino || String(origem.ESCPROGDIA_ID || '') === String(destino.ESCPROGDIA_ID || '')) return;
            if (isDiaProtegidoBanco(origem) || isDiaProtegidoBanco(destino)) {
                showInfoModal('Férias, afastamentos e folgas fixas não podem ser movidos pela edição rápida.', 'info');
                return;
            }
            if (String(origem.ESCFUNC_ID || '') !== String(destino.ESCFUNC_ID || '')) {
                showInfoModal('Arraste a folga apenas dentro da linha do mesmo funcionario.', 'info');
                return;
            }
            if (!isProgramacaoDescanso(origem.PROGRAMACAO)) return;
            if (isProgramacaoDescanso(destino.PROGRAMACAO)) {
                showInfoModal('Escolha um dia trabalhado para trocar com a folga.', 'info');
                return;
            }
            const horarioDestino = {
                HR_ENT1: destino.HR_ENT1,
                HR_SAI1: destino.HR_SAI1,
                HR_ENT2: destino.HR_ENT2,
                HR_SAI2: destino.HR_SAI2
            };
            const siglaOrigem = getValorDescanso(origem);
            aplicarTrabalhoBancoDia(origem, horarioDestino);
            aplicarFolgaBancoDia(destino, siglaOrigem);
            await validarDetalheBancoSilencioso();
            renderizarSecaoAtivaEscala();
        };

        const editarDiaEscalaPorId = async (escprogId, escprogdiaId) => {
            if (escalaDetalheAtual.status === 'FINALIZADA') {
                showInfoModal('Escala finalizada não pode ser editada.', 'info');
                return;
            }
            const dia = (escalaDetalheAtual.dias || []).find(item => String(item.ESCPROGDIA_ID || '') === String(escprogdiaId));
            if (!escprogId || !escprogdiaId || !dia) return;
            if (isDiaFixoBanco(dia)) {
                await removerFixoDiaGeradoBanco(dia, { renderizar: false });
            }
            if (isDiaProtegidoBanco(dia)) {
                showInfoModal('Este dia possui férias, afastamento ou fixo cadastrado e não pode ser alterado.', 'info');
                return;
            }
            const descansoAtual = isProgramacaoDescanso(dia.PROGRAMACAO);
            const values = await abrirModalEdicaoDiaPadrao({
                title: 'Editar dia ' + formatarDataTabela(dia.DT),
                ids: { tipoDia: 'BANCO_TIPO_DIA', descanso: 'BANCO_DESCANSO', hrEnt1: 'BANCO_HR_ENT1', hrSai1: 'BANCO_HR_SAI1', hrEnt2: 'BANCO_HR_ENT2', hrSai2: 'BANCO_HR_SAI2', justificativa: 'BANCO_JUSTIFICATIVA' },
                dia,
                descansoAtual
            });
            if (!values) return;
            const aplicarValoresBancoDia = (diaAlvo) => {
                const folgaLocal = values.BANCO_TIPO_DIA === 'DESCANSO';
                const programacaoLocal = folgaLocal ? String(values.BANCO_DESCANSO || 'F').trim().toUpperCase() : 'TRB';
                diaAlvo.PROGRAMACAO = programacaoLocal;
                diaAlvo.HR_ENT1 = folgaLocal ? programacaoLocal : values.BANCO_HR_ENT1;
                diaAlvo.HR_SAI1 = folgaLocal ? programacaoLocal : values.BANCO_HR_SAI1;
                diaAlvo.HR_ENT2 = folgaLocal ? programacaoLocal : values.BANCO_HR_ENT2;
                diaAlvo.HR_SAI2 = folgaLocal ? programacaoLocal : values.BANCO_HR_SAI2;
                diaAlvo.JUSTIFICATIVA_ALTERACAO = String(values.BANCO_JUSTIFICATIVA || '').trim();
                marcarDiaBancoAlterado(diaAlvo);
            };
            if (values.REPLICAR_MES) {
                const diaSelecionado = Number(String(dia.DT || '').slice(8, 10));
                (escalaDetalheAtual.dias || [])
                    .filter((diaAlvo) => String(diaAlvo.ESCFUNC_ID || '') === String(dia.ESCFUNC_ID || ''))
                    .filter((diaAlvo) => Number(String(diaAlvo.DT || '').slice(8, 10)) >= diaSelecionado)
                    .filter((diaAlvo) => !isDataBloqueadaParaEdicao(String(diaAlvo.DT || '').slice(0, 10)))
                    .filter((diaAlvo) => String(diaAlvo.ESCPROGDIA_ID || '') === String(dia.ESCPROGDIA_ID || '') || !isProgramacaoDescanso(diaAlvo.PROGRAMACAO))
                    .forEach(aplicarValoresBancoDia);
            } else {
                aplicarValoresBancoDia(dia);
            }
            await validarDetalheBancoSilencioso();
            renderizarSecaoAtivaEscala();
        };

        escalaBancoMensalContent?.addEventListener('click', (event) => {
            const scaleMenuButton = event.target.closest('.scale-kebab-btn');
            const scaleDetalhe = event.target.closest('.scale-ver-detalhes-funcionario');
            const scaleEditarHorarios = event.target.closest('.scale-editar-horarios-funcionario');
            const scaleTransferir = event.target.closest('.scale-transferir-funcionario-subsecao');
            if (scaleMenuButton) {
                event.preventDefault();
                event.stopPropagation();
                const menuId = String(scaleMenuButton.dataset.scaleMenuId || '');
                const wrap = scaleMenuButton.closest('.scale-kebab-wrap');
                const menu = wrap?.querySelector('.subsection-kebab-menu');
                const shouldOpen = menu?.classList.contains('hidden');
                escalaBancoMensalContent.querySelectorAll('.scale-kebab-wrap .subsection-kebab-menu').forEach(item => item.classList.add('hidden'));
                escalaDetalheAtual.menuFuncionarioAberto = shouldOpen ? menuId : null;
                if (shouldOpen) menu.classList.remove('hidden');
                return;
            }
            if (scaleDetalhe || scaleEditarHorarios || scaleTransferir) {
                event.preventDefault();
                event.stopPropagation();
                const escfuncId = scaleDetalhe?.dataset.id || scaleEditarHorarios?.dataset.id || scaleTransferir?.dataset.id;
                const funcionario = getFuncionarioBancoPorId(escfuncId);
                escalaDetalheAtual.menuFuncionarioAberto = null;
                if (!funcionario) return showInfoModal('Funcionário não encontrado na escala.', 'error');
                if (scaleDetalhe) {
                    showInfoModal([
                        'Nome: ' + (funcionario.NOME || ''),
                        'Matrícula: ' + (funcionario.CHAPA || ''),
                        'Cargo: ' + (funcionario.FUNCAO_DESCR || ''),
                        'Subseção: ' + (funcionario.SUBSECAO_DESCR || getSubsetorDetalheNome(funcionario) || 'Sem subseção')
                    ], 'info');
                    renderizarSecaoAtivaEscala();
                    return;
                }
                if (scaleEditarHorarios) {
                    window.location.hash = '/escala-funcionario/' + encodeURIComponent(escfuncId) + '/' + encodeURIComponent(escalaDetalheAtual.lojaId) + '/' + encodeURIComponent(escalaDetalheAtual.mesRef);
                    return;
                }
                if (scaleTransferir) {
                    abrirModalTransferenciaSubsecao(funcionario, {
                        origemEscala: true,
                        subsecoes: getSubsecoesRawSecaoAtualBanco()
                    }).catch(error => showInfoModal(error.message, 'error'));
                    return;
                }
            }
            const adicionarFixoButton = event.target.closest('.adicionar-fixo-secao-banco');
            if (adicionarFixoButton) {
                event.preventDefault();
                abrirModalFixoSecaoBanco().catch(error => showInfoModal(error.message, 'error'));
                return;
            }
            const pendingCell = event.target.closest('.pending-skeleton-cell[data-pending-fixed="1"]');
            if (pendingCell) {
                event.preventDefault();
                if (pendingCell.classList.contains('locked-day')) {
                    showInfoModal('Dias ja passados nao podem receber fixos de escala.', 'info');
                    return;
                }
                clearTimeout(escalaBancoPendingClickTimer);
                escalaBancoPendingClickTimer = setTimeout(() => {
                    if (pendingCell.dataset.hasFixo === '1') {
                        removerFixoSecaoBanco({
                            escfuncId: Number(pendingCell.dataset.escfuncId),
                            DT: pendingCell.dataset.dataIso
                        }, '', { recarregar: false }).catch(error => showInfoModal(error.message, 'error'));
                        return;
                    }
                    salvarFixoSecaoBanco({
                        escfuncId: Number(pendingCell.dataset.escfuncId),
                        DT: pendingCell.dataset.dataIso,
                        PROGRAMACAO: 'F',
                        HR_ENT1: null,
                        HR_SAI1: null,
                        HR_ENT2: null,
                        HR_SAI2: null,
                        JUSTIFICATIVA: 'Folga fixa cadastrada na liberacao da escala.'
                    }, '', { recarregar: false }).catch(error => showInfoModal(error.message, 'error'));
                }, 220);
                return;
            }
            const gerarSecaoButton = event.target.closest('.gerar-escala-secao-banco');
            if (gerarSecaoButton) {
                event.preventDefault();
                const secaoKey = gerarSecaoButton.dataset.secaoKey;
                const subsetorKey = escalaDetalheAtual.subsetorAtivo;
                gerarSecaoButton.disabled = true;
                gerarSecaoButton.innerHTML = '<span class="material-symbols-outlined">progress_activity</span>Gerando...';
                apiRequest('/api/escalas/gerar-secao', {
                    method: 'POST',
                    body: JSON.stringify({
                        lojaId: Number(escalaDetalheAtual.lojaId),
                        mesRef: escalaDetalheAtual.mesRef,
                        escsecaoId: Number(secaoKey),
                        escfuncIds: escalaDetalheAtual.subsetorAtivo ? getFuncionariosSecaoAtualBanco().map(funcionario => Number(funcionario.ESCFUNC_ID)).filter(Boolean) : undefined
                    }),
                    timeoutMs: 120000
                }).then(async (data) => {
                    const resultado = data.resultado || {};
                    const criticas = resultado.criticas || [];
                    await carregarDetalheEscalaMensal(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef);
                    escalaDetalheAtual.secaoAtiva = secaoKey;
                    escalaDetalheAtual.subsetorAtivo = subsetorKey;
                    escalaBancoDetalhadaCard?.classList.remove('hidden');
                    prepararSecoesDetalheEscala();
                    showInfoModal(criticas.length ? ['Escala da seção gerada com críticas.', ...criticas] : 'Escala da seção gerada com sucesso.', criticas.length ? 'error' : 'success');
                }).catch((error) => {
                    gerarSecaoButton.disabled = false;
                    gerarSecaoButton.innerHTML = '<span class="material-symbols-outlined">calendar_month</span>Gerar Escala da Seção';
                    showInfoModal(getApiErrorMessages(error), 'error');
                });
                return;
            }
            const criticalSectionButton = event.target.closest('.banco-critical-section-chip');
            if (criticalSectionButton) {
                exibirCriticasBancoAgrupadas();
                return;
            }
            if (escalaBancoIgnorarProximoClick) {
                escalaBancoIgnorarProximoClick = false;
                return;
            }
            const cell = event.target.closest('.monthly-editable-day[data-escprogdia-id]');
            if (!cell) return;
            if (cell.classList.contains('locked-day')) {
                showInfoModal('Dias ja passados nao podem ser alterados manualmente.', 'info');
                return;
            }
            const dia = getDiaBancoPorId(cell.dataset.escprogdiaId);
            if (isDiaFixoBanco(dia)) {
                clearTimeout(escalaBancoSingleClickTimer);
                escalaBancoSingleClickTimer = setTimeout(() => {
                    removerFixoDiaGeradoBanco(dia).catch(error => showInfoModal(error.message, 'error'));
                }, 220);
                return;
            }
            if (isDiaProtegidoBanco(dia)) {
                showInfoModal('Este dia possui férias, afastamento ou folga fixa e não pode ser alterado automaticamente.', 'info');
                return;
            }
            clearTimeout(escalaBancoSingleClickTimer);
            escalaBancoSingleClickTimer = setTimeout(() => {
                alternarFolgaRapidaBanco(cell.dataset.escprogdiaId).catch(error => showInfoModal(error.message, 'error'));
            }, 220);
        });

        escalaBancoMensalContent?.addEventListener('dblclick', (event) => {
            const pendingCell = event.target.closest('.pending-skeleton-cell[data-pending-fixed="1"]');
            if (pendingCell) {
                event.preventDefault();
                clearTimeout(escalaBancoPendingClickTimer);
                if (pendingCell.classList.contains('locked-day')) {
                    showInfoModal('Dias ja passados nao podem receber fixos de escala.', 'info');
                    return;
                }
                abrirModalFixoSecaoBanco({
                    escfuncId: pendingCell.dataset.escfuncId,
                    dataIso: pendingCell.dataset.dataIso,
                    tipo: 'TRB',
                    PROGRAMACAO: pendingCell.dataset.programacao || 'TRB',
                    HR_ENT1: pendingCell.dataset.hrEnt1 || '08:00',
                    HR_SAI1: pendingCell.dataset.hrSai1 || '12:00',
                    HR_ENT2: pendingCell.dataset.hrEnt2 || '13:10',
                    HR_SAI2: pendingCell.dataset.hrSai2 || '17:58'
                }).catch(error => showInfoModal(error.message, 'error'));
                return;
            }
            const cell = event.target.closest('.monthly-editable-day[data-escprogdia-id]');
            if (!cell) return;
            event.preventDefault();
            clearTimeout(escalaBancoSingleClickTimer);
            if (cell.classList.contains('locked-day')) {
                showInfoModal('Dias ja passados nao podem ser alterados manualmente.', 'info');
                return;
            }
            const dia = getDiaBancoPorId(cell.dataset.escprogdiaId);
            if (!isDiaFixoBanco(dia) && isDiaProtegidoBanco(dia)) {
                showInfoModal('Este dia possui férias, afastamento ou folga fixa e não pode ser alterado.', 'info');
                return;
            }
            editarDiaEscalaPorId(cell.dataset.escprogId, cell.dataset.escprogdiaId);
        });

        escalaBancoMensalContent?.addEventListener('dragstart', (event) => {
            const cell = event.target.closest('.monthly-editable-day[data-escprogdia-id]');
            const dia = getDiaBancoPorId(cell?.dataset?.escprogdiaId);
            if (!cell || !cell.classList.contains('rest-cell') || cell.classList.contains('locked-day') || isDiaProtegidoBanco(dia)) {
                event.preventDefault();
                return;
            }
            escalaBancoDragData = {
                escprogdiaId: cell.dataset.escprogdiaId,
                escfuncId: cell.dataset.escfuncId
            };
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', cell.dataset.escprogdiaId || '');
            cell.classList.add('dragging-rest-cell');
        });

        escalaBancoMensalContent?.addEventListener('dragover', (event) => {
            const cell = event.target.closest('.monthly-editable-day[data-escprogdia-id]');
            if (!cell || !escalaBancoDragData || cell.classList.contains('locked-day')) return;
            if (String(cell.dataset.escfuncId || '') !== String(escalaBancoDragData.escfuncId || '')) return;
            event.preventDefault();
            cell.classList.add('drop-rest-target');
        });

        escalaBancoMensalContent?.addEventListener('dragleave', (event) => {
            event.target.closest('.monthly-editable-day')?.classList.remove('drop-rest-target');
        });

        escalaBancoMensalContent?.addEventListener('drop', (event) => {
            const cell = event.target.closest('.monthly-editable-day[data-escprogdia-id]');
            if (!cell || !escalaBancoDragData) return;
            event.preventDefault();
            escalaBancoIgnorarProximoClick = true;
            setTimeout(() => { escalaBancoIgnorarProximoClick = false; }, 350);
            escalaBancoMensalContent.querySelectorAll('.drop-rest-target, .dragging-rest-cell').forEach(item => item.classList.remove('drop-rest-target', 'dragging-rest-cell'));
            trocarFolgaBanco(escalaBancoDragData.escprogdiaId, cell.dataset.escprogdiaId).catch(error => showInfoModal(error.message, 'error'));
            escalaBancoDragData = null;
        });

        escalaBancoMensalContent?.addEventListener('dragend', () => {
            escalaBancoMensalContent.querySelectorAll('.drop-rest-target, .dragging-rest-cell').forEach(item => item.classList.remove('drop-rest-target', 'dragging-rest-cell'));
            escalaBancoDragData = null;
        });

        escalaBancoMensalContent?.addEventListener('keypress', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const cell = event.target.closest('.monthly-editable-day[data-escprogdia-id]');
            if (!cell) return;
            event.preventDefault();
            editarDiaEscalaPorId(cell.dataset.escprogId, cell.dataset.escprogdiaId);
        });

        escalaBancoDetalhadaContent?.addEventListener('click', (event) => {
            const criticalButton = event.target.closest('.banco-critical-chip');
            if (criticalButton) {
                const funcionario = agruparDiasPorFuncionario(escalaDetalheAtual.dias || []).find(item => String(item.escfuncId) === String(criticalButton.dataset.escfuncId));
                const criticas = funcionario ? getCriticasFuncionarioBanco(funcionario) : [];
                showInfoModal(criticas.length ? criticas : 'Nenhuma critica pendente.', criticas.length ? 'error' : 'info');
                return;
            }
            const button = event.target.closest('.bank-day-edit');
            if (!button) return;
            if (button.disabled) {
                showInfoModal('Dias ja passados nao podem ser alterados manualmente.', 'info');
                return;
            }
            editarDiaEscalaPorId(button.dataset.escprogId, button.dataset.escprogdiaId);
        });

        escalaBancoTimelineContent?.addEventListener('click', (event) => {
            const button = event.target.closest('.daily-bank-edit');
            if (!button) return;
            editarDiaEscalaPorId(button.dataset.escprogId, button.dataset.escprogdiaId);
        });

        const criarTimelineTurnosSelecionados = (turnosSelecionados) => {
            return turnosSelecionados.map(turno => {
                const codigo = turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '';
                return {
                    turnoId: String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID || ''),
                    secaoId: String(turno.ESCSECAO_ID || ''),
                    secaoNome: codigo + (turno.DESCR || 'Secao'),
                    quantidade: String(turno.QTDE_COLABORADORES || 1),
                    inicio: turno.HR_ENT1 || '',
                    fim: turno.HR_SAI2 || turno.HR_SAI1 || '',
                    inicioIntervalo: turno.HR_SAI1 || '',
                    fimIntervalo: turno.HR_ENT2 || ''
                };
            }).filter(turno => turno.secaoId && turno.quantidade && turno.inicio && turno.fim);
        };

        const selecionarTurnosRascunhoEscala = async () => {
            if (!turnosSecaoCache || turnosSecaoCache.length === 0) {
                showInfoModal('Nenhum turno por secao cadastrado para esta loja. Cadastre os turnos antes de gerar a timeline.', 'info');
                return [];
            }

            const options = turnosSecaoCache.map(turno => {
                const codigo = turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '';
                const periodo = (turno.HR_ENT1 || '') + ' - ' + (turno.HR_SAI1 || '') + ' / ' + (turno.HR_ENT2 || '') + ' - ' + (turno.HR_SAI2 || '');
                return {
                    value: String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID),
                    label: codigo + (turno.DESCR || 'Secao') + ' | ' + periodo + ' | ' + (turno.QTDE_COLABORADORES || 1) + ' colaborador(es)',
                    checked: true
                };
            });

            const values = await showInputModal({
                title: 'Gerar Timeline',
                inputs: [
                    { type: 'message', text: 'Selecione os turnos por secao que entrarao nesta escala.' },
                    { label: 'Turnos cadastrados', type: 'checkbox-group', id: 'turnos-rascunho', options, required: true }
                ],
                confirmText: 'Gerar Timeline'
            });
            if (!values) return null;

            const selecionados = new Set((values['turnos-rascunho'] || []).map(String));
            return turnosSecaoCache.filter(turno => selecionados.has(String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID)));
        };
        const renderizarSecoesCriacao = () => {
            if (!criacaoSecoesLista) return;
            criacaoSecoesLista.innerHTML = '';
            if (!turnosSecaoCache.length) {
                criacaoSecoesLista.innerHTML = '<p class="table-card-subtitle">Nenhum turno por secao cadastrado para esta loja.</p>';
                return;
            }
            turnosSecaoCache.forEach((turno) => {
                const id = String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID || '');
                const codigo = turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '';
                const periodo = (turno.HR_ENT1 || '') + ' - ' + (turno.HR_SAI1 || '') + ' / ' + (turno.HR_ENT2 || '') + ' - ' + (turno.HR_SAI2 || '');
                const card = document.createElement('article');
                card.className = 'section-choice-card';
                card.innerHTML = '<label class="section-choice-main"><input type="checkbox" value="' + escapeHtml(id) + '" checked><strong>' + escapeHtml(codigo + (turno.DESCR || 'Secao')) + '</strong></label><span>' + escapeHtml(periodo) + '</span><small>' + escapeHtml(turno.QTDE_COLABORADORES || 1) + ' colaborador(es)</small><button type="button" class="action-btn-table banco-action editar-turno-criacao" data-id="' + escapeHtml(turno.ESCSECAOTURNO_ID || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button>';
                if (!hasPermission('turnos-secao', 'editar')) {
                    card.querySelector('.editar-turno-criacao')?.remove();
                }
                criacaoSecoesLista.appendChild(card);
            });
        };

        const sincronizarDadosEscalaComTurnosCache = () => {
            dadosEscala = dadosEscala.map(item => {
                const turno = turnosSecaoCache.find(cache => String(cache.ESCSECAOTURNO_ID || cache.ESCSECAO_ID) === String(item.turnoId || item.secaoId));
                return turno ? criarTimelineTurnosSelecionados([turno])[0] || item : item;
            });
            renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
            renderizarTimelineCompleta('timeline-content', dadosEscala);
            invalidarValidacaoDetalhada();
            detailedScaleHasBeenGenerated = false;
            detalhadaModal?.classList.add('hidden');
        };

        const abrirModalTurnoSecaoCriacao = async (turno = null) => {
            const action = turno ? 'editar' : 'criar';
            if (!hasPermission('turnos-secao', action)) {
                showInfoModal('Usuario sem permissao para salvar turnos por secao.', 'error');
                return;
            }
            const loja = criacaoEscalaLoja?.value || lojaEscalaSelect.value;
            if (!loja) {
                showInfoModal('Selecione uma loja antes de cadastrar turnos.', 'error');
                return;
            }
            if (!secoesLojaCache.length) await carregarSecoesDaLoja(true, loja);
            const secaoOptions = secoesLojaCache.map(secao => ({ value: secao.ESCSECAO_ID, label: getSecaoLabel(secao) }));
            if (!secaoOptions.length) {
                showInfoModal('Nenhuma secao cadastrada para esta loja.', 'error');
                return;
            }
            const values = await showInputModal({
                title: 'Dados do turno',
                panelClass: 'bg-white rounded-lg shadow-xl w-11/12 max-w-4xl flex flex-col turno-form-modal',
                inputs: [
                    { type: 'message', text: 'Selecione a secao e informe os horarios usados no gerador de escala.', className: 'turno-form-subtitle' },
                    { label: 'Secao', type: 'select', id: 'CRI_TURNO_SECAO', value: turno?.ESCSECAO_ID || secaoOptions[0]?.value || '', options: secaoOptions, required: true },
                    { label: 'Colaboradores previstos', type: 'number', id: 'CRI_TURNO_QTDE', value: turno?.QTDE_COLABORADORES || 1, required: true },
                    { label: 'Entrada 1', type: 'time', id: 'CRI_TURNO_ENT1', value: turno?.HR_ENT1 || '08:00', required: true },
                    { label: 'Saida 1', type: 'time', id: 'CRI_TURNO_SAI1', value: turno?.HR_SAI1 || '12:00', required: true },
                    { label: 'Entrada 2', type: 'time', id: 'CRI_TURNO_ENT2', value: turno?.HR_ENT2 || '13:10', required: true },
                    { label: 'Saida 2', type: 'time', id: 'CRI_TURNO_SAI2', value: turno?.HR_SAI2 || '17:58', required: true }
                ],
                confirmText: 'Salvar Turno'
            });
            if (!values) return;
            const payload = {
                ESCSECAO_ID: Number(values.CRI_TURNO_SECAO),
                QTDE_COLABORADORES: Number(values.CRI_TURNO_QTDE),
                HR_ENT1: values.CRI_TURNO_ENT1,
                HR_SAI1: values.CRI_TURNO_SAI1,
                HR_ENT2: values.CRI_TURNO_ENT2,
                HR_SAI2: values.CRI_TURNO_SAI2
            };
            const erros = validarTurnoCadastroSecao(payload);
            if (erros.length) {
                showInfoModal(erros, 'error');
                return;
            }
            const url = turno?.ESCSECAOTURNO_ID
                ? `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao/${encodeURIComponent(turno.ESCSECAOTURNO_ID)}`
                : `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao`;
            await apiRequest(url, { method: turno?.ESCSECAOTURNO_ID ? 'PUT' : 'POST', body: JSON.stringify(payload) });
            await carregarTurnosSecaoDaLoja(true, loja);
            renderizarSecoesCriacao();
            sincronizarDadosEscalaComTurnosCache();
            showInfoModal('Turno salvo e atualizado na escala.', 'success');
        };

        const iniciarCriacaoEscalaPagina = async () => {
            const loja = criacaoEscalaLoja?.value;
            const mes = Number(criacaoEscalaMes?.value);
            const ano = Number(criacaoEscalaAno?.value);
            if (!loja || Number.isNaN(mes) || Number.isNaN(ano)) {
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Selecione loja, mes e ano para iniciar a criacao.';
                return;
            }
            const mesRef = formatDateForDb(ano, mes, 1);
            lojaEscalaSelect.value = loja;
            funcionariosLojaSelect.value = loja;
            if (homeLojaSelect) homeLojaSelect.value = loja;
            if (escalasFiltroLoja) escalasFiltroLoja.value = loja;
            mesSelect.value = String(mes);
            anoSelect.value = String(ano);
            if (escalasFiltroMes) escalasFiltroMes.value = String(mes);
            if (escalasFiltroAno) escalasFiltroAno.value = String(ano);

            const existentes = await carregarResumoEscalas(loja, mesRef);
            if (existentes.length > 0) {
                criacaoSecoesCard?.classList.add('hidden');
                criacaoTimelineCard?.classList.add('hidden');
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Ja existe uma escala para esta loja e mes. Abra a escala existente; nao sera criada outra escala.';
                return;
            }

            dadosEscala = [];
            escalaCarregadaId = null;
            currentLoadedScale = null;
            escalaRascunhoAtivo = true;
            escalaRascunhoContexto = { loja, mesRef, criadoEm: new Date().toISOString() };
            await carregarSecoesDaLoja(true, loja);
            await carregarTurnosSecaoDaLoja(true, loja);
            renderizarSecoesCriacao();
            criacaoSecoesCard?.classList.remove('hidden');
            criacaoTimelineCard?.classList.add('hidden');
            if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Selecione as secoes e gere a timeline.';
        };

        const gerarTimelineCriacaoPagina = async () => {
            const selecionados = new Set(Array.from(criacaoSecoesLista?.querySelectorAll('input[type="checkbox"]:checked') || []).map(input => input.value));
            const turnosSelecionados = turnosSecaoCache.filter(turno => selecionados.has(String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID)));
            if (!turnosSelecionados.length) {
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Selecione ao menos uma seção para gerar a timeline.';
                return;
            }
            dadosEscala = criarTimelineTurnosSelecionados(turnosSelecionados);
            renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
            renderizarTimelineCompleta('timeline-content', dadosEscala);
            atualizarContadoresHome();
            criacaoTimelineCard?.classList.remove('hidden');
            esqueletoModal?.classList.add('hidden');
            detalhadaModal?.classList.add('hidden');
            detailedScaleHasBeenGenerated = false;
            if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Timeline atualizada. Revise as seções e distribua os funcionários.';
        };

        novoTurnoCriacaoBtn?.addEventListener('click', () => {
            if (!hasPermission('turnos-secao', 'editar')) return showInfoModal('Usuario sem permissao para editar turnos por secao.', 'error');
            abrirModalTurnoSecaoCriacao().catch(error => showInfoModal(error.message, 'error'));
        });

        criacaoSecoesLista?.addEventListener('click', (event) => {
            const button = event.target.closest('.editar-turno-criacao');
            if (!button) return;
            event.preventDefault();
            if (!hasPermission('turnos-secao', 'editar')) return showInfoModal('Usuario sem permissao para editar turnos por secao.', 'error');
            const turno = turnosSecaoCache.find(item => String(item.ESCSECAOTURNO_ID || '') === String(button.dataset.id));
            abrirModalTurnoSecaoCriacao(turno).catch(error => showInfoModal(error.message, 'error'));
        });

        const iniciarNovaEscalaRascunho = async (opcoes = {}) => {
            if (!canCreateEscalaSessao()) {
                showInfoModal('Perfil Lider nao pode criar novas escalas.', 'error');
                return;
            }
            const dataPadrao = opcoes.mesRef ? new Date(opcoes.mesRef + 'T00:00:00') : null;
            let valoresPadrao = {
                loja: String(opcoes.loja || (escalasFiltroLoja?.value !== 'all' ? escalasFiltroLoja?.value : '') || lojaEscalaSelect.value || ''),
                mes: dataPadrao ? String(dataPadrao.getMonth()) : String(escalasFiltroMes?.value !== 'all' ? escalasFiltroMes?.value : mesSelect.value),
                ano: dataPadrao ? String(dataPadrao.getFullYear()) : String(escalasFiltroAno?.value !== 'all' ? escalasFiltroAno?.value : anoSelect.value)
            };

            const lojaOptions = Array.from(lojaEscalaSelect.options || []).filter(option => option.value).map(option => ({ value: option.value, label: option.textContent }));
            const mesOptions = Array.from(mesSelect.options || []).map(option => ({ value: option.value, label: option.textContent }));
            const anoOptions = Array.from(anoSelect.options || []).map(option => ({ value: option.value, label: option.textContent }));

            while (true) {
                const values = await showInputModal({
                    title: 'Gerar Escala',
                    inputs: [
                        { type: 'message', text: 'Selecione a loja e o período da nova escala.' },
                        { label: 'Loja', type: 'select', id: 'nova-escala-loja', value: valoresPadrao.loja, options: lojaOptions, required: true },
                        { label: 'Mês', type: 'select', id: 'nova-escala-mes', value: valoresPadrao.mes, options: mesOptions, required: true },
                        { label: 'Ano', type: 'select', id: 'nova-escala-ano', value: valoresPadrao.ano, options: anoOptions, required: true }
                    ],
                    cancelText: 'Cancelar',
                    confirmText: 'Gerar Escala'
                });
                if (!values) return;

                const loja = values['nova-escala-loja'];
                const mes = Number(values['nova-escala-mes']);
                const ano = Number(values['nova-escala-ano']);
                const mesRef = formatDateForDb(ano, mes, 1);
                valoresPadrao = { loja, mes: String(mes), ano: String(ano) };

                let existentes = [];
                try {
                    existentes = await carregarResumoEscalas(loja, mesRef);
                } catch (error) {
                    showInfoModal('Não foi possível validar a escala existente: ' + error.message, 'error');
                    return;
                }

                if (existentes.length > 0) {
                    const abrirEscala = await showInputModal({
                        title: 'Escala já existente',
                        inputs: [{ type: 'message', text: 'Já existe uma escala para esta loja e mês. Selecione um novo mês ou Modifique a Escala criada.' }],
                        cancelText: 'Voltar',
                        confirmText: 'Abrir Escala'
                    });
                    if (abrirEscala) {
                        window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
                        return;
                    }
                    continue;
                }

                let liberacao;
                try {
                    liberacao = await apiRequest('/api/escalas/liberar-mensal', {
                        method: 'POST',
                        body: JSON.stringify({ mesRef, lojas: [Number(loja)] })
                    });
                } catch (error) {
                    showInfoModal(getApiErrorMessages(error), 'error');
                    return;
                }
                if (!escalaLiberacaoFoiCriada(liberacao)) return;
                escalaRascunhoAtivo = false;
                escalaRascunhoContexto = null;
                window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
                return;
            }
        };

        window.addEventListener('beforeunload', (event) => {
            if (!escalaRascunhoAtivo) return;
            event.preventDefault();
            event.returnValue = '';
        });

        salvarEscalaBtn.addEventListener('click', async () => {
            if (!escalaDetalhadaValidada) {
                showInfoModal('Valide a escala e corrija todas as criticas antes de salvar.', 'error');
                return;
            }
            const dados = parseEscalaFromModal();
            if (!dados.length) {
                showInfoModal('Gere a escala detalhada antes de salvar.', 'error');
                return;
            }

            const semFuncionario = dados.filter(colaborador => !colaborador.escfuncId || !colaborador.chapa);
            if (semFuncionario.length > 0) {
                showInfoModal('Distribua todos os funcionários antes de salvar a escala.', 'error');
                return;
            }

            const lojaId = Number(escalaRascunhoContexto?.loja || lojaEscalaSelect.value);
            const mes = Number(mesSelect.value);
            const ano = Number(anoSelect.value);
            const escalaParaSalvar = {
                id: Date.now(),
                lojaId,
                mes,
                ano,
                dados,
                timelineData: JSON.parse(JSON.stringify(dadosEscala)),
                mesAno: detalhadaMesAno.textContent,
                criadoEm: new Date().toISOString(),
                criadoPorLogin: usuarioSessaoCache?.login || '',
                criadoPorNome: usuarioSessaoCache?.nome || usuarioSessaoCache?.login || ''
            };

            salvarEscalaBtn.disabled = true;
            salvarEscalaBtn.textContent = 'Salvando...';
            try {
                const result = await sincronizarEscalaComBanco(escalaParaSalvar);
                const total = result.saved ? result.saved.length : 0;
                const mesRef = formatDateForDb(ano, mes, 1);
                let mensagemSalvamento = 'Escala salva no banco com sucesso para ' + total + ' funcionário(s).';
                let tipoMensagemSalvamento = 'success';
                if (!total) throw new Error('Nenhum funcionário foi gravado no banco.');
                if (hasPermission('escalas', 'oficializar')) {
                    try {
                        const oficializacao = await apiRequest('/api/escalas/oficializar', {
                            method: 'POST',
                            body: JSON.stringify({ lojaId, mesRef }),
                            timeoutMs: 120000
                        });
                        const rm = oficializacao.rm || {};
                        const rmMensagem = rm.enabled
                            ? 'RM: ' + (rm.enviados || 0) + ' evento(s) enviado(s), ' + (rm.falhas || 0) + ' falha(s).'
                            : 'RM: integração desabilitada no .env.';
                        mensagemSalvamento = [mensagemSalvamento, 'Escala oficializada após o salvamento.', rmMensagem];
                        tipoMensagemSalvamento = rm.falhas ? 'error' : 'success';
                    } catch (oficializacaoError) {
                        mensagemSalvamento = [mensagemSalvamento, 'Falha ao oficializar/enviar para o RM: ' + formatApiError(oficializacaoError)];
                        tipoMensagemSalvamento = 'error';
                    }
                }
                escalaRascunhoAtivo = false;
                escalaRascunhoContexto = null;
                escalaCarregadaId = null;
                currentLoadedScale = null;
                showInfoModal(mensagemSalvamento, tipoMensagemSalvamento);
                await consultarEscalasBancoLocal().catch(() => {});
                setTimeout(() => { window.location.hash = '/escalas-geradas'; }, tipoMensagemSalvamento === 'error' ? 4000 : 700);
            } catch (error) {
                showInfoModal(formatApiError(error), 'error');
            } finally {
                salvarEscalaBtn.disabled = false;
                salvarEscalaBtn.textContent = 'Salvar Escala';
            }
        });

        tabelaRegistrosBody?.addEventListener('click', async (e) => {
            const targetButton = e.target.closest('.action-btn-table');
            if (!targetButton) return;
            
            const escalaId = targetButton.dataset.id;
            const escalas = getEscalasSalvas();
            const escalaAlvo = escalas.find(e => e.id == escalaId);
            if (!escalaAlvo) return;

            if (targetButton.classList.contains('load')) {
                await aplicarLojaDaEscalaSalva(escalaAlvo);
                dadosEscala = JSON.parse(JSON.stringify(escalaAlvo.timelineData || []));
                renderizarTimelineCompleta('timeline-content');
                atualizarContadoresHome();
                carregarEscalaDetalhada(escalaAlvo);
            } 
            else if (targetButton.classList.contains('view-skeleton')) {
                await aplicarLojaDaEscalaSalva(escalaAlvo);
                dadosEscala = JSON.parse(JSON.stringify(escalaAlvo.timelineData || []));
                renderizarTimelineCompleta('timeline-content');
                atualizarContadoresHome();
                carregarEsqueletoSalvo(escalaAlvo);
            }
            else if (targetButton.classList.contains('view-timeline')) {
                if (escalaAlvo.timelineData) {
                    const visualizerContent = document.getElementById('timeline-visualizer-content');
                    document.getElementById('timelineVisualizerTitle').textContent = `Linha do Tempo - ${escalaAlvo.nome}`;
                    renderizarTimelineCompleta('timeline-visualizer-content', escalaAlvo.timelineData);
                    visualizerContent.dataset.source = JSON.stringify(escalaAlvo.timelineData); // Salva os dados para impressão
                    timelineVisualizerModal.classList.remove('hidden');
                } else {
                    showInfoModal('Esta escala não possui uma Linha do Tempo salva.', 'info');
                }
            }
            else if (targetButton.classList.contains('delete')) {
                const values = await showInputModal({
                    title: `Excluir Escala "${escalaAlvo.nome}"`,
                    inputs: [{ label: 'Digite a senha para confirmar a exclusão:', type: 'password', id: 'escala-senha', required: true }],
                    confirmText: 'Excluir Permanentemente'
                });

                if (values && values['escala-senha'] === escalaAlvo.senha) {
                    const novasEscalas = escalas.filter(e => e.id != escalaId);
                    await salvarEscalasNoStorage(novasEscalas);
                    renderizarTabelaRegistros();
                    showInfoModal("Escala excluída com sucesso.", "success");
                } else if (values) {
                    showInfoModal("Senha incorreta. A exclusão foi cancelada.", "error");
                }
            }
        });

        tabelaBancoBody.addEventListener('click', async (e) => {
            const abrirButton = e.target.closest('.banco-abrir');
            const criarButton = e.target.closest('.banco-criar');
            const criarVazioButton = e.target.closest('.banco-criar-vazio');
            const oficializarButton = e.target.closest('.banco-oficializar');
            const inativarButton = e.target.closest('.banco-inativar');
            const historicoButton = e.target.closest('.banco-historico');
            if (criarVazioButton) {
                iniciarNovaEscalaRascunho().catch(error => showInfoModal(error.message, 'error'));
                return;
            }
            if (!abrirButton && !criarButton && !oficializarButton && !inativarButton && !historicoButton) return;

            const button = abrirButton || criarButton || oficializarButton || inativarButton || historicoButton;
            const loja = button.dataset.loja;
            const mesRef = button.dataset.mesRef;
            if (loja) {
                lojaEscalaSelect.value = loja;
                if (homeLojaSelect) homeLojaSelect.value = loja;
                if (escalasFiltroLoja) escalasFiltroLoja.value = loja;
            }
            if (mesRef) {
                const dataRef = new Date(mesRef + 'T00:00:00');
                mesSelect.value = String(dataRef.getMonth());
                anoSelect.value = String(dataRef.getFullYear());
                if (escalasFiltroMes) escalasFiltroMes.value = String(dataRef.getMonth());
                if (escalasFiltroAno) escalasFiltroAno.value = String(dataRef.getFullYear());
            }
            if (criarButton) {
                if (!hasPermission('escalas', 'criar')) {
                    showInfoModal('Usuario sem permissao para criar escalas.', 'error');
                    return;
                }
                window.location.hash = '/escalas/nova/' + loja + '/' + mesRef;
                return;
            }

            if (oficializarButton) {
                if (!hasPermission('escalas', 'oficializar')) {
                    showInfoModal('Usuario sem permissao para oficializar escalas.', 'error');
                    return;
                }
                const confirmacao = await showInputModal({
                    title: 'Oficializar escala',
                    inputs: [{ type: 'message', text: 'A escala sera marcada como oficial. Qualquer alteracao futura criara uma nova revisao nao oficializada.' }],
                    confirmText: 'Oficializar'
                });
                if (!confirmacao) return;
                try {
                    const result = await apiRequest('/api/escalas/oficializar', { method: 'POST', body: JSON.stringify({ lojaId: Number(loja), mesRef }) });
                    const rm = result.rm || {};
                    const mensagemRm = rm.enabled ? `RM: ${rm.enviados || 0} evento(s) enviado(s), ${rm.falhas || 0} falha(s).` : 'RM: integracao desabilitada no .env.';
                    showInfoModal(['Escala oficializada com sucesso.', mensagemRm], rm.falhas ? 'error' : 'success');
                    await consultarEscalasBancoLocal();
                } catch (error) {
                    showInfoModal(error.details?.length ? error.details : error.message, 'error');
                }
                return;
            }

            if (inativarButton) {
                if (!hasPermission('escalas', 'inativar')) {
                    showInfoModal('Usuario sem permissao para inativar escalas.', 'error');
                    return;
                }
                const confirmacao = await showInputModal({
                    title: 'Inativar escala',
                    inputs: [{ type: 'message', text: 'A escala sera inativada e nao aparecera nos relatorios nem bloqueara nova escala para o mesmo mes.' }],
                    confirmText: 'Inativar'
                });
                if (!confirmacao) return;
                await apiRequest('/api/escalas/inativar', { method: 'POST', body: JSON.stringify({ lojaId: Number(loja), mesRef }) });
                showInfoModal('Escala inativada com sucesso.', 'success');
                await consultarEscalasBancoLocal();
                return;
            }

            if (historicoButton) {
                window.location.hash = '/historico/' + encodeURIComponent(loja) + '/' + encodeURIComponent(mesRef);
                return;
            }

            window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
        });

        document.getElementById('timeline-content').addEventListener('click', async (e) => {
            const clickedRow = e.target.closest('.timeline-row');
            if (!clickedRow) return;

            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');
            
            if (editBtn) {
                 e.stopPropagation(); 
                 entrarModoEdicao(parseInt(editBtn.dataset.index));
                 return;
            }
            
            if (deleteBtn) {
                e.stopPropagation();
                const result = await showInputModal({
                    title: 'Confirmar Exclusão',
                    inputs: [{ type: 'message', text: 'Tem certeza que deseja excluir este turno da linha do tempo?' }],
                    confirmText: 'Excluir',
                });
                if(result) {
                    dadosEscala.splice(parseInt(deleteBtn.dataset.index), 1); 
                    renderizarTimelineCompleta('timeline-content'); 
                    atualizarContadoresHome();
                }
                return;
            }

            const actionsContainer = clickedRow.querySelector('.row-actions');
            if (actionsContainer) {
                 document.querySelectorAll('#timeline-content .row-actions').forEach(actions => { 
                    if(actions !== actionsContainer) actions.classList.add('hidden'); 
                }); 
                actionsContainer.classList.toggle('hidden');
            }
        });


        document.getElementById('criacaoTimelineContent')?.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-btn');
            if (editButton && !distribuicaoFolgasBloqueada) {
                event.preventDefault();
                const index = Number(editButton.dataset.index);
                const item = dadosEscala[index];
                const turno = turnosSecaoCache.find(cache => String(cache.ESCSECAOTURNO_ID || cache.ESCSECAO_ID) === String(item?.turnoId || item?.secaoId));
                await abrirModalTurnoSecaoCriacao(turno);
                return;
            }
            const deleteButton = event.target.closest('.delete-btn');
            if (!deleteButton || distribuicaoFolgasBloqueada) return;
            event.preventDefault();
            const index = Number(deleteButton.dataset.index);
            const turnoRemovido = dadosEscala[index];
            const confirmacao = await showInputModal({
                title: 'Remover seção da escala',
                inputs: [{ type: 'message', text: 'A seção será removida da timeline antes da escala ser salva.' }],
                cancelText: 'Cancelar',
                confirmText: 'Remover'
            });
            if (!confirmacao) return;
            dadosEscala.splice(index, 1);
            if (turnoRemovido?.turnoId) {
                const checkbox = criacaoSecoesLista?.querySelector('input[value="' + CSS.escape(String(turnoRemovido.turnoId)) + '"]');
                if (checkbox) checkbox.checked = false;
            }
            renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
            renderizarTimelineCompleta('timeline-content', dadosEscala);
            esqueletoModal?.classList.add('hidden');
            detalhadaModal?.classList.add('hidden');
            detailedScaleHasBeenGenerated = false;
            atualizarContadoresHome();
        });
        const applyEsqueletoZoom = () => {
            const container = document.getElementById('tabela-esqueleto-container');
            if(container) {
                container.style.transform = `scale(${esqueletoZoomLevel})`;
            }
        };

        const applyMainTimelineZoom = () => {
            const container = document.getElementById('timeline-content');
            if (container) {
                container.style.transform = `scale(${mainTimelineZoomLevel})`;
            }
        };

        zoomInBtn.addEventListener('click', () => { if (esqueletoZoomLevel < 2.0) { esqueletoZoomLevel = parseFloat((esqueletoZoomLevel + 0.1).toFixed(2)); applyEsqueletoZoom(); } });
        zoomOutBtn.addEventListener('click', () => { if (esqueletoZoomLevel > 0.5) { esqueletoZoomLevel = parseFloat((esqueletoZoomLevel - 0.1).toFixed(2)); applyEsqueletoZoom(); } });
        zoomResetBtn.addEventListener('click', () => { esqueletoZoomLevel = 1.0; applyEsqueletoZoom(); });
        
        timelineZoomInBtn.addEventListener('click', () => { if (mainTimelineZoomLevel < 2.0) { mainTimelineZoomLevel = parseFloat((mainTimelineZoomLevel + 0.1).toFixed(2)); applyMainTimelineZoom(); } });
        timelineZoomOutBtn.addEventListener('click', () => { if (mainTimelineZoomLevel > 0.5) { mainTimelineZoomLevel = parseFloat((mainTimelineZoomLevel - 0.1).toFixed(2)); applyMainTimelineZoom(); } });
        timelineZoomResetBtn.addEventListener('click', () => { mainTimelineZoomLevel = 1.0; applyMainTimelineZoom(); });


        const inicializarControladoresPaginas = () => {
            escalaCriacaoPageController = window.EscalaCriacaoPage?.createEscalaCriacaoPage?.({
                prepararPaineisCriacao,
                iniciarCriacaoEscalaPagina,
                gerarTimelineCriacaoPagina,
                iniciarNovaEscalaRascunho,
                renderizarSecoesCriacao,
                abrirModalTurnoSecaoCriacao
            }) || {
                prepararPaineis: prepararPaineisCriacao,
                iniciarCriacao: iniciarCriacaoEscalaPagina,
                gerarTimeline: gerarTimelineCriacaoPagina,
                iniciarRascunho: iniciarNovaEscalaRascunho,
                renderizarSecoes: renderizarSecoesCriacao,
                abrirTurnoSecao: abrirModalTurnoSecaoCriacao
            };

            escalaDetalhePageController = window.EscalaDetalhePage?.createEscalaDetalhePage?.({
                carregarDetalheEscalaBanco,
                carregarDetalheEscalaMensal,
                renderizarSecaoAtivaEscala,
                validarDetalheBancoAtual,
                editarDiaEscalaPorId
            }) || {
                carregarIndividual: carregarDetalheEscalaBanco,
                carregarMensal: carregarDetalheEscalaMensal,
                renderizarSecaoAtiva: renderizarSecaoAtivaEscala,
                validar: validarDetalheBancoAtual,
                editarDia: editarDiaEscalaPorId
            };

            escalaFuncionarioPageController = window.EscalaFuncionarioPage?.createEscalaFuncionarioPage?.({
                prepararFiltrosEscalaFuncionarios,
                carregarEscalasFuncionarios,
                carregarEscalaFuncionarioEdicao,
                renderizarEscalaFuncionarioEdicao,
                distribuirFolgasFuncionario,
                validarEscalaFuncionarioAtual
            }) || {
                prepararFiltros: prepararFiltrosEscalaFuncionarios,
                carregarLista: carregarEscalasFuncionarios,
                carregarEdicao: carregarEscalaFuncionarioEdicao,
                renderizarEdicao: renderizarEscalaFuncionarioEdicao,
                distribuirFolgas: distribuirFolgasFuncionario,
                validar: validarEscalaFuncionarioAtual
            };

            catalogosPageController = window.CatalogosPage?.createCatalogosPage?.({
                carregarFuncionariosTela,
                carregarSecoesTela,
                prepararFormularioSecao,
                carregarTurnosSecaoTela,
                carregarTiposDescansoTela,
                carregarHorariosPadraoTela,
                carregarRegrasTela
            }) || {
                carregarFuncionarios: carregarFuncionariosTela,
                carregarSecoes: carregarSecoesTela,
                prepararFormularioSecao,
                carregarTurnosSecao: carregarTurnosSecaoTela,
                carregarTiposDescanso: carregarTiposDescansoTela,
                carregarHorariosPadrao: carregarHorariosPadraoTela,
                carregarRegras: carregarRegrasTela
            };

            accessPageController = window.AccessPage?.createAccessPage?.({
                carregarAcessosTela,
                renderizarAcessosTela,
                carregarPerfisAcesso,
                renderizarRolesSettings,
                abrirModalPerfilAcesso
            }) || {
                carregarAcessos: carregarAcessosTela,
                renderizarAcessos: renderizarAcessosTela,
                carregarPerfis: carregarPerfisAcesso,
                renderizarPerfis: renderizarRolesSettings,
                abrirPerfil: abrirModalPerfilAcesso
            };

            rmPageController = window.RmPage?.createRmPage?.({
                prepararFiltrosRm,
                carregarRmLogsTela
            }) || {
                prepararFiltros: prepararFiltrosRm,
                carregarLogs: carregarRmLogsTela
            };
        };

        inicializarControladoresPaginas();

        // --- LOGICA DE CONFIGURACOES ---
        const salvarConfiguracoes = async () => {
            const settingsForm = document.getElementById('settings-form');
            const inputs = settingsForm.querySelectorAll('input');
            let settings = {};
            inputs.forEach(input => {
                settings[input.id] = input.value;
            });
            await salvarConfigNoServidor(settings);
            
            await showInputModal({
                title: 'Sucesso',
                inputs: [{ type: 'message', text: 'Configurações salvas. A página será recarregada para aplicar as mudanças.' }],
                confirmText: 'OK',
                cancelText: ''
            });
            location.reload();
        };

        const carregarConfiguracoes = () => {
            const settings = escalaConfigCache;
            if (settings) {
                Object.keys(settings).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = settings[key];
                    }
                });
            }
        };

        // --- INICIALIZACAO ---
        window.onload = async () => { 
            try {
                popularSeletoresData();
                popularFiltrosEscalas();
                await carregarUsuarioSessao();
                configurarAcoesAdmin();
                await carregarEstadoServidor();
                await carregarLojasEscala();
                await carregarSecoesDaLoja(true);
                await carregarTurnosSecaoDaLoja(true);
                await carregarFuncionariosDaLoja(true);
            } catch (error) {
                showInfoModal(`Erro ao carregar dados salvos: ${error.message}`, 'error');
            }
           
            carregarConfiguracoes();
            
            if (getEscalasSalvas().length === 0) {
                 dadosEscala = []; 
            }
            mainTimelineZoomLevel = 1.0;
            applyMainTimelineZoom();
            renderizarTimelineCompleta('timeline-content'); 
            atualizarContadoresHome();
            if (!window.location.hash) {
                window.location.hash = isPerfilLiderSessao() ? '/turnos-secao' : '/escalas-geradas';
                return;
            }
            handleHashNavigation(); 
            renderizarTabelaRegistros();
            // Fluxos de importacao/backup local ficam desativados: o banco e a origem oficial.
        };
// --- LOGICA 5X2 - 100% CLT + EQUILIBRIO DE EQUIPE ---
const EPOCH_MON = new Date(2024, 0, 1); 

const distribuirFolgas5x2Auto = async () => {
    const total = colaboradorShifts.length;
    if (total === 0) {
        showInfoModal("Gere a tabela com colaboradores primeiro.", "error");
        return;
    }

    const rule = parseInt(document.getElementById('regraDomingoSelect').value);
    const month = parseInt(mesSelect.value);
    const year = parseInt(anoSelect.value);
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startScale = new Date(firstDay); startScale.setDate(startScale.getDate() - 14);
    let endScale = new Date(lastDay); endScale.setDate(endScale.getDate() + 7);

    let scheduleMap = Array.from({ length: total }, () => ({}));
    let offCountPerDay = {};

    await carregarAusenciasDaLoja(getLojaContextoEscala());

    const getWeekKeyDate = (date) => {
        const segunda = new Date(date);
        segunda.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        return segunda.getFullYear() + '-' + String(segunda.getMonth() + 1).padStart(2, '0') + '-' + String(segunda.getDate()).padStart(2, '0');
    };

    const contarFolgasSemanaMapa = (colabIdx, date) => {
        const weekKey = getWeekKeyDate(date);
        let totalSemana = 0;
        for (let offset = 0; offset < 7; offset += 1) {
            const cursor = new Date(weekKey + 'T00:00:00');
            cursor.setDate(cursor.getDate() + offset);
            if (scheduleMap[colabIdx][cursor.toDateString()] === 'F') totalSemana += 1;
        }
        return totalSemana;
    };

    const marcarFolgaNoMapa = (colabIdx, date, options = {}) => {
        const key = date.toDateString();
        if (scheduleMap[colabIdx][key] === 'F') return;
        if (!options.force && contarFolgasSemanaMapa(colabIdx, date) >= 2) return;
        scheduleMap[colabIdx][key] = 'F';
        offCountPerDay[key] = (offCountPerDay[key] || 0) + 1;
    };

    const aplicarAusenciasObrigatoriasNaSemana = (weekDays) => {
        for (let i = 0; i < total; i++) {
            const funcionario = getFuncionarioSelecionadoPorLinha(i);
            if (!funcionario) continue;

            weekDays.forEach((date) => {
                const dataIso = formatDateForDb(date.getFullYear(), date.getMonth(), date.getDate());
                const ausencia = encontrarAusenciaFuncionario(funcionario.ESCFUNC_ID, funcionario.CHAPA, dataIso);
                if (ausencia) {
                    marcarFolgaNoMapa(i, date, { force: true });
                }
            });
        }
    };

    let current = new Date(startScale);
    
    while (current <= endScale) {
        if (current.getDay() === 1) { // Processa bloco de Segunda a Domingo
            let weekDays = [];
            for(let i=0; i<7; i++) {
                let d = new Date(current); d.setDate(d.getDate() + i);
                weekDays.push(d);
            }
            const sunday = weekDays[6];
            const weeksSinceEpoch = Math.floor((sunday - EPOCH_MON) / (1000 * 60 * 60 * 24 * 7));
            aplicarAusenciasObrigatoriasNaSemana(weekDays);

            // PASSO 1: ATRIBUIR DOMINGOS (Regra de Rodízio)
            for (let i = 0; i < total; i++) {
                const isSundayOff = ((weeksSinceEpoch % rule + rule) % rule) === (i % rule);
                if(isSundayOff && scheduleMap[i][sunday.toDateString()] !== 'F') {
                    marcarFolgaNoMapa(i, sunday);
                }
            }

            // PASSO 2: ATRIBUIR FOLGAS OBRIGATORIAS (TRAVA DOS 6 DIAS)
            for (let i = 0; i < total; i++) {
                for (let dIdx = 0; dIdx < 6; dIdx++) {
                    const diaAtual = weekDays[dIdx];
                    let streak = 0;
                    let checkDate = new Date(diaAtual);
                    for (let s = 1; s <= 7; s++) {
                        checkDate.setDate(checkDate.getDate() - 1);
                        if (scheduleMap[i][checkDate.toDateString()] === 'T') streak++;
                        else if (scheduleMap[i][checkDate.toDateString()] === 'F') break;
                    }
                    if (streak >= 6 && scheduleMap[i][diaAtual.toDateString()] !== 'F') {
                        marcarFolgaNoMapa(i, diaAtual);
                    }
                }
            }

            // PASSO 3: COMPLETAR QUOTA 5X2 EVITANDO FOLGAS CONSECUTIVAS
            for (let i = 0; i < total; i++) {
                let currentOffs = weekDays.filter(d => scheduleMap[i][d.toDateString()] === 'F').length;
                let offsNeeded = 2 - currentOffs;

                if (offsNeeded > 0) {
                    for (let n = 0; n < offsNeeded; n++) {
                        let bestDay = null;
                        let minScore = Infinity;

                        for (let dIdx = 0; dIdx < 6; dIdx++) { // Tenta de Segunda a Sábado
                            const diaCandidato = weekDays[dIdx];
                            if (!scheduleMap[i][diaCandidato.toDateString()] && contarFolgasSemanaMapa(i, diaCandidato) < 2) {
                                
                                // Cálculo de penalidade (Score)
                                let peopleOffHoje = offCountPerDay[diaCandidato.toDateString()] || 0;
                                let score = peopleOffHoje * 100; // Peso base pelo equilíbrio da equipe

                                if (score < minScore) {
                                    minScore = score;
                                    bestDay = diaCandidato;
                                }
                            }
                        }

                        if (bestDay) {
                            marcarFolgaNoMapa(i, bestDay);
                        }
                    }
                }

                // PASSO 4: FINALIZAR DIAS DE TRABALHO
                weekDays.forEach(d => {
                    if (!scheduleMap[i][d.toDateString()]) scheduleMap[i][d.toDateString()] = 'T';
                });
            }
        }
        current.setDate(current.getDate() + 1);
    }

    const garantirLimiteDiasConsecutivos = () => {
        const maxDias = getMaxDiasConsecutivos5x2();
        for (let colabIdx = 0; colabIdx < total; colabIdx++) {
            let consecutivos = 0;
            const cursor = new Date(startScale);
            while (cursor <= lastDay) {
                const key = cursor.toDateString();
                const status = scheduleMap[colabIdx][key] || 'T';
                if (status === 'F') {
                    consecutivos = 0;
                } else {
                    consecutivos++;
                    const dentroDoMes = cursor >= firstDay && cursor <= lastDay;
                    if (consecutivos > maxDias && dentroDoMes) {
                        marcarFolgaNoMapa(colabIdx, cursor);
                        consecutivos = 0;
                    }
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        }
    };

    garantirLimiteDiasConsecutivos();

    // --- RENDERIZACAO FINAL ---
    const rows = document.querySelectorAll('#tabela-esqueleto tbody tr');
    rows.forEach((row, colabIdx) => {
        const dayCells = row.querySelectorAll('.escala-cell');
        dayCells.forEach((cell, cellIdx) => {
            const day = cellIdx + 1;
            const date = new Date(year, month, day);
            const status = scheduleMap[colabIdx][date.toDateString()];
            const isSunday = date.getDay() === 0;

            cell.textContent = '';
            delete cell.dataset.ausenciaObrigatoria;
            cell.removeAttribute('title');
            cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');

            if (status === 'F') {
                cell.textContent = 'F';
                if (isSunday) cell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                else cell.classList.add('bg-red-300', 'text-white', 'font-bold');
            } else if (isSunday) {
                cell.classList.add('bg-yellow-100');
            }
        });
    });

    const ausenciasAplicadas = aplicarAusenciasNoEsqueleto();
    atualizarContagemEsqueleto();
    detailedScaleHasBeenGenerated = false;
    detalhadaModalBody.innerHTML = '';
    detalhadaModal.classList.add('hidden');
    gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
    definirBloqueioDistribuicao(true);
    if (ausenciasAplicadas.length > 0) {
        showInfoModal([
            "Distribuição concluída. Ausências cadastradas foram aplicadas como folga obrigatória.",
            ...ausenciasAplicadas
        ], "success");
    } else {
        showInfoModal("Distribuicao concluida: 5x2 equilibrada com regra de domingo e descansos.", "success");
    }
};

// Adicionar o Event Listener para o novo botão (coloque dentro do window.onload ou junto aos outros botões)
autoDistribuirFolgasBtn.addEventListener('click', distribuirFolgas5x2Auto);
