import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, ManagedUser } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";
import jwt from "jsonwebtoken";

// Tipo unificado para usuário autenticado (OAuth ou Team)
export type AuthenticatedUser = {
  id: number;
  managedUserRole?: "ceo" | "master" | "colaborador"; // Role do managed_user
  name: string | null;
  role: "user" | "admin";
  openId: string;
  username: string | null;
  email: string | null;
  loginMethod: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
  // Campos adicionais para Team Users
  isTeamUser?: boolean;
  firstName?: string;
  lastName?: string;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AuthenticatedUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: AuthenticatedUser | null = null;

  // Primeiro, tentar autenticação via Team Login (header Authorization com JWT)
  const authHeader = opts.req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // Remover "Bearer "
    try {
      // Verificar e decodificar JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
        userId: number;
        email: string;
        username: string;
      };
      
      // Buscar usuário no banco
      const teamUser = await db.getManagedUserById(decoded.userId);
      if (teamUser && teamUser.isActive) {
        // Converter ManagedUser para formato compatível com User
        user = {
          id: teamUser.id,
          name: `${teamUser.firstName} ${teamUser.lastName}`,
          role: "user" as const, // Role padrão para compatibilidade
          managedUserRole: teamUser.role || "colaborador", // Role real do managed_user
          openId: `team-${teamUser.id}`,
          username: teamUser.username,
          email: teamUser.email,
          loginMethod: "team",
          avatarUrl: null,
          createdAt: teamUser.createdAt,
          updatedAt: teamUser.updatedAt,
          lastSignedIn: teamUser.lastLogin || teamUser.createdAt,
          isTeamUser: true,
          firstName: teamUser.firstName,
          lastName: teamUser.lastName,
        };
      }
    } catch (error) {
      // Token inválido ou expirado
      user = null;
    }
  }

  // Se não autenticou via Team Login, tentar OAuth
  if (!user) {
    try {
      const oauthUser = await sdk.authenticateRequest(opts.req);
      if (oauthUser) {
        user = {
          ...oauthUser,
          isTeamUser: false,
        };
      }
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
