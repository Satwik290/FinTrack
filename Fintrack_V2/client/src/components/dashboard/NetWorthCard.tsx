'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface NetWorthCardProps {
  balance: number;
  income: number;
  expenses: number;
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function NetWorthCard({ balance, income, expenses }: NetWorthCardProps) {
  const animBalance = useCountUp(balance);
  const animIncome = useCountUp(income);
  const animExpenses = useCountUp(expenses);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: 20, padding: 28, color: '#fff', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        gridColumn: 'span 2',
      }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 8, fontWeight: 500, letterSpacing: 0.5 }}>NET WORTH</p>
        <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginBottom: 24 }}>
          {fmt(animBalance)}
        </h2>

        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <p style={{ fontSize: 11, opacity: 0.65, marginBottom: 4, fontWeight: 500, letterSpacing: 0.5 }}>INCOME</p>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{fmt(animIncome)}</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <p style={{ fontSize: 11, opacity: 0.65, marginBottom: 4, fontWeight: 500, letterSpacing: 0.5 }}>EXPENSES</p>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{fmt(animExpenses)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
