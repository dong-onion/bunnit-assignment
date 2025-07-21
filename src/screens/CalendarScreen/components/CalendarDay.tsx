import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import colors from '../../../styles/colors';
import { deviceInfo } from '../../../utils/util';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onPress: (date: Date) => void;
}

const CELL_SIZE = deviceInfo.width / 7;

export default function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  onPress,
}: CalendarDayProps) {
  const dayTextStyle = [
    styles.text,
    !isCurrentMonth && styles.outsideMonth,
    isToday && styles.todayText,
    isSelected && styles.selectedText,
  ];

  return (
    <TouchableOpacity style={styles.wrapper} onPress={() => onPress(date)}>
      <View
        style={[styles.circle, isToday && styles.todayCircle, isSelected && styles.selectedCircle]}
      >
        <Text style={dayTextStyle}>{date.getDate()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 12,
    width: CELL_SIZE,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
  outsideMonth: {
    color: colors.disabled,
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  todayText: {
    fontWeight: 'bold',
  },
  selectedCircle: {
    backgroundColor: colors.primary,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
