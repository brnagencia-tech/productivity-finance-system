import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [, params] = useRoute("/reset-password");
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Extrair token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Token de redefinição não encontrado na URL");
    }
  }, []);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError("");
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        setLocation("/team-login");
      }, 3000);
    },
    onError: (err) => {
      setError(err.message || "Erro ao redefinir senha");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validações
    if (!token) {
      setError("Token de redefinição não encontrado");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    // Chamar mutation
    resetPasswordMutation.mutate({
      token,
      newPassword,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
                minLength={8}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Mínimo de 8 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite novamente sua nova senha"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !token}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Redefinir Senha
            </Button>

            <div className="text-center text-sm">
              <a href="/team-login" className="text-primary hover:underline">
                Voltar para o login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
