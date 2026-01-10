# API Reference
## Sistema de Produtividade e Gestão Financeira

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Autor:** Manus AI

---

## Sumário

O sistema expõe uma API tRPC type-safe com 15 routers principais e mais de 100 endpoints. Todos os endpoints protegidos requerem autenticação via cookie (OAuth) ou token JWT (Team Login).

**Base URL:** `https://brncrm.com.br/api/trpc`

**Autenticação:**
- OAuth: Cookie `manus_session` (httpOnly, secure, sameSite)
- Team Login: Header `Authorization: Bearer {token}`

---

## Routers Disponíveis

1. [auth](#auth) - Autenticação e gerenciamento de sessão
2. [users](#users) - Usuários OAuth (proprietários)
3. [managedUsers](#managedusers) - Usuários gerenciados (equipe)
4. [categories](#categories) - Categorias customizáveis
5. [tasks](#tasks) - Tarefas recorrentes
6. [kanban](#kanban) - Quadros Kanban colaborativos
7. [expenses](#expenses) - Despesas variáveis e fixas
8. [sales](#sales) - Faturamento e vendas
9. [budgets](#budgets) - Orçamentos mensais
10. [habits](#habits) - Hábitos de saúde
11. [dashboard](#dashboard) - Estatísticas agregadas
12. [contacts](#contacts) - Contatos/pessoas
13. [insights](#insights) - Análises assistidas por IA
14. [notifications](#notifications) - Notificações do sistema
15. [settings](#settings) - Configurações do usuário
16. [roles](#roles) - Sistema de permissões (RBAC)
17. [sessions](#sessions) - Sessões ativas
18. [audit](#audit) - Logs de auditoria

---

## auth

Autenticação e gerenciamento de sessão.

### auth.me

Retorna usuário autenticado atual.

**Tipo:** Query (público)

**Input:** Nenhum

**Output:**
```typescript
{
  id: number;
  openId?: string;        // OAuth user
  email: string;
  name: string;
  username?: string;      // Team user
  firstName?: string;     // Team user
  lastName?: string;      // Team user
  role?: string;          // Team user
  managedUserRole?: string; // Team user
} | null
```

**Exemplo:**
```typescript
const { data: user } = trpc.auth.me.useQuery();
if (user) {
  console.log(`Logado como: ${user.name || user.firstName}`);
}
```

---

### auth.logout

Faz logout do usuário OAuth (limpa cookie de sessão).

**Tipo:** Mutation (público)

**Input:** Nenhum

**Output:**
```typescript
{ success: true }
```

**Exemplo:**
```typescript
const logoutMutation = trpc.auth.logout.useMutation({
  onSuccess: () => {
    window.location.href = '/';
  }
});

logoutMutation.mutate();
```

---

### auth.teamLogin

Autentica usuário gerenciado com email/senha.

**Tipo:** Mutation (público)

**Input:**
```typescript
{
  email: string;      // Email do usuário (será sanitizado: trim + toLowerCase)
  password: string;   // Senha em plain text
}
```

**Output:**
```typescript
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  role: string;       // 'admin' | 'manager' | 'user' | 'ceo' | 'master'
  token: string;      // JWT válido por 7 dias
}
```

**Erros:**
- `Invalid credentials` - Email não encontrado, senha incorreta ou email malformado
- `User account is inactive` - Conta desativada (isActive = false)

**Exemplo:**
```typescript
const loginMutation = trpc.auth.teamLogin.useMutation({
  onSuccess: (data) => {
    localStorage.setItem('team_token', data.token);
    window.location.href = '/';
  },
  onError: (error) => {
    alert(error.message);
  }
});

loginMutation.mutate({
  email: 'bruno@agenciabrn.com.br',
  password: 'senha123'
});
```

---

### auth.changePassword

Altera senha do usuário gerenciado autenticado.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  currentPassword: string;  // Senha atual
  newPassword: string;      // Nova senha (mínimo 8 caracteres)
}
```

**Output:**
```typescript
{ success: true }
```

**Erros:**
- `UNAUTHORIZED` - Usuário não autenticado
- `NOT_FOUND` - Usuário não encontrado
- `Current password is incorrect` - Senha atual incorreta

**Exemplo:**
```typescript
const changePasswordMutation = trpc.auth.changePassword.useMutation({
  onSuccess: () => {
    alert('Senha alterada com sucesso!');
  }
});

changePasswordMutation.mutate({
  currentPassword: 'senha123',
  newPassword: 'novaSenha456'
});
```

---

## users

Usuários OAuth (proprietários do sistema).

### users.list

Lista todos os usuários OAuth.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  openId: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### users.getById

Busca usuário OAuth por ID.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{
  id: number;
  openId: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
} | null
```

---

## managedUsers

Usuários gerenciados (equipe).

### managedUsers.list

Lista todos os usuários gerenciados. Requer role `ceo` ou `master`.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  createdByUserId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneBR: string | null;
  phoneUS: string | null;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Erros:**
- `Unauthorized` - Usuário não tem permissão (não é CEO ou Master)

---

### managedUsers.search

Busca usuários gerenciados por nome, email ou username.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ query: string }  // Termo de busca (mínimo 1 caractere)
```

**Output:**
```typescript
Array<{
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}>
```

**Exemplo:**
```typescript
const { data: users } = trpc.managedUsers.search.useQuery({ query: 'bruno' });
// Retorna usuários com "bruno" no nome, email ou username
```

---

### managedUsers.create

Cria novo usuário gerenciado. Requer role `ceo` ou `master`.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phoneBR?: string;
  phoneUS?: string;
  role: 'admin' | 'manager' | 'user' | 'ceo' | 'master';
  password: string;  // Senha em plain text (será hasheada com bcrypt)
}
```

**Output:**
```typescript
{
  id: number;
  username: string;  // Gerado automaticamente: @firstname_lastname_random
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
```

**Erros:**
- `Unauthorized` - Usuário não tem permissão
- `Email already exists` - Email já cadastrado

**Exemplo:**
```typescript
const createUserMutation = trpc.managedUsers.create.useMutation({
  onSuccess: (data) => {
    console.log(`Usuário criado: ${data.username}`);
  }
});

createUserMutation.mutate({
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com',
  phoneBR: '+5511999999999',
  role: 'user',
  password: 'senha123'
});
```

---

### managedUsers.update

Atualiza dados de usuário gerenciado. Requer role `ceo` ou `master`.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneBR?: string;
  phoneUS?: string;
  role?: 'admin' | 'manager' | 'user' | 'ceo' | 'master';
}
```

**Output:**
```typescript
{ success: true }
```

---

### managedUsers.delete

Exclui usuário gerenciado (DELETE físico, não soft delete). Requer role `ceo` ou `master`.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

**Nota:** Todos os dados do usuário (tarefas, despesas, etc.) serão excluídos em cascata.

---

### managedUsers.resetPassword

Reseta senha de usuário gerenciado. Requer role `ceo` ou `master`.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  newPassword: string;  // Mínimo 8 caracteres
}
```

**Output:**
```typescript
{ success: true }
```

---

## categories

Categorias customizáveis para tarefas, despesas e hábitos.

### categories.list

Lista categorias do usuário autenticado.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  type?: 'expense' | 'task' | 'habit';  // Opcional: filtrar por tipo
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'task' | 'habit';
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### categories.create

Cria nova categoria.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  name: string;
  icon: string;      // Emoji ou nome de ícone
  color: string;     // Hex color (ex: '#3B82F6')
  type: 'expense' | 'task' | 'habit';
}
```

**Output:**
```typescript
{
  id: number;
  name: string;
  icon: string;
  color: string;
  type: string;
}
```

---

### categories.update

Atualiza categoria existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  name?: string;
  icon?: string;
  color?: string;
}
```

**Output:**
```typescript
{ success: true }
```

---

### categories.delete

Exclui categoria. Falha se houver tarefas/despesas vinculadas.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

**Erros:**
- `Cannot delete category with associated items` - Categoria tem itens vinculados

---

## tasks

Tarefas recorrentes com rastreamento de conclusão.

### tasks.list

Lista tarefas do usuário autenticado.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  scope?: 'personal' | 'professional';  // Opcional: filtrar por escopo
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  categoryId: number | null;
  title: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  type: 'personal' | 'professional';
  assignedToUsername: string | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### tasks.create

Cria nova tarefa.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  title: string;
  date: string;                          // ISO date string
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  type: 'personal' | 'professional';
  categoryId?: number;
  assignedToUsername?: string;           // @ do usuário responsável
  status?: 'not_started' | 'in_progress' | 'in_review' | 'blocked' | 'done';
}
```

**Output:**
```typescript
{
  id: number;
  title: string;
  frequency: string;
  type: string;
}
```

---

### tasks.update

Atualiza tarefa existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  title?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  type?: 'personal' | 'professional';
  categoryId?: number;
  assignedToUsername?: string;
  date?: string;
}
```

**Output:**
```typescript
{ success: true }
```

---

### tasks.updateStatus

Atualiza status de conclusão de uma tarefa.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  status: 'not_started' | 'in_progress' | 'in_review' | 'blocked' | 'done';
}
```

**Output:**
```typescript
{ success: true }
```

---

### tasks.delete

Exclui tarefa.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

## kanban

Quadros Kanban colaborativos com cards, colunas, comentários e checklists.

### kanban.listBoards

Lista quadros Kanban do usuário (próprios + compartilhados).

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  title: string;
  description: string | null;
  visibility: 'private' | 'shared' | 'public';
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### kanban.getBoard

Busca board por ID com colunas e cards. Valida permissão de acesso.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{
  id: number;
  userId: number;
  title: string;
  description: string | null;
  visibility: string;
  columns: Array<{
    id: number;
    boardId: number;
    title: string;
    position: number;
    cards: Array<{
      id: number;
      columnId: number;
      title: string;
      description: string | null;
      assignedToUsername: string | null;
      priority: 'low' | 'medium' | 'high';
      dueDate: Date | null;
      position: number;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
}
```

**Erros:**
- `Forbidden` - Usuário não tem permissão para acessar o board

---

### kanban.createBoard

Cria novo quadro Kanban.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  title: string;
  description?: string;
  visibility: 'private' | 'shared' | 'public';
}
```

**Output:**
```typescript
{
  id: number;
  title: string;
  visibility: string;
}
```

---

### kanban.updateBoard

Atualiza board existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  title?: string;
  description?: string;
  visibility?: 'private' | 'shared' | 'public';
}
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.deleteBoard

Exclui board e todos os seus dados (colunas, cards, comentários).

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.addMember

Adiciona membro ao board com permissão específica.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  boardId: number;
  userId: number;
  permission: 'owner' | 'editor' | 'viewer';
}
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.listMembers

Lista membros de um board com suas permissões.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ boardId: number }
```

**Output:**
```typescript
Array<{
  id: number;
  boardId: number;
  userId: number;
  permission: 'owner' | 'editor' | 'viewer';
  grantedAt: Date;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}>
```

---

### kanban.removeMember

Remove membro de um board.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  boardId: number;
  userId: number;
}
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.createColumn

Cria nova coluna em um board.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  boardId: number;
  title: string;
  position: number;
}
```

**Output:**
```typescript
{
  id: number;
  title: string;
  position: number;
}
```

---

### kanban.updateColumn

Atualiza coluna existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  title?: string;
  position?: number;
}
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.deleteColumn

Exclui coluna e todos os seus cards.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.createCard

Cria novo card em uma coluna.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  columnId: number;
  boardId: number;
  title: string;
  description?: string;
  assignedToUsername?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;  // ISO date string
  position: number;
}
```

**Output:**
```typescript
{
  id: number;
  title: string;
  columnId: number;
}
```

**Nota:** Emite evento WebSocket `card:created` para outros usuários conectados ao board.

---

### kanban.updateCard

Atualiza card existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  columnId?: number;
  title?: string;
  description?: string;
  assignedToUsername?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  position?: number;
  boardId?: number;  // Necessário para emitir evento WebSocket
}
```

**Output:**
```typescript
{ success: true }
```

**Nota:** Emite evento WebSocket `card:updated` para outros usuários.

---

### kanban.deleteCard

Exclui card e todos os seus comentários e checklists.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  boardId?: number;  // Opcional: para emitir evento WebSocket
}
```

**Output:**
```typescript
{ success: true }
```

**Nota:** Emite evento WebSocket `card:deleted` se boardId fornecido.

---

### kanban.getCardComments

Lista comentários de um card.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ cardId: number }
```

**Output:**
```typescript
Array<{
  id: number;
  cardId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}>
```

---

### kanban.addCardComment

Adiciona comentário a um card. Suporta @menções.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  cardId: number;
  content: string;  // Pode conter @username para mencionar usuários
}
```

**Output:**
```typescript
{
  id: number;
  content: string;
  createdAt: Date;
}
```

---

### kanban.deleteCardComment

Exclui comentário de um card.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.getCardChecklists

Lista itens de checklist de um card.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ cardId: number }
```

**Output:**
```typescript
Array<{
  id: number;
  cardId: number;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### kanban.createChecklist

Cria item de checklist em um card.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  cardId: number;
  title: string;
  position: number;
}
```

**Output:**
```typescript
{
  id: number;
  title: string;
  isCompleted: boolean;
}
```

---

### kanban.updateChecklist

Atualiza item de checklist.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  title?: string;
  isCompleted?: boolean;
  position?: number;
}
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.deleteChecklist

Exclui item de checklist.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### kanban.moveCard

Move card para outra coluna (drag and drop).

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  cardId: number;
  newColumnId: number;
  newPosition: number;
}
```

**Output:**
```typescript
{ success: true }
```

**Nota:** Emite evento WebSocket `card:moved` para sincronização em tempo real.

---

## expenses

Despesas variáveis e fixas.

### expenses.listVariable

Lista despesas variáveis do usuário.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  startDate?: string;  // ISO date string
  endDate?: string;    // ISO date string
  scope?: 'personal' | 'professional';
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  categoryId: number | null;
  date: Date;
  company: string;
  amount: number;  // Em centavos
  notes: string | null;
  receiptUrl: string | null;
  type: 'personal' | 'professional';
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### expenses.createVariable

Cria nova despesa variável.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  date: string;        // ISO date string
  categoryId?: number;
  company: string;
  amount: string;      // Valor em reais (ex: "150.50")
  notes?: string;
  receiptUrl?: string;
  type: 'personal' | 'professional';
}
```

**Output:**
```typescript
{
  id: number;
  date: Date;
  company: string;
  amount: number;
}
```

---

### expenses.updateVariable

Atualiza despesa variável existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  date?: string;
  categoryId?: number;
  company?: string;
  amount?: string;
  notes?: string;
  receiptUrl?: string;
  type?: 'personal' | 'professional';
}
```

**Output:**
```typescript
{ success: true }
```

---

### expenses.deleteVariable

Exclui despesa variável.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### expenses.listFixed

Lista despesas fixas recorrentes.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  scope?: 'personal' | 'professional';
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  description: string;
  amount: number;  // Em centavos
  dueDay: number;  // Dia do vencimento (1-31)
  isPaid: boolean;
  type: 'personal' | 'professional';
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### expenses.createFixed

Cria nova despesa fixa.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  description: string;
  categoryId?: number;
  amount: string;      // Valor em reais
  dueDay: number;      // Dia do vencimento (1-31)
  type: 'personal' | 'professional';
}
```

**Output:**
```typescript
{
  id: number;
  description: string;
  amount: number;
  dueDay: number;
}
```

---

### expenses.updateFixed

Atualiza despesa fixa existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  description?: string;
  categoryId?: number;
  amount?: string;
  dueDay?: number;
  isPaid?: boolean;
  type?: 'personal' | 'professional';
}
```

**Output:**
```typescript
{ success: true }
```

---

### expenses.deleteFixed

Exclui despesa fixa.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### expenses.getFixedPayments

Lista pagamentos de despesas fixas de um mês específico.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  month: number;  // 1-12
  year: number;
}
```

**Output:**
```typescript
Array<{
  fixedExpenseId: number;
  month: number;
  year: number;
  isPaid: boolean;
  paidAt: Date | null;
}>
```

---

### expenses.setFixedPayment

Marca despesa fixa como paga/não paga em um mês.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  fixedExpenseId: number;
  month: number;
  year: number;
  isPaid: boolean;
}
```

**Output:**
```typescript
{ success: true }
```

---

### expenses.getByCategory

Retorna despesas agrupadas por categoria em um mês.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  month: number;
  year: number;
}
```

**Output:**
```typescript
Array<{
  categoryId: number;
  categoryName: string;
  total: number;  // Em centavos
}>
```

---

### expenses.getMonthlyTrend

Retorna tendência de despesas ao longo do ano.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ year: number }
```

**Output:**
```typescript
Array<{
  month: number;
  total: number;
}>
```

---

### expenses.getStatsByTypeAndCurrency

Retorna estatísticas de despesas por tipo (pessoal/profissional) e moeda.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  startDate?: string;
  endDate?: string;
}
```

**Output:**
```typescript
{
  personal: {
    brl: number;
    usd: number;
  };
  professional: {
    brl: number;
    usd: number;
  };
}
```

---

## sales

Faturamento e vendas.

### sales.list

Lista vendas/receitas do usuário.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  month?: number;  // 1-12
  year?: number;
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  date: Date;
  description: string | null;
  amount: number;  // Em centavos
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### sales.create

Cria nova venda/receita.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  date: string;        // ISO date string (será convertido para Date)
  description?: string;
  amount: string;      // Valor em reais
  source?: string;
}
```

**Output:**
```typescript
{
  id: number;
  date: Date;
  amount: number;
}
```

---

### sales.update

Atualiza venda existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  description?: string;
  amount?: string;
  source?: string;
  date?: string;
}
```

**Output:**
```typescript
{ success: true }
```

---

### sales.delete

Exclui venda.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### sales.getDailySplit

Retorna vendas agrupadas por dia em um mês.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  month: number;
  year: number;
}
```

