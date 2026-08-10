# Publicacao em Linux via PuTTY

## Visao geral

O servidor Linux deve rodar a aplicacao Node.js como servico `systemd`, com Nginx na frente como proxy reverso e Oracle acessado por variaveis de ambiente.

Fluxo recomendado:

1. Subir o codigo para um repositorio GitHub privado.
2. Acessar o servidor via PuTTY/SSH.
3. Clonar o repositorio em `/opt/escala-app`.
4. Criar `.env` somente no servidor.
5. Instalar dependencias com `npm ci --omit=dev`.
6. Configurar `systemd`.
7. Configurar Nginx.
8. Testar login, consulta de funcionarios e salvamento de escala.

## 1. Acesso via PuTTY

No PuTTY:

- Host Name: IP ou DNS do servidor.
- Port: `22`.
- Connection type: `SSH`.

Depois de conectar:

```bash
whoami
pwd
hostname
```

## 2. Pacotes do servidor

Exemplo em Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y git nginx unzip curl
```

Instalar Node.js LTS conforme padrao da empresa. Validar:

```bash
node -v
npm -v
```

## 3. Oracle Instant Client

Instalar o Oracle Instant Client compativel com o servidor Oracle.

Exemplo de diretorio:

```bash
/opt/oracle/instantclient_21_13
```

Adicionar bibliotecas:

```bash
echo /opt/oracle/instantclient_21_13 | sudo tee /etc/ld.so.conf.d/oracle-instantclient.conf
sudo ldconfig
```

Validar:

```bash
ldconfig -p | grep clntsh
```

## 4. Usuario Linux da aplicacao

```bash
sudo useradd -r -m -d /opt/escala-app escalaapp
sudo mkdir -p /opt/escala-app
sudo chown -R escalaapp:escalaapp /opt/escala-app
```

## 5. Baixar codigo do GitHub privado

```bash
sudo -u escalaapp git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git /opt/escala-app
cd /opt/escala-app
```

Se o servidor nao puder autenticar via HTTPS, usar chave SSH cadastrada no GitHub.

## 6. Criar `.env` no servidor

Criar o arquivo:

```bash
sudo -u escalaapp nano /opt/escala-app/.env
```

Conteudo base:

```txt
NODE_ENV=production
PORT=3000

ORACLE_USER=usuario_da_aplicacao
ORACLE_PASSWORD=senha_nova_nao_exposta
ORACLE_CONNECT_STRING=host-ou-ip:1521/service_name
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1

JWT_SECRET=segredo-longo-com-32-caracteres-ou-mais
JWT_EXPIRES_IN=8h
COOKIE_SECURE=true
TRUST_PROXY=1

RATE_LIMIT_API_WINDOW_MS=900000
RATE_LIMIT_API_MAX=1500
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_LOGIN_MAX=30

RM_API_ENABLED=false
RM_API_BASE_URL=https://rm.exemplo.local
RM_API_USER=usuario_rm
RM_API_PASSWORD=senha_rm_rotacionada
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

Permissao:

```bash
sudo chown escalaapp:escalaapp /opt/escala-app/.env
sudo chmod 600 /opt/escala-app/.env
```

Observacoes:

- Mantenha `RM_API_ENABLED=false` ate validar a URL real, usuario e senha rotacionada da API RM.
- Nunca versionar usuario, senha, token ou header Basic/Auth real.
- Se acessar direto por `http://IP:3000`, use `COOKIE_SECURE=false` temporariamente; com HTTPS via Nginx, use `COOKIE_SECURE=true`.
- Para testar a conectividade RM, rode um `curl` do proprio servidor Linux para `RM_API_BASE_URL + RM_API_FUNCIONARIO_PATH`. Se a aplicacao registrar `fetch failed`, normalmente e rede, firewall, porta, DNS, URL sem `http://` ou timeout, antes de ser erro de payload.
- Depois do login como usuario autorizado, use `/api/diagnostics/oracle` para conferir tabelas/sequences e `/api/diagnostics/rm` para conferir conectividade basica do RM sem retornar senha, usuario ou token.

## 7. Instalar dependencias

```bash
cd /opt/escala-app
sudo -u escalaapp npm ci --omit=dev
```

## 7.1 Aplicar migrations Oracle

Antes de reiniciar a aplicacao em um banco ja existente, execute as migrations novas com o usuario dono do schema ou um usuario com permissao de alteracao:

```bash
cd /opt/escala-app
sqlplus USUARIO/SENHA@HOST:1521/SERVICE @work/docker/oracle/migrations/20260630_add_prog_ativa.sql
sqlplus USUARIO/SENHA@HOST:1521/SERVICE @work/docker/oracle/migrations/20260701_add_tipo_descanso_classificacao.sql
sqlplus USUARIO/SENHA@HOST:1521/SERVICE @work/docker/oracle/migrations/20260807_rm_rules_horarios.sql
sqlplus USUARIO/SENHA@HOST:1521/SERVICE @work/docker/oracle/migrations/20260810_add_funcionario_cpf.sql
```

A migration `20260807_rm_rules_horarios.sql` cria:

- `SGN_ESC_HORARIO_PADRAO` e `SGN_ESC_HORARIO_PADRAO_SEQ`;
- `SGN_ESC_RM_LOG` e `SGN_ESC_RM_LOG_SEQ`;
- campos opcionais em `SGN_ESC_PROG` para guardar o turno oficial inicial do funcionario;
- permissoes das novas telas para perfis existentes.

A migration `20260810_add_funcionario_cpf.sql` adiciona `SGN_ESC_FUNCIONARIO.CPF`. Preencha esse campo antes de habilitar a integracao RM, pois a oficializacao consulta o funcionario no RM pelo CPF para obter `CODCOLIGADA` e `CODTABFOLGA`.

