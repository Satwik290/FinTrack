'use client';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

/* ── Types ──────────────────────────────────────── */
export interface InsightAlert {
  id: string;
  type: 'anomaly' | 'forecast' | 'tip' | 'achievement';
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  body: string;
  action?: string;
  category?: string;
  value?: number;
  threshold?: number;
}

export interface ForecastMonth {
  month: string;
  key: string;
  projectedIncome: number;
  projectedExpense: number;
  projectedNet: number;
  actualIncome?: number;
  actualExpense?: number;
  isProjected: boolean;
}

export interface ComparisonMonth {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

/* ── Zustand store ──────────────────────────────── */
interface DashboardStore {
  isMasked: boolean;
  togglePrivacyMode: () => void;
  dismissedInsights: string[];
  dismissInsight: (id: string) => void;
  chartPreference: 'area' | 'bar';
  setChartPreference: (c: 'area' | 'bar') => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      isMasked: false,
      togglePrivacyMode: () => set(s => ({ isMasked: !s.isMasked })),
      dismissedInsights: [],
      dismissInsight: (id) => set(s => ({ dismissedInsights: [...s.dismissedInsights, id] })),
      chartPreference: 'area',
      setChartPreference: (c) => set({ chartPreference: c }),
      expandedSections: {},
      toggleSection: (id) => set(s => ({ expandedSections: { ...s.expandedSections, [id]: !s.expandedSections[id] } })),
    }),
    { name: 'fintrack-dashboard' },
  ),
);

/* ── Hooks ──────────────────────────────────────── */
export function useInsights() {
  return useQuery<InsightAlert[]>({
    queryKey: ['dashboard-insights'],
    queryFn: async () => {
      const res = await api.get('/dashboard/insights');
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useForecast() {
  return useQuery<ForecastMonth[]>({
    queryKey: ['dashboard-forecast'],
    queryFn: async () => {
      const res = await api.get('/dashboard/forecast');
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 30 * 60_000,
  });
}

export function useComparisons() {
  return useQuery<ComparisonMonth[]>({
    queryKey: ['dashboard-comparisons'],
    queryFn: async () => {
      const res = await api.get('/dashboard/comparisons');
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 10 * 60_000,
  });
}