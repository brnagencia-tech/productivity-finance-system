import { eq, and, or, desc, gte, lte, like, between, gt, lt, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  categories, InsertCategory, Category,
  tasks, InsertTask, Task,

  kanbanBoards, InsertKanbanBoard, KanbanBoard,
  kanbanBoardMembers, InsertKanbanBoardMember,
  kanbanColumns, InsertKanbanColumn, KanbanColumn,
  kanbanCards, InsertKanbanCard, KanbanCard,
  kanbanCardComments, InsertKanbanCardComment,
  variableExpenses, InsertVariableExpense, VariableExpense,
  fixedExpenses, InsertFixedExpense, FixedExpense,
  fixedExpensePayments, InsertFixedExpensePayment,
  budgets, InsertBudget,
  habits, InsertHabit, Habit,
  habitLogs, InsertHabitLog,
  roles, permissions, rolePermissions, userRoles, auditLog, sessions,
  passwordResetTokens, InsertPasswordResetToken, PasswordResetToken,
  clients, InsertClient, Client,
  clientSites, InsertClientSite, ClientSite,
  revenues, InsertRevenue, Revenue
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER QUERIES ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl }).from(users);
}

// ==================== CATEGORY QUERIES ====================
export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getCategoriesByUser(userId: number, type?: "expense" | "task" | "habit") {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db.select().from(categories).where(and(eq(categories.userId, userId), eq(categories.type, type)));
  }
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function updateCategory(id: number, userId: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// ==================== TASK QUERIES ====================
export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Remove campos autogerados (id, createdAt, updatedAt)
  const { id, createdAt, updatedAt, ...insertData } = data as any;
  // Normaliza status vindo do front (ex: "not_started") para valores válidos do ENUM no MySQL
  const allowedStatuses = new Set(["todo", "in_progress", "done"] as const);
  const incomingStatus = (insertData as any).status;
  const normalizedStatus = incomingStatus === "not_started" ? "todo" : incomingStatus;
  (insertData as any).status = allowedStatuses.has(normalizedStatus) ? normalizedStatus : "todo";
  const result = await db.insert(tasks).values(insertData);
  return { id: Number(result[0].insertId), ...insertData };
}

export async function getTasksByUser(userId: number, scope?: "personal" | "professional") {
  const db = await getDb();
  if (!db) return [];
  if (scope) {
    return db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.scope, scope)));
  }
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function updateTask(id: number, userId: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Nova estrutura: deletar de verdade (não apenas marcar como inativa)
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

// ==================== TASK QUERIES (Nova Estrutura Simplificada) ====================
// Tarefas agora são únicas (não recorrentes) com data, hora opcional, status e notas

// Buscar tarefas atrasadas (status "todo" com data passada)
export async function getOverdueTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return db.select().from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.status, "todo"),
      lt(tasks.date, today)
    ))
    .orderBy(asc(tasks.date));
}

// Deletar tarefas "done" com mais de 7 dias
export async function deleteOldCompletedTasks() {
  const db = await getDb();
  if (!db) return 0;
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  const result = await db.delete(tasks)
    .where(and(
      eq(tasks.status, "done"),
      lt(tasks.updatedAt, sevenDaysAgo)
    ));
  
  return result[0]?.affectedRows || 0;
}

// Listar tarefas ordenadas por data/hora (mais próximas primeiro)
export async function getTasksOrderedByDate(userId: number, scope?: "personal" | "professional") {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(tasks.userId, userId)];
  if (scope) {
    conditions.push(eq(tasks.scope, scope));
  }
  
  return db.select().from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.date), asc(tasks.time));
}

// ==================== KANBAN QUERIES ====================
export async function createKanbanBoard(data: InsertKanbanBoard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kanbanBoards).values(data);
  const boardId = Number(result[0].insertId);
  await db.insert(kanbanBoardMembers).values({ boardId, userId: data.userId, role: "owner" });
  const defaultColumns = [
    { boardId, title: "A Fazer", position: 0, color: "#6b7280" },
    { boardId, title: "Em Progresso", position: 1, color: "#f59e0b" },
    { boardId, title: "Concluído", position: 2, color: "#10b981" }
  ];
  await db.insert(kanbanColumns).values(defaultColumns);
  return { id: boardId, ...data };
}

export async function addKanbanBoardMembers(boardId: number, userIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const values = userIds.map(userId => ({
    boardId,
    userId,
    role: "editor" as const
  }));
  if (values.length > 0) {
    await db.insert(kanbanBoardMembers).values(values);
  }
}

export async function getKanbanBoardMembers(boardId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: kanbanBoardMembers.id,
    userId: kanbanBoardMembers.userId,
    role: kanbanBoardMembers.role,
    firstName: managedUsers.firstName,
    lastName: managedUsers.lastName,
    email: managedUsers.email,
    username: managedUsers.username
  })
    .from(kanbanBoardMembers)
    .leftJoin(managedUsers, eq(kanbanBoardMembers.userId, managedUsers.id))
    .where(eq(kanbanBoardMembers.boardId, boardId));
}

