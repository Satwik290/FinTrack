'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

/* ─── Count-up hook ──────────────────────────────────────── */
function useCountUp(target: number, duration = 1400) {
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

/* ─── Custom bar label ───────────────────────────────────── */
function BarLabel({ x, y, width, value }: {
  x?: number; y?: number; width?: number; value?: number;
}) {
  if (!value || !x || !y || !width || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 6} fill="#94a3b8" textAnchor="middle" fontSize={11}>
      ₹{(value / 1000).toFixed(1)}k
    </text>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#8b5cf6',
  Entertainment: '#ec4899', Healthcare: '#10b981', Utilities: '#64748b',
  Salary: '#059669', Investment: '#6366f1', Other: '#94a3b8',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Healthcare: '💊', Utilities: '⚡', Salary: '💼', Investment: '📈', Other: '📦',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

/* ─── Goal Card (kept as-is from original) ──────────────── */
const GOALS = [
  { label: 'Sweet escape to Busan',           pct: 46, amount: '520.10',      from: '#f472b6', to: '#a855f7', icon: '✈️' },
  { label: 'Rumah masa tua di Kaliurang',      pct: 92, amount: '413.855.11',  from: '#f97316', to: '#eab308', icon: '🏠' },
  { label: 'My dream car',                     pct: 28, amount: '2.0',         from: '#3b82f6', to: '#06b6d4', icon: '🚗' },
];

function GoalCard({ goal }: { goal: typeof GOALS[0] }) {
  return (
    <div style={{
      flex: '0 0 200px', borderRadius: 20, padding: 20,
      background: `linear-gradient(160deg, ${goal.from}, ${goal.to})`,
      position: 'relative', overflow: 'hidden', minHeight: 220,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 48, left: 0, width: '100%', opacity: 0.25 }}>
        <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
      </svg>
      <div style={{ fontSize: 26 }}>{goal.icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', opacity: 0.9 }}>{goal.pct}%</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 1.4 }}>{goal.label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>$ {goal.amount}</div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function DashboardPage() {
  const { data: transactions = [] } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Revenue' | 'Expenses' | 'Taxes'>('All');

  /* ── Derived stats ── */
  const totalIncome   = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
  const netBalance    = totalIncome - totalExpenses;

  /* ── Cashflow: last 6 months ── */
  const cashflowData = useMemo(() => {
    const months: { month: string; key: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleString('en-IN', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0, expenses: 0,
      });
    }
    transactions.forEach(t => {
      const bucket = months.find(m => m.key === t.date.slice(0, 7));
      if (!bucket) return;
      if (t.type === 'income') bucket.revenue += t.amount;
      else bucket.expenses += t.amount;
    });
    return months;
  }, [transactions]);

  /* ── Category breakdown ── */
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, amount]) => ({
        label, amount,
        emoji: CATEGORY_EMOJI[label] ?? '💰',
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: CATEGORY_COLORS[label] ?? '#94a3b8',
      }));
  }, [transactions]);

  /* ── Recent transactions ── */
  const recentTxn = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    [transactions]
  );

  /* ── Filtered cashflow ── */
  const filteredData = cashflowData.map(d => ({
    ...d,
    revenue:  activeFilter === 'Expenses' || activeFilter === 'Taxes' ? 0 : d.revenue,
    expenses: activeFilter === 'Revenue'  || activeFilter === 'Taxes' ? 0 : d.expenses,
  }));

  const animBalance  = useCountUp(Math.max(netBalance, 0));
  const animExpenses = useCountUp(totalExpenses);
  const animRevenue  = useCountUp(totalIncome);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      padding: '28px 32px',
      fontFamily: "'DM Sans', 'Inter', sans-serif",
    }}>

      {/* ── Row 1: Greeting + Balance ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* Greeting */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 20, padding: '32px 36px',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
        }}>
          <p style={{ fontSize: 28, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 560 }}>
            {transactions.length === 0
              ? <>Welcome to <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>FinTrack.</span> Add your first transaction to get started.</>
              : <>You have <span style={{ color: '#22d3ee', fontWeight: 700, borderBottom: '2px solid #22d3ee' }}>{fmt(totalIncome)} income</span>{' '}
                  and <span style={{ color: 'var(--text-primary)', fontWeight: 700, borderBottom: '2px solid var(--text-primary)' }}>{fmt(totalExpenses)} expenses</span>{' '}
                  this month. Net balance: <span style={{ color: netBalance >= 0 ? '#22d3ee' : '#ef4444', fontWeight: 700 }}>{fmt(netBalance)}</span>.</>
            }
          </p>
        </div>

        {/* Total Balance */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 20, padding: 24,
          border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Total Balance</span>
            <button style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: 13,
            }}>↻</button>
          </div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -1 }}>
              <span style={{ fontSize: 28, verticalAlign: 'top', marginTop: 6, display: 'inline-block', color: 'var(--text-muted)', fontWeight: 400 }}>₹ </span>
              {animBalance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {transactions.length} transactions recorded<br />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--text-primary)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg-surface)', fontSize: 16,
            }}>↗</button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Cashflow + Right Column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* Cashflow Chart */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Cashflow Summary</span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8' }} /> Revenue
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} /> Expenses
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {(['All', 'Revenue', 'Expenses', 'Taxes'] as const).map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: 'none', cursor: 'pointer',
                background: activeFilter === f ? 'var(--text-primary)' : 'var(--bg-surface-2)',
                color: activeFilter === f ? 'var(--bg-surface)' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>{f}</button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filteredData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                formatter={(v) => [fmt(v as number), '']}
              />
              <Bar dataKey="revenue" radius={[6,6,0,0]} label={<BarLabel />}>
                {filteredData.map((_, i) => <Cell key={i} fill="url(#revGrad)" />)}
              </Bar>
              <Bar dataKey="expenses" radius={[6,6,0,0]} label={<BarLabel />}>
                {filteredData.map((_, i) => <Cell key={i} fill="url(#expGrad)" />)}
              </Bar>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.5} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Expenses this month */}
          <div style={{ borderRadius: 20, padding: 20, background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', flex: 1 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>Expenses this month</p>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
              <span style={{ fontSize: 22, verticalAlign: 'top', marginTop: 5, display: 'inline-block' }}>₹ </span>
              {animExpenses.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 1.4 }}>
              {budgets.length > 0
                ? <>Budget used: <strong>{budgets.reduce((s,b)=>s+b.limit,0)>0 ? Math.round((totalExpenses/budgets.reduce((s,b)=>s+b.limit,0))*100) : 0}%</strong> of {fmt(budgets.reduce((s,b)=>s+b.limit,0))}</>
                : 'Track your spending across categories'}
            </p>
            <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}>
              <div style={{
                height: '100%', borderRadius: 99, background: '#fff',
                width: `${budgets.length > 0 && budgets.reduce((s,b)=>s+b.limit,0)>0
                  ? Math.min(Math.round((totalExpenses/budgets.reduce((s,b)=>s+b.limit,0))*100),100)
                  : 50}%`,
              }} />
            </div>
          </div>

          {/* Revenue this month */}
          <div style={{ borderRadius: 20, padding: 20, background: 'linear-gradient(135deg, #6366f1, #818cf8)', flex: 1 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>Revenue this month</p>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
              <span style={{ fontSize: 22, verticalAlign: 'top', marginTop: 5, display: 'inline-block' }}>₹ </span>
              {animRevenue.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 1.4 }}>
              Net balance: <strong>{fmt(Math.max(netBalance, 0))}</strong> after expenses
            </p>
            <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}>
              <div style={{
                height: '100%', borderRadius: 99, background: '#fff',
                width: `${totalIncome > 0 ? Math.min(Math.round(((totalIncome - totalExpenses) / totalIncome) * 100), 100) : 0}%`,
              }} />
            </div>
          </div>

          {/* Categories */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 20, border: '1px solid var(--border)', flex: 2 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
              Most transactions by category
            </p>
            {categoryData.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No expense data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {categoryData.map(cat => (
                  <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: cat.color + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {cat.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cat.label}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{cat.pct}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-surface-2)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${cat.pct}%`, background: cat.color, borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Goals + Transactions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Financial Goals (static design preserved) */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Financial Goals Tracker</p>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {GOALS.map(g => <GoalCard key={g.label} goal={g} />)}
          </div>
        </div>

        {/* Latest Transactions — real data */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Latest Transactions</p>
          {recentTxn.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No transactions yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentTxn.map((t, i) => (
                <div
                  key={t.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: 'var(--bg-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    {CATEGORY_EMOJI[t.category] ?? '💵'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.merchant}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {t.type === 'income' ? '+' : '–'} {fmt(t.amount)}
                  </span>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0,
                    background: t.type === 'income' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                    color: t.type === 'income' ? '#22c55e' : '#818cf8',
                  }}>
                    {t.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}