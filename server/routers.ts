import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateExpenseAnalysis, generateProductivityAnalysis, generateWeeklyInsights } from "./analysis";
import { emitToBoardRoom, KanbanEvents } from "./_core/socket";
import { collectLLMContextData, formatContextForLLM } from "./llmContext";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  
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
      const user = await db.getManagedUserByEmail(input.email);
      if (!user) throw new Error('Invalid credentials');
      if (!user.isActive) throw new Error('User account is inactive');
      const passwordHash = Buffer.from(input.password).toString('base64');
      if (user.passwordHash !== passwordHash) throw new Error('Invalid credentials');
      await db.updateManagedUser(user.id, user.createdByUserId, { lastLogin: new Date() });
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isActive: user.isActive
      };
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

  tasks: router({
    list: protectedProcedure.input(z.object({ scope: z.enum(["personal", "professional"]).optional() }).optional()).query(async ({ ctx, input }) => {
      return db.getTasksByUser(ctx.user.id, input?.scope);
     }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      frequency: z.enum(["daily", "weekly", "monthly", "as_needed"]).default("daily"),
      scope: z.enum(["personal", "professional"]).default("personal"),
      assignedTo: z.number().optional(),
      targetCompletionRate: z.number().min(0).max(100).default(100)
    })).mutation(async ({ ctx, input }) => {
      return db.createTask({ ...input, userId: ctx.user.id });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      frequency: z.enum(["daily", "weekly", "monthly", "as_needed"]).optional(),
      scope: z.enum(["personal", "professional"]).optional(),
      assignedTo: z.number().optional(),
      targetCompletionRate: z.number().min(0).max(100).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateTask(id, ctx.user.id, data);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteTask(input.id, ctx.user.id);
      return { success: true };
     }),
    getCompletions: protectedProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string()
    })).query(async ({ ctx, input }) => {
      return db.getTaskCompletionsByUser(ctx.user.id, new Date(input.startDate), new Date(input.endDate));
     }),
    setCompletion: protectedProcedure.input(z.object({
      taskId: z.number(),
      date: z.string(),
      status: z.enum(["done", "not_done", "in_progress"]),
      notes: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return db.upsertTaskCompletion({
        taskId: input.taskId,
        userId: ctx.user.id,
        date: new Date(input.date),
        status: input.status,
        notes: input.notes
      });
     }),
  }),

  kanban: router({
    listBoards: protectedProcedure.query(async ({ ctx }) => {
      return db.getKanbanBoardsByUser(ctx.user.id);
     }),
    getBoard: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      return db.getKanbanBoardWithDetails(input.id, ctx.user.id);
     }),
    createBoard: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      visibility: z.enum(["private", "shared", "public"]).default("private"),
      scope: z.enum(["personal", "professional"]).default("personal")
    })).mutation(async ({ ctx, input }) => {
      return db.createKanbanBoard({ ...input, userId: ctx.user.id });
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
    })).mutation(async ({ input }) => {
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
      scope: z.enum(["personal", "professional"]).default("personal")
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
      scope: z.enum(["personal", "professional"]).optional()
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
  insights: router({
    getExpenseAnalysis: protectedProcedure.query(async ({ ctx }) => {
      return generateExpenseAnalysis(ctx.user.id);
    }),
    getProductivityAnalysis: protectedProcedure.query(async ({ ctx }) => {
      return generateProductivityAnalysis(ctx.user.id);
    }),
    getWeeklyInsights: protectedProcedure.query(async ({ ctx }) => {
      return generateWeeklyInsights(ctx.user.id);
    }),
    generateSuggestions: protectedProcedure.input(z.object({ period: z.enum(["today", "week", "month"]) })).mutation(async ({ ctx, input }) => {
      const contextData = await collectLLMContextData(ctx.user.id, input.period);
      const formattedContext = formatContextForLLM(contextData);
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Voce eh assistente de produtividade" },
          { role: "user", content: formattedContext }
        ]
      });
      return {
        period: input.period,
        contextData,
        suggestions: response.choices[0]?.message?.content || "Nao foi possivel gerar",
        generatedAt: new Date()
      };
    }),
  }),

  // ==================== MANAGED USERS (Admin) ====================
  managedUsers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      return db.getManagedUsersByAdmin(ctx.user.id);
     }),
    create: protectedProcedure.input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phoneBR: z.string().optional(),
      phoneUS: z.string().optional(),
      password: z.string().min(8),
      username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username deve conter apenas letras minúsculas, números e underscore')
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
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
        passwordHash
      });
     }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phoneBR: z.string().optional(),
      phoneUS: z.string().optional(),
      isActive: z.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { id, ...data } = input;
      await db.updateManagedUser(id, ctx.user.id, data);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      await db.deleteManagedUser(input.id, ctx.user.id);
      return { success: true };
     }),
    resetPassword: protectedProcedure.input(z.object({
      id: z.number(),
      newPassword: z.string().min(8)
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
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
    // Search users by username for mentions
    search: protectedProcedure.input(z.object({
      query: z.string()
    })).query(async ({ ctx, input }) => {
      return db.searchManagedUsersByUsername(ctx.user.id, input.query);
     }),
  }),

  // ==================== SYSTEM SETTINGS ====================
  settings: router({
    get: protectedProcedure.input(z.object({ key: z.string() })).query(async ({ ctx, input }) => {
      return db.getSetting(ctx.user.id, input.key);
     }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllSettings(ctx.user.id);
     }),
    set: protectedProcedure.input(z.object({
      key: z.string(),
      value: z.string(),
      isEncrypted: z.boolean().default(false)
    })).mutation(async ({ ctx, input }) => {
      return db.upsertSetting(ctx.user.id, input.key, input.value, input.isEncrypted);
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

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    list: protectedProcedure.input(z.object({ unreadOnly: z.boolean().default(false) }).optional()).query(async ({ ctx, input }) => {
      return db.getNotificationsByUser(ctx.user.id, input?.unreadOnly);
     }),
    markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.markNotificationAsRead(input.id, ctx.user.id);
      return { success: true };
     }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
     }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteNotification(input.id, ctx.user.id);
      return { success: true };
     }),
    generateExpenseReminders: protectedProcedure.mutation(async ({ ctx }) => {
      return db.generateExpenseNotifications(ctx.user.id);
     }),
    getUpcomingExpenses: protectedProcedure.query(async ({ ctx }) => {
      return db.getUpcomingFixedExpenses(ctx.user.id, 7);
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
});

export type AppRouter = typeof appRouter;
