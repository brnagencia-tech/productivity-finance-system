import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import InfoTooltip from "@/components/InfoTooltip";
import { 
  CheckCircle2, 
  Wallet, 
  Target, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Droplets,
  Dumbbell,
  Utensils,
  Footprints,
  DollarSign
} from "lucide-react";
import { useMemo, useState } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid,
  Legend
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Home() {
  const now = new Date();
  const [periodFilter, setPeriodFilter] = useState('month');
  
  // Calcular datas baseadas no filtro
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (periodFilter) {
      case 'today':
        return {
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          month: today.getMonth() + 1,
          year: today.getFullYear()
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        const weekEnd = new Date(today);
        weekEnd.setHours(23, 59, 59, 999);
        return {
          startDate: weekStart,
          endDate: weekEnd,
          month: today.getMonth() + 1,
          year: today.getFullYear()
        };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(today);
        monthEnd.setHours(23, 59, 59, 999);
        return {
          startDate: monthStart,
          endDate: monthEnd,
          month: today.getMonth() + 1,
          year: today.getFullYear()
        };
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        return {
          startDate: yearStart,
          endDate: yearEnd,
          month: today.getMonth() + 1,
          year: today.getFullYear()
        };
      default:
        return {
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          month: today.getMonth() + 1,
          year: today.getFullYear()
        };
    }
  };
  
  const dateRange = getDateRange();
  const currentMonth = dateRange.month;
  const currentYear = dateRange.year;

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery({
    month: currentMonth,
    year: currentYear
  });

  const { data: expensesByCategory } = trpc.expenses.getByCategory.useQuery({
    month: currentMonth,
    year: currentYear
  });

  const { data: monthlyTrend } = trpc.expenses.getMonthlyTrend.useQuery({
    year: currentYear
  });

  const { data: profitLoss } = trpc.sales.getProfitLoss.useQuery({
    month: currentMonth,
    year: currentYear
  });

  const { data: habits } = trpc.habits.list.useQuery();
  
  // Estatísticas de gastos por tipo e moeda
  const { data: expenseStats } = trpc.expenses.getStatsByTypeAndCurrency.useQuery({
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString()
  });
  
  // Totais de faturamento por moeda
  const { data: revenueTotals, isLoading: revenueTotalsLoading } = trpc.revenues.getTotalsByTypeAndCurrency.useQuery({
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString()
  });
  
  // Totais de despesas por moeda
  const { data: expensesTotals, isLoading: expensesTotalsLoading } = trpc.expenses.getTotalsByCurrency.useQuery({
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString()
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const { data: habitLogs } = trpc.habits.getLogs.useQuery({
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString()
  });

  const pieData = useMemo(() => {
    if (!expensesByCategory) return [];
    return expensesByCategory.map(item => ({
      name: item.categoryName || "Sem categoria",
      value: parseFloat(item.total || "0"),
      color: item.categoryColor || "#6b7280"
    }));
  }, [expensesByCategory]);

  const barData = useMemo(() => {
    if (!monthlyTrend) return [];
    return monthlyTrend.map(item => ({
      name: monthNames[item.month - 1],
      total: item.total
    }));
  }, [monthlyTrend]);

  const habitStats = useMemo(() => {
    if (!habits || !habitLogs) return [];
    return habits.slice(0, 4).map(habit => {
      const logs = habitLogs.filter(log => log.habitId === habit.id);
      const completed = logs.filter(log => log.completed).length;
      const total = habit.frequency === "daily" ? 7 : 1;
      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        completed,
        total,
        percentage: Math.round((completed / total) * 100)
      };
    });
  }, [habits, habitLogs]);

  const getHabitIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("água") || lower.includes("water")) return Droplets;
    if (lower.includes("academia") || lower.includes("gym") || lower.includes("exerc")) return Dumbbell;
    if (lower.includes("aliment") || lower.includes("comida") || lower.includes("dieta")) return Utensils;
    if (lower.includes("caminh") || lower.includes("walk") || lower.includes("passo")) return Footprints;
    return Target;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com Filtros */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-ai">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Visão geral em tempo real das suas tarefas, finanças e hábitos
            </p>
          </div>
          
          {/* Filtros de Período */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Hoje', value: 'today' },
              { label: 'Últimos 7 dias', value: 'week' },
              { label: 'Últimos 30 dias', value: 'month' },
              { label: 'Este Ano', value: 'year' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setPeriodFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  periodFilter === filter.value 
                    ? 'bg-primary text-primary-foreground shadow-lg glow-primary scale-105' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Hoje</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {statsLoading ? "..." : `${stats?.tasksToday?.completed || 0}/${stats?.tasksToday?.total || 0}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.tasksToday?.total ? Math.round((stats.tasksToday.completed / stats.tasksToday.total) * 100) : 0}% concluídas
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gastos do Mês</CardTitle>
              <Wallet className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {statsLoading ? "..." : formatCurrency(stats?.monthlyExpenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {monthNames[currentMonth - 1]} {currentYear}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hábitos Hoje</CardTitle>
              <Target className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {statsLoading ? "..." : `${stats?.habitsToday?.completed || 0}/${stats?.habitsToday?.total || 0}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.habitsToday?.total ? Math.round((stats.habitsToday.completed / stats.habitsToday.total) * 100) : 0}% completados
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tendência</CardTitle>
              {(barData[currentMonth - 1]?.total || 0) > (barData[currentMonth - 2]?.total || 0) ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-primary" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(() => {
                  const currentTotal = barData[currentMonth - 1]?.total || 0;
                  const previousTotal = barData[currentMonth - 2]?.total || 0;
                  if (previousTotal === 0 && currentTotal === 0) return "0%";
                  if (previousTotal === 0) return "+100%";
                  const change = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
                  const clampedChange = Math.max(-100, Math.min(change, 999));
                  return (clampedChange > 0 ? "+" : "") + clampedChange + "%";
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Faturamento Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita</CardTitle>
                <InfoTooltip 
                  title="Como é calculada a Receita?"
                  description="A receita representa todo o dinheiro que você recebeu no mês, incluindo vendas, comissões e outros faturamentos registrados."
                  formula="Receita = Soma de todos os Faturamentos do mês"
                  example="Se você registrou R$ 3.000 em vendas + R$ 800 em comissões = R$ 3.800 de receita total."
                />
              </div>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(profitLoss?.revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {monthNames[currentMonth - 1]} {currentYear}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
                <InfoTooltip 
                  title="Como são calculadas as Despesas?"
                  description="As despesas somam TODAS as despesas fixas ativas (que aparecem todo mês) + despesas variáveis registradas no mês atual."
                  formula="Despesas = Despesas Fixas Ativas + Despesas Variáveis do Mês"
                  example="Despesas Fixas (aluguel R$ 1.200 + internet R$ 100) + Despesas Variáveis (mercado R$ 500) = R$ 1.800 total."
                />
              </div>
              <Wallet className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(profitLoss?.totalExpenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fixas + Variaveis
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
                <InfoTooltip 
                  title="Como é calculado o Lucro Líquido?"
                  description="O lucro líquido é o resultado final do mês: quanto sobrou (ou faltou) depois de pagar todas as despesas."
                  formula="Lucro Líquido = Receita - Despesas Totais"
                  example="Receita R$ 3.800 - Despesas R$ 1.800 = Lucro de R$ 2.000. Se negativo, você teve prejuízo no mês."
                />
              </div>
              {(profitLoss?.profit || 0) < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(profitLoss?.profit || 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(profitLoss?.profit || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {(profitLoss?.profitMargin || 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Faturamento e Despesas por Moeda */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Faturamento e Despesas por Moeda</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Faturamento BRL */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento (R$)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {revenueTotalsLoading ? (
                  <div className="text-2xl font-bold text-muted-foreground animate-pulse">
                    Carregando...
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    R$ {(() => {
                      const brlRevenue = revenueTotals?.find((r: any) => r.currency === 'BRL');
                      return brlRevenue ? Number(brlRevenue.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
                    })()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Real Brasileiro
                </p>
              </CardContent>
            </Card>

            {/* Faturamento USD */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento ($)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {revenueTotalsLoading ? (
                  <div className="text-2xl font-bold text-muted-foreground animate-pulse">
                    Loading...
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    $ {(() => {
                      const usdRevenue = revenueTotals?.find((r: any) => r.currency === 'USD');
                      return usdRevenue ? Number(usdRevenue.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                    })()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Dólar Americano
                </p>
              </CardContent>
            </Card>

            {/* Despesas BRL */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Despesas (R$)</CardTitle>
                <Wallet className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {expensesTotalsLoading ? (
                  <div className="text-2xl font-bold text-muted-foreground animate-pulse">
                    Carregando...
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-red-600">
                    R$ {(() => {
                      const brlExpense = expensesTotals?.find((e: any) => e.currency === 'BRL');
                      return brlExpense ? Number(brlExpense.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
                    })()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Real Brasileiro
                </p>
              </CardContent>
            </Card>

            {/* Despesas USD */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Despesas ($)</CardTitle>
                <Wallet className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {expensesTotalsLoading ? (
                  <div className="text-2xl font-bold text-muted-foreground animate-pulse">
                    Loading...
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-red-600">
                    $ {(() => {
                      const usdExpense = expensesTotals?.find((e: any) => e.currency === 'USD');
                      return usdExpense ? Number(usdExpense.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                    })()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Dólar Americano
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gastos por Tipo e Moeda */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Gastos Detalhados</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Gastos Pessoais BRL */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">💰 Pessoal (BRL)</CardTitle>
                <Wallet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(expenseStats?.pessoal?.BRL || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gastos pessoais em reais
                </p>
              </CardContent>
            </Card>

            {/* Gastos Pessoais USD */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">💵 Pessoal (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${(expenseStats?.pessoal?.USD || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gastos pessoais em dólares
                </p>
              </CardContent>
            </Card>

            {/* Gastos Compartilhados BRL */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">🤝 Compartilhado (BRL)</CardTitle>
                <Wallet className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(expenseStats?.compartilhado?.BRL || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gastos compartilhados em reais
                </p>
              </CardContent>
            </Card>

            {/* Gastos Compartilhados USD */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">🤝 Compartilhado (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${(expenseStats?.compartilhado?.USD || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gastos compartilhados em dólares
                </p>
              </CardContent>
            </Card>

            {/* Gastos Empresa BRL */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">🏢 Empresa (BRL)</CardTitle>
                <Wallet className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(expenseStats?.empresa?.BRL || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gastos da empresa em reais
                </p>
              </CardContent>
            </Card>

            {/* Gastos Empresa USD */}
            <Card className="glass-card hover:scale-hover glow-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">🏢 Empresa (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${(expenseStats?.empresa?.USD || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gastos da empresa em dólares
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Expenses Chart */}
          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader>
              <CardTitle className="text-foreground">Gastos Mensais</CardTitle>
              <CardDescription>Evolução dos gastos em {currentYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader>
              <CardTitle className="text-foreground">Gastos por Categoria</CardTitle>
              <CardDescription>Distribuição em {monthNames[currentMonth - 1]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Nenhum gasto registrado este mês
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habits Progress */}
        <Card className="glass-card hover:scale-hover glow-hover">
          <CardHeader>
            <CardTitle className="text-foreground">Progresso dos Hábitos</CardTitle>
            <CardDescription>Acompanhamento semanal</CardDescription>
          </CardHeader>
          <CardContent>
            {habitStats.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {habitStats.map(habit => {
                  const IconComponent = getHabitIcon(habit.name);
                  return (
                    <div 
                      key={habit.id} 
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                    >
                      <div 
                        className="h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${habit.color || "#10b981"}20` }}
                      >
                        <IconComponent 
                          className="h-6 w-6" 
                          style={{ color: habit.color || "#10b981" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">{habit.completed}/{habit.total} dias</p>
                        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${habit.percentage}%`,
                              backgroundColor: habit.color || "#10b981"
                            }}
                          />
                        </div>
                      </div>
                      <span 
                        className="text-lg font-bold"
                        style={{ color: habit.color || "#10b981" }}
                      >
                        {habit.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum hábito cadastrado</p>
                <p className="text-sm mt-1">Crie hábitos para acompanhar seu progresso</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Novos Cards Informativos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Card de Alertas */}
          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader>
              <CardTitle className="text-foreground">Alertas</CardTitle>
              <CardDescription>Notificações importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(profitLoss?.profit || 0) < 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <TrendingDown className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Alerta: Prejuizo no mes!</p>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <p>Receita: <span className="text-green-600 font-medium">{formatCurrency(profitLoss?.revenue || 0)}</span></p>
                        <p>Despesas: <span className="text-red-600 font-medium">{formatCurrency(profitLoss?.totalExpenses || 0)}</span></p>
                        <p className="border-t border-destructive/20 pt-1 mt-1">Resultado: <span className="text-destructive font-bold">{formatCurrency(profitLoss?.profit || 0)}</span></p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Suas despesas estao maiores que suas receitas. Revise seus gastos.</p>
                    </div>
                  </div>
                )}
                {stats?.tasksToday?.total === 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Sem tarefas</p>
                      <p className="text-xs text-muted-foreground mt-1">Crie tarefas para hoje</p>
                    </div>
                  </div>
                )}
                {stats?.habitsToday?.total === 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Target className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Sem hábitos</p>
                      <p className="text-xs text-muted-foreground mt-1">Crie hábitos para acompanhar</p>
                    </div>
                  </div>
                )}
                {(profitLoss?.profit || 0) >= 0 && stats?.tasksToday && stats.habitsToday && (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                    <p className="text-sm">Tudo em dia!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Score do Dia */}
          <Card className="glass-card hover:scale-hover glow-hover">
            <CardHeader>
              <CardTitle className="text-foreground">Produtividade</CardTitle>
              <CardDescription>Score do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Progresso geral</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground">Tarefas</span>
                        <span className="text-muted-foreground">{stats?.tasksToday?.completed || 0}/{stats?.tasksToday?.total || 0}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${stats?.tasksToday?.total ? (stats.tasksToday.completed / stats.tasksToday.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground">Hábitos</span>
                        <span className="text-muted-foreground">{stats?.habitsToday?.completed || 0}/{stats?.habitsToday?.total || 0}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${stats?.habitsToday?.total ? (stats.habitsToday.completed / stats.habitsToday.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 text-center">
                  <div className="text-4xl font-bold text-primary">
                    {Math.round(
                      ((stats?.tasksToday?.completed || 0) + (stats?.habitsToday?.completed || 0)) /
                      ((stats?.tasksToday?.total || 1) + (stats?.habitsToday?.total || 1)) * 100
                    )}
                    <span className="text-lg">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
