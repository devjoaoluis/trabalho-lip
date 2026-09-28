import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarWidgetProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export function CalendarWidget({ selectedDate, onSelectDate }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows = [];
  let days: React.ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);
      const isSelected = selectedDate ? isSameDay(cloneDay, selectedDate) : false;
      const isToday = isSameDay(cloneDay, new Date());
      const inMonth = isSameMonth(cloneDay, monthStart);

      days.push(
        <button
          key={cloneDay.toISOString()}
          onClick={() => {
            // Toggle: click same day again to clear filter
            if (selectedDate && isSameDay(cloneDay, selectedDate)) {
              onSelectDate(null);
            } else {
              onSelectDate(cloneDay);
            }
          }}
          className={[
            "flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors",
            !inMonth ? "text-white/20 cursor-default" : "text-white/80 hover:bg-white/10 cursor-pointer",
            isSelected ? "!bg-[#5a4cf2] !text-white hover:!bg-[#6c5ef7]" : "",
            isToday && !isSelected ? "ring-1 ring-[#7c6ff7]/60" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={format(cloneDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          aria-pressed={isSelected}
          disabled={!inMonth}
        >
          {format(cloneDay, "d")}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="flex justify-between w-full mt-2" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="dashboard-card dashboard-area-calendar">
      <div className="dashboard-card__header mb-4">
        <h2 className="dashboard-card__title">
          <CalendarIcon size={18} className="text-white/60" /> Calendário
        </h2>
        {selectedDate && (
          <button
            className="text-xs text-[#7c6ff7] hover:underline"
            onClick={() => onSelectDate(null)}
            aria-label="Limpar filtro de data"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {selectedDate && (
        <p className="text-xs text-[#7c6ff7] mb-3">
          Filtrando: {format(selectedDate, "dd/MM/yyyy")}
        </p>
      )}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2 text-sm font-medium">
          <span className="capitalize">
            {format(currentDate, "MMM", { locale: ptBR })}
          </span>
          <span>{format(currentDate, "yyyy")}</span>
        </div>
        <button
          onClick={nextMonth}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-between w-full mb-2 px-1">
        {daysOfWeek.map((d, i) => (
          <div
            key={i}
            className="w-8 text-center text-xs text-white/40 font-medium"
            aria-hidden="true"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="flex flex-col">{rows}</div>
    </div>
  );
}
