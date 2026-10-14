# Sincronizacao de usuarios com SGN_USUARIO

## Escopo

A rotina consulta `SGN_USUARIO` no schema de origem e grava em `ESCALAINT.SGN_ESC_USUARIO`,
`ESCALAINT.SGN_ESC_USUARIO_LOJA` e, para o lider de Frente de Caixa, em
`ESCALAINT.SGN_ESC_USUARIO_SECAO`. Ela nao modifica a package de funcionarios,
nao le usuarios do RM e nao altera contas `ADMIN` ou `CONTROLADORIA` existentes.

- `GERENTE...` vira `GERENTE`; `LIDER...` vira `LIDER`; `ADM...` vira `RH`; demais viram `OPERADOR`.
- A loja e inferida dos ultimos 1 a 4 digitos do login. A loja deve existir em `SGN_ESC_LOJA`.
- `SGN_USUARIO` nao possui coluna de status. Conta nova elegivel recebe `STATUS = 'A'`
  no destino. Conta existente preserva seu status local, inclusive se estiver inativa.
- Como nao ha indicador de atividade na origem, a rotina nao inativa contas automaticamente.
  Uma conta que nao deva acessar a Escala precisa ser inativada no destino por um administrador.
- Para contas existentes com bcrypt, a primeira execucao compara a data da senha da origem
  com a data de criacao da conta local. Se a senha da origem for posterior, ela prevalece;
  caso contrario, a rotina registra uma linha de base sem substituir o bcrypt. Uma data
  posterior em `DT_HR_ULT_SENHA` substitui o hash local pelo MD5 novo; no login,
  a aplicacao converte esse MD5 para bcrypt. Um MD5 local divergente e substituido imediatamente.
- Logins duplicados, loja inexistente, lider sem secao inequivoca e conflito de ID sao ignorados e
  apresentados na previa. Nao existe concessao generica de todas as secoes a um lider.

## Pre-requisitos

1. Fazer backup do schema `ESCALAINT` e publicar o codigo aprovado.
2. Aplicar a migration `20261014_usuario_origem_sync.sql` como `ESCALAINT`, com o executor de migrations.
3. Confirmar que o schema de origem enxerga `ESCALAINT.SGN_ESC_USUARIO`, `SGN_ESC_USUARIO_LOJA`,
   `SGN_ESC_USUARIO_SECAO`, `SGN_ESC_LOJA`, `SGN_ESC_SECAO` e a sequence `SGN_ESC_USUARIO_SEQ`,
   com os grants necessarios de consulta e escrita. A package de funcionarios ja usa parte desse acesso.
4. Configurar um arquivo de ambiente protegido para o schema de **origem** com
   `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_CONNECT_STRING`. Nao usar a conta `ESCALAINT`
   para ler `SGN_USUARIO` sem grant explicito. Nao passar senha na linha de comando.

## Validacao e aplicacao

No checkout da versao publicada, dentro de `work`:

```bash
ESCALA_ENV_FILE=/caminho/protegido/origem.env npm run usuarios:diagnosticar-origem -- --sample=20
ESCALA_ENV_FILE=/caminho/protegido/origem.env npm run usuarios:sincronizar-origem
```

Conferir totais, logins ignorados e senhas com `bcrypt sem linha de base`. A primeira previa nao
exibe hashes. Somente depois da validacao, executar:

```bash
ESCALA_ENV_FILE=/caminho/protegido/origem.env npm run usuarios:sincronizar-origem -- --apply --by=OPERADOR
```

O modo `--apply` usa uma transacao; em falha, a transacao e revertida. Repetir a previa deve mostrar
zero contas novas e zero senhas a substituir. Conferir logins de teste das quatro categorias e
verificar que uma mudanca de senha na origem invalida a sessao anterior.

## Job diario

Depois de validar a primeira carga, chamar o comando de aplicacao
apos a execucao bem-sucedida de `PK_ESCALA_INTELIGENTE.PKB_INTEGRA_CADASTRO`. Nao inserir o
comando Node dentro da package PL/SQL. Se o job for `DBMS_SCHEDULER`, criar uma etapa externa
separada ou agendar pelo sistema operacional com dependencia explicita; monitorar codigo de saida
e totais ignorados. A rotina de usuarios nao deve rodar se a carga cadastral anterior falhar.

Usuarios novos sem loja cadastrada devem aguardar a carga da loja; nao recebem acesso provisoriamente.
