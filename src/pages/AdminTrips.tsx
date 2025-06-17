import { useEffect, useState } from "react";
import {
  Truck,
  ArrowLeftRight,
  Plus,
  Calendar,
  MapPin,
  User,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Trip = {
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

type Driver = {
  id: number;
  name: string;
};

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

export default function AdminTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    departureTime: new Date(),
    receiverName: "",
    receiverDocument: "",
    cargoDescription: "",
    cargoWeight: 0,
    driverId: "",
    truckId: "",
  });

  const validateForm = () => {
    const requiredFields = [
      form.origin,
      form.destination,
      form.departureTime,
      form.driverId,
      form.truckId,
      form.receiverName,
      form.receiverDocument,
      form.cargoDescription,
      form.cargoWeight,
    ];

    return requiredFields.every((field) => {
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'number') return field > 0;
      return !!field;
    });
  };

  const fetchData = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return navigate("/");

      const user = decodeToken(token);
      if (!user?.id) throw new Error("Usuário não identificado");

      const [tripsRes, driversRes, trucksRes] = await Promise.all([
        apiClient.get(`/trip/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get(`/driver/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get(`/truck/trucks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTrips(tripsRes.data as Trip[]);
      setDrivers(driversRes.data as Driver[]);
      setTrucks(trucksRes.data as Truck[]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    try {
      if (!validateForm()) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      const tripData = {
        ...form,
        departureTime: form.departureTime.toISOString(),
        driverId: form.driverId ? parseInt(form.driverId) : null,
        truckId: form.truckId ? parseInt(form.truckId) : null,
      };

      await apiClient.post("/trip/create", tripData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar viagem:", error);
    }
  };

  const resetForm = () => {
    setForm({
      origin: "",
      destination: "",
      departureTime: new Date(),
      receiverName: "",
      receiverDocument: "",
      cargoDescription: "",
      cargoWeight: 0,
      driverId: "",
      truckId: "",
    });
  };

  const toggleRow = (tripId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const statusText = {
      scheduled: "Agendada",
      in_progress: "Em Progresso",
      completed: "Concluída",
      cancelled: "Cancelada",
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
            <ArrowLeftRight className="w-8 h-8 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-800">
              Gestão de Viagens
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cancelar" : "Nova Viagem"}
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
              Cadastrar Nova Viagem
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Origem
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Cidade de origem"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Destino
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Cidade de destino"
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Data de Partida
                </label>
                <DatePicker
                  required
                  selected={form.departureTime}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onChange={(date: Date | null) => {
                    if (date) {
                      setForm({ ...form, departureTime: date });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Motorista
                </label>
                <select
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.driverId}
                  onChange={(e) =>
                    setForm({ ...form, driverId: e.target.value })
                  }
                >
                  <option value="">Selecione um motorista</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Caminhão
                </label>
                <select
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.truckId}
                  onChange={(e) =>
                    setForm({ ...form, truckId: e.target.value })
                  }
                >
                  <option value="">Selecione um caminhão</option>
                  {trucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.licensePlate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Destinatário
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Nome do destinatário"
                  value={form.receiverName}
                  onChange={(e) =>
                    setForm({ ...form, receiverName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Documento Destinatário
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="CPF/CNPJ do destinatário"
                  value={form.receiverDocument}
                  onChange={(e) =>
                    setForm({ ...form, receiverDocument: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Descrição da Carga
                </label>
                <textarea
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Descrição detalhada da carga"
                  rows={3}
                  value={form.cargoDescription}
                  onChange={(e) =>
                    setForm({ ...form, cargoDescription: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Peso da Carga (kg)
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="number"
                  placeholder="Peso em quilogramas"
                  value={form.cargoWeight}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cargoWeight: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <button
              onClick={handleCreateTrip}
              className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800"
            >
              Cadastrar Viagem
            </button>
          </div>
        )}

        {/* Lista de Viagens */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-green-50 text-gray-700">
                <tr>
                  <th className="text-left px-6 py-3">Origem → Destino</th>
                  <th className="text-left px-6 py-3">Destinatário</th>
                  <th className="text-left px-6 py-3">Partida</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <>
                    <tr
                      key={trip.id}
                      className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                      onClick={() => toggleRow(trip.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <ArrowLeftRight className="w-5 h-5 text-green-700 mr-2" />
                          <div>
                            <div className="font-medium">
                              {trip.origin} → {trip.destination}
                            </div>
                            {trip.driver && (
                              <div className="text-xs text-gray-500 mt-1">
                                Motorista: {trip.driver.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{trip.receiver_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {trip.receiver_document}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(trip.departure_time).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(trip.id);
                          }}
                        >
                          {expandedRows[trip.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[trip.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Package className="w-4 h-4 mr-2 text-orange-600" />
                                Detalhes da Carga
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Descrição:
                                  </span>{" "}
                                  {trip.cargo_description}
                                </p>
                                <p>
                                  <span className="font-medium">Peso:</span>{" "}
                                  {trip.cargo_weight} kg
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Truck className="w-4 h-4 mr-2 text-orange-600" />
                                Veículo
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {trip.truck ? (
                                  <p>
                                    <span className="font-medium">Placa:</span>{" "}
                                    {trip.truck.licensePlate}
                                  </p>
                                ) : (
                                  <p className="text-gray-400">
                                    Nenhum veículo atribuído
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                                Tempos
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Partida:</span>{" "}
                                  {new Date(
                                    trip.departure_time
                                  ).toLocaleString()}
                                </p>
                                {trip.arrival_time && (
                                  <p>
                                    <span className="font-medium">
                                      Chegada:
                                    </span>{" "}
                                    {new Date(
                                      trip.arrival_time
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {trips.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-6 py-8 text-gray-500"
                    >
                      Nenhuma viagem encontrada.
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
