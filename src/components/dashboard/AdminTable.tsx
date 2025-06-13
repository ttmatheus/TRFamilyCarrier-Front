import { useEffect, useState } from "react";
import {
  createAdmin,
  deleteAdmin,
  getAdmins,
  updateAdmin,
} from "@/services/userService";
import { Button } from "../ui/Button";
import { Loader2 } from "lucide-react";

interface Admin {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export default function AdminTable() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const all = await adminService.getUsers();
      const filtered = all.filter((user: Admin) => user.user_type === "admin");
      setAdmins(filtered);
    } catch (err) {
      console.error("Erro ao buscar administradores:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      if (isActive) await adminService.deactivateUser(id);
      else await adminService.activateUser(id);
      fetchAdmins();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (loading)
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" /> Carregando...
      </div>
    );

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2 px-4">Nome</th>
          <th className="py-2 px-4">Email</th>
          <th className="py-2 px-4">Status</th>
          <th className="py-2 px-4">Ações</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr key={admin.id} className="border-b">
            <td className="py-2 px-4">{admin.name}</td>
            <td className="py-2 px-4">{admin.email}</td>
            <td className="py-2 px-4">
              <span
                className={admin.is_active ? "text-green-600" : "text-red-600"}
              >
                {admin.is_active ? "Ativo" : "Inativo"}
              </span>
            </td>
            <td className="py-2 px-4">
              <Button
                variant={admin.is_active ? "destructive" : "default"}
                onClick={() => toggleActive(admin.id, admin.is_active)}
              >
                {admin.is_active ? "Desativar" : "Ativar"}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
