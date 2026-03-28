'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface StockHolding {
  id: string;
  ticker: string;
  exchange: 'NSE' | 'US' | 'CRYPTO';
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  priceLastUpdated?: string;
}

export interface StockPortfolio {
  holdings: StockHolding[];
  summary: {
    totalInvested: number;
    totalCurrent: number;
    totalPnl: number;
    totalPnlPct: number;
    holdingsCount: number;
    byExchange: Record<string, number>;
  };
}

export interface StockSearchResult { ticker: string; name: string; exchange: string }

export function useStockPortfolio() {
  return useQuery<StockPortfolio>({
    queryKey: ['stock-portfolio'],
    queryFn: async () => {
      const res = await api.get('/stocks/portfolio');
      return res.data?.data ?? res.data;
    },
  });
}

export function useStockSearch(query: string, exchange = 'NSE') {
  return useQuery<StockSearchResult[]>({
    queryKey: ['stock-search', query, exchange],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await api.get(`/stocks/search?q=${encodeURIComponent(query)}&exchange=${exchange}`);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/stocks/holdings', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-portfolio'] }); toast.success('Stock added! 📊'); },
    onError: () => toast.error('Failed to add stock'),
  });
}

export function useDeleteStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/stocks/holdings/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-portfolio'] }); toast.success('Holding removed'); },
  });
}