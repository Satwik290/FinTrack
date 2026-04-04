'use client';
import { motion }             from 'framer-motion';
import { TrendingUp, TrendingDown, CheckCircle, Shield } from 'lucide-react';
import Link                   from 'next/link';
import { useWealth }          from '@/hooks/usewealth';
import { useDashboardStore }  from '@/hooks/useDashboard';
import { C, MONO, SYNE, SANS, fmtShort, fmtPct, fmtAxis, timeAgo } from '../../../utils/dashboard/tokens';
import { Shard, Skel }        from './Shard';
import { useCountUp, useCipherMask } from '../../../hooks/useDhooks';
import { ArrowUpRight }       from 'lucide-react';

export function MacroBento() {
  const { data: w, isLoading } = useWealth();
  const { isMasked }           = useDashboardStore();
  const nw      = w?.netWorth ?? 0;
  const animNW  = useCountUp(nw);
  const ciphered = useCipherMask(fmtAxis(nw), isMasked);
  const isPos   = nw >= 0;

  return (
    <div className="bento-macro">

      {/* ── Net Worth ── */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(145deg,#080C18 0%,#0C1220 60%,#091019 100%)', border: '1px solid rgba(108,116,255,0.18)', boxShadow: '0 0 60px rgba(108,116,255,0.08),0 16px 48px rgba(0,0,0,0.6)', minHeight: 200 }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,116,255,0.09) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(13,220,155,0.06) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', padding: 1, background: 'linear-gradient(135deg,rgba(108,116,255,0.5),rgba(13,220,155,0.18),rgba(108,116,255,0.05))', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animation: 'border-pulse 4s ease-in-out infinite' }} />

        <div style={{ position: 'relative', padding: '22px 26px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', fontFamily: MONO }}>Net Worth Engine</span>
            <span style={{ fontSize: 9, color: C.text2, fontFamily: MONO }}>Stocks {timeAgo(w?.lastSynced?.stocks)} · MF {timeAgo(w?.lastSynced?.mutualFunds)}</span>
          </div>

          <div>
            {isLoading ? <Skel w={200} h={52} r={10} /> : (
              <motion.p key={String(isMasked)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                style={{ fontFamily: MONO, fontSize: 48, fontWeight: 700, color: C.text0, letterSpacing: -3, lineHeight: 1, marginBottom: 10 }}>
                {isMasked ? ciphered : fmtShort(animNW)}
              </motion.p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: isPos ? 'rgba(13,220,155,0.14)' : 'rgba(255,92,103,0.14)', color: isPos ? C.jade : C.terra }}>
                {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {fmtPct(w?.totalPnlPct ?? 0)} P&L on cost
              </span>
              {!isMasked && <span style={{ fontSize: 10, color: C.text2, fontFamily: SANS }}>₹{(w?.totalAssets ?? 0).toLocaleString('en-IN')} assets · ₹{(w?.totalLiabilities ?? 0).toLocaleString('en-IN')} debt</span>}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontFamily: MONO }}>Financial Freedom</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: C.jade, fontWeight: 700 }}>{(w?.financialFreedomPct ?? 0).toFixed(0)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${w?.financialFreedomPct ?? 0}%` }} transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.jade},#86efac)` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Assets ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <Shard style={{ padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: C.text2, textTransform: 'uppercase', fontFamily: MONO }}>Assets</p>
            <Link href="/wealth" style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: C.indigo, textDecoration: 'none', fontFamily: SANS }}>All <ArrowUpRight size={9} /></Link>
          </div>
          {isLoading ? <Skel w={120} h={30} r={8} /> : (
            <p style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.text0, marginBottom: 14, letterSpacing: -1 }}>
              {isMasked ? '₹ ••••••' : (w?.totalAssets ?? 0).toLocaleString('en-IN')}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
            {[
              { l: 'Stocks',       v: w?.stockSummary?.totalCurrent ?? 0, c: '#F59E0B' },
              { l: 'Mutual Funds', v: w?.mfSummary?.totalCurrent    ?? 0, c: C.indigo },
              { l: 'Manual',       v: w?.manualAssetsValue          ?? 0, c: C.jade },
            ].map((a, i) => {
              const total = Math.max(w?.totalAssets ?? 1, 1);
              const pct   = (a.v / total) * 100;
              return (
                <div key={a.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: C.text1, fontFamily: SANS }}>{a.l}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.text0, fontWeight: 600 }}>{fmtShort(a.v, isMasked)}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.9, delay: i * 0.1 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: '100%', borderRadius: 99, background: a.c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Shard>
      </motion.div>

      {/* ── Liabilities ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
        <Shard style={{ padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: C.text2, textTransform: 'uppercase', fontFamily: MONO }}>Liabilities</p>
            <Link href="/wealth" style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: C.indigo, textDecoration: 'none', fontFamily: SANS }}>Detail <ArrowUpRight size={9} /></Link>
          </div>
          {isLoading ? <Skel w={120} h={30} r={8} /> : (
            <p style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.terra, marginBottom: 12, letterSpacing: -1 }}>
              {isMasked ? '₹ ••••••' : (w?.totalLiabilities ?? 0).toLocaleString('en-IN')}
            </p>
          )}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: C.text1, fontFamily: SANS }}>Debt-to-Asset</span>
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: (w?.debtToAsset ?? 0) <= 30 ? C.jade : (w?.debtToAsset ?? 0) <= 50 ? C.amber : C.terra }}>
                {(w?.debtToAsset ?? 0).toFixed(1)}%
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(w?.debtToAsset ?? 0, 100)}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: 99, background: (w?.debtToAsset ?? 0) <= 30 ? C.jade : (w?.debtToAsset ?? 0) <= 50 ? C.amber : C.terra }} />
              {[30, 50].map(m => <div key={m} style={{ position: 'absolute', top: 0, bottom: 0, left: `${m}%`, width: 1, background: 'rgba(255,255,255,0.15)' }} />)}
            </div>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text2, fontFamily: SANS }}>
            <span style={{ color: C.jade }}>Safe &lt;30%</span><span>·</span><span style={{ color: C.amber }}>Warn</span><span>·</span><span style={{ color: C.terra }}>Risk</span>
          </div>
        </Shard>
      </motion.div>

      {/* ── Financial Shield ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Shard glow glowColor={C.jade} style={{ padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={12} color={(w?.hlvMetrics?.gap ?? 0) > 0 ? C.terra : C.jade} />
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: C.text2, textTransform: 'uppercase', fontFamily: MONO }}>Shield</p>
            </div>
            <Link href="/wealth?tab=insurance" style={{ fontSize: 10, color: C.indigo, textDecoration: 'none', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 2 }}>Manage <ArrowUpRight size={9} /></Link>
          </div>
          {isLoading ? <Skel w={120} h={30} r={8} /> : (
            <p style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.text0, marginBottom: 12, letterSpacing: -0.5 }}>
              {isMasked ? '₹ ••••••' : fmtShort(w?.totalInsuranceCoverage ?? 0)}
            </p>
          )}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: C.text1, fontFamily: SANS }}>HLV Coverage</span>
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: (w?.hlvMetrics?.gap ?? 0) > 0 ? C.terra : C.jade }}>
                {(((w?.totalInsuranceCoverage ?? 0) / Math.max(w?.hlvMetrics?.requiredCoverage ?? 1, 1)) * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((w?.totalInsuranceCoverage ?? 0) / Math.max(w?.hlvMetrics?.requiredCoverage ?? 1, 1)) * 100, 100)}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: 99, background: (w?.hlvMetrics?.gap ?? 0) > 0 ? C.terra : C.jade }} />
            </div>
          </div>
          {(w?.hlvMetrics?.gap ?? 0) > 0 && (
            <div style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,92,103,0.08)', border: '1px solid rgba(255,92,103,0.15)', marginTop: 'auto' }}>
              <p style={{ fontSize: 10, color: C.terra, fontFamily: SANS }}>Gap: <strong style={{ fontFamily: MONO }}>{fmtAxis(w?.hlvMetrics?.gap ?? 0)}</strong></p>
            </div>
          )}
          {(w?.hlvMetrics?.gap ?? 0) <= 0 && (
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={12} color={C.jade} />
              <span style={{ fontSize: 10, color: C.jade, fontFamily: SANS }}>Fully covered</span>
            </div>
          )}
        </Shard>
      </motion.div>
    </div>
  );
}