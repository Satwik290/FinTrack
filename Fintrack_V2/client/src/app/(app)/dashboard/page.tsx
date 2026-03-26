'use client';
import { useEffect, useRef, useState } from 'react';
import { useTransactions, MOCK_TRANSACTIONS } from '@/hooks/useTransactions';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

/* ─── Mock data ──────────────────────────────────────────── */
const CASHFLOW_DATA = [
  { month: 'Feb', revenue: 1240.23, expenses: 628.01 },
  { month: 'Mar', revenue: 3128.01, expenses: 153.27 },
  { month: 'Apr', revenue: 1500.00, expenses: 1400.32 },
  { month: 'May', revenue: 978.99,  expenses: 600.72 },
  { month: 'Jun', revenue: 2923.45, expenses: 838.48 },
];

const CATEGORIES = [
  { label: 'Food & Beverages', emoji: '🥗', pct: 64, color: '#3b82f6' },
  { label: 'Entertainment',    emoji: '🎮', pct: 12, color: '#f59e0b' },
  { label: 'Transportation',   emoji: '🚗', pct: 10, color: '#8b5cf6' },
  { label: 'Groceries',        emoji: '🛒', pct: 7,  color: '#ef4444' },
  { label: 'Dribbble TEAM Subscription', emoji: '🎯', pct: 3, color: '#ec4899' },
];

const GOALS = [
  {
    label: 'Sweet escape to Busan',
    pct: 46, amount: '520.10',
    from: '#f472b6', to: '#a855f7', icon: '✈️',
  },
  {
    label: 'Rumah masa tua di Kaliurang',
    pct: 92, amount: '413.855.11',
    from: '#f97316', to: '#eab308', icon: '🏠',
  },
  {
    label: 'My dream car',
    pct: 28, amount: '2.0',
    from: '#3b82f6', to: '#06b6d4', icon: '🚗',
  },
];

const LATEST_TXN = [
  { label: 'Paid for Uber order',                   date: '21/06/2023 – 20:43', amount: '– $ 2,12.00',  status: 'Paid',     statusColor: '#22c55e' },
  { label: 'SBX – Coldbrew with Salted Caramel Sauce', date: '21/06/2023 – 20:43', amount: '– $ 5,34.00',  status: 'Paid',     statusColor: '#22c55e' },
  { label: 'Payoneer Payment 20/10/2023',            date: '21/06/2023 – 20:43', amount: '– $ 3,510.00', status: 'Received', statusColor: '#6366f1' },
  { label: 'Thirtythree Brew Dharmahusada – Paid',   date: '21/06/2023 – 20:43', amount: '– $ 5,34.00',  status: 'Paid',     statusColor: '#22c55e' },
];

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
function BarLabel({ x, y, width, value, dataKey }: {
  x?: number; y?: number; width?: number; value?: number; dataKey?: string;
}) {
  if (!value || !x || !y || !width) return null;
  return (
    <text
      x={x + width / 2} y={y - 6}
      fill="#94a3b8" textAnchor="middle" fontSize={11}
    >
      ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </text>
  );
}

