import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, MoreVertical, Calendar, User, MessageSquare, ArrowLeft, Users, Lock, Globe, CheckSquare, Send, GripVertical } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket, KanbanEvents } from "@/hooks/useSocket";
import { MentionInput, renderMentions } from "@/components/MentionInput";
import { UserSelector } from "@/components/UserSelector";
import { BoardMembersDialog } from "@/components/BoardMembersDialog";
import { useTeamAuth } from "@/hooks/useTeamAuth";

const priorityColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444"
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta"
};

const columnColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"
];

export default function Kanban() {
  const { user } = useTeamAuth();
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedBoardForMembers, setSelectedBoardForMembers] = useState<number | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [draggedCard, setDraggedCard] = useState<any>(null);

  const [newBoard, setNewBoard] = useState<{
    title: string;
    description: string;
    visibility: "private" | "shared" | "public";
    scope: "personal" | "professional";
  }>({
    title: "",
    description: "",
    visibility: "private",
    scope: "personal"
  });
  const [sharedUserIds, setSharedUserIds] = useState<number[]>([]);

  const [newColumn, setNewColumn] = useState({
    title: "",
    color: columnColors[0]
  });

  const [newCard, setNewCard] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
    assignedTo: undefined as number | undefined
  });

  const utils = trpc.useUtils();
  const { joinBoard, leaveBoard, onEvent } = useSocket();

  // Socket.IO: Join/leave board room when selected board changes
  useEffect(() => {
    if (selectedBoardId) {
      joinBoard(selectedBoardId);
      return () => leaveBoard(selectedBoardId);
    }
  }, [selectedBoardId, joinBoard, leaveBoard]);

  // Socket.IO: Listen for real-time updates
  useEffect(() => {
    if (!selectedBoardId) return;

    const unsubscribers = [
      onEvent(KanbanEvents.CARD_MOVED, () => {
        utils.kanban.getBoard.invalidate({ id: selectedBoardId });
      }),
      onEvent(KanbanEvents.CARD_CREATED, () => {
        utils.kanban.getBoard.invalidate({ id: selectedBoardId });
      }),
      onEvent(KanbanEvents.CARD_UPDATED, () => {
        utils.kanban.getBoard.invalidate({ id: selectedBoardId });
      }),
      onEvent(KanbanEvents.CARD_DELETED, () => {
        utils.kanban.getBoard.invalidate({ id: selectedBoardId });
      }),
      onEvent(KanbanEvents.COLUMN_CREATED, () => {
        utils.kanban.getBoard.invalidate({ id: selectedBoardId });
      }),
      onEvent(KanbanEvents.COMMENT_ADDED, () => {
        if (selectedCard?.id) {
          utils.kanban.getCardComments.invalidate({ cardId: selectedCard.id });
        }
      }),
      onEvent(KanbanEvents.CHECKLIST_UPDATED, () => {
        if (selectedCard?.id) {
          utils.kanban.getCardChecklists.invalidate({ cardId: selectedCard.id });
        }
      }),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [selectedBoardId, selectedCard?.id, onEvent, utils]);

  const { data: boards, isLoading: boardsLoading } = trpc.kanban.listBoards.useQuery();
  const { data: boardDetails, isLoading: boardLoading } = trpc.kanban.getBoard.useQuery(
    { id: selectedBoardId! },
    { enabled: !!selectedBoardId }
  );

  const columnsWithCards = useMemo(() => {
    if (!boardDetails) return [];
    return boardDetails.columns.map(col => ({
      ...col,
      cards: boardDetails.cards.filter(card => card.columnId === col.id).sort((a, b) => a.position - b.position)
    }));
  }, [boardDetails]);

  const { data: users } = trpc.users.list.useQuery();
  const { data: contacts } = trpc.contacts.list.useQuery();
  const { data: managedUsers } = trpc.managedUsers.list.useQuery();

  // Prepare users list for mentions (combine users and managed users)
  const mentionableUsers = useMemo(() => {
    const allUsers: { id: number; username: string; firstName: string; lastName: string }[] = [];
    
    // Add managed users
    if (managedUsers) {
      managedUsers.forEach((u: any) => {
        if (u.username) {
          allUsers.push({
            id: u.id,
            username: u.username,
            firstName: u.firstName || '',
            lastName: u.lastName || ''
          });
        }
      });
    }
    
    // Add contacts as mentionable users
    if (contacts) {
      contacts.forEach((c: any) => {
        const username = c.name.toLowerCase().replace(/\s+/g, '.');
        allUsers.push({
          id: c.id + 10000, // Offset to avoid ID collision
          username: username,
          firstName: c.name.split(' ')[0] || c.name,
          lastName: c.name.split(' ').slice(1).join(' ') || ''
        });
      });
    }
    
    return allUsers;
  }, [managedUsers, contacts]);

  // Card details queries
  const { data: cardComments } = trpc.kanban.getCardComments.useQuery(
    { cardId: selectedCard?.id },
    { enabled: !!selectedCard?.id }
  );
  const { data: cardChecklists } = trpc.kanban.getCardChecklists.useQuery(
    { cardId: selectedCard?.id },
    { enabled: !!selectedCard?.id }
  );

  const createBoard = trpc.kanban.createBoard.useMutation({
    onSuccess: (data) => {
      utils.kanban.listBoards.invalidate();
      setIsCreateBoardOpen(false);
      setNewBoard({ title: "", description: "", visibility: "private", scope: "personal" });
      setSelectedBoardId(data.id);
      toast.success("Quadro criado!");
    },
    onError: () => toast.error("Erro ao criar quadro")
  });

  const deleteBoard = trpc.kanban.deleteBoard.useMutation({
    onSuccess: () => {
      utils.kanban.listBoards.invalidate();
      setSelectedBoardId(null);
      toast.success("Quadro removido!");
    },
    onError: () => toast.error("Erro ao remover quadro")
  });

  const createColumn = trpc.kanban.createColumn.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      setIsCreateColumnOpen(false);
      setNewColumn({ title: "", color: columnColors[0] });
      toast.success("Coluna criada!");
    },
    onError: () => toast.error("Erro ao criar coluna")
  });

  const deleteColumn = trpc.kanban.deleteColumn.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      toast.success("Coluna removida!");
    },
    onError: () => toast.error("Erro ao remover coluna")
  });

  const createCard = trpc.kanban.createCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      setIsCreateCardOpen(false);
      setNewCard({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: undefined });
      setSelectedColumnId(null);
      toast.success("Card criado!");
    },
    onError: () => toast.error("Erro ao criar card")
  });

  const updateCard = trpc.kanban.updateCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      toast.success("Card atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar card")
  });

  const deleteCard = trpc.kanban.deleteCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      setIsCardDetailOpen(false);
      setSelectedCard(null);
      toast.success("Card removido!");
    },
    onError: () => toast.error("Erro ao remover card")
  });

  const moveCard = trpc.kanban.moveCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
    }
  });

  const addComment = trpc.kanban.addCardComment.useMutation({
    onSuccess: () => {
      utils.kanban.getCardComments.invalidate({ cardId: selectedCard?.id });
      setNewComment("");
      toast.success("Comentário adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar comentário")
  });

  const deleteComment = trpc.kanban.deleteCardComment.useMutation({
    onSuccess: () => {
      utils.kanban.getCardComments.invalidate({ cardId: selectedCard?.id });
      toast.success("Comentário removido!");
    }
  });

  const createChecklist = trpc.kanban.createChecklist.useMutation({
    onSuccess: () => {
      utils.kanban.getCardChecklists.invalidate({ cardId: selectedCard?.id });
      setNewChecklistItem("");
      toast.success("Item adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar item")
  });

  const updateChecklist = trpc.kanban.updateChecklist.useMutation({
    onSuccess: () => {
      utils.kanban.getCardChecklists.invalidate({ cardId: selectedCard?.id });
    }
  });

  const deleteChecklist = trpc.kanban.deleteChecklist.useMutation({
    onSuccess: () => {
      utils.kanban.getCardChecklists.invalidate({ cardId: selectedCard?.id });
      toast.success("Item removido!");
    }
  });

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock className="h-4 w-4" />;
      case "shared": return <Users className="h-4 w-4" />;
      case "public": return <Globe className="h-4 w-4" />;
      default: return null;
    }
  };

  const getUserName = (userId: number | null) => {
    if (!userId || !users) return null;
    const user = users.find(u => u.id === userId);
    return user?.name || null;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, card: any) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnId: number) => {
    e.preventDefault();
    if (draggedCard && draggedCard.columnId !== columnId) {
      const targetColumn = columnsWithCards.find(c => c.id === columnId);
      const newPosition = targetColumn ? targetColumn.cards.length : 0;
      moveCard.mutate({
        cardId: draggedCard.id,
        newColumnId: columnId,
        newPosition
      });
    }
    setDraggedCard(null);
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsCardDetailOpen(true);
  };

  const checklistProgress = useMemo(() => {
    if (!cardChecklists || cardChecklists.length === 0) return 0;
    const completed = cardChecklists.filter(c => c.isCompleted).length;
    return Math.round((completed / cardChecklists.length) * 100);
  }, [cardChecklists]);

  // Board List View
  if (!selectedBoardId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Quadros Kanban</h1>
              <p className="text-muted-foreground">Gerencie seus projetos com quadros colaborativos</p>
            </div>
            <Dialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Quadro
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Novo Quadro</DialogTitle>
                  <DialogDescription>Crie um quadro Kanban para organizar suas tarefas</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={newBoard.title}
                      onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                      placeholder="Ex: Projeto Website, Sprint 1..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea
                      value={newBoard.description}
                      onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                      placeholder="Descrição do quadro..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Visibilidade</Label>
                      <Select
                        value={newBoard.visibility}
                        onValueChange={(v: any) => {
                          setNewBoard({ ...newBoard, visibility: v });
                          if (v !== "shared") {
                            setSharedUserIds([]);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Privado</SelectItem>
                          <SelectItem value="shared">Compartilhado</SelectItem>
                          <SelectItem value="public">Público</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={newBoard.scope}
                        onValueChange={(v: any) => setNewBoard({ ...newBoard, scope: v })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Pessoal</SelectItem>
                          <SelectItem value="professional">Profissional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newBoard.visibility === "shared" && (
                    <div className="space-y-2">
                      <Label>Compartilhar com</Label>
                      <UserSelector
                        selectedUserIds={sharedUserIds}
                        onUsersChange={setSharedUserIds}
                        placeholder="Digite @ para mencionar usuários..."
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateBoardOpen(false)}>Cancelar</Button>
                  <Button 
                    onClick={() => createBoard.mutate({ ...newBoard, memberIds: sharedUserIds })}
                    disabled={!newBoard.title || createBoard.isPending}
                    className="bg-primary text-primary-foreground"
                  >
                    {createBoard.isPending ? "Criando..." : "Criar Quadro"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {boardsLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando quadros...
            </div>
          ) : boards && boards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {boards.map(board => (
                <Card 
                  key={board.id}
                  className="bg-card border-border hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle 
                        className="text-lg text-foreground cursor-pointer flex-1"
                        onClick={() => setSelectedBoardId(board.id)}
                      >
                        {board.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(board.visibility)}
                        <Badge variant={board.scope === "personal" ? "default" : "secondary"}>
                          {board.scope === "personal" ? "Pessoal" : "Profissional"}
                        </Badge>
                        {(user?.role === "ceo" || user?.role === "master") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBoardForMembers(board.id);
                              setIsMembersDialogOpen(true);
                            }}
                            className="h-8 px-2"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {board.description && (
                      <CardDescription className="text-muted-foreground line-clamp-2">
                        {board.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Nenhum quadro criado ainda</p>
                <Button onClick={() => setIsCreateBoardOpen(true)} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Quadro
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Dialog de gerenciamento de membros */}
        {selectedBoardForMembers && (
          <BoardMembersDialog
            boardId={selectedBoardForMembers}
            boardTitle={boards?.find(b => b.id === selectedBoardForMembers)?.title || "Board"}
            open={isMembersDialogOpen}
            onOpenChange={(open) => {
              setIsMembersDialogOpen(open);
              if (!open) {
                setSelectedBoardForMembers(null);
              }
            }}
          />
        )}
      </DashboardLayout>
    );
  }

  // Board Detail View
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Board Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedBoardId(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {boardDetails?.title || "Carregando..."}
              </h1>
              {boardDetails?.description && (
                <p className="text-sm text-muted-foreground">{boardDetails.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateColumnOpen} onOpenChange={setIsCreateColumnOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Coluna
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nova Coluna</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={newColumn.title}
                      onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                      placeholder="Ex: A Fazer, Em Progresso..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex gap-2 flex-wrap">
                      {columnColors.map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${newColumn.color === color ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewColumn({ ...newColumn, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateColumnOpen(false)}>Cancelar</Button>
                  <Button 
                    onClick={() => createColumn.mutate({
                      boardId: selectedBoardId!,
                      title: newColumn.title,
                      position: columnsWithCards.length,
                      color: newColumn.color
                    })}
                    disabled={!newColumn.title || createColumn.isPending}
                    className="bg-primary text-primary-foreground"
                  >
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => deleteBoard.mutate({ id: selectedBoardId! })}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Quadro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full pb-4" style={{ minWidth: 'max-content' }}>
            {boardLoading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Carregando quadro...
              </div>
            ) : columnsWithCards.length > 0 ? (
              columnsWithCards.map(column => (
                <div 
                  key={column.id} 
                  className="w-72 shrink-0 bg-secondary/50 rounded-lg p-3"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: column.color || "#6366f1" }}
                      />
                      <h3 className="font-medium text-foreground">{column.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        ({column.cards.length})
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedColumnId(column.id);
                          setIsCreateCardOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Card
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteColumn.mutate({ id: column.id })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Coluna
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {column.cards.map((card: any) => (
                      <Card 
                        key={card.id} 
                        className="bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        onClick={() => handleCardClick(card)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 cursor-grab" />
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">{card.title}</p>
                              {card.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {card.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ borderColor: priorityColors[card.priority], color: priorityColors[card.priority] }}
                                >
                                  {priorityLabels[card.priority]}
                                </Badge>
                                {card.dueDate && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                                {card.assignedTo && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {getUserName(card.assignedTo)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Add Card Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedColumnId(column.id);
                      setIsCreateCardOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Card
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Nenhuma coluna criada. Clique em "Nova Coluna" para começar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Card Dialog */}
      <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newCard.title}
                onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                placeholder="Título do card..."
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newCard.description}
                onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                placeholder="Descrição..."
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={newCard.priority}
                  onValueChange={(v: any) => setNewCard({ ...newCard, priority: v })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Limite</Label>
                <Input
                  type="date"
                  value={newCard.dueDate}
                  onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={newCard.assignedTo?.toString() || "none"}
                onValueChange={(v) => setNewCard({ ...newCard, assignedTo: v === "none" ? undefined : parseInt(v) })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCardOpen(false)}>Cancelar</Button>
            <Button 
              onClick={() => createCard.mutate({
                columnId: selectedColumnId!,
                boardId: selectedBoardId!,
                title: newCard.title,
                description: newCard.description || undefined,
                priority: newCard.priority,
                dueDate: newCard.dueDate || undefined,
                assignedTo: newCard.assignedTo,
                position: columnsWithCards.find(c => c.id === selectedColumnId)?.cards.length || 0
              })}
              disabled={!newCard.title || createCard.isPending}
              className="bg-primary text-primary-foreground"
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Detail Dialog */}
      <Dialog open={isCardDetailOpen} onOpenChange={setIsCardDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-foreground text-xl">{selectedCard?.title}</DialogTitle>
              <Badge 
                variant="outline"
                style={{ borderColor: priorityColors[selectedCard?.priority || "medium"], color: priorityColors[selectedCard?.priority || "medium"] }}
              >
                {priorityLabels[selectedCard?.priority || "medium"]}
              </Badge>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="text-foreground">
                  {selectedCard?.description || "Sem descrição"}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {selectedCard?.dueDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Vence em {new Date(selectedCard.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {selectedCard?.assignedTo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{getUserName(selectedCard.assignedTo)}</span>
                  </div>
                )}
              </div>

              {/* Move to Column */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Mover para</Label>
                <Select
                  value={selectedCard?.columnId?.toString()}
                  onValueChange={(v) => {
                    const newColumnId = parseInt(v);
                    if (newColumnId !== selectedCard?.columnId) {
                      moveCard.mutate({
                        cardId: selectedCard.id,
                        newColumnId,
                        newPosition: columnsWithCards.find(c => c.id === newColumnId)?.cards.length || 0
                      });
                      setSelectedCard({ ...selectedCard, columnId: newColumnId });
                    }
                  }}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columnsWithCards.map(col => (
                      <SelectItem key={col.id} value={col.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color || "#6366f1" }} />
                          {col.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Checklist
                    {cardChecklists && cardChecklists.length > 0 && (
                      <span className="text-xs">({checklistProgress}%)</span>
                    )}
                  </Label>
                </div>
                
                {cardChecklists && cardChecklists.length > 0 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {cardChecklists?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={(checked) => {
                          updateChecklist.mutate({ id: item.id, isCompleted: !!checked });
                        }}
                      />
                      <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteChecklist.mutate({ id: item.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Adicionar item..."
                    className="bg-secondary border-border"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newChecklistItem.trim()) {
                        createChecklist.mutate({
                          cardId: selectedCard.id,
                          title: newChecklistItem,
                          position: cardChecklists?.length || 0
                        });
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    disabled={!newChecklistItem.trim()}
                    onClick={() => {
                      createChecklist.mutate({
                        cardId: selectedCard.id,
                        title: newChecklistItem,
                        position: cardChecklists?.length || 0
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div className="space-y-3">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentários ({cardComments?.length || 0})
                </Label>

                <div className="space-y-2">
                  <MentionInput
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={() => {
                      if (newComment.trim()) {
                        addComment.mutate({ cardId: selectedCard.id, content: newComment });
                      }
                    }}
                    placeholder="Escreva um comentário... Digite @ para mencionar"
                    users={mentionableUsers}
                    className="bg-secondary border-border"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={!newComment.trim() || addComment.isPending}
                      onClick={() => addComment.mutate({ cardId: selectedCard.id, content: newComment })}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {cardComments?.map((comment: any) => (
                    <div key={comment.id} className="bg-secondary/50 rounded-lg p-3 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.userName || comment.userEmail || "Usuário"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString('pt-BR')}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => deleteComment.mutate({ id: comment.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{renderMentions(comment.content)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border pt-4">
            <Button 
              variant="destructive"
              onClick={() => deleteCard.mutate({ id: selectedCard.id })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Card
            </Button>
            <Button variant="outline" onClick={() => setIsCardDetailOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