export async function addKanbanBoardMember(boardId: number, userId: number, role: "owner" | "editor" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(kanbanBoardMembers).values({ boardId, userId, role });
}

export async function removeKanbanBoardMember(boardId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(kanbanBoardMembers)
    .where(and(eq(kanbanBoardMembers.boardId, boardId), eq(kanbanBoardMembers.userId, userId)));
}

export async function getKanbanBoardsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const memberBoards = await db.select({ boardId: kanbanBoardMembers.boardId })
    .from(kanbanBoardMembers).where(eq(kanbanBoardMembers.userId, userId));
  const boardIds = memberBoards.map(m => m.boardId);
  if (boardIds.length === 0) return [];
  return db.select().from(kanbanBoards).where(sql`${kanbanBoards.id} IN (${sql.join(boardIds.map(id => sql`${id}`), sql`, `)})`);
}

export async function getKanbanBoardWithDetails(boardId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const member = await db.select().from(kanbanBoardMembers)
    .where(and(eq(kanbanBoardMembers.boardId, boardId), eq(kanbanBoardMembers.userId, userId))).limit(1);
  if (member.length === 0) {
    const board = await db.select().from(kanbanBoards)
      .where(and(eq(kanbanBoards.id, boardId), eq(kanbanBoards.visibility, "public"))).limit(1);
    if (board.length === 0) return null;
  }
  const board = await db.select().from(kanbanBoards).where(eq(kanbanBoards.id, boardId)).limit(1);
  if (board.length === 0) return null;
  const columns = await db.select().from(kanbanColumns).where(eq(kanbanColumns.boardId, boardId)).orderBy(asc(kanbanColumns.position));
  const cards = await db.select().from(kanbanCards).where(eq(kanbanCards.boardId, boardId)).orderBy(asc(kanbanCards.position));
  const members = await db.select({
    id: kanbanBoardMembers.id,
    boardId: kanbanBoardMembers.boardId,
    userId: kanbanBoardMembers.userId,
    role: kanbanBoardMembers.role,
    userName: users.name,
    userEmail: users.email
  }).from(kanbanBoardMembers)
    .leftJoin(users, eq(kanbanBoardMembers.userId, users.id))
    .where(eq(kanbanBoardMembers.boardId, boardId));
  return { ...board[0], columns, cards, members };
}

export async function updateKanbanBoard(id: number, userId: number, data: Partial<InsertKanbanBoard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(kanbanBoards).set(data).where(and(eq(kanbanBoards.id, id), eq(kanbanBoards.userId, userId)));
}

export async function deleteKanbanBoard(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(kanbanCards).where(eq(kanbanCards.boardId, id));
  await db.delete(kanbanColumns).where(eq(kanbanColumns.boardId, id));
  await db.delete(kanbanBoardMembers).where(eq(kanbanBoardMembers.boardId, id));
  await db.delete(kanbanBoards).where(and(eq(kanbanBoards.id, id), eq(kanbanBoards.userId, userId)));
}

export async function createKanbanColumn(data: InsertKanbanColumn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kanbanColumns).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updateKanbanColumn(id: number, data: Partial<InsertKanbanColumn>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(kanbanColumns).set(data).where(eq(kanbanColumns.id, id));
}

export async function deleteKanbanColumn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(kanbanCards).where(eq(kanbanCards.columnId, id));
  await db.delete(kanbanColumns).where(eq(kanbanColumns.id, id));
}

export async function createKanbanCard(data: InsertKanbanCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kanbanCards).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updateKanbanCard(id: number, data: Partial<InsertKanbanCard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(kanbanCards).set(data).where(eq(kanbanCards.id, id));
}

export async function deleteKanbanCard(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(kanbanCardComments).where(eq(kanbanCardComments.cardId, id));
  await db.delete(kanbanCards).where(eq(kanbanCards.id, id));
}

export async function createKanbanCardComment(data: InsertKanbanCardComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kanbanCardComments).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getKanbanCardComments(cardId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: kanbanCardComments.id,
    cardId: kanbanCardComments.cardId,
    userId: kanbanCardComments.userId,
    content: kanbanCardComments.content,
    createdAt: kanbanCardComments.createdAt,
    userName: users.name
  }).from(kanbanCardComments)
    .leftJoin(users, eq(kanbanCardComments.userId, users.id))
    .where(eq(kanbanCardComments.cardId, cardId))
    .orderBy(desc(kanbanCardComments.createdAt));
}

