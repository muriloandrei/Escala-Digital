set define off

declare
  procedure criar(p_sql varchar2) is
  begin
    execute immediate p_sql;
  exception
    when others then
      if sqlcode != -955 then raise; end if;
  end;
begin
  criar('create table sgn_esc_treinamento (
    usuario_id number(15) not null,
    versao number(5) not null,
    etapa number(5) default 0 not null,
    dt_hr_alter date default sysdate not null,
    constraint sgn_esc_treinamento_pk primary key (usuario_id),
    constraint sgn_esc_treinamento_etapa_ck check (etapa between 0 and 7)
  )');
end;
/
