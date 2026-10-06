# Liberar a interface React para todos no Oracle Linux

Este roteiro usa a `main` depois da promocao da `homologacao`. O merge no Git **nao** altera sozinho o servico em `/opt/escala-app`, a `.env` ou o Oracle. Execute em uma janela de publicacao, com backup recente e um operador apto a reverter a interface. As permissoes de loja e perfil continuam valendo na API.

## 1. Conferir o candidato

No servidor, confirme o caminho do repositorio e o estado do checkout vivo. Nao use `git reset --hard` nem apague os arquivos locais da instalacao.

```bash
git -C /opt/escala-app fetch origin
git -C /opt/escala-app status --short --branch
git -C /opt/escala-app rev-parse origin/main
systemctl show escala-app -p WorkingDirectory -p ExecStart -p EnvironmentFiles
```

Crie um checkout separado para testar o SHA de `main` sem alterar o codigo servido. Se o caminho `STAGE` ja existir, escolha outro nome antes de continuar.

```bash
SHA=$(git -C /opt/escala-app rev-parse origin/main)
STAGE=/tmp/escala-main-${SHA:0:12}
git -C /opt/escala-app worktree add --detach "$STAGE" "$SHA"
cd "$STAGE/work"
npm ci
npm run check:client
npm run build:client
npm test
npm run migrations:check
```

Pare se qualquer teste falhar. Registre o SHA aprovado e o backup do Oracle antes de trocar o checkout vivo.

## 2. Conferir o Oracle

O arquivo de ambiente usado pelo servico nesta instalacao e `/opt/escala-app/work/.env`. Nao mostre seu conteudo completo nem o copie para o Git. No checkout de teste, rode:

```bash
export ESCALA_ENV_FILE=/opt/escala-app/work/.env
npm run migrations:status
npm run db:check-schema
```

`db:check-schema` deve confirmar, entre outros itens, a constraint do treinamento com etapas `0..16`. Se apontar `SGN_ESC_TREINAMENTO_ETAPA_CK(0..16)`, confira a migration `20261006_treinamento_tour_v3.sql` e aplique-a pelo executor aprovado. Se apontar colunas de auditoria, confira `20261005_auditoria_mes_revisao.sql`. Execute migrations **somente** se faltarem de fato; `SEM_REGISTRO` em scripts antigos nao prova ausencia, pois alguns foram aplicados diretamente no banco. O comando abaixo mostra o preflight sem gravar; acrescente `--apply --by LOGIN_OPERADOR` apenas depois de confirmar o schema e o backup:

```bash
npm run migrations:apply -- --name 20261006_treinamento_tour_v3.sql
```

Se o preflight apontar uma migration anterior sem registro, **pare**. Verifique no banco se ela foi aplicada integralmente e so entao registre a execucao confirmada com `npm run migrations:record -- --name NOME.sql --confirm-applied --by LOGIN_OPERADOR`. Nao registre so porque a tabela principal existe. Repita o preflight depois da reconciliacao.

Repita `npm run db:check-schema` ate obter sucesso antes de liberar usuarios. Nao ative escrita no RM para este teste.

## 3. Abrir a interface para todos

No `.env` **do servico**, ajuste somente estas duas entradas, mantendo Oracle, JWT, cookies e as demais configuracoes existentes:

```env
REACT_DEFAULT_UI=true
REACT_ALLOWED_LOGINS=*
```

O valor `*` sozinho libera `/nova` para qualquer usuario autenticado. Cada usuario sem treinamento concluido sera direcionado uma vez ao tour antes da escala. Uma lista vazia volta a bloquear `/nova`; `REACT_DEFAULT_UI=false` sozinho nao revoga acesso direto.

Com o build novo e o `.env` ajustado, execute no checkout de teste:

```bash
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run rollout:check-ui -- '*'
```

Esse preflight verifica a flag, o curinga isolado, o build React e a existencia de usuarios ativos no Oracle. **Nao** use o resultado como prova de que o servico vivo ja foi atualizado: o systemd continua apontando para `/opt/escala-app/work`.

## 4. Publicar e verificar

Na janela de publicacao, implante no checkout servido o **mesmo SHA** e o build aprovado, preservando a `.env` e quaisquer arquivos locais. Como a instalacao atual pode estar em `HEAD` destacado e conter arquivos nao versionados, confira o estado antes da troca e use o procedimento de implantacao ja adotado para esse servidor, sem forcar checkout ou sobrescrever arquivos. Depois reinicie e verifique:

```bash
sudo systemctl restart escala-app
sudo systemctl status escala-app --no-pager
curl --fail http://127.0.0.1:3000/ready
```

Em sessoes separadas, teste `admin` e um usuario de loja: o primeiro login sem progresso abre `/nova/treinamento`, a conclusao abre `/nova/escalas-liberadas`, e a escala respeita as lojas e permissoes do perfil. Confira tambem `journalctl -u escala-app -n 100 --no-pager`. Se for preciso fechar imediatamente so a interface nova, deixe `REACT_ALLOWED_LOGINS=` vazio no `.env` e reinicie; isso nao reverte migrations nem regras de backend.
