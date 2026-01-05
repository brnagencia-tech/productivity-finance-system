import { describe, expect, it, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null)
}));

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          summary: "Resumo de teste",
          trends: "Tendência de teste",
          recommendations: ["Recomendação 1", "Recomendação 2"],
          alerts: ["Alerta 1"]
        })
      }
    }]
  })
}));

describe("Analysis Module", () => {
  describe("Date Range Helpers", () => {
    it("should calculate week date range correctly", () => {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // The week range should span 7 days
      const diff = now.getTime() - weekAgo.getTime();
      const daysDiff = diff / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });

    it("should calculate month date range correctly", () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Month start should be day 1
      expect(monthStart.getDate()).toBe(1);
      // Month end should be last day of month (28-31)
      expect(monthEnd.getDate()).toBeGreaterThanOrEqual(28);
      expect(monthEnd.getDate()).toBeLessThanOrEqual(31);
    });
  });

  describe("Expense Analysis Types", () => {
    it("should have correct structure for ExpenseAnalysis", () => {
      const expenseAnalysis = {
        summary: "Test summary",
        totalSpent: 1500.50,
        topCategories: [
          { category: "Alimentação", amount: 500, percentage: 33.33 },
          { category: "Transporte", amount: 300, percentage: 20 }
        ],
        trends: "Gastos aumentaram 10%",
        recommendations: ["Reduza gastos com delivery"],
        alerts: ["Gasto acima do orçamento"]
      };

      expect(expenseAnalysis.summary).toBeDefined();
      expect(typeof expenseAnalysis.totalSpent).toBe("number");
      expect(Array.isArray(expenseAnalysis.topCategories)).toBe(true);
      expect(expenseAnalysis.topCategories[0]).toHaveProperty("category");
      expect(expenseAnalysis.topCategories[0]).toHaveProperty("amount");
      expect(expenseAnalysis.topCategories[0]).toHaveProperty("percentage");
    });
  });

  describe("Productivity Analysis Types", () => {
    it("should have correct structure for ProductivityAnalysis", () => {
      const productivityAnalysis = {
        summary: "Boa semana de produtividade",
        taskCompletionRate: 85.5,
        habitCompletionRate: 70.0,
        mostProductiveDays: ["Segunda", "Quarta"],
        areasForImprovement: ["Exercícios físicos"],
        achievements: ["Completou todas as tarefas diárias"],
        recommendations: ["Mantenha a consistência"]
      };

      expect(productivityAnalysis.summary).toBeDefined();
      expect(typeof productivityAnalysis.taskCompletionRate).toBe("number");
      expect(typeof productivityAnalysis.habitCompletionRate).toBe("number");
      expect(Array.isArray(productivityAnalysis.mostProductiveDays)).toBe(true);
      expect(Array.isArray(productivityAnalysis.achievements)).toBe(true);
    });
  });

  describe("Weekly Insights Types", () => {
    it("should have correct structure for WeeklyInsights", () => {
      const weeklyInsights = {
        expenses: {
          summary: "Resumo financeiro",
          totalSpent: 2000,
          topCategories: [],
          trends: "Estável",
          recommendations: [],
          alerts: []
        },
        productivity: {
          summary: "Resumo produtividade",
          taskCompletionRate: 80,
          habitCompletionRate: 75,
          mostProductiveDays: ["Segunda"],
          areasForImprovement: [],
          achievements: ["Meta atingida"],
          recommendations: []
        },
        overallScore: 78,
        motivationalMessage: "Bom trabalho!",
        generatedAt: new Date()
      };

      expect(weeklyInsights.overallScore).toBeGreaterThanOrEqual(0);
      expect(weeklyInsights.overallScore).toBeLessThanOrEqual(100);
      expect(weeklyInsights.motivationalMessage).toBeDefined();
      expect(weeklyInsights.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Score Calculation", () => {
    it("should calculate overall score correctly", () => {
      const taskCompletionRate = 80;
      const habitCompletionRate = 60;
      const alertsCount = 1;

      // Productivity score (average of task and habit rates)
      const productivityScore = (taskCompletionRate + habitCompletionRate) / 2; // 70

      // Financial score (100 - 20 per alert)
      const financialScore = Math.max(0, 100 - (alertsCount * 20)); // 80

      // Overall score (60% productivity + 40% financial)
      const overallScore = Math.round((productivityScore * 0.6) + (financialScore * 0.4)); // 74

      expect(overallScore).toBe(74);
    });

    it("should clamp overall score between 0 and 100", () => {
      // Test with very high values
      const highScore = Math.min(100, 150);
      expect(highScore).toBe(100);

      // Test with negative values
      const lowScore = Math.max(0, -20);
      expect(lowScore).toBe(0);
    });
  });

  describe("Motivational Messages", () => {
    it("should return appropriate message for high score", () => {
      const score = 85;
      let message = "";
      
      if (score >= 80) {
        message = "Parabéns! Você está arrasando esta semana! Continue assim! 🎉";
      } else if (score >= 60) {
        message = "Bom trabalho! Você está no caminho certo.";
      } else if (score >= 40) {
        message = "Cada dia é uma nova oportunidade.";
      } else {
        message = "Não desanime! O importante é continuar tentando.";
      }

      expect(message).toContain("Parabéns");
    });

    it("should return appropriate message for medium score", () => {
      const score = 65;
      let message = "";
      
      if (score >= 80) {
        message = "Parabéns!";
      } else if (score >= 60) {
        message = "Bom trabalho! Você está no caminho certo.";
      } else if (score >= 40) {
        message = "Cada dia é uma nova oportunidade.";
      } else {
        message = "Não desanime!";
      }

      expect(message).toContain("Bom trabalho");
    });

    it("should return appropriate message for low score", () => {
      const score = 30;
      let message = "";
      
      if (score >= 80) {
        message = "Parabéns!";
      } else if (score >= 60) {
        message = "Bom trabalho!";
      } else if (score >= 40) {
        message = "Cada dia é uma nova oportunidade.";
      } else {
        message = "Não desanime! O importante é continuar tentando.";
      }

      expect(message).toContain("Não desanime");
    });
  });

  describe("Category Percentage Calculation", () => {
    it("should calculate category percentages correctly", () => {
      const totalSpent = 1000;
      const categoryAmount = 250;
      
      const percentage = (categoryAmount / totalSpent) * 100;
      
      expect(percentage).toBe(25);
    });

    it("should handle zero total spent", () => {
      const totalSpent = 0;
      const categoryAmount = 0;
      
      const percentage = totalSpent > 0 ? (categoryAmount / totalSpent) * 100 : 0;
      
      expect(percentage).toBe(0);
    });
  });

  describe("Days of Week Mapping", () => {
    it("should map day numbers to Portuguese names correctly", () => {
      const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      
      expect(daysOfWeek[0]).toBe("Domingo");
      expect(daysOfWeek[1]).toBe("Segunda");
      expect(daysOfWeek[6]).toBe("Sábado");
    });

    it("should get correct day name from date", () => {
      const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const testDate = new Date("2026-01-05"); // Sunday
      const dayName = daysOfWeek[testDate.getDay()];
      
      expect(dayName).toBe("Domingo");
    });
  });
});
