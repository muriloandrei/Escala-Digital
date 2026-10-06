# Hotfix: treinamento v3 no Oracle Linux

O tour v3 tem 16 etapas. A migration anterior ainda restringe `SGN_ESC_TREINAMENTO.ETAPA` a 0..12 e causa `ORA-02290` ao avancar para a etapa 13. Este hotfix amplia somente a constraint para 0..16. Ele nao apaga nem reinicia o progresso dos usuarios.

Execute os blocos abaixo no Bash do `srv-lnx-escint`, na mesma sessao SSH. Copie apenas os comandos dentro dos blocos, sem as linhas de tres crases. O repositorio fica em `/opt/escala-app`, o `package.json` em `work` e a `.env` em `/opt/escala-app/work/.env`. Nao e preciso SQL*Plus nem Docker no servidor. Confirme o backup do schema antes do bloco que usa `--apply`: DDL Oracle faz commit implicito.

## 1. Buscar e testar o commit de homologacao

```bash
APP_ROOT=/opt/escala-app
cd "$APP_ROOT/work"
git -C "$APP_ROOT" status --porcelain --untracked-files=no
git -C "$APP_ROOT" fetch origin
SHA=$(git -C "$APP_ROOT" rev-parse origin/homologacao)
printf 'Commit homologacao: %s\n' "$SHA"
STAGE=/tmp/escala-homolog-${SHA:0:12}
git -C "$APP_ROOT" worktree add --detach "$STAGE" "$SHA"
cd "$STAGE/work"
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
```

`status --porcelain --untracked-files=no` deve ficar vazio. Se o stage ja existir, confira `git -C "$STAGE" rev-parse HEAD` antes de reutiliza-lo; nao troque arquivos manualmente. Pare se qualquer teste ou comando falhar.

## 2. Preflight e migration

```bash
cd "$STAGE/work"
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name 20261006_treinamento_tour_v3.sql
```

Espere `Preflight aprovado. Nenhuma alteracao executada`. O executor verifica schema, checksum e registro das migrations anteriores. Se disser que alguma migration anterior nao esta registrada, pare e investigue; nao aplique SQL manualmente nem registre um arquivo sem comprovar sua execucao. Com preflight aprovado e backup confirmado:

```bash
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:apply -- --name 20261006_treinamento_tour_v3.sql --apply --by opc
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run db:check-schema
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run migrations:status
```

Espere `Aplicada e registrada`, `Contrato Oracle essencial presente` e `CONFIRMADA 20261006_treinamento_tour_v3.sql`. Se a aplicacao da migration falhar, pare antes de tentar novamente: o DDL pode ter sido confirmado sem o registro no ledger.

## 3. Atualizar o servico

```bash
SHA_ANTERIOR=$(git -C "$APP_ROOT" rev-parse HEAD)
printf 'Versao anterior: %s\n' "$SHA_ANTERIOR"
sudo systemctl stop escala-app
git -C "$APP_ROOT" switch --detach "$SHA"
cd "$APP_ROOT/work"
npm ci
npm run build:client
sudo systemctl start escala-app
sudo systemctl status escala-app -l --no-pager
curl --fail http://127.0.0.1:3000/ready
git -C "$APP_ROOT" rev-parse HEAD
```

`/ready` deve retornar `{"status":"ready","database":"oracle"}`. Se a conexao for recusada, verifique `sudo journalctl -u escala-app -n 100 --no-pager` antes de tentar outro restart. Recarregue o treinamento e confirme que a etapa 13 avanca sem `ORA-02290`.
