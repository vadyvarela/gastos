import { z } from 'zod';
import { expenseSchema, categorySchema } from '@/lib/types/expense';
import { Category } from '@/lib/types/category';

// Re-export schemas
export { expenseSchema, categorySchema };

/**
 * Valida um valor monetário
 */
export const currencySchema = z
  .number()
  .positive('O valor deve ser maior que zero')
  .max(999999999.99, 'Valor muito alto');

/**
 * Valida uma data no formato YYYY-MM-DD
 */
export const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Data deve estar no formato YYYY-MM-DD'
);

/**
 * Valida um ID de categoria
 */
export function validateCategoryId(
  categoryId: string,
  categories: Category[]
): boolean {
  return categories.some(cat => cat.id === categoryId);
}
