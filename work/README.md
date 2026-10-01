# Escala Digital

Aplicacao web para gerar, consultar e salvar escalas diretamente em banco Oracle.

## Decisoes

- Backend em Node.js para reaproveitar as regras JavaScript sem reescrita em outra linguagem.
- Migracao gradual do frontend para React e TypeScript; a interface anterior permanece disponivel durante a transicao.
- Operacoes reais exigem Oracle; o treinamento React e uma simulacao de interface isolada do banco.
- Credenciais do Oracle somente por variaveis de ambiente.
- Login validado no backend, com senha armazenada como hash bcrypt.
- Regras de calculo isoladas em modulo proprio.

## Estrutura

```txt
work/
  public/
    css/app-original.css
    js/app-original.js
    js/escala-rules-core.js
    js/login.js
  src/
    config/env.js
    db/oracle.js
    middleware/
    routes/
    rules/escalaRules.js
    services/
    server.js
  docs/
```

## Setup local ou servidor

1. Instalar Node.js LTS.
2. Instalar Oracle Instant Client compativel com o servidor.
3. Criar `.env` com as variaveis obrigatorias:

```env
JWT_SECRET=troque-por-uma-chave-forte
ORACLE_USER=usuario_da_aplicacao
ORACLE_PASSWORD=senha_da_aplicacao
ORACLE_CONNECT_STRING=host:porta/service
PORT=3000
COOKIE_SECURE=false
TRUST_PROXY=false
RATE_LIMIT_API_MAX=1500
RATE_LIMIT_LOGIN_MAX=30
RM_API_ENABLED=false
RM_API_BASE_URL=https://rm.exemplo.local
RM_API_USER=usuario_rm
RM_API_PASSWORD=senha_rm
RM_API_TIMEOUT_MS=15000
RM_API_RETRIES=2
RM_API_FUNCIONARIO_PATH=/api/framework/v1/consultaSQLServer/RealizaConsulta/INTEG_ESCALA/0/P
RM_API_FOLGAS_PATH=/rmsrestdataserver/rest/PtoAdtTabFolgaData
RM_API_FOLGAS_POST_CODCOLIGADA=0
RM_API_FOLGA_HORA_INICIO=480
RM_API_FOLGA_HORA_FIM=720
RM_API_FOLGA_HORA_INICIO_STR=08:00
RM_API_FOLGA_HORA_FIM_STR=12:00
RM_API_TIMEZONE_OFFSET=-03:00
```

4. Instalar dependencias:

```bash
npm install
```

5. Compilar a interface React e iniciar:

```bash
npm run build:client
npm start
```

A listagem React fica em `/nova/escalas-liberadas`. O treinamento em `/nova/treinamento` usa dados ficticios: nao altera escalas reais nem chama a integracao RM, mas salva o progresso do exercicio no Oracle quando a migration correspondente esta presente. A edicao de escalas continua em `/app` ate sua migracao. O `Dockerfile` compila o React automaticamente. Para instalacao Linux sem Docker, execute `npm ci` e `npm run build:client` no diretorio `/opt/escala-app/work` antes de iniciar o servidor; nao use `npm ci --omit=dev` antes do build.

Para publicar a `main` mantendo `/nova` restrita a `murilo.jesus`, siga [o roteiro de deploy com allowlist](docs/deploy-main-canario-react.md). Configure `REACT_ALLOWED_LOGINS=murilo.jesus` no servidor e `REACT_DEFAULT_UI=true` para abrir a nova interface no login desse usuario. Sem allowlist, ninguem acessa `/nova`. O allowlist nao isola mudancas de backend ou banco.

6. Abrir:

```txt
http://localhost:3000/login.html
```

## Testes

Os testes automatizados mantidos nesta branch cobrem regras puras de calculo, sem simular banco.

```bash
npm test
```

## Smoke test de fluxo real

Com a aplicacao rodando, execute o smoke test de API para validar login, catalogos, criacao de escala, revisao individual, auditoria, oficializacao e inativacao:

```bash
npm run smoke:api
```

Por padrao, o teste usa `http://127.0.0.1:3000`, `admin/admin123`, loja `1` e mes `2028-01-01`. Ele grava uma escala de teste e inativa ao final, portanto fora de localhost exige liberacao explicita:

```bash
SMOKE_BASE_URL=http://servidor:3000 \
SMOKE_LOGIN=admin \
SMOKE_PASSWORD=senha \
SMOKE_LOJA_ID=1 \
SMOKE_MES_REF=2028-01-01 \
SMOKE_ALLOW_WRITE=true \
npm run smoke:api
```

