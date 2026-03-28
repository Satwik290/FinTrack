'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

/* ── Types ──────────────────────────────────────── */
export interface MFHolding {
  id: string;
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  category: string;
  units: number;
  avgNAV: number;
  currentNAV: number;
  isSIP: boolean;
  sipAmount?: number;
  sipDay?: number;
  sipStartDate?: string;
  totalSipInstallments: number;
  investedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  nextSipDate?: string | null;
  navLastUpdated?: string;
}

export interface MFPortfolio {
  holdings: MFHolding[];
  summary: {
    totalInvested: number;
    totalCurrent: number;
    totalPnl: number;
    totalPnlPct: number;
    holdingsCount: number;
  };
}

export interface NavPoint { date: string; nav: number }

export interface MFSearchResult { schemeCode: string; schemeName: string }

/* ── Hooks ──────────────────────────────────────── */
export function useMFPortfolio() {
  return useQuery<MFPortfolio>({
    queryKey: ['mf-portfolio'],
    queryFn: async () => {
      const res = await api.get('/mutual-funds/portfolio');
      return res.data?.data ?? res.data;
    },
  });
}

export function useMFSearch(query: string) {
  return useQuery<MFSearchResult[]>({
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

export function useMFNavHistory(schemeCode: string, period: '1Y' | '3Y' | '5Y') {
  return useQuery<NavPoint[]>({
    queryKey: ['mf-nav-history', schemeCode, period],
    queryFn: async () => {
      const res = await api.get(`/mutual-funds/history/${schemeCode}?period=${period}`);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!schemeCode,
    staleTime: 60 * 60_000, // 1 hour
  });
}

export function useAddMFLumpsum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/mutual-funds/holdings/lumpsum', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mf-portfolio'] }); toast.success('Holding added! 📈'); },
    onError: () => toast.error('Failed to add holding'),
  });
}

export function useAddMFSip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: object) => api.post('/mutual-funds/holdings/sip', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mf-portfolio'] }); toast.success('SIP added! 🔄'); },
    onError: () => toast.error('Failed to add SIP'),
  });
}

export function useDeleteMFHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/mutual-funds/holdings/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mf-portfolio'] }); toast.success('Holding removed'); },
  });
}