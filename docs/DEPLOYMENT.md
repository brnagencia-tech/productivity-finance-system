# Deployment Guide
## Sistema de Produtividade e Gestão Financeira

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Autor:** Manus AI

---

## Sumário

Este guia documenta o processo completo de deploy, configuração de ambiente, manutenção e monitoramento do sistema em produção.

---

## Índice

1. [Requisitos do Servidor](#requisitos-do-servidor)
2. [Instalação Inicial](#instalação-inicial)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Configuração do Ambiente](#configuração-do-ambiente)
5. [Build e Deploy](#build-e-deploy)
6. [Configuração do PM2](#configuração-do-pm2)
7. [Configuração do Nginx](#configuração-do-nginx)
8. [SSL/HTTPS](#sslhttps)
9. [Monitoramento](#monitoramento)
10. [Backup e Recuperação](#backup-e-recuperação)
11. [Manutenção](#manutenção)
12. [Troubleshooting](#troubleshooting)

---

## Requisitos do Servidor

### Hardware Mínimo

- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disco:** 20 GB SSD
- **Rede:** 100 Mbps

### Hardware Recomendado

- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disco:** 50 GB SSD
- **Rede:** 1 Gbps

### Software

- **OS:** Ubuntu 22.04 LTS (ou superior)
- **Node.js:** 22.x
- **MySQL:** 8.0+
- **Nginx:** 1.18+
- **PM2:** Latest
- **Git:** 2.x

---

## Instalação Inicial

### 1. Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar: v22.x.x
```

### 3. Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

### 4. Instalar MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

**Configurações recomendadas:**
- Remove anonymous users? **Yes**
- Disallow root login remotely? **Yes**
- Remove test database? **Yes**
- Reload privilege tables? **Yes**

### 5. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Instalar PM2

```bash
npm install -g pm2
pm2 startup systemd  # Seguir instruções
```

### 7. Instalar Git

```bash
sudo apt install -y git
git --version
```

---

## Configuração do Banco de Dados

### 1. Criar Banco e Usuário

```bash
sudo mysql -u root -p
```

```sql
-- Criar banco de dados
CREATE DATABASE productivity_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'productivity_user'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';

-- Conceder permissões
GRANT ALL PRIVILEGES ON productivity_system.* TO 'productivity_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user = 'productivity_user';

EXIT;
```

### 2. Testar Conexão

```bash
mysql -u productivity_user -p productivity_system
```

### 3. Configurar Performance (Opcional)

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Adicionar/modificar:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
query_cache_size = 0
query_cache_type = 0
```

Reiniciar:
```bash
sudo systemctl restart mysql
```

---

## Configuração do Ambiente

### 1. Criar Usuário do Sistema

```bash
sudo adduser productivity
sudo usermod -aG sudo productivity
```

### 2. Clonar Repositório

```bash
sudo su - productivity
cd /var/www
git clone https://github.com/brnagencia-tech/productivity-finance-system.git
cd productivity-finance-system
```

### 3. Configurar SSH (Recomendado)

```bash
ssh-keygen -t ed25519 -C "deploy@brncrm.com.br"
cat ~/.ssh/id_ed25519.pub
```

Adicionar chave pública no GitHub: https://github.com/settings/keys

Configurar remote:
```bash
git remote set-url origin git@github.com:brnagencia-tech/productivity-finance-system.git
```

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

**Variáveis obrigatórias:**
```env
# Banco de Dados
DATABASE_URL=mysql://productivity_user:SENHA@localhost:3306/productivity_system

# JWT
JWT_SECRET=GERAR_CHAVE_ALEATORIA_AQUI

# OAuth Manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=SEU_APP_ID

# Owner
OWNER_OPEN_ID=SEU_OPEN_ID
OWNER_NAME=Seu Nome

# Forge API (Manus)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=SUA_CHAVE_API
VITE_FRONTEND_FORGE_API_KEY=SUA_CHAVE_FRONTEND
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im

# Analytics (Opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu-website-id

# App
VITE_APP_TITLE=Sistema de Produtividade
VITE_APP_LOGO=/logo.png
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Build e Deploy

### 1. Executar Migrations

```bash
pnpm db:push
```

Verificar tabelas:
```bash
mysql -u productivity_user -p productivity_system -e "SHOW TABLES;"
```

### 2. Build do Projeto

```bash
pnpm run build
```

Verificar arquivos gerados:
```bash
ls -lh dist/
ls -lh client/dist/
```

### 3. Testar Localmente

```bash
NODE_ENV=production node dist/index.js
```

Abrir outro terminal e testar:
```bash
curl -I http://localhost:3000/
```

Deve retornar `200 OK`.

---

## Configuração do PM2

### 1. Criar Arquivo de Configuração

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'productivity-system',
    script: 'dist/index.js',
    cwd: '/var/www/productivity-finance-system',
    instances: 2,  // Cluster mode (2 instâncias)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/productivity-system-error.log',
    out_file: '/var/log/pm2/productivity-system-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 2. Iniciar com PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd  # Seguir instruções se ainda não fez
```

### 3. Verificar Status

```bash
pm2 status
pm2 logs productivity-system --lines 50
pm2 monit  # Monitor em tempo real
```

### 4. Comandos Úteis

```bash
pm2 restart productivity-system    # Reiniciar
pm2 reload productivity-system     # Zero downtime reload
pm2 stop productivity-system       # Parar
pm2 delete productivity-system     # Remover
pm2 logs productivity-system       # Ver logs
pm2 flush                          # Limpar logs
```

---

## Configuração do Nginx

### 1. Criar Configuração do Site

```bash
sudo nano /etc/nginx/sites-available/brncrm.com.br
```

```nginx
# Upstream para PM2 (cluster)
upstream productivity_backend {
    least_conn;
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name brncrm.com.br www.brncrm.com.br;
    
    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name brncrm.com.br www.brncrm.com.br;
    
    # SSL certificates (Certbot)
    ssl_certificate /etc/letsencrypt/live/brncrm.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/brncrm.com.br/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/brncrm.com.br/chain.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logs
    access_log /var/log/nginx/brncrm-access.log;
    error_log /var/log/nginx/brncrm-error.log;
    
    # Max upload size
    client_max_body_size 50M;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://productivity_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass http://productivity_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://productivity_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/brncrm.com.br /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

### 3. Verificar

```bash
curl -I http://brncrm.com.br
curl -I https://brncrm.com.br
```

---

## SSL/HTTPS

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obter Certificado

```bash
sudo certbot --nginx -d brncrm.com.br -d www.brncrm.com.br
```

Seguir instruções:
- Email: seu@email.com
- Aceitar termos: Yes
- Compartilhar email: No (opcional)
- Redirect HTTP → HTTPS: Yes

### 3. Renovação Automática

Certbot configura cron automaticamente. Verificar:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run  # Testar renovação
```

### 4. Forçar Renovação (se necessário)

```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## Monitoramento

### 1. PM2 Monitoring

```bash
pm2 install pm2-logrotate  # Rotação de logs
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10

pm2 monit  # Monitor em tempo real
pm2 status
pm2 logs --lines 100
```

### 2. Logs do Sistema

```bash
# Nginx
sudo tail -f /var/log/nginx/brncrm-access.log
sudo tail -f /var/log/nginx/brncrm-error.log

# PM2
pm2 logs productivity-system --lines 100

# MySQL
sudo tail -f /var/log/mysql/error.log
```

### 3. Recursos do Servidor

```bash
# CPU e Memória
htop
free -h
df -h

# Processos Node
ps aux | grep node

# Conexões de rede
netstat -tlnp | grep 3000
ss -tlnp | grep 3000
```

### 4. Health Check

Criar script de health check:

```bash
nano /usr/local/bin/health-check.sh
```

```bash
#!/bin/bash

URL="https://brncrm.com.br/api/trpc/auth.me"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -eq 200 ]; then
    echo "✅ Sistema OK (HTTP $STATUS)"
    exit 0
else
    echo "❌ Sistema DOWN (HTTP $STATUS)"
    pm2 restart productivity-system
    exit 1
fi
```

```bash
chmod +x /usr/local/bin/health-check.sh
```

Adicionar ao cron (verificar a cada 5 minutos):
```bash
crontab -e
```

```
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## Backup e Recuperação

### 1. Backup do Banco de Dados

**Script de backup automático:**

```bash
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="productivity_system"
DB_USER="productivity_user"
DB_PASS="SENHA_AQUI"

mkdir -p $BACKUP_DIR

# Dump do banco
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# Manter apenas últimos 30 backups
ls -t $BACKUP_DIR/${DB_NAME}_*.sql.gz | tail -n +31 | xargs rm -f

echo "✅ Backup criado: ${DB_NAME}_${DATE}.sql.gz"
```

```bash
chmod +x /usr/local/bin/backup-db.sh
```

**Agendar backup diário (3h da manhã):**
```bash
sudo crontab -e
```

```
0 3 * * * /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1
```

### 2. Restaurar Backup

```bash
cd /var/backups/mysql
gunzip productivity_system_20260110_030000.sql.gz
mysql -u productivity_user -p productivity_system < productivity_system_20260110_030000.sql
```

### 3. Backup de Código

```bash
# Backup do diretório do projeto
sudo tar -czf /var/backups/productivity-system_$(date +%Y%m%d).tar.gz /var/www/productivity-finance-system

# Manter últimos 7 backups
ls -t /var/backups/productivity-system_*.tar.gz | tail -n +8 | xargs rm -f
```

---

## Manutenção

### 1. Atualizar Sistema

**Processo completo de atualização:**

```bash
cd /var/www/productivity-finance-system

# 1. Backup
/usr/local/bin/backup-db.sh

# 2. Pull do código
git pull origin main

# 3. Instalar dependências
pnpm install

# 4. Executar migrations
pnpm db:push

# 5. Build
pnpm run build

# 6. Reload (zero downtime)
pm2 reload productivity-system

# 7. Verificar logs
pm2 logs productivity-system --lines 50

# 8. Testar
curl -I https://brncrm.com.br
```

### 2. Rollback

Se algo der errado:

```bash
# 1. Voltar código
git log --oneline -10  # Ver commits
git reset --hard <commit-hash>

# 2. Rebuild
pnpm run build

# 3. Restaurar banco (se necessário)
cd /var/backups/mysql
gunzip productivity_system_YYYYMMDD_HHMMSS.sql.gz
mysql -u productivity_user -p productivity_system < productivity_system_YYYYMMDD_HHMMSS.sql

# 4. Restart
pm2 restart productivity-system
```

### 3. Limpar Logs

```bash
# PM2
pm2 flush

# Nginx
sudo truncate -s 0 /var/log/nginx/brncrm-access.log
sudo truncate -s 0 /var/log/nginx/brncrm-error.log

# MySQL slow query log
sudo truncate -s 0 /var/log/mysql/mysql-slow.log
```

### 4. Otimizar Banco de Dados

```bash
mysql -u productivity_user -p productivity_system
```

```sql
-- Analisar tabelas
ANALYZE TABLE managed_users, tasks, expenses, kanban_boards;

-- Otimizar tabelas
OPTIMIZE TABLE managed_users, tasks, expenses, kanban_boards;

-- Verificar índices
SHOW INDEX FROM managed_users;

-- Estatísticas de uso
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'productivity_system'
ORDER BY (data_length + index_length) DESC;
```

---

## Troubleshooting

### Problema: Sistema não inicia

**Verificar:**
```bash
pm2 logs productivity-system --lines 100
pm2 describe productivity-system
```

**Causas comuns:**
- Porta 3000 em uso
- Variáveis de ambiente faltando
- Banco de dados inacessível
- Erros de TypeScript no build

**Solução:**
```bash
# Verificar porta
lsof -i :3000
kill -9 <PID>

# Verificar .env
cat .env | grep DATABASE_URL

# Testar conexão MySQL
mysql -u productivity_user -p productivity_system

# Rebuild
pnpm run build
pm2 restart productivity-system
```

---

### Problema: 502 Bad Gateway (Nginx)

**Verificar:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/brncrm-error.log
pm2 status
```

**Causas comuns:**
- PM2 não está rodando
- Porta errada no upstream
- Timeout muito curto

**Solução:**
```bash
pm2 restart productivity-system
sudo systemctl reload nginx
```

---

### Problema: WebSocket não conecta

**Verificar:**
```bash
curl -I https://brncrm.com.br/socket.io/
pm2 logs productivity-system | grep socket
```

**Causas comuns:**
- Nginx não configurado para WebSocket
- CORS bloqueando
- Firewall bloqueando

**Solução:**
Verificar configuração do Nginx (seção WebSocket) e CORS no código.

---

### Problema: Banco de dados lento

**Verificar:**
```bash
mysql -u productivity_user -p productivity_system
```

```sql
-- Ver queries lentas
SHOW FULL PROCESSLIST;

-- Habilitar slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Ver slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

**Solução:**
- Adicionar índices faltantes
- Otimizar queries
- Aumentar `innodb_buffer_pool_size`

---

## Checklist de Deploy

Antes de cada deploy:

- [ ] Backup do banco criado
- [ ] Código testado localmente
- [ ] `pnpm tsc --noEmit` sem erros
- [ ] `pnpm run build` completo
- [ ] Migrations revisadas
- [ ] Variáveis de ambiente verificadas
- [ ] Changelog atualizado
- [ ] Equipe notificada

Durante o deploy:

- [ ] `git pull origin main`
- [ ] `pnpm install`
- [ ] `pnpm db:push`
- [ ] `pnpm run build`
- [ ] `pm2 reload productivity-system`
- [ ] Logs monitorados por 5 minutos
- [ ] Health check respondendo
- [ ] Login testado (OAuth + Team)
- [ ] WebSocket conectando

Após o deploy:

- [ ] Monitorar logs por 1 hora
- [ ] Verificar métricas de performance
- [ ] Confirmar com equipe que tudo funciona
- [ ] Atualizar documentação se necessário

---

## Comandos Rápidos

**Deploy completo:**
```bash
cd /var/www/productivity-finance-system && \
/usr/local/bin/backup-db.sh && \
git pull origin main && \
pnpm install && \
pnpm db:push && \
pnpm run build && \
pm2 reload productivity-system && \
pm2 logs productivity-system --lines 50
```

**Verificar status:**
```bash
pm2 status && \
curl -I https://brncrm.com.br && \
mysql -u productivity_user -p productivity_system -e "SELECT COUNT(*) FROM managed_users;"
```

**Reiniciar tudo:**
```bash
pm2 restart productivity-system && \
sudo systemctl reload nginx && \
echo "✅ Sistema reiniciado"
```

---

## Suporte

Para problemas não listados aqui:

1. Consulte [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Consulte [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
3. Consulte [API Reference](./API_REFERENCE.md)
4. Entre em contato com o administrador do sistema

---

**Autor:** Manus AI  
**Última Atualização:** Janeiro 2026  
**Versão:** 1.0
