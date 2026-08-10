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
| Tela Funcionarios | `/api/catalog/lojas/:lojaId/funcionarios?mesRef=YYYY-MM-DD` | `GET` | `catalogService.listFuncionariosByLoja` | Lista funcionarios da loja e, quando informado mes, sobrepoe horarios pela revisao mais recente da escala mensal | `SGN_ESC_FUNCIONARIO`, `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Tela Funcionarios - varias lojas | `/api/catalog/funcionarios?lojaId=all&mesRef=YYYY-MM-DD` | `GET` | `catalogService.listFuncionariosByLojas` | Lista funcionarios das lojas permitidas em uma unica chamada para evitar excesso de requisicoes | `SGN_ESC_FUNCIONARIO`, `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Editar dados de escala do funcionario | `/api/catalog/lojas/:lojaId/funcionarios/:escfuncId` | `PATCH` | `catalogService.updateFuncionarioEscala` | Atualiza somente campos permitidos de escala | `SGN_ESC_FUNCIONARIO` |
| Tela Secoes | `/api/catalog/lojas/:lojaId/secoes` | `GET` | `catalogService.listSecoesByLoja` | Lista secoes da loja e seus horarios cadastrados | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO` |
| Tela Secoes - varias lojas | `/api/catalog/secoes?lojaId=all` | `GET` | `catalogService.listSecoesByLojas` | Lista secoes das lojas permitidas em uma unica chamada | `SGN_ESC_SECAO` |
| Criar secao | `/api/catalog/lojas/:lojaId/secoes` | `POST` | `catalogService.createSecao` | Insere secao e grava o turno padrao da secao | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO`, `SGN_ESC_SECAO_SEQ`, `SGN_ESC_SECAO_TURNO_SEQ` |
| Editar secao | `/api/catalog/lojas/:lojaId/secoes/:escsecaoId` | `PUT` | `catalogService.updateSecao` | Atualiza descricao/codigo da secao e o turno padrao | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO` |
| Turnos por secao - varias lojas | `/api/catalog/turnos-secao?lojaId=all` | `GET` | `catalogService.listTurnosByLojas` | Lista turnos das lojas permitidas em uma unica chamada | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO` |
| Criar/editar turno da secao | `/api/catalog/lojas/:lojaId/turnos-secao` ou `/api/catalog/lojas/:lojaId/turnos-secao/:id` | `POST`/`PUT` | `catalogService.saveSecaoTurno` | Valida jornada 08:48, intervalo minimo 01:10 e periodos menores que 06:00 antes de gravar | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO`, `SGN_ESC_SECAO_TURNO_SEQ` |
| Editar turno da secao legado | `/api/catalog/lojas/:lojaId/secoes/:escsecaoId/turno` | `PATCH` | `catalogService.saveSecaoTurno` | Atualiza ou cria turno usado na geracao de escala com a mesma validacao de horarios | `SGN_ESC_SECAO`, `SGN_ESC_SECAO_TURNO`, `SGN_ESC_SECAO_TURNO_SEQ` |
| Ausencias do mes | `/api/catalog/lojas/:lojaId/ausencias?inicio=YYYY-MM-DD&fim=YYYY-MM-DD` | `GET` | `catalogService.listAusenciasByLojaMes` | Lista ausencias da loja no periodo | `SGN_ESC_AUSENCIA`, `SGN_ESC_FUNCIONARIO` |
| Tipos de descanso | `/api/catalog/tipos-descanso` | `GET` | `catalogService.listTiposDescanso` | Lista siglas de descanso ativas ou inativas | `SGN_ESC_TIPO_DESCANSO` |
| Criar tipo de descanso | `/api/catalog/tipos-descanso` | `POST` | `catalogService.createTipoDescanso` | Insere nova descricao/sigla de descanso | `SGN_ESC_TIPO_DESCANSO`, `SGN_ESC_TIPO_DESCANSO_SEQ` |
| Editar/inativar tipo de descanso | `/api/catalog/tipos-descanso/:tipoId` | `PATCH` | `catalogService.updateTipoDescanso` | Atualiza descricao, sigla ou status | `SGN_ESC_TIPO_DESCANSO` |
| Horarios padrao | `/api/catalog/horarios-padrao` | `GET` | `catalogService.listHorariosPadrao` | Lista jornadas padrao para ajuste manual | `SGN_ESC_HORARIO_PADRAO` |
| Criar horario padrao | `/api/catalog/horarios-padrao` | `POST` | `catalogService.createHorarioPadrao` | Insere horario padrao, validado na UI como jornada 08:48 e intervalo 1:10 | `SGN_ESC_HORARIO_PADRAO`, `SGN_ESC_HORARIO_PADRAO_SEQ` |
| Editar/inativar horario padrao | `/api/catalog/horarios-padrao/:horarioId` | `PATCH` | `catalogService.updateHorarioPadrao` | Atualiza horario padrao ou status | `SGN_ESC_HORARIO_PADRAO` |

Observacao: quando `SGN_ESC_SECAO` nao possui coluna `LOJA`, o backend trata secoes como globais e usa `:lojaId` somente para permissao do usuario e contexto da tela.

## Escalas

| Tela/fluxo | Endpoint | Metodo | Servico | Operacao no banco | Tabelas |
| --- | --- | --- | --- | --- | --- |
| Consultar Banco Local/Oracle | `/api/escalas?lojaId=:lojaId&mesRef=:mesRef` | `GET` | `escalaService.listEscalas` | Lista cabecalhos de escala por loja e mes | `SGN_ESC_PROG`, `SGN_ESC_FUNCIONARIO` |
| Regras vigentes | `/api/escalas/regras` | `GET` | `escalaRules.REGRAS_VIGENTES` | Lista regras exibidas na tela de regras | nenhuma |
| Escalas por funcionario - varias lojas | `/api/escalas/mensal-lote?lojaId=all&mesRef=YYYY-MM-DD` | `GET` | `escalaService.getEscalaMensal` | Carrega escalas mensais das lojas permitidas em uma unica chamada HTTP | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA`, `SGN_ESC_FUNCIONARIO`, `SGN_ESC_SECAO`, `SGN_ESC_FUNCAO` |
| Ver dias da escala salva | `/api/escalas/:escprogId/dias` | `GET` | `escalaService.getEscalaHeader` e `getEscalaDias` | Busca cabecalho, valida permissao de loja e lista dias | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Salvar escala gerada | `/api/escalas` | `POST` | `escalaService.validateAusencias` e `saveEscalasBatch` | Valida ausencia, calcula revisao, grava cabecalho, turno oficial inicial e dias em transacao | `SGN_ESC_AUSENCIA`, `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA` |
| Oficializar escala | `/api/escalas/oficializar` | `POST` | `escalaService.oficializarEscala`, `rmIntegrationService.oficializarNoRm` | Marca revisao mais recente como oficializada, busca funcionario no RM pelo CPF, compara folgas/ferias do periodo, envia ajustes quando habilitado e registra auditoria/log | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA`, `SGN_ESC_FUNCIONARIO`, `SGN_ESC_AUDITORIA`, `SGN_ESC_RM_LOG` |
| Inativar escala | `/api/escalas/inativar` | `POST` | `escalaService.inativarEscala` | Marca escala ativa como inativa e registra auditoria | `SGN_ESC_PROG`, `SGN_ESC_AUDITORIA` |
| Historico de alteracoes | `/api/escalas/historico` | `GET` | `escalaService.listHistoricoEscala` | Lista auditoria filtrada por loja/mes e permissoes | `SGN_ESC_AUDITORIA` |
| Editar escala individual | `/api/escalas/funcionario/revisao` | `POST` | `escalaService.saveEscalaFuncionarioRevision` | Cria nova revisao mensal, copia demais funcionarios e substitui o funcionario editado | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA`, `SGN_ESC_AUDITORIA` |
| Logs RM | `/api/escalas/rm/logs?lojaId=:lojaId&mesRef=:mesRef` | `GET` | `rmIntegrationService.listRmLogs` | Lista envio, falha ou ignorado da integracao RM | `SGN_ESC_RM_LOG` |
| Reprocessar RM | `/api/escalas/rm/reprocessar` | `POST` | `rmIntegrationService.oficializarNoRm` | Reenvia folgas/ferias da escala oficializada para o RM. Requer `SGN_ESC_FUNCIONARIO.CPF` preenchido para cada funcionario enviado | `SGN_ESC_PROG`, `SGN_ESC_PROG_DIA`, `SGN_ESC_FUNCIONARIO`, `SGN_ESC_RM_LOG`, `SGN_ESC_AUDITORIA` |

Fluxo externo RM usado pela oficializacao/reprocessamento:

- `GET /api/framework/v1/consultaSQLServer/RealizaConsulta/INTEG_ESCALA/0/P?parameters=CPF%3D...`: busca dados do funcionario por CPF e le `CODCOLIGADA`/`CODTABFOLGA`.
- `GET /rmsrestdataserver/rest/PtoAdtTabFolgaData?filter=...`: consulta folgas existentes por `CODTABFOLGA` e periodo.
- `DELETE /rmsrestdataserver/rest/PtoAdtTabFolgaData/{CODCOLIGADA}$_${CODTABFOLGA}$_${DATA}$_${HORAINICIO}`: remove folgas que nao existem mais na escala.
- `POST /rmsrestdataserver/rest/PtoAdtTabFolgaData?codcoligada=0`: envia novas folgas em array no formato esperado pelo RM.

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
| Diagnostico RM | `/api/diagnostics/rm` | `GET` | `diagnosticsService.checkRm` | Testa conectividade HTTP basica com a URL RM configurada, sem expor credenciais | Nao acessa Oracle |

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
