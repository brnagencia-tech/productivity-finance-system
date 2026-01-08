import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Trash2, Plus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdvancedUserManagement() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  // Queries
  const managedUsersQuery = trpc.managedUsers.list.useQuery();
  const rolesQuery = trpc.roles.list.useQuery();
  const userRolesQuery = trpc.roles.getUserRoles.useQuery(
    { userId: selectedUser || 0 },
    { enabled: !!selectedUser }
  );
  const sessionsQuery = trpc.sessions.list.useQuery();
  const auditLogsQuery = trpc.audit.getLogs.useQuery({ limit: 100 });

  // Mutations
  const assignRoleMutation = trpc.roles.assignRole.useMutation({
    onSuccess: () => {
      toast.success("Role atribuído com sucesso");
      userRolesQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const removeRoleMutation = trpc.roles.removeRole.useMutation({
    onSuccess: () => {
      toast.success("Role removido com sucesso");
      userRolesQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const logoutSessionMutation = trpc.sessions.logout.useMutation({
    onSuccess: () => {
      toast.success("Sessão encerrada");
      sessionsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão Avançada de Usuários</h1>
          <p className="text-muted-foreground">Gerencie roles, permissões, sessões e auditoria</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>

          {/* TAB: USUÁRIOS */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>Atribua e remova roles dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                {managedUsersQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {managedUsersQuery.data?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>@{user.username}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {userRolesQuery.data?.map((role) => (
                                  <Badge key={role.id} variant="outline">
                                    {role.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedUser(user.id)}
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Gerenciar Roles
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Gerenciar Roles - {user.firstName} {user.lastName}</DialogTitle>
                                    <DialogDescription>
                                      Atribua ou remova roles para este usuário
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Adicionar Role</Label>
                                      <div className="flex gap-2 mt-2">
                                        <Select onValueChange={(value) => setSelectedRole(parseInt(value))}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione um role" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {rolesQuery.data?.map((role) => (
                                              <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          onClick={() => {
                                            if (selectedUser && selectedRole) {
                                              assignRoleMutation.mutate({
                                                userId: selectedUser,
                                                roleId: selectedRole,
                                              });
                                            }
                                          }}
                                          disabled={!selectedRole || assignRoleMutation.isPending}
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Adicionar
                                        </Button>
                                      </div>
                                    </div>

                                    <div>
                                      <Label>Roles Atuais</Label>
                                      <div className="space-y-2 mt-2">
                                        {userRolesQuery.isLoading ? (
                                          <Loader2 className="animate-spin" />
                                        ) : userRolesQuery.data?.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">Nenhum role atribuído</p>
                                        ) : (
                                          userRolesQuery.data?.map((role) => (
                                            <div key={role.id} className="flex justify-between items-center p-2 border rounded">
                                              <span>{role.name}</span>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                  if (selectedUser) {
                                                    removeRoleMutation.mutate({
                                                      userId: selectedUser,
                                                      roleId: role.id,
                                                    });
                                                  }
                                                }}
                                                disabled={removeRoleMutation.isPending}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: ROLES */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Roles Disponíveis</CardTitle>
                <CardDescription>Lista de todos os roles do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {rolesQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {rolesQuery.data?.map((role) => (
                      <Card key={role.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{role.name}</CardTitle>
                              <CardDescription>{role.description}</CardDescription>
                            </div>
                            <Badge>{role.name}</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: SESSÕES */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Sessões Ativas</CardTitle>
                <CardDescription>Gerencie suas sessões de login</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Criada em</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Expira em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionsQuery.data?.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                          <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(session.lastActivityAt).toLocaleTimeString()}</TableCell>
                          <TableCell>{new Date(session.expiresAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => logoutSessionMutation.mutate({ sessionId: session.id })}
                              disabled={logoutSessionMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: AUDITORIA */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log de Auditoria</CardTitle>
                <CardDescription>Histórico de ações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ação</TableHead>
                        <TableHead>Recurso</TableHead>
                        <TableHead>Detalhes</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogsQuery.data?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
