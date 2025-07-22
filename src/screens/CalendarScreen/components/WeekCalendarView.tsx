import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CalendarDay from './CalendarDay';
import { CalendarDate } from '../../../types/calendar';
import { deviceInfo } from '../../../utils/util';
import { isSameDate, WEEK_LABELS } from '../../../utils/date';
import colors from '../../../styles/colors';

const { width } = deviceInfo;

interface WeekCalendarViewProps {
  weekData: CalendarDate[];
  onDatePress: (date: Date) => void;
  isDateSelected: (date: Date) => boolean;
}

const WeekCalendarView: React.FC<WeekCalendarViewProps> = ({
  weekData,
  onDatePress,
  isDateSelected,
}) => {
  const today = new Date();

  return (
    <View style={styles.weekContainer}>
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
      <View style={styles.weekDatesRow}>
        {weekData.map((item, index) => (
          <CalendarDay
            key={index}
            date={item.date}
            isCurrentMonth={item.isCurrentMonth}
            isToday={isSameDate(item.date, today)}
            isSelected={isDateSelected(item.date)}
            onPress={onDatePress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekContainer: {
    width: width,
    paddingVertical: 10,
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
  weekDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
  },
});

export default WeekCalendarView;
