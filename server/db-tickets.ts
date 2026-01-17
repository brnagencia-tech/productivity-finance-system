import { getDb } from "./db";
import { supportTickets, supportTicketMessages, InsertSupportTicket, InsertSupportTicketMessage } from "../drizzle/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

// ==================== TICKET CRUD ====================
export async function createTicket(data: InsertSupportTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [ticket] = await db.insert(supportTickets).values(data).$returningId();
  return ticket.id;
}

export async function getTicketById(ticketId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  return ticket || null;
}

export async function listTickets(filters?: {
  status?: string;
  clientId?: number;
  assignedTo?: number;
  type?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(supportTickets);
  
  const conditions = [];
  if (filters?.status) conditions.push(eq(supportTickets.status, filters.status as any));
  if (filters?.clientId) conditions.push(eq(supportTickets.clientId, filters.clientId));
  if (filters?.assignedTo) conditions.push(eq(supportTickets.assignedTo, filters.assignedTo));
  if (filters?.type) conditions.push(eq(supportTickets.type, filters.type as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(supportTickets.createdAt));
}

export async function updateTicket(ticketId: number, data: Partial<InsertSupportTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supportTickets).set(data).where(eq(supportTickets.id, ticketId));
  return true;
}

export async function updateTicketStatus(ticketId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  
  // Se status for "resolvido", marcar timestamp
  if (status === "resolvido" || status === "fechado") {
    updateData.resolvedAt = new Date();
  }
  
  await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, ticketId));
  return true;
}

export async function deleteTicket(ticketId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Deletar mensagens primeiro
  await db.delete(supportTicketMessages).where(eq(supportTicketMessages.ticketId, ticketId));
  // Deletar ticket
  await db.delete(supportTickets).where(eq(supportTickets.id, ticketId));
  return true;
}

// ==================== TICKET MESSAGES ====================
export async function addTicketMessage(data: InsertSupportTicketMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [message] = await db.insert(supportTicketMessages).values(data).$returningId();
  
  // Se for a primeira resposta da equipe, marcar firstResponseAt
  if (!data.isFromClient) {
    const ticket = await getTicketById(data.ticketId);
    if (ticket && !ticket.firstResponseAt) {
      await db.update(supportTickets)
        .set({ firstResponseAt: new Date() })
        .where(eq(supportTickets.id, data.ticketId));
    }
  }
  
  return message.id;
}

export async function getTicketMessages(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(supportTicketMessages)
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(supportTicketMessages.createdAt);
}

// ==================== METRICS ====================
export async function getTicketMetrics() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    resolvidos: 0,
    tempoMedio: "0h 0m",
    escaladosDev: 0
  };
  
  // Total de tickets
  const [totalResult] = await db.select({ count: count() }).from(supportTickets);
  const total = totalResult?.count || 0;
  
  // Tickets resolvidos
  const [resolvidosResult] = await db.select({ count: count() })
    .from(supportTickets)
    .where(eq(supportTickets.status, "resolvido"));
  const resolvidos = resolvidosResult?.count || 0;
  
  // Tickets escalados para DEV
  const [devResult] = await db.select({ count: count() })
    .from(supportTickets)
    .where(eq(supportTickets.escalatedToDev, true));
  const escaladosDev = devResult?.count || 0;
  
  // Tempo médio de primeira resposta (em minutos)
  const ticketsComResposta = await db.select({
    createdAt: supportTickets.createdAt,
    firstResponseAt: supportTickets.firstResponseAt
  })
  .from(supportTickets)
  .where(sql`${supportTickets.firstResponseAt} IS NOT NULL`);
  
  let tempoMedioMinutos = 0;
  if (ticketsComResposta.length > 0) {
    const totalMinutos = ticketsComResposta.reduce((acc, ticket) => {
      if (ticket.firstResponseAt && ticket.createdAt) {
        const diff = ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
        return acc + (diff / 1000 / 60); // Converter para minutos
      }
      return acc;
    }, 0);
    tempoMedioMinutos = Math.round(totalMinutos / ticketsComResposta.length);
  }
  
  const horas = Math.floor(tempoMedioMinutos / 60);
  const minutos = tempoMedioMinutos % 60;
  const tempoMedio = `${horas}h ${minutos}m`;
  
  return {
    total,
    resolvidos,
    tempoMedio,
    escaladosDev
  };
}
