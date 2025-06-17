import { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Wrench,
  Fuel,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Truck = {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  max_load_capacity: number;
  current_mileage: number;
  maintenance_due_date: string;
  insurance_expiration: string;
  status: "available" | "in_use" | "maintenance" | "inactive";
};

export default function AdminTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    license_plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    fuel_type: "diesel",
    max_load_capacity: 0,
    current_mileage: 0,
    maintenance_due_date: null as Date | null,
    insurance_expiration: null as Date | null,
    status: "available" as "available" | "in_use" | "maintenance" | "inactive",
  });

  const fetchTrucks = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return navigate("/");

      const response = await apiClient.get("/truck", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrucks(response.data as Truck[]);
    } catch (error) {
      console.error("Erro ao buscar caminhões:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTruck = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      if (!form.license_plate || !form.brand || !form.model) {
        alert("Preencha os campos obrigatórios (placa, marca e modelo)");
        return;
      }

      const truckData = {
        ...form,
        maintenance_due_date: form.maintenance_due_date?.toISOString(),
        insurance_expiration: form.insurance_expiration?.toISOString(),
      };

      await apiClient.post("/truck/create", truckData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      resetForm();
      await fetchTrucks();
    } catch (error) {
      console.error("Erro ao criar caminhão:", error);
      alert(
        "Ocorreu um erro ao cadastrar o caminhão. Verifique os dados e tente novamente."
      );
    }
  };

  const deleteTruck = async (id: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este caminhão?"
    );
    if (!confirmed) return;

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      await apiClient.delete(`/truck/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchTrucks();
    } catch (error) {
      console.error("Erro ao excluir caminhão:", error);
      alert(
        "Não foi possível excluir o caminhão. Verifique se não há viagens associadas."
      );
    }
  };

  const resetForm = () => {
    setForm({
      license_plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      fuel_type: "diesel",
      max_load_capacity: 0,
      current_mileage: 0,
      maintenance_due_date: null,
      insurance_expiration: null,
      status: "available",
    });
  };

  const toggleRow = (truckId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [truckId]: !prev[truckId],
    }));
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      available: "bg-green-100 text-green-800",
      in_use: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
    };

    const statusText = {
      available: "Disponível",
      in_use: "Em Uso",
      maintenance: "Manutenção",
      inactive: "Inativo",
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-800">
              Gestão de Frota
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cancelar" : "Novo Caminhão"}
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
              Cadastrar Novo Caminhão
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Placa *
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="AAA-0A00"
                  value={form.license_plate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      license_plate: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Marca *
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Ex: Volvo, Mercedes"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Modelo *
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Ex: FH 540, Actros"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Ano</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tipo de Combustível
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.fuel_type}
                  onChange={(e) =>
                    setForm({ ...form, fuel_type: e.target.value })
                  }
                >
                  <option value="diesel">Diesel</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="ethanol">Etanol</option>
                  <option value="electric">Elétrico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Capacidade Máxima (kg)
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  value={form.max_load_capacity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      max_load_capacity: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Quilometragem Atual
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  min="0"
                  value={form.current_mileage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      current_mileage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as any })
                  }
                >
                  <option value="available">Disponível</option>
                  <option value="in_use">Em Uso</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Próxima Manutenção
                </label>
                <DatePicker
                  selected={form.maintenance_due_date}
                  onChange={(date: Date | null) =>
                    setForm({ ...form, maintenance_due_date: date })
                  }
                  dateFormat="dd/MM/yyyy"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholderText="Selecione a data"
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Vencimento do Seguro
                </label>
                <DatePicker
                  selected={form.insurance_expiration}
                  onChange={(date: Date | null) =>
                    setForm({ ...form, insurance_expiration: date })
                  }
                  dateFormat="dd/MM/yyyy"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholderText="Selecione a data"
                  isClearable
                />
              </div>
            </div>

            <button
              onClick={handleCreateTruck}
              className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800"
            >
              Cadastrar Caminhão
            </button>
          </div>
        )}

        {/* Lista de Caminhões */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-green-50 text-gray-700">
                <tr>
                  <th className="text-left px-6 py-3">Placa</th>
                  <th className="text-left px-6 py-3">Marca/Modelo</th>
                  <th className="text-left px-6 py-3">Ano</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <>
                    <tr
                      key={truck.id}
                      className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                      onClick={() => toggleRow(truck.id)}
                    >
                      <td className="px-6 py-4 font-medium">
                        {truck.license_plate}
                      </td>
                      <td className="px-6 py-4">
                        <div>{truck.brand}</div>
                        <div className="text-sm text-gray-500">
                          {truck.model}
                        </div>
                      </td>
                      <td className="px-6 py-4">{truck.year}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(truck.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(truck.id);
                          }}
                        >
                          {expandedRows[truck.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[truck.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Truck className="w-4 h-4 mr-2 text-orange-600" />
                                Detalhes do Veículo
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Combustível:
                                  </span>{" "}
                                  {truck.fuel_type}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Capacidade Máxima:
                                  </span>{" "}
                                  {truck.max_load_capacity} kg
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Quilometragem:
                                  </span>{" "}
                                  {truck.current_mileage} km
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Wrench className="w-4 h-4 mr-2 text-orange-600" />
                                Manutenção
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {truck.maintenance_due_date ? (
                                  <p>
                                    <span className="font-medium">
                                      Próxima:
                                    </span>{" "}
                                    {new Date(
                                      truck.maintenance_due_date
                                    ).toLocaleDateString()}
                                  </p>
                                ) : (
                                  <p className="text-gray-400">
                                    Nenhuma data cadastrada
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                                Documentos
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {truck.insurance_expiration ? (
                                  <p>
                                    <span className="font-medium">Seguro:</span>{" "}
                                    {new Date(
                                      truck.insurance_expiration
                                    ).toLocaleDateString()}
                                  </p>
                                ) : (
                                  <p className="text-gray-400">
                                    Nenhuma data cadastrada
                                  </p>
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
                                deleteTruck(truck.id);
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
                {trucks.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-8 text-gray-500"
                    >
                      Nenhum caminhão cadastrado.
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
