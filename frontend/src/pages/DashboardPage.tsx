import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/ui/Sidebar";
import { Header } from "../components/layout/Header";
import { SummaryWidget } from "../components/dashboard/SummaryWidget";
import { StatisticsChart } from "../components/dashboard/StatisticsChart";
import { TaskList } from "../components/dashboard/TaskList";
import { CalendarWidget } from "../components/dashboard/CalendarWidget";
import { useTasks } from "../hooks/useTasks";
import { ROUTES } from "../router/routes";
import "./dashboard.css";

function getUserName(): string {
  try {
    const raw = localStorage.getItem("accessToken") ?? "";
    const payload = JSON.parse(atob(raw.split(".")[1] ?? "e30="));
    return (payload.nome as string | undefined) ?? "Usuário";
  } catch {
    return "Usuário";
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, isLoading, error, editTask, removeTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    navigate(ROUTES.LOGIN, { replace: true });
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        !searchTerm ||
        t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "CONCLUIDA").length;
  const pending = total - completed;

  const handleToggleTask = async (id: string, isDone: boolean) => {
    await editTask(id, { status: isDone ? "PENDENTE" : "CONCLUIDA" });
  };

  const handleCompleteAll = async () => {
    for (const task of tasks.filter((t) => t.status !== "CONCLUIDA")) {
      await editTask(task.id, { status: "CONCLUIDA" });
    }
  };

  const handleClearList = async () => {
    for (const task of tasks.filter((t) => t.status === "CONCLUIDA")) {
      await removeTask(task.id);
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar userName={getUserName()} activePage="dashboard" onLogout={handleLogout} />

      <main className="dashboard-main">
        <Header
          tasks={tasks}
          onSearch={setSearchTerm}
          onNewTaskClick={() => navigate(ROUTES.TASKS)}
        />

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#5a4cf2] border-t-transparent rounded-full animate-spin" />
              <span className="text-white/50 text-sm">Carregando dashboard...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-rose-500 bg-rose-500/10 px-4 py-2 rounded-lg text-sm">
              {error}
            </span>
          </div>
        ) : (
          <div className="dashboard-grid">
            <SummaryWidget total={total} completed={completed} pending={pending} />
            <StatisticsChart tasks={tasks} />
            <TaskList
              tasks={filteredTasks}
              selectedDate={selectedDate}
              onToggleTask={handleToggleTask}
              onNewTaskClick={() => navigate(ROUTES.TASKS)}
              onCompleteAll={handleCompleteAll}
              onClearList={handleClearList}
            />
            <CalendarWidget
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        )}
      </main>
    </div>
  );
}