**Output:**
```typescript
Array<{
  date: Date;
  total: number;
  count: number;
}>
```

---

### sales.getMonthlyRevenue

Retorna receita mensal ao longo do ano.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ year: number }
```

**Output:**
```typescript
Array<{
  month: number;
  total: number;
}>
```

---

### sales.getProfitLoss

Calcula lucro/prejuízo de um mês (receita - despesas).

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  month: number;
  year: number;
}
```

**Output:**
```typescript
{
  revenue: number;
  expenses: number;
  profit: number;  // Pode ser negativo (prejuízo)
}
```

---

## budgets

Orçamentos mensais por categoria.

### budgets.list

Lista orçamentos de um ano.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ year: number }
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  categoryId: number | null;
  month: number;
  year: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### budgets.create

Cria novo orçamento.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  categoryId?: number;
  month: number;
  year: number;
  amount: string;
}
```

**Output:**
```typescript
{
  id: number;
  month: number;
  year: number;
  amount: number;
}
```

---

### budgets.update

Atualiza orçamento existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  amount?: string;
  categoryId?: number;
}
```

**Output:**
```typescript
{ success: true }
```

---

## habits

Hábitos de saúde com rastreamento diário.

### habits.list

Lista hábitos do usuário.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  name: string;
  icon: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly';
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### habits.create

