'use client';
import { Activity, Clock } from 'lucide-react';
import { useWealthStore } from '@/store/useWealthStore';
import type { Asset } from '@/hooks/useWealthSummary';

interface Props { assets: Asset[] }

function fmtINR(cents: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cents / 100);
}

export function AssetList({ assets }: Props) {
  const { isMasked } = useWealthStore();

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Assets</h3>
        <span className="badge badge-success">{assets.length} total</span>
      </div>

      {assets.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No assets yet. Add your first asset.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assets.map((asset) => (
            <div
              key={asset.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 10px', borderRadius: 12,
                border: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: asset.type === 'Market' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {asset.type === 'Market'
                  ? <Activity size={18} style={{ color: 'var(--indigo-500)' }} />
                  : <Clock size={18} style={{ color: 'var(--success)' }} />
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{asset.name}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${asset.type === 'Market' ? 'indigo' : 'success'}`} style={{ fontSize: 11 }}>
                    {asset.type}
                  </span>
                  {asset.ticker && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{asset.ticker}</span>}
                  {asset.type === 'Market' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>× {asset.quantity}</span>}
                </div>
              </div>

              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', flexShrink: 0 }}>
                {isMasked ? '••••' : fmtINR(asset.currentValueInCents)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}