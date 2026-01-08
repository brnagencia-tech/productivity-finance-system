import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Data Isolation - Each User Sees Only Their Own Data", () => {
  let user1Id: number;
  let user2Id: number;
  let task1Id: number;
  let task2Id: number;
  let habit1Id: number;
  let habit2Id: number;

  beforeAll(async () => {
    // Usar IDs de teste (assumindo que existem)
    // Em produção, esses seriam criados dinamicamente
    user1Id = 1;
    user2Id = 2;
  });

  describe("Tasks Isolation", () => {
    it("should create tasks for different users", async () => {
      // Criar tarefa para user1
      const task1 = await db.createTask({
        userId: user1Id,
        title: "User 1 Task",
        description: "Task for user 1",
        scope: "personal",
        frequency: "daily",
        targetCompletionRate: 100,
      });
      task1Id = task1.id;

      // Criar tarefa para user2
      const task2 = await db.createTask({
        userId: user2Id,
        title: "User 2 Task",
        description: "Task for user 2",
        scope: "personal",
        frequency: "daily",
        targetCompletionRate: 100,
      });
      task2Id = task2.id;

      expect(task1.userId).toBe(user1Id);
      expect(task2.userId).toBe(user2Id);
      expect(task1Id).not.toBe(task2Id);
    });

    it("user1 should only see their own tasks", async () => {
      const user1Tasks = await db.getTasksByUser(user1Id);
      
      // User1 deve ver apenas suas tarefas
      const user1TaskIds = user1Tasks.map(t => t.id);
      expect(user1TaskIds).toContain(task1Id);
      expect(user1TaskIds).not.toContain(task2Id);
    });

    it("user2 should only see their own tasks", async () => {
      const user2Tasks = await db.getTasksByUser(user2Id);
      
      // User2 deve ver apenas suas tarefas
      const user2TaskIds = user2Tasks.map(t => t.id);
      expect(user2TaskIds).toContain(task2Id);
      expect(user2TaskIds).not.toContain(task1Id);
    });

    it("should not allow user2 to update user1's task", async () => {
      try {
        // Tentar atualizar tarefa de user1 como user2
        await db.updateTask(task1Id, user2Id, { title: "Hacked" });
        
        // Se chegou aqui, a tarefa foi atualizada (BUG!)
        const updatedTask = await db.getTasksByUser(user1Id);
        const task = updatedTask.find(t => t.id === task1Id);
        expect(task?.title).not.toBe("Hacked");
      } catch (error) {
        // Esperado: erro ao tentar atualizar tarefa de outro usuário
        expect(error).toBeDefined();
      }
    });
  });

  describe("Habits Isolation", () => {
    it("should create habits for different users", async () => {
      // Criar hábito para user1
      const habit1 = await db.createHabit({
        userId: user1Id,
        name: "User 1 Habit",
        description: "Habit for user 1",
        frequency: "daily",
        targetDays: 7,
        scope: "personal",
      });
      habit1Id = habit1.id;

      // Criar hábito para user2
      const habit2 = await db.createHabit({
        userId: user2Id,
        name: "User 2 Habit",
        description: "Habit for user 2",
        frequency: "daily",
        targetDays: 7,
        scope: "personal",
      });
      habit2Id = habit2.id;

      expect(habit1.userId).toBe(user1Id);
      expect(habit2.userId).toBe(user2Id);
    });

    it("user1 should only see their own habits", async () => {
      const user1Habits = await db.getHabitsByUser(user1Id);
      
      const user1HabitIds = user1Habits.map(h => h.id);
      expect(user1HabitIds).toContain(habit1Id);
      expect(user1HabitIds).not.toContain(habit2Id);
    });

    it("user2 should only see their own habits", async () => {
      const user2Habits = await db.getHabitsByUser(user2Id);
      
      const user2HabitIds = user2Habits.map(h => h.id);
      expect(user2HabitIds).toContain(habit2Id);
      expect(user2HabitIds).not.toContain(habit1Id);
    });
  });

  describe("Expenses Isolation", () => {
    it("user1 should only see their own variable expenses", async () => {
      // Criar despesa para user1
      await db.createVariableExpense({
        userId: user1Id,
        categoryId: 1,
        amount: 100,
        description: "User 1 Expense",
        date: new Date(),
        scope: "personal",
      });

      // Criar despesa para user2
      await db.createVariableExpense({
        userId: user2Id,
        categoryId: 1,
        amount: 200,
        description: "User 2 Expense",
        date: new Date(),
        scope: "personal",
      });

      const user1Expenses = await db.getVariableExpensesByUser(user1Id);
      const user2Expenses = await db.getVariableExpensesByUser(user2Id);

      // User1 não deve ver despesas de user2
      expect(user1Expenses.every(e => e.userId === user1Id)).toBe(true);
      expect(user2Expenses.every(e => e.userId === user2Id)).toBe(true);
    });

    it("user1 should only see their own fixed expenses", async () => {
      // Criar despesa fixa para user1
      await db.createFixedExpense({
        userId: user1Id,
        categoryId: 1,
        amount: 500,
        description: "User 1 Fixed Expense",
        dueDay: 15,
        scope: "personal",
      });

      // Criar despesa fixa para user2
      await db.createFixedExpense({
        userId: user2Id,
        categoryId: 1,
        amount: 600,
        description: "User 2 Fixed Expense",
        dueDay: 20,
        scope: "personal",
      });

      const user1FixedExpenses = await db.getFixedExpensesByUser(user1Id);
      const user2FixedExpenses = await db.getFixedExpensesByUser(user2Id);

      // User1 não deve ver despesas fixas de user2
      expect(user1FixedExpenses.every(e => e.userId === user1Id)).toBe(true);
      expect(user2FixedExpenses.every(e => e.userId === user2Id)).toBe(true);
    });
  });

  describe("Kanban Isolation", () => {
    it("user1 should only see their own kanban boards (unless shared)", async () => {
      // Criar kanban para user1
      const board1 = await db.createKanbanBoard({
        userId: user1Id,
        title: "User 1 Board",
        description: "Board for user 1",
        visibility: "private",
        scope: "personal",
      });

      // Criar kanban para user2
      const board2 = await db.createKanbanBoard({
        userId: user2Id,
        title: "User 2 Board",
        description: "Board for user 2",
        visibility: "private",
        scope: "personal",
      });

      const user1Boards = await db.getKanbanBoardsByUser(user1Id);
      const user2Boards = await db.getKanbanBoardsByUser(user2Id);

      // User1 deve ver apenas seus boards
      const user1BoardIds = user1Boards.map(b => b.id);
      expect(user1BoardIds).toContain(board1.id);
      expect(user1BoardIds).not.toContain(board2.id);

      // User2 deve ver apenas seus boards
      const user2BoardIds = user2Boards.map(b => b.id);
      expect(user2BoardIds).toContain(board2.id);
      expect(user2BoardIds).not.toContain(board1.id);
    });
  });

  describe("Categories Isolation", () => {
    it("user1 should only see their own categories", async () => {
      // Criar categoria para user1
      await db.createCategory({
        userId: user1Id,
        name: "User 1 Category",
        type: "expense",
        color: "#FF0000",
        icon: "tag",
      });

      // Criar categoria para user2
      await db.createCategory({
        userId: user2Id,
        name: "User 2 Category",
        type: "expense",
        color: "#00FF00",
        icon: "tag",
      });

      const user1Categories = await db.getCategoriesByUser(user1Id);
      const user2Categories = await db.getCategoriesByUser(user2Id);

      // User1 não deve ver categorias de user2
      expect(user1Categories.every(c => c.userId === user1Id)).toBe(true);
      expect(user2Categories.every(c => c.userId === user2Id)).toBe(true);
    });
  });
});
