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
  criar('create table sgn_esc_evento (
    evento_id number(15) not null,
    operacao_id varchar2(36) not null,
    loja number(10) not null,
    mes_ref date not null,
    escsecao_id number(15),
    escfunc_id number(15),
    usuario_id number(15),
    login varchar2(100),
    acao varchar2(50) not null,
    origem varchar2(30) not null,
    situacao varchar2(30) not null,
    revisao_anterior number(10),
    revisao_nova number(10),
    detalhe clob not null,
    dt_hr_incl date default sysdate not null,
    constraint sgn_esc_evento_pk primary key (evento_id)
  )');
  criar('create sequence sgn_esc_evento_seq start with 1 increment by 1 nocache');
  criar('create index sgn_esc_evento_loja_mes_ix on sgn_esc_evento (loja, mes_ref, dt_hr_incl)');
  criar('create index sgn_esc_evento_func_ix on sgn_esc_evento (escfunc_id, dt_hr_incl)');
end;
/
