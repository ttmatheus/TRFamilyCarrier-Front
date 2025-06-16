import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";

type Trip = {
  id: number;
  destination?: string;
};

type FreightBill = {
  id: number;
  company_revenue?: number;
};

type Expense = {
  id: number;
  value?: number;
};

type TopDestination = {
  destination: string;
  count: number;
};

type ReportData = {
  totalTrips: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  topDestinations: TopDestination[];
};

export default function AdminReports() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [freightBills, setFreightBills] = useState<FreightBill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

    if (!token) return navigate("/");

    const fetchAllData = async () => {
      try {
        const data = decodeToken(token);
        if (!data?.id) {
          setErrorMessage("ID do usuário não encontrado no token.");
          return;
        }

        const [tripsRes, billsRes] = await Promise.all([
          apiClient
            .get(`/trip?user_id=${data.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
          apiClient
            .get(`/freightbill?user_id=${data.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch((err) => {
              if (err.response?.status === 204) return { data: [] };
              throw err;
            }),
        ]);

        const tripsData = Array.isArray(tripsRes.data) ? tripsRes.data : [];
        const freightBillData = Array.isArray(billsRes.data)
          ? billsRes.data
          : [];

        setTrips(tripsData);
        setFreightBills(freightBillData);

        if (tripsData.length === 0 && freightBillData.length === 0) {
          setErrorMessage("Nenhum dado encontrado para gerar o relatório.");
          return;
        }

        const reportData = generateReportData(tripsData, freightBillData);
        setReport(reportData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErrorMessage("Erro ao carregar os dados.");
      }
    };

    fetchAllData();
  }, []);

  const generateReportData = (
    trips: Trip[],
    freightBills: FreightBill[]
  ): ReportData => {
    const totalTrips = trips.length;

    const totalRevenue = freightBills.reduce(
      (sum, bill) => sum + (bill.company_revenue ?? 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + (exp.value ?? 0),
      0
    );

    const profit = totalRevenue - totalExpenses;

    const destinationsCount = trips.reduce(
      (acc: Record<string, number>, trip) => {
        const dest = trip.destination?.trim();
        if (!dest) return acc;
        acc[dest] = (acc[dest] || 0) + 1;
        return acc;
      },
      {}
    );

    const topDestinations = Object.entries(destinationsCount)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTrips,
      totalRevenue,
      totalExpenses,
      profit,
      topDestinations,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span>Relatórios da Empresa</span>
          </h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-green-600 hover:underline"
          >
            ← Voltar ao dashboard
          </button>
        </div>

        {errorMessage ? (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            {errorMessage}
          </div>
        ) : report ? (
          <div className="bg-white rounded shadow border p-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
              <div>
                <span className="text-gray-600">Total de Viagens:</span>{" "}
                <span className="font-medium text-gray-900">
                  {report.totalTrips}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Receita Total:</span>{" "}
                <span className="font-medium text-green-600">
                  R$ {report.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Lucro Total:</span>{" "}
                <span
                  className={`font-bold ${
                    report.profit >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  R$ {report.profit.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Destinos Mais Frequentes
              </h2>
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2">Destino</th>
                      <th className="text-left px-4 py-2">Ocorrências</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topDestinations.length > 0 ? (
                      report.topDestinations.map((dest, i) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2">{dest.destination}</td>
                          <td className="px-4 py-2">{dest.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="text-center px-4 py-4 text-gray-500"
                        >
                          Nenhum destino encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10">
            Carregando relatório...
          </p>
        )}
      </div>
    </div>
  );
}
