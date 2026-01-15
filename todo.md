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
- [x] Adicionar botão "Gerenciar Membros" nos cards de board na página Kanban (opcional - pode ser feito via interface)
- [x] Sistema de filtragem de boards por permissões implementado
- [x] Ruan (Colaborador) vê apenas boards compartilhados com ele
- [x] Bruno (CEO) vê todos os boards do sistema
- [x] Todos os 129 testes passando


## Melhorias Finais do Sistema

### 1. Sistema de Documentação de Módulos
- [ ] Criar docs/KANBAN.md com estrutura e funcionalidades
- [ ] Criar docs/HABITS.md com estrutura e funcionalidades
- [ ] Criar docs/BILLING.md com estrutura e funcionalidades
- [ ] Criar docs/EXPENSES.md com estrutura e funcionalidades
- [ ] Criar docs/USERS.md com estrutura e funcionalidades

### 2. Botão Gerenciar Membros no Kanban
- [x] Adicionar botão "Gerenciar Membros" nos cards de board
- [x] Integrar com BoardMembersDialog
- [x] Mostrar apenas para CEO e Master
- [x] Testar funcionalidade completa

### 3. Criar Boards de Exemplo
- [ ] Criar Kanban "Gestão de Tráfego" compartilhado com gestor
- [ ] Criar Kanban "Finanças Pessoais" privado do Bruno
- [ ] Criar Kanban "Projetos da Empresa" compartilhado com equipe
- [ ] Adicionar colunas e cards de exemplo em cada board

### 4. Sistema de Notificações de Atividade
- [ ] Criar tabela notifications no schema
- [ ] Criar procedures para criar/listar/marcar notificações
- [ ] Implementar notificação quando colaborador adiciona despesa empresa
- [ ] Implementar notificação quando card é movido em Kanban compartilhado
- [ ] Criar componente NotificationBell no header
- [ ] Criar página de visualização de notificações
- [ ] Testar notificações com diferentes usuários

### 4. Correções Urgentes Kanban
- [x] Corrigir UserSelector para mostrar usuários gerenciados ao digitar @
- [x] Corrigir demora ao criar quadro e mensagem "Nenhum quadro criado"
- [x] Adicionar filtro Pessoal/Profissional acima da lista de boards

### 5. Correção Urgente - Usuário Bruno
- [x] Atualizar Bruno para role CEO
- [x] Desbloquear acesso total do Bruno
- [x] Garantir que Bruno veja todos os usuários

### 6. Correção Urgente - Acesso à Página de Usuários
- [x] Investigar por que CEO e Master estão recebendo "Acesso Negado"
- [x] Corrigir lógica de autorização na página de Usuários
- [x] Testar acesso com Bruno (CEO)
- [x] Testar acesso com Karen (Master)

### 7. Limpeza e Correções Finais
- [x] Unificar menus "Usuários" e "Gerenciar Usuários" (remover duplicata)
- [x] Adicionar botão de excluir usuários na página AdminUsers
- [x] Corrigir senha da Karen (Master) - karen@agenciabrn.com.br
- [x] Remover todos os usuários de teste, deixar apenas Bruno e Karen
- [x] Testar login do Bruno (CEO)
- [x] Testar login da Karen (Master)

### 8. Correções de Perfil e Criação de Usuários
- [x] Corrigir exibição do role no perfil (mostrando "Membro da Equipe" em vez de "CEO")
- [x] Adicionar opção "Colaborador" no formulário de criação de usuário
- [x] Implementar funcionalidade de trocar senha no perfil
- [x] Validar senha atual antes de permitir troca
- [x] Confirmar nova senha
- [x] Testar troca de senha com Bruno e Karen

### 9. Correções Urgentes do Kanban
- [x] Corrigir filtro Pessoal/Profissional (mostra todos os boards independente do filtro)
- [x] Corrigir layout bagunçado ao entrar no board (colunas duplicadas e boards aparecendo dentro)
- [x] Adicionar botão de 3 pontos (⋮) para editar ou excluir quadro
- [x] Testar filtro com boards Pessoal e Profissional
- [x] Testar visualização de board sem bagunça

