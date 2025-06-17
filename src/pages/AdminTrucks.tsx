import React, { useEffect, useState } from "react";
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
import { decodeToken } from "@/utils/jwtDecode"; // Certifique-se de que esta importação está correta
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


// Re-declarando a interface Truck para garantir que o compilador TypeScript a veja
// Se já estiver em um arquivo .d.ts ou similar, você pode remover esta redeclaração.
type Truck = {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  maxLoadCapacity: number;
  currentMileage: number;
  maintenanceDueDate: string;
  insuranceExpiration: string;
  status: "available" | "in_use" | "maintenance" | "inactive";
};
type TruckEdit = {
  id?: number;
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  maxLoadCapacity?: number;
  currentMileage?: number;
  maintenanceDueDate?: string;
  insuranceExpiration?: string;
  status?: "available" | "in_use" | "maintenance" | "inactive";
};

export default function AdminTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showForm, setShowForm] = useState(false);
  // Estado para controlar a visibilidade do formulário de edição
  const [showEditForm, setShowEditForm] = useState(false);
  // Estado para armazenar o caminhão que está sendo editado
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form state (para criação)
  const [form, setForm] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    fuelType: "diesel",
    maxLoadCapacity: 0,
    currentMileage: 0,
    maintenanceDueDate: null as Date | null,
    insuranceExpiration: null as Date | null,
    status: "available" as "available" | "in_use" | "maintenance" | "inactive",
  });

  // Estado para o formulário de edição, inicializado com os valores do caminhão
  const [editForm, setEditForm] = useState<Omit<TruckEdit, 'id' | 'maintenanceDueDate' | 'insuranceExpiration'> & { maintenanceDueDate: Date | null, insuranceExpiration: Date | null }>({
    licensePlate: undefined,
    brand: undefined,
    model: undefined,
    year: new Date().getFullYear(),
    fuelType: undefined,
    maxLoadCapacity: 0,
    currentMileage: 0,
    maintenanceDueDate: null,
    insuranceExpiration: null,
    status: "available",
  });

  const fetchTrucks = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await apiClient.get("/truck/trucks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrucks(response.data as Truck[]);
    } catch (error) {
      console.error("Erro ao buscar caminhões:", error);
      // Opcional: Adicionar um alerta para o usuário
      alert("Erro ao carregar a lista de caminhões. Tente novamente.");
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

      if (!form.licensePlate || !form.brand || !form.model) {
        alert("Preencha os campos obrigatórios (placa, marca e modelo)");
        return;
      }

      const truckData = {
        licensePlate: form.licensePlate, // Mapeamento correto
        brand: form.brand,
        model: form.model,
        year: form.year,
        fuelType: form.fuelType,
        maxLoadCapacity: form.maxLoadCapacity,
        currentMileage: form.currentMileage,
        maintenanceDueDate: form.maintenanceDueDate?.toISOString(),
        insuranceExpiration: form.insuranceExpiration?.toISOString(),
        status: form.status,
      };

      await apiClient.post("/truck/create", truckData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      resetForm();
      await fetchTrucks();
      alert("Caminhão cadastrado com sucesso!"); // Feedback de sucesso
    } catch (error) {
      console.error("Erro ao criar caminhão:", error);
      alert(
        "Ocorreu um erro ao cadastrar o caminhão. Verifique os dados e tente novamente."
      );
    }
  };

  // Nova função para atualizar caminhão
  const handleUpdateTruck = async () => {
    if (!editingTruck) return; // Garante que há um caminhão em edição

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      const updatedTruckData = {
        licensePlate: editForm.licensePlate,
        brand: editForm.brand,
        model: editForm.model,
        year: editForm.year,
        fuelType: editForm.fuelType,
        maxLoadCapacity: editForm.maxLoadCapacity,
        currentMileage: editForm.currentMileage,
        // Converte Date para string ISO para API
        maintenanceDueDate: editForm.maintenanceDueDate?.toISOString(),
        insuranceExpiration: editForm.insuranceExpiration?.toISOString(),
        status: editForm.status,
      };

      await apiClient.put(`/truck/${editingTruck.id}`, updatedTruckData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditForm(false); // Fecha o formulário de edição
      setEditingTruck(null); // Limpa o caminhão em edição
      await fetchTrucks(); // Recarrega a lista de caminhões
      alert("Caminhão atualizado com sucesso!"); // Feedback de sucesso
    } catch (error) {
      console.error("Erro ao atualizar caminhão:", error);
      alert("Ocorreu um erro ao atualizar o caminhão. Tente novamente.");
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
      alert("Caminhão excluído com sucesso!"); // Feedback de sucesso
    } catch (error) {
      console.error("Erro ao excluir caminhão:", error);
      alert(
        "Não foi possível excluir o caminhão. Verifique se não há viagens associadas."
      );
    }
  };

  const resetForm = () => {
    setForm({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      fuelType: "diesel",
      maxLoadCapacity: 0,
      currentMileage: 0,
      maintenanceDueDate: null,
      insuranceExpiration: null,
      status: "available",
    });
  };

  const toggleRow = (truckId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [truckId]: !prev[truckId],
    }));
  };

  // Função para abrir o formulário de edição com os dados do caminhão
  const openEditForm = (truck: Truck) => {
    setEditingTruck(truck);
    setEditForm({
      licensePlate: truck.licensePlate,
      brand: truck.brand,
      model: truck.model,
      year: truck.year,
      fuelType: truck.fuelType,
      maxLoadCapacity: truck.maxLoadCapacity,
      currentMileage: truck.currentMileage,
      // Converte a string de data para objeto Date para o DatePicker
      maintenanceDueDate: truck.maintenanceDueDate ? new Date(truck.maintenanceDueDate) : null,
      insuranceExpiration: truck.insuranceExpiration ? new Date(truck.insuranceExpiration) : null,
      status: truck.status,
    });
    setShowEditForm(true); // Exibe o formulário de edição
    setShowForm(false); // Garante que o formulário de criação esteja fechado
  };

  // Função para fechar o formulário de edição
  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingTruck(null); // Limpa o caminhão em edição
  };

  // Handler genérico para inputs de texto/select do formulário de edição
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler para inputs numéricos do formulário de edição
  const handleEditNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: Number(value) || 0 // Garante que seja um número ou 0
    }));
  };

  // Handler para DatePicker do formulário de edição
  const handleEditDateChange = (date: Date | null, field: 'maintenanceDueDate' | 'insuranceExpiration') => {
    setEditForm(prev => ({
      ...prev,
      [field]: date
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
              onClick={() => {
                setShowForm(!showForm);
                setShowEditForm(false); // Fecha o formulário de edição ao abrir o de criação
              }}
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
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      licensePlate: e.target.value.toUpperCase(),
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
                  value={form.fuelType}
                  onChange={(e) =>
                    setForm({ ...form, fuelType: e.target.value })
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
                  value={form.maxLoadCapacity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxLoadCapacity: parseFloat(e.target.value) || 0,
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
                  value={form.currentMileage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentMileage: parseFloat(e.target.value) || 0,
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
                  selected={form.maintenanceDueDate}
                  onChange={(date: Date | null) =>
                    setForm({ ...form, maintenanceDueDate: date })
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
                  selected={form.insuranceExpiration}
                  onChange={(date: Date | null) =>
                    setForm({ ...form, insuranceExpiration: date })
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
                  <React.Fragment key={truck.id}>
                    <tr
                      className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                      onClick={() => toggleRow(truck.id)}
                    >
                      <td className="px-6 py-4 font-medium">
                        {truck.licensePlate}
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
                                  {truck.fuelType}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Capacidade Máxima:
                                  </span>{" "}
                                  {truck.maxLoadCapacity} kg
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Quilometragem:
                                  </span>{" "}
                                  {truck.currentMileage} km
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Wrench className="w-4 h-4 mr-2 text-orange-600" />
                                Manutenção
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {truck.maintenanceDueDate ? (
                                  <p>
                                    <span className="font-medium">
                                      Próxima:
                                    </span>{" "}
                                    {new Date(
                                      truck.maintenanceDueDate
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
                                {truck.insuranceExpiration ? (
                                  <p>
                                    <span className="font-medium">Seguro:</span>{" "}
                                    {new Date(
                                      truck.insuranceExpiration
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
                                openEditForm(truck); // Abre o formulário de edição com os dados do caminhão
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
                    {/* Formulário de Edição aparece abaixo da linha expandida, se showEditForm for true e for o caminhão certo */}
                    {showEditForm && editingTruck?.id === truck.id && (
                      <tr className="bg-blue-50">
                        <td colSpan={5} className="p-6">
                          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                              <Wrench className="w-5 h-5 mr-2 text-blue-700" />
                              Editando Caminhão: {editingTruck.licensePlate}
                            </h2>

                            <form onSubmit={(e) => { e.preventDefault(); handleUpdateTruck(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Placa *
                                </label>
                                <input
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  type="text"
                                  name="licensePlate" // Importante: nome correspondente à propriedade do Truck
                                  placeholder="AAA-0A00"
                                  value={editForm.licensePlate}
                                  onChange={handleEditInputChange}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Marca *
                                </label>
                                <input
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  type="text"
                                  name="brand"
                                  placeholder="Ex: Volvo, Mercedes"
                                  value={editForm.brand}
                                  onChange={handleEditInputChange}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Modelo *
                                </label>
                                <input
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  type="text"
                                  name="model"
                                  placeholder="Ex: FH 540, Actros"
                                  value={editForm.model}
                                  onChange={handleEditInputChange}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Ano</label>
                                <input
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  type="number"
                                  name="year"
                                  min="1950"
                                  max={new Date().getFullYear() + 1}
                                  value={editForm.year}
                                  onChange={handleEditNumberInputChange}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Tipo de Combustível
                                </label>
                                <select
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  name="fuelType"
                                  value={editForm.fuelType}
                                  onChange={handleEditInputChange}
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
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  type="number"
                                  name="maxLoadCapacity"
                                  min="0"
                                  value={editForm.maxLoadCapacity}
                                  onChange={handleEditNumberInputChange}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Quilometragem Atual
                                </label>
                                <input
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  type="number"
                                  name="currentMileage"
                                  min="0"
                                  value={editForm.currentMileage}
                                  onChange={handleEditNumberInputChange}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Status
                                </label>
                                <select
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  name="status"
                                  value={editForm.status}
                                  onChange={handleEditInputChange}
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
                                  selected={editForm.maintenanceDueDate}
                                  onChange={(date: Date | null) => handleEditDateChange(date, 'maintenanceDueDate')}
                                  dateFormat="dd/MM/yyyy"
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholderText="Selecione a data"
                                  isClearable
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Vencimento do Seguro
                                </label>
                                <DatePicker
                                  selected={editForm.insuranceExpiration}
                                  onChange={(date: Date | null) => handleEditDateChange(date, 'insuranceExpiration')}
                                  dateFormat="dd/MM/yyyy"
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholderText="Selecione a data"
                                  isClearable
                                />
                              </div>
                            </form>

                            <div className="mt-6 flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={closeEditForm}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                onClick={handleUpdateTruck}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              >
                                Salvar Alterações
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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