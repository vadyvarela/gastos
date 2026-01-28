import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Category } from '@/lib/types/category';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId?: string) => void;
}

import { Colors } from '@/constants/theme';

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: CategoryFilterProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={() => onCategorySelect(undefined)}
          style={[
            styles.chip,
            !selectedCategoryId ? styles.chipSelected : styles.chipUnselected,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              !selectedCategoryId ? styles.chipTextSelected : styles.chipTextUnselected,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onCategorySelect(category.id)}
            style={[
              styles.chip,
              selectedCategoryId === category.id ? styles.chipSelected : styles.chipUnselected,
              selectedCategoryId === category.id && { borderColor: category.color },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.chipContent}>
              <IconSymbol 
                name={category.icon as any} 
                size={14} 
                color={selectedCategoryId === category.id ? category.color : theme.muted} 
              />
              <Text
                style={[
                  styles.chipText,
                  { marginLeft: 6 },
                  selectedCategoryId === category.id ? styles.chipTextSelected : styles.chipTextUnselected,
                  selectedCategoryId === category.id && { color: category.color },
                ]}
              >
                {category.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 6,
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  chipSelected: {
    backgroundColor: theme.card,
    borderColor: theme.tint,
  },
  chipUnselected: {
    borderColor: 'transparent',
    backgroundColor: theme.surface,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextSelected: {
    color: theme.tint,
  },
  chipTextUnselected: {
    color: theme.muted,
  },
});
