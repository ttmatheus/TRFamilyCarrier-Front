import api from "./api";

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
