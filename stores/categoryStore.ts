import { create } from 'zustand';
import { Category } from '@/lib/types/category';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/sqlite';
import { useSyncStore } from './syncStore';
import { normalizeCategories } from '@/utils/database';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await executeQuery<any>(
        'SELECT * FROM categories ORDER BY is_default DESC, name ASC'
      );
      
      if (result.success && result.data) {
        const normalized = normalizeCategories(result.data);
        set({ categories: normalized, loading: false });
      } else {
        set({ error: result.error || 'Failed to fetch categories', loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  addCategory: async (categoryData) => {
    try {
      const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const category: Category = {
        ...categoryData,
        id,
        created_at: now,
      };

      const result = await executeInsert(
        'INSERT INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          category.id,
          category.name,
          category.icon,
          category.color,
          category.is_default ? 1 : 0,
          category.created_at,
        ]
      );

      if (result.success) {
        await useSyncStore.getState().addToSyncQueue('categories', category.id, 'INSERT', category);
        await get().fetchCategories();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Add category error:', error);
      return false;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const updates: string[] = [];
      const args: unknown[] = [];

      if (categoryData.name !== undefined) {
        updates.push('name = ?');
        args.push(categoryData.name);
      }
      if (categoryData.icon !== undefined) {
        updates.push('icon = ?');
        args.push(categoryData.icon);
      }
      if (categoryData.color !== undefined) {
        updates.push('color = ?');
        args.push(categoryData.color);
      }
      if (categoryData.is_default !== undefined) {
        updates.push('is_default = ?');
        args.push(categoryData.is_default ? 1 : 0);
      }

      if (updates.length === 0) {
        return false;
      }

      args.push(id);
      const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
      
      const result = await executeUpdate(sql, args);

      if (result.success) {
        const categoryResult = await executeQuery<any>(
          'SELECT * FROM categories WHERE id = ?',
          [id]
        );
        
        if (categoryResult.success && categoryResult.data?.[0]) {
          const normalized = normalizeCategory(categoryResult.data[0]);
          await useSyncStore.getState().addToSyncQueue(
            'categories',
            id,
            'UPDATE',
            normalized
          );
        }

        await get().fetchCategories();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update category error:', error);
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      // Check if category is default
      const category = get().categories.find(c => c.id === id);
      if (category?.is_default) {
        return false; // Cannot delete default categories
      }

      const result = await executeUpdate('DELETE FROM categories WHERE id = ?', [id]);

      if (result.success) {
        await useSyncStore.getState().addToSyncQueue('categories', id, 'DELETE', { id });
        await get().fetchCategories();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Delete category error:', error);
      return false;
    }
  },

  getCategoryById: (id) => {
    return get().categories.find(c => c.id === id);
  },
}));
