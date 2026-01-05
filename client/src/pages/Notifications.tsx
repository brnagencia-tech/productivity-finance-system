import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, BellRing, Check, CheckCheck, Trash2, RefreshCw, AlertTriangle, Calendar, DollarSign } from "lucide-react";

export default function Notifications() {
  const { data: notifications, refetch } = trpc.notifications.list.useQuery();
  const { data: upcomingExpenses } = trpc.notifications.getUpcomingExpenses.useQuery();
  
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch()
  });
  
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações marcadas como lidas!");
      refetch();
    }
  });
  
  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("Notificação removida!");
      refetch();
    }
  });
  
  const generateReminders = trpc.notifications.generateExpenseReminders.useMutation({
    onSuccess: (data) => {
      if (data.length > 0) {
        toast.success(`${data.length} lembrete(s) gerado(s)!`);
      } else {
        toast.info("Nenhuma despesa próxima do vencimento.");
      }
      refetch();
    }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "expense_due":
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lida(s)` : "Todas as notificações lidas"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => generateReminders.mutate()} disabled={generateReminders.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generateReminders.isPending ? "animate-spin" : ""}`} />
              Verificar Vencimentos
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            )}
          </div>
        </div>

        {/* Despesas Próximas do Vencimento */}
        {upcomingExpenses && upcomingExpenses.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Calendar className="h-5 w-5" />
                Despesas Próximas do Vencimento
              </CardTitle>
              <CardDescription className="text-yellow-600">
                Despesas fixas que vencem nos próximos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExpenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence dia {expense.dueDay} ({expense.daysUntilDue === 0 ? "Hoje!" : `em ${expense.daysUntilDue} dia(s)`})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-700">
                        R$ {parseFloat(expense.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant={expense.daysUntilDue <= 2 ? "destructive" : "secondary"}>
                        {expense.daysUntilDue === 0 ? "Vence Hoje" : expense.daysUntilDue === 1 ? "Vence Amanhã" : `${expense.daysUntilDue} dias`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Todas as Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      notification.isRead ? "bg-muted/30" : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${notification.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">Nova</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead.mutate({ id: notification.id })}
                          title="Marcar como lida"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification.mutate({ id: notification.id })}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação.</p>
                <p className="text-sm">Clique em "Verificar Vencimentos" para gerar lembretes de despesas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
