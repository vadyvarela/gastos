import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { categoriesTable, expensesTable, incomesTable, syncQueueTable, createIndexes } from './db/schema';
import { executeTursoQuery, executeTursoTransaction } from './turso';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') return null;
  
  if (!db) {
    db = await SQLite.openDatabaseAsync('gasto.db');
    await initializeDatabase();
  }
  return db;
}

async function initializeDatabase(): Promise<void> {
  if (!db) return;

  try {
    // Create tables
    await db.execAsync(categoriesTable);
    await db.execAsync(expensesTable);
    await db.execAsync(incomesTable);
    await db.execAsync(syncQueueTable);
    await db.execAsync(createIndexes);

    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  if (!db) return;

  try {
    // Check if migrations table exists
    const migrationsTable = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='migrations'"
    );

    if (!migrationsTable || migrationsTable.count === 0) {
      // Create migrations table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS migrations (
          version INTEGER PRIMARY KEY,
          applied_at TEXT DEFAULT (datetime('now'))
        )
      `);
    }

    // Get last migration version
    const lastMigration = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations'
    );
    const lastVersion = lastMigration?.version || 0;

    // Apply migrations
    if (lastVersion < 1) {
      // Migration 001: Initial schema (already created above)
      await db.runAsync('INSERT INTO migrations (version) VALUES (1)');
    }

    if (lastVersion < 2) {
      // Migration 002: Default categories
      const defaultCategories = [
        ['cat-food', 'Alimentação', 'restaurant', '#FF6B6B', 1],
        ['cat-transport', 'Transporte', 'car', '#4ECDC4', 1],
        ['cat-shopping', 'Compras', 'bag', '#45B7D1', 1],
        ['cat-bills', 'Contas', 'receipt', '#FFA07A', 1],
        ['cat-entertainment', 'Entretenimento', 'film', '#98D8C8', 1],
        ['cat-health', 'Saúde', 'medical', '#F7DC6F', 1],
        ['cat-education', 'Educação', 'book', '#BB8FCE', 1],
        ['cat-other', 'Outros', 'ellipsis', '#95A5A6', 1],
      ];

      const stmt = await db.prepareAsync(
        'INSERT OR IGNORE INTO categories (id, name, icon, color, is_default) VALUES (?, ?, ?, ?, ?)'
      );

      for (const category of defaultCategories) {
        await stmt.executeAsync(category);
      }

      await stmt.finalizeAsync();
      await db.runAsync('INSERT INTO migrations (version) VALUES (2)');
    }

    if (lastVersion < 3) {
      // Migration 003: Add incomes table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS incomes (
          id TEXT PRIMARY KEY,
          value REAL NOT NULL,
          category_id TEXT NOT NULL,
          date TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          synced INTEGER DEFAULT 0,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);
      await db.execAsync('CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date)');
      await db.execAsync('CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category_id)');
      await db.execAsync('CREATE INDEX IF NOT EXISTS idx_incomes_synced ON incomes(synced)');
      await db.runAsync('INSERT INTO migrations (version) VALUES (3)');
    }
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

export async function executeQuery<T = unknown>(
  sql: string,
  args: unknown[] = []
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      return await executeTursoQuery<T>(sql, args);
    }

    const database = await getDatabase();
    if (!database) throw new Error('Database not available');
    
    const result = await database.getAllAsync<T>(sql, args as any);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('SQLite query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function executeTransaction<T = unknown>(
  queries: Array<{ sql: string; args?: unknown[] }>
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      // For now, on web we execute them using Turso transaction
      return await executeTursoTransaction<T>(queries);
    }

    const database = await getDatabase();
    if (!database) throw new Error('Database not available');
    
    const results: T[] = [];

    await database.withTransactionAsync(async () => {
      for (const query of queries) {
        const result = await database.getAllAsync<T>(query.sql, (query.args || []) as any);
        results.push(...result);
      }
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error('SQLite transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function executeInsert(
  sql: string,
  args: unknown[] = []
): Promise<{ success: boolean; lastInsertRowId?: number; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      const result = await executeTursoQuery(sql, args);
      return { success: result.success, error: result.error };
    }

    const database = await getDatabase();
    if (!database) throw new Error('Database not available');
    
    const result = await database.runAsync(sql, args as any);
    
    return {
      success: true,
      lastInsertRowId: result.lastInsertRowId,
    };
  } catch (error) {
    console.error('SQLite insert error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function executeUpdate(
  sql: string,
  args: unknown[] = []
): Promise<{ success: boolean; changes?: number; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      const result = await executeTursoQuery(sql, args);
      return { success: result.success, error: result.error };
    }

    const database = await getDatabase();
    if (!database) throw new Error('Database not available');
    
    const result = await database.runAsync(sql, args as any);
    
    return {
      success: true,
      changes: result.changes,
    };
  } catch (error) {
    console.error('SQLite update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
