# 🖥️ Setup Completo de Servidor DigitalOcean

Guia passo a passo para criar e configurar um servidor Ubuntu do zero para hospedar o **Sistema de Produtividade e Gestão Financeira**.

---

## 📋 Pré-requisitos

- Conta na DigitalOcean
- Domínio próprio (opcional, mas recomendado)
- Cliente SSH (Terminal no Mac/Linux, PuTTY no Windows)

---

## 🚀 Parte 1: Criar Droplet na DigitalOcean

### 1.1 Acessar DigitalOcean

1. Faça login em https://cloud.digitalocean.com
2. Clique em **"Create"** → **"Droplets"**

### 1.2 Escolher Configurações

**Sistema Operacional:**
- Escolha: **Ubuntu 22.04 LTS x64**

**Plano:**
- **Basic** (para começar)
- **Regular** (SSD)
- Recomendado: **$12/mês** (2 GB RAM, 1 vCPU, 50 GB SSD)
  - Mínimo: $6/mês (1 GB RAM) - pode ser lento
  - Ideal para produção: $18/mês (2 GB RAM, 2 vCPUs)

**Datacenter:**
- Escolha o mais próximo do Brasil:
  - **New York 1** (melhor latência para Brasil)
  - Ou **Toronto** (alternativa)

**Autenticação:**
- ✅ **Recomendado: SSH Key** (mais seguro)
  - Clique em "New SSH Key"
  - No seu computador, gere uma chave:
    ```bash
    ssh-keygen -t ed25519 -C "seu-email@example.com"
    ```
  - Copie a chave pública:
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```
  - Cole no campo da DigitalOcean
- ⚠️ Alternativa: **Password** (menos seguro, mas mais simples)

**Hostname:**
- Escolha um nome: `productivity-system` ou `app-server`

### 1.3 Criar Droplet

1. Clique em **"Create Droplet"**
2. Aguarde 1-2 minutos até o droplet estar pronto
3. Anote o **IP do servidor** (ex: `159.89.123.45`)

---

## 🔐 Parte 2: Primeira Conexão e Segurança

### 2.1 Conectar via SSH

```bash
# Se usou SSH Key:
ssh root@SEU-IP-AQUI

# Se usou senha:
ssh root@SEU-IP-AQUI
# Digite a senha que recebeu por email
```

### 2.2 Atualizar Sistema

```bash
# Atualizar lista de pacotes
apt update

# Atualizar todos os pacotes
apt upgrade -y

# Reiniciar se necessário
reboot
```

Aguarde 1 minuto e conecte novamente:
```bash
ssh root@SEU-IP-AQUI
```

### 2.3 Criar Usuário Não-Root (Segurança)

```bash
# Criar novo usuário
adduser deploy

# Adicionar ao grupo sudo
usermod -aG sudo deploy

# Copiar chave SSH para novo usuário (se usou SSH key)
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

### 2.4 Configurar Firewall

```bash
# Permitir SSH
ufw allow OpenSSH

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS
ufw allow 443/tcp

# Ativar firewall
ufw enable

# Verificar status
ufw status
```

### 2.5 Configurar Timezone

```bash
# Definir timezone para São Paulo
timedatectl set-timezone America/Sao_Paulo

# Verificar
timedatectl
```

---

## 📦 Parte 3: Instalar Dependências

### 3.1 Instalar Node.js 22.x

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Instalar Node.js
apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v22.x.x
npm --version
```

### 3.2 Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### 3.3 Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

### 3.4 Instalar MySQL

```bash
# Instalar MySQL Server
apt install -y mysql-server

# Iniciar MySQL
systemctl start mysql
systemctl enable mysql

# Verificar status
systemctl status mysql
```

### 3.5 Configurar MySQL

```bash
# Executar script de segurança
mysql_secure_installation
```

Responda as perguntas:
- **VALIDATE PASSWORD COMPONENT?** → `N` (ou `Y` se quiser senha forte obrigatória)
- **Remove anonymous users?** → `Y`
- **Disallow root login remotely?** → `Y`
- **Remove test database?** → `Y`
- **Reload privilege tables?** → `Y`

### 3.6 Criar Banco de Dados

```bash
# Entrar no MySQL
mysql -u root -p
```

Dentro do MySQL, execute:

```sql
-- Criar banco de dados
CREATE DATABASE productivity_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'productivity_user'@'localhost' IDENTIFIED BY 'SENHA-SEGURA-AQUI';

