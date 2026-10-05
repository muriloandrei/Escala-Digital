# Implantacao da versao nova no Oracle Linux

Este roteiro e para o servidor **sem Docker**. Ele supoe que o repositorio Git esta em `/opt/escala-app`, que o `package.json` fica em `/opt/escala-app/work`, que a configuracao fica em `/opt/escala-app/.env` e que o servico systemd se chama `escala-app`. **Confirme esses quatro dados antes de executar qualquer alteracao.** Os comandos de shell sao para Bash; os blocos marcados `sql` sao digitados dentro do SQL*Plus, nunca no shell.

Na conferencia inicial de 05/10/2026, as mudancas de codigo foram publicadas em `homologacao` a partir do commit `01dfbe9`; `main` ainda estava em `2b8b402`. O SHA final da `homologacao` pode avancar quando este documento for atualizado. **O servidor de producao deve receber apenas o SHA aprovado e promovido para `main`.** Nao interprete a existencia do commit na `homologacao` como implantacao concluida.

O pacote inclui interface React, tour guiado com Driver.js, treinamento obrigatorio uma vez por usuario, logos transparentes, tratamento de feriados nacionais fixos e as demais alteracoes acumuladas na `homologacao`. O allowlist limita **somente as telas React** a `murilo.jesus` e `admin`; APIs, banco e regras novas afetam todos. Usuarios fora da lista tambem precisam terminar o treinamento antes de usar `/app`. Avise as lojas antes da janela. Feriados estaduais, municipais e moveis nao fazem parte da lista nacional fixa desta entrega.

## 1. Aprovar a versao no Git

**Onde:** seu computador ou fluxo de PR da equipe; ainda nao no servidor.

1. Homologue a versao da branch `homologacao` e aprove um commit completo, incluindo codigo, `package-lock.json` e `db/migrations`.
2. Promova esse commit para `main` pelo fluxo de PR/merge da equipe. Se `main` tiver commits novos ou conflito, resolva e homologue novamente; nao misture SQL de uma revisao com codigo de outra.
3. Anote o **SHA completo** que ficou em `main`. Ele sera colado no passo 3 como `SHA_ESPERADO`. A implantacao para aqui se a promocao ainda nao ocorreu.

Para conferir remotamente, sem baixar ou implantar nada:

```bash
git ls-remote origin refs/heads/main refs/heads/homologacao
```

O comando acima exige um clone Git configurado com `origin`. Se os SHAs diferirem, isso pode ser normal enquanto a `homologacao` contem trabalho posterior, mas o SHA escolhido para implantacao precisa estar em `main`.

## 2. Conferir o servidor e o backup

**Onde:** SSH/PuTTY no Oracle Linux. Nao rode `npm` ainda. Mantenha a mesma sessao de shell para preservar as variaveis definidas abaixo; se reconectar, redefina-as.

```bash
cd /opt/escala-app/work
pwd
test -f package.json
APP_ROOT=$(git rev-parse --show-toplevel)
printf 'Repositorio: %s\n' "$APP_ROOT"
git status --short --branch
SHA_ANTERIOR=$(git rev-parse HEAD)
printf 'Versao atual: %s\n' "$SHA_ANTERIOR"
systemctl cat escala-app
node -v
npm -v
sqlplus -v
```

**Confirme antes de continuar:** `pwd` termina em `/opt/escala-app/work`; `APP_ROOT` e `/opt/escala-app`; `git status` nao mostra alteracoes no checkout servido; o servico aponta para `work` (`WorkingDirectory=/opt/escala-app/work` e `ExecStart` para `npm start` ou `work/src/server.js`); SQL*Plus e Node estao disponiveis. O Vite deste pacote exige Node `^20.19.0` ou `>=22.12.0`; se a versao instalada for anterior, atualize o runtime de forma controlada antes do passo 4. Se algum ponto nao corresponder, ajuste o roteiro ao layout real antes de rodar Git ou SQL. Nao use `git reset --hard` para limpar o checkout. Guarde `SHA_ANTERIOR` no registro da mudanca, pois a variavel some ao fechar o SSH.

**Backup obrigatorio:** o DBA deve confirmar um snapshot/backup recuperavel do schema Oracle, com procedimento de restauracao e horario registrados. A forma de backup depende da instalacao Oracle, por isso nao ha um comando RMAN universal aqui. Preserve tambem uma copia restrita da `.env` e confirme a reversao do servico. **Nao aplique migrations sem backup confirmado.** DDL Oracle pode fazer commit implicito; `rollback` no SQL*Plus nao desfaz uma migration estrutural.

