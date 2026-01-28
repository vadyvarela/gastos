import { useEffect } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import { Category } from '@/lib/types/category';

export function useCategories() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
  } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    getCategoryById,
  };
}
