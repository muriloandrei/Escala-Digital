# Migracao da versao nova para Oracle Linux

Data da conferencia: 05/10/2026. Este roteiro considera o repositorio em `/opt/escala-app`, a aplicacao Node em `/opt/escala-app/work`, o servico `escala-app` e o Oracle usado pela aplicacao. Confirme esses caminhos no servidor; nao execute comandos a partir de `/opt/escala-app` esperando encontrar ali o `package.json`.

## Estado da entrega

**O ultimo lote foi publicado em `origin/homologacao` no commit `01dfbe9`**, incluindo o destaque do tour com Driver.js, treinamento obrigatorio no primeiro acesso, feriados nacionais na escala, logos transparentes e a liberacao React para `murilo.jesus` e `admin`. Na conferencia, `origin/main` ainda estava em `2b8b402`: um `git pull` da `main` no servidor **nao** entrega esse lote.

Antes da janela de migracao, homologar o commit candidato e registrar o SHA aprovado. Depois, promover **esse mesmo SHA** para `main` pelo fluxo Git da equipe e confirmar que `origin/main` aponta para ele. Nao implantar uma mistura de SQL de um commit e codigo de outro. Este documento acompanha a `homologacao`.

O allowlist restringe **as telas React**, nao as APIs, migrations ou regras de escala. O treinamento obrigatorio atinge todos os usuarios autenticados uma vez no primeiro acesso, inclusive os que depois voltam para `/app`. Planeje a comunicacao antes de publicar na `main`.

## 1. Preparacao e seguranca

1. Reserve uma janela de manutencao. Tire snapshot/backup recuperavel do schema Oracle e registre como restaurar o banco. Registre o SHA e a configuracao atuais do servico.
2. Confirme o usuario dono do schema, o connect string, o caminho real da `.env`, o servico e o checkout. Nao coloque senha Oracle na linha de comando nem no historico do shell.
3. Confira o estado real do servidor. Se houver alteracoes locais, pare e investigue; nao use `reset --hard` para liberar o deploy.

```bash
cd /opt/escala-app/work
pwd
test -f package.json
git rev-parse --show-toplevel
git status --short --branch
git rev-parse HEAD
systemctl cat escala-app
```

O `WorkingDirectory` do servico deve ser `/opt/escala-app/work`; `ExecStart` deve executar `work/src/server.js` ou `npm start` a partir de `work`. Confirme `EnvironmentFile=/opt/escala-app/.env` ou `ESCALA_ENV_FILE=/opt/escala-app/.env`. Nao substitua a `.env` existente e nao copie segredos para o Git.

Depois da promocao para `main`, buscar o commit aprovado e preparar um worktree temporario **sem tocar no checkout em execucao**:

```bash
APP_ROOT=$(git rev-parse --show-toplevel)
git -C "$APP_ROOT" fetch origin
git -C "$APP_ROOT" status --short
git -C "$APP_ROOT" log --oneline origin/main..origin/homologacao
git -C "$APP_ROOT" log --oneline origin/homologacao..origin/main
SHA=$(git -C "$APP_ROOT" rev-parse origin/main)
printf 'Commit candidato: %s\n' "$SHA"
STAGE=/tmp/escala-deploy-${SHA:0:12}
git -C "$APP_ROOT" worktree add --detach "$STAGE" "$SHA"
cd "$STAGE/work"
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
```

Confirme que `SHA` e o commit homologado; se os historicos divergirem ou qualquer teste falhar, nao prossiga. O build precisa das devDependencies (`vite`/`typescript`), portanto **nao** use `npm ci --omit=dev` antes dele. `migrations:check` deve informar que as duas pastas de SQL sao identicas (33 arquivos neste checkout).

## 2. Oracle: nove migrations novas

Estas sao as migrations presentes na `homologacao` e ausentes da `main` da conferencia. A lista **nao** substitui a verificacao das migrations antigas: compare o schema e os registros de implantacoes anteriores. `SEM_REGISTRO` no ledger nao prova que um SQL antigo nunca foi executado. Nunca reaplique todo o diretorio cegamente.

| Ordem | Arquivo em `work/db/migrations/` | Efeito principal |
| --- | --- | --- |
| 1 | `20260929_registro_migrations.sql` | Ledger `SGN_ESC_MIGRACAO` |
| 2 | `20260929_pendencia_operacional_funcionario.sql` | Pendencias de funcionario |
| 3 | `20260929_eventos_escala.sql` | Eventos/auditoria operacional |
| 4 | `20260929_pendencias_envio_rm.sql` | Fila de envio RM |
| 5 | `20260930_rm_envio_escopo_unique.sql` | Unicidade por secao na fila RM |
| 6 | `20260930_treinamento_progresso.sql` | Progresso do treinamento |
| 7 | `20261001_evento_subsecao.sql` | Subsecoes nos eventos |
| 8 | `20261001_treinamento_tour_v2.sql` | Etapas 0 a 12 do tour |
| 9 | `20261001_transferencia_subsecao_agendada.sql` | Fila de transferencias agendadas |

Para a migration 5, depois de aplicar a 4 e **antes** de criar a nova restricao, investigue duplicatas:

```sql
select loja, mes_ref, escsecao_id, escfunc_id, revisao, count(*) as total
  from sgn_esc_rm_envio
 group by loja, mes_ref, escsecao_id, escfunc_id, revisao
having count(*) > 1;
```

Nao remova duplicatas automaticamente; avalie os envios e preserve a auditoria. Abra `sqlplus /nolog`, use `connect USUARIO@HOST:PORTA/SERVICO` para informar a senha no prompt e configure:

