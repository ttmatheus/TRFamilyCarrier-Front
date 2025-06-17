import { useEffect, useState } from "react";
import {
  UserCog,
  Pencil,
  Trash2,
  Plus,
  Truck,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  driverInfo?: {
    licenseNumber: string;
    licenseExpiration: string;
    phoneNumber: string;
    truck?: {
      licensePlate: string;
      brand: string;
      model: string;
    };
  };
};

type Truck = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  status: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "driver" as "admin" | "driver",
    licenseNumber: "",
    licenseExpiration: "",
    phoneNumber: "",
    truckId: "",
  });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return navigate("/");

      const res = await apiClient.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data as User[]);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const fetchTrucks = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      const res = await apiClient.get("/truck", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrucks(res.data as Truck[]);
    } catch (error) {
      console.error("Erro ao buscar caminhões:", error);
    }
  };

  // Adicione estas funções atualizadas no seu componente

  const deleteUser = async (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este usuário?"
    );
    if (!confirmed) return;

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      await apiClient.delete(`/users/${id}`, {
        // Alterado para o formato REST convencional
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchUsers();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Não foi possível excluir o usuário. Verifique suas permissões.");
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validação básica dos campos
      if (!form.name || !form.email || !form.password) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      if (
        form.role === "driver" &&
        (!form.licenseNumber || !form.licenseExpiration)
      ) {
        alert("Para motoristas, preencha os dados da CNH");
        return;
      }

      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === "driver" && {
          driverInfo: {
            licenseNumber: form.licenseNumber,
            licenseExpiration: form.licenseExpiration,
            phoneNumber: form.phoneNumber,
            truckId: form.truckId ? parseInt(form.truckId) : null,
          },
        }),
      };

      const response = await apiClient.post("/users", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setForm({
          name: "",
          email: "",
          password: "",
          role: "driver",
          licenseNumber: "",
          licenseExpiration: "",
          phoneNumber: "",
          truckId: "",
        });
        setShowForm(false);
        await fetchUsers();
        alert("Usuário criado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Houve um problema desconhecido ao tentar criar o usuário...";
      alert(errorMessage);
    }
  };

  const toggleRow = (userId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  useEffect(() => {
    fetchUsers();
    fetchTrucks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <UserCog className="w-6 h-6 text-green-700" />
            <span>Gerenciamento de Usuários</span>
          </h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm text-green-700 hover:underline flex items-center"
          >
            ← Voltar ao dashboard
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancelar" : "Criar Novo Usuário"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Novo Usuário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  placeholder="Nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  E-mail
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="email"
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Senha
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="password"
                  placeholder="Senha"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Cargo
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as "admin" | "driver",
                    })
                  }
                >
                  <option value="driver">Motorista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {form.role === "driver" && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-md font-semibold mb-3 text-gray-800 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-orange-600" />
                  Dados do Motorista
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Número da CNH
                    </label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      type="text"
                      placeholder="CNH"
                      value={form.licenseNumber}
                      onChange={(e) =>
                        setForm({ ...form, licenseNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Validade da CNH
                    </label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      type="date"
                      value={form.licenseExpiration}
                      onChange={(e) =>
                        setForm({ ...form, licenseExpiration: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Telefone
                    </label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm text-gray-600 mb-1">
                      Caminhão Associado
                    </label>
                    <select
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={form.truckId}
                      onChange={(e) =>
                        setForm({ ...form, truckId: e.target.value })
                      }
                    >
                      <option value="">Selecione um caminhão</option>
                      {trucks.map((truck) => (
                        <option key={truck.id} value={truck.id}>
                          {truck.licensePlate} - {truck.brand} {truck.model} (
                          {truck.year})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateUser}
              className="mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800"
            >
              Criar Usuário
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-green-50 text-gray-700">
              <tr>
                <th className="text-left px-6 py-3">Usuário</th>
                <th className="text-left px-6 py-3">Cargo</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Último Acesso</th>
                <th className="text-left px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                    onClick={() => toggleRow(user.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-green-700" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {user.role === "admin" ? "Administrador" : "Motorista"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Nunca acessou"}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      {user.email !== "root@admin.com" && (
                        <>
                          <button
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              // editUser(user);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUser(user.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(user.id);
                        }}
                      >
                        {expandedRows[user.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedRows[user.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Informações Básicas
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">
                                  Cadastrado em:
                                </span>{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                              {user.driverInfo && (
                                <>
                                  <p>
                                    <span className="font-medium">CNH:</span>{" "}
                                    {user.driverInfo.licenseNumber}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Validade CNH:
                                    </span>{" "}
                                    {new Date(
                                      user.driverInfo.licenseExpiration
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Telefone:
                                    </span>{" "}
                                    {user.driverInfo.phoneNumber}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          {user.driverInfo?.truck && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Truck className="w-4 h-4 mr-2 text-orange-600" />
                                Caminhão Associado
                              </h4>
                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                <p className="font-medium">
                                  {user.driverInfo.truck.licensePlate}
                                </p>
                                <p className="text-sm">
                                  {user.driverInfo.truck.brand}{" "}
                                  {user.driverInfo.truck.model}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-6 py-8 text-gray-500"
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
