# Correcoes da escala - 15/10/2026

Este lote permanece na branch `homologacao` ate a validacao na loja. Nao altera automaticamente o Oracle Linux nem executa o job do RM.

## Ordem de implantacao

1. Confirme backup do schema `ESCALAINT` e anote o SHA do release. No checkout novo, execute `npm ci`, `npm run check:client`, `npm run build:client`, `npm test` e `npm run migrations:check` dentro de `work`.
2. Aplique `db/migrations/20261015_funcionario_status_rm.sql` em `ESCALAINT`. No release com `ESCALA_ENV_FILE` apontando para o arquivo `.env` do servico, execute primeiro `npm run migrations:apply -- --name 20261015_funcionario_status_rm.sql` (previa) e depois `npm run migrations:apply -- --name 20261015_funcionario_status_rm.sql --apply --by OPERADOR`. A migration e idempotente: se a coluna `STATUS` ja existe, apenas confirma o contrato e o ledger. O executor exige que as migrations anteriores estejam registradas; nao registre SQL nao executado.
3. O pacote `db/packages/PK_ESCALA_INTELIGENTE.body.sql` roda no schema de origem, onde existe `SGN_USUARIO`. Antes de compilar, conceda a esse schema `SELECT` em `ESCALAINT.SGN_ESC_LOJA_SEQ`, se ainda nao concedido. A compilacao tambem requer os grants ja existentes para as tabelas `ESCALAINT.SGN_ESC_*` e a coluna `STATUS` criada. Compare o corpo versionado com `USER_SOURCE`, compile no schema de origem e confirme `USER_ERRORS` vazio. O pacote passou a registrar lojas com funcionarios ativos mesmo sem brigada, usando a sequence da loja, e a copiar `RM.PFUNC.CODSITUACAO` como `A` ou `I`.
4. Execute `npm run db:check-schema` no release. So depois publique o codigo da aplicacao e reinicie `escala-app`. Confira `systemctl is-active escala-app` e `curl --fail http://127.0.0.1:3000/ready`.
5. Aguarde o job diario `PK_ESCALA_INTELIGENTE.PKB_INTEGRA_CADASTRO` ou execute-o pela rotina operacional do banco. Confira se a loja 64 surgiu no cadastro e se seus usuarios foram vinculados. Nao cadastre usuarios provisoriamente fora da fonte `SGN_USUARIO`.
6. No release ativo, execute `npm run lojas:diagnosticar -- --loja=64` e depois `npm run escalas:liberar-novembro -- --loja=64` para previa. Se o resultado for `PREVISTA`, execute `npm run escalas:liberar-novembro -- --loja=64 --apply --by=OPERADOR`. Se aparecer `IGNORADA`, investigue o motivo antes de qualquer escrita manual.

## Comportamento a validar

- Portaria `02.012` aparece na linha de subsecoes da Frente de Caixa. Os IDs das secoes, as permissoes e o escopo de oficializacao continuam separados no banco.
- O botao Sair aparece no topo do menu, inclusive em telas estreitas.
- Detalhes do funcionario aparece visualmente acima da lista; lideres com permissao de edicao podem abrir e encerrar suspensoes apenas nas secoes liberadas.
- A geracao nova alterna os domingos entre colaboradores mesmo quando pertencem a turnos diferentes. Escalas antigas nao sao redistribuidas automaticamente.
- Apenas `STATUS = 'A'` entra em novas liberacoes e geracoes. Na primeira leitura depois de uma carga com `STATUS = 'I'`, o sistema preserva os dias anteriores e remove de hoje em diante, desoficializando o funcionario afetado e registrando evento de auditoria. Como o RM nao fornece data efetiva nesse caso, o corte usa a data local da leitura.

## Limites da validacao local

Os testes automatizados e o build nao compilam o pacote no Oracle nem provam a existencia da loja 64 no banco de producao. Validar os passos de banco e o comportamento com dados reais na homologacao antes do merge para `main`.
