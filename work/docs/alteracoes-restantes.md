# Escopo restante do projeto

## Estado atual

Concluido:

- Backend Node.js/Express criado.
- Frontend separado em HTML, CSS e JavaScript.
- Aplicacao configurada para funcionar somente com Oracle.
- Login integrado a `SGN_ESC_USUARIO` e `SGN_ESC_USUARIO_LOJA`.
- Consulta Oracle de lojas, funcionarios, ausencias e usuarios.
- Tela de funcionarios por loja.
- Tela de usuarios/acessos.
- Salvamento estruturado no Oracle em `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA`.
- Consulta das escalas salvas diretamente no Oracle.
- Validacao de ausencia no backend antes de salvar.
- Aplicacao de ausencia/ferias como folga obrigatoria no frontend.
- Regras principais isoladas em `public/js/escala-rules-core.js`.
- Testes automatizados mantidos apenas para regras puras, sem simular banco.
- Documentacao inicial de banco, seguranca, deploy e GitHub privado.
- Branch `codex/oracle-integration` criada para integracao Oracle.
- Diagnostico protegido `/api/diagnostics/oracle` criado para deploy.
- `/api/state` mantido somente como compatibilidade de tela, sem persistencia local.
- Salvamento Oracle preparado para transacao unica e revisao automatica por funcionario/mes.
- Escopo de desenvolvimento Savegnago extraido para `docs/escopo-dev-savegnago.md`.
- Funcionalidades, scripts, dados e testes de simulacao local removidos desta branch.

## Fase 1. Fechar ambiente Oracle

1. Testar performance da UI com volume real do Oracle.
2. Corrigir textos com acentuacao quebrada herdados do arquivo original.
3. Remover ou empacotar dependencias via CDN se a rede interna nao tiver internet.

## Fase 2. Fechar regras de escala

1. Documentar formalmente as regras aceitas:
   - 5x2.
   - domingo 2x1.
   - maximo de dias consecutivos.
   - intervalo minimo/maximo.
   - ausencia/ferias como folga obrigatoria.
   - brigadista exigido por loja/dia.
2. Criar testes de regressao para cada regra pura.
3. Criar validacao com ausencia atravessando varios dias no Oracle.
4. Criar validacao com escala de mais funcionarios que o cadastro da loja.
5. Definir comportamento quando a regra nao conseguir montar escala valida automaticamente.

## Fase 3. Oracle real

1. Confirmar nomes finais das tabelas, sequences, triggers e constraints.
2. Confirmar se `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA` aceitam o modelo atual.
3. Ajustar SQLs do backend para o padrao real do banco.
4. Validar tabela real de usuarios:
   - `SGN_ESC_USUARIO`.
   - `SGN_ESC_USUARIO_LOJA`.
5. Criar ou validar tabela de auditoria:
   - `SGN_ESC_AUDITORIA`.
6. Instalar Oracle Instant Client na maquina local para teste real.
7. Testar Oracle em ambiente controlado usando `/api/diagnostics/oracle`.
8. Validar timezone e campos `DATE`.
9. Validar transacao: cabecalho e dias devem gravar juntos ou falhar juntos.

## Fase 4. Autenticacao e autorizacao

1. Trocar credencial do schema que apareceu em print/conversa.
2. Criar usuario Oracle exclusivo da aplicacao com permissoes minimas.
3. Gravar senha de usuario como hash bcrypt.
4. Evoluir tela administrativa para:
   - listar usuarios.
   - criar usuario.
   - alterar perfil.
   - ativar/inativar.
   - vincular lojas permitidas.
5. Implementar bloqueio temporario por tentativas invalidas.
6. Implementar CSRF se a aplicacao continuar usando cookie.
7. Validar perfis:
   - admin.
   - regional.
   - gerente.
   - operador.
   - somente leitura.

## Fase 5. Persistencia e auditoria

1. Definir status da escala:
   - rascunho.
   - oficial.
   - cancelada.
   - revisada.
2. Implementar cancelamento logico em vez de exclusao fisica.
3. Implementar historico por revisao.
4. Gravar auditoria em:
   - login.
   - logout.
   - criacao de escala.
   - alteracao.
   - cancelamento.
   - oficializacao.
5. Criar consulta por:
   - loja.
   - mes.
   - funcionario.
   - chapa.
   - revisao.
   - status.

## Fase 6. UI operacional

1. Melhorar filtros de funcionarios:
   - secao.
   - funcao.
   - brigadista.
   - status.
2. Criar mensagens mais claras quando a escala nao puder ser corrigida automaticamente.
3. Criar tela de detalhes da escala salva no banco.
4. Criar botao para oficializar escala.
5. Criar confirmacao antes de excluir/cancelar escala.
6. Ajustar layout responsivo para telas menores.

## Fase 7. Deploy Linux

1. Subir codigo para GitHub privado.
2. Criar `.env` de producao somente no servidor.
3. Instalar Node.js LTS.
4. Instalar Oracle Instant Client.
5. Configurar usuario Linux `escalaapp`.
6. Configurar `systemd`.
7. Configurar Nginx.
8. Configurar HTTPS.
9. Validar logs.
10. Documentar rollback.

## Fase 8. Operacao para 70 lojas

1. Criar indices Oracle para consultas principais:
   - loja.
   - mes.
   - funcionario.
   - chapa.
   - revisao.
2. Garantir que a aplicacao nunca carregue dados desnecessarios sem filtro operacional.
3. Criar paginacao nas telas administrativas.
4. Criar monitoramento de erro.
5. Criar rotina de backup/restore no banco/infra.
6. Fazer teste operacional com as 70 lojas reais.

## Prioridade recomendada

1. Ajuste Oracle real.
2. Usuarios/perfis reais no Oracle.
3. Auditoria e revisao.
4. Deploy Linux com `systemd` e Nginx.
5. Teste operacional com 70 lojas reais.
