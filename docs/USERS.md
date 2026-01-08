# Módulo de Usuários - Documentação

## Estrutura do Banco de Dados

### Tabela `managed_users`
- `id` - ID único do usuário
- `firstName` - Primeiro nome
- `lastName` - Sobrenome
- `email` - Email (único)
- `username` - Nome de usuário (único)
- `passwordHash` - Senha em base64
- `role` - Papel: "CEO" | "Master" | "Colaborador"
- `phoneBR` - Telefone Brasil (opcional)
- `phoneUS` - Telefone EUA (opcional)
- `status` - Status: "active" | "inactive"
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## Procedures tRPC

### Router `managedUsers`

#### Queries
- `list` - Lista todos os usuários (apenas para admins)
- `search` - Busca usuários por nome/username (para autocomplete)

#### Mutations
- `create` - Cria novo usuário
  - Aceita: firstName, lastName, email, username, password, role, phoneBR, phoneUS
- `update` - Atualiza usuário existente
- `delete` - Deleta usuário

### Router `auth` (Team Login)
- `teamLogin` - Faz login com email/senha e retorna JWT
- `teamLogout` - Faz logout limpando localStorage

## Componentes Frontend

### Páginas
- `client/src/pages/TeamLogin.tsx` - Página de login da equipe
- `client/src/pages/UserManagement.tsx` - Gerenciamento de usuários (Admin)
- `client/src/pages/Profile.tsx` - Perfil do usuário

### Componentes
- `client/src/components/UserSelector.tsx` - Seleção de usuários com autocomplete @
- `client/src/components/DashboardLayout.tsx` - Layout com menu e perfil do usuário

### Hooks
- `client/src/hooks/useTeamAuth.ts` - Hook de autenticação da equipe

## Sistema de Autenticação

### JWT (JSON Web Token)
- Token gerado no login com validade de 7 dias
- Armazenado em `localStorage` como `teamToken`
- Enviado em todas as requisições via header `Authorization: Bearer {token}`
- Validado no backend em `server/_core/context.ts`

### Fluxo de Autenticação
1. Usuário faz login em `/team-login`
2. Backend valida email/senha e gera JWT
3. Frontend salva token em localStorage
4. Todas as requisições incluem token no header
5. Backend valida token e retorna dados do usuário

## Usuários Criados

### Bruno (CEO)
- **ID:** 60001
- **Email:** bruno@agenciabrn.com.br
- **Username:** @bruno
- **Senha:** V9!mQ#72zL@xP3^fR6%N
- **Role:** CEO
- **Permissões:** Acesso total ao sistema

### Karen (Master)
- **ID:** 60002
- **Email:** karen@agenciabrn.com.br
- **Username:** @karen
- **Senha:** karen123
- **Role:** Master
- **Permissões:** Gerenciar usuários, ver relatórios, NÃO ver faturamento/gastos empresa

### Ruan (Colaborador)
- **ID:** 60003
- **Email:** ruan@agenciabrn.com.br
- **Username:** @ruan
- **Senha:** ruan123
- **Role:** Colaborador
- **Permissões:** Ver apenas Kanbans compartilhados, gastos pessoais

## Roles e Permissões

### CEO
- ✅ Visualiza todos os dados do sistema
- ✅ Gerencia usuários
- ✅ Visualiza faturamento
- ✅ Visualiza gastos da empresa
- ✅ Visualiza todos os Kanbans
- ✅ Cria/edita/deleta qualquer recurso

### Master
- ✅ Gerencia usuários
- ✅ Visualiza relatórios gerais
- ✅ Visualiza gastos pessoais e compartilhados
- ✅ Visualiza todos os Kanbans
- ❌ NÃO visualiza faturamento do CEO
- ❌ NÃO visualiza gastos da empresa

### Colaborador
- ✅ Visualiza gastos pessoais
- ✅ Visualiza Kanbans compartilhados
- ✅ Edita perfil próprio
- ❌ NÃO gerencia usuários
- ❌ NÃO visualiza gastos de outros
- ❌ NÃO visualiza Kanbans não compartilhados

## Funcionalidades Implementadas

### ✅ Concluído
- Sistema de login com JWT
- Autenticação via header Authorization
- Página de gerenciamento de usuários
- Busca de usuários (para autocomplete)
- Criação/edição/deleção de usuários
- Sistema de roles (CEO/Master/Colaborador)
- Página de perfil do usuário
- Logout com limpeza de token

### 🚧 Pendente
- [ ] Recuperação de senha
- [ ] Alteração de senha pelo usuário
- [ ] Upload de foto de perfil
- [ ] Histórico de atividades do usuário
- [ ] Auditoria de ações (logs)
- [ ] Bloqueio de conta após tentativas falhas

## Notas de Desenvolvimento

- Senhas são armazenadas em base64 (ATENÇÃO: não é seguro para produção, usar bcrypt)
- JWT tem validade de 7 dias e não tem refresh token
- O sistema usa `ctx.user` no backend para identificar o usuário autenticado
- Todos os 129 testes estão passando
- A página de gerenciamento está em `/admin/user-management`
