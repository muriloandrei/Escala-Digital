# Registrar loja nova no Oracle

O catalogo de filtros vem de `SGN_ESC_LOJA`. O cadastro de colaboradores e secoes
nao insere automaticamente essa linha. Contas de login e seus vinculos sao
processos separados; este comando nao cria contas nem concede permissoes.

No checkout da versao que contem `scripts/registrar-loja.js`, confirme o backup
do schema e execute primeiro a previa:

```bash
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run lojas:registrar -- --loja=64
```

A previa exige colaboradores ativos e secoes ativas da loja, com a mesma
`CODCOLIGADA`. Se os dados estiverem corretos, aplique:

```bash
ESCALA_ENV_FILE=/opt/escala-app/work/.env npm run lojas:registrar -- --loja=64 --apply --by=opc
```

O comando e idempotente e grava somente `SGN_ESC_LOJA`. Depois, rode
`npm run lojas:diagnosticar -- --loja=64` com o mesmo `ESCALA_ENV_FILE` para
confirmar o catalogo e os vinculos. Se contas ainda nao existem, importe-as
pelo processo autorizado de usuarios; confira `SGN_ESC_USUARIO_LOJA` e a
liberacao de secoes dos lideres antes de pedir novo login.
