import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useFormattedDate } from '@/hooks/useFormattedDate';
import { Income } from '@/lib/types/income';
import { useCategoryStore } from '@/stores/categoryStore';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface IncomeCardProps {
  income: Income;
  onPress?: () => void;
  onDelete?: () => void;
}

export const IncomeCard = React.memo<IncomeCardProps>(({ income, onPress, onDelete }) => {
  const formattedValue = useFormattedCurrency(income.value);
  const formattedDate = useFormattedDate(income.date);
  const category = useCategoryStore(state => state.getCategoryById(income.category_id));
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
            <View style={[styles.iconWrapper, { backgroundColor: theme.success + '15' }]}>
              <IconSymbol name={category.icon as any} size={20} color={theme.success} />
            </View>
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {income.description}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.categoryName}>{category?.name || 'Sem categoria'}</Text>
              <View style={styles.dot} />
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.amount, { color: theme.success }]}>+{formattedValue}</Text>
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

IncomeCard.displayName = 'IncomeCard';

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.02,
    shadowRadius: 8,
    elevation: 3,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 13,
    color: theme.muted,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.muted,
    marginHorizontal: 8,
  },
  date: {
    fontSize: 13,
    color: theme.muted,
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  deleteBtn: {
    padding: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
});
