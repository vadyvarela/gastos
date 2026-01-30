import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMonth, getNextMonth, getPreviousMonth } from '@/utils/date';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MonthFilterProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

import { Colors } from '@/constants/theme';

export function MonthFilter({ currentMonth, onMonthChange }: MonthFilterProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

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
        activeOpacity={0.6}
      >
        <IconSymbol name="chevron.left" size={16} color={theme.text} />
      </TouchableOpacity>
      
      <Text style={styles.monthText}>{formatMonth(currentMonth)}</Text>
      
      <TouchableOpacity 
        onPress={handleNext} 
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.6}
      >
        <IconSymbol name="chevron.right" size={16} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  button: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
});
