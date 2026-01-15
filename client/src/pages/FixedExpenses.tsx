import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Receipt, Calendar, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function FixedExpenses() {
  const [scope, setScope] = useState<"personal" | "professional">("personal");
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
    description: "",
    categoryId: undefined as number | undefined,
    amount: "",
    currency: "BRL" as "BRL" | "USD",
    expenseType: "pessoal" as "pessoal" | "empresa",
    dueDay: 1,
    scope: "personal" as const
  });

  const utils = trpc.useUtils();

  const { data: expenses, isLoading } = trpc.expenses.listFixed.useQuery({ scope });
  const { data: payments } = trpc.expenses.getFixedPayments.useQuery({
    month: dateFilter.month,
    year: dateFilter.year
  });
  const { data: categories } = trpc.categories.list.useQuery({ type: "expense" });

  const createExpense = trpc.expenses.createFixed.useMutation({
    onSuccess: () => {
      utils.expenses.listFixed.invalidate();
      setIsCreateOpen(false);
      setNewExpense({
        description: "",
        categoryId: undefined,
        amount: "",
        currency: "BRL" as "BRL" | "USD",
        expenseType: "pessoal" as "pessoal" | "empresa",
        dueDay: 1,
        scope: "personal"
      });
      toast.success("Despesa fixa criada!");
    },
    onError: () => toast.error("Erro ao criar despesa")
  });

  const updateExpense = trpc.expenses.updateFixed.useMutation({
    onSuccess: () => {
      utils.expenses.listFixed.invalidate();
      setEditingExpense(null);
      toast.success("Despesa atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar despesa")
  });

  const deleteExpense = trpc.expenses.deleteFixed.useMutation({
    onSuccess: () => {
      utils.expenses.listFixed.invalidate();
      toast.success("Despesa removida!");
    },
    onError: () => toast.error("Erro ao remover despesa")
  });

  const setPayment = trpc.expenses.setFixedPayment.useMutation({
    onSuccess: () => {
      utils.expenses.getFixedPayments.invalidate();
      utils.dashboard.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar pagamento")
  });

  const total = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [expenses]);

  const paidTotal = useMemo(() => {
    if (!expenses || !payments) return 0;
    return expenses.reduce((sum, exp) => {
      const payment = payments.find(p => p.fixedExpenseId === exp.id);
      if (payment?.isPaid) {
        return sum + parseFloat(payment.paidAmount || exp.amount);
      }
      return sum;
    }, 0);
  }, [expenses, payments]);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(num);
  };

  const getPaymentStatus = (expenseId: number) => {
    if (!payments) return null;
    return payments.find(p => p.fixedExpenseId === expenseId);
  };

  const handlePaymentToggle = (expenseId: number, currentStatus: boolean) => {
    setPayment.mutate({
      fixedExpenseId: expenseId,
      month: dateFilter.month,
      year: dateFilter.year,
      isPaid: !currentStatus
    });
  };

  const getCategoryById = (id: number | null) => {
    if (!id || !categories) return null;
    return categories.find(c => c.id === id);
  };

  const getDueDateStatus = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (dateFilter.month === currentMonth && dateFilter.year === currentYear) {
      if (dueDay < currentDay) return "overdue";
      if (dueDay === currentDay) return "today";
      if (dueDay <= currentDay + 3) return "soon";
    }
    return "normal";
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Controle de Despesas Fixas</h1>
            <p className="text-muted-foreground">Gerencie suas contas mensais recorrentes</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa Fixa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Despesa Fixa</DialogTitle>
                <DialogDescription>Adicione uma conta mensal recorrente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Ex: Aluguel, Internet, Plano de Saúde..."
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <Label>Dia de Vencimento</Label>
                    <Select
                      value={newExpense.dueDay.toString()}
                      onValueChange={(v) => setNewExpense({ ...newExpense, dueDay: parseInt(v) })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Dia {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label>Contexto</Label>
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
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newExpense.expenseType}
                    onValueChange={(v: "pessoal" | "empresa") => setNewExpense({ ...newExpense, expenseType: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={() => createExpense.mutate(newExpense)}
                  disabled={!newExpense.description || !newExpense.amount || createExpense.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createExpense.isPending ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <Card className="bg-card border-border">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Total Mensal</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Pago</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(paidTotal)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(total - paidTotal)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Expenses Table */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Descrição</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Valor</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Vencimento
                        </div>
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Pago</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          Carregando despesas...
                        </td>
                      </tr>
                    ) : expenses && expenses.length > 0 ? (
                      expenses.map((expense) => {
                        const category = getCategoryById(expense.categoryId);
                        const payment = getPaymentStatus(expense.id);
                        const isPaid = payment?.isPaid || false;
                        const dueStatus = getDueDateStatus(expense.dueDay);
                        
                        return (
                          <tr 
                            key={expense.id} 
                            className={`border-b border-border hover:bg-secondary/30 transition-colors ${isPaid ? "opacity-60" : ""}`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isPaid ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {expense.description}
                                </span>
                                {!isPaid && dueStatus === "overdue" && (
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                )}
                                {!isPaid && dueStatus === "today" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                                    Hoje
                                  </span>
                                )}
                                {!isPaid && dueStatus === "soon" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                                    Em breve
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right font-medium text-foreground">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="p-4 text-center text-muted-foreground">
                              Dia {expense.dueDay}
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
                            <td className="p-4 text-center">
                              <Checkbox
                                checked={isPaid}
                                onCheckedChange={() => handlePaymentToggle(expense.id, isPaid)}
                                disabled={setPayment.isPending}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
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
                                    if (confirm("Remover esta despesa fixa?")) {
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
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma despesa fixa cadastrada</p>
                          <p className="text-sm mt-1">Clique em "Nova Despesa Fixa" para adicionar</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Despesa Fixa</DialogTitle>
            </DialogHeader>
            {editingExpense && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label>Dia de Vencimento</Label>
                    <Select
                      value={editingExpense.dueDay.toString()}
                      onValueChange={(v) => setEditingExpense({ ...editingExpense, dueDay: parseInt(v) })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Dia {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancelar</Button>
              <Button 
                onClick={() => updateExpense.mutate({
                  id: editingExpense.id,
                  description: editingExpense.description,
                  amount: editingExpense.amount,
                  dueDay: editingExpense.dueDay,
                  categoryId: editingExpense.categoryId
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
