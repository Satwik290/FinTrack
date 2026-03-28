'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useWealthStore } from '@/store/useWealthStore';
import type { Liability } from '@/hooks/useWealthSummary';

interface Props { liabilities: Liability[] }

function fmtINR(rupees: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rupees);
}

// Note: CustomTooltip cannot call hooks inline as it's not a proper React component in Recharts context.
// We read isMasked from outside and pass it via closure.
function makeTooltip(isMasked: boolean) {
  return function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number; payload: { rate: number } }[];
    label?: string;
  }) {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 2 }}>
          Balance: {isMasked ? '••••' : fmtINR(payload[0].value)}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Interest Rate: {payload[0].payload.rate}%
        </p>
      </div>
    );
  };
}

export function LiabilityHeatmap({ liabilities }: Props) {
  const { isMasked } = useWealthStore();

  const data = [...liabilities]
    .sort((a, b) => b.interestRate - a.interestRate)
    .map(lib => ({
      name: lib.loanName,
      balance: lib.remainingBalanceInCents / 100,
      rate: lib.interestRate,
    }));

  const CustomTooltip = makeTooltip(isMasked);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Liability Heatmap</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { color: '#ef4444', label: '>10% rate' },
            { color: '#f59e0b', label: '5–10%' },
            { color: '#3b82f6', label: '<5%' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {liabilities.length === 0 ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No liabilities found. Great job! 🎉
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(liabilities.length * 56, 180)}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              dataKey="name" type="category"
              axisLine={false} tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-surface-2)' }} />
            <Bar dataKey="balance" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.rate > 10 ? '#ef4444' : entry.rate > 5 ? '#f59e0b' : '#3b82f6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}