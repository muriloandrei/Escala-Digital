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
DB_DRIVER=oracle

ORACLE_USER=usuario_da_aplicacao
ORACLE_PASSWORD=senha_nova_nao_exposta
ORACLE_CONNECT_STRING=host-ou-ip:1521/service_name
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1

JWT_SECRET=segredo-longo-com-32-caracteres-ou-mais
JWT_EXPIRES_IN=8h
COOKIE_SECURE=true
```

Permissao:

```bash
sudo chown escalaapp:escalaapp /opt/escala-app/.env
sudo chmod 600 /opt/escala-app/.env
```

## 7. Instalar dependencias

```bash
cd /opt/escala-app
sudo -u escalaapp npm ci --omit=dev
```

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

Em producao, configurar HTTPS e manter `COOKIE_SECURE=true`.

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
12. Logs nao mostram senha, token ou dados sensiveis.

## 12. Atualizar versao no servidor

Depois de enviar alteracoes para o GitHub:

```bash
cd /opt/escala-app
sudo -u escalaapp git pull
sudo -u escalaapp npm ci --omit=dev
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
