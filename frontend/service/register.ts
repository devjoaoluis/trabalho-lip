import api from "./api";

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
}

export interface RegisterResponse {
  /** A API retorna 201 sem corpo definido no swagger — tipamos como void por segurança. */
  message?: string;
}

export async function registerUser(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", credentials);
  return data;
}
