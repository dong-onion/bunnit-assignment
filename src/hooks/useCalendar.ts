import { useMemo } from 'react';
import { CalendarDate } from '../types/calendarDate';

export function useCalendar(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDates: CalendarDate[] = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 이번달 1일의 요일
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이번달 일수
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // 지난달 일수
    const lastDay = new Date(year, month, daysInMonth).getDay(); // 이반달 막일의 요일

    const dates: CalendarDate[] = [];

    // 이전 달 날짜
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // 다음 달 날짜
    const remaining = 6 - lastDay;
    for (let i = 1; i <= remaining; i++) {
      dates.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return dates;
  }, [year, month]);

  const monthLabel = `${currentDate.toLocaleString('default', {
    month: 'long',
    timeZone: 'Asia/Seoul',
  })} ${year}`;

  return { calendarDates, monthLabel };
}
