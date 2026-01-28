import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useFormattedDate } from '@/hooks/useFormattedDate';
import { Expense } from '@/lib/types/expense';
import { useCategoryStore } from '@/stores/categoryStore';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ExpenseCard = React.memo<ExpenseCardProps>(({ expense, onPress, onDelete }) => {
  const formattedValue = useFormattedCurrency(expense.value);
  const formattedDate = useFormattedDate(expense.date);
  const category = useCategoryStore(state => state.getCategoryById(expense.category_id));
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardWrapper}
    >
      <View style={styles.card}>
        <View style={styles.leftContent}>
          {category && (
            <View style={[styles.iconWrapper, { backgroundColor: category.color + '15' }]}>
              <IconSymbol name={category.icon as any} size={20} color={category.color} />
            </View>
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {expense.description}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.categoryName}>{category?.name || 'Sem categoria'}</Text>
              <View style={styles.dot} />
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.amount, { color: theme.danger }]}>-{formattedValue}</Text>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="trash" size={14} color={theme.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

ExpenseCard.displayName = 'ExpenseCard';

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  cardWrapper: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.15 : 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: '600',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.muted,
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  deleteBtn: {
    padding: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
});
