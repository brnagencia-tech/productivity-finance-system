import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, Clock, Plus, ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const frequencyLabels: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
  as_needed: "Conforme necessário"
};

export default function Tasks() {
  const [scope, setScope] = useState<"personal" | "professional">("personal");
  const [weekOffset, setWeekOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    frequency: "daily" as const,
    scope: "personal" as const
  });

  const utils = trpc.useUtils();

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({ scope });
  const { data: categories } = trpc.categories.list.useQuery({ type: "task" });

  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const { data: completions } = trpc.tasks.getCompletions.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", frequency: "daily", scope: "personal" });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: () => toast.error("Erro ao criar tarefa")
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      setEditingTask(null);
      toast.success("Tarefa atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar tarefa")
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Tarefa removida!");
    },
    onError: () => toast.error("Erro ao remover tarefa")
  });

  const setCompletion = trpc.tasks.setCompletion.useMutation({
    onSuccess: () => {
      utils.tasks.getCompletions.invalidate();
      utils.dashboard.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar status")
  });

  const getCompletionStatus = (taskId: number, date: Date) => {
    if (!completions) return null;
    const dateStr = date.toISOString().split("T")[0];
    return completions.find(c => 
      c.taskId === taskId && 
      new Date(c.date).toISOString().split("T")[0] === dateStr
    );
  };

  const calculateCompletionRate = (taskId: number) => {
    if (!completions) return 0;
    const taskCompletions = completions.filter(c => c.taskId === taskId);
    const completed = taskCompletions.filter(c => c.status === "done").length;
    return Math.round((completed / 7) * 100);
  };

  const handleStatusClick = (taskId: number, date: Date, currentStatus: string | null) => {
    const nextStatus = currentStatus === "done" ? "not_done" : currentStatus === "in_progress" ? "done" : "in_progress";
    setCompletion.mutate({
      taskId,
      date: date.toISOString(),
      status: nextStatus as any
    });
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString("pt-BR", { month: "short" });
    const endMonth = end.toLocaleDateString("pt-BR", { month: "short" });
    
    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth}`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Monitor de Tarefas</h1>
            <p className="text-muted-foreground">Acompanhe suas tarefas diárias e semanais</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Nova Tarefa</DialogTitle>
                <DialogDescription>Adicione uma nova tarefa ao seu monitor</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Ex: Academia, Beber água..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Detalhes da tarefa..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select
                      value={newTask.frequency}
                      onValueChange={(v: any) => setNewTask({ ...newTask, frequency: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="as_needed">Conforme necessário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newTask.scope}
                      onValueChange={(v: any) => setNewTask({ ...newTask, scope: v })}
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
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => createTask.mutate(newTask)}
                  disabled={!newTask.title || createTask.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createTask.isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs for Personal/Professional */}
        <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="professional" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profissional
            </TabsTrigger>
          </TabsList>

          <TabsContent value={scope} className="mt-4">
            {/* Week Navigation */}
            <Card className="bg-card border-border mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setWeekOffset(weekOffset - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-foreground min-w-[180px] text-center">
                      {formatWeekRange()}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setWeekOffset(weekOffset + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {weekOffset !== 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
                      Hoje
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Tasks Table */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-4 font-medium text-muted-foreground min-w-[200px]">Tarefa</th>
                      <th className="text-center p-4 font-medium text-muted-foreground w-24">Frequência</th>
                      <th className="text-center p-4 font-medium text-muted-foreground w-20">Taxa</th>
                      {weekDates.map((date, i) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <th 
                            key={i} 
                            className={`text-center p-4 font-medium w-16 ${isToday ? "bg-primary/10" : ""}`}
                          >
                            <div className="text-xs text-muted-foreground">{dayNames[i]}</div>
                            <div className={`text-sm ${isToday ? "text-primary font-bold" : "text-foreground"}`}>
                              {date.getDate()}
                            </div>
                          </th>
                        );
                      })}
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={11} className="text-center p-8 text-muted-foreground">
                          Carregando tarefas...
                        </td>
                      </tr>
                    ) : tasks && tasks.length > 0 ? (
                      tasks.map((task) => {
                        const rate = calculateCompletionRate(task.id);
                        return (
                          <tr key={task.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-foreground">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                                  {task.description}
                                </div>
                              )}
                            </td>
                            <td className="text-center p-4">
                              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                {frequencyLabels[task.frequency]}
                              </span>
                            </td>
                            <td className="text-center p-4">
                              <span className={`font-bold ${rate >= 80 ? "text-primary" : rate >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                                {rate}%
                              </span>
                            </td>
                            {weekDates.map((date, i) => {
                              const completion = getCompletionStatus(task.id, date);
                              const isToday = date.toDateString() === new Date().toDateString();
                              return (
                                <td 
                                  key={i} 
                                  className={`text-center p-4 ${isToday ? "bg-primary/5" : ""}`}
                                >
                                  <button
                                    onClick={() => handleStatusClick(task.id, date, completion?.status || null)}
                                    className="hover:scale-110 transition-transform"
                                    disabled={setCompletion.isPending}
                                  >
                                    {getStatusIcon(completion?.status || null)}
                                  </button>
                                </td>
                              );
                            })}
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingTask(task)}
                                >
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    if (confirm("Remover esta tarefa?")) {
                                      deleteTask.mutate({ id: task.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={11} className="text-center p-8 text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma tarefa {scope === "personal" ? "pessoal" : "profissional"}</p>
                          <p className="text-sm mt-1">Clique em "Nova Tarefa" para começar</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Feito</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>Em progresso</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>Não feito</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Tarefa</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingTask.description || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={editingTask.frequency}
                    onValueChange={(v) => setEditingTask({ ...editingTask, frequency: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="as_needed">Conforme necessário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>Cancelar</Button>
              <Button 
                onClick={() => updateTask.mutate({
                  id: editingTask.id,
                  title: editingTask.title,
                  description: editingTask.description,
                  frequency: editingTask.frequency
                })}
                disabled={updateTask.isPending}
                className="bg-primary text-primary-foreground"
              >
                {updateTask.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
