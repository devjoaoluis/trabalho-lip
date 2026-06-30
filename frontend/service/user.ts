import api from "./api"

export interface UserProfile {
  id: string
  nome: string
  email: string
  criadoEm: string
  atualizadoEm: string
  fotoUrl: string | null
  profileColor?: string
  receberNotificacoes?: boolean
}

export interface UpdateUserPayload {
  nome?: string
  email?: string
  profileColor?: string
}

function authHeaders() {
  const token = localStorage.getItem("accessToken")
  return { Authorization: `Bearer ${token}` }
}

export async function getCurrentUser(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/users/me", {
    headers: authHeaders(),
  })
  return data
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>(`/users/${id}`, payload, {
    headers: authHeaders(),
  })
  return data
}

export async function updateProfilePhoto(file: File): Promise<UserProfile> {
  const form = new FormData()
  form.append("file", file)

  const { data } = await api.patch<UserProfile>("/users/me/photo", form, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  })
  return data
}

export async function removeProfilePhoto(): Promise<UserProfile> {
  const { data } = await api.delete<UserProfile>("/users/me/photo", {
    headers: authHeaders(),
  })
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`, {
    headers: authHeaders(),
  })
}

export async function updateNotificationPreference(
  receberNotificacoes: boolean
): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>(
    "/users/me/notifications",
    { receberNotificacoes },
    { headers: authHeaders() }
  )
  return data
}
