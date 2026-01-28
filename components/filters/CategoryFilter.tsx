import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Category } from '@/lib/types/category';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId?: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: CategoryFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

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
          activeOpacity={0.8}
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
            activeOpacity={0.8}
          >
            <View style={styles.chipContent}>
              <IconSymbol name={category.icon} size={16} color={selectedCategoryId === category.id ? category.color : (isDark ? '#94A3B8' : '#64748B')} />
              <Text
                style={[
                  styles.chipText,
                  { marginLeft: 8 },
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

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderColor: '#007AFF',
  },
  chipUnselected: {
    borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#007AFF',
  },
  chipTextUnselected: {
    color: isDark ? '#94A3B8' : '#64748B',
  },
});
