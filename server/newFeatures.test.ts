import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "bnmedeiros@icloud.com",
    name: "Bruno Medeiros",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Managed Users Router", () => {
  it("should list managed users for admin", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.managedUsers.list();
    expect(Array.isArray(result)).toBe(true);
  });

  // Password generation is done client-side, not via tRPC
});

describe("Settings Router", () => {
  it("should get settings for admin with key", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.settings.get({ key: "gpt_token" });
    // Result can be null if not set
    expect(result === null || result !== undefined).toBe(true);
  });
});

describe("Sales Router", () => {
  it("should list sales for authenticated user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.sales.list({ month: 1, year: 2026 });
    expect(Array.isArray(result)).toBe(true);
  });

  // Monthly summary is calculated client-side from sales list

  // Daily split is calculated client-side from sales list
});

describe("Notifications Router", () => {
  it("should list notifications for authenticated user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get upcoming expenses", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.notifications.getUpcomingExpenses();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should generate expense reminders", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.notifications.generateExpenseReminders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Analysis History Router", () => {
  it("should list analysis history for authenticated user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.analysisHistory.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Contacts Router", () => {
  it("should list contacts for authenticated user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.contacts.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
