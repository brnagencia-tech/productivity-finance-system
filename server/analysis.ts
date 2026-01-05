import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { variableExpenses, fixedExpenses, tasks, taskCompletions, habits, habitLogs, categories } from "../drizzle/schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";

// Types for analysis results
export interface ExpenseAnalysis {
  summary: string;
  totalSpent: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  trends: string;
  recommendations: string[];
  alerts: string[];
}

export interface ProductivityAnalysis {
  summary: string;
  taskCompletionRate: number;
  habitCompletionRate: number;
  mostProductiveDays: string[];
  areasForImprovement: string[];
  achievements: string[];
  recommendations: string[];
}

export interface WeeklyInsights {
  expenses: ExpenseAnalysis;
  productivity: ProductivityAnalysis;
  overallScore: number;
  motivationalMessage: string;
  generatedAt: Date;
}

// Helper to get date range for last 7 days
function getWeekDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return { start, end };
}

// Helper to get date range for current month
function getMonthDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

// Collect expense data for analysis
export async function collectExpenseData(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { start, end } = getWeekDateRange();
  const { start: monthStart, end: monthEnd } = getMonthDateRange();

  // Get variable expenses for the week
  const weeklyExpenses = await db.select({
    id: variableExpenses.id,
    amount: variableExpenses.amount,
    description: variableExpenses.description,
    company: variableExpenses.company,
    date: variableExpenses.date,
    categoryId: variableExpenses.categoryId,
    scope: variableExpenses.scope
  })
    .from(variableExpenses)
    .where(and(
      eq(variableExpenses.userId, userId),
      gte(variableExpenses.date, start),
      lte(variableExpenses.date, end)
    ));

  // Get monthly expenses for comparison
  const monthlyExpenses = await db.select({
    id: variableExpenses.id,
    amount: variableExpenses.amount,
    categoryId: variableExpenses.categoryId,
    scope: variableExpenses.scope
  })
    .from(variableExpenses)
    .where(and(
      eq(variableExpenses.userId, userId),
      gte(variableExpenses.date, monthStart),
      lte(variableExpenses.date, monthEnd)
    ));

  // Get fixed expenses
  const fixedExpensesList = await db.select()
    .from(fixedExpenses)
    .where(eq(fixedExpenses.userId, userId));

  // Get categories for context
  const userCategories = await db.select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.type, "expense")));

  // Calculate totals
  const weeklyTotal = weeklyExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const fixedTotal = fixedExpensesList.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Group by category
  const byCategory: Record<string, number> = {};
  weeklyExpenses.forEach(e => {
    const cat = userCategories.find(c => c.id === e.categoryId);
    const catName = cat?.name || "Sem categoria";
    byCategory[catName] = (byCategory[catName] || 0) + parseFloat(e.amount);
  });

  // Group by scope (personal vs professional)
  const byType = {
    personal: weeklyExpenses.filter(e => e.scope === "personal").reduce((sum, e) => sum + parseFloat(e.amount), 0),
    professional: weeklyExpenses.filter(e => e.scope === "professional").reduce((sum, e) => sum + parseFloat(e.amount), 0)
  };

  return {
    weeklyExpenses,
    weeklyTotal,
    monthlyTotal,
    fixedTotal,
    byCategory,
    byType,
    categories: userCategories,
    fixedExpenses: fixedExpensesList
  };
}

