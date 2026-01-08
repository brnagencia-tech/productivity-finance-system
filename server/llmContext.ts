import * as db from "./db";

export interface LLMContextData {
  period: "today" | "week" | "month";
  productivity: {
    tasksCompleted: number;
    tasksTotal: number;
    habitsCompleted: number;
    habitsTotal: number;
    productivityScore: number;
  };
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
    topExpenseCategories: Array<{ category: string; amount: number }>;
  };
  summary: {
    date: string;
    dayOfWeek: string;
    insights: string[];
  };
}

export async function collectLLMContextData(userId: number, period: "today" | "week" | "month"): Promise<LLMContextData> {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Coletar dados de tarefas completadas
  const taskCompletions = await db.getTaskCompletionsByUser(userId, startDate, endDate);
  const tasksCompleted = taskCompletions.length;
  const tasks = await db.getTasksByUser(userId);
  const tasksTotal = tasks.length;

  // Coletar dados de hábitos completados
  const habitLogs = await db.getHabitLogsByUser(userId, startDate, endDate);
  const habitsCompleted = habitLogs.length;
  const habits = await db.getHabitsByUser(userId);
  const habitsTotal = habits.length;

  // Coletar dados financeiros
  const profitLoss = await db.getMonthlyProfitLoss(userId, now.getMonth() + 1, now.getFullYear());
  const revenue = profitLoss?.revenue || 0;
  const expenses = profitLoss?.totalExpenses || 0;
  const profit = profitLoss?.profit || 0;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Coletar categorias de despesas
  const expensesByCategory = await db.getExpensesByCategory(userId, now.getMonth() + 1, now.getFullYear());
  const topExpenseCategories = expensesByCategory
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
    .slice(0, 5)
    .map(e => ({ category: e.categoryName || "Sem categoria", amount: parseFloat(e.total) }));

  // Calcular score de produtividade
  const productivityScore = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  // Gerar insights iniciais
  const insights: string[] = [];
  if (productivityScore === 100 && tasksTotal > 0) {
    insights.push("Excelente produtividade! Todas as tarefas foram concluídas.");
  }
  if (profit < 0) {
    insights.push("Atenção: Prejuízo no período. Revise seus gastos.");
  }
  if (habitsCompleted === 0 && habitsTotal > 0) {
    insights.push("Nenhum hábito foi completado. Tente manter a consistência.");
  }

  const dayOfWeek = now.toLocaleDateString("pt-BR", { weekday: "long" });
  const dateStr = now.toLocaleDateString("pt-BR");

  return {
    period,
    productivity: {
      tasksCompleted,
      tasksTotal,
      habitsCompleted,
      habitsTotal,
      productivityScore
    },
    financial: {
      revenue,
      expenses,
      profit,
      profitMargin,
      topExpenseCategories
    },
    summary: {
      date: dateStr,
      dayOfWeek,
      insights
    }
  };
}

export function formatContextForLLM(data: LLMContextData): string {
  const { period, productivity, financial, summary } = data;

  return `
# Contexto de Dados para Análise - ${summary.date} (${summary.dayOfWeek})

## Período: ${period === "today" ? "Hoje" : period === "week" ? "Última Semana" : "Este Mês"}

## Produtividade
- Tarefas Concluídas: ${productivity.tasksCompleted}/${productivity.tasksTotal} (${productivity.productivityScore.toFixed(1)}%)
- Hábitos Completados: ${productivity.habitsCompleted}/${productivity.habitsTotal}
- Score de Produtividade: ${productivity.productivityScore.toFixed(1)}%

## Financeiro
- Receita: R$ ${financial.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Despesas: R$ ${financial.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Lucro: R$ ${financial.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Margem de Lucro: ${financial.profitMargin.toFixed(1)}%

## Categorias de Despesas (Top 5)
${financial.topExpenseCategories.map(e => `- ${e.category}: R$ ${e.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join("\n")}

## Insights Iniciais
${summary.insights.map(i => `- ${i}`).join("\n")}

Por favor, analise esses dados e forneça sugestões personalizadas para melhorar a produtividade e a saúde financeira.
  `.trim();
}
