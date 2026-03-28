'use client';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useWealthStore } from '@/store/useWealthStore';

interface Props {
  netWorthInCents: number;
  totalAssetsInCents: number;
  totalLiabilitiesInCents: number;
}

function fmtINR(cents: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cents / 100);
}

export function TotalWealthCard({ netWorthInCents, totalAssetsInCents, totalLiabilitiesInCents }: Props) {
  const { isMasked, togglePrivacyMode } = useWealthStore();

  const isPositive = netWorthInCents >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 20, padding: 28, color: '#fff', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
      }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 12, opacity: 0.75, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Net Worth</p>
          <button
            onClick={togglePrivacyMode}
            title={isMasked ? 'Show values' : 'Hide values'}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
          >
            {isMasked ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Net worth value */}
        <p style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.5, marginBottom: 8 }}>
          {isMasked ? '₹ ••••••' : fmtINR(netWorthInCents)}
        </p>

        {/* Change indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
            padding: '3px 10px', borderRadius: 99,
            background: isPositive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
            color: isPositive ? '#6ee7b7' : '#fca5a5',
          }}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isPositive ? 'Positive' : 'Negative'} net worth
          </span>
        </div>

        {/* Assets / Liabilities split */}
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, opacity: 0.6, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Assets</p>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{isMasked ? '••••' : fmtINR(totalAssetsInCents)}</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <p style={{ fontSize: 11, opacity: 0.6, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Liabilities</p>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{isMasked ? '••••' : fmtINR(totalLiabilitiesInCents)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}