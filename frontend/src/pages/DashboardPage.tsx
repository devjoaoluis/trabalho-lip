import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SummaryWidget } from "../components/dashboard/SummaryWidget";
import { StatisticsChart } from "../components/dashboard/StatisticsChart";
import { TaskList } from "../components/dashboard/TaskList";
import { CalendarWidget } from "../components/dashboard/CalendarWidget";
import { useTasksContext } from "../contexts/TasksContext";
import { isSameDay } from "date-fns";
import { ROUTES } from "../router/routes";
import "./dashboard.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, isLoading, error, editTask, removeTask, search } = useTasksContext();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "CONCLUIDA").length;
  const pending = total - completed;

  const filteredTasks = useMemo(() => {
    let list = tasks;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.titulo.toLowerCase().includes(q));
    }

    if (selectedDate) {
      list = list.filter((t) => {
        if (!t.dataLimite) return false;
        const parts = t.dataLimite.split("T")[0].split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return isSameDay(d, selectedDate);
      });
    }

    return list;
  }, [tasks, search, selectedDate]);

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
    <div className="dashboard-panel">
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
    </div>
  );
}
