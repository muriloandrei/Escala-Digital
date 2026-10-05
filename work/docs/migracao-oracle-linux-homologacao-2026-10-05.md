# Implantacao da versao nova no Oracle Linux

Este roteiro e para o servidor **sem Docker**. Ele considera o repositorio Git em `/opt/escala-app`, o `package.json` em `/opt/escala-app/work`, a configuracao real do host `srv-lnx-escint` em `/opt/escala-app/work/.env` e o servico systemd `escala-app`. **Confirme esses quatro dados antes de executar qualquer alteracao.** Em outro host, descubra o caminho da `.env` com `systemctl show escala-app -p EnvironmentFiles` e substitua-o nos comandos. Todos os blocos de comando deste roteiro sao para Bash; a execucao dos SQLs e feita pelo Node.

Na conferencia inicial de 05/10/2026, as mudancas de codigo foram publicadas em `homologacao` a partir do commit `01dfbe9`; `main` ainda estava em `2b8b402`. O SHA final da `homologacao` pode avancar quando este documento for atualizado. **O servidor de producao deve receber apenas o SHA aprovado e promovido para `main`.** Nao interprete a existencia do commit na `homologacao` como implantacao concluida.

O pacote inclui interface React, tour guiado com Driver.js, treinamento obrigatorio uma vez por usuario, logos transparentes, tratamento de feriados nacionais fixos e as demais alteracoes acumuladas na `homologacao`. O allowlist limita **somente as telas React** a `murilo.jesus` e `admin`; APIs, banco e regras novas afetam todos. Usuarios fora da lista tambem precisam terminar o treinamento antes de usar `/app`. Avise as lojas antes da janela. Feriados estaduais, municipais e moveis nao fazem parte da lista nacional fixa desta entrega.

