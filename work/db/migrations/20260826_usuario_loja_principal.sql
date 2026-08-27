alter table SGN_ESC_USUARIO add (
  LOJA_PRINCIPAL number(10)
);

alter table SGN_ESC_USUARIO add constraint SGN_ESC_USUARIO_LOJA_PRINC_CK
  check (LOJA_PRINCIPAL is null or LOJA_PRINCIPAL > 0);
