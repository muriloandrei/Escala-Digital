# Pontos restantes atuais

Atualizado em 2026-08-10 no branch `Escala-Dev`.

## Fechado neste sprint

- Auditoria de revisao individual agora registra dias alterados com valor anterior, valor novo, revisao anterior, revisao nova e justificativa.
- Edicao direta de dia tambem registra alteracoes detalhadas na auditoria.
- Logs de erro 500 foram sanitizados para registrar `requestId`, rota, status e codigo sem despejar o objeto completo do erro.
- Testes unitarios adicionados para diferenca de dias e tratamento de erro.

## Pontos funcionais ainda abertos

1. Refatoracao final do frontend.
   - `public/js/app-original.js` ainda concentra trechos grandes de fluxo antigo.
   - Os modulos ja existem, mas ainda falta remover codigo legado com validacao visual tela a tela.

2. Validacao manual completa em navegador.
   - Login.
   - Escalas geradas.
   - Criacao de escala.
   - Abrir escala.
   - Escala por funcionario.
   - Funcionarios.
   - Secoes.
   - Turnos por secao.
   - Tipos de descanso.
   - Controle de acesso.
   - Perfil de acesso.
   - Integracao RM.
   - Impressao com campo `Ciente`.

3. Integracao RM em ambiente Linux real.
   - O codigo ja possui servico RM, logs, reprocessamento, timeout e credenciais via `.env`.
   - Ainda depende de liberacao de rede/firewall do servidor Linux para `10.100.10.22:8051`, pois o teste via `curl` retornou timeout.

4. Operacao para muitas lojas.
   - Validar performance com volume real.
   - Criar paginacao nas telas administrativas se o volume de usuarios/lojas crescer.
   - Confirmar indices Oracle finais para loja, mes, funcionario, chapa, revisao, ativa e oficializada.

5. Hardening de seguranca.
   - Avaliar CSRF se o cookie continuar sendo usado em producao.
   - Avaliar bloqueio temporario por tentativas invalidas alem do rate limit.
   - Rotacionar qualquer credencial que tenha aparecido fora do `.env`.

6. Operacao Linux.
   - Validar deploy final com `systemd`, Nginx e HTTPS.
   - Validar rollback documentado.
   - Validar logs em producao com `requestId`.

## Validacoes executadas neste sprint

- `node --check src/server.js`
- `node --check src/routes/escalaRoutes.js`
- `node --check src/services/escalaService.js`
- `node --check src/utils/scheduleDiff.js`
- `node --check src/middleware/errorHandler.js`
- `npm test`
- `npm run smoke:api`
