'use client';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLORS, Transaction } from '@/hooks/useTransactions';

interface Props { transactions: Transaction[] }

export function CategoryPieChart({ transactions }: Props) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const byCategory: Record<string, number> = {};
  for (const t of expenses) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  }
  const data = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
      style={{ padding: 24 }}
    >
      <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
        Spending by Category
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>This month</p>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={60} outerRadius={88}
            paddingAngle={3} dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.name] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Amount']}
            contentStyle={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, fontSize: 13,
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
