import { V, SYNE, SANS, MONO, fmtAxis } from '../../../utils/dashboard/tokens';
import { ChartPayloadItem }              from '../../../utils/dashboard/types';

interface ChartTipProps {
  active?:  boolean;
  payload?: ChartPayloadItem[];
  label?:   string;
  masked?:  boolean;
}

export function ChartTip({ active, payload, label, masked }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--ft-surface)', border: '1px solid var(--ft-border-hi)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px var(--ft-shadow)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ft-text0)', marginBottom: 7, fontFamily: SYNE }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--ft-text1)', fontFamily: SANS }}>{p.name}:</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--ft-text0)', fontWeight: 600 }}>{masked ? '₹ ••••' : fmtAxis(p.value)}</span>
        </div>
      ))}
    </div>
  );
}