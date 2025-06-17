import { useEffect, useState } from "react";
import {
  BarChart3,
  Truck,
  Users,
  FileText,
  Activity,
  Calendar,
  TrendingUp,
  DollarSign,
  MapPin,
  Package,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";

type Trip = {
  id: number;
  destination: string;
  departureTime: string;
  status: string;
  cargoWeight: number;
  origin: string;
};

type FreightBill = {
  id: number;
  companyRevenue: number;
  paymentStatus: string;
  tripId: number;
};

type Expense = {
  id: number;
  value: number;
  expense_type: string;
  expense_date: string;
};

type ReportData = {
  metrics: {
    totalTrips: number;
    activeTrips: number;
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
  };
  recentTrips: Trip[];
  topDestinations: { destination: string; count: number }[];
  expensesByType: { type: string; total: number }[];
};

export default function AdminReports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Adicione estas interfaces no topo do arquivo
  interface ApiResponse<T> {
    data: T;
    status: number;
    // outros campos que sua API retorna
  }

  type TripResponse = {
  id: number;
  origin: string;
  destination: string;
  status: string;
  departure_time: string;
  arrival_time: string;
  receiver_name: string;
  receiver_document: string;
  cargo_description: string;
  cargo_weight: number;
  driver_id?: number;
  truck_id?: number;
  driver?: {
    name: string;
  };
  truck?: {
    licensePlate: string;
  };
};

  interface FreightBillResponse {
    id: number;
    companyRevenue: number;
    paymentStatus: string;
    tripId: number;
  }

  interface ExpenseResponse {
    id: number;
    value: number;
    expense_type: string;
    expense_date: string;
  }

  const ensureArray = <T,>(
    data: unknown,
    guard: (item: unknown) => item is T
  ): T[] => {
    if (!Array.isArray(data)) return [];
    return data.filter(guard);
  };

  const isTripResponse = (item: unknown): item is TripResponse => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "destination" in item
    );
  };

  const isFreightBillResponse = (
    item: unknown
  ): item is FreightBillResponse => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "companyRevenue" in item
    );
  };

  const isExpenseResponse = (item: unknown): item is ExpenseResponse => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "value" in item
    );
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return navigate("/");

      const user = decodeToken(token);
      if (!user?.id) throw new Error("Usuário não identificado");

      const [tripsRes, freightBillsRes, expensesRes] = await Promise.all([
        apiClient.get<ApiResponse<TripResponse[]>>(`/trip/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get<ApiResponse<FreightBillResponse[]>>(
          `/freightbill/freightbills`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        apiClient.get<ApiResponse<ExpenseResponse[]>>(`/expense/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const trips: Trip[] = ensureArray(tripsRes.data.data, isTripResponse).map(
        (trip) => ({
          id: trip.id,
          destination: trip.destination,
          departureTime: trip.departure_time,
          status: trip.status,
          cargoWeight: trip.cargo_weight,
          origin: trip.origin,
        })
      );

      const freightBills: FreightBill[] = ensureArray(
        freightBillsRes.data.data,
        isFreightBillResponse
      ).map((bill) => ({
        id: bill.id,
        companyRevenue: bill.companyRevenue,
        paymentStatus: bill.paymentStatus,
        tripId: bill.tripId,
      }));

      const expenses: Expense[] = ensureArray(
        expensesRes.data.data,
        isExpenseResponse
      ).map((exp) => ({
        id: exp.id,
        value: exp.value,
        expense_type: exp.expense_type,
        expense_date: exp.expense_date,
      }));

      const reportData = generateReportData(trips, freightBills, expenses);
      setReport(reportData);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setError("Falha ao carregar os dados do relatório");
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = (
    trips: Trip[],
    freightBills: FreightBill[],
    expenses: Expense[]
  ): ReportData => {
    const totalTrips = trips.length;
    const activeTrips = trips.filter((t) => t.status === "in_progress").length;

    const totalRevenue = freightBills.reduce(
      (sum, bill) => sum + (bill.companyRevenue || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + (exp.value || 0),
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

    const expensesByType = expenses.reduce(
      (acc: Record<string, number>, exp) => {
        const type = exp.expense_type?.trim() || "Outros";
        acc[type] = (acc[type] || 0) + (exp.value || 0);
        return acc;
      },
      {}
    );

    const expensesByTypeArray = Object.entries(expensesByType)
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total);

    const recentTrips = [...trips]
      .sort(
        (a, b) =>
          new Date(b.departureTime).getTime() -
          new Date(a.departureTime).getTime()
      )
      .slice(0, 5);

    return {
      metrics: {
        totalTrips,
        activeTrips,
        totalRevenue,
        totalExpenses,
        profit,
      },
      recentTrips,
      topDestinations,
      expensesByType: expensesByTypeArray,
    };
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const refreshData = () => {
    fetchReportData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-800">
              Relatórios e Análises
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-green-700 hover:underline flex items-center justify-center md:justify-start"
            >
              ← Voltar ao dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-600" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
            <button
              onClick={fetchReportData}
              className="mt-2 text-sm text-red-700 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Truck className="w-6 h-6" />}
                title="Total de Viagens"
                value={report.metrics.totalTrips}
                trend="neutral"
                color="blue"
              />
              <MetricCard
                icon={<Activity className="w-6 h-6" />}
                title="Viagens Ativas"
                value={report.metrics.activeTrips}
                trend="neutral"
                color="blue"
              />
              <MetricCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Receita Total"
                value={formatCurrency(report.metrics.totalRevenue)}
                trend="up"
                color="green"
              />
              <MetricCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Lucro"
                value={formatCurrency(report.metrics.profit)}
                trend={report.metrics.profit >= 0 ? "up" : "down"}
                color={report.metrics.profit >= 0 ? "green" : "red"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-700" />
                  Viagens Recentes
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-green-50 text-gray-700">
                      <tr>
                        <th className="text-left px-4 py-2">
                          Origem → Destino
                        </th>
                        <th className="text-left px-4 py-2">Data</th>
                        <th className="text-left px-4 py-2">Status</th>
                        <th className="text-left px-4 py-2">Carga (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentTrips.map((trip) => (
                        <tr
                          key={trip.id}
                          className="border-t border-green-100 hover:bg-green-50"
                        >
                          <td className="px-4 py-3">
                            {trip.origin} → {trip.destination}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(trip.departureTime).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={trip.status} />
                          </td>
                          <td className="px-4 py-3">{trip.cargoWeight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-700" />
                  Destinos Mais Frequentes
                </h2>
                <div className="space-y-3">
                  {report.topDestinations.map((dest, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{dest.destination}</span>
                      <span className="font-medium text-green-700">
                        {dest.count} viagens
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-700" />
                Despesas por Tipo
              </h2>
              <div className="space-y-2">
                {report.expensesByType.map((expense, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {expense.type}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(expense.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (expense.total / report.metrics.totalExpenses) * 100
                          }%`,
                          maxWidth: "100%",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  color: "green" | "red" | "blue";
};

const MetricCard = ({ icon, title, value, trend, color }: MetricCardProps) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-blue-600",
  };

  const bgColors = {
    green: "bg-green-100",
    red: "bg-red-100",
    blue: "bg-blue-100",
  };

  const iconColors = {
    green: "text-green-700",
    red: "text-red-700",
    blue: "text-blue-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex justify-between">
        <div
          className={`rounded-lg p-2 ${bgColors[color]} ${iconColors[color]}`}
        >
          {icon}
        </div>
        {trend !== "neutral" && (
          <span className={`text-sm ${trendColors[trend]}`}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-500 mt-2">{title}</h3>
      <p
        className={`text-2xl font-bold mt-1 ${
          color === "green"
            ? "text-green-700"
            : color === "red"
            ? "text-red-700"
            : "text-blue-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    scheduled: { color: "bg-blue-100 text-blue-800", text: "Agendada" },
    in_progress: {
      color: "bg-yellow-100 text-yellow-800",
      text: "Em Andamento",
    },
    completed: { color: "bg-green-100 text-green-800", text: "Concluída" },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada" },
  };

  const statusInfo = statusMap[status] || {
    color: "bg-gray-100 text-gray-800",
    text: status,
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
      {statusInfo.text}
    </span>
  );
};
