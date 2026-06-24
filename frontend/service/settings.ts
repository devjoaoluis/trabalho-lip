import api from "./api";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> {
  const token = localStorage.getItem("accessToken");
  const { data } = await api.post<ChangePasswordResponse>(
    "/auth/change-password",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