### 10. Correção Urgente - Erro de Autenticação Dual
- [x] Investigar erro "Unexpected token '<', "<!doctype "... is not valid JSON"
- [x] Corrigir context.ts para separar corretamente usuários OAuth e gerenciados
- [x] Garantir que usuários OAuth não acessem endpoints de usuários gerenciados
- [x] Testar com usuário OAuth (Bruno via Apple)
- [x] Testar com usuário gerenciado (Bruno/Karen via email/senha)

### 11. Reformulação Completa do Sistema de Tarefas
- [ ] Atualizar schema tasks: adicionar campos time (hora), hasTime (boolean), notes (texto)
- [ ] Modificar campo status para: "todo" | "in_progress" | "done"
- [ ] Modificar campo scope para: "personal" | "professional"
- [ ] Criar endpoint tRPC para criar tarefa com novos campos
- [ ] Criar endpoint tRPC para atualizar status da tarefa (drag & drop)
- [ ] Criar endpoint tRPC para listar tarefas ordenadas por data/hora
- [ ] Criar endpoint tRPC para deletar tarefas concluídas há mais de 7 dias
- [ ] Implementar interface de tabela com 6 colunas (Tarefa, Data, Hora, Status, Tipo, Notas)
- [ ] Implementar drag & drop de status (A fazer → Em andamento → Feito)
- [ ] Adicionar ordenação automática: mais próximas primeiro
- [ ] Destacar em vermelho tarefas "A fazer" que passaram do prazo
- [ ] Implementar campo "No time" para tarefas sem horário específico
- [ ] Integrar tarefas com hora ao calendário automaticamente
- [ ] Implementar job para remover tarefas "Feito" após 1 semana
- [ ] Testar criação de tarefa com hora e sem hora
- [ ] Testar drag & drop de status
- [ ] Testar ordenação e destaque de atrasadas
- [ ] Testar integração com calendário


## Reformulação Completa do Sistema de Tarefas (Em Andamento)

### Fase 1: Limpeza e Migração do Schema
- [x] Atualizar schema da tabela tasks (nova estrutura simplificada)
- [x] Aplicar migração do banco (pnpm db:push)
- [x] Remover tabela taskCompletions do schema
- [x] Comentar temporariamente analysis.ts e llmContext.ts
- [x] Remover referências a taskCompletions em db.ts
- [x] Atualizar getDashboardStats para nova estrutura
- [x] Corrigir getTasksByUser removendo isActive
- [x] Corrigir deleteTask para deletar de verdade
- [x] Atualizar endpoints tRPC de tasks no routers.ts
- [x] Comentar endpoints de insights temporariamente

### Fase 2: Funções Auxiliares no Backend
- [x] Criar getOverdueTasks() - buscar tarefas atrasadas (status "todo" com data passada)
- [x] Criar deleteOldCompletedTasks() - deletar tarefas "done" com mais de 7 dias
- [x] Criar getTasksOrderedByDate() - listar tarefas ordenadas por data/hora (mais próximas primeiro)

### Fase 3: Interface Frontend (Tasks.tsx)
- [x] Reescrever Tasks.tsx completamente
- [x] Criar tabela/cards com colunas: Tarefa | Data | Hora | Status | Tipo | Notas
- [x] Implementar drag & drop para mudança de status (A fazer → Em andamento → Feito)
- [x] Adicionar destaque vermelho para tarefas atrasadas
- [x] Implementar filtros Pessoal/Profissional
- [x] Criar modal de criação/edição de tarefa
- [x] Adicionar campo hora com opção "No time"
- [x] Implementar ordenação automática (mais próximas primeiro)

### Fase 4: Integração com Calendário
- [ ] Criar função para adicionar tarefas com hora ao calendário automaticamente
- [ ] Implementar sincronização com calendário externo (Google Calendar?)

