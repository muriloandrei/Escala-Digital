// --- SELETORES DE PÁGINAS E NAVEGAÇÃO ---
        const timelinePage = document.getElementById('timeline-page');
        const registrosPage = document.getElementById('registros-page');
        const funcionariosPage = document.getElementById('funcionarios-page');
        const secoesPage = document.getElementById('secoes-page');
        const secaoFormPage = document.getElementById('secao-form-page');
        const escalaDetalhePage = document.getElementById('escala-detalhe-page');
        const acessosPage = document.getElementById('acessos-page');
        const rolesPage = document.getElementById('roles-page');
        const settingsPage = document.getElementById('settings-page');
        
        const navTimeline = document.getElementById('nav-timeline');
        const navEscalasCriadas = document.getElementById('nav-escalas-criadas');
        const navRegistros = document.getElementById('nav-registros');
        const navFuncionarios = document.getElementById('nav-funcionarios');
        const navSecoes = document.getElementById('nav-secoes');
        const navAcessos = document.getElementById('nav-acessos');
        const navRoles = document.getElementById('nav-roles');
        const navSettings = document.getElementById('nav-settings');
        
        const salvarSettingsBtn = document.getElementById('salvarSettingsBtn');
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const goToTimelineBtn = document.getElementById('goToTimelineBtn');
        const consultarBancoBtn = document.getElementById('consultarBancoBtn');
        const sincronizarBancoBtn = document.getElementById('sincronizarBancoBtn');
        const tabelaBancoBody = document.getElementById('tabela-banco-body');
        const bancoResumo = document.getElementById('bancoResumo');
        const funcionariosLojaSelect = document.getElementById('funcionariosLojaSelect');
        const carregarFuncionariosTelaBtn = document.getElementById('carregarFuncionariosTelaBtn');
        const funcionariosTitulo = document.getElementById('funcionariosTitulo');
        const tabelaFuncionariosBody = document.getElementById('tabela-funcionarios-body');
        const secoesLojaSelect = document.getElementById('secoesLojaSelect');
        const novaSecaoBtn = document.getElementById('novaSecaoBtn');
        const carregarSecoesBtn = document.getElementById('carregarSecoesBtn');
        const secoesTitulo = document.getElementById('secoesTitulo');
        const tabelaSecoesBody = document.getElementById('tabela-secoes-body');
        const secaoFormTitulo = document.getElementById('secaoFormTitulo');
        const voltarSecoesBtn = document.getElementById('voltarSecoesBtn');
        const secaoForm = document.getElementById('secaoForm');
        const secaoFormId = document.getElementById('secaoFormId');
        const secaoFormLoja = document.getElementById('secaoFormLoja');
        const secaoFormCodigo = document.getElementById('secaoFormCodigo');
        const secaoFormDescr = document.getElementById('secaoFormDescr');
        const secaoFormQtde = document.getElementById('secaoFormQtde');
        const secaoFormHrEnt1 = document.getElementById('secaoFormHrEnt1');
        const secaoFormHrSai1 = document.getElementById('secaoFormHrSai1');
        const secaoFormHrEnt2 = document.getElementById('secaoFormHrEnt2');
        const secaoFormHrSai2 = document.getElementById('secaoFormHrSai2');
        const detalheMesSelect = document.getElementById('detalheMesSelect');
        const voltarEscalasBtn = document.getElementById('voltarEscalasBtn');
        const escalaDetalheTitulo = document.getElementById('escalaDetalheTitulo');
        const escalaDetalheResumo = document.getElementById('escalaDetalheResumo');
        const tabelaEscalaDetalheBody = document.getElementById('tabela-escala-detalhe-body');
        const carregarAcessosBtn = document.getElementById('carregarAcessosBtn');
        const tabelaAcessosBody = document.getElementById('tabela-acessos-body');
        let novoUsuarioBtn = null;
        const currentPageTitle = document.getElementById('currentPageTitle');
        const loggedUserName = document.getElementById('loggedUserName');
        const loggedUserStores = document.getElementById('loggedUserStores');
        const logoutAppBtn = document.getElementById('logoutAppBtn');
        const abrirTurnoModalBtn = document.getElementById('abrirTurnoModalBtn');
        const turnoModal = document.getElementById('turnoModal');
        const closeTurnoModalBtn = document.getElementById('closeTurnoModalBtn');
        const homeLojaSelect = document.getElementById('homeLojaSelect');
        const funcionariosLojaCount = document.getElementById('funcionariosLojaCount');
        const turnosCriadosCount = document.getElementById('turnosCriadosCount');
        const turnosRestantesCount = document.getElementById('turnosRestantesCount');

        const pageTitles = {
            home: 'Home',
            escalasCriadas: 'Escalas Criadas',
            escalasGeradas: 'Escalas Geradas',
            funcionarios: 'Funcionarios',
            secoes: 'Secoes',
            secaoForm: 'Cadastro de Secao',
            escalaBanco: 'Detalhamento da Escala',
            acessos: 'Controle de Acesso',
            roles: 'Roles / Permissao',
            configuracoes: 'Configuracoes'
        };

        const setCurrentPageTitle = (key) => {
            if (currentPageTitle) {
                currentPageTitle.textContent = pageTitles[key] || pageTitles.home;
            }
        };

        function hideAllPages() {
            timelinePage.classList.add('hidden');
            registrosPage.classList.add('hidden');
            funcionariosPage.classList.add('hidden');
            secoesPage.classList.add('hidden');
            secaoFormPage.classList.add('hidden');
            escalaDetalhePage.classList.add('hidden');
            acessosPage.classList.add('hidden');
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
            navTimeline.classList.add('active');
            expandActiveNavGroup(navTimeline);
            setCurrentPageTitle('home');
        }

        function setRegistrosMode(mode) {
            const cards = registrosPage.querySelectorAll('.table-card');
            if (cards[0]) cards[0].classList.toggle('hidden', mode === 'geradas');
            if (cards[1]) cards[1].classList.toggle('hidden', mode === 'criadas');
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
            consultarEscalasBancoLocal().catch(() => {});
        }

        function showFuncionariosPage() {
            hideAllPages();
            funcionariosPage.classList.remove('hidden');
            navFuncionarios.classList.add('active');
            expandActiveNavGroup(navFuncionarios);
            setCurrentPageTitle('funcionarios');
            carregarFuncionariosTela(false).catch(error => showInfoModal(error.message, 'error'));
        }

        function showSecoesPage() {
            hideAllPages();
            secoesPage.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('secoes');
            carregarSecoesTela(false).catch(error => showInfoModal(error.message, 'error'));
        }

        function showSecaoFormPage(escsecaoId = '') {
            hideAllPages();
            secaoFormPage.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('secaoForm');
            prepararFormularioSecao(escsecaoId);
        }

        function showEscalaDetalhePage(escprogId) {
            hideAllPages();
            escalaDetalhePage.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalaBanco');
            carregarDetalheEscalaBanco(escprogId).catch(error => showInfoModal(error.message, 'error'));
        }

        function showAcessosPage() {
            hideAllPages();
            acessosPage.classList.remove('hidden');
            navAcessos.classList.add('active');
            expandActiveNavGroup(navAcessos);
            setCurrentPageTitle('acessos');
            carregarAcessosTela(false);
        }

        function showRolesPage() {
            hideAllPages();
            rolesPage.classList.remove('hidden');
            navRoles.classList.add('active');
            expandActiveNavGroup(navRoles);
            setCurrentPageTitle('roles');
            renderizarRolesSettings().catch(error => showInfoModal(error.message, 'error'));
        }

        function showSettingsPage() {
            hideAllPages();
            settingsPage.classList.remove('hidden');
            navSettings.classList.add('active');
            expandActiveNavGroup(navSettings);
            setCurrentPageTitle('configuracoes');
        }

        function navigateToPage(pageKey) {
            if (pageKey.startsWith('escala-banco/')) {
                showEscalaDetalhePage(pageKey.split('/')[1]);
                return;
            }
            if (pageKey.startsWith('secoes/')) {
                showSecaoFormPage(pageKey.split('/')[1]);
                return;
            }

            const routes = {
                home: showTimelinePage,
                escalas: showEscalasGeradasPage,
                'escalas-criadas': showEscalasCriadasPage,
                'escalas-geradas': showEscalasGeradasPage,
                funcionarios: showFuncionariosPage,
                secoes: showSecoesPage,
                acessos: showAcessosPage,
                roles: showRolesPage,
                configuracoes: showSettingsPage
            };

            (routes[pageKey] || routes.home)();
        }

        function handleHashNavigation() {
            const pageKey = (window.location.hash || '#/home').replace(/^#\/?/, '') || 'home';
            navigateToPage(pageKey);
        }
        
        navTimeline.addEventListener('click', () => { window.location.hash = '/home'; });
        navEscalasCriadas.addEventListener('click', () => { window.location.hash = '/escalas-criadas'; });
        navRegistros.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navFuncionarios.addEventListener('click', () => { window.location.hash = '/funcionarios'; });
        navSecoes.addEventListener('click', () => { window.location.hash = '/secoes'; });
        navAcessos.addEventListener('click', () => { window.location.hash = '/acessos'; });
        navRoles.addEventListener('click', () => { window.location.hash = '/roles'; });
        navSettings.addEventListener('click', () => { window.location.hash = '/configuracoes'; });
        document.querySelectorAll('.nav-parent').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.nav-group')?.classList.toggle('open');
            });
        });
        voltarEscalasBtn?.addEventListener('click', () => { window.location.hash = '/escalas'; });
        window.addEventListener('hashchange', handleHashNavigation);
        salvarSettingsBtn.addEventListener('click', (e) => { e.preventDefault(); salvarConfiguracoes(); });
        goToTimelineBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '/home'; });        consultarBancoBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await consultarEscalasBancoLocal();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        sincronizarBancoBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await sincronizarEscalasSalvasComBanco();
                await consultarEscalasBancoLocal();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        // --- LÓGICA DA ESCALA ---
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
        const infoModal = document.getElementById('infoModal');
        const infoModalHeader = document.getElementById('infoModalHeader');
        const infoModalTitle = document.getElementById('infoModalTitle');
        const infoMessagesList = document.getElementById('infoMessagesList');
        const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');
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

        let esqueletoZoomLevel = 1.0;
        let mainTimelineZoomLevel = 1.0;
        let dadosEscala = [];
        let modoEdicao = { ativo: false, index: null };
        let colaboradorShifts = [];
        let escalaCarregadaId = null;
        let escalaCarregadaParaVisualizacao = null;
        let detailedScaleHasBeenGenerated = false;
        let currentLoadedScale = null;
        let funcionariosLojaCache = [];
        let ausenciasLojaCache = [];
        let secoesLojaCache = [];
        let escalaDetalheAtual = { escprogId: null, dias: [] };
        let lojasPermitidasCache = [];
        let usuarioSessaoCache = null;
        let usuariosAcessoCache = [];
        const getLojaCodigo = (loja) => loja?.LOJA ?? loja?.loja;
        
        // --- Variáveis para Copiar/Colar e Seleção ---
        let scheduleClipboard = null; 
        let isSelecting = false;
        let selectionRange = { startCell: null, endCell: null, colabContainer: null, cells: [] };

        const { timeToMinutes, minutesToTime, hoursToMinutes } = window.EscalaRulesCore;
        const showInfoModal = (messages, type = 'info') => { infoMessagesList.innerHTML = ''; if (type === 'error') { infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-red-500'; infoModalTitle.textContent = 'Atenção: Erros Encontrados'; } else if (type === 'success') { infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-green-500'; infoModalTitle.textContent = 'Sucesso'; } else { infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-blue-500'; infoModalTitle.textContent = 'Informação'; } if (Array.isArray(messages)) { messages.forEach(msg => { const li = document.createElement('li'); li.textContent = msg; infoMessagesList.appendChild(li); }); } else { const li = document.createElement('li'); li.textContent = messages; infoMessagesList.appendChild(li); } infoModal.classList.remove('hidden'); };
        
        const contarTurnosCriados = (ignorarIndex = null) => dadosEscala.reduce((total, escala, index) => {
            if (index === ignorarIndex) return total;
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

        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const getSecaoTurnoPadrao = (secao) => (secao?.TURNOS || [])[0] || null;

        const getSecaoLabel = (secao) => {
            const codigo = secao?.COD_SECAO ? `${secao.COD_SECAO} - ` : '';
            return `${codigo}${secao?.DESCR || `Secao ${secao?.ESCSECAO_ID || ''}`}`;
        };

        const popularSelectSecoesTurno = () => {
            if (!secaoTurnoSelect) return;
            secaoTurnoSelect.innerHTML = '<option value="">Selecione uma secao com turno cadastrado</option>';
            secoesLojaCache.forEach((secao) => {
                const turno = getSecaoTurnoPadrao(secao);
                if (!turno) return;
                const option = document.createElement('option');
                option.value = secao.ESCSECAO_ID;
                option.textContent = getSecaoLabel(secao);
                option.dataset.secaoDescr = secao.DESCR || '';
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

        const hideInfoModal = () => { infoModal.classList.add('hidden'); };
        
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
        const renderizarCorpo = (config, duracaoTotalTimeline, customDadosEscala, targetElementId) => { let bodyHtml = '<div>'; if (customDadosEscala.length === 0) { bodyHtml += `<p class="text-center text-gray-500 mt-4">Nenhum turno adicionado.</p>`; } else { customDadosEscala.forEach((escala, index) => { const inicioEscalaMin = timeToMinutes(escala.inicio); const fimEscalaMin = timeToMinutes(escala.fim); const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo); const fimIntervaloMin = timeToMinutes(escala.fimIntervalo); let barsHtml = ''; const createBar = (startMin, endMin, color) => { if (endMin <= startMin) return ''; const duration = endMin - startMin; const leftPercent = ((startMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (leftPercent < 0 || widthPercent <= 0) return ''; return `<div class="absolute h-full ${color} rounded" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>`; }; if (inicioIntervaloMin < fimIntervaloMin && inicioIntervaloMin > inicioEscalaMin && fimIntervaloMin < fimEscalaMin) { barsHtml += createBar(inicioEscalaMin, inicioIntervaloMin, 'bg-green-500'); barsHtml += createBar(inicioIntervaloMin, fimIntervaloMin, 'bg-yellow-500'); barsHtml += createBar(fimIntervaloMin, fimEscalaMin, 'bg-green-500'); } else { barsHtml += createBar(inicioEscalaMin, fimEscalaMin, 'bg-green-500'); } let tempoInfoHtml = `<span class="text-xs text-gray-500 block">${escala.inicio} -<span class="text-gray-400"> ${escala.inicioIntervalo} - ${escala.fimIntervalo}</span> - ${escala.fim}</span>`; let actionsHtml = ''; if (targetElementId === 'timeline-content') { actionsHtml = `<div class="row-actions hidden mt-2 space-x-2"><button class="action-btn edit-btn" data-index="${index}">Editar</button><button class="action-btn delete-btn" data-index="${index}">Excluir</button></div>`; } bodyHtml += `<div class="timeline-row flex items-center py-1 ${targetElementId === 'timeline-content' ? 'cursor-pointer' : ''}"><div class="w-48 flex-shrink-0 pr-4 flex flex-col justify-center"><div><span class="font-bold text-gray-700">${escala.quantidade} Colab.</span><span class="text-xs text-gray-600 block">${escapeHtml(escala.secaoNome || "Sem secao")}</span>${tempoInfoHtml}</div>${actionsHtml}</div><div class="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden" style="z-index: 2;">${barsHtml}</div></div>`; }); } bodyHtml += `</div>`; return bodyHtml; };
        const renderizarLinhaDeSoma = (config, duracaoTotalTimeline, customDadosEscala) => { if (customDadosEscala.length === 0) return ''; const perfilCarga = new Array(duracaoTotalTimeline + 1).fill(0); customDadosEscala.forEach(escala => { const quantidade = parseInt(escala.quantidade); const inicioEscalaMin = timeToMinutes(escala.inicio); const fimEscalaMin = timeToMinutes(escala.fim); const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo); const fimIntervaloMin = timeToMinutes(escala.fimIntervalo); for (let min = inicioEscalaMin; min < fimEscalaMin; min++) { const isBreak = (inicioIntervaloMin < fimIntervaloMin && min >= inicioIntervaloMin && min < fimIntervaloMin); if (!isBreak) { const index = min - config.inicioTimeline; if (index >= 0 && index < perfilCarga.length) perfilCarga[index] += quantidade; } } }); let summaryHtml = ''; let lastCount = -1; let blockStartMin = config.inicioTimeline; for (let i = 0; i <= duracaoTotalTimeline; i++) { const currentCount = perfilCarga[i] || 0; const currentMin = config.inicioTimeline + i; if (currentCount !== lastCount && i > 0) { const duration = currentMin - blockStartMin; const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (widthPercent > 0) { const color = lastCount > 0 ? 'bg-blue-600' : 'bg-transparent'; summaryHtml += `<div class="absolute h-full ${color} flex items-center justify-center" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount > 0 ? lastCount : ''}</span></div>`; } blockStartMin = currentMin; } lastCount = currentCount; } const duration = (config.inicioTimeline + duracaoTotalTimeline) - blockStartMin; const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (widthPercent > 0) { const color = lastCount > 0 ? 'bg-blue-600' : 'bg-transparent'; summaryHtml += `<div class="absolute h-full ${color} flex items-center justify-center" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount > 0 ? lastCount : ''}</span></div>`; } return `<div class="summary-row border-t-2 border-gray-300 mt-4 pt-4"><div class="flex items-center my-2 h-10"><div class="w-48 flex-shrink-0 text-center pr-4"><span class="font-bold text-lg text-gray-700">Total</span><span class="text-xs text-gray-500 block">Ativos</span></div><div class="flex-1 h-full bg-gray-200 rounded relative overflow-hidden" style="z-index: 2;">${summaryHtml}</div></div></div>`; };
        
        const manipularEnvioFormulario = () => { let errors = []; const secaoOption = secaoTurnoSelect?.selectedOptions?.[0]; const novaEscala = { secaoId: secaoTurnoSelect?.value || '', secaoNome: secaoOption?.textContent || '', quantidade: quantidadeInput.value, inicio: inicioEscalaInput.value, fim: fimEscalaInput.value, inicioIntervalo: inicioIntervaloInput.value, fimIntervalo: fimIntervaloInput.value }; if (!novaEscala.secaoId) errors.push("Selecione uma secao com turno cadastrado."); if (!novaEscala.quantidade || !novaEscala.inicio || !novaEscala.fim) errors.push("A secao selecionada precisa ter quantidade, entrada e saida cadastradas."); if (timeToMinutes(novaEscala.fim) <= timeToMinutes(novaEscala.inicio)) errors.push("A saida do turno deve ser maior que a entrada."); const quantidadeNova = parseInt(novaEscala.quantidade, 10) || 0; const totalProjetado = contarTurnosCriados(modoEdicao.ativo ? modoEdicao.index : null) + quantidadeNova; if (funcionariosLojaCache.length > 0 && totalProjetado > funcionariosLojaCache.length) errors.push(`A loja possui ${funcionariosLojaCache.length} funcionario(s) carregado(s). Reduza a quantidade para nao ultrapassar o total disponivel.`); errors = errors.concat(validarTurnoSimples(novaEscala)); if (errors.length > 0) { showInfoModal(errors, 'error'); return; } if(modoEdicao.ativo) { dadosEscala[modoEdicao.index] = novaEscala; } else { dadosEscala.push(novaEscala); } dadosEscala.sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio)); cancelarModoEdicao(); renderizarTimelineCompleta('timeline-content'); atualizarContadoresHome(); fecharModalTurno(); };
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
                let index = funcionariosLojaCache.findIndex((funcionario, funcionarioIndex) => {
                    return !usados.has(funcionarioIndex) && Number(funcionario.ESCSECAO_ID || 0) === secaoId;
                });

                if (index < 0) {
                    index = funcionariosLojaCache.findIndex((funcionario, funcionarioIndex) => !usados.has(funcionarioIndex));
                }

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
                const escsecaoId = funcionario ? funcionario.ESCSECAO_ID : '';
                const escfuncaoId = funcionario ? funcionario.ESCFUNCAO_ID : '';
                const selectedFuncionarioValue = funcionario ? getFuncionarioOptionValue(funcionario) : '';
                const funcionarioOptions = funcionariosLojaCache.map(item => {
                    const value = getFuncionarioOptionValue(item);
                    const label = `${item.NOME} (${item.CHAPA})`;
                    const selected = value === selectedFuncionarioValue ? 'selected' : '';
                    return `<option value="${escapeHtml(value)}" data-escfunc-id="${escapeHtml(item.ESCFUNC_ID)}" data-chapa="${escapeHtml(item.CHAPA)}" data-escsecao-id="${escapeHtml(item.ESCSECAO_ID || '')}" data-escfuncao-id="${escapeHtml(item.ESCFUNCAO_ID || '')}" data-name="${escapeHtml(label)}" ${selected}>${escapeHtml(label)}</option>`;
                }).join('');
                const horarios = ` ${escala.inicio} - ${escala.inicioIntervalo} - ${escala.fimIntervalo} - ${escala.fim}`;
                tableHtml += `<tr data-colab-index="${index}" data-escfunc-id="${escapeHtml(escfuncId)}" data-chapa="${escapeHtml(chapa)}" data-escsecao-id="${escapeHtml(escsecaoId)}" data-escfuncao-id="${escapeHtml(escfuncaoId)}"><td data-name="${escapeHtml(nomeBase)}" class="sticky left-0 bg-white font-semibold z-10"><select class="collaborator-select" aria-label="Selecionar colaborador"><option value="">Colaborador ${index + 1}</option>${funcionarioOptions}</select><span class="collaborator-name-span hidden">${escapeHtml(nomeBase)}</span><span class="collaborator-time-span text-gray-500">${escapeHtml(horarios)}</span></td>`;
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
        
        const gerarEscalaDetalhada = () => { escalaCarregadaId = null; const skeletonRows = document.querySelectorAll('#tabela-esqueleto tbody tr'); if (skeletonRows.length === 0) { showInfoModal("Gere o esqueleto da escala primeiro.", "error"); return; } const ano = parseInt(anoSelect.value); const mes = parseInt(mesSelect.value); const diasNoMes = new Date(ano, mes + 1, 0).getDate(); const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; let allDetailsHtml = ''; skeletonRows.forEach(row => { const colabIndex = parseInt(row.dataset.colabIndex); const escfuncId = row.dataset.escfuncId || ''; const chapa = row.dataset.chapa || ''; const escsecaoId = row.dataset.escsecaoId || ''; const escfuncaoId = row.dataset.escfuncaoId || ''; const colaboradorNome = row.querySelector('td[data-name]').dataset.name; const escala = colaboradorShifts[colabIndex]; if (!escala) return; const folgas = new Set(); row.querySelectorAll('.escala-cell').forEach(cell => { if (cell.textContent.toUpperCase() === 'F') { folgas.add(parseInt(cell.dataset.dia)); } }); const intervaloMin = timeToMinutes(escala.fimIntervalo) - timeToMinutes(escala.inicioIntervalo); const hIntervalo = minutesToTime(intervaloMin); const hTrabalhadasMin = (timeToMinutes(escala.fim) - timeToMinutes(escala.inicio)) - intervaloMin; const hTrabalhadas = minutesToTime(hTrabalhadasMin); let detailTable = `<div class="colaborador-escala-detalhada" data-colab-index="${colabIndex}" data-escfunc-id="${escfuncId}" data-chapa="${chapa}" data-escsecao-id="${escsecaoId}" data-escfuncao-id="${escfuncaoId}"><div class="header-info"><h3 class="font-bold text-lg" contenteditable="true">${colaboradorNome}</h3></div><table class="w-full"><thead><tr class="bg-gray-50"><th>D.SEM</th>${Array.from({length: diasNoMes}, (_, i) => `<th>${diasDaSemana[new Date(ano, mes, i + 1).getDay()]}</th>`).join('')}</tr><tr class="bg-gray-50"><th>DIA</th>${Array.from({length: diasNoMes}, (_, i) => `<th data-day-col="${i + 1}">${i + 1}</th>`).join('')}</tr></thead><tbody>`; const fields = [ { label: 'ENT.', value: escala.inicio, key: 'inicio', editable: true }, { label: 'SAÍ.INT.', value: escala.inicioIntervalo, key: 'inicioIntervalo', editable: true }, { label: 'INTER.', value: hIntervalo, key: 'intervalo', editable: false }, { label: 'RET.INT.', value: escala.fimIntervalo, key: 'fimIntervalo', editable: true }, { label: 'SAÍ.', value: escala.fim, key: 'fim', editable: true }, { label: 'H.TRAB', value: hTrabalhadas, key: 'trabalhadas', bold: true, editable: false }, ]; fields.forEach(field => { detailTable += `<tr class="${field.bold ? 'font-bold bg-gray-50' : ''}" data-key="${field.key}"><td>${field.label}</td>`; for (let dia = 1; dia <= diasNoMes; dia++) { const isDomingo = new Date(ano, mes, dia).getDay() === 0; const isFolga = folgas.has(dia); const cellContent = isFolga ? 'F' : field.value; const isEditable = field.editable && !isFolga; const editableAttribute = isEditable ? 'contenteditable="true"' : ''; let bgColor = ''; if (isFolga) { bgColor = isDomingo ? 'bg-orange-500 text-white' : 'bg-red-100'; } else if (isDomingo) { bgColor = 'bg-yellow-100'; } detailTable += `<td class="${bgColor}" ${editableAttribute}>${cellContent}</td>`; } detailTable += `</tr>`; }); detailTable += `</tbody></table></div>`; allDetailsHtml += detailTable; }); detalhadaModalBody.innerHTML = allDetailsHtml; detalhadaMesAno.textContent = `${mesSelect.options[mesSelect.selectedIndex].text} / ${ano}`; if (detalhadaModal.classList.contains('hidden')) { detalhadaModal.classList.remove('hidden'); } detailedScaleHasBeenGenerated = true; gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada'; };
        
        // =========================================================================
        // FUNÇÃO DE IMPRESSÃO DA TIMELINE (VERSÃO CORRIGIDA E MELHORADA)
        // =========================================================================
        const imprimirTimelineMelhorado = (dataSource = dadosEscala, title = 'Relatório de Linha do Tempo') => {
            const printContent = document.getElementById('print-container');
            if (!printContent) return;

            const config = {
                inicioTimeline: timeToMinutes(horaInicioTimelineInput.value),
                fimTimeline: timeToMinutes(horaFimTimelineInput.value),
                intervaloMarcacao: parseInt(intervaloMarcacaoInput.value) || 30,
            };
            const duracaoTotalTimeline = config.fimTimeline - config.inicioTimeline;

            if (duracaoTotalTimeline <= 0 || dataSource.length === 0) {
                showInfoModal('Não há dados suficientes na timeline para gerar um relatório.', 'info');
                return;
            }
            
            // --- 1. Calcular o número de colunas de tempo para o colspan ---
            const numMarcacoes = Math.floor(duracaoTotalTimeline / config.intervaloMarcacao) + 1;

            // --- 2. Construir Cabeçalho (Régua de Horários com células individuais) ---
            let headerHtml = '<tr><th class="col-info">Turno</th>';
            // Criamos uma célula para cada marcador de tempo
            for (let min = config.inicioTimeline; min <= config.fimTimeline; min += config.intervaloMarcacao) {
                headerHtml += `<th>${minutesToTime(min)}</th>`;
            }
            headerHtml += '</tr>';

            // --- 3. Construir Corpo (Linhas dos Turnos usando colspan) ---
            let bodyHtml = '';
            dataSource.forEach(escala => {
                const inicioEscalaMin = timeToMinutes(escala.inicio);
                const fimEscalaMin = timeToMinutes(escala.fim);
                const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo);
                const fimIntervaloMin = timeToMinutes(escala.fimIntervalo);

                let barsHtml = '';
                const createBar = (startMin, endMin, colorClass) => {
                    if (endMin <= startMin) return '';
                    const leftPercent = ((startMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
                    const widthPercent = ((endMin - startMin) / duracaoTotalTimeline) * 100;
                    return `<div class="timeline-bar ${colorClass}" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>`;
                };

                if (inicioIntervaloMin < fimIntervaloMin && inicioIntervaloMin > inicioEscalaMin && fimIntervaloMin < fimEscalaMin) {
                    barsHtml += createBar(inicioEscalaMin, inicioIntervaloMin, 'bg-green-500');
                    barsHtml += createBar(inicioIntervaloMin, fimIntervaloMin, 'bg-yellow-500');
                    barsHtml += createBar(fimIntervaloMin, fimEscalaMin, 'bg-green-500');
                } else {
                    barsHtml += createBar(inicioEscalaMin, fimEscalaMin, 'bg-green-500');
                }

                const infoTurno = `
                    <div class="font-bold">${escala.quantidade} Colaborador(es)</div>
                    <div class="text-xs text-gray-600">${escala.inicio} às ${escala.fim}</div>
                    <div class="text-xs text-gray-500">Intervalo: ${escala.inicioIntervalo} - ${escala.fimIntervalo}</div>
                `;
                // A célula da timeline agora usa colspan para se alinhar com o novo cabeçalho
                bodyHtml += `<tr><td class="col-info">${infoTurno}</td><td class="col-timeline" colspan="${numMarcacoes}"><div class="timeline-bar-container">${barsHtml}</div></td></tr>`;
            });

            // --- 4. Construir Rodapé (Linha de Soma usando colspan) ---
            const perfilCarga = new Array(duracaoTotalTimeline + 1).fill(0);
            dataSource.forEach(escala => {
                const quantidade = parseInt(escala.quantidade);
                const inicioEscalaMin = timeToMinutes(escala.inicio);
                const fimEscalaMin = timeToMinutes(escala.fim);
                const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo);
                const fimIntervaloMin = timeToMinutes(escala.fimIntervalo);
                for (let min = inicioEscalaMin; min < fimEscalaMin; min++) {
                    const isBreak = (inicioIntervaloMin < fimIntervaloMin && min >= inicioIntervaloMin && min < fimIntervaloMin);
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
            
            // --- 5. Montar a Tabela Final ---
            const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            printContent.innerHTML = `
                <div class="print-title">${title}</div>
                <div class="print-subtitle">Gerado em: ${dataGeracao}</div>
                <table class="print-timeline-table">
                    <thead>${headerHtml}</thead>
                    <tbody>${bodyHtml}</tbody>
                    <tfoot>${footerHtml}</tfoot>
                </table>
            `;

            window.print();
        };

        const prepareSkeletonForPrint = () => { const tableElement = document.getElementById('tabela-esqueleto'); if (!tableElement) return; const clone = tableElement.cloneNode(true); clone.classList.add('print-skeleton-table'); clone.removeAttribute('id'); const month = mesSelect.options[mesSelect.selectedIndex].text; const year = anoSelect.value; printContainer.innerHTML = `<div class="print-title">Esqueleto da Escala</div><div class="print-subtitle">${month} / ${year}</div>`; printContainer.appendChild(clone); window.print(); };
        const prepareDetailedForPrint = () => { const detailedElements = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada'); if (detailedElements.length === 0) return; const month = mesSelect.options[mesSelect.selectedIndex].text; const year = anoSelect.value; printContainer.innerHTML = `<div class="print-title">Escala Detalhada</div><div class="print-subtitle">${month} / ${year}</div>`; detailedElements.forEach(el => { printContainer.appendChild(el.cloneNode(true)); }); window.print(); };
        
        // --- EVENTOS E AÇÕES PRINCIPAIS ---

        abrirModalEscalaBtn.addEventListener('click', () => {
            resetSkeletonModalState();
            esqueletoZoomLevel = 1.0;
            applyEsqueletoZoom();
            esqueletoModal.classList.remove('hidden');
            gerarTabelaEsqueleto();
        });

        const resetSkeletonModalState = () => {
            escalaCarregadaParaVisualizacao = null;
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
            await carregarAusenciasDaLoja();
            gerarTabelaEsqueleto();
        });
        anoSelect.addEventListener('change', async () => {
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            await carregarAusenciasDaLoja();
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
        
        closeInfoModalBtn.addEventListener('click', hideInfoModal);
        infoModal.addEventListener('click', (e) => { if (e.target === infoModal) hideInfoModal(); });
        
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
        
        // --- LÓGICA DE SINCRONIZAÇÃO E VALIDAÇÃO (ATUALIZADA) ---

        validarEscalaBtn.addEventListener('click', () => {
            let allErrors = [];
            const ausenciasAplicadas = aplicarAusenciasNaDetalhada();
            allErrors = allErrors.concat(validarDescansos());
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
        
        const validarSequenciaParaTraz = (row, folgaIndex) => {
            const maxDias = parseInt(regraMaxDiasConsecutivosInput.value);
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
            const maxDias = parseInt(regraMaxDiasConsecutivosInput.value);
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

        const validarDiasConsecutivos = () => {
            let errors = [];
            const maxDias = parseInt(regraMaxDiasConsecutivosInput.value);
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


        // --- LÓGICA DE EDIÇÃO, SELEÇÃO E COPIAR/COLAR ---

        detalhadaModalBody.addEventListener('input', (e) => {
            const targetCell = e.target;
            if (targetCell.matches('td[contenteditable="true"]')) {
                const colabContainer = targetCell.closest('.colaborador-escala-detalhada');
                if (!colabContainer) return;
                const colIndex = targetCell.cellIndex;
                const colabDataIndex = colabContainer.dataset.colabIndex;
                if (colabDataIndex === undefined) return;

                const rows = colabContainer.querySelectorAll('tbody tr');
                const isNowFolga = targetCell.textContent.trim().toUpperCase() === 'F';
                const isSunday = new Date(anoSelect.value, mesSelect.value, colIndex).getDay() === 0;

                if (isNowFolga) {
                    rows.forEach(row => {
                        const cellToUpdate = row.cells[colIndex];
                        if (cellToUpdate) {
                            cellToUpdate.textContent = 'F';
                            cellToUpdate.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                            if (isSunday) cellToUpdate.classList.add('bg-orange-500', 'text-white');
                            else cellToUpdate.classList.add('bg-red-100');
                        }
                    });
                    const dayCellIndex = colIndex - 1;
                    const errorMessage = validarSequenciaDetalhadaParaTraz(colabContainer, dayCellIndex);
                    if (errorMessage) showInfoModal([errorMessage], 'error');
                } else {
                    rows.forEach(row => {
                        const cellToUpdate = row.cells[colIndex];
                        if(cellToUpdate) {
                            cellToUpdate.classList.remove('bg-red-100', 'bg-orange-500', 'text-white');
                            if (isSunday) cellToUpdate.classList.add('bg-yellow-100');
                        }
                    });
                }

                const skeletonRow = document.querySelector(`#tabela-esqueleto tbody tr[data-colab-index="${colabDataIndex}"]`);
                if(skeletonRow){
                    const skeletonCell = skeletonRow.cells[colIndex];
                    if(skeletonCell){
                        skeletonCell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');
                        if(isNowFolga){
                            skeletonCell.textContent = 'F';
                            if (isSunday) skeletonCell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                            else skeletonCell.classList.add('bg-red-300', 'text-white', 'font-bold');
                        } else {
                            skeletonCell.textContent = '';
                             if (isSunday) skeletonCell.classList.add('bg-yellow-100');
                        }
                    }
                }
                atualizarContagemEsqueleto();
            }
        });
        
        detalhadaModalBody.addEventListener('blur', (e) => {
            const target = e.target;
            const container = target.closest('.colaborador-escala-detalhada');
            if (!container) return;
            
            if (target.matches('h3[contenteditable="true"]')) {
                const newName = target.textContent.trim();
                const colabDataIndex = container.dataset.colabIndex;
                if(colabDataIndex === undefined) return;

                const skeletonRow = document.querySelector(`#tabela-esqueleto tbody tr[data-colab-index="${colabDataIndex}"]`);
                if(skeletonRow) {
                    const nameCell = skeletonRow.cells[0];
                    if(nameCell) {
                        const nameSpan = nameCell.querySelector('.collaborator-name-span');
                        if (nameSpan) nameSpan.textContent = newName;
                        nameCell.dataset.name = newName;
                    }
                }
            }
            else if (target.matches('td[contenteditable="true"]')) {
                const cellContent = target.textContent.trim().toUpperCase();
                if (cellContent === 'F' || !cellContent.match(/^\d{2}:\d{2}$/)) return;
                
                const colIndex = target.cellIndex; 
                const turnoDoDia = { 
                    inicio: container.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${colIndex + 1})`).textContent, 
                    fim: container.querySelector(`tbody tr[data-key="fim"] td:nth-child(${colIndex + 1})`).textContent, 
                    inicioIntervalo: container.querySelector(`tbody tr[data-key="inicioIntervalo"] td:nth-child(${colIndex + 1})`).textContent, 
                    fimIntervalo: container.querySelector(`tbody tr[data-key="fimIntervalo"] td:nth-child(${colIndex + 1})`).textContent, 
                };
                
                const errors = validarTurnoSimples(turnoDoDia); 
                if (errors.length > 0) showInfoModal(errors, 'error'); 

                const intervaloCell = container.querySelector(`tbody tr[data-key="intervalo"] td:nth-child(${colIndex + 1})`); 
                const hTrabCell = container.querySelector(`tbody tr[data-key="trabalhadas"] td:nth-child(${colIndex + 1})`); 
                const intervaloMin = timeToMinutes(turnoDoDia.fimIntervalo) - timeToMinutes(turnoDoDia.inicioIntervalo); 
                if (intervaloCell) intervaloCell.textContent = minutesToTime(intervaloMin > 0 ? intervaloMin : 0);
                const hTrabalhadasMin = (timeToMinutes(turnoDoDia.fim) - timeToMinutes(turnoDoDia.inicio)) - intervaloMin; 
                if (hTrabCell) hTrabCell.textContent = minutesToTime(hTrabalhadasMin > 0 ? hTrabalhadasMin : 0);
            }
        }, true);
        
        function clearSelection() {
            document.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
            selectionRange = { startCell: null, endCell: null, colabContainer: null, cells: [] };
        }

        function updateSelectionHighlight() {
            selectionRange.cells.forEach(c => c.classList.remove('selection-highlight'));
            selectionRange.cells = [];
            if (!selectionRange.startCell) return;
            const endCell = selectionRange.endCell || selectionRange.startCell;
            const row = selectionRange.startCell.parentElement;
            const allCellsInRow = Array.from(row.cells);
            const startIndex = allCellsInRow.indexOf(selectionRange.startCell);
            const endIndex = allCellsInRow.indexOf(endCell);
            const minIndex = Math.min(startIndex, endIndex);
            const maxIndex = Math.max(startIndex, endIndex);
            if (minIndex === 0) return;
            for (let i = minIndex; i <= maxIndex; i++) {
                const cellToHighlight = allCellsInRow[i];
                cellToHighlight.classList.add('selection-highlight');
                selectionRange.cells.push(cellToHighlight);
            }
        }

        function pasteDay(colabContainer, targetDayIndex, scheduleDay) {
            const rows = colabContainer.querySelectorAll('tbody tr[data-key]');
            const ano = parseInt(anoSelect.value);
            const mes = parseInt(mesSelect.value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            if (targetDayIndex > diasNoMes) return false;
            const isSunday = new Date(ano, mes, targetDayIndex).getDay() === 0;
            rows.forEach(row => {
                const cellToUpdate = row.cells[targetDayIndex];
                const key = row.dataset.key;
                const newValue = scheduleDay.data[key] || '';
                if (cellToUpdate) {
                    cellToUpdate.textContent = newValue;
                    cellToUpdate.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                    if (scheduleDay.isFolga) {
                        if (isSunday) cellToUpdate.classList.add('bg-orange-500', 'text-white');
                        else cellToUpdate.classList.add('bg-red-100');
                    } else if (isSunday) {
                        cellToUpdate.classList.add('bg-yellow-100');
                    }
                }
            });
            const colabDataIndex = colabContainer.dataset.colabIndex;
            const skeletonRow = document.querySelector(`#tabela-esqueleto tbody tr[data-colab-index="${colabDataIndex}"]`);
            if (skeletonRow) {
                const skeletonCell = skeletonRow.cells[targetDayIndex];
                if (skeletonCell) {
                    skeletonCell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');
                    if (scheduleDay.isFolga) {
                        skeletonCell.textContent = 'F';
                        if (isSunday) skeletonCell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                        else skeletonCell.classList.add('bg-red-300', 'text-white', 'font-bold');
                    } else {
                        skeletonCell.textContent = '';
                        if (isSunday) skeletonCell.classList.add('bg-yellow-100');
                    }
                }
            }
            return true;
        }

        detalhadaModalBody.addEventListener('mousedown', (e) => {
            clearSelection();
            const targetCell = e.target.closest('td');
            if (targetCell && targetCell.hasAttribute('contenteditable')) {
                isSelecting = true;
                selectionRange.startCell = targetCell;
                selectionRange.colabContainer = targetCell.closest('.colaborador-escala-detalhada');
            }
        });

        detalhadaModalBody.addEventListener('mouseover', (e) => {
            if (!isSelecting) return;
            const targetCell = e.target.closest('td');
            if (targetCell && targetCell.hasAttribute('contenteditable') && targetCell.closest('.colaborador-escala-detalhada') === selectionRange.colabContainer) {
                selectionRange.endCell = targetCell;
                updateSelectionHighlight();
            }
        });
        
        window.addEventListener('mouseup', () => { isSelecting = false; });
        
        detalhadaModalBody.addEventListener('keydown', async (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCopy = (e.key === 'c' && (isMac ? e.metaKey : e.ctrlKey));
            const isPaste = (e.key === 'v' && (isMac ? e.metaKey : e.ctrlKey));
            if (!isCopy && !isPaste) return;
            
            const targetCell = e.target.closest('td');
            if (!targetCell || !targetCell.hasAttribute('contenteditable') || targetCell.cellIndex === 0) return;
            
            e.preventDefault();
            
            const colabContainer = targetCell.closest('.colaborador-escala-detalhada');
            if (!colabContainer) return;

            if (isCopy) {
                if (selectionRange.cells.length > 1) {
                    const copiedData = [];
                    const allRows = selectionRange.colabContainer.querySelectorAll('tbody tr[data-key]');
                    const selectedIndices = [...new Set(selectionRange.cells.map(cell => cell.cellIndex))].sort((a,b) => a - b);
                    for(const dayIndex of selectedIndices) {
                        const dayData = {};
                        let isFolga = false;
                        allRows.forEach(row => {
                            const key = row.dataset.key;
                            const cell = row.cells[dayIndex];
                            if (cell) {
                                dayData[key] = cell.textContent;
                                if (key === 'inicio' && cell.textContent.toUpperCase() === 'F') isFolga = true;
                            }
                        });
                        copiedData.push({ isFolga, data: dayData });
                    }
                    scheduleClipboard = copiedData;
                    showInfoModal(`Padrão de ${copiedData.length} dias copiado!`, 'success');
                } else {
                    const colIndex = targetCell.cellIndex;
                    const dayData = {};
                    const rows = colabContainer.querySelectorAll('tbody tr[data-key]');
                    let isFolga = false;
                    rows.forEach(row => {
                        const key = row.dataset.key;
                        const cell = row.cells[colIndex];
                        if (cell) {
                            dayData[key] = cell.textContent;
                            if (key === 'inicio' && cell.textContent.toUpperCase() === 'F') isFolga = true;
                        }
                    });
                    scheduleClipboard = { isFolga, data: dayData };
                    showInfoModal('Horário do dia copiado!', 'success');
                }
                setTimeout(hideInfoModal, 1500);
            }

            if (isPaste) {
                if (!scheduleClipboard) {
                    showInfoModal('Nenhum horário na área de transferência.', 'info');
                    return;
                }

                const pattern = scheduleClipboard;
                const isPatternArray = Array.isArray(pattern);
                const patternLength = isPatternArray ? pattern.length : 1;
                const destinationCells = selectionRange.cells;

                if (destinationCells.length > 1) { // CASO 1: Colar com padrão (repetidamente)
                    const destinationIndices = [...new Set(destinationCells.map(cell => cell.cellIndex))].sort((a,b) => a - b);
                    destinationIndices.forEach((targetDayIndex, loopIndex) => {
                        const patternItem = isPatternArray ? pattern[loopIndex % patternLength] : pattern;
                        pasteDay(colabContainer, targetDayIndex, patternItem);
                    });
                    showInfoModal('Padrão colado na faixa de destino!', 'success');
                } 
                else { // CASO 2: Colar simples (uma vez)
                    const startPasteDay = targetCell.cellIndex;
                    if (isPatternArray) {
                        pattern.forEach((daySchedule, i) => {
                            const targetDay = startPasteDay + i;
                            pasteDay(colabContainer, targetDay, daySchedule);
                        });
                    } else {
                        pasteDay(colabContainer, startPasteDay, pattern);
                    }
                    showInfoModal('Conteúdo colado com sucesso!', 'success');
                }

                setTimeout(() => {
                    validarEscalaBtn.click();
                    atualizarContagemEsqueleto();
                }, 100);
                
                clearSelection();
            }
        });
        
        tabelaEsqueletoContainer.addEventListener('change', (e) => {
            if (!e.target.classList.contains('collaborator-select')) return;

            const select = e.target;
            const row = select.closest('tr[data-colab-index]');
            const nameCell = row?.querySelector('td[data-name]');
            const selectedOption = select.selectedOptions[0];
            const nomeSelecionado = selectedOption?.dataset.name || selectedOption?.textContent || `Colaborador ${Number(row?.dataset.colabIndex || 0) + 1}`;

            if (!row || !nameCell) return;

            row.dataset.escfuncId = selectedOption?.dataset.escfuncId || '';
            row.dataset.chapa = selectedOption?.dataset.chapa || '';
            row.dataset.escsecaoId = selectedOption?.dataset.escsecaoId || '';
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
                await carregarSecoesDaLoja(true);
                await carregarFuncionariosDaLoja(true);
                if (!funcionariosPage.classList.contains('hidden')) {
                    await carregarFuncionariosTela(false);
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
                lojaEscalaSelect.value = funcionariosLojaSelect.value;
                if (homeLojaSelect) homeLojaSelect.value = funcionariosLojaSelect.value;
                if (secoesLojaSelect) secoesLojaSelect.value = funcionariosLojaSelect.value;
                await carregarSecoesDaLoja(true);
                await carregarFuncionariosTela(false);
                await carregarFuncionariosDaLoja(false);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        homeLojaSelect?.addEventListener('change', async () => {
            lojaEscalaSelect.value = homeLojaSelect.value;
            funcionariosLojaSelect.value = homeLojaSelect.value;
            if (secoesLojaSelect) secoesLojaSelect.value = homeLojaSelect.value;
            if (secaoFormLoja) secaoFormLoja.value = homeLojaSelect.value;
            await carregarSecoesDaLoja(true);
            await carregarFuncionariosDaLoja(true);
        });
        secoesLojaSelect?.addEventListener('change', async () => {
            lojaEscalaSelect.value = secoesLojaSelect.value;
            funcionariosLojaSelect.value = secoesLojaSelect.value;
            if (homeLojaSelect) homeLojaSelect.value = secoesLojaSelect.value;
            if (secaoFormLoja) secaoFormLoja.value = secoesLojaSelect.value;
            await carregarSecoesTela(false);
        });
        carregarFuncionariosTelaBtn.addEventListener('click', async () => {
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
        carregarAcessosBtn.parentElement.addEventListener('click', async (event) => {
            if (event.target.closest('#novoUsuarioBtn')) {
                const values = await showInputModal({
                    title: 'Novo Usuário',
                    inputs: [
                        { label: 'Login', type: 'text', id: 'LOGIN', required: true },
                        { label: 'Nome', type: 'text', id: 'NOME', required: true },
                        { label: 'Senha inicial', type: 'password', id: 'PASSWORD', required: true },
                        { label: 'Role', type: 'text', id: 'PERFIL', value: 'GERENTE', required: true },
                        { label: 'Lojas permitidas (separadas por vírgula)', type: 'text', id: 'LOJAS', value: (lojasPermitidasCache[0] || '').toString() }
                    ],
                    confirmText: 'Criar'
                });
                if (!values) return;

                try {
                    await apiRequest('/api/acessos/usuarios', {
                        method: 'POST',
                        body: JSON.stringify({
                            LOGIN: values.LOGIN,
                            NOME: values.NOME,
                            PASSWORD: values.PASSWORD,
                            PERFIL: values.PERFIL,
                            LOJAS: String(values.LOJAS || '').split(',').map(loja => Number(loja.trim())).filter(Boolean)
                        })
                    });
                    await carregarAcessosTela(false);
                    showInfoModal('Usuário criado com sucesso.', 'success');
                } catch (error) {
                    showInfoModal(error.message, 'error');
                }
            }
        });
        
        // --- SISTEMA DE MODAL DE INPUT ---
        const inputModal = document.getElementById('inputModal');
        const inputModalTitle = document.getElementById('inputModalTitle');
        const inputModalBody = document.getElementById('inputModalBody');
        const inputModalConfirmBtn = document.getElementById('inputModalConfirmBtn');
        const inputModalCancelBtn = document.getElementById('inputModalCancelBtn');

        const showInputModal = (config) => {
            return new Promise((resolve) => {
                inputModalTitle.textContent = config.title;
                inputModalConfirmBtn.textContent = config.confirmText || 'Confirmar';
                
                if (config.cancelText === '') {
                    inputModalCancelBtn.classList.add('hidden');
                } else {
                    inputModalCancelBtn.classList.remove('hidden');
                    inputModalCancelBtn.textContent = config.cancelText || 'Cancelar';
                }

                inputModalBody.innerHTML = '';

                config.inputs.forEach(input => {
                    if (input.type === 'message') {
                        const p = document.createElement('p');
                        p.textContent = input.text;
                        p.className = 'text-gray-700';
                        inputModalBody.appendChild(p);
                    } else {
                        const label = document.createElement('label');
                        label.className = 'block text-sm font-medium text-gray-700';
                        label.textContent = input.label;
                        const inputEl = document.createElement('input');
                        inputEl.type = input.type;
                        inputEl.id = input.id;
                        inputEl.required = input.required;
                        inputEl.value = input.value || '';
                        inputEl.className = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
                        inputModalBody.appendChild(label);
                        inputModalBody.appendChild(inputEl);
                    }
                });

                const hideModal = () => {
                    inputModal.classList.add('hidden');
                    inputModalConfirmBtn.onclick = null;
                    inputModalCancelBtn.onclick = null;
                };

                inputModalConfirmBtn.onclick = () => {
                    const values = {};
                    let allValid = true;
                    config.inputs.forEach(input => {
                        if (input.type !== 'message') {
                            const inputEl = document.getElementById(input.id);
                            if (inputEl.required && !inputEl.value) {
                                allValid = false;
                            }
                            values[input.id] = inputEl.value;
                        }
                    });

                    if (allValid) {
                        hideModal();
                        resolve(values);
                    } else {
                        showInfoModal('Por favor, preencha todos os campos obrigatórios.', 'error');
                    }
                };

                inputModalCancelBtn.onclick = () => {
                    hideModal();
                    resolve(null);
                };

                inputModal.classList.remove('hidden');
            });
        };
        
        // --- LÓGICA DE SALVAR/CARREGAR/DELETAR ---
        const salvarEscalaBtn = document.getElementById('salvarEscalaBtn');
        const tabelaRegistrosBody = document.getElementById('tabela-registros-body');
        let escalasSalvasCache = [];
        let escalaConfigCache = {};

        const apiRequest = async (url, options = {}) => {
            const response = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
                ...options
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = new Error(data.error || 'Erro ao comunicar com o servidor.');
                error.details = data.errors || data.details || null;
                throw error;
            }
            return data;
        };

        const carregarUsuarioSessao = async () => {
            const data = await apiRequest('/api/auth/me');
            const user = data.user || {};
            usuarioSessaoCache = user;
            const lojas = Array.isArray(user.lojas) ? user.lojas : [];

            if (loggedUserName) {
                loggedUserName.textContent = user.nome || user.login || 'Usuário';
            }

            if (loggedUserStores) {
                loggedUserStores.textContent = lojas.length > 0
                    ? `Lojas: ${lojas.join(', ')}`
                    : 'Sem loja vinculada';
            }
        };

        const configurarAcoesAdmin = () => {
            if (usuarioSessaoCache?.perfil !== 'ADMIN' || novoUsuarioBtn) return;

            novoUsuarioBtn = document.createElement('button');
            novoUsuarioBtn.type = 'button';
            novoUsuarioBtn.id = 'novoUsuarioBtn';
            novoUsuarioBtn.className = 'action-button';
            novoUsuarioBtn.innerHTML = '<span class="material-symbols-outlined">person_add</span>Novo Usuário';
            carregarAcessosBtn.parentElement.appendChild(novoUsuarioBtn);
        };

        logoutAppBtn?.addEventListener('click', async () => {
            try {
                await apiRequest('/api/auth/logout', { method: 'POST' });
            } finally {
                window.location.href = '/login.html';
            }
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
            const lojaAtual = lojaEscalaSelect.value || funcionariosLojaSelect.value;
            lojasPermitidasCache = lojas.map(loja => Number(getLojaCodigo(loja))).filter(Boolean);
            lojaEscalaSelect.innerHTML = '';
            funcionariosLojaSelect.innerHTML = '';
            if (homeLojaSelect) homeLojaSelect.innerHTML = '';
            if (secoesLojaSelect) secoesLojaSelect.innerHTML = '';
            if (secaoFormLoja) secaoFormLoja.innerHTML = '';

            if (lojas.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhuma loja permitida';
                lojaEscalaSelect.appendChild(option);
                funcionariosLojaSelect.appendChild(option.cloneNode(true));
                homeLojaSelect?.appendChild(option.cloneNode(true));
                secoesLojaSelect?.appendChild(option.cloneNode(true));
                secaoFormLoja?.appendChild(option.cloneNode(true));
                lojaEscalaSelect.disabled = true;
                funcionariosLojaSelect.disabled = true;
                if (homeLojaSelect) homeLojaSelect.disabled = true;
                if (secoesLojaSelect) secoesLojaSelect.disabled = true;
                if (secaoFormLoja) secaoFormLoja.disabled = true;
                carregarFuncionariosBtn.disabled = true;
                carregarFuncionariosTelaBtn.disabled = true;
                funcionariosStatus.textContent = 'Usuario sem loja permitida';
                return [];
            }

            lojaEscalaSelect.disabled = false;
            funcionariosLojaSelect.disabled = false;
            if (homeLojaSelect) homeLojaSelect.disabled = false;
            if (secoesLojaSelect) secoesLojaSelect.disabled = false;
            if (secaoFormLoja) secaoFormLoja.disabled = false;
            carregarFuncionariosBtn.disabled = false;
            carregarFuncionariosTelaBtn.disabled = false;

            lojas.forEach(loja => {
                const lojaCodigo = getLojaCodigo(loja);
                const option = document.createElement('option');
                option.value = lojaCodigo;
                option.textContent = `Loja ${lojaCodigo}`;
                lojaEscalaSelect.appendChild(option);
                funcionariosLojaSelect.appendChild(option.cloneNode(true));
                homeLojaSelect?.appendChild(option.cloneNode(true));
                secoesLojaSelect?.appendChild(option.cloneNode(true));
                secaoFormLoja?.appendChild(option.cloneNode(true));
            });

            const lojaSelecionada = lojasPermitidasCache.includes(Number(lojaAtual))
                ? String(lojaAtual)
                : String(getLojaCodigo(lojas[0]));
            lojaEscalaSelect.value = lojaSelecionada;
            funcionariosLojaSelect.value = lojaSelecionada;
            if (homeLojaSelect) homeLojaSelect.value = lojaSelecionada;
            if (secoesLojaSelect) secoesLojaSelect.value = lojaSelecionada;
            if (secaoFormLoja) secaoFormLoja.value = lojaSelecionada;
            return lojas;
        };

        const carregarSecoesDaLoja = async (silent = false) => {
            const loja = lojaEscalaSelect.value || secoesLojaSelect?.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                secoesLojaCache = [];
                popularSelectSecoesTurno();
                return [];
            }

            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`);
                secoesLojaCache = data.secoes || [];
                popularSelectSecoesTurno();
                if (!silent && secoesLojaCache.length === 0) {
                    showInfoModal('Nenhuma secao encontrada para a loja selecionada.', 'info');
                }
                return secoesLojaCache;
            } catch (error) {
                secoesLojaCache = [];
                popularSelectSecoesTurno();
                if (!silent) showInfoModal(error.message, 'error');
                return [];
            }
        };

        const preencherFormularioSecao = (secao = null) => {
            const turno = getSecaoTurnoPadrao(secao) || {};
            secaoFormId.value = secao?.ESCSECAO_ID || '';
            secaoFormLoja.value = secao?.LOJA || secoesLojaSelect?.value || lojaEscalaSelect.value || '';
            secaoFormCodigo.value = secao?.COD_SECAO || '';
            secaoFormDescr.value = secao?.DESCR || '';
            secaoFormQtde.value = turno.QTDE_COLABORADORES || 1;
            secaoFormHrEnt1.value = turno.HR_ENT1 || '';
            secaoFormHrSai1.value = turno.HR_SAI1 || '';
            secaoFormHrEnt2.value = turno.HR_ENT2 || '';
            secaoFormHrSai2.value = turno.HR_SAI2 || '';
        };

        const prepararFormularioSecao = async (escsecaoId = '') => {
            const loja = secoesLojaSelect?.value || lojaEscalaSelect.value;
            if (secaoFormLoja && loja) secaoFormLoja.value = loja;

            if (!escsecaoId || escsecaoId === 'nova') {
                secaoFormTitulo.textContent = 'Nova Seção';
                preencherFormularioSecao(null);
                return;
            }

            if (secoesLojaCache.length === 0) {
                await carregarSecoesDaLoja(true);
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

        const renderizarSecoesTela = (secoes, loja) => {
            secoesTitulo.textContent = `Secoes cadastradas - Loja ${loja}`;
            tabelaSecoesBody.innerHTML = '';

            if (!secoes || secoes.length === 0) {
                tabelaSecoesBody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-8">Nenhuma secao encontrada para a loja selecionada.</td></tr>';
                return;
            }

            secoes.forEach(secao => {
                const turno = getSecaoTurnoPadrao(secao) || {};
                tabelaSecoesBody.innerHTML += `
                    <tr data-escsecao-id="${escapeHtml(secao.ESCSECAO_ID || '')}">
                        <td data-label="Codigo">${escapeHtml(secao.COD_SECAO || '')}</td>
                        <td data-label="Descricao">${escapeHtml(secao.DESCR || '')}</td>
                        <td data-label="Colaboradores">${escapeHtml(turno.QTDE_COLABORADORES || '')}</td>
                        <td data-label="Entrada 1">${escapeHtml(turno.HR_ENT1 || '')}</td>
                        <td data-label="Saida 1">${escapeHtml(turno.HR_SAI1 || '')}</td>
                        <td data-label="Entrada 2">${escapeHtml(turno.HR_ENT2 || '')}</td>
                        <td data-label="Saida 2">${escapeHtml(turno.HR_SAI2 || '')}</td>
                        <td data-label="Acoes" class="actions-cell">
                            <button class="action-btn-table edit-secao" data-id="${escapeHtml(secao.ESCSECAO_ID || '')}" title="Editar secao">
                                <span class="material-symbols-outlined">edit</span>
                                Editar
                            </button>
                        </td>
                    </tr>
                `;
            });
        };

        const carregarSecoesTela = async (showSuccess = true) => {
            const loja = secoesLojaSelect?.value || lojaEscalaSelect.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                secoesTitulo.textContent = 'Secoes cadastradas';
                tabelaSecoesBody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-8">Selecione uma loja permitida para carregar as secoes.</td></tr>';
                return;
            }

            lojaEscalaSelect.value = loja;
            funcionariosLojaSelect.value = loja;
            if (homeLojaSelect) homeLojaSelect.value = loja;
            const secoes = await carregarSecoesDaLoja(true);
            renderizarSecoesTela(secoes, loja);
            if (showSuccess) {
                showInfoModal(`${secoes.length} secao(oes) carregada(s) da loja ${loja}.`, 'success');
            }
        };

        tabelaSecoesBody?.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-secao');
            if (!editButton) return;

            window.location.hash = `/secoes/${editButton.dataset.id}`;
        });

        novaSecaoBtn?.addEventListener('click', () => {
            window.location.hash = '/secoes/nova';
        });

        voltarSecoesBtn?.addEventListener('click', () => {
            window.location.hash = '/secoes';
        });

        secaoForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const loja = secaoFormLoja.value;
            const escsecaoId = secaoFormId.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                showInfoModal('Selecione uma loja permitida para salvar a seção.', 'error');
                return;
            }

            try {
                const payload = {
                    COD_SECAO: Number(secaoFormCodigo.value),
                    DESCR: secaoFormDescr.value.trim(),
                    QTDE_COLABORADORES: Number(secaoFormQtde.value),
                    HR_ENT1: secaoFormHrEnt1.value,
                    HR_SAI1: secaoFormHrSai1.value,
                    HR_ENT2: secaoFormHrEnt2.value,
                    HR_SAI2: secaoFormHrSai2.value
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

        const renderizarFuncionariosTela = (funcionarios, loja) => {
            funcionariosTitulo.textContent = `Funcionários cadastrados - Loja ${loja}`;
            tabelaFuncionariosBody.innerHTML = '';

            if (!funcionarios || funcionarios.length === 0) {
                tabelaFuncionariosBody.innerHTML = '<tr><td colspan="11" class="text-center text-gray-500 py-8">Nenhum funcionário encontrado para a loja selecionada.</td></tr>';
                return;
            }

            funcionarios.forEach(funcionario => {
                const row = `
                    <tr data-escfunc-id="${funcionario.ESCFUNC_ID || ''}">
                        <td data-label="Chapa">${funcionario.CHAPA || ''}</td>
                        <td data-label="Nome">${funcionario.NOME || ''}</td>
                        <td data-label="Loja">${funcionario.LOJA || ''}</td>
                        <td data-label="Seção">${funcionario.ESCSECAO_ID || ''}</td>
                        <td data-label="Função">${funcionario.ESCFUNCAO_ID || ''}</td>
                        <td data-label="Brigadista">${funcionario.BRIGADISTA || ''}</td>
                        <td data-label="Entrada 1">${funcionario.HR_ENT1 || ''}</td>
                        <td data-label="Saída 1">${funcionario.HR_SAI1 || ''}</td>
                        <td data-label="Entrada 2">${funcionario.HR_ENT2 || ''}</td>
                        <td data-label="Saída 2">${funcionario.HR_SAI2 || ''}</td>
                        <td data-label="A??es">
                            <button class="action-btn-table edit-funcionario" data-id="${funcionario.ESCFUNC_ID || ''}" title="Editar dados de escala">
                                <span class="material-symbols-outlined">edit</span>
                                Editar
                            </button>
                        </td>
                    </tr>
                `;
                tabelaFuncionariosBody.innerHTML += row;
            });
        };

        const carregarFuncionariosTela = async (showSuccess = true) => {
            const loja = funcionariosLojaSelect.value || lojaEscalaSelect.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                funcionariosTitulo.textContent = 'Funcionários cadastrados';
                tabelaFuncionariosBody.innerHTML = '<tr><td colspan="11" class="text-center text-gray-500 py-8">Selecione uma loja permitida para carregar os funcionários.</td></tr>';
                return;
            }

            let data;
            try {
                data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios`);
            } catch (error) {
                funcionariosTitulo.textContent = `FuncionÃ¡rios cadastrados - Loja ${loja}`;
                tabelaFuncionariosBody.innerHTML = `<tr><td colspan="11" class="text-center text-red-600 py-8">Erro ao carregar funcionÃ¡rios: ${escapeHtml(error.message)}</td></tr>`;
                throw error;
            }
            renderizarFuncionariosTela(data.funcionarios || [], loja);
            if (showSuccess) {
                showInfoModal(`${(data.funcionarios || []).length} funcionário(s) carregado(s) da loja ${loja}.`, 'success');
            }
        };

        tabelaFuncionariosBody.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-funcionario');
            if (!editButton) return;

            const loja = funcionariosLojaSelect.value || lojaEscalaSelect.value;
            const funcionario = funcionariosLojaCache.find(item => Number(item.ESCFUNC_ID) === Number(editButton.dataset.id));
            if (!loja || !funcionario) {
                showInfoModal('Funcionário não encontrado para edição.', 'error');
                return;
            }

            const values = await showInputModal({
                title: `Editar escala - ${funcionario.NOME}`,
                inputs: [
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

        const renderizarAcessosTela = (usuarios) => {
            tabelaAcessosBody.innerHTML = '';

            if (!usuarios || usuarios.length === 0) {
                tabelaAcessosBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhum usuário encontrado.</td></tr>';
                return;
            }

            usuarios.forEach(usuario => {
                const statusLabel = usuario.STATUS === 'A' ? 'Ativo' : 'Inativo';
                const lojas = Array.isArray(usuario.LOJAS) ? usuario.LOJAS.join(', ') : '';
                const isAdmin = usuarioSessaoCache?.perfil === 'ADMIN';
                const row = `
                    <tr data-usuario-id="${usuario.USUARIO_ID}">
                        <td data-label="Login">${usuario.LOGIN || ''}</td>
                        <td data-label="Nome">${usuario.NOME || ''}</td>
                        <td data-label="Role">${usuario.PERFIL || ''}</td>
                        <td data-label="Status">${statusLabel}</td>
                        <td data-label="Lojas Permitidas">
                            <span>${lojas}</span>
                            ${isAdmin ? `<div class="actions-cell mt-2">
                                <button class="action-btn-table edit-usuario" data-id="${usuario.USUARIO_ID}" title="Editar usuário">
                                    <span class="material-symbols-outlined">edit</span>
                                    Editar
                                </button>
                                <button class="action-btn-table toggle-usuario" data-id="${usuario.USUARIO_ID}" data-status="${usuario.STATUS}" title="Alterar status">
                                    <span class="material-symbols-outlined">block</span>
                                    ${usuario.STATUS === 'A' ? 'Inativar' : 'Reativar'}
                                </button>
                            </div>` : ''}
                        </td>
                    </tr>
                `;
                tabelaAcessosBody.innerHTML += row;
            });
        };

        const carregarAcessosTela = async (showSuccess = true) => {
            const data = await apiRequest('/api/acessos/usuarios');
            usuariosAcessoCache = data.usuarios || [];
            renderizarAcessosTela(usuariosAcessoCache);
            if (showSuccess) {
                showInfoModal(`${(data.usuarios || []).length} usuário(s) carregado(s).`, 'success');
            }
        };

        tabelaAcessosBody.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-usuario');
            const toggleButton = event.target.closest('.toggle-usuario');
            const actionButton = editButton || toggleButton;
            if (!actionButton) return;

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

                const values = await showInputModal({
                    title: `Editar usuário - ${usuario.LOGIN}`,
                    inputs: [
                        { label: 'Nome', type: 'text', id: 'NOME', value: usuario.NOME || '', required: true },
                        { label: 'Role', type: 'text', id: 'PERFIL', value: usuario.PERFIL || '', required: true },
                        { label: 'Status (A/I)', type: 'text', id: 'STATUS', value: usuario.STATUS || 'A', required: true },
                        { label: 'Lojas permitidas (separadas por vírgula)', type: 'text', id: 'LOJAS', value: (usuario.LOJAS || []).join(', ') }
                    ],
                    confirmText: 'Salvar'
                });
                if (!values) return;

                await apiRequest(`/api/acessos/usuarios/${encodeURIComponent(usuario.USUARIO_ID)}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        NOME: values.NOME,
                        PERFIL: values.PERFIL,
                        STATUS: String(values.STATUS || 'A').trim().toUpperCase().slice(0, 1),
                        LOJAS: String(values.LOJAS || '').split(',').map(loja => Number(loja.trim())).filter(Boolean)
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

        const carregarAusenciasDaLoja = async () => {
            const loja = lojaEscalaSelect.value;
            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);
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
                        cell.removeAttribute('contenteditable');
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

        const carregarFuncionariosDaLoja = async (silent = false) => {
            const loja = lojaEscalaSelect.value;
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
                await carregarAusenciasDaLoja();
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

        const renderizarRolesSettings = async () => {
            if (usuarioSessaoCache?.perfil !== 'ADMIN') return;

            const container = document.getElementById('rolesSettingsContainer');
            if (!container) return;

            if (usuariosAcessoCache.length === 0) {
                const data = await apiRequest('/api/acessos/usuarios');
                usuariosAcessoCache = data.usuarios || [];
            }

            const roles = usuariosAcessoCache.reduce((acc, usuario) => {
                const role = usuario.PERFIL || 'SEM_ROLE';
                acc[role] = acc[role] || { total: 0, ativos: 0, lojas: new Set() };
                acc[role].total += 1;
                if (usuario.STATUS === 'A') acc[role].ativos += 1;
                (usuario.LOJAS || []).forEach(loja => acc[role].lojas.add(loja));
                return acc;
            }, {});

            const rows = Object.entries(roles).map(([role, info]) => `
                <tr>
                    <td data-label="Role">${role}</td>
                    <td data-label="Usuários">${info.ativos}/${info.total} ativo(s)</td>
                    <td data-label="Lojas">${Array.from(info.lojas).sort((a, b) => a - b).join(', ') || '-'}</td>
                    <td data-label="Permissões">${role === 'ADMIN' ? 'Administração completa' : 'Operação nas lojas permitidas'}</td>
                </tr>
            `).join('');

            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Usuários</th>
                            <th>Lojas</th>
                            <th>Permissões</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4" class="text-center text-gray-500 py-8">Nenhuma role encontrada.</td></tr>'}</tbody>
                </table>
            `;
        };

        const renderizarTabelaRegistros = () => {
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
                let detailTable = `<div class="colaborador-escala-detalhada" data-colab-index="${index}" data-escfunc-id="${colaborador.escfuncId || ''}" data-chapa="${colaborador.chapa || ''}" data-escsecao-id="${colaborador.escsecaoId || ''}" data-escfuncao-id="${colaborador.escfuncaoId || ''}"><div class="header-info"><h3 class="font-bold text-lg" contenteditable="true">${colaborador.nome}</h3></div><table><thead><tr class="bg-gray-50"><th>D.SEM</th>${Array.from({length: diasNoMes}, (_, i) => `<th>${diasDaSemana[new Date(ano, mes, i + 1).getDay()]}</th>`).join('')}</tr><tr class="bg-gray-50"><th>DIA</th>${Array.from({length: diasNoMes}, (_, i) => `<th data-day-col="${i + 1}">${i + 1}</th>`).join('')}</tr></thead><tbody>`;
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
                        const editableAttr = (key !== 'intervalo' && key !== 'trabalhadas') ? 'contenteditable="true"' : '';
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
                    escsecaoId: colaborador.escsecaoId || null,
                    escfuncaoId: colaborador.escfuncaoId || null,
                    dias: Object.keys(colaborador.turnos || {}).map(dia => {
                        const turno = colaborador.turnos[dia] || {};
                        const isFolga = String(turno.inicio || '').trim().toUpperCase() === 'F';
                        return {
                            data: formatDateForDb(escalaSalva.ano, escalaSalva.mes, parseInt(dia, 10)),
                            hrEnt1: isFolga ? null : (turno.inicio || null),
                            hrSai1: isFolga ? null : (turno.inicioIntervalo || null),
                            hrEnt2: isFolga ? null : (turno.fimIntervalo || null),
                            hrSai2: isFolga ? null : (turno.fim || null),
                            programacao: isFolga ? 'F' : 'TRB'
                        };
                    })
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

        const renderizarTabelaBanco = (escalas) => {
            tabelaBancoBody.innerHTML = '';

            if (!escalas || escalas.length === 0) {
                if (bancoResumo) bancoResumo.textContent = 'Nenhuma escala estruturada encontrada para a loja e mês selecionados.';
                tabelaBancoBody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhuma escala estruturada encontrada para a loja e mês selecionados.</td></tr>';
                return;
            }

            if (bancoResumo) {
                const funcionarios = new Set(escalas.map(escala => escala.CHAPA).filter(Boolean));
                const maiorRevisao = escalas.reduce((max, escala) => Math.max(max, Number(escala.REVISAO || 0)), 0);
                bancoResumo.textContent = `${funcionarios.size} funcionário(s) com escala no banco. Maior revisão: ${maiorRevisao || '-'}.`;
            }

            escalas.forEach(escala => {
                const id = escala.ESCPROG_ID;
                const mesRef = String(escala.MES_REF || '').slice(0, 10);
                const row = `
                    <tr>
                        <td data-label="ID">${id}</td>
                        <td data-label="Mês">${mesRef}</td>
                        <td data-label="Loja">${escala.LOJA || ''}</td>
                        <td data-label="Chapa">${escala.CHAPA || ''}</td>
                        <td data-label="Funcionário">${escala.NOME || ''}</td>
                        <td data-label="Revisão">${escala.REVISAO || ''}</td>
                        <td data-label="Ações" class="actions-cell">
                            <button class="action-btn-table load banco-dias" data-id="${id}" title="Consultar dias salvos">
                                <span class="material-symbols-outlined">event_note</span>
                                Dias
                            </button>
                        </td>
                    </tr>
                `;
                tabelaBancoBody.innerHTML += row;
            });
        };

        const consultarEscalasBancoLocal = async () => {
            const lojaId = parseInt(lojaEscalaSelect.value, 10);
            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);

            if (!lojaId || Number.isNaN(ano) || Number.isNaN(mes)) {
                showInfoModal('Selecione loja, mês e ano no Gerador de Escala antes de consultar o banco.', 'info');
                return;
            }

            const mesRef = formatDateForDb(ano, mes, 1);
            const data = await apiRequest(`/api/escalas?lojaId=${encodeURIComponent(lojaId)}&mesRef=${encodeURIComponent(mesRef)}`);
            renderizarTabelaBanco(data.escalas || []);
        };

        const renderizarDetalheEscalaBanco = (dias) => {
            tabelaEscalaDetalheBody.innerHTML = '';
            if (!dias || dias.length === 0) {
                tabelaEscalaDetalheBody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhum dia salvo para esta escala.</td></tr>';
                return;
            }

            dias.forEach((dia) => {
                const dataDia = String(dia.DT || '').slice(0, 10);
                tabelaEscalaDetalheBody.innerHTML += `
                    <tr data-escprogdia-id="${escapeHtml(dia.ESCPROGDIA_ID || '')}">
                        <td data-label="Data">${escapeHtml(dataDia)}</td>
                        <td data-label="Programacao"><input class="detail-input detail-programacao" maxlength="3" value="${escapeHtml(dia.PROGRAMACAO || 'TRB')}"></td>
                        <td data-label="Entrada 1"><input class="detail-input detail-hr-ent1" type="time" value="${escapeHtml(dia.HR_ENT1 === 'F' ? '' : dia.HR_ENT1 || '')}"></td>
                        <td data-label="Saida 1"><input class="detail-input detail-hr-sai1" type="time" value="${escapeHtml(dia.HR_SAI1 === 'F' ? '' : dia.HR_SAI1 || '')}"></td>
                        <td data-label="Entrada 2"><input class="detail-input detail-hr-ent2" type="time" value="${escapeHtml(dia.HR_ENT2 === 'F' ? '' : dia.HR_ENT2 || '')}"></td>
                        <td data-label="Saida 2"><input class="detail-input detail-hr-sai2" type="time" value="${escapeHtml(dia.HR_SAI2 === 'F' ? '' : dia.HR_SAI2 || '')}"></td>
                        <td data-label="Acoes">
                            <button class="action-btn-table save-dia-banco" title="Salvar dia">
                                <span class="material-symbols-outlined">save</span>
                                Salvar
                            </button>
                        </td>
                    </tr>
                `;
            });
        };

        const popularFiltroMesDetalhe = (dias) => {
            if (!detalheMesSelect) return;
            const meses = [...new Set((dias || []).map(dia => String(dia.DT || '').slice(0, 7)).filter(Boolean))];
            detalheMesSelect.innerHTML = '';
            meses.forEach((mes) => {
                const option = document.createElement('option');
                option.value = mes;
                option.textContent = mes;
                detalheMesSelect.appendChild(option);
            });
        };

        const carregarDetalheEscalaBanco = async (escprogId) => {
            escalaDetalheAtual.escprogId = escprogId;
            escalaDetalheTitulo.textContent = `Escala ${escprogId}`;
            escalaDetalheResumo.textContent = 'Carregando dias da escala...';
            tabelaEscalaDetalheBody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-8">Carregando...</td></tr>';
            const data = await apiRequest(`/api/escalas/${encodeURIComponent(escprogId)}/dias`);
            escalaDetalheAtual.dias = data.dias || [];
            popularFiltroMesDetalhe(escalaDetalheAtual.dias);
            escalaDetalheResumo.textContent = `${escalaDetalheAtual.dias.length} dia(s) encontrado(s).`;
            renderizarDetalheEscalaBanco(escalaDetalheAtual.dias);
        };

        detalheMesSelect?.addEventListener('change', () => {
            const mes = detalheMesSelect.value;
            const dias = escalaDetalheAtual.dias.filter(dia => String(dia.DT || '').slice(0, 7) === mes);
            renderizarDetalheEscalaBanco(dias);
        });

        tabelaEscalaDetalheBody?.addEventListener('click', async (event) => {
            const saveButton = event.target.closest('.save-dia-banco');
            if (!saveButton) return;

            const row = saveButton.closest('tr');
            const escprogdiaId = row?.dataset.escprogdiaId;
            if (!escalaDetalheAtual.escprogId || !escprogdiaId) return;

            try {
                const programacao = row.querySelector('.detail-programacao').value.trim().toUpperCase() || 'TRB';
                const folga = programacao === 'F';
                await apiRequest(`/api/escalas/${encodeURIComponent(escalaDetalheAtual.escprogId)}/dias/${encodeURIComponent(escprogdiaId)}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        PROGRAMACAO: programacao,
                        HR_ENT1: folga ? 'F' : row.querySelector('.detail-hr-ent1').value,
                        HR_SAI1: folga ? 'F' : row.querySelector('.detail-hr-sai1').value,
                        HR_ENT2: folga ? 'F' : row.querySelector('.detail-hr-ent2').value,
                        HR_SAI2: folga ? 'F' : row.querySelector('.detail-hr-sai2').value
                    })
                });
                showInfoModal('Dia atualizado no banco.', 'success');
                await carregarDetalheEscalaBanco(escalaDetalheAtual.escprogId);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        salvarEscalaBtn.addEventListener('click', async () => {
            if (escalaCarregadaId) {
                const escalas = getEscalasSalvas();
                const escalaParaAtualizar = escalas.find(e => e.id == escalaCarregadaId);
                if (!escalaParaAtualizar) return;
                
                const values = await showInputModal({
                    title: 'Confirmar Alterações',
                    inputs: [{ label: `Digite a senha para a escala "${escalaParaAtualizar.nome}"`, type: 'password', id: 'escala-senha', required: true }],
                    confirmText: 'Salvar Alterações'
                });

                if (values && values['escala-senha'] === escalaParaAtualizar.senha) {
                    escalaParaAtualizar.lojaId = escalaParaAtualizar.lojaId || parseInt(lojaEscalaSelect.value, 10);
                    escalaParaAtualizar.dados = parseEscalaFromModal();
                    escalaParaAtualizar.dataSalva = new Date().toLocaleDateString('pt-BR');
                    await salvarEscalasNoStorage(escalas);
                    const syncResult = await tentarSincronizarEscalaComBanco(escalaParaAtualizar);
                    showInfoModal(syncResult.ok && syncResult.count > 0 ? 'Escala atualizada e sincronizada com o banco!' : `Escala atualizada, mas não sincronizada com o banco: ${syncResult.message || 'carregue funcionários da loja antes de gerar a escala.'}`, syncResult.ok && syncResult.count > 0 ? 'success' : 'error');
                    renderizarTabelaRegistros();
                } else if(values) {
                    showInfoModal('Senha incorreta. As alterações não foram salvas.', 'error');
                }
            } else {
                const values = await showInputModal({
                    title: 'Salvar Nova Escala',
                    inputs: [
                        { label: 'Nome da Escala', type: 'text', id: 'escala-nome', required: true },
                        { label: 'Setor', type: 'text', id: 'escala-setor', required: true },
                        { label: 'Senha de Acesso', type: 'password', id: 'escala-senha', required: true }
                    ],
                    confirmText: 'Criar e Salvar'
                });

                if (!values) return;
                
                const novaEscala = {
                    id: Date.now(),
                    nome: values['escala-nome'],
                    setor: values['escala-setor'],
                    senha: values['escala-senha'],
                    dataSalva: new Date().toLocaleDateString('pt-BR'),
                    criadoEm: new Date().toISOString(),
                    criadoPorLogin: usuarioSessaoCache?.login || '',
                    criadoPorNome: usuarioSessaoCache?.nome || usuarioSessaoCache?.login || '',
                    lojaId: parseInt(lojaEscalaSelect.value, 10),
                    dados: parseEscalaFromModal(),
                    timelineData: JSON.parse(JSON.stringify(dadosEscala)),
                    mesAno: detalhadaMesAno.textContent,
                    mes: parseInt(mesSelect.value),
                    ano: parseInt(anoSelect.value)
                };

                const escalas = getEscalasSalvas();
                escalas.push(novaEscala);
                await salvarEscalasNoStorage(escalas);
                const syncResult = await tentarSincronizarEscalaComBanco(novaEscala);
                escalaCarregadaId = novaEscala.id;
                currentLoadedScale = novaEscala;
                showInfoModal(syncResult.ok && syncResult.count > 0 ? "Escala salva e sincronizada com o banco! Agora você pode continuar editando e salvar as alterações." : `Escala salva, mas não sincronizada com o banco: ${syncResult.message || 'carregue funcionários da loja antes de gerar a escala.'}`, syncResult.ok && syncResult.count > 0 ? "success" : "error");
                renderizarTabelaRegistros();
            }
        });

        tabelaRegistrosBody.addEventListener('click', async (e) => {
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
            const targetButton = e.target.closest('.banco-dias');
            if (!targetButton) return;

            window.location.hash = `/escala-banco/${targetButton.dataset.id}`;
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


        // --- LÓGICA DE CONFIGURAÇÕES ---
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

        const ocultarBackupConfiguracoes = () => {
            const salvarBackupBtn = document.getElementById('salvarBackupBtn');
            const carregarBackupBtn = document.getElementById('carregarBackupBtn');
            const backupBlock = salvarBackupBtn?.closest('.space-y-3');
            const backupTitle = backupBlock?.previousElementSibling;
            const backupSeparator = backupTitle?.previousElementSibling;

            backupBlock?.classList.add('hidden');
            backupTitle?.classList.add('hidden');
            backupSeparator?.classList.add('hidden');
            salvarBackupBtn?.classList.add('hidden');
            carregarBackupBtn?.classList.add('hidden');
            document.getElementById('backupFileInput')?.classList.add('hidden');
        };

       

        // --- INICIALIZAÇÃO ---
        window.onload = async () => { 
            try {
                popularSeletoresData(); 
                await carregarUsuarioSessao();
                configurarAcoesAdmin();
                await carregarEstadoServidor();
                await carregarLojasEscala();
                await carregarSecoesDaLoja(true);
                await carregarFuncionariosDaLoja(true);
            } catch (error) {
                showInfoModal(`Erro ao carregar dados salvos: ${error.message}`, 'error');
            }
           
            carregarConfiguracoes();
            ocultarBackupConfiguracoes();
            
            if (getEscalasSalvas().length === 0) {
                 dadosEscala = []; 
            }
            mainTimelineZoomLevel = 1.0;
            applyMainTimelineZoom();
            renderizarTimelineCompleta('timeline-content'); 
            atualizarContadoresHome();
            handleHashNavigation(); 
            renderizarTabelaRegistros();
            // Fluxos de importacao/backup local ficam desativados: o banco e a origem oficial.
            return;

            // ==========================================================
            // =========== LÓGICA DE BACKUP E RESTAURAÇÃO ================
            // ==========================================================
            const salvarBackupBtn = document.getElementById('salvarBackupBtn');
            const carregarBackupBtn = document.getElementById('carregarBackupBtn');
            const backupFileInput = document.getElementById('backupFileInput');

            // --- Lógica para Salvar o Backup (Exportar) ---
            salvarBackupBtn?.addEventListener('click', () => {
                try {
                    const escalas = getEscalasSalvas();
                    const config = escalaConfigCache || {};
                    const backupData = {
                        version: '1.0-total',
                        createdAt: new Date().toISOString(),
                        data: {
                            escalasSalvas: escalas,
                            escalaConfig: config
                        }
                    };
                    const jsonString = JSON.stringify(backupData, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_total_escalas_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showInfoModal('Arquivo de backup total gerado com sucesso!', 'success');
                } catch (error) {
                    console.error("Erro ao gerar backup:", error);
                    showInfoModal('Ocorreu um erro ao tentar gerar o arquivo de backup total.', 'error');
                }
            });

            // --- Gatilho para abrir o seletor de arquivo ---
            carregarBackupBtn?.addEventListener('click', () => {
                backupFileInput?.click();
            });

            // --- Lógica para Carregar o Backup (Importar) ---
            backupFileInput?.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const content = e.target.result;
                        const backupData = JSON.parse(content);

                        if (!backupData || backupData.version !== '1.0-total' || !backupData.data || !backupData.data.escalasSalvas) {
                           throw new Error("Formato de arquivo de backup total inválido ou incompatível.");
                        }

                        const escalasImportadas = backupData.data.escalasSalvas;
                        const configImportada = backupData.data.escalaConfig || {};
                        
                        const userChoice = await showInputModal({
                            title: 'Confirmar Restauração Total',
                            inputs: [{
                                type: 'message',
                                text: `Você está prestes a carregar ${escalasImportadas.length} escala(s) do arquivo. Isso irá substituir TODAS as escalas e configurações atuais. Deseja continuar?`
                            }],
                            confirmText: 'Sim, Sobrescrever Tudo',
                            cancelText: 'Cancelar'
                        });

                        if (userChoice) {
                            await salvarEscalasNoStorage(escalasImportadas);
                            await salvarConfigNoServidor(configImportada);
                            await showInputModal({
                                title: 'Sucesso!',
                                inputs: [{ type: 'message', text: 'Backup total restaurado. A página será recarregada.' }],
                                confirmText: 'OK',
                                cancelText: ''
                            });
                            location.reload();
                        }
                    } catch (error) {
                        console.error("Erro ao carregar backup total:", error);
                        showInfoModal(`Erro ao ler o arquivo de backup: ${error.message}`, 'error');
                    } finally {
                        event.target.value = '';
                    }
                };
                reader.readAsText(file);
            });

            // =================================================================
            // === NOVA LÓGICA: IMPORTAÇÃO DE BACKUP INDIVIDUAL DE ESCALA ======
            // =================================================================
            const importarEscalaBtn = document.getElementById('importarEscalaBtn');
            const importarEscalaInput = document.getElementById('importarEscalaInput');

            importarEscalaBtn.addEventListener('click', () => {
                importarEscalaInput.click();
            });

            importarEscalaInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const content = e.target.result;
                        const backupData = JSON.parse(content);

                        if (!backupData || backupData.version !== '1.0-individual' || !backupData.data || !backupData.data.id) {
                           throw new Error("Arquivo de backup de escala individual inválido ou corrompido.");
                        }

                        const escalaImportada = backupData.data;
                        const escalasAtuais = getEscalasSalvas();

                        if (escalasAtuais.some(escala => escala.id === escalaImportada.id)) {
                             const userChoice = await showInputModal({
                                title: 'Escala Duplicada',
                                inputs: [{ type: 'message', text: `A escala "${escalaImportada.nome}" já existe. Deseja substituí-la pela versão do arquivo?` }],
                                confirmText: 'Sim, Substituir',
                                cancelText: 'Não, Manter Atual'
                            });
                             if (userChoice) {
                                const index = escalasAtuais.findIndex(escala => escala.id === escalaImportada.id);
                                escalasAtuais[index] = escalaImportada;
                             } else {
                                 event.target.value = '';
                                 return;
                             }
                        } else {
                            escalasAtuais.push(escalaImportada);
                        }
                        
                        await salvarEscalasNoStorage(escalasAtuais);
                        renderizarTabelaRegistros();
                        showInfoModal(`Escala "${escalaImportada.nome}" importada com sucesso!`, 'success');

                    } catch (error) {
                        console.error("Erro ao importar escala:", error);
                        showInfoModal(`Erro ao processar o arquivo de backup: ${error.message}`, 'error');
                    } finally {
                        event.target.value = '';
                    }
                };
                reader.readAsText(file);
            });
        };
// --- LÓGICA 5X2 - 100% CLT + EQUILÍBRIO DE EQUIPE + SEM FOLGAS CASADAS ---
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

    await carregarAusenciasDaLoja();

    const marcarFolgaNoMapa = (colabIdx, date) => {
        const key = date.toDateString();
        if (scheduleMap[colabIdx][key] === 'F') return;
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
                    marcarFolgaNoMapa(i, date);
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

            // PASSO 2: ATRIBUIR FOLGAS OBRIGATÓRIAS (TRAVA DOS 6 DIAS)
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
                            if (!scheduleMap[i][diaCandidato.toDateString()]) {
                                
                                // Cálculo de penalidade (Score)
                                let peopleOffHoje = offCountPerDay[diaCandidato.toDateString()] || 0;
                                let score = peopleOffHoje * 100; // Peso base pelo equilíbrio da equipe

                                // VERIFICAÇÃO DE VIZINHANÇA (EVITAR FOLGA CASADA)
                                const ontem = new Date(diaCandidato); ontem.setDate(diaCandidato.getDate() - 1);
                                const amanha = new Date(diaCandidato); amanha.setDate(diaCandidato.getDate() + 1);
                                
                                if (scheduleMap[i][ontem.toDateString()] === 'F' || scheduleMap[i][amanha.toDateString()] === 'F') {
                                    score += 500; // Penalidade alta por ser folga consecutiva
                                }

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

    // --- RENDERIZAÇÃO FINAL ---
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
    if (ausenciasAplicadas.length > 0) {
        showInfoModal([
            "Distribuição concluída. Ausências cadastradas foram aplicadas como folga obrigatória.",
            ...ausenciasAplicadas
        ], "success");
    } else {
        showInfoModal("Distribuição Concluída: 5x2 equilibrada, sem folgas casadas (exceto se necessário por lei).", "success");
    }
};

// Adicionar o Event Listener para o novo botão (coloque dentro do window.onload ou junto aos outros botões)
document.getElementById('autoDistribuirFolgasBtn').addEventListener('click', distribuirFolgas5x2Auto);