Nao execute o smoke contra base produtiva sem escolher uma loja/mes de teste e sem alinhar previamente com a operacao.

Para validar a integracao real com Oracle, use o login da aplicacao e o diagnostico protegido:

```txt
/api/diagnostics/oracle
```

Para validar conectividade basica com o RM sem expor credenciais:

```txt
/api/diagnostics/rm
```

`/health` confirma somente que o processo HTTP responde; `/ready` confirma uma consulta simples ao Oracle e retorna 503 quando o banco nao esta disponivel.

## Roteiros do projeto

- [Escopo restante](docs/alteracoes-restantes.md)
- [Especificacao de desenvolvimento completo](docs/especificacao-desenvolvimento-completo.md)
- [Escopo de desenvolvimento Savegnago](docs/escopo-dev-savegnago.md)
- [Banco Oracle](docs/database.md)
- [Requisicoes de banco](docs/requisicoes-banco.md)
- [Seguranca](docs/security.md)
- [Deploy Linux via PuTTY](docs/deploy-linux-putty.md)
- [GitHub privado](docs/github-privado.md)

## Observacao sobre credenciais

A senha usada em qualquer print, chat ou documento deve ser tratada como exposta. Troque a senha do schema antes de conectar esta aplicacao ao banco real.

## Docker local

Para testar com Oracle local em Docker:

~~~powershell
cd "C:\Users\Murilo\Documents\Escala de Trabalho\work"
docker compose up --build
~~~

Acesse http://localhost:3000/login.html com admin / admin123.
Mais detalhes em docs/docker-local.md.

## Atualizacao de banco

Antes de subir a versao Linux em um banco ja existente, execute as migrations em `docker/oracle/migrations`, especialmente:

Rode `npm run migrations:check` no checkout antes de implantar. O comando compara nomes e SHA-256 das duas pastas versionadas; ele nao consulta o Oracle nem confirma quais migrations ja foram aplicadas naquele banco.
Depois de aplicar as migrations, execute `npm run db:check-schema` com as mesmas variaveis de conexao da aplicacao. O diagnostico apenas consulta metadados e falha se faltar parte do contrato Oracle essencial.

```txt
20260630_add_prog_ativa.sql
20260701_add_tipo_descanso_classificacao.sql
20260807_rm_rules_horarios.sql
20260810_add_funcionario_cpf.sql
20260810_add_permissoes_granulares.sql
20260826_usuario_loja_principal.sql
20260831_fixos_pre_geracao.sql
```

A migration `20260807_rm_rules_horarios.sql` adiciona horarios padrao, log de integracao RM e campos opcionais de turno oficial na escala mensal.
A migration `20260810_add_funcionario_cpf.sql` adiciona `SGN_ESC_FUNCIONARIO.CPF`, necessario para buscar o funcionario no RM durante a oficializacao.
A migration `20260810_add_permissoes_granulares.sql` adiciona permissoes opcionais para criar, oficializar, reprocessar RM e administrar perfis sem quebrar ambientes que ainda usam apenas visualizar/editar/inativar.
A migration `20260826_usuario_loja_principal.sql` adiciona a loja principal do usuario.
A migration `20260831_fixos_pre_geracao.sql` adiciona `SGN_ESC_FIXO_ESCALA` e `SGN_ESC_FIXO_ESCALA_SEQ`, necessarios para folgas e horarios fixos antes da geracao da escala por secao.
A migration `20260903_funcionario_subsecao.sql` adiciona o vinculo `SGN_ESC_FUNCIONARIO.ESCSUBSECAO_ID`, usado para alocar funcionarios nas subsecoes da Frente de Caixa.
A migration `20260929_pendencia_operacional_funcionario.sql` cria `SGN_ESC_PENDENCIA_FUNC` para suspensoes temporarias da escala sem alterar a data de demissao recebida do RM. Execute-a antes de publicar a versao de homologacao correspondente; sem ela, a liberacao, geracao e reset de escalas retornam erro de esquema pendente. O script e idempotente e existe em `db/migrations` e `docker/oracle/migrations`.
Execute tambem `20260929_eventos_escala.sql` antes de publicar a tela Alteracoes da Escala. Os salvamentos passam a gravar eventos na mesma transacao e falham se a tabela ainda nao existir. O historico legado permanece separado para consulta administrativa.
O registro `20260929_registro_migrations.sql` habilita `npm run migrations:status` para comparar SHA-256 dos scripts com o que foi confirmado neste banco. Migrations antigas aparecem como `SEM_REGISTRO` ate serem verificadas individualmente; isso nao significa que precisam ser reaplicadas. Depois de executar e conferir um script no banco, registre-o com `npm run migrations:record -- --name ARQUIVO.sql --confirm-applied --by OPERADOR`. Nunca use o registro como substituto da execucao do SQL.