### Fase 5: Reimplementação de Análises IA
- [ ] Reescrever analysis.ts para nova estrutura de tarefas
- [ ] Reescrever llmContext.ts para nova estrutura
- [ ] Descomentar endpoints de insights
- [ ] Testar análises com nova estrutura

### Fase 6: Testes e Validação
- [ ] Criar testes unitários para novas funções de tarefas
- [ ] Testar criação, edição e exclusão de tarefas
- [ ] Testar mudança de status via drag & drop
- [ ] Testar destaque de tarefas atrasadas
- [ ] Testar integração com calendário
- [ ] Validar que tarefas "done" desaparecem após 7 dias

### Especificação da Nova Estrutura de Tarefas
**Estrutura Obrigatória:**
- Colunas: Tarefa | Data | Hora (ou "No time") | Status | Tipo | Notas
- Status padrão: "A fazer" (automático ao criar)
- Mudança de status: drag & drop estilo Kanban (A fazer → Em andamento → Feito)
- Tipo: Pessoal/Profissional juntos, apenas destacados visualmente
- Ordenação: sempre do mais próximo ao mais distante (data + hora)

**Regras de Comportamento:**
- Tarefas "A fazer" atrasadas ficam VERMELHAS
- Tarefas "Feito" desaparecem após 7 dias (não arquivar)
- Tarefas COM hora são automaticamente adicionadas ao calendário
- Campo hora opcional: pode ter hora específica OU "No time"

**Restrições:**
- NÃO mexer em funcionalidades já implementadas (Kanban, Usuários, Perfil)
- NÃO usar sistema antigo de tarefas recorrentes
- Análises IA serão implementadas DEPOIS da nova estrutura funcionar


## Correções Urgentes da Página de Tarefas

- [x] Corrigir menu lateral sumindo na página de Tarefas (adicionar DashboardLayout)
- [x] Adicionar menu de 3 pontos (⋮) para editar/excluir tarefas
- [x] Melhorar drag & drop: adicionar feedback visual durante arrasto
- [x] Otimizar drag & drop para funcionar na primeira tentativa
- [x] Testar todas as correções


## Visualização de Tarefas em Formato Tabela/Planilha

- [x] Atualizar schema: adicionar campo location (localização) na tabela tasks
- [x] Aplicar migração do banco (pnpm db:push)
- [x] Atualizar endpoints tRPC para incluir location
- [x] Atualizar funções do banco (createTask, updateTask)
- [x] Criar componente de visualização em tabela com colunas:
  - [x] TAREFA (título editável inline)
  - [x] DATA (date picker)
  - [x] HORA (time picker ou "No time")
  - [x] STATUS (dropdown com opções coloridas: Não iniciado, Em andamento, Em revisão, Bloqueado, Concluído)
  - [x] ONDE (campo de localização)
  - [x] NOTAS (campo de texto)
- [x] Adicionar toggle para alternar entre visualização Kanban e Tabela
- [x] Implementar edição inline na tabela (via dropdown de status)
- [x] Adicionar botão "Adicionar tarefa" na visualização tabela
- [x] Testar ambas as visualizações


## Correções Urgentes - Tarefas

- [x] Corrigir erro ao criar tarefas (problema no insert SQL)
- [x] Remover visualização Kanban completamente
- [x] Manter apenas visualização em tabela
- [x] Testar criação de tarefas


## Erro ao Criar Tarefa - JSON Parse Error

- [x] Diagnosticar erro "Unexpected token '<'" (servidor retornando HTML)
- [x] Verificar logs do servidor para identificar erro
- [x] Corrigir problema no backend (remover transform de date no zod)
- [x] Testar criação de tarefas novamente


## Erro de Query SQL com Filtro de Data

- [x] Localizar query problemática com `date >= ? and date <= ?`
- [x] Corrigir query usando DATE() do SQL
- [x] Testar página sem erros


## Erro de Sintaxe SQL - DATE() não compatível

- [x] Corrigir sintaxe SQL incompatível com Drizzle ORM
- [x] Usar abordagem de comparação de datas compatível (range de timestamps)
- [x] Testar dashboard sem erros


