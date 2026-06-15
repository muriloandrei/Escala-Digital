# Escopo restante do projeto

## Estado atual

Concluido:

- Backend Node.js/Express criado.
- Frontend separado em HTML, CSS e JavaScript.
- Login local em modo mock.
- Consulta mock de lojas, funcionarios, ausencias e usuarios.
- Tela de funcionarios por loja.
- Tela de usuarios/acessos.
- Salvamento estruturado no mock em `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA`.
- Consulta das escalas salvas no banco local mock.
- Sincronizacao das escalas salvas da UI para o banco local mock.
- Validacao de ausencia no backend antes de salvar.
- Aplicacao de ausencia/férias como folga obrigatoria no frontend.
- Regras principais isoladas em `public/js/escala-rules-core.js`.
- Testes automatizados com `npm test`.
- Documentacao inicial de banco, seguranca, deploy e GitHub privado.
- Branch `codex/oracle-integration` criada para integracao Oracle.
- Diagnostico protegido `/api/diagnostics/oracle` criado para deploy.
- `/api/state` ajustado para nao bloquear a UI em `DB_DRIVER=oracle`.
- Salvamento Oracle preparado para transacao unica e revisao automatica por funcionario/mes.
- Escopo de desenvolvimento Savegnago extraido para `docs/escopo-dev-savegnago.md`.
- Massa mock grande criada com 70 lojas, 560 funcionarios, funcoes, secoes, usuarios e ausencias variadas.
- Script `npm run mock:seed-large` criado para recriar a massa grande sem editar JSON manualmente.

## Fase 1. Fechar simulacao local

1. Testar performance da UI com volume parecido com o real.
2. Corrigir textos com acentuacao quebrada herdados do arquivo original.
3. Remover ou empacotar dependencias via CDN se a rede interna nao tiver internet.

## Fase 2. Fechar regras de escala

1. Documentar formalmente as regras aceitas:
   - 5x2.
   - domingo 2x1.
   - maximo de dias consecutivos.
   - intervalo minimo/maximo.
   - ausencia/férias como folga obrigatoria.
   - brigadista exigido por loja/dia.
2. Criar testes de regressao para cada regra.
3. Criar teste com ausencia atravessando varios dias.
4. Criar teste com escala de mais funcionarios que o cadastro da loja.
5. Definir comportamento quando a regra nao conseguir montar escala valida automaticamente.

## Fase 3. Oracle real

1. Confirmar nomes finais das tabelas, sequences, triggers e constraints.
2. Confirmar se `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA` aceitam o modelo atual.
3. Ajustar SQLs do backend para o padrao real do banco. Iniciado na branch `codex/oracle-integration`.
4. Criar tabela real de usuarios:
   - `SGN_ESC_USUARIO`.
   - `SGN_ESC_USUARIO_LOJA`.
5. Criar ou validar tabela de auditoria:
   - `SGN_ESC_AUDITORIA`.
6. Instalar Oracle Instant Client na maquina local para teste real.
7. Testar `DB_DRIVER=oracle` em ambiente controlado usando `/api/diagnostics/oracle`.
8. Validar timezone e campos `DATE`.
9. Validar transacao: cabecalho e dias devem gravar juntos ou falhar juntos.

## Fase 4. Autenticacao e autorizacao

1. Trocar credencial do schema que apareceu em print/conversa.
2. Criar usuario Oracle exclusivo da aplicacao com permissoes minimas.
3. Gravar senha de usuario como hash bcrypt.
4. Criar tela administrativa para:
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
2. Garantir que a aplicacao nunca carregue todas as lojas sem filtro.
3. Criar paginacao nas telas administrativas.
4. Criar monitoramento de erro.
5. Criar rotina de backup/restore.
6. Fazer teste com massa simulada de 70 lojas.

## Prioridade recomendada

1. GitHub privado e limpeza de arquivos sensiveis.
2. Massa mock maior e testes de regra.
3. Ajuste Oracle real.
4. Usuarios/perfis reais no Oracle.
5. Auditoria e revisao.
6. Deploy Linux com `systemd` e Nginx.
7. Teste operacional com 70 lojas.
