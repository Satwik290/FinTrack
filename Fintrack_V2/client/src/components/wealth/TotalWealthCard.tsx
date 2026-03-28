import React from 'react';
import { useWealthStore } from '../../store/useWealthStore';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface TotalWealthCardProps {
  netWorthInCents: number;
}

export const TotalWealthCard: React.FC<TotalWealthCardProps> = ({ netWorthInCents }) => {
  const { isMasked, togglePrivacyMode } = useWealthStore();

  const formattedNetWorth = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(netWorthInCents / 100);

  // Example placeholder for 24h change logic
  const changePercentage = 2.4; 
  const isPositive = changePercentage >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-zinc-400 font-medium text-sm tracking-wider uppercase">Total Wealth</h2>
        <button 
          onClick={togglePrivacyMode}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Toggle Privacy Mode"
        >
          {isMasked ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex items-baseline space-x-4">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          {isMasked ? '*********' : formattedNetWorth}
        </h1>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <span className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {Math.abs(changePercentage)}%
        </span>
        <span className="text-zinc-500 text-sm">vs last month</span>
      </div>
    </motion.div>
  );
};
