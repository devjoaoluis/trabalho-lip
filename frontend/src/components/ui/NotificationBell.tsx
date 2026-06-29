import { useRef, useEffect, useState, useCallback } from "react"
import { Bell, Clock, Check, Flame } from "lucide-react"
import { cn } from "#lib/utils"
import {
  useNotifications,
  clearNotificationsStorage,
  type AppNotification,
} from "#hooks/useNotifications"
import type { Task } from "../../../service/task"
import "../tasks/tasks.css"

const DISMISSED_KEY = "task_lip_dismissed_notifications"

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return new Set<string>(parsed as string[])
  } catch {
    // ignore
  }
  return new Set()
}

function saveDismissed(ids: Set<string>): void {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // ignore
  }
}

interface NotificationBellProps {
  tasks: Task[]
  /** Extra classes for the wrapper */
  className?: string
  /** Visual variant: "tasks" uses the dark rounded square style; "dashboard" uses the original style */
  variant?: "tasks" | "dashboard"
  onNavigateToTask?: (taskId: string) => void
}

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  if (type === "atrasada")
    return (
      <span className="notif-icon notif-icon--warning" aria-hidden="true">
        <Clock size={15} />
      </span>
    )
  if (type === "concluida")
    return (
      <span className="notif-icon notif-icon--success" aria-hidden="true">
        <Check size={15} />
      </span>
    )
  return (
    <span className="notif-icon notif-icon--info" aria-hidden="true">
      <Flame size={15} />
    </span>
  )
}

function notifLabel(n: AppNotification): string {
  if (n.type === "atrasada") return `"${n.taskTitle}" está atrasada`
  if (n.type === "concluida") return `Você concluiu "${n.taskTitle}"`
  return `Nova tarefa: "${n.taskTitle}"`
}

export function NotificationBell({
  tasks,
  className,
  variant = "tasks",
  onNavigateToTask,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  // dismissed IDs persisted in localStorage
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissed())
  const ref = useRef<HTMLDivElement>(null)
  const { notifications } = useNotifications(tasks)

  const visible = notifications.filter((n) => !dismissed.has(n.id))
  const unreadCount = visible.length

  // Sync dismissed set to localStorage whenever it changes
  useEffect(() => {
    saveDismissed(dismissed)
  }, [dismissed])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleClearAll = useCallback(() => {
    // Mark all current notifications as dismissed
    const allIds = new Set(notifications.map((n) => n.id))
    setDismissed(allIds)
    saveDismissed(allIds)
    // Also wipe the notifications array from localStorage so on reload it starts fresh
    clearNotificationsStorage()
    // Remove dismissed list too since there's nothing to dismiss anymore
    localStorage.removeItem(DISMISSED_KEY)
  }, [notifications])

  const bellClass =
    variant === "dashboard"
      ? "dashboard-header__bell-btn"
      : "tasks-topbar__bell hover:bg-white/10 relative"

  const badgeClass =
    variant === "dashboard"
      ? "dashboard-header__bell-badge"
      : "tasks-topbar__bell-badge"

  return (
    <div ref={ref} className={cn("notif-wrapper", className)}>
      <button
        className={bellClass}
        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={variant === "dashboard" ? 20 : 16} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className={badgeClass} aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notificações">
          <div className="notif-panel__header">
            <h3 className="notif-panel__title">Notificações</h3>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="notif-panel__count">{unreadCount}</span>
                <button
                  className="notif-panel__clear"
                  onClick={handleClearAll}
                  aria-label="Limpar todos os lembretes"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="notif-panel__empty">Nenhuma notificação.</p>
          ) : (
            <ul className="notif-panel__list" role="list">
              {visible.map((n) => (
                <li key={n.id} className="notif-item">
                  <NotificationIcon type={n.type} />
                  <div className="notif-item__content">
                    <p className="notif-item__text">{notifLabel(n)}</p>
                    {onNavigateToTask && (
                      <button
                        className="notif-item__link"
                        onClick={() => {
                          onNavigateToTask(n.taskId)
                          setOpen(false)
                        }}
                      >
                        Ver tarefa →
                      </button>
                    )}
                  </div>
                  <span className="notif-item__time">{n.eventDate ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(n.eventDate)) : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
