import axios from "axios";

type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export async function login({ email, password, rememberMe }: LoginPayload) {
  const response = await axios.post("https://ip/auth/login", {
    email: email.trim(),
    password,
  });

  const { token, user } = response.data;

  if (!token || typeof token !== "string") {
    throw new Error("Resposta inválida do servidor");
  }

  if (rememberMe) {
    localStorage.setItem("authToken", token);
  } else {
    sessionStorage.setItem("authToken", token);
  }

  return user;
}
