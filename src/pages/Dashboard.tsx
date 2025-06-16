import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import apiClient from "@/services/api";
import { decodeToken } from "@/utils/jwtDecode";

type Trip = {
  id: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
};

type FreightBillStatus = "PENDING" | "PAID" | "CANCELLED";

type FreightBill = {
  id: number;
  initialValue: number;
  remainingValue: number;
  truckExpensesTotal: number;
  tripExpensesTotal: number;
  driverPaymentValue: number;
  companyRevenue: number;
  paymentStatus: FreightBillStatus;
  notes?: string | null;
};

export default function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [freightBills, setFreightBills] = useState<FreightBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const data = decodeToken(token);
        if (!data || data.role !== "driver") {
          window.location.href = "/";
          return;
        }
        const userId = data.id;

        const tripsResponse = await apiClient.get<Trip[]>(
          `/trip?user_id=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const freightBillsResponse = await apiClient.get<FreightBill[]>(
          `/freightbill?user_id=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTrips(tripsResponse.data);
        setFreightBills(freightBillsResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar dados. Tente novamente.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard do Motorista</h1>

      <Tabs defaultValue="trips">
        <TabsList>
          <TabsTrigger value="trips">Viagens</TabsTrigger>
          <TabsTrigger value="freightBills">Freight Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          {trips.length === 0 ? (
            <p>Você não possui viagens registradas.</p>
          ) : (
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Origem</th>
                  <th className="px-4 py-2 text-left">Destino</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{trip.origin}</td>
                    <td className="px-4 py-2">{trip.destination}</td>
                    <td className="px-4 py-2 capitalize">{trip.status}</td>
                    <td className="px-4 py-2">
                      {new Date(trip.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TabsContent>

        <TabsContent value="freightBills">
          {freightBills.length === 0 ? (
            <p>Você não possui cartas-frete registradas.</p>
          ) : (
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Valor</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {freightBills.map((bill) => (
                  <tr key={bill.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{bill.initialValue}</td>
                    <td className="px-4 py-2">
                      R$ {bill.remainingValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 capitalize">
                      {bill.paymentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
