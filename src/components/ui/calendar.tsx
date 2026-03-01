"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  disabledDates?: Date[];
  minDate?: Date;
  availableDates?: Date[];
}

export function Calendar({ selectedDate, onSelectDate, disabledDates = [], minDate, availableDates }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const isDisabled = (date: Date) => {
    // Se availableDates estiver definido, apenas essas datas estão disponíveis
    if (availableDates && availableDates.length > 0) {
      const isAvailable = availableDates.some(
        (available) =>
          available.getFullYear() === date.getFullYear() &&
          available.getMonth() === date.getMonth() &&
          available.getDate() === date.getDate()
      );
      if (!isAvailable) return true;
    }

    // Verificar datas desabilitadas (agendamentos já existentes)
    return disabledDates.some(
      (disabled) =>
        disabled.getFullYear() === date.getFullYear() &&
        disabled.getMonth() === date.getMonth() &&
        disabled.getDate() === date.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isBeforeMinDate = (date: Date) => {
    if (!minDate) return false;
    const today = new Date(minDate);
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const generateDays = () => {
    const days = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDisabled(date) || isBeforeMinDate(date);
      const selected = isSelected(date);
      const today = isToday(date);

      days.push(
        <Button
          key={day}
          type="button"
          variant={selected ? "default" : "ghost"}
          size="icon"
          disabled={disabled}
          onClick={() => !disabled && onSelectDate(date)}
          className={cn(
            "h-10 w-10 font-normal text-cyan-400",
            selected && "bg-cyan-600 hover:bg-cyan-600 text-white",
            !selected && !disabled && "hover:bg-cyan-900 hover:text-cyan-400",
            disabled && "opacity-30 cursor-not-allowed",
            today && !selected && "border border-cyan-400 text-cyan-400"
          )}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 wh">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={previousMonth}
          className="h-8 w-8 hover:bg-cyan-900"
        >
          <ChevronLeft className="h-4 w-4 text-cyan-800" />
        </Button>
        <span className="text-white font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8 hover:bg-cyan-900"
        >
          <ChevronRight className="h-4 w-4 text-cyan-800" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="h-10 w-10 flex items-center justify-center bg-slate-900 rounded text-cyan-100/60 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {generateDays()}
      </div>
    </div>
  );
}
