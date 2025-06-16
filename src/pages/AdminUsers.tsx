import { useEffect, useState } from "react";
import { UserCog, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver";
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token =
          sessionStorage.getItem("authToken") ||
          localStorage.getItem("authToken");
        if (!token) {
          navigate("/");
        }
        const mockUsers: User[] = (
          await apiClient.get("/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ).data as User[];
        setUsers(mockUsers);
      } catch (error) {}
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <UserCog className="w-6 h-6 text-blue-600" />
            <span>Gerenciamento de Usuários</span>
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
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">E-mail</th>
                <th className="text-left px-4 py-3">Cargo</th>
                <th className="text-left px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">
                    {user.role === "admin" ? "Administrador" : "Usuário"}
                  </td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center px-4 py-6 text-gray-500"
                  >
                    Nenhum usuário encontrado.
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
