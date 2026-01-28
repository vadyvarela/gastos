import React, { useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Income } from '@/lib/types/income';
import { IncomeCard } from './IncomeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface IncomeListProps {
  incomes: Income[];
  loading?: boolean;
  onIncomePress?: (income: Income) => void;
  onIncomeDelete?: (income: Income) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function IncomeList({
  incomes,
  loading,
  onIncomePress,
  onIncomeDelete,
  onRefresh,
  refreshing,
}: IncomeListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Income }) => (
      <IncomeCard
        income={item}
        onPress={() => onIncomePress?.(item)}
        onDelete={() => onIncomeDelete?.(item)}
      />
    ),
    [onIncomePress, onIncomeDelete]
  );

  const keyExtractor = useCallback((item: Income) => item.id || '', []);

  if (loading && incomes.length === 0) {
    return <LoadingSpinner />;
  }

  if (incomes.length === 0) {
    return (
      <EmptyState
        icon="tray"
        title="Nenhuma receita encontrada"
        message="Adicione sua primeira receita para começar"
      />
    );
  }

  return (
    <FlashList
      data={incomes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={64}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
