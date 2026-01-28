import { useEffect } from 'react';
import { useExpenseStore } from '@/stores/expenseStore';
import { Expense } from '@/lib/types/expense';

export function useExpenses() {
  const {
    expenses,
    loading,
    error,
    filters,
    fetchExpenses,
    setFilters,
    clearFilters,
  } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    filters,
    refetch: fetchExpenses,
    setFilters,
    clearFilters,
  };
}

export function useExpenseById(id: string): Expense | undefined {
  const { expenses } = useExpenseStore();
  return expenses.find(exp => exp.id === id);
}
