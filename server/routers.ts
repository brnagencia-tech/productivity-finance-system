import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as dbSharing from "./db-sharing";
import * as dbNotifications from "./db-notifications";
import * as dbTickets from "./db-tickets";
// TEMPORARIAMENTE COMENTADO - Será reimplementado após nova estrutura de tarefas
// import { generateExpenseAnalysis, generateProductivityAnalysis, generateWeeklyInsights } from "./analysis";
import { emitToBoardRoom, KanbanEvents } from "./_core/socket";
// import { collectLLMContextData, formatContextForLLM } from "./llmContext";
import { invokeLLM } from "./_core/llm";
import jwt from "jsonwebtoken";

// ==================== CLIENTS ROUTER ====================
export const clientsRouter = router({
  // Listar clientes do usuário
  getClients: protectedProcedure.query(async ({ ctx }) => {
    return await db.getClientsByUser(ctx.user.id);
  }),

  // Buscar cliente por ID
  getClientById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const client = await db.getClientById(input.id);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      return client;
    }),

  // Criar cliente
  createClient: protectedProcedure
    .input(z.object({
      name: z.string(),
      company: z.string().optional(),
      cpfCnpj: z.string().optional(),
      telefone: z.string().optional(),
      cep: z.string().optional(),
      endereco: z.string().optional(),
      email: z.string().optional(),
      emailsAdicionais: z.string().optional(),
      bancoRecebedor: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const clientId = await db.createClient({
        ...input,
        userId: ctx.user.id,
      });
      return { id: clientId };
    }),

  // Atualizar cliente
  updateClient: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      company: z.string().optional(),
      cpfCnpj: z.string().optional(),
      telefone: z.string().optional(),
      cep: z.string().optional(),
      endereco: z.string().optional(),
      email: z.string().optional(),
      emailsAdicionais: z.string().optional(),
      bancoRecebedor: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const client = await db.getClientById(id);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      await db.updateClient(id, data);
      return { success: true };
    }),

  // Deletar cliente
  deleteClient: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const client = await db.getClientById(input.id);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      await db.deleteClient(input.id);
      return { success: true };
    }),

  // Listar todos os sites do usuário (para dropdowns)
  listAllSites: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getAllClientSites(ctx.user.id);
    }),

  // Listar sites de um cliente
  getClientSites: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      const client = await db.getClientById(input.clientId);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      return await db.getSitesByClient(input.clientId);
    }),

  // Criar site para cliente
  createClientSite: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      siteDominio: z.string(),
      servidor: z.string().optional(),
      estrutura: z.string().optional(),
      plano: z.string().optional(),
      inicioPlano: z.date().optional(),
      expiracaoDominio: z.date().optional(),
      gateway: z.string().optional(),
      versao: z.string().optional(),
      limiteNumero: z.number().optional(),
      comissaoPercentual: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const client = await db.getClientById(input.clientId);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      const siteId = await db.createClientSite(input);
      return { id: siteId };
    }),

  // Atualizar site
  updateClientSite: protectedProcedure
    .input(z.object({
      id: z.number(),
      siteDominio: z.string().optional(),
      servidor: z.string().optional(),
      estrutura: z.string().optional(),
      plano: z.string().optional(),
      inicioPlano: z.date().optional(),
      expiracaoDominio: z.date().optional(),
      gateway: z.string().optional(),
      versao: z.string().optional(),
      limiteNumero: z.number().optional(),
      comissaoPercentual: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const site = await db.getSiteById(id);
      if (!site) {
        throw new Error("Site not found");
      }
      const client = await db.getClientById(site.clientId);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      await db.updateClientSite(id, data);
      return { success: true };
    }),

  // Deletar site
  deleteClientSite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const site = await db.getSiteById(input.id);
      if (!site) {
        throw new Error("Site not found");
      }
      const client = await db.getClientById(site.clientId);
      if (!client || client.userId !== ctx.user.id) {
        throw new Error("Client not found");
      }
      await db.deleteClientSite(input.id);
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  
  // Alertas de vencimento
  alerts: router({
    getExpiringItems: protectedProcedure
      .input(z.object({ daysAhead: z.number().optional().default(30) }))
      .query(async ({ input, ctx }) => {
        return await db.getExpiringItemsByUser(ctx.user.id, input.daysAhead);
      }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
     }),
    teamLogin: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string().min(1)
    })).mutation(async ({ input }) => {
      // Sanitizar e validar email
      const email = String(input.email || '')
        .trim()
        .toLowerCase();
      
      console.log('[teamLogin] Email recebido:', JSON.stringify(input.email));
      console.log('[teamLogin] Email sanitizado:', JSON.stringify(email));
      
      // Validação adicional de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('[teamLogin] Email inválido:', email);
        throw new Error('Invalid credentials');
      }
      
      const user = await db.getManagedUserByEmail(email);
      if (!user) throw new Error('Invalid credentials');
      if (!user.isActive) throw new Error('User account is inactive');
      
      // Verificar senha com bcrypt
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) throw new Error('Invalid credentials');
      await db.updateManagedUser(user.id, user.createdByUserId, { lastLogin: new Date() });
      
      // Gerar JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' } // Token válido por 7 dias
      );
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isActive: user.isActive,
        role: user.role, // Incluir role do usuário
        token, // Retornar token JWT
      };
     }),
    changePassword: protectedProcedure.input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8)
    })).mutation(async ({ input, ctx }) => {
      // Verificar se contexto tem usuário autenticado
      if (!ctx.user || !ctx.user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
      }
      
      // Buscar usuário gerenciado pelo ID do contexto
      const user = await db.getManagedUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      
      // Verificar senha atual com bcrypt
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
      }
      
      // Gerar hash da nova senha
      const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
      
      // Atualizar senha no banco
      await db.updateManagedUser(user.id, user.createdByUserId, {
        passwordHash: newPasswordHash
      });
      
      return { success: true };
    }),
    requestPasswordReset: publicProcedure.input(z.object({
      email: z.string().email()
    })).mutation(async ({ input }) => {
      // Sanitizar email
      const email = String(input.email || '').trim().toLowerCase();
      
      // Buscar usuário por email
      const user = await db.getManagedUserByEmail(email);
      if (!user) {
        // Por segurança, não revelar se o email existe ou não
        return { success: true, message: 'If the email exists, a password reset link will be sent.' };
      }
      
      // Gerar token aleatório
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      
      // Token expira em 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Deletar tokens antigos do usuário
      await db.deletePasswordResetTokensByUserId(user.id);
      
      // Criar novo token
      await db.createPasswordResetToken(user.id, token, expiresAt);
      
      // Enviar email com link de reset
      const resetLink = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      
      try {
        // Enviar notificação por email usando o sistema de notificações do Manus
        await db.createNotification({
          userId: user.id,
          type: 'password_reset',
          title: 'Redefinição de Senha',
          message: `Clique no link para redefinir sua senha: ${resetLink}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.`,
          isRead: false
        });
        
        console.log(`[Password Reset] Reset link sent to ${email}: ${resetLink}`);
      } catch (error) {
        console.error('[Password Reset] Failed to send notification:', error);
        // Não falhar a requisição se o envio de notificação falhar
      }
      
      return { success: true, message: 'If the email exists, a password reset link will be sent.' };
    }),
    resetPassword: publicProcedure.input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8)
    })).mutation(async ({ input }) => {
      // Buscar token
      const resetToken = await db.getPasswordResetToken(input.token);
      
      if (!resetToken) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired reset token' });
      }
      
      // Verificar se token já foi usado
      if (resetToken.used) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This reset token has already been used' });
      }
      
      // Verificar se token expirou
      if (new Date() > new Date(resetToken.expiresAt)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This reset token has expired' });
      }
      
      // Buscar usuário
      const user = await db.getManagedUserById(resetToken.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      
      // Gerar hash da nova senha
      const bcrypt = await import('bcryptjs');
      const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
      
      // Atualizar senha
      await db.updateManagedUser(user.id, user.createdByUserId, {
        passwordHash: newPasswordHash
      });
      
      // Marcar token como usado
      await db.markPasswordResetTokenAsUsed(resetToken.id);
      
      console.log(`[Password Reset] Password successfully reset for user ${user.email}`);
      
      return { success: true, message: 'Password has been reset successfully' };
    }),
  }),

  users: router({
    list: protectedProcedure.query(async () => {
      return db.getAllUsers();
     }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getUserById(input.id);
     }),
  }),

  categories: router({
    list: protectedProcedure.input(z.object({ type: z.enum(["expense", "task", "habit"]).optional() }).optional()).query(async ({ ctx, input }) => {
      return db.getCategoriesByUser(ctx.user.id, input?.type);
     }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      icon: z.string().min(1),
      color: z.string().min(1),
      type: z.enum(["expense", "task", "habit"]),
      scope: z.enum(["personal", "professional", "both"]).default("personal")
    })).mutation(async ({ ctx, input }) => {
      return db.createCategory({ ...input, userId: ctx.user.id });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      icon: z.string().min(1).optional(),
      color: z.string().min(1).optional(),
      scope: z.enum(["personal", "professional", "both"]).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateCategory(id, ctx.user.id, data);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteCategory(input.id, ctx.user.id);
      return { success: true };
     }),
  }),

  // ==================== TASKS (Nova Estrutura Simplificada) ====================
  // Tarefas agora são únicas (não recorrentes) com data, hora opcional, status e notas
  tasks: router({
    list: protectedProcedure.input(z.object({ scope: z.enum(["personal", "professional"]).optional() }).optional()).query(async ({ ctx, input }) => {
      return db.getTasksByUser(ctx.user.id, input?.scope);
     }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      date: z.string(), // Manter como string, converter no backend
      time: z.string().optional(), // "HH:MM" ou null para "No time"
      hasTime: z.boolean().default(false),
      status: z.enum(["not_started", "in_progress", "in_review", "blocked", "done"]).optional(),
      scope: z.enum(["personal", "professional"]).default("personal"),
      location: z.string().optional(),
      notes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.createTask({ 
        ...input,
        date: new Date(input.date), // Converter para Date aqui
        userId: ctx.user.id,
        status: input.status || "not_started" // Status padrão ao criar
      });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      date: z.string().optional(), // Manter como string
      time: z.string().optional(),
      hasTime: z.boolean().optional(),
      status: z.enum(["not_started", "in_progress", "in_review", "blocked", "done"]).optional(),
      scope: z.enum(["personal", "professional"]).optional(),
      location: z.string().optional(),
      notes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, date, ...rest } = input;
      const data = {
        ...rest,
        // Converter data apenas se fornecida E não vazia
        ...(date && date.trim() !== "" ? { date: new Date(date) } : {})
      };
      await db.updateTask(id, ctx.user.id, data);
      return { success: true };
     }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["not_started", "in_progress", "in_review", "blocked", "done"])
    })).mutation(async ({ ctx, input }) => {
      await db.updateTask(input.id, ctx.user.id, { status: input.status });
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteTask(input.id, ctx.user.id);
      return { success: true };
     }),
    share: protectedProcedure.input(z.object({
      taskId: z.number(),
      username: z.string().min(1), // @username do usuário
      permission: z.enum(["viewer", "editor"]).default("viewer")
    })).mutation(async ({ ctx, input }) => {
      // Buscar usuário pelo username
      const targetUser = await dbSharing.getUserByUsername(input.username.replace('@', ''));
      if (!targetUser) throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      
      // Verificar se a tarefa pertence ao usuário atual
      const task = await dbSharing.getTaskById(input.taskId);
      if (!task || task.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não pode compartilhar esta tarefa' });
      }
      
      // Criar compartilhamento
      await dbSharing.createTaskShare({
        taskId: input.taskId,
        sharedWithUserId: targetUser.id,
        sharedByUserId: ctx.user.id,
        permission: input.permission
      });
      
      // Criar notificação
      await dbNotifications.createShareNotification({
        userId: targetUser.id,
        fromUserId: ctx.user.id,
        itemType: "task",
        itemId: input.taskId,
        itemTitle: task.title
      });
      
      return { success: true, sharedWith: targetUser.username };
     }),
    unshare: protectedProcedure.input(z.object({
      taskId: z.number(),
      userId: z.number()
    })).mutation(async ({ ctx, input }) => {
      // Verificar permissão
      const task = await dbSharing.getTaskById(input.taskId);
      if (!task || task.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }
      
      await dbSharing.deleteTaskShare(input.taskId, input.userId);
      return { success: true };
     }),
    getShares: protectedProcedure.input(z.object({
      taskId: z.number()
    })).query(async ({ ctx, input }) => {
      return dbSharing.getTaskShares(input.taskId);
     }),
  }),

  kanban: router({
    listBoards: protectedProcedure.query(async ({ ctx }) => {
      // Retornar kanban do usuário + kanban compartilhados (sem duplicatas)
      const ownBoards = await db.getKanbanBoardsByUser(ctx.user.id);
      const sharedBoards = await db.getSharedKanbanBoardsForUser(ctx.user.id);
      const allBoards = [...ownBoards, ...sharedBoards];
      // Remover duplicatas baseado no ID
      const uniqueBoards = Array.from(new Map(allBoards.map(board => [board.id, board])).values());
      return uniqueBoards;
     }),
    getBoard: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      // Verificar permissão antes de retornar
      const permission = await db.checkKanbanPermission(input.id, ctx.user.id);
      if (!permission) throw new Error("Unauthorized");
      return db.getKanbanBoardWithDetails(input.id, ctx.user.id);
     }),
    createBoard: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      visibility: z.enum(["private", "shared", "public"]).default("private"),
      scope: z.enum(["personal", "professional"]).default("personal"),
      memberIds: z.array(z.number()).optional()
    })).mutation(async ({ ctx, input }) => {
      const { memberIds, ...boardData } = input;
      const board = await db.createKanbanBoard({ ...boardData, userId: ctx.user.id });
      
      // Add members if visibility is shared
      if (input.visibility === "shared" && memberIds && memberIds.length > 0) {
        await db.addKanbanBoardMembers(board.id, memberIds);
      }
      
      return board;
     }),
    updateBoard: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      visibility: z.enum(["private", "shared", "public"]).optional(),
      scope: z.enum(["personal", "professional"]).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateKanbanBoard(id, ctx.user.id, data);
      return { success: true };
     }),
    deleteBoard: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteKanbanBoard(input.id, ctx.user.id);
      return { success: true };
     }),
    addMember: protectedProcedure.input(z.object({
      boardId: z.number(),
      userId: z.number(),
      role: z.enum(["owner", "editor", "viewer"]).default("viewer")
    })).mutation(async ({ ctx, input }) => {
      const board = await db.getKanbanBoardWithDetails(input.boardId, ctx.user.id);
      if (!board || board.userId !== ctx.user.id) throw new Error("Unauthorized");
      await db.addKanbanBoardMember(input.boardId, input.userId, input.role);
      return { success: true };
     }),
    listMembers: protectedProcedure.input(z.object({
      boardId: z.number()
    })).query(async ({ input }) => {
      return db.getKanbanBoardMembers(input.boardId);
     }),
    removeMember: protectedProcedure.input(z.object({
      boardId: z.number(),
      userId: z.number()
    })).mutation(async ({ input }) => {
      await db.removeKanbanBoardMember(input.boardId, input.userId);
      return { success: true };
     }),
    createColumn: protectedProcedure.input(z.object({
      boardId: z.number(),
      title: z.string().min(1),
      position: z.number(),
      color: z.string().optional()
    })).mutation(async ({ input }) => {
      return db.createKanbanColumn(input);
     }),
    updateColumn: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      position: z.number().optional(),
      color: z.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateKanbanColumn(id, data);
      return { success: true };
     }),
    deleteColumn: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteKanbanColumn(input.id);
      return { success: true };
     }),
    createCard: protectedProcedure.input(z.object({
      columnId: z.number(),
      boardId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      position: z.number(),
      labels: z.array(z.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      const hasPermission = await db.hasKanbanPermission(input.boardId, ctx.user.id, "editor");
      if (!hasPermission) throw new Error("Unauthorized");
      const result = await db.createKanbanCard({
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined
      });
      emitToBoardRoom(input.boardId, KanbanEvents.CARD_CREATED, result);
      return result;
     }),
    updateCard: protectedProcedure.input(z.object({
      id: z.number(),
      columnId: z.number().optional(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      position: z.number().optional(),
      labels: z.array(z.string()).optional()
    })).mutation(async ({ input }) => {
      const { id, dueDate, columnId, ...data } = input;
      await db.updateKanbanCard(id, {
        ...data,
        columnId,
        dueDate: dueDate ? new Date(dueDate) : undefined
      });
      // Get the card's board to emit event
      const card = await db.getKanbanCardById(id);
      if (card) {
        emitToBoardRoom(card.boardId, KanbanEvents.CARD_UPDATED, { id, ...data });
        if (columnId) {
          emitToBoardRoom(card.boardId, KanbanEvents.CARD_MOVED, { cardId: id, columnId });
        }
      }
      return { success: true };
     }),
    deleteCard: protectedProcedure.input(z.object({ id: z.number(), boardId: z.number().optional() })).mutation(async ({ input }) => {
      const card = await db.getKanbanCardById(input.id);
      await db.deleteKanbanCard(input.id);
      if (card) {
        emitToBoardRoom(card.boardId, KanbanEvents.CARD_DELETED, { id: input.id });
      }
      return { success: true };
     }),
    getCardComments: protectedProcedure.input(z.object({ cardId: z.number() })).query(async ({ input }) => {
      return db.getKanbanCardComments(input.cardId);
     }),
    addCardComment: protectedProcedure.input(z.object({
      cardId: z.number(),
      content: z.string().min(1)
    })).mutation(async ({ ctx, input }) => {
      return db.createKanbanComment({ ...input, userId: ctx.user.id });
     }),
    deleteCardComment: protectedProcedure.input(z.object({
      id: z.number()
    })).mutation(async ({ ctx, input }) => {
      await db.deleteKanbanComment(input.id, ctx.user.id);
      return { success: true };
     }),
    getCardChecklists: protectedProcedure.input(z.object({ cardId: z.number() })).query(async ({ input }) => {
      return db.getKanbanChecklists(input.cardId);
     }),
    createChecklist: protectedProcedure.input(z.object({
      cardId: z.number(),
      title: z.string().min(1),
      position: z.number()
    })).mutation(async ({ input }) => {
      return db.createKanbanChecklist(input);
     }),
    updateChecklist: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      isCompleted: z.boolean().optional(),
      position: z.number().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateKanbanChecklist(id, data);
      return { success: true };
     }),
    deleteChecklist: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteKanbanChecklist(input.id);
      return { success: true };
     }),
    moveCard: protectedProcedure.input(z.object({
      cardId: z.number(),
      newColumnId: z.number(),
      newPosition: z.number()
    })).mutation(async ({ input }) => {
      await db.moveKanbanCard(input.cardId, input.newColumnId, input.newPosition);
      return { success: true };
     }),
  }),

  expenses: router({
    listVariable: protectedProcedure.input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      scope: z.enum(["personal", "professional"]).optional()
    }).optional()).query(async ({ ctx, input }) => {
      return db.getVariableExpensesByUser(
        ctx.user.id,
        input?.startDate ? new Date(input.startDate) : undefined,
        input?.endDate ? new Date(input.endDate) : undefined,
        input?.scope
      );
     }),
    createVariable: protectedProcedure.input(z.object({
      date: z.string(),
      categoryId: z.number().optional(),
      company: z.string().optional(),
      description: z.string().optional(),
      amount: z.string(),
      receiptUrl: z.string().optional(),
      notes: z.string().optional(),
      scope: z.enum(["personal", "professional"]).default("personal"),
      // Novos campos
      expenseType: z.enum(["pessoal", "compartilhado", "empresa"]).default("pessoal"),
      currency: z.enum(["BRL", "USD"]).default("BRL"),
      location: z.enum(["BRN", "USA"]).optional(),
      sharedWith: z.array(z.number()).optional() // Array de user IDs
    })).mutation(async ({ ctx, input }) => {
      return db.createVariableExpense({
        ...input,
        date: new Date(input.date),
        userId: ctx.user.id
      });
     }),
    updateVariable: protectedProcedure.input(z.object({
      id: z.number(),
      date: z.string().optional(),
      categoryId: z.number().optional(),
      company: z.string().optional(),
      description: z.string().optional(),
      amount: z.string().optional(),
      receiptUrl: z.string().optional(),
      notes: z.string().optional(),
      scope: z.enum(["personal", "professional"]).optional(),
      // Novos campos
      expenseType: z.enum(["pessoal", "compartilhado", "empresa"]).optional(),
      currency: z.enum(["BRL", "USD"]).optional(),
      location: z.enum(["BRN", "USA"]).optional(),
      sharedWith: z.array(z.number()).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, date, ...data } = input;
      await db.updateVariableExpense(id, ctx.user.id, {
        ...data,
        date: date ? new Date(date) : undefined
      });
      return { success: true };
     }),
    deleteVariable: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteVariableExpense(input.id, ctx.user.id);
      return { success: true };
     }),
    listFixed: protectedProcedure.input(z.object({
      scope: z.enum(["personal", "professional"]).optional()
    }).optional()).query(async ({ ctx, input }) => {
      return db.getFixedExpensesByUser(ctx.user.id, input?.scope);
     }),
    createFixed: protectedProcedure.input(z.object({
      description: z.string().min(1),
      categoryId: z.number().optional(),
      amount: z.string(),
      dueDay: z.number().min(1).max(31),
      scope: z.enum(["personal", "professional"]).default("personal")
    })).mutation(async ({ ctx, input }) => {
      return db.createFixedExpense({ ...input, userId: ctx.user.id });
     }),
    updateFixed: protectedProcedure.input(z.object({
      id: z.number(),
      description: z.string().min(1).optional(),
      categoryId: z.number().optional(),
      amount: z.string().optional(),
      dueDay: z.number().min(1).max(31).optional(),
      scope: z.enum(["personal", "professional"]).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateFixedExpense(id, ctx.user.id, data);
      return { success: true };
     }),
    deleteFixed: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteFixedExpense(input.id, ctx.user.id);
      return { success: true };
     }),
    getFixedPayments: protectedProcedure.input(z.object({
      month: z.number().min(1).max(12),
      year: z.number()
    })).query(async ({ ctx, input }) => {
      return db.getFixedExpensePayments(ctx.user.id, input.month, input.year);
     }),
    setFixedPayment: protectedProcedure.input(z.object({
      fixedExpenseId: z.number(),
      month: z.number().min(1).max(12),
      year: z.number(),
      isPaid: z.boolean(),
      paidAmount: z.string().optional(),
      receiptUrl: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.upsertFixedExpensePayment({
        ...input,
        userId: ctx.user.id,
        paidAt: input.isPaid ? new Date() : undefined
      });
     }),
    getByCategory: protectedProcedure.input(z.object({
      month: z.number().min(1).max(12),
      year: z.number()
    })).query(async ({ ctx, input }) => {
      return db.getExpensesByCategory(ctx.user.id, input.month, input.year);
     }),
    getMonthlyTrend: protectedProcedure.input(z.object({
      year: z.number()
    })).query(async ({ ctx, input }) => {
      return db.getMonthlyExpenseTrend(ctx.user.id, input.year);
     }),
    // Nova procedure para estatísticas por tipo e moeda
    getStatsByTypeAndCurrency: protectedProcedure.input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }).optional()).query(async ({ ctx, input }) => {
      const expenses = await db.getVariableExpensesByUser(
        ctx.user.id,
        input?.startDate ? new Date(input.startDate) : undefined,
        input?.endDate ? new Date(input.endDate) : undefined
      );
      
      // Agrupar por tipo e moeda
      const stats: Record<string, { BRL: number; USD: number }> = {
        pessoal: { BRL: 0, USD: 0 },
        compartilhado: { BRL: 0, USD: 0 },
        empresa: { BRL: 0, USD: 0 }
      };
      
      expenses.forEach(expense => {
        const type = expense.expenseType || 'pessoal';
        const currency = expense.currency || 'BRL';
        const amount = parseFloat(expense.amount);
        
        if (stats[type] && !isNaN(amount)) {
          stats[type][currency] += amount;
        }
      });
      
      return stats;
     }),
    // Totais de despesas por moeda (variáveis + fixas)
    getTotalsByCurrency: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getExpensesTotalsByCurrency } = await import("./db-expenses-totals");
        return await getExpensesTotalsByCurrency(ctx.user.id, input);
      }),
  }),

  budgets: router({
    list: protectedProcedure.input(z.object({ year: z.number() })).query(async ({ ctx, input }) => {
      return db.getBudgetsByUser(ctx.user.id, input.year);
     }),
    create: protectedProcedure.input(z.object({
      categoryId: z.number().optional(),
      month: z.number().min(1).max(12),
      year: z.number(),
      amount: z.string(),
      scope: z.enum(["personal", "professional", "both"]).default("both")
    })).mutation(async ({ ctx, input }) => {
      return db.createBudget({ ...input, userId: ctx.user.id });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      amount: z.string().optional(),
      scope: z.enum(["personal", "professional", "both"]).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateBudget(id, ctx.user.id, data);
      return { success: true };
     }),
  }),

  habits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getHabitsByUser(ctx.user.id);
     }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      categoryId: z.number().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      targetValue: z.string().optional(),
      unit: z.string().optional(),
      frequency: z.enum(["daily", "weekly"]).default("daily")
    })).mutation(async ({ ctx, input }) => {
      return db.createHabit({ ...input, userId: ctx.user.id });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      categoryId: z.number().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      targetValue: z.string().optional(),
      unit: z.string().optional(),
      frequency: z.enum(["daily", "weekly"]).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateHabit(id, ctx.user.id, data);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteHabit(input.id, ctx.user.id);
      return { success: true };
     }),
    getLogs: protectedProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string()
    })).query(async ({ ctx, input }) => {
      return db.getHabitLogsByUser(ctx.user.id, new Date(input.startDate), new Date(input.endDate));
     }),
    setLog: protectedProcedure.input(z.object({
      habitId: z.number(),
      date: z.string(),
      value: z.string().optional(),
      completed: z.boolean(),
      notes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.upsertHabitLog({
        habitId: input.habitId,
        userId: ctx.user.id,
        date: new Date(input.date),
        value: input.value,
        completed: input.completed,
        notes: input.notes
      });
     }),
    share: protectedProcedure.input(z.object({
      habitId: z.number(),
      username: z.string().min(1), // @username do usuário
      permission: z.enum(["viewer", "editor"]).default("viewer")
    })).mutation(async ({ ctx, input }) => {
      // Buscar usuário pelo username
      const targetUser = await dbSharing.getUserByUsername(input.username.replace('@', ''));
      if (!targetUser) throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      
      // Verificar se o hábito pertence ao usuário atual
      const habit = await dbSharing.getHabitById(input.habitId);
      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não pode compartilhar este hábito' });
      }
      
      // Criar compartilhamento
      await dbSharing.createHabitShare({
        habitId: input.habitId,
        sharedWithUserId: targetUser.id,
        sharedByUserId: ctx.user.id,
        permission: input.permission
      });
      
      // Criar notificação
      await dbNotifications.createShareNotification({
        userId: targetUser.id,
        fromUserId: ctx.user.id,
        itemType: "habit",
        itemId: input.habitId,
        itemTitle: habit.name
      });
      
      return { success: true, sharedWith: targetUser.username };
     }),
    unshare: protectedProcedure.input(z.object({
      habitId: z.number(),
      userId: z.number()
    })).mutation(async ({ ctx, input }) => {
      // Verificar permissão
      const habit = await dbSharing.getHabitById(input.habitId);
      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }
      
      await dbSharing.deleteHabitShare(input.habitId, input.userId);
      return { success: true };
     }),
    getShares: protectedProcedure.input(z.object({
      habitId: z.number()
    })).query(async ({ ctx, input }) => {
      return dbSharing.getHabitShares(input.habitId);
     }),
  }),

  // Notificações de compartilhamento
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await dbNotifications.getNotifications(ctx.user.id);
    }),
    
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await dbNotifications.getUnreadCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await dbNotifications.markAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await dbNotifications.markAllAsRead(ctx.user.id);
      return { success: true };
    }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await dbNotifications.deleteNotification(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  dashboard: router({
    getStats: protectedProcedure.input(z.object({
      month: z.number().min(1).max(12),
      year: z.number()
    })).query(async ({ ctx, input }) => {
      return db.getDashboardStats(ctx.user.id, input.month, input.year);
     }),
  }),

  contacts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getContactsByUser(ctx.user.id);
     }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      linkedUserId: z.number().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.createContact({ ...input, userId: ctx.user.id });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      linkedUserId: z.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateContact(id, ctx.user.id, data);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteContact(input.id, ctx.user.id);
      return { success: true };
     }),
  }),

  // ==================== INSIGHTS (Análises GPT) ====================
  // TEMPORARIAMENTE COMENTADO - Será reimplementado após nova estrutura de tarefas
  insights: router({
    getExpenseAnalysis: protectedProcedure.query(async ({ ctx }) => {
      // return generateExpenseAnalysis(ctx.user.id);
      return { message: "Análise temporariamente indisponível - em reimplementação" };
    }),
    getProductivityAnalysis: protectedProcedure.query(async ({ ctx }) => {
      // return generateProductivityAnalysis(ctx.user.id);
      return { message: "Análise temporariamente indisponível - em reimplementação" };
    }),
    getWeeklyInsights: protectedProcedure.query(async ({ ctx }) => {
      // return generateWeeklyInsights(ctx.user.id);
      return { message: "Análise temporariamente indisponível - em reimplementação" };
    }),
    generateSuggestions: protectedProcedure.input(z.object({ period: z.enum(["today", "week", "month"]) })).mutation(async ({ ctx, input }) => {
      // TEMPORARIAMENTE COMENTADO - Será reimplementado após nova estrutura de tarefas
      // const contextData = await collectLLMContextData(ctx.user.id, input.period);
      // const formattedContext = formatContextForLLM(contextData);
      // const response = await invokeLLM({
      //   messages: [
      //     { role: "system", content: "Voce eh assistente de produtividade" },
      //     { role: "user", content: formattedContext }
      //   ]
      // });
      return {
        period: input.period,
        message: "Sugestões temporariamente indisponíveis - em reimplementação",
        generatedAt: new Date()
      };
    }),
  }),

  // ==================== MANAGED USERS (Admin) ====================
  managedUsers: router({
     list: protectedProcedure.query(async ({ ctx }) => {
      // Permitir CEO e Master acessarem lista de usuários
      if (ctx.user.managedUserRole !== 'ceo' && ctx.user.managedUserRole !== 'master') {
        throw new Error('Unauthorized');
      }
      return db.getManagedUsersByAdmin(ctx.user.id);
     }),
    listForMentions: protectedProcedure.query(async ({ ctx }) => {
      // Endpoint público para menções - qualquer usuário autenticado pode listar
      return db.getAllActiveManagedUsers();
     }),
    search: protectedProcedure.input(z.object({
      query: z.string().min(1)
    })).query(async ({ ctx, input }) => {
      // CEO and Master can search all users, Colaborador can only see themselves
      const users = await db.searchManagedUsers(input.query, ctx.user.id);
      return users.map(u => ({
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        displayName: `${u.firstName} ${u.lastName} (@${u.username})`
      }));
     }),
    create: protectedProcedure.input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phoneBR: z.string().optional(),
      phoneUS: z.string().optional(),
      password: z.string().min(8),
      username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username deve conter apenas letras minúsculas, números e underscore'),
      role: z.enum(['ceo', 'master', 'colaborador']).default('colaborador')
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.managedUserRole !== 'ceo' && ctx.user.managedUserRole !== 'master') throw new Error('Unauthorized');
      // Simple hash for demo - in production use bcrypt
      const passwordHash = Buffer.from(input.password).toString('base64');
      return db.createManagedUser({
        createdByUserId: ctx.user.id,
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phoneBR: input.phoneBR || null,
        phoneUS: input.phoneUS || null,
        role: input.role,
        passwordHash
      });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      username: z.string().min(3).max(30).optional(),
      phoneBR: z.string().optional(),
      phoneUS: z.string().optional(),
      role: z.enum(['ceo', 'master', 'colaborador']).optional(),
      password: z.string().min(8).optional(),
      isActive: z.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.managedUserRole !== 'ceo' && ctx.user.managedUserRole !== 'master') throw new Error('Unauthorized');
      const { id, password, ...data } = input;
      const updateData: any = { ...data };
      if (password) {
        updateData.passwordHash = Buffer.from(password).toString('base64');
      }
      await db.updateManagedUser(id, ctx.user.id, updateData);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.managedUserRole !== 'ceo' && ctx.user.managedUserRole !== 'master') throw new Error('Unauthorized');
      await db.deleteManagedUser(input.id, ctx.user.id);
      return { success: true };
     }),
    resetPassword: protectedProcedure.input(z.object({
      id: z.number(),
      newPassword: z.string().min(8)
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.managedUserRole !== 'ceo' && ctx.user.managedUserRole !== 'master') throw new Error('Unauthorized');
      const passwordHash = Buffer.from(input.newPassword).toString('base64');
      await db.updateManagedUser(input.id, ctx.user.id, { passwordHash });
      return { success: true };
     }),
    // Login endpoint for managed users (public)
    login: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string()
    })).mutation(async ({ input }) => {
      const user = await db.getManagedUserByEmail(input.email);
      if (!user) {
        throw new Error('Credenciais inválidas');
      }
      if (!user.isActive) {
        throw new Error('Usuário desativado');
      }
      // Simple password check - in production use bcrypt
      const passwordHash = Buffer.from(input.password).toString('base64');
      if (user.passwordHash !== passwordHash) {
        throw new Error('Credenciais inválidas');
      }
      // Update last login
      await db.updateManagedUserLastLogin(user.id);
      // Generate a simple token (in production use JWT)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
      return {
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        token
      };
     }),
  }),

  // ==================== SALES/REVENUE ====================
  sales: router({
    list: protectedProcedure.input(z.object({
      month: z.number().min(1).max(12).optional(),
      year: z.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      if (input?.month && input?.year) {
        return db.getSalesByMonth(ctx.user.id, input.month, input.year);
      }
      return db.getSalesByUser(ctx.user.id);
     }),
    create: protectedProcedure.input(z.object({
      date: z.string().transform(s => new Date(s)),
      description: z.string().optional(),
      company: z.string().optional(),
      amount: z.number().positive(),
      paymentMethod: z.string().optional(),
      status: z.enum(["pending", "completed", "cancelled"]).default("completed"),
      notes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { amount, ...rest } = input;
      return db.createSale({ ...rest, amount: amount.toString(), userId: ctx.user.id });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      description: z.string().optional(),
      company: z.string().optional(),
      amount: z.number().positive().optional(),
      paymentMethod: z.string().optional(),
      status: z.enum(["pending", "completed", "cancelled"]).optional(),
      notes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, amount, ...rest } = input;
      const data = { ...rest, amount: amount?.toString() };
      await db.updateSale(id, ctx.user.id, data);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteSale(input.id, ctx.user.id);
      return { success: true };
     }),
    getDailySplit: protectedProcedure.input(z.object({
      month: z.number().min(1).max(12),
      year: z.number()
    })).query(async ({ ctx, input }) => {
      return db.getDailySalesSplit(ctx.user.id, input.month, input.year);
     }),
    getMonthlyRevenue: protectedProcedure.input(z.object({ year: z.number() })).query(async ({ ctx, input }) => {
      return db.getMonthlyRevenue(ctx.user.id, input.year);
     }),
    getProfitLoss: protectedProcedure.input(z.object({
      month: z.number().min(1).max(12),
      year: z.number()
    })).query(async ({ ctx, input }) => {
      return db.getMonthlyProfitLoss(ctx.user.id, input.month, input.year);
     }),
  }),

  // ==================== ANALYSIS HISTORY ====================
  analysisHistory: router({
    list: protectedProcedure.input(z.object({ limit: z.number().default(12) }).optional()).query(async ({ ctx, input }) => {
      return db.getAnalysisHistory(ctx.user.id, input?.limit || 12);
     }),
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return db.getLatestAnalysis(ctx.user.id);
     }),
    save: protectedProcedure.input(z.object({
      weekStartDate: z.string().transform(s => new Date(s)),
      weekEndDate: z.string().transform(s => new Date(s)),
      overallScore: z.number(),
      taskCompletionRate: z.number().optional(),
      habitCompletionRate: z.number().optional(),
      totalExpenses: z.number().optional(),
      totalRevenue: z.number().optional(),
      expenseAnalysis: z.any().optional(),
      productivityAnalysis: z.any().optional(),
      recommendations: z.array(z.string()).optional(),
      alerts: z.array(z.string()).optional(),
      motivationalMessage: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.saveAnalysisHistory({
        userId: ctx.user.id,
        weekStartDate: input.weekStartDate,
        weekEndDate: input.weekEndDate,
        overallScore: input.overallScore,
        taskCompletionRate: input.taskCompletionRate?.toString(),
        habitCompletionRate: input.habitCompletionRate?.toString(),
        totalExpenses: input.totalExpenses?.toString(),
        totalRevenue: input.totalRevenue?.toString(),
        expenseAnalysis: input.expenseAnalysis,
        productivityAnalysis: input.productivityAnalysis,
        recommendations: input.recommendations,
        alerts: input.alerts,
        motivationalMessage: input.motivationalMessage
      });
     }),
  }),

  roles: router({
    list: protectedProcedure.query(async () => {
      return db.getAllRoles();
     }),
    getUserRoles: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return db.getRolesByUserId(input.userId);
     }),
    getUserPermissions: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return db.getPermissionsByUserId(input.userId);
     }),
    hasPermission: protectedProcedure.input(z.object({ userId: z.number(), permission: z.string() })).query(async ({ input }) => {
      return db.hasPermission(input.userId, input.permission);
     }),
    assignRole: protectedProcedure.input(z.object({ userId: z.number(), roleId: z.number() })).mutation(async ({ ctx, input }) => {
      // Check if user has permission to assign roles
      const hasPermission = await db.hasPermission(ctx.user.id, "users.manage");
      if (!hasPermission) throw new Error("Permission denied");
      
      await db.assignRoleToUser(input.userId, input.roleId);
      await db.createAuditLog(ctx.user.id, "assign_role", "user", input.userId, `Assigned role ${input.roleId}`);
      return { success: true };
     }),
    removeRole: protectedProcedure.input(z.object({ userId: z.number(), roleId: z.number() })).mutation(async ({ ctx, input }) => {
      const hasPermission = await db.hasPermission(ctx.user.id, "users.manage");
      if (!hasPermission) throw new Error("Permission denied");
      
      await db.removeRoleFromUser(input.userId, input.roleId);
      await db.createAuditLog(ctx.user.id, "remove_role", "user", input.userId, `Removed role ${input.roleId}`);
      return { success: true };
     }),
  }),

  sessions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSessions(ctx.user.id);
     }),
    logout: protectedProcedure.input(z.object({ sessionId: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteSession(input.sessionId);
      await db.createAuditLog(ctx.user.id, "logout", "session", input.sessionId);
      return { success: true };
     }),
  }),

  audit: router({
    getLogs: protectedProcedure.input(z.object({ userId: z.number().optional(), limit: z.number().default(100) })).query(async ({ ctx, input }) => {
      const hasPermission = await db.hasPermission(ctx.user.id, "audit.view");
      if (!hasPermission) throw new Error("Permission denied");
      
      return db.getAuditLogs(input.userId, input.limit);
    }),
  }),
  
  clients: clientsRouter,
  
  // Faturamento (Revenues)
  revenues: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        revenueType: z.enum(['pessoal', 'empresa']).optional(),
        currency: z.enum(['BRL', 'USD']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getRevenuesByUser(ctx.user.id, input);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const revenue = await db.getRevenueById(input.id);
        if (!revenue) throw new TRPCError({ code: 'NOT_FOUND', message: 'Receita não encontrada' });
        
        // Verificar permissão: usuário só vê suas próprias receitas, admin vê tudo
        if (revenue.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para acessar esta receita' });
        }
        
        return revenue;
      }),
    
    create: protectedProcedure
      .input(z.object({
        date: z.string(),
        description: z.string().min(1),
        amount: z.string(),
        revenueType: z.enum(['pessoal', 'empresa']),
        currency: z.enum(['BRL', 'USD']),
        category: z.string().optional(),
        client: z.string().optional(),
        notes: z.string().optional(),
        receiptUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createRevenue({
          userId: ctx.user.id,
          date: new Date(input.date),
          description: input.description,
          amount: input.amount,
          revenueType: input.revenueType,
          currency: input.currency,
          category: input.category,
          client: input.client,
          notes: input.notes,
          receiptUrl: input.receiptUrl,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        date: z.string().optional(),
        description: z.string().optional(),
        amount: z.string().optional(),
        revenueType: z.enum(['pessoal', 'empresa']).optional(),
        currency: z.enum(['BRL', 'USD']).optional(),
        category: z.string().optional(),
        client: z.string().optional(),
        notes: z.string().optional(),
        receiptUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const revenue = await db.getRevenueById(input.id);
        if (!revenue) throw new TRPCError({ code: 'NOT_FOUND', message: 'Receita não encontrada' });
        
        // Verificar permissão
        if (revenue.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para editar esta receita' });
        }
        
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.date) updateData.date = new Date(data.date);
        if (data.description) updateData.description = data.description;
        if (data.amount) updateData.amount = data.amount;
        if (data.revenueType) updateData.revenueType = data.revenueType;
        if (data.currency) updateData.currency = data.currency;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.client !== undefined) updateData.client = data.client;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;
        
        await db.updateRevenue(id, updateData);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const revenue = await db.getRevenueById(input.id);
        if (!revenue) throw new TRPCError({ code: 'NOT_FOUND', message: 'Receita não encontrada' });
        
        // Verificar permissão
        if (revenue.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para excluir esta receita' });
        }
        
        await db.deleteRevenue(input.id);
        return { success: true };
      }),
    
    getTotalsByTypeAndCurrency: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getRevenueTotalsByTypeAndCurrency(ctx.user.id, input);
      }),
    
    uploadReceipt: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64 encoded file
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        
        // Gerar nome único com sufixo aleatório
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileExtension = input.fileName.split('.').pop();
        const storageKey = `receipts/${ctx.user.id}/${Date.now()}-${randomSuffix}.${fileExtension}`;
        
        // Decodificar base64
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Upload para S3
        const { url } = await storagePut(storageKey, buffer, input.contentType);
        
        return { url };
      }),
    
    extractReceiptData: protectedProcedure
      .input(z.object({
        receiptUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Apenas admins podem usar OCR
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'OCR automático disponível apenas para administradores' 
          });
        }
        
        const { invokeLLM } = await import("./_core/llm");
        
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: input.receiptUrl,
                      detail: "high"
                    }
                  },
                  {
                    type: "text",
                    text: "Extraia as seguintes informações desta nota fiscal ou cupom fiscal: CNPJ da empresa (formato 00.000.000/0000-00), nome da empresa, valor total (apenas números com 2 casas decimais), data (formato YYYY-MM-DD) e hora (formato HH:MM:SS). Se algum campo não estiver visível, retorne null."
                  }
                ]
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "receipt_data",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    cnpj: { type: ["string", "null"], description: "CNPJ no formato 00.000.000/0000-00" },
                    company: { type: ["string", "null"], description: "Nome da empresa" },
                    amount: { type: ["string", "null"], description: "Valor total com 2 casas decimais" },
                    date: { type: ["string", "null"], description: "Data no formato YYYY-MM-DD" },
                    time: { type: ["string", "null"], description: "Hora no formato HH:MM:SS" }
                  },
                  required: ["cnpj", "company", "amount", "date", "time"],
                  additionalProperties: false
                }
              }
            }
          });
          
          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error("OCR não retornou dados");
          }
          
          const data = typeof content === 'string' ? JSON.parse(content) : content;
          return data;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Erro ao processar OCR: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          });
        }
      }),
  }),

  // ==================== SUPPORT TICKETS ====================
  tickets: router({
    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        siteId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(["erro_bug", "duvida", "solicitacao", "melhoria"]).default("duvida"),
        channel: z.enum(["whatsapp", "email", "telefone", "sistema"]).default("sistema"),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
        escalatedToDev: z.boolean().default(false)
      }))
      .mutation(async ({ input }) => {
        const ticketId = await dbTickets.createTicket({
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined
        });
        return { id: ticketId };
      }),

    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        clientId: z.number().optional(),
        assignedTo: z.number().optional(),
        type: z.string().optional()
      }).optional())
      .query(async ({ input }) => {
        return await dbTickets.listTickets(input || {});
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await dbTickets.getTicketById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["erro_bug", "duvida", "solicitacao", "melhoria"]).optional(),
        channel: z.enum(["whatsapp", "email", "telefone", "sistema"]).optional(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
        escalatedToDev: z.boolean().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dbTickets.updateTicket(id, {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined
        });
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["aberto", "em_andamento", "enviado_dev", "resolvido", "fechado"])
      }))
      .mutation(async ({ ctx, input }) => {
        await dbTickets.updateTicketStatus(input.id, input.status, ctx.user.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await dbTickets.deleteTicket(input.id);
        return { success: true };
      }),

    getMetrics: protectedProcedure
      .query(async () => {
        return await dbTickets.getTicketMetrics();
      }),

    addMessage: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        message: z.string().min(1),
        isFromClient: z.boolean().default(false),
        attachments: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const messageId = await dbTickets.addTicketMessage({
          ...input,
          userId: ctx.user.id
        });
        return { id: messageId };
      }),

    getMessages: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await dbTickets.getTicketMessages(input.ticketId);
      }),

    getStatusHistory: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await dbTickets.getTicketStatusHistory(input.ticketId);
      }),

    // Endpoint para criar ticket via WhatsApp (usado pelo n8n)
    createFromWhatsApp: protectedProcedure
      .input(z.object({
        phone: z.string(),
        message: z.string(),
        clientName: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        // Buscar cliente pelo telefone
        const client = await db.getClientByPhone(input.phone);
        
        const ticketId = await dbTickets.createTicket({
          clientId: client?.id,
          title: input.clientName ? `Mensagem de ${input.clientName}` : "Novo chamado via WhatsApp",
          description: input.message,
          type: "duvida",
          channel: "whatsapp",
          status: "aberto"
        });
        
        return { id: ticketId, clientId: client?.id };
      })
  }),
});

export type AppRouter = typeof appRouter;

