import React from 'react';
import { CalendarDate } from '../../../../types/calendar';
import { Text, View } from 'react-native';
import { isSameDate, WEEK_LABELS } from '../../../../utils/date';
import CalendarDay from '../CalendarDay';
import colors from '../../../../styles/colors';

interface RenderWeekItemProps {
  item: CalendarDate[];
  width: number;
  today: Date;
  isDateSelected: (date: Date) => boolean;
  handleDatePress: (date: Date) => void;
  styles: any;
}

const WeekItem = ({
  item,
  width,
  today,
  isDateSelected,
  handleDatePress,
  styles,
}: RenderWeekItemProps) => {
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
};

export default WeekItem;
