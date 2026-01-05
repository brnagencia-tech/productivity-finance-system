import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_PATH = "/api/socket.io";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to socket server
    socketRef.current = io({
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("[Socket.IO] Connected:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("[Socket.IO] Disconnected");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinBoard = useCallback((boardId: number) => {
    socketRef.current?.emit("join-board", boardId);
  }, []);

  const leaveBoard = useCallback((boardId: number) => {
    socketRef.current?.emit("leave-board", boardId);
  }, []);

  const onEvent = useCallback((event: string, callback: (data: unknown) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    joinBoard,
    leaveBoard,
    onEvent,
  };
}

// Kanban event types
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
