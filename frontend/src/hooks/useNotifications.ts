import { useMemo, useEffect, useRef } from "react"
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

const STORAGE_KEY = "task_lip_notifications"

function loadFromStorage(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as AppNotification[]
  } catch {
    // ignore parse errors
  }
  return []
}

function saveToStorage(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch {
    // ignore storage errors (e.g. private mode quota)
  }
}

/** Merge derived notifications into the persisted list.
 *  - Adds new entries that don't exist yet (by id).
 *  - Does NOT remove entries that already exist (they survive page reloads).
 *  - Sorts by eventDate descending (most recent first).
 */
function mergeNotifications(
  persisted: AppNotification[],
  derived: AppNotification[]
): AppNotification[] {
  const map = new Map<string, AppNotification>()

  // Start with persisted entries
  for (const n of persisted) {
    map.set(n.id, n)
  }

  // Add/overwrite with freshly derived ones (keeps data up-to-date)
  for (const n of derived) {
    map.set(n.id, n)
  }

  const merged = Array.from(map.values())

  // Sort: most recent eventDate first
  merged.sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  )

  return merged
}

function deriveNotifications(tasks: Task[]): AppNotification[] {
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

    // Nova tarefa (criada nas últimas 24h)
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

  return result
}

export function timeAgo(isoDate: string): string {
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
  // Whether the storage key existed before this session
  const storageExistedRef = useRef<boolean>(
    localStorage.getItem(STORAGE_KEY) !== null
  )

  const notifications = useMemo<AppNotification[]>(() => {
    const derived = deriveNotifications(tasks)

    if (!storageExistedRef.current && tasks.length === 0) {
      // Tasks haven't loaded yet — don't touch storage
      return loadFromStorage()
    }

    if (!storageExistedRef.current) {
      // First time: storage doesn't exist yet — create it with derived data
      saveToStorage(derived)
      storageExistedRef.current = true
      return derived
    }

    // Storage already exists — merge derived with persisted
    const persisted = loadFromStorage()
    const merged = mergeNotifications(persisted, derived)
    saveToStorage(merged)
    return merged
  }, [tasks])

  const unreadCount = notifications.length

  return { notifications, unreadCount, timeAgo }
}

/** Clear all notifications from localStorage and return empty array.
 *  Call this when the user clicks "Limpar" in the bell panel.
 */
export function clearNotificationsStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}
