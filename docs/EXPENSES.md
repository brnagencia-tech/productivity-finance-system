# Módulo de Despesas - Documentação

## Estrutura do Banco de Dados

### Tabela `variable_expenses`
- `id` - ID único da despesa
- `userId` - ID do usuário proprietário
- `category` - Categoria da despesa
- `amount` - Valor da despesa
- `description` - Descrição da despesa
- `date` - Data da despesa
- `expenseType` - Tipo: "pessoal" | "compartilhado" | "empresa"
- `currency` - Moeda: "BRL" | "USD"
- `location` - Localização: "BRN" | "USA" (opcional)
- `sharedWith` - Array de IDs de usuários (para gastos compartilhados)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## Procedures tRPC

### Router `expenses`

#### Queries
- `listVariable` - Lista despesas variáveis do usuário com filtros de data
- `getStatsByTypeAndCurrency` - Retorna estatísticas de gastos por tipo e moeda

#### Mutations
- `createVariable` - Cria nova despesa variável
  - Aceita: category, amount, description, date, expenseType, currency, location, sharedWith
- `updateVariable` - Atualiza despesa existente
- `deleteVariable` - Deleta despesa

## Componentes Frontend

### Dashboard (`client/src/pages/Home.tsx`)
Cards de gastos por tipo e moeda:
- Gastos Pessoais BRL
- Gastos Pessoais USD
- Gastos Compartilhados BRL
- Gastos Compartilhados USD
- Gastos da Empresa BRL
- Gastos da Empresa USD

## Funcionalidades Implementadas

### ✅ Concluído
- Sistema de gastos multi-moeda (BRL/USD)
- Tipos de gastos (pessoal, compartilhado, empresa)
- Localização dos gastos (BRN/USA)
- Compartilhamento de gastos com usuários específicos
- Dashboard com cards separados por tipo e moeda
- Filtros de período (Hoje, 7 dias, 30 dias, Ano)
- Estatísticas por tipo e moeda

### 🚧 Pendente
- [ ] Interface para adicionar gastos com seleção de tipo/moeda/localização
- [ ] Notificação para CEO quando colaborador adiciona despesa da empresa
- [ ] Conversão automática de moeda (API de câmbio)
- [ ] Gráficos de evolução de gastos
- [ ] Relatórios de gastos por categoria
- [ ] Exportação de gastos (CSV/PDF)

## Permissões de Visualização

### CEO (Bruno)
- Visualiza TODOS os gastos:
  - Pessoais BRL/USD (próprios)
  - Compartilhados BRL/USD (Bruno + Karen)
  - Empresa BRL/USD (todos os gastos da empresa)

### Master (Karen)
- Visualiza gastos EXCETO empresa:
  - Pessoais BRL/USD (próprios)
  - Compartilhados BRL/USD (Bruno + Karen)
  - ❌ NÃO visualiza gastos da empresa

### Colaborador (Ruan, etc.)
- Visualiza apenas gastos pessoais:
  - Pessoais BRL/USD (próprios)
  - ❌ NÃO visualiza compartilhados
  - ❌ NÃO visualiza empresa

## Exemplos de Uso

### Criar Gasto Pessoal em BRL
```typescript
trpc.expenses.createVariable.mutate({
  category: "Alimentação",
  amount: 150.00,
  description: "Almoço no restaurante",
  date: "2026-01-08",
  expenseType: "pessoal",
  currency: "BRL",
  location: "BRN"
});
```

### Criar Gasto Compartilhado em USD
```typescript
trpc.expenses.createVariable.mutate({
  category: "Viagem",
  amount: 500.00,
  description: "Hotel em Miami",
  date: "2026-01-08",
  expenseType: "compartilhado",
  currency: "USD",
  location: "USA",
  sharedWith: [60001, 60002] // Bruno + Karen
});
```

### Criar Gasto da Empresa
```typescript
trpc.expenses.createVariable.mutate({
  category: "Marketing",
  amount: 2000.00,
  description: "Campanha Google Ads",
  date: "2026-01-08",
  expenseType: "empresa",
  currency: "BRL",
  location: "BRN"
});
```

## Notas de Desenvolvimento

- A lógica de permissões ainda precisa ser implementada no backend para filtrar gastos por tipo
- O dashboard já mostra os cards separados por tipo e moeda
- A query `getStatsByTypeAndCurrency` retorna estatísticas agrupadas
- Falta implementar a interface de criação/edição de gastos com os novos campos
- Notificações de despesas da empresa ainda não foram implementadas
