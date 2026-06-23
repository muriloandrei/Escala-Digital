# Docker local

Este ambiente sobe a aplicacao Node.js e um Oracle Free local com as mesmas tabelas usadas pelo backend.

## Requisitos

- Docker Desktop instalado e em execucao.
- Porta 3000 livre para a aplicacao.
- Porta 1521 livre para o Oracle local.

## Subir o ambiente

~~~powershell
cd "C:\Users\Murilo\Documents\Escala de Trabalho\work"
docker compose up --build
~~~

Na primeira execucao o Oracle pode levar alguns minutos para inicializar e executar os scripts em docker/oracle/init.

Depois de subir:

- Aplicacao: http://localhost:3000/login.html
- Usuario: admin
- Senha: admin123

Conexao Oracle local para consulta externa:

- Host: localhost
- Porta: 1521
- Service name: FREEPDB1
- Usuario: ESCALA
- Senha: escala

## Dados criados automaticamente

Os scripts criam as tabelas principais do sistema:

- SGN_ESC_LOJA
- SGN_ESC_SECAO
- SGN_ESC_SECAO_TURNO
- SGN_ESC_FUNCAO
- SGN_ESC_FUNCIONARIO
- SGN_ESC_AUSENCIA
- SGN_ESC_PROG
- SGN_ESC_PROG_DIA
- SGN_ESC_USUARIO
- SGN_ESC_USUARIO_LOJA
- SGN_ESC_AUDITORIA

Tambem sao criados dados de teste para lojas, secoes, turnos, funcionarios, ausencias e usuarios.

## Reiniciar mantendo o banco

~~~powershell
docker compose restart app
~~~

## Recriar o banco do zero

Use isto quando alterar os scripts SQL de inicializacao ou quiser apagar os dados locais.

~~~powershell
docker compose down -v
docker compose up --build
~~~

## Observacoes

- O container usa Oracle thin mode via oracledb, entao nao precisa instalar Oracle Instant Client.
- As alteracoes em src reiniciam o Node automaticamente pelo node --watch. Alteracoes em public e views sao lidas pelo container a partir do proprio workspace.
- Este ambiente e apenas para desenvolvimento local. Nao use as senhas deste arquivo em producao.
