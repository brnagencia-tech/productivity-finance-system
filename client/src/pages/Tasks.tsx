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
import { Plus, Trash2, Edit2, Clock, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

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

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateMutation.mutate({ id: taskId, status: newStatus });
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

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Monitor de Tarefas</h1>
            <p className="text-muted-foreground">Gerencie suas tarefas em formato de checklist</p>
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
                    <TableCell>
                      {task.location ? (
                        task.location.startsWith("http") ? (
                          <a href={task.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {task.location.length > 30 ? task.location.substring(0, 30) + "..." : task.location}
                          </a>
                        ) : (
                          <span>{task.location}</span>
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {task.notes ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              📝 Ver nota
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Notas - {task.title}</DialogTitle>
                            </DialogHeader>
                            <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                              {task.notes}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "-"
                      )}
                    </TableCell>
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

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando tarefas...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
