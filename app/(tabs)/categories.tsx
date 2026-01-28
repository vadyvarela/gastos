import { CategoryForm } from '@/components/category/CategoryForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryFormData } from '@/lib/types/category';
import { useCategoryStore } from '@/stores/categoryStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { deleteCategory, addCategory, updateCategory } = useCategoryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    setFormLoading(true);
    try {
      let success = false;
      if (editingCategory?.id) {
        success = await updateCategory(editingCategory.id, data);
        if (success) showToast('success', 'Categoria atualizada');
      } else {
        success = await addCategory(data);
        if (success) showToast('success', 'Categoria criada');
      }

      if (success) {
        setModalVisible(false);
        setEditingCategory(null);
      } else {
        showToast('error', 'Erro ao salvar categoria');
      }
    } catch (error) {
      showToast('error', 'Erro ao salvar categoria');
    } finally {
      setFormLoading(false);
    }
  };

  const defaultCategories = categories.filter(c => c.is_default);
  const customCategories = categories.filter(c => !c.is_default);

  if (categoriesLoading && categories.length === 0) {
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
            style={styles.addButton}
            onPress={handleAdd}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {defaultCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias Padrão</Text>
            {defaultCategories.map((category) => (
              <CategoryItem 
                key={category.id} 
                category={category} 
                theme={theme} 
                isDark={isDark} 
              />
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
                onEdit={() => handleEdit(category)}
                theme={theme}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.container, { padding: 0 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <CategoryForm 
            initialData={editingCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setModalVisible(false)}
            loading={formLoading}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface CategoryItemProps {
  category: Category;
  onDelete?: () => void;
  onEdit?: () => void;
  theme: any;
  isDark: boolean;
}

function CategoryItem({ category, onDelete, onEdit, theme, isDark }: CategoryItemProps) {
  const styles = getItemStyles(isDark, theme);

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.leftSection} 
        onPress={onEdit}
        disabled={category.is_default}
        activeOpacity={0.6}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}
        >
          <IconSymbol name={category.icon as any} size={22} color={category.color} />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.name}>{category.name}</Text>
          {category.is_default && (
            <Text style={styles.defaultLabel}>Sistema</Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        {!category.is_default && onEdit && (
          <TouchableOpacity onPress={onEdit} style={[styles.actionButton, styles.editButton]} activeOpacity={0.6}>
            <IconSymbol name="pencil" size={16} color={theme.tint} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={[styles.actionButton, styles.deleteButton]} activeOpacity={0.6}>
            <IconSymbol name="trash" size={16} color={theme.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.8,
  },
  addButton: {
    backgroundColor: theme.tint,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
});

const getItemStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.15 : 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textSection: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: -0.2,
  },
  defaultLabel: {
    fontSize: 10,
    color: theme.muted,
    marginTop: 1,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.surface,
  },
  editButton: {
    backgroundColor: theme.tint + '10',
  },
  deleteButton: {
    backgroundColor: theme.danger + '10',
  },
});