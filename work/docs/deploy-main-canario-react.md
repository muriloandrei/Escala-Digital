# Deploy da main com interface React restrita

Este procedimento publica o codigo da `homologacao` na `main`, mas libera as telas `/nova` apenas para `murilo.jesus`. Os demais usuarios continuam em `/app`. **O allowlist isola somente a interface**: novas APIs, regras de escala e migrations passam a valer para todos apos a publicacao. Programe a janela e o backup como uma mudanca de backend, nao apenas visual.

## 1. Antes de promover a branch

- Confirme que `main` nao recebeu commits novos: `git fetch origin` e `git log --oneline origin/main..origin/homologacao`. Revise tambem `git log --oneline origin/homologacao..origin/main`.
- Prepare e teste o commit candidato em um checkout de staging separado do diretorio usado pelo processo vivo. Nao altere arquivos do checkout de producao durante o build ou antes da janela de troca.
- Valide `npm ci`, `npm run check:client`, `npm run build:client`, `npm test` e `npm run migrations:check` no checkout `work`.
- Tire backup/snapshot do Oracle e registre o commit e a revisao atual do servico. Nao rode smoke tests que gravam escala na base produtiva.
- Nao promova o codigo antes de aplicar e conferir as migrations abaixo. Um banco parcialmente atualizado pode causar erro nas telas antigas tambem.

## 2. Migrations no Oracle do servidor

No servidor, o projeto Node fica em `/opt/escala-app/work`; confirme o caminho real com `pwd` e `ls package.json`. Use o checkout de staging para inspecionar os SQLs novos sem modificar o codigo servido. O SQL deve ser executado como dono do schema usado pela aplicacao. Compare `npm run migrations:status` com o schema e com a documentacao da implantacao anterior. `SEM_REGISTRO` nao comprova que uma migration antiga esta ausente; nao reaplique scripts antigos cegamente.

Estas nove migrations existem na `homologacao` e nao na `main` anterior, nesta ordem:

1. `db/migrations/20260929_registro_migrations.sql`
2. `db/migrations/20260929_pendencia_operacional_funcionario.sql`
3. `db/migrations/20260929_eventos_escala.sql`
4. `db/migrations/20260929_pendencias_envio_rm.sql`
5. `db/migrations/20260930_rm_envio_escopo_unique.sql`
6. `db/migrations/20260930_treinamento_progresso.sql`
7. `db/migrations/20261001_evento_subsecao.sql`
8. `db/migrations/20261001_treinamento_tour_v2.sql`
9. `db/migrations/20261001_transferencia_subsecao_agendada.sql`

Abra `sqlplus /nolog` e use `connect USUARIO@HOST:PORTA/SERVICO` para digitar a senha no prompt, sem grava-la no historico do shell. No SQL*Plus, configure `whenever sqlerror exit sql.sqlcode` e execute cada arquivo com `@/CAMINHO/DO/STAGING/work/db/migrations/NOME.sql`, conferindo a saida antes de continuar. A migration da restricao unica do envio RM pode falhar se houver duplicatas em `(LOJA, MES_REF, ESCSECAO_ID, ESCFUNC_ID, REVISAO)`; investigue os dados antes de qualquer correcao. DDL no Oracle pode fazer commit implicito, entao o backup e o plano de recuperacao precisam ser externos a esta sessao.

Depois de confirmar cada SQL aplicado, registre-o com `npm run migrations:record -- --name NOME.sql --confirm-applied --by OPERADOR`. Isso registra evidencia/checksum, nao executa a migration. Se o ledger acabou de ser criado, migrations antigas podem continuar `SEM_REGISTRO`; reconcilie-as individualmente. Execute `npm run db:check-schema`; este comando verifica tabelas, colunas, sequences, indices e a restricao essenciais, mas nao substitui validacao dos dados.

## 3. Preparar o servico sem Docker

Antes de trocar o commit em producao, inspecione `systemctl cat escala-app` e confirme `WorkingDirectory=/opt/escala-app/work` e `ExecStart` apontando para `work/src/server.js` (ou `npm start` naquele diretorio). A configuracao antiga documentada com `WorkingDirectory=/opt/escala-app` esta incorreta para este layout. Preserve a `.env`, que normalmente fica fora do Git em `/opt/escala-app/.env`, e passe-a ao servico via `EnvironmentFile` ou variavel `ESCALA_ENV_FILE`.

Na `.env` do servidor, adicione:

```env
REACT_DEFAULT_UI=true
REACT_ALLOWED_LOGINS=murilo.jesus
ESCALA_TRANSFER_SCHEDULER_ENABLED=false
```

Mantenha as demais configuracoes existentes, sobretudo Oracle, JWT, cookie e RM. O worker de transferencias deve continuar desligado ate a validacao operacional da fila. Nao ative escrita RM para teste: nao existe RM de homologacao com escrita habilitada.

Se o ambiente usar Docker Compose, `REACT_ALLOWED_LOGINS` aceita override pela variavel do host e usa `murilo.jesus` por padrao. Para testar com o usuario `admin` no Oracle local, defina `REACT_ALLOWED_LOGINS=admin` explicitamente antes de recriar o container; nao leve esse override para producao.

No checkout de staging do commit que sera promovido, entre no subdiretorio `work` e execute:

```bash
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
```

`vite` e `typescript` sao dependencias de desenvolvimento: nao use `npm ci --omit=dev` antes do build. Se for reduzir a instalacao depois, faca isso somente apos compilar/testar. Sem `EnvironmentFile` carregado no shell, rode as checagens de banco como o usuario do servico com `ESCALA_ENV_FILE=/opt/escala-app/.env npm run db:check-schema` e `ESCALA_ENV_FILE=/opt/escala-app/.env npm run rollout:check-ui -- murilo.jesus`. O preflight exige uma unica conta ativa no allowlist e o build React presente.

So depois dessas verificacoes, promova o commit testado para `main`. Na janela de publicacao, pare o servico, implante no diretorio de producao o mesmo SHA e o build aprovado, confira o ambiente e reinicie `escala-app`. Nao force push nem use `git reset --hard` em checkout com alteracoes locais; resolva o estado do repositorio antes. Confirme `/health` e `/ready` apos o restart.

## 4. Aceite e reversao

- Com `murilo.jesus`, o login deve abrir `/nova`; `/nova/escalas-liberadas` deve carregar diretamente, e `/app` deve continuar acessivel.
- Com uma conta de teste fora do allowlist, o login deve abrir `/app#/escalas-geradas`; acesso direto a `/nova/...` deve redirecionar para `/app` e `/nova/assets/...` deve retornar 403.
- `npm run smoke:react-allowlist` faz esse teste sem gravar escalas, mas exige duas contas de teste e senhas configuradas em `SMOKE_REACT_ALLOWED_LOGIN`, `SMOKE_REACT_DENIED_LOGIN` e `SMOKE_PASSWORD`. Se as senhas forem diferentes, teste os logins manualmente em sessoes separadas.
- Confira a edicao e a leitura de uma escala existente no fluxo antigo antes de liberar a janela. Registre qualquer erro com `requestId` e logs do servico.

Para fechar apenas a interface React imediatamente, esvazie `REACT_ALLOWED_LOGINS` e reinicie o servico; a regra falha fechada. `REACT_DEFAULT_UI=false` por si so muda o destino do login, mas nao bloqueia acesso direto para uma conta ainda no allowlist. Voltar o Git para o commit anterior nao desfaz migrations nem dados. Trate rollback de backend/Oracle separadamente a partir do backup e de um plano aprovado.
