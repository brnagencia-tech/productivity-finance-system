import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Streamdown } from "streamdown";

export default function AIInsights() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [contextData, setContextData] = useState<any>(null);

  const generateSuggestionsMutation = trpc.insights.generateSuggestions.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data: any) => {
      setSuggestions(data.suggestions);
      setContextData(data.contextData);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const handleGenerateSuggestions = async () => {
    generateSuggestionsMutation.mutate({ period });
  };

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case "today":
        return "Hoje";
      case "week":
        return "Última Semana";
      case "month":
        return "Este Mês";
      default:
        return p;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insights com IA</h1>
            <p className="text-muted-foreground mt-2">
              Análise inteligente dos seus dados de produtividade e finanças
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Período</CardTitle>
            <CardDescription>
              Escolha o período para análise e geração de sugestões personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {(["today", "week", "month"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  onClick={() => setPeriod(p)}
                  disabled={isLoading}
                >
                  {getPeriodLabel(p)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Context Data Display */}
        {contextData && (
          <Card>
            <CardHeader>
              <CardTitle>Dados Coletados</CardTitle>
              <CardDescription>
                Informações usadas para gerar as sugestões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Produtividade */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Produtividade</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      Tarefas: {contextData.productivity.tasksCompleted}/
                      {contextData.productivity.tasksTotal} (
                      {contextData.productivity.productivityScore.toFixed(1)}%)
                    </p>
                    <p>
                      Hábitos: {contextData.productivity.habitsCompleted}/
                      {contextData.productivity.habitsTotal}
                    </p>
                  </div>
                </div>

                {/* Financeiro */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Financeiro</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      Receita: R${" "}
                      {contextData.financial.revenue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p>
                      Despesas: R${" "}
                      {contextData.financial.expenses.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p>
                      Lucro: R${" "}
                      {contextData.financial.profit.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Sugestões Personalizadas</CardTitle>
              <CardDescription>
                Recomendações baseadas em análise de IA dos seus dados
              </CardDescription>
            </div>
            <Button
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar Sugestões
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!suggestions && !isLoading && (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Clique em "Gerar Sugestões" para receber recomendações personalizadas
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Analisando seus dados e gerando sugestões...
                </p>
              </div>
            )}

            {suggestions && !isLoading && (
              <div className="space-y-4">
                <Badge variant="secondary">Análise de IA</Badge>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <Streamdown>{suggestions}</Streamdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
