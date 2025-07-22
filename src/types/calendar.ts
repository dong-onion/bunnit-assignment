export type CalendarViewType = 'month' | 'week';

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
}

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
