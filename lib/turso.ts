import Constants from 'expo-constants';

// Turso HTTP API integration for React Native
// Documentation: https://docs.turso.tech/sdk/http/quickstart

const TURSO_URL = Constants.expoConfig?.extra?.TURSO_URL || process.env.EXPO_PUBLIC_TURSO_URL;
const TURSO_AUTH_TOKEN = Constants.expoConfig?.extra?.TURSO_AUTH_TOKEN || process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;

// Convert Turso URL to HTTP API endpoint
// libsql://xxx.turso.io -> https://xxx.turso.io/v2/pipeline
function getTursoApiUrl(): string | null {
  if (!TURSO_URL) return null;
  
  // Convert libsql:// to https://
  const httpUrl = TURSO_URL.replace('libsql://', 'https://');
  // Append /v2/pipeline endpoint
  return `${httpUrl}/v2/pipeline`;
}

// Convert JavaScript value to Turso arg type
function valueToTursoArg(value: unknown): { type: string; value: string } | null {
  if (value === null || value === undefined) {
    return { type: 'null', value: 'null' };
  }
  
  if (typeof value === 'number') {
    // Check if it's an integer or float
    if (Number.isInteger(value)) {
      return { type: 'integer', value: value.toString() };
    } else {
      return { type: 'float', value: value.toString() };
    }
  }
  
  if (typeof value === 'string') {
    return { type: 'text', value };
  }
  
  if (typeof value === 'boolean') {
    return { type: 'integer', value: value ? '1' : '0' };
  }
  
  // For other types, convert to string
  return { type: 'text', value: String(value) };
}

export async function executeTursoQuery<T = unknown>(
  sql: string,
  args: unknown[] = []
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  const apiUrl = getTursoApiUrl();
  
  if (!apiUrl || !TURSO_AUTH_TOKEN) {
    return { success: false, error: 'Turso credentials not available' };
  }

  try {
    const tursoArgs = args.map(valueToTursoArg).filter((arg): arg is { type: string; value: string } => arg !== null);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql,
              args: tursoArgs,
            },
          },
          {
            type: 'close',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Turso API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.results && data.results[0] && data.results[0].response) {
      const result = data.results[0].response.result;
      
      if (result && result.rows) {
        // Convert rows to array of objects
        const rows: T[] = result.rows.map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          if (result.cols && Array.isArray(result.cols)) {
            result.cols.forEach((col: { name?: string }, index: number) => {
              if (col.name) {
                obj[col.name] = row[index];
              }
            });
          }
          return obj as T;
        });
        
        return {
          success: true,
          data: rows,
        };
      }
    }

    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error('Turso query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function executeTursoTransaction<T = unknown>(
  queries: Array<{ sql: string; args?: unknown[] }>
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  const apiUrl = getTursoApiUrl();
  
  if (!apiUrl || !TURSO_AUTH_TOKEN) {
    return { success: false, error: 'Turso credentials not available' };
  }

  try {
    const requests = queries.map(query => ({
      type: 'execute' as const,
      stmt: {
        sql: query.sql,
        args: (query.args || []).map(valueToTursoArg).filter((arg): arg is { type: string; value: string } => arg !== null),
      },
    }));

    // Add close request at the end
    requests.push({ type: 'close' as const });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Turso API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const results: T[] = [];

    if (data.results) {
      for (const result of data.results) {
        if (result.response && result.response.result && result.response.result.rows) {
          const resultData = result.response.result;
          // Convert rows to array of objects
          const rows = resultData.rows.map((row: unknown[]) => {
            const obj: Record<string, unknown> = {};
            if (resultData.cols && Array.isArray(resultData.cols)) {
              resultData.cols.forEach((col: { name?: string }, index: number) => {
                if (col.name) {
                  obj[col.name] = row[index];
                }
              });
            }
            return obj as T;
          });
          results.push(...rows);
        }
      }
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error('Turso transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkTursoConnection(): Promise<boolean> {
  try {
    const result = await executeTursoQuery('SELECT 1');
    return result.success;
  } catch {
    return false;
  }
}
