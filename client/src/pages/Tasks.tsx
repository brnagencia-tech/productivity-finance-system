import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Clock, MoreVertical, MapPin, FileText, Share2, X } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import UserAutocomplete from "@/components/UserAutocomplete";

type TaskStatus = "not_started" | "in_progress" | "in_review" | "blocked" | "done";

const statusLabels: Record<TaskStatus, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  in_review: "Em revisão",
  blocked: "Bloqueado",
  done: "Concluído"
};

const statusColors: Record<TaskStatus, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  in_review: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700"
};

const statusIcons: Record<TaskStatus, string> = {
  not_started: "🔴",
  in_progress: "✏️",
  in_review: "👀",
  blocked: "🚫",
  done: "✅"
};

export default function Tasks() {
  const [scope, setScope] = useState<"personal" | "professional" | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewNotesTask, setViewNotesTask] = useState<any>(null);
  const [shareDialogTask, setShareDialogTask] = useState<any>(null);
  const [shareUsername, setShareUsername] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    hasTime: false,
    status: "not_started" as TaskStatus,
    priority: "medium" as "low" | "medium" | "high",
    scope: "personal" as "personal" | "professional",
    location: "",
    notes: ""
  });

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({ scope });
  const utils = trpc.useUtils();

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Tarefa criada com sucesso!");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    }
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Tarefa atualizada com sucesso!");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Tarefa excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir tarefa: ${error.message}`);
    }
  });

  const shareMutation = trpc.tasks.share.useMutation({
    onSuccess: (data) => {
      toast.success(`Tarefa compartilhada com @${data.sharedWith}!`);
      setShareUsername("");
      setShareDialogTask(null);
    },
    onError: (error) => {
      toast.error(`Erro ao compartilhar: ${error.message}`);
    }
  });

  const unshareMutation = trpc.tasks.unshare.useMutation({
    onSuccess: () => {
      toast.success("Compartilhamento removido!");
    },
    onError: (error) => {
      toast.error(`Erro ao remover compartilhamento: ${error.message}`);
    }
  });

  const resetForm = () => {
    setEditingTask(null);
    setNewTask({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      priority: "medium",
      hasTime: false,
      status: "not_started",
      scope: "personal",
      location: "",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados removendo campos vazios
    const cleanData = {
      title: newTask.title,
      date: newTask.date,
      hasTime: newTask.hasTime,
      status: newTask.status,
      scope: newTask.scope,
      // Campos opcionais - enviar apenas se tiver valor
      ...(newTask.time && newTask.time.trim() !== "" ? { time: newTask.time } : {}),
      ...(newTask.location && newTask.location.trim() !== "" ? { location: newTask.location } : {}),
      ...(newTask.notes && newTask.notes.trim() !== "" ? { notes: newTask.notes } : {})
    };
    
    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        ...cleanData
      });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      date: new Date(task.date).toISOString().split("T")[0],
      time: task.time || "",
      hasTime: task.hasTime,
      status: task.status,
      priority: task.priority || "medium",
      scope: task.scope,
      location: task.location || "",
      notes: task.notes || ""
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleShare = () => {
    if (!shareDialogTask || !shareUsername.trim()) {
      toast.error("Digite um @username válido");
      return;
    }
    shareMutation.mutate({
      taskId: shareDialogTask.id,
      username: shareUsername,
      permission: "editor"
    });
  };

  const openShareDialog = (task: any) => {
    setShareDialogTask(task);
    setShareUsername("");
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateMutation.mutate({ id: taskId, status: newStatus });
  };

  // Ordenar tarefas por data/hora (mais próximas primeiro)
  const sortTasks = (taskList: any[]) => {
    return taskList.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      // Se datas iguais, ordenar por hora
      if (a.hasTime && b.hasTime) {
        return (a.time || "").localeCompare(b.time || "");
      }
      // Tarefas com hora vêm antes
      if (a.hasTime && !b.hasTime) return -1;
      if (!a.hasTime && b.hasTime) return 1;
      return 0;
    });
  };

  const sortedTasks = tasks ? sortTasks([...tasks]) : [];

  const isOverdue = (task: any) => {
    if (task.status === "done") return false;
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header com título verde estilo planilha */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 md:p-8 rounded-t-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">CHECKLIST</h1>
        </div>

        {/* Filtros e Botão Criar - Responsivo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center bg-green-50 p-4 rounded-b-lg border-x-2 border-b-2 border-green-600">
          <div className="flex gap-2 flex-1">
            <Button
              variant={scope === undefined ? "default" : "outline"}
              onClick={() => setScope(undefined)}
              className="flex-1 sm:flex-none min-h-[44px]"
            >
              Todas
            </Button>
            <Button
              variant={scope === "personal" ? "default" : "outline"}
              onClick={() => setScope("personal")}
              className="flex-1 sm:flex-none min-h-[44px]"
            >
              Pessoal
            </Button>
            <Button
              variant={scope === "professional" ? "default" : "outline"}
              onClick={() => setScope("professional")}
              className="flex-1 sm:flex-none min-h-[44px]"
            >
              Profissional
            </Button>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 min-h-[44px] w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                      required
                      className="min-h-[44px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Hora</Label>
                    <div className="flex gap-2">
                      <Input
                        id="time"
                        type="time"
                        value={newTask.time}
                        onChange={(e) => setNewTask({ ...newTask, time: e.target.value, hasTime: !!e.target.value })}
                        disabled={!newTask.hasTime && !newTask.time}
                        className="min-h-[44px]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newTask.hasTime) {
                            setNewTask({ ...newTask, time: "", hasTime: false });
                          } else {
                            setNewTask({ ...newTask, hasTime: true });
                          }
                        }}
                        className="min-h-[44px] min-w-[100px]"
                      >
                        {newTask.hasTime || newTask.time ? "Remover" : "No time"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={newTask.status} onValueChange={(value: TaskStatus) => setNewTask({ ...newTask, status: value })}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {statusIcons[key as TaskStatus]} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridade *</Label>
                    <Select value={newTask.priority} onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Baixa</SelectItem>
                        <SelectItem value="medium">🟡 Média</SelectItem>
                        <SelectItem value="high">🔴 Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scope">Tipo *</Label>
                    <Select value={newTask.scope} onValueChange={(value: "personal" | "professional") => setNewTask({ ...newTask, scope: value })}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Pessoal</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Onde (Localização)</Label>
                  <Input
                    id="location"
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    placeholder="Ex: Escritório, Casa, ou URL"
                    className="min-h-[44px]"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    placeholder="Observações adicionais..."
                    rows={4}
                    className="min-h-[100px]"
                  />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="min-h-[44px] w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 min-h-[44px] w-full sm:w-auto">
                    {editingTask ? "Atualizar" : "Criar"} Tarefa
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading/Empty States */}
        {isLoading && <p className="text-center py-8">Carregando tarefas...</p>}
        {!isLoading && sortedTasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma tarefa encontrada. Crie sua primeira tarefa!
            </CardContent>
          </Card>
        )}

        {/* Desktop: Tabela */}
        {!isLoading && sortedTasks.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto border-2 border-green-600 rounded-lg">
              <Table>
                <TableHeader className="bg-green-600">
                  <TableRow>
                    <TableHead className="text-white font-bold">TAREFA</TableHead>
                    <TableHead className="text-white font-bold">DATA</TableHead>
                    <TableHead className="text-white font-bold">HORA</TableHead>
                    <TableHead className="text-white font-bold">STATUS</TableHead>
                    <TableHead className="text-white font-bold">ONDE</TableHead>
                    <TableHead className="text-white font-bold">NOTAS</TableHead>
                    <TableHead className="text-white font-bold text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTasks.map((task) => (
                    <TableRow key={task.id} className={isOverdue(task) ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {new Date(task.date).toLocaleDateString("pt-BR")}
                        {isOverdue(task) && <span className="ml-2 text-red-600 font-bold">⚠️ Atrasada</span>}
                      </TableCell>
                      <TableCell>
                        {task.hasTime && task.time ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {task.time}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No time</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={task.status} onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}>
                          <SelectTrigger className={`w-[180px] ${statusColors[task.status as TaskStatus]}`}>
                            <SelectValue>
                              {statusIcons[task.status as TaskStatus]} {statusLabels[task.status as TaskStatus]}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {statusIcons[key as TaskStatus]} {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {task.location ? (
                          task.location.startsWith("http") ? (
                            <a href={task.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Link
                            </a>
                          ) : (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {task.location}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.notes ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Ver nota
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Notas da Tarefa</DialogTitle>
                              </DialogHeader>
                              <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap p-4 bg-gray-50 rounded">
                                {task.notes}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openShareDialog(task)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Compartilhar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Cards Empilhados */}
            <div className="md:hidden space-y-4">
              {sortedTasks.map((task) => (
                <Card key={task.id} className={`${isOverdue(task) ? "border-red-500 border-2" : "border-green-600"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg flex-1">{task.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] p-0">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(task)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openShareDialog(task)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Data e Hora */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">📅</span>
                      <span>{new Date(task.date).toLocaleDateString("pt-BR")}</span>
                      {task.hasTime && task.time && (
                        <>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{task.time}</span>
                        </>
                      )}
                      {isOverdue(task) && <span className="ml-auto text-red-600 font-bold">⚠️ Atrasada</span>}
                    </div>

                    {/* Status - Touch Friendly */}
                    <div>
                      <Select value={task.status} onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}>
                        <SelectTrigger className={`w-full ${statusColors[task.status as TaskStatus]} min-h-[44px]`}>
                          <SelectValue>
                            {statusIcons[task.status as TaskStatus]} {statusLabels[task.status as TaskStatus]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key} className="min-h-[44px]">
                              {statusIcons[key as TaskStatus]} {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Localização */}
                    {task.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {task.location.startsWith("http") ? (
                          <a href={task.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            {task.location}
                          </a>
                        ) : (
                          <span className="truncate">{task.location}</span>
                        )}
                      </div>
                    )}

                    {/* Notas */}
                    {task.notes && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Notas
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Notas da Tarefa</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap p-4 bg-gray-50 rounded text-sm">
                            {task.notes}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Badge de Tipo */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${task.scope === "personal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {task.scope === "personal" ? "Pessoal" : "Profissional"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dialog de Compartilhamento */}
      <Dialog open={!!shareDialogTask} onOpenChange={(open) => !open && setShareDialogTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Digite o @username</Label>
              <UserAutocomplete
                value={shareUsername}
                onChange={setShareUsername}
                onSelect={(username) => {
                  setShareUsername(username);
                  // Auto-submit após selecionar
                  setTimeout(() => handleShare(), 100);
                }}
                placeholder="@usuario"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogTask(null)}>
              Cancelar
            </Button>
            <Button onClick={handleShare} disabled={shareMutation.isPending}>
              {shareMutation.isPending ? "Compartilhando..." : "Compartilhar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
