export type TxnType = 'deal' | 'total';

export interface Transaction {
  id: number;
  amount: number;
  name: string | null;
  date: number;
  type: TxnType;
}

export type FilterType = 'all' | 'income' | 'expense' | 'balance_change';

export interface HistoryFilter {
  type: FilterType;
  startDate: string | null; // 'YYYY-MM-DD', local
  endDate: string | null; // 'YYYY-MM-DD', local
}

export interface HistoryRow {
  id: number;
  type: TxnType;
  hasName: boolean;
  displayName: string | null;
  dateTime: string;
  amount: number;
  amountDisplay: string;
  amountColor: 'red' | 'green' | 'main';
  isProtectedStart: boolean;
}

export interface HistoryGroup {
  label: string;
  items: HistoryRow[];
}
