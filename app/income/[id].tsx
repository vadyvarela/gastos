import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useIncomeById } from '@/hooks/useIncomes';
import { IncomeForm } from '@/components/income/IncomeForm';
import { IncomeFormData } from '@/lib/types/income';
import { useIncomeStore } from '@/stores/incomeStore';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useFormattedDate } from '@/hooks/useFormattedDate';
import { useCategoryStore } from '@/stores/categoryStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { showToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function IncomeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const income = useIncomeById(id || '');
  const { updateIncome, deleteIncome } = useIncomeStore();
  const { getCategoryById } = useCategoryStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  if (!income) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const category = getCategoryById(income.category_id);
  const formattedValue = useFormattedCurrency(income.value);
  const formattedDate = useFormattedDate(income.date);

  const handleUpdate = async (data: IncomeFormData) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const success = await updateIncome(id, data);
      if (success) {
        showToast('success', 'Receita atualizada com sucesso');
        setIsEditing(false);
      } else {
        showToast('error', 'Erro ao atualizar receita');
      }
    } catch (error) {
      showToast('error', 'Erro ao atualizar receita');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    const success = await deleteIncome(id);
    if (success) {
      showToast('success', 'Receita excluída com sucesso');
      router.back();
    } else {
      showToast('error', 'Erro ao excluir receita');
    }
    setDeleteModalVisible(false);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
  };

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <IncomeForm
          initialData={income}
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
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={isDark ? '#D1D5DB' : '#374151'} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <IconSymbol name="pencil" size={22} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <IconSymbol name="trash" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {category && (
              <View
                style={[styles.categoryIconLarge, { backgroundColor: '#10B98120' }]}
              >
                <IconSymbol name={category.icon} size={32} color="#10B981" />
              </View>
            )}
            <Text style={styles.value}>{formattedValue}</Text>
            <Text style={styles.description}>{income.description}</Text>
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
            {!income.synced && (
              <View style={styles.infoRow}>
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
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir "${income.description}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmColor="#EF4444"
      />
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : '#F2F2F7',
  },
  header: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    marginLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 42,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 8,
    letterSpacing: -1,
  },
  description: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
    fontWeight: '500',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#F1F5F9',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  syncText: {
    fontSize: 12,
    color: '#EAB308',
    fontWeight: '500',
  },
});
