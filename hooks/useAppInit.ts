import { useEffect, useState } from 'react';
import { getDatabase } from '@/lib/sqlite';
import { useCategoryStore } from '@/stores/categoryStore';
import { useSyncStore } from '@/stores/syncStore';

export function useAppInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchCategories } = useCategoryStore();
  const { checkConnection } = useSyncStore();

  useEffect(() => {
    async function init() {
      try {
        // Initialize database
        await getDatabase();
        
        // Load initial data
        await fetchCategories();
        
        // Check network connection
        await checkConnection();
        
        setIsInitialized(true);
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
      }
    }

    init();
  }, [fetchCategories, checkConnection]);

  return { isInitialized, error };
}
