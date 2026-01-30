import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { Expense } from '@/lib/types/expense';
import { Income } from '@/lib/types/income';
import { useCategoryStore } from '@/stores/categoryStore';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface SummaryCardProps {
  expenses: Expense[];
  incomes?: Income[];
  month: string;
}

export function SummaryCard({ expenses, incomes = [], month }: SummaryCardProps) {
  const { getCategoryById } = useCategoryStore();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.value, 0);
  }, [expenses]);

  const totalIncomes = useMemo(() => {
    return incomes.reduce((sum, inc) => sum + inc.value, 0);
  }, [incomes]);

  const balance = totalIncomes - totalExpenses;

  const totalByCategory = useMemo(() => {
    const map = new Map<string, number>();
    
    expenses.forEach((exp) => {
      const current = map.get(exp.category_id) || 0;
      map.set(exp.category_id, current + exp.value);
    });

    return Array.from(map.entries())
      .map(([categoryId, value]) => ({
        category: getCategoryById(categoryId),
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      }))
      .filter(item => item.category)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [expenses, getCategoryById, totalExpenses]);

  const formattedTotalExpenses = useFormattedCurrency(totalExpenses);
  const formattedTotalIncomes = useFormattedCurrency(totalIncomes);
  const formattedBalance = useFormattedCurrency(Math.abs(balance));

  return (
    <View style={styles.card}>
      <View style={styles.mainBalance}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text style={[styles.balanceAmount, { color: theme.text }]}>
          {balance >= 0 ? '' : '-'}{formattedBalance}
        </Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Text style={styles.statLabel}>Receitas</Text>
          <Text style={[styles.statValue, { color: theme.success }]}>
            {formattedTotalIncomes}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Text style={styles.statLabel}>Despesas</Text>
          <Text style={[styles.statValue, { color: theme.danger }]}>
            {formattedTotalExpenses}
          </Text>
        </View>
      </View>

      {totalByCategory.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Maiores Gastos</Text>
          {totalByCategory.map((item) => (
            <View key={item.category?.id} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                {item.category && (
                  <View style={[styles.categoryIcon, { backgroundColor: item.category.color + '15' }]}>
                    <IconSymbol name={item.category.icon as any} size={16} color={item.category.color} />
                  </View>
                )}
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.category?.name}
                </Text>
              </View>
              <Text style={styles.categoryValue}>
                {useFormattedCurrency(item.value)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  mainBalance: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.muted,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  categoriesSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
});