// ==================== VARIABLE EXPENSE QUERIES ====================
export async function createVariableExpense(data: InsertVariableExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(variableExpenses).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getVariableExpensesByUser(userId: number, startDate?: Date, endDate?: Date, scope?: "personal" | "professional") {
  const db = await getDb();
  if (!db) return [];
  let conditions = [eq(variableExpenses.userId, userId)];
  if (startDate) conditions.push(gte(variableExpenses.date, startDate));
  if (endDate) conditions.push(lte(variableExpenses.date, endDate));
  if (scope) conditions.push(eq(variableExpenses.scope, scope));
  return db.select().from(variableExpenses).where(and(...conditions)).orderBy(desc(variableExpenses.date));
}

export async function updateVariableExpense(id: number, userId: number, data: Partial<InsertVariableExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(variableExpenses).set(data).where(and(eq(variableExpenses.id, id), eq(variableExpenses.userId, userId)));
}

export async function deleteVariableExpense(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(variableExpenses).where(and(eq(variableExpenses.id, id), eq(variableExpenses.userId, userId)));
}

// ==================== FIXED EXPENSE QUERIES ====================
export async function createFixedExpense(data: InsertFixedExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fixedExpenses).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getFixedExpensesByUser(userId: number, scope?: "personal" | "professional") {
  const db = await getDb();
  if (!db) return [];
  let conditions = [eq(fixedExpenses.userId, userId), eq(fixedExpenses.isActive, true)];
  if (scope) conditions.push(eq(fixedExpenses.scope, scope));
  return db.select().from(fixedExpenses).where(and(...conditions));
}

export async function updateFixedExpense(id: number, userId: number, data: Partial<InsertFixedExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fixedExpenses).set(data).where(and(eq(fixedExpenses.id, id), eq(fixedExpenses.userId, userId)));
}

export async function deleteFixedExpense(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fixedExpenses).set({ isActive: false }).where(and(eq(fixedExpenses.id, id), eq(fixedExpenses.userId, userId)));
}

export async function upsertFixedExpensePayment(data: InsertFixedExpensePayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(fixedExpensePayments)
    .where(and(
      eq(fixedExpensePayments.fixedExpenseId, data.fixedExpenseId),
      eq(fixedExpensePayments.month, data.month),
      eq(fixedExpensePayments.year, data.year)
    )).limit(1);
  if (existing.length > 0) {
    await db.update(fixedExpensePayments).set({ isPaid: data.isPaid, paidAt: data.paidAt, paidAmount: data.paidAmount, receiptUrl: data.receiptUrl })
      .where(eq(fixedExpensePayments.id, existing[0].id));
    return existing[0];
  }
  const result = await db.insert(fixedExpensePayments).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getFixedExpensePayments(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedExpensePayments)
    .where(and(eq(fixedExpensePayments.userId, userId), eq(fixedExpensePayments.month, month), eq(fixedExpensePayments.year, year)));
}

// ==================== BUDGET QUERIES ====================
export async function createBudget(data: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(budgets).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getBudgetsByUser(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).where(and(eq(budgets.userId, userId), eq(budgets.year, year)));
}

export async function updateBudget(id: number, userId: number, data: Partial<InsertBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(budgets).set(data).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}

// ==================== HABIT QUERIES ====================
export async function createHabit(data: InsertHabit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(habits).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getHabitsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(habits).where(and(eq(habits.userId, userId), eq(habits.isActive, true)));
}

export async function updateHabit(id: number, userId: number, data: Partial<InsertHabit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(habits).set(data).where(and(eq(habits.id, id), eq(habits.userId, userId)));
}

export async function deleteHabit(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(habits).set({ isActive: false }).where(and(eq(habits.id, id), eq(habits.userId, userId)));
}

export async function createHabitLog(data: InsertHabitLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(habitLogs).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getHabitLogs(habitId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), gte(habitLogs.date, startDate), lte(habitLogs.date, endDate)));
}

export async function getHabitLogsByUser(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), gte(habitLogs.date, startDate), lte(habitLogs.date, endDate)));
}

export async function upsertHabitLog(data: InsertHabitLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(habitLogs)
    .where(and(eq(habitLogs.habitId, data.habitId), eq(habitLogs.date, data.date))).limit(1);
  if (existing.length > 0) {
    await db.update(habitLogs).set({ value: data.value, completed: data.completed, notes: data.notes })
      .where(eq(habitLogs.id, existing[0].id));
    return existing[0];
  }
  const result = await db.insert(habitLogs).values(data);
  return { id: Number(result[0].insertId), ...data };
}

// ==================== DASHBOARD QUERIES ====================
export async function getDashboardStats(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get variable expenses for the month
  const monthExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(variableExpenses)
    .where(and(eq(variableExpenses.userId, userId), gte(variableExpenses.date, startOfMonth), lte(variableExpenses.date, endOfMonth)));

  // Get today's tasks (nova estrutura: tarefas únicas com status)
  // Comparar usando range de timestamps (início e fim do dia)
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  // Buscar todas as tarefas do usuário e filtrar em memória
  // (workaround temporário para evitar problemas de timezone/tipo)
  const allTasks = await db.select().from(tasks)
    .where(eq(tasks.userId, userId));
  
  const todayTasks = allTasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= todayStart && taskDate <= todayEnd;
  });
  
  console.log("[getDashboardStats] Filtered", todayTasks.length, "tasks for today from", allTasks.length, "total tasks");
  
  const completedToday = todayTasks.filter(t => t.status === "done").length;
  const totalDailyTasks = todayTasks.length;

  // Get habits completion
  const habitsList = await getHabitsByUser(userId);
  const habitLogsToday = await db.select().from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), gte(habitLogs.date, today), lte(habitLogs.date, tomorrow)));
  
  const habitsCompleted = habitLogsToday.filter(h => h.completed).length;

  return {
    monthlyExpenses: parseFloat(monthExpenses[0]?.total || "0"),
    tasksToday: { completed: completedToday, total: totalDailyTasks },
    habitsToday: { completed: habitsCompleted, total: habitsList.length }
  };
}