## 3. Buscar e conferir o SHA aprovado

**Onde:** mesmo SSH, ainda sem interromper a aplicacao. Substitua o valor da primeira linha pelo SHA completo aprovado no passo 1.

```bash
SHA_ESPERADO=COLE_AQUI_O_SHA_COMPLETO_APROVADO
git -C "$APP_ROOT" fetch origin
SHA=$(git -C "$APP_ROOT" rev-parse origin/main)
printf 'main no servidor: %s\nSHA aprovado: %s\n' "$SHA" "$SHA_ESPERADO"
test "$SHA" = "$SHA_ESPERADO"
git -C "$APP_ROOT" status --short
```

**Resultado esperado:** `test` retorna codigo 0 e `git status --short` nao mostra arquivos. Se o SHA nao bater, ou houver arquivos modificados/nao rastreados no checkout de producao, **pare** e investigue. `git fetch` nao instala a versao; apenas atualiza as referencias remotas.

## 4. Preparar e testar sem tocar no servico

Crie um worktree temporario fora de `/opt/escala-app`. Ele permite testar e acessar os SQLs da **mesma revisao** enquanto a aplicacao antiga continua rodando.

```bash
STAGE=/tmp/escala-deploy-${SHA:0:12}
git -C "$APP_ROOT" worktree add --detach "$STAGE" "$SHA"
cd "$STAGE/work"
pwd
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
```

**Resultado esperado:** todos os comandos terminam com codigo 0; `npm test` passa; `migrations:check` confirma as duas pastas espelhadas (33 SQLs neste pacote). Se o diretorio `$STAGE` ja existir ou um teste falhar, **pare** e investigue. Nao use `npm ci --omit=dev` antes do build: Vite e TypeScript estao nas devDependencies. Nenhum desses comandos deve alterar o banco de producao.

## 5. Configurar o acesso antes de trocar o codigo

Edite **somente** a `.env` do servidor, mantendo os valores existentes de Oracle, JWT, cookie, proxy e RM. Use o editor autorizado para o usuario dono do arquivo (por exemplo `vi /opt/escala-app/.env`); nao imprima a `.env` inteira em logs ou tickets. Deixe exatamente estas entradas, sem duplicatas:

```env
REACT_DEFAULT_UI=true
REACT_ALLOWED_LOGINS=murilo.jesus,admin
ESCALA_TRANSFER_SCHEDULER_ENABLED=false
```

Confira apenas as tres chaves nao secretas:

```bash
grep -E '^(REACT_DEFAULT_UI|REACT_ALLOWED_LOGINS|ESCALA_TRANSFER_SCHEDULER_ENABLED)=' /opt/escala-app/.env
```

**Resultado esperado:** tres linhas, com esses valores. O worker de transferencias fica desligado nesta primeira publicacao; habilite-o apenas em outra janela, depois de validar a fila. Nao altere `RM_API_ENABLED` so para este deploy e nao faca envio de teste ao RM real: nao existe RM de homologacao com escrita. A `.env` sera relida no reinicio do servico. Se systemd carrega as variaveis por `EnvironmentFile`, confirme que ele aponta para a mesma configuracao; para os comandos manuais abaixo usamos `ESCALA_ENV_FILE` explicitamente.

## 6. Aplicar as migrations Oracle

**Onde:** o mesmo SSH, dentro de `$STAGE/work`. Use no SQL*Plus o **usuario dono do schema que a aplicacao acessa**. Nao passe senha em argumento de shell (`usuario/senha@servico`): `connect USUARIO@HOST:PORTA/SERVICO` solicita a senha sem registra-la no historico. Ajuste host, porta e servico para os valores da sua conexao.

Estas nove migrations estao na versao nova e nao estavam na `main` da conferencia. Se o servidor estiver em revisao anterior ou tiver SQLs aplicados manualmente, confronte o inventario real do schema com o historico antes de prosseguir. Migration sem registro **nao** significa automaticamente objeto ausente; nao execute o diretorio inteiro cegamente.

### 6.1 Executar SQLs 1 a 4

No **shell**, confirme o diretorio e abra o SQL*Plus:

```bash
cd "$STAGE/work"
ls db/migrations/20260929*.sql
sqlplus -L /nolog
```

