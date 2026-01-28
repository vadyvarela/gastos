import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { useCategories } from '@/hooks/useCategories';
import { useSync } from '@/hooks/useSync';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { IncomeList } from '@/components/income/IncomeList';
import { SummaryCard } from '@/components/summary/SummaryCard';
import { MonthFilter } from '@/components/filters/MonthFilter';
import { CategoryFilter } from '@/components/filters/CategoryFilter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useExpenseStore } from '@/stores/expenseStore';
import { useIncomeStore } from '@/stores/incomeStore';
import { getCurrentMonth } from '@/utils/date';
import { showToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Expense } from '@/lib/types/expense';
import { Income } from '@/lib/types/income';

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
  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Financeiro</Text>
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
                activeOpacity={0.8}
                style={styles.addButton}
              >
                <LinearGradient
                  colors={['#34C759', '#30D158']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <IconSymbol name="plus" size={20} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/add-expense')}
                activeOpacity={0.8}
                style={styles.addButton}
              >
                <LinearGradient
                  colors={['#FF3B30', '#FF453A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <IconSymbol name="minus" size={20} color="#ffffff" />
                </LinearGradient>
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
          title="Confirmar exclusão"
          message={`Tem certeza que deseja excluir "${itemToDelete?.item.description || 'este item'}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmColor="#EF4444"
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : '#F5F5F7',
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
    marginBottom: 10,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#000000',
    letterSpacing: -0.6,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? '#78350F' : '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    letterSpacing: 0.3,
  },
  addButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#8E8E93' : '#8E8E93',
  },
  tabTextActive: {
    color: isDark ? '#FFFFFF' : '#000000',
    fontWeight: '600',
  },
});