export async function getExpensesByCategory(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  return db.select({
    categoryId: variableExpenses.categoryId,
    categoryName: categories.name,
    categoryColor: categories.color,
    total: sql<string>`SUM(${variableExpenses.amount})`
  }).from(variableExpenses)
    .leftJoin(categories, eq(variableExpenses.categoryId, categories.id))
    .where(and(eq(variableExpenses.userId, userId), gte(variableExpenses.date, startOfMonth), lte(variableExpenses.date, endOfMonth)))
    .groupBy(variableExpenses.categoryId, categories.name, categories.color);
}

export async function getMonthlyExpenseTrend(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = [];
  for (let month = 1; month <= 12; month++) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    // Despesas Variáveis
    const totalVariableExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(variableExpenses)
      .where(and(eq(variableExpenses.userId, userId), gte(variableExpenses.date, startOfMonth), lte(variableExpenses.date, endOfMonth)));
    
    const personalVariableExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(variableExpenses)
      .where(and(
        eq(variableExpenses.userId, userId), 
        eq(variableExpenses.scope, "personal"),
        gte(variableExpenses.date, startOfMonth), 
        lte(variableExpenses.date, endOfMonth)
      ));
    
    const professionalVariableExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(variableExpenses)
      .where(and(
        eq(variableExpenses.userId, userId), 
        eq(variableExpenses.scope, "professional"),
        gte(variableExpenses.date, startOfMonth), 
        lte(variableExpenses.date, endOfMonth)
      ));
    
    // Despesas Fixas Ativas (aparecem todos os meses independente de pagamento)
    const totalFixedExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(fixedExpenses)
      .where(and(
        eq(fixedExpenses.userId, userId),
        eq(fixedExpenses.isActive, true)
      ));
    
    const personalFixedExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(fixedExpenses)
      .where(and(
        eq(fixedExpenses.userId, userId),
        eq(fixedExpenses.isActive, true),
        eq(fixedExpenses.scope, "personal")
      ));
    
    const professionalFixedExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(fixedExpenses)
      .where(and(
        eq(fixedExpenses.userId, userId),
        eq(fixedExpenses.isActive, true),
        eq(fixedExpenses.scope, "professional")
      ));
    
    const totalVariable = parseFloat(totalVariableExpenses[0]?.total || "0");
    const totalFixed = parseFloat(totalFixedExpenses[0]?.total || "0");
    const personalVariable = parseFloat(personalVariableExpenses[0]?.total || "0");
    const personalFixed = parseFloat(personalFixedExpenses[0]?.total || "0");
    const professionalVariable = parseFloat(professionalVariableExpenses[0]?.total || "0");
    const professionalFixed = parseFloat(professionalFixedExpenses[0]?.total || "0");
    
    results.push({ 
      month, 
      total: totalVariable + totalFixed,
      personal: personalVariable + personalFixed,
      professional: professionalVariable + professionalFixed
    });
  }
  return results;
}


// ==================== CONTACT QUERIES ====================
import { contacts, InsertContact, kanbanCardChecklists, InsertKanbanCardChecklist } from "../drizzle/schema";

export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contacts).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getContactsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(asc(contacts.name));
}

export async function updateContact(id: number, userId: number, data: Partial<InsertContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contacts).set(data).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function deleteContact(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function getContactByEmail(userId: number, email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contacts).where(and(eq(contacts.userId, userId), eq(contacts.email, email))).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== KANBAN CHECKLIST QUERIES ====================
export async function createKanbanChecklist(data: InsertKanbanCardChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kanbanCardChecklists).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getKanbanChecklists(cardId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(kanbanCardChecklists).where(eq(kanbanCardChecklists.cardId, cardId)).orderBy(asc(kanbanCardChecklists.position));
}

export async function updateKanbanChecklist(id: number, data: Partial<InsertKanbanCardChecklist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(kanbanCardChecklists).set(data).where(eq(kanbanCardChecklists.id, id));
}

export async function deleteKanbanChecklist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(kanbanCardChecklists).where(eq(kanbanCardChecklists.id, id));
}

// ==================== KANBAN CARD COMMENTS QUERIES ====================
export async function createKanbanComment(data: InsertKanbanCardComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kanbanCardComments).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getKanbanComments(cardId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: kanbanCardComments.id,
    cardId: kanbanCardComments.cardId,
    userId: kanbanCardComments.userId,
    content: kanbanCardComments.content,
    createdAt: kanbanCardComments.createdAt,
    userName: users.name,
    userEmail: users.email
  }).from(kanbanCardComments)
    .leftJoin(users, eq(kanbanCardComments.userId, users.id))
    .where(eq(kanbanCardComments.cardId, cardId))
    .orderBy(desc(kanbanCardComments.createdAt));
}

