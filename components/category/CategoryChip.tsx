import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '@/lib/types/category';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function CategoryChip({ category, selected, onPress, size = 'medium' }: CategoryChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, size);

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const content = (
    <View
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}
    >
      <IconSymbol name={category.icon} size={iconSizes[size]} color={category.color} />
      <Text
        style={[
          styles.chipText,
          selected ? styles.chipTextSelected : styles.chipTextUnselected,
        ]}
      >
        {category.name}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const getStyles = (isDark: boolean, size: 'small' | 'medium' | 'large') => {
  const padding = {
    small: { horizontal: 12, vertical: 6 },
    medium: { horizontal: 16, vertical: 8 },
    large: { horizontal: 20, vertical: 10 },
  }[size];

  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      borderWidth: 2,
      paddingHorizontal: padding.horizontal,
      paddingVertical: padding.vertical,
    },
    chipSelected: {
      borderColor: '#3B82F6',
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
    },
    chipUnselected: {
      borderColor: isDark ? '#4B5563' : '#D1D5DB',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    chipText: {
      marginLeft: 8,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: isDark ? '#93C5FD' : '#2563EB',
    },
    chipTextUnselected: {
      color: isDark ? '#D1D5DB' : '#374151',
    },
  });
};
