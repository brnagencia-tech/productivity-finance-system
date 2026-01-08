import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, ManagedUser } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";

// Tipo unificado para usuário autenticado (OAuth ou Team)
export type AuthenticatedUser = {
  id: number;
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

  // Primeiro, tentar autenticação via Team Login (header X-Team-User-Id)
  const teamUserId = opts.req.headers["x-team-user-id"];
  if (teamUserId && typeof teamUserId === "string") {
    try {
      const teamUser = await db.getManagedUserById(parseInt(teamUserId, 10));
      if (teamUser && teamUser.isActive) {
        // Converter ManagedUser para formato compatível com User
        user = {
          id: teamUser.id,
          name: `${teamUser.firstName} ${teamUser.lastName}`,
          role: "user" as const,
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
      // Falha na autenticação Team Login
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
