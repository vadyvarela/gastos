import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatMonth, getPreviousMonth, getNextMonth } from '@/utils/date';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MonthFilterProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthFilter({ currentMonth, onMonthChange }: MonthFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const handlePrevious = () => {
    onMonthChange(getPreviousMonth(currentMonth));
  };

  const handleNext = () => {
    onMonthChange(getNextMonth(currentMonth));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePrevious} 
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <IconSymbol name="chevron.left" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
      </TouchableOpacity>
      
      <Text style={styles.monthText}>{formatMonth(currentMonth)}</Text>
      
      <TouchableOpacity 
        onPress={handleNext} 
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <IconSymbol name="chevron.right" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 0,
  },
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
  },
  monthText: {
    fontSize: 17,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    letterSpacing: -0.2,
  },
});
