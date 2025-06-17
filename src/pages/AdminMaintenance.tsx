import { useEffect, useState } from "react";
import {
  Wrench,
  PenTool,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Truck,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Maintenance = {
  id: number;
  truck_id: number;
  maintenance_type: string;
  description: string;
  cost: number;
  mileage: number;
  maintenance_date: string;
  next_maintenance_date: string;
  service_provider: string;
  receipt_url: string;
  truck?: {
    license_plate: string;
    brand: string;
    model: string;
  };
};

type Truck = {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
};

export default function AdminMaintenance() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    truck_id: "",
    maintenance_type: "preventive",
    description: "",
    cost: 0,
    mileage: 0,
    maintenance_date: null as Date | null,
    next_maintenance_date: null as Date | null,
    service_provider: "",
    receipt_url: "",
  });

  const fetchData = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return navigate("/");

      const [maintenancesRes, trucksRes] = await Promise.all([
        apiClient.get("/maintenance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get("/truck", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMaintenances(maintenancesRes.data as Maintenance[]);
      setTrucks(trucksRes.data as Truck[]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaintenance = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      if (!form.truck_id || !form.maintenance_date) {
        alert("Selecione um caminhão e a data da manutenção");
        return;
      }

      const maintenanceData = {
        ...form,
        truck_id: parseInt(form.truck_id),
        maintenance_date: form.maintenance_date.toISOString(),
        next_maintenance_date: form.next_maintenance_date?.toISOString(),
      };

      await apiClient.post("/maintenance/create", maintenanceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Erro ao registrar manutenção:", error);
      alert(
        "Ocorreu um erro ao registrar a manutenção. Verifique os dados e tente novamente."
      );
    }
  };

  const deleteMaintenance = async (id: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este registro de manutenção?"
    );
    if (!confirmed) return;

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      await apiClient.delete(`/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchData();
    } catch (error) {
      console.error("Erro ao excluir manutenção:", error);
      alert("Não foi possível excluir o registro de manutenção.");
    }
  };

  const resetForm = () => {
    setForm({
      truck_id: "",
      maintenance_type: "preventive",
      description: "",
      cost: 0,
      mileage: 0,
      maintenance_date: null,
      next_maintenance_date: null,
      service_provider: "",
      receipt_url: "",
    });
  };

  const toggleRow = (maintenanceId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [maintenanceId]: !prev[maintenanceId],
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getMaintenanceType = (type: string) => {
    const types = {
      preventive: "Preventiva",
      corrective: "Corretiva",
      predictive: "Preditiva",
      other: "Outra",
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Wrench className="w-8 h-8 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-800">
              Gestão de Manutenções
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cancelar" : "Nova Manutenção"}
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm text-green-700 hover:underline flex items-center"
            >
              ← Voltar ao dashboard
            </button>
          </div>
        </div>

        {/* Formulário de Criação */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-700" />
              Registrar Nova Manutenção
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Caminhão *
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.truck_id}
                  onChange={(e) =>
                    setForm({ ...form, truck_id: e.target.value })
                  }
                >
                  <option value="">Selecione um caminhão</option>
                  {trucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.license_plate} - {truck.brand} {truck.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tipo de Manutenção
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.maintenance_type}
                  onChange={(e) =>
                    setForm({ ...form, maintenance_type: e.target.value })
                  }
                >
                  <option value="preventive">Preventiva</option>
                  <option value="corrective">Corretiva</option>
                  <option value="predictive">Preditiva</option>
                  <option value="other">Outra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Data da Manutenção *
                </label>
                <DatePicker
                  selected={form.maintenance_date}
                  onChange={(date: Date | null) =>
                    setForm({ ...form, maintenance_date: date })
                  }
                  dateFormat="dd/MM/yyyy"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholderText="Selecione a data"
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Próxima Manutenção
                </label>
                <DatePicker
                  selected={form.next_maintenance_date}
                  onChange={(date: Date | null) =>
                    setForm({ ...form, next_maintenance_date: date })
                  }
                  dateFormat="dd/MM/yyyy"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholderText="Selecione a data"
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Quilometragem
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  value={form.mileage}
                  onChange={(e) =>
                    setForm({ ...form, mileage: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Custo (R$)
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) =>
                    setForm({ ...form, cost: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Prestador de Serviço
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Nome da oficina/mecânico"
                  value={form.service_provider}
                  onChange={(e) =>
                    setForm({ ...form, service_provider: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  URL do Comprovante
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Link para o comprovante"
                  value={form.receipt_url}
                  onChange={(e) =>
                    setForm({ ...form, receipt_url: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Descrição *
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Descreva os serviços realizados"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              onClick={handleCreateMaintenance}
              className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800"
            >
              Registrar Manutenção
            </button>
          </div>
        )}

        {/* Lista de Manutenções */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-green-50 text-gray-700">
                <tr>
                  <th className="text-left px-6 py-3">Caminhão</th>
                  <th className="text-left px-6 py-3">Tipo</th>
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3">Custo</th>
                  <th className="text-left px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.map((maintenance) => (
                  <>
                    <tr
                      key={maintenance.id}
                      className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                      onClick={() => toggleRow(maintenance.id)}
                    >
                      <td className="px-6 py-4">
                        {maintenance.truck ? (
                          <div>
                            <div className="font-medium">
                              {maintenance.truck.license_plate}
                            </div>
                            <div className="text-xs text-gray-500">
                              {maintenance.truck.brand}{" "}
                              {maintenance.truck.model}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            Caminhão não encontrado
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {getMaintenanceType(maintenance.maintenance_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(maintenance.maintenance_date)}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(maintenance.cost)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(maintenance.id);
                          }}
                        >
                          {expandedRows[maintenance.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[maintenance.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <PenTool className="w-4 h-4 mr-2 text-orange-600" />
                                Detalhes
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Descrição:
                                  </span>{" "}
                                  {maintenance.description}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Quilometragem:
                                  </span>{" "}
                                  {maintenance.mileage} km
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                                Próximos Passos
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {maintenance.next_maintenance_date ? (
                                  <p>
                                    <span className="font-medium">
                                      Próxima Manutenção:
                                    </span>{" "}
                                    {formatDate(
                                      maintenance.next_maintenance_date
                                    )}
                                  </p>
                                ) : (
                                  <p className="text-gray-400">
                                    Nenhuma data agendada
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-orange-600" />
                                Financeiro
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Prestador:
                                  </span>{" "}
                                  {maintenance.service_provider ||
                                    "Não informado"}
                                </p>
                                {maintenance.receipt_url && (
                                  <a
                                    href={maintenance.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:underline"
                                  >
                                    Ver comprovante
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Implementar edição
                              }}
                              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMaintenance(maintenance.id);
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
                {maintenances.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-8 text-gray-500"
                    >
                      Nenhuma manutenção registrada.
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
