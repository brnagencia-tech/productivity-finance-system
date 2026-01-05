import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for testing
const mockUser = {
  id: 1,
  openId: "test-user-123",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createTestContext(): TrpcContext {
  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Categories Router", () => {
  it("should have list procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.categories.list).toBeDefined();
  });

  it("should have create procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.categories.create).toBeDefined();
  });

  it("should have update procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.categories.update).toBeDefined();
  });

  it("should have delete procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.categories.delete).toBeDefined();
  });
});

describe("Tasks Router", () => {
  it("should have list procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.tasks.list).toBeDefined();
  });

  it("should have create procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.tasks.create).toBeDefined();
  });

  it("should have getWeeklyCompletions procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.tasks.getWeeklyCompletions).toBeDefined();
  });

  it("should have setCompletion procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.tasks.setCompletion).toBeDefined();
  });
});

describe("Kanban Router", () => {
  it("should have listBoards procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.kanban.listBoards).toBeDefined();
  });

  it("should have getBoard procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.kanban.getBoard).toBeDefined();
  });

  it("should have createBoard procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.kanban.createBoard).toBeDefined();
  });

  it("should have createColumn procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.kanban.createColumn).toBeDefined();
  });

  it("should have createCard procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.kanban.createCard).toBeDefined();
  });
});

describe("Expenses Router", () => {
  it("should have listVariable procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expenses.listVariable).toBeDefined();
  });

  it("should have createVariable procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expenses.createVariable).toBeDefined();
  });

  it("should have listFixed procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expenses.listFixed).toBeDefined();
  });

  it("should have createFixed procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expenses.createFixed).toBeDefined();
  });

  it("should have getMonthlyTrend procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expenses.getMonthlyTrend).toBeDefined();
  });

  it("should have getByCategory procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.expenses.getByCategory).toBeDefined();
  });
});

describe("Habits Router", () => {
  it("should have list procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.habits.list).toBeDefined();
  });

  it("should have create procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.habits.create).toBeDefined();
  });

  it("should have getLogs procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.habits.getLogs).toBeDefined();
  });

  it("should have setLog procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.habits.setLog).toBeDefined();
  });
});

describe("Dashboard Router", () => {
  it("should have getStats procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.dashboard.getStats).toBeDefined();
  });
});

describe("Users Router", () => {
  it("should have list procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.list).toBeDefined();
  });
});

describe("Auth Router", () => {
  it("should have me procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.auth.me).toBeDefined();
  });

  it("should return user from me query", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toEqual(mockUser);
  });

  it("should have logout procedure defined", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.auth.logout).toBeDefined();
  });
});
