import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CalendarHeader from './components/CalendarHeader';
import CalendarDay from './components/CalendarDay';
import WeekCalendarView from './components/WeekCalendarView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deviceInfo } from '../../utils/util';
import { isSameDate, WEEK_LABELS } from '../../utils/date';
import colors from '../../styles/colors';
import { CalendarItem } from '../../types/calendarScreen';
import { useInfiniteCalendar } from '../../hooks/useInfiniteCalendar';
import { useCalendarView } from '../../hooks/useCalendarView';

const { width } = deviceInfo;

const CalendarScreen = () => {
  const today = useMemo(() => new Date(), []);
  const initialMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const { flatListRef, data, currentMonth, onScrollEnd, goToPrev, goToNext, goToSpecificMonth } =
    useInfiniteCalendar(initialMonth);

  // week data 와 month data 통합 데이터 사용,
  // WeekCalendarView flatlist와 무한스크롤 방식으로 구현
  // readme 간략한 설명

  const {
    viewType,
    weekData,
    selectedDate,
    onSwipeUp,
    onSwipeDown,
    goToPrevWeek,
    goToNextWeek,
    switchToWeekView,
    handleDatePress,
    isDateSelected,
  } = useCalendarView(initialMonth);

  // selectedDate 상태와 관련 함수들을 useCalendarView에서 가져옴

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
      // 주 뷰일 때
      return weekData.length > 0
        ? `${weekData[0].date.toLocaleString('default', {
            month: 'long',
            timeZone: 'Asia/Seoul',
          })} ${weekData[0].date.getFullYear()}`
        : '';
    }
  }, [viewType, currentMonth, weekData]);

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
            <WeekCalendarView
              weekData={weekData}
              onDatePress={handleDatePress}
              isDateSelected={isDateSelected}
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
    // backgroundColor: colors.background,
    flex: 1,
    // backgroundColor: 'green',
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
    fontWeight: '600',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width,
  },
});
