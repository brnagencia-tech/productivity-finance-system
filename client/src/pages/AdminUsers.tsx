import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, UserPlus, Copy, Eye, EyeOff, RefreshCw, Trash2, Edit, Check, X } from "lucide-react";
import { useTeamAuth } from "@/hooks/useTeamAuth";

function generateStrongPassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = lowercase + uppercase + numbers + symbols;
  
  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = 0; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

function formatPhoneBR(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

function formatPhoneUS(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
}

export default function AdminUsers() {
  const { user } = useTeamAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneBR: "",
    phoneUS: "",
    password: "",
    confirmPassword: ""
  });

  const { data: managedUsers, refetch } = trpc.managedUsers.list.useQuery(undefined, {
    enabled: user?.role === "ceo" || user?.role === "master"
  });

  const createUser = trpc.managedUsers.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  });

  const deleteUser = trpc.managedUsers.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário desativado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const resetPassword = trpc.managedUsers.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneBR: "",
      phoneUS: "",
      password: "",
      confirmPassword: ""
    });
  };

  // Gerar username automaticamente baseado no nome
  const generateUsername = (firstName: string, lastName: string) => {
    const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.floor(Math.random() * 1000);
    return `${base}${random}`;
  };

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    const newFormData = { ...formData, [field]: value };
    if (!formData.username || formData.username === generateUsername(formData.firstName, formData.lastName)) {
      const newUsername = generateUsername(
        field === 'firstName' ? value : formData.firstName,
        field === 'lastName' ? value : formData.lastName
      );
      newFormData.username = newUsername;
    }
    setFormData(newFormData);
  };

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setFormData(prev => ({ ...prev, password: newPassword, confirmPassword: newPassword }));
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    toast.success("Senha copiada para a área de transferência!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres!");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      toast.error("Username deve conter apenas letras minúsculas, números e underscore!");
      return;
    }
    createUser.mutate({
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneBR: formData.phoneBR || undefined,
      phoneUS: formData.phoneUS || undefined,
      password: formData.password
    });
  };

  const handleResetPassword = (userId: number, userName: string) => {
    const newPassword = generateStrongPassword();
    if (confirm(`Redefinir senha de ${userName}?\n\nNova senha: ${newPassword}\n\nCopie esta senha antes de confirmar!`)) {
      resetPassword.mutate({ id: userId, newPassword });
    }
  };

  if (user?.role !== "ceo" && user?.role !== "master") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-destructive">Acesso Negado</CardTitle>
              <CardDescription>Você não tem permissão para acessar esta página.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-muted-foreground">Crie e gerencie usuários do sistema</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo usuário. A senha será gerada automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleNameChange('firstName', e.target.value)}
                        placeholder="João"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleNameChange('lastName', e.target.value)}
                        placeholder="Silva"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (@)</Label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">@</span>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        placeholder="joaosilva123"
                        required
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usado para menções no Kanban. Apenas letras minúsculas, números e _</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="joao@exemplo.com"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneBR">Telefone (Brasil)</Label>
                      <Input
                        id="phoneBR"
                        value={formData.phoneBR}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneBR: formatPhoneBR(e.target.value) }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneUS">Telefone (EUA)</Label>
                      <Input
                        id="phoneUS"
                        value={formData.phoneUS}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneUS: formatPhoneUS(e.target.value) }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Gerar Senha Forte
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Mínimo 8 caracteres"
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {formData.password && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyPassword}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme a senha"
                        required
                      />
                      {formData.confirmPassword && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {formData.password === formData.confirmPassword ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>Lista de todos os usuários criados por você</CardDescription>
          </CardHeader>
          <CardContent>
            {managedUsers && managedUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                      <TableCell className="text-primary font-medium">@{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phoneBR || u.phoneUS || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? "default" : "secondary"}>
                          {u.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("pt-BR") : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(u.id, `${u.firstName} ${u.lastName}`)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Redefinir Senha
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Desativar usuário ${u.firstName} ${u.lastName}?`)) {
                                deleteUser.mutate({ id: u.id });
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário cadastrado ainda.</p>
                <p className="text-sm">Clique em "Novo Usuário" para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
