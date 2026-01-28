import { create } from 'zustand';
import { Expense } from '@/lib/types/expense';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/sqlite';
import { executeTursoQuery } from '@/lib/turso';
import { useSyncStore } from './syncStore';
import { normalizeExpenses } from '@/utils/database';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  filters: {
    month?: string; // YYYY-MM
    categoryId?: string;
  };
  
  // Actions
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'synced'>) => Promise<boolean>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  setFilters: (filters: { month?: string; categoryId?: string }) => void;
  clearFilters: () => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  filters: {},

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      let sql = 'SELECT * FROM expenses WHERE 1=1';
      const args: unknown[] = [];

      if (filters.month) {
        sql += ' AND date LIKE ?';
        args.push(`${filters.month}%`);
      }

      if (filters.categoryId) {
        sql += ' AND category_id = ?';
        args.push(filters.categoryId);
      }

      sql += ' ORDER BY date DESC, created_at DESC';

      const result = await executeQuery<any>(sql, args);
      
      if (result.success && result.data) {
        const normalized = normalizeExpenses(result.data);
        set({ expenses: normalized, loading: false });
      } else {
        set({ error: result.error || 'Failed to fetch expenses', loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  addExpense: async (expenseData) => {
    try {
      const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const expense: Expense = {
        ...expenseData,
        id,
        created_at: now,
        updated_at: now,
        synced: false,
      };

      const result = await executeInsert(
        'INSERT INTO expenses (id, value, category_id, date, description, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          expense.id,
          expense.value,
          expense.category_id,
          expense.date,
          expense.description,
          expense.created_at,
          expense.updated_at,
          expense.synced ? 1 : 0,
        ]
      );

      if (result.success) {
        // Add to sync queue
        await useSyncStore.getState().addToSyncQueue('expenses', expense.id, 'INSERT', expense);
        
        // Refresh expenses
        await get().fetchExpenses();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Add expense error:', error);
      return false;
    }
  },

  updateExpense: async (id, expenseData) => {
    try {
      const now = new Date().toISOString();
      const updates: string[] = [];
      const args: unknown[] = [];

      if (expenseData.value !== undefined) {
        updates.push('value = ?');
        args.push(expenseData.value);
      }
      if (expenseData.category_id !== undefined) {
        updates.push('category_id = ?');
        args.push(expenseData.category_id);
      }
      if (expenseData.date !== undefined) {
        updates.push('date = ?');
        args.push(expenseData.date);
      }
      if (expenseData.description !== undefined) {
        updates.push('description = ?');
        args.push(expenseData.description);
      }

      updates.push('updated_at = ?');
      updates.push('synced = ?');
      args.push(now, 0);
      args.push(id);

      const sql = `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`;
      
      const result = await executeUpdate(sql, args);

      if (result.success) {
        // Get updated expense
        const expenseResult = await executeQuery<any>(
          'SELECT * FROM expenses WHERE id = ?',
          [id]
        );
        
        if (expenseResult.success && expenseResult.data?.[0]) {
          const normalized = normalizeExpense(expenseResult.data[0]);
          await useSyncStore.getState().addToSyncQueue(
            'expenses',
            id,
            'UPDATE',
            normalized
          );
        }

        await get().fetchExpenses();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update expense error:', error);
      return false;
    }
  },

  deleteExpense: async (id) => {
    try {
      const result = await executeUpdate('DELETE FROM expenses WHERE id = ?', [id]);

      if (result.success) {
        // Add to sync queue
        await useSyncStore.getState().addToSyncQueue('expenses', id, 'DELETE', { id });
        
        await get().fetchExpenses();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Delete expense error:', error);
      return false;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchExpenses();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchExpenses();
  },
}));
