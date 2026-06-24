import { useMemo, useState, useCallback } from "react"
import type { Task } from "../../service/task"

export type NotificationType =
  | "ATRASADA"
  | "VENCE_HOJE"
  | "VENCE_AMANHA"
  | "CONCLUIDA"
  | "NOVA_TAREFA"
  | "ALTA_PRIORIDADE"

export interface Notification {
  id: string
  type: NotificationType
  taskId: string
  taskTitle: string
  message: string
  timestamp: Date
  read: boolean
}

/**
 * Derives notifications from the task list.
 * - ATRASADA: task not done and past due date
 * - VENCE_HOJE: task due today and not done
 * - VENCE_AMANHA: task due tomorrow and not done
 * - CONCLUIDA: task with status CONCLUIDA
 * - ALTA_PRIORIDADE: ALTA priority task that is PENDENTE and has no due date set
 */
function deriveNotifications(tasks: Task[]): Notification[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const notifications: Notification[] = []

  for (const task of tasks) {
    if (task.dataLimite && task.status !== "CONCLUIDA") {
      const due = new Date(task.dataLimite)
      due.setHours(0, 0, 0, 0)

      const diffMs = due.getTime() - today.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        const diasAtraso = Math.abs(diffDays)
        notifications.push({
          id: `atrasada-${task.id}`,
          type: "ATRASADA",
          taskId: task.id,
          taskTitle: task.titulo,
          message: `"${task.titulo}" está atrasada há ${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"}`,
          timestamp: due,
          read: false,
        })
      } else if (diffDays === 0) {
        notifications.push({
          id: `vence-hoje-${task.id}`,
          type: "VENCE_HOJE",
          taskId: task.id,
          taskTitle: task.titulo,
          message: `"${task.titulo}" vence hoje`,
          timestamp: due,
          read: false,
        })
      } else if (diffDays === 1) {
        notifications.push({
          id: `vence-amanha-${task.id}`,
          type: "VENCE_AMANHA",
          taskId: task.id,
          taskTitle: task.titulo,
          message: `"${task.titulo}" vence amanhã`,
          timestamp: due,
          read: false,
        })
      }
    }

    if (task.status === "CONCLUIDA") {
      notifications.push({
        id: `concluida-${task.id}`,
        type: "CONCLUIDA",
        taskId: task.id,
        taskTitle: task.titulo,
        message: `Você concluiu "${task.titulo}"`,
        timestamp: task.concluidaEm ? new Date(task.concluidaEm) : new Date(),
        read: false,
      })
    }

    if (
      task.prioridade === "ALTA" &&
      task.status === "PENDENTE" &&
      !task.dataLimite
    ) {
      notifications.push({
        id: `alta-${task.id}`,
        type: "ALTA_PRIORIDADE",
        taskId: task.id,
        taskTitle: task.titulo,
        message: `"${task.titulo}" tem prioridade alta e está pendente`,
        timestamp: task.criadoEm ? new Date(task.criadoEm) : new Date(),
        read: false,
      })
    }
  }

  // Most urgent first: ATRASADA > VENCE_HOJE > VENCE_AMANHA > ALTA_PRIORIDADE > CONCLUIDA
  const priority: Record<NotificationType, number> = {
    ATRASADA: 0,
    VENCE_HOJE: 1,
    VENCE_AMANHA: 2,
    ALTA_PRIORIDADE: 3,
    NOVA_TAREFA: 4,
    CONCLUIDA: 5,
  }

  notifications.sort((a, b) => priority[a.type] - priority[b.type])

  return notifications
}

export function useNotifications(tasks: Task[]) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const notifications = useMemo(() => {
    return deriveNotifications(tasks).map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }))
  }, [tasks, readIds])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }, [notifications])

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]))
  }, [])

  return { notifications, unreadCount, markAllRead, markRead }
}
