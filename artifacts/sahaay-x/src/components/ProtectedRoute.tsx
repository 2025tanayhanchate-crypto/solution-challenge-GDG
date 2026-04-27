import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  
  // We need a slight delay or check to ensure localStorage has been read
  // but for simplicity in this demo, if token is null we redirect
  
  if (!isAuthenticated && !localStorage.getItem("sahaax_token")) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