Cria novo hábito.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  name: string;
  categoryId?: number;
  icon: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly';
}
```

**Output:**
```typescript
{
  id: number;
  name: string;
  target: number;
}
```

---

### habits.update

Atualiza hábito existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  name?: string;
  categoryId?: number;
  icon?: string;
  target?: number;
  unit?: string;
  frequency?: 'daily' | 'weekly';
}
```

**Output:**
```typescript
{ success: true }
```

---

### habits.delete

Exclui hábito e todos os seus registros.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### habits.getLogs

Lista registros de hábitos em um período.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  startDate: string;  // ISO date string
  endDate: string;
}
```

**Output:**
```typescript
Array<{
  id: number;
  habitId: number;
  value: number;
  loggedAt: Date;
}>
```

---

### habits.setLog

Registra valor de um hábito em uma data.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  habitId: number;
  date: string;
  value: number;
}
```

**Output:**
```typescript
{
  id: number;
  value: number;
  loggedAt: Date;
}
```

---

## dashboard

Estatísticas agregadas para o dashboard principal.

### dashboard.getStats

Retorna estatísticas do mês (tarefas, despesas, receitas, hábitos).

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  month: number;
  year: number;
}
```

**Output:**
```typescript
{
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  expenses: {
    total: number;
    byCategory: Array<{ categoryId: number; total: number }>;
  };
  revenue: {
    total: number;
  };
  profit: {
    amount: number;
  };
  habits: {
    total: number;
    completedToday: number;
  };
}
```

---

## contacts

Contatos/pessoas para compartilhamento e atribuição.

### contacts.list

Lista contatos do usuário.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### contacts.create

Cria novo contato.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  name: string;
  email?: string;
  phone?: string;
}
```

