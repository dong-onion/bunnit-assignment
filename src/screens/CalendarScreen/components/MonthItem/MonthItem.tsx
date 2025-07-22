import React from 'react';
import { CalendarItem } from '../../../../types/calendar';
import { Text, View } from 'react-native';
import { isSameDate, WEEK_LABELS } from '../../../../utils/date';
import colors from '../../../../styles/colors';
import CalendarDay from '../CalendarDay';

interface RenderItemProps {
  item: CalendarItem;
  width: number;
  today: Date;
  isDateSelected: (date: Date) => boolean;
  handleDatePress: (date: Date) => void;
  styles: any;
}

const MonthItem = ({
  item,
  width,
  today,
  isDateSelected,
  handleDatePress,
  styles,
}: RenderItemProps) => (
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
);

export default MonthItem;