export async function deleteKanbanComment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(kanbanCardComments).where(and(eq(kanbanCardComments.id, id), eq(kanbanCardComments.userId, userId)));
}

// ==================== MOVE KANBAN CARD ====================
export async function moveKanbanCard(cardId: number, newColumnId: number, newPosition: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(kanbanCards).set({ columnId: newColumnId, position: newPosition }).where(eq(kanbanCards.id, cardId));
}


// ==================== MANAGED USERS QUERIES ====================
import { managedUsers, InsertManagedUser, systemSettings, InsertSystemSetting, sales, InsertSale, analysisHistory, InsertAnalysisHistory, notifications, InsertNotification } from "../drizzle/schema";

export async function createManagedUser(data: InsertManagedUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(managedUsers).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getManagedUsersByAdmin(adminUserId: number) {
  const db = await getDb();
  if (!db) return [];
  // CEO e Master veem todos os usuários, sem filtro por createdByUserId
  return db.select({
    id: managedUsers.id,
    username: managedUsers.username,
    firstName: managedUsers.firstName,
    lastName: managedUsers.lastName,
    email: managedUsers.email,
    phoneBR: managedUsers.phoneBR,
    phoneUS: managedUsers.phoneUS,
    role: managedUsers.role,
    isActive: managedUsers.isActive,
    lastLogin: managedUsers.lastLogin,
    createdAt: managedUsers.createdAt
  }).from(managedUsers).orderBy(desc(managedUsers.createdAt));
}

export async function getManagedUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(managedUsers).where(eq(managedUsers.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[getManagedUserByEmail] Error:', error);
    // Fallback: usar SQL raw se Drizzle falhar
    const connection = await import('mysql2/promise');
    const conn = await connection.createConnection(ENV.databaseUrl);
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM managed_users WHERE email = ? LIMIT 1',
        [email]
      );
      await conn.end();
      return (rows as any[]).length > 0 ? (rows as any[])[0] : null;
    } catch (fallbackError) {
      console.error('[getManagedUserByEmail] Fallback error:', fallbackError);
      await conn.end();
      return null;
    }
  }
}

export async function getManagedUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(managedUsers).where(eq(managedUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function searchManagedUsers(query: string, adminUserId: number) {
  const db = await getDb();
  if (!db) return [];
  const searchTerm = `%${query.toLowerCase()}%`;
  return db.select({
    id: managedUsers.id,
    username: managedUsers.username,
    firstName: managedUsers.firstName,
    lastName: managedUsers.lastName,
    email: managedUsers.email
  }).from(managedUsers)
    .where(
      and(
        eq(managedUsers.isActive, true),
        or(
          sql`LOWER(${managedUsers.username}) LIKE ${searchTerm}`,
          sql`LOWER(${managedUsers.firstName}) LIKE ${searchTerm}`,
          sql`LOWER(${managedUsers.lastName}) LIKE ${searchTerm}`,
          sql`LOWER(${managedUsers.email}) LIKE ${searchTerm}`
        )
      )
    )
    .limit(10);
}

export async function getAllActiveManagedUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: managedUsers.id,
    username: managedUsers.username,
    firstName: managedUsers.firstName,
    lastName: managedUsers.lastName
  }).from(managedUsers).where(eq(managedUsers.isActive, true));
}

export async function updateManagedUser(id: number, adminUserId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // CEO e Master podem editar qualquer usuário
  try {
    await db.update(managedUsers).set(data).where(eq(managedUsers.id, id));
  } catch (error) {
    console.error('[updateManagedUser] Drizzle error, using fallback SQL:', error);
    const connection = await import('mysql2/promise');
    const conn = await connection.createConnection(ENV.databaseUrl);
    try {
      const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const values = Object.values(data);
      await conn.execute(
        `UPDATE managed_users SET ${fields} WHERE id = ?`,
        [...values, id]
      );
      await conn.end();
    } catch (fallbackError) {
      console.error('[updateManagedUser] Fallback error:', fallbackError);
      await conn.end();
      throw fallbackError;
    }
  }
}

export async function deleteManagedUser(id: number, adminUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // CEO e Master podem deletar qualquer usuário
  await db.delete(managedUsers).where(eq(managedUsers.id, id));
}

export async function updateManagedUserLogin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(managedUsers).set({ lastLogin: new Date() }).where(eq(managedUsers.id, id));
}

// ==================== SYSTEM SETTINGS QUERIES ====================
export async function getSetting(userId: number, key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemSettings).where(and(eq(systemSettings.userId, userId), eq(systemSettings.settingKey, key))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertSetting(userId: number, key: string, value: string, isEncrypted: boolean = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSetting(userId, key);
  if (existing) {
    await db.update(systemSettings).set({ settingValue: value, isEncrypted }).where(eq(systemSettings.id, existing.id));
    return existing;
  }
  const result = await db.insert(systemSettings).values({ userId, settingKey: key, settingValue: value, isEncrypted });
  return { id: Number(result[0].insertId), userId, settingKey: key, settingValue: value, isEncrypted };
}

export async function getAllSettings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(systemSettings).where(eq(systemSettings.userId, userId));
}

