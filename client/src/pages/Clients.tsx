import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Building2, Search, Filter, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientSites } from "@/components/ClientSites";
import DashboardLayout from "@/components/DashboardLayout";

export default function Clients() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "expirationDate">("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const { data: allClients = [], isLoading } = trpc.clients.getClients.useQuery();
  
  // Filter and sort clients
  const filteredClients = allClients
    .filter((client: any) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        client.name?.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query) ||
        client.cpfCnpj?.toLowerCase().includes(query)
      );
    })
    .sort((a: any, b: any) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "createdAt") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // For expirationDate, we need to check client sites
      return 0;
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clients = filteredClients.slice(startIndex, endIndex);
  
  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  
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

  // Exportar CSV
  const handleExportCSV = () => {
    if (allClients.length === 0) {
      toast({ title: "Nenhum cliente para exportar", variant: "destructive" });
      return;
    }

    const headers = ["Nome", "Empresa", "CPF/CNPJ", "Telefone", "CEP", "Endereço", "E-mail", "E-mails Adicionais", "Banco Recebedor"];
    const rows = allClients.map((client: any) => [
      client.name || "",
      client.company || "",
      client.cpfCnpj || "",
      client.telefone || "",
      client.cep || "",
      client.endereco || "",
      client.email || "",
      client.emailsAdicionais || "",
      client.bancoRecebedor || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({ title: `${allClients.length} clientes exportados com sucesso!` });
  };

  // Importar CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({ title: "Arquivo CSV vazio ou inválido", variant: "destructive" });
          return;
        }

        const dataLines = lines.slice(1); // Pular cabeçalho
        let imported = 0;
        let errors = 0;

        for (const line of dataLines) {
          const values = line.split(",").map(v => v.replace(/^"|"$/g, "").trim());
          
          if (values[0]) { // Nome é obrigatório
            try {
              await createMutation.mutateAsync({
                name: values[0],
                company: values[1] || undefined,
                cpfCnpj: values[2] || undefined,
                telefone: values[3] || undefined,
                cep: values[4] || undefined,
                endereco: values[5] || undefined,
                email: values[6] || undefined,
                emailsAdicionais: values[7] || undefined,
                bancoRecebedor: values[8] || undefined,
              });
              imported++;
            } catch (error) {
              errors++;
            }
          }
        }

        utils.clients.getClients.invalidate();
        toast({ 
          title: `Importação concluída!`,
          description: `${imported} clientes importados${errors > 0 ? `, ${errors} erros` : ""}` 
        });
      } catch (error) {
        toast({ title: "Erro ao processar arquivo CSV", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e sites vinculados</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou CNPJ..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border rounded-md bg-background text-sm"
          >
            <option value="createdAt">Data de Cadastro</option>
            <option value="name">Nome</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end">
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

      {/* Paginação */}
      {filteredClients.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} de {filteredClients.length} clientes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm px-3">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
