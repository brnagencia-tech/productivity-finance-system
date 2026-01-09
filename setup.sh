#!/bin/bash

# ============================================
# Script de Setup Automatizado do Servidor
# Sistema de Produtividade e Gestão Financeira
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (use sudo)"
    exit 1
fi

echo "============================================"
echo "  Setup do Servidor - Productivity System  "
echo "============================================"
echo ""

# ============================================
# 1. Atualizar Sistema
# ============================================
print_message "Atualizando sistema..."
apt update -y
apt upgrade -y

# ============================================
# 2. Instalar Dependências Básicas
# ============================================
print_message "Instalando dependências básicas..."
apt install -y curl wget git build-essential software-properties-common

# ============================================
# 3. Instalar Node.js 22.x
# ============================================
print_message "Instalando Node.js 22.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
    print_message "Node.js instalado: $(node --version)"
else
    print_warning "Node.js já está instalado: $(node --version)"
fi

# ============================================
# 4. Instalar pnpm
# ============================================
print_message "Instalando pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    print_message "pnpm instalado: $(pnpm --version)"
else
    print_warning "pnpm já está instalado: $(pnpm --version)"
fi

# ============================================
# 5. Instalar PM2
# ============================================
print_message "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_message "PM2 instalado: $(pm2 --version)"
else
    print_warning "PM2 já está instalado: $(pm2 --version)"
fi

# ============================================
# 6. Instalar MySQL
# ============================================
print_message "Instalando MySQL..."
if ! command -v mysql &> /dev/null; then
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    print_message "MySQL instalado: $(mysql --version)"
else
    print_warning "MySQL já está instalado: $(mysql --version)"
fi

# ============================================
# 7. Instalar Nginx
# ============================================
print_message "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_message "Nginx instalado: $(nginx -v 2>&1)"
else
    print_warning "Nginx já está instalado: $(nginx -v 2>&1)"
fi

# ============================================
# 8. Instalar Certbot (SSL)
# ============================================
print_message "Instalando Certbot..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    print_message "Certbot instalado: $(certbot --version)"
else
    print_warning "Certbot já está instalado: $(certbot --version)"
fi

# ============================================
# 9. Configurar Firewall
# ============================================
print_message "Configurando firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
print_message "Firewall configurado"

# ============================================
# 10. Configurar Timezone
# ============================================
print_message "Configurando timezone para America/Sao_Paulo..."
timedatectl set-timezone America/Sao_Paulo

# ============================================
# 11. Criar Usuário Deploy (se não existir)
# ============================================
if ! id "deploy" &>/dev/null; then
    print_message "Criando usuário 'deploy'..."
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    
    # Copiar chave SSH do root para deploy (se existir)
    if [ -d /root/.ssh ]; then
        mkdir -p /home/deploy/.ssh
        cp /root/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
        chown -R deploy:deploy /home/deploy/.ssh
        chmod 700 /home/deploy/.ssh
        chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true
    fi
    
    print_message "Usuário 'deploy' criado"
else
    print_warning "Usuário 'deploy' já existe"
fi

# ============================================
# 12. Criar Diretório da Aplicação
# ============================================
print_message "Criando diretório /var/www..."
mkdir -p /var/www
chown -R deploy:deploy /var/www

# ============================================
# 13. Configurar PM2 Startup
# ============================================
print_message "Configurando PM2 para iniciar no boot..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy

# ============================================
# 14. Instalar fail2ban (Segurança)
# ============================================
print_message "Instalando fail2ban..."
if ! command -v fail2ban-client &> /dev/null; then
    apt install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    print_message "fail2ban instalado e ativo"
else
    print_warning "fail2ban já está instalado"
fi

# ============================================
# 15. Configurar Git Global
# ============================================
print_message "Configurando Git..."
sudo -u deploy git config --global user.name "Deploy User"
sudo -u deploy git config --global user.email "deploy@localhost"

# ============================================
# Resumo
# ============================================
echo ""
echo "============================================"
echo "  ✅ Setup Concluído com Sucesso!          "
echo "============================================"
echo ""
echo "Versões instaladas:"
echo "  - Node.js: $(node --version)"
echo "  - pnpm: $(pnpm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - MySQL: $(mysql --version | cut -d' ' -f6)"
echo "  - Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  - Certbot: $(certbot --version | cut -d' ' -f2)"
echo ""
echo "Próximos passos:"
echo "  1. Configure o MySQL:"
echo "     sudo mysql_secure_installation"
echo ""
echo "  2. Crie o banco de dados:"
echo "     sudo mysql -u root -p"
echo "     CREATE DATABASE productivity_system;"
echo "     CREATE USER 'productivity_user'@'localhost' IDENTIFIED BY 'SUA-SENHA';"
echo "     GRANT ALL PRIVILEGES ON productivity_system.* TO 'productivity_user'@'localhost';"
echo "     FLUSH PRIVILEGES;"
echo "     EXIT;"
echo ""
echo "  3. Clone o repositório:"
echo "     cd /var/www"
echo "     git clone https://github.com/brnagencia-tech/productivity-finance-system.git"
echo ""
echo "  4. Siga o arquivo DEPLOY.md para continuar"
echo ""
echo "============================================"
