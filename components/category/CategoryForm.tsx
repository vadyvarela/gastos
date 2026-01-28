import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Category, CategoryFormData, categoryFormSchema } from '@/lib/types/category';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORY_ICONS = [
  'restaurant', 'car', 'bag', 'receipt', 'film', 'medical', 'book', 'ellipsis',
  'house', 'cart', 'heart', 'star', 'gift', 'airplane', 'fitness', 'music.note',
  'briefcase', 'creditcard', 'bolt', 'gamecontroller'
];

const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#95A5A6',
  '#6366F1', '#10B981', '#F43F5E', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#3B82F6'
];

export function CategoryForm({ initialData, onSubmit, onCancel, loading }: CategoryFormProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      icon: initialData.icon,
      color: initialData.color,
      is_default: !!initialData.is_default,
    } : {
      name: '',
      icon: 'tag',
      color: '#6366F1',
      is_default: false,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field}>
          <Text style={styles.label}>Nome da Categoria</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && { borderColor: theme.danger }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ex: Aluguel, Investimentos..."
                placeholderTextColor={theme.muted}
              />
            )}
          />
          {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Escolha um Ícone</Text>
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      value === icon && { backgroundColor: theme.tint + '20', borderColor: theme.tint }
                    ]}
                    onPress={() => onChange(icon)}
                  >
                    <IconSymbol name={icon as any} size={24} color={value === icon ? theme.tint : theme.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.icon && <Text style={styles.error}>{errors.icon.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Escolha uma Cor</Text>
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      value === color && styles.colorOptionSelected
                    ]}
                    onPress={() => onChange(color)}
                  >
                    {value === color && (
                      <IconSymbol name="checkmark" size={16} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.color && <Text style={styles.error}>{errors.color.message}</Text>}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {initialData ? 'Atualizar' : 'Criar Categoria'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: theme.surface,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.text,
    transform: [{ scale: 1.1 }],
  },
  error: {
    color: theme.danger,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  cancelButtonText: {
    color: theme.muted,
    fontWeight: '700',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: theme.tint,
    shadowColor: theme.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