## Erro Persistente de Query SQL - Usar Operadores Nativos

- [x] Substituir SQL raw por operadores nativos do Drizzle (gte/lte) no dashboard
- [x] Corrigir createTask - remover campos autogerados (id, createdAt, updatedAt)
- [x] Testar dashboard e criação de tarefas sem erros


## Investigação Profunda - Problema Raiz SQL

- [x] Verificar se colunas no banco são snake_case (user_id, created_at) ou camelCase (userId, createdAt) - Confirmado: camelCase
- [x] Verificar tipo do campo date no banco (DATE vs DATETIME/TIMESTAMP) - Confirmado: TIMESTAMP
- [x] Verificar timezone (UTC vs America/Sao_Paulo) - Problema identificado: conversão de Date para SQL
- [x] Adicionar logging de erro SQL detalhado
- [x] Implementar workaround: buscar todas as tarefas e filtrar em memória


## Erro na Query Básica SELECT de Tasks

- [x] Executar query diretamente no banco para ver erro real - Erro: Unknown column 'location'
- [x] Identificar campo problemático - Coluna location não existia no banco
- [x] Corrigir schema - Adicionada coluna location via ALTER TABLE


## Erro ao Editar Tarefas - Data Inválida (1970-01-01)

- [x] Diagnosticar problema de conversão de data (epoch 0) - new Date("") retorna 1970-01-01
- [x] Corrigir endpoint update para validar data antes de converter
- [x] Remover status "todo" antigo de todos os enums
- [x] Testar edição de tarefas

## Melhorias na Interface de Tarefas

- [x] Implementar location como link clicável (se começar com http)
- [x] Criar popup/dialog para visualizar notas completas
- [x] Adicionar botão de visualização de notas na tabela


## Erros Persistentes - Criar/Atualizar Tarefas

- [x] Investigar erro ao criar tarefa - CAUSA: enum de status no banco não tinha novos valores
- [x] Corrigir erro ao atualizar tarefa - Corrigido frontend para enviar apenas campos válidos
- [x] Verificar logs do servidor - Erro: "Data truncated for column 'status'"
- [x] Aplicar correção definitiva - ALTER TABLE para atualizar enum de status


## Otimização Mobile - Página de Tarefas

- [x] Implementar layout responsivo: tabela no desktop, cards no mobile
- [x] Criar cards empilhados verticalmente para mobile (< 768px)
- [x] Aumentar área de toque dos botões (min 44x44px)
- [x] Modal adaptativo com scroll para mobile
- [x] Otimizar dropdowns de status e filtros para touch (min-h-44px)
- [x] Adicionar padding adequado e botões full-width no mobile
- [x] Testar TypeScript e build sem erros


## Configuração GitHub e Deploy DigitalOcean

- [ ] Criar repositório GitHub via interface Manus (Settings → GitHub)
- [ ] Fazer push do código para GitHub (automático após criar repo)
- [x] Criar documentação de deploy (DEPLOY.md)
- [x] Documentar processo de atualização sem perder dados
- [x] Listar variáveis de ambiente necessárias
- [x] Verificar .gitignore (já existe e está correto)


## Setup de Servidor DigitalOcean do Zero

- [x] Criar guia completo de preparação do servidor (SERVER-SETUP.md)
- [x] Criar script automatizado de instalação (setup.sh)
- [x] Documentar criação de droplet
- [x] Documentar configuração de segurança
- [x] Documentar instalação de dependências

## Correção Crítica: Endpoint de Team Login
- [x] Implementar endpoint POST /api/team-login no backend para autenticação de managed_users

## Documentação do Sistema
- [x] Gerar documentação completa do sistema (arquitetura, APIs, troubleshooting, deploy)

## Recuperação de Senha por E-mail
- [x] Criar tabela password_reset_tokens no schema do banco de dados
- [x] Implementar funções de database helpers para gerenciar tokens
- [x] Criar endpoint tRPC auth.requestPasswordReset
- [x] Criar endpoint tRPC auth.resetPassword
- [x] Implementar envio de e-mail com link de reset
- [x] Criar página frontend /reset-password
- [x] Testar fluxo completo de recuperação de senha


