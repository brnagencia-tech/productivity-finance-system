import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(), // @username like Instagram
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
  // Novos campos para controle de gastos
  expenseType: mysqlEnum("expenseType", ["pessoal", "compartilhado", "empresa"]).default("pessoal").notNull(),
  currency: mysqlEnum("currency", ["BRL", "USD"]).default("BRL").notNull(),
  location: mysqlEnum("location", ["BRN", "USA"]).default("BRN"),
  sharedWith: json("sharedWith").$type<number[]>(), // Array de user IDs para gastos compartilhados
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


// ==================== MANAGED USERS (Usuários criados pelo admin) ====================
export const managedUsers = mysqlTable("managed_users", {
  id: int("id").autoincrement().primaryKey(),
  createdByUserId: int("createdByUserId").notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(), // @username like Instagram
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phoneBR: varchar("phoneBR", { length: 20 }),
  phoneUS: varchar("phoneUS", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["ceo", "master", "colaborador"]).default("colaborador").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ManagedUser = typeof managedUsers.$inferSelect;
export type InsertManagedUser = typeof managedUsers.$inferInsert;

// ==================== SYSTEM SETTINGS (Configurações do Sistema) ====================
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  settingKey: varchar("settingKey", { length: 100 }).notNull(),
  settingValue: text("settingValue"),
  isEncrypted: boolean("isEncrypted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// ==================== SALES/REVENUE (Vendas/Faturamento) ====================
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  description: varchar("description", { length: 500 }),
  company: varchar("company", { length: 255 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("completed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

// ==================== ANALYSIS HISTORY (Histórico de Análises) ====================
export const analysisHistory = mysqlTable("analysis_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekStartDate: timestamp("weekStartDate").notNull(),
  weekEndDate: timestamp("weekEndDate").notNull(),
  overallScore: int("overallScore").notNull(),
  taskCompletionRate: decimal("taskCompletionRate", { precision: 5, scale: 2 }),
  habitCompletionRate: decimal("habitCompletionRate", { precision: 5, scale: 2 }),
  totalExpenses: decimal("totalExpenses", { precision: 12, scale: 2 }),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }),
  expenseAnalysis: json("expenseAnalysis").$type<object>(),
  productivityAnalysis: json("productivityAnalysis").$type<object>(),
  recommendations: json("recommendations").$type<string[]>(),
  alerts: json("alerts").$type<string[]>(),
  motivationalMessage: text("motivationalMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type InsertAnalysisHistory = typeof analysisHistory.$inferInsert;

// ==================== NOTIFICATIONS ====================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["expense_due", "task_reminder", "habit_reminder", "analysis_ready", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: int("relatedId"),
  relatedType: varchar("relatedType", { length: 50 }),
  isRead: boolean("isRead").default(false).notNull(),
  scheduledFor: timestamp("scheduledFor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


// ==================== ROLES E PERMISSÕES ====================
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // admin, manager, user, viewer
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // tasks.create, tasks.edit, tasks.delete, etc
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // tasks, expenses, kanban, users, settings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

export const rolePermissions = mysqlTable("rolePermissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").notNull(),
  permissionId: int("permissionId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export const userRoles = mysqlTable("userRoles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  roleId: int("roleId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

// ==================== AUDITORIA ====================
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // create, update, delete, login, logout
  resource: varchar("resource", { length: 100 }).notNull(), // task, expense, user, kanban, etc
  resourceId: int("resourceId"),
  details: text("details"), // JSON string with details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// ==================== SESSÕES MULTI-LOGIN ====================
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;


// ==================== TRACKER ITEMS (Tarefas + Hábitos Unificados) ====================
export const trackerItems = mysqlTable("tracker_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["task", "habit"]).notNull(), // apenas para organização/labels
  group: mysqlEnum("group", ["personal", "professional", "health"]).default("personal").notNull(),
  targetPeriod: mysqlEnum("targetPeriod", ["daily", "weekly", "monthly"]).default("daily").notNull(),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }).default("1").notNull(), // ex: 8 (para água 8x/dia)
  unit: varchar("unit", { length: 50 }).default("check").notNull(), // check, liters, ml, times, etc
  activeDays: varchar("activeDays", { length: 50 }), // "1,2,3,4,5" para seg-sex, ou null para todos
  timeWindowStart: varchar("timeWindowStart", { length: 5 }), // "09:00" (HH:MM)
  timeWindowEnd: varchar("timeWindowEnd", { length: 5 }), // "18:00" (HH:MM)
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrackerItem = typeof trackerItems.$inferSelect;
export type InsertTrackerItem = typeof trackerItems.$inferInsert;

// ==================== TRACKER CHECK-INS (Marcações) ====================
export const trackerCheckins = mysqlTable("tracker_checkins", {
  id: int("id").autoincrement().primaryKey(),
  trackerItemId: int("trackerItemId").notNull(),
  userId: int("userId").notNull(),
  checkedAt: timestamp("checkedAt").notNull(), // timestamp real da marcação
  value: decimal("value", { precision: 10, scale: 2 }).default("1").notNull(), // 1 para check, 250 para ml, etc
  status: mysqlEnum("status", ["done", "skipped"]).default("done").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackerCheckin = typeof trackerCheckins.$inferSelect;
export type InsertTrackerCheckin = typeof trackerCheckins.$inferInsert;