**Output:**
```typescript
{
  id: number;
  name: string;
  email: string | null;
}
```

---

### contacts.update

Atualiza contato existente.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}
```

**Output:**
```typescript
{ success: true }
```

---

### contacts.delete

Exclui contato.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

## insights

Análises assistidas por IA.

### insights.getExpenseAnalysis

Gera análise de despesas com LLM. **Temporariamente indisponível.**

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
{ message: string }
```

---

### insights.getProductivityAnalysis

Gera análise de produtividade com LLM. **Temporariamente indisponível.**

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
{ message: string }
```

---

### insights.getWeeklyInsights

Gera insights semanais com LLM. **Temporariamente indisponível.**

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
{ message: string }
```

---

### insights.generateSuggestions

Gera sugestões personalizadas com LLM baseado em dados do período.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  period: 'today' | 'week' | 'month';
}
```

**Output:**
```typescript
{
  suggestions: string;  // Markdown com análise e recomendações
}
```

---

## notifications

Notificações do sistema (vencimentos, alertas, etc.).

### notifications.list

Lista notificações do usuário.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  unreadOnly?: boolean;  // Default: false
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}>
```

---

### notifications.markAsRead

Marca notificação como lida.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### notifications.markAllAsRead

Marca todas as notificações como lidas.

**Tipo:** Mutation (protegido)

