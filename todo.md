# Project TODO - Sistema de Produtividade e Gestão Financeira

## Fase 1: Estrutura Base
- [x] Schema do banco de dados completo (users, categories, tasks, expenses, habits, kanban)
- [x] Configuração de tema escuro profissional
- [x] Layout base com DashboardLayout e navegação

## Fase 2: Sistema de Categorias e Dashboard
- [x] CRUD de categorias customizáveis (ícones, cores, tipo pessoal/profissional)
- [x] Dashboard principal com cards de resumo
- [x] Gráficos de gastos e tarefas

## Fase 3: Monitor de Tarefas Semanal
- [x] CRUD de tarefas com frequência (diário/semanal/mensal)
- [x] Visualização semanal com status por dia (Feito/Não feito/Em progresso)
- [x] Cálculo automático de taxa de conclusão
- [x] Atribuição de tarefas (@menção de usuários)
- [x] Separação tarefas pessoais vs profissionais

## Fase 4: Sistema Kanban Colaborativo
- [x] CRUD de quadros Kanban
- [x] Colunas customizáveis
- [x] Cards com responsáveis, prioridade, data limite
- [x] Compartilhamento seletivo (privado/compartilhado/público)
- [ ] Atualizações em tempo real (WebSocket) - Pendente

## Fase 5: Gestão Financeira
- [x] Rastreador de despesas variáveis (data, categoria, empresa, valor, notas)
- [x] Upload de comprovantes/recibos
- [x] Controle de despesas fixas (vencimento, status pago)
- [x] Cálculo automático de totais
- [x] Separação gastos pessoais vs profissionais

## Fase 6: Planilha Anual e Hábitos
- [x] Planilha de gastos anual mês a mês
- [x] Comparativos e gráficos de evolução
- [x] Rastreamento de hábitos de saúde (academia, água, alimentação, caminhada)
- [x] Metas e % de conclusão de hábitos
- [ ] Alertas de orçamento - Pendente

## Fase 7: Funcionalidades Extras
- [x] Integração com GPT para análises semanais
- [ ] OCR automático de comprovantes
- [ ] Exportação de dados em CSV
- [ ] Lembretes de vencimento de despesas fixas
- [ ] Filtros avançados por período e categoria

## Testes
- [x] Testes unitários das funcionalidades principais (29 testes passando)

## Melhorias Solicitadas (Nova Iteração)
- [x] Cadastro de pessoas com nome, telefone e e-mail
- [x] Seleção automática de pessoas cadastradas ao compartilhar
- [x] Modal de detalhes do card Kanban com comentários
- [x] Checklist dentro dos cards do Kanban
- [x] Drag and drop nos cards do Kanban entre colunas
- [x] Corrigir cálculo de tarefas no dashboard
- [x] Integrar gastos direto na planilha ao adicionar
- [x] Implementar tema claro (substituir tema escuro)
- [x] Remover necessidade de convite por e-mail (usar cadastro existente)

## Integração GPT - Análises Semanais
- [x] Criar funções de coleta de dados para análise (gastos, tarefas, hábitos)
- [x] Implementar integração com LLM para gerar análises
- [x] Criar endpoint tRPC para análise de gastos
- [x] Criar endpoint tRPC para análise de produtividade
- [x] Criar endpoint tRPC para recomendações personalizadas (insights semanais)
- [x] Desenvolver página de Insights no dashboard
- [x] Adicionar cards de resumo com insights principais
- [ ] Implementar histórico de análises - Pendente
- [x] Testes unitários das funcionalidades de análise (43 testes passando)

## Nova Iteração - Funcionalidades Avançadas

### Gestão de Usuários (Admin)
- [x] Menu Usuários no painel admin
- [x] Criar usuários com nome, sobrenome, email, telefone (BR/US)
- [x] Geração automática de senha forte
- [x] Confirmação de senha
- [ ] Página de login para usuários criados - Pendente (requer fluxo de autenticação customizado)
### Configurações do Sistema
- [x] Página de configurações para admin
- [x] Campo para token GPT customizável
- [x] Armazenamento seguro de credenciais

