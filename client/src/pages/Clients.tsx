import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientSites } from "@/components/ClientSites";

export default function Clients() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    cpfCnpj: "",
    telefone: "",
    cep: "",
    endereco: "",
    email: "",
    emailsAdicionais: "",
    bancoRecebedor: "",
  });

  const utils = trpc.useUtils();
  const { data: clients = [], isLoading } = trpc.clients.getClients.useQuery();
  
  const createMutation = trpc.clients.createClient.useMutation({
    onSuccess: () => {
      toast({ title: "Cliente criado com sucesso!" });
      utils.clients.getClients.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.clients.updateClient.useMutation({
    onSuccess: () => {
      toast({ title: "Cliente atualizado com sucesso!" });
      utils.clients.getClients.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.clients.deleteClient.useMutation({
    onSuccess: () => {
      toast({ title: "Cliente excluído com sucesso!" });
      utils.clients.getClients.invalidate();
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir cliente", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      cpfCnpj: "",
      telefone: "",
      cep: "",
      endereco: "",
      email: "",
      emailsAdicionais: "",
      bancoRecebedor: "",
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      company: client.company || "",
      cpfCnpj: client.cpfCnpj || "",
      telefone: client.telefone || "",
      cep: client.cep || "",
      endereco: client.endereco || "",
      email: client.email || "",
      emailsAdicionais: client.emailsAdicionais || "",
      bancoRecebedor: client.bancoRecebedor || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e sites vinculados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="bancoRecebedor">Banco Recebedor</Label>
                  <Input
                    id="bancoRecebedor"
                    value={formData.bancoRecebedor}
                    onChange={(e) => setFormData({ ...formData, bancoRecebedor: e.target.value })}
                    placeholder="Banco para recebimento"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="emailsAdicionais">E-mails Adicionais</Label>
                  <Textarea
                    id="emailsAdicionais"
                    value={formData.emailsAdicionais}
                    onChange={(e) => setFormData({ ...formData, emailsAdicionais: e.target.value })}
                    placeholder="email1@exemplo.com, email2@exemplo.com"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe múltiplos e-mails com vírgula
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingClient ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro cliente</p>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client: any) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{client.name}</CardTitle>
                    {client.company && (
                      <p className="text-sm text-muted-foreground mt-1">{client.company}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(client.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ClientSites clientId={client.id} clientName={client.name} />
                <div className="h-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {client.cpfCnpj && (
                    <div>
                      <p className="text-muted-foreground">CPF/CNPJ</p>
                      <p className="font-medium">{client.cpfCnpj}</p>
                    </div>
                  )}
                  {client.telefone && (
                    <div>
                      <p className="text-muted-foreground">Telefone</p>
                      <p className="font-medium">{client.telefone}</p>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  )}
                  {client.cep && (
                    <div>
                      <p className="text-muted-foreground">CEP</p>
                      <p className="font-medium">{client.cep}</p>
                    </div>
                  )}
                  {client.endereco && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Endereço</p>
                      <p className="font-medium">{client.endereco}</p>
                    </div>
                  )}
                  {client.bancoRecebedor && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Banco Recebedor</p>
                      <p className="font-medium">{client.bancoRecebedor}</p>
                    </div>
                  )}
                  {client.emailsAdicionais && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-muted-foreground">E-mails Adicionais</p>
                      <p className="font-medium">{client.emailsAdicionais}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
