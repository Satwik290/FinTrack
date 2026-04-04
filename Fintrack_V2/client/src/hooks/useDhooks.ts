'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Transaction } from '../utils/dashboard/types';

const DIGITS = '0123456789';

export function useCipherMask(value: string, masked: boolean) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!masked) { setDisplay(value); return; }
    let iterations = 0;
    const maxIter = 14;
    const run = () => {
      setDisplay(prev =>
        prev.split('').map((ch) => {
          if (ch === '₹' || ch === ',' || ch === ' ' || ch === '.') return ch;
          if (iterations >= maxIter) return '•';
          return DIGITS[Math.floor(Math.random() * 10)];
        }).join('')
      );
      iterations++;
      if (iterations <= maxIter) rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [masked, value]);

  return display;
}

export function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const raf    = useRef<number>(0);
  const valRef = useRef(0);

  useEffect(() => {
    const start = performance.now(), from = valRef.current;
    const step = (now: number) => {
      const p    = Math.min((now - start) / duration, 1);
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 4)));
      valRef.current = next;
      setVal(next);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return val;
}

export function useChartData(txns: Transaction[]) {
  return useMemo(() => {
    const now    = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const byMonth: Record<string, { income: number; expense: number }> = {};

    for (const t of txns) {
      const k = t.date.slice(0, 7);
      if (!byMonth[k]) byMonth[k] = { income: 0, expense: 0 };
      if (t.type === 'income') byMonth[k].income += t.amount;
      else byMonth[k].expense += t.amount;
    }

    const allKeys  = Object.keys(byMonth).sort();
    const pastKeys = allKeys.filter(k => k <= curKey);
    let avgIncome = 0, avgExpense = 0;
    if (pastKeys.length > 0) {
      avgIncome  = pastKeys.reduce((s, k) => s + byMonth[k].income,  0) / pastKeys.length;
      avgExpense = pastKeys.reduce((s, k) => s + byMonth[k].expense, 0) / pastKeys.length;
    }

    const d2l = (k: string) => {
      const [y, m] = k.split('-').map(Number);
      return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'short' });
    };

    const momData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = byMonth[k] ?? { income: 0, expense: 0 };
      return { label: d2l(k), key: k, income: Math.round(m.income), expense: Math.round(m.expense), net: Math.round(m.income - m.expense) };
    });

    const forecastData = Array.from({ length: 12 }, (_, i) => {
      const d      = new Date(now.getFullYear(), now.getMonth() - 2 + i, 1);
      const k      = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const actual = byMonth[k];
      const isCur  = k === curKey, isPast = k < curKey;
      return {
        name:    d2l(k), key: k,
        income:  actual ? Math.round(actual.income)  : Math.round(avgIncome),
        expense: actual ? Math.round(actual.expense) : Math.round(avgExpense),
        isProj:  !isPast && !isCur,
      };
    });

    const hasMoM      = momData.some(d => d.income > 0 || d.expense > 0);
    const hasForecast = forecastData.some(d => d.income > 0 || d.expense > 0);
    return { momData, forecastData, hasMoM, hasForecast, curKey };
  }, [txns]);
}