**Input:** Nenhum

**Output:**
```typescript
{ success: true }
```

---

### notifications.delete

Exclui notificação.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ id: number }
```

**Output:**
```typescript
{ success: true }
```

---

### notifications.generateExpenseReminders

Gera notificações de vencimento de despesas fixas.

**Tipo:** Mutation (protegido)

**Input:** Nenhum

**Output:**
```typescript
{ count: number }  // Número de notificações criadas
```

---

### notifications.getUpcomingExpenses

Lista despesas fixas vencendo nos próximos 7 dias.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  description: string;
  amount: number;
  dueDay: number;
}>
```

---

## settings

Configurações do usuário (chave-valor).

### settings.get

Busca configuração por chave.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ key: string }
```

**Output:**
```typescript
{
  key: string;
  value: string;
} | null
```

---

### settings.getAll

Lista todas as configurações do usuário.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  key: string;
  value: string;
}>
```

---

### settings.set

Define valor de uma configuração.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  key: string;
  value: string;
  encrypted?: boolean;  // Default: false
}
```

**Output:**
```typescript
{ success: true }
```

---

## roles

Sistema de permissões (RBAC).

### roles.list

Lista todos os roles disponíveis.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### roles.getUserRoles

Lista roles atribuídos a um usuário.

**Tipo:** Query (protegido)

**Input:**
```typescript
{ userId: number }
```

**Output:**
```typescript
Array<{
  roleId: number;
  roleName: string;
  assignedAt: Date;
}>
```

---

### roles.getUserPermissions

Lista permissões de um usuário (agregadas de seus roles).

**Tipo:** Query (protegido)

**Input:**
```typescript
{ userId: number }
```

**Output:**
```typescript
Array<{
  resource: string;
  action: string;
  description: string;
}>
```

---

### roles.hasPermission

Verifica se usuário tem permissão específica.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  userId: number;
  permission: string;  // Formato: "resource.action" (ex: "tasks.delete")
}
```

