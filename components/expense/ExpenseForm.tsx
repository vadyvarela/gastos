import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/useCategories';
import { ExpenseFormData, expenseFormSchema } from '@/lib/types/expense';
import { formatDateInput } from '@/utils/date';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ExpenseForm({ initialData, onSubmit, onCancel, loading }: ExpenseFormProps) {
  const { categories } = useCategories();
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark, theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
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

  const onFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Quanto você gastou?</Text>
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
                <View style={styles.inputContainer}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.valueInput}
                    placeholder="0,00"
                    placeholderTextColor={theme.muted}
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
                </View>
              );
            }}
          />
          {errors.value && (
            <Text style={styles.error}>{errors.value.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Em qual categoria?</Text>
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
                      activeOpacity={0.7}
                      style={[
                        styles.categoryChip,
                        value === category.id ? { borderColor: category.color, backgroundColor: theme.card } : { borderColor: 'transparent', backgroundColor: theme.surface },
                      ]}
                    >
                      <View style={styles.categoryChipContent}>
                        <IconSymbol name={category.icon as any} size={18} color={value === category.id ? category.color : theme.muted} />
                        <Text
                          style={[
                            styles.categoryChipText,
                            { color: value === category.id ? category.color : theme.muted }
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
          <Text style={styles.label}>Quando foi isso?</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="calendar" size={18} color={theme.tint} />
                  <Text style={styles.dateText}>
                    {new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
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
          <Text style={styles.label}>O que você comprou?</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Almoço no shopping..."
                placeholderTextColor={theme.muted}
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
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSubmit(onFormSubmit)}
            style={[styles.button, styles.submitButton]}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Processando...' : 'Registrar Gasto'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.muted,
    marginRight: 6,
  },
  valueInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: theme.danger,
    letterSpacing: -0.5,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 14,
  },
  dateText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
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
    marginTop: 8,
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
    backgroundColor: theme.danger,
    shadowColor: theme.danger,
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
