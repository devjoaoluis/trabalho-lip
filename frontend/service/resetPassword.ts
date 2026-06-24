import api from "./api"

export interface ResetPasswordPayload {
  /** Token recebido por e-mail (ou via query param na rota) */
  token: string
  /** Nova senha do usuário */
  newPassword: string
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await api.post("/auth/reset-password", payload)
}
