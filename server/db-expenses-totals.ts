import { getDb } from "./db";
import { variableExpenses, fixedExpenses } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Calcula totais de despesas (variáveis + fixas) agrupados por moeda
 * Para despesas fixas: considera todas as despesas ativas (isActive=true) multiplicadas pelo número de meses no período
 * Para despesas variáveis: soma todas as despesas no período
 */
export async function getExpensesTotalsByCurrency(userId: number, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // Calcular número de meses no período para despesas fixas
  let monthsInPeriod = 1;
  if (filters?.startDate && filters?.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    monthsInPeriod = Math.max(1, Math.ceil(diffDays / 30)); // Aproximação de meses
  }
  
  // Buscar despesas variáveis agrupadas por moeda
  const variableConditions = [eq(variableExpenses.userId, userId)];
  if (filters?.startDate) {
    variableConditions.push(gte(variableExpenses.date, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    variableConditions.push(lte(variableExpenses.date, new Date(filters.endDate)));
  }
  
  const variableTotals = await db
    .select({
      currency: variableExpenses.currency,
      total: sql<number>`COALESCE(SUM(${variableExpenses.amount}), 0)`
    })
    .from(variableExpenses)
    .where(and(...variableConditions))
    .groupBy(variableExpenses.currency);
  
  // Buscar despesas fixas ativas agrupadas por moeda
  const fixedTotals = await db
    .select({
      currency: fixedExpenses.currency,
      total: sql<number>`COALESCE(SUM(${fixedExpenses.amount}), 0)`
    })
    .from(fixedExpenses)
    .where(and(
      eq(fixedExpenses.userId, userId),
      eq(fixedExpenses.isActive, true)
    ))
    .groupBy(fixedExpenses.currency);
  
  // Combinar totais por moeda
  const totalsMap = new Map<string, number>();
  
  // Adicionar despesas variáveis
  variableTotals.forEach(item => {
    const currency = item.currency || 'BRL';
    totalsMap.set(currency, (totalsMap.get(currency) || 0) + Number(item.total));
  });
  
  // Adicionar despesas fixas (multiplicadas pelo número de meses)
  fixedTotals.forEach(item => {
    const currency = item.currency || 'BRL';
    const fixedTotal = Number(item.total) * monthsInPeriod;
    totalsMap.set(currency, (totalsMap.get(currency) || 0) + fixedTotal);
  });
  
  // Converter mapa para array
  return Array.from(totalsMap.entries()).map(([currency, total]) => ({
    currency,
    total
  }));
}
