import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CalendarHeader from './components/CalendarHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCalendar } from '../../hooks/useCalendar';
import CalendarDay from './components/CalendarDay';
import { isSameDate, WEEK_LABELS } from '../../utils/util';
import colors from '../../styles/colors';

const CalendarScreen = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { calendarDates, monthLabel } = useCalendar(currentMonth);

  const goToPrev = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNext = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const isDateSelected = (date: Date) => {
    return selectedDate ? isSameDate(date, selectedDate) : false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader monthLabel={monthLabel} onPrev={goToPrev} onNext={goToNext} />
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
        {calendarDates.map(({ date, isCurrentMonth }, index) => (
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
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 6,
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
  },
});
