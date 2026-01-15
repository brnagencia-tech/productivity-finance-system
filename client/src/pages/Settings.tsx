import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon, Key, Eye, EyeOff, Save, Check } from "lucide-react";

export default function Settings() {
  const [gptToken, setGptToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGptToken = () => {
    setIsSaving(true);
    // TODO: Implementar endpoint settings.set no backend
    setTimeout(() => {
      toast.success("Configuração salva com sucesso!");
      setIsSaving(false);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Token GPT (OpenAI)
              </CardTitle>
              <CardDescription>
                Configure o token da API do GPT para análises personalizadas. 
                O sistema já possui um token padrão, mas você pode usar o seu próprio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gptToken">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="gptToken"
                      type={showToken ? "text" : "password"}
                      value={gptToken}
                      onChange={(e) => setGptToken(e.target.value)}
                      placeholder="sk-..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={handleSaveGptToken} disabled={isSaving}>
                    {isSaving ? (
                      <>Salvando...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtenha sua API key em{" "}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Preferências Gerais
              </CardTitle>
              <CardDescription>
                Configure preferências gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notificações de Despesas</p>
                    <p className="text-sm text-muted-foreground">
                      Receber lembretes de despesas fixas próximas do vencimento
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm text-primary">Ativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Análises Semanais Automáticas</p>
                    <p className="text-sm text-muted-foreground">
                      Gerar análises de produtividade e gastos automaticamente
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm text-primary">Ativo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