### Sistema de Faturamento/Vendas
- [x] Tabela de vendas/faturamento
- [x] Split diário de vendas
- [x] Cálculo de lucro mensal
- [x] Alertas de gastos vs receitas
- [ ] Estimativa de despesa mensal por empresa - Pendente

### Despesas Fixas Melhoradas
- [x] Notificações de vencimento de despesas fixas
- [x] Mover automaticamente para "pagas" quando marcadas
- [x] Separação visual despesas pendentes vs pagas

### Histórico de Análises
- [x] Salvar análises semanais no banco
- [x] Página de histórico de análises
- [x] Comparativo de evolução ao longo do tempo
- [ ] Gráficos de tendência - Pendente

### Monitor de Tarefas Redesenhado
- [x] Layout em tabela semanal (como referência)
- [x] Colunas por dia da semana
- [x] Status coloridos (Feito/Não feito/Em progresso)
- [x] Taxa de conclusão por tarefa

### Melhorias Visuais (CSS)
- [x] Design mais moderno e profissional (fonte Inter)
- [x] Cores consistentes (verde esmeralda como destaque)
- [x] Tema claro limpo e elegante
- [x] Animações e transições suaves
- [x] Scrollbar customizado
- [x] Classes utilitárias (card-hover, gradient-text, glass, elevation)

## Nova Iteração - WebSocket, Login e Username

### WebSocket Kanban
- [x] Implementar Socket.IO no servidor
- [x] Atualização em tempo real quando cards são movidos
- [x] Notificação visual quando outro usuário faz alterações

### Sistema de Username (@)
- [x] Adicionar campo username ao schema de usuários
- [x] Gerar @ único automaticamente baseado no nome
- [ ] Permitir menções @usuario nos cards do Kanban - Pendente
- [ ] Autocomplete de usuários ao digitar @ - Pendente

### Tela de Login
- [x] Criar página de login para usuários gerenciados (/login)
- [x] Autenticação com email/senha
- [x] Sessão separada do OAuth principal (token base64)

### Arrumar Menu Lateral
- [x] Reorganizar itens do menu com seções
- [x] Separar seções claramente (Principal, Finanças, Ferramentas, Admin)
- [x] Melhorar espaçamento e hierarquia visual

### Testes
- [x] 69 testes unitários passando
- [x] 93 testes unitários passando (incluindo 16 novos testes de RBAC e multi-login)

## Correção Urgente
- [x] Corrigir sobreposição dos títulos das seções no menu lateral (FINANÇAS, FERRAMENTAS, ADMINISTRAÇÃO)

## Correção CSS Menu Lateral
- [x] Investigar por que os títulos das seções ainda sobrepõem os itens
- [x] Corrigir CSS definitivamente usando SidebarGroup do shadcn/ui

## Autocomplete @Menções
- [x] Criar componente de autocomplete para @menções
- [x] Detectar quando usuário digita @ no campo de comentário
- [x] Mostrar dropdown com lista de usuários filtrada
- [x] Inserir @username no texto ao selecionar
- [x] Destacar visualmente as menções no comentário
- [x] Testes unitários para MentionInput

## Multi-Login e Sistema de Permissões
- [x] Atualizar schema com roles (admin, manager, user) e permissões
- [x] Implementar endpoints tRPC para roles, permissões e sessões
- [x] Criar painel de gestão avançada de usuários com atribuição de roles
- [x] Implementar controle de acesso baseado em permissões (hasPermission)
- [x] Adicionar auditoria de ações dos usuários (audit logs)
- [x] Implementar sistema de sessões para multi-login
- [x] Testes unitários para sistema de permissões (16 testes passando)
- [x] Página AdvancedUserManagement com tabs para Usuários, Roles, Sessões e Auditoria
- [x] Endpoints para gerenciar roles de usuários (assign/remove)
- [x] Endpoints para visualizar e gerenciar sessões ativas
- [x] Endpoints para visualizar logs de auditoria
- [ ] Proteger rotas e funcionalidades por permissões (middleware em progresso)
- [ ] Interface de multi-login no cliente (account switcher)
- [ ] Testes de integração completos para RBAC


## Reorganização de Finanças e Reestruturação de Tarefas/Hábitos

