import { CalendarDate } from './../types/calendar';
import { CalendarItem } from '../types/calendarScreen';

export const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const getWeekStartDate = (date: Date): Date => {
  const startDate = new Date(date);
  const day = startDate.getDay();
  startDate.setDate(date.getDate() - day); // 일요일로 설정
  return startDate;
};

export const createWeekCalendarData = (weekStartDate: Date): CalendarDate[] => {
  const dates: CalendarDate[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);

    dates.push({
      date,
      isCurrentMonth: true, // 주 뷰에서는 모든 날짜가 활성화
    });
  }

  return dates;
};

export const createCalendarData = (date: Date): CalendarItem => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const lastDay = new Date(year, month, daysInMonth).getDay();

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

  const monthLabel = `${date.toLocaleString('default', {
    month: 'long',
    timeZone: 'Asia/Seoul',
  })} ${year}`;

  return { calendarDates: dates, monthLabel };
};
