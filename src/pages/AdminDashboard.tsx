import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  LogOut,
  ListOrdered,
  Activity,
  Truck,
  FileText,
  Settings,
  AlertCircle,
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-orange-300" />
            <span>Painel Administrativo</span>
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:block">{user?.email}</span>
            <button
              onClick={authService.logout}
              className="flex items-center text-sm hover:text-orange-200 transition hover:bg-green-800 px-3 py-1 rounded"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Olá, <span className="text-green-700">{user?.name}</span>!
          </h2>
          <p className="text-gray-600 mt-1">
            Bem-vindo(a) ao painel de controle administrativo!
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Users className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Usuários
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Gerencie todos os usuários do sistema e suas permissões.
              </p>
              <button
                onClick={() => navigate("/admin/users")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Gerenciar Usuários
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Veículos
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Controle a frota de caminhões e veículos da empresa.
              </p>
              <button
                onClick={() => navigate("/admin/trucks")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Gerenciar Frota
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <ListOrdered className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Viagens</h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Visualize e gerencie todas as viagens programadas.
              </p>
              <button
                onClick={() => navigate("/admin/trips")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Ver Viagens
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Relatórios
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Acesse relatórios e métricas importantes da empresa.
              </p>
              <button
                onClick={() => navigate("/admin/reports")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Ver Relatórios
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FileText className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Fretes</h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Gerencie contratos e valores de fretes realizados.
              </p>
              <button
                onClick={() => navigate("/admin/freights")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Ver Fretes
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Manutenções
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Controle de manutenções preventivas e corretivas.
              </p>
              <button
                onClick={() => navigate("/admin/maintenance")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Ver Manutenções
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-50 hover:border-green-100">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Settings className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Configurações
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-5 flex-grow">
                Configurações gerais do sistema e preferências.
              </p>
              <button
                onClick={() => navigate("/admin/settings")}
                className="self-start bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
              >
                Configurar
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
              Alertas e Notificações
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm font-medium text-gray-800">
                  2 veículos com manutenção pendente
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Vencimento nos próximos 7 dias
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-800">
                  5 novas viagens agendadas
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Para os próximos 3 dias
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm font-medium text-gray-800">
                  1 motorista com documentação vencida
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  CNH vencida há 15 dias
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Activity className="w-5 h-5 text-green-600 mr-2" />
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Motoristas ativos</p>
                <p className="text-xl font-bold text-green-700">24</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Veículos disponíveis</p>
                <p className="text-xl font-bold text-green-700">18</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Viagens em andamento</p>
                <p className="text-xl font-bold text-green-700">7</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