### Fase 1: Reorganização Financeira
- [x] Reorganizar menu lateral: Faturamento em primeiro (antes de Despesas Variáveis)
- [x] Corrigir cálculo de Lucro Líquido: Faturamento - Despesas Fixas - Despesas Variáveis
- [x] Verificar por que Lucro Líquido não atualiza ao adicionar vendas (problema: estava somando TODAS as despesas fixas)
- [x] Adicionar cards de Faturamento no Dashboard Principal
- [x] Adicionar resumo Receita/Despesa/Saldo no Dashboard

### Fase 2: Reestruturação de Tarefas e Hábitos
- [ ] Criar entidade única TrackerItem (unificar tarefas e hábitos)
- [ ] Implementar 4 modos de visualização: Hora | Dia | Semana | Mês
- [ ] Modo Hora: múltiplas marcações no dia (água, remédio, etc.)
- [ ] Modo Dia: lista com progresso individual
- [ ] Modo Semana: grade por dia com status visual
- [ ] Modo Mês: visão de consistência mensal
- [ ] Remover "Taxa 257%" e substituir por "done/expected" (ex: 5/8)
- [ ] Implementar sistema de check-ins para rastreamento

### Fase 3: Redesenho do Dashboard
- [ ] Criar header fixo com filtros globais (Hoje | 7 dias | 30 dias | Ano)
- [ ] Adicionar toggle Pessoal | Profissional
- [ ] Adicionar CTAs rápidas: + Tarefa, + Hábito, + Despesa, + Venda
- [ ] Implementar linha de Cockpit Cards (4-6 cards clicáveis)
- [ ] Card: Tarefas Hoje (done/total + próxima tarefa)
- [ ] Card: Hábitos Hoje (done/total + streak 🔥)
- [ ] Card: Financeiro do mês (Receita/Despesa/Saldo)
- [ ] Card: Alertas (vencimentos/tarefas atrasadas)
- [ ] Card: Produtividade 7 dias (consistência %)
- [ ] Implementar widgets 2 colunas (Prioridades + Kanban Snapshot | Gastos + Receita x Despesa)
- [ ] Adicionar linha 3 com Insights IA

### Fase 4: Design System Moderno
- [ ] Padronizar tamanho dos cards
- [ ] Aumentar hierarquia tipográfica (título forte, número grande, label pequeno)
- [ ] Melhorar tabelas com hover, badges discretas, menu "…"
- [ ] Implementar estados vazios decentes com CTAs
- [ ] Melhorar sidebar: ícones alinhados, seções com divisória, item ativo mais claro
- [ ] Reduzir espaços vazios e aumentar densidade
- [ ] Implementar componentes padrão: Card, Button, Badge, Table, Modal, Empty State, Skeleton

### Fase 5: Testes e Validação
- [ ] Testar cálculos de lucro com múltiplas vendas
- [ ] Validar atualização em tempo real do Dashboard
- [ ] Testar responsividade (desktop/mobile)
- [ ] Validar 4 modos de visualização (Hora/Dia/Semana/Mês)
- [ ] Testes unitários para nova lógica de financeiro

### Observações Importantes
- NÃO deletar nada que já foi criado
- Apenas reorganizar ordem no menu
- Manter todas as funcionalidades existentes
- Foco em corrigir cálculos e adicionar visualizações

## Melhoria do Dashboard

### Fase 1: Análise e Planejamento
- [x] Analisar layout atual do Dashboard
- [x] Identificar oportunidades de melhoria visual
- [x] Planejar novos cards informativos

### Fase 2: Redesenho de Layout
- [x] Reorganizar grid do Dashboard para layout responsivo
- [x] Melhorar espaçamento e alinhamento
- [x] Adicionar header com filtros (Hoje | 7 dias | 30 dias | Ano)

### Fase 3: Novos Cards
- [x] Card de Tarefas do Dia (0/1 - 0% concluídas)
- [x] Card de Hábitos do Dia (1/1 - 100% completados)
- [x] Card de Alertas (Prejuízo, Sem tarefas, Sem hábitos)
- [x] Card de Produtividade (score do dia com progresso)

