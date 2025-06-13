<<<<<<< HEAD
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
=======
import axios from 'axios';

type LoginPayload = {
	email: string,
	password: string,
	rememberMe: boolean,
};

export async function login({
	email,
	password,
	rememberMe,
}: LoginPayload) {
	const response = await axios.post(
		'http://localhost:8080/users/login',
		{
			email: email.trim(),
			password,
		}
	);

	const { token, user } = response.data;

	if (!token || typeof token !== 'string') {
		throw new Error('Resposta inválida do servidor');
	}

	if (rememberMe) {
		localStorage.setItem('authToken', token);
	} else {
		sessionStorage.setItem('authToken', token);
	}

	return user;
}
>>>>>>> 372e0a21c902030c3c900b62ac0fd76840be718b
