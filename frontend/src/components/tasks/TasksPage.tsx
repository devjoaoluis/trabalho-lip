import { useState, useMemo } from "react"
import {
  ClipboardList,
  Trash2,
  CheckCircle2,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  CalendarDays,
  X,
  AlertTriangle,
} from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import { useTasksContext } from "../../contexts/TasksContext"
import { useTaskDetail } from "#hooks/useTaskDetail"
import type { Task, UpdateTaskPayload, Prioridade, StatusTarefa } from "../../../service/task"
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

function parseDate(dateStr: string): Date {
  // "YYYY-MM-DD" sem hora: constrói como local para não deslocar pelo UTC offset
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(dateStr)
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return dateStr
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span className={cn("priority-badge", prioridade === "ALTA" && "priority-badge--alta", prioridade === "MEDIA" && "priority-badge--media", prioridade === "BAIXA" && "priority-badge--baixa")}>
      {PRIORITY_LABEL[prioridade]}
    </span>
  )
}

function StatusBadge({ status }: { status: StatusTarefa }) {
  return (
    <span className={cn("status-badge", status === "CONCLUIDA" && "status-badge--concluida", status === "PENDENTE" && "status-badge--pendente", status === "EM_ANDAMENTO" && "status-badge--em-andamento")}>
      {STATUS_LABEL[status]}
    </span>
  )
}

