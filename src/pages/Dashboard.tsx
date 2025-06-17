import { useEffect, useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  Calendar,
  FileText,
  LogOut,
  User,
  AlertCircle,
  CheckCircle,
  Wrench,
  BadgeHelp,
  Anchor,
  ClipboardList,
  DollarSign,
  ShieldAlert,
  BookOpen,
  Map,
  CreditCard,
  Settings,
} from "lucide-react";
import { authService } from "@/services/authService";
import { decodeToken } from "@/utils/jwtDecode";

type User = {
  name: string;
  email: string;
  userType: string;
  id: number;
};

type Trip = {
  id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  cargo_description: string;
  cargo_weight: number;
  receiver_name: string;
  receiver_document: string;
};

type Truck = {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  current_mileage: number;
  status: string;
  maintenance_due_date?: string;
};

type Expense = {
  id: number;
  expense_type: string;
  value: number;
  description: string;
  expense_date: string;
};

type ChecklistItem = {
  id: number;
  name: string;
  checked: boolean;
};

export default function DriverDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [assignedTruck, setAssignedTruck] = useState<Truck | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<
    { title: string; message: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "trips"
    | "truck"
    | "expenses"
    | "documents"
    | "reports"
    | "profile"
  >("dashboard");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id">>({
    expense_type: "fuel",
    value: 0,
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        window.location.href = "/";
        return;
      }
      const data = decodeToken(token);
      if (!data || data.userType !== "driver") {
        window.location.href = "/dashboard";
      } else {
        setUser(data);
        loadDriverData(data.id);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadDriverData = async (driverId: number) => {
    try {
      const mockCurrentTrip: Trip = {
        id: 1,
        origin: "São Paulo - SP",
        destination: "Rio de Janeiro - RJ",
        departure_time: "2023-11-15T08:00:00",
        arrival_time: "2023-11-15T18:00:00",
        status: "in_progress",
        cargo_description: "Eletrônicos",
        cargo_weight: 1500,
        receiver_name: "João da Silva",
        receiver_document: "123.456.789-00",
      };
      setCurrentTrip(mockCurrentTrip);

      // Caminhão atribuído
      const mockTruck: Truck = {
        id: 1,
        license_plate: "ABC1D23",
        brand: "Volvo",
        model: "FH 540",
        year: 2020,
        current_mileage: 185000,
        status: "in_use",
        maintenance_due_date: "2023-12-10",
      };
      setAssignedTruck(mockTruck);

      // Próximas viagens
      const mockUpcomingTrips: Trip[] = [
        {
          id: 2,
          origin: "Rio de Janeiro - RJ",
          destination: "Belo Horizonte - MG",
          departure_time: "2023-11-16T07:00:00",
          arrival_time: "2023-11-16T15:00:00",
          status: "scheduled",
          cargo_description: "Móveis",
          cargo_weight: 2000,
          receiver_name: "Maria Oliveira",
          receiver_document: "987.654.321-00",
        },
        {
          id: 3,
          origin: "Belo Horizonte - MG",
          destination: "Vitória - ES",
          departure_time: "2023-11-18T09:00:00",
          arrival_time: "2023-11-18T16:00:00",
          status: "scheduled",
          cargo_description: "Alimentos",
          cargo_weight: 1800,
          receiver_name: "Carlos Souza",
          receiver_document: "456.789.123-00",
        },
      ];
      setUpcomingTrips(mockUpcomingTrips);

      // Notificações
      setNotifications([
        {
          title: "Manutenção programada",
          message: "Seu veículo precisa de revisão em 5 dias",
        },
        { title: "Documentação", message: "Sua CNH vencerá em 30 dias" },
      ]);

      // Despesas
      const mockExpenses: Expense[] = [
        {
          id: 1,
          expense_type: "fuel",
          value: 350.0,
          description: "Abastecimento em Posto Shell",
          expense_date: "2023-11-14",
        },
        {
          id: 2,
          expense_type: "toll",
          value: 87.5,
          description: "Pedágio na Via Dutra",
          expense_date: "2023-11-14",
        },
      ];
      setExpenses(mockExpenses);

      // Checklist
      const mockChecklist: ChecklistItem[] = [
        { id: 1, name: "Nível de óleo do motor", checked: true },
        { id: 2, name: "Água do radiador", checked: true },
        { id: 3, name: "Freios", checked: false },
        { id: 4, name: "Pneus (pressão e estado)", checked: false },
        { id: 5, name: "Luzes e faróis", checked: true },
        { id: 6, name: "Documentação do veículo", checked: true },
      ];
      setChecklist(mockChecklist);
    } catch (error) {
      console.error("Erro ao carregar dados do motorista:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleChecklistChange = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId =
      expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;
    setExpenses([...expenses, { ...newExpense, id: newId }]);
    setNewExpense({
      expense_type: "fuel",
      value: 0,
      description: "",
      expense_date: new Date().toISOString().split("T")[0],
    });
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Seção de informações principais */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viagem atual */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <MapPin className="w-5 h-5 text-blue-500 mr-2" />
            {currentTrip ? "Viagem em Andamento" : "Nenhuma Viagem Ativa"}
          </h3>

          {currentTrip ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Origem</p>
                  <p className="font-medium">{currentTrip.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-medium">{currentTrip.destination}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Saída</p>
                  <p className="font-medium">
                    {formatDate(currentTrip.departure_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chegada Prevista</p>
                  <p className="font-medium">
                    {formatDate(currentTrip.arrival_time)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Carga</p>
                  <p className="font-medium">
                    {currentTrip.cargo_description} ({currentTrip.cargo_weight}{" "}
                    kg)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destinatário</p>
                  <p className="font-medium">
                    {currentTrip.receiver_name} ({currentTrip.receiver_document}
                    )
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("trips")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
                >
                  Detalhes Completos
                </button>
                <button
                  onClick={() => setActiveTab("expenses")}
                  className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm"
                >
                  Registrar Despesa
                </button>
                <button className="bg-white border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all text-sm">
                  Reportar Problema
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Você não tem viagens em andamento no momento.
            </p>
          )}
        </div>

        {/* Caminhão atribuído */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Truck className="w-5 h-5 text-blue-500 mr-2" />
            {assignedTruck ? "Seu Caminhão" : "Nenhum Caminhão Atribuído"}
          </h3>

          {assignedTruck ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Placa</p>
                <p className="font-medium">{assignedTruck.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modelo</p>
                <p className="font-medium">
                  {assignedTruck.brand} {assignedTruck.model} (
                  {assignedTruck.year})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quilometragem</p>
                <p className="font-medium">
                  {assignedTruck.current_mileage.toLocaleString("pt-BR")} km
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">
                  {assignedTruck.status.replace("_", " ")}
                </p>
              </div>

              {assignedTruck.maintenance_due_date && (
                <div className="p-2 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <ShieldAlert className="inline w-4 h-4 mr-1" />
                    Manutenção prevista para{" "}
                    {new Date(
                      assignedTruck.maintenance_due_date
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}

              <button
                onClick={() => setActiveTab("truck")}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm w-full"
              >
                Ver Detalhes Completos
              </button>
            </div>
          ) : (
            <p className="text-gray-600">
              Nenhum caminhão foi atribuído a você.
            </p>
          )}
        </div>
      </section>

      {/* Seção de próximas viagens e notificações */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas viagens */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            Próximas Viagens
          </h3>

          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Origem → Destino</p>
                      <p className="font-medium">
                        {trip.origin} → {trip.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium">
                        {formatDate(trip.departure_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium capitalize">
                        {trip.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTrip(trip);
                      setActiveTab("trips");
                    }}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    Ver detalhes <span className="ml-1">→</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma viagem programada.</p>
          )}
        </div>

        {/* Notificações */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
            Notificações
          </h3>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma notificação no momento.</p>
          )}
        </div>
      </section>

      {/* Seção de ferramentas rápidas */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-50 hover:border-blue-100 cursor-pointer"
          onClick={() => setActiveTab("reports")}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Relatórios
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-5 flex-grow">
              Acesse seus relatórios de viagens e quilometragem.
            </p>
            <div className="text-blue-600 text-sm">Acessar →</div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-50 hover:border-blue-100 cursor-pointer"
          onClick={() => setActiveTab("truck")}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Wrench className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Checklist</h3>
            </div>
            <p className="text-gray-600 text-sm mb-5 flex-grow">
              Realize o checklist diário do veículo.
            </p>
            <div className="text-blue-600 text-sm">Acessar →</div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-50 hover:border-blue-100 cursor-pointer"
          onClick={() => setActiveTab("expenses")}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <DollarSign className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Despesas</h3>
            </div>
            <p className="text-gray-600 text-sm mb-5 flex-grow">
              Registre suas despesas de viagem.
            </p>
            <div className="text-blue-600 text-sm">Acessar →</div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-50 hover:border-blue-100 cursor-pointer"
          onClick={() => setActiveTab("profile")}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <User className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Perfil</h3>
            </div>
            <p className="text-gray-600 text-sm mb-5 flex-grow">
              Atualize suas informações pessoais e documentos.
            </p>
            <div className="text-blue-600 text-sm">Acessar →</div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderTripsTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <MapPin className="w-6 h-6 text-blue-600 mr-2" />
          Detalhes da Viagem
        </h2>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Voltar ao painel
        </button>
      </div>

      {currentTrip ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Informações Básicas
              </h3>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">
                  {currentTrip.status.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Origem</p>
                <p className="font-medium">{currentTrip.origin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destino</p>
                <p className="font-medium">{currentTrip.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data/Hora de Saída</p>
                <p className="font-medium">
                  {formatDate(currentTrip.departure_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Data/Hora de Chegada Prevista
                </p>
                <p className="font-medium">
                  {formatDate(currentTrip.arrival_time)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Detalhes da Carga
              </h3>
              <div>
                <p className="text-sm text-gray-600">Descrição da Carga</p>
                <p className="font-medium">{currentTrip.cargo_description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Peso da Carga</p>
                <p className="font-medium">{currentTrip.cargo_weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destinatário</p>
                <p className="font-medium">{currentTrip.receiver_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Documento do Destinatário
                </p>
                <p className="font-medium">{currentTrip.receiver_document}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Ações
              </h3>
              <button
                onClick={() => setActiveTab("expenses")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
              >
                Registrar Despesa
              </button>
              <button className="w-full bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm">
                Registrar Ocorrência
              </button>
              <button className="w-full bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-all text-sm">
                Iniciar Viagem
              </button>
              <button className="w-full bg-white border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all text-sm">
                Finalizar Viagem
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Documentos
              </h3>
              <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm flex items-center justify-between">
                <span>CT-e</span>
                <BookOpen className="w-4 h-4" />
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm flex items-center justify-between">
                <span>Mapa de Rota</span>
                <Map className="w-4 h-4" />
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm flex items-center justify-between">
                <span>Checklist</span>
                <ClipboardList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma viagem selecionada.</p>
      )}
    </div>
  );

  const renderTruckTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Truck className="w-6 h-6 text-blue-600 mr-2" />
          Detalhes do Caminhão
        </h2>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Voltar ao painel
        </button>
      </div>

      {assignedTruck ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Informações do Veículo
              </h3>
              <div>
                <p className="text-sm text-gray-600">Placa</p>
                <p className="font-medium">{assignedTruck.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Marca/Modelo</p>
                <p className="font-medium">
                  {assignedTruck.brand} {assignedTruck.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ano</p>
                <p className="font-medium">{assignedTruck.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quilometragem</p>
                <p className="font-medium">
                  {assignedTruck.current_mileage.toLocaleString("pt-BR")} km
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">
                  {assignedTruck.status.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Manutenção
              </h3>
              {assignedTruck.maintenance_due_date ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Próxima Manutenção</p>
                    <p className="font-medium">
                      {new Date(
                        assignedTruck.maintenance_due_date
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <ShieldAlert className="inline w-4 h-4 mr-1" />
                      Faltam{" "}
                      {Math.floor(
                        (new Date(
                          assignedTruck.maintenance_due_date
                        ).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      dias
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Nenhuma manutenção agendada</p>
              )}

              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
                Solicitar Manutenção
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Checklist Diário
            </h3>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`check-${item.id}`}
                    checked={item.checked}
                    onChange={() => handleChecklistChange(item.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`check-${item.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {item.name}
                  </label>
                </div>
              ))}
            </div>

            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm">
              <CheckCircle className="inline w-4 h-4 mr-1" />
              Confirmar Checklist
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Nenhum caminhão atribuído.</p>
      )}
    </div>
  );

  const renderExpensesTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
          Controle de Despesas
        </h2>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Voltar ao painel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Despesas Registradas
          </h3>

          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {expense.expense_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(expense.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma despesa registrada.</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Nova Despesa</h3>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="expense_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de Despesa
              </label>
              <select
                id="expense_type"
                value={newExpense.expense_type}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, expense_type: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fuel">Combustível</option>
                <option value="toll">Pedágio</option>
                <option value="maintenance">Manutenção</option>
                <option value="lodging">Hospedagem</option>
                <option value="food">Alimentação</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Valor (R$)
              </label>
              <input
                type="number"
                id="value"
                step="0.01"
                min="0"
                value={newExpense.value}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="expense_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data
              </label>
              <input
                type="date"
                id="expense_date"
                value={newExpense.expense_date}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, expense_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição
              </label>
              <textarea
                id="description"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
            >
              Registrar Despesa
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <User className="w-6 h-6 text-blue-600 mr-2" />
          Meu Perfil
        </h2>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Voltar ao painel
        </button>
      </div>

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Informações Pessoais
            </h3>

            <div>
              <p className="text-sm text-gray-600">Nome Completo</p>
              <p className="font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">E-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Tipo de Usuário</p>
              <p className="font-medium capitalize">{user.userType}</p>
            </div>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
              Alterar Senha
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Documentos
            </h3>

            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-gray-800">CNH</p>
              <p className="text-xs text-gray-600 mt-1">
                Vencimento: 15/12/2023 (faltam 30 dias)
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-800">MOPP</p>
              <p className="text-xs text-gray-600 mt-1">
                Válido até: 15/12/2024
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="text-sm font-medium text-gray-800">Exame Médico</p>
              <p className="text-xs text-gray-600 mt-1">
                Vencido em: 15/10/2023
              </p>
            </div>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
              Enviar Documentos
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          Relatórios
        </h2>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Voltar ao painel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Anchor className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Relatório de Viagens</h3>
          </div>
          <p className="text-sm text-gray-600">
            Visualize todas as suas viagens realizadas em um período.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center mb-3">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Relatório de Despesas</h3>
          </div>
          <p className="text-sm text-gray-600">
            Consolidação de todas as despesas registradas.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center mb-3">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <BadgeHelp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold">Consumo de Combustível</h3>
          </div>
          <p className="text-sm text-gray-600">
            Média de consumo por km e custos com combustível.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center mb-3">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Horas de Direção</h3>
          </div>
          <p className="text-sm text-gray-600">
            Controle de horas trabalhadas e períodos de descanso.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center mb-3">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold">Ocorrências</h3>
          </div>
          <p className="text-sm text-gray-600">
            Registro de ocorrências e problemas reportados.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center mb-3">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold">Pagamentos</h3>
          </div>
          <p className="text-sm text-gray-600">
            Extrato de pagamentos e valores recebidos.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold flex items-center space-x-3">
            <Truck className="w-6 h-6 text-blue-300" />
            <span>Painel do Motorista</span>
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:block">{user?.email}</span>
            <button
              onClick={authService.logout}
              className="flex items-center text-sm hover:text-blue-200 transition hover:bg-blue-800 px-3 py-1 rounded"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Barra de navegação */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Painel
              </div>
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "trips"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Viagens
              </div>
            </button>
            <button
              onClick={() => setActiveTab("truck")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "truck"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Caminhão
              </div>
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "expenses"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Despesas
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "reports"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Relatórios
              </div>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </div>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {activeTab === "dashboard" && renderDashboardTab()}
        {activeTab === "trips" && renderTripsTab()}
        {activeTab === "truck" && renderTruckTab()}
        {activeTab === "expenses" && renderExpensesTab()}
        {activeTab === "reports" && renderReportsTab()}
        {activeTab === "profile" && renderProfileTab()}
      </main>
    </div>
  );
}
