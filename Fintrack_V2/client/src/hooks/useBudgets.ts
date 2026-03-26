'use client';
export { CATEGORY_COLORS } from './useTransactions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly';
}

export const MOCK_BUDGETS: Budget[] = [
  { id: '1', category: 'Food',          limit: 8000, spent: 6200, period: 'monthly' },
  { id: '2', category: 'Transport',     limit: 3000, spent: 1800, period: 'monthly' },
  { id: '3', category: 'Shopping',      limit: 5000, spent: 5700, period: 'monthly' },
  { id: '4', category: 'Entertainment', limit: 2000, spent: 299,  period: 'monthly' },
  { id: '5', category: 'Healthcare',    limit: 2000, spent: 850,  period: 'monthly' },
  { id: '6', category: 'Utilities',     limit: 1500, spent: 1350, period: 'monthly' },
];

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        const res = await api.get('/budgets');
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? data : MOCK_BUDGETS;
      } catch {
        return MOCK_BUDGETS;
      }
    },
    placeholderData: MOCK_BUDGETS,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Budget, 'id' | 'spent'>) => {
      try {
        const res = await api.post('/budgets', data);
        return res.data?.data ?? res.data;
      } catch {
        return { ...data, id: Date.now().toString(), spent: 0 };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created! 💰');
    },
  });
}