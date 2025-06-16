import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  LogOut,
  ListOrdered,
  Activity,
} from "lucide-react";
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
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) {
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
      console.log(error);
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
      <main className="container mx-auto p-6 space-y-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bem-vindo, {user?.name}!
        </h2>

        {/* Cards de navegação */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded shadow border min-h-[220px] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center space-x-3 text-blue-700">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Gerenciar Usuários</span>
              </h3>
              <p className="text-gray-600 mb-6">
                Veja a lista completa de usuários e gerencie permissões.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="self-start bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Abrir Usuários
            </button>
          </div>

          <div className="bg-white p-8 rounded shadow border min-h-[220px] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center space-x-3">
                <ListOrdered className="w-6 h-6 text-blue-600" />
                <span>Pedidos</span>
              </h3>
              <p className="text-gray-600 mb-6">
                Controle os pedidos ativos e históricos da transportadora.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="self-start bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Abrir Pedidos
            </button>
          </div>

          <div className="bg-white p-8 rounded shadow border min-h-[220px] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center space-x-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <span>Relatórios</span>
              </h3>
              <p className="text-gray-600 mb-6">
                Acompanhe métricas e dados importantes da empresa.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/reports")}
              className="self-start bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Abrir Relatórios
            </button>
          </div>
        </section>

        {/* Notificações */}
        <section className="max-w-4xl mx-auto bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Notificações
          </h3>
          <p className="text-gray-700">Aqui vão ficar as notificações...</p>
        </section>
      </main>
    </div>
  );
}
