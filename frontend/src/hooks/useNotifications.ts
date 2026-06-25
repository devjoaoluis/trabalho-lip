import { useMemo, useRef } from "react"
import type { Task } from "../../service/task"

export type NotificationType = "atrasada" | "concluida" | "nova"

export interface AppNotification {
  id: string
  type: NotificationType
  taskId: string
  taskTitle: string
  /** ISO string of when the event happened (used for relative time display) */
  eventDate: string
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `há ${minutes} min`
  if (hours < 24) return `há ${hours}h`
  return `há ${days} dia${days !== 1 ? "s" : ""}`
}

export function useNotifications(tasks: Task[]) {
  // Track which task IDs we've already seen so "new task" fires only once
  const seenIdsRef = useRef<Set<string>>(new Set())

  const notifications = useMemo<AppNotification[]>(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const result: AppNotification[] = []

    for (const task of tasks) {
      // Tarefa atrasada
      if (task.dataLimite && task.status !== "CONCLUIDA") {
        const deadline = new Date(task.dataLimite)
        deadline.setHours(0, 0, 0, 0)
        if (deadline < now) {
          result.push({
            id: `atrasada-${task.id}`,
            type: "atrasada",
            taskId: task.id,
            taskTitle: task.titulo,
            eventDate: task.dataLimite,
          })
        }
      }

      // Tarefa concluída
      if (task.status === "CONCLUIDA" && task.concluidaEm) {
        result.push({
          id: `concluida-${task.id}`,
          type: "concluida",
          taskId: task.id,
          taskTitle: task.titulo,
          eventDate: task.concluidaEm,
        })
      }

      // Nova tarefa (criada recentemente — últimas 24h)
      if (task.criadoEm) {
        const created = new Date(task.criadoEm)
        const ageMs = Date.now() - created.getTime()
        if (ageMs < 24 * 60 * 60 * 1000) {
          result.push({
            id: `nova-${task.id}`,
            type: "nova",
            taskId: task.id,
            taskTitle: task.titulo,
            eventDate: task.criadoEm,
          })
        }
      }
    }

    // Sort: most recent first
    return result.sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    )
  }, [tasks])

  const unreadCount = notifications.length

  return { notifications, unreadCount, timeAgo }
}
