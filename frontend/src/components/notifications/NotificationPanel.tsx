import { useRef, useEffect } from "react"
import {
  Bell,
  AlarmClock,
  CheckCircle2,
  Flame,
  CalendarClock,
  CalendarCheck,
  ArrowRight,
  X,
} from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import type { Notification, NotificationType } from "#hooks/useNotifications"
import "./notifications.css"

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffD > 0) return `há ${diffD} ${diffD === 1 ? "dia" : "dias"}`
  if (diffH > 0) return `há ${diffH}h`
  if (diffMin > 0) return `há ${diffMin}min`
  return "agora"
}

interface NotificationIconProps {
  type: NotificationType
}

function NotificationIcon({ type }: NotificationIconProps) {
  const map: Record<NotificationType, { icon: React.ReactNode; className: string }> = {
    ATRASADA: {
      icon: <AlarmClock size={18} aria-hidden="true" />,
      className: "notif-icon--atrasada",
    },
    VENCE_HOJE: {
      icon: <CalendarClock size={18} aria-hidden="true" />,
      className: "notif-icon--vence-hoje",
    },
    VENCE_AMANHA: {
      icon: <CalendarCheck size={18} aria-hidden="true" />,
      className: "notif-icon--vence-amanha",
    },
    CONCLUIDA: {
      icon: <CheckCircle2 size={18} aria-hidden="true" />,
      className: "notif-icon--concluida",
    },
    NOVA_TAREFA: {
      icon: <Flame size={18} aria-hidden="true" />,
      className: "notif-icon--nova",
    },
    ALTA_PRIORIDADE: {
      icon: <Flame size={18} aria-hidden="true" />,
      className: "notif-icon--alta",
    },
  }

  const { icon, className } = map[type]
  return <span className={cn("notif-icon", className)}>{icon}</span>
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onNavigate: (taskId: string) => void
}

function NotificationItem({ notification, onMarkRead, onNavigate }: NotificationItemProps) {
  function handleNavigate() {
    onMarkRead(notification.id)
    onNavigate(notification.taskId)
  }

  return (
    <li
      className={cn("notif-item", !notification.read && "notif-item--unread")}
      aria-label={notification.message}
    >
      <NotificationIcon type={notification.type} />

      <div className="notif-item__body">
        <p className="notif-item__message">{notification.message}</p>
        <div className="notif-item__footer">
          <button
            className="notif-item__link"
            onClick={handleNavigate}
            aria-label={`Ver tarefa: ${notification.taskTitle}`}
          >
            Ver tarefa <ArrowRight size={11} aria-hidden="true" />
          </button>
          <span className="notif-item__time">
            {formatRelativeTime(notification.timestamp)}
          </span>
        </div>
      </div>

      {!notification.read && (
        <span className="notif-item__dot" aria-label="Não lida" />
      )}
    </li>
  )
}

interface NotificationPanelProps {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  onToggle: () => void
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
  onNavigateToTask: (taskId: string) => void
}

export function NotificationPanel({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onMarkAllRead,
  onMarkRead,
  onNavigateToTask,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onToggle()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onToggle])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onToggle()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onToggle])

  return (
    <div className="notif-wrapper" ref={panelRef}>
      {/* Bell button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "tasks-topbar__bell hover:bg-white/10",
          isOpen && "tasks-topbar__bell--active"
        )}
        onClick={onToggle}
        aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} não lidas` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={16} className={cn(unreadCount > 0 && "notif-bell--shake")} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="tasks-topbar__bell-badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="notif-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Painel de notificações"
        >
          {/* Header */}
          <div className="notif-panel__header">
            <h2 className="notif-panel__title">Notificações</h2>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  className="notif-panel__mark-all"
                  onClick={onMarkAllRead}
                  aria-label="Marcar todas como lidas"
                >
                  Marcar todas como lidas
                </button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-white/30 hover:text-white hover:bg-white/10"
                onClick={onToggle}
                aria-label="Fechar notificações"
              >
                <X size={13} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell size={32} className="notif-empty__icon" aria-hidden="true" />
              <p className="notif-empty__text">Nenhuma notificação</p>
            </div>
          ) : (
            <ul className="notif-list" role="list">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={onMarkRead}
                  onNavigate={onNavigateToTask}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
