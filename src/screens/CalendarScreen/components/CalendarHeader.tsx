import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../../../styles/colors';

interface Props {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarHeader({ monthLabel, onPrev, onNext }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev}>
        <AntDesign name="left" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.label}>{monthLabel}</Text>
      <TouchableOpacity onPress={onNext}>
        <AntDesign name="right" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 12,
    width: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