// Collect productivity data for analysis
export async function collectProductivityData(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { start, end } = getWeekDateRange();

  // Get all active tasks
  const userTasks = await db.select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.isActive, true)));

  // Get task completions for the week
  const weeklyCompletions = await db.select()
    .from(taskCompletions)
    .where(and(
      eq(taskCompletions.userId, userId),
      gte(taskCompletions.date, start),
      lte(taskCompletions.date, end)
    ));

  // Get habits
  const userHabits = await db.select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, true)));

  // Get habit logs for the week
  const weeklyHabitLogs = await db.select()
    .from(habitLogs)
    .where(and(
      eq(habitLogs.userId, userId),
      gte(habitLogs.date, start),
      lte(habitLogs.date, end)
    ));

  // Calculate task completion rate
  const totalTaskCompletions = weeklyCompletions.length;
  const doneCompletions = weeklyCompletions.filter(c => c.status === "done").length;
  const taskCompletionRate = totalTaskCompletions > 0 ? (doneCompletions / totalTaskCompletions) * 100 : 0;

  // Calculate habit completion rate
  const totalHabitLogs = weeklyHabitLogs.length;
  const completedHabitLogs = weeklyHabitLogs.filter(h => h.completed).length;
  const habitCompletionRate = totalHabitLogs > 0 ? (completedHabitLogs / totalHabitLogs) * 100 : 0;

  // Group completions by day of week
  const completionsByDay: Record<string, number> = {};
  const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  weeklyCompletions.forEach(c => {
    if (c.status === "done") {
      const day = daysOfWeek[new Date(c.date).getDay()];
      completionsByDay[day] = (completionsByDay[day] || 0) + 1;
    }
  });

  // Group habits by completion
  const habitStats = userHabits.map(habit => {
    const logs = weeklyHabitLogs.filter(l => l.habitId === habit.id);
    const completed = logs.filter(l => l.completed).length;
    return {
      name: habit.name,
      target: habit.targetValue,
      unit: habit.unit,
      completedDays: completed,
      totalDays: 7,
      rate: (completed / 7) * 100
    };
  });

  return {
    tasks: userTasks,
    completions: weeklyCompletions,
    habits: userHabits,
    habitLogs: weeklyHabitLogs,
    taskCompletionRate,
    habitCompletionRate,
    completionsByDay,
    habitStats
  };
}

// Generate expense analysis using GPT
export async function generateExpenseAnalysis(userId: number): Promise<ExpenseAnalysis | null> {
  const data = await collectExpenseData(userId);
  if (!data) return null;

  const prompt = `Você é um assistente financeiro pessoal. Analise os seguintes dados de gastos do usuário da última semana e forneça insights úteis em português brasileiro.

DADOS DOS GASTOS:
- Total gasto na semana: R$ ${data.weeklyTotal.toFixed(2)}
- Total gasto no mês: R$ ${data.monthlyTotal.toFixed(2)}
- Despesas fixas mensais: R$ ${data.fixedTotal.toFixed(2)}

GASTOS POR CATEGORIA:
${Object.entries(data.byCategory).map(([cat, amount]) => `- ${cat}: R$ ${amount.toFixed(2)}`).join("\n")}

GASTOS POR TIPO:
- Pessoal: R$ ${data.byType.personal.toFixed(2)}
- Profissional: R$ ${data.byType.professional.toFixed(2)}

DESPESAS FIXAS:
${data.fixedExpenses.map(e => `- ${e.description}: R$ ${parseFloat(e.amount).toFixed(2)} (vence dia ${e.dueDay})`).join("\n")}

Por favor, forneça:
1. Um resumo geral dos gastos (2-3 frases)
2. Identificação de tendências ou padrões
3. 3 recomendações práticas para economizar
4. Alertas importantes (se houver gastos excessivos ou contas próximas do vencimento)

Responda em formato JSON com a seguinte estrutura:
{
  "summary": "resumo geral",
  "trends": "tendências identificadas",
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "alerts": ["alerta 1", "alerta 2"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um consultor financeiro especializado em finanças pessoais. Responda sempre em português brasileiro e em formato JSON válido." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "expense_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Resumo geral dos gastos" },
              trends: { type: "string", description: "Tendências identificadas" },
              recommendations: { 
                type: "array", 
                items: { type: "string" },
                description: "Lista de recomendações"
              },
              alerts: { 
                type: "array", 
                items: { type: "string" },
                description: "Lista de alertas"
              }
            },
            required: ["summary", "trends", "recommendations", "alerts"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content);

    // Build top categories
    const topCategories = Object.entries(data.byCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: data.weeklyTotal > 0 ? (amount / data.weeklyTotal) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      summary: parsed.summary,
      totalSpent: data.weeklyTotal,
      topCategories,
      trends: parsed.trends,
      recommendations: parsed.recommendations,
      alerts: parsed.alerts
    };
  } catch (error) {
    console.error("Error generating expense analysis:", error);
    return null;
  }
}

// Generate productivity analysis using GPT
export async function generateProductivityAnalysis(userId: number): Promise<ProductivityAnalysis | null> {
  const data = await collectProductivityData(userId);
  if (!data) return null;

  const prompt = `Você é um coach de produtividade. Analise os seguintes dados de produtividade do usuário da última semana e forneça insights motivadores em português brasileiro.

DADOS DE TAREFAS:
- Taxa de conclusão de tarefas: ${data.taskCompletionRate.toFixed(1)}%
- Total de tarefas ativas: ${data.tasks.length}
- Tarefas concluídas na semana: ${data.completions.filter(c => c.status === "done").length}

COMPLETAÇÕES POR DIA DA SEMANA:
${Object.entries(data.completionsByDay).map(([day, count]) => `- ${day}: ${count} tarefas`).join("\n")}

DADOS DE HÁBITOS:
- Taxa de conclusão de hábitos: ${data.habitCompletionRate.toFixed(1)}%
- Total de hábitos ativos: ${data.habits.length}

DESEMPENHO POR HÁBITO:
${data.habitStats.map(h => `- ${h.name}: ${h.completedDays}/7 dias (${h.rate.toFixed(0)}%)`).join("\n")}

Por favor, forneça:
1. Um resumo geral da produtividade (2-3 frases motivadoras)
2. Os dias mais produtivos da semana
3. Áreas que precisam de melhoria
4. Conquistas da semana (mesmo pequenas)
5. 3 recomendações práticas para melhorar

Responda em formato JSON com a seguinte estrutura:
{
  "summary": "resumo motivador",
  "mostProductiveDays": ["dia1", "dia2"],
  "areasForImprovement": ["área 1", "área 2"],
  "achievements": ["conquista 1", "conquista 2"],
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um coach de produtividade motivador e positivo. Responda sempre em português brasileiro e em formato JSON válido." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "productivity_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Resumo motivador" },
              mostProductiveDays: { 
                type: "array", 
                items: { type: "string" },
                description: "Dias mais produtivos"
              },
              areasForImprovement: { 
                type: "array", 
                items: { type: "string" },
                description: "Áreas para melhoria"
              },
              achievements: { 
                type: "array", 
                items: { type: "string" },
                description: "Conquistas da semana"
              },
              recommendations: { 
                type: "array", 
                items: { type: "string" },
                description: "Recomendações"
              }
            },
            required: ["summary", "mostProductiveDays", "areasForImprovement", "achievements", "recommendations"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return null;

    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary,
      taskCompletionRate: data.taskCompletionRate,
      habitCompletionRate: data.habitCompletionRate,
      mostProductiveDays: parsed.mostProductiveDays,
      areasForImprovement: parsed.areasForImprovement,
      achievements: parsed.achievements,
      recommendations: parsed.recommendations
    };
  } catch (error) {
    console.error("Error generating productivity analysis:", error);
    return null;
  }
}

