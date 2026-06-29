import { Flame, Check, Clock } from "lucide-react";

interface SummaryWidgetProps {
  total: number;
  completed: number;
  pending: number;
}

function CircularProgress({
  value,
  max,
  color,
  icon: Icon,
}: {
  value: number;
  max: number;
  color: string;
  icon: React.ElementType;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safeMax = max > 0 ? max : 1;
  const strokeDashoffset = circumference - (value / safeMax) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="6"
        />
        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <div
        className="absolute flex items-center justify-center w-12 h-12 rounded-full"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

export function SummaryWidget({ total, completed, pending }: SummaryWidgetProps) {
  return (
    <div className="dashboard-card dashboard-area-summary">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">
          <Flame size={18} className="text-white/60" /> Seu resumo
        </h2>
      </div>

      <div className="summary-widget">
        <div className="summary-item">
          <CircularProgress value={total} max={total} color="#7c6ff7" icon={Flame} />
          <div className="summary-item__info">
            <span className="summary-item__value">{total}</span>
            <span className="summary-item__label">Tarefas</span>
          </div>
        </div>

        <div className="summary-item">
          <CircularProgress value={completed} max={total} color="#10b981" icon={Check} />
          <div className="summary-item__info">
            <span className="summary-item__value">{completed}</span>
            <span className="summary-item__label">Concluídas</span>
          </div>
        </div>

        <div className="summary-item">
          <CircularProgress value={pending} max={total} color="#f59e0b" icon={Clock} />
          <div className="summary-item__info">
            <span className="summary-item__value">{pending}</span>
            <span className="summary-item__label">Pendentes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
