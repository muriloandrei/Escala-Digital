set define off

begin
  execute immediate 'alter table SGN_ESC_PROG add (ESCSECAOTURNO_ID number(15))';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PROG add (HR_OFICIAL_ENT1 varchar2(5))';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PROG add (HR_OFICIAL_SAI1 varchar2(5))';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PROG add (HR_OFICIAL_ENT2 varchar2(5))';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate 'alter table SGN_ESC_PROG add (HR_OFICIAL_SAI2 varchar2(5))';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

begin
  execute immediate q'[
    create table SGN_ESC_HORARIO_PADRAO (
      ESCHORPAD_ID number(15) not null,
      DESCR varchar2(100) not null,
      HR_ENT1 varchar2(5) not null,
      HR_SAI1 varchar2(5) not null,
      HR_ENT2 varchar2(5) not null,
      HR_SAI2 varchar2(5) not null,
      JORNADA_MINUTOS number(5) default 528 not null,
      INTERVALO_MINUTOS number(5) default 70 not null,
      STATUS varchar2(1) default 'A' not null,
      DT_HR_INCL date default sysdate not null,
      constraint SGN_ESC_HOR_PAD_PK primary key (ESCHORPAD_ID),
      constraint SGN_ESC_HOR_PAD_STATUS_CK check (STATUS in ('A', 'I'))
    )
  ]';
exception when others then
  if sqlcode != -955 then raise; end if;
end;
/

begin
  execute immediate 'create sequence SGN_ESC_HORARIO_PADRAO_SEQ start with 10 increment by 1 nocache';
exception when others then
  if sqlcode != -955 then raise; end if;
end;
/

merge into SGN_ESC_HORARIO_PADRAO h
using (select 'Jornada 08:48 com 1:10 de almoco' descr from dual) src
on (h.descr = src.descr)
when not matched then
  insert (ESCHORPAD_ID, DESCR, HR_ENT1, HR_SAI1, HR_ENT2, HR_SAI2, JORNADA_MINUTOS, INTERVALO_MINUTOS, STATUS, DT_HR_INCL)
  values (SGN_ESC_HORARIO_PADRAO_SEQ.nextval, src.descr, '08:00', '12:00', '13:10', '17:58', 528, 70, 'A', sysdate);

begin
  execute immediate q'[
    create table SGN_ESC_RM_LOG (
      ESCRMLOG_ID number(15) not null,
      LOJA number(10),
      MES_REF date,
      REVISAO number(2),
      ESCFUNC_ID number(15),
      CHAPA varchar2(8),
      CPF varchar2(20),
      ACAO varchar2(40) not null,
      STATUS varchar2(20) not null,
      MENSAGEM varchar2(1000),
      PAYLOAD_RESUMO varchar2(1000),
      DT_HR_INCL date default sysdate not null,
      constraint SGN_ESC_RM_LOG_PK primary key (ESCRMLOG_ID)
    )
  ]';
exception when others then
  if sqlcode != -955 then raise; end if;
end;
/

begin
  execute immediate 'create sequence SGN_ESC_RM_LOG_SEQ start with 1 increment by 1 nocache';
exception when others then
  if sqlcode != -955 then raise; end if;
end;
/

merge into SGN_ESC_PERFIL_PERMISSAO pp
using (
  select p.perfil_id, pagina, case when upper(p.nome) = 'ADMIN' then 1 else editar end editar
  from SGN_ESC_PERFIL p
  cross join (
    select 'regras' pagina, 0 editar from dual union all
    select 'horarios-padrao', 1 from dual union all
    select 'integracao-rm', 0 from dual
  )
) src
on (pp.perfil_id = src.perfil_id and pp.pagina = src.pagina)
when not matched then
  insert (PERFIL_ID, PAGINA, PODE_VISUALIZAR, PODE_EDITAR, PODE_EXCLUIR, DT_HR_INCL)
  values (src.perfil_id, src.pagina, 1, src.editar, case when src.editar = 1 and src.pagina <> 'integracao-rm' then src.editar else 0 end, sysdate);

commit;
