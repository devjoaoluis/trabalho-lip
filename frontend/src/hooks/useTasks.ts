import { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask, type  Task, type CreateTaskData, type UpdateTaskData } from "../../service/task";

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
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao carregar tarefas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      const newTask = await createTask(data);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.message || "Erro ao criar tarefa");
      throw err;
    }
  };

  const handleUpdateTask = async (id: string, data: UpdateTaskData) => {
    try {
      const updatedTask = await updateTask(id, data);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
      );
      return updatedTask;
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar tarefa");
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err: any) {
      setError(err.message || "Erro ao excluir tarefa");
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
  };
}
