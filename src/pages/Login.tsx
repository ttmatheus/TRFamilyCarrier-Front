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
        user.userType === "admin" ? "/admin/dashboard" : "/dashboard";
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
              user.userType === "admin" ? "/admin/dashboard" : "/dashboard";
          }
        } catch (error) {}
        valid = false;
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="h-8 w-8 text-orange-300" />
            <span className="text-xl font-bold tracking-tight">
              TR Família Transportes
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-green-100">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Truck className="h-12 w-12 text-green-700" />
            </div>
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
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
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  {...register("rememberMe")}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Lembrar-me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
            Bem-vindo(a)
          </div>
        </div>
      </main>

      <section className="mt-20 px-4 max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-md p-8 border border-green-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-4">
            Sobre Nós
          </h2>
          <p className="text-gray-600 leading-relaxed text-center">
            A{" "}
            <span className="font-semibold text-green-700">
              TR Família Transportes
            </span>{" "}
            é uma empresa especializada em transporte rodoviário de cargas,
            oferecendo soluções logísticas eficientes, seguras e personalizadas.
            Nossa missão é conectar destinos com qualidade, comprometimento e
            inovação.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 border border-green-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
            Nossos Serviços
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 bg-green-50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
                  🚛
                </span>
                Transporte Nacional
              </h3>
              <p className="text-gray-600 text-sm">
                Entregas por todo o território nacional com rapidez, segurança e
                rastreabilidade.
              </p>
            </div>
            <div className="p-5 bg-green-50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
                  📦
                </span>
                Logística
              </h3>
              <p className="text-gray-600 text-sm">
                Armazenagem com estrutura adequada e controle inteligente de
                estoque.
              </p>
            </div>
            <div className="p-5 bg-green-50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
                  🧾
                </span>
                Gestão de Frotas
              </h3>
              <p className="text-gray-600 text-sm">
                Otimização de rotas e monitoramento para maior controle
                operacional.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 border border-green-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
            Fale Conosco
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-3 rounded-full mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <a
                href="mailto:contato@trfamilycarrier.com"
                className="text-green-600 hover:underline font-medium"
              >
                contato@trfamilycarrier.com
              </a>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-3 rounded-full mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <a
                href="https://wa.me/5584999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline font-medium"
              >
                (84) 99999-9999
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-green-800 text-white p-4 text-center text-sm mt-12">
        © {new Date().getFullYear()} TR Família Transportes. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