### Fase 4: Visual e Tipografia
- [ ] Melhorar cores e contraste dos cards
- [ ] Padronizar tipografia
- [ ] Adicionar ícones mais expressivos
- [ ] Melhorar estados vazios

### Fase 5: Testes
- [ ] Testar responsividade em mobile
- [ ] Testar em diferentes navegadores
- [ ] Validar performance


## Correções Urgentes

### Erro ao Criar Usuário
- [x] Corrigir campo phoneUS vazio ao criar usuário (estava recebendo default em vez do valor fornecido)
- [x] Validar que ambos os campos de telefone (BR/US) são salvos corretamente

### Alerta de Prejuízo Melhorado
- [x] Mostrar cálculo detalhado no alerta: Receita - Despesas = Prejuízo
- [x] Exemplo: "Receita (R$ 27.000,00) - Despesas (R$ 29.420,00) = Prejuízo (R$ -2.420,00)"
- [x] Acompanhar os cálculos para que o usuário entenda a origem do prejuízo


## Página de Login da Equipe

### Fase 1: Endpoint de Autenticação
- [x] Criar endpoint tRPC para autenticação de usuários gerenciados (email/senha)
- [x] Validar credenciais contra banco de dados
- [x] Gerar token de sessão para usuários autenticados
- [x] Retornar dados do usuário e token

### Fase 2: Página de Login
- [x] Criar página /team-login com formulário de email/senha
- [x] Adicionar validação de formulário
- [x] Implementar tratamento de erros
- [x] Adicionar loading state durante autenticação

### Fase 3: Lógica de Autenticação
- [x] Implementar hook useTeamAuth para gerenciar estado de autenticação
- [x] Armazenar token em localStorage ou sessionStorage
- [x] Criar contexto de autenticação da equipe

### Fase 4: Redirecionamento
- [x] Redirecionar para dashboard após login bem-sucedido
- [x] Redirecionar para /team-login se tentar acessar dashboard sem autenticação
- [x] Implementar proteção de rotas

### Fase 5: Proteção de Rotas
- [x] Criar PrivateRoute component para rotas protegidas
- [x] Verificar autenticação antes de renderizar dashboard
- [x] Implementar logout

### Fase 6: Testes
- [x] Todos os 93 testes passando
- [x] Endpoint de login testado
- [x] Redirecionamento automático implementado
- [x] Proteção de rotas implementada


## Integração LLM com Leitura Prévia de Dados

### Fase 1: Endpoint de Coleta de Dados
- [x] Criar endpoint tRPC para coletar dados de contexto (tarefas, hábitos, despesas, receitas)
- [x] Agregar dados por período (hoje, 7 dias, 30 dias)
- [x] Calcular métricas de produtividade e financeiras
- [x] Formatar dados para análise do LLM

### Fase 2: Análise com LLM
- [x] Implementar função para chamar LLM com dados coletados
- [x] Criar prompts estruturados para gerar sugestões
- [x] Implementar tratamento de erros e fallback
- [ ] Cachear sugestões para evitar chamadas repetidas

### Fase 3: Página de Insights
- [x] Criar página /ai-insights com sugestões do LLM
- [x] Exibir dados de contexto (Produtividade, Financeiro)
- [x] Adicionar botão para gerar novas sugestões
- [x] Mostrar loading state durante geração

### Fase 4: Cache de Sugestões
- [ ] Armazenar sugestões em banco de dados
- [ ] Implementar invalidação de cache por período
- [ ] Mostrar sugestões em cache enquanto gera novas

### Fase 5: Streaming de Respostas
- [ ] Implementar streaming de respostas do LLM
- [ ] Mostrar sugestões em tempo real enquanto são geradas
- [ ] Adicionar loading state com animação

### Fase 6: Testes
- [x] Todos os 93 testes passando
- [x] Endpoint de insights testado
- [x] Página de insights criada
- [x] Integração com LLM implementada


## Correções de Gerenciamento de Usuários

