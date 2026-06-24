import { useState, useMemo } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { SummaryWidget } from "../components/dashboard/SummaryWidget";
import { StatisticsChart } from "../components/dashboard/StatisticsChart";
import { TaskList } from "../components/dashboard/TaskList";
import { CalendarWidget } from "../components/dashboard/CalendarWidget";
import { useTasks } from "../hooks/useTasks";
import "./dashboard.css";

export default function DashboardPage() {
  const { tasks, isLoading, error, editTask, removeTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return tasks;
    return tasks.filter(
      (t) =>
        t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "CONCLUIDA").length;
  const pending = total - completed;

  const handleToggleTask = async (id: string, isDone: boolean) => {
    try {
      await editTask(id, { status: isDone ? "PENDENTE" : "CONCLUIDA" });
    } catch (err) {
      console.error("Erro ao alterar status da tarefa:", err);
    }
  };

  const handleCompleteAll = async () => {
    const pendingTasks = tasks.filter((t) => t.status !== "CONCLUIDA");
    // Em um cenário real com muitas tarefas, isso deveria ser uma rota de batch update
    for (const task of pendingTasks) {
      try {
        await editTask(task.id, { status: "CONCLUIDA" });
      } catch (err) {
        console.error("Erro ao completar tarefa", task.id, err);
      }
    }
  };

  const handleClearList = async () => {
    const confirm = window.confirm("Tem certeza que deseja excluir todas as tarefas concluídas?");
    if (!confirm) return;

    const completedTasks = tasks.filter((t) => t.status === "CONCLUIDA");
    for (const task of completedTasks) {
      try {
        await removeTask(task.id);
      } catch (err) {
        console.error("Erro ao excluir tarefa", task.id, err);
      }
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-main">
        <Header
          onSearch={setSearchTerm}
          onNewTaskClick={() => alert("Implementar modal de Nova Tarefa")}
        />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#5a4cf2] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white/50 text-sm">Carregando dashboard...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-rose-500 bg-rose-500/10 px-4 py-2 rounded-lg text-sm">{error}</span>
          </div>
        ) : (
          <div className="dashboard-grid">
            <SummaryWidget total={total} completed={completed} pending={pending} />
            <StatisticsChart tasks={tasks} />
            <TaskList
              tasks={filteredTasks}
              onToggleTask={handleToggleTask}
              onNewTaskClick={() => alert("Implementar modal de Nova Tarefa")}
              onCompleteAll={handleCompleteAll}
              onClearList={handleClearList}
            />
            <CalendarWidget />
          </div>
        )}
      </main>
    </div>
  );
}
