import api from "./api"

export interface Relatorio {
  id: string
  usuarioId: string
  totalConcluidas: number
  totalPendentes: number
  concluidasPorDia: Record<string, number>
  periodoInicio: string
  periodoFim: string
  geradoEm: string
}

export interface CreateReportPayload {
  periodoInicio: string
  periodoFim: string
}

function authHeaders() {
  const token = localStorage.getItem("accessToken")
  return { Authorization: `Bearer ${token}` }
}

export async function getRelatorios(): Promise<Relatorio[]> {
  const { data } = await api.get<Relatorio[]>("/report", {
    headers: authHeaders(),
  })
  return data
}

export async function getRelatorioById(id: string): Promise<Relatorio> {
  const { data } = await api.get<Relatorio>(`/report/${id}`, {
    headers: authHeaders(),
  })
  return data
}

export async function createRelatorio(payload: CreateReportPayload): Promise<Relatorio> {
  const { data } = await api.post<Relatorio>("/report", payload, {
    headers: authHeaders(),
  })
  return data
}
