'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLORS, Transaction } from '@/hooks/useTransactions';

// ✅ Optional prop with a default empty array fallback prevents the crash!
interface Props { transactions?: Transaction[] }

export function CategoryPieChart({ transactions = [] }: Props) {
  // useMemo prevents recalculating this loop on every single React render cycle
  const { chartData, totalExpenses } = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const t of expenses) {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + Math.abs(t.amount);
      total += Math.abs(t.amount);
    }

    const formattedData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Elite detail: Sort largest to smallest slice

    return { chartData: formattedData, totalExpenses: total };
  }, [transactions]);

  // Premium Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(5, 7, 10, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
            {payload[0].name}
          </p>
          <p style={{ color: '#FAFAFA', fontSize: 16, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
      style={{
        position: 'relative',
        padding: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(160deg, #0A0D14 0%, #05070A 100%)',
        boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '340px'
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#FAFAFA', letterSpacing: 0.5, marginBottom: 4 }}>
          Spending by Category
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>This month</p>
      </div>

      {chartData.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
          No expenses yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <PieChart>
            <Pie
              data={chartData} 
              cx="50%" 
              cy="45%" // Shifted slightly up to leave room for legend
              innerRadius={70} 
              outerRadius={90}
              paddingAngle={4} 
              dataKey="value"
              stroke="none" // Removes the ugly white default border
              cornerRadius={6} // Rounds the edges of the pie slices
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[entry.name] ?? '#818CF8'} />
              ))}
            </Pie>
            
            {/* Center Metric Text */}
            <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.3)" fontSize="10" letterSpacing="2" fontWeight="600" fontFamily="'DM Sans', sans-serif">
              TOTAL
            </text>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#FAFAFA" fontSize="16" fontWeight="700" fontFamily="'Space Mono', monospace">
              ₹{totalExpenses >= 100000 ? `${(totalExpenses / 100000).toFixed(1)}L` : totalExpenses >= 1000 ? `${(totalExpenses / 1000).toFixed(1)}K` : totalExpenses}
            </text>

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            
            <Legend 
              iconType="circle" 
              iconSize={8} 
              wrapperStyle={{ 
                fontSize: 11, 
                fontFamily: "'DM Sans', sans-serif", 
                color: 'rgba(255,255,255,0.6)',
                paddingTop: '20px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}