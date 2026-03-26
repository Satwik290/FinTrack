'use client';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const DATA = [
  { month: 'Oct', spending: 42000 },
  { month: 'Nov', spending: 38500 },
  { month: 'Dec', spending: 62000 },
  { month: 'Jan', spending: 35000 },
  { month: 'Feb', spending: 48000 },
  { month: 'Mar', spending: 29000 },
];

function fmt(n: number) {
  return `₹${(n / 1000).toFixed(0)}k`;
}

export function SpendingChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
      style={{ padding: 24, gridColumn: 'span 2' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>
            Monthly Spending
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Last 6 months overview</p>
        </div>
        <span className="badge badge-success">↓ 18% vs last month</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Spending']}
            contentStyle={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, fontSize: 13,
            }}
          />
          <Area
            type="monotone" dataKey="spending"
            stroke="#6366f1" strokeWidth={2.5}
            fill="url(#spendGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