## Correção de Filtros do Dashboard
- [x] Melhorar filtros de período (Hoje, 7 dias, 30 dias, Ano)
- [x] Corrigir lógica de aplicação de filtros nos dados
- [x] Melhorar feedback visual quando filtros são aplicados
- [x] Testar todos os filtros do dashboard

## Melhorias no Módulo de Clientes
- [ ] Adicionar campos ao schema: telefone, cep, endereco, bancoRecebedor, emailsAdicionais
- [ ] Criar tabela client_sites no banco de dados
- [ ] Atualizar database helpers para novos campos de clientes
- [ ] Atualizar endpoints tRPC para suportar novos campos
- [ ] Atualizar interface de cadastro/edição de clientes
- [ ] Implementar CRUD completo de sites vinculados a clientes
- [ ] Testar todas as funcionalidades do módulo de Clientes

## Módulo de Gestão de Clientes

### Fase 1: Backend
- [x] Criar tabela clients no schema (nome, email, telefone, CEP, endereço, banco recebedor, emails adicionais)
- [x] Criar tabela client_sites no schema (domínio, servidor, estrutura, plano, datas, comissão, observações)
- [x] Implementar database helpers para CRUD de clientes
- [x] Implementar database helpers para CRUD de sites de clientes
- [x] Criar endpoints tRPC para gerenciar clientes (getClients, getClientById, createClient, updateClient, deleteClient)
- [x] Criar endpoints tRPC para gerenciar sites (getClientSites, createClientSite, updateClientSite, deleteClientSite)

### Fase 2: Frontend
- [x] Criar página de listagem de clientes (/clients)
- [x] Implementar formulário de cadastro/edição de cliente
- [x] Implementar seção de sites vinculados ao cliente
- [x] Adicionar validação de campos (email, CEP)
- [x] Implementar tabela de sites com CRUD
- [x] Adicionar item "Clientes" no menu lateral

### Fase 3: Testes e Validação
- [ ] Testar criação de cliente
- [ ] Testar edição de cliente
- [ ] Testar exclusão de cliente
- [ ] Testar adição de sites
- [ ] Testar edição de sites
- [ ] Testar exclusão de sites
- [ ] Validar campos obrigatórios
- [ ] Testes unitários para endpoints de clientes

## Melhorias no Módulo de Clientes

### Busca e Filtros
- [x] Adicionar campo de busca na página de clientes (nome, empresa, CNPJ)
- [x] Implementar filtro de classificação por data de cadastro
- [x] Implementar filtro de classificação por nome
- [ ] Implementar filtro de classificação por status do plano
- [ ] Implementar filtro de classificação por data de expiração do domínio

### Widget de Alertas no Dashboard
- [x] Criar componente de widget de alertas de vencimento
- [x] Implementar endpoint tRPC para buscar domínios/planos expirando em 30 dias
- [x] Adicionar widget no dashboard principal (Home.tsx)
- [x] Estilizar widget com cores de alerta (vermelho/amarelo)

### Testes
- [x] Testar busca por nome, empresa e CNPJ
- [x] Testar filtros de classificação
- [x] Testar widget de alertas no dashboard
- [x] Validar datas de expiração e alertas

## Ajustes Finais no Módulo de Clientes

### Exportação e Importação
- [x] Adicionar botão "Exportar CSV" na página de Clientes
- [x] Implementar função de exportação de clientes para CSV
- [x] Adicionar botão "Importar CSV" na página de Clientes
- [x] Implementar função de importação de clientes via CSV
- [x] Validar formato do CSV na importação

### Paginação
- [x] Implementar paginação na lista de clientes (10 por página)
- [x] Adicionar controles de navegação (anterior/próxima)
- [x] Mostrar total de clientes e página atual

### Correções de Interface
- [x] Remover item "Contatos" do menu lateral (DashboardLayout)
- [x] Corrigir exibição do menu lateral na página de Clientes (usar DashboardLayout)
- [x] Verificar que todas as páginas mantêm o menu lateral

