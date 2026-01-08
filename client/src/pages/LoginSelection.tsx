import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { LogIn, Users } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function LoginSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Produtividade</h1>
          <p className="text-lg text-muted-foreground">Sistema de Gestão Financeira e Produtividade</p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manus OAuth Login */}
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = getLoginUrl()}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LogIn className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Login Manus</CardTitle>
              </div>
              <CardDescription>Para administradores e usuários principais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Faça login com sua conta Manus para acessar o sistema como administrador.
              </p>
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Entrar com Manus
              </Button>
            </CardContent>
          </Card>

          {/* Team Login */}
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setLocation("/team-login")}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Login da Equipe</CardTitle>
              </div>
              <CardDescription>Para membros da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Faça login com suas credenciais de equipe para acessar seu dashboard pessoal.
              </p>
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setLocation("/team-login")}
              >
                Entrar como Membro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-xs text-muted-foreground">
          <p>© 2026 Sistema de Produtividade. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
