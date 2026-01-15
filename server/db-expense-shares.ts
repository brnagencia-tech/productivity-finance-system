import { eq, and } from "drizzle-orm";
import { getDb } from "./db.js";
import { pendingExpenseShares, variableExpenses, fixedExpenses } from "../drizzle/schema.js";

// Criar despesa compartilhada pendente
export async function createPendingExpenseShare(data: {
  createdByUserId: number;
  sharedWithUserId: number;
  expenseType: "variable" | "fixed";
  description: string;
  amount: string;
  currency: "BRL" | "USD";
  category: "personal" | "company";
  date: Date;
}) {
  const db = await getDb();
  const [result] = await db!.insert(pendingExpenseShares).values({
    ...data,
    status: "pending",
  });
  return result;
}

// Listar despesas pendentes de um usuário
export async function getPendingExpenseShares(userId: number) {
  const db = await getDb();
  return db!
    .select()
    .from(pendingExpenseShares)
    .where(
      and(
        eq(pendingExpenseShares.sharedWithUserId, userId),
        eq(pendingExpenseShares.status, "pending")
      )
    );
}

// Aceitar despesa compartilhada
export async function acceptExpenseShare(shareId: number, userId: number) {
  const db = await getDb();
  
  // Buscar despesa pendente
  const [share] = await db!
    .select()
    .from(pendingExpenseShares)
    .where(eq(pendingExpenseShares.id, shareId));

  if (!share || share.sharedWithUserId !== userId) {
    throw new Error("Despesa não encontrada ou sem permissão");
  }

  // Criar despesa real para o usuário
  if (share.expenseType === "variable") {
    await db!.insert(variableExpenses).values({
      userId: share.sharedWithUserId,
      description: `${share.description} (compartilhado por usuário #${share.createdByUserId})`,
      amount: share.amount,
      currency: share.currency,
      expenseType: share.category === "personal" ? "pessoal" : "empresa",
      date: share.date,
      scope: "personal",
    });
  } else {
    await db!.insert(fixedExpenses).values({
      userId: share.sharedWithUserId,
      description: `${share.description} (compartilhado por usuário #${share.createdByUserId})`,
      amount: share.amount,
      currency: share.currency,
      expenseType: share.category === "personal" ? "pessoal" : "empresa",
      dueDay: new Date(share.date).getDate(),
    });
  }

  // Atualizar status para "accepted"
  await db!
    .update(pendingExpenseShares)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(pendingExpenseShares.id, shareId));

  return { success: true };
}

// Recusar despesa compartilhada
export async function rejectExpenseShare(shareId: number, userId: number) {
  const db = await getDb();
  
  const [share] = await db!
    .select()
    .from(pendingExpenseShares)
    .where(eq(pendingExpenseShares.id, shareId));

  if (!share || share.sharedWithUserId !== userId) {
    throw new Error("Despesa não encontrada ou sem permissão");
  }

  await db!
    .update(pendingExpenseShares)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(pendingExpenseShares.id, shareId));

  return { success: true };
}
