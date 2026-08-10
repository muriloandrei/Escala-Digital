# Escala Digital

Aplicacao web para gerar, consultar e salvar escalas diretamente em banco Oracle.

## Decisoes

- Backend em Node.js para reaproveitar as regras JavaScript sem reescrita em outra linguagem.
- Frontend separado em HTML, CSS e JavaScript.
- Oracle e obrigatorio: nao existe modo de simulacao local nesta branch.
- Credenciais do Oracle somente por variaveis de ambiente.
- Login validado no backend, com senha armazenada como hash bcrypt.
- Regras de calculo isoladas em modulo proprio.

## Estrutura

```txt
work/
  public/
    css/app-original.css
    js/app-original.js
    js/escala-rules-core.js
    js/login.js
  src/
    config/env.js
    db/oracle.js
    middleware/
    routes/
    rules/escalaRules.js
    services/
    server.js
  docs/
```

## Setup local ou servidor

1. Instalar Node.js LTS.
2. Instalar Oracle Instant Client compativel com o servidor.
3. Criar `.env` com as variaveis obrigatorias:

```env
JWT_SECRET=troque-por-uma-chave-forte
ORACLE_USER=usuario_da_aplicacao
ORACLE_PASSWORD=senha_da_aplicacao
ORACLE_CONNECT_STRING=host:porta/service
PORT=3000
COOKIE_SECURE=false
TRUST_PROXY=false
RATE_LIMIT_API_MAX=1500
RATE_LIMIT_LOGIN_MAX=30
RM_API_ENABLED=false
RM_API_BASE_URL=https://rm.exemplo.local
RM_API_USER=usuario_rm
RM_API_PASSWORD=senha_rm
RM_API_TIMEOUT_MS=15000
RM_API_RETRIES=2
RM_API_FUNCIONARIO_PATH=/api/framework/v1/consultaSQLServer/RealizaConsulta/INTEG_ESCALA/0/P
RM_API_FOLGAS_PATH=/rmsrestdataserver/rest/PtoAdtTabFolgaData
RM_API_FOLGAS_POST_CODCOLIGADA=0
RM_API_FOLGA_HORA_INICIO=480
RM_API_FOLGA_HORA_FIM=720
RM_API_FOLGA_HORA_INICIO_STR=08:00
RM_API_FOLGA_HORA_FIM_STR=12:00
RM_API_TIMEZONE_OFFSET=-03:00
```

4. Instalar dependencias:

```bash
npm install
```

5. Iniciar:

```bash
npm start
```

6. Abrir:

```txt
http://localhost:3000/login.html
```

## Testes

Os testes automatizados mantidos nesta branch cobrem regras puras de calculo, sem simular banco.

```bash
npm test
```

Para validar a integracao real com Oracle, use o login da aplicacao e o diagnostico protegido:

```txt
/api/diagnostics/oracle
```

## Roteiros do projeto

- [Escopo restante](docs/alteracoes-restantes.md)
- [Escopo de desenvolvimento Savegnago](docs/escopo-dev-savegnago.md)
- [Banco Oracle](docs/database.md)
- [Requisicoes de banco](docs/requisicoes-banco.md)
- [Seguranca](docs/security.md)
- [Deploy Linux via PuTTY](docs/deploy-linux-putty.md)
- [GitHub privado](docs/github-privado.md)

## Observacao sobre credenciais

A senha usada em qualquer print, chat ou documento deve ser tratada como exposta. Troque a senha do schema antes de conectar esta aplicacao ao banco real.

## Docker local

Para testar com Oracle local em Docker:

~~~powershell
cd "C:\Users\Murilo\Documents\Escala de Trabalho\work"
docker compose up --build
~~~

Acesse http://localhost:3000/login.html com admin / admin123.
Mais detalhes em docs/docker-local.md.

## Atualizacao de banco

Antes de subir a versao Linux em um banco ja existente, execute as migrations em `docker/oracle/migrations`, especialmente:

```txt
20260630_add_prog_ativa.sql
20260701_add_tipo_descanso_classificacao.sql
20260807_rm_rules_horarios.sql
20260810_add_funcionario_cpf.sql
```

A migration `20260807_rm_rules_horarios.sql` adiciona horarios padrao, log de integracao RM e campos opcionais de turno oficial na escala mensal.
A migration `20260810_add_funcionario_cpf.sql` adiciona `SGN_ESC_FUNCIONARIO.CPF`, necessario para buscar o funcionario no RM durante a oficializacao.