**Output:**
```typescript
boolean
```

---

### roles.assignRole

Atribui role a um usuário. Requer permissão `users.manage`.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  userId: number;
  roleId: number;
}
```

**Output:**
```typescript
{ success: true }
```

**Erros:**
- `Permission denied` - Usuário não tem permissão `users.manage`

---

### roles.removeRole

Remove role de um usuário. Requer permissão `users.manage`.

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{
  userId: number;
  roleId: number;
}
```

**Output:**
```typescript
{ success: true }
```

---

## sessions

Sessões ativas (multi-login).

### sessions.list

Lista sessões ativas do usuário autenticado.

**Tipo:** Query (protegido)

**Input:** Nenhum

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
}>
```

---

### sessions.logout

Faz logout de uma sessão específica (invalida token).

**Tipo:** Mutation (protegido)

**Input:**
```typescript
{ sessionId: number }
```

**Output:**
```typescript
{ success: true }
```

**Nota:** Cria log de auditoria.

---

## audit

Logs de auditoria.

### audit.getLogs

Lista logs de auditoria. Requer permissão `audit.view`.

**Tipo:** Query (protegido)

**Input:**
```typescript
{
  userId?: number;  // Opcional: filtrar por usuário
  limit?: number;   // Default: 100
}
```

**Output:**
```typescript
Array<{
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId: number | null;
  details: object | null;
  ipAddress: string;
  createdAt: Date;
}>
```

**Erros:**
- `Permission denied` - Usuário não tem permissão `audit.view`

---

## WebSocket Events

O sistema usa Socket.IO para atualizações em tempo real nos quadros Kanban.

**Conexão:**
```typescript
import { io } from 'socket.io-client';

