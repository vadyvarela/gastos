import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExpenseById } from '@/hooks/useExpenses';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useFormattedDate } from '@/hooks/useFormattedDate';
import { ExpenseFormData } from '@/lib/types/expense';
import { useCategoryStore } from '@/stores/categoryStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const expense = useExpenseById(id || '');
  const { updateExpense, deleteExpense } = useExpenseStore();
  const { getCategoryById } = useCategoryStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const category = getCategoryById(expense.category_id);
  const formattedValue = useFormattedCurrency(expense.value);
  const formattedDate = useFormattedDate(expense.date);

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const success = await updateExpense(id, data);
      if (success) {
        showToast('success', 'Gasto atualizado com sucesso');
        setIsEditing(false);
      } else {
        showToast('error', 'Erro ao atualizar gasto');
      }
    } catch (error) {
      showToast('error', 'Erro ao atualizar gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    const success = await deleteExpense(id);
    if (success) {
      showToast('success', 'Gasto excluído com sucesso');
      router.back();
    } else {
      showToast('error', 'Erro ao excluir gasto');
    }
    setDeleteModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
  };

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpenseForm
          initialData={expense}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          loading={loading}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
            <IconSymbol name="pencil" size={20} color={theme.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, styles.deleteButton]}>
            <IconSymbol name="trash" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {category && (
              <View
                style={[styles.categoryIconLarge, { backgroundColor: category.color + '15' }]}
              >
                <IconSymbol name={category.icon as any} size={32} color={category.color} />
              </View>
            )}
            <Text style={[styles.value, { color: theme.danger }]}>-{formattedValue}</Text>
            <Text style={styles.description}>{expense.description}</Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Categoria</Text>
              <Text style={styles.infoValue}>
                {category?.name || 'Sem categoria'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
            {!expense.synced && (
              <View style={styles.syncRow}>
                <IconSymbol name="tray" size={14} color="#EAB308" />
                <Text style={styles.syncText}>
                  Aguardando sincronização
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir Gasto"
        message={`Tem certeza que deseja excluir "${expense.description}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmColor={theme.danger}
      />
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  deleteButton: {
    backgroundColor: theme.danger + '10',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -1.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 20,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: isDark ? 'rgba(234, 179, 8, 0.1)' : '#FEF3C7',
    padding: 10,
    borderRadius: 10,
  },
  syncText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '700',
  },
});