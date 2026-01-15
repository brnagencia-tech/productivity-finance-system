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
import { Plus, Trash2, Edit2, Receipt, Calendar, Building2, FileText, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function VariableExpenses() {
  const [scope, setScope] = useState<"personal" | "professional">("personal");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "BRL" | "USD">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  });

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0],
    categoryId: undefined as number | undefined,
    company: "",
    cnpj: "",
    description: "",
    amount: "",
    currency: "BRL" as "BRL" | "USD",
    notes: "",
    receiptUrl: "",
    scope: "personal" as const
  });

  const utils = trpc.useUtils();

  const startDate = new Date(dateFilter.year, dateFilter.month - 1, 1);
  const endDate = new Date(dateFilter.year, dateFilter.month, 0, 23, 59, 59);

  const { data: expenses, isLoading } = trpc.expenses.listVariable.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    scope
  });

  const { data: categories } = trpc.categories.list.useQuery({ type: "expense" });

  const createExpense = trpc.expenses.createVariable.useMutation({
    onSuccess: () => {
      utils.expenses.listVariable.invalidate();
      utils.expenses.getByCategory.invalidate();
      utils.expenses.getMonthlyTrend.invalidate();
      utils.dashboard.getStats.invalidate();
      setIsCreateOpen(false);
      setNewExpense({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0],
        categoryId: undefined,
        company: "",
        cnpj: "",
        description: "",
        amount: "",
        currency: "BRL" as "BRL" | "USD",
        notes: "",
        receiptUrl: "",
        scope: "personal"
      });
      toast.success("Despesa registrada!");
    },
    onError: () => toast.error("Erro ao registrar despesa")
  });

  const updateExpense = trpc.expenses.updateVariable.useMutation({
    onSuccess: () => {
      utils.expenses.listVariable.invalidate();
      utils.expenses.getByCategory.invalidate();
      utils.expenses.getMonthlyTrend.invalidate();
      setEditingExpense(null);
      toast.success("Despesa atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar despesa")
  });

  const deleteExpense = trpc.expenses.deleteVariable.useMutation({
    onSuccess: () => {
      utils.expenses.listVariable.invalidate();
      utils.expenses.getByCategory.invalidate();
      utils.expenses.getMonthlyTrend.invalidate();
      utils.dashboard.getStats.invalidate();
      toast.success("Despesa removida!");
    },
    onError: () => toast.error("Erro ao remover despesa")
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    if (currencyFilter === "all") return expenses;
    return expenses.filter(exp => exp.currency === currencyFilter);
  }, [expenses, currencyFilter]);

  const total = useMemo(() => {
    if (!filteredExpenses) return 0;
    return filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [filteredExpenses]);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(num);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    });
  };

  const getCategoryById = (id: number | null) => {
    if (!id || !categories) return null;
    return categories.find(c => c.id === id);
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Rastreador de Despesas</h1>
            <p className="text-muted-foreground">Registre e acompanhe seus gastos variáveis</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={currencyFilter} onValueChange={(v: "all" | "BRL" | "USD") => setCurrencyFilter(v)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Moedas</SelectItem>
                <SelectItem value="BRL">BRL (R$)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-foreground">Registrar Despesa</DialogTitle>
                <DialogDescription>Adicione uma nova despesa variável</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={newExpense.time}
                      onChange={(e) => setNewExpense({ ...newExpense, time: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select
                      value={newExpense.currency}
                      onValueChange={(v: "BRL" | "USD") => setNewExpense({ ...newExpense, currency: v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0,00"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={newExpense.categoryId?.toString()}
                      onValueChange={(v) => setNewExpense({ ...newExpense, categoryId: parseInt(v) })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.filter(c => c.scope === scope || c.scope === "both").map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span style={{ color: cat.color }}>{cat.icon}</span>
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newExpense.scope}
                      onValueChange={(v: any) => setNewExpense({ ...newExpense, scope: v })}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Empresa/Estabelecimento</Label>
                    <Input
                      value={newExpense.company}
                      onChange={(e) => setNewExpense({ ...newExpense, company: e.target.value })}
                      placeholder="Ex: Restaurante, Uber, Amazon..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ (opcional)</Label>
                    <Input
                      value={newExpense.cnpj}
                      onChange={(e) => setNewExpense({ ...newExpense, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Ex: Almoço com cliente, Passagem aérea..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="Observações adicionais..."
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => createExpense.mutate(newExpense)}
                  disabled={!newExpense.amount || createExpense.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createExpense.isPending ? "Salvando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Pessoal
              </TabsTrigger>
              <TabsTrigger value="professional" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Profissional
              </TabsTrigger>
            </TabsList>

            {/* Month Filter */}
            <div className="flex items-center gap-2">
              <Select
                value={dateFilter.month.toString()}
                onValueChange={(v) => setDateFilter({ ...dateFilter, month: parseInt(v) })}
              >
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={dateFilter.year.toString()}
                onValueChange={(v) => setDateFilter({ ...dateFilter, year: parseInt(v) })}
              >
                <SelectTrigger className="w-[100px] bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={scope} className="mt-4">
            {/* Total Card */}
            <Card className="bg-card border-border mb-4">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total em {monthNames[dateFilter.month - 1]}</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(total)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data
                        </div>
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Empresa
                        </div>
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Descrição
                        </div>
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Valor</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Notas</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          Carregando despesas...
                        </td>
                      </tr>
                    ) : filteredExpenses && filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => {
                        const category = getCategoryById(expense.categoryId);
                        return (
                          <tr key={expense.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                            <td className="p-4 text-foreground">
                              {formatDate(expense.date)}
                            </td>
                            <td className="p-4">
                              {category ? (
                                <span 
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{ 
                                    backgroundColor: `${category.color}20`,
                                    color: category.color
                                  }}
                                >
                                  {category.icon} {category.name}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4 text-foreground">
                              {expense.company || "-"}
                            </td>
                            <td className="p-4 text-foreground max-w-[200px] truncate">
                              {expense.description || "-"}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-medium text-foreground">
                                  {formatCurrency(expense.amount)}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  expense.currency === 'BRL' 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                  {expense.currency === 'BRL' ? 'R$' : '$'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground text-sm max-w-[150px] truncate">
                              {expense.notes || "-"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingExpense(expense)}
                                >
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    if (confirm("Remover esta despesa?")) {
                                      deleteExpense.mutate({ id: expense.id });
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
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma despesa em {monthNames[dateFilter.month - 1]}</p>
                          <p className="text-sm mt-1">Clique em "Nova Despesa" para registrar</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {expenses && expenses.length > 0 && (
                    <tfoot>
                      <tr className="bg-primary/5">
                        <td colSpan={4} className="p-4 font-bold text-foreground">TOTAL</td>
                        <td className="p-4 text-right font-bold text-primary text-lg">
                          {formatCurrency(total)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Despesa</DialogTitle>
            </DialogHeader>
            {editingExpense && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={new Date(editingExpense.date).toISOString().split("T")[0]}
                      onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={editingExpense.categoryId?.toString()}
                    onValueChange={(v) => setEditingExpense({ ...editingExpense, categoryId: parseInt(v) })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span style={{ color: cat.color }}>{cat.icon}</span>
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={editingExpense.company || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, company: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={editingExpense.description || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={editingExpense.notes || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancelar</Button>
              <Button 
                onClick={() => updateExpense.mutate({
                  id: editingExpense.id,
                  date: editingExpense.date,
                  categoryId: editingExpense.categoryId,
                  company: editingExpense.company,
                  description: editingExpense.description,
                  amount: editingExpense.amount,
                  notes: editingExpense.notes
                })}
                disabled={updateExpense.isPending}
                className="bg-primary text-primary-foreground"
              >
                {updateExpense.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
