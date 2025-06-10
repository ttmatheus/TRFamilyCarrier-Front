import { UseFormSetFocus } from "react-hook-form";
import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  error?: string;
  statusCode?: number;
};

type UiError = {
  message: string;
  details?: string;
  isCritical?: boolean;
};

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export function handleApiError(
  err: unknown,
  setError: (value: UiError | null) => void,
  setFocus: UseFormSetFocus<FormData>
) {
  if (axios.isAxiosError(err)) {
    const response = err.response?.data as ApiErrorResponse;
    const status = err.response?.status;

    switch (status) {
      case 400:
        setError({
          message: "Dados inválidos",
          details: response?.message || "Verifique os campos e tente novamente",
        });
        setFocus("email");
        break;
      case 401:
        setError({
          message: "Falha na autenticação",
          details: "E-mail ou senha incorretos",
        });
        setFocus("password");
        break;
      case 403:
        setError({
          message: "Acesso negado",
          details:
            response?.message || "Sua conta não tem permissão para acessar",
          isCritical: true,
        });
        break;
      case 429:
        setError({
          message: "Muitas tentativas",
          details: "Aguarde alguns minutos antes de tentar novamente",
        });
        break;
      case 500:
        setError({
          message: "Erro no servidor",
          details: response?.message || "Tente novamente mais tarde",
          isCritical: true,
        });
        break;
      default:
        setError({
          message: "Erro de conexão",
          details: "Não foi possível conectar ao servidor",
        });
    }
  } else if (err instanceof Error) {
    setError({
      message: "Erro inesperado",
      details: err.message,
    });
  } else {
    setError({
      message: "Erro desconhecido",
      details: "Ocorreu um problema inesperado",
    });
  }
}
