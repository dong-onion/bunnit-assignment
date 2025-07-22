import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import CalendarHeader from './components/CalendarHeader';
import CalendarDay from './components/CalendarDay';

import {
  createCalendarData,
  createWeekCalendarData,
  getWeekStartDate,
  isSameDate,
} from '../../utils/date';
import type { CalendarItem, CalendarDate, ScrollEvent } from '../../types/calendar';
import colors from '../../styles/colors';

type CalendarViewType = 'month' | 'week';

const { width } = Dimensions.get('window');
const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarScreen = () => {
  const today = useMemo(() => new Date(), []);
  const initialMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // useInfiniteCalendar 로직
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
        addNextMonthData();
      }

      currentIndex.current = newIndex;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      updateCurrentMonth(data, newIndex);
    }
  }, [data, addNextMonthData, updateCurrentMonth]);

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

  // useCalendarView 로직
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentWeek, setCurrentWeek] = useState<Date | null>(null);
  const [weekData, setWeekData] = useState<CalendarDate[][]>([]); // 주 단위 배열로 변경
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Week 무한 스크롤을 위한 ref와 index
  const weekFlatListRef = useRef<FlatList>(null);
  const currentWeekIndex = useRef(1);

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

      if (targetDate) {
        baseDate = targetDate;
      } else {
        // currentMonth가 initialMonth와 같은 월인지 확인
        const isInitialMonth =
          currentMonth.getFullYear() === initialMonth.getFullYear() &&
          currentMonth.getMonth() === initialMonth.getMonth();

        if (isInitialMonth) {
          // initialMonth인 경우 오늘을 기준으로 주 설정
          baseDate = today;
        } else {
          // initialMonth가 아닌 경우 해당 월의 첫 번째 날을 기준으로 주 설정
          baseDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        }
      }

      const weekStart = getWeekStartDate(baseDate);

      // 초기 주 데이터 설정 (이전주, 현재주, 다음주)
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(weekStart.getDate() + 7);

      const initialWeekData = [
        createWeekCalendarData(prevWeekStart),
        createWeekCalendarData(weekStart),
        createWeekCalendarData(nextWeekStart),
      ];

      setCurrentWeek(weekStart);
      setWeekData(initialWeekData);
      setViewType('week');
      currentWeekIndex.current = 1;
    },
    [currentMonth, initialMonth, today],
  );

  const switchToMonthView = useCallback(
    (onMonthChange?: (month: Date) => void) => {
      // Week에서 Month로 전환할 때 현재 월이 data에 있는지 확인
      if (currentWeek) {
        const targetDate = selectedDate || currentWeek;
        const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);

        // 현재 data에 targetMonth가 있는지 확인
        const targetIndex = data.findIndex((item) => {
          const itemDate = new Date(
            item.calendarDates.find((date) => date.isCurrentMonth)?.date || new Date(),
          );
          return (
            itemDate.getFullYear() === targetMonth.getFullYear() &&
            itemDate.getMonth() === targetMonth.getMonth()
          );
        });

        if (targetIndex === -1 && onMonthChange) {
          // 해당 월이 data에 없으면 goToSpecificMonth로 생성하여 이동
          onMonthChange(targetMonth);
        } else if (targetIndex !== -1) {
          // 해당 월이 이미 있으면 해당 위치로 이동
          currentIndex.current = targetIndex;
          flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
          updateCurrentMonth(data, targetIndex);
        }
      }

      setViewType('month');
      setCurrentWeek(null);
      setWeekData([]);
    },
    [currentWeek, selectedDate, data, updateCurrentMonth],
  );

  const onSwipeUp = useCallback(() => {
    'worklet';
    // 현재 선택된 날짜가 있으면 그 날짜를 기준으로, 없으면 현재 월 기준으로 주 뷰 설정
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

  // Week 무한 스크롤 헬퍼 함수들
  const updateCurrentWeek = useCallback(
    (weekDataArray: CalendarDate[][], index: number) => {
      if (weekDataArray[index] && weekDataArray[index].length > 0) {
        const weekStartDate = getWeekStartDate(weekDataArray[index][0].date);
        setCurrentWeek(weekStartDate);

        // currentMonth도 업데이트
        const newMonth = new Date(
          weekDataArray[index][0].date.getFullYear(),
          weekDataArray[index][0].date.getMonth(),
          1,
        );
        if (newMonth.getTime() !== currentMonth.getTime()) {
          setCurrentMonth(newMonth);
        }
      }
    },
    [currentMonth],
  );

  const addPrevWeekData = useCallback(() => {
    if (weekData.length > 0 && weekData[0].length > 0) {
      const firstWeekStart = getWeekStartDate(weekData[0][0].date);
      const prevWeekStart = new Date(firstWeekStart);
      prevWeekStart.setDate(firstWeekStart.getDate() - 7);
      const prevWeekDates = createWeekCalendarData(prevWeekStart);
      const newWeekData = [prevWeekDates, ...weekData];
      setWeekData(newWeekData);
      return newWeekData;
    }
    return weekData;
  }, [weekData]);

  const addNextWeekData = useCallback(() => {
    if (weekData.length > 0 && weekData[weekData.length - 1].length > 0) {
      const lastWeekStart = getWeekStartDate(weekData[weekData.length - 1][0].date);
      const nextWeekStart = new Date(lastWeekStart);
      nextWeekStart.setDate(lastWeekStart.getDate() + 7);
      const nextWeekDates = createWeekCalendarData(nextWeekStart);
      const newWeekData = [...weekData, nextWeekDates];
      setWeekData(newWeekData);
      return newWeekData;
    }
    return weekData;
  }, [weekData]);

  // Week 스크롤 이벤트 핸들러
  const onWeekScrollEnd = useCallback(
    (e: ScrollEvent) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);

      if (newIndex === 0) {
        // 맨 앞 → 앞에 주 추가
        const newWeekData = addPrevWeekData();
        currentWeekIndex.current = newIndex + 1;

        setTimeout(() => {
          weekFlatListRef.current?.scrollToIndex({
            index: currentWeekIndex.current,
            animated: false,
          });
        }, 0);

        updateCurrentWeek(newWeekData, currentWeekIndex.current);
      } else if (newIndex === weekData.length - 1) {
        // 맨 뒤 → 뒤에 주 추가
        addNextWeekData();
        currentWeekIndex.current = newIndex;
        updateCurrentWeek(weekData, newIndex);
      } else {
        currentWeekIndex.current = newIndex;
        updateCurrentWeek(weekData, newIndex);
      }
    },
    [weekData, addPrevWeekData, addNextWeekData, updateCurrentWeek],
  );

  const goToPrevWeek = useCallback(() => {
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

        updateCurrentWeek(newWeekData, currentWeekIndex.current);
      } else {
        currentWeekIndex.current = newIndex;
        weekFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        updateCurrentWeek(weekData, newIndex);
      }
    }
  }, [weekData, addPrevWeekData, updateCurrentWeek]);

  const goToNextWeek = useCallback(() => {
    if (currentWeekIndex.current < weekData.length - 1) {
      const newIndex = currentWeekIndex.current + 1;

      if (newIndex === weekData.length - 1) {
        addNextWeekData();
      }

      currentWeekIndex.current = newIndex;
      weekFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      updateCurrentWeek(weekData, newIndex);
    }
  }, [weekData, addNextWeekData, updateCurrentWeek]);

  // 애니메이션 값들
  const calendarHeight = useSharedValue(viewType === 'month' ? 400 : 120);
  const translateY = useSharedValue(0);

  // 제스처 정의
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const threshold = 50;
      const velocityThreshold = 500;

      if (event.translationY < -threshold && event.velocityY < -velocityThreshold) {
        // 위로 스와이프 - 월 → 주
        if (viewType === 'month') {
          onSwipeUp();
        }
      } else if (event.translationY > threshold && event.velocityY > velocityThreshold) {
        // 아래로 스와이프 - 주 → 월
        if (viewType === 'week') {
          onSwipeDown(goToSpecificMonth);
        }
      }

      translateY.value = withTiming(0, { duration: 200 });
    });

  // 뷰 타입 변경에 따른 애니메이션
  useEffect(() => {
    calendarHeight.value = withTiming(viewType === 'month' ? 350 : 120, { duration: 300 });
  }, [viewType, calendarHeight]);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    height: calendarHeight.value,
    transform: [{ translateY: translateY.value }],
  }));

  // 헤더 네비게이션 함수들
  const handlePrev = viewType === 'month' ? goToPrev : goToPrevWeek;
  const handleNext = viewType === 'month' ? goToNext : goToNextWeek;

  // 현재 표시할 월 레이블
  const currentLabel = useMemo(() => {
    if (viewType === 'month') {
      // currentMonth 상태를 사용하여 실시간 업데이트
      return `${currentMonth.toLocaleString('default', {
        month: 'long',
        timeZone: 'Asia/Seoul',
      })} ${currentMonth.getFullYear()}`;
    } else {
      // 주 뷰일 때 - weekData[currentWeekIndex][0] 접근
      return weekData.length > 0 &&
        weekData[currentWeekIndex.current] &&
        weekData[currentWeekIndex.current].length > 0
        ? `${weekData[currentWeekIndex.current][0].date.toLocaleString('default', {
            month: 'long',
            timeZone: 'Asia/Seoul',
          })} ${weekData[currentWeekIndex.current][0].date.getFullYear()}`
        : '';
    }
  }, [viewType, currentMonth, weekData, currentWeekIndex.current]);

  const renderItem = useCallback(
    ({ item }: { item: CalendarItem }) => (
      <View style={{ width }}>
        <View style={styles.weekRow}>
          {WEEK_LABELS.map((label, index) => (
            <Text
              key={label}
              style={[
                styles.weekLabel,
                index === 0 && { color: colors.sundayLabel },
                index === 6 && { color: colors.saturdayLabel },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {item.calendarDates.map(({ date, isCurrentMonth }, index) => (
            <CalendarDay
              key={index}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isSameDate(date, today)}
              isSelected={isDateSelected(date)}
              onPress={handleDatePress}
            />
          ))}
        </View>
      </View>
    ),
    [handleDatePress, isDateSelected, today],
  );

  const renderWeekItem = useCallback(
    ({ item }: { item: CalendarDate[] }) => {
      // 첫 번째 날짜의 월을 기준으로 isCurrentMonth 재설정
      const referenceMonth = item.length > 0 ? item[0].date.getMonth() : new Date().getMonth();
      const processedItem = item.map((dateItem) => ({
        ...dateItem,
        isCurrentMonth: dateItem.date.getMonth() === referenceMonth,
      }));

      return (
        <View style={{ width }}>
          <View style={styles.weekRow}>
            {WEEK_LABELS.map((label, index) => (
              <Text
                key={label}
                style={[
                  styles.weekLabel,
                  index === 0 && { color: colors.sundayLabel },
                  index === 6 && { color: colors.saturdayLabel },
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {processedItem.map(({ date, isCurrentMonth }, index) => (
              <CalendarDay
                key={index}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isToday={isSameDate(date, today)}
                isSelected={isDateSelected(date)}
                onPress={handleDatePress}
              />
            ))}
          </View>
        </View>
      );
    },
    [handleDatePress, isDateSelected, today],
  );

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader monthLabel={currentLabel} onPrev={handlePrev} onNext={handleNext} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.calendarWrapper, animatedStyle]}>
          {viewType === 'month' ? (
            <FlatList
              ref={flatListRef}
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.monthLabel}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              initialScrollIndex={1}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
            />
          ) : (
            <FlatList
              ref={weekFlatListRef}
              data={weekData}
              renderItem={renderWeekItem}
              keyExtractor={(_, index) => `week-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onWeekScrollEnd}
              initialScrollIndex={1}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
            />
          )}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  calendarWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    overflow: 'hidden',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 6,
    width: width,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width,
  },
});
