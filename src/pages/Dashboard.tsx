import { useAuth } from "@/hooks/useAuth";
import AdminTable from "@/components/dashboard/AdminTable";
import { PageTitle } from "@/components/ui/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="p-6">
      <PageTitle title="Painel de Controle" />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          {user.user_type === "admin" && (
            <TabsTrigger value="admins">Administradores</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <p>Seja bem-vindo, {user.name}!</p>
        </TabsContent>

        {user.user_type === "admin" && (
          <TabsContent value="admins">
            <AdminTable />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
