import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeamAuth } from "@/hooks/useTeamAuth";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useTeamAuth();
  
  const isTeamUser = !!user;

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneBR, setPhoneBR] = useState("");
  const [phoneUS, setPhoneUS] = useState("");

  const getUserName = () => {
    if (user) return `${user.firstName} ${user.lastName}`;
    return "Usuário";
  };

  const getUserInitial = () => {
    if (user) return user.firstName.charAt(0).toUpperCase();
    return "U";
  };

  const getUserEmail = () => {
    if (user) return user.email;
    return "-";
  };

  const getUserRole = () => {
    return "Membro da Equipe";
  };

  const handleSave = async () => {
    // TODO: Implementar lógica de salvamento via tRPC
    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Resetar valores
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e edite suas informações pessoais
          </p>
        </div>

        {/* Card de Informações Básicas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Suas informações da equipe
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar e Nome */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {getUserInitial()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">{getUserName()}</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {getUserEmail()}
                </p>
              </div>
            </div>

            {/* Campos de Edição (apenas para Team Users) */}
            {isTeamUser && isEditing ? (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneBR">Telefone BR</Label>
                    <Input
                      id="phoneBR"
                      value={phoneBR}
                      onChange={(e) => setPhoneBR(e.target.value)}
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneUS">Telefone US</Label>
                    <Input
                      id="phoneUS"
                      value={phoneUS}
                      onChange={(e) => setPhoneUS(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave}>Salvar Alterações</Button>
                  <Button onClick={handleCancel} variant="outline">Cancelar</Button>
                </div>
              </div>
            ) : (
              /* Informações Somente Leitura */
              <div className="grid gap-4 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nome de usuário:</span>
                  <span className="font-medium text-foreground">
                    {user?.username || "-"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tipo de conta:</span>
                  <span className="font-medium text-foreground">{getUserRole()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Informações da Conta */}
        <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Detalhes sobre sua conta da equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ID da conta:</span>
                <span className="font-mono text-foreground">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600">
                  {user?.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium text-foreground">@{user?.username}</span>
              </div>
            </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
}
