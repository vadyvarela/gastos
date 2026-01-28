import { useEffect } from 'react';
import { useIncomeStore } from '@/stores/incomeStore';
import { Income } from '@/lib/types/income';

export function useIncomes() {
  const {
    incomes,
    loading,
    error,
    filters,
    fetchIncomes,
    setFilters,
    clearFilters,
  } = useIncomeStore();

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return {
    incomes,
    loading,
    error,
    filters,
    refetch: fetchIncomes,
    setFilters,
    clearFilters,
  };
}

export function useIncomeById(id: string): Income | undefined {
  const { incomes } = useIncomeStore();
  return incomes.find(inc => inc.id === id);
}
