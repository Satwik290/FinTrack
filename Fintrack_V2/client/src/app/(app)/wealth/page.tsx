'use client';

import React from 'react';
import { useWealthSummary } from '../../../hooks/useWealthSummary';
import { TotalWealthCard } from '../../../components/wealth/TotalWealthCard';
import { LiabilityHeatmap } from '../../../components/wealth/LiabilityHeatmap';
import { AssetList } from '../../../components/wealth/AssetList';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WealthDashboard() {
  const { data, isLoading, isError } = useWealthSummary();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center p-6 lg:p-10">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center p-6 lg:p-10">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl flex items-center space-x-4">
          <AlertCircle size={32} />
          <div>
            <h2 className="font-semibold text-lg">Failed to load wealth data</h2>
            <p className="text-sm opacity-80 mt-1">Please ensure the backend API is running and you are logged in.</p>
          </div>
        </div>
      </div>
    );
  }

  const { netWorthInCents, assets, liabilities } = data || { netWorthInCents: 0, assets: [], liabilities: [] };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Wealth Overview</h1>
        <p className="text-zinc-400 mt-2">Track your long-term wealth, market assets, and liabilities.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <TotalWealthCard netWorthInCents={netWorthInCents} />
          <AssetList assets={assets} />
        </div>
        
        <div className="lg:col-span-2">
          <LiabilityHeatmap liabilities={liabilities} />
        </div>
      </div>
    </motion.div>
  );
}
