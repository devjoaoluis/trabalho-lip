import api from "./api";
import { isAxiosError } from "axios";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "Baixo" | "Média" | "Alta";
  status: "Pendente" | "Em Andamento" | "Concluída";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: "Baixo" | "Média" | "Alta";
  status: "Pendente" | "Em Andamento" | "Concluída";
  dueDate?: string;
}

export type UpdateTaskData = Partial<CreateTaskData>;

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await api.get("/task");
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erro ao buscar tarefas");
    }
    throw error;
  }
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  try {
    const response = await api.post("/task", data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erro ao criar tarefa");
    }
    throw error;
  }
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  try {
    const response = await api.patch(`/task/${id}`, data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erro ao atualizar tarefa");
    }
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await api.delete(`/task/${id}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Erro ao excluir tarefa");
    }
    throw error;
  }
}
