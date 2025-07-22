import { useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CalendarViewType } from '../types/calendar';

interface UseCalendarGestureProps {
  viewType: CalendarViewType;
  onSwipeUp: () => void;
  onSwipeDown: (callback?: any) => void;
  goToSpecificMonth: (month: Date) => void;
}

export const useCalendarGesture = ({
  viewType,
  onSwipeUp,
  onSwipeDown,
  goToSpecificMonth,
}: UseCalendarGestureProps) => {
  const calendarHeight = useSharedValue(viewType === 'month' ? 400 : 120);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const threshold = 50;
      const velocityThreshold = 500;

      if (event.translationY < -threshold && event.velocityY < -velocityThreshold) {
        if (viewType === 'month') {
          onSwipeUp();
        }
      } else if (event.translationY > threshold && event.velocityY > velocityThreshold) {
        if (viewType === 'week') {
          onSwipeDown(goToSpecificMonth);
        }
      }

      translateY.value = withTiming(0, { duration: 200 });
    });

  useEffect(() => {
    calendarHeight.value = withTiming(viewType === 'month' ? 400 : 120, { duration: 300 });
  }, [viewType, calendarHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: calendarHeight.value,
    transform: [{ translateY: translateY.value }],
  }));

  return {
    panGesture,
    animatedStyle,
  };
};
