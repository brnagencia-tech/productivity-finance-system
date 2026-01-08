import { useEffect, useState } from "react";

export interface TeamUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  role: "ceo" | "master" | "colaborador";
}

export function useTeamAuth() {
  const [user, setUser] = useState<TeamUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário armazenado em localStorage
    const storedUser = localStorage.getItem("teamUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao parsear usuário armazenado:", error);
        localStorage.removeItem("teamUser");
        localStorage.removeItem("teamToken");
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("teamUser");
    localStorage.removeItem("teamToken");
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout
  };
}
