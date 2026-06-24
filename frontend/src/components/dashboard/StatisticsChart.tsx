import { BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import  type { Task } from "../../../service/task";
import { format, subDays, isSameDay, parseISO } from "date-fns";

interface StatisticsChartProps {
  tasks: Task[];
}

export function StatisticsChart({ tasks }: StatisticsChartProps) {
  // Generate data for the last 7 days
  const data = Array.from({ length: 7 })
    .map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayTasks = tasks.filter((t) => t.createdAt && isSameDay(parseISO(t.createdAt), date));
      
      const concluidas = dayTasks.filter((t) => t.status === "Concluída").length;
      const pendentes = dayTasks.filter((t) => t.status !== "Concluída").length;

      return {
        name: format(date, "d/MM"),
        Concluídas: concluidas,
        Pendentes: pendentes,
      };
    });

  return (
    <div className="dashboard-card dashboard-area-stats">
      <div className="dashboard-card__header mb-2">
        <h2 className="dashboard-card__title">
          <BarChart2 size={18} className="text-white/60" /> Estatísticas
        </h2>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
              contentStyle={{ backgroundColor: "#1a1c31", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#fff" }}
            />
            <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }} align="right" verticalAlign="top" />
            <Bar dataKey="Concluídas" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} />
            <Bar dataKey="Pendentes" fill="#f59e0b" radius={[2, 2, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
