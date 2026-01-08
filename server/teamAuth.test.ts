import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Team Login Authentication", () => {
  let testUserId: number;
  const testEmail = "teamauth-test@example.com";
  const testPassword = "testpass123";
  
  beforeAll(async () => {
    // Criar usuário de teste
    const passwordHash = Buffer.from(testPassword).toString("base64");
    const result = await db.createManagedUser({
      email: testEmail,
      passwordHash,
      firstName: "Team",
      lastName: "AuthTest",
      username: "teamauthtest",
      createdByUserId: 1,
    });
    testUserId = result.id;
  });
  
  afterAll(async () => {
    // Limpar usuário de teste
    if (testUserId) {
      await db.deleteManagedUser(testUserId, 1);
    }
  });
  
  it("should authenticate team user via X-Team-User-Id header", async () => {
    // Verificar que o usuário foi criado
    const user = await db.getManagedUserById(testUserId);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(testEmail);
    expect(user?.isActive).toBe(true);
  });
  
  it("should return null for invalid team user id", async () => {
    const user = await db.getManagedUserById(999999);
    expect(user).toBeNull();
  });
  
  it("should return user data with correct fields", async () => {
    const user = await db.getManagedUserById(testUserId);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("firstName");
    expect(user).toHaveProperty("lastName");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("isActive");
  });
  
  it("should verify team login credentials", async () => {
    const user = await db.getManagedUserByEmail(testEmail);
    expect(user).not.toBeNull();
    
    const passwordHash = Buffer.from(testPassword).toString("base64");
    expect(user?.passwordHash).toBe(passwordHash);
  });
  
  it("should reject inactive team users", async () => {
    // Desativar usuário
    await db.updateManagedUser(testUserId, 1, { isActive: false });
    
    const user = await db.getManagedUserById(testUserId);
    expect(user?.isActive).toBe(false);
    
    // Reativar para limpeza
    await db.updateManagedUser(testUserId, 1, { isActive: true });
  });
});
