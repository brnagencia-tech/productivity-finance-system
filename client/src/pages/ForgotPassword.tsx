import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError("");
      setIsLoading(false);
    },
    onError: (err) => {
      setError(err.message || "Erro ao solicitar redefinição de senha");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Sanitizar email
    const sanitizedEmail = email.trim().toLowerCase();

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setError("Por favor, insira um email válido");
      setIsLoading(false);
      return;
    }

    // Chamar mutation
    requestResetMutation.mutate({ email: sanitizedEmail });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Email Enviado!</CardTitle>
            <CardDescription>
              Se o email fornecido estiver cadastrado, você receberá um link para redefinir sua senha.
              Verifique sua caixa de entrada e spam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/team-login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Esqueci Minha Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber um link de redefinição de senha
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Link de Redefinição
            </Button>

            <div className="text-center text-sm">
              <a href="/team-login" className="text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Voltar para o login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