/* ─── Goal Card ──────────────────────────────────────────── */
function GoalCard({ goal }: { goal: typeof GOALS[0] }) {
  return (
    <div style={{
      flex: '0 0 200px', borderRadius: 20, padding: 20,
      background: `linear-gradient(160deg, ${goal.from}, ${goal.to})`,
      position: 'relative', overflow: 'hidden', minHeight: 220,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      {/* Wave SVG */}
      <svg viewBox="0 0 200 60" style={{
        position: 'absolute', bottom: 48, left: 0, width: '100%', opacity: 0.25,
      }}>
        <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
      </svg>

      <div style={{ fontSize: 26 }}>{goal.icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', opacity: 0.9 }}>
          {goal.pct}%
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 1.4 }}>
          {goal.label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
          $ {goal.amount}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function DashboardPage() {
  const { data: transactions = MOCK_TRANSACTIONS } = useTransactions();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Revenue' | 'Expenses' | 'Taxes'>('All');

  const totalBalance = useCountUp(183802);
  const expensesAmt  = useCountUp(720);
  const revenueAmt   = useCountUp(3200);

  const filteredData = CASHFLOW_DATA.map((d) => ({
    ...d,
    revenue:  activeFilter === 'Expenses' || activeFilter === 'Taxes' ? 0 : d.revenue,
    expenses: activeFilter === 'Revenue'  || activeFilter === 'Taxes' ? 0 : d.expenses,
  }));

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
          background: 'var(--bg-surface)',
          borderRadius: 20,
          padding: '32px 36px',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
        }}>
          <p style={{
            fontSize: 28, fontWeight: 500,
            color: 'var(--text-secondary)',
            lineHeight: 1.5, maxWidth: 560,
          }}>
            Good Evening,{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Astra.</span>{' '}
            By earning an extra{' '}
            <span style={{
              color: '#22d3ee', fontWeight: 700,
              borderBottom: '2px solid #22d3ee',
            }}>
              $3,200.90 revenue
            </span>{' '}
            last week, you're currently closer to your{' '}
            <span style={{
              color: 'var(--text-primary)', fontWeight: 700,
              borderBottom: '2px solid var(--text-primary)',
            }}>
              Nomaden-life
            </span>{' '}
            goals. Keep going!
          </p>
        </div>

        {/* Total Balance */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 20, padding: 24,
          border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
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
              <span style={{ fontSize: 28, verticalAlign: 'top', marginTop: 6, display: 'inline-block', color: 'var(--text-muted)', fontWeight: 400 }}>$ </span>
              {totalBalance.toLocaleString('en-US')}
              <span style={{ fontSize: 22, color: 'var(--text-muted)', fontWeight: 400 }}>.12</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Last updated on<br />
              Monday, Oct 2nd 2023 – 20:17
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--text-primary)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg-surface)', fontSize: 16,
            }}>↗</button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Cashflow + Right Column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* Cashflow Chart */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 20, padding: 24,
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Cashflow Summary</span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8' }} />
                Revenue
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} />
                Expenses
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {(['All', 'Revenue', 'Expenses', 'Taxes'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                  background: activeFilter === f ? 'var(--text-primary)' : 'var(--bg-surface-2)',
                  color: activeFilter === f ? 'var(--bg-surface)' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                {f}
              </button>
            ))}
            <button style={{
              padding: '6px 10px', borderRadius: 20, fontSize: 13,
              border: 'none', cursor: 'pointer',
              background: 'var(--bg-surface-2)', color: 'var(--text-muted)',
            }}>⇄</button>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filteredData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                axisLine={false} tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12, fontSize: 13,
                }}
                formatter={(v) => [`$${(v as number).toLocaleString()}`, '']}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} label={<BarLabel dataKey="revenue" />}>
                {filteredData.map((_, i) => (
                  <Cell key={i} fill="url(#revGrad)" />
                ))}
              </Bar>
              <Bar dataKey="expenses" radius={[6, 6, 0, 0]} label={<BarLabel dataKey="expenses" />}>
                {filteredData.map((_, i) => (
                  <Cell key={i} fill="url(#expGrad)" />
                ))}
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

        {/* Right Column: Expense/Revenue cards + Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Expenses this month */}
          <div style={{
            borderRadius: 20, padding: 20,
            background: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            flex: 1,
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>Expenses this month</p>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
              <span style={{ fontSize: 22, verticalAlign: 'top', marginTop: 5, display: 'inline-block' }}>$ </span>
              {expensesAmt.toLocaleString()}
              <span style={{ fontSize: 20, fontWeight: 400 }}>.09</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 1.4 }}>
              You have <strong>$319.91</strong> left from this month budget
            </p>
            <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '70%', background: '#fff', borderRadius: 99 }} />
            </div>
          </div>

          {/* Revenue this month */}
          <div style={{
            borderRadius: 20, padding: 20,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            flex: 1,
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>Revenue this month</p>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
              <span style={{ fontSize: 22, verticalAlign: 'top', marginTop: 5, display: 'inline-block' }}>$ </span>
              {revenueAmt.toLocaleString()}
              <span style={{ fontSize: 20, fontWeight: 400 }}>.90</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 1.4 }}>
              You are <strong>14,294.00</strong> closer from your financial goals!
            </p>
            <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '90%', background: '#fff', borderRadius: 99 }} />
            </div>
          </div>

          {/* Categories */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 20, padding: 20,
            border: '1px solid var(--border)',
            flex: 2,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
              Most transactions by category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORIES.map((cat) => (
                <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: cat.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                        {cat.pct}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-surface-2)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%', width: `${cat.pct}%`,
                        background: cat.color, borderRadius: 99,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Goals + Transactions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Financial Goals */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 20, padding: 24,
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Financial Goals Tracker
          </p>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {GOALS.map((g) => <GoalCard key={g.label} goal={g} />)}
          </div>
        </div>

        {/* Latest Transactions */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 20, padding: 24,
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Latest Transactions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {LATEST_TXN.map((t, i) => (
              <div key={i}>
                {i === 2 && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, padding: '8px 0 4px', textTransform: 'uppercase' }}>
                    Today
                  </p>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 8px', borderRadius: 10,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: 'var(--bg-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    💵
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                      marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.date}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {t.amount}
                  </span>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: t.statusColor + '20', color: t.statusColor,
                    flexShrink: 0,
                  }}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}