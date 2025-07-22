import { useState, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { CalendarDate, ScrollEvent } from '../types/calendar';
import {
  createInitialWeekData,
  addPrevWeekToData,
  addNextWeekToData,
  updateCurrentWeekFromData,
} from '../utils/util';
import { getWeekStartDate } from '../utils/date';

export const useInfiniteWeekCalendar = () => {
  const weekFlatListRef = useRef<FlatList>(null);
  const currentWeekIndex = useRef(1);
  const [currentWeek, setCurrentWeek] = useState<Date | null>(null);
  const [weekData, setWeekData] = useState<CalendarDate[][]>([]);

  const initializeWeekData = useCallback((baseDate: Date) => {
    const weekStart = getWeekStartDate(baseDate);
    const initialWeekData = createInitialWeekData(weekStart);

    setCurrentWeek(weekStart);
    setWeekData(initialWeekData);
    currentWeekIndex.current = 1;

    return weekStart;
  }, []);

  const updateCurrentWeek = useCallback((weekDataArray: CalendarDate[][], index: number) => {
    const result = updateCurrentWeekFromData(weekDataArray, index);
    if (result) {
      setCurrentWeek(result.weekStartDate);
      return result.newMonth;
    }
    return null;
  }, []);

  const addPrevWeekData = useCallback(() => {
    const newWeekData = addPrevWeekToData(weekData);
    setWeekData(newWeekData);
    return newWeekData;
  }, [weekData]);

  const addNextWeekData = useCallback(() => {
    const newWeekData = addNextWeekToData(weekData);
    setWeekData(newWeekData);
    return newWeekData;
  }, [weekData]);

  const onWeekScrollEnd = useCallback(
    (e: ScrollEvent, width: number, onMonthChange: (month: Date) => void) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);

      if (newIndex === 0) {
        const newWeekData = addPrevWeekData();
        currentWeekIndex.current = newIndex + 1;

        setTimeout(() => {
          weekFlatListRef.current?.scrollToIndex({
            index: currentWeekIndex.current,
            animated: false,
          });
        }, 0);

        const newMonth = updateCurrentWeek(newWeekData, currentWeekIndex.current);
        if (newMonth) onMonthChange(newMonth);
      } else if (newIndex === weekData.length - 1) {
        addNextWeekData();
        currentWeekIndex.current = newIndex;
        const newMonth = updateCurrentWeek(weekData, newIndex);
        if (newMonth) onMonthChange(newMonth);
      } else {
        currentWeekIndex.current = newIndex;
        const newMonth = updateCurrentWeek(weekData, newIndex);
        if (newMonth) onMonthChange(newMonth);
      }
    },
    [weekData, addPrevWeekData, addNextWeekData, updateCurrentWeek],
  );

  const goToPrevWeek = useCallback(
    (onMonthChange: (month: Date) => void) => {
      if (currentWeekIndex.current > 0) {
        const newIndex = currentWeekIndex.current - 1;

        if (newIndex === 0) {
          const newWeekData = addPrevWeekData();
          currentWeekIndex.current = newIndex + 1;

          setTimeout(() => {
            weekFlatListRef.current?.scrollToIndex({
              index: currentWeekIndex.current,
              animated: false,
            });
          }, 0);

          const newMonth = updateCurrentWeek(newWeekData, currentWeekIndex.current);
          if (newMonth) onMonthChange(newMonth);
        } else {
          currentWeekIndex.current = newIndex;
          weekFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
          const newMonth = updateCurrentWeek(weekData, newIndex);
          if (newMonth) onMonthChange(newMonth);
        }
      }
    },
    [weekData, addPrevWeekData, updateCurrentWeek],
  );

  const goToNextWeek = useCallback(
    (onMonthChange: (month: Date) => void) => {
      if (currentWeekIndex.current < weekData.length - 1) {
        const newIndex = currentWeekIndex.current + 1;

        if (newIndex === weekData.length - 1) {
          addNextWeekData();
        }

        currentWeekIndex.current = newIndex;
        weekFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        const newMonth = updateCurrentWeek(weekData, newIndex);
        if (newMonth) onMonthChange(newMonth);
      }
    },
    [weekData, addNextWeekData, updateCurrentWeek],
  );

  const resetWeekData = useCallback(() => {
    setCurrentWeek(null);
    setWeekData([]);
  }, []);

  return {
    weekFlatListRef,
    currentWeek,
    weekData,
    currentWeekIndex,
    initializeWeekData,
    onWeekScrollEnd,
    goToPrevWeek,
    goToNextWeek,
    resetWeekData,
  };
};
