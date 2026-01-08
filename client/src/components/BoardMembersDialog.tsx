import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { UserSelector } from "@/components/UserSelector";
import { X, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BoardMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  boardTitle: string;
}

export function BoardMembersDialog({ open, onOpenChange, boardId, boardTitle }: BoardMembersDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: members = [], isLoading } = trpc.kanban.listMembers.useQuery(
    { boardId },
    { enabled: open }
  );

  const addMemberMutation = trpc.kanban.addMember.useMutation({
    onSuccess: () => {
      utils.kanban.listMembers.invalidate({ boardId });
      setSelectedUserIds([]);
      toast({
        title: "Membro adicionado",
        description: "O usuário foi adicionado ao quadro com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = trpc.kanban.removeMember.useMutation({
    onSuccess: () => {
      utils.kanban.listMembers.invalidate({ boardId });
      toast({
        title: "Membro removido",
        description: "O usuário foi removido do quadro com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o membro.",
        variant: "destructive",
      });
    },
  });

  const handleAddMembers = () => {
    if (selectedUserIds.length === 0) return;
    
    // Adicionar cada usuário selecionado
    selectedUserIds.forEach((userId) => {
      addMemberMutation.mutate({
        boardId,
        userId,
        role: "editor",
      });
    });
  };

  const handleRemoveMember = (userId: number) => {
    removeMemberMutation.mutate({
      boardId,
      userId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros - {boardTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar novos membros */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Adicionar Membros</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <UserSelector
                  selectedUserIds={selectedUserIds}
                  onUsersChange={setSelectedUserIds}
                  placeholder="Digite @ para buscar usuários..."
                />
              </div>
              <Button
                onClick={handleAddMembers}
                disabled={selectedUserIds.length === 0 || addMemberMutation.isPending}
                size="icon"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de membros atuais */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Membros Atuais</label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : members.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhum membro compartilhado. Adicione usuários acima.
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{member.username} • {member.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-secondary rounded">
                        {member.role === "owner"
                          ? "Proprietário"
                          : member.role === "editor"
                          ? "Editor"
                          : "Visualizador"}
                      </span>
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
