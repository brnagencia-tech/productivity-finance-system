import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Calendar, User, AlertCircle, CheckCircle2, Code, Archive, GripVertical } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TicketStatus = "aberto" | "em_andamento" | "enviado_dev" | "resolvido" | "fechado";
type TicketType = "erro_bug" | "duvida" | "solicitacao" | "melhoria";
type TicketChannel = "whatsapp" | "email" | "telefone" | "sistema";

const statusLabels: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em Andamento",
  enviado_dev: "Enviado DEV",
  resolvido: "Resolvido",
  fechado: "Fechado"
};

const statusIcons: Record<TicketStatus, any> = {
  aberto: AlertCircle,
  em_andamento: User,
  enviado_dev: Code,
  resolvido: CheckCircle2,
  fechado: Archive
};

const typeLabels: Record<TicketType, string> = {
  erro_bug: "Erro / Bug no Sistema",
  duvida: "Dúvida",
  solicitacao: "Solicitação",
  melhoria: "Melhoria"
};

const channelLabels: Record<TicketChannel, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  telefone: "Telefone",
  sistema: "Sistema"
};

// Componente de Ticket Arrastável
const TicketCard = ({ ticket }: { ticket: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-shadow ${isDragging ? "shadow-2xl ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex-1" onClick={() => window.location.href = `/suporte/${ticket.id}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-sm line-clamp-2">{ticket.title}</div>
              {ticket.escalatedToDev && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">DEV</span>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {ticket.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span className="bg-muted px-2 py-1 rounded">
                {channelLabels[ticket.channel as TicketChannel]}
              </span>
              {ticket.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(ticket.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Suporte() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("todos");
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    type: "duvida" as TicketType,
    channel: "whatsapp" as TicketChannel,
    clientId: undefined as number | undefined,
    siteId: undefined as number | undefined,
    assignedTo: undefined as number | undefined,
    dueDate: "",
    escalatedToDev: false
  });

  // Queries
  const { data: tickets, refetch } = trpc.tickets.list.useQuery();
  const { data: metrics } = trpc.tickets.getMetrics.useQuery();
  const { data: clients } = trpc.clients.getClients.useQuery();
  const { data: clientSites } = trpc.clients.listAllSites.useQuery();
  const { data: managedUsers } = trpc.managedUsers.listForMentions.useQuery();

  // Mutations
  const createMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      toast.success("Chamado criado com sucesso!");
      refetch();
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar chamado: ${error.message}`);
    }
  });
  const updateStatusMutation = trpc.tickets.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      // Tocar som de notificação
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      toast.success("Status do ticket atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });

  const updateMutation = trpc.tickets.update.useMutation({
    onSuccess: () => {
      toast.success("Chamado atualizado!");
      refetch();
      setSelectedTicket(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    }
  });

  // Drag & Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const resetForm = () => {
    setNewTicket({
      title: "",
      description: "",
      type: "duvida",
      channel: "whatsapp",
      clientId: undefined,
      siteId: undefined,
      assignedTo: undefined,
      dueDate: "",
      escalatedToDev: false
    });
  };

  const handleCreate = () => {
    if (!newTicket.title || !newTicket.description) {
      toast.error("Preencha título e descrição");
      return;
    }
    createMutation.mutate(newTicket);
  };

  const handleUpdate = () => {
    if (!selectedTicket) return;
    updateMutation.mutate({
      id: selectedTicket.id,
      ...selectedTicket
    });
  };

  // Filtrar tickets
  const filteredTickets = tickets?.filter(ticket => {
    if (filterType === "todos") return true;
    return ticket.type === filterType;
  }) || [];

  // Agrupar por status
  const ticketsByStatus: Record<TicketStatus, any[]> = {
    aberto: [],
    em_andamento: [],
    enviado_dev: [],
    resolvido: [],
    fechado: []
  };

  filteredTickets.forEach(ticket => {
    if (ticket.status && ticketsByStatus[ticket.status]) {
      ticketsByStatus[ticket.status].push(ticket);
    }
  });

  // Drag & Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const ticketId = active.id as number;
    const newStatus = over.id as TicketStatus;

    // Encontrar ticket atual
    const ticket = filteredTickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    // Atualizar status
    updateStatusMutation.mutate({ id: ticketId, status: newStatus });
  };

  const activeTicket = activeId ? filteredTickets.find(t => t.id === activeId) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel de Suporte</h1>
            <p className="text-muted-foreground">Visão Geral de todos os clientes</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">TOTAL</div>
              <div className="text-3xl font-bold">{metrics?.total || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">RESOLVIDOS</div>
              <div className="text-3xl font-bold">{metrics?.resolvidos || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">TEMPO MÉDIO 1ª RESP.</div>
              <div className="text-2xl font-bold">{metrics?.tempoMedio || "0h 0m"}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">DEV</div>
              <div className="text-3xl font-bold">{metrics?.escaladosDev || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 items-center bg-muted/30 p-4 rounded-lg">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Tipo: Todos</SelectItem>
              <SelectItem value="erro_bug">Erro / Bug</SelectItem>
              <SelectItem value="duvida">Dúvida</SelectItem>
              <SelectItem value="solicitacao">Solicitação</SelectItem>
              <SelectItem value="melhoria">Melhoria</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">Filtrar</Button>
          
          <div className="ml-auto flex gap-2">
            <Button variant="outline">Kanban</Button>
            <Button variant="ghost">Lista</Button>
            <Button variant="ghost" size="icon" className="bg-green-600 text-white hover:bg-green-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Kanban Board com Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["aberto", "em_andamento", "enviado_dev", "resolvido"] as TicketStatus[]).map(status => {
              const Icon = statusIcons[status];
              const ticketIds = ticketsByStatus[status].map(t => t.id);
              
              return (
                <SortableContext key={status} items={ticketIds} strategy={verticalListSortingStrategy}>
                  <div
                    className="space-y-3 min-h-[200px] p-3 rounded-lg bg-muted/20 border-2 border-dashed border-transparent hover:border-primary/30 transition-colors"
                    id={status}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <Icon className="h-4 w-4" />
                      {statusLabels[status]}
                      <span className="ml-auto bg-muted px-2 py-1 rounded text-xs">
                        {ticketsByStatus[status].length}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {ticketsByStatus[status].map(ticket => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                        />
                      ))}
                    </div>
                  </div>
                </SortableContext>
              );
            })}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTicket ? (
              <Card className="cursor-grabbing shadow-2xl ring-2 ring-primary rotate-3">
                <CardContent className="p-4 space-y-2">
                  <div className="font-medium text-sm">{activeTicket.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activeTicket.description}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Dialog Novo Chamado */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Chamado</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Selecione o Site Afetado</Label>
                  <Select 
                    value={newTicket.siteId?.toString() || ""} 
                    onValueChange={(v) => setNewTicket({...newTicket, siteId: v ? Number(v) : undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Escolha um site --" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientSites?.map(site => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.siteDominio} {site.clientName ? `(${site.clientName})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    O cliente será vinculado automaticamente ao selecionar o site.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Cliente (Automático)</Label>
                  <Input 
                    value="Sem vínculo / Legado" 
                    disabled 
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título do Problema</Label>
                <Input 
                  placeholder="Resumo do problema"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição Detalhada</Label>
                <Textarea 
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={newTicket.type} 
                    onValueChange={(v) => setNewTicket({...newTicket, type: v as TicketType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select 
                    value={newTicket.channel} 
                    onValueChange={(v) => setNewTicket({...newTicket, channel: v as TicketChannel})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(channelLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Atribuir Responsável</Label>
                  <Select 
                    value={newTicket.assignedTo?.toString() || ""} 
                    onValueChange={(v) => setNewTicket({...newTicket, assignedTo: v ? Number(v) : undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Sem responsável --" />
                    </SelectTrigger>
                    <SelectContent>
                      {managedUsers?.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prazo de Resolução (Opcional)</Label>
                  <Input 
                    type="date"
                    value={newTicket.dueDate}
                    onChange={(e) => setNewTicket({...newTicket, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="escalatedToDev"
                  checked={newTicket.escalatedToDev}
                  onChange={(e) => setNewTicket({...newTicket, escalatedToDev: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="escalatedToDev" className="cursor-pointer">
                  Escalar para DEV?
                </Label>
                <span className="text-xs text-muted-foreground">
                  Marque se precisar de intervenção técnica.
                </span>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  Salvar Chamado
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Detalhes do Ticket */}
        {selectedTicket && (
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Chamado #{selectedTicket.id}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Vinculado</Label>
                    <Input value="-- Selecione --" disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cliente (Automático)</Label>
                    <Input value="Sem vínculo / Legado" disabled className="bg-muted" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    value={selectedTicket.title}
                    onChange={(e) => setSelectedTicket({...selectedTicket, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    rows={4}
                    value={selectedTicket.description}
                    onChange={(e) => setSelectedTicket({...selectedTicket, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status (Mover)</Label>
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(v) => {
                        setSelectedTicket({...selectedTicket, status: v});
                        updateStatusMutation.mutate({ id: selectedTicket.id, status: v as TicketStatus });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Select 
                      value={selectedTicket.assignedTo?.toString() || ""} 
                      onValueChange={(v) => setSelectedTicket({...selectedTicket, assignedTo: v ? Number(v) : undefined})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem responsável</SelectItem>
                        {managedUsers?.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prazo de Resolução (Opcional)</Label>
                    <Input 
                      type="date"
                      value={selectedTicket.dueDate ? new Date(selectedTicket.dueDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => setSelectedTicket({...selectedTicket, dueDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select 
                      value={selectedTicket.type} 
                      onValueChange={(v) => setSelectedTicket({...selectedTicket, type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select 
                    value={selectedTicket.channel} 
                    onValueChange={(v) => setSelectedTicket({...selectedTicket, channel: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(channelLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="escalatedToDevEdit"
                    checked={selectedTicket.escalatedToDev}
                    onChange={(e) => setSelectedTicket({...selectedTicket, escalatedToDev: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="escalatedToDevEdit" className="cursor-pointer">
                    Escalar para DEV?
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Marque se precisar de intervenção técnica.
                  </span>
                </div>

                <div className="flex gap-2 justify-between">
                  <Button variant="destructive" size="sm">
                    Arquivar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                      Fechar
                    </Button>
                    <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
