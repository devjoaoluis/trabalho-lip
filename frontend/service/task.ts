import api from "./api";

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";
export type StatusTarefa = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";

export interface Task {
  id: string;
  titulo: string;
  descricao?: string | null;
  prioridade: Prioridade;
  status: StatusTarefa;
  dataLimite?: string | null;
  concluidaEm?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  usuarioId?: string;
}

export interface CreateTaskPayload {
  titulo: string;
  descricao?: string;
  prioridade?: Prioridade;
  status?: StatusTarefa;
  dataLimite?: string;
}

export interface UpdateTaskPayload {
  titulo?: string;
  descricao?: string;
  prioridade?: Prioridade;
  status?: StatusTarefa;
  dataLimite?: string;
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function getTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/task", { headers: authHeaders() });
  return data;
}

export async function getTaskById(id: string): Promise<Task> {
  const { data } = await api.get<Task>(`/task/${id}`, { headers: authHeaders() });
  return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post<{ message: string; task: Task }>("/task", payload, {
    headers: authHeaders(),
  });
  return data.task;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await api.patch<Task>(`/task/${id}`, payload, {
    headers: authHeaders(),
  });
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/task/${id}`, { headers: authHeaders() });
}
