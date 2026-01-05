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
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, MoreVertical, Calendar, User, MessageSquare, ArrowLeft, Users, Lock, Globe } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  const [newBoard, setNewBoard] = useState({
    title: "",
    description: "",
    visibility: "private" as const,
    scope: "personal" as const
  });

  const [newColumn, setNewColumn] = useState({
    title: "",
    color: columnColors[0]
  });

  const [newCard, setNewCard] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: ""
  });

  const utils = trpc.useUtils();

  const { data: boards, isLoading: boardsLoading } = trpc.kanban.listBoards.useQuery();
  const { data: boardDetails, isLoading: boardLoading } = trpc.kanban.getBoard.useQuery(
    { id: selectedBoardId! },
    { enabled: !!selectedBoardId }
  );

  // Process columns with their cards
  const columnsWithCards = useMemo(() => {
    if (!boardDetails) return [];
    return boardDetails.columns.map(col => ({
      ...col,
      cards: boardDetails.cards.filter(card => card.columnId === col.id)
    }));
  }, [boardDetails]);
  const { data: users } = trpc.users.list.useQuery();

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
      setNewCard({ title: "", description: "", priority: "medium", dueDate: "" });
      setSelectedColumnId(null);
      toast.success("Card criado!");
    },
    onError: () => toast.error("Erro ao criar card")
  });

  const updateCard = trpc.kanban.updateCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      setEditingCard(null);
      toast.success("Card atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar card")
  });

  const deleteCard = trpc.kanban.deleteCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
      toast.success("Card removido!");
    },
    onError: () => toast.error("Erro ao remover card")
  });

  const moveCard = trpc.kanban.updateCard.useMutation({
    onSuccess: () => {
      utils.kanban.getBoard.invalidate({ id: selectedBoardId! });
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
                        onValueChange={(v: any) => setNewBoard({ ...newBoard, visibility: v })}
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateBoardOpen(false)}>Cancelar</Button>
                  <Button 
                    onClick={() => createBoard.mutate(newBoard)}
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
                  className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedBoardId(board.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(board.visibility)}
                        <CardTitle className="text-lg text-foreground">{board.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Remover este quadro?")) {
                                deleteBoard.mutate({ id: board.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {board.description && (
                      <CardDescription className="line-clamp-2">{board.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {board.scope === "personal" ? "Pessoal" : "Profissional"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground">Nenhum quadro criado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Novo Quadro" para começar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Board Detail View
  return (
    <DashboardLayout>
      <div className="space-y-4 h-full">
        {/* Board Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          <Dialog open={isCreateColumnOpen} onOpenChange={setIsCreateColumnOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Coluna
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Nova Coluna</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newColumn.title}
                    onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                    placeholder="Ex: A Fazer, Em Progresso, Concluído..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2 flex-wrap">
                    {columnColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewColumn({ ...newColumn, color })}
                        className={`h-8 w-8 rounded-full transition-all ${newColumn.color === color ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                        style={{ backgroundColor: color }}
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
                    position: boardDetails?.columns?.length || 0,
                    color: newColumn.color
                  })}
                  disabled={!newColumn.title || createColumn.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createColumn.isPending ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-h-[calc(100vh-220px)]">
            {boardLoading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Carregando quadro...
              </div>
            ) : columnsWithCards.length > 0 ? (
              columnsWithCards.map(column => (
                <div 
                  key={column.id} 
                  className="w-72 shrink-0 bg-secondary/50 rounded-lg p-3"
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
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedColumnId(column.id);
                            setIsCreateCardOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Card
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Remover esta coluna e todos os cards?")) {
                              deleteColumn.mutate({ id: column.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover Coluna
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
                        onClick={() => setEditingCard(card)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm text-foreground">{card.title}</h4>
                            <div 
                              className="h-2 w-2 rounded-full shrink-0 mt-1.5"
                              style={{ backgroundColor: priorityColors[card.priority] }}
                              title={priorityLabels[card.priority]}
                            />
                          </div>
                          {card.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {card.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {card.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(card.dueDate).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                            {card.assignedTo && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {getUserName(card.assignedTo) || "Atribuído"}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add Card Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setSelectedColumnId(column.id);
                        setIsCreateCardOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar card
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>Nenhuma coluna criada</p>
                  <p className="text-sm mt-1">Clique em "Nova Coluna" para começar</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Create Card Dialog */}
        <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Criar Novo Card</DialogTitle>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateCardOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => createCard.mutate({
                  columnId: selectedColumnId!,
                  boardId: selectedBoardId!,
                  title: newCard.title,
                  description: newCard.description,
                  priority: newCard.priority,
                  dueDate: newCard.dueDate || undefined,
                  position: 0
                })}
                disabled={!newCard.title || createCard.isPending}
                className="bg-primary text-primary-foreground"
              >
                {createCard.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Card Dialog */}
        <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Card</DialogTitle>
            </DialogHeader>
            {editingCard && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingCard.description || ""}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={editingCard.priority}
                      onValueChange={(v) => setEditingCard({ ...editingCard, priority: v })}
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
                    <Label>Mover para</Label>
                    <Select
                      value={editingCard.columnId?.toString()}
                      onValueChange={(v) => setEditingCard({ ...editingCard, columnId: parseInt(v) })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columnsWithCards.map(col => (
                          <SelectItem key={col.id} value={col.id.toString()}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Input
                    type="date"
                    value={editingCard.dueDate ? new Date(editingCard.dueDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditingCard({ ...editingCard, dueDate: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm("Remover este card?")) {
                    deleteCard.mutate({ id: editingCard.id });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingCard(null)}>Cancelar</Button>
                <Button 
                  onClick={() => updateCard.mutate({
                    id: editingCard.id,
                    title: editingCard.title,
                    description: editingCard.description,
                    priority: editingCard.priority,
                    columnId: editingCard.columnId,
                    dueDate: editingCard.dueDate || undefined
                  })}
                  disabled={updateCard.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {updateCard.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
