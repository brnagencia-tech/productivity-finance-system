import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Building2, Mail, Phone, MapPin, CreditCard, Globe } from "lucide-react";
import { ClientSites } from "@/components/ClientSites";

interface ClientProfileProps {
  client: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: any) => void;
  onDelete: (id: number) => void;
}

export function ClientProfile({ client, isOpen, onClose, onEdit, onDelete }: ClientProfileProps) {
  if (!client) return null;

  const handleEdit = () => {
    onEdit(client);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      onDelete(client.id);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl">{client.name}</SheetTitle>
              {client.company && (
                <p className="text-muted-foreground mt-1">{client.company}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Informações de Contato */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.cpfCnpj && (
                  <div>
                    <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-medium">{client.cpfCnpj}</p>
                  </div>
                )}
                {client.telefone && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Telefone
                    </p>
                    <p className="font-medium">{client.telefone}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      E-mail Principal
                    </p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                )}
                {client.cep && (
                  <div>
                    <p className="text-sm text-muted-foreground">CEP</p>
                    <p className="font-medium">{client.cep}</p>
                  </div>
                )}
                {client.endereco && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Endereço
                    </p>
                    <p className="font-medium">{client.endereco}</p>
                  </div>
                )}
                {client.bancoRecebedor && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Banco Recebedor
                    </p>
                    <p className="font-medium">{client.bancoRecebedor}</p>
                  </div>
                )}
                {client.emailsAdicionais && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">E-mails Adicionais</p>
                    <p className="font-medium text-sm">{client.emailsAdicionais}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sites Vinculados */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sites Vinculados
            </h3>
            <ClientSites clientId={client.id} clientName={client.name} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
