// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { ShieldCheck, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { decodeToken } from "@/utils/jwtDecode";

type User = {
  name: string;
  email: string;
  role: string;
  id: number;
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
      if(!token) {
        navigate("/");
        return;
      }
		  const data = decodeToken(token);
		if (!data || data.role !== "admin") {
			navigate("/dashboard");
		} else {
			setUser(data);
		}
		} catch (error) {
      console.log(error)
		}
	}, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6" />
            <span>Admin Dashboard</span>
          </h1>
          <button
            onClick={authService.logout}
            className="flex items-center text-sm hover:text-blue-200 transition"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bem-vindo, {user?.name}!
        </h2>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate("/admin/users")}
            className="bg-white p-6 rounded shadow border cursor-pointer hover:bg-gray-50 transition"
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2 text-blue-700">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Gerenciar Usuários</span>
            </h3>
            <p className="text-sm text-gray-600">
              Clique para ver a lista de usuários.
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow border">
            <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
              <span className="text-blue-600 font-bold">📦</span>
              <span>Pedidos</span>
            </h3>
            <p className="text-sm text-gray-600">
              Veja e controle os pedidos em andamento.
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow border">
            <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
              <span className="text-blue-600 font-bold">📊</span>
              <span>Relatórios</span>
            </h3>
            <p className="text-sm text-gray-600">
              Acompanhe estatísticas e desempenho da transportadora.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
