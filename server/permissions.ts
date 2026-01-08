import { TRPCError } from "@trpc/server";
import type { AuthenticatedUser } from "./_core/context";

/**
 * Tipos de roles no sistema
 */
export type UserRole = "ceo" | "master" | "colaborador";

/**
 * Categorias de permissões
 */
export type PermissionCategory = 
  | "faturamento"
  | "gastos"
  | "kanban"
  | "users"
  | "reports";

/**
 * Mapa de permissões por role
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ceo: [
    // Faturamento - CEO vê tudo
    "faturamento.view_all",
    "faturamento.view_own",
    "faturamento.create",
    "faturamento.edit",
    "faturamento.delete",
    
    // Gastos - CEO vê tudo
    "gastos.view_empresa",
    "gastos.view_pessoal",
    "gastos.view_compartilhado",
    "gastos.create_empresa",
    "gastos.create_pessoal",
    "gastos.create_compartilhado",
    "gastos.edit",
    "gastos.delete",
    
    // Kanbans - CEO vê tudo
    "kanban.view_all",
    "kanban.view_shared",
    "kanban.create",
    "kanban.edit",
    "kanban.delete",
    "kanban.share",
    
    // Usuários - CEO gerencia tudo
    "users.view_all",
    "users.create",
    "users.edit",
    "users.delete",
    "users.manage_permissions",
    
    // Relatórios - CEO vê tudo
    "reports.view_all",
    "reports.view_own",
    "reports.generate",
  ],
  
  master: [
    // Faturamento - Master NÃO vê faturamento do CEO
    "faturamento.view_own",
    "faturamento.create",
    "faturamento.edit",
    
    // Gastos - Master NÃO vê gastos da empresa
    "gastos.view_pessoal",
    "gastos.view_compartilhado",
    "gastos.create_pessoal",
    "gastos.create_compartilhado",
    "gastos.edit",
    "gastos.delete",
    
    // Kanbans - Master pode gerenciar
    "kanban.view_all",
    "kanban.view_shared",
    "kanban.create",
    "kanban.edit",
    "kanban.delete",
    "kanban.share",
    
    // Usuários - Master pode gerenciar
    "users.view_all",
    "users.create",
    "users.edit",
    "users.delete",
    "users.manage_permissions",
    
    // Relatórios - Master vê tudo
    "reports.view_all",
    "reports.view_own",
    "reports.generate",
  ],
  
  colaborador: [
    // Faturamento - Colaborador não vê
    
    // Gastos - Colaborador vê apenas próprios e pode criar despesa empresa
    "gastos.view_pessoal",
    "gastos.create_pessoal",
    "gastos.create_empresa", // Pode adicionar despesa da empresa (com notificação)
    
    // Kanbans - Colaborador vê apenas compartilhados
    "kanban.view_shared",
    
    // Relatórios - Colaborador vê apenas próprios
    "reports.view_own",
  ],
};

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(user: AuthenticatedUser | null, permission: string): boolean {
  if (!user) return false;
  
  // Usuários OAuth não têm role de managed_user
  if (!user.isTeamUser) {
    // Por padrão, usuários OAuth têm acesso total (são owners)
    return true;
  }
  
  const role = user.managedUserRole || "colaborador";
  const permissions = ROLE_PERMISSIONS[role as UserRole] || [];
  
  return permissions.includes(permission);
}

/**
 * Verifica se o usuário tem permissão e lança erro se não tiver
 */
export function requirePermission(user: AuthenticatedUser | null, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Você não tem permissão para: ${permission}`,
    });
  }
}

/**
 * Verifica se o usuário é CEO
 */
export function isCEO(user: AuthenticatedUser | null): boolean {
  if (!user || !user.isTeamUser) return false;
  return user.managedUserRole === "ceo";
}

/**
 * Verifica se o usuário é Master ou CEO
 */
export function isMasterOrCEO(user: AuthenticatedUser | null): boolean {
  if (!user || !user.isTeamUser) return false;
  const role = user.managedUserRole;
  return role === "ceo" || role === "master";
}

/**
 * Verifica se o usuário pode ver faturamento de outro usuário
 */
export function canViewRevenue(viewer: AuthenticatedUser | null, targetUserId: number): boolean {
  if (!viewer) return false;
  
  // CEO vê tudo
  if (isCEO(viewer)) return true;
  
  // Master e Colaborador veem apenas próprio
  return viewer.id === targetUserId;
}

/**
 * Verifica se o usuário pode ver gastos da empresa
 */
export function canViewCompanyExpenses(user: AuthenticatedUser | null): boolean {
  return hasPermission(user, "gastos.view_empresa");
}

/**
 * Verifica se o usuário pode ver gastos compartilhados
 */
export function canViewSharedExpenses(user: AuthenticatedUser | null): boolean {
  return hasPermission(user, "gastos.view_compartilhado");
}
