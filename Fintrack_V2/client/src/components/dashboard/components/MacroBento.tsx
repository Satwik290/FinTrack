'use client';
import { motion }             from 'framer-motion';
import { TrendingUp, TrendingDown, CheckCircle, Shield, ArrowUpRight } from 'lucide-react';
import Link                   from 'next/link';
import { useWealth }          from '@/hooks/usewealth';
import { useDashboardStore }  from '@/hooks/useDashboard';
import { C, MONO, SYNE, SANS, fmtShort, fmtPct, fmtAxis, timeAgo } from '../../../utils/dashboard/tokens';
import { Shard, Skel }        from './Shard';
import { useCountUp, useCipherMask } from '../../../hooks/useDhooks';

export function MacroBento() {
  const { data: w, isLoading } = useWealth();
  const { isMasked }           = useDashboardStore();
  const nw      = w?.netWorth ?? 0;
  const animNW  = useCountUp(nw);
  const ciphered = useCipherMask(fmtAxis(nw), isMasked);
  const isPos   = nw >= 0;

  // Fluid physics for progress bars (TypeScript fixed)
  const barSpring = { type: "spring" as const, bounce: 0, duration: 1.5 };

  return (
    <div className="bento-macro">

      {/* ── Net Worth Engine ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }} 
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          position: 'relative', 
          borderRadius: 24, 
          overflow: 'hidden', 
          background: 'linear-gradient(160deg, #0A0D14 0%, #05070A 100%)', 
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)', 
          minHeight: 220 
        }}>
        
        {/* Elite Ambient Glows inside card */}
        <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        
        {/* Refined pulse border */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', padding: 1, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0), rgba(99,102,241,0.1))', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />

        <div style={{ position: 'relative', padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: SANS }}>Net Worth Engine</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>Stocks {timeAgo(w?.lastSynced?.stocks)} · MF {timeAgo(w?.lastSynced?.mutualFunds)}</span>
          </div>

          <div style={{ transform: 'translateY(-4px)' }}>
            {isLoading ? <Skel w={220} h={56} r={12} /> : (
              <motion.p key={String(isMasked)} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ fontFamily: SYNE, fontSize: 52, fontWeight: 800, color: '#FAFAFA', letterSpacing: -2.5, lineHeight: 1, marginBottom: 12 }}>
                {isMasked ? ciphered : fmtShort(animNW)}
              </motion.p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: isPos ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isPos ? '#34D399' : '#F87171', border: `1px solid ${isPos ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                {isPos ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                {fmtPct(w?.totalPnlPct ?? 0)} P&L
              </span>
              {!isMasked && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: SANS }}>₹{(w?.totalAssets ?? 0).toLocaleString('en-IN')} Assets / ₹{(w?.totalLiabilities ?? 0).toLocaleString('en-IN')} Debt</span>}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
              <span style={{ fontSize: 10, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: SANS, fontWeight: 500 }}>Financial Freedom</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: '#34D399', fontWeight: 600 }}>{(w?.financialFreedomPct ?? 0).toFixed(0)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}>
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${w?.financialFreedomPct ?? 0}%` }} 
                transition={{ duration: 1.8, ease: "easeOut" }}
                style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, #047857 0%, #34D399 100%)`, boxShadow: '0 0 10px rgba(52,211,153,0.3)' }} 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Assets ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}>
        <Shard style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 24, transition: 'transform 0.2s ease', cursor: 'default' }} className="hover-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.text2, textTransform: 'uppercase', fontFamily: SANS }}>Assets</p>
            <Link href="/wealth" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#818CF8', textDecoration: 'none', fontFamily: SANS, fontWeight: 500, padding: '4px 8px', borderRadius: 6, background: 'rgba(129,140,248,0.1)' }}>All <ArrowUpRight size={10} /></Link>
          </div>
          {isLoading ? <Skel w={140} h={36} r={8} /> : (
            <p style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.text0, marginBottom: 20, letterSpacing: -1 }}>
              {isMasked ? '₹ ••••••' : (w?.totalAssets ?? 0).toLocaleString('en-IN')}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {[
              { l: 'Stocks',       v: w?.stockSummary?.totalCurrent ?? 0, c: '#F59E0B' },
              { l: 'Mutual Funds', v: w?.mfSummary?.totalCurrent    ?? 0, c: '#818CF8' },
              { l: 'Manual',       v: w?.manualAssetsValue          ?? 0, c: '#34D399' },
            ].map((a, i) => {
              const total = Math.max(w?.totalAssets ?? 1, 1);
              const pct   = (a.v / total) * 100;
              return (
                <div key={a.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.text1, fontFamily: SANS }}>{a.l}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.text0, fontWeight: 500 }}>{fmtShort(a.v, isMasked)}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ ...barSpring, delay: i * 0.1 + 0.2 }}
                      style={{ height: '100%', borderRadius: 99, background: a.c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Shard>
      </motion.div>

      {/* ── Liabilities ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}>
        <Shard style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.text2, textTransform: 'uppercase', fontFamily: SANS }}>Liabilities</p>
            <Link href="/wealth" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#818CF8', textDecoration: 'none', fontFamily: SANS, fontWeight: 500, padding: '4px 8px', borderRadius: 6, background: 'rgba(129,140,248,0.1)' }}>Detail <ArrowUpRight size={10} /></Link>
          </div>
          {isLoading ? <Skel w={140} h={36} r={8} /> : (
            <p style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: '#F87171', marginBottom: 16, letterSpacing: -1, textShadow: '0 0 16px rgba(248,113,113,0.2)' }}>
              {isMasked ? '₹ ••••••' : (w?.totalLiabilities ?? 0).toLocaleString('en-IN')}
            </p>
          )}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.text1, fontFamily: SANS }}>Debt-to-Asset</span>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: (w?.debtToAsset ?? 0) <= 30 ? '#34D399' : (w?.debtToAsset ?? 0) <= 50 ? '#FBBF24' : '#F87171' }}>
                {(w?.debtToAsset ?? 0).toFixed(1)}%
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(w?.debtToAsset ?? 0, 100)}%` }} transition={{ ...barSpring, delay: 0.2 }}
                style={{ height: '100%', borderRadius: 99, background: (w?.debtToAsset ?? 0) <= 30 ? '#34D399' : (w?.debtToAsset ?? 0) <= 50 ? '#FBBF24' : '#F87171' }} />
              {[30, 50].map(m => <div key={m} style={{ position: 'absolute', top: 0, bottom: 0, left: `${m}%`, width: 1, background: 'rgba(255,255,255,0.2)' }} />)}
            </div>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.text2, fontFamily: SANS, background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8 }}>
            <span style={{ color: '#34D399' }}>Safe &lt;30%</span><span style={{opacity: 0.2}}>|</span><span style={{ color: '#FBBF24' }}>Warn</span><span style={{opacity: 0.2}}>|</span><span style={{ color: '#F87171' }}>Risk</span>
          </div>
        </Shard>
      </motion.div>

      {/* ── Financial Shield ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}>
        <Shard glow glowColor={C.jade} style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color={(w?.hlvMetrics?.gap ?? 0) > 0 ? '#F87171' : '#34D399'} strokeWidth={2.5} />
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.text2, textTransform: 'uppercase', fontFamily: SANS }}>Shield</p>
            </div>
            <Link href="/wealth?tab=insurance" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#818CF8', textDecoration: 'none', fontFamily: SANS, fontWeight: 500, padding: '4px 8px', borderRadius: 6, background: 'rgba(129,140,248,0.1)' }}>Manage <ArrowUpRight size={10} /></Link>
          </div>
          {isLoading ? <Skel w={140} h={36} r={8} /> : (
            <p style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.text0, marginBottom: 16, letterSpacing: -0.5 }}>
              {isMasked ? '₹ ••••••' : fmtShort(w?.totalInsuranceCoverage ?? 0)}
            </p>
          )}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.text1, fontFamily: SANS }}>HLV Coverage</span>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: (w?.hlvMetrics?.gap ?? 0) > 0 ? '#F87171' : '#34D399' }}>
                {(((w?.totalInsuranceCoverage ?? 0) / Math.max(w?.hlvMetrics?.requiredCoverage ?? 1, 1)) * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((w?.totalInsuranceCoverage ?? 0) / Math.max(w?.hlvMetrics?.requiredCoverage ?? 1, 1)) * 100, 100)}%` }} transition={{ ...barSpring, delay: 0.2 }}
                style={{ height: '100%', borderRadius: 99, background: (w?.hlvMetrics?.gap ?? 0) > 0 ? '#EF4444' : '#10B981' }} />
            </div>
          </div>
          {(w?.hlvMetrics?.gap ?? 0) > 0 ? (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'linear-gradient(to right, rgba(239,68,68,0.1), rgba(239,68,68,0.02))', borderLeft: '2px solid #EF4444', marginTop: 'auto' }}>
              <p style={{ fontSize: 11, color: '#FCA5A5', fontFamily: SANS, margin: 0 }}>Gap: <strong style={{ fontFamily: MONO }}>{fmtAxis(w?.hlvMetrics?.gap ?? 0)}</strong></p>
            </div>
          ) : (
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.1)' }}>
              <CheckCircle size={14} color="#34D399" />
              <span style={{ fontSize: 11, color: '#34D399', fontFamily: SANS, fontWeight: 500 }}>Fully covered</span>
            </div>
          )}
        </Shard>
      </motion.div>
    </div>
  );
}