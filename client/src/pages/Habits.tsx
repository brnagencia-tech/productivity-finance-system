import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Target, CheckCircle2, Circle, ChevronLeft, ChevronRight, Droplets, Dumbbell, Utensils, Footprints, Heart, Coffee, Moon, Share2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import UserAutocomplete from "@/components/UserAutocomplete";

const iconOptions = [
  { value: "💧", label: "Água", Icon: Droplets },
  { value: "🏋️", label: "Academia", Icon: Dumbbell },
  { value: "🥗", label: "Alimentação", Icon: Utensils },
  { value: "🚶", label: "Caminhada", Icon: Footprints },
  { value: "❤️", label: "Saúde", Icon: Heart },
  { value: "☕", label: "Café", Icon: Coffee },
  { value: "😴", label: "Sono", Icon: Moon },
  { value: "🎯", label: "Meta", Icon: Target },
];

const colorOptions = [
  { value: "#10b981", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#ec4899", label: "Rosa" },
];

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Habits() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [shareDialogHabit, setShareDialogHabit] = useState<any>(null);
  const [shareUsername, setShareUsername] = useState("");
  const [newHabit, setNewHabit] = useState({
    name: "",
    icon: "💧",
    color: "#10b981",
    targetValue: "",
    unit: "",
    frequency: "daily" as const
  });

  const utils = trpc.useUtils();

  const { data: habits, isLoading } = trpc.habits.list.useQuery();

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

  const { data: logs } = trpc.habits.getLogs.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  const createHabit = trpc.habits.create.useMutation({
    onSuccess: () => {
      utils.habits.list.invalidate();
      setIsCreateOpen(false);
      setNewHabit({
        name: "",
        icon: "💧",
        color: "#10b981",
        targetValue: "",
        unit: "",
        frequency: "daily"
      });
      toast.success("Hábito criado!");
    },
    onError: () => toast.error("Erro ao criar hábito")
  });

  const updateHabit = trpc.habits.update.useMutation({
    onSuccess: () => {
      utils.habits.list.invalidate();
      setEditingHabit(null);
      toast.success("Hábito atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar hábito")
  });

  const deleteHabit = trpc.habits.delete.useMutation({
    onSuccess: () => {
      utils.habits.list.invalidate();
      toast.success("Hábito removido!");
    },
    onError: () => toast.error("Erro ao remover hábito")
  });

  const shareHabit = trpc.habits.share.useMutation({
    onSuccess: (data) => {
      toast.success(`Hábito compartilhado com @${data.sharedWith}!`);
      setShareUsername("");
      setShareDialogHabit(null);
    },
    onError: (error) => {
      toast.error(`Erro ao compartilhar: ${error.message}`);
    }
  });

  const unshareHabit = trpc.habits.unshare.useMutation({
    onSuccess: () => {
      toast.success("Compartilhamento removido!");
    },
    onError: (error) => {
      toast.error(`Erro ao remover compartilhamento: ${error.message}`);
    }
  });

  const setLog = trpc.habits.setLog.useMutation({
    onSuccess: () => {
      utils.habits.getLogs.invalidate();
      utils.dashboard.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar")
  });

  const getLogStatus = (habitId: number, date: Date) => {
    if (!logs) return null;
    const dateStr = date.toISOString().split("T")[0];
    return logs.find(l => 
      l.habitId === habitId && 
      new Date(l.date).toISOString().split("T")[0] === dateStr
    );
  };

  const calculateWeeklyProgress = (habitId: number) => {
    if (!logs) return { completed: 0, total: 7, percentage: 0 };
    const habitLogs = logs.filter(l => l.habitId === habitId);
    const completed = habitLogs.filter(l => l.completed).length;
    return {
      completed,
      total: 7,
      percentage: Math.round((completed / 7) * 100)
    };
  };

  const handleLogToggle = (habitId: number, date: Date, currentCompleted: boolean) => {
    setLog.mutate({
      habitId,
      date: date.toISOString(),
      completed: !currentCompleted
    });
  };

  const handleShare = () => {
    if (!shareDialogHabit || !shareUsername.trim()) {
      toast.error("Digite um @username válido");
      return;
    }
    shareHabit.mutate({
      habitId: shareDialogHabit.id,
      username: shareUsername,
      permission: "editor"
    });
  };

  const openShareDialog = (habit: any) => {
    setShareDialogHabit(habit);
    setShareUsername("");
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

  const getIconComponent = (iconValue: string) => {
    const option = iconOptions.find(o => o.value === iconValue);
    return option?.Icon || Target;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Rastreador de Hábitos</h1>
            <p className="text-muted-foreground">Acompanhe seus hábitos de saúde e bem-estar</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Novo Hábito
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Novo Hábito</DialogTitle>
                <DialogDescription>Adicione um hábito para acompanhar</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Hábito</Label>
                  <Input
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="Ex: Beber 2L de água, Academia..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select
                      value={newHabit.icon}
                      onValueChange={(v) => setNewHabit({ ...newHabit, icon: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <span>{opt.value}</span>
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Select
                      value={newHabit.color}
                      onValueChange={(v) => setNewHabit({ ...newHabit, color: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: opt.value }} />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta (opcional)</Label>
                    <Input
                      value={newHabit.targetValue}
                      onChange={(e) => setNewHabit({ ...newHabit, targetValue: e.target.value })}
                      placeholder="Ex: uma hora, 2 litros, 8 copos..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade (opcional)</Label>
                    <Input
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                      placeholder="Ex: litros, copos, passos..."
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={newHabit.frequency}
                    onValueChange={(v: any) => setNewHabit({ ...newHabit, frequency: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => createHabit.mutate(newHabit)}
                  disabled={!newHabit.name || createHabit.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createHabit.isPending ? "Criando..." : "Criar Hábito"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Week Navigation */}
        <Card className="bg-card border-border">
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
                  Esta semana
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Habits Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando hábitos...
          </div>
        ) : habits && habits.length > 0 ? (
          <div className="grid gap-4">
            {habits.map(habit => {
              const progress = calculateWeeklyProgress(habit.id);
              const IconComponent = getIconComponent(habit.icon || "🎯");
              
              return (
                <Card key={habit.id} className="bg-card border-border">
                  <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Habit Info */}
                      <div className="flex items-center gap-4 lg:w-64">
                        <div 
                          className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${habit.color || "#10b981"}20` }}
                        >
                          <span className="text-2xl">{habit.icon || "🎯"}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
                          {habit.targetValue && (
                            <p className="text-xs text-muted-foreground">
                              Meta: {habit.targetValue} {habit.unit || ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Week Days */}
                      <div className="flex-1 grid grid-cols-7 gap-2">
                        {weekDates.map((date, i) => {
                          const log = getLogStatus(habit.id, date);
                          const isCompleted = log?.completed || false;
                          const isToday = date.toDateString() === new Date().toDateString();
                          
                          return (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <span className={`text-xs ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                                {dayNames[i]}
                              </span>
                              <button
                                onClick={() => handleLogToggle(habit.id, date, isCompleted)}
                                disabled={setLog.isPending}
                                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted 
                                    ? "bg-primary/20" 
                                    : isToday 
                                      ? "bg-secondary border-2 border-primary/50" 
                                      : "bg-secondary hover:bg-secondary/80"
                                }`}
                                style={isCompleted ? { backgroundColor: `${habit.color || "#10b981"}30` } : {}}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5" style={{ color: habit.color || "#10b981" }} />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </button>
                              <span className={`text-xs ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                                {date.getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress */}
                      <div className="lg:w-40 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Progresso</span>
                          <span 
                            className="text-sm font-bold"
                            style={{ color: habit.color || "#10b981" }}
                          >
                            {progress.percentage}%
                          </span>
                        </div>
                        <Progress 
                          value={progress.percentage} 
                          className="h-2"
                          style={{ 
                            ["--progress-background" as any]: `${habit.color || "#10b981"}30`,
                            ["--progress-foreground" as any]: habit.color || "#10b981"
                          }}
                        />
                        <span className="text-xs text-muted-foreground text-center">
                          {progress.completed}/{progress.total} dias
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 lg:ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingHabit(habit)}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openShareDialog(habit)}
                        >
                          <Share2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (confirm("Remover este hábito?")) {
                              deleteHabit.mutate({ id: habit.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum hábito cadastrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Novo Hábito" para começar a rastrear
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingHabit} onOpenChange={() => setEditingHabit(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Hábito</DialogTitle>
            </DialogHeader>
            {editingHabit && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingHabit.name}
                    onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select
                      value={editingHabit.icon || "🎯"}
                      onValueChange={(v) => setEditingHabit({ ...editingHabit, icon: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <span>{opt.value}</span>
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Select
                      value={editingHabit.color || "#10b981"}
                      onValueChange={(v) => setEditingHabit({ ...editingHabit, color: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: opt.value }} />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta</Label>
                    <Input
                      value={editingHabit.targetValue || ""}
                      onChange={(e) => setEditingHabit({ ...editingHabit, targetValue: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input
                      value={editingHabit.unit || ""}
                      onChange={(e) => setEditingHabit({ ...editingHabit, unit: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingHabit(null)}>Cancelar</Button>
              <Button 
                onClick={() => updateHabit.mutate({
                  id: editingHabit.id,
                  name: editingHabit.name,
                  icon: editingHabit.icon,
                  color: editingHabit.color,
                  targetValue: editingHabit.targetValue,
                  unit: editingHabit.unit
                })}
                disabled={updateHabit.isPending}
                className="bg-primary text-primary-foreground"
              >
                {updateHabit.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Compartilhamento */}
      <Dialog open={!!shareDialogHabit} onOpenChange={(open) => !open && setShareDialogHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Hábito</DialogTitle>
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
            <Button variant="outline" onClick={() => setShareDialogHabit(null)}>
              Cancelar
            </Button>
            <Button onClick={handleShare} disabled={shareHabit.isPending}>
              {shareHabit.isPending ? "Compartilhando..." : "Compartilhar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
