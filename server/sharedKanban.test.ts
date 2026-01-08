import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Shared Kanban Boards", () => {
  let ownerId = 1;
  let collaboratorId = 2;
  let boardId: number;

  beforeAll(async () => {
    // Criar um kanban board para o owner
    const board = await db.createKanbanBoard({
      userId: ownerId,
      title: "Shared Board",
      description: "Board for testing shared access",
      visibility: "shared",
      scope: "personal",
    });
    boardId = board.id;
  });

  describe("Kanban Permissions", () => {
    it("owner should have owner permission on their board", async () => {
      const permission = await db.checkKanbanPermission(boardId, ownerId);
      expect(permission).toBe("owner");
    });

    it("should add collaborator as editor", async () => {
      await db.addKanbanBoardMember(boardId, collaboratorId, "editor");
      const permission = await db.checkKanbanPermission(boardId, collaboratorId);
      expect(permission).toBe("editor");
    });

    it("editor should have permission to edit", async () => {
      const hasPermission = await db.hasKanbanPermission(boardId, collaboratorId, "editor");
      expect(hasPermission).toBe(true);
    });

    it("editor should NOT have owner permission", async () => {
      const hasPermission = await db.hasKanbanPermission(boardId, collaboratorId, "owner");
      expect(hasPermission).toBe(false);
    });

    it("viewer should have viewer permission", async () => {
      const viewerId = 3;
      await db.addKanbanBoardMember(boardId, viewerId, "viewer");
      const hasPermission = await db.hasKanbanPermission(boardId, viewerId, "viewer");
      expect(hasPermission).toBe(true);
    });

    it("viewer should NOT have editor permission", async () => {
      const viewerId = 3;
      const hasPermission = await db.hasKanbanPermission(boardId, viewerId, "editor");
      expect(hasPermission).toBe(false);
    });
  });

  describe("Kanban Members", () => {
    it("should get all board members", async () => {
      const members = await db.getKanbanBoardMembers(boardId);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
    });

    it("should update member role", async () => {
      await db.updateKanbanBoardMemberRole(boardId, collaboratorId, "viewer");
      const permission = await db.checkKanbanPermission(boardId, collaboratorId);
      expect(permission).toBe("viewer");
      
      // Restaurar para editor
      await db.updateKanbanBoardMemberRole(boardId, collaboratorId, "editor");
    });

    it("should remove board member", async () => {
      const removedId = 4;
      await db.addKanbanBoardMember(boardId, removedId, "viewer");
      
      // Verificar que foi adicionado
      let permission = await db.checkKanbanPermission(boardId, removedId);
      expect(permission).toBe("viewer");
      
      // Remover
      await db.removeKanbanBoardMember(boardId, removedId);
      
      // Verificar que foi removido
      permission = await db.checkKanbanPermission(boardId, removedId);
      expect(permission).toBeNull();
    });
  });

  describe("Shared Kanban Boards for User", () => {
    it("collaborator should see shared boards", async () => {
      const sharedBoards = await db.getSharedKanbanBoardsForUser(collaboratorId);
      expect(Array.isArray(sharedBoards)).toBe(true);
      
      const foundBoard = sharedBoards.find(b => b.id === boardId);
      expect(foundBoard).toBeDefined();
      expect(foundBoard?.role).toBe("editor");
    });

    it("non-member should NOT see board", async () => {
      const nonMemberId = 99;
      const sharedBoards = await db.getSharedKanbanBoardsForUser(nonMemberId);
      
      const foundBoard = sharedBoards.find(b => b.id === boardId);
      expect(foundBoard).toBeUndefined();
    });
  });

  describe("Permission Hierarchy", () => {
    it("owner should have all permissions", async () => {
      const canView = await db.hasKanbanPermission(boardId, ownerId, "viewer");
      const canEdit = await db.hasKanbanPermission(boardId, ownerId, "editor");
      const canOwn = await db.hasKanbanPermission(boardId, ownerId, "owner");
      
      expect(canView).toBe(true);
      expect(canEdit).toBe(true);
      expect(canOwn).toBe(true);
    });

    it("editor should have view and edit permissions", async () => {
      const canView = await db.hasKanbanPermission(boardId, collaboratorId, "viewer");
      const canEdit = await db.hasKanbanPermission(boardId, collaboratorId, "editor");
      const canOwn = await db.hasKanbanPermission(boardId, collaboratorId, "owner");
      
      expect(canView).toBe(true);
      expect(canEdit).toBe(true);
      expect(canOwn).toBe(false);
    });

    it("viewer should only have view permission", async () => {
      const viewerId = 3;
      const canView = await db.hasKanbanPermission(boardId, viewerId, "viewer");
      const canEdit = await db.hasKanbanPermission(boardId, viewerId, "editor");
      const canOwn = await db.hasKanbanPermission(boardId, viewerId, "owner");
      
      expect(canView).toBe(true);
      expect(canEdit).toBe(false);
      expect(canOwn).toBe(false);
    });
  });
});
