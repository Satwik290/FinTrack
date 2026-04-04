'use client';
import { motion }            from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart2, Wallet } from 'lucide-react';
import { useDashboardStore } from '@/hooks/useDashboard';
import { C, MONO, SANS, fmtINR, fmtAxis, hexToRgb } from '../../../utils/dashboard/tokens';
import { Transaction, Budget } from '../../../utils/dashboard/types';
import { Shard, Skel }       from './Shard';

interface KpiRowProps {
  txns:       Transaction[];
  budgets:    Budget[];
  txnLoading: boolean;
}

export function KpiRow({ txns, budgets, txnLoading }: KpiRowProps) {
  const { isMasked } = useDashboardStore();

  const now  = new Date();
  const cur  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prev = (() => { const d = new Date(now.getFullYear(), now.getMonth() - 1, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();

  const mo  = txns.filter(t => t.date.startsWith(cur));
  const prv = txns.filter(t => t.date.startsWith(prev));

  const income   = mo.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense  = mo.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const pIncome  = prv.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const pExpense = prv.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const saved       = income - expense;
  const saveRate    = income > 0 ? (saved / income) * 100 : 0;
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetPct   = totalBudget > 0 ? (expense / totalBudget) * 100 : 0;
  const incDelta    = pIncome  > 0 ? ((income  - pIncome)  / pIncome)  * 100 : 0;
  const expDelta    = pExpense > 0 ? ((expense - pExpense) / pExpense) * 100 : 0;

  const kpis = [
    { icon: <TrendingUp size={14} />,   l: 'Income',   v: fmtINR(income, isMasked),          c: C.jade,   d: incDelta, sub: `${mo.filter(t => t.type === 'income').length} src` },
    { icon: <TrendingDown size={14} />, l: 'Expenses',  v: fmtINR(expense, isMasked),         c: C.terra,  d: expDelta, sub: `${mo.filter(t => t.type === 'expense').length} txns` },
    { icon: <Activity size={14} />,     l: 'Savings',   v: `${saveRate.toFixed(0)}%`,          c: saveRate >= 20 ? C.jade : saveRate >= 10 ? C.amber : C.terra, d: null, sub: isMasked ? 'rate' : `saved ${fmtAxis(saved)}` },
    { icon: <BarChart2 size={14} />,    l: 'Budget',    v: `${Math.round(budgetPct)}%`,        c: budgetPct >= 100 ? C.terra : budgetPct >= 80 ? C.amber : C.jade, d: null, sub: isMasked ? 'used' : `of ${fmtAxis(totalBudget)}` },
    { icon: <Wallet size={14} />,       l: 'Txns',      v: `${mo.length}`,                     c: C.indigo, d: null, sub: 'this month' },
  ];

  return (
    <motion.div className="engine-kpi-row" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
      {kpis.map((k, i) => (
        <motion.div key={k.l} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 + 0.15 }}>
          <Shard style={{ padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: `rgba(${hexToRgb(k.c)},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.c }}>
                  {txnLoading ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} /> : k.icon}
                </div>
                <span style={{ fontSize: 10, color: C.text2, fontFamily: SANS, letterSpacing: 0.3 }}>{k.l}</span>
              </div>
              {k.d !== null && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: k.d >= 0 ? 'rgba(13,220,155,0.1)' : 'rgba(255,92,103,0.1)', color: k.d >= 0 ? C.jade : C.terra, fontFamily: MONO }}>
                  {k.d >= 0 ? '+' : ''}{k.d.toFixed(0)}%
                </span>
              )}
            </div>
            {txnLoading ? <Skel w={70} h={22} r={4} /> :
              <p style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: k.c, letterSpacing: -0.5, lineHeight: 1, marginBottom: 2 }}>{k.v}</p>
            }
            <p style={{ fontSize: 9, color: C.text2, fontFamily: SANS }}>{k.sub}</p>
          </Shard>
        </motion.div>
      ))}
    </motion.div>
  );
}