- [x] Corrigir erro ao criar usuário com telefone vazio (phoneBR ou phoneUS)
- [x] Implementar exclusão de verdade de usuários (DELETE, não UPDATE isActive)
- [x] Criar teste de criação e exclusão de usuário (6 testes passando)
- [x] Validar que usuários excluídos somem da tela
- [x] Manter opção de editar usuários
- [x] Todos os 99 testes passando


## Isolamento de Dados por Usuário

- [x] Auditar todos os endpoints para adicionar filtro userId
- [x] Adicionar filtro userId em queries de tarefas
- [x] Adicionar filtro userId em queries de hábitos
- [x] Adicionar filtro userId em queries de despesas (variáveis e fixas)
- [x] Adicionar filtro userId em queries de receitas/faturamento
- [ ] Implementar lógica de Kanban compartilhados (múltiplos usuários podem acessar)
- [x] Adicionar validação de acesso em endpoints protegidos
- [x] Criar testes de isolamento de dados (11 testes passando)
- [x] Validar que usuários não conseguem acessar dados de outros usuários
- [x] Todos os 110 testes passando


## Kanban Compartilhados (Fase 2)

- [x] Adicionar tabela kanban_permissions no schema (já existia)
- [x] Implementar funções de banco de dados para gerenciar permissões
- [x] Atualizar endpoint getKanbanBoardsByUser para incluir kanban compartilhados
- [x] Atualizar endpoint getKanbanBoardWithDetails para validar permissões
- [x] Implementar lógica de verificação de permissões (owner, editor, viewer)
- [x] Criar testes de Kanban compartilhados (14 testes passando)
- [x] Validar que usuários com permissão podem acessar kanban compartilhados
- [x] Validar que usuários sem permissão não conseguem acessar
- [x] Todos os 124 testes passando


## Correção de Autenticação de Usuários Gerenciados

- [x] Criar usuário master Bruno (bruno@agenciabrn.com.br) - ID: 60001
- [x] Corrigir fluxo de autenticação (login -> dashboard -> não volta para login)
- [x] Garantir persistência de token após login (localStorage)
- [x] Testar que cada usuário vê apenas seus dados
- [x] Implementar logout corretamente
- [x] Proteger todas as rotas com PrivateRoute
- [x] Todos os 124 testes passando

## Correção de Fluxo de Autenticação Dual

- [x] Criar página de seleção de login (Manus OAuth vs Team Login)
- [x] Corrigir redirecionamento após Team Login para não ir para OAuth
- [x] Garantir Bruno (bruno@agenciabrn.com.br) usa OAuth Manus
- [x] Garantir demais usuários usam Team Login em /team-login
- [x] Atualizar PrivateRoute para aceitar ambos os tipos de autenticação
- [x] Testar ambos os fluxos de autenticação
- [x] Todos os 124 testes passando


## Novas Funcionalidades - Fase 3

### 1. Logout com Redirecionamento
- [x] Adicionar botão de logout na sidebar
- [x] Implementar lógica de logout para usuários da equipe (limpar localStorage)
- [x] Redirecionar para /team-login após logout
- [x] Testar logout

### 2. Página de Perfil do Usuário
- [x] Criar página /profile para visualização de dados
- [x] Exibir dados do usuário (nome, email, telefone)
- [x] Permitir edição de dados pessoais
- [ ] Adicionar upload de foto de perfil (futuro)
- [ ] Implementar salvamento de alterações no banco de dados (futuro)
- [x] Adicionar link para perfil no dropdown da sidebar

### 3. Filtros Funcionais do Dashboard
- [x] Conectar botão "Hoje" para filtrar dados do dia atual
- [x] Conectar botão "7 dias" para filtrar dados dos últimos 7 dias
- [x] Conectar botão "30 dias" para filtrar dados dos últimos 30 dias
- [x] Conectar botão "Ano" para filtrar dados do ano atual
- [x] Atualizar todos os cards do dashboard com dados filtrados
- [x] Atualizar gráficos com dados filtrados
- [x] Indicador visual do filtro ativo (botão verde)
- [x] Testar todos os filtros


## Correção de Redirecionamento - Todos para Team Login

