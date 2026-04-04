export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  merchant: string;
}

export interface Budget {
  limit: number;
}

export interface ChartPayloadItem {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}