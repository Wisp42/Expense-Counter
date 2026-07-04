import { getDb } from './database';
import { notifyDbChange } from './dbEvents';
import {
  dateGroupLabel,
  dateTimeLabel,
  endOfDayMs,
  formatSignedAmount,
  startOfDayMs,
  ymdLocal,
} from '../utils/format';
import type { HistoryFilter, HistoryGroup, HistoryRow, Transaction, TxnType } from '../utils/types';

/** Balance = amount of the most recent `total` row + sum of `deal` rows created after it.
 * "After" is tracked by `id` (strictly monotonic with creation order) rather than raw
 * `date`, so millisecond timestamp collisions on rapid taps can't misattribute a deal. */
export async function getBalance(): Promise<number> {
  const db = await getDb();
  const lastTotal = await db.getFirstAsync<{ id: number; amount: number }>(
    "SELECT id, amount FROM transactions WHERE type = 'total' ORDER BY id DESC LIMIT 1"
  );
  if (!lastTotal) return 0;
  const sumRow = await db.getFirstAsync<{ s: number }>(
    "SELECT COALESCE(SUM(amount), 0) as s FROM transactions WHERE type = 'deal' AND id > ?",
    [lastTotal.id]
  );
  return lastTotal.amount + (sumRow?.s ?? 0);
}

export async function insertDeal(amount: number, name: string | null): Promise<void> {
  const db = await getDb();
  const cleanName = name && name.trim() ? name.trim() : null;
  await db.runAsync(
    'INSERT INTO transactions (amount, name, date, type) VALUES (?, ?, ?, ?)',
    [amount, cleanName, Date.now(), 'deal']
  );
  notifyDbChange();
}

export async function insertManualTotal(amount: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO transactions (amount, name, date, type) VALUES (?, ?, ?, ?)',
    [amount, null, Date.now(), 'total']
  );
  notifyDbChange();
}

/** Quick "+ add name" action from the history list — only ever applies to `deal` rows. */
export async function setTransactionName(id: number, name: string): Promise<void> {
  const db = await getDb();
  const cleanName = name.trim();
  if (!cleanName) return;
  await db.runAsync("UPDATE transactions SET name = ? WHERE id = ? AND type = 'deal'", [
    cleanName,
    id,
  ]);
  notifyDbChange();
}

/** Edit modal save. Name is ignored (forced null) for `total` rows, per spec. */
export async function updateTransaction(
  id: number,
  amount: number,
  name: string | null
): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ type: TxnType }>(
    'SELECT type FROM transactions WHERE id = ?',
    [id]
  );
  if (!row) return;
  const cleanName = row.type === 'total' ? null : name && name.trim() ? name.trim() : null;
  await db.runAsync('UPDATE transactions SET amount = ?, name = ? WHERE id = ?', [
    amount,
    cleanName,
    id,
  ]);
  notifyDbChange();
}

/** The seeded "Start" row is protected from deletion — everything else can go. */
export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ type: TxnType; name: string | null }>(
    'SELECT type, name FROM transactions WHERE id = ?',
    [id]
  );
  if (!row) return;
  if (row.type === 'total' && row.name === 'Start') return;
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  notifyDbChange();
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', [
    id,
  ]);
  return row ?? null;
}

async function getFilteredTransactions(filter: HistoryFilter): Promise<Transaction[]> {
  const db = await getDb();
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filter.type === 'income') {
    where.push("type = 'deal' AND amount > 0");
  } else if (filter.type === 'expense') {
    where.push("type = 'deal' AND amount < 0");
  } else if (filter.type === 'balance_change') {
    where.push("type = 'total'");
  }
  if (filter.startDate) {
    where.push('date >= ?');
    params.push(startOfDayMs(filter.startDate));
  }
  if (filter.endDate) {
    where.push('date <= ?');
    params.push(endOfDayMs(filter.endDate));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions ${whereSql} ORDER BY date DESC, id DESC`,
    params
  );
}

function toHistoryRow(t: Transaction): HistoryRow {
  const isTotal = t.type === 'total';
  const hasName = isTotal || !!(t.name && t.name.trim());
  return {
    id: t.id,
    type: t.type,
    hasName,
    displayName: isTotal ? 'Изменение баланса' : t.name,
    dateTime: dateTimeLabel(t.date),
    amount: t.amount,
    amountDisplay: formatSignedAmount(t.amount, t.type),
    amountColor: isTotal ? 'main' : t.amount < 0 ? 'red' : 'green',
    isProtectedStart: isTotal && t.name === 'Start',
  };
}

export async function getGroupedHistory(filter: HistoryFilter): Promise<HistoryGroup[]> {
  const rows = await getFilteredTransactions(filter);
  const groups: HistoryGroup[] = [];
  const byDay = new Map<string, HistoryGroup>();
  for (const t of rows) {
    const key = ymdLocal(t.date);
    let group = byDay.get(key);
    if (!group) {
      group = { label: dateGroupLabel(t.date), items: [] };
      byDay.set(key, group);
      groups.push(group);
    }
    group.items.push(toHistoryRow(t));
  }
  return groups;
}
