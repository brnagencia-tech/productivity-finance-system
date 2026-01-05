import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo, useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const fullMonthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function AnnualExpenses() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: monthlyTrend, isLoading } = trpc.expenses.getMonthlyTrend.useQuery({ year });

  const chartData = useMemo(() => {
    if (!monthlyTrend) return [];
    
    return monthNames.map((name, i) => {
      const monthData = monthlyTrend.find(m => m.month === i + 1);
      return {
        name,
        month: i + 1,
        total: monthData?.total || 0,
        personal: monthData?.personal || 0,
        professional: monthData?.professional || 0
      };
    });
  }, [monthlyTrend]);

  const stats = useMemo(() => {
    if (!chartData.length) return { total: 0, average: 0, highest: null, lowest: null };
    
    const filledMonths = chartData.filter(m => m.total > 0);
    const total = filledMonths.reduce((sum, m) => sum + m.total, 0);
    const average = filledMonths.length > 0 ? total / filledMonths.length : 0;
    
    let highest = filledMonths[0] || null;
    let lowest = filledMonths[0] || null;
    
    filledMonths.forEach(m => {
      if (m.total > (highest?.total || 0)) highest = m;
      if (m.total < (lowest?.total || Infinity)) lowest = m;
    });
    
    return { total, average, highest, lowest };
  }, [chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const getVariation = (currentMonth: number) => {
    if (currentMonth <= 1) return null;
    const current = chartData[currentMonth - 1]?.total || 0;
    const previous = chartData[currentMonth - 2]?.total || 0;
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Planilha Anual de Gastos</h1>
            <p className="text-muted-foreground">Visão consolidada mês a mês</p>
          </div>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[120px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Total Anual</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.total)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Média Mensal</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.average)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Maior Gasto</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.highest ? formatCurrency(stats.highest.total) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.highest ? fullMonthNames[(stats.highest as any).month - 1] : ""}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Menor Gasto</p>
              <p className="text-2xl font-bold text-primary">
                {stats.lowest ? formatCurrency(stats.lowest.total) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.lowest ? fullMonthNames[(stats.lowest as any).month - 1] : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Area Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Evolução dos Gastos</CardTitle>
            <CardDescription>Tendência mensal em {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Carregando dados...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Pessoal vs Profissional</CardTitle>
            <CardDescription>Comparativo mensal por tipo de gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Legend 
                    formatter={(value) => (
                      <span className="text-foreground text-sm">
                        {value === "personal" ? "Pessoal" : "Profissional"}
                      </span>
                    )}
                  />
                  <Bar dataKey="personal" name="personal" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="professional" name="professional" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Table */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-foreground">Detalhamento Mensal</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Mês</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Pessoal</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Profissional</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Variação</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((month, i) => {
                  const variation = getVariation(month.month);
                  return (
                    <tr key={i} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{fullMonthNames[i]}</td>
                      <td className="p-4 text-right text-foreground">{formatCurrency(month.personal)}</td>
                      <td className="p-4 text-right text-foreground">{formatCurrency(month.professional)}</td>
                      <td className="p-4 text-right font-bold text-foreground">{formatCurrency(month.total)}</td>
                      <td className="p-4 text-center">
                        {variation !== null ? (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            variation > 0 
                              ? "bg-destructive/20 text-destructive" 
                              : variation < 0 
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-muted-foreground"
                          }`}>
                            {variation > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : variation < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {Math.abs(variation).toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5">
                  <td className="p-4 font-bold text-foreground">TOTAL ANUAL</td>
                  <td className="p-4 text-right font-bold text-foreground">
                    {formatCurrency(chartData.reduce((sum, m) => sum + m.personal, 0))}
                  </td>
                  <td className="p-4 text-right font-bold text-foreground">
                    {formatCurrency(chartData.reduce((sum, m) => sum + m.professional, 0))}
                  </td>
                  <td className="p-4 text-right font-bold text-primary text-lg">
                    {formatCurrency(stats.total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
