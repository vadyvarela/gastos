import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IncomeForm } from '@/components/income/IncomeForm';
import { IncomeFormData } from '@/lib/types/income';
import { useIncomeStore } from '@/stores/incomeStore';
import { showToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddIncomeScreen() {
  const router = useRouter();
  const { addIncome } = useIncomeStore();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const handleSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    try {
      const success = await addIncome(data);
      if (success) {
        showToast('success', 'Receita adicionada com sucesso');
        router.back();
      } else {
        showToast('error', 'Erro ao adicionar receita');
      }
    } catch (error) {
      showToast('error', 'Erro ao adicionar receita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <IncomeForm
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
