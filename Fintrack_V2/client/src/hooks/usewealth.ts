'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { MFHolding } from './useMutualFunds';
import type { StockHolding } from './useStocks';

/* ── Types ──────────────────────────────────────── */
export interface AllocationSlice {
  label: string;
  value: number;
  color: string;
}

export interface TopHolding {
  id: string;
  name: string;
  type: 'MF' | 'STOCK';
  currentValue: number;
  pnl: number;
  pnlPct: number;
  badge: string;
}

export interface ManualAsset {
  id: string;
  name: string;
  type: string;
  ticker?: string;
  quantity: number;
  currentValueInCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  loanName: string;
  category: string;
  totalPrincipalInCents: number;
  interestRate: number;
  remainingBalanceInCents: number;
  emiInCents?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WealthSummary {
  // Core numbers
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPct: number;
  // Breakdowns
  allocation: AllocationSlice[];
  mfSummary: { totalInvested: number; totalCurrent: number; totalPnl: number; totalPnlPct: number; holdingsCount: number };
  stockSummary: { totalInvested: number; totalCurrent: number; totalPnl: number; totalPnlPct: number; holdingsCount: number; byExchange: Record<string, number> };
  manualAssetsValue: number;
  // Detail for tabs
  mfHoldings: MFHolding[];
  stockHoldings: StockHolding[];
  assets: ManualAsset[];
  liabilities: Liability[];
  // Intelligence
  top5Performers: TopHolding[];
  top5Losers: TopHolding[];
  debtToAsset: number;
  financialFreedomPct: number;
  // Freshness
  lastSynced: {
    stocks: string | null;
    mutualFunds: string | null;
    manualAssets: number | null;
  };
}

/* ── Primary hook ───────────────────────────────── */
export function useWealth() {
  return useQuery<WealthSummary>({
    queryKey: ['wealth-summary'],
    queryFn: async () => {
      const res = await api.get('/wealth/summary');
      return res.data?.data ?? res.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ── Asset mutations ────────────────────────────── */
export function useAddAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/wealth/assets', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Asset added!');
    },
    onError: () => toast.error('Failed to add asset'),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/wealth/assets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Asset removed');
    },
  });
}

/* ── Liability mutations ────────────────────────── */
export function useAddLiability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/wealth/liabilities', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Liability added');
    },
    onError: () => toast.error('Failed to add liability'),
  });
}

export function useDeleteLiability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/wealth/liabilities/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Liability removed');
    },
  });
}

/* ── MF mutations (invalidate wealth-summary too) ─ */
export function useAddMFLumpsum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/mutual-funds/holdings/lumpsum', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Fund holding added! 📈');
    },
    onError: () => toast.error('Failed to add holding'),
  });
}

export function useAddMFSip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/mutual-funds/holdings/sip', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('SIP added! 🔄');
    },
    onError: () => toast.error('Failed to add SIP'),
  });
}

export function useDeleteMFHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/mutual-funds/holdings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Holding removed');
    },
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/stocks/holdings', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Stock added! 📊');
    },
    onError: () => toast.error('Failed to add stock'),
  });
}

export function useDeleteStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/stocks/holdings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wealth-summary'] });
      toast.success('Holding removed');
    },
  });
}

/* ── NAV history (MF chart — separate query) ────── */
export function useMFNavHistory(schemeCode: string, period: '1Y' | '3Y' | '5Y') {
  return useQuery<{ date: string; nav: number }[]>({
    queryKey: ['mf-nav-history', schemeCode, period],
    queryFn: async () => {
      const res = await api.get(`/mutual-funds/history/${schemeCode}?period=${period}`);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!schemeCode,
    staleTime: 60 * 60_000,
  });
}

export function useMFSearch(query: string) {
  return useQuery<{ schemeCode: string; schemeName: string }[]>({
    queryKey: ['mf-search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await api.get(`/mutual-funds/search?q=${encodeURIComponent(query)}`);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useStockSearch(query: string, exchange = 'NSE') {
  return useQuery<{ ticker: string; name: string; exchange: string }[]>({
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