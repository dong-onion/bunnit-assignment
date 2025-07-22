import { useState, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { CalendarItem, ScrollEvent } from '../types/calendarScreen';
import { deviceInfo } from '../utils/util';
import { createCalendarData } from '../utils/date';

const { width } = deviceInfo;

export const useInfiniteCalendar = (initialMonth: Date) => {
  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(1);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // 초기 데이터 설정 (이전달, 현재달, 다음달)
  const [data, setData] = useState<CalendarItem[]>(() => {
    const prev = new Date(initialMonth.getFullYear(), initialMonth.getMonth() - 1, 1);
    const current = initialMonth;
    const next = new Date(initialMonth.getFullYear(), initialMonth.getMonth() + 1, 1);

    return [createCalendarData(prev), createCalendarData(current), createCalendarData(next)];
  });

  const updateCurrentMonth = useCallback((dataArray: CalendarItem[], index: number) => {
    const currentDate = new Date(
      dataArray[index].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
    );
    setCurrentMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, []);

  const addPrevMonthData = useCallback(() => {
    const firstDate = new Date(
      data[0].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
    );
    const prevDate = new Date(firstDate.getFullYear(), firstDate.getMonth() - 1, 1);
    const prevCalendarData = createCalendarData(prevDate);
    const newData = [prevCalendarData, ...data];
    setData(newData);
    return newData;
  }, [data]);

  const addNextMonthData = useCallback(() => {
    const lastDate = new Date(
      data[data.length - 1].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
    );
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
    const nextCalendarData = createCalendarData(nextDate);
    const newData = [...data, nextCalendarData];
    setData(newData);
    return newData;
  }, [data]);

  const onScrollEnd = useCallback(
    (e: ScrollEvent) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);

      if (newIndex === 0) {
        // 맨 앞 → 앞에 아이템 추가
        const newData = addPrevMonthData();
        currentIndex.current = newIndex + 1;

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: currentIndex.current, animated: false });
        }, 0);

        updateCurrentMonth(newData, currentIndex.current);
      } else if (newIndex === data.length - 1) {
        // 맨 뒤 → 뒤에 아이템 추가
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

      // 맨 앞으로 이동하는 경우 새 데이터 추가
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

      // 맨 뒤로 이동하는 경우 새 데이터 추가
      if (newIndex === data.length - 1) {
        const lastDate = new Date(
          data[data.length - 1].calendarDates.find((item) => item.isCurrentMonth)?.date ||
            new Date(),
        );
        const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
        const nextCalendarData = createCalendarData(nextDate);

        const newData = [...data, nextCalendarData];
        setData(newData);
      }

      currentIndex.current = newIndex;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });

      // currentMonth 상태 업데이트
      const currentDate = new Date(
        data[newIndex].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
      );
      setCurrentMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }
  }, [data]);

  const goToSpecificMonth = useCallback(
    (targetMonth: Date) => {
      // 현재 데이터에서 해당 월이 있는지 확인
      const targetIndex = data.findIndex((item) => {
        const itemDate = new Date(
          item.calendarDates.find((date) => date.isCurrentMonth)?.date || new Date(),
        );
        return (
          itemDate.getFullYear() === targetMonth.getFullYear() &&
          itemDate.getMonth() === targetMonth.getMonth()
        );
      });

      if (targetIndex !== -1) {
        // 해당 월이 이미 데이터에 있으면 스크롤
        currentIndex.current = targetIndex;
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
        updateCurrentMonth(data, targetIndex);
      } else {
        // 해당 월이 없으면 새로 생성해서 이동
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
    onScrollEnd,
    goToPrev,
    goToNext,
    goToSpecificMonth,
  };
};
