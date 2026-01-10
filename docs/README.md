# Documentação do Sistema
## Sistema de Produtividade e Gestão Financeira

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Autor:** Manus AI

---

## Visão Geral

Sistema integrado de produtividade e gestão financeira desenvolvido com React 19, Node.js 22, tRPC 11, MySQL 8 e Socket.IO. Combina gerenciamento de tarefas, controle financeiro, quadros Kanban colaborativos, hábitos de saúde e análises assistidas por IA em uma única plataforma.

**Tecnologias Principais:**
- **Frontend:** React 19, Tailwind CSS 4, Wouter, TanStack Query
- **Backend:** Node.js 22, Express 4, tRPC 11, Socket.IO
- **Banco de Dados:** MySQL 8 (com Drizzle ORM)
- **Autenticação:** OAuth (Manus) + JWT (Team Login)
- **Deploy:** PM2, Nginx, Ubuntu 22.04

---

## Documentação Disponível

### 1. [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
Documentação técnica completa do sistema.

**Conteúdo:**
- Arquitetura do sistema
- Stack tecnológico
- Estrutura de diretórios
- Modelos de dados (schema completo)
- Fluxos de autenticação
- Integrações (LLM, Storage, Maps)
- Convenções de código
- Segurança e performance

**Para quem:**
- Desenvolvedores novos no projeto
- Arquitetos de software
- Tech leads

---

### 2. [API Reference](./API_REFERENCE.md)
Referência completa da API tRPC com todos os endpoints.

**Conteúdo:**
- 15 routers documentados
- Mais de 100 endpoints
- Schemas de input/output
- Exemplos de código
- Códigos de erro
- Eventos WebSocket
- Rate limiting (TODO)

**Para quem:**
- Desenvolvedores frontend
- Integradores de API
- QA testers

---

### 3. [Troubleshooting Guide](./TROUBLESHOOTING.md)
Guia de resolução de problemas comuns.

**Conteúdo:**
- Problemas de autenticação
- Erros de query SQL
- Problemas de build e deploy
- Erros de Git e GitHub
- Problemas de ambiente
- Erros de TypeScript
- Problemas de WebSocket
- Performance e otimização

**Para quem:**
- DevOps
- Desenvolvedores
- Suporte técnico

---

### 4. [Deployment Guide](./DEPLOYMENT.md)
Guia completo de deploy, configuração e manutenção.

**Conteúdo:**
- Requisitos do servidor
- Instalação inicial
- Configuração do banco de dados
- Configuração do ambiente
- Build e deploy
- Configuração do PM2
- Configuração do Nginx
- SSL/HTTPS
- Monitoramento
- Backup e recuperação
- Manutenção

**Para quem:**
- DevOps
- Administradores de sistema
- SRE

---

## Quick Start

### Desenvolvimento Local

```bash
# 1. Clonar repositório
git clone https://github.com/brnagencia-tech/productivity-finance-system.git
cd productivity-finance-system

# 2. Instalar dependências
pnpm install

# 3. Configurar .env
cp .env.example .env
nano .env

# 4. Executar migrations
pnpm db:push

# 5. Iniciar dev server
pnpm dev
```

Acesse: http://localhost:5173

---

### Deploy em Produção

```bash
# 1. Pull do código
cd /var/www/productivity-finance-system
git pull origin main

# 2. Instalar dependências
pnpm install

# 3. Executar migrations
pnpm db:push

# 4. Build
pnpm run build

# 5. Reload (zero downtime)
pm2 reload productivity-system

# 6. Verificar
pm2 logs productivity-system --lines 50
```

Consulte [Deployment Guide](./DEPLOYMENT.md) para instruções completas.

---

## Estrutura do Projeto

```
productivity-finance-system/
├── client/                    # Frontend React
│   ├── public/               # Assets estáticos
│   ├── src/
│   │   ├── pages/           # Páginas
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilitários
│   │   ├── App.tsx          # Rotas principais
│   │   └── main.tsx         # Entry point
│   └── index.html
├── server/                    # Backend Node.js
│   ├── _core/               # Framework (OAuth, tRPC, Socket.IO)
│   ├── db.ts                # Query helpers
│   ├── routers.ts           # tRPC procedures
│   └── *.test.ts            # Testes
├── drizzle/                   # Database schema & migrations
│   └── schema.ts
├── shared/                    # Código compartilhado
├── storage/                   # S3 helpers
├── docs/                      # Documentação
│   ├── README.md            # Este arquivo
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── API_REFERENCE.md
│   ├── TROUBLESHOOTING.md
│   └── DEPLOYMENT.md
├── package.json
├── ecosystem.config.js        # PM2 config
└── .env                       # Variáveis de ambiente
```

---

## Principais Funcionalidades

### 1. Autenticação Dual
- **OAuth (Manus):** Para proprietários do sistema
- **Team Login:** Para usuários gerenciados (equipe)
- JWT com validade de 7 dias
- Suporte a múltiplas sessões

### 2. Gerenciamento de Tarefas
- Tarefas recorrentes (diárias, semanais, mensais)
- Categorização customizável
- Atribuição a usuários
- Rastreamento de status (5 estados)
- Filtros por escopo (pessoal/profissional)

### 3. Quadros Kanban Colaborativos
- Boards compartilhados com permissões (owner/editor/viewer)
- Colunas e cards customizáveis
- Drag and drop em tempo real (WebSocket)
- Comentários com @menções
- Checklists
- Prioridades e datas de vencimento