Agora, no prompt do **SQL*Plus**, digite as linhas abaixo. O `connect` pedira a senha. `select user` deve mostrar o dono do schema esperado e `select table_name` deve encontrar as tabelas base; caso contrario, pare. Configure a saida em erro antes dos arquivos:

```sql
connect USUARIO@HOST:PORTA/SERVICO
whenever oserror exit failure
whenever sqlerror exit sql.sqlcode
select user from dual;
select table_name from user_tables where table_name in ('SGN_ESC_PROG', 'SGN_ESC_FUNCIONARIO');
@db/migrations/20260929_registro_migrations.sql
@db/migrations/20260929_pendencia_operacional_funcionario.sql
@db/migrations/20260929_eventos_escala.sql
@db/migrations/20260929_pendencias_envio_rm.sql
exit
```

**Resultado esperado:** cada bloco PL/SQL termina com sucesso; nenhum `ORA-`, `PLS-` ou `SP2-` aparece. O `whenever sqlerror` encerra a sessao em erro SQL, mas examine a saida tambem para erros do cliente SQL*Plus. Se falhar no arquivo N, **nao** rode N+1; investigue o estado parcial com o DBA. Registre somente arquivos comprovadamente aplicados.

### 6.2 Conferir duplicatas antes do SQL 5

Abra outra sessao a partir do **mesmo** `$STAGE/work`:

```bash
cd "$STAGE/work"
sqlplus -L /nolog
```

No SQL*Plus:

```sql
connect USUARIO@HOST:PORTA/SERVICO
select loja, mes_ref, escsecao_id, escfunc_id, revisao, count(*) as total
  from sgn_esc_rm_envio
 group by loja, mes_ref, escsecao_id, escfunc_id, revisao
having count(*) > 1;
exit
```

**Resultado esperado:** `no rows selected`. Se houver linhas, **pare**. A migration 5 adiciona unicidade nessa chave; nao apague registros automaticamente. O DBA e a equipe funcional devem investigar tentativas/envios existentes e aprovar qualquer saneamento.

### 6.3 Executar SQLs 5 a 9

No shell:

```bash
cd "$STAGE/work"
sqlplus -L /nolog
```

No SQL*Plus:

```sql
connect USUARIO@HOST:PORTA/SERVICO
whenever oserror exit failure
whenever sqlerror exit sql.sqlcode
@db/migrations/20260930_rm_envio_escopo_unique.sql
@db/migrations/20260930_treinamento_progresso.sql
@db/migrations/20261001_evento_subsecao.sql
@db/migrations/20261001_treinamento_tour_v2.sql
@db/migrations/20261001_transferencia_subsecao_agendada.sql
exit
```

**Resultado esperado:** os cinco arquivos terminam sem erro. Em falha, pare antes de instalar o codigo novo; nao tente `rollback` como substituto do backup.

### 6.4 Registrar o que realmente foi aplicado

**Onde:** shell em `$STAGE/work`, depois de conferir a saida de cada arquivo. `migrations:record` **so grava arquivo, checksum e operador no ledger**; ele nao executa SQL. Troque `OPERADOR` pelo seu identificador. Nao rode a linha de um arquivo que falhou ou que nao foi executado.

```bash
cd "$STAGE/work"
OPERADOR=opc
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260929_registro_migrations.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260929_pendencia_operacional_funcionario.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260929_eventos_escala.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260929_pendencias_envio_rm.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260930_rm_envio_escopo_unique.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20260930_treinamento_progresso.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20261001_evento_subsecao.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20261001_treinamento_tour_v2.sql --confirm-applied --by "$OPERADOR"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:record -- --name 20261001_transferencia_subsecao_agendada.sql --confirm-applied --by "$OPERADOR"
```

**Resultado esperado:** cada comando confirma o arquivo registrado. Se algum disser que a chave ja existe, confira o ledger/checksum antes de repetir. Nao reconcilie migrations antigas sem conferir seus objetos. `migrations:status` pode terminar com codigo 1 por arquivos **antigos sem registro**, mesmo que o schema ja os contenha; trate isso como pendencia documental, nao como ordem para reaplicar o SQL.

