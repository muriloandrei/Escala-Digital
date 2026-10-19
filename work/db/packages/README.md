# Integracao de usuarios na PK_ESCALA_INTELIGENTE

Estes arquivos sao SQL para Oracle. Nenhum servico Linux ou job adicional e necessario.
O job existente continua chamando `PK_ESCALA_INTELIGENTE.PKB_INTEGRA_CADASTRO`.

## Antes de compilar

1. Confirme o backup e exporte o `PACKAGE BODY` atual do banco. O arquivo versionado foi
   reconstruido a partir do corpo enviado em 14/10/2026; compare-o com `USER_SOURCE`
   antes de substituir o corpo compilado. Preserve qualquer mudanca posterior do banco.
2. Como `ESCALAINT`, execute `20261014_preparar_sync_usuario_escalaint.sql` uma vez.
   Ele adiciona o ID e a data da senha de origem a `SGN_ESC_USUARIO`.
3. O dono de `PK_ESCALA_INTELIGENTE` precisa de grants **diretos**, nao apenas por role,
   nas tabelas `ESCALAINT.SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA`,
   `SGN_ESC_USUARIO_SECAO`, `SGN_ESC_LOJA`, `SGN_ESC_SECAO`,
   `SGN_ESC_FUNCIONARIO` e na sequence `SGN_ESC_USUARIO_SEQ`.
4. Verifique que os perfis `GERENTE`, `LIDER`, `RH` e `OPERADOR` ja existem na Escala.

## Compilacao

Conectado ao schema de origem, compile `PK_ESCALA_INTELIGENTE.body.sql`.
O package specification e o agendamento atual nao mudam. Confira erros:

```sql
select line, position, text
  from user_errors
 where name = 'PK_ESCALA_INTELIGENTE'
   and type = 'PACKAGE BODY'
 order by sequence;
```

Confira tambem `USER_OBJECTS.STATUS = 'VALID'` para o package body. Nao rode a
carga completa manualmente em producao apenas para testar a compilacao; o job diario
executara a nova etapa ao final da carga de funcionarios. Depois do primeiro job,
confira o resultado em amostras das tres tabelas. O resumo `USUARIOS:` aparece no
`DBMS_OUTPUT` somente quando a sessao que chama a procedure o captura; ele nao e
automaticamente um registro persistente do `DBMS_SCHEDULER`.

## Regras

- O numero da loja vem do final do login. Sem loja cadastrada, login duplicado ou
  senha MD5 valida, a conta e ignorada e registrada no resumo.
- `GERENTE*` vira `GERENTE`, `LIDER*` vira `LIDER`, `ADM*` vira `RH`; demais viram `OPERADOR`.
- `SGN_USUARIO` nao informa atividade. Conta nova e criada com `STATUS='A'` e
  conta existente preserva seu status atual na Escala, inclusive `I`.
- Lider de Frente de Caixa recebe Frente de Caixa, Servicos a Clientes, Transportes
  e Portaria ativos da loja. Outros lideres sao vinculados a secao unica do
  colaborador identificado por `CODCOLIGADA`, `CHAPA` e loja; ambiguidades sao ignoradas.
- Senha MD5 nova substitui o hash local quando diferente ou quando
  `DT_HR_ULT_SENHA` avanca. O login da Escala ja converte MD5 para bcrypt.
- Contas `ADMIN` e `CONTROLADORIA` existentes nao sao alteradas.
- Na carga diaria, quem deixa a funcao Porteiro nao conserva o vinculo atual com
  a subsecao Porteiro. A migration `20261019_limpar_porteiro_funcao_divergente.sql`
  limpa os vinculos ja divergentes na Frente de Caixa sem alterar programacoes.
