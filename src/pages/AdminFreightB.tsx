import { useEffect, useState } from "react";
import {
  FileText,
  DollarSign,
  Truck,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FreightBill = {
  id: number;
  trip_id: number;
  initial_value: number;
  remaining_value: number;
  truck_expenses_total: number;
  trip_expenses_total: number;
  driver_payment_value: number;
  company_revenue: number;
  payment_status: "pending" | "partial" | "paid";
  notes: string;
  created_at: string;
  trip?: {
    origin: string;
    destination: string;
    departure_time: string;
    driver?: {
      name: string;
    };
  };
};

type Trip = {
  id: number;
  origin: string;
  destination: string;
  departure_time: string;
  driver?: {
    name: string;
  };
};

export default function AdminFreightBills() {
  const [freightBills, setFreightBills] = useState<FreightBill[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    trip_id: "",
    initial_value: 0,
    truck_expenses_total: 0,
    trip_expenses_total: 0,
    driver_payment_value: 0,
    payment_status: "pending" as "pending" | "partial" | "paid",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return navigate("/");

      const user = decodeToken(token);
      if (!user?.id) throw new Error("Usuário não identificado");

      const [freightBillsRes, tripsRes] = await Promise.all([
        apiClient.get(`/freightbill?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get(`/trip?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setFreightBills(freightBillsRes.data as FreightBill[]);
      setTrips(tripsRes.data as Trip[]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFreightBill = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      if (!form.trip_id) {
        alert("Selecione uma viagem para associar a carta de frete");
        return;
      }

      const freightBillData = {
        ...form,
        trip_id: parseInt(form.trip_id),
        remaining_value: form.initial_value,
        company_revenue:
          form.initial_value -
          form.driver_payment_value -
          form.truck_expenses_total -
          form.trip_expenses_total,
      };

      await apiClient.post("/freightbill/create", freightBillData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar carta de frete:", error);
      alert(
        "Ocorreu um erro ao criar a carta de frete. Verifique os dados e tente novamente."
      );
    }
  };

  const deleteFreightBill = async (id: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta carta de frete?"
    );
    if (!confirmed) return;

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      await apiClient.delete(`/freightbill/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchData();
    } catch (error) {
      console.error("Erro ao excluir carta de frete:", error);
      alert(
        "Não foi possível excluir a carta de frete. Verifique se há alguma restrição."
      );
    }
  };

  const resetForm = () => {
    setForm({
      trip_id: "",
      initial_value: 0,
      truck_expenses_total: 0,
      trip_expenses_total: 0,
      driver_payment_value: 0,
      payment_status: "pending",
      notes: "",
    });
  };

  const toggleRow = (freightBillId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [freightBillId]: !prev[freightBillId],
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      partial: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
    };

    const statusText = {
      pending: "Pendente",
      partial: "Parcial",
      paid: "Pago",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-800">
              Cartas de Frete
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cancelar" : "Nova Carta de Frete"}
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-green-700 hover:underline flex items-center"
            >
              ← Voltar ao dashboard
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-700" />
              Nova Carta de Frete
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Viagem Associada *
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.trip_id}
                  onChange={(e) =>
                    setForm({ ...form, trip_id: e.target.value })
                  }
                >
                  <option value="">Selecione uma viagem</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.origin} → {trip.destination} (
                      {new Date(trip.departure_time).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Valor Inicial *
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.initial_value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      initial_value: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status do Pagamento
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.payment_status}
                  onChange={(e) =>
                    setForm({ ...form, payment_status: e.target.value as any })
                  }
                >
                  <option value="pending">Pendente</option>
                  <option value="partial">Parcial</option>
                  <option value="paid">Pago</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Despesas com Caminhão
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.truck_expenses_total}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      truck_expenses_total: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Despesas com Viagem
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.trip_expenses_total}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trip_expenses_total: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Pagamento ao Motorista
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.driver_payment_value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      driver_payment_value: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Observações
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Anotações relevantes sobre o frete"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 bg-green-50 p-3 rounded-lg border border-green-100">
                <h4 className="font-medium text-gray-900 mb-2">
                  Resumo Financeiro
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-600">Valor Total:</div>
                    <div className="font-medium">
                      {formatCurrency(form.initial_value)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total Despesas:</div>
                    <div className="font-medium text-red-600">
                      {formatCurrency(
                        form.truck_expenses_total +
                          form.trip_expenses_total +
                          form.driver_payment_value
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Lucro da Empresa:</div>
                    <div
                      className={`font-medium ${
                        form.initial_value -
                          form.truck_expenses_total -
                          form.trip_expenses_total -
                          form.driver_payment_value >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        form.initial_value -
                          form.truck_expenses_total -
                          form.trip_expenses_total -
                          form.driver_payment_value
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateFreightBill}
              className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800"
            >
              Cadastrar Carta de Frete
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-green-50 text-gray-700">
                <tr>
                  <th className="text-left px-6 py-3">Viagem</th>
                  <th className="text-left px-6 py-3">Valor Total</th>
                  <th className="text-left px-6 py-3">Status Pagamento</th>
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {freightBills.map((freightBill) => (
                  <>
                    <tr
                      key={freightBill.id}
                      className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                      onClick={() => toggleRow(freightBill.id)}
                    >
                      <td className="px-6 py-4">
                        {freightBill.trip ? (
                          <div>
                            <div className="font-medium">
                              {freightBill.trip.origin} →{" "}
                              {freightBill.trip.destination}
                            </div>
                            {freightBill.trip.driver && (
                              <div className="text-xs text-gray-500 mt-1">
                                Motorista: {freightBill.trip.driver.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            Viagem não encontrada
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(freightBill.initial_value)}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(freightBill.payment_status)}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(freightBill.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(freightBill.id);
                          }}
                        >
                          {expandedRows[freightBill.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[freightBill.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-orange-600" />
                                Valores
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Valor Inicial:
                                  </span>{" "}
                                  {formatCurrency(freightBill.initial_value)}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Valor Restante:
                                  </span>{" "}
                                  {formatCurrency(freightBill.remaining_value)}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Pagamento Motorista:
                                  </span>{" "}
                                  {formatCurrency(
                                    freightBill.driver_payment_value
                                  )}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Truck className="w-4 h-4 mr-2 text-orange-600" />
                                Despesas
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Caminhão:</span>{" "}
                                  {formatCurrency(
                                    freightBill.truck_expenses_total
                                  )}
                                </p>
                                <p>
                                  <span className="font-medium">Viagem:</span>{" "}
                                  {formatCurrency(
                                    freightBill.trip_expenses_total
                                  )}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Total Despesas:
                                  </span>{" "}
                                  {formatCurrency(
                                    freightBill.truck_expenses_total +
                                      freightBill.trip_expenses_total
                                  )}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-orange-600" />
                                Resultado
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Receita da Empresa:
                                  </span>{" "}
                                  {formatCurrency(freightBill.company_revenue)}
                                </p>
                                <p>
                                  <span className="font-medium">Margem:</span>{" "}
                                  {freightBill.initial_value
                                    ? `${(
                                        (freightBill.company_revenue /
                                          freightBill.initial_value) *
                                        100
                                      ).toFixed(2)}%`
                                    : "0%"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {freightBill.notes && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Observações
                              </h4>
                              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                                {freightBill.notes}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFreightBill(freightBill.id);
                              }}
                              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {freightBills.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-8 text-gray-500"
                    >
                      Nenhuma carta de frete cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