### 4. Controle Financeiro
- Despesas variáveis e fixas
- Faturamento/vendas
- Orçamentos mensais
- Análise de lucro/prejuízo
- Gráficos de tendência
- Suporte a múltiplas moedas (BRL/USD)

### 5. Hábitos de Saúde
- Rastreamento diário/semanal
- Metas customizáveis
- Histórico de progresso
- Categorização

### 6. Insights com IA
- Análise de despesas
- Análise de produtividade
- Sugestões personalizadas
- Integração com LLM (Manus Forge)

### 7. Sistema de Permissões (RBAC)
- Roles customizáveis
- Permissões granulares
- Auditoria de ações
- Gerenciamento de sessões

---

## Tecnologias e Integrações

### Backend
- **Node.js 22** - Runtime JavaScript
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API
- **Socket.IO** - WebSocket em tempo real
- **Drizzle ORM** - Type-safe database queries
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - JWT authentication

### Frontend
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching
- **Zod** - Schema validation
- **shadcn/ui** - Component library

### Infraestrutura
- **MySQL 8** - Banco de dados relacional
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL/TLS certificates

### Integrações Externas
- **Manus OAuth** - Autenticação
- **Manus Forge** - LLM, Storage, Maps
- **Google Maps** - Mapas e geolocalização

---

## Ambientes

### Desenvolvimento
- **URL:** http://localhost:5173
- **API:** http://localhost:3000
- **Hot reload:** Ativado
- **Source maps:** Ativado

### Produção
- **URL:** https://brncrm.com.br
- **API:** https://brncrm.com.br/api/trpc
- **WebSocket:** wss://brncrm.com.br
- **SSL:** Let's Encrypt
- **Cluster:** 2 instâncias (PM2)

---

## Comandos Úteis

### Desenvolvimento
```bash
pnpm dev              # Iniciar dev server
pnpm build            # Build para produção
pnpm tsc              # Verificar TypeScript
pnpm lint             # Lint código
pnpm test             # Executar testes
pnpm db:push          # Executar migrations
pnpm db:studio        # Drizzle Studio (GUI)
```

### Produção
```bash
pm2 status            # Ver status
pm2 logs              # Ver logs
pm2 restart all       # Reiniciar
pm2 reload all        # Reload (zero downtime)
pm2 monit             # Monitor em tempo real
```

### Banco de Dados
```bash
mysql -u productivity_user -p productivity_system
pnpm db:push          # Aplicar schema
```

### Git
```bash
git pull origin main  # Atualizar código
git log --oneline -10 # Ver commits
git status            # Ver mudanças
```

---

## Contribuindo

### Workflow

1. **Criar branch:**
```bash
git checkout -b feature/nome-da-feature
```

2. **Desenvolver:**
```bash
# Fazer mudanças
pnpm tsc --noEmit  # Verificar TypeScript
pnpm lint          # Lint
```

3. **Commit:**
```bash
git add .
git commit -m "feat: adicionar nova funcionalidade"
```

4. **Push:**
```bash
git push origin feature/nome-da-feature
```

5. **Pull Request:**
- Criar PR no GitHub
- Aguardar code review
- Merge após aprovação

### Convenções

**Commits:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

**Código:**
- TypeScript strict mode
- ESLint + Prettier
- Testes para features críticas
- Documentar funções públicas

---

## Segurança

### Boas Práticas Implementadas

- ✅ Senhas hasheadas com bcrypt (10 salt rounds)
- ✅ JWT com expiração (7 dias)
- ✅ HTTPS obrigatório em produção
- ✅ CORS configurado
- ✅ Security headers (Nginx)
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting (TODO)
- ✅ Input validation (Zod)

### Recomendações

- Implementar rate limiting no login
- Adicionar 2FA para usuários críticos
- Implementar recuperação de senha via email
- Logs de auditoria para ações sensíveis
- Monitoramento de tentativas de login falhadas

---

## Performance

### Otimizações Implementadas

- ✅ Cluster mode (PM2) - 2 instâncias
- ✅ Connection pooling (MySQL)
- ✅ Índices no banco de dados
- ✅ Gzip compression (Nginx)
- ✅ Static file caching
- ✅ WebSocket para updates em tempo real
- ✅ Lazy loading de componentes (React)
- ✅ Code splitting (Vite)

### Métricas Alvo

- **TTFB:** < 200ms
- **FCP:** < 1s
- **LCP:** < 2.5s
- **API Response:** < 100ms (queries simples)
- **WebSocket Latency:** < 50ms

---

## Suporte

### Documentação
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Contato
- **Email:** bruno@agenciabrn.com.br
- **GitHub:** https://github.com/brnagencia-tech/productivity-finance-system

---

## Changelog

### v1.0 (Janeiro 2026)
- ✅ Release inicial
- ✅ Autenticação dual (OAuth + Team Login)
- ✅ Gerenciamento de tarefas
- ✅ Quadros Kanban colaborativos
- ✅ Controle financeiro completo
- ✅ Hábitos de saúde
- ✅ Insights com IA
- ✅ Sistema de permissões (RBAC)
- ✅ WebSocket em tempo real
- ✅ Documentação completa

### Próximas Versões
- [ ] Rate limiting
- [ ] Recuperação de senha via email
- [ ] 2FA (Two-Factor Authentication)
- [ ] Logs de auditoria expandidos
- [ ] Notificações push
- [ ] Mobile app (React Native)
- [ ] API pública para integrações

---

## Licença

Proprietary - © 2026 BRN Agência

---

**Autor:** Manus AI  
**Última Atualização:** Janeiro 2026  
**Versão:** 1.0
