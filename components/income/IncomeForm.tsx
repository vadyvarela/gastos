import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IncomeFormData, incomeFormSchema } from '@/lib/types/income';
import { useCategories } from '@/hooks/useCategories';
import { formatDateInput } from '@/utils/date';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface IncomeFormProps {
  initialData?: Partial<IncomeFormData>;
  onSubmit: (data: IncomeFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function IncomeForm({ initialData, onSubmit, onCancel, loading }: IncomeFormProps) {
  const { categories } = useCategories();
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      value: initialData?.value || 0,
      category_id: initialData?.category_id || '',
      date: initialData?.date || formatDateInput(new Date()),
      description: initialData?.description || '',
    },
  });

  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    if (initialData?.date) {
      setDate(new Date(initialData.date));
    }
  }, [initialData]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      setValue('date', formatDateInput(selectedDate));
    }
  };

  const onFormSubmit = async (data: IncomeFormData) => {
    await onSubmit(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.field}>
          <Text style={styles.label}>Valor</Text>
          <Controller
            control={control}
            name="value"
            render={({ field: { onChange, value } }) => {
              const [inputValue, setInputValue] = useState(
                value > 0 ? value.toString() : ''
              );
              
              useEffect(() => {
                if (value > 0) {
                  setInputValue(value.toString());
                } else if (value === 0) {
                  setInputValue('');
                }
              }, [value]);

              return (
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="decimal-pad"
                  value={inputValue}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/[^\d.,]/g, '');
                    cleaned = cleaned.replace(',', '.');
                    const dotIndex = cleaned.indexOf('.');
                    if (dotIndex !== -1) {
                      const before = cleaned.substring(0, dotIndex);
                      const after = cleaned.substring(dotIndex + 1).replace(/\./g, '');
                      cleaned = before + '.' + after;
                      if (after.length > 2) {
                        cleaned = before + '.' + after.substring(0, 2);
                      }
                    }
                    setInputValue(cleaned);
                    const numericValue = parseFloat(cleaned) || 0;
                    onChange(numericValue);
                  }}
                />
              );
            }}
          />
          {errors.value && (
            <Text style={styles.error}>{errors.value.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <Controller
            control={control}
            name="category_id"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <View style={styles.categoryRow}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => onChange(category.id)}
                      style={[
                        styles.categoryChip,
                        value === category.id ? styles.categoryChipSelected : styles.categoryChipUnselected,
                      ]}
                    >
                      <View style={styles.categoryChipContent}>
                        <IconSymbol name={category.icon} size={18} color={category.color} />
                        <Text
                          style={[
                            styles.categoryChipText,
                            value === category.id ? styles.categoryChipTextSelected : styles.categoryChipTextUnselected,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          />
          {errors.category_id && (
            <Text style={styles.error}>{errors.category_id.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateText}>
                    {new Date(value).toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </>
            )}
          />
          {errors.date && (
            <Text style={styles.error}>{errors.date.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descrição</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva a receita..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                numberOfLines={3}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.description && (
            <Text style={styles.error}>{errors.description.message}</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSubmit(onFormSubmit)}
            style={[styles.button, styles.submitButton]}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#D1D5DB' : '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#4B5563' : '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  categoryChipSelected: {
    borderColor: '#34C759',
    backgroundColor: isDark ? '#2C2C2E' : '#E8F5E9',
  },
  categoryChipUnselected: {
    borderColor: isDark ? '#4B5563' : '#E5E7EB',
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: {
    marginLeft: 0,
    fontWeight: '500',
    fontSize: 13,
  },
  categoryChipTextSelected: {
    color: isDark ? '#6EE7B7' : '#059669',
  },
  categoryChipTextUnselected: {
    color: isDark ? '#D1D5DB' : '#374151',
  },
  dateButton: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#4B5563' : '#E5E7EB',
    borderRadius: 10,
    padding: 12,
  },
  dateText: {
    color: isDark ? '#FFFFFF' : '#111827',
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: isDark ? '#374151' : '#F3F4F6',
  },
  cancelButtonText: {
    color: isDark ? '#FFFFFF' : '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#34C759',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
