-- ==================== LIMPAR DADOS EXISTENTES ====================
DELETE FROM rolePermissions;
DELETE FROM userRoles;
DELETE FROM permissions;
DELETE FROM roles;

-- ==================== CRIAR ROLES ====================
INSERT INTO roles (id, name, description) VALUES
(1, 'ceo', 'CEO - Acesso total ao sistema'),
(2, 'master', 'Master - Acesso administrativo exceto faturamento do CEO'),
(3, 'colaborador', 'Colaborador - Acesso limitado aos recursos compartilhados');

-- ==================== CRIAR PERMISSÕES ====================

-- Faturamento
INSERT INTO permissions (name, description, category) VALUES
('faturamento.view_all', 'Visualizar todo o faturamento', 'faturamento'),
('faturamento.view_own', 'Visualizar apenas próprio faturamento', 'faturamento'),
('faturamento.create', 'Criar entradas de faturamento', 'faturamento'),
('faturamento.edit', 'Editar faturamento', 'faturamento'),
('faturamento.delete', 'Deletar faturamento', 'faturamento');

-- Gastos
INSERT INTO permissions (name, description, category) VALUES
('gastos.view_empresa', 'Visualizar gastos da empresa', 'gastos'),
('gastos.view_pessoal', 'Visualizar gastos pessoais próprios', 'gastos'),
('gastos.view_compartilhado', 'Visualizar gastos compartilhados', 'gastos'),
('gastos.create_empresa', 'Criar gastos da empresa', 'gastos'),
('gastos.create_pessoal', 'Criar gastos pessoais', 'gastos'),
('gastos.create_compartilhado', 'Criar gastos compartilhados', 'gastos'),
('gastos.edit', 'Editar gastos', 'gastos'),
('gastos.delete', 'Deletar gastos', 'gastos');

-- Kanbans
INSERT INTO permissions (name, description, category) VALUES
('kanban.view_all', 'Visualizar todos os kanbans', 'kanban'),
('kanban.view_shared', 'Visualizar kanbans compartilhados', 'kanban'),
('kanban.create', 'Criar kanbans', 'kanban'),
('kanban.edit', 'Editar kanbans', 'kanban'),
('kanban.delete', 'Deletar kanbans', 'kanban'),
('kanban.share', 'Compartilhar kanbans com outros usuários', 'kanban');

-- Usuários
INSERT INTO permissions (name, description, category) VALUES
('users.view_all', 'Visualizar todos os usuários', 'users'),
('users.create', 'Criar novos usuários', 'users'),
('users.edit', 'Editar usuários', 'users'),
('users.delete', 'Deletar usuários', 'users'),
('users.manage_permissions', 'Gerenciar permissões de usuários', 'users');

-- Relatórios
INSERT INTO permissions (name, description, category) VALUES
('reports.view_all', 'Visualizar todos os relatórios', 'reports'),
('reports.view_own', 'Visualizar apenas próprios relatórios', 'reports'),
('reports.generate', 'Gerar relatórios', 'reports');

-- ==================== ATRIBUIR PERMISSÕES AOS ROLES ====================

-- CEO - Todas as permissões
INSERT INTO rolePermissions (roleId, permissionId)
SELECT 1, id FROM permissions;

-- MASTER - Todas exceto faturamento.view_all e gastos.view_empresa
INSERT INTO rolePermissions (roleId, permissionId)
SELECT 2, id FROM permissions 
WHERE name NOT IN ('faturamento.view_all', 'gastos.view_empresa');

-- COLABORADOR - Apenas permissões básicas
INSERT INTO rolePermissions (roleId, permissionId)
SELECT 3, id FROM permissions 
WHERE name IN (
  'gastos.view_pessoal',
  'gastos.create_pessoal',
  'gastos.create_empresa',
  'kanban.view_shared',
  'reports.view_own'
);

-- ==================== ATRIBUIR ROLES AOS USUÁRIOS ====================
-- Nota: managed_users já tem campo role, então não precisa de userRoles
-- Mas vamos manter a tabela userRoles para compatibilidade futura

SELECT 'Permissões criadas com sucesso!' as message;
