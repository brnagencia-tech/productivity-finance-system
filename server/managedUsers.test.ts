import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Managed Users", () => {
  let adminUserId = 1;
  let createdUserId: number;

  beforeAll(async () => {
    // Garantir que o admin existe
    const admin = await db.getUserById(adminUserId);
    if (!admin) {
      throw new Error("Admin user not found");
    }
  });

  it("should create a managed user with all fields", async () => {
    const userData = {
      createdByUserId: adminUserId,
      username: "testuser123",
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      phoneBR: "(11) 98765-4321",
      phoneUS: "(555) 123-4567",
      passwordHash: Buffer.from("password123").toString("base64"),
    };

    const result = await db.createManagedUser(userData);
    createdUserId = result.id;

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.username).toBe("testuser123");
    expect(result.email).toBe("testuser@example.com");
    expect(result.phoneBR).toBe("(11) 98765-4321");
    expect(result.phoneUS).toBe("(555) 123-4567");
  });

  it("should create a managed user with empty phone fields", async () => {
    const userData = {
      createdByUserId: adminUserId,
      username: "testuser456",
      firstName: "Test",
      lastName: "User2",
      email: "testuser2@example.com",
      phoneBR: null,
      phoneUS: null,
      passwordHash: Buffer.from("password456").toString("base64"),
    };

    const result = await db.createManagedUser(userData);
    expect(result).toBeDefined();
    expect(result.phoneBR).toBeNull();
    expect(result.phoneUS).toBeNull();
  });

  it("should retrieve managed users by admin", async () => {
    const users = await db.getManagedUsersByAdmin(adminUserId);
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    
    const testUser = users.find(u => u.username === "testuser123");
    expect(testUser).toBeDefined();
    expect(testUser?.email).toBe("testuser@example.com");
  });

  it("should delete a managed user", async () => {
    // Primeiro, verificar que o usuário existe
    const usersBefore = await db.getManagedUsersByAdmin(adminUserId);
    const userExistsBefore = usersBefore.some(u => u.id === createdUserId);
    expect(userExistsBefore).toBe(true);

    // Deletar o usuário
    await db.deleteManagedUser(createdUserId, adminUserId);

    // Verificar que o usuário foi deletado
    const usersAfter = await db.getManagedUsersByAdmin(adminUserId);
    const userExistsAfter = usersAfter.some(u => u.id === createdUserId);
    expect(userExistsAfter).toBe(false);
  });

  it("should not delete a user if admin is different", async () => {
    // Criar um novo usuário
    const userData = {
      createdByUserId: adminUserId,
      username: "protecteduser",
      firstName: "Protected",
      lastName: "User",
      email: "protected@example.com",
      phoneBR: null,
      phoneUS: null,
      passwordHash: Buffer.from("password789").toString("base64"),
    };

    const result = await db.createManagedUser(userData);
    const protectedUserId = result.id;

    // Tentar deletar com admin diferente
    const differentAdminId = adminUserId + 999;
    await db.deleteManagedUser(protectedUserId, differentAdminId);

    // Verificar que o usuário ainda existe
    const users = await db.getManagedUsersByAdmin(adminUserId);
    const userStillExists = users.some(u => u.id === protectedUserId);
    expect(userStillExists).toBe(true);

    // Limpar: deletar com admin correto
    await db.deleteManagedUser(protectedUserId, adminUserId);
  });

  it("should get managed user by email", async () => {
    const userData = {
      createdByUserId: adminUserId,
      username: "emailtest",
      firstName: "Email",
      lastName: "Test",
      email: "emailtest@example.com",
      phoneBR: null,
      phoneUS: null,
      passwordHash: Buffer.from("passwordemail").toString("base64"),
    };

    const created = await db.createManagedUser(userData);
    const retrieved = await db.getManagedUserByEmail("emailtest@example.com");

    expect(retrieved).toBeDefined();
    expect(retrieved?.email).toBe("emailtest@example.com");
    expect(retrieved?.username).toBe("emailtest");

    // Limpar
    await db.deleteManagedUser(created.id, adminUserId);
  });
});
