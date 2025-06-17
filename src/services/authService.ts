import axios from "axios";
import apiClient from "./api";

type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type responseUser = {
  email: string;
  userType: string;
  userId: number;
  name: string;
};

export async function login({ email, password, rememberMe }: LoginPayload) {
  const response = await axios.post("http://localhost:8080/auth/login", {
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

export const authService = {
  async logout() {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("authToken");
    window.location.href = "/";
  },

  async getCurrentUser() {
    const response = await axios.get("http://localhost:8080/auth/me");
    return response.data;
  },

  async validateJwt() {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    const user = await apiClient.get("/auth/validateJwt", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return user.data as responseUser;
  },
};