const socket = io('https://brncrm.com.br');
```

**Eventos do Cliente:**

- `join:board` - Entrar em sala de um board
  ```typescript
  socket.emit('join:board', boardId: number);
  ```

- `leave:board` - Sair da sala de um board
  ```typescript
  socket.emit('leave:board', boardId: number);
  ```

- `card:moved` - Notificar que card foi movido
  ```typescript
  socket.emit('card:moved', {
    boardId: number,
    cardId: number,
    columnId: number,
    position: number
  });
  ```

**Eventos do Servidor:**

- `card:created` - Card foi criado
  ```typescript
  socket.on('card:created', (data: {
    boardId: number,
    card: KanbanCard
  }) => {
    // Atualizar UI
  });
  ```

- `card:updated` - Card foi atualizado
  ```typescript
  socket.on('card:updated', (data: {
    boardId: number,
    card: KanbanCard
  }) => {
    // Atualizar UI
  });
  ```

- `card:deleted` - Card foi excluído
  ```typescript
  socket.on('card:deleted', (data: {
    boardId: number,
    cardId: number
  }) => {
    // Remover da UI
  });
  ```

- `card:moved` - Card foi movido (broadcast)
  ```typescript
  socket.on('card:moved', (data: {
    boardId: number,
    cardId: number,
    columnId: number,
    position: number
  }) => {
    // Atualizar posição na UI
  });
  ```

---

## Códigos de Erro

**tRPC Error Codes:**

- `UNAUTHORIZED` (401) - Usuário não autenticado
- `FORBIDDEN` (403) - Usuário não tem permissão
- `NOT_FOUND` (404) - Recurso não encontrado
- `BAD_REQUEST` (400) - Input inválido
- `INTERNAL_SERVER_ERROR` (500) - Erro interno do servidor

**Mensagens Customizadas:**

- `Invalid credentials` - Email/senha incorretos ou email malformado
- `User account is inactive` - Conta desativada
- `Current password is incorrect` - Senha atual incorreta ao trocar senha
- `Permission denied` - Usuário não tem permissão para a operação
- `Unauthorized` - Usuário não tem role adequado
- `Cannot delete category with associated items` - Categoria tem itens vinculados

---

## Rate Limiting

**Status:** Não implementado (TODO)

**Recomendações:**
- Login: 5 tentativas por minuto por IP
- Mutations: 100 requisições por minuto por usuário
- Queries: 1000 requisições por minuto por usuário

---

## Versionamento

A API não possui versionamento explícito. Mudanças breaking são evitadas sempre que possível. Novos campos são adicionados como opcionais.

**Changelog:**
- v1.0 (Janeiro 2026) - Release inicial

---

## Suporte

Para dúvidas ou problemas:
- Consulte [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Consulte [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- Entre em contato com o administrador do sistema

---

**Autor:** Manus AI  
**Última Atualização:** Janeiro 2026  
**Versão da API:** 1.0