// ==================== SALES/REVENUE QUERIES ====================
export async function createSale(data: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sales).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getSalesByUser(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(sales).where(eq(sales.userId, userId));
  if (startDate && endDate) {
    return db.select().from(sales).where(and(eq(sales.userId, userId), gte(sales.date, startDate), lte(sales.date, endDate))).orderBy(desc(sales.date));
  }
  return db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.date));
}

export async function getSalesByMonth(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return db.select().from(sales).where(and(eq(sales.userId, userId), gte(sales.date, startOfMonth), lte(sales.date, endOfMonth))).orderBy(desc(sales.date));
}

export async function getDailySalesSplit(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  
  const results = await db.select({
    date: sales.date,
    total: sql<string>`SUM(${sales.amount})`
  }).from(sales)
    .where(and(eq(sales.userId, userId), eq(sales.status, "completed"), gte(sales.date, startOfMonth), lte(sales.date, endOfMonth)))
    .groupBy(sql`DATE(${sales.date})`)
    .orderBy(asc(sales.date));
  
  return results.map(r => ({ date: r.date, total: parseFloat(r.total || "0") }));
}

export async function getMonthlyRevenue(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = [];
  for (let month = 1; month <= 12; month++) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    const totalRevenue = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(sales)
      .where(and(eq(sales.userId, userId), eq(sales.status, "completed"), gte(sales.date, startOfMonth), lte(sales.date, endOfMonth)));
    
    results.push({ month, total: parseFloat(totalRevenue[0]?.total || "0") });
  }
  return results;
}

export async function updateSale(id: number, userId: number, data: Partial<InsertSale>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sales).set(data).where(and(eq(sales.id, id), eq(sales.userId, userId)));
}

export async function deleteSale(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sales).where(and(eq(sales.id, id), eq(sales.userId, userId)));
}

// ==================== ANALYSIS HISTORY QUERIES ====================
export async function saveAnalysisHistory(data: InsertAnalysisHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analysisHistory).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getAnalysisHistory(userId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analysisHistory).where(eq(analysisHistory.userId, userId)).orderBy(desc(analysisHistory.createdAt)).limit(limit);
}

export async function getLatestAnalysis(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(analysisHistory).where(eq(analysisHistory.userId, userId)).orderBy(desc(analysisHistory.createdAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== NOTIFICATIONS QUERIES ====================
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getNotificationsByUser(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (unreadOnly) {
    return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))).orderBy(desc(notifications.createdAt));
  }
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function deleteNotification(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

// ==================== EXPENSE DUE NOTIFICATIONS ====================
export async function getUpcomingFixedExpenses(userId: number, daysAhead: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  // Get active fixed expenses
  const expenses = await db.select().from(fixedExpenses).where(and(eq(fixedExpenses.userId, userId), eq(fixedExpenses.isActive, true)));
  
  // Filter expenses due within daysAhead
  const upcoming = [];
  for (const expense of expenses) {
    const dueDay = expense.dueDay;
    let dueDate: Date;
    
    if (dueDay >= currentDay) {
      dueDate = new Date(currentYear, currentMonth - 1, dueDay);
    } else {
      // Due next month
      dueDate = new Date(currentYear, currentMonth, dueDay);
    }
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue >= 0 && daysUntilDue <= daysAhead) {
      // Check if already paid this month
      const payment = await db.select().from(fixedExpensePayments)
        .where(and(
          eq(fixedExpensePayments.fixedExpenseId, expense.id),
          eq(fixedExpensePayments.month, dueDate.getMonth() + 1),
          eq(fixedExpensePayments.year, dueDate.getFullYear()),
          eq(fixedExpensePayments.isPaid, true)
        )).limit(1);
      
      if (payment.length === 0) {
        upcoming.push({ ...expense, dueDate, daysUntilDue });
      }
    }
  }
  
  return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export async function generateExpenseNotifications(userId: number) {
  const upcoming = await getUpcomingFixedExpenses(userId, 7);
  const createdNotifications = [];
  
  for (const expense of upcoming) {
    // Check if notification already exists for this expense this month
    const db = await getDb();
    if (!db) continue;
    
    const existing = await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, "expense_due"),
        eq(notifications.relatedId, expense.id),
        gte(notifications.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      )).limit(1);
    
    if (existing.length === 0) {
      const notification = await createNotification({
        userId,
        type: "expense_due",
        title: `Despesa próxima do vencimento`,
        message: `A despesa "${expense.description}" de R$ ${expense.amount} vence em ${expense.daysUntilDue} dia(s) (dia ${expense.dueDay}).`,
        relatedId: expense.id,
        relatedType: "fixed_expense"
      });
      createdNotifications.push(notification);
    }
  }
  
  return createdNotifications;
}