```sql
whenever oserror exit failure
whenever sqlerror exit sql.sqlcode
set echo on
```

Execute **um arquivo por vez**, na ordem da tabela, com `@/tmp/escala-deploy-<SHA_CURTO>/work/db/migrations/NOME.sql`, conferindo a saida. Pare no primeiro erro. Os comandos `@` usam o caminho absoluto real mostrado por `$STAGE`; nao digite os sinais `< >`. SQL*Plus sai ao encontrar erro SQL/PLSQL com `whenever sqlerror`. DDL Oracle pode fazer commit implicito: nao conte com `rollback` da sessao para desfazer uma falha parcial.

Depois de confirmar cada SQL aplicado, no shell, dentro de `$STAGE/work`, registre a evidencia correspondente (o registro **nao executa** o SQL):

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260929_registro_migrations.sql --confirm-applied --by OPERADOR
```

Repita `migrations:record` com o nome de cada uma das outras oito migrations **somente apos** confirmar a respectiva execucao. Se uma migration ja foi aplicada anteriormente, verifique o objeto/dado e reconcilie o ledger antes de registra-la; nao use `--confirm-applied` como tentativa de execucao. O comando `migrations:status` retorna erro enquanto houver arquivos antigos sem registro ou checksum divergente; trate cada caso, sem considerar isso prova de migration ausente.

```bash
ESCALA_ENV_FILE=/opt/escala-app/.env npm run db:check-schema
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:status
```

`db:check-schema` verifica o contrato estrutural essencial; nao valida todos os dados nem substitui a conferencia de cada SQL. Nao inicie o codigo novo antes de ele passar. As migrations de treinamento sao obrigatorias para o login desta versao: sem `SGN_ESC_TREINAMENTO` o login retorna 503.

## 3. Configuracao da aplicacao

Na `/opt/escala-app/.env`, mantendo as configuracoes Oracle, JWT, cookie, proxy e RM ja existentes, inclua ou confira:

```env
REACT_DEFAULT_UI=true
REACT_ALLOWED_LOGINS=murilo.jesus,admin
ESCALA_TRANSFER_SCHEDULER_ENABLED=false
```

O worker de transferencias fica desativado nesta primeira publicacao; habilite-o em uma janela operacional posterior, apos validar schema, filas e tratamento de falhas. Nao altere `RM_API_ENABLED` apenas para este deploy: nao existe RM de homologacao com escrita para testar oficializacao real. Validacoes de fila RM devem ser sem envio externo. Confirme que `murilo.jesus` e `admin` existem e estao ativos **no Oracle de producao**; o banco Docker local da conferencia nao continha `murilo.jesus` e por isso o preflight local falhou, apesar de a configuracao permitir o login.

Com o build no stage e as migrations aplicadas, execute:

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run rollout:check-ui -- murilo.jesus,admin
```

Esse preflight exige o build React presente, allowlist **exclusiva** e ambas as contas ativas. Se falhar, nao troque o codigo do servico. Se `EnvironmentFile` do systemd tiver sintaxe diferente da consumida por `dotenv`, confira que os valores efetivos nos dois contextos coincidem.

## 4. Troca do codigo, sem Docker

Somente com checkout de producao limpo, SQL e preflight aprovados, pare o servico, mude para o **mesmo SHA** testado e instale/compile no diretorio servido:

```bash
sudo systemctl stop escala-app
git -C "$APP_ROOT" switch --detach "$SHA"
cd "$APP_ROOT/work"
npm ci
npm run build:client
sudo systemctl start escala-app
sudo systemctl status escala-app --no-pager
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/ready
```

Se o servico roda como outro usuario Linux, execute Git/npm com o **usuario dono do checkout**, sem mudar permissoes indiscriminadamente. Se `git switch` acusar alteracoes locais, nao force a troca. `/health` so confirma HTTP; `/ready` tambem consulta Oracle. Veja erros com `journalctl -u escala-app -n 200 --no-pager`.

## 5. Aceite e retorno

- Entrar com `murilo.jesus` e `admin`: antes da conclusao, abrir `/nova/treinamento`; depois, acessar `/nova/escalas-liberadas` e as demais telas React.
- Entrar com usuario fora do allowlist: concluir o tour uma vez e retornar a `/app`; telas React fora do treinamento devem continuar bloqueadas.
- Conferir listagem/leitura de escalas e horarios existentes, sem gerar ou oficializar uma escala real apenas para smoke test. Conferir feriados e menus de escala em uma conta canario. Registrar erros com `requestId` e logs.
- Validar que nenhum processo inesperado de envio RM ou transferencia agendada foi ativado. Monitorar logs, Oracle e filas apos a publicacao.

Para fechar so as telas React novas, esvazie `REACT_ALLOWED_LOGINS` e reinicie o servico. Isso **nao** desativa regras novas, APIs nem o treinamento obrigatorio. Para voltar o backend, implante o SHA anterior com procedimento controlado; isso tambem **nao reverte** migrations ou dados Oracle. Qualquer retorno integral depende do backup e do plano de restauracao aprovado. Nao rode SQLs de `DROP` improvisados.

## Referencias

- `docs/deploy-main-canario-react.md`: contexto do rollout com allowlist.
- `scripts/check-react-rollout.js`, `scripts/check-schema.js`, `scripts/migration-ledger.js`: verificacoes e registro.
- `db/migrations/`: fonte canonica dos SQLs; `docker/oracle/migrations/` deve ser espelho identico.
