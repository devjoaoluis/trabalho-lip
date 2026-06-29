import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Search, Plus } from "lucide-react"
import { Sidebar } from "#components/ui/Sidebar"
import { NotificationBell } from "#components/ui/NotificationBell"
import { NewTaskModal } from "#components/tasks/NewTaskModal"
import { TasksProvider, useTasksContext } from "../../contexts/TasksContext"
import { useCurrentUser } from "#hooks/useCurrentUser"
import { ROUTES } from "../../router/routes"
import type { ActivePage } from "#components/ui/Sidebar"
import "../tasks/tasks.css"
import "../../pages/dashboard.css"

function routeToActivePage(pathname: string): ActivePage {
  if (pathname.startsWith(ROUTES.TASKS)) return "tasks"
  if (pathname.startsWith(ROUTES.SETTINGS)) return "settings"
  if (pathname.startsWith(ROUTES.RELATORIOS)) return "reports"
  if (pathname.startsWith(ROUTES.PROFILE)) return "profile"
  return "dashboard"
}

/* ── Inner layout — needs TasksContext ─────────────────────── */
function AppLayoutInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { tasks, addTask, showNewTaskModal, openNewTaskModal, closeNewTaskModal, search, setSearch } =
    useTasksContext()
  const { user } = useCurrentUser()

  const activePage = routeToActivePage(location.pathname)

  function handleLogout() {
    localStorage.removeItem("accessToken")
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="tasks-layout">
      <Sidebar
        userName={user?.nome ?? "Usuário"}
        userPhotoUrl={user?.fotoUrl}
        activePage={activePage}
        onLogout={handleLogout}
      />

      <div className="tasks-main">
        {/* ── Topbar persistente ── */}
        <header className="tasks-topbar">
          <div className="tasks-topbar__search">
            <Search size={15} className="text-white/30 shrink-0" aria-hidden="true" />
            <input
              className="tasks-topbar__search-input"
              placeholder="Buscar tarefas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar tarefas"
            />
          </div>
          <div className="tasks-topbar__actions">
            <button
              className="dashboard-header__new-btn"
              onClick={openNewTaskModal}
              aria-label="Nova tarefa"
            >
              <Plus size={18} aria-hidden="true" /> Nova Tarefa
            </button>
            <NotificationBell tasks={tasks} variant="dashboard" />
          </div>
        </header>

        {/* ── Conteúdo da página ── */}
        <div className="tasks-content">
          <Outlet />
        </div>
      </div>

      {/* ── Modal global de nova tarefa — sempre disponível ── */}
      {showNewTaskModal && (
        <NewTaskModal onClose={closeNewTaskModal} onSubmit={addTask} />
      )}
    </div>
  )
}

/* ── Exported layout — provides TasksContext ─────────────────── */
export function AppLayout() {
  return (
    <TasksProvider>
      <AppLayoutInner />
    </TasksProvider>
  )
}
