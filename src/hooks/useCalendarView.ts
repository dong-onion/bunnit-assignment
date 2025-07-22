import { useState, useCallback } from 'react';
import { runOnJS } from 'react-native-reanimated';
import { CalendarViewType } from '../types/calendarScreen';
import { CalendarDate } from '../types/calendar';
import { getWeekStartDate, createWeekCalendarData, isSameDate } from '../utils/date';

export const useCalendarView = (initialMonth: Date) => {
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentWeek, setCurrentWeek] = useState<Date | null>(null);
  const [weekData, setWeekData] = useState<CalendarDate[]>([]);
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

  const switchToWeekView = useCallback((targetDate?: Date) => {
    const baseDate = targetDate || new Date();
    const weekStart = getWeekStartDate(baseDate);
    const weekDates = createWeekCalendarData(weekStart);

    setCurrentWeek(weekStart);
    setWeekData(weekDates);
    setViewType('week');
  }, []);

  const switchToMonthView = useCallback(
    (onMonthChange?: (month: Date) => void) => {
      // 현재 주가 있다면 해당 주의 첫 번째 날짜로부터 월 계산
      if (currentWeek && onMonthChange) {
        const monthDate = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1);
        onMonthChange(monthDate);
      }

      setViewType('month');
      setCurrentWeek(null);
      setWeekData([]);
    },
    [currentWeek],
  );

  // Gesture Handler에서 호출할 함수들
  const onSwipeUp = useCallback(() => {
    'worklet';
    runOnJS(switchToWeekView)();
  }, [switchToWeekView]);

  const onSwipeDown = useCallback(
    (onMonthChange?: (month: Date) => void) => {
      'worklet';
      runOnJS(switchToMonthView)(onMonthChange);
    },
    [switchToMonthView],
  );

  const goToPrevWeek = useCallback(() => {
    if (currentWeek) {
      const prevWeek = new Date(currentWeek);
      prevWeek.setDate(currentWeek.getDate() - 7);
      const weekDates = createWeekCalendarData(prevWeek);

      setCurrentWeek(prevWeek);
      setWeekData(weekDates);
    }
  }, [currentWeek]);

  const goToNextWeek = useCallback(() => {
    if (currentWeek) {
      const nextWeek = new Date(currentWeek);
      nextWeek.setDate(currentWeek.getDate() + 7);
      const weekDates = createWeekCalendarData(nextWeek);

      setCurrentWeek(nextWeek);
      setWeekData(weekDates);
    }
  }, [currentWeek]);

  return {
    viewType,
    currentWeek,
    weekData,
    selectedDate,
    switchToWeekView,
    switchToMonthView,
    onSwipeUp,
    onSwipeDown,
    goToPrevWeek,
    goToNextWeek,
    handleDatePress,
    isDateSelected,
  };
};
