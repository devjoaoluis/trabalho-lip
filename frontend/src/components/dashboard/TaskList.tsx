import { ListTodo, Plus, Check } from "lucide-react";
import { type Task } from "../../../service/task";
import { format, parseISO } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string, isDone: boolean) => void;
  onNewTaskClick: () => void;
  onCompleteAll: () => void;
  onClearList: () => void;
}

export function TaskList({ tasks, onToggleTask, onNewTaskClick, onCompleteAll, onClearList }: TaskListProps) {
  return (
    <div className="dashboard-card dashboard-area-tasks">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">
          <ListTodo size={18} className="text-white/60" /> Suas tarefas
          <span className="bg-white/10 text-white/80 px-2 py-0.5 rounded-md text-xs ml-2">
            {tasks.length}
          </span>
        </h2>
        <div className="task-list__header-actions">
          <button className="task-list__add-btn" onClick={onNewTaskClick}>
            <Plus size={14} /> Adicionar nova tarefa
          </button>
        </div>
      </div>

      <div className="task-list__items overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
        {tasks.map((task) => {
          const isDone = task.status === "CONCLUIDA";
          return (
            <div key={task.id} className="task-item">
              <div className="task-item__left">
                <button
                  className={`task-item__checkbox ${isDone ? "task-item__checkbox--done" : ""}`}
                  onClick={() => onToggleTask(task.id, isDone)}
                >
                  {isDone && <Check size={12} strokeWidth={3} />}
                </button>
                <div className="task-item__info">
                  <span className={`task-item__title ${isDone ? "task-item__title--done" : ""}`}>
                    {task.titulo}
                  </span>
                  <span className="task-item__desc">
                    {task.descricao || "Sem descrição"}
                  </span>
                </div>
              </div>

              <div className="task-item__right">
                <span className={`task-badge task-badge--${task.prioridade.toLowerCase()}`}>
                  {task.prioridade}
                </span>
                <span className="task-item__date">
                  {task.dataLimite ? format(parseISO(task.dataLimite), "d MMM HH:mm") : "Sem data"}
                </span>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">
            Nenhuma tarefa encontrada.
          </div>
        )}
      </div>

      <div className="task-list__footer mt-auto">
        <button className="task-list__footer-btn">Ver todas</button>
        <button className="task-list__footer-btn text-[#10b981]" onClick={onCompleteAll}>
          Completar Todas
        </button>
        <button className="task-list__footer-btn text-rose-500" onClick={onClearList}>
          Limpar Lista
        </button>
      </div>
    </div>
  );
}
