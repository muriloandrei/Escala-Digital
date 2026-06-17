# Banco Oracle

## Tabelas existentes esperadas

- `SGN_ESC_FUNCIONARIO`: funcionarios.
- `SGN_ESC_AUSENCIA`: ausencias.
- `SGN_ESC_LOJA`: lojas.
- `SGN_ESC_FUNCAO`: funcoes.
- `SGN_ESC_SECAO`: secoes.
- `SGN_ESC_PROG`: cabecalho da escala/programacao.
- `SGN_ESC_PROG_DIA`: dias da escala/programacao.

## Tabelas recomendadas para autenticacao

```sql
create table SGN_ESC_USUARIO (
  USUARIO_ID number(15) not null,
  LOGIN varchar2(80) not null,
  NOME varchar2(100) not null,
  SENHA_HASH varchar2(255) not null,
  PERFIL varchar2(20) default 'OPERADOR' not null,
  STATUS varchar2(1) default 'A' not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_USUARIO_PK primary key (USUARIO_ID),
  constraint SGN_ESC_USUARIO_1_UK unique (LOGIN),
  constraint SGN_ESC_USUARIO_STATUS_CK check (STATUS in ('A', 'I'))
);

create table SGN_ESC_USUARIO_LOJA (
  USUARIO_ID number(15) not null,
  LOJA number(10) not null,
  constraint SGN_ESC_USULOJA_PK primary key (USUARIO_ID, LOJA),
  constraint SGN_ESC_USULOJA_1_FK foreign key (USUARIO_ID)
    references SGN_ESC_USUARIO (USUARIO_ID)
);

create table SGN_ESC_AUDITORIA (
  AUDITORIA_ID number(15) not null,
  USUARIO_ID number(15),
  ACAO varchar2(40) not null,
  ENTIDADE varchar2(40) not null,
  ENTIDADE_ID number(15),
  LOJA number(10),
  DETALHE clob,
  IP_ORIGEM varchar2(45),
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_AUDITORIA_PK primary key (AUDITORIA_ID)
);
```

## Tabela complementar para turnos por secao

A tabela `SGN_ESC_SECAO` contem o cadastro da secao, mas nao possui os horarios do turno padrao. Para a tela `Secoes` e para o gerador criar turnos por secao, crie a tabela complementar abaixo:

```sql
create table SGN_ESC_SECAO_TURNO (
  ESCSECAOTURNO_ID number(15) not null,
  ESCSECAO_ID number(15) not null,
  HR_ENT1 varchar2(5) not null,
  HR_SAI1 varchar2(5) not null,
  HR_ENT2 varchar2(5) not null,
  HR_SAI2 varchar2(5) not null,
  QTDE_COLABORADORES number(5) not null,
  DT_HR_INCL date default sysdate not null,
  constraint SGN_ESC_SECAO_TURNO_PK primary key (ESCSECAOTURNO_ID),
  constraint SGN_ESC_SECAO_TURNO_1_UK unique (ESCSECAO_ID),
  constraint SGN_ESC_SECAO_TURNO_1_FK foreign key (ESCSECAO_ID)
    references SGN_ESC_SECAO (ESCSECAO_ID)
);
```

## Sequences esperadas

O backend inicial usa sequences para inserts:

```sql
create sequence SGN_ESC_PROG_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_PROG_DIA_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_SECAO_TURNO_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_USUARIO_SEQ start with 1 increment by 1 nocache;
create sequence SGN_ESC_AUDITORIA_SEQ start with 1 increment by 1 nocache;
```

Se o banco ja usa triggers ou outra estrategia para IDs, a camada `escalaService.js` deve ser ajustada para seguir o padrao existente.

## Hash de senha

Nunca inserir senha pura em `SGN_ESC_USUARIO`. Gere hash `bcrypt` no backend ou em script administrativo controlado.

Para gerar um hash antes de inserir um usuario admin:

```bash
node scripts/hash-password.js "senha-do-usuario"
```

Exemplo de insert, ajustando IDs conforme o ambiente:

```sql
insert into SGN_ESC_USUARIO (
  USUARIO_ID, LOGIN, NOME, SENHA_HASH, PERFIL, STATUS, DT_HR_INCL
) values (
  SGN_ESC_USUARIO_SEQ.nextval,
  'admin',
  'Administrador',
  '<HASH_BCRYPT_GERADO>',
  'ADMIN',
  'A',
  sysdate
);

insert into SGN_ESC_USUARIO_LOJA (USUARIO_ID, LOJA)
select USUARIO_ID, 101
from SGN_ESC_USUARIO
where LOGIN = 'admin';
```

Quando o usuario possui lojas em `SGN_ESC_USUARIO_LOJA`, os filtros exibem apenas essas lojas. Para `ADMIN`, o backend so libera todas as lojas quando nao existe nenhum vinculo cadastrado para o usuario.