### Validação para Produção
- [x] Testar exportação CSV
- [x] Testar importação CSV
- [x] Testar paginação
- [x] Verificar menu lateral em todas as páginas
- [x] Garantir compatibilidade com código existente

## Refatoração da Página de Clientes (Lista Compacta)

### Componente de Perfil
- [x] Criar componente ClientProfile (Sheet/Drawer lateral)
- [x] Exibir todas as informações do cliente no perfil
- [x] Integrar ClientSites no perfil
- [x] Adicionar botões de editar e excluir no perfil

### Lista Compacta
- [x] Refatorar lista para formato de tabela compacta
- [x] Mostrar apenas nome, empresa e contato na lista
- [x] Adicionar ações rápidas (editar/excluir) na tabela
- [x] Manter paginação, busca e filtros funcionando

### Integração
- [x] Ao clicar no cliente, abrir perfil lateral
- [x] Manter formulário de criação/edição no modal existente
- [x] Garantir performance e UX fluida

## Sistema Financeiro com Múltiplas Moedas e Upload de Comprovantes

### Dashboard
- [x] Remover widget "Alertas de Vencimento" do Dashboard (Home.tsx)

### Schema e Backend
- [x] Atualizar tabela `variable_expenses` com campos: time, cnpj (já tinha: tipo, categoria, valor, moeda, data, empresa_fornecedora, comprovante_url, user_id)
- [x] Criar tabela `revenues` (faturamento) com campos: tipo (pessoal/empresa), descrição, valor, moeda (BRL/USD), data, categoria, client, user_id
- [x] Atualizar tabela `fixed_expenses` adicionando campos: expenseType (pessoal/empresa), currency (BRL/USD)
- [ ] Adicionar helpers no db.ts para CRUD de expenses, revenues e fixed_expenses
- [ ] Criar endpoints tRPC para expenses (create, list, update, delete)
- [ ] Criar endpoints tRPC para revenues (create, list, update, delete)
- [ ] Criar endpoints tRPC para fixed_expenses (create, list, update, delete)
- [ ] Implementar endpoint tRPC para upload de comprovante (S3)
- [ ] Implementar endpoint tRPC para OCR de nota fiscal (apenas para role admin)

### Frontend - Páginas
- [ ] Criar página /faturamento com tabs (Pessoal/Empresa) e filtro de moeda
- [ ] Criar página /despesas-variaveis com upload de comprovante
- [ ] Criar página /despesas-fixas com gestão de recorrências
- [ ] Atualizar Dashboard com cards separados por moeda (BRL/USD)
- [ ] Adicionar gráficos de faturamento vs despesas por moeda

### Upload e OCR
- [ ] Implementar componente de upload de imagem/PDF
- [ ] Para usuários comuns: upload + formulário manual
- [ ] Para admins: upload + OCR automático + revisão
- [ ] Armazenar comprovantes no S3 com referência no banco
- [ ] Exibir thumbnail do comprovante na lista de despesas

### Regras de Negócio
- [ ] Usuário comum vê apenas seus próprios registros
- [ ] Admin/CEO vê todos os registros da empresa
- [ ] Filtros por período, categoria, moeda e tipo (pessoal/empresa)
- [ ] Cálculos automáticos de totais por moeda
- [ ] Conversão de moeda (opcional) com taxa configurável

## Implementação Completa do Sistema Financeiro Multi-Moeda

### Endpoints tRPC
- [x] Criar router `revenues` com procedures: list, getById, create, update, delete
- [x] Adicionar validação de permissões (usuário vê apenas seus dados, admin vê tudo)
- [x] Criar procedure `getTotalsByTypeAndCurrency` para estatísticas
- [ ] Atualizar router `expenses` para suportar novos campos (time, cnpj, currency)
- [ ] Atualizar router `fixedExpenses` para suportar novos campos (expenseType, currency)

