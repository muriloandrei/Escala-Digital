# Correcoes da escala - 15/10/2026

Este lote permanece na branch `homologacao` ate a validacao na loja. Nao altera automaticamente o Oracle Linux nem executa o job do RM.

## Ordem de implantacao

1. Confirme backup do schema `ESCALAINT` e anote o SHA do release. No checkout novo, execute `npm ci`, `npm run check:client`, `npm run build:client`, `npm test` e `npm run migrations:check` dentro de `work`.
2. Aplique `db/migrations/20261015_funcionario_status_rm.sql` em `ESCALAINT`. No release com `ESCALA_ENV_FILE` apontando para o arquivo `.env` do servico, execute primeiro `npm run migrations:apply -- --name 20261015_funcionario_status_rm.sql` (previa) e depois `npm run migrations:apply -- --name 20261015_funcionario_status_rm.sql --apply --by OPERADOR`. A migration e idempotente: se a coluna `STATUS` ja existe, apenas confirma o contrato e o ledger. O executor exige que as migrations anteriores estejam registradas; nao registre SQL nao executado.
3. Confirme que `20261015_portaria_preparar_subsecao.sql` e `20261015_portaria_migrar_frente_caixa.sql` continuam `SEM_REGISTRO` no ledger antes de usar esta revisao: ambas falharam antes da aplicacao e seus checksums foram corrigidos para identificar apenas a Frente de Caixa operacional com codigo final `02.002`. Na filial 309, a secao `309.02.63` tem a mesma descricao, mas nao e destino. Execute `20261015_portaria_preparar_subsecao.sql` em `ESCALAINT`, primeiro sem `--apply` e depois com `--apply --by OPERADOR`. Ela cria a subseção Porteiro somente quando falta sob uma Frente de Caixa ativa `02.002` e unica. A carga antiga de subseções contemplava apenas as secoes existentes na epoca. Se a Frente nao existir ou houver cadastro ambiguo/inativo, a migration interrompe e exige revisao manual.
4. Em seguida execute a migration original `20261015_portaria_migrar_frente_caixa.sql`, primeiro sem `--apply` e depois com `--apply --by OPERADOR`. Ela move os vinculos dos funcionarios de `02.012` para Frente de Caixa/Porteiro, os fixos do mes corrente em diante e as programacoes ativas nao oficializadas do mes corrente em diante. Nao move historico de meses passados nem programacoes oficializadas. Interrompe sem aplicar se faltar destino unico, houver escala concorrente no destino ou transferencia de subseção pendente. Faca backup e confira os casos bloqueados antes de repetir.
5. O pacote `db/packages/PK_ESCALA_INTELIGENTE.body.sql` roda no schema de origem, onde existe `SGN_USUARIO`. Antes de compilar, conceda a esse schema `SELECT` em `ESCALAINT.SGN_ESC_LOJA_SEQ` e `SELECT` em `ESCALAINT.SGN_ESC_SUBSECAO`, se ainda nao concedidos. A compilacao tambem requer os grants ja existentes para as tabelas `ESCALAINT.SGN_ESC_*`. Compare o corpo versionado com `USER_SOURCE`, incorpore sua propria regra de alimentacao de `SGN_ESC_FUNCIONARIO.STATUS`, compile no schema de origem e confirme `USER_ERRORS` vazio. A versao no repositorio nao alimenta `STATUS`; voce assumiu essa alteracao. O pacote mapeia novos porteiros de `02.012` para Frente de Caixa/Porteiro para que o job diario nao desfaça a migracao.
6. Execute `npm run db:check-schema` no release. So depois publique o codigo da aplicacao e reinicie `escala-app`. Confira `systemctl is-active escala-app` e `curl --fail http://127.0.0.1:3000/ready`.
7. Aguarde o job diario `PK_ESCALA_INTELIGENTE.PKB_INTEGRA_CADASTRO` ou execute-o pela rotina operacional do banco. Confira se a loja 64 surgiu no cadastro e se seus usuarios foram vinculados. Nao cadastre usuarios provisoriamente fora da fonte `SGN_USUARIO`.
8. No release ativo, execute `npm run lojas:diagnosticar -- --loja=64` e depois `npm run escalas:liberar-novembro -- --loja=64` para previa. Se o resultado for `PREVISTA`, execute `npm run escalas:liberar-novembro -- --loja=64 --apply --by=OPERADOR`. Se aparecer `IGNORADA`, investigue o motivo antes de qualquer escrita manual.

## Comportamento a validar

- Porteiros de `02.012` passam a pertencer de fato a Frente de Caixa/Porteiro. Escalas antigas oficializadas continuam na Portaria original e acessiveis para historico; as novas sao geradas no escopo da Frente de Caixa.
- O botao Sair aparece no topo do menu, inclusive em telas estreitas.
- Detalhes do funcionario aparece visualmente acima da lista; lideres com permissao de edicao podem abrir e encerrar suspensoes apenas nas secoes liberadas.
- A geracao nova alterna os domingos entre colaboradores mesmo quando pertencem a turnos diferentes. Escalas antigas nao sao redistribuidas automaticamente.
- Apenas `STATUS = 'A'` entra em novas liberacoes e geracoes. Na primeira leitura depois de uma carga com `STATUS = 'I'`, o sistema preserva os dias anteriores e remove de hoje em diante, desoficializando o funcionario afetado e registrando evento de auditoria. Como o RM nao fornece data efetiva nesse caso, o corte usa a data local da leitura.

## Limites da validacao local

Os testes automatizados e o build nao compilam o pacote no Oracle nem provam a existencia da loja 64 no banco de producao. Validar os passos de banco e o comportamento com dados reais na homologacao antes do merge para `main`.