Antes de publicar esta sprint de homologacao, aplique `20260930_treinamento_progresso.sql`, `20261001_evento_subsecao.sql` e `20261001_transferencia_subsecao_agendada.sql` nas duas pastas espelhadas. A coluna de evento e a tabela de transferencias sao usadas nas consultas de escala e de alteracoes, mesmo sem novas transferencias; publicar o codigo antes do SQL causa erro nessas telas. Rode `npm run migrations:check`, registre cada migration efetivamente aplicada e execute `npm run db:check-schema` com a conexao do servidor. No Docker local o worker de transferencias esta ativo; nos demais ambientes `ESCALA_TRANSFER_SCHEDULER_ENABLED` permanece falso por padrao e so deve ser habilitado depois da migration e da verificacao do schema. A fila registra vigencia, tentativas, meses regenerados e erro; `F` indica intervencao operacional, nao sucesso. Depois de corrigir a causa, Admin pode usar **Retomar** no modal do funcionario; os meses ja processados sao preservados. O worker atualiza o vinculo na vigencia e recalcula somente os dias futuros do funcionario; se uma escala estiver oficializada, sinaliza falha sem altera-la. Sem RM de homologacao com escrita, valide a fila RM apenas com rollback/simulacao e mantenha o envio externo fora do aceite desta sprint.

Antes de publicar a oficializacao por secao/subsecao, aplique nesta ordem `20260929_pendencias_envio_rm.sql` e `20260930_rm_envio_escopo_unique.sql`. A primeira cria `SGN_ESC_RM_ENVIO`; a segunda permite pendencias distintas para um colaborador transferido entre secoes. A oficializacao grava programacao, evento e pendencias na mesma transacao. Sem essas migrations a oficializacao falha e nao confirma parcialmente a escala. Confirme com `npm run db:check-schema` e, em ambiente local, `npm run smoke:rm-outbox` (o smoke usa rollback e nao chama o RM).

Na tela Integracao RM, `PENDENTE` indica que o envio ainda nao foi tentado, `PROCESSANDO` indica tentativa em andamento, `INCERTO` exige conferir o resultado no RM antes ou durante o reprocessamento, e `ENVIADO` confirma a conciliacao. O reprocessamento e por colaborador/pendencia; a consulta ao RM precede novas escritas. Se o processo parar durante uma tentativa, a linha `PROCESSANDO` pode ser reprocessada manualmente apos 30 minutos. Nao ha envio automatico de pendencias antigas no boot. Para examinar a fila sem enviar, use `npm run rm:processar-pendentes -- --loja 35 --limit 100`; `--apply` habilita envios reais e exige RM ativo. O comando processa somente `PENDENTE`; `INCERTO` e `PROCESSANDO` exigem conferencia manual. A escrita real no RM deve ser validada em ambiente de homologacao antes do deploy de producao; os testes locais cobrem Oracle e contratos, nao a API externa.

Na tela Funcionarios, Admin e RH podem registrar e encerrar uma suspensao com motivo, inicio, fim opcional e justificativa. Liberacao, geracao e reset omitem somente os dias do intervalo suspenso; ferias e afastamentos ja recebidos do RM prevalecem e continuam visiveis. Dias ja gravados nao sao apagados automaticamente ao registrar a pendencia, e a interface informa quantos dias de trabalho precisam de revisao. A conciliacao automatica encerra pendencias de transferencia/desligamento quando o cadastro local refletir o RM, ou quando o prazo terminar. A atualizacao de horario-base mostra o impacto em todos os meses futuros ainda editaveis e salva cadastro e escalas na mesma transacao, sem substituir dias manuais/protegidos. Se um mes estava oficializado, a nova revisao fica como rascunho e precisa ser oficializada novamente para criar uma pendencia RM atual; a interface mostra os meses afetados. O botao de atualizar lista recarrega o catalogo local; nao executa o job RM. A sincronizacao sob demanda nao esta disponivel sem contrato do job, e a inclusao temporaria de novos funcionarios foi descartada: aguarde o RM.

O GitHub Actions valida `npm ci`, paridade das migrations, sintaxe do servidor e testes em cada push para `main` ou `homologacao` e em pull requests. Esses checks nao substituem o smoke Oracle local nem a validacao de escrita no RM.

`/api/app-version` usa hash do conteudo de `src`, `public`, `views` e `package-lock.json`, independente do horario de copia dos arquivos. `APP_VERSION` continua disponivel para identificar explicitamente um release no deploy. Arquivos `.env` nao entram no hash.
