import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  LineChart,
  Settings,
  LogOut,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  CalendarDays,
  X,
} from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { useTasks } from "#hooks/useTasks"
import { useTaskDetail } from "#hooks/useTaskDetail"
import { useNotifications } from "#hooks/useNotifications"
import { NotificationPanel } from "../notifications/NotificationPanel"
import { ROUTES } from "../../router/routes"
import type { Task, CreateTaskPayload, UpdateTaskPayload, Prioridade, StatusTarefa } from "../../../service/task"
import "./tasks.css"

const PRIORITY_LABEL: Record<Prioridade, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixo",
}

const STATUS_LABEL: Record<StatusTarefa, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluído",
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function getUserName(): string {
  try {
    const raw = localStorage.getItem("accessToken") ?? ""
    const payload = JSON.parse(atob(raw.split(".")[1] ?? "e30="))
    return (payload.nome as string | undefined) ?? "Usuário"
  } catch {
    return "Usuário"
  }
}

function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span
      className={cn(
        "priority-badge",
        prioridade === "ALTA" && "priority-badge--alta",
        prioridade === "MEDIA" && "priority-badge--media",
        prioridade === "BAIXA" && "priority-badge--baixa"
      )}
    >
      {PRIORITY_LABEL[prioridade]}
    </span>
  )
}