- [x] Remover página de seleção de login (/login-selection)
- [x] Atualizar PrivateRoute para redirecionar para /team-login
- [x] Atualizar logout para redirecionar para /team-login
- [x] Remover referências a OAuth Manus no fluxo de login
- [x] Atualizar DashboardLayout para usar apenas Team Auth
- [x] Atualizar Profile para usar apenas Team Auth
- [x] Testar que todos os usuários vão para /team-login
- [x] Todos os 124 testes passando


## Bug Fix - Redirecionamento para /login-selection

- [x] Investigar onde /login-selection está sendo referenciado
- [x] Remover rota /login-selection do App.tsx
- [x] Atualizar main.tsx para redirecionar para /team-login
- [x] Implementar autenticação via header X-Team-User-Id no context.ts
- [x] Atualizar cliente tRPC para enviar header de autenticação
- [x] Criar testes para autenticação Team Login (5 testes)
- [x] Todos os 129 testes passando


## Correção de Senha e Segurança JWT

- [x] Verificar usuário bruno@agenciabrn.com.br no banco
- [x] Corrigir senha do usuário Bruno (V9!mQ#72zL@xP3^fR6%N)
- [x] Instalar jsonwebtoken e @types/jsonwebtoken
- [x] Implementar geração de JWT no login (7 dias de validade)
- [x] Implementar validação de JWT no context.ts (header Authorization)
- [x] Atualizar TeamLogin.tsx para salvar token JWT
- [x] Atualizar main.tsx para enviar JWT no header Authorization
- [x] Atualizar useTeamAuth para limpar token no logout
- [x] Todos os 129 testes passando


## Sistema de Permissões e Controle de Acesso

### 1. Sistema de Roles
- [x] Adicionar campo `role` na tabela managed_users (CEO, Master, Colaborador)
- [x] Aplicar migração no banco de dados (pnpm db:push)
- [x] Atualizar usuário Bruno para role CEO
- [x] Criar usuário Karen como Master (senha: karen123)
- [x] Criar usuário Ruan como Colaborador/Programador (senha: ruan123)
- [ ] Criar usuário Gestor de Tráfego como Colaborador
- [ ] Criar tabela de permissões (permissions)
- [ ] Criar tabela de relacionamento user_permissions

### 2. Controle de Permissões por Recurso
- [ ] Criar enum de recursos (faturamento, gastos_empresa, gastos_pessoais, kanban)
- [ ] Implementar middleware de verificação de permissões
- [ ] Proteger endpoints de faturamento (apenas CEO)
- [ ] Proteger endpoints de gastos da empresa (CEO + notificação para colaboradores)

### 3. Gastos Pessoais vs Compartilhados vs Empresa
- [x] Adicionar campo `expenseType` na tabela variable_expenses (pessoal, compartilhado, empresa)
- [x] Adicionar campo `currency` (BRL, USD)
- [x] Adicionar campo `location` (BRN, USA)
- [x] Adicionar campo `sharedWith` para gastos compartilhados (array de IDs)
- [x] Aplicar migração no banco de dados
- [x] Atualizar createVariable para incluir novos campos
- [x] Atualizar updateVariable para incluir novos campos
- [x] Criar procedure getStatsByTypeAndCurrency para estatísticas
- [x] Todos os 129 testes passando
- [ ] Implementar lógica de filtragem por permissões (CEO vê tudo, Master não vê empresa)
- [ ] Atualizar dashboard para mostrar gastos separados por tipo e moeda
- [ ] Criar componentes de UI para adicionar gastos com tipo/moeda/localização

### 4. Compartilhamento Seletivo de Kanbans
- [ ] Criar tabela kanban_access (kanban_id, user_id, access_level)
- [ ] Implementar compartilhamento de boards específicos
- [ ] Filtrar cards por usuário (apenas cards compartilhados)
- [ ] Criar Kanban "Programação" para Ruan
- [ ] Criar Kanban "Gestão de Tráfego" para Gestor

### 5. Página de Gerenciamento de Usuários
- [ ] Criar página /admin/users para gerenciar usuários
- [ ] Listar todos os usuários com roles
- [ ] Editar permissões de usuários
- [ ] Atribuir/remover acesso a Kanbans
- [ ] Visualizar histórico de atividades

### 6. Notificação de Despesas da Empresa
- [ ] Criar notificação quando colaborador adiciona despesa da empresa
- [ ] Enviar notificação para CEO (Bruno)
- [ ] Mostrar notificações no dashboard

### 7. Testes
- [ ] Testar permissões de cada role
- [ ] Testar visualização de gastos por tipo
- [ ] Testar compartilhamento de Kanbans
- [ ] Todos os testes passando


## Dashboard com Cards Multi-Moeda

- [x] Adicionar query getStatsByTypeAndCurrency no Home.tsx
- [x] Criar 6 cards no dashboard: Pessoal BRL/USD, Compartilhado BRL/USD, Empresa BRL/USD
- [x] Integrar com filtros de período existentes (Hoje, 7 dias, 30 dias, Ano)
- [x] Todos os 129 testes passando
- [ ] Implementar lógica de permissões (Master não vê cards de Empresa)
- [ ] Adicionar conversão de moeda em tempo real (API de câmbio) - opcional

## Página de Gerenciamento de Usuários

- [x] Criar página /admin/user-management
- [x] Criar hook use-toast para notificações
- [x] Listar todos os usuários com roles e status
- [x] Implementar formulário de criação de usuário com role
- [x] Implementar formulário de edição de usuário com role
- [x] Adicionar controle de deleção de usuários
- [x] Adicionar busca de usuários por nome/email/username
- [x] Atualizar procedures create/update para aceitar role
- [x] Adicionar campo role no getManagedUsersByAdmin
- [x] Adicionar rota no App.tsx
- [x] Adicionar link no menu da sidebar
- [x] Todos os 129 testes passando

## Compartilhamento Seletivo de Kanbans

- [ ] Usar tabela kanban_board_members existente
- [ ] Implementar lógica de filtro de boards por usuário
- [ ] Criar interface para compartilhar boards
- [ ] Criar Kanban "Programação" e compartilhar com Ruan
- [ ] Criar Kanban "Gestão de Tráfego" e compartilhar com Gestor
- [ ] Testar que colaboradores veem apenas boards compartilhados


## Compartilhamento Seletivo de Kanbans - Em Andamento

- [x] Criar procedure managedUsers.search para buscar usuários por nome/username
- [x] Criar função searchManagedUsers no db.ts
- [x] Criar componente UserSelector com autocomplete @ para selecionar usuários
- [x] Adicionar campo de compartilhamento no formulário de criar board
- [x] Quando visibilidade = "Compartilhado", mostrar campo UserSelector
- [x] Usuários selecionados aparecem como chips/tags
- [x] Atualizar createBoard para aceitar memberIds
- [x] Criar função addKanbanBoardMembers no db.ts
- [x] Todos os 124 testes passando
- [ ] Atualizar procedure kanban.list para filtrar boards por permissões
- [ ] Criar procedures para adicionar/remover membros de boards existentes
- [ ] Testar com usuário Ruan (Colaborador) - deve ver apenas boards atribuídos
- [ ] Testar com usuário Bruno (CEO) - deve ver todos os boards


## Finalização de Compartilhamento de Kanbans

- [x] Atualizar procedure kanban.list para filtrar boards por permissões (já estava implementado)
- [x] Colaboradores veem apenas boards compartilhados com eles
- [x] CEO e Master veem todos os boards
- [x] Criar procedure kanban.listMembers para listar membros de um board
- [x] Criar procedure kanban.addMember para adicionar membro a board existente (já existia)
- [x] Criar procedure kanban.removeMember para remover membro de board
- [x] Criar componente BoardMembersDialog para gerenciar membros
- [x] Criar Kanban "Programação" compartilhado com Ruan (Board ID: 1)
- [x] Adicionar Bruno como owner e Ruan como editor
- [x] Criar colunas padrão (A Fazer, Em Progresso, Concluído)
- [ ] Adicionar botão "Gerenciar Membros" nos cards de board na página Kanban (opcional - pode ser feito via interface)
- [x] Sistema de filtragem de boards por permissões implementado
- [x] Ruan (Colaborador) vê apenas boards compartilhados com ele
- [x] Bruno (CEO) vê todos os boards do sistema
- [x] Todos os 129 testes passando
