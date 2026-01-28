import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { Expense } from '@/lib/types/expense';
import { Income } from '@/lib/types/income';
import { useCategoryStore } from '@/stores/categoryStore';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={isDark 
        ? [theme.card, theme.surface] 
        : [theme.card, '#F1F5F9']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.mainBalance}>
        <Text style={styles.balanceLabel}>Saldo do Mês</Text>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? theme.success : theme.danger }]}>
          {balance >= 0 ? '+' : '-'}{formattedBalance}
        </Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }]}>
          <Text style={styles.statLabel}>Receitas</Text>
          <Text style={[styles.statValue, { color: theme.success }]}>
            {formattedTotalIncomes}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.05)' }]}>
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={[styles.statValue, { color: theme.danger }]}>
            {formattedTotalExpenses}
          </Text>
        </View>
      </View>

      {totalByCategory.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Principais Categorias</Text>
          {totalByCategory.map((item) => (
            <View key={item.category?.id} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                {item.category && (
                  <View style={[styles.categoryIcon, { backgroundColor: item.category.color + '20' }]}>
                    <IconSymbol name={item.category.icon as any} size={14} color={item.category.color} />
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
    </LinearGradient>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 12,
    elevation: 5,
  },
  mainBalance: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    color: theme.muted,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  categoriesSection: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
  },
});
