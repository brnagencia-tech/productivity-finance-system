import { useTeamAuth } from "@/hooks/useTeamAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated: isTeamAuthenticated, isLoading: teamLoading } = useTeamAuth();
  const { isAuthenticated: isOAuthAuthenticated, loading: oauthLoading } = useAuth();
  const [, setLocation] = useLocation();

  const isLoading = teamLoading || oauthLoading;
  const isAuthenticated = isTeamAuthenticated || isOAuthAuthenticated;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login-selection");
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
