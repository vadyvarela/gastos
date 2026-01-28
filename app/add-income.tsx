import { IncomeForm } from '@/components/income/IncomeForm';
import { showToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IncomeFormData } from '@/lib/types/income';
import { useIncomeStore } from '@/stores/incomeStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AddIncomeScreen() {
  const router = useRouter();
  const { addIncome } = useIncomeStore();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

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

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
});
