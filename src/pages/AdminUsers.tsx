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
  XCircle, // Adicionado para o botão de fechar o formulário de edição
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";

type UserType = { // Renomeado para UserType para evitar conflito com 'User' do lucide-react
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver";
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  driverInfo?: {
    licenseNumber: string;
    licenseExpiration: string; // Formato YYYY-MM-DD
    phoneNumber: string;
    truck?: {
      id: string; // Adicionado id do caminhão para pré-seleção
      licensePlate: string;
      brand: string;
      model: string;
    };
  };
};

type TruckType = { // Renomeado para TruckType
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  status: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false); // Renomeado para clareza
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // --- Novos estados para o formulário de edição ---
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null); // Usuário sendo editado
  const [editForm, setEditForm] = useState({ // Estado para os campos do formulário de edição
    name: "",
    email: "",
    role: "" as "admin" | "driver" | "", // Permitir string vazia para o estado inicial
    licenseNumber: "",
    licenseExpiration: "",
    phoneNumber: "",
    truckId: "", // ID do caminhão associado
    active: false, // Novo campo para status do usuário
  });

  const [createForm, setCreateForm] = useState({ // Renomeado para clareza
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
      setUsers(res.data as UserType[]);
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
      setTrucks(res.data as TruckType[]);
    } catch (error) {
      console.error("Erro ao buscar caminhões:", error);
    }
  };

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchUsers();
      alert("Usuário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Não foi possível excluir o usuário. Verifique suas permissões.");
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validação básica dos campos do formulário de CRIAÇÃO
      if (!createForm.name || !createForm.email || !createForm.password) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      if (
        createForm.role === "driver" &&
        (!createForm.licenseNumber || !createForm.licenseExpiration)
      ) {
        alert("Para motoristas, preencha os dados da CNH");
        return;
      }

      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      const userData = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        ...(createForm.role === "driver" && {
          driverInfo: {
            licenseNumber: createForm.licenseNumber,
            licenseExpiration: createForm.licenseExpiration,
            phoneNumber: createForm.phoneNumber,
            truckId: createForm.truckId ? parseInt(createForm.truckId) : null,
          },
        }),
      };

      const response = await apiClient.post("/users/create", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setCreateForm({
          name: "",
          email: "",
          password: "",
          role: "driver",
          licenseNumber: "",
          licenseExpiration: "",
          phoneNumber: "",
          truckId: "",
        });
        setShowCreateForm(false);
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

  // --- Funções de Edição ---

  const openEditForm = (user: UserType) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      licenseNumber: user.driverInfo?.licenseNumber || "",
      licenseExpiration: user.driverInfo?.licenseExpiration || "",
      phoneNumber: user.driverInfo?.phoneNumber || "",
      truckId: user.driverInfo?.truck?.id || "",
      active: user.active, // Inicializa o status
    });
    setShowEditForm(true);
    setShowCreateForm(false); // Fecha o formulário de criação se estiver aberto
  };

  const closeEditForm = () => {
    setEditingUser(null);
    setShowEditForm(false);
    setEditForm({
      name: "",
      email: "",
      role: "" as "admin" | "driver" | "",
      licenseNumber: "",
      licenseExpiration: "",
      phoneNumber: "",
      truckId: "",
      active: false,
    });
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      const updatedUserData: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        active: editForm.active, // Envia o status
      };

      if (editForm.role === "driver") {
        updatedUserData.driverInfo = {
          licenseNumber: editForm.licenseNumber,
          licenseExpiration: editForm.licenseExpiration,
          phoneNumber: editForm.phoneNumber,
          // Garante que truckId seja null ou um número
          truckId: editForm.truckId ? parseInt(editForm.truckId) : null,
        };
      } else {
        // Se o cargo for alterado para admin, remove driverInfo
        updatedUserData.driverInfo = null;
      }

      // IMPORTANTE: Filtrar campos para enviar apenas os que mudaram ou estão preenchidos.
      // O backend espera campos opcionais, então não envie valores vazios se não houver mudança.
      const payload: any = {};
      for (const key in updatedUserData) {
        // Verifica se o campo não é nulo/vazio ou se é um booleano (para active)
        if (updatedUserData[key] !== "" && updatedUserData[key] !== null && updatedUserData[key] !== undefined) {
             if (key === 'driverInfo') {
                // Para driverInfo, apenas inclua se houver dados úteis,
                // ou se a role for driver e você precisar enviar o objeto driverInfo (mesmo que vazio)
                const filteredDriverInfo:any = {};
                if (updatedUserData.driverInfo) {
                    for (const driverKey in updatedUserData.driverInfo) {
                        if (updatedUserData.driverInfo[driverKey] !== "" && updatedUserData.driverInfo[driverKey] !== null && updatedUserData.driverInfo[driverKey] !== undefined) {
                            filteredDriverInfo[driverKey] = updatedUserData.driverInfo[driverKey];
                        }
                    }
                }
                if (Object.keys(filteredDriverInfo).length > 0) {
                     payload.driverInfo = filteredDriverInfo;
                } else if (updatedUserData.role === 'admin') {
                    // Se mudou para admin, garanta que driverInfo seja null no payload
                    payload.driverInfo = null;
                }
             } else {
                payload[key] = updatedUserData[key];
             }
        }
      }
      
      // Validação adicional: Se mudou para driver e faltam campos importantes
      if (payload.role === 'driver' && (!payload.driverInfo || !payload.driverInfo.licenseNumber || !payload.driverInfo.licenseExpiration)) {
        alert("Para motoristas, o número e validade da CNH são obrigatórios.");
        return;
      }


      const response = await apiClient.put(`/users/${editingUser.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Usuário atualizado com sucesso!");
        closeEditForm();
        await fetchUsers(); // Recarrega a lista de usuários para ver as mudanças
      }
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Houve um problema desconhecido ao tentar atualizar o usuário.";
      alert(errorMessage);
    }
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

        {/* Botão de Criar Novo Usuário */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false); // Garante que o formulário de edição esteja fechado
              setEditingUser(null);
            }}
            className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? "Cancelar" : "Criar Novo Usuário"}
          </button>
        </div>

        {/* Formulário de Criação de Usuário */}
        {showCreateForm && (
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
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
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
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
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
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Cargo
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: e.target.value as "admin" | "driver",
                    })
                  }
                >
                  <option value="driver">Motorista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {createForm.role === "driver" && (
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
                      value={createForm.licenseNumber}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, licenseNumber: e.target.value })
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
                      value={createForm.licenseExpiration}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, licenseExpiration: e.target.value })
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
                      value={createForm.phoneNumber}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, phoneNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm text-gray-600 mb-1">
                      Caminhão Associado
                    </label>
                    <select
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={createForm.truckId}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, truckId: e.target.value })
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

        {/* --- Formulário de Edição de Usuário --- */}
        {showEditForm && editingUser && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-6 relative">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Editar Usuário: {editingUser.name}
            </h2>
            <button
              onClick={closeEditForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              title="Fechar formulário"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="text"
                  name="name" // Adicionar 'name' para handleEditInputChange
                  placeholder="Nome completo"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  E-mail
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="email"
                  name="email" // Adicionar 'name'
                  placeholder="E-mail"
                  value={editForm.email}
                  onChange={handleEditInputChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Cargo
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  name="role" // Adicionar 'name'
                  value={editForm.role}
                  onChange={handleEditInputChange}
                >
                  <option value="driver">Motorista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="active" // Adicionar 'name'
                    checked={editForm.active}
                    onChange={handleEditInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Usuário Ativo</span>
                </div>
              </div>
            </div>

            {editForm.role === "driver" && (
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
                      name="licenseNumber" // Adicionar 'name'
                      placeholder="CNH"
                      value={editForm.licenseNumber}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Validade da CNH
                    </label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      type="date"
                      name="licenseExpiration" // Adicionar 'name'
                      value={editForm.licenseExpiration}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Telefone
                    </label>
                    <input
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      type="text"
                      name="phoneNumber" // Adicionar 'name'
                      placeholder="(00) 00000-0000"
                      value={editForm.phoneNumber}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm text-gray-600 mb-1">
                      Caminhão Associado
                    </label>
                    <select
                      className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      name="truckId" // Adicionar 'name'
                      value={editForm.truckId}
                      onChange={handleEditInputChange}
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

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeEditForm}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {/* Tabela de Usuários */}
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
                // O Fragment <>...</> é necessário para retornar múltiplos elementos (tr da linha principal e tr da linha expandida)
                <>
                  <tr
                    key={user.id}
                    className="border-t border-green-100 hover:bg-green-50 cursor-pointer"
                    onClick={() => toggleRow(user.id)} // Expande/colapsa ao clicar na linha
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
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Nunca acessou"}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      {user.email !== "root@admin.com" && ( // Não permite editar/excluir o usuário root
                        <>
                          <button
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                            onClick={(e) => {
                              e.stopPropagation(); // Impede que o clique na linha ative o toggleRow
                              openEditForm(user); // Abre o formulário de edição com os dados do usuário
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation(); // Impede que o clique na linha ative o toggleRow
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
                          e.stopPropagation(); // Impede que o clique na linha ative o toggleRow
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