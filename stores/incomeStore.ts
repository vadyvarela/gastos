import { create } from 'zustand';
import { Platform } from 'react-native';
import { Income } from '@/lib/types/income';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/sqlite';
import { useSyncStore } from './syncStore';
import { normalizeIncomes, normalizeIncome } from '@/utils/database';

interface IncomeStore {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  filters: {
    month?: string; // YYYY-MM
    categoryId?: string;
  };
  
  // Actions
  fetchIncomes: () => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'created_at' | 'updated_at' | 'synced'>) => Promise<boolean>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<boolean>;
  deleteIncome: (id: string) => Promise<boolean>;
  setFilters: (filters: { month?: string; categoryId?: string }) => void;
  clearFilters: () => void;
}

export const useIncomeStore = create<IncomeStore>((set, get) => ({
  incomes: [],
  loading: false,
  error: null,
  filters: {},

  fetchIncomes: async () => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      let sql = 'SELECT * FROM incomes WHERE 1=1';
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
        const normalized = normalizeIncomes(result.data);
        set({ incomes: normalized, loading: false });
      } else {
        set({ error: result.error || 'Failed to fetch incomes', loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  addIncome: async (incomeData) => {
    try {
      const id = `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const income: Income = {
        ...incomeData,
        id,
        created_at: now,
        updated_at: now,
        synced: Platform.OS === 'web',
      };

      const result = await executeInsert(
        'INSERT INTO incomes (id, value, category_id, date, description, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          income.id,
          income.value,
          income.category_id,
          income.date,
          income.description,
          income.created_at,
          income.updated_at,
          income.synced ? 1 : 0,
        ]
      );

      if (result.success) {
        await useSyncStore.getState().addToSyncQueue('incomes', id, 'INSERT', income);
        await get().fetchIncomes();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Add income error:', error);
      return false;
    }
  },

  updateIncome: async (id, incomeData) => {
    try {
      const now = new Date().toISOString();
      const updates: string[] = [];
      const args: unknown[] = [];

      if (incomeData.value !== undefined) {
        updates.push('value = ?');
        args.push(incomeData.value);
      }
      if (incomeData.category_id !== undefined) {
        updates.push('category_id = ?');
        args.push(incomeData.category_id);
      }
      if (incomeData.date !== undefined) {
        updates.push('date = ?');
        args.push(incomeData.date);
      }
      if (incomeData.description !== undefined) {
        updates.push('description = ?');
        args.push(incomeData.description);
      }

      updates.push('updated_at = ?');
      updates.push('synced = ?');
      args.push(now, 0);
      args.push(id);

      const sql = `UPDATE incomes SET ${updates.join(', ')} WHERE id = ?`;
      
      const result = await executeUpdate(sql, args);

      if (result.success) {
        const incomeResult = await executeQuery<any>(
          'SELECT * FROM incomes WHERE id = ?',
          [id]
        );
        
        if (incomeResult.success && incomeResult.data?.[0]) {
          const normalized = normalizeIncome(incomeResult.data[0]);
          await useSyncStore.getState().addToSyncQueue(
            'incomes',
            id,
            'UPDATE',
            normalized
          );
        }

        await get().fetchIncomes();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update income error:', error);
      return false;
    }
  },

  deleteIncome: async (id) => {
    try {
      const result = await executeUpdate('DELETE FROM incomes WHERE id = ?', [id]);

      if (result.success) {
        await useSyncStore.getState().addToSyncQueue('incomes', id, 'DELETE', { id });
        await get().fetchIncomes();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Delete income error:', error);
      return false;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchIncomes();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchIncomes();
  },
}));
