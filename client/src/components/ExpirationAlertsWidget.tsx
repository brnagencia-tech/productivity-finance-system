import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, Globe } from "lucide-react";
import { Link } from "wouter";

export function ExpirationAlertsWidget() {
  const { data: expiringItems = [], isLoading } = trpc.alerts.getExpiringItems.useQuery({ daysAhead: 30 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDaysUntil = (date: any) => {
    if (!date) return null;
    const now = new Date();
    const target = new Date(date);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getAlertColor = (days: number | null) => {
    if (days === null) return "text-muted-foreground";
    if (days <= 7) return "text-red-500";
    if (days <= 15) return "text-orange-500";
    return "text-yellow-500";
  };

  if (expiringItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum domínio ou plano expirando nos próximos 30 dias
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Alertas de Vencimento ({expiringItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringItems.map((item: any) => {
            const domainDays = getDaysUntil(item.expiracaoDominio);
            const planDays = getDaysUntil(item.inicioPlano);
            
            return (
              <Link key={item.id} href="/clients">
                <a className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.siteDominio}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Cliente: {item.clientName}
                      </p>
                      <div className="mt-2 space-y-1">
                        {domainDays !== null && (
                          <div className={`flex items-center gap-2 text-sm ${getAlertColor(domainDays)}`}>
                            <Calendar className="h-4 w-4" />
                            <span>
                              Domínio expira em {domainDays} {domainDays === 1 ? "dia" : "dias"}
                            </span>
                          </div>
                        )}
                        {planDays !== null && item.plano && (
                          <div className={`flex items-center gap-2 text-sm ${getAlertColor(planDays)}`}>
                            <Calendar className="h-4 w-4" />
                            <span>
                              Plano "{item.plano}" vence em {planDays} {planDays === 1 ? "dia" : "dias"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link href="/clients">
            <a className="text-sm text-primary hover:underline">
              Ver todos os clientes →
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
