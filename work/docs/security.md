# Seguranca

## Riscos principais

- Credencial do Oracle exposta em print, chat, planilha ou codigo.
- SQL injection por concatenacao de parametros.
- XSS em campos de nome, motivo, loja ou escala editavel.
- Usuario acessando loja fora da permissao trocando `lojaId` na URL.
- Sobrescrita de escala por edicoes simultaneas.
- Backup local com dados sensiveis.
- Sessao sem HTTPS em producao.

## Medidas adotadas no inicio do projeto

- Credenciais somente em `.env`.
- Consultas com bind parameters.
- Cookie `httpOnly` para token de acesso.
- Rate limit separado para login e API interna, sem contar `/api/auth/login` no limite geral.
- `helmet` para cabecalhos de seguranca.
- Autorizacao por loja em middleware.
- Frontend escrevendo dados de tabela com `textContent`, nao `innerHTML`.

## Medidas ainda necessarias

- Trocar a senha do schema exposta.
- Criar usuario Oracle com permissoes minimas para a aplicacao.
- Ativar HTTPS no Nginx.
- Criar auditoria completa para login, salvamento, alteracao e exclusao.
- Implementar controle de revisao antes de atualizar escala existente.
- Revisar periodicamente os limites de login e API conforme volume real das lojas.
- Criar testes de regressao da regra da escala.
