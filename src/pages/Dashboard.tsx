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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { decodeToken } from "@/utils/jwtDecode";
import apiClient from "@/services/api";

type User = {
  id: number;
  name: string;
  truckId: string;
  userType: string;
  email: string; 
};

type Trip = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  arrivalTime: string;
  status: string;
  cargoDescription: string;
};

type Truck = {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  status: string;
  maintenanceDueDate: string;
  insuranceExpiration: string;
};

type Driver = {
  id: number;
  user: User;
  truck: Truck;
  licenseNumber: string;
  licenseExpiration: string;
  stats: Record<string, string>;
};

export default function DriverDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [assignedTruck, setAssignedTruck] = useState<Truck | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<
    { title: string; message: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token =
          sessionStorage.getItem("authToken") ||
          localStorage.getItem("authToken");
        if (!token) {
          navigate("/");
          return;
        }

        const data = decodeToken(token);
        if (!data || data.userType !== "driver") {
          navigate("/dashboard");
          return;
        }

        
        setUser(data as User);

        const driverResponse = await apiClient.get(`/driver/${data.id}`);
        
        setDriver(driverResponse.data as Driver);

        if ((driverResponse.data as Driver).truck) {
          setAssignedTruck((driverResponse.data as Driver).truck as Truck);

          const truckNotifications = [];
          const maintenanceDue = new Date(
            (driverResponse.data as Driver).truck.maintenanceDueDate
          );
          const today = new Date();
          const truckDiffTime = maintenanceDue.getTime() - today.getTime(); 
          const diffDays = Math.ceil(truckDiffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 7) {
            truckNotifications.push({
              title: "Manutenção próxima",
              message: `Manutenção do veículo em ${diffDays} dias`,
            });
          }

          const insuranceDue = new Date(
            (driverResponse.data as Driver).truck.insuranceExpiration
          );
          const insuranceDiffDays = Math.ceil(
            (insuranceDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (insuranceDiffDays <= 30) {
            truckNotifications.push({
              title: "Seguro vencendo",
              message: `Seguro do veículo vence em ${insuranceDiffDays} dias`,
            });
          }

          
          const licenseExpiration = new Date(
            (driverResponse.data as Driver).licenseExpiration
          );
          const licenseDiffDays = Math.ceil(
            (licenseExpiration.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (licenseDiffDays <= 30) {
            truckNotifications.push({
              title: "CNH vencendo",
              message: `Sua CNH vence em ${licenseDiffDays} dias`,
            });
          }

          setNotifications(truckNotifications);
        }

        const tripsResponse = await apiClient.get(`/trip?user_id=${data.id}`);
        
        const allTrips = tripsResponse.data as Trip[];

        const current = allTrips.find(
          (trip: Trip) => trip.status === "in_progress"
        );
        setCurrentTrip(current || null);

        const upcoming = allTrips
          .filter((trip: Trip) => trip.status === "scheduled")
          .sort(
            (a: Trip, b: Trip) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          );
        setUpcomingTrips(upcoming);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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

  const formatShortDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold flex items-center space-x-3">
            <Truck className="w-6 h-6 text-orange-300" />
            <span>Painel do Motorista</span>
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:block">{user?.email}</span>
            <button
              onClick={authService.logout}
              className="flex items-center text-sm hover:text-orange-200 transition hover:bg-green-800 px-3 py-1 rounded"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Olá, <span className="text-green-700">{user?.name}</span>!
          </h2>
          <p className="text-gray-600 mt-1">
            Bem-vindo(a) ao seu painel de controle!
          </p>

          {driver && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">CNH</p>
                <p className="font-medium">{driver.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Validade CNH</p>
                <p className="font-medium">
                  {formatShortDate(driver.licenseExpiration)}
                </p>
              </div>
              {driver.stats && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Viagens</p>
                    <p className="font-medium">
                      {driver.stats.totalTrips || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avaliação</p>
                    <p className="font-medium">
                      {driver.stats.rating || "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <MapPin className="w-5 h-5 text-orange-500 mr-2" />
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
                      {formatDate(currentTrip.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chegada Prevista</p>
                    <p className="font-medium">
                      {formatDate(currentTrip.arrivalTime)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Carga</p>
                  <p className="font-medium">{currentTrip.cargoDescription}</p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() =>
                      navigate(`/driver/trip-details/${currentTrip.id}`)
                    }
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm"
                  >
                    Detalhes da Viagem
                  </button>
                  <button
                    onClick={() =>
                      navigate("/driver/report-issue", {
                        state: { tripId: currentTrip.id },
                      })
                    }
                    className="bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-all text-sm"
                  >
                    Registrar Ocorrência
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Você não tem viagens em andamento no momento.
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Truck className="w-5 h-5 text-orange-500 mr-2" />
              {assignedTruck ? "Seu Caminhão" : "Nenhum Caminhão Atribuído"}
            </h3>

            {assignedTruck ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Placa</p>
                  <p className="font-medium">{assignedTruck.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modelo</p>
                  <p className="font-medium">
                    {assignedTruck.brand} {assignedTruck.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Manutenção</p>
                  <p className="font-medium">
                    {formatShortDate(assignedTruck.maintenanceDueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seguro</p>
                  <p className="font-medium">
                    {formatShortDate(assignedTruck.insuranceExpiration)}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/driver/truck-details")}
                  className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm w-full"
                >
                  Ver Detalhes
                </button>
              </div>
            ) : (
              <p className="text-gray-600">
                Nenhum caminhão foi atribuído a você.
              </p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 text-orange-500 mr-2" />
              Próximas Viagens
            </h3>

            {upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 border border-green-100 rounded-lg hover:bg-green-50 transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Origem → Destino
                        </p>
                        <p className="font-medium">
                          {trip.origin} → {trip.destination}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-medium">
                          {formatDate(trip.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium capitalize">
                          {trip.status === "scheduled" ? "Agendada" : (
                            trip.status === "in_progress" ? "Em progresso" : (
                              trip.status === "completed" ? "Completada" : "Cancelada"
                            )
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/driver/trip-details/${trip.id}`)
                      }
                      className="mt-3 text-green-600 hover:text-green-800 text-sm flex items-center"
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
              Notificações
            </h3>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500"
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
      </main>
    </div>
  );
}