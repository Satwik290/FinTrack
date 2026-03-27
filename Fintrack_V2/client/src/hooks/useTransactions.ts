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

// Only used as initial placeholder before first fetch
export const MOCK_TRANSACTIONS: Transaction[] = [];

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    initialData: undefined,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id'>) => {
      const res = await api.post('/transactions', data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added! ✅');
    },
    onError: () => {
      toast.error('Failed to save transaction');
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });
}