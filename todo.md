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
