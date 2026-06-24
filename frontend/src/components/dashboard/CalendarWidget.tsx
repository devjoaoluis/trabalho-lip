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

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      days.push(
        <button
          key={day.toString()}
          onClick={() => setSelectedDate(cloneDay)}
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors
            ${!isSameMonth(day, monthStart) ? "text-white/20" : "text-white/80 hover:bg-white/10"}
            ${isSameDay(day, selectedDate) ? "bg-[#5a4cf2] text-white hover:bg-[#6c5ef7]" : ""}
          `}
        >
          {formattedDate}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="flex justify-between w-full mt-2" key={day.toString()}>
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
      </div>

      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2 text-sm font-medium">
          <span className="capitalize">{format(currentDate, "MMM", { locale: ptBR })}</span>
          <span>{format(currentDate, "yyyy")}</span>
        </div>
        <button onClick={nextMonth} className="text-white/60 hover:text-white transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-between w-full mb-2 px-1">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="w-8 text-center text-xs text-white/40 font-medium">
            {d}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col">{rows}</div>
    </div>
  );
}
