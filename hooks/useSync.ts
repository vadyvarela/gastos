import { useEffect } from 'react';
import { useSyncStore } from '@/stores/syncStore';

export function useSync() {
  const { isOnline, isSyncing, pendingSyncs, checkConnection, syncPending } = useSyncStore();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isOnline,
    isSyncing,
    pendingSyncs,
    sync: syncPending,
    checkConnection,
  };
}
