import { BarChart } from '@/components/charts/BarChart';
import { MonthFilter } from '@/components/filters/MonthFilter';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExpenses } from '@/hooks/useExpenses';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useIncomes } from '@/hooks/useIncomes';
import { useCategoryStore } from '@/stores/categoryStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useIncomeStore } from '@/stores/incomeStore';
import { getCurrentMonth } from '@/utils/date';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

export default function SummaryScreen() {
  const { expenses } = useExpenses();
  const { incomes } = useIncomes();
  const { getCategoryById } = useCategoryStore();
  const { setFilters } = useExpenseStore();
  const { setFilters: setIncomeFilters } = useIncomeStore();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  React.useEffect(() => {
    setFilters({ month: currentMonth });
    setIncomeFilters({ month: currentMonth });
  }, [currentMonth, setFilters, setIncomeFilters]);

  const monthExpenses = useMemo(() => {
    return expenses.filter(exp => exp.date.startsWith(currentMonth));
  }, [expenses, currentMonth]);

  const monthIncomes = useMemo(() => {
    return incomes.filter(inc => inc.date.startsWith(currentMonth));
  }, [incomes, currentMonth]);

  const totalExpenses = useMemo(() => {
    return monthExpenses.reduce((sum, exp) => sum + exp.value, 0);
  }, [monthExpenses]);

  const totalIncomes = useMemo(() => {
    return monthIncomes.reduce((sum, inc) => sum + inc.value, 0);
  }, [monthIncomes]);

  const balance = totalIncomes - totalExpenses;

  const totalByCategory = useMemo(() => {
    const map = new Map<string, number>();
    
    monthExpenses.forEach((exp) => {
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
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses, getCategoryById, totalExpenses]);

  const averagePerDay = useMemo(() => {
    const daysInMonth = new Date(
      parseInt(currentMonth.split('-')[0]),
      parseInt(currentMonth.split('-')[1]),
      0
    ).getDate();
    return totalExpenses > 0 ? totalExpenses / daysInMonth : 0;
  }, [totalExpenses, currentMonth]);

  const formattedTotalExpenses = useFormattedCurrency(totalExpenses);
  const formattedTotalIncomes = useFormattedCurrency(totalIncomes);
  const formattedBalance = useFormattedCurrency(Math.abs(balance));
  const formattedAverage = useFormattedCurrency(averagePerDay);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Resumo Mensal</Text>
          </View>
        </View>
        <MonthFilter currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIcon, { backgroundColor: theme.success + '15' }]}>
                <IconSymbol name="arrow.down.circle.fill" size={20} color={theme.success} />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Receitas</Text>
                <Text style={[styles.balanceValue, { color: theme.success }]}>
                  {formattedTotalIncomes}
                </Text>
              </View>
            </View>
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIcon, { backgroundColor: theme.danger + '15' }]}>
                <IconSymbol name="arrow.up.circle.fill" size={20} color={theme.danger} />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Gastos</Text>
                <Text style={[styles.balanceValue, { color: theme.danger }]}>
                  {formattedTotalExpenses}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.saldoRow}>
            <Text style={styles.saldoLabel}>Balanço Final</Text>
            <Text style={[styles.saldoValue, { color: balance >= 0 ? theme.success : theme.danger }]}>
              {balance >= 0 ? '+' : '-'}{formattedBalance}
            </Text>
          </View>
          <View style={styles.averageContainer}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={14} color={theme.muted} />
            <Text style={styles.average}>Média diária: {formattedAverage}</Text>
          </View>
        </View>

        {totalByCategory.length > 0 && (
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <IconSymbol name="chart.bar.fill" size={18} color={theme.tint} />
                <Text style={styles.sectionTitle}>Distribuição de Gastos</Text>
              </View>
              <View style={styles.chartContainer}>
                <BarChart
                  data={totalByCategory.map(item => ({
                    label: item.category?.name || 'Sem categoria',
                    value: item.value,
                    color: item.category?.color || theme.muted,
                    percentage: item.percentage,
                  }))}
                  maxValue={totalExpenses}
                />
              </View>
            </View>

            <View style={styles.categoriesCard}>
              <View style={styles.chartHeader}>
                <IconSymbol name="tag.fill" size={16} color={theme.tint} />
                <Text style={styles.sectionTitle}>Maiores Despesas</Text>
              </View>
              {totalByCategory.map((item) => (
                <View key={item.category?.id} style={styles.categoryItem}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      {item.category && (
                        <View
                          style={[styles.categoryIcon, { backgroundColor: item.category.color + '15' }]}
                        >
                          <IconSymbol name={item.category.icon as any} size={16} color={item.category.color} />
                        </View>
                      )}
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{item.category?.name}</Text>
                        <Text style={styles.categoryPercentage}>
                          {item.percentage.toFixed(1)}% do total
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.categoryValue}>
                      {useFormattedCurrency(item.value)}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: item.category?.color || theme.muted,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {monthExpenses.length === 0 && monthIncomes.length === 0 && (
          <View style={styles.emptyContainer}>
            <IconSymbol name="tray" size={48} color={theme.border} />
            <Text style={styles.emptyText}>
              Sem registros este mês
            </Text>
            <Text style={styles.emptySubtext}>
              Suas movimentações aparecerão aqui.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: {
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  totalCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 11,
    color: theme.muted,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  saldoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginBottom: 12,
  },
  saldoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  saldoValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  average: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartContainer: {
    marginTop: 4,
  },
  categoriesCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 1,
  },
  categoryPercentage: {
    fontSize: 11,
    color: theme.muted,
    fontWeight: '600',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  progressBar: {
    height: 5,
    backgroundColor: theme.surface,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});
