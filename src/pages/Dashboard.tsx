// src/pages/DriverDashboard.tsx
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";
import { authService } from "@/services/authService";

type TripStatus = "scheduled" | "in_progress" | "completed" | "canceled";

type Trip = {
  id: string;
  origin: string;
  destination: string;
  status: TripStatus;
  date: string;
};

type FreightBillStatus = "pending" | "paid" | "cancelled";

type FreightBill = {
  id: number;
  initialValue: number;
  remainingValue: number;
  truckExpensesTotal: number;
  tripExpensesTotal: number;
  driverPaymentValue: number;
  companyRevenue: number;
  paymentStatus: FreightBillStatus;
  notes?: string | null;
};

export default function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [freightBills, setFreightBills] = useState<FreightBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const data = decodeToken(token);
        if (!data || data.role !== "driver") {
          window.location.href = "/";
          return;
        }
        const userId = data.id;

        const tripsResponse = await apiClient.get<Trip[]>(
          `/trip?user_id=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const freightBillsResponse = await apiClient.get<FreightBill[]>(
          `/freightbill?user_id=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTrips(tripsResponse.data);
        setFreightBills(freightBillsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Erro ao carregar dados. Tente novamente.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-700">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  // Função auxiliar para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTripStatusTranslation = (status: TripStatus) => {
    switch (status) {
      case "scheduled": return "Agendada";
      case "in_progress": return "Em Progresso";
      case "completed": return "Concluída";
      case "canceled": return "Cancelada";
      default: return status;
    }
  };

  const getFreightBillStatusTranslation = (status: FreightBillStatus) => {
    switch (status) {
      case "pending": return "Pendente";
      case "paid": return "Paga";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative"> {/* Adicionado 'relative' para posicionamento absoluto do botão */}
      <div className="absolute top-6 right-6"> {/* Posicionamento do botão */}
        <button
          onClick={authService.logout}
          className="flex items-center text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          Sair
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Dashboard do Motorista</h1>

      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-lg p-1 mb-4">
          <TabsTrigger
            value="trips"
            className="px-4 py-2 text-lg font-medium text-gray-700 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md transition-colors duration-200"
          >
            Viagens
          </TabsTrigger>
          <TabsTrigger
            value="freightBills"
            className="px-4 py-2 text-lg font-medium text-gray-700 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md transition-colors duration-200"
          >
            Cartas-Frete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Minhas Viagens</h2>
          {trips.length === 0 ? (
            <p className="text-gray-600">Você não possui viagens registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left border-b border-gray-200">ID da Viagem</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Origem</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Destino</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Status</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{trip.id}</td>
                      <td className="px-4 py-3">{trip.origin}</td>
                      <td className="px-4 py-3">{trip.destination}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trip.status === "completed" ? "bg-green-100 text-green-800" :
                          trip.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                          trip.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {getTripStatusTranslation(trip.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(trip.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="freightBills" className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Minhas Cartas-Frete</h2>
          {freightBills.length === 0 ? (
            <p className="text-gray-600">Você não possui cartas-frete registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left border-b border-gray-200">ID da Carta-Frete</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Valor Inicial</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Valor Restante</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Status de Pagamento</th>
                    <th className="px-4 py-3 text-left border-b border-gray-200">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {freightBills.map((bill) => (
                    <tr key={bill.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{bill.id}</td>
                      <td className="px-4 py-3">{formatCurrency(bill.initialValue)}</td>
                      <td className="px-4 py-3">{formatCurrency(bill.remainingValue)}</td>
                      <td className="px-4 py-3 capitalize">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bill.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                            bill.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {getFreightBillStatusTranslation(bill.paymentStatus)}
                          </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 italic">
                         {bill.notes || "Nenhuma nota."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}