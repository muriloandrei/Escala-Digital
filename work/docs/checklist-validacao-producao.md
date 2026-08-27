# Checklist de Validação e Deploy Produção

Este checklist fecha os itens que não podem ser comprovados apenas no Docker local: integração RM real, volume de produção, DNS, HTTPS, Nginx, systemd e rollback.

## 1. Sincronizar Código no Linux

```bash
cd /opt/escala-app/work
git fetch origin
git checkout Escala-2.0
git pull origin Escala-2.0
npm ci --omit=dev
```

## 2. Variáveis Obrigatórias no `.env`

Manter o arquivo fora do Git.

```env
NODE_ENV=production
PORT=3000
TRUST_PROXY=true

ORACLE_USER=
ORACLE_PASSWORD=
ORACLE_CONNECT_STRING=

JWT_SECRET=
SESSION_COOKIE_SECURE=true

RM_API_BASE_URL=
RM_API_USERNAME=
RM_API_PASSWORD=
RM_API_TIMEOUT_MS=30000
RM_API_RETRY_COUNT=2
RM_API_RETRY_DELAY_MS=1000
RM_SQL_CODCOLIGADA=0
RM_SQL_CODAPLICACAO=P
RM_SQL_CONSULTA=INTEG_ESCALA
```

Validar que nenhuma credencial aparece em arquivos versionados:

```bash
git grep -n "Basic\\|Authorization\\|PASSWORD\\|TOKEN" -- . ':!package-lock.json'
```

## 3. Migrations

Rodar no schema da aplicação antes de reiniciar:

```sql
@db/migrations/20260813_usuario_secao.sql
@db/migrations/20260813_perfis_operacionais.sql
@db/migrations/20260826_usuario_loja_principal.sql
```

Confirmar objetos principais:

```sql
select count(*) from sgn_esc_usuario_secao;
select count(*) from sgn_esc_perfil;
select count(*) from sgn_esc_perfil_perm;
```

## 4. Nginx

Exemplo de proxy HTTP. Para HTTPS, adicionar certificado válido e redirecionamento 80 -> 443.

```nginx
server {
    listen 80;
    server_name escalainteligente.savegnago.com.br;

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

Validação:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I http://127.0.0.1
curl -I http://escalainteligente.savegnago.com.br
```

## 5. HTTPS e DNS

Antes de publicar para usuários:

- DNS `A` ou `CNAME` precisa resolver `escalainteligente.savegnago.com.br` para o servidor/proxy correto.
- Porta `80` precisa responder para emissão/renovação do certificado.
- Porta `443` precisa estar liberada no firewall interno e cloud.
- Certificado precisa conter exatamente `escalainteligente.savegnago.com.br`.

Validação:

```bash
dig escalainteligente.savegnago.com.br
curl -Iv https://escalainteligente.savegnago.com.br
openssl s_client -connect escalainteligente.savegnago.com.br:443 -servername escalainteligente.savegnago.com.br </dev/null
```

## 6. systemd

```bash
sudo systemctl daemon-reload
sudo systemctl restart escala-app
sudo systemctl status escala-app --no-pager
journalctl -u escala-app -n 200 --no-pager
```

## 7. Smoke Tests Pós-Deploy

```bash
cd /opt/escala-app/work
SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke:perfis
SMOKE_BASE_URL=http://127.0.0.1:3000 SMOKE_LOJA_ID=10 SMOKE_MES_REF=2028-01-01 npm run smoke:api
```

Validar manualmente no navegador:

- `ADMIN`: cria escala, abre escala, edita dia, valida, salva, oficializa, acessa configurações.
- `RH`: acessa escalas e liberação de seções.
- `LIDER`: inicia em tela operacional, vê somente seções liberadas, não vê criação de nova escala nem telas administrativas.
- `OPERADOR`: acesso somente às páginas liberadas para consulta/operação.

## 8. Integração RM

Confirmar rede primeiro:

```bash
curl -v --connect-timeout 15 "$RM_API_BASE_URL/api/framework/v1/consultaSQLServer/RealizaConsulta/$RM_SQL_CONSULTA/0/$RM_SQL_CODAPLICACAO?parameters=CPF%3D40734215819"
```

Depois validar com uma escala controlada:

- Funcionário precisa ter `CPF` preenchido em `SGN_ESC_FUNCIONARIO`.
- Consulta RM deve selecionar cadastro com `CODSITUACAO = 'A'`.
- Oficialização deve registrar sucesso/falha em auditoria/log RM.
- Reprocessamento deve sincronizar apenas pendências/falhas.

## 9. Performance

Executar com volume próximo do real: 80 lojas, mais de 100 funcionários por loja, múltiplas revisões e logs RM.

```bash
time curl -s "http://127.0.0.1:3000/api/escalas/resumo?lojaId=10&mesRef=2026-08-01" >/dev/null
time curl -s "http://127.0.0.1:3000/api/catalog/funcionarios?lojaId=10&mesRef=2026-08-01" >/dev/null
```

Metas iniciais:

- Listagens principais abaixo de 2 segundos.
- Telas com paginação em controle de acesso.
- Logs sem dados sensíveis.

## 10. Rollback

Antes do deploy:

```bash
git rev-parse HEAD
cp .env .env.backup.$(date +%Y%m%d%H%M)
```

Rollback de código:

```bash
cd /opt/escala-app/work
git checkout <commit_anterior_estavel>
npm ci --omit=dev
sudo systemctl restart escala-app
```

Rollback de banco deve ser planejado por migration reversa quando houver alteração estrutural. Não apagar dados de escala; usar inativação.
