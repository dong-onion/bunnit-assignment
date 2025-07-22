import React, { useMemo, useCallback } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import CalendarHeader from './components/CalendarHeader';
import { useInfiniteMonthCalendar } from '../../hooks/useInfiniteMonthCalendar';
import { useInfiniteWeekCalendar } from '../../hooks/useInfiniteWeekCalendar';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useCalendarGesture } from '../../hooks/useCalendarGesture';
import colors from '../../styles/colors';
import { deviceInfo } from '../../utils/util';
import MonthItem from './components/MonthItem';
import WeekItem from './components/WeekItem';
import type { CalendarScreenProps } from '../../types/navigation';

const { width } = deviceInfo;

const CalendarScreen = ({ navigation }: CalendarScreenProps) => {
  const today = useMemo(() => new Date(), []);
  const initialMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthCalendar = useInfiniteMonthCalendar(initialMonth);

  const weekCalendar = useInfiniteWeekCalendar();

  // 캘린더 뷰 상태 관리 훅
  const calendarView = useCalendarView({
    initialMonth,
    today,
    currentMonth: monthCalendar.currentMonth,
    data: monthCalendar.data,
    currentIndex: monthCalendar.currentIndex,
    flatListRef: monthCalendar.flatListRef,
    updateCurrentMonth: monthCalendar.updateCurrentMonth,
    initializeWeekData: weekCalendar.initializeWeekData,
    resetWeekData: weekCalendar.resetWeekData,
    currentWeek: weekCalendar.currentWeek,
    weekData: weekCalendar.weekData,
    currentWeekIndex: weekCalendar.currentWeekIndex,
  });

  const { panGesture, animatedStyle } = useCalendarGesture({
    viewType: calendarView.viewType,
    onSwipeUp: calendarView.onSwipeUp,
    onSwipeDown: calendarView.onSwipeDown,
    goToSpecificMonth: monthCalendar.goToSpecificMonth,
  });

  // 월 변경 콜백 (주 스크롤에서 월이 변경될 때)
  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      monthCalendar.setCurrentMonth(newMonth);
    },
    [monthCalendar],
  );

  // 헤더 네비게이션
  const handlePrev =
    calendarView.viewType === 'month'
      ? monthCalendar.goToPrev
      : () => weekCalendar.goToPrevWeek(handleMonthChange);

  const handleNext =
    calendarView.viewType === 'month'
      ? monthCalendar.goToNext
      : () => weekCalendar.goToNextWeek(handleMonthChange);

  const renderMonthItemCallback = useCallback(
    ({ item }: { item: any }) => (
      <MonthItem
        item={item}
        width={width}
        today={today}
        isDateSelected={calendarView.isDateSelected}
        handleDatePress={calendarView.handleDatePress}
        styles={styles}
      />
    ),
    [calendarView.isDateSelected, calendarView.handleDatePress, today],
  );

  const renderWeekItemCallback = useCallback(
    ({ item }: { item: any }) => (
      <WeekItem
        item={item}
        width={width}
        today={today}
        isDateSelected={calendarView.isDateSelected}
        handleDatePress={calendarView.handleDatePress}
        styles={styles}
      />
    ),
    [calendarView.isDateSelected, calendarView.handleDatePress, today],
  );

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader
        monthLabel={calendarView.currentLabel}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.calendarWrapper, animatedStyle]}>
          {calendarView.viewType === 'month' ? (
            <FlatList
              ref={monthCalendar.flatListRef}
              data={monthCalendar.data}
              renderItem={renderMonthItemCallback}
              keyExtractor={(item) => item.monthLabel}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => monthCalendar.onScrollEnd(e, width)}
              initialScrollIndex={1}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
            />
          ) : (
            <FlatList
              ref={weekCalendar.weekFlatListRef}
              data={weekCalendar.weekData}
              renderItem={renderWeekItemCallback}
              keyExtractor={(_, index) => `week-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => weekCalendar.onWeekScrollEnd(e, width, handleMonthChange)}
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
