import { useTeamAuth } from "@/hooks/useTeamAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  // Check both OAuth and managed user authentication
  const teamAuth = useTeamAuth();
  const oauthAuth = useAuth();
  const [, setLocation] = useLocation();

  // User is authenticated if either OAuth or team auth is valid
  const isAuthenticated = teamAuth.isAuthenticated || oauthAuth.isAuthenticated;
  const isLoading = teamAuth.isLoading || oauthAuth.loading;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/team-login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
