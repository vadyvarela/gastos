import { ExpenseList } from '@/components/expense/ExpenseList';
import { CategoryFilter } from '@/components/filters/CategoryFilter';
import { MonthFilter } from '@/components/filters/MonthFilter';
import { IncomeList } from '@/components/income/IncomeList';
import { SummaryCard } from '@/components/summary/SummaryCard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/useCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { useSync } from '@/hooks/useSync';
import { Expense } from '@/lib/types/expense';
import { Income } from '@/lib/types/income';
import { useExpenseStore } from '@/stores/expenseStore';
import { useIncomeStore } from '@/stores/incomeStore';
import { getCurrentMonth } from '@/utils/date';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';

type TabType = 'expenses' | 'incomes';

export default function HomeScreen() {
  const router = useRouter();
  const { expenses, loading: expensesLoading, filters, setFilters, refetch: refetchExpenses } = useExpenses();
  const { incomes, loading: incomesLoading, refetch: refetchIncomes } = useIncomes();
  const { categories } = useCategories();
  const { isOnline } = useSync();
  const { deleteExpense } = useExpenseStore();
  const { deleteIncome } = useIncomeStore();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'expense' | 'income'; item: Expense | Income } | null>(null);

  useEffect(() => {
    setFilters({ month: currentMonth, categoryId: filters.categoryId });
    useIncomeStore.getState().setFilters({ month: currentMonth, categoryId: filters.categoryId });
  }, [currentMonth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchExpenses(), refetchIncomes()]);
    setRefreshing(false);
  };

  const handleExpensePress = (expense: { id?: string }) => {
    if (expense.id) {
      router.push(`/expense/${expense.id}`);
    }
  };

  const handleIncomePress = (income: { id?: string }) => {
    if (income.id) {
      router.push(`/income/${income.id}`);
    }
  };

  const handleExpenseDelete = (expense: Expense) => {
    setItemToDelete({ type: 'expense', item: expense });
    setDeleteModalVisible(true);
  };

  const handleIncomeDelete = (income: Income) => {
    setItemToDelete({ type: 'income', item: income });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    let success = false;
    if (itemToDelete.type === 'expense') {
      success = await deleteExpense((itemToDelete.item as Expense).id!);
      if (success) {
        showToast('success', 'Gasto removido com sucesso');
      }
    } else {
      success = await deleteIncome((itemToDelete.item as Income).id!);
      if (success) {
        showToast('success', 'Receita removida com sucesso');
      }
    }
    
    if (!success) {
      showToast('error', 'Erro ao remover');
    }
    
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const handleCategorySelect = (categoryId?: string) => {
    setFilters({ month: currentMonth, categoryId });
    useIncomeStore.getState().setFilters({ month: currentMonth, categoryId });
  };

  const filteredExpenses = expenses.filter(exp => {
    if (filters.month && !exp.date.startsWith(filters.month)) {
      return false;
    }
    if (filters.categoryId && exp.category_id !== filters.categoryId) {
      return false;
    }
    return true;
  });

  const filteredIncomes = incomes.filter(inc => {
    const incomeFilters = useIncomeStore.getState().filters;
    if (incomeFilters.month && !inc.date.startsWith(incomeFilters.month)) {
      return false;
    }
    if (incomeFilters.categoryId && inc.category_id !== incomeFilters.categoryId) {
      return false;
    }
    return true;
  });

  const loading = expensesLoading || incomesLoading;
  const styles = getStyles(isDark, theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Minhas Finanças</Text>
              {!isOnline && (
                <View style={styles.offlineBadge}>
                  <View style={styles.offlineDot} />
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
            </View>
            <View style={styles.addButtons}>
              <TouchableOpacity
                onPress={() => router.push('/add-income')}
                activeOpacity={0.7}
                style={[styles.addButton, { backgroundColor: theme.success + '15' }]}
              >
                <IconSymbol name="plus" size={20} color={theme.success} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/add-expense')}
                activeOpacity={0.7}
                style={[styles.addButton, { backgroundColor: theme.danger + '15' }]}
              >
                <IconSymbol name="minus" size={20} color={theme.danger} />
              </TouchableOpacity>
            </View>
          </View>

          <MonthFilter currentMonth={currentMonth} onMonthChange={handleMonthChange} />
          <CategoryFilter
            categories={categories}
            selectedCategoryId={filters.categoryId}
            onCategorySelect={handleCategorySelect}
          />
        </View>

        {loading && expenses.length === 0 && incomes.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SummaryCard expenses={filteredExpenses} incomes={filteredIncomes} month={currentMonth} />
            
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
                onPress={() => setActiveTab('expenses')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
                  Gastos ({filteredExpenses.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'incomes' && styles.tabActive]}
                onPress={() => setActiveTab('incomes')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'incomes' && styles.tabTextActive]}>
                  Receitas ({filteredIncomes.length})
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'expenses' ? (
              <ExpenseList
                expenses={filteredExpenses}
                loading={expensesLoading}
                onExpensePress={handleExpensePress}
                onExpenseDelete={handleExpenseDelete}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            ) : (
              <IncomeList
                incomes={filteredIncomes}
                loading={incomesLoading}
                onIncomePress={handleIncomePress}
                onIncomeDelete={handleIncomeDelete}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          </ScrollView>
        )}

        <ConfirmModal
          visible={deleteModalVisible}
          title="Excluir Transação"
          message={`Tem certeza que deseja excluir "${itemToDelete?.item.description || 'esta transação'}"?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmColor={theme.danger}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.8,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EAB308',
  },
  offlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EAB308',
    textTransform: 'uppercase',
  },
  addButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.muted,
  },
  tabTextActive: {
    color: theme.text,
  },
});
