# Requisicoes de banco da aplicacao

Este mapa lista as chamadas HTTP usadas pela UI e as tabelas Oracle consultadas ou alteradas pelo backend.

## Autenticacao

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Login | `/api/auth/login` | `POST` | `authService.login` | Busca usuario por login, valida senha hash e carrega lojas permitidas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA` |
| Sessao atual | `/api/auth/me` | `GET` | `requireAuth` | Recarrega usuario ativo e lojas permitidas a partir do banco | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA` |
| Logout | `/api/auth/logout` | `POST` | rota Express | Limpa cookie; nao acessa banco | nenhuma |

## Catalogo operacional

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Select de lojas | `/api/catalog/lojas` | `GET` | `catalogService.listLojas` | Lista lojas e exigencia de brigadistas | `SGN_ESC_LOJA` |
| Tela Funcionarios | `/api/catalog/lojas/:lojaId/funcionarios` | `GET` | `catalogService.listFuncionariosByLoja` | Lista funcionarios da loja selecionada | `SGN_ESC_FUNCIONARIO` |
| Editar dados de escala do funcionario | `/api/catalog/lojas/:lojaId/funcionarios/:escfuncId` | `PATCH` | `catalogService.updateFuncionarioEscala` | Atualiza somente campos permitidos de escala | `SGN_ESC_FUNCIONARIO` |
| Ausencias do mes | `/api/catalog/lojas/:lojaId/ausencias?inicio=YYYY-MM-DD&fim=YYYY-MM-DD` | `GET` | `catalogService.listAusenciasByLojaMes` | Lista ausencias da loja no periodo | `SGN_ESC_AUSENCIA`, `SGN_ESC_FUNCIONARIO` |

## Escalas

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Consultar Banco Local/Oracle | `/api/escalas?lojaId=:lojaId&mesRef=:mesRef` | `GET` | `escalaService.listEscalas` | Lista cabecalhos de escala por loja e mes | `SGN_ESC_PROG`, `SGN_ESC_FUNCIONARIO` |
| Ver dias da escala salva | `/api/escalas/:escprogId/dias` | `GET` | `escalaService.getEscalaHeader` e `getEscalaDias` | Busca cabecalho, valida permissao de loja e lista dias | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Salvar escala gerada | `/api/escalas` | `POST` | `escalaService.validateAusencias` e `saveEscalasBatch` | Valida ausencia, calcula revisao, grava cabecalho e dias em transacao | `SGN_ESC_AUSENCIA`, `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |

## Controle de acesso

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Listar usuarios | `/api/acessos/usuarios` | `GET` | `accessService.listUsuariosAcesso` | Lista usuarios e agrega lojas vinculadas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA` |
| Criar usuario | `/api/acessos/usuarios` | `POST` | `accessService.createUsuarioAcesso` | Insere usuario com `SENHA_HASH` bcrypt e lojas permitidas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA`, `SGN_ESC_USUARIO_SEQ` |
| Editar usuario/perfil/status/lojas | `/api/acessos/usuarios/:usuarioId` | `PATCH` | `accessService.updateUsuarioAcesso` | Atualiza dados do usuario, apaga vinculos antigos e insere novas lojas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA` |

## Diagnostico

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas/views |
| --- | --- | --- | --- | --- | --- |
| Diagnostico Oracle | `/api/diagnostics/oracle` | `GET` | `diagnosticsService.checkOracle` | Confere schema atual, tabelas e sequences esperadas | `DUAL`, `USER_TABLES`, `USER_SEQUENCES` |

## Estado local de UI

| Tela/fluxo | Endpoint | Metodo | Observacao |
| --- | --- | --- | --- |
| Estado de tela | `/api/state` | `GET` | Em Oracle retorna estado vazio e mensagem de que a persistencia oficial fica em `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA`. |
| Escalas temporarias da UI | `/api/state/escalas` | `PUT` | Em Oracle nao persiste dados oficiais. |
| Configuracoes da UI | `/api/state/config` | `PUT` | Em Oracle nao persiste configuracao nesta versao. |

## Pontos de atencao identificados

- A pagina de funcionarios usa `/api/catalog/lojas/:lojaId/funcionarios`. Se a consulta falhar, agora a tabela mostra erro explicito em vez de parecer lista vazia.
- As lojas do usuario logado eram carregadas do JWT criado no login. Agora `requireAuth` recarrega usuario/perfil/lojas do banco em cada requisicao autenticada.
- Ao editar as lojas do proprio usuario na tela de acesso, a UI recarrega sessao, selects de loja e funcionarios da loja atual.