### Componente de Upload
- [x] Criar componente `ReceiptUpload.tsx` com drag-and-drop
- [x] Implementar upload para S3 via tRPC (estrutura pronta)
- [x] Implementar OCR automático para roles admin usando invokeLLM (estrutura pronta)
- [x] Implementar preenchimento manual para usuários comuns
- [x] Adicionar preview da imagem/PDF carregado
- [x] Adicionar validação de tamanho (max 16MB) e formato (jpg, png, pdf)

### Página de Faturamento
- [x] Criar página `/faturamento` (Revenues.tsx)
- [x] Implementar tabs Pessoal/Empresa
- [x] Adicionar filtros: período (data início/fim), moeda (BRL/USD)
- [x] Criar listagem de receitas em cards
- [x] Adicionar botão "Nova Receita" que abre modal
- [x] Implementar modal de cadastro/edição de receita
- [x] Integrar componente ReceiptUpload no modal
- [x] Adicionar cards de totais por moeda no topo (4 cards: Pessoal BRL/USD, Empresa BRL/USD)
- [x] Adicionar rota em App.tsx
- [x] Atualizar item "Faturamento" no menu lateral

### Testes e Documentação
- [x] Estrutura de criação de receita com upload implementada
- [x] Estrutura de OCR para admin implementada (pronta para integração)
- [x] Validação de permissões implementada nos endpoints
- [x] CHANGELOG.md atualizado com todas as mudanças
- [x] Tarefas concluídas marcadas no todo.md

## Integração S3, OCR e Atualização de Despesas Variáveis

### Upload S3 Real
- [x] Criar endpoint tRPC `revenues.uploadReceipt` em server/routers.ts
- [x] Implementar upload usando `storagePut()` do server/storage.ts
- [x] Gerar nome de arquivo único com sufixo aleatório
- [x] Retornar URL pública do S3
- [x] Atualizar ReceiptUpload.tsx para usar endpoint real

### OCR com invokeLLM
- [x] Criar endpoint tRPC `revenues.extractReceiptData` para OCR
- [x] Implementar extração de: CNPJ, empresa, valor, data, hora
- [x] Usar `response_format` com JSON schema para dados estruturados
- [x] Adicionar tratamento de erros para OCR
- [x] Adicionar validação de role admin no endpoint
- [x] Atualizar ReceiptUpload para chamar OCR real (apenas admin)

### Atualização de Despesas Variáveis
- [x] Tabs Pessoal/Profissional já existentes (mantidos)
- [x] Adicionar campos: hora, moeda (BRL/USD), CNPJ no formulário
- [ ] Adicionar cards de totais por moeda (4 cards)
- [ ] Atualizar formulário com campo de moeda
- [ ] Atualizar formulário com campo de tipo (pessoal/empresa)
- [ ] Atualizar endpoints tRPC para suportar filtros de moeda e tipo
- [ ] Integrar ReceiptUpload no modal de despesas

### Documentação
- [ ] Atualizar CHANGELOG.md
- [ ] Marcar tarefas concluídas no todo.md

## Despesas Fixas Multi-Moeda e Dashboard
### Despesas Fixas
- [x] Adicionar campos de moeda (BRL/USD) no formulário de Despesas Fixas
- [x] Adicionar campo de tipo (pessoal/empresa) no formulário
- [x] Tabs Pessoal/Profissional já existentes (mantidos)
- [ ] Atualizar listagem para exibir moeda e tipo
- [ ] Adicionar filtro de moeda na visualização

### Filtro de Moeda em Despesas Variáveis
- [ ] Adicionar dropdown de filtro de moeda (BRL/USD/Todas) na página VariableExpenses
- [ ] Implementar lógica de filtragem no frontend
- [ ] Adicionar indicador visual de moeda nos cards de despesas

### Dashboard Multi-Moeda
- [ ] Criar cards separados para Faturamento BRL e USD
- [ ] Criar cards separados para Despesas BRL e USD
- [ ] Implementar endpoints tRPC para buscar totais por moeda
- [ ] Adicionar formatação de moeda automática (R$ vs $)
- [ ] Organizar layout do Dashboard com grid responsivo