**Como copiar os exemplos:** copie somente as linhas dentro dos blocos, sem as linhas de tres crases que marcam inicio e fim. `cd`, atribuicoes como `SHA=...` e `test` normalmente nao imprimem nada quando funcionam. `sudo cd` nao muda o diretorio do seu terminal: use `cd` normalmente. Este roteiro nao exige SQL*Plus; a aplicacao usa sua propria conexao Oracle para aplicar, um arquivo por vez, as nove migrations aprovadas.

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
systemctl show escala-app -p EnvironmentFiles -p User -p Group
ls -l /opt/escala-app/work/.env
node -v
npm -v
```

**Confirme antes de continuar:** `pwd` termina em `/opt/escala-app/work`; `APP_ROOT` e `/opt/escala-app`; `git status` nao mostra alteracoes no checkout servido; o servico aponta para `work` (`WorkingDirectory=/opt/escala-app/work` e `ExecStart` para `npm start` ou `work/src/server.js`); `EnvironmentFiles` aponta para a `.env` que voce esta usando; Node e npm estao disponiveis. **`sqlplus: command not found` nao bloqueia este roteiro:** use o executor Node do passo 6, presente na versao nova. O Vite deste pacote exige Node `^20.19.0` ou `>=22.12.0`; se a versao instalada for anterior, atualize o runtime de forma controlada antes do passo 4. Se algum ponto nao corresponder, ajuste o roteiro ao layout real antes de rodar Git ou SQL. Nao use `git reset --hard` para limpar o checkout. Guarde `SHA_ANTERIOR` no registro da mudanca, pois a variavel some ao fechar o SSH. A `.env` do `srv-lnx-escint` foi encontrada com permissao `644`, legivel por outros usuarios; planeje restringi-la apos confirmar `User`/`Group` do servico, sem expor seu conteudo.

**Backup obrigatorio:** o DBA deve confirmar um snapshot/backup recuperavel do schema Oracle, com procedimento de restauracao e horario registrados. A forma de backup depende da instalacao Oracle, por isso nao ha um comando RMAN universal aqui. Preserve tambem uma copia restrita da `.env` e confirme a reversao do servico. **Nao aplique migrations sem backup confirmado.** DDL Oracle pode fazer commit implicito; um `rollback` da conexao nao desfaz uma migration estrutural.

## 3. Buscar e conferir o SHA aprovado

**Onde:** mesmo SSH, ainda sem interromper a aplicacao. Substitua o valor da primeira linha pelo SHA completo aprovado no passo 1. Nao deixe o texto `COLE_AQUI...`: ele e apenas um marcador.

```bash
SHA_ESPERADO=COLE_AQUI_O_SHA_COMPLETO_APROVADO
git -C "$APP_ROOT" fetch origin
SHA=$(git -C "$APP_ROOT" rev-parse origin/main)
printf 'main no servidor: %s\nSHA aprovado: %s\n' "$SHA" "$SHA_ESPERADO"
if test "$SHA" = "$SHA_ESPERADO"; then printf 'SHA aprovado encontrado na main\n'; else printf 'PARE: main ainda nao contem o SHA aprovado\n'; fi
git -C "$APP_ROOT" status --short
```

**Resultado esperado:** `SHA aprovado encontrado na main`; `git status --short` nao mostra arquivos. Se aparecer `PARE`, **nao execute o passo 4**: a `main` ainda esta antiga. No incidente de 05/10, `origin/main` era `2b8b402`; criar um worktree desse SHA resulta corretamente em `Missing script: check:client`/`build:client`/`migrations:check`. Isso nao e defeito do npm. `git fetch` nao instala a versao; apenas atualiza as referencias remotas.

**Apenas para testar o codigo da `homologacao` sem instalar no servico**, enquanto a promocao para `main` nao ocorreu, use um worktree diferente. Nao aplique migrations no Oracle operacional com esse teste preliminar:

```bash
cd /opt/escala-app/work
APP_ROOT=$(git rev-parse --show-toplevel)
git -C "$APP_ROOT" fetch origin
SHA_HOMOLOG=$(git -C "$APP_ROOT" rev-parse origin/homologacao)
STAGE_HOMOLOG=/tmp/escala-homolog-${SHA_HOMOLOG:0:12}
git -C "$APP_ROOT" worktree add --detach "$STAGE_HOMOLOG" "$SHA_HOMOLOG"
cd "$STAGE_HOMOLOG/work"
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
```

O worktree antigo que voce criou de `2b8b402` pode ficar parado por enquanto; nao e necessario apaga-lo para fazer este teste. O SHA aprovado para a implantacao definitiva continua sendo o que for promovido para `main`.

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

Edite **somente** a `.env` usada pelo servico, mantendo os valores existentes de Oracle, JWT, cookie, proxy e RM. No `srv-lnx-escint`, o caminho confirmado e `/opt/escala-app/work/.env` (por exemplo `vi /opt/escala-app/work/.env`); nao imprima a `.env` inteira em logs ou tickets. Deixe exatamente estas entradas, sem duplicatas:

```env
REACT_DEFAULT_UI=true
REACT_ALLOWED_LOGINS=murilo.jesus,admin
ESCALA_TRANSFER_SCHEDULER_ENABLED=false
```

Confira apenas as tres chaves nao secretas:

```bash
grep -E '^(REACT_DEFAULT_UI|REACT_ALLOWED_LOGINS|ESCALA_TRANSFER_SCHEDULER_ENABLED)=' /opt/escala-app/work/.env
```

**Resultado esperado:** tres linhas, com esses valores. O worker de transferencias fica desligado nesta primeira publicacao; habilite-o apenas em outra janela, depois de validar a fila. Nao altere `RM_API_ENABLED` so para este deploy e nao faca envio de teste ao RM real: nao existe RM de homologacao com escrita. A `.env` sera relida no reinicio do servico. Se systemd carrega as variaveis por `EnvironmentFile`, confirme que ele aponta para a mesma configuracao; para os comandos manuais abaixo usamos `ESCALA_ENV_FILE` explicitamente.

## 6. Aplicar as migrations Oracle

**Onde:** Bash em `$STAGE/work`, depois do backup do passo 2 e da aprovacao do SHA. **Nao precisa instalar SQL*Plus.** O script usa `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_CONNECT_STRING` da `.env` pelo driver `oracledb` ja usado pela aplicacao. A conta precisa ser dona do schema e ter permissao para criar/alterar os objetos. Nenhuma senha aparece na linha de comando.

O executor aceita **somente** estes nove arquivos, um por vez, na ordem abaixo. Confere o schema, as tabelas base, o checksum nas duas pastas, o registro da migration anterior e duplicatas antes da restricao da fila RM. Sem `--apply`, ele apenas consulta e imprime o plano. Com `--apply --by opc`, executa o bloco PL/SQL e grava o ledger. Nao rode `migrations:record` depois: o executor ja registra o SQL aplicado.

### 6.1 Primeiro arquivo: consultar e aplicar

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name 20260929_registro_migrations.sql
```

