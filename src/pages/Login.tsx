import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authService, login } from "@/services/authService";
import { handleApiError } from "@/utils/handleApiError";
import { Truck, Loader2, ShieldAlert } from "lucide-react";
import { decodeToken } from "@/utils/jwtDecode";

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    message: string;
    details?: string;
    isCritical?: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await login(data);

      window.location.href =
        user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    } catch (err) {
      handleApiError(err, setError, setFocus);
    } finally {
      setIsLoading(false);
    }
  };

  let valid = true;
  useEffect(() => {
    const checkAuth = async () => {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (token && valid) {
        try {
          const user = decodeToken(token);
          if (user) {
            window.location.href =
              user.role === "admin" ? "/admin/dashboard" : "/dashboard";
          }
        } catch (error) {}
        valid = false;
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <span className="text-xl font-bold">TR Família Transportes</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
          <div className="flex justify-center mb-6">
            <Truck className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Acesse sua conta
          </h1>

          {error && (
            <div
              className={`mb-4 p-3 rounded-md border ${
                error.isCritical
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-yellow-50 text-yellow-800 border-yellow-200"
              }`}
            >
              <div className="flex items-start">
                <ShieldAlert className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{error.message}</p>
                  {error.details && (
                    <p className="text-sm mt-1">{error.details}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="seu@email.com"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                {...register("email", {
                  required: "E-mail é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "E-mail inválido",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                {...register("password", {
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 8,
                    message: "Senha deve ter pelo menos 8 caracteres",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register("rememberMe")}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Lembrar-me
                </label>
              </div>
              {/* 
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
              </a> 
              */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Autenticando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Bem-vindo(a) -{" "}
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Precisa de ajuda?
            </a>
          </div>
        </div>
      </main>

      <section className="mt-20 px-4 max-w-3xl mx-auto space-y-16">
        {/* Sobre Nós */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-4">
            Sobre Nós
          </h2>
          <p className="text-gray-600 leading-relaxed text-base text-center">
            A{" "}
            <span className="font-semibold text-blue-800">
              TR Família Transportes
            </span>{" "}
            é uma empresa especializada em transporte rodoviário de cargas,
            oferecendo soluções logísticas eficientes, seguras e personalizadas.
            Nossa missão é conectar destinos com qualidade, comprometimento e
            inovação.
          </p>
        </div>

        {/* Serviços */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
            Nossos Serviços
          </h2>
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                🚛 Transporte Rodoviário Nacional
              </h3>
              <p className="text-gray-600 text-sm">
                Realizamos entregas por todo o território nacional com rapidez,
                segurança e rastreabilidade.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                📦 Logística e Armazenamento
              </h3>
              <p className="text-gray-600 text-sm">
                Gerenciamos todo o ciclo de armazenagem com estrutura adequada e
                controle inteligente de estoque.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                🧾 Gestão de Entregas e Frotas
              </h3>
              <p className="text-gray-600 text-sm">
                Otimização de rotas e monitoramento da frota para maior controle
                e desempenho operacional.
              </p>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-4">
            Fale Conosco
          </h2>
          <p className="text-gray-600 text-center text-base">
            E-mail:{" "}
            <a
              href="mailto:contato@trfamilycarrier.com"
              className="text-blue-600 hover:underline"
            >
              contato@trfamilycarrier.com
            </a>
          </p>
          <p className="text-gray-600 text-center mt-2 text-base">
            WhatsApp:{" "}
            <a
              href="https://wa.me/5584999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              (84) 99999-9999
            </a>
          </p>
        </div>
      </section>

      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} TR Família Transportes. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
