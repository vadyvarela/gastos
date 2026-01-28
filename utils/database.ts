import { Expense } from '@/lib/types/expense';
import { Income } from '@/lib/types/income';
import { Category } from '@/lib/types/category';

/**
 * Normaliza um expense do banco de dados (converte synced de 0/1 para boolean)
 */
export function normalizeExpense(expense: any): Expense {
  return {
    ...expense,
    synced: expense.synced === 1 || expense.synced === true,
    value: typeof expense.value === 'string' ? parseFloat(expense.value) : expense.value,
  };
}

/**
 * Normaliza uma categoria do banco de dados (converte is_default de 0/1 para boolean)
 */
export function normalizeCategory(category: any): Category {
  return {
    ...category,
    is_default: category.is_default === 1 || category.is_default === true,
  };
}

/**
 * Normaliza um array de expenses
 */
export function normalizeExpenses(expenses: any[]): Expense[] {
  return expenses.map(normalizeExpense);
}

/**
 * Normaliza um income do banco de dados (converte synced de 0/1 para boolean)
 */
export function normalizeIncome(income: any): Income {
  return {
    ...income,
    synced: income.synced === 1 || income.synced === true,
    value: typeof income.value === 'string' ? parseFloat(income.value) : income.value,
  };
}

/**
 * Normaliza um array de incomes
 */
export function normalizeIncomes(incomes: any[]): Income[] {
  return incomes.map(normalizeIncome);
}

/**
 * Normaliza um array de categories
 */
export function normalizeCategories(categories: any[]): Category[] {
  return categories.map(normalizeCategory);
}
