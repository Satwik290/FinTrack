'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api'; // reuse the same axios instance (port 3001, fintrack_token)

export interface Asset {
  id: string;
  name: string;
  ticker?: string;
  quantity: number;
  type: 'Market' | 'Manual';
  currentValueInCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  loanName: string;
  totalPrincipalInCents: number;
  interestRate: number;
  remainingBalanceInCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface WealthSummary {
  totalAssetsInCents: number;
  totalLiabilitiesInCents: number;
  netWorthInCents: number;
  assets: Asset[];
  liabilities: Liability[];
}

export function useWealthSummary() {
  return useQuery<WealthSummary>({
    queryKey: ['wealthSummary'],
    queryFn: async () => {
      // Endpoint: GET /api/wealth/summary  (global prefix 'api' + controller 'wealth')
      const res = await api.get('/wealth/summary');
      return res.data?.data ?? res.data;
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 min
  });
}