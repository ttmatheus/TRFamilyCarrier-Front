import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from "react";

type Props = {
  children: React.ReactNode;
  role?: string;
};

export function ProtectedRoute({ children, role }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <div className="p-4 text-center text-red-500">Acesso negado</div>;
  }

  return <>{children}</>;
}
