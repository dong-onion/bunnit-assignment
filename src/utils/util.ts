import { Dimensions } from 'react-native';
import { CalendarItem, CalendarDate } from '../types/calendar';
import { createCalendarData, createWeekCalendarData, getWeekStartDate } from './date';
const { width, height } = Dimensions.get('window');

export const deviceInfo = {
  width,
  height,
};

// Month 무한 스크롤 유틸리티
export const createInitialMonthData = (initialMonth: Date): CalendarItem[] => {
  const prev = new Date(initialMonth.getFullYear(), initialMonth.getMonth() - 1, 1);
  const current = initialMonth;
  const next = new Date(initialMonth.getFullYear(), initialMonth.getMonth() + 1, 1);

  return [createCalendarData(prev), createCalendarData(current), createCalendarData(next)];
};

export const addPrevMonthToData = (data: CalendarItem[]): CalendarItem[] => {
  const firstDate = new Date(
    data[0].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
  );
  const prevDate = new Date(firstDate.getFullYear(), firstDate.getMonth() - 1, 1);
  const prevCalendarData = createCalendarData(prevDate);
  return [prevCalendarData, ...data];
};

export const addNextMonthToData = (data: CalendarItem[]): CalendarItem[] => {
  const lastDate = new Date(
    data[data.length - 1].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
  );
  const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
  const nextCalendarData = createCalendarData(nextDate);
  return [...data, nextCalendarData];
};

export const updateCurrentMonthFromData = (dataArray: CalendarItem[], index: number): Date => {
  const currentDate = new Date(
    dataArray[index].calendarDates.find((item) => item.isCurrentMonth)?.date || new Date(),
  );
  return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
};

// Week 무한 스크롤 유틸리티
export const createInitialWeekData = (weekStart: Date): CalendarDate[][] => {
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(weekStart.getDate() + 7);

  return [
    createWeekCalendarData(prevWeekStart),
    createWeekCalendarData(weekStart),
    createWeekCalendarData(nextWeekStart),
  ];
};

export const addPrevWeekToData = (weekData: CalendarDate[][]): CalendarDate[][] => {
  if (weekData.length > 0 && weekData[0].length > 0) {
    const firstWeekStart = getWeekStartDate(weekData[0][0].date);
    const prevWeekStart = new Date(firstWeekStart);
    prevWeekStart.setDate(firstWeekStart.getDate() - 7);
    const prevWeekDates = createWeekCalendarData(prevWeekStart);
    return [prevWeekDates, ...weekData];
  }
  return weekData;
};

export const addNextWeekToData = (weekData: CalendarDate[][]): CalendarDate[][] => {
  if (weekData.length > 0 && weekData[weekData.length - 1].length > 0) {
    const lastWeekStart = getWeekStartDate(weekData[weekData.length - 1][0].date);
    const nextWeekStart = new Date(lastWeekStart);
    nextWeekStart.setDate(lastWeekStart.getDate() + 7);
    const nextWeekDates = createWeekCalendarData(nextWeekStart);
    return [...weekData, nextWeekDates];
  }
  return weekData;
};

export const updateCurrentWeekFromData = (weekDataArray: CalendarDate[][], index: number) => {
  if (weekDataArray[index] && weekDataArray[index].length > 0) {
    const weekStartDate = getWeekStartDate(weekDataArray[index][0].date);
    const newMonth = new Date(
      weekDataArray[index][0].date.getFullYear(),
      weekDataArray[index][0].date.getMonth(),
      1,
    );
    return { weekStartDate, newMonth };
  }
  return null;
};

export const findMonthInData = (data: CalendarItem[], targetMonth: Date): number => {
  return data.findIndex((item) => {
    const itemDate = new Date(
      item.calendarDates.find((date) => date.isCurrentMonth)?.date || new Date(),
    );
    return (
      itemDate.getFullYear() === targetMonth.getFullYear() &&
      itemDate.getMonth() === targetMonth.getMonth()
    );
  });
};
