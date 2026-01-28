import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useCategoryStore } from '@/stores/categoryStore';
import { MonthFilter } from '@/components/filters/MonthFilter';
import { getCurrentMonth } from '@/utils/date';
import { useExpenseStore } from '@/stores/expenseStore';
import { useIncomeStore } from '@/stores/incomeStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BarChart } from '@/components/charts/BarChart';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SummaryScreen() {
  const { expenses } = useExpenses();
  const { incomes } = useIncomes();
  const { getCategoryById } = useCategoryStore();
  const { setFilters } = useExpenseStore();
  const { setFilters: setIncomeFilters } = useIncomeStore();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

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
            <IconSymbol name="chart.bar.fill" size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
            <Text style={styles.title}>Resumo Financeiro</Text>
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
              <View style={[styles.balanceIcon, { backgroundColor: '#10B98120' }]}>
                <IconSymbol name="arrow.down.circle.fill" size={20} color="#10B981" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Receitas</Text>
                <Text style={[styles.balanceValue, { color: '#10B981' }]}>
                  {formattedTotalIncomes}
                </Text>
              </View>
            </View>
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIcon, { backgroundColor: '#EF444420' }]}>
                <IconSymbol name="arrow.up.circle.fill" size={20} color="#EF4444" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Gastos</Text>
                <Text style={[styles.balanceValue, { color: '#EF4444' }]}>
                  {formattedTotalExpenses}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.saldoRow}>
            <Text style={styles.saldoLabel}>Saldo do Mês</Text>
            <Text style={[styles.saldoValue, { color: balance >= 0 ? '#10B981' : '#EF4444' }]}>
              {balance >= 0 ? '+' : '-'}{formattedBalance}
            </Text>
          </View>
          <View style={styles.averageContainer}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={14} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={styles.average}>Média diária de gastos: {formattedAverage}</Text>
          </View>
        </View>

        {totalByCategory.length > 0 && (
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <IconSymbol name="chart.bar" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text style={styles.sectionTitle}>Gráfico por Categoria</Text>
              </View>
              <View style={styles.chartContainer}>
                <BarChart
                  data={totalByCategory.map(item => ({
                    label: item.category?.name || 'Sem categoria',
                    value: item.value,
                    color: item.category?.color || '#6B7280',
                    percentage: item.percentage,
                  }))}
                  maxValue={totalExpenses}
                />
              </View>
            </View>

            <View style={styles.categoriesCard}>
              <View style={styles.chartHeader}>
                <IconSymbol name="tag.fill" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text style={styles.sectionTitle}>Detalhes por Categoria</Text>
              </View>
              {totalByCategory.map((item) => (
                <View key={item.category?.id} style={styles.categoryItem}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      {item.category && (
                        <View
                          style={[styles.categoryIcon, { backgroundColor: item.category.color + '25' }]}
                        >
                          <IconSymbol name={item.category.icon} size={16} color={item.category.color} />
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
                          backgroundColor: item.category?.color || '#gray',
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
            <IconSymbol name="tray" size={48} color={isDark ? '#475569' : '#CBD5E1'} />
            <Text style={styles.emptyText}>
              Nenhum registro neste mês
            </Text>
            <Text style={styles.emptySubtext}>
              Adicione receitas e gastos para ver o resumo aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : '#F2F2F7',
  },
  header: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  headerTop: {
    marginBottom: 10,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: isDark ? '#F8FAFC' : '#0F172A',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  totalCard: {
    backgroundColor: isDark ? '#1A1F2E' : '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 0,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 11,
    color: isDark ? '#94A3B8' : '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  saldoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#F1F5F9',
    marginBottom: 10,
  },
  saldoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: isDark ? '#D1D5DB' : '#475569',
    letterSpacing: 0.2,
  },
  saldoValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#F1F5F9',
  },
  average: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#0F172A',
    letterSpacing: 0.2,
  },
  chartContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  categoriesCard: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
  },
  categoryItem: {
    marginBottom: 10,
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
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#0F172A',
    marginBottom: 3,
  },
  categoryPercentage: {
    fontSize: 11,
    color: isDark ? '#94A3B8' : '#64748B',
    fontWeight: '500',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#0F172A',
  },
  progressBar: {
    height: 8,
    backgroundColor: isDark ? '#334155' : '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: isDark ? '#94A3B8' : '#64748B',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: isDark ? '#64748B' : '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
});
