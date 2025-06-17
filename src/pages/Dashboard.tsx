import { useState, useEffect } from "react";
import { 
  Truck, MapPin, Clock, Calendar, FileText, LogOut, User, 
  AlertCircle, Settings, ListChecks, DollarSign, Tool, 
  ClipboardList, ArrowRight, ChevronDown, ChevronUp
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
  comment?: string;
};

export default function DriverDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [assignedTruck, setAssignedTruck] = useState<Truck | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<{title: string, message: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'truck' | 'reports' | 'expenses' | 'checklist' | 'profile'>('dashboard');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
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
      if (!data || data.role !== "driver") {
        navigate("/dashboard");
      } else {
        setUser(data);
        loadDriverData(data.id);
      }
    } catch (error) {
      console.log(error);
    }
  }, [navigate]);

  const loadDriverData = async (driverId: number) => {
    // Simulação de dados
    const mockCurrentTrip: Trip = {
      id: 1,
      origin: "São Paulo - SP",
      destination: "Rio de Janeiro - RJ",
      departure_time: "2023-11-15T08:00:00",
      arrival_time: "2023-11-15T18:00:00",
      status: "in_progress",
      cargo_description: "Eletrônicos",
      cargo_weight: 1500,
      receiver_name: "João Silva",
      receiver_document: "123.456.789-00"
    };
    setCurrentTrip(mockCurrentTrip);

    const mockTruck: Truck = {
      id: 1,
      license_plate: "ABC1D23",
      brand: "Volvo",
      model: "FH 540",
      year: 2020,
      current_mileage: 125000,
      status: "in_use",
      maintenance_due_date: "2023-12-10"
    };
    setAssignedTruck(mockTruck);

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
        receiver_document: "987.654.321-00"
      }
    ];
    setUpcomingTrips(mockUpcomingTrips);

    setNotifications([
      { title: "Manutenção programada", message: "Seu veículo precisa de revisão em 5 dias" },
      { title: "Documentação", message: "Sua CNH vencerá em 30 dias" }
    ]);

    setExpenses([
      { id: 1, expense_type: "fuel", value: 350.50, description: "Posto BR - km 250", expense_date: "2023-11-15" },
      { id: 2, expense_type: "toll", value: 120.75, description: "Pedágio Régis Bittencourt", expense_date: "2023-11-15" }
    ]);

    setChecklist([
      { id: 1, name: "Nível de óleo do motor", checked: true },
      { id: 2, name: "Água do radiador", checked: true },
      { id: 3, name: "Pneus (calibragem e estado)", checked: true },
      { id: 4, name: "Luzes e sinalização", checked: false },
      { id: 5, name: "Freios", checked: false },
      { id: 6, name: "Documentação do veículo", checked: true }
    ]);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleChecklistChange = (id: number) => {
    setChecklist(checklist.map(item => 
      item.id === id ? {...item, checked: !item.checked} : item
    ));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Seção de status atual */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 text-blue-500 mr-2" />
          {currentTrip ? "Viagem em Andamento" : "Nenhuma Viagem Ativa"}
        </h3>
        
        {currentTrip && (
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
                <p className="font-medium">{formatDate(currentTrip.departure_time)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chegada Prevista</p>
                <p className="font-medium">{formatDate(currentTrip.arrival_time)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Carga</p>
                <p className="font-medium">{currentTrip.cargo_description} ({currentTrip.cargo_weight} kg)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destinatário</p>
                <p className="font-medium">{currentTrip.receiver_name} ({currentTrip.receiver_document})</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção de caminhão e próximas viagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Truck className="w-5 h-5 text-blue-500 mr-2" />
            {assignedTruck ? "Seu Caminhão" : "Nenhum Caminhão Atribuído"}
          </h3>
          
          {assignedTruck && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Placa</p>
                  <p className="font-medium">{assignedTruck.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modelo</p>
                  <p className="font-medium">{assignedTruck.brand} {assignedTruck.model} ({assignedTruck.year})</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quilometragem</p>
                  <p className="font-medium">{assignedTruck.current_mileage.toLocaleString('pt-BR')} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{assignedTruck.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              {assignedTruck.maintenance_due_date && (
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm font-medium text-gray-800">Próxima manutenção</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(assignedTruck.maintenance_due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            Próximas Viagens
          </h3>
          
          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Origem → Destino</p>
                      <p className="font-medium">{trip.origin} → {trip.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium">{formatDate(trip.departure_time)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('trips')}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    Ver detalhes <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma viagem programada.</p>
          )}
        </div>
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
              <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhuma notificação no momento.</p>
        )}
      </div>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 text-blue-500 mr-2" />
          Viagens
        </h3>

        {currentTrip && (
          <div className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('current_trip')}
            >
              <h4 className="font-medium text-blue-700">Viagem Atual</h4>
              {expandedSection === 'current_trip' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            
            {expandedSection === 'current_trip' && (
              <div className="mt-4 space-y-4 p-4 bg-blue-50 rounded-lg">
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
                    <p className="font-medium">{formatDate(currentTrip.departure_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chegada Prevista</p>
                    <p className="font-medium">{formatDate(currentTrip.arrival_time)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Carga</p>
                    <p className="font-medium">{currentTrip.cargo_description} ({currentTrip.cargo_weight} kg)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Destinatário</p>
                    <p className="font-medium">{currentTrip.receiver_name} ({currentTrip.receiver_document})</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
                    Registrar Ocorrência
                  </button>
                  <button className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm">
                    Finalizar Viagem
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('upcoming_trips')}
          >
            <h4 className="font-medium text-blue-700">Próximas Viagens</h4>
            {expandedSection === 'upcoming_trips' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {expandedSection === 'upcoming_trips' && (
            <div className="mt-4 space-y-4">
              {upcomingTrips.length > 0 ? (
                upcomingTrips.map((trip) => (
                  <div key={trip.id} className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Origem → Destino</p>
                        <p className="font-medium">{trip.origin} → {trip.destination}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-medium">{formatDate(trip.departure_time)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium capitalize">{trip.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Carga</p>
                        <p className="font-medium">{trip.cargo_description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Destinatário</p>
                        <p className="font-medium">{trip.receiver_name}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 p-4">Nenhuma viagem programada.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTruck = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <Truck className="w-5 h-5 text-blue-500 mr-2" />
          Meu Caminhão
        </h3>

        {assignedTruck ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-blue-700">Informações Básicas</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Placa</p>
                    <p className="font-medium">{assignedTruck.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modelo</p>
                    <p className="font-medium">{assignedTruck.brand} {assignedTruck.model} ({assignedTruck.year})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quilometragem</p>
                    <p className="font-medium">{assignedTruck.current_mileage.toLocaleString('pt-BR')} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{assignedTruck.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-blue-700">Manutenção</h4>
                {assignedTruck.maintenance_due_date ? (
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-gray-800">Próxima manutenção</p>
                    <p className="font-medium mt-1">
                      {new Date(assignedTruck.maintenance_due_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Faltam {Math.ceil(
                        (new Date(assignedTruck.maintenance_due_date).getTime() - new Date().getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )} dias
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhuma manutenção agendada.</p>
                )}
              </div>
            </div>

            <div>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('truck_docs')}
              >
                <h4 className="font-medium text-blue-700">Documentos do Veículo</h4>
                {expandedSection === 'truck_docs' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              
              {expandedSection === 'truck_docs' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border border-blue-100">
                      <p className="font-medium">CRLV</p>
                      <p className="text-sm text-gray-600">Válido até 30/12/2023</p>
                    </div>
                    <div className="p-3 bg-white rounded border border-blue-100">
                      <p className="font-medium">Seguro</p>
                      <p className="text-sm text-gray-600">Válido até 15/01/2024</p>
                    </div>
                    <div className="p-3 bg-white rounded border border-blue-100">
                      <p className="font-medium">Licenciamento</p>
                      <p className="text-sm text-gray-600">Regular</p>
                    </div>
                    <div className="p-3 bg-white rounded border border-blue-100">
                      <p className="font-medium">Vistoria</p>
                      <p className="text-sm text-gray-600">Válida até 20/03/2024</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Nenhum caminhão atribuído.</p>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <FileText className="w-5 h-5 text-blue-500 mr-2" />
          Relatórios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium mb-3 text-blue-700">Relatório Mensal</h4>
            <p className="text-sm text-gray-600 mb-4">
              Visualize todas as viagens realizadas no mês atual.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
              Gerar Relatório
            </button>
          </div>

          <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium mb-3 text-blue-700">Quilometragem</h4>
            <p className="text-sm text-gray-600 mb-4">
              Relatório detalhado de quilometragem por período.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
              Gerar Relatório
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-3 text-blue-700">Histórico de Viagens</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-blue-100">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Data</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Origem</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Destino</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Carga</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b text-sm text-gray-600">15/11/2023</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">São Paulo - SP</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">Rio de Janeiro - RJ</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">Eletrônicos</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b text-sm text-gray-600">10/11/2023</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">Curitiba - PR</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">São Paulo - SP</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">Móveis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
          Despesas
        </h3>

        <div className="mb-6">
          <h4 className="font-medium mb-3 text-blue-700">Registrar Nova Despesa</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>Combustível</option>
                <option>Pedágio</option>
                <option>Alimentação</option>
                <option>Hospedagem</option>
                <option>Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Valor (R$)</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Descrição</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            </div>
          </div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
            Registrar Despesa
          </button>
        </div>

        <div>
          <h4 className="font-medium mb-3 text-blue-700">Despesas Recentes</h4>
          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-blue-100">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Tipo</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Valor</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-blue-50">
                      <td className="py-2 px-4 border-b text-sm text-gray-600">
                        {new Date(exp