function StatusBadge({ status }: { status: StatusTarefa }) {
  return (
    <span
      className={cn(
        "status-badge",
        status === "CONCLUIDA" && "status-badge--concluida",
        status === "PENDENTE" && "status-badge--pendente",
        status === "EM_ANDAMENTO" && "status-badge--em-andamento"
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

interface SidebarProps {
  userName: string
  onLogout: () => void
}

function Sidebar({ userName, onLogout }: SidebarProps) {
  return (
    <nav className="tasks-sidebar" aria-label="Menu principal">
      <div className="tasks-sidebar__logo">
        <TaskLipLogo variant="white" className="tasklip-logo--sidebar" />
      </div>

      <ul className="tasks-sidebar__nav" role="list">
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Início"
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Início</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item tasks-sidebar__item--active w-full justify-start"
            aria-label="Tarefas"
            aria-current="page"
          >
            <ClipboardList size={18} aria-hidden="true" />
            <span>Tarefas</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Relatórios"
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
          className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
          aria-label="Configurações"
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

interface NewTaskModalProps {
  onClose: () => void
  onSubmit: (payload: CreateTaskPayload) => Promise<void>
}

function NewTaskModal({ onClose, onSubmit }: NewTaskModalProps) {
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [prioridade, setPrioridade] = useState<Prioridade>("MEDIA")
  const [status, setStatus] = useState<StatusTarefa>("PENDENTE")
  const [dataLimite, setDataLimite] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setIsSaving(true)
    await onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      prioridade,
      status,
      dataLimite: dataLimite || undefined,
    })
    setIsSaving(false)
    onClose()
  }

  return (
    <div className="tasks-modal-overlay" role="dialog" aria-modal="true" aria-label="Nova tarefa">
      <div className="tasks-modal">
        <div className="flex items-center justify-between mb-4">
          <h2 className="tasks-modal__title">Nova Tarefa</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de nova tarefa">
          <div className="task-field">
            <Label className="task-field__label" htmlFor="new-titulo">Título *</Label>
            <Input
              id="new-titulo"
              className="task-field__input"
              placeholder="Título da tarefa"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="task-field">
            <Label className="task-field__label" htmlFor="new-desc">Descrição</Label>
            <textarea
              id="new-desc"
              className="task-field__textarea focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
              placeholder="Descrição opcional..."
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex gap-3">
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="new-prioridade">Prioridade</Label>
              <select
                id="new-prioridade"
                className="task-field__select focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                disabled={isSaving}
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixo</option>
              </select>
            </div>
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="new-status">Status</Label>
              <select
                id="new-status"
                className="task-field__select focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusTarefa)}
                disabled={isSaving}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDA">Concluído</option>
              </select>
            </div>
          </div>

          <div className="task-field">
            <Label className="task-field__label" htmlFor="new-data">Data limite</Label>
            <Input
              id="new-data"
              type="date"
              className="task-field__input"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="task-edit-panel__actions mt-2">
            <Button
              type="button"
              variant="ghost"
              className="tasks-btn-cancel hover:bg-white/10"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="tasks-btn-save hover:bg-[#6a5fe0] active:bg-[#5c52cc]"
              disabled={isSaving || !titulo.trim()}
            >
              {isSaving ? "Criando…" : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditPanelProps {
  task: Task
  isLoadingDetail?: boolean
  onClose: () => void
  onSave: (id: string, payload: UpdateTaskPayload) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function EditPanel({ task, isLoadingDetail = false, onClose, onSave, onDelete }: EditPanelProps) {
  const [titulo, setTitulo] = useState(task.titulo)
  const [descricao, setDescricao] = useState(task.descricao ?? "")
  const [prioridade, setPrioridade] = useState<Prioridade>(task.prioridade)
  const [status, setStatus] = useState<StatusTarefa>(task.status)
  const [dataLimite, setDataLimite] = useState(task.dataLimite ?? "")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!titulo.trim()) return
    setIsSaving(true)
    await onSave(task.id, {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      prioridade,
      status,
      dataLimite: dataLimite || undefined,
    })
    setIsSaving(false)
  }

  async function handleDelete() {
    setIsSaving(true)
    await onDelete(task.id)
    setIsSaving(false)
    onClose()
  }

  return (
    <aside className="task-edit-panel" aria-label="Editar tarefa">
      <div className="task-edit-panel__header">
        <Pencil size={14} className="text-white/40" aria-hidden="true" />
        <span className="task-edit-panel__title">Editar tarefa</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-white/30 hover:text-white hover:bg-white/10"
          onClick={onClose}
          aria-label="Fechar painel"
        >
          <X size={16} aria-hidden="true" />
        </Button>
      </div>

      {isLoadingDetail ? (
        <div className="flex flex-col gap-3 animate-pulse py-2" aria-label="Carregando detalhes">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
          <div className="h-3 w-2/3 rounded bg-white/5" />
          <div className="h-16 w-full rounded bg-white/5 mt-2" />
          <div className="h-3 w-1/3 rounded bg-white/5 mt-2" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
      ) : (
        <>
          <div className="task-field">
            <Label className="task-field__label" htmlFor="edit-titulo">Título</Label>
            <Input
              id="edit-titulo"
              className="task-field__input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="task-edit-panel__dates">
            <CalendarDays size={12} className="task-edit-panel__date-icon" aria-hidden="true" />
            <span>{formatDate(task.criadoEm)}</span>
            <span className="mx-1">→</span>
            <span>{formatDate(task.dataLimite)}</span>
          </div>

          <div className="task-edit-panel__row">
            <span className="task-edit-panel__label">Status</span>
            <StatusBadge status={status} />
          </div>

          <div className="task-edit-panel__row">
            <span className="task-edit-panel__label">Prioridade</span>
            <PriorityBadge prioridade={prioridade} />
          </div>

          <div className="task-field mt-3">
            <Label className="task-field__label" htmlFor="edit-desc">Descrição</Label>
            <textarea
              id="edit-desc"
              className="task-field__textarea focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
              rows={4}
              placeholder="Descrição da tarefa..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex gap-3">
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="edit-prioridade">Prioridade</Label>
              <select
                id="edit-prioridade"
                className="task-field__select"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                disabled={isSaving}
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixo</option>
              </select>
            </div>
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="task-field__select"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusTarefa)}
                disabled={isSaving}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDA">Concluído</option>
              </select>
            </div>
          </div>

          <div className="task-field">
            <Label className="task-field__label" htmlFor="edit-data">Data limite</Label>
            <Input
              id="edit-data"
              type="date"
              className="task-field__input"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="task-edit-panel__meta">
            <div className="task-edit-panel__meta-row">
              <span>Criado em</span>
              <span>{formatDate(task.criadoEm)}</span>
            </div>
            {task.concluidaEm && (
              <div className="task-edit-panel__meta-row">
                <span>Concluído em</span>
                <span>{formatDate(task.concluidaEm)}</span>
              </div>
            )}
          </div>

          <div className="task-edit-panel__actions">
            <Button
              variant="ghost"
              className="tasks-btn-cancel hover:bg-white/10"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              className="tasks-btn-save hover:bg-[#6a5fe0] active:bg-[#5c52cc]"
              onClick={() => void handleSave()}
              disabled={isSaving || !titulo.trim()}
            >
              {isSaving ? "Salvando…" : "Salvar"}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="mt-3 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 justify-start gap-1 px-0"
            onClick={() => void handleDelete()}
            disabled={isSaving}
            aria-label="Excluir tarefa"
          >
            <Trash2 size={12} aria-hidden="true" />
            Excluir tarefa
          </Button>
        </>
      )}
    </aside>
  )
}

const PAGE_SIZE = 9

type TabFilter = "todas" | "hoje" | "atrasadas" | "concluidas"

export function TasksPage() {
  const navigate = useNavigate()
  const { tasks, isLoading, error, addTask, editTask, removeTask } = useTasks()
  const { task: detailedTask, isLoading: isLoadingDetail, fetchById, clear: clearDetail } = useTaskDetail()
  const userName = getUserName()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<TabFilter>("todas")
  const [priorityFilter, setPriorityFilter] = useState<Prioridade | "TODAS">("TODAS")
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)

  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(tasks)

  function handleNavigateToTask(taskId: string) {
    setNotifOpen(false)
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setSelectedTaskId(taskId)
      void fetchById(taskId)
    }
  }

  // A task exibida no painel: a detalhada (se já carregou) ou a da lista (enquanto carrega)
  const selectedTaskBase = tasks.find((t) => t.id === selectedTaskId) ?? null
  const selectedTask = detailedTask ?? selectedTaskBase

  function handleLogout() {
    localStorage.removeItem("accessToken")
    navigate(ROUTES.LOGIN, { replace: true })
  }

  function selectTask(task: Task) {
    if (selectedTaskId === task.id) {
      setSelectedTaskId(null)
      clearDetail()
    } else {
      setSelectedTaskId(task.id)
      void fetchById(task.id)
    }
  }

  function closePanel() {
    setSelectedTaskId(null)
    clearDetail()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    let list = tasks

    // Busca
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.titulo.toLowerCase().includes(q))
    }

    // Tab
    if (tab === "concluidas") {
      list = list.filter((t) => t.status === "CONCLUIDA")
    } else if (tab === "hoje") {
      list = list.filter((t) => {
        if (!t.dataLimite) return false
        const d = new Date(t.dataLimite)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime()
      })
    } else if (tab === "atrasadas") {
      list = list.filter((t) => {
        if (!t.dataLimite || t.status === "CONCLUIDA") return false
        const d = new Date(t.dataLimite)
        d.setHours(0, 0, 0, 0)
        return d.getTime() < today.getTime()
      })
    }

    // Prioridade
    if (priorityFilter !== "TODAS") {
      list = list.filter((t) => t.prioridade === priorityFilter)
    }

    return list
  }, [tasks, search, tab, priorityFilter, today])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function goToPage(p: number) {
    setCurrentPage(Math.min(Math.max(1, p), totalPages))
  }

  function handleTabChange(t: TabFilter) {
    setTab(t)
    setCurrentPage(1)
  }

  async function handleToggleDone(task: Task) {
    const newStatus: StatusTarefa = task.status === "CONCLUIDA" ? "PENDENTE" : "CONCLUIDA"
    await editTask(task.id, { status: newStatus })
  }

  async function handleDeleteFromMenu(id: string) {
    setMenuOpenId(null)
    if (selectedTaskId === id) closePanel()
    await removeTask(id)
  }

  // Contadores para badges
  const countHoje = tasks.filter((t) => {
    if (!t.dataLimite) return false
    const d = new Date(t.dataLimite); d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }).length
  const countAtrasadas = tasks.filter((t) => {
    if (!t.dataLimite || t.status === "CONCLUIDA") return false
    const d = new Date(t.dataLimite); d.setHours(0, 0, 0, 0)
    return d.getTime() < today.getTime()
  }).length
  const countConcluidas = tasks.filter((t) => t.status === "CONCLUIDA").length

  return (
    <div className="tasks-layout">
      <Sidebar userName={userName} onLogout={handleLogout} />

      <div className="tasks-main">
        {/* Topbar */}
        <header className="tasks-topbar">
          <div className="tasks-topbar__search">
            <Search size={15} className="text-white/30 shrink-0" aria-hidden="true" />
            <input
              className="tasks-topbar__search-input"
              placeholder="Buscar tarefas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              aria-label="Buscar tarefas"
            />
          </div>

          <div className="tasks-topbar__actions">
            <Button
              className="tasks-topbar__new-btn hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
              onClick={() => setShowNewModal(true)}
              aria-label="Nova tarefa"
            >
              <Plus size={16} aria-hidden="true" />
              Nova Tarefa
            </Button>

            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              isOpen={notifOpen}
              onToggle={() => setNotifOpen((v) => !v)}
              onMarkAllRead={markAllRead}
              onMarkRead={markRead}
              onNavigateToTask={handleNavigateToTask}
            />
          </div>
        </header>

        {/* Conteúdo */}
        <div className="tasks-content">
          <section className="tasks-panel" aria-label="Lista de tarefas">
            {/* Tabs + filtro */}
            <div className="tasks-tabs">
              {(["todas", "hoje", "atrasadas", "concluidas"] as TabFilter[]).map((t) => {
                const labels: Record<TabFilter, string> = { todas: "Todas", hoje: "Hoje", atrasadas: "Atrasadas", concluidas: "Concluídas" }
                const counts: Record<TabFilter, number | null> = { todas: null, hoje: countHoje, atrasadas: countAtrasadas, concluidas: countConcluidas }
                return (
                  <Button
                    key={t}
                    variant="ghost"
                    className={cn("tasks-tab", tab === t && "tasks-tab--active")}
                    onClick={() => handleTabChange(t)}
                    aria-pressed={tab === t}
                  >
                    {t === "hoje" && <CalendarDays size={13} aria-hidden="true" />}
                    {t === "atrasadas" && <X size={13} aria-hidden="true" />}
                    {t === "concluidas" && <CheckCircle2 size={13} aria-hidden="true" />}
                    {labels[t]}
                    {counts[t] !== null && (
                      <span className="tasks-tab__badge">{counts[t]}</span>
                    )}
                  </Button>
                )
              })}

              {/* Filtro prioridade */}
              <div className="relative ml-auto">
                <Button
                  variant="ghost"
                  className="tasks-filter hover:bg-white/10"
                  onClick={() => setShowPriorityMenu((v) => !v)}
                  aria-label="Filtrar por prioridade"
                >
                  Prioridade
                  <ChevronRight size={13} className={cn("transition-transform", showPriorityMenu && "rotate-90")} aria-hidden="true" />
                </Button>
                {showPriorityMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-[#10122a] border border-white/10 rounded-lg py-1 z-10 w-36">
                    {(["TODAS", "ALTA", "MEDIA", "BAIXA"] as const).map((p) => (
                      <Button
                        key={p}
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-white/60 hover:bg-white/5",
                          priorityFilter === p && "text-white bg-white/5"
                        )}
                        onClick={() => { setPriorityFilter(p); setShowPriorityMenu(false); setCurrentPage(1) }}
                      >
                        {priorityFilter === p && <Check size={12} aria-hidden="true" />}
                        {p === "TODAS" ? "Todas" : PRIORITY_LABEL[p]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cabeçalho da tabela */}
            <div className="tasks-table__header">
              <span className="tasks-table__col-title">
                Tarefas <span className="text-white/30">{filtered.length}</span>
              </span>
              <span className="tasks-table__col-priority">Prioridade</span>
              <span className="tasks-table__col-date">Prazo</span>
              <span className="tasks-table__col-actions flex items-center gap-1">
                <Trash2 size={13} aria-hidden="true" />
                <CheckCircle2 size={13} aria-hidden="true" />
              </span>
            </div>

            {/* Estado de carregamento */}
            {isLoading && (
              <div className="tasks-empty">
                <span className="tasks-empty__text">Carregando tarefas…</span>
              </div>
            )}

            {/* Erro */}
            {error && !isLoading && (
              <div className="tasks-empty" role="alert" aria-live="polite">
                <span className="tasks-empty__text text-red-400">{error}</span>
              </div>
            )}

            {/* Lista */}
            {!isLoading && !error && paginated.length === 0 && (
              <div className="tasks-empty">
                <ClipboardList size={40} className="tasks-empty__icon" aria-hidden="true" />
                <span className="tasks-empty__text">Nenhuma tarefa encontrada</span>
              </div>
            )}

            {!isLoading && !error && (
              <ul className="tasks-table" role="list">
                {paginated.map((task) => (
                  <li key={task.id}>
                    <div
                      className={cn("task-row hover:bg-white/5", selectedTaskId === task.id && "task-row--selected")}
                      onClick={() => selectTask(task)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedTaskId === task.id}
                      onKeyDown={(e) => e.key === "Enter" && selectTask(task)}
                    >
                      <button
                        className={cn("task-row__check shrink-0", task.status === "CONCLUIDA" && "task-row__check--done")}
                        onClick={(e) => { e.stopPropagation(); void handleToggleDone(task) }}
                        aria-label={task.status === "CONCLUIDA" ? "Marcar como pendente" : "Marcar como concluída"}
                      >
                        {task.status === "CONCLUIDA" && <Check size={10} className="text-white" aria-hidden="true" />}
                      </button>
                      <div className="task-row__info">
                        <span className={cn("task-row__title", task.status === "CONCLUIDA" && "task-row__title--done")}>
                          {task.titulo}
                        </span>
                        <span className="task-row__subtitle">LIP</span>
                      </div>

                      <div className="tasks-table__col-priority flex justify-center">
                        <PriorityBadge prioridade={task.prioridade} />
                      </div>

                      <div className="tasks-table__col-date text-center text-xs text-white/50">
                        {formatDate(task.dataLimite)}
                      </div>

                      <div className="tasks-table__col-actions flex justify-center relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/30 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === task.id ? null : task.id) }}
                          aria-label="Mais opções"
                          aria-haspopup="true"
                          aria-expanded={menuOpenId === task.id}
                        >
                          <MoreVertical size={15} aria-hidden="true" />
                        </Button>
                        {menuOpenId === task.id && (
                          <div className="absolute right-0 top-full mt-1 bg-[#10122a] border border-white/10 rounded-lg py-1 z-10 w-36">
                            <Button
                              variant="ghost"
                              className="flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-white/60 hover:bg-white/5"
                              onClick={(e) => { e.stopPropagation(); selectTask(task); setMenuOpenId(null) }}
                            >
                              <Pencil size={13} aria-hidden="true" /> Editar
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                              onClick={(e) => { e.stopPropagation(); void handleDeleteFromMenu(task.id) }}
                            >
                              <Trash2 size={13} aria-hidden="true" /> Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Paginação */}
            {!isLoading && filtered.length > 0 && (
              <div className="tasks-pagination">
                <span className="tasks-pagination__info">
                  Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} tarefas
                </span>
                <div className="tasks-pagination__controls">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="tasks-pagination__btn hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={14} aria-hidden="true" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…")
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, idx) =>
                      p === "…" ? (
                        <span key={`ellipsis-${idx}`} className="tasks-pagination__btn text-white/30">…</span>
                      ) : (
                        <Button
                          key={p}
                          variant="ghost"
                          size="icon"
                          className={cn("tasks-pagination__btn", currentPage === p && "tasks-pagination__btn--active")}
                          onClick={() => goToPage(p as number)}
                          aria-label={`Página ${p}`}
                          aria-current={currentPage === p ? "page" : undefined}
                        >
                          {p}
                        </Button>
                      )
                    )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="tasks-pagination__btn hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                  >
                    <ChevronRight size={14} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Painel lateral de edição */}
          {selectedTaskId && selectedTask && (
            <EditPanel
              key={selectedTaskId}
              task={selectedTask}
              isLoadingDetail={isLoadingDetail}
              onClose={closePanel}
              onSave={async (id, payload) => {
                await editTask(id, payload)
                void fetchById(id)
              }}
              onDelete={async (id) => {
                await removeTask(id)
                closePanel()
              }}
            />
          )}
        </div>
      </div>

      {/* Modal nova tarefa */}
      {showNewModal && (
        <NewTaskModal
          onClose={() => setShowNewModal(false)}
          onSubmit={addTask}
        />
      )}
    </div>
  )
}
