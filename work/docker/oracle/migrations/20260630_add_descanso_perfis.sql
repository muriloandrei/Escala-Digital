connect ESCALA/escala@FREEPDB1

begin
  execute immediate q'[create table SGN_ESC_TIPO_DESCANSO (
    ESCTIPODESC_ID number(15) not null,
    DESCR varchar2(100) not null,
    SIGLA varchar2(3) not null,
    CLASSIFICACAO varchar2(30) default 'OUTROS' not null,
    STATUS varchar2(1) default 'A' not null,
    DT_HR_INCL date default sysdate not null,
    constraint SGN_ESC_TIPO_DESC_PK primary key (ESCTIPODESC_ID),
    constraint SGN_ESC_TIPO_DESC_1_UK unique (SIGLA),
    constraint SGN_ESC_TIPO_DESC_STATUS_CK check (STATUS in ('A', 'I'))
  )]';
exception
  when others then
    if sqlcode != -955 then raise; end if;
end;
/

begin
  execute immediate 'create sequence SGN_ESC_TIPO_DESCANSO_SEQ start with 10 increment by 1 nocache';
exception
  when others then
    if sqlcode != -955 then raise; end if;
end;
/

begin
  execute immediate q'[create table SGN_ESC_PERFIL (
    PERFIL_ID number(15) not null,
    NOME varchar2(30) not null,
    DESCR varchar2(100),
    STATUS varchar2(1) default 'A' not null,
    DT_HR_INCL date default sysdate not null,
    constraint SGN_ESC_PERFIL_PK primary key (PERFIL_ID),
    constraint SGN_ESC_PERFIL_1_UK unique (NOME),
    constraint SGN_ESC_PERFIL_STATUS_CK check (STATUS in ('A', 'I'))
  )]';
exception
  when others then
    if sqlcode != -955 then raise; end if;
end;
/

begin
  execute immediate 'create sequence SGN_ESC_PERFIL_SEQ start with 10 increment by 1 nocache';
exception
  when others then
    if sqlcode != -955 then raise; end if;
end;
/

begin
  execute immediate q'[create table SGN_ESC_PERFIL_PERMISSAO (
    PERFIL_ID number(15) not null,
    PAGINA varchar2(60) not null,
    PODE_VISUALIZAR number(1) default 1 not null,
    PODE_EDITAR number(1) default 0 not null,
    PODE_EXCLUIR number(1) default 0 not null,
    DT_HR_INCL date default sysdate not null,
    constraint SGN_ESC_PERFIL_PERM_PK primary key (PERFIL_ID, PAGINA),
    constraint SGN_ESC_PERFIL_PERM_FK foreign key (PERFIL_ID) references SGN_ESC_PERFIL (PERFIL_ID),
    constraint SGN_ESC_PERFIL_VIS_CK check (PODE_VISUALIZAR in (0, 1)),
    constraint SGN_ESC_PERFIL_EDIT_CK check (PODE_EDITAR in (0, 1)),
    constraint SGN_ESC_PERFIL_EXCL_CK check (PODE_EXCLUIR in (0, 1))
  )]';
exception
  when others then
    if sqlcode != -955 then raise; end if;
end;
/

merge into SGN_ESC_TIPO_DESCANSO d
using (select 'Folga' descr, 'F' sigla, 'FOLGA' classificacao from dual union all select 'Ferias' descr, 'FER' sigla, 'FERIAS' classificacao from dual) s
on (d.sigla = s.sigla)
when not matched then insert (ESCTIPODESC_ID, DESCR, SIGLA, CLASSIFICACAO, STATUS, DT_HR_INCL) values (SGN_ESC_TIPO_DESCANSO_SEQ.nextval, s.descr, s.sigla, s.classificacao, 'A', sysdate);

merge into SGN_ESC_PERFIL p
using (select 'ADMIN' nome, 'Administracao completa' descr from dual union all select 'OPERADOR' nome, 'Operacao nas lojas permitidas' descr from dual) s
on (p.nome = s.nome)
when not matched then insert (PERFIL_ID, NOME, DESCR, STATUS, DT_HR_INCL) values (SGN_ESC_PERFIL_SEQ.nextval, s.nome, s.descr, 'A', sysdate);

merge into SGN_ESC_PERFIL_PERMISSAO pp
using (
  select p.perfil_id, x.pagina, 1 visualizar, case when p.nome = 'ADMIN' then 1 else x.editar end editar, case when p.nome = 'ADMIN' then 1 else 0 end excluir
  from SGN_ESC_PERFIL p
  cross join (
    select 'escalas' pagina, 1 editar from dual union all
    select 'escalas-funcionarios', 1 from dual union all
    select 'funcionarios', 1 from dual union all
    select 'secoes', 1 from dual union all
    select 'turnos-secao', 1 from dual union all
    select 'historico', 0 from dual union all
    select 'tipos-descanso', 1 from dual union all
    select 'acessos', 0 from dual union all
    select 'roles', 0 from dual union all
    select 'configuracoes', 0 from dual
  ) x
  where p.nome in ('ADMIN', 'OPERADOR')
) s
on (pp.perfil_id = s.perfil_id and pp.pagina = s.pagina)
when not matched then insert (PERFIL_ID, PAGINA, PODE_VISUALIZAR, PODE_EDITAR, PODE_EXCLUIR, DT_HR_INCL) values (s.perfil_id, s.pagina, s.visualizar, s.editar, s.excluir, sysdate);

commit;
