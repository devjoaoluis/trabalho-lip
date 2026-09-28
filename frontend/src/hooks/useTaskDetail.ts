import { useState } from "react"
import { getTaskById, type Task } from "../../service/task"

function getHttpStatus(err: unknown): number | null {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "status" in err.response
  ) {
    return err.response.status as number
  }
  return null
}

export function useTaskDetail() {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchById(id: string): Promise<Task | null> {
    setIsLoading(true)
    setError(null)
    setTask(null)
    try {
      const data = await getTaskById(id)
      setTask(data)
      return data
    } catch (err: unknown) {
      const status = getHttpStatus(err)
      if (status === 404) setError("Tarefa não encontrada.")
      else if (status === 401) setError("Sessão expirada. Faça login novamente.")
      else setError("Erro ao carregar tarefa.")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  function clear() {
    setTask(null)
    setError(null)
  }

  return { task, isLoading, error, fetchById, clear }
}
