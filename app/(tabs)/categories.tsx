import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/lib/types/category';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCategoryStore } from '@/stores/categoryStore';
import { showToast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, loading } = useCategories();
  const { deleteCategory } = useCategoryStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const handleDelete = async (category: Category) => {
    if (category.is_default) {
      showToast('error', 'Não é possível excluir categorias padrão');
      return;
    }

    const success = await deleteCategory(category.id || '');
    if (success) {
      showToast('success', 'Categoria excluída com sucesso');
    } else {
      showToast('error', 'Erro ao excluir categoria');
    }
  };

  const defaultCategories = categories.filter(c => c.is_default);
  const customCategories = categories.filter(c => !c.is_default);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Categorias</Text>
          <TouchableOpacity
            onPress={() => router.push('/add-category')}
            style={styles.addButton}
          >
            <IconSymbol name="plus" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {defaultCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias Padrão</Text>
            {defaultCategories.map((category) => (
              <CategoryItem key={category.id} category={category} isDark={isDark} />
            ))}
          </View>
        )}

        {customCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minhas Categorias</Text>
            {customCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onDelete={() => handleDelete(category)}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {categories.length === 0 && (
          <EmptyState
            icon="tag"
            title="Nenhuma categoria encontrada"
            message="Adicione uma categoria para começar"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface CategoryItemProps {
  category: Category;
  onDelete?: () => void;
  isDark: boolean;
}

function CategoryItem({ category, onDelete, isDark }: CategoryItemProps) {
  const styles = getItemStyles(isDark);

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View
          style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}
        >
          <IconSymbol name={category.icon} size={22} color={category.color} />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.name}>{category.name}</Text>
          {category.is_default && (
            <Text style={styles.defaultLabel}>Padrão</Text>
          )}
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <IconSymbol name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : '#F2F2F7',
  },
  header: {
    backgroundColor: isDark ? '#1A1F2E' : '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#000000',
    letterSpacing: -0.8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const getItemStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textSection: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#F8FAFC' : '#0F172A',
    letterSpacing: -0.3,
  },
  defaultLabel: {
    fontSize: 10,
    color: isDark ? '#94A3B8' : '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
  },
});
