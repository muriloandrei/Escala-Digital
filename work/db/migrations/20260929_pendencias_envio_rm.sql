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
  criar('create table sgn_esc_rm_envio (
    envio_id number(15) not null,
    operacao_id varchar2(36) not null,
    loja number(10) not null,
    mes_ref date not null,
    escsecao_id number(15) not null,
    escfunc_id number(15) not null,
    revisao number(10) not null,
    status varchar2(20) default ''PENDENTE'' not null,
    tentativas number(5) default 0 not null,
    erro varchar2(1000),
    dt_hr_incl date default sysdate not null,
    dt_hr_alter date default sysdate not null,
    constraint sgn_esc_rm_envio_pk primary key (envio_id),
    constraint sgn_esc_rm_envio_uk unique (loja, mes_ref, escfunc_id, revisao)
  )');
  criar('create sequence sgn_esc_rm_envio_seq start with 1 increment by 1 nocache');
  criar('create index sgn_esc_rm_envio_status_ix on sgn_esc_rm_envio (status, dt_hr_alter)');
  criar('create index sgn_esc_rm_envio_escopo_ix on sgn_esc_rm_envio (loja, mes_ref, escsecao_id)');
end;
/
