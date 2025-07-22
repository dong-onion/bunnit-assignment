import { CalendarDate } from './calendar';

export type CalendarViewType = 'month' | 'week';

export interface CalendarItem {
  calendarDates: CalendarDate[];
  monthLabel: string;
}

export interface ScrollEvent {
  nativeEvent: {
    contentOffset: {
      x: number;
    };
  };
}

export interface CalendarState {
  viewType: CalendarViewType;
  currentWeek?: Date;
  selectedDate: Date | null;
}
