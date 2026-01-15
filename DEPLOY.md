# 🚀 Guia de Deploy - DigitalOcean

Este guia explica como fazer deploy e atualizar o **Sistema de Produtividade e Gestão Financeira** no DigitalOcean sem perder dados do banco.

---

## 📋 Pré-requisitos

- Servidor Ubuntu 22.04 na DigitalOcean
- Node.js 22.x instalado
- MySQL/TiDB instalado e rodando
- Acesso SSH ao servidor
- Repositório GitHub configurado

---

## 🆕 Deploy Inicial (Primeira Vez)

### 1. Conectar ao Servidor

```bash
ssh root@seu-ip-digitalocean
```

### 2. Instalar Dependências do Sistema

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (gerenciador de processos)
npm install -g pm2
```

### 3. Clonar Repositório

```bash
cd /var/www
git clone https://github.com/SEU-USUARIO/productivity-finance-system.git
cd productivity-finance-system
```

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Cole o seguinte conteúdo (substitua os valores):

```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET="sua-chave-secreta-muito-longa-e-aleatoria"

# OAuth (se usar autenticação Manus)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
VITE_APP_ID="seu-app-id"

# Owner Info
OWNER_OPEN_ID="seu-open-id"
OWNER_NAME="Seu Nome"

# Forge API (se usar recursos Manus)
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="sua-api-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua-frontend-api-key"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"

# App Config
VITE_APP_TITLE="Sistema de Produtividade"
VITE_APP_LOGO="/logo.png"

# Production
NODE_ENV="production"
PORT=3000
```

Salve com `Ctrl+X`, depois `Y`, depois `Enter`.

### 5. Instalar Dependências e Build

```bash
# Instalar dependências
pnpm install

# Aplicar migrações do banco
pnpm db:push

# Build do frontend
pnpm build
```

### 6. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start npm --name "productivity-system" -- start

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
```

### 7. Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
apt install -y nginx

# Criar configuração
nano /etc/nginx/sites-available/productivity-system
```

Cole o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative a configuração:

```bash
ln -s /etc/nginx/sites-available/productivity-system /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 8. Configurar SSL (Opcional mas Recomendado)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seu-dominio.com
```

---

## 🆕 Versão 1.2.0 - Mudanças Implementadas (15/01/2026)

### 📊 Integração de Dados Reais no Dashboard

**Problema Resolvido:** Cards de Faturamento e Despesas exibiam valores estáticos (R$ 0,00 / $ 0.00).

**Arquivos Novos:**
- `server/db-expenses-totals.ts` - Função de cálculo de totais por moeda

**Arquivos Modificados:**
- `server/routers.ts` - Endpoint `expenses.getTotalsByCurrency` adicionado
- `client/src/pages/Home.tsx` - Queries tRPC e renderização de dados reais

**Funcionalidades:**
- Cards de Faturamento BRL/USD agora exibem dados reais do banco
- Cards de Despesas BRL/USD agora exibem dados reais do banco
- Loading states com animação durante carregamento
- Formatação correta de moeda (R$ 1.234,56 / $ 1,234.56)
- Cálculo automático: Despesas = Variáveis + Fixas (multiplicadas por meses no período)

### 📝 Tooltips Explicativos

**Problema Resolvido:** Usuários não entendiam como os cálculos eram feitos.

**Arquivos Modificados:**
- `client/src/pages/AnnualExpenses.tsx` - Tooltips em "Total Anual" e "Média Mensal"
- `client/src/pages/FixedExpenses.tsx` - Tooltip no título explicando recorrência

**Funcionalidades:**
- Tooltip "Total Anual": Explica soma de despesas variáveis + fixas
- Tooltip "Média Mensal": Mostra fórmula (Total ÷ Meses) com exemplo prático
- Tooltip "Despesas Fixas": Explica recorrência automática mensal
- Responsivo: Hover no desktop, clique no mobile

### ⚠️ Migrations Necessárias

**NENHUMA!** Esta versão não requer migrations. O schema já está sincronizado.

---

## 🔄 Atualizar Aplicação (Pull de Atualizações)

### ⚠️ IMPORTANTE: Seus dados do banco NÃO serão perdidos!

O banco de dados é separado do código. Ao fazer `git pull`, você atualiza apenas o código da aplicação.

### Passo a Passo de Atualização

```bash
# 1. Conectar ao servidor
ssh root@seu-ip-digitalocean

# 2. Ir para o diretório do projeto
cd /var/www/productivity-finance-system

# 3. Fazer backup do .env (segurança)
cp .env .env.backup

# 4. Baixar atualizações do GitHub
git pull origin main

# 5. Instalar novas dependências (se houver)
pnpm install

# 6. Aplicar novas migrações do banco (se houver)
pnpm db:push

# 7. Rebuild do frontend
pnpm build

# 8. Reiniciar aplicação
pm2 restart productivity-system

# 9. Verificar logs (opcional)
pm2 logs productivity-system
```

### 🎯 Comandos Úteis

```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs productivity-system

# Parar aplicação
pm2 stop productivity-system

# Reiniciar aplicação
pm2 restart productivity-system

# Ver uso de memória/CPU
pm2 monit
```

---

## 🗄️ Backup do Banco de Dados

### Criar Backup

```bash
# Backup completo
mysqldump -u usuario -p nome_do_banco > backup-$(date +%Y%m%d).sql

# Backup compactado
mysqldump -u usuario -p nome_do_banco | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restaurar Backup

```bash
# Restaurar de arquivo .sql
mysql -u usuario -p nome_do_banco < backup-20260109.sql

# Restaurar de arquivo compactado
gunzip < backup-20260109.sql.gz | mysql -u usuario -p nome_do_banco
```

---

## 🔍 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs de erro
pm2 logs productivity-system --err

# Verificar se a porta 3000 está em uso
netstat -tulpn | grep 3000

# Matar processo na porta 3000 (se necessário)
kill -9 $(lsof -t -i:3000)
```

### Erro de conexão com banco

```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Testar conexão manual
mysql -u usuario -p -h localhost nome_do_banco
```

### Erro de permissões

```bash
# Dar permissões corretas ao diretório
chown -R www-data:www-data /var/www/productivity-finance-system
chmod -R 755 /var/www/productivity-finance-system
```

---

## 📊 Monitoramento

### Configurar Monitoramento Automático

```bash
# PM2 Plus (opcional - monitoramento em nuvem)
pm2 link [secret-key] [public-key]

# Logs do sistema
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Segurança

### Checklist de Segurança

- [ ] Firewall configurado (ufw)
- [ ] SSL/HTTPS ativo
- [ ] Senhas fortes no banco de dados
- [ ] JWT_SECRET aleatório e seguro
- [ ] Backups automáticos configurados
- [ ] Atualizações de segurança do sistema
- [ ] Acesso SSH apenas por chave (não senha)

```bash
# Configurar firewall básico
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs productivity-system`
2. Verifique o status: `pm2 status`
3. Verifique o banco: `mysql -u usuario -p`
4. Consulte a documentação do projeto no GitHub

---

## ✅ Resumo do Fluxo de Atualização

```
1. git pull origin main          → Baixa código novo
2. pnpm install                   → Instala dependências
3. pnpm db:push                   → Aplica migrações (SEM PERDER DADOS)
4. pnpm build                     → Rebuild do frontend
5. pm2 restart productivity-system → Reinicia app
```

**🎉 Pronto! Sua aplicação está atualizada sem perder nenhum dado do banco!**
