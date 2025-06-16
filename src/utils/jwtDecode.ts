import { jwtDecode } from "jwt-decode";

type User = {
	id: number;
	name: string;
	email: string;
	role: string;
}

type JwtPayload = {
  sub: string;
  user: User;
  exp: number;
  iat: number;
};

export function decodeToken(token: string): User | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
	const now = Math.floor(Date.now() / 1000)
	if(decoded.exp < now) {
		return null;
	}
    return decoded.user;
  } catch (error) {
    return null;
  }
}