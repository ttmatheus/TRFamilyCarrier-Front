import { useEffect, useState } from "react";
import { Truck, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";

type Trip = {
  id: number;
  origin: string;
  destination: string;
  status: string;
  departure_time: string;
  receiver_name: string;
};

export default function AdminPedidos() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token =
          sessionStorage.getItem("authToken") ||
          localStorage.getItem("authToken");

        if (!token) return navigate("/");

        const userId = 1;

        const response = await apiClient.get(`/trip?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrips(response.data as Trip[]);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            <span>Pedidos de Transporte</span>
          </h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Voltar ao dashboard
          </button>
        </div>

        <div className="bg-white rounded shadow border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Origem</th>
                <th className="text-left px-4 py-3">Destino</th>
                <th className="text-left px-4 py-3">Destinatário</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Data de Partida</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{trip.origin}</td>
                  <td className="px-4 py-3">{trip.destination}</td>
                  <td className="px-4 py-3">{trip.receiver_name}</td>
                  <td className="px-4 py-3 capitalize">{trip.status}</td>
                  <td className="px-4 py-3">
                    {new Date(trip.departure_time).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-6 text-gray-500"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
