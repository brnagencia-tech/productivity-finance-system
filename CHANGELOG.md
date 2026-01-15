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

## [Checkpoint Atual] - 2026-01-15 - Correções Finais e Tooltips Explicativos

### Correções de Contabilização
- **Despesas Fixas na Planilha Anual**: Corrigida função `getMonthlyExpenseTrend` para incluir despesas fixas ativas em todos os meses (não apenas pós-pago)
- **Cálculo de Receita no Dashboard**: Corrigida função `getMonthlyProfitLoss` para usar tabela `revenues` (faturamento) em vez de `sales`
- **Cálculo de Despesas**: Confirmado que soma corretamente Despesas Fixas Ativas + Despesas Variáveis do mês

### Upload de Comprovantes Reposicionado
- **Removido de Faturamento**: Upload de comprovante removido da página `/faturamento` (não aplicável a vendas/comissões recebidas)
- **Adicionado em Despesas Variáveis**: Componente ReceiptUpload com OCR integrado ao formulário de despesas variáveis
- **Adicionado em Despesas Fixas**: Componente ReceiptUpload com OCR integrado ao formulário de despesas fixas
- Comprovantes agora estão apenas onde fazem sentido: registro de gastos com notas fiscais

### Tooltips Explicativos
- **Componente InfoTooltip**: Criado componente reutilizável com ícone "i" (Info)
- **Desktop**: Hover mostra tooltip com explicação, fórmula e exemplo
- **Mobile**: Clique abre dialog com explicação detalhada
- **Dashboard - Card Receita**: Tooltip explicando cálculo (soma de faturamentos do mês)
- **Dashboard - Card Despesas**: Tooltip explicando cálculo (Fixas Ativas + Variáveis do mês)
- **Dashboard - Card Lucro Líquido**: Tooltip explicando fórmula (Receita - Despesas)
- Todos os tooltips incluem exemplos numéricos práticos

### Arquivos Criados
- `client/src/components/InfoTooltip.tsx` - Componente de tooltip explicativo

### Arquivos Modificados
- `server/db.ts`:
  - Função `getMonthlyExpenseTrend`: Adicionada soma de despesas fixas ativas
  - Função `getMonthlyProfitLoss`: Corrigida para usar tabela `revenues` em vez de `sales`
- `client/src/pages/Revenues.tsx`: Removido import e uso de ReceiptUpload
- `client/src/pages/VariableExpenses.tsx`: Adicionado ReceiptUpload com handler `handleUploadComplete`
- `client/src/pages/FixedExpenses.tsx`: Adicionado ReceiptUpload com handler `handleUploadComplete`
- `client/src/pages/Home.tsx`: Adicionados tooltips explicativos nos 3 cards principais (Receita, Despesas, Lucro Líquido)

### Notas Técnicas
- Despesas fixas ativas são contabilizadas mensalmente independente de pagamento
- Receita agora vem de `revenues` (faturamento registrado) e não de `sales` (vendas antigas)
- Tooltips usam `Tooltip` do shadcn/ui para desktop e `Dialog` para mobile
- InfoTooltip aceita props: `title`, `description`, `formula` (opcional), `example` (opcional)

---

## [Checkpoint 77217c73] - 2026-01-15 - Upload de Comprovante Completo

### Adicionado
- ReceiptUpload com OCR em Despesas Fixas (`client/src/pages/FixedExpenses.tsx`)
- Handler `handleUploadComplete` para processar URL do comprovante após upload
- Campo `receiptUrl` no estado `newExpense` de FixedExpenses

### Arquivos Modificados
- `client/src/pages/FixedExpenses.tsx`: Adicionado import, handler e componente ReceiptUpload

---

## [Checkpoint ff52c0cf] - 2026-01-15 - Correções Parciais

### Removido
- Upload de comprovante da página de Faturamento (`client/src/pages/Revenues.tsx`)

### Adicionado
- ReceiptUpload com OCR em Despesas Variáveis (`client/src/pages/VariableExpenses.tsx`)

---

## [Checkpoint 77e9fce9] - 2026-01-15 - Sistema Multi-Moeda Completo

### Adicionado (Iteração Final)
- **Filtro de Moeda em Despesas Variáveis**: Dropdown no header para filtrar por BRL, USD ou Todas as moedas
- **Dashboard Multi-Moeda**: 4 cards separados (Faturamento BRL/USD e Despesas BRL/USD) com formatação automática
- **Badges Visuais de Moeda**: Indicadores coloridos (R$ azul, $ verde) nos cards de despesas para identificação rápida
- **Campos de Moeda em Despesas Fixas**: Adicionados campos currency e expenseType no formulário

### Modificado (Iteração Final)
- `client/src/pages/VariableExpenses.tsx`: Adicionado filtro de moeda, badges visuais e lógica de filtragem
- `client/src/pages/FixedExpenses.tsx`: Adicionados campos de moeda (BRL/USD) e tipo (pessoal/empresa)
- `client/src/pages/Home.tsx`: Adicionada seção "Faturamento e Despesas por Moeda" com 4 cards

### Notas Técnicas (Iteração Final)
- Filtro de moeda usa useMemo para performance em listas grandes
- Badges de moeda com suporte a dark mode (cores adaptativas)
- Cards do Dashboard com valores estáticos (R$ 0,00 / $ 0.00) aguardando integração com endpoints tRPC
- Layout responsivo com grid 4 colunas (lg), 2 colunas (md), 1 coluna (sm)

---

## [Checkpoint 77e9fce9] - 2026-01-15 - Despesas Fixas e Variáveis Multi-Moeda

### Adicionado
- Campos de moeda (BRL/USD) em Despesas Fixas e Variáveis
- Campo de tipo (pessoal/empresa) em Despesas Fixas
- Campos de hora e CNPJ em Despesas Variáveis

---

## [Checkpoint 837ec34f] - 2026-01-15 - Integração S3, OCR e Multi-Moeda

### Adicionado (Nova Iteração)
- **Upload S3 Real**: Endpoint `revenues.uploadReceipt` implementado usando `storagePut()` para salvar comprovantes no S3 com URLs públicas
- **OCR Automático para Admins**: Endpoint `revenues.extractReceiptData` usando `invokeLLM` com visão para extrair CNPJ, empresa, valor, data e hora de notas fiscais
- **Componente ReceiptUpload Integrado**: Upload real para S3 e OCR automático para roles admin, preenchimento manual para usuários comuns
- **Campos de Multi-Moeda em Despesas Variáveis**: Adicionados campos hora, moeda (BRL/USD) e CNPJ no formulário de despesas

### Modificado (Nova Iteração)
- `server/routers.ts`: Adicionados endpoints `uploadReceipt` e `extractReceiptData` no router revenues
- `client/src/components/ReceiptUpload.tsx`: Integrado com endpoints tRPC reais de upload e OCR
- `client/src/pages/VariableExpenses.tsx`: Adicionados campos time, currency, cnpj e receiptUrl no estado e formulário

### Notas Técnicas (Nova Iteração)
- OCR limitado a roles `admin` por validação no backend
- Upload S3 usa base64 encoding para transferência de arquivos
- Nomes de arquivo no S3 incluem sufixo aleatório para evitar enumeração
- Schema JSON estrito para extração de dados de notas fiscais
- Formulário de Despesas Variáveis manteve estrutura existente (tabs Pessoal/Profissional)

---

## [Checkpoint d0ba9929] - 2026-01-15 - Sistema Financeiro Multi-Moeda Completo

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
