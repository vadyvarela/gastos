import React, { useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Expense } from '@/lib/types/expense';
import { ExpenseCard } from './ExpenseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ExpenseListProps {
  expenses: Expense[];
  loading?: boolean;
  onExpensePress?: (expense: Expense) => void;
  onExpenseDelete?: (expense: Expense) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ExpenseList({
  expenses,
  loading,
  onExpensePress,
  onExpenseDelete,
  onRefresh,
  refreshing,
}: ExpenseListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard
        expense={item}
        onPress={() => onExpensePress?.(item)}
        onDelete={() => onExpenseDelete?.(item)}
      />
    ),
    [onExpensePress, onExpenseDelete]
  );

  const keyExtractor = useCallback((item: Expense) => item.id || '', []);

  if (loading && expenses.length === 0) {
    return <LoadingSpinner />;
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon="tray"
        title="Nenhum gasto encontrado"
        message="Adicione seu primeiro gasto para começar"
      />
    );
  }

  return (
    <FlashList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={64}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
