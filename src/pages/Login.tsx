import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "@/services/authService";
import { handleApiError } from "@/utils/handleApiError";
import { Truck, Loader2, ShieldAlert } from "lucide-react";

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
        user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    } catch (err) {
      handleApiError(err, setError, setFocus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <span className="text-xl font-bold">TR Família Transportes</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-blue-200">
              Sobre Nós
            </a>
            <a href="#" className="hover:text-blue-200">
              Contato
            </a>
            <a href="#" className="hover:text-blue-200">
              Serviços
            </a>
          </nav>
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

              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
              </a>
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

      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} TR Família Transportes. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
