import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { ExpenseFormData } from '@/lib/types/expense';
import { useExpenseStore } from '@/stores/expenseStore';
import { showToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { addExpense } = useExpenseStore();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const handleSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      const success = await addExpense(data);
      if (success) {
        showToast('success', 'Gasto adicionado com sucesso');
        router.back();
      } else {
        showToast('error', 'Erro ao adicionar gasto');
      }
    } catch (error) {
      showToast('error', 'Erro ao adicionar gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpenseForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
  },
});
