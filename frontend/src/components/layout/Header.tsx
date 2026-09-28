import { Search, Plus } from "lucide-react";
import { NotificationBell } from "#components/ui/NotificationBell";
import type { Task } from "../../../service/task";

interface HeaderProps {
  tasks: Task[];
  onSearch: (term: string) => void;
  onNewTaskClick: () => void;
}

export function Header({ tasks, onSearch, onNewTaskClick }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__search-container">
        <Search className="dashboard-header__search-icon" size={18} aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          className="dashboard-header__search-input"
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Buscar tarefas"
        />
      </div>

      <div className="dashboard-header__actions">
        <button className="dashboard-header__new-btn" onClick={onNewTaskClick}>
          <Plus size={18} aria-hidden="true" />
          Nova Tarefa
        </button>

        <NotificationBell tasks={tasks} variant="dashboard" />
      </div>
    </header>
  );
}
