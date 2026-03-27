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
  period: string;
}

// Empty — no mock fallback so real errors surface
export const MOCK_BUDGETS: Budget[] = [];

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await api.get('/budgets');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    initialData: undefined,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Budget, 'id' | 'spent'>) => {
      const res = await api.post('/budgets', data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created! 💰');
    },
    onError: () => {
      toast.error('Failed to create budget');
    },
  });
}