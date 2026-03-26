// Mock + real transaction data hook
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  merchant: string;
  date: string;
  note?: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Entertainment: '#ec4899',
  Healthcare: '#10b981',
  Utilities: '#64748b',
  Salary: '#059669',
  Investment: '#6366f1',
  Other: '#94a3b8',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'expense', amount: 450,  category: 'Food',           merchant: 'Swiggy',         date: '2026-03-25' },
  { id: '2', type: 'expense', amount: 1200, category: 'Transport',      merchant: 'Ola Cab',        date: '2026-03-24' },
  { id: '3', type: 'income',  amount: 85000,category: 'Salary',         merchant: 'Employer',       date: '2026-03-01' },
  { id: '4', type: 'expense', amount: 3200, category: 'Shopping',       merchant: 'Amazon',         date: '2026-03-22' },
  { id: '5', type: 'expense', amount: 299,  category: 'Entertainment',  merchant: 'Netflix',        date: '2026-03-20' },
  { id: '6', type: 'expense', amount: 850,  category: 'Healthcare',     merchant: 'Apollo Pharmacy',date: '2026-03-18' },
  { id: '7', type: 'expense', amount: 620,  category: 'Utilities',      merchant: 'Electricity Bill',date: '2026-03-15' },
  { id: '8', type: 'expense', amount: 1800, category: 'Food',           merchant: 'Restaurant',     date: '2026-03-13' },
  { id: '9', type: 'income',  amount: 5000, category: 'Investment',     merchant: 'Dividend',       date: '2026-03-10' },
  { id: '10',type: 'expense', amount: 2500, category: 'Shopping',       merchant: 'Myntra',         date: '2026-03-08' },
];

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        const res = await api.get('/transactions');
        return res.data;
      } catch {
        return MOCK_TRANSACTIONS;
      }
    },
    placeholderData: MOCK_TRANSACTIONS,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id'>) => {
      try {
        const res = await api.post('/transactions', data);
        return res.data;
      } catch {
        return { ...data, id: Date.now().toString() };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added! ✅');
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try { await api.delete(`/transactions/${id}`); } catch { /* mock */ }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted');
    },
  });
}
