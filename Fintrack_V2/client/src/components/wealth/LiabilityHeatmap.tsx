import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useWealthStore } from '../../store/useWealthStore';

interface LiabilityHeatmapProps {
  liabilities: Array<{
    id: string;
    loanName: string;
    interestRate: number;
    remainingBalanceInCents: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { isMasked } = useWealthStore();

  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl">
        <p className="text-white font-medium">{label}</p>
        <p className="text-rose-400 text-sm">
          Balance: {isMasked ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value as number)}
        </p>
        <p className="text-zinc-400 text-xs mt-1">Interest Rate: {payload[0].payload.rate}%</p>
      </div>
    );
  }
  return null;
};

export const LiabilityHeatmap: React.FC<LiabilityHeatmapProps> = ({ liabilities }) => {
  const data = liabilities.map(lib => ({
    name: lib.loanName,
    balance: lib.remainingBalanceInCents / 100,
    rate: lib.interestRate,
  })).sort((a, b) => b.rate - a.rate); // Sort by highest interest rate

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-[400px]">
      <h2 className="text-white font-semibold text-lg mb-6">Liability Heatmap</h2>
      {liabilities.length === 0 ? (
        <div className="flex h-full items-center justify-center text-zinc-500">No liabilities found.</div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
            <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => {
                // Color intensity based on interest rate
                const color = entry.rate > 10 ? '#ef4444' : entry.rate > 5 ? '#f59e0b' : '#3b82f6';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