// ==================== PROFIT CALCULATION ====================
export async function getMonthlyProfitLoss(userId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  
  // Total revenue (from revenues table, not sales)
  const revenueResult = await db.select({ total: sql<string>`COALESCE(SUM(value), 0)` })
    .from(revenues)
    .where(and(eq(revenues.userId, userId), gte(revenues.date, startOfMonth), lte(revenues.date, endOfMonth)));
  
  // Variable expenses
  const variableResult = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(variableExpenses)
    .where(and(eq(variableExpenses.userId, userId), gte(variableExpenses.date, startOfMonth), lte(variableExpenses.date, endOfMonth)));
  
  // Fixed expenses (all active fixed expenses are recurring monthly)
  const fixedResult = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(fixedExpenses)
    .where(and(
      eq(fixedExpenses.userId, userId), 
      eq(fixedExpenses.isActive, true)
    ));
  
  const revenue = parseFloat(revenueResult[0]?.total || "0");
  const variableExpensesTotal = parseFloat(variableResult[0]?.total || "0");
  const fixedExpensesTotal = parseFloat(fixedResult[0]?.total || "0");
  const totalExpenses = variableExpensesTotal + fixedExpensesTotal;
  const profit = revenue - totalExpenses;
  
  return {
    revenue,
    variableExpenses: variableExpensesTotal,
    fixedExpenses: fixedExpensesTotal,
    totalExpenses,
    profit,
    profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
  };
}

export async function updateManagedUserLastLogin(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(managedUsers).set({ lastLogin: new Date() }).where(eq(managedUsers.id, userId));
}

export async function searchManagedUsersByUsername(adminUserId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: managedUsers.id,
    username: managedUsers.username,
    firstName: managedUsers.firstName,
    lastName: managedUsers.lastName
  }).from(managedUsers)
    .where(and(
      eq(managedUsers.createdByUserId, adminUserId),
      eq(managedUsers.isActive, true),
      like(managedUsers.username, `%${query}%`)
    ))
    .limit(10);
}

export async function getKanbanCardById(cardId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: kanbanCards.id,
    boardId: kanbanCards.boardId,
    columnId: kanbanCards.columnId,
    title: kanbanCards.title
  }).from(kanbanCards).where(eq(kanbanCards.id, cardId)).limit(1);
  return result[0] || null;
}


// ==================== ROLES & PERMISSIONS ====================
export async function getRolesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
}

export async function getPermissionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .selectDistinct({
      id: permissions.id,
      name: permissions.name,
      category: permissions.category,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));
}

export async function hasPermission(userId: number, permissionName: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .selectDistinct({ id: permissions.id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(userRoles.userId, userId), eq(permissions.name, permissionName)))
    .limit(1);

  return result.length > 0;
}

export async function assignRoleToUser(userId: number, roleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already assigned
  const existing = await db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(userRoles).values({ userId, roleId });
  }
}

export async function removeRoleFromUser(userId: number, roleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
}

export async function getAllRoles() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(roles);
}

export async function createAuditLog(
  userId: number,
  action: string,
  resource: string,
  resourceId?: number,
  details?: string,
  ipAddress?: string,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLog).values({
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  });
}

export async function getAuditLogs(userId?: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  if (userId) {
    return await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);
  }

  return await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

// ==================== SESSIONS (MULTI-LOGIN) ====================
export async function createSession(userId: number, token: string, ipAddress?: string, userAgent?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
  });

  return token;
}

export async function getSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())))
    .orderBy(desc(sessions.lastActivityAt));
}

export async function deleteSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function updateSessionActivity(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sessions).set({ lastActivityAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function deleteExpiredSessions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}


// ==================== KANBAN PERMISSIONS ====================
export async function checkKanbanPermission(boardId: number, userId: number): Promise<"owner" | "editor" | "viewer" | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Verificar se o usuário é membro do board
  const member = await db.select({
    role: kanbanBoardMembers.role
  }).from(kanbanBoardMembers).where(and(
    eq(kanbanBoardMembers.boardId, boardId),
    eq(kanbanBoardMembers.userId, userId)
  )).limit(1);
  
  if (member.length > 0) {
    return member[0].role;
  }
  
  // Verificar se o usuário é o dono do board
  const board = await db.select({
    userId: kanbanBoards.userId
  }).from(kanbanBoards).where(eq(kanbanBoards.id, boardId)).limit(1);
  
  if (board.length > 0 && board[0].userId === userId) {
    return "owner";
  }
  
  return null;
}

export async function hasKanbanPermission(boardId: number, userId: number, requiredRole: "owner" | "editor" | "viewer"): Promise<boolean> {
  const permission = await checkKanbanPermission(boardId, userId);
  if (!permission) return false;
  
  // owner > editor > viewer
  const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
  return roleHierarchy[permission] >= roleHierarchy[requiredRole];
}

export async function updateKanbanBoardMemberRole(boardId: number, userId: number, role: "owner" | "editor" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(kanbanBoardMembers).set({ role }).where(and(
    eq(kanbanBoardMembers.boardId, boardId),
    eq(kanbanBoardMembers.userId, userId)
  ));
}

