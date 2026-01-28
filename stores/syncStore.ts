import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/sqlite';
import { executeTursoQuery, executeTursoTransaction, checkTursoConnection } from '@/lib/turso';
import { SyncQueueItem } from '@/lib/types/database';

interface SyncStore {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncs: number;
  
  // Actions
  checkConnection: () => Promise<void>;
  addToSyncQueue: (tableName: string, recordId: string, operation: 'INSERT' | 'UPDATE' | 'DELETE', data: unknown) => Promise<void>;
  syncPending: () => Promise<void>;
  getPendingSyncs: () => Promise<number>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  isOnline: false,
  isSyncing: false,
  pendingSyncs: 0,

  checkConnection: async () => {
    const netInfo = await NetInfo.fetch();
    const online = netInfo.isConnected ?? false;
    
    set({ isOnline: online });
    
    // Auto-sync when coming online
    if (online) {
      const pending = await get().getPendingSyncs();
      if (pending > 0) {
        await get().syncPending();
      }
    }

    // Subscribe to network changes
    NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      set({ isOnline: isConnected });
      
      if (isConnected) {
        get().syncPending();
      }
    });
  },

  addToSyncQueue: async (tableName, recordId, operation, data) => {
    try {
      await executeInsert(
        'INSERT INTO sync_queue (table_name, record_id, operation, data) VALUES (?, ?, ?, ?)',
        [tableName, recordId, operation, JSON.stringify(data)]
      );
      
      await get().getPendingSyncs();
    } catch (error) {
      console.error('Add to sync queue error:', error);
    }
  },

  syncPending: async () => {
    if (get().isSyncing || !get().isOnline) {
      return;
    }

    // Check Turso connection
    const isTursoAvailable = await checkTursoConnection();
    if (!isTursoAvailable) {
      console.log('Turso not available, skipping sync');
      return;
    }

    set({ isSyncing: true });

    try {
      const queueResult = await executeQuery<SyncQueueItem>(
        'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 50'
      );

      if (!queueResult.success || !queueResult.data || queueResult.data.length === 0) {
        set({ isSyncing: false, pendingSyncs: 0 });
        return;
      }

      const queries: Array<{ sql: string; args?: unknown[] }> = [];
      const processedIds: number[] = [];

      for (const item of queueResult.data) {
        try {
          const data = JSON.parse(item.data as string);

          switch (item.operation) {
            case 'INSERT':
            case 'UPDATE':
              if (item.table_name === 'expenses') {
                queries.push({
                  sql: `INSERT OR REPLACE INTO expenses (id, value, category_id, date, description, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                  args: [
                    data.id,
                    data.value,
                    data.category_id,
                    data.date,
                    data.description,
                    data.created_at || new Date().toISOString(),
                    data.updated_at || new Date().toISOString(),
                  ],
                });
              } else if (item.table_name === 'incomes') {
                queries.push({
                  sql: `INSERT OR REPLACE INTO incomes (id, value, category_id, date, description, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                  args: [
                    data.id,
                    data.value,
                    data.category_id,
                    data.date,
                    data.description,
                    data.created_at || new Date().toISOString(),
                    data.updated_at || new Date().toISOString(),
                  ],
                });
              } else if (item.table_name === 'categories') {
                queries.push({
                  sql: `INSERT OR REPLACE INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
                  args: [
                    data.id,
                    data.name,
                    data.icon,
                    data.color,
                    data.is_default ? 1 : 0,
                    data.created_at || new Date().toISOString(),
                  ],
                });
              }
              break;

            case 'DELETE':
              queries.push({
                sql: `DELETE FROM ${item.table_name} WHERE id = ?`,
                args: [item.record_id],
              });
              break;
          }

          if (item.id) {
            processedIds.push(item.id);
          }
        } catch (error) {
          console.error(`Error processing sync item ${item.id}:`, error);
        }
      }

      if (queries.length > 0) {
        const syncResult = await executeTursoTransaction(queries);
        
        if (syncResult.success) {
          // Remove processed items from queue
          for (const id of processedIds) {
            await executeUpdate('DELETE FROM sync_queue WHERE id = ?', [id]);
          }

          // Mark expenses and incomes as synced
          for (const item of queueResult.data) {
            if (item.table_name === 'expenses' && item.operation !== 'DELETE') {
              await executeUpdate('UPDATE expenses SET synced = 1 WHERE id = ?', [item.record_id]);
            } else if (item.table_name === 'incomes' && item.operation !== 'DELETE') {
              await executeUpdate('UPDATE incomes SET synced = 1 WHERE id = ?', [item.record_id]);
            }
          }
        }
      }

      await get().getPendingSyncs();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  getPendingSyncs: async () => {
    try {
      const result = await executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM sync_queue'
      );

      if (result.success && result.data?.[0]) {
        const count = result.data[0].count;
        set({ pendingSyncs: count });
        return count;
      }
      
      return 0;
    } catch (error) {
      console.error('Get pending syncs error:', error);
      return 0;
    }
  },
}));
