export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QueryResult {
  lastInsertRowid?: number;
  changes?: number;
}

export interface SyncQueueItem {
  id?: number;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: string; // JSON stringified data
  created_at?: string;
}
