import api from "./api"

export interface ForgotPasswordPayload {
  email: string
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await api.post("/auth/forgot-password", payload)
}
