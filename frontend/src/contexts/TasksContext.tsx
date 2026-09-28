import { createContext, useContext, useState, type ReactNode } from "react"
import { useTasks } from "#hooks/useTasks"
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "../../service/task"

interface TasksContextValue {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (payload: CreateTaskPayload, onSuccess?: () => void) => Promise<void>
  editTask: (id: string, payload: UpdateTaskPayload, onSuccess?: () => void) => Promise<void>
  removeTask: (id: string, onSuccess?: () => void) => Promise<void>
  /** Controla o modal de nova tarefa — acessível pelo layout e pela página */
  showNewTaskModal: boolean
  openNewTaskModal: () => void
  closeNewTaskModal: () => void
  /** Busca global do topbar */
  search: string
  setSearch: (value: string) => void
}

const TasksContext = createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
  const tasks = useTasks()
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [search, setSearch] = useState("")

  const value: TasksContextValue = {
    ...tasks,
    showNewTaskModal,
    openNewTaskModal: () => setShowNewTaskModal(true),
    closeNewTaskModal: () => setShowNewTaskModal(false),
    search,
    setSearch,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasksContext(): TasksContextValue {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error("useTasksContext must be used inside <TasksProvider>")
  return ctx
}
