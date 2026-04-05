'use client';
import { useMemo }           from 'react';
import { motion }            from 'framer-motion';
import { useWealth }         from '@/hooks/usewealth';
import { useDashboardStore } from '@/hooks/useDashboard';
import { V, MONO, SYNE, SANS, fmtShort } from '../../../utils/dashboard/tokens';
import { Shard }             from './Shard';

function cellBg(pct: number, kind: string): string {
  if (kind === 'ASSET') return 'rgba(108,116,255,0.12)';
  if (pct > 15)  return 'rgba(13,220,155,0.55)';
  if (pct > 5)   return 'rgba(13,220,155,0.32)';
  if (pct > 0)   return 'rgba(13,220,155,0.14)';
  if (pct > -8)  return 'rgba(255,92,103,0.18)';
  return 'rgba(255,92,103,0.4)';
}

export function PortfolioHeatmap() {
  const { data: wealth } = useWealth();
  const { isMasked }     = useDashboardStore();

  const items = useMemo(() => {
    const mf  = (wealth?.mfHoldings   ?? []).map(h => ({ name: h.schemeName,   val: h.currentValue,              pct: h.pnlPct, kind: 'MF'    }));
    const stk = (wealth?.stockHoldings ?? []).map(h => ({ name: h.companyName,  val: h.currentValue,              pct: h.pnlPct, kind: 'STOCK' }));
    const ast = (wealth?.assets        ?? []).map(a => ({ name: a.name,          val: a.currentValueInCents / 100, pct: 0,        kind: 'ASSET' }));
    return [...mf, ...stk, ...ast].sort((a, b) => b.val - a.val).slice(0, 8);
  }, [wealth]);

  const totalVal = items.reduce((s, h) => s + h.val, 0) || 1;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
      <Shard style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: 'var(--ft-text0)', marginBottom: 2 }}>Portfolio Heatmap</p>
            <p style={{ fontSize: 10, color: 'var(--ft-text2)', fontFamily: SANS }}>Size = value · Color = P&L</p>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 9 }}>
            {[{ c: V.jade, l: 'Gain' }, { c: V.terra, l: 'Loss' }, { c: V.indigo, l: 'Asset' }].map(s => (
              <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ft-text2)', fontFamily: SANS }}>
                <span style={{ width: 6, height: 6, borderRadius: 1, background: s.c }} />{s.l}
              </span>
            ))}
          </div>
        </div>
        {!items.length ? (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 28 }}>📊</span>
            <span style={{ fontSize: 12, color: 'var(--ft-text1)', fontFamily: SANS }}>Add investments to see heatmap</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {items.map((h, i) => {
              const w = (h.val / totalVal) * 100;
              return (
                <motion.div key={h.name + i}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.04, zIndex: 10 }}
                  style={{ borderRadius: 8, padding: '9px 11px', minHeight: w > 18 ? 90 : w > 8 ? 70 : 56, flexBasis: w > 18 ? '43%' : w > 8 ? '28%' : w > 4 ? '20%' : '16%', flexGrow: 1, background: cellBg(h.pct, h.kind), border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative', cursor: 'default' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)' }} />
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3, marginBottom: 6, fontFamily: SANS }}>{h.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{fmtShort(h.val, isMasked)}</span>
                    {h.kind !== 'ASSET' && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{h.pct >= 0 ? '+' : ''}{h.pct.toFixed(1)}%</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Shard>
    </motion.div>
  );
}