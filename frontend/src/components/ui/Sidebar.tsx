import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { ROUTES } from "../../router/routes"

export type ActivePage = "dashboard" | "tasks" | "settings" | "reports" | "statistics"

interface SidebarProps {
  userName: string
  activePage: ActivePage
  onLogout: () => void
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function Sidebar({ userName, activePage, onLogout }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <nav className="tasks-sidebar" aria-label="Menu principal">
      <div className="tasks-sidebar__logo">
        <TaskLipLogo variant="white" className="tasklip-logo--sidebar" />
      </div>

      <ul className="tasks-sidebar__nav" role="list">
        <li>
          <Button
            variant="ghost"
            className={cn(
              "tasks-sidebar__item w-full justify-start",
              activePage === "dashboard"
                ? "tasks-sidebar__item--active"
                : "hover:bg-white/5"
            )}
            aria-label="Início"
            aria-current={activePage === "dashboard" ? "page" : undefined}
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Início</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className={cn(
              "tasks-sidebar__item w-full justify-start",
              activePage === "tasks"
                ? "tasks-sidebar__item--active"
                : "hover:bg-white/5"
            )}
            aria-label="Tarefas"
            aria-current={activePage === "tasks" ? "page" : undefined}
            onClick={() => navigate(ROUTES.TASKS)}
          >
            <ClipboardList size={18} aria-hidden="true" />
            <span>Tarefas</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className={cn( "tasks-sidebar__item w-full justify-start", activePage === "reports" ? "tasks-sidebar__item--active" : "hover:bg-white/5" )}
            aria-label="Relatórios"
            aria-current={activePage === "reports" ? "page" : undefined}
            onClick={() => navigate(ROUTES.RELATORIOS)}
          >
            <BarChart2 size={18} aria-hidden="true" />
            <span>Relatórios</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Estatísticas"
          >
            <LineChart size={18} aria-hidden="true" />
            <span>Estatísticas</span>
          </Button>
        </li>
      </ul>

      <div className="tasks-sidebar__footer">
        <div className="tasks-sidebar__user">
          <span className="tasks-sidebar__avatar" aria-hidden="true">
            {getInitials(userName)}
          </span>
          <span className="text-sm truncate">{userName}</span>
        </div>
        <Button
          variant="ghost"
          className={cn(
            "tasks-sidebar__item w-full justify-start",
            activePage === "settings"
              ? "tasks-sidebar__item--active"
              : "hover:bg-white/5"
          )}
          aria-label="Configurações"
          aria-current={activePage === "settings" ? "page" : undefined}
          onClick={() => navigate(ROUTES.SETTINGS)}
        >
          <Settings size={18} aria-hidden="true" />
          <span>Configurações</span>
        </Button>
        <Button
          variant="ghost"
          className="tasks-sidebar__item w-full justify-start hover:bg-red-500/10 hover:text-red-400"
          aria-label="Sair"
          onClick={onLogout}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Sair</span>
        </Button>
      </div>
    </nav>
  )
}
