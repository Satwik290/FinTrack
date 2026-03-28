'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWealthSummary } from '@/hooks/useWealthSummary';
import { TotalWealthCard } from '@/components/wealth/TotalWealthCard';
import { LiabilityHeatmap } from '@/components/wealth/LiabilityHeatmap';
import { AssetList } from '@/components/wealth/AssetList';
import { AddAssetModal } from '@/components/wealth/AddAssetModal';
import { AddLiabilityModal } from '@/components/wealth/Addliabilitymodal';
import { Loader2, Plus } from 'lucide-react';

export default function WealthDashboard() {
  const { data, isLoading, isError } = useWealthSummary();
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: 'var(--text-muted)' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        Loading wealth data…
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 16, padding: '24px 32px', color: 'var(--danger)', textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Failed to load wealth data</p>
          <p style={{ fontSize: 13, opacity: 0.8 }}>Ensure the backend is running and you are logged in.</p>
        </div>
      </div>
    );
  }

  const summary = data ?? { netWorthInCents: 0, totalAssetsInCents: 0, totalLiabilitiesInCents: 0, assets: [], liabilities: [] };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Wealth Overview</h1>
          <p className="page-subtitle">Track long-term wealth, market assets, and liabilities</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowLiabilityModal(true)}>
            <Plus size={15} /> Add Liability
          </button>
          <button className="btn btn-primary" onClick={() => setShowAssetModal(true)}>
            <Plus size={15} /> Add Asset
          </button>
        </div>
      </div>

      {/* Top row: wealth card + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, marginBottom: 20 }}>
        <TotalWealthCard
          netWorthInCents={summary.netWorthInCents}
          totalAssetsInCents={summary.totalAssetsInCents}
          totalLiabilitiesInCents={summary.totalLiabilitiesInCents}
        />

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <StatCard label="Total Assets" value={summary.totalAssetsInCents} color="var(--success)" />
          <StatCard label="Total Liabilities" value={summary.totalLiabilitiesInCents} color="var(--danger)" />
          <StatCard label="Assets Count" value={summary.assets.length} color="var(--indigo-500)" isCount />
          <StatCard label="Liabilities Count" value={summary.liabilities.length} color="var(--warning)" isCount />
        </div>
      </div>

      {/* Bottom row: asset list + liability heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <AssetList assets={summary.assets} />
        <LiabilityHeatmap liabilities={summary.liabilities} />
      </div>

      {showAssetModal && <AddAssetModal onClose={() => setShowAssetModal(false)} />}
      {showLiabilityModal && <AddLiabilityModal onClose={() => setShowLiabilityModal(false)} />}
    </motion.div>
  );
}

function StatCard({ label, value, color, isCount }: { label: string; value: number; color: string; isCount?: boolean }) {
  const display = isCount
    ? String(value)
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value / 100);

  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: -0.5 }}>{display}</p>
    </div>
  );
}