**Resultado esperado:** nome do schema, arquivo, checksum e `Preflight aprovado. Nenhuma alteracao executada`. Se disser `Missing script`, o worktree ainda e da `main` antiga: volte ao passo 3. Se acusar schema errado ou tabelas base ausentes, pare. Depois do backup confirmado e do preflight aprovado, execute:

```bash
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name 20260929_registro_migrations.sql --apply --by opc
```

**Resultado esperado:** `Aplicada e registrada`. O primeiro arquivo cria `SGN_ESC_MIGRACAO`. Se der erro, **pare** e investigue antes de repetir: DDL Oracle pode ter sido confirmado mesmo que o registro tenha falhado.

### 6.2 Demais arquivos, em ordem

O bloco abaixo consulta **um arquivo por vez**, para se ocorrer erro, e pergunta `Aplicar NOME no Oracle?`. Para executar aquele SQL, digite exatamente `APLICAR` e pressione Enter. Qualquer outra resposta interrompe o bloco. Em caso de erro no preflight ou na execucao, ele tambem para antes do arquivo seguinte. **Este bloco executa DDL real apos cada confirmacao; nao o use antes do backup.** Copie somente as linhas dentro da caixa, de `for` ate `done`:

```bash
cd "$STAGE/work"
for arquivo in \
  20260929_pendencia_operacional_funcionario.sql \
  20260929_eventos_escala.sql \
  20260929_pendencias_envio_rm.sql \
  20260930_rm_envio_escopo_unique.sql \
  20260930_treinamento_progresso.sql \
  20261001_evento_subsecao.sql \
  20261001_treinamento_tour_v2.sql \
  20261001_transferencia_subsecao_agendada.sql
do
  if ! ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name "$arquivo"; then
    printf 'PARE: preflight falhou para %s\n' "$arquivo"
    break
  fi
  read -r -p "Aplicar $arquivo no Oracle? Digite APLICAR: " resposta
  if [ "$resposta" != APLICAR ]; then
    printf 'Interrompido antes de %s\n' "$arquivo"
    break
  fi
  if ! ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name "$arquivo" --apply --by opc; then
    printf 'PARE: execucao falhou para %s\n' "$arquivo"
    break
  fi
done
```

**Resultado esperado:** cada arquivo mostra `Preflight aprovado` e depois `Aplicada e registrada`, antes da pergunta seguinte. Se houver duplicatas na chave da migration 5, o executor bloqueia a aplicacao. Nao remova dados automaticamente; o DBA e a equipe funcional devem analisar. Se o bloco parar antes do ultimo arquivo, **nao** siga para o passo 6.3. Investigue o erro e retome a partir do arquivo que faltou, respeitando a ordem.

Para consultar manualmente um arquivo sem aplicar, por exemplo a migration 5, use:

```bash
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name 20260930_rm_envio_escopo_unique.sql
```

`Ja registrada com checksum identico` significa que aquele arquivo nao foi reaplicado. Migration antiga `SEM_REGISTRO` nao e autorizacao para reaplicar todo o diretorio.

### 6.3 Verificar o contrato do banco

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run db:check-schema
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:status
```

**Obrigatorio:** `db:check-schema` deve terminar com `Contrato Oracle essencial presente`. Se listar objeto/coluna/indice ausente, **pare**. `migrations:status` deve mostrar `CONFIRMADA` para os nove arquivos novos; linhas `SEM_REGISTRO` antigas precisam ser conciliadas individualmente, e `DIVERGENTE` exige investigacao. O check de schema confirma estrutura essencial, nao dados completos nem a execucao de todas as migrations. Sem a tabela de treinamento, o login da nova versao retorna 503.

## 7. Preflight do React e das duas contas

Ainda com o servico antigo ativo, valide a build no stage, a allowlist e os usuarios no **Oracle do servidor**:

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run rollout:check-ui -- murilo.jesus,admin
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
