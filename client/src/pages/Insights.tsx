import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Target,
  Wallet,
  ListTodo,
  Heart,
  RefreshCw,
  Sparkles,
  Calendar,
  PieChart
} from "lucide-react";
import { useState } from "react";

export default function Insights() {
  const [activeTab, setActiveTab] = useState<"weekly" | "expenses" | "productivity">("weekly");
  
  const { data: weeklyInsights, isLoading: loadingWeekly, refetch: refetchWeekly } = 
    trpc.insights.getWeeklyInsights.useQuery(undefined, { enabled: activeTab === "weekly" });
  
  const { data: expenseAnalysis, isLoading: loadingExpenses, refetch: refetchExpenses } = 
    trpc.insights.getExpenseAnalysis.useQuery(undefined, { enabled: activeTab === "expenses" });
  
  const { data: productivityAnalysis, isLoading: loadingProductivity, refetch: refetchProductivity } = 
    trpc.insights.getProductivityAnalysis.useQuery(undefined, { enabled: activeTab === "productivity" });

  const handleRefresh = () => {
    if (activeTab === "weekly") refetchWeekly();
    else if (activeTab === "expenses") refetchExpenses();
    else refetchProductivity();
  };

  const isLoading = 
    (activeTab === "weekly" && loadingWeekly) ||
    (activeTab === "expenses" && loadingExpenses) ||
    (activeTab === "productivity" && loadingProductivity);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Insights com IA
            </h1>
            <p className="text-muted-foreground">
              Análises inteligentes dos seus dados de produtividade e finanças
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Análise
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button 
            variant={activeTab === "weekly" ? "default" : "ghost"}
            onClick={() => setActiveTab("weekly")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Visão Semanal
          </Button>
          <Button 
            variant={activeTab === "expenses" ? "default" : "ghost"}
            onClick={() => setActiveTab("expenses")}
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            Gastos
          </Button>
          <Button 
            variant={activeTab === "productivity" ? "default" : "ghost"}
            onClick={() => setActiveTab("productivity")}
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            Produtividade
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : activeTab === "weekly" && weeklyInsights ? (
          <WeeklyInsightsView data={weeklyInsights} />
        ) : activeTab === "expenses" && expenseAnalysis ? (
          <ExpenseAnalysisView data={expenseAnalysis} />
        ) : activeTab === "productivity" && productivityAnalysis ? (
          <ProductivityAnalysisView data={productivityAnalysis} />
        ) : (
          <EmptyState onRefresh={handleRefresh} />
        )}
      </div>
    </DashboardLayout>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card className="p-12 text-center">
      <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">Nenhuma análise disponível</h3>
      <p className="text-muted-foreground mb-6">
        Adicione mais dados de tarefas, hábitos e gastos para gerar insights personalizados.
      </p>
      <Button onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar Gerar Análise
      </Button>
    </Card>
  );
}

interface WeeklyInsightsData {
  expenses: {
    summary: string;
    totalSpent: number;
    topCategories: { category: string; amount: number; percentage: number }[];
    trends: string;
    recommendations: string[];
    alerts: string[];
  };
  productivity: {
    summary: string;
    taskCompletionRate: number;
    habitCompletionRate: number;
    mostProductiveDays: string[];
    areasForImprovement: string[];
    achievements: string[];
    recommendations: string[];
  };
  overallScore: number;
  motivationalMessage: string;
  generatedAt: Date;
}

function WeeklyInsightsView({ data }: { data: WeeklyInsightsData }) {
  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{data.overallScore}</span>
                  <span className="text-sm text-muted-foreground block">/ 100</span>
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Sua Pontuação Semanal</h2>
              <p className="text-lg text-muted-foreground mb-4">{data.motivationalMessage}</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Tarefas: {data.productivity.taskCompletionRate.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm">Hábitos: {data.productivity.habitCompletionRate.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  <span className="text-sm">R$ {data.expenses.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-500" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{data.expenses.summary}</p>
            
            {data.expenses.topCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Top Categorias</h4>
                {data.expenses.topCategories.slice(0, 3).map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.category}</span>
                        <span className="text-muted-foreground">R$ {cat.amount.toFixed(2)}</span>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Produtividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Resumo de Produtividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{data.productivity.summary}</p>
            
            {data.productivity.achievements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Conquistas
                </h4>
                <ul className="space-y-1">
                  {data.productivity.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        {data.expenses.alerts.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.expenses.alerts.map((alert, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    {alert}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...data.expenses.recommendations, ...data.productivity.recommendations].slice(0, 5).map((rec, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        <Calendar className="h-3 w-3 inline mr-1" />
        Análise gerada em {new Date(data.generatedAt).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

interface ExpenseAnalysisData {
  summary: string;
  totalSpent: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  trends: string;
  recommendations: string[];
  alerts: string[];
}

function ExpenseAnalysisView({ data }: { data: ExpenseAnalysisData }) {
  return (
    <div className="space-y-6">
      {/* Total Card */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-full">
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gasto na Semana</p>
              <p className="text-3xl font-bold">R$ {data.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Resumo da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{data.summary}</p>
            <div className="pt-2 border-t">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tendências
              </h4>
              <p className="text-sm text-muted-foreground">{data.trends}</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição dos seus gastos semanais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topCategories.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-muted-foreground">
                    R$ {cat.amount.toFixed(2)} ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={cat.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alertas */}
        {data.alerts.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Alertas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.alerts.map((alert, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{alert}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Lightbulb className="h-5 w-5" />
              Recomendações para Economizar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ProductivityAnalysisData {
  summary: string;
  taskCompletionRate: number;
  habitCompletionRate: number;
  mostProductiveDays: string[];
  areasForImprovement: string[];
  achievements: string[];
  recommendations: string[];
}

function ProductivityAnalysisView({ data }: { data: ProductivityAnalysisData }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <ListTodo className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão de Tarefas</p>
                <p className="text-3xl font-bold">{data.taskCompletionRate.toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={data.taskCompletionRate} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-500/20 rounded-full">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão de Hábitos</p>
                <p className="text-3xl font-bold">{data.habitCompletionRate.toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={data.habitCompletionRate} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise de Produtividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{data.summary}</p>
            
            {data.mostProductiveDays.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Dias Mais Produtivos
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {data.mostProductiveDays.map((day, i) => (
                    <span key={i} className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Conquistas da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.achievements.map((achievement, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Áreas para Melhoria */}
        {data.areasForImprovement.length > 0 && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-5 w-5" />
                Áreas para Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.areasForImprovement.map((area, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                    <Target className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
