# Changelog - Sistema de Produtividade e Gestão Financeira

## [Checkpoint ed72e0a1] - 2026-01-15 - Ajustes Finais Clientes
### Adicionado
- Botões de Exportar/Importar CSV na página de Clientes
- Paginação (10 itens por página) na lista de clientes
- Controles de navegação (Anterior/Próxima)
- Indicador de página atual e total de registros

### Modificado
- Removido item "Contatos" do menu lateral (DashboardLayout)
- Página de Clientes agora usa DashboardLayout (menu lateral visível)

### Arquivos Alterados
- `client/src/pages/Clients.tsx` - Adicionado CSV e paginação
- `client/src/components/DashboardLayout.tsx` - Removido menu Contatos

---

## [Checkpoint 7d0dd0c4] - 2026-01-15 - Refatoração Lista Compacta
### Adicionado
- Componente `ClientProfile` (Sheet lateral) para exibir detalhes do cliente
- Lista compacta em formato de tabela na página de Clientes
- Colunas: Cliente (nome + CPF/CNPJ), Empresa, Contato (email + telefone), Ações
- Hover effect e cursor pointer nas linhas da tabela
- Abertura de perfil lateral ao clicar na linha

### Arquivos Criados
- `client/src/components/ClientProfile.tsx` - Componente de perfil lateral

### Arquivos Alterados
- `client/src/pages/Clients.tsx` - Refatorado para lista compacta + perfil lateral

---

## [Checkpoint Atual] - 2026-01-15 - Sistema Financeiro Multi-Moeda Completo

### Adicionado
- **Endpoints tRPC de Revenues** (`server/routers.ts`):
  - `revenues.list` - Listar receitas com filtros (tipo, moeda, período)
  - `revenues.getById` - Buscar receita por ID com validação de permissões
  - `revenues.create` - Criar nova receita
  - `revenues.update` - Atualizar receita existente
  - `revenues.delete` - Excluir receita
  - `revenues.getTotalsByTypeAndCurrency` - Obter totais agrupados por tipo e moeda
  - Validação de permissões: usuários veem apenas seus dados, admins veem tudo

- **Componente ReceiptUpload** (`client/src/components/ReceiptUpload.tsx`):
  - Upload de comprovantes (imagens e PDF) com drag-and-drop
  - Validação de tamanho (máx 16MB) e formato
  - Preview de imagens carregadas
  - OCR automático para roles `admin` (estrutura pronta para integração)
  - Preenchimento manual para usuários comuns

- **Página de Faturamento** (`client/src/pages/Revenues.tsx`):
  - Tabs Pessoal/Empresa para segmentação de dados
  - 4 cards de totais: Pessoal BRL/USD e Empresa BRL/USD
  - Filtros: período (data início/fim) e moeda (BRL/USD/Todas)
  - Listagem de receitas em cards com informações detalhadas
  - Modal de cadastro/edição integrado com ReceiptUpload
  - Ações de editar e excluir com confirmação
  - Formatação de moeda automática (BRL/USD)

### Modificado
- **DashboardLayout** (`client/src/components/DashboardLayout.tsx`):
  - Item "Faturamento" agora aponta para `/faturamento` (nova página)

- **App.tsx** (`client/src/App.tsx`):
  - Adicionada rota `/faturamento` com PrivateRoute

### Arquivos Criados
- `client/src/components/ReceiptUpload.tsx`
- `client/src/pages/Revenues.tsx`

### Arquivos Modificados
- `server/routers.ts` - Adicionado router `revenues` completo
- `client/src/App.tsx` - Adicionada rota `/faturamento`
- `client/src/components/DashboardLayout.tsx` - Atualizado path do menu Faturamento

### Pendente (Próximas Iterações)
- Implementar upload real para S3 no ReceiptUpload
- Integrar OCR real usando `invokeLLM` para admins
- Atualizar páginas de Despesas Variáveis e Fixas para suportar novos campos (currency, expenseType)
- Atualizar Dashboard principal com dados multi-moeda

---

## [Em Progresso] - 2026-01-15 - Sistema Financeiro Multi-Moeda (Base)
### Adicionado
- Tabela `revenues` (faturamento) no banco de dados com campos:
  - `revenueType` (pessoal/empresa)
  - `currency` (BRL/USD)
  - `description`, `amount`, `date`, `category`, `client`, `notes`, `receiptUrl`
  
- Campos adicionados em `fixed_expenses`:
  - `expenseType` (pessoal/empresa)
  - `currency` (BRL/USD)
  
