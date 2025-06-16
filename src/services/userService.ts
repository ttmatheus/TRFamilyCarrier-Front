import api from "./api";

export const userService = {
  async getAllAdmins() {
    const response = await api.get("/users?user_type=admin");
    return response.data;
  },

  async createAdmin(data: { name: string; email: string; password: string }) {
    const response = await api.post("/users", { ...data, user_type: "admin" });
    return response.data;
  },
};