## 8. Teste manual antes do servico

```bash
cd /opt/escala-app
sudo -u escalaapp npm start
```

Em outro terminal ou sessao:

```bash
curl http://127.0.0.1:3000/health
```

Parar o processo manual com `Ctrl+C`.

## 9. Criar servico `systemd`

Criar:

```bash
sudo nano /etc/systemd/system/escala-app.service
```

Conteudo:

```ini
[Unit]
Description=Escala Digital
After=network.target

[Service]
Type=simple
User=escalaapp
Group=escalaapp
WorkingDirectory=/opt/escala-app
EnvironmentFile=/opt/escala-app/.env
ExecStart=/usr/bin/node /opt/escala-app/src/server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable escala-app
sudo systemctl start escala-app
sudo systemctl status escala-app
```

Logs:

```bash
sudo journalctl -u escala-app -f
```

## 10. Configurar Nginx

Criar:

```bash
sudo nano /etc/nginx/sites-available/escala-app
```

Conteudo:

```nginx
server {
  listen 80;
  server_name escala.seudominio.local;

  client_max_body_size 10m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/escala-app /etc/nginx/sites-enabled/escala-app
sudo nginx -t
sudo systemctl reload nginx
```

Em producao com HTTPS no Nginx, manter `COOKIE_SECURE=true` e `TRUST_PROXY=1`.

Se o teste for feito acessando diretamente `http://IP_DO_SERVIDOR:3000/app`, sem HTTPS e sem Nginx, usar temporariamente:

```txt
COOKIE_SECURE=false
TRUST_PROXY=false
```

Com `COOKIE_SECURE=true` em HTTP direto, o navegador ignora o cookie de login e a tela volta como `Login necessario`.

## 11. Checklist de validacao

1. `systemctl status escala-app` ativo.
2. `curl http://127.0.0.1:3000/health` responde.
3. Tela de login abre pelo DNS/IP.
4. Usuario real consegue logar.
5. Usuario sem permissao nao acessa loja indevida.
6. Consulta de lojas funciona.
7. Consulta de funcionarios funciona.
8. Consulta de ausencias funciona.
9. Geracao de escala funciona.
10. Salvamento no Oracle grava `SGN_ESC_PROG` e `SGN_ESC_PROG_DIA`.
11. Validacao bloqueia funcionario ausente em dia trabalhado.
12. Tela de regras carrega as regras vigentes.
13. Tela de horarios padrao lista a jornada 08:48 com intervalo 1:10.
14. Oficializacao grava auditoria e log RM como enviado, falha ou ignorado.
15. Logs nao mostram senha, token ou dados sensiveis.
16. Smoke test de API passa em loja/mes controlado.

Para executar o smoke test no servidor, escolha uma loja e um mes futuro reservado para validacao. O teste cria a escala, gera revisao individual, oficializa e inativa ao final:

```bash
cd /opt/escala-app
SMOKE_BASE_URL=http://127.0.0.1:3000 \
SMOKE_LOGIN=admin \
SMOKE_PASSWORD='senha_do_admin' \
SMOKE_LOJA_ID=1 \
SMOKE_MES_REF=2028-01-01 \
SMOKE_ALLOW_WRITE=true \
npm run smoke:api
```

Nao use uma loja/mes operacional real nesse smoke.

## 11.1 Diagnostico Oracle

Fazer login com usuario `ADMIN` e acessar:

```txt
/api/diagnostics/oracle
```

A resposta esperada deve ter:

```json
{
  "driver": "oracle",
  "status": "ok",
  "tables": {
    "missing": []
  },
  "sequences": {
    "missing": []
  }
}
```

Se `missing` retornar alguma tabela ou sequence, o usuario Oracle da aplicacao nao esta enxergando esse objeto ou o nome esta diferente do esperado pelo backend.

## 11.2 Diagnostico quando o login retorna erro interno

No servidor, dentro da pasta da aplicacao:

```bash
cd /opt/escala-app
node scripts/check-oracle-login.js admin admin123
```

O script valida:

- conexao Oracle;
- schema conectado;
- existencia do usuario em `SGN_ESC_USUARIO`;
- `STATUS`;
- se `SENHA_HASH` esta em formato bcrypt valido;
- se a senha informada confere;
- lojas vinculadas em `SGN_ESC_USUARIO_LOJA`.

Se `SENHA_HASH bcrypt valido` retornar `nao`, gere um hash:

```bash
node scripts/hash-password.js "admin123"
```

Depois atualize o usuario no Oracle:

```sql
update SGN_ESC_USUARIO
set SENHA_HASH = '<HASH_GERADO>',
    STATUS = 'A',
    PERFIL = 'ADMIN'
where upper(LOGIN) = 'ADMIN';

commit;
```

Se o usuario nao existir, crie conforme o exemplo em `docs/database.md`.

## 12. Atualizar versao no servidor

Depois de enviar alteracoes para o GitHub:

```bash
cd /opt/escala-app
sudo -u escalaapp git pull
sudo -u escalaapp npm ci --omit=dev
sudo -u escalaapp node --check work/src/server.js
sudo systemctl restart escala-app
sudo systemctl status escala-app
```

## 13. Rollback simples

Ver commits:

```bash
cd /opt/escala-app
sudo -u escalaapp git log --oneline -5
```

Voltar para um commit especifico:

```bash
sudo -u escalaapp git checkout HASH_DO_COMMIT
sudo -u escalaapp npm ci --omit=dev
sudo systemctl restart escala-app
```

Depois, planejar a correcao em uma branch nova.