/* ─── Confirm Delete Modal ─────────────────────────────────── */
interface ConfirmDeleteModalProps {
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function ConfirmDeleteModal({ onConfirm, onCancel, isDeleting }: ConfirmDeleteModalProps) {
  return (
    <div className="tasks-modal-overlay" role="dialog" aria-modal="true" aria-label="Confirmar exclusão">
      <div className="tasks-confirm-modal">
        <div className="tasks-confirm-modal__icon-wrap" aria-hidden="true">
          <AlertTriangle size={40} className="text-yellow-400" />
        </div>
        <h2 className="tasks-confirm-modal__title">Excluir tarefa</h2>
        <p className="tasks-confirm-modal__text">• Confirmar exclusão da tarefa?</p>
        <div className="tasks-confirm-modal__actions">
          <Button variant="ghost" className="tasks-confirm-modal__btn-cancel hover:bg-white/10" onClick={onCancel} disabled={isDeleting}>Cancelar</Button>
          <Button className="tasks-confirm-modal__btn-delete hover:bg-red-600 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Edit Panel ───────────────────────────────────────────── */
interface EditPanelProps {
  task: Task
  isLoadingDetail?: boolean
  onClose: () => void
  onSave: (id: string, payload: UpdateTaskPayload) => Promise<void>
  onRequestDelete: (id: string) => void
}

function EditPanel({ task, isLoadingDetail = false, onClose, onSave, onRequestDelete }: EditPanelProps) {
  const [titulo, setTitulo] = useState(task.titulo)
  const [descricao, setDescricao] = useState(task.descricao ?? "")
  const [prioridade, setPrioridade] = useState<Prioridade>(task.prioridade)
  const [status, setStatus] = useState<StatusTarefa>(task.status)
  const [dataLimite, setDataLimite] = useState(task.dataLimite ?? "")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!titulo.trim()) return
    setIsSaving(true)
    await onSave(task.id, { titulo: titulo.trim(), descricao: descricao.trim() || undefined, prioridade, status, dataLimite: dataLimite || undefined })
    setIsSaving(false)
  }

  function calcDuration(): string {
    if (!task.criadoEm) return "—"
    const start = new Date(task.criadoEm)
    const end = task.concluidaEm ? new Date(task.concluidaEm) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days} dias ${hours} horas`
  }

  return (
    <aside className="task-edit-panel" aria-label="Editar tarefa">
      {/* Handle visual para mobile (drawer) */}
      <div className="task-edit-panel__drag-handle" aria-hidden="true" />
      <div className="task-edit-panel__header">
        <Pencil size={14} className="text-white/40" aria-hidden="true" />
        <span className="task-edit-panel__title">Editar tarefa</span>
        <Button variant="ghost" size="icon" className="ml-auto text-white/30 hover:text-white hover:bg-white/10" onClick={onClose} aria-label="Fechar painel">
          <X size={16} aria-hidden="true" />
        </Button>
      </div>
      {isLoadingDetail ? (
        <div className="flex flex-col gap-3 animate-pulse py-2" aria-label="Carregando detalhes">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
          <div className="h-3 w-2/3 rounded bg-white/5" />
          <div className="h-16 w-full rounded bg-white/5 mt-2" />
        </div>
      ) : (
        <>
          <p className="task-edit-panel__name">{task.titulo}</p>
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
            <Label className="task-field__label" htmlFor="edit-titulo">Título</Label>
            <Input id="edit-titulo" className="task-field__input" value={titulo} onChange={(e) => setTitulo(e.target.value)} disabled={isSaving} />
          </div>
          <div className="task-field">
            <Label className="task-field__label" htmlFor="edit-desc">Descrição</Label>
            <textarea id="edit-desc" className="task-field__textarea focus-visible:ring-2 focus-visible:ring-[#7c6ff7]" rows={4} placeholder="Descrição da tarefa..." value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={isSaving} />
          </div>
          <div className="flex gap-3">
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="edit-prioridade">Prioridade</Label>
              <select id="edit-prioridade" className="task-field__select" value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)} disabled={isSaving}>
                <option value="ALTA">Alta</option><option value="MEDIA">Média</option><option value="BAIXA">Baixo</option>
              </select>
            </div>
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="edit-status">Status</Label>
              <select id="edit-status" className="task-field__select" value={status} onChange={(e) => setStatus(e.target.value as StatusTarefa)} disabled={isSaving}>
                <option value="PENDENTE">Pendente</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDA">Concluído</option>
              </select>
            </div>
          </div>
          <div className="task-field">
            <Label className="task-field__label" htmlFor="edit-data">Data limite</Label>
            <Input id="edit-data" type="date" className="task-field__input" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} disabled={isSaving} />
          </div>
          <div className="task-edit-panel__meta">
            <div className="task-edit-panel__meta-row"><span>Criado em</span><span>{formatDate(task.criadoEm)}</span></div>
            {task.concluidaEm && <div className="task-edit-panel__meta-row"><span>Concluído em</span><span>{formatDate(task.concluidaEm)}</span></div>}
            <div className="task-edit-panel__meta-row"><span>Duração</span><span>{calcDuration()}</span></div>
          </div>
          <div className="task-edit-panel__actions">
            <Button variant="ghost" className="tasks-btn-cancel hover:bg-white/10" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button className="tasks-btn-save hover:bg-[#6a5fe0] active:bg-[#5c52cc]" onClick={() => void handleSave()} disabled={isSaving || !titulo.trim()}>{isSaving ? "Salvando…" : "Salvar"}</Button>
          </div>
          <Button variant="ghost" className="mt-3 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 justify-start gap-1 px-0" onClick={() => onRequestDelete(task.id)} disabled={isSaving} aria-label="Excluir tarefa">
            <Trash2 size={12} aria-hidden="true" /> Excluir tarefa
          </Button>
        </>
      )}
    </aside>
  )
}

/* ─── Main Page ────────────────────────────────────────────── */
const PAGE_SIZE = 9
type TabFilter = "todas" | "hoje" | "atrasadas" | "concluidas"

export function TasksPage() {
  const { tasks, isLoading, error, editTask, removeTask, search } = useTasksContext()
  const { task: detailedTask, isLoading: isLoadingDetail, fetchById, clear: clearDetail } = useTaskDetail()

  const [tab, setTab] = useState<TabFilter>("todas")
  const [priorityFilter, setPriorityFilter] = useState<Prioridade | "TODAS">("TODAS")
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedTaskBase = tasks.find((t) => t.id === selectedTaskId) ?? null
  const selectedTask = detailedTask ?? selectedTaskBase

  function selectTask(task: Task) {
    if (selectedTaskId === task.id) { setSelectedTaskId(null); clearDetail() }
    else { setSelectedTaskId(task.id); void fetchById(task.id) }
  }

  function closePanel() { setSelectedTaskId(null); clearDetail() }
  function requestDelete(id: string) { setDeleteTargetId(id); setMenuOpenId(null) }

  async function confirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)
    await removeTask(deleteTargetId)
    if (selectedTaskId === deleteTargetId) closePanel()
    setDeleteTargetId(null)
    setIsDeleting(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    let list = tasks
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((t) => t.titulo.toLowerCase().includes(q)) }
    if (tab === "concluidas") list = list.filter((t) => t.status === "CONCLUIDA")
    else if (tab === "hoje") list = list.filter((t) => { if (!t.dataLimite) return false; const d = parseDate(t.dataLimite); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
    else if (tab === "atrasadas") list = list.filter((t) => { if (!t.dataLimite || t.status === "CONCLUIDA") return false; const d = parseDate(t.dataLimite); d.setHours(0,0,0,0); return d.getTime() < today.getTime() })
    if (priorityFilter !== "TODAS") list = list.filter((t) => t.prioridade === priorityFilter)
    return list
  }, [tasks, search, tab, priorityFilter, today])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  function goToPage(p: number) { setCurrentPage(Math.min(Math.max(1, p), totalPages)) }
  function handleTabChange(t: TabFilter) { setTab(t); setCurrentPage(1) }
  async function handleToggleDone(task: Task) {
    const newStatus: StatusTarefa = task.status === "CONCLUIDA" ? "PENDENTE" : "CONCLUIDA"
    await editTask(task.id, { status: newStatus })
  }

  const countHoje = tasks.filter((t) => { if (!t.dataLimite) return false; const d = parseDate(t.dataLimite); d.setHours(0,0,0,0); return d.getTime() === today.getTime() }).length
  const countAtrasadas = tasks.filter((t) => { if (!t.dataLimite || t.status === "CONCLUIDA") return false; const d = parseDate(t.dataLimite); d.setHours(0,0,0,0); return d.getTime() < today.getTime() }).length
  const countConcluidas = tasks.filter((t) => t.status === "CONCLUIDA").length

  return (
    <>
      {/* Botão Nova Tarefa flutuante (acessível via topbar também) */}
      <section className="tasks-panel" aria-label="Lista de tarefas">
        {/* Tabs + filtro */}
        <div className="tasks-tabs">
          {(["todas", "hoje", "atrasadas", "concluidas"] as TabFilter[]).map((t) => {
            const labels: Record<TabFilter, string> = { todas: "Todas", hoje: "Hoje", atrasadas: "Atrasadas", concluidas: "Concluídas" }
            const counts: Record<TabFilter, number | null> = { todas: null, hoje: countHoje, atrasadas: countAtrasadas, concluidas: countConcluidas }
            return (
              <Button key={t} variant="ghost" className={cn("tasks-tab", tab === t && "tasks-tab--active")} onClick={() => handleTabChange(t)} aria-pressed={tab === t}>
                {t === "hoje" && <CalendarDays size={13} aria-hidden="true" />}
                {t === "atrasadas" && <X size={13} aria-hidden="true" />}
                {t === "concluidas" && <CheckCircle2 size={13} aria-hidden="true" />}
                {labels[t]}
                {counts[t] !== null && <span className="tasks-tab__badge">{counts[t]}</span>}
              </Button>
            )
          })}
          <div className="relative ml-auto flex items-center gap-2">
            <Button variant="ghost" className="tasks-filter hover:bg-white/10" onClick={() => setShowPriorityMenu((v) => !v)} aria-label="Filtrar por prioridade">
              Prioridade <ChevronRight size={13} className={cn("transition-transform", showPriorityMenu && "rotate-90")} aria-hidden="true" />
            </Button>
            {showPriorityMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#10122a] border border-white/10 rounded-lg py-1 z-10 w-36">
                {(["TODAS", "ALTA", "MEDIA", "BAIXA"] as const).map((p) => (
                  <Button key={p} variant="ghost" className={cn("flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-white/60 hover:bg-white/5", priorityFilter === p && "text-white bg-white/5")} onClick={() => { setPriorityFilter(p); setShowPriorityMenu(false); setCurrentPage(1) }}>
                    {priorityFilter === p && <Check size={12} aria-hidden="true" />}
                    {p === "TODAS" ? "Todas" : PRIORITY_LABEL[p]}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="tasks-table-wrapper">
        <div className="tasks-table__header">
          <span className="tasks-table__col-title">Tarefas <span className="text-white/30">{filtered.length}</span></span>
          <span className="tasks-table__col-priority">Prioridade</span>
          <span className="tasks-table__col-date">Prazo</span>
          <span className="tasks-table__col-actions flex items-center gap-1"><Trash2 size={13} aria-hidden="true" /><CheckCircle2 size={13} aria-hidden="true" /></span>
        </div>

        {isLoading && <div className="tasks-empty"><span className="tasks-empty__text">Carregando tarefas…</span></div>}
        {error && !isLoading && <div className="tasks-empty" role="alert" aria-live="polite"><span className="tasks-empty__text text-red-400">{error}</span></div>}
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
                <div className={cn("task-row hover:bg-white/5", selectedTaskId === task.id && "task-row--selected")} onClick={() => selectTask(task)} role="button" tabIndex={0} aria-pressed={selectedTaskId === task.id} onKeyDown={(e) => e.key === "Enter" && selectTask(task)}>
                  <button className={cn("task-row__check shrink-0", task.status === "CONCLUIDA" && "task-row__check--done")} onClick={(e) => { e.stopPropagation(); void handleToggleDone(task) }} aria-label={task.status === "CONCLUIDA" ? "Marcar como pendente" : "Marcar como concluída"}>
                    {task.status === "CONCLUIDA" && <Check size={10} className="text-white" aria-hidden="true" />}
                  </button>
                  <div className="task-row__info">
                    <span className={cn("task-row__title", task.status === "CONCLUIDA" && "task-row__title--done")}>{task.titulo}</span>
                    <span className="task-row__subtitle">{task.descricao ? task.descricao.length > 14 ? task.descricao.slice(0, 14) + "..." : task.descricao : "Sem descrição"}</span>
                  </div>
                  <div className="tasks-table__col-priority"><PriorityBadge prioridade={task.prioridade} /></div>
                  <div className="tasks-table__col-date">{formatDate(task.dataLimite)}</div>
                  <div className="tasks-table__col-actions flex justify-center relative">
                    <Button variant="ghost" size="icon" className="text-white/30 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#7c6ff7]" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === task.id ? null : task.id) }} aria-label="Mais opções" aria-haspopup="true" aria-expanded={menuOpenId === task.id}>
                      <MoreVertical size={15} aria-hidden="true" />
                    </Button>
                    {menuOpenId === task.id && (
                      <div className="absolute right-0 top-full mt-1 bg-[#10122a] border border-white/10 rounded-lg py-1 z-10 w-36">
                        <Button variant="ghost" className="flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-white/60 hover:bg-white/5" onClick={(e) => { e.stopPropagation(); selectTask(task); setMenuOpenId(null) }}>
                          <Pencil size={13} aria-hidden="true" /> Editar
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400" onClick={(e) => { e.stopPropagation(); requestDelete(task.id) }}>
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
        </div>{/* fim tasks-table-wrapper */}

        {/* Paginação */}
        {!isLoading && filtered.length > 0 && (
          <div className="tasks-pagination">
            <span className="tasks-pagination__info">Mostrando {Math.min((currentPage-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(currentPage*PAGE_SIZE, filtered.length)} de {filtered.length} tarefas</span>
            <div className="tasks-pagination__controls">
              <Button variant="ghost" size="icon" className="tasks-pagination__btn hover:bg-white/10 disabled:opacity-30" onClick={() => goToPage(currentPage-1)} disabled={currentPage===1} aria-label="Página anterior"><ChevronLeft size={14} aria-hidden="true" /></Button>
              {Array.from({ length: totalPages }, (_, i) => i+1).filter((p) => p===1 || p===totalPages || Math.abs(p-currentPage)<=1).reduce<(number|"…")[]>((acc, p, idx, arr) => { if (idx>0 && (p as number)-(arr[idx-1] as number)>1) acc.push("…"); acc.push(p); return acc }, []).map((p, idx) =>
                p === "…" ? <span key={`e-${idx}`} className="tasks-pagination__btn text-white/30">…</span> :
                <Button key={p} variant="ghost" size="icon" className={cn("tasks-pagination__btn", currentPage===p && "tasks-pagination__btn--active")} onClick={() => goToPage(p as number)} aria-label={`Página ${p}`} aria-current={currentPage===p ? "page" : undefined}>{p}</Button>
              )}
              <Button variant="ghost" size="icon" className="tasks-pagination__btn hover:bg-white/10 disabled:opacity-30" onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages} aria-label="Próxima página"><ChevronRight size={14} aria-hidden="true" /></Button>
            </div>
          </div>
        )}
      </section>

      {/* Painel lateral de edição */}
      {selectedTaskId && selectedTask && (
        <>
          {/* Overlay para fechar o drawer ao clicar fora — só abaixo de 1024px */}
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closePanel}
            aria-hidden="true"
          />
          <EditPanel key={selectedTaskId} task={selectedTask} isLoadingDetail={isLoadingDetail} onClose={closePanel}
            onSave={async (id, payload) => { await editTask(id, payload); void fetchById(id) }}
            onRequestDelete={requestDelete}
          />
        </>
      )}

      {/* Modals */}
      {deleteTargetId && (
        <ConfirmDeleteModal
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTargetId(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
