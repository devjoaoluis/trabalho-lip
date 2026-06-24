import { useState, useRef, useEffect } from "react";
import { Search, Plus, Bell, Clock, Check, Flame } from "lucide-react";

interface HeaderProps {
  onSearch: (term: string) => void;
  onNewTaskClick: () => void;
}

export function Header({ onSearch, onNewTaskClick }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__search-container">
        <Search className="dashboard-header__search-icon" size={18} />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          className="dashboard-header__search-input"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="dashboard-header__actions">
        <button className="dashboard-header__new-btn" onClick={onNewTaskClick}>
          <Plus size={18} />
          Nova Tarefa
        </button>

        <div className="dashboard-header__notifications-wrapper" ref={notificationsRef}>
          <button
            className="dashboard-header__bell-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={20} />
            <span className="dashboard-header__bell-badge">1</span>
          </button>

          {isNotificationsOpen && (
            <div className="dashboard-notifications">
              <div className="dashboard-notifications__header">
                <h3>Notificações</h3>
              </div>
              <ul className="dashboard-notifications__list">
                <li className="dashboard-notifications__item">
                  <div className="dashboard-notifications__icon dashboard-notifications__icon--warning">
                    <Clock size={16} />
                  </div>
                  <div className="dashboard-notifications__content">
                    <p>O item #000 está atrasado</p>
                    <a href="#" className="dashboard-notifications__link">
                      Ver tarefa &rarr;
                    </a>
                  </div>
                  <span className="dashboard-notifications__time">há 15 dias</span>
                </li>

                <li className="dashboard-notifications__item">
                  <div className="dashboard-notifications__icon dashboard-notifications__icon--success">
                    <Check size={16} />
                  </div>
                  <div className="dashboard-notifications__content">
                    <p>Você concluiu o item #000</p>
                    <a href="#" className="dashboard-notifications__link">
                      Ver tarefa &rarr;
                    </a>
                  </div>
                </li>

                <li className="dashboard-notifications__item">
                  <div className="dashboard-notifications__icon dashboard-notifications__icon--info">
                    <Flame size={16} />
                  </div>
                  <div className="dashboard-notifications__content">
                    <p>Uma nova tarefa foi atribuída</p>
                    <a href="#" className="dashboard-notifications__link">
                      Ver tarefa &rarr;
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