// Generate complete weekly insights
export async function generateWeeklyInsights(userId: number): Promise<WeeklyInsights | null> {
  const [expenseAnalysis, productivityAnalysis] = await Promise.all([
    generateExpenseAnalysis(userId),
    generateProductivityAnalysis(userId)
  ]);

  if (!expenseAnalysis || !productivityAnalysis) return null;

  // Calculate overall score (0-100)
  const productivityScore = (productivityAnalysis.taskCompletionRate + productivityAnalysis.habitCompletionRate) / 2;
  const financialScore = expenseAnalysis.alerts.length === 0 ? 100 : Math.max(0, 100 - (expenseAnalysis.alerts.length * 20));
  const overallScore = Math.round((productivityScore * 0.6) + (financialScore * 0.4));

  // Generate motivational message based on score
  let motivationalMessage = "";
  if (overallScore >= 80) {
    motivationalMessage = "Parabéns! Você está arrasando esta semana! Continue assim! 🎉";
  } else if (overallScore >= 60) {
    motivationalMessage = "Bom trabalho! Você está no caminho certo. Pequenos ajustes podem fazer grande diferença! 💪";
  } else if (overallScore >= 40) {
    motivationalMessage = "Cada dia é uma nova oportunidade. Foque em uma melhoria de cada vez! 🌟";
  } else {
    motivationalMessage = "Não desanime! O importante é continuar tentando. Você consegue! 🚀";
  }

  return {
    expenses: expenseAnalysis,
    productivity: productivityAnalysis,
    overallScore,
    motivationalMessage,
    generatedAt: new Date()
  };
}
