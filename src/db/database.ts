import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens (and lazily initializes) bill.db. Safe to call repeatedly — reuses one connection. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = initDb();
  return dbPromise;
}

async function initDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('bill.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      name TEXT,
      date INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deal','total'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  `);

  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM transactions'
  );
  if (!row || row.count === 0) {
    await db.runAsync(
      'INSERT INTO transactions (amount, name, date, type) VALUES (?, ?, ?, ?)',
      [0, 'Start', Date.now(), 'total']
    );
  }

  return db;
}
