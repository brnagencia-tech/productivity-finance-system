import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { ReceiptUpload } from "@/components/ReceiptUpload";

export default function Revenues() {
  const [activeTab, setActiveTab] = useState<"pessoal" | "empresa">("pessoal");
  const [currency, setCurrency] = useState<"BRL" | "USD" | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    currency: "BRL" as "BRL" | "USD",
    category: "",
    client: "",
    notes: "",
    receiptUrl: "",
  });

  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Queries
  const { data: revenues, isLoading } = trpc.revenues.list.useQuery({
    revenueType: activeTab,
    currency: currency === "all" ? undefined : currency,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: totals } = trpc.revenues.getTotalsByTypeAndCurrency.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Mutations
  const createMutation = trpc.revenues.create.useMutation({
    onSuccess: () => {
      toast({ title: "Receita criada com sucesso!" });
      utils.revenues.list.invalidate();
      utils.revenues.getTotalsByTypeAndCurrency.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar receita", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.revenues.update.useMutation({
    onSuccess: () => {
      toast({ title: "Receita atualizada com sucesso!" });
      utils.revenues.list.invalidate();
      utils.revenues.getTotalsByTypeAndCurrency.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar receita", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.revenues.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Receita excluída com sucesso!" });
      utils.revenues.list.invalidate();
      utils.revenues.getTotalsByTypeAndCurrency.invalidate();
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir receita", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      currency: "BRL",
      category: "",
      client: "",
      notes: "",
      receiptUrl: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData, revenueType: activeTab });
    } else {
      createMutation.mutate({ ...formData, revenueType: activeTab });
    }
  };

  const handleEdit = (revenue: any) => {
    setEditingId(revenue.id);
    setFormData({
      date: new Date(revenue.date).toISOString().split('T')[0],
      description: revenue.description,
      amount: revenue.amount,
      currency: revenue.currency,
      category: revenue.category || "",
      client: revenue.client || "",
      notes: revenue.notes || "",
      receiptUrl: revenue.receiptUrl || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta receita?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleUploadComplete = (data: any) => {
    setFormData(prev => ({
      ...prev,
      receiptUrl: data.receiptUrl,
      ...(data.company && { client: data.company }),
      ...(data.amount && { amount: data.amount }),
      ...(data.date && { date: data.date }),
    }));
  };

  const formatCurrency = (value: string, curr: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: curr,
    }).format(num);
  };

  const getTotalByCurrency = (curr: "BRL" | "USD", type: "pessoal" | "empresa") => {
    if (!totals) return 0;
    const found = totals.find(t => t.currency === curr && t.revenueType === type);
    return found ? parseFloat(found.total as any) : 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Faturamento</h1>
            <p className="text-muted-foreground">Gerencie suas receitas pessoais e empresariais</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Receita" : "Nova Receita"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moeda *</Label>
                    <Select value={formData.currency} onValueChange={(value: "BRL" | "USD") => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (BRL)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Consultoria de Marketing"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ex: Serviços"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="client">Cliente/Empresa Pagadora</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Informações adicionais"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Comprovante de Recebimento</Label>
                  <ReceiptUpload onUploadComplete={handleUploadComplete} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Totais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pessoal (BRL)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalByCurrency("BRL", "pessoal").toString(), "BRL")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pessoal (USD)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalByCurrency("USD", "pessoal").toString(), "USD")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresa (BRL)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalByCurrency("BRL", "empresa").toString(), "BRL")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresa (USD)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalByCurrency("USD", "empresa").toString(), "USD")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-currency">Moeda</Label>
                <Select value={currency} onValueChange={(value: any) => setCurrency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-start">Data Início</Label>
                <Input
                  id="filter-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filter-end">Data Fim</Label>
                <Input
                  id="filter-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs e Lista */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList>
            <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Carregando...
                </CardContent>
              </Card>
            ) : !revenues || revenues.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma receita encontrada. Clique em "Nova Receita" para começar.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {revenues.map((revenue: any) => (
                  <Card key={revenue.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{revenue.description}</h3>
                            <span className="text-sm px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {revenue.currency}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{new Date(revenue.date).toLocaleDateString("pt-BR")}</span>
                            {revenue.client && <span>• {revenue.client}</span>}
                            {revenue.category && <span>• {revenue.category}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-foreground">
                            {formatCurrency(revenue.amount, revenue.currency)}
                          </span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(revenue)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(revenue.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
