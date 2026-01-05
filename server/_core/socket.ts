import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join a Kanban board room
    socket.on("join-board", (boardId: number) => {
      const room = `board-${boardId}`;
      socket.join(room);
      console.log(`[Socket.IO] Client ${socket.id} joined room ${room}`);
    });

    // Leave a Kanban board room
    socket.on("leave-board", (boardId: number) => {
      const room = `board-${boardId}`;
      socket.leave(room);
      console.log(`[Socket.IO] Client ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

// Emit events to all clients in a board room
export function emitToBoardRoom(boardId: number, event: string, data: unknown) {
  if (io) {
    io.to(`board-${boardId}`).emit(event, data);
  }
}

// Kanban events
export const KanbanEvents = {
  CARD_MOVED: "kanban:card-moved",
  CARD_CREATED: "kanban:card-created",
  CARD_UPDATED: "kanban:card-updated",
  CARD_DELETED: "kanban:card-deleted",
  COLUMN_CREATED: "kanban:column-created",
  COLUMN_UPDATED: "kanban:column-updated",
  COLUMN_DELETED: "kanban:column-deleted",
  COMMENT_ADDED: "kanban:comment-added",
  CHECKLIST_UPDATED: "kanban:checklist-updated",
} as const;