### 6.5 Verificar o contrato do banco

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run db:check-schema
ESCALA_ENV_FILE=/opt/escala-app/.env npm run migrations:status
```

**Obrigatorio:** `db:check-schema` deve terminar com `Contrato Oracle essencial presente`. Se listar objeto/coluna/indice ausente, **pare**. `migrations:status` deve mostrar `CONFIRMADA` para os nove arquivos novos; linhas `SEM_REGISTRO` antigas precisam ser conciliadas individualmente, e `DIVERGENTE` exige investigacao. O check de schema confirma estrutura essencial, nao dados completos nem a execucao de todas as migrations. Sem a tabela de treinamento, o login da nova versao retorna 503.

## 7. Preflight do React e das duas contas

Ainda com o servico antigo ativo, valide a build no stage, a allowlist e os usuarios no **Oracle do servidor**:

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/.env npm run rollout:check-ui -- murilo.jesus,admin
```

**Resultado esperado:** `Canario React pronto: murilo.jesus, admin ativos, build presente e allowlist exclusiva.` Se falhar, **nao reinicie a aplicacao com o codigo novo**. Em um banco Docker local anterior, `murilo.jesus` nao existia; isso nao comprova que o usuario esteja ausente no Oracle do servidor. Corrija apenas a causa real encontrada no ambiente de destino.

## 8. Trocar o codigo e reiniciar

**Este e o inicio da indisponibilidade.** Execute apenas depois dos passos 2 a 7 aprovados. Reconfirme que o checkout servido continua sem alteracoes locais. O usuario que roda Git/npm deve ser dono do checkout; use `sudo` apenas para o systemd, salvo configuracao local diferente.

```bash
git -C "$APP_ROOT" status --short
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

**Resultado esperado:** `git switch` aponta para o SHA aprovado; `npm ci` e build terminam com codigo 0; o servico fica `active (running)`; `/health` retorna `{"status":"ok"}`; `/ready` retorna `{"status":"ready","database":"oracle"}`. Se qualquer comando falhar, **pare**: nao continue ate o aceite funcional. Consulte os logs:

```bash
journalctl -u escala-app -n 200 --no-pager
```

Nao use `git pull` no diretorio errado (`/opt/escala-app/work` contem o `package.json`, mas o Git pode ter raiz no diretorio pai). Nao rode `npm ci --omit=dev` antes do build.

## 9. Aceite funcional e acompanhamento

1. Em janela anonima, entre como `murilo.jesus` e depois como `admin`, em sessoes separadas. Cada conta sem progresso previo deve ir para `/nova/treinamento`; concluido o tour, deve conseguir abrir `/nova/escalas-liberadas`.
2. Entre com uma conta de teste **fora** do allowlist: ela conclui o tour uma vez e volta para `/app#/escalas-geradas`; tentativa de abrir outras rotas `/nova` deve ser bloqueada/redirecionada.
3. Confira a leitura de uma escala existente, um horario de funcionario e a impressao, sem gerar/oficializar uma escala real so como teste. Confira a identificacao de feriado nacional fixo na grade e que uma nova folga nele e impedida.
4. Monitore `journalctl -u escala-app -f` e as filas Oracle apos abrir o acesso. Registre eventuais `requestId`. O worker de transferencias deve permanecer desligado e nenhum envio RM externo deve ser disparado apenas por esse aceite.

## 10. Se precisar voltar

**Fechar apenas a interface React:** retire os logins de `REACT_ALLOWED_LOGINS` na `.env` e reinicie `escala-app`; a allowlist vazia bloqueia as telas React. Isso **nao** desliga o treinamento obrigatorio, as novas APIs ou as regras de escala.

**Voltar o codigo:** com aprovacao operacional, pare o servico e volte ao `SHA_ANTERIOR` anotado no passo 2. Estes comandos nao revertem dados Oracle:

```bash
sudo systemctl stop escala-app
git -C "$APP_ROOT" switch --detach "$SHA_ANTERIOR"
cd "$APP_ROOT/work"
npm ci
npm run build:client --if-present
sudo systemctl start escala-app
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/ready
```

Se o SHA anterior nao estiver na variavel por uma nova sessao SSH, **copie o valor registrado**, nao adivinhe a revisao. Restaurar o backend antigo sobre um schema novo pode exigir analise de compatibilidade. Reversao integral do Oracle depende do backup e do procedimento aprovado pelo DBA; nao rode `DROP` improvisado nem tente desfazer DDL com `rollback`.

## Referencias no repositorio

- `docs/deploy-main-canario-react.md`: contexto da liberacao restrita da interface.
- `scripts/check-react-rollout.js`, `scripts/check-schema.js`, `scripts/migration-ledger.js`: preflight e registro.
- `db/migrations/`: SQLs usados no servidor; `docker/oracle/migrations/` e espelho para o Docker local.
