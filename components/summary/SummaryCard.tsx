import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense } from '@/lib/types/expense';
import { Income } from '@/lib/types/income';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useCategoryStore } from '@/stores/categoryStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SummaryCardProps {
  expenses: Expense[];
  incomes?: Income[];
  month: string;
}

export function SummaryCard({ expenses, incomes = [], month }: SummaryCardProps) {
  const { getCategoryById } = useCategoryStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

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
        ? ['#1A1A1C', '#161618'] 
        : ['#FFFFFF', '#FAFAFA']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.mainBalance}>
        <Text style={styles.balanceLabel}>Saldo do Mês</Text>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? '#34C759' : '#FF3B30' }]}>
          {balance >= 0 ? '+' : '-'}{formattedBalance}
        </Text>
      </View>
      
      <View style={styles.statsRow}>
        <LinearGradient
          colors={['#34C75915', '#34C75905']}
          style={styles.statBox}
        >
          <Text style={styles.statLabel}>Receitas</Text>
          <Text style={[styles.statValue, { color: '#34C759' }]}>
            {formattedTotalIncomes}
          </Text>
        </LinearGradient>
        <LinearGradient
          colors={['#FF3B3015', '#FF3B3005']}
          style={styles.statBox}
        >
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={[styles.statValue, { color: '#FF3B30' }]}>
            {formattedTotalExpenses}
          </Text>
        </LinearGradient>
      </View>

      {totalByCategory.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Principais Categorias</Text>
          {totalByCategory.map((item) => (
            <View key={item.category?.id} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                {item.category && (
                  <LinearGradient
                    colors={[item.category.color + '20', item.category.color + '10']}
                    style={styles.categoryIcon}
                  >
                    <IconSymbol name={item.category.icon} size={14} color={item.category.color} />
                  </LinearGradient>
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

const getStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  mainBalance: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  balanceLabel: {
    fontSize: 12,
    color: isDark ? '#8E8E93' : '#8E8E93',
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#8E8E93' : '#8E8E93',
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  categoriesSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#FFFFFF' : '#000000',
    flex: 1,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
  },
});
