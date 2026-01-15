import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientSitesProps {
  clientId: number;
  clientName: string;
}

export function ClientSites({ clientId, clientName }: ClientSitesProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    siteDominio: "",
    servidor: "",
    estrutura: "",
    plano: "",
    inicioPlano: "",
    expiracaoDominio: "",
    gateway: "",
    versao: "",
    limiteNumero: "",
    comissaoPercentual: "",
    observacao: "",
  });

  const utils = trpc.useUtils();
  const { data: sites = [], isLoading } = trpc.clients.getClientSites.useQuery({ clientId });
  
  const createMutation = trpc.clients.createClientSite.useMutation({
    onSuccess: () => {
      toast({ title: "Site adicionado com sucesso!" });
      utils.clients.getClientSites.invalidate({ clientId });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar site", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.clients.updateClientSite.useMutation({
    onSuccess: () => {
      toast({ title: "Site atualizado com sucesso!" });
      utils.clients.getClientSites.invalidate({ clientId });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar site", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.clients.deleteClientSite.useMutation({
    onSuccess: () => {
      toast({ title: "Site excluído com sucesso!" });
      utils.clients.getClientSites.invalidate({ clientId });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir site", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      siteDominio: "",
      servidor: "",
      estrutura: "",
      plano: "",
      inicioPlano: "",
      expiracaoDominio: "",
      gateway: "",
      versao: "",
      limiteNumero: "",
      comissaoPercentual: "",
      observacao: "",
    });
    setEditingSite(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.siteDominio.trim()) {
      toast({ title: "Domínio é obrigatório", variant: "destructive" });
      return;
    }

    const payload = {
      clientId,
      siteDominio: formData.siteDominio,
      servidor: formData.servidor || undefined,
      estrutura: formData.estrutura || undefined,
      plano: formData.plano || undefined,
      inicioPlano: formData.inicioPlano ? new Date(formData.inicioPlano) : undefined,
      expiracaoDominio: formData.expiracaoDominio ? new Date(formData.expiracaoDominio) : undefined,
      gateway: formData.gateway || undefined,
      versao: formData.versao || undefined,
      limiteNumero: formData.limiteNumero ? parseInt(formData.limiteNumero) : undefined,
      comissaoPercentual: formData.comissaoPercentual || undefined,
      observacao: formData.observacao || undefined,
    };

    if (editingSite) {
      updateMutation.mutate({ id: editingSite.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (site: any) => {
    setEditingSite(site);
    setFormData({
      siteDominio: site.siteDominio || "",
      servidor: site.servidor || "",
      estrutura: site.estrutura || "",
      plano: site.plano || "",
      inicioPlano: site.inicioPlano ? new Date(site.inicioPlano).toISOString().split('T')[0] : "",
      expiracaoDominio: site.expiracaoDominio ? new Date(site.expiracaoDominio).toISOString().split('T')[0] : "",
      gateway: site.gateway || "",
      versao: site.versao || "",
      limiteNumero: site.limiteNumero?.toString() || "",
      comissaoPercentual: site.comissaoPercentual || "",
      observacao: site.observacao || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este site?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sites de {clientName}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSite ? "Editar Site" : "Novo Site"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="siteDominio">Domínio *</Label>
                  <Input
                    id="siteDominio"
                    value={formData.siteDominio}
                    onChange={(e) => setFormData({ ...formData, siteDominio: e.target.value })}
                    placeholder="exemplo.com.br"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="servidor">Servidor</Label>
                  <Input
                    id="servidor"
                    value={formData.servidor}
                    onChange={(e) => setFormData({ ...formData, servidor: e.target.value })}
                    placeholder="Nome do servidor"
                  />
                </div>

                <div>
                  <Label htmlFor="estrutura">Estrutura</Label>
                  <Input
                    id="estrutura"
                    value={formData.estrutura}
                    onChange={(e) => setFormData({ ...formData, estrutura: e.target.value })}
                    placeholder="WordPress, Laravel, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="plano">Plano</Label>
                  <Input
                    id="plano"
                    value={formData.plano}
                    onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                    placeholder="Plano de hospedagem"
                  />
                </div>

                <div>
                  <Label htmlFor="inicioPlano">Início do Plano</Label>
                  <Input
                    id="inicioPlano"
                    type="date"
                    value={formData.inicioPlano}
                    onChange={(e) => setFormData({ ...formData, inicioPlano: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="expiracaoDominio">Expiração do Domínio</Label>
                  <Input
                    id="expiracaoDominio"
                    type="date"
                    value={formData.expiracaoDominio}
                    onChange={(e) => setFormData({ ...formData, expiracaoDominio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="gateway">Gateway</Label>
                  <Input
                    id="gateway"
                    value={formData.gateway}
                    onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                    placeholder="Gateway de pagamento"
                  />
                </div>

                <div>
                  <Label htmlFor="versao">Versão</Label>
                  <Input
                    id="versao"
                    value={formData.versao}
                    onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                    placeholder="Versão do sistema"
                  />
                </div>

                <div>
                  <Label htmlFor="limiteNumero">Limite (Número)</Label>
                  <Input
                    id="limiteNumero"
                    type="number"
                    value={formData.limiteNumero}
                    onChange={(e) => setFormData({ ...formData, limiteNumero: e.target.value })}
                    placeholder="Limite numérico"
                  />
                </div>

                <div>
                  <Label htmlFor="comissaoPercentual">Comissão (%)</Label>
                  <Input
                    id="comissaoPercentual"
                    value={formData.comissaoPercentual}
                    onChange={(e) => setFormData({ ...formData, comissaoPercentual: e.target.value })}
                    placeholder="10.00"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="observacao">Observação</Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Observações sobre o site"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSite ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Globe className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum site cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sites.map((site: any) => (
            <Card key={site.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{site.siteDominio}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(site)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(site.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {site.servidor && (
                    <div>
                      <p className="text-muted-foreground text-xs">Servidor</p>
                      <p className="font-medium">{site.servidor}</p>
                    </div>
                  )}
                  {site.estrutura && (
                    <div>
                      <p className="text-muted-foreground text-xs">Estrutura</p>
                      <p className="font-medium">{site.estrutura}</p>
                    </div>
                  )}
                  {site.plano && (
                    <div>
                      <p className="text-muted-foreground text-xs">Plano</p>
                      <p className="font-medium">{site.plano}</p>
                    </div>
                  )}
                  {site.gateway && (
                    <div>
                      <p className="text-muted-foreground text-xs">Gateway</p>
                      <p className="font-medium">{site.gateway}</p>
                    </div>
                  )}
                  {site.versao && (
                    <div>
                      <p className="text-muted-foreground text-xs">Versão</p>
                      <p className="font-medium">{site.versao}</p>
                    </div>
                  )}
                  {site.inicioPlano && (
                    <div>
                      <p className="text-muted-foreground text-xs">Início do Plano</p>
                      <p className="font-medium">{formatDate(site.inicioPlano)}</p>
                    </div>
                  )}
                  {site.expiracaoDominio && (
                    <div>
                      <p className="text-muted-foreground text-xs">Expiração</p>
                      <p className="font-medium">{formatDate(site.expiracaoDominio)}</p>
                    </div>
                  )}
                  {site.comissaoPercentual && (
                    <div>
                      <p className="text-muted-foreground text-xs">Comissão</p>
                      <p className="font-medium">{site.comissaoPercentual}%</p>
                    </div>
                  )}
                  {site.limiteNumero && (
                    <div>
                      <p className="text-muted-foreground text-xs">Limite</p>
                      <p className="font-medium">{site.limiteNumero}</p>
                    </div>
                  )}
                  {site.observacao && (
                    <div className="col-span-2 md:col-span-4">
                      <p className="text-muted-foreground text-xs">Observação</p>
                      <p className="font-medium">{site.observacao}</p>
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