-- Dar permissões
GRANT ALL PRIVILEGES ON productivity_system.* TO 'productivity_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

**⚠️ IMPORTANTE:** Anote a senha que você criou!

### 3.7 Instalar Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx
```

Teste: Abra `http://SEU-IP` no navegador. Deve aparecer a página padrão do Nginx.

### 3.8 Instalar Certbot (SSL)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx
```

---

## 🛠️ Parte 4: Preparar Diretório da Aplicação

### 4.1 Criar Estrutura de Diretórios

```bash
# Criar diretório para aplicações
mkdir -p /var/www

# Dar permissões ao usuário deploy
chown -R deploy:deploy /var/www

# Mudar para usuário deploy
su - deploy
```

### 4.2 Configurar Git

```bash
# Configurar nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"

# Verificar
git config --list
```

---

## ✅ Parte 5: Verificar Instalações

Execute os comandos abaixo para verificar se tudo está instalado:

```bash
# Node.js
node --version        # Deve mostrar v22.x.x

# pnpm
pnpm --version        # Deve mostrar 9.x.x ou superior

# PM2
pm2 --version         # Deve mostrar 5.x.x ou superior

# MySQL
mysql --version       # Deve mostrar 8.x.x

# Nginx
nginx -v              # Deve mostrar 1.x.x

# Certbot
certbot --version     # Deve mostrar 2.x.x ou superior

# Git
git --version         # Deve mostrar 2.x.x
```

---

## 📝 Parte 6: Informações para o Deploy

Anote as seguintes informações (você vai precisar no DEPLOY.md):

```
✅ IP do Servidor: _______________
✅ Usuário SSH: deploy
✅ Banco de Dados:
   - Host: localhost
   - Porta: 3306
   - Database: productivity_system
   - Usuário: productivity_user
   - Senha: _______________
✅ Domínio (se tiver): _______________
```

---

## 🎯 Próximos Passos

Agora que o servidor está preparado, você pode:

1. **Seguir o DEPLOY.md** para fazer o deploy da aplicação
2. **Configurar domínio** (se tiver):
   - Apontar DNS do domínio para o IP do servidor
   - Configurar SSL com Certbot

---

## 🔧 Script Automatizado

Para facilitar, criamos um script que faz toda a instalação automaticamente!

Veja o arquivo **`setup.sh`** no repositório.

**Uso:**
```bash
# Baixar e executar script
curl -o setup.sh https://raw.githubusercontent.com/brnagencia-tech/productivity-finance-system/main/setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

---

## 🆘 Troubleshooting

### Erro de conexão SSH

```bash
# Se der "Connection refused"
# 1. Verifique se o IP está correto
# 2. Verifique se o firewall permite SSH:
ufw status

# Se SSH não estiver permitido:
ufw allow OpenSSH
```

### MySQL não inicia

```bash
# Ver logs de erro
journalctl -u mysql -n 50

# Reiniciar MySQL
systemctl restart mysql
```

### Nginx não inicia

```bash
# Verificar configuração
nginx -t

# Ver logs
tail -f /var/log/nginx/error.log

# Reiniciar
systemctl restart nginx
```

---

## 🔐 Dicas de Segurança

1. **Sempre use SSH Key** em vez de senha
2. **Desabilite login root via SSH** após criar usuário deploy
3. **Configure fail2ban** para bloquear tentativas de invasão:
   ```bash
   apt install -y fail2ban
   systemctl enable fail2ban
   systemctl start fail2ban
   ```
4. **Mantenha o sistema atualizado**:
   ```bash
   apt update && apt upgrade -y
   ```
5. **Configure backups automáticos** do banco de dados

---

## 📊 Monitoramento

### Comandos Úteis

```bash
# Ver uso de CPU/RAM
htop

# Ver espaço em disco
df -h

# Ver processos rodando
ps aux | grep node

# Ver logs do sistema
journalctl -f
```

---

## 🎉 Conclusão

Seu servidor está pronto! Agora você pode:

1. ✅ Fazer deploy da aplicação (veja **DEPLOY.md**)
2. ✅ Configurar domínio e SSL
3. ✅ Configurar backups automáticos
4. ✅ Monitorar a aplicação com PM2

**Próximo arquivo:** Leia o **DEPLOY.md** para fazer o deploy da aplicação!
