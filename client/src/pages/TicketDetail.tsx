import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, AlertCircle, Clock, CheckCircle2, Code, Archive } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TicketStatus = "aberto" | "em_andamento" | "enviado_dev" | "resolvido" | "fechado";
type TicketChannel = "whatsapp" | "email" | "telefone" | "sistema";
type TicketType = "erro_bug" | "duvida" | "solicitacao" | "melhoria";

const statusLabels: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em Andamento",
  enviado_dev: "Enviado DEV",
  resolvido: "Resolvido",
  fechado: "Fechado"
};

const statusColors: Record<TicketStatus, string> = {
  aberto: "bg-blue-100 text-blue-800",
  em_andamento: "bg-yellow-100 text-yellow-800",
  enviado_dev: "bg-purple-100 text-purple-800",
  resolvido: "bg-green-100 text-green-800",
  fechado: "bg-gray-100 text-gray-800"
};

const statusIcons: Record<TicketStatus, any> = {
  aberto: AlertCircle,
  em_andamento: Clock,
  enviado_dev: Code,
  resolvido: CheckCircle2,
  fechado: Archive
};

const channelLabels: Record<TicketChannel, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  telefone: "Telefone",
  sistema: "Sistema"
};

const typeLabels: Record<TicketType, string> = {
  erro_bug: "Erro/Bug",
  duvida: "Dúvida",
  solicitacao: "Solicitação",
  melhoria: "Melhoria"
};

export default function TicketDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const ticketId = parseInt(params.id || "0");

  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery({ id: ticketId });
  const { data: history } = trpc.tickets.getStatusHistory.useQuery({ ticketId });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Ticket não encontrado</p>
            <Button className="mt-4" onClick={() => navigate("/suporte")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusIcons[ticket.status as TicketStatus];

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/suporte")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Ticket Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[ticket.status as TicketStatus]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabels[ticket.status as TicketStatus]}
                </Badge>
                {ticket.escalatedToDev && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Code className="h-3 w-3 mr-1" />
                    Escalado para DEV
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tipo</p>
              <p className="font-medium">{typeLabels[ticket.type as TicketType]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Canal</p>
              <p className="font-medium">{channelLabels[ticket.channel as TicketChannel]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Criado em</p>
              <p className="font-medium text-sm">
                {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
            {ticket.dueDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prazo</p>
                <p className="font-medium text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(ticket.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma alteração de status registrada
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => {
                const OldIcon = item.oldStatus ? statusIcons[item.oldStatus as TicketStatus] : null;
                const NewIcon = statusIcons[item.newStatus as TicketStatus];
                
                return (
                  <div key={item.id} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                      {index < history.length - 1 && (
                        <div className="w-0.5 h-full bg-muted mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        {item.oldStatus && OldIcon && (
                          <Badge variant="outline" className="text-xs">
                            <OldIcon className="h-3 w-3 mr-1" />
                            {statusLabels[item.oldStatus as TicketStatus]}
                          </Badge>
                        )}
                        {item.oldStatus && <span className="text-muted-foreground">→</span>}
                        <Badge className={statusColors[item.newStatus as TicketStatus] + " text-xs"}>
                          <NewIcon className="h-3 w-3 mr-1" />
                          {statusLabels[item.newStatus as TicketStatus]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.changedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
