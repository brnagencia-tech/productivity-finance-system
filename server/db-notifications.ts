import { getDb } from "./db";
import { shareNotifications, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Criar notificação de compartilhamento
export async function createShareNotification(data: {
  userId: number;
  fromUserId: number;
  itemType: "task" | "habit";
  itemId: number;
  itemTitle: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [notification] = await db.insert(shareNotifications).values(data).$returningId();
  return notification;
}

// Listar notificações do usuário
export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const notifications = await db
    .select({
      id: shareNotifications.id,
      fromUserId: shareNotifications.fromUserId,
      fromUserName: users.name,
      fromUsername: users.username,
      itemType: shareNotifications.itemType,
      itemId: shareNotifications.itemId,
      itemTitle: shareNotifications.itemTitle,
      isRead: shareNotifications.isRead,
      createdAt: shareNotifications.createdAt,
    })
    .from(shareNotifications)
    .leftJoin(users, eq(shareNotifications.fromUserId, users.id))
    .where(eq(shareNotifications.userId, userId))
    .orderBy(desc(shareNotifications.createdAt))
    .limit(50); // Últimas 50 notificações

  return notifications;
}

// Contar notificações não lidas
export async function getUnreadCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: shareNotifications.id })
    .from(shareNotifications)
    .where(
      and(
        eq(shareNotifications.userId, userId),
        eq(shareNotifications.isRead, false)
      )
    );

  return result?.length || 0;
}

// Marcar notificação como lida
export async function markAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(shareNotifications)
    .set({ isRead: true })
    .where(
      and(
        eq(shareNotifications.id, notificationId),
        eq(shareNotifications.userId, userId)
      )
    );
}

// Marcar todas como lidas
export async function markAllAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(shareNotifications)
    .set({ isRead: true })
    .where(eq(shareNotifications.userId, userId));
}

// Deletar notificação
export async function deleteNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(shareNotifications)
    .where(
      and(
        eq(shareNotifications.id, notificationId),
        eq(shareNotifications.userId, userId)
      )
    );
}
