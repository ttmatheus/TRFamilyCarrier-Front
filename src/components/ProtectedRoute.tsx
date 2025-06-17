import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from "react";

type Props = {
  children: React.ReactNode;
  userType?: string;
};

export function ProtectedRoute({ children, userType }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userType && user?.userType !== userType) {
    return <div className="p-4 text-center text-red-500">Acesso negado</div>;
  }

  return <>{children}</>;
}
