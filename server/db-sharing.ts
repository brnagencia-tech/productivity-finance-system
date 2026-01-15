import { getDb } from "./db";
import { users, managedUsers, tasks, habits, taskShares, habitShares } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ==================== USER HELPERS ====================
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Buscar em managedUsers (usuários gerenciados pelo sistema)
  const [user] = await db.select().from(managedUsers).where(eq(managedUsers.username, username)).limit(1);
  return user || null;
}

// ==================== TASK HELPERS ====================
export async function getTaskById(taskId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return task || null;
}

export async function createTaskShare(data: {
  taskId: number;
  sharedWithUserId: number;
  sharedByUserId: number;
  permission: "viewer" | "editor";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(taskShares).values(data);
  return result.insertId;
}

export async function deleteTaskShare(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(taskShares).where(
    and(
      eq(taskShares.taskId, taskId),
      eq(taskShares.sharedWithUserId, userId)
    )
  );
}

export async function getTaskShares(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const shares = await db
    .select({
      id: taskShares.id,
      userId: taskShares.sharedWithUserId,
      username: users.username,
      name: users.name,
      permission: taskShares.permission,
      createdAt: taskShares.createdAt,
    })
    .from(taskShares)
    .leftJoin(users, eq(taskShares.sharedWithUserId, users.id))
    .where(eq(taskShares.taskId, taskId));
  
  return shares;
}

// ==================== HABIT HELPERS ====================
export async function getHabitById(habitId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [habit] = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1);
  return habit || null;
}

export async function createHabitShare(data: {
  habitId: number;
  sharedWithUserId: number;
  sharedByUserId: number;
  permission: "viewer" | "editor";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(habitShares).values(data);
  return result.insertId;
}

export async function deleteHabitShare(habitId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(habitShares).where(
    and(
      eq(habitShares.habitId, habitId),
      eq(habitShares.sharedWithUserId, userId)
    )
  );
}

export async function getHabitShares(habitId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const shares = await db
    .select({
      id: habitShares.id,
      userId: habitShares.sharedWithUserId,
      username: users.username,
      name: users.name,
      permission: habitShares.permission,
      createdAt: habitShares.createdAt,
    })
    .from(habitShares)
    .leftJoin(users, eq(habitShares.sharedWithUserId, users.id))
    .where(eq(habitShares.habitId, habitId));
  
  return shares;
}
