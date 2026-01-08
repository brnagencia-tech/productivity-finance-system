# Módulo Kanban - Documentação

## Estrutura do Banco de Dados

### Tabelas

#### `kanban_boards`
- `id` - ID único do board
- `userId` - ID do usuário proprietário
- `title` - Título do board
- `description` - Descrição opcional
- `visibility` - Visibilidade: "private" | "shared" | "public"
- `scope` - Escopo: "personal" | "professional"
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

#### `kanban_board_members`
- `id` - ID único
- `boardId` - ID do board
- `userId` - ID do usuário membro
- `role` - Papel: "owner" | "editor" | "viewer"
- `createdAt` - Data de adição

#### `kanban_columns`
- `id` - ID único da coluna
- `boardId` - ID do board
- `title` - Título da coluna
- `position` - Posição da coluna
- `color` - Cor da coluna (hex)
- `createdAt` - Data de criação

#### `kanban_cards`
- `id` - ID único do card
- `columnId` - ID da coluna
- `title` - Título do card
- `description` - Descrição do card
- `position` - Posição do card na coluna
- `priority` - Prioridade: "low" | "medium" | "high"
- `dueDate` - Data de vencimento
- `assignedTo` - ID do usuário responsável
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

#### `kanban_checklists`
- `id` - ID único
- `cardId` - ID do card
- `title` - Título do item
- `completed` - Status de conclusão
- `position` - Posição no checklist
- `createdAt` - Data de criação

## Procedures tRPC

### Queries
- `listBoards` - Lista todos os boards do usuário (próprios + compartilhados)
- `getBoard` - Obtém detalhes de um board específico
- `listMembers` - Lista membros de um board

### Mutations
- `createBoard` - Cria novo board (aceita memberIds para compartilhamento)
- `updateBoard` - Atualiza board existente
- `deleteBoard` - Deleta board
- `addMember` - Adiciona membro a um board
- `removeMember` - Remove membro de um board
- `createColumn` - Cria coluna em um board
- `updateColumn` - Atualiza coluna
- `deleteColumn` - Deleta coluna
- `createCard` - Cria card em uma coluna
- `updateCard` - Atualiza card
- `deleteCard` - Deleta card
- `moveCard` - Move card entre colunas
- `createChecklist` - Cria item de checklist
- `updateChecklist` - Atualiza item de checklist
- `deleteChecklist` - Deleta item de checklist

## Componentes Frontend

### Páginas
- `client/src/pages/Kanban.tsx` - Página principal do Kanban com listagem de boards

### Componentes
- `client/src/components/BoardMembersDialog.tsx` - Dialog para gerenciar membros de um board
- `client/src/components/UserSelector.tsx` - Componente de seleção de usuários com autocomplete @

## Funcionalidades Implementadas

### ✅ Concluído
- Sistema de boards com visibilidade (privado/compartilhado/público)
- Compartilhamento seletivo de boards com usuários específicos
- Filtragem automática por permissões (colaboradores veem apenas boards compartilhados)
- Gerenciamento de membros (adicionar/remover/listar)
- Componente UserSelector com autocomplete @ para buscar usuários
- Colunas personalizáveis com cores
- Cards com prioridade, data de vencimento e responsável
- Checklists dentro dos cards
- Movimentação de cards entre colunas (drag & drop)

### 🚧 Pendente
- [ ] Botão "Gerenciar Membros" nos cards de board da interface
- [ ] Notificações quando cards são movidos em boards compartilhados
- [ ] Filtros e busca de cards
- [ ] Anexos em cards
- [ ] Comentários em cards
- [ ] Histórico de atividades do board

## Boards de Exemplo Criados

### Board ID: 1 - "Programação"
- **Owner:** Bruno (ID: 60001)
- **Membros:** Ruan (ID: 60003) como Editor
- **Colunas:** A Fazer, Em Progresso, Concluído
- **Visibilidade:** Compartilhado
- **Escopo:** Profissional

## Permissões

### CEO (Bruno)
- Visualiza todos os boards do sistema
- Pode criar, editar e deletar qualquer board
- Pode gerenciar membros de qualquer board

### Master (Karen)
- Visualiza todos os boards do sistema
- Pode criar, editar e deletar qualquer board
- Pode gerenciar membros de qualquer board

### Colaborador (Ruan, etc.)
- Visualiza apenas boards onde é membro (owner, editor ou viewer)
- Pode criar boards próprios
- Pode editar boards onde tem permissão de editor ou owner
- Não pode ver boards de outros usuários

## Notas de Desenvolvimento

- A filtragem de boards por permissões já está implementada no backend (`getKanbanBoardsByUser` + `getSharedKanbanBoardsForUser`)
- O sistema usa `kanban_board_members` para controlar acesso aos boards
- Ao criar um board compartilhado, os membros são adicionados automaticamente via `addKanbanBoardMembers`
- O componente `BoardMembersDialog` permite gerenciar membros de boards existentes
- Todos os testes (129) estão passando
