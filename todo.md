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
