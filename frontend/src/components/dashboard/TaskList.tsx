import { useState } from "react";
import { ListTodo, Plus, Check, AlertTriangle } from "lucide-react";
import { type Task } from "../../../service/task";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/routes"

function truncate(text: string, max = 20): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("T")[0].split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/* ── Confirm Clear Modal ────────────────────────────────────── */
interface ConfirmClearModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function ConfirmClearModal({ onConfirm, onCancel, isDeleting }: ConfirmClearModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar limpeza"
    >
      <div className="bg-[#10122a] border border-white/10 rounded-xl p-8 w-full max-w-sm flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-yellow-400/40 bg-yellow-400/10" aria-hidden="true">
          <AlertTriangle size={40} className="text-yellow-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Limpar lista</h2>
        <p className="text-sm text-white/60">• Confirmar exclusão de todas as tarefas concluídas?</p>
        <div className="flex gap-3 w-full mt-2">
          <button
            className="flex-1 h-10 rounded-lg border border-white/20 bg-transparent text-white text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-60"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo…" : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Task List ──────────────────────────────────────────────── */
interface TaskListProps {
  tasks: Task[];
  selectedDate: Date | null;
  onToggleTask: (id: string, isDone: boolean) => void;
  onNewTaskClick: () => void;
  onCompleteAll: () => void;
  onClearList: () => void;
}

export function TaskList({
  tasks,
  selectedDate,
  onToggleTask,
  onNewTaskClick,
  onCompleteAll,
  onClearList,
}: TaskListProps) {
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const displayed = selectedDate
    ? tasks.filter((t) => {
        if (!t.dataLimite) return false;
        return isSameDay(parseLocalDate(t.dataLimite), selectedDate);
      })
    : tasks;

  const title = selectedDate
    ? `Tarefas de ${format(selectedDate, "dd/MM", { locale: ptBR })}`
    : "Suas tarefas";

  async function handleConfirmClear() {
    setIsClearing(true);
    await onClearList();
    setIsClearing(false);
    setShowClearModal(false);
  }

  return (
    <>
      <div className="dashboard-card dashboard-area-tasks">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">
            <ListTodo size={18} className="text-white/60" /> {title}
            <span className="bg-white/10 text-white/80 px-2 py-0.5 rounded-md text-xs ml-2">
              {displayed.length}
            </span>
          </h2>
        </div>

        <div className="task-list__items overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
          {displayed.map((task) => {
            const isDone = task.status === "CONCLUIDA";
            return (
              <div key={task.id} className="task-item">
                <div className="task-item__left">
                  <button
                    className={`task-item__checkbox ${isDone ? "task-item__checkbox--done" : ""}`}
                    onClick={() => onToggleTask(task.id, isDone)}
                    aria-label={isDone ? "Marcar como pendente" : "Marcar como concluída"}
                  >
                    {isDone && <Check size={12} strokeWidth={3} />}
                  </button>
                  <div className="task-item__info">
                    <span className={`task-item__title ${isDone ? "task-item__title--done" : ""}`}>
                      {truncate(task.titulo)}
                    </span>
                    <span className="task-item__desc">{task.descricao ? task.descricao.length > 14 ? task.descricao.slice(0, 14) + "..." : task.descricao : "Sem descrição"}</span>
                  </div>
                </div>

                <div className="task-item__right">
                  <span className={`task-badge task-badge--${task.prioridade.toLowerCase()}`}>
                    {task.prioridade}
                  </span>
                  <span className="task-item__date">
                    {task.dataLimite
                      ? format(parseLocalDate(task.dataLimite), "d MMM", { locale: ptBR })
                      : "Sem data"}
                  </span>
                </div>
              </div>
            );
          })}
          {displayed.length === 0 && (
            <div className="text-center py-8 text-white/40 text-sm">
              {selectedDate ? "Nenhuma tarefa neste dia." : "Nenhuma tarefa encontrada."}
            </div>
          )}
        </div>

        <div className="task-list__footer mt-auto">
          <button className="task-list__footer-btn">
            <Link
              to={ROUTES.TASKS}
              className="login-page__cta-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
            >
              Ver todas
            </Link>
            </button>
          <button className="task-list__footer-btn text-[#10b981]" onClick={onCompleteAll}>
            Completar Todas
          </button>
          <button
            className="task-list__footer-btn text-rose-500"
            onClick={() => setShowClearModal(true)}
          >
            Limpar Lista
          </button>
        </div>
      </div>

      {showClearModal && (
        <ConfirmClearModal
          onConfirm={() => void handleConfirmClear()}
          onCancel={() => setShowClearModal(false)}
          isDeleting={isClearing}
        />
      )}
    </>
  );
}
