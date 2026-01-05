import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Tags, Wallet, CheckSquare, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconOptions = [
  // Expense icons
  { value: "🍔", label: "Alimentação" },
  { value: "✈️", label: "Transporte" },
  { value: "🏠", label: "Moradia" },
  { value: "💡", label: "Utilidades" },
  { value: "🏥", label: "Saúde" },
  { value: "👕", label: "Roupas" },
  { value: "🎬", label: "Entretenimento" },
  { value: "📚", label: "Educação" },
  { value: "💼", label: "Trabalho" },
  { value: "🛒", label: "Compras" },
  { value: "🎁", label: "Presentes" },
  { value: "💰", label: "Investimentos" },
  { value: "📱", label: "Tecnologia" },
  { value: "🚗", label: "Veículo" },
  { value: "🏨", label: "Hospedagem" },
  // Task icons
  { value: "📋", label: "Tarefas" },
  { value: "📅", label: "Agenda" },
  { value: "📧", label: "E-mail" },
  { value: "📞", label: "Ligações" },
  { value: "💻", label: "Computador" },
  // Habit icons
  { value: "💧", label: "Água" },
  { value: "🏋️", label: "Exercício" },
  { value: "🥗", label: "Dieta" },
  { value: "🚶", label: "Caminhada" },
  { value: "😴", label: "Sono" },
  { value: "🧘", label: "Meditação" },
];

const colorOptions = [
  { value: "#10b981", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#f97316", label: "Laranja" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6366f1", label: "Índigo" },
];

const typeLabels: Record<string, { label: string; icon: any }> = {
  expense: { label: "Despesas", icon: Wallet },
  task: { label: "Tarefas", icon: CheckSquare },
  habit: { label: "Hábitos", icon: Heart },
};

export default function Categories() {
  const [activeType, setActiveType] = useState<"expense" | "task" | "habit">("expense");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "🍔",
    color: "#10b981",
    type: "expense" as const,
    scope: "personal" as const
  });

  const utils = trpc.useUtils();

  const { data: categories, isLoading } = trpc.categories.list.useQuery({ type: activeType });

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setIsCreateOpen(false);
      setNewCategory({
        name: "",
        icon: "🍔",
        color: "#10b981",
        type: "expense",
        scope: "personal"
      });
      toast.success("Categoria criada!");
    },
    onError: () => toast.error("Erro ao criar categoria")
  });

  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setEditingCategory(null);
      toast.success("Categoria atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar categoria")
  });

  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Categoria removida!");
    },
    onError: () => toast.error("Erro ao remover categoria")
  });

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "personal": return "Pessoal";
      case "professional": return "Profissional";
      case "both": return "Ambos";
      default: return scope;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Gerenciar Categorias</h1>
            <p className="text-muted-foreground">Personalize categorias para despesas, tarefas e hábitos</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Nova Categoria</DialogTitle>
                <DialogDescription>Adicione uma categoria personalizada</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Categoria</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Ex: Alimentação, Academia..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select
                      value={newCategory.icon}
                      onValueChange={(v) => setNewCategory({ ...newCategory, icon: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
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
                      value={newCategory.color}
                      onValueChange={(v) => setNewCategory({ ...newCategory, color: v })}
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
                    <Label>Tipo</Label>
                    <Select
                      value={newCategory.type}
                      onValueChange={(v: any) => setNewCategory({ ...newCategory, type: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Despesas</SelectItem>
                        <SelectItem value="task">Tarefas</SelectItem>
                        <SelectItem value="habit">Hábitos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Escopo</Label>
                    <Select
                      value={newCategory.scope}
                      onValueChange={(v: any) => setNewCategory({ ...newCategory, scope: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Pessoal</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => createCategory.mutate(newCategory)}
                  disabled={!newCategory.name || createCategory.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createCategory.isPending ? "Criando..." : "Criar Categoria"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="expense" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wallet className="h-4 w-4 mr-2" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="task" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="habit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Heart className="h-4 w-4 mr-2" />
              Hábitos
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeType} className="mt-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando categorias...
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(category => (
                  <Card key={category.id} className="bg-card border-border">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-12 w-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <span className="text-2xl">{category.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {getScopeLabel(category.scope)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm("Remover esta categoria?")) {
                                deleteCategory.mutate({ id: category.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Tags className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhuma categoria de {typeLabels[activeType].label.toLowerCase()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em "Nova Categoria" para adicionar
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Categoria</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select
                      value={editingCategory.icon}
                      onValueChange={(v) => setEditingCategory({ ...editingCategory, icon: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
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
                      value={editingCategory.color}
                      onValueChange={(v) => setEditingCategory({ ...editingCategory, color: v })}
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
                <div className="space-y-2">
                  <Label>Escopo</Label>
                  <Select
                    value={editingCategory.scope}
                    onValueChange={(v) => setEditingCategory({ ...editingCategory, scope: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancelar</Button>
              <Button 
                onClick={() => updateCategory.mutate({
                  id: editingCategory.id,
                  name: editingCategory.name,
                  icon: editingCategory.icon,
                  color: editingCategory.color,
                  scope: editingCategory.scope
                })}
                disabled={updateCategory.isPending}
                className="bg-primary text-primary-foreground"
              >
                {updateCategory.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
