import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  categories, InsertCategory, Category,
  tasks, InsertTask, Task,
  taskCompletions, InsertTaskCompletion, TaskCompletion,
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
  habitLogs, InsertHabitLog
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
  const result = await db.insert(tasks).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getTasksByUser(userId: number, scope?: "personal" | "professional") {
  const db = await getDb();
  if (!db) return [];
  if (scope) {
    return db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.scope, scope), eq(tasks.isActive, true)));
  }
  return db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.isActive, true)));
}

export async function updateTask(id: number, userId: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set({ isActive: false }).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

// ==================== TASK COMPLETION QUERIES ====================
export async function createTaskCompletion(data: InsertTaskCompletion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(taskCompletions).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getTaskCompletions(taskId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskCompletions)
    .where(and(eq(taskCompletions.taskId, taskId), gte(taskCompletions.date, startDate), lte(taskCompletions.date, endDate)));
}

export async function getTaskCompletionsByUser(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskCompletions)
    .where(and(eq(taskCompletions.userId, userId), gte(taskCompletions.date, startDate), lte(taskCompletions.date, endDate)));
}

export async function upsertTaskCompletion(data: InsertTaskCompletion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(taskCompletions)
    .where(and(eq(taskCompletions.taskId, data.taskId), eq(taskCompletions.date, data.date))).limit(1);
  if (existing.length > 0) {
    await db.update(taskCompletions).set({ status: data.status, notes: data.notes })
      .where(eq(taskCompletions.id, existing[0].id));
    return existing[0];
  }
  const result = await db.insert(taskCompletions).values(data);
  return { id: Number(result[0].insertId), ...data };
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

export async function addKanbanBoardMember(boardId: number, userId: number, role: "owner" | "editor" | "viewer" = "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(kanbanBoardMembers).values({ boardId, userId, role });
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

  // Get today's tasks (only daily tasks count for today)
  const dailyTasks = await db.select().from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.isActive, true), eq(tasks.frequency, "daily")));
  
  const dailyTaskIds = dailyTasks.map(t => t.id);
  
  // Count only completions for daily tasks
  const todayCompletions = await db.select().from(taskCompletions)
    .where(and(eq(taskCompletions.userId, userId), gte(taskCompletions.date, today), lte(taskCompletions.date, tomorrow)));

  const completedToday = todayCompletions.filter(t => t.status === "done" && dailyTaskIds.includes(t.taskId)).length;
  const totalDailyTasks = dailyTasks.length;

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
    
    const totalExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(variableExpenses)
      .where(and(eq(variableExpenses.userId, userId), gte(variableExpenses.date, startOfMonth), lte(variableExpenses.date, endOfMonth)));
    
    const personalExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(variableExpenses)
      .where(and(
        eq(variableExpenses.userId, userId), 
        eq(variableExpenses.scope, "personal"),
        gte(variableExpenses.date, startOfMonth), 
        lte(variableExpenses.date, endOfMonth)
      ));
    
    const professionalExpenses = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(variableExpenses)
      .where(and(
        eq(variableExpenses.userId, userId), 
        eq(variableExpenses.scope, "professional"),
        gte(variableExpenses.date, startOfMonth), 
        lte(variableExpenses.date, endOfMonth)
      ));
    
    results.push({ 
      month, 
      total: parseFloat(totalExpenses[0]?.total || "0"),
      personal: parseFloat(personalExpenses[0]?.total || "0"),
      professional: parseFloat(professionalExpenses[0]?.total || "0")
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
