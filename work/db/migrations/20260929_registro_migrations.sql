set define off

declare
begin
  execute immediate 'create table sgn_esc_migracao (
    arquivo varchar2(200) not null,
    checksum_sha256 varchar2(64) not null,
    aplicado_em date default sysdate not null,
    aplicado_por varchar2(100) not null,
    constraint sgn_esc_migracao_pk primary key (arquivo)
  )';
exception
  when others then
    if sqlcode != -955 then raise; end if;
end;
/
