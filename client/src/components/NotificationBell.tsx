import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Queries
  const { data: notifications, refetch } = trpc.notifications.list.useQuery(undefined, {
    refetchInterval: 10000, // Atualizar a cada 10s
  });

  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 5000, // Atualizar a cada 5s
  });

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações marcadas como lidas!");
      refetch();
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("Notificação removida!");
      refetch();
    },
  });

  // Som de notificação (usando Web Audio API)
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn("Não foi possível reproduzir som de notificação:", error);
    }
  };

  // Detectar novas notificações e tocar som
  useEffect(() => {
    if (unreadCount && unreadCount > lastCount && lastCount > 0) {
      playNotificationSound();
      toast.info("Nova notificação de compartilhamento!");
    }
    if (unreadCount !== undefined) {
      setLastCount(unreadCount);
    }
  }, [unreadCount]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    // Marcar como lida
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }

    // Navegar para o item compartilhado
    if (notification.itemType === "task") {
      navigate("/tasks");
    } else if (notification.itemType === "habit") {
      navigate("/habits");
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount > 0 ? (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs pulse-glow"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
      </Button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 glass-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount && unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-accent/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {notification.fromUserName || notification.fromUsername || "Usuário"} compartilhou{" "}
                        {notification.itemType === "task" ? "uma tarefa" : "um hábito"} com você
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {notification.itemTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate({ id: notification.id });
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate({ id: notification.id });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
