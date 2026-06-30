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
| Tela Secoes | `/api/catalog/lojas/:lojaId/secoes` | `GET` | `catalogService.listSecoesByLoja` | Lista secoes da loja e seus horarios cadastrados | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO` |
| Criar secao | `/api/catalog/lojas/:lojaId/secoes` | `POST` | `catalogService.createSecao` | Insere secao e grava o turno padrao da secao | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO`, `SGN_ESC_SECAO_SEQ`, `SGN_ESC_SECAO_TURNO_SEQ` |
| Editar secao | `/api/catalog/lojas/:lojaId/secoes/:escsecaoId` | `PUT` | `catalogService.updateSecao` | Atualiza descricao/codigo da secao e o turno padrao | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO` |
| Editar turno da secao | `/api/catalog/lojas/:lojaId/secoes/:escsecaoId/turno` | `PATCH` | `catalogService.upsertSecaoTurno` | Atualiza ou cria o turno padrao usado na geracao de escala | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO`, `SGN_ESC_SECAO_TURNO_SEQ` |
| Ausencias do mes | `/api/catalog/lojas/:lojaId/ausencias?inicio=YYYY-MM-DD&fim=YYYY-MM-DD` | `GET` | `catalogService.listAusenciasByLojaMes` | Lista ausencias da loja no periodo | `SGN_ESC_AUSENCIA`, `SGN_ESC_FUNCIONARIO` |
| Tipos de descanso | `/api/catalog/tipos-descanso` | `GET` | `catalogService.listTiposDescanso` | Lista siglas de descanso ativas ou inativas | `SGN_ESC_TIPO_DESCANSO` |
| Criar tipo de descanso | `/api/catalog/tipos-descanso` | `POST` | `catalogService.createTipoDescanso` | Insere nova descricao/sigla de descanso | `SGN_ESC_TIPO_DESCANSO`, `SGN_ESC_TIPO_DESCANSO_SEQ` |
| Editar/inativar tipo de descanso | `/api/catalog/tipos-descanso/:tipoId` | `PATCH` | `catalogService.updateTipoDescanso` | Atualiza descricao, sigla ou status | `SGN_ESC_TIPO_DESCANSO` |

Observacao: quando `SGN_ESC_SECAO` nao possui coluna `LOJA`, o backend trata secoes como globais e usa `:lojaId` somente para permissao do usuario e contexto da tela.

## Escalas

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Consultar Banco Local/Oracle | `/api/escalas?lojaId=:lojaId&mesRef=:mesRef` | `GET` | `escalaService.listEscalas` | Lista cabecalhos de escala por loja e mes | `SGN_ESC_PROG`, `SGN_ESC_FUNCIONARIO` |
| Ver dias da escala salva | `/api/escalas/:escprogId/dias` | `GET` | `escalaService.getEscalaHeader` e `getEscalaDias` | Busca cabecalho, valida permissao de loja e lista dias | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Salvar escala gerada | `/api/escalas` | `POST` | `escalaService.validateAusencias` e `saveEscalasBatch` | Valida ausencia, calcula revisao, grava cabecalho e dias em transacao | `SGN_ESC_AUSENCIA`, `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Oficializar escala | `/api/escalas/oficializar` | `POST` | `escalaService.oficializarEscala` | Marca revisao mais recente como oficializada e registra auditoria | `SGN_ESC_PROG`, `SGN_ESC_AUDITORIA` |
| Inativar escala | `/api/escalas/inativar` | `POST` | `escalaService.inativarEscala` | Marca escala ativa como inativa e registra auditoria | `SGN_ESC_PROG`, `SGN_ESC_AUDITORIA` |
| Historico de alteracoes | `/api/escalas/historico` | `GET` | `escalaService.listHistoricoEscala` | Lista auditoria filtrada por loja/mes e permissoes | `SGN_ESC_AUDITORIA` |
| Editar escala individual | `/api/escalas/funcionario/revisao` | `POST` | `escalaService.saveEscalaFuncionarioRevision` | Cria nova revisao mensal, copia demais funcionarios e substitui o funcionario editado | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA`, `SGN_ESC_AUDITORIA` |

## Controle de acesso

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Listar usuarios | `/api/acessos/usuarios` | `GET` | `accessService.listUsuariosAcesso` | Lista usuarios e agrega lojas vinculadas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA` |
| Criar usuario | `/api/acessos/usuarios` | `POST` | `accessService.createUsuarioAcesso` | Insere usuario com `SENHA_HASH` bcrypt e lojas permitidas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA`, `SGN_ESC_USUARIO_SEQ` |
| Editar usuario/perfil/status/lojas | `/api/acessos/usuarios/:usuarioId` | `PATCH` | `accessService.updateUsuarioAcesso` | Atualiza dados do usuario, apaga vinculos antigos e insere novas lojas | `SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA` |
| Listar perfis | `/api/acessos/perfis` | `GET` | `accessService.listPerfisAcesso` | Lista perfis e permissoes por pagina | `SGN_ESC_PERFIL`, `SGN_ESC_PERFIL_PERMISSAO` |
| Criar perfil | `/api/acessos/perfis` | `POST` | `accessService.createPerfilAcesso` | Insere perfil e permissoes | `SGN_ESC_PERFIL`, `SGN_ESC_PERFIL_PERMISSAO`, `SGN_ESC_PERFIL_SEQ` |
| Editar/inativar perfil | `/api/acessos/perfis/:perfilId` | `PATCH` | `accessService.updatePerfilAcesso` | Atualiza nome, descricao, status e permissoes | `SGN_ESC_PERFIL`, `SGN_ESC_PERFIL_PERMISSAO` |

## Diagnostico

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas/views |
| --- | --- | --- | --- | --- | --- |
| Diagnostico Oracle | `/api/diagnostics/oracle` | `GET` | `diagnosticsService.checkOracle` | Confere schema atual, tabelas e sequences esperadas | `DUAL`, `USER_TABLES`, `USER_SEQUENCES` |

## Estado local de UI

| Tela/fluxo | Endpoint | Metodo | Observacao |
| --- | --- | --- | --- |
| Estado de tela | `/api/state` | `GET` | Em Oracle retorna estado vazio e mensagem de que a persistencia oficial fica em `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA`. |
| Escalas temporarias da UI | `/api/state/escalas` | `PUT` | Em Oracle nao persiste dados oficiais. |
| Configuracoes da UI | `/api/state/config` | `PUT` | Mantem parametros visuais/regras de tela; dados oficiais de escala seguem no Oracle. |

## Pontos de atencao identificados

- A pagina de funcionarios usa `/api/catalog/lojas/:lojaId/funcionarios`. Se a consulta falhar, agora a tabela mostra erro explicito em vez de parecer lista vazia.
- As lojas do usuario logado eram carregadas do JWT criado no login. Agora `requireAuth` recarrega usuario/perfil/lojas do banco em cada requisicao autenticada.
- Ao editar as lojas do proprio usuario na tela de acesso, a UI recarrega sessao, selects de loja e funcionarios da loja atual.
