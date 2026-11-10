# Transicao novembro/dezembro de 2026

Com a regra atual, novembro cobre 01/11 a 30/11 e dezembro cobre 01/12 a
03/01. O dia 30/11 aparece em cinza na tela de dezembro apenas como referencia
da ultima revisao ativa de novembro; sem lancamento, a celula fica vazia. Ele
nao compoe os dias gerados nem a oficializacao de dezembro. O domingo 29/11
continua sendo consultado internamente para a regra de descanso dominical.
01/12 a 06/12 sao dias normais e editaveis da escala de dezembro.

Antes da aplicacao, publique o codigo e confirme que a escala de dezembro foi
liberada para as lojas envolvidas. A rotina exige uma programacao ativa unica
de dezembro para cada funcionario. Ela nao gera a escala restante do mes.

```bash
cd "$(systemctl show escala-app -p WorkingDirectory --value)"
export ESCALA_ENV_FILE=/opt/escala-app/work/.env
npm run escalas:transferir-dezembro -- --loja=64
npm run escalas:transferir-dezembro -- --all
```

Revise os registros `BLOCKED` antes de aplicar. Divergencia entre novembro e
dezembro, mudanca de secao, programacao duplicada ou ausencia da escala de
dezembro nao sao resolvidas automaticamente. A aplicacao confirma novamente
os dados sob bloqueio e faz commit individual por funcionario:

```bash
npm run escalas:transferir-dezembro -- --loja=64 --apply --by=opc
npm run escalas:transferir-dezembro -- --all --apply --by=opc
```

A rotina preserva as versoes anteriores e cria novas revisoes pendentes de
oficializacao para novembro e dezembro. Os dias e fixos de 01/12 a 06/12
passam a dezembro; nenhum horario divergente e sobrescrito. Revise o progresso,
oficialize novamente as duas competencias e acompanhe o novo envio ao RM.
Envios pendentes das revisoes antigas sao marcados como `SUPERADO`.

Compras de VT ja aprovadas nao sao recalculadas. Antes de liberar a nova
competencia, compare os retratos de compra com os novos intervalos e concilie
manualmente eventual diferenca de dias ou valores. O corpo `PK_VT.body.sql`
tambem precisa ser comparado com o instalado, compilado no schema dono e
validado (`USER_ERRORS` vazio, `STATUS = VALID`). Nao substitua a package
`PK_ESCALA_INTELIGENTE` como parte desta correcao.
