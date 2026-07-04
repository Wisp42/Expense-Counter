/** Largest absolute balance the counter's single-line display is designed for; beyond this
 * the number is replaced by a joke overflow modal instead of an unreadably shrunk string. */
export const MAX_DISPLAY_BALANCE = 9_999_999_999_999;

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

/** Local (device tz) calendar day key, e.g. "2026-07-04". */
export function ymdLocal(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function timeLocal(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function dateGroupLabel(ms: number, now: number = Date.now()): string {
  const day = ymdLocal(ms);
  const today = ymdLocal(now);
  const yesterday = ymdLocal(now - 24 * 60 * 60 * 1000);
  if (day === today) return 'Сегодня';
  if (day === yesterday) return 'Вчера';
  const [y, m, d] = day.split('-');
  return `${d}.${m}.${y}`;
}

export function dateTimeLabel(ms: number, now: number = Date.now()): string {
  return `${dateGroupLabel(ms, now)}, ${timeLocal(ms)}`;
}

/** Formats a raw amount (no currency), dropping trailing decimal zeros, keeping sign as passed. */
export function formatAmount(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

/** Formats the main balance, honoring the rounding setting. */
export function formatBalance(n: number, roundBalance: boolean): string {
  if (roundBalance) return Math.round(n).toLocaleString('ru-RU');
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formats a deal/total amount for the history list: signed, no forced decimals. */
export function formatSignedAmount(n: number, type: 'deal' | 'total'): string {
  if (type === 'deal' && n > 0) return '+' + formatAmount(n);
  return formatAmount(n);
}

/** Local start-of-day ms for a "YYYY-MM-DD" string, device tz. */
export function startOfDayMs(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

/** Local end-of-day ms for a "YYYY-MM-DD" string, device tz. */
export function endOfDayMs(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}
