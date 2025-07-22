import { useState, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { CalendarItem, ScrollEvent } from '../types/calendar';
import {
  createInitialMonthData,
  addPrevMonthToData,
  addNextMonthToData,
  updateCurrentMonthFromData,
  findMonthInData,
} from '../utils/util';
import { createCalendarData } from '../utils/date';

export const useInfiniteMonthCalendar = (initialMonth: Date) => {
  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(1);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [data, setData] = useState<CalendarItem[]>(() => createInitialMonthData(initialMonth));

  const updateCurrentMonth = useCallback((dataArray: CalendarItem[], index: number) => {
    const newMonth = updateCurrentMonthFromData(dataArray, index);
    setCurrentMonth(newMonth);
  }, []);

  const addPrevMonthData = useCallback(() => {
    const newData = addPrevMonthToData(data);
    setData(newData);
    return newData;
  }, [data]);

  const addNextMonthData = useCallback(() => {
    const newData = addNextMonthToData(data);
    setData(newData);
    return newData;
  }, [data]);

  const onScrollEnd = useCallback(
    (e: ScrollEvent, width: number) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);

      if (newIndex === 0) {
        const newData = addPrevMonthData();
        currentIndex.current = newIndex + 1;

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: currentIndex.current, animated: false });
        }, 0);

        updateCurrentMonth(newData, currentIndex.current);
      } else if (newIndex === data.length - 1) {
        addNextMonthData();
        currentIndex.current = newIndex;
        updateCurrentMonth(data, newIndex);
      } else {
        currentIndex.current = newIndex;
        updateCurrentMonth(data, newIndex);
      }
    },
    [data, addPrevMonthData, addNextMonthData, updateCurrentMonth],
  );

  const goToPrev = useCallback(() => {
    if (currentIndex.current > 0) {
      const newIndex = currentIndex.current - 1;

      if (newIndex === 0) {
        const newData = addPrevMonthData();
        currentIndex.current = newIndex + 1;

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: currentIndex.current, animated: false });
        }, 0);

        updateCurrentMonth(newData, currentIndex.current);
      } else {
        currentIndex.current = newIndex;
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        updateCurrentMonth(data, newIndex);
      }
    }
  }, [data, addPrevMonthData, updateCurrentMonth]);

  const goToNext = useCallback(() => {
    if (currentIndex.current < data.length - 1) {
      const newIndex = currentIndex.current + 1;

      if (newIndex === data.length - 1) {
        addNextMonthData();
      }

      currentIndex.current = newIndex;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      updateCurrentMonth(data, newIndex);
    }
  }, [data, addNextMonthData, updateCurrentMonth]);

  const goToSpecificMonth = useCallback(
    (targetMonth: Date) => {
      const targetIndex = findMonthInData(data, targetMonth);

      if (targetIndex !== -1) {
        currentIndex.current = targetIndex;
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
        updateCurrentMonth(data, targetIndex);
      } else {
        const newCalendarData = createCalendarData(targetMonth);
        const newData = [newCalendarData];
        setData(newData);
        currentIndex.current = 0;
        setCurrentMonth(targetMonth);

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 0, animated: false });
        }, 0);
      }
    },
    [data, updateCurrentMonth],
  );

  return {
    flatListRef,
    data,
    currentMonth,
    setCurrentMonth,
    currentIndex,
    onScrollEnd,
    goToPrev,
    goToNext,
    goToSpecificMonth,
    updateCurrentMonth,
  };
};
