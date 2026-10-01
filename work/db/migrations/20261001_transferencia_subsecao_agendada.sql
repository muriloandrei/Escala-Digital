declare
  procedure criar(p_sql varchar2) is
  begin
    execute immediate p_sql;
  exception
    when others then
      if sqlcode != -955 then raise; end if;
  end;
begin
  criar('create table sgn_esc_transfer_sub (
    transf_id number(15) not null,
    operacao_id varchar2(36) not null,
    loja number(10) not null,
    escfunc_id number(15) not null,
    escsecao_id number(15) not null,
    origem_id number(15),
    destino_id number(15),
    dt_vigencia date not null,
    status varchar2(1) default ''P'' not null,
    tentativas number(3) default 0 not null,
    dt_proxima date default sysdate not null,
    dt_hr_claim date,
    dt_hr_incl date default sysdate not null,
    dt_hr_aplic date,
    usuario_id number(15),
    login varchar2(100),
    meses_gerados clob,
    erro varchar2(1000),
    constraint sgn_esc_transfer_sub_pk primary key (transf_id),
    constraint sgn_esc_transfer_sub_status_ck check (status in (''P'', ''E'', ''C'', ''F''))
  )');
  criar('create sequence sgn_esc_transfer_sub_seq start with 1 increment by 1 nocache');
  criar('create index sgn_esc_transfer_sub_pend_ix on sgn_esc_transfer_sub (status, dt_vigencia, dt_proxima)');
  criar('create unique index sgn_esc_transfer_sub_op_ix on sgn_esc_transfer_sub (operacao_id)');
end;
/