export async function getSharedKanbanBoardsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Retornar kanban boards compartilhados com o usuário
  return db.select({
    id: kanbanBoards.id,
    title: kanbanBoards.title,
    description: kanbanBoards.description,
    userId: kanbanBoards.userId,
    visibility: kanbanBoards.visibility,
    scope: kanbanBoards.scope,
    role: kanbanBoardMembers.role
  }).from(kanbanBoards)
    .innerJoin(kanbanBoardMembers, eq(kanbanBoards.id, kanbanBoardMembers.boardId))
    .where(eq(kanbanBoardMembers.userId, userId))
    .orderBy(desc(kanbanBoards.createdAt));
}


// ==================== PASSWORD RESET TOKENS ====================
export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
    used: false
  });
}

export async function getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(passwordResetTokens)
    .set({ 
      used: true, 
      usedAt: new Date() 
    })
    .where(eq(passwordResetTokens.id, tokenId));
}

export async function deleteExpiredPasswordResetTokens(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));
}

export async function deletePasswordResetTokensByUserId(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));
}


// ==================== CLIENTS ====================
export async function getClientsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clients).where(eq(clients.userId, userId));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return Number(result[0].insertId);
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function getClientByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(eq(clients.telefone, phone)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Deletar sites do cliente primeiro
  await db.delete(clientSites).where(eq(clientSites.clientId, id));
  // Deletar cliente
  await db.delete(clients).where(eq(clients.id, id));
}

// ==================== CLIENT SITES ====================
export async function getSitesByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clientSites).where(eq(clientSites.clientId, clientId));
}

export async function getSiteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientSites).where(eq(clientSites.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createClientSite(data: InsertClientSite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clientSites).values(data);
  return Number(result[0].insertId);
}

export async function updateClientSite(id: number, data: Partial<InsertClientSite>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clientSites).set(data).where(eq(clientSites.id, id));
}

export async function deleteClientSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clientSites).where(eq(clientSites.id, id));
}

// ==================== EXPIRATION ALERTS ====================
export async function getExpiringItemsByUser(userId: number, daysAhead: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  // Buscar todos os clientes do usuário
  const userClients = await db.select().from(clients).where(eq(clients.userId, userId));
  const clientIds = userClients.map(c => c.id);
  
  if (clientIds.length === 0) return [];
  
  // Buscar sites com expiração próxima
  const expiringSites = await db
    .select({
      id: clientSites.id,
      clientId: clientSites.clientId,
      siteDominio: clientSites.siteDominio,
      expiracaoDominio: clientSites.expiracaoDominio,
      inicioPlano: clientSites.inicioPlano,
      plano: clientSites.plano,
      clientName: clients.name,
    })
    .from(clientSites)
    .innerJoin(clients, eq(clientSites.clientId, clients.id))
    .where(
      and(
        inArray(clientSites.clientId, clientIds),
        or(
          and(
            gte(clientSites.expiracaoDominio, now),
            lte(clientSites.expiracaoDominio, futureDate)
          ),
          and(
            gte(clientSites.inicioPlano, now),
            lte(clientSites.inicioPlano, futureDate)
          )
        )
      )
    );
  
  return expiringSites;
}

// ==================== REVENUES (Faturamento) ====================
export async function getRevenuesByUser(userId: number, filters?: {
  startDate?: string;
  endDate?: string;
  revenueType?: 'pessoal' | 'empresa';
  currency?: 'BRL' | 'USD';
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(revenues.userId, userId)];
  
  if (filters?.startDate) {
    conditions.push(gte(revenues.date, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte(revenues.date, new Date(filters.endDate)));
  }
  if (filters?.revenueType) {
    conditions.push(eq(revenues.revenueType, filters.revenueType));
  }
  if (filters?.currency) {
    conditions.push(eq(revenues.currency, filters.currency));
  }
  
  return await db.select().from(revenues).where(and(...conditions)).orderBy(desc(revenues.date));
}

export async function getRevenueById(id: number) {
  const db = await getDb();
  if (!db) return null;
  return await db.select().from(revenues).where(eq(revenues.id, id)).limit(1).then(rows => rows[0] || null);
}

export async function createRevenue(data: InsertRevenue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(revenues).values(data);
  return result[0].insertId;
}

export async function updateRevenue(id: number, data: Partial<InsertRevenue>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(revenues).set(data).where(eq(revenues.id, id));
}

export async function deleteRevenue(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(revenues).where(eq(revenues.id, id));
}

export async function getRevenueTotalsByTypeAndCurrency(userId: number, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(revenues.userId, userId)];
  
  if (filters?.startDate) {
    conditions.push(gte(revenues.date, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte(revenues.date, new Date(filters.endDate)));
  }
  
  return await db
    .select({
      revenueType: revenues.revenueType,
      currency: revenues.currency,
      total: sql<number>`SUM(${revenues.amount})`
    })
    .from(revenues)
    .where(and(...conditions))
    .groupBy(revenues.revenueType, revenues.currency);
}
