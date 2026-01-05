import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CATEGORIES ====================
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  type: mysqlEnum("type", ["expense", "task", "habit"]).notNull(),
  scope: mysqlEnum("scope", ["personal", "professional", "both"]).default("personal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ==================== TASKS (Monitor de Tarefas) ====================
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "as_needed"]).default("daily").notNull(),
  scope: mysqlEnum("scope", ["personal", "professional"]).default("personal").notNull(),
  assignedTo: int("assignedTo"),
  targetCompletionRate: int("targetCompletionRate").default(100),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ==================== TASK COMPLETIONS (Status diário) ====================
export const taskCompletions = mysqlTable("task_completions", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["done", "not_done", "in_progress"]).default("not_done").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = typeof taskCompletions.$inferInsert;

// ==================== KANBAN BOARDS ====================
export const kanbanBoards = mysqlTable("kanban_boards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  visibility: mysqlEnum("visibility", ["private", "shared", "public"]).default("private").notNull(),
  scope: mysqlEnum("scope", ["personal", "professional"]).default("personal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KanbanBoard = typeof kanbanBoards.$inferSelect;
export type InsertKanbanBoard = typeof kanbanBoards.$inferInsert;

// ==================== KANBAN BOARD MEMBERS ====================
export const kanbanBoardMembers = mysqlTable("kanban_board_members", {
  id: int("id").autoincrement().primaryKey(),
  boardId: int("boardId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KanbanBoardMember = typeof kanbanBoardMembers.$inferSelect;
export type InsertKanbanBoardMember = typeof kanbanBoardMembers.$inferInsert;

// ==================== KANBAN COLUMNS ====================
export const kanbanColumns = mysqlTable("kanban_columns", {
  id: int("id").autoincrement().primaryKey(),
  boardId: int("boardId").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  position: int("position").notNull(),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type InsertKanbanColumn = typeof kanbanColumns.$inferInsert;

// ==================== KANBAN CARDS ====================
export const kanbanCards = mysqlTable("kanban_cards", {
  id: int("id").autoincrement().primaryKey(),
  columnId: int("columnId").notNull(),
  boardId: int("boardId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assignedTo"),
  dueDate: timestamp("dueDate"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  position: int("position").notNull(),
  labels: json("labels").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KanbanCard = typeof kanbanCards.$inferSelect;
export type InsertKanbanCard = typeof kanbanCards.$inferInsert;

// ==================== KANBAN CARD COMMENTS ====================
export const kanbanCardComments = mysqlTable("kanban_card_comments", {
  id: int("id").autoincrement().primaryKey(),
  cardId: int("cardId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KanbanCardComment = typeof kanbanCardComments.$inferSelect;
export type InsertKanbanCardComment = typeof kanbanCardComments.$inferInsert;

// ==================== VARIABLE EXPENSES (Despesas Variáveis) ====================
export const variableExpenses = mysqlTable("variable_expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  date: timestamp("date").notNull(),
  company: varchar("company", { length: 255 }),
  description: varchar("description", { length: 500 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  receiptUrl: text("receiptUrl"),
  notes: text("notes"),
  scope: mysqlEnum("scope", ["personal", "professional"]).default("personal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VariableExpense = typeof variableExpenses.$inferSelect;
export type InsertVariableExpense = typeof variableExpenses.$inferInsert;

// ==================== FIXED EXPENSES (Despesas Fixas) ====================
export const fixedExpenses = mysqlTable("fixed_expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDay: int("dueDay").notNull(),
  scope: mysqlEnum("scope", ["personal", "professional"]).default("personal").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type InsertFixedExpense = typeof fixedExpenses.$inferInsert;

// ==================== FIXED EXPENSE PAYMENTS ====================
export const fixedExpensePayments = mysqlTable("fixed_expense_payments", {
  id: int("id").autoincrement().primaryKey(),
  fixedExpenseId: int("fixedExpenseId").notNull(),
  userId: int("userId").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  isPaid: boolean("isPaid").default(false).notNull(),
  paidAt: timestamp("paidAt"),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }),
  receiptUrl: text("receiptUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FixedExpensePayment = typeof fixedExpensePayments.$inferSelect;
export type InsertFixedExpensePayment = typeof fixedExpensePayments.$inferInsert;

// ==================== BUDGETS (Orçamentos) ====================
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  month: int("month").notNull(),
  year: int("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  scope: mysqlEnum("scope", ["personal", "professional", "both"]).default("both").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

// ==================== HABITS ====================
export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  frequency: mysqlEnum("frequency", ["daily", "weekly"]).default("daily").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

// ==================== HABIT LOGS ====================
export const habitLogs = mysqlTable("habit_logs", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  completed: boolean("completed").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = typeof habitLogs.$inferInsert;

// ==================== CONTACTS (Cadastro de Pessoas) ====================
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  linkedUserId: int("linkedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ==================== KANBAN CARD CHECKLISTS ====================
export const kanbanCardChecklists = mysqlTable("kanban_card_checklists", {
  id: int("id").autoincrement().primaryKey(),
  cardId: int("cardId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  position: int("position").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KanbanCardChecklist = typeof kanbanCardChecklists.$inferSelect;
export type InsertKanbanCardChecklist = typeof kanbanCardChecklists.$inferInsert;
