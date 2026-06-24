import { NavLink } from "react-router-dom";
import {
  Home,
  CheckSquare,
  FileText,
  BarChart2,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { TaskLipLogo } from "../ui/TaskLipLogo";

export function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__logo">
        <TaskLipLogo />
      </div>

      <nav className="dashboard-sidebar__nav">
        <ul className="dashboard-sidebar__menu">
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `dashboard-sidebar__link ${isActive ? "dashboard-sidebar__link--active" : ""}`
              }
            >
              <Home size={20} />
              Início
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/tarefas"
              className={({ isActive }) =>
                `dashboard-sidebar__link ${isActive ? "dashboard-sidebar__link--active" : ""}`
              }
            >
              <CheckSquare size={20} />
              Tarefas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/relatorios"
              className={({ isActive }) =>
                `dashboard-sidebar__link ${isActive ? "dashboard-sidebar__link--active" : ""}`
              }
            >
              <FileText size={20} />
              Relatórios
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/estatisticas"
              className={({ isActive }) =>
                `dashboard-sidebar__link ${isActive ? "dashboard-sidebar__link--active" : ""}`
              }
            >
              <BarChart2 size={20} />
              Estatísticas
            </NavLink>
          </li>
        </ul>

        <ul className="dashboard-sidebar__menu dashboard-sidebar__menu--bottom">
          <li>
            <NavLink
              to="/perfil"
              className={({ isActive }) =>
                `dashboard-sidebar__link ${isActive ? "dashboard-sidebar__link--active" : ""}`
              }
            >
              <User size={20} />
              Perfil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/configuracoes"
              className={({ isActive }) =>
                `dashboard-sidebar__link ${isActive ? "dashboard-sidebar__link--active" : ""}`
              }
            >
              <Settings size={20} />
              Configurações
            </NavLink>
          </li>
          <li>
            <button className="dashboard-sidebar__link">
              <LogOut size={20} />
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
