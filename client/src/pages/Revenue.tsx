import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Trash2, Building2, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Revenue() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    company: "",
    amount: "",
    paymentMethod: "",
    status: "completed" as "pending" | "completed" | "cancelled",
    notes: ""
  });

  const { data: sales, refetch } = trpc.sales.list.useQuery({ month: selectedMonth, year: selectedYear });
  const { data: dailySplit } = trpc.sales.getDailySplit.useQuery({ month: selectedMonth, year: selectedYear });
  const { data: profitLoss } = trpc.sales.getProfitLoss.useQuery({ month: selectedMonth, year: selectedYear });
  const { data: monthlyRevenue } = trpc.sales.getMonthlyRevenue.useQuery({ year: selectedYear });

  const createSale = trpc.sales.create.useMutation({
    onSuccess: () => {
      toast.success("Venda registrada com sucesso!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const deleteSale = trpc.sales.delete.useMutation({
    onSuccess: () => {
      toast.success("Venda removida!");
      refetch();
    }
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      company: "",
      amount: "",
      paymentMethod: "",
      status: "completed",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSale.mutate({
      date: formData.date,
      description: formData.description || undefined,
      company: formData.company || undefined,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod || undefined,
      status: formData.status,
      notes: formData.notes || undefined
    });
  };

  const totalRevenue = sales?.reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;
  const completedRevenue = sales?.filter(s => s.status === "completed").reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;
  const pendingRevenue = sales?.filter(s => s.status === "pending").reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;

  const chartData = monthlyRevenue?.map(m => ({
    name: months[m.month - 1].substring(0, 3),
    receita: m.total
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
            <p className="text-muted-foreground">Controle de vendas e receitas</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Venda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Registrar Venda</DialogTitle>
                    <DialogDescription>Adicione uma nova venda ou receita</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Empresa/Cliente</Label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nome da empresa ou cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição da venda"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <Select value={formData.paymentMethod} onValueChange={(v) => setFormData(prev => ({ ...prev, paymentMethod: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                            <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v: "pending" | "completed" | "cancelled") => setFormData(prev => ({ ...prev, status: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Recebido</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createSale.isPending}>
                      {createSale.isPending ? "Salvando..." : "Registrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{months[selectedMonth - 1]} {selectedYear}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recebido</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {completedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{sales?.filter(s => s.status === "completed").length || 0} vendas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{sales?.filter(s => s.status === "pending").length || 0} vendas</p>
            </CardContent>
          </Card>
          <Card className={profitLoss && profitLoss.profit < 0 ? "border-red-200" : "border-green-200"}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              {profitLoss && profitLoss.profit < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss && profitLoss.profit < 0 ? "text-red-600" : "text-green-600"}`}>
                R$ {(profitLoss?.profit || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Margem: {(profitLoss?.profitMargin || 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de Gastos */}
        {profitLoss && profitLoss.profit < 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Alerta: Prejuízo no mês!</p>
                <p className="text-sm text-red-600">
                  Suas despesas (R$ {profitLoss.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) 
                  estão maiores que suas receitas. Revise seus gastos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico de Receita Anual */}
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal - {selectedYear}</CardTitle>
              <CardDescription>Evolução da receita ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                    <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Split Diário */}
          <Card>
            <CardHeader>
              <CardTitle>Split Diário</CardTitle>
              <CardDescription>Vendas por dia no mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySplit?.map(d => ({
                    dia: new Date(d.date).getDate(),
                    valor: d.total
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                    <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas do Mês</CardTitle>
            <CardDescription>Todas as vendas de {months[selectedMonth - 1]} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {sales && sales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Empresa/Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {sale.company || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{sale.description || "-"}</TableCell>
                      <TableCell className="capitalize">{sale.paymentMethod?.replace("_", " ") || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          sale.status === "completed" ? "default" :
                          sale.status === "pending" ? "secondary" : "destructive"
                        }>
                          {sale.status === "completed" ? "Recebido" :
                           sale.status === "pending" ? "Pendente" : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {parseFloat(sale.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Remover esta venda?")) {
                              deleteSale.mutate({ id: sale.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma venda registrada neste mês.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
