(function() {

    // --- INÍCIO DA CONFIGURAÇÃO ---

    /**
     * IMPORTANTE: Este prefixo DEVE ser idêntico ao 'SECRET_PREFIX'
     * usado no seu arquivo GeradorDeLicenca.html.
     */
    const SECRET_PREFIX = 'APP_ESCALA_LICENSE::';

    /**
     * Onde a chave será salva no navegador.
     * Mude isso para 'sistemaContabilLicense', 'sistemaVendasLicense', etc.,
     * se quiser que cada sistema tenha uma licença separada.
     */
    const LICENSE_KEY_STORAGE = 'genericAppLicenseKey';

    // --- FIM DA CONFIGURAÇÃO ---


    /**
     * Valida a chave de licença.
     * Retorna { valid: boolean, daysRemaining: number }
     */
    function validateLicenseKey(key) {
        if (!key) {
            return { valid: false, daysRemaining: 0 };
        }
        try {
            // 1. Decodifica de Base64
            const decodedKey = atob(key);

            // 2. Verifica o prefixo secreto
            if (!decodedKey.startsWith(SECRET_PREFIX)) {
                console.error("Validação falhou: prefixo inválido.");
                return { valid: false, daysRemaining: 0 };
            }

            // 3. Extrai e "parseia" o JSON
            const jsonPayload = decodedKey.substring(SECRET_PREFIX.length);
            const payload = JSON.parse(jsonPayload);

            // 4. Verifica se a data de expiração existe
            if (!payload.validUntil) {
                console.error("Validação falhou: payload sem 'validUntil'.");
                return { valid: false, daysRemaining: 0 };
            }

            // 5. Calcula os dias restantes
            const expDate = new Date(payload.validUntil);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Zera a hora para contar o dia de hoje

            const diffTime = expDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) {
                console.warn("Licença expirada.");
                return { valid: false, daysRemaining: 0 };
            }
            
            return { valid: true, daysRemaining: diffDays };

        } catch (error) {
            console.error("Erro ao validar a licença:", error);
            return { valid: false, daysRemaining: 0 };
        }
    }

    /**
     * Injeta dinamicamente o CSS necessário para o modal de bloqueio.
     */
    function injectStyles() {
        const styleId = 'license-lock-styles';
        if (document.getElementById(styleId)) return; // Não injetar duas vezes

        const css = `
            #license-overlay {
                position: fixed;
                inset: 0;
                background-color: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(5px);
                z-index: 99999998;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                color: #333;
            }
            #license-modal {
                background-color: #ffffff;
                padding: 24px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 400px;
                z-index: 99999999;
                box-sizing: border-box;
            }
            #license-modal h3 {
                margin-top: 0;
                margin-bottom: 16px;
                font-size: 1.25rem;
                font-weight: bold;
                color: #333;
            }
            #license-modal p {
                margin-bottom: 16px;
                color: #555;
                font-size: 1rem;
                line-height: 1.5;
            }
            #license-key-input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 1rem;
                box-sizing: border-box; /* Garante que o padding não quebre o layout */
            }
            #license-confirm-btn {
                width: 100%;
                padding: 12px;
                margin-top: 16px;
                border: none;
                border-radius: 4px;
                background-color: #007bff;
                color: white;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            #license-confirm-btn:hover {
                background-color: #0056b3;
            }
        `;
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);
    }

    /**
     * Cria e injeta o HTML do modal de bloqueio.
     */
    function createModal() {
        if (document.getElementById('license-overlay')) return; // Não criar duas vezes

        const overlay = document.createElement('div');
        overlay.id = 'license-overlay';

        overlay.innerHTML = `
            <div id="license-modal">
                <h3>Sistema Bloqueado</h3>
                <p>Sua licença de uso expirou ou é inválida. Entre em contato para solicitar uma nova chave de acesso.</p>
                
                <p style="font-size: 0.95rem; color: #333; text-align: center; margin: 15px 0; border: 1px solid #ddd; padding: 12px; border-radius: 4px; background: #f9f9f9;">
               
                    <strong>MIKE MORAES</strong><br>
                    <strong>(16) 99637-1348</strong>
                </p>
                <input type="password" id="license-key-input" placeholder="Insira a nova chave de acesso">
                <button id="license-confirm-btn">Confirmar Licença</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Adiciona o evento de clique ao botão do modal.
     */
    function setupModalListener() {
        const btn = document.getElementById('license-confirm-btn');
        if (btn) {
            btn.onclick = function() {
                const input = document.getElementById('license-key-input');
                const key = input.value;
                const status = validateLicenseKey(key);

                if (status.valid) {
                    localStorage.setItem(LICENSE_KEY_STORAGE, key);
                    alert('Licença ativada com sucesso! O sistema será reiniciado.');
                    location.reload();
                } else {
                    alert('Chave de acesso inválida ou expirada. Tente novamente.');
                }
            };
        }
    }

    /**
     * Função que executa o bloqueio.
     */
    function runLock() {
        injectStyles();
        createModal();
        setupModalListener();
    }

    /**
     * Função Principal de Verificação, que roda na inicialização.
     */
    function checkLicenseOnLoad() {
        const storedKey = localStorage.getItem(LICENSE_KEY_STORAGE);
        const licenseStatus = validateLicenseKey(storedKey);

        if (!licenseStatus.valid) {
            // A licença é inválida, então bloqueamos a tela.
            // Esperamos o DOM estar pronto para injetar os elementos.
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', runLock);
            } else {
                runLock();
            }
        }
        // Se a licença for válida, o script não faz nada e 
        // seu sistema carrega normalmente.
    }

    // --- Execução Imediata ---
    // Autenticacao agora e feita pelo backend em /api/auth.
    // O bloqueio local de licenca foi desativado na copia migrada para nao
    // conflitar com a tela de login web.
    // checkLicenseOnLoad();

})();
