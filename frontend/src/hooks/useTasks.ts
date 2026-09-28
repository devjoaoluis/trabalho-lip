import { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "../../service/task";

function getHttpStatus(err: unknown): number | null {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "status" in err.response
  ) {
    return err.response.status as number;
  }
  return null;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 401) setError("Sessão expirada. Faça login novamente.");
      else setError("Erro ao carregar tarefas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  async function addTask(payload: CreateTaskPayload, onSuccess?: () => void): Promise<void> {
    setError(null);
    try {
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
      onSuccess?.();
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 401) setError("Sessão expirada. Faça login novamente.");
      else setError("Erro ao criar tarefa. Tente novamente.");
    }
  }

  async function editTask(
    id: string,
    payload: UpdateTaskPayload,
    onSuccess?: () => void
  ): Promise<void> {
    setError(null);
    try {
      const updated = await updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      onSuccess?.();
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 404) setError("Tarefa não encontrada.");
      else if (status === 401) setError("Sessão expirada. Faça login novamente.");
      else setError("Erro ao atualizar tarefa. Tente novamente.");
    }
  }

  async function removeTask(id: string, onSuccess?: () => void): Promise<void> {
    setError(null);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      onSuccess?.();
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 404) setError("Tarefa não encontrada.");
      else if (status === 401) setError("Sessão expirada. Faça login novamente.");
      else setError("Erro ao remover tarefa. Tente novamente.");
    }
  }

  return { tasks, isLoading, error, fetchTasks, addTask, editTask, removeTask };
}
