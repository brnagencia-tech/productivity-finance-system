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
import { Plus, Trash2, Edit2, Clock, AlertCircle, MoreVertical, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import DashboardLayout from "@/components/DashboardLayout";

type TaskStatus = "todo" | "not_started" | "in_progress" | "in_review" | "blocked" | "done";

const statusLabels: Record<TaskStatus, string> = {
  todo: "A fazer",
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  in_review: "Em revisão",
  blocked: "Bloqueado",
  done: "Concluído"
};

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700",
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  in_review: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700"
};

const statusIcons: Record<TaskStatus, string> = {
  todo: "⏸️",
  not_started: "🔴",
  in_progress: "✏️",
  in_review: "👀",
  blocked: "🚫",
  done: "✅"
};

export default function Tasks() {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("table");
  const [scope, setScope] = useState<"personal" | "professional" | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    hasTime: false,
    status: "not_started" as TaskStatus,
    scope: "personal" as const,
    location: "",
    notes: ""
  });

  const utils = trpc.useUtils();

  const { data: tasks = [], isLoading } = trpc.tasks.list.useQuery({ scope });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      utils.tasks.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    }
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Tarefa atualizada com sucesso!");
      utils.tasks.list.invalidate();
      setEditingTask(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa excluída com sucesso!");
      utils.tasks.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir tarefa: ${error.message}`);
    }
  });

  const resetForm = () => {
    setNewTask({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      hasTime: false,
      status: "not_started",
      scope: "personal",
      location: "",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        ...newTask
      });
    } else {
      createMutation.mutate(newTask);
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId as TaskStatus;

    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  // Ordenar tarefas por data/hora (mais próximas primeiro)
  const sortTasks = (taskList: any[]) => {
    return taskList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      if (a.hasTime && b.hasTime) {
        return (a.time || "").localeCompare(b.time || "");
      }
      
      if (a.hasTime) return -1;
      if (b.hasTime) return 1;
      
      return 0;
    });
  };

  // Verificar se tarefa está atrasada
  const isOverdue = (task: any) => {
    if (task.status === "done") return false;
    
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return taskDate < today;
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Agrupar tarefas por status para Kanban
  const tasksByStatus = {
    todo: tasks.filter((t: any) => t.status === "todo" || t.status === "not_started"),
    in_progress: tasks.filter((t: any) => t.status === "in_progress" || t.status === "in_review"),
    done: tasks.filter((t: any) => t.status === "done" || t.status === "blocked")
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Monitor de Tarefas</h1>
            <p className="text-muted-foreground">Gerencie suas tarefas com drag & drop ou visualização em tabela</p>
          </div>

          <div className="flex gap-2">
            {/* Toggle Visualização */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabela
              </Button>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTask(null); resetForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newTask.date}
                        onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                        required
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
                        >
                          {newTask.hasTime || newTask.time ? <Clock className="w-4 h-4" /> : "No time"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select value={newTask.status} onValueChange={(value: TaskStatus) => setNewTask({ ...newTask, status: value })}>
                        <SelectTrigger>
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
                      <Label htmlFor="scope">Tipo *</Label>
                      <Select value={newTask.scope} onValueChange={(value: any) => setNewTask({ ...newTask, scope: value })}>
                        <SelectTrigger>
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
                      placeholder="Ex: Escritório, Casa, Online..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingTask ? "Atualizar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Button
            variant={scope === undefined ? "default" : "outline"}
            onClick={() => setScope(undefined)}
          >
            Todas
          </Button>
          <Button
            variant={scope === "personal" ? "default" : "outline"}
            onClick={() => setScope("personal")}
          >
            Pessoal
          </Button>
          <Button
            variant={scope === "professional" ? "default" : "outline"}
            onClick={() => setScope("professional")}
          >
            Profissional
          </Button>
        </div>

        {/* Visualização em Tabela */}
        {viewMode === "table" && (
          <Card>
            <CardHeader className="bg-emerald-600 text-white">
              <CardTitle className="text-2xl">CHECKLIST</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-emerald-500 text-white">
                  <TableRow>
                    <TableHead className="text-white font-bold">TAREFA</TableHead>
                    <TableHead className="text-white font-bold">DATA</TableHead>
                    <TableHead className="text-white font-bold">HORA</TableHead>
                    <TableHead className="text-white font-bold">STATUS</TableHead>
                    <TableHead className="text-white font-bold">ONDE</TableHead>
                    <TableHead className="text-white font-bold">NOTAS</TableHead>
                    <TableHead className="text-white font-bold w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortTasks(tasks).map((task: any) => (
                    <TableRow key={task.id} className={isOverdue(task) ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{formatDate(task.date)}</TableCell>
                      <TableCell>
                        {task.hasTime && task.time ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.time}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No time</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                        >
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
                      <TableCell>{task.location || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{task.notes || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!isLoading && tasks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Nenhuma tarefa encontrada</p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira tarefa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Visualização Kanban */}
        {viewMode === "kanban" && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["todo", "in_progress", "done"] as const).map((status) => (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{status === "todo" ? "A fazer" : status === "in_progress" ? "Em andamento" : "Feito"}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {tasksByStatus[status].length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
                            snapshot.isDraggingOver
                              ? "bg-blue-50 border-2 border-dashed border-blue-400"
                              : "border-2 border-transparent"
                          }`}
                        >
                          {sortTasks(tasksByStatus[status]).map((task: any, index: number) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 rounded-lg border-2 ${
                                    snapshot.isDragging
                                      ? "shadow-2xl scale-105 rotate-2 opacity-90"
                                      : ""
                                  } ${
                                    isOverdue(task)
                                      ? "bg-red-50 border-red-300"
                                      : "bg-white border-gray-200"
                                  } hover:shadow-md transition-all duration-200`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold flex-1">{task.title}</h3>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(task); }}>
                                          <Edit2 className="w-4 h-4 mr-2" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <span>📅 {formatDate(task.date)}</span>
                                      {task.hasTime && task.time && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {task.time}
                                        </span>
                                      )}
                                      {!task.hasTime && !task.time && (
                                        <span className="text-xs text-gray-400">No time</span>
                                      )}
                                    </div>

                                    <div className="flex gap-2">
                                      <span
                                        className={`inline-block px-2 py-1 rounded text-xs ${
                                          task.scope === "personal"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-purple-100 text-purple-700"
                                        }`}
                                      >
                                        {task.scope === "personal" ? "Pessoal" : "Profissional"}
                                      </span>
                                      <span className={`inline-block px-2 py-1 rounded text-xs ${statusColors[task.status as TaskStatus]}`}>
                                        {statusIcons[task.status as TaskStatus]} {statusLabels[task.status as TaskStatus]}
                                      </span>
                                    </div>

                                    {task.location && (
                                      <p className="text-xs">📍 {task.location}</p>
                                    )}

                                    {task.notes && (
                                      <p className="text-xs mt-2 text-gray-600">{task.notes}</p>
                                    )}

                                    {isOverdue(task) && (
                                      <div className="flex items-center gap-1 text-red-600 font-semibold mt-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Atrasada</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DragDropContext>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando tarefas...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
