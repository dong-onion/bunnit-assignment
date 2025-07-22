import { useState, useCallback, useMemo } from 'react';
import { runOnJS } from 'react-native-reanimated';
import { isSameDate } from '../utils/date';
import { findMonthInData } from '../utils/util';
import { CalendarItem } from '../types/calendar';

type CalendarViewType = 'month' | 'week';

interface UseCalendarViewProps {
  initialMonth: Date;
  today: Date;
  currentMonth: Date;
  data: CalendarItem[];
  currentIndex: React.MutableRefObject<number>;
  flatListRef: React.RefObject<any>;
  updateCurrentMonth: (dataArray: CalendarItem[], index: number) => void;
  initializeWeekData: (baseDate: Date) => Date;
  resetWeekData: () => void;
  currentWeek: Date | null;
  weekData: any[][];
  currentWeekIndex: React.MutableRefObject<number>;
}

export const useCalendarView = ({
  initialMonth,
  today,
  currentMonth,
  data,
  currentIndex,
  flatListRef,
  updateCurrentMonth,
  initializeWeekData,
  resetWeekData,
  currentWeek,
  weekData,
  currentWeekIndex,
}: UseCalendarViewProps) => {
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDatePress = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const isDateSelected = useCallback(
    (date: Date) => {
      return selectedDate ? isSameDate(date, selectedDate) : false;
    },
    [selectedDate],
  );

  const switchToWeekView = useCallback(
    (targetDate?: Date) => {
      let baseDate: Date;

      if (targetDate && targetDate instanceof Date && !isNaN(targetDate.getTime())) {
        baseDate = targetDate;
      } else {
        const isInitialMonth =
          currentMonth.getFullYear() === initialMonth.getFullYear() &&
          currentMonth.getMonth() === initialMonth.getMonth();

        if (isInitialMonth) {
          baseDate = today;
        } else {
          baseDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        }
      }

      try {
        initializeWeekData(baseDate);
        setViewType('week');
      } catch (error) {
        console.error('Error switching to week view:', error);
        // 에러 발생 시 today를 기준으로 재시도
        initializeWeekData(today);
        setViewType('week');
      }
    },
    [currentMonth, initialMonth, today, initializeWeekData],
  );

  const switchToMonthView = useCallback(
    (onMonthChange?: (month: Date) => void) => {
      if (currentWeek && currentWeek instanceof Date && !isNaN(currentWeek.getTime())) {
        const targetDate = selectedDate || currentWeek;

        if (targetDate && targetDate instanceof Date && !isNaN(targetDate.getTime())) {
          const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);

          const targetIndex = findMonthInData(data, targetMonth);

          if (targetIndex === -1 && onMonthChange) {
            onMonthChange(targetMonth);
          } else if (targetIndex !== -1) {
            currentIndex.current = targetIndex;
            flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
            updateCurrentMonth(data, targetIndex);
          }
        }
      }

      setViewType('month');
      resetWeekData();
    },
    [currentWeek, selectedDate, data, currentIndex, flatListRef, updateCurrentMonth, resetWeekData],
  );

  const onSwipeUp = useCallback(() => {
    'worklet';
    const targetDate = selectedDate || undefined;
    runOnJS(switchToWeekView)(targetDate);
  }, [switchToWeekView, selectedDate]);

  const onSwipeDown = useCallback(
    (onMonthChange?: (month: Date) => void) => {
      'worklet';
      runOnJS(switchToMonthView)(onMonthChange);
    },
    [switchToMonthView],
  );

  const currentLabel = useMemo(() => {
    if (viewType === 'month') {
      return `${currentMonth.toLocaleString('default', {
        month: 'long',
        timeZone: 'Asia/Seoul',
      })} ${currentMonth.getFullYear()}`;
    } else {
      return weekData.length > 0 &&
        weekData[currentWeekIndex.current] &&
        weekData[currentWeekIndex.current].length > 0
        ? `${weekData[currentWeekIndex.current][0].date.toLocaleString('default', {
            month: 'long',
            timeZone: 'Asia/Seoul',
          })} ${weekData[currentWeekIndex.current][0].date.getFullYear()}`
        : '';
    }
  }, [viewType, currentMonth, weekData, currentWeekIndex]);

  return {
    viewType,
    selectedDate,
    handleDatePress,
    isDateSelected,
    switchToWeekView,
    switchToMonthView,
    onSwipeUp,
    onSwipeDown,
    currentLabel,
  };
};