- Campos adicionados em `variable_expenses`:
  - `time` (hora da compra no formato HH:MM:SS)
  - `cnpj` (CNPJ da empresa fornecedora)

- Helpers no `server/db.ts`:
  - `getRevenuesByUser()` - Lista faturamentos com filtros
  - `getRevenueById()` - Busca faturamento por ID
  - `createRevenue()` - Cria novo faturamento
  - `updateRevenue()` - Atualiza faturamento
  - `deleteRevenue()` - Deleta faturamento
  - `getRevenueTotalsByTypeAndCurrency()` - Totais agrupados por tipo e moeda

### Removido
- Widget "Alertas de Vencimento" do Dashboard (Home.tsx)
- Import de `ExpirationAlertsWidget` no Home.tsx

### Arquivos Alterados
- `drizzle/schema.ts` - Adicionado tabela revenues, campos em expenses
- `server/db.ts` - Adicionado imports e helpers de revenues
- `client/src/pages/Home.tsx` - Removido widget de alertas

### Pendente (Próximos Passos)
- [ ] Criar endpoints tRPC para revenues (create, list, update, delete)
- [ ] Criar endpoints tRPC para variable_expenses com novos campos
- [ ] Criar endpoints tRPC para fixed_expenses com novos campos
- [ ] Criar endpoint tRPC para upload de comprovante (S3)
- [ ] Criar endpoint tRPC para OCR de nota fiscal (apenas admin)
- [ ] Criar página `/faturamento` com tabs Pessoal/Empresa e filtro de moeda
- [ ] Criar página `/despesas-variaveis` com upload de comprovante
- [ ] Criar página `/despesas-fixas` com gestão de recorrências
- [ ] Atualizar Dashboard com cards separados por moeda (BRL/USD)
- [ ] Implementar componente de upload de imagem/PDF
- [ ] Implementar OCR automático para roles admin
- [ ] Implementar preenchimento manual para usuários comuns

### Regras de Negócio Definidas
1. **Controle de Acesso:**
   - Usuário comum: vê apenas seus próprios registros
   - Admin/CEO: vê todos os registros da empresa
   
2. **Upload de Comprovantes:**
   - Usuários comuns: upload + preenchimento manual (sem custo de OCR)
   - Admin/CEO: upload + OCR automático ilimitado + revisão
   
3. **Visualização de Dados:**
   - Filtros por: período, categoria, moeda (BRL/USD), tipo (pessoal/empresa)
   - Cálculos automáticos de totais por moeda
   - Conversão de moeda opcional com taxa configurável

### Notas Técnicas
- Migrations aplicadas via SQL direto (ALTER TABLE) devido a conflito com tabela `password_reset_tokens`
- Schema Drizzle atualizado mas migrations automáticas desabilitadas
- Todos os campos de moeda usam ENUM('BRL', 'USD')
- Todos os campos de tipo usam ENUM('pessoal', 'empresa')
- Campo `time` em variable_expenses armazena hora no formato HH:MM:SS
- Campo `cnpj` em variable_expenses tem limite de 18 caracteres (formato: 00.000.000/0000-00)

---

## Estrutura de Arquivos Atual

```
/home/ubuntu/productivity-finance-system/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ClientProfile.tsx (NOVO)
│       │   ├── ClientSites.tsx
│       │   ├── DashboardLayout.tsx (MODIFICADO)
│       │   └── ExpirationAlertsWidget.tsx (NÃO USADO)
│       └── pages/
│           ├── Home.tsx (MODIFICADO)
│           └── Clients.tsx (MODIFICADO)
├── server/
│   ├── db.ts (MODIFICADO)
│   └── routers.ts
├── drizzle/
│   └── schema.ts (MODIFICADO)
└── todo.md (ATUALIZADO)
```

---

## Convenções de Desenvolvimento

### Regra de Não-Modificação
A partir do checkpoint 7d0dd0c4, **todas as novas implementações devem ser aditivas**:
- ✅ Criar novos arquivos
- ✅ Adicionar novas funções/componentes
- ✅ Adicionar novos endpoints tRPC
- ❌ NÃO modificar código existente que já funciona
- ❌ NÃO refatorar componentes já criados
- ❌ NÃO alterar estrutura de dados existente

### Documentação Obrigatória
Toda modificação deve ser documentada neste arquivo com:
- Data e checkpoint
- Arquivos criados/modificados
- Funcionalidades adicionadas/removidas
- Regras de negócio implementadas
- Notas técnicas relevantes
