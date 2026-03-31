'use client';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  Eye, EyeOff, TrendingUp, TrendingDown, RefreshCw,
  AlertTriangle, CheckCircle, Lightbulb, Zap, X,
  ArrowUpRight, BarChart2, Activity, Wallet, ChevronRight,
  Sparkles, Target,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, Legend,
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets }      from '@/hooks/useBudgets';
import { useWealth }       from '@/hooks/usewealth';
import { useInsights, useForecast, useComparisons, useDashboardStore } from '@/hooks/useDashboard';
import { useAppStore }     from '@/store/useAppStore';
import Link from 'next/link';

/* ══════════════════════════════════════════════════
 *  DESIGN SYSTEM — Premium Fintech Dark
 * ══════════════════════════════════════════════════ */
const DS = {
  // Backgrounds
  canvas:    '#0F121C',
  card:      '#161B29',
  cardHover: '#1C2236',

  // Typography
  textPrimary:   '#E5EAF0',
  textSecondary: '#8897A7',
  textMuted:     '#4A5568',

  // Accents
  indigo:  '#6C74FF',
  purple:  '#7E5BFB',

  // Semantic
  gain:  '#0DDC9B',
  loss:  '#FF5C67',
  info:  '#42A5F5',

  // Transparencies
  glass:       'rgba(229,234,240,0.06)',
  glassHover:  'rgba(108,116,255,0.08)',
  glassActive: 'rgba(108,116,255,0.16)',
  border:      'rgba(255,255,255,0.06)',
  borderGlow:  'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.02) 100%)',
  shadow:      '0 4px 24px rgba(0,0,0,0.35)',
  shadowLg:    '0 8px 48px rgba(0,0,0,0.5)',
} as const;

const MONO = "'Space Mono','JetBrains Mono','Courier New',monospace";

/* ─── Formatters ─────────────────────────────────── */
const fmtINR = (n: number, masked = false): string =>
  masked ? '₹ ••••' :
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

const fmtShort = (n: number, masked = false): string => {
  if (masked) return '••••';
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n/1000).toFixed(0)}k`;
  return `₹${Math.round(n)}`;
};

const fmtPct = (n: number): string => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

function timeAgo(iso: string | null | undefined | number): string {
  if (!iso) return 'Never';
  const ms = Date.now() - new Date(iso as string).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ══════════════════════════════════════════════════
 *  COUNT-UP with spring physics
 * ══════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = val;
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(from + (target - from) * ease));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

/* ══════════════════════════════════════════════════
 *  BORDER BEAM — pure CSS animation
 * ══════════════════════════════════════════════════ */
function BorderBeam({ color1 = DS.indigo, color2 = DS.purple, duration = 4, delay = 0 }: {
  color1?: string; color2?: string; duration?: number; delay?: number;
}) {
  return (
    <div aria-hidden style={{
      position:'absolute', inset:0, borderRadius:'inherit', pointerEvents:'none', overflow:'hidden',
    }}>
      <div style={{
        position:'absolute', inset:-1,
        background:`conic-gradient(from calc(var(--beam-angle,0deg)), transparent 0deg, ${color1} 40deg, ${color2} 80deg, transparent 120deg)`,
        borderRadius:'inherit',
        animation:`beam-spin ${duration}s linear ${delay}s infinite`,
        opacity:0.7,
      }}/>
      <div style={{
        position:'absolute', inset:1, borderRadius:'inherit',
        background: DS.card,
      }}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  GLASS CARD primitive
 * ══════════════════════════════════════════════════ */
function GlassCard({
  children, className = '', style = {},
  beam = false, beamColor1 = DS.indigo, beamColor2 = DS.purple, beamDelay = 0,
  onClick,
}: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
  beam?: boolean; beamColor1?: string; beamColor2?: string; beamDelay?: number;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={className}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position:'relative', borderRadius:20, overflow:'hidden',
        background: DS.glass,
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        boxShadow: hovered
          ? `${DS.shadowLg}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `${DS.shadow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition:'box-shadow 0.3s ease',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      animate={{ background: hovered ? DS.glassHover : DS.glass }}
      transition={{ duration:0.2 }}
    >
      {/* Gradient border */}
      <div style={{
        position:'absolute', inset:0, borderRadius:'inherit', pointerEvents:'none',
        padding:1,
        background: DS.borderGlow,
        WebkitMask:'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite:'xor',
        maskComposite:'exclude',
      }}/>
      {beam && <BorderBeam color1={beamColor1} color2={beamColor2} beamDelay={beamDelay}/>}
      <div style={{ position:'relative', zIndex:1 }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ── Skeleton loader ─────────────────────────────── */
function Skeleton({ w = '100%', h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{ width:w, height:h, borderRadius:r, background:`linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
  );
}

/* ══════════════════════════════════════════════════
 *  DELTA CHIP — comparison vs last period
 * ══════════════════════════════════════════════════ */
function DeltaChip({ value, suffix = '%', label = 'vs last month' }: { value: number; suffix?: string; label?: string }) {
  const isPos = value >= 0;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:3,
      fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
      background: isPos ? 'rgba(13,220,155,0.12)' : 'rgba(255,92,103,0.12)',
      color: isPos ? DS.gain : DS.loss,
    }}>
      {isPos ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
      {isPos ? '+' : ''}{value.toFixed(1)}{suffix} <span style={{ opacity:0.7, fontWeight:400 }}>{label}</span>
    </span>
  );
}

/* ══════════════════════════════════════════════════
 *  1. WEALTH HEADER — 3-CARD STACK
 * ══════════════════════════════════════════════════ */
function WealthHeaderCard() {
  const { data: wealth, refetch, isFetching, isLoading } = useWealth();
  const { isMasked, togglePrivacyMode } = useDashboardStore();

  const nw    = wealth?.netWorth ?? 0;
  const animNW = useCountUp(nw);
  const isPos  = nw >= 0;

  const total = Math.max(wealth?.totalAssets ?? 1, 1);
  const alloc = {
    stocks : (wealth?.stockSummary?.totalCurrent ?? 0) / total * 100,
    mf     : (wealth?.mfSummary?.totalCurrent ?? 0)   / total * 100,
    manual : (wealth?.manualAssetsValue ?? 0)          / total * 100,
  };

  const fastest = wealth?.liabilities?.length
    ? [...wealth.liabilities].sort((a, b) => a.remainingBalanceInCents - b.remainingBalanceInCents)[0]
    : null;

  const avgRate = wealth?.liabilities?.length
    ? wealth.liabilities.reduce((s, l) => s + l.interestRate, 0) / wealth.liabilities.length
    : 0;

  return (
    <div className="dash-hdr">
      {/* ── Net Worth Card (beam active) ── */}
      <div style={{ position:'relative', borderRadius:22, overflow:'hidden', minHeight:230 }}>
        {/* Dark base */}
        <div style={{
          position:'absolute', inset:0, borderRadius:'inherit',
          background:'linear-gradient(145deg,#0A0D18 0%,#111626 55%,#0E0A1F 100%)',
        }}/>
        {/* Animated beam border */}
        <div style={{
          position:'absolute', inset:0, borderRadius:'inherit',
          padding:1.5,
          background:'linear-gradient(135deg,rgba(108,116,255,0.6),rgba(126,91,251,0.3),rgba(13,220,155,0.2))',
          WebkitMask:'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite:'xor',
          maskComposite:'exclude',
          animation:'border-pulse 3s ease-in-out infinite',
        }}/>
        {/* Orbs */}
        <div style={{ position:'absolute',top:-80,right:-60,width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(108,116,255,0.12) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-60,left:-20,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(13,220,155,0.06) 0%,transparent 70%)',pointerEvents:'none' }}/>

        <div style={{ position:'relative', padding:26, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          {/* Top */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:2.5, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>Net Worth</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => refetch()}
                style={{ width:26, height:26, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)', transition:'background 0.15s' }}>
                <RefreshCw size={11} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }}/>
              </button>
              <button onClick={togglePrivacyMode}
                style={{ width:26, height:26, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background: isMasked ? 'rgba(108,116,255,0.2)' : 'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)', transition:'background 0.15s' }}>
                {isMasked ? <EyeOff size={11}/> : <Eye size={11}/>}
              </button>
            </div>
          </div>

          {/* Main number */}
          <div>
            {isLoading ? <Skeleton w={180} h={48} r={10}/> : (
              <p style={{ fontFamily:MONO, fontSize:44, fontWeight:700, color:DS.textPrimary, letterSpacing:-2, marginBottom:8, lineHeight:1 }}>
                {isMasked ? '₹ ••••••' : fmtShort(animNW)}
              </p>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{
                display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700,
                padding:'3px 10px', borderRadius:99,
                background: isPos ? 'rgba(13,220,155,0.15)' : 'rgba(255,92,103,0.15)',
                color: isPos ? DS.gain : DS.loss,
              }}>
                {isPos ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                {fmtPct(wealth?.totalPnlPct ?? 0)} P&L
              </span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>on cost basis</span>
            </div>
          </div>

          {/* Freshness */}
          <div style={{ display:'flex', gap:16, marginBottom:12, fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:0.3 }}>
            <span>📊 Stocks {timeAgo(wealth?.lastSynced?.stocks)}</span>
            <span>📈 MF {timeAgo(wealth?.lastSynced?.mutualFunds)}</span>
          </div>

          {/* Freedom bar */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:9, letterSpacing:1.5, color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>Financial Freedom</span>
              <span style={{ fontFamily:MONO, fontSize:10, color:DS.gain, fontWeight:700 }}>
                {(wealth?.financialFreedomPct ?? 0).toFixed(0)}%
              </span>
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden', position:'relative' }}>
              <motion.div
                initial={{ width:0 }} animate={{ width:`${wealth?.financialFreedomPct ?? 0}%` }}
                transition={{ duration:1.8, ease:[0.16,1,0.3,1] }}
                style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${DS.gain},#86efac)` }}
              />
              {/* Target marker at 100% - always visible */}
              <div style={{ position:'absolute', top:-2, right:0, width:2, height:8, borderRadius:1, background:'rgba(255,255,255,0.25)' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:9, color:'rgba(255,255,255,0.15)' }}>
              <span>0%</span><span>Debt Free → 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assets Card ── */}
      <GlassCard style={{ background:'rgba(22,27,41,0.8)', padding:22, display:'flex', flexDirection:'column', gap:0 }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:DS.textMuted, textTransform:'uppercase', marginBottom:6 }}>Assets</p>
        {isLoading ? <Skeleton w={140} h={32} r={8}/> : (
          <p style={{ fontFamily:MONO, fontSize:26, fontWeight:700, color:DS.textPrimary, marginBottom:16, letterSpacing:-1 }}>
            <span style={{ fontSize:16, fontWeight:400, color:DS.textMuted }}>₹</span>
            <span>{isMasked ? ' ••••••' : (wealth?.totalAssets ?? 0).toLocaleString('en-IN')}</span>
          </p>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
          {[
            { label:'Stocks',       val: wealth?.stockSummary?.totalCurrent ?? 0, pct: alloc.stocks, color:'#F59E0B' },
            { label:'Mutual Funds', val: wealth?.mfSummary?.totalCurrent ?? 0,    pct: alloc.mf,     color: DS.indigo },
            { label:'Manual',       val: wealth?.manualAssetsValue ?? 0,           pct: alloc.manual, color: DS.gain   },
          ].map((a, i) => (
            <div key={a.label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:11, color:DS.textSecondary }}>{a.label}</span>
                <span style={{ fontFamily:MONO, fontSize:11, color:DS.textPrimary, fontWeight:600 }}>
                  {fmtShort(a.val, isMasked)}
                </span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(a.pct,100)}%` }}
                  transition={{ duration:0.9, delay:i*0.12+0.2, ease:[0.16,1,0.3,1] }}
                  style={{ height:'100%', borderRadius:99, background:a.color }}/>
              </div>
            </div>
          ))}
        </div>
        <Link href="/wealth" style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:DS.indigo, fontWeight:600, textDecoration:'none', marginTop:14 }}>
          View all assets <ArrowUpRight size={11}/>
        </Link>
      </GlassCard>

      {/* ── Liabilities Card ── */}
      <GlassCard style={{ background:'rgba(22,27,41,0.8)', padding:22, display:'flex', flexDirection:'column' }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:DS.textMuted, textTransform:'uppercase', marginBottom:6 }}>Liabilities</p>
        {isLoading ? <Skeleton w={140} h={32} r={8}/> : (
          <p style={{ fontFamily:MONO, fontSize:26, fontWeight:700, color:DS.loss, marginBottom:14, letterSpacing:-1 }}>
            <span style={{ fontSize:16, fontWeight:400, opacity:0.7 }}>₹</span>
            <span>{isMasked ? ' ••••••' : (wealth?.totalLiabilities ?? 0).toLocaleString('en-IN')}</span>
          </p>
        )}

        {/* D/A gauge */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:11, color:DS.textSecondary }}>Debt-to-Asset</span>
            <span style={{ fontFamily:MONO, fontSize:11, fontWeight:700,
              color:(wealth?.debtToAsset??0)<=30 ? DS.gain : (wealth?.debtToAsset??0)<=50 ? '#F59E0B' : DS.loss }}>
              {(wealth?.debtToAsset??0).toFixed(1)}%
            </span>
          </div>
          <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden', position:'relative' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(wealth?.debtToAsset??0,100)}%` }}
              transition={{ duration:1, ease:[0.16,1,0.3,1] }}
              style={{ height:'100%', borderRadius:99,
                background:(wealth?.debtToAsset??0)<=30 ? DS.gain : (wealth?.debtToAsset??0)<=50 ? '#F59E0B' : DS.loss }}/>
            {[30,50].map(m => (
              <div key={m} style={{ position:'absolute',top:0,bottom:0,left:`${m}%`,width:1.5,background:'rgba(255,255,255,0.2)' }}/>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, fontSize:9, color:DS.textMuted }}>
            <span style={{ color:DS.gain }}>Safe &lt;30%</span>
            <span style={{ color:'#F59E0B' }}>Caution</span>
            <span style={{ color:DS.loss }}>High Risk</span>
          </div>
        </div>

        {fastest && (
          <div style={{ padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', marginBottom:10 }}>
            <p style={{ fontSize:9, color:DS.textMuted, marginBottom:3, letterSpacing:0.5 }}>FASTEST PAYOFF →</p>
            <p style={{ fontSize:12, fontWeight:700, color:DS.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fastest.loanName}</p>
            <p style={{ fontFamily:MONO, fontSize:11, color:DS.loss, marginTop:2 }}>
              {isMasked ? '••••' : fmtINR(fastest.remainingBalanceInCents/100)} remaining
            </p>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
          <span style={{ fontSize:11, color:DS.textSecondary }}>Avg rate: <strong style={{ color:DS.textPrimary, fontFamily:MONO }}>{avgRate.toFixed(1)}%</strong></span>
          <Link href="/wealth" style={{ fontSize:11, color:DS.indigo, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
            Details <ArrowUpRight size={10}/>
          </Link>
        </div>
      </GlassCard>

      {/* ── Financial Shield Card ── */}
      <GlassCard style={{ background:'rgba(22,27,41,0.8)', padding:22, display:'flex', flexDirection:'column' }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:DS.textMuted, textTransform:'uppercase', marginBottom:6 }}>Financial Shield</p>
        {isLoading ? <Skeleton w={140} h={32} r={8}/> : (
          <p style={{ fontFamily:MONO, fontSize:26, fontWeight:700, color:DS.textPrimary, marginBottom:14, letterSpacing:-1 }}>
            <span style={{ fontSize:16, fontWeight:400, opacity:0.7 }}>₹</span>
            <span>{isMasked ? ' ••••••' : (wealth?.totalInsuranceCoverage ?? 0).toLocaleString('en-IN')}</span>
          </p>
        )}

        {/* Coverage vs Debt gauge */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:11, color:DS.textSecondary }}>Coverage Ratio</span>
            <span style={{ fontFamily:MONO, fontSize:11, fontWeight:700,
              color:(wealth?.hlvMetrics?.gap??0)>0 ? DS.loss : DS.gain }}>
              {isMasked ? '••••' : (((wealth?.totalInsuranceCoverage??0)/(wealth?.hlvMetrics?.requiredCoverage||1))*100).toFixed(0) + '%'}
            </span>
          </div>
          <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden', position:'relative' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(((wealth?.totalInsuranceCoverage??0)/(wealth?.hlvMetrics?.requiredCoverage||1))*100,100)}%` }}
              transition={{ duration:1, ease:[0.16,1,0.3,1] }}
              style={{ height:'100%', borderRadius:99,
                background:(wealth?.hlvMetrics?.gap??0)>0 ? DS.loss : DS.gain }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, fontSize:9, color:DS.textMuted }}>
            <span>Req: ₹{fmtShort(wealth?.hlvMetrics?.requiredCoverage ?? 0)}</span>
            {(wealth?.hlvMetrics?.gap??0)>0 && <span style={{color: DS.loss}}>Gap: ₹{fmtShort(wealth?.hlvMetrics?.gap??0)}</span>}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
          <span style={{ fontSize:11, color:DS.textSecondary }}>Policies: <strong style={{ color:DS.textPrimary, fontFamily:MONO }}>{wealth?.insurancePolicies?.length ?? 0}</strong></span>
          <Link href="/wealth?tab=insurance" style={{ fontSize:11, color:DS.indigo, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
            Manage <ArrowUpRight size={10}/>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  2. KPI STRIP with deltas
 * ══════════════════════════════════════════════════ */
function KpiStrip() {
  const { data: txns = [], isLoading } = useTransactions();
  const { data: budgets = [] }         = useBudgets();
  const { isMasked }                   = useDashboardStore();

  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const prevKey = (() => { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();

  const mo    = txns.filter(t => t.date.startsWith(key));
  const prevMo = txns.filter(t => t.date.startsWith(prevKey));

  const income   = mo.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense  = mo.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const pIncome  = prevMo.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
  const pExpense = prevMo.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);

  const saved    = income - expense;
  const saveRate = income > 0 ? (saved / income) * 100 : 0;
  const totalBudget = budgets.reduce((s,b)=>s+b.limit,0);
  const budgetPct   = totalBudget > 0 ? (expense/totalBudget)*100 : 0;

  const incDelta  = pIncome  > 0 ? ((income  - pIncome)  / pIncome)  * 100 : 0;
  const expDelta  = pExpense > 0 ? ((expense - pExpense) / pExpense) * 100 : 0;

  const tiles = [
    {
      icon: <TrendingUp size={15}/>, label:'Income', val: fmtINR(income,isMasked),
      color: DS.gain, bg:'rgba(13,220,155,0.08)',
      sub: `${mo.filter(t=>t.type==='income').length} sources`,
      delta: <DeltaChip value={incDelta}/>,
    },
    {
      icon: <TrendingDown size={15}/>, label:'Expenses', val: fmtINR(expense,isMasked),
      color: DS.loss, bg:'rgba(255,92,103,0.08)',
      sub: `${mo.filter(t=>t.type==='expense').length} transactions`,
      delta: <DeltaChip value={expDelta}/>,
    },
    {
      icon: <Activity size={15}/>, label:'Savings Rate', val:`${saveRate.toFixed(1)}%`,
      color: saveRate>=20 ? DS.gain : saveRate>=10 ? '#F59E0B' : DS.loss,
      bg: saveRate>=20 ? 'rgba(13,220,155,0.08)' : 'rgba(245,158,11,0.08)',
      sub: isMasked ? 'this month' : `Saved ${fmtINR(saved)}`,
      delta: null,
    },
    {
      icon: <BarChart2 size={15}/>, label:'Budget Used', val:`${Math.round(budgetPct)}%`,
      color: budgetPct>=100 ? DS.loss : budgetPct>=80 ? '#F59E0B' : DS.gain,
      bg: budgetPct>=80 ? 'rgba(245,158,11,0.08)' : 'rgba(13,220,155,0.08)',
      sub: isMasked ? 'of total budget' : `of ${fmtINR(totalBudget)}`,
      delta: null,
    },
    {
      icon: <Wallet size={15}/>, label:'Transactions', val:`${mo.length}`,
      color: DS.indigo, bg:'rgba(108,116,255,0.08)',
      sub: 'this month',
      delta: null,
    },
  ];

  return (
    <div className="kpi-strip" style={{ marginBottom:20 }}>
      {tiles.map((t, i) => (
        <motion.div key={t.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06+0.1 }}>
          <GlassCard style={{ background:'rgba(22,27,41,0.7)', padding:18 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <p style={{ fontSize:10, color:DS.textMuted, fontWeight:600, letterSpacing:0.5 }}>{t.label}</p>
              <div style={{ width:28, height:28, borderRadius:8, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', color:t.color }}>
                {isLoading ? <div style={{ width:12, height:12, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/> : t.icon}
              </div>
            </div>
            {isLoading
              ? <Skeleton w={80} h={28} r={6}/>
              : <p style={{ fontFamily:MONO, fontSize:20, fontWeight:700, color:t.color, letterSpacing:-0.5, marginBottom:4 }}>{t.val}</p>
            }
            <p style={{ fontSize:10, color:DS.textMuted, marginBottom: t.delta ? 6 : 0 }}>{t.sub}</p>
            {t.delta}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  3. INSIGHTS HUB
 * ══════════════════════════════════════════════════ */
const INS_CFG = {
  danger:  { c:DS.loss,  bg:'rgba(255,92,103,0.07)',  border:'rgba(255,92,103,0.2)',  icon:AlertTriangle, tag:'Urgent'      },
  warning: { c:'#F59E0B',bg:'rgba(245,158,11,0.07)',  border:'rgba(245,158,11,0.2)',  icon:Zap,           tag:'Attention'   },
  success: { c:DS.gain,  bg:'rgba(13,220,155,0.07)',   border:'rgba(13,220,155,0.2)',  icon:CheckCircle,   tag:'Achievement' },
  info:    { c:DS.info,  bg:'rgba(66,165,245,0.07)',   border:'rgba(66,165,245,0.2)',  icon:Lightbulb,     tag:'Tip'         },
} as const;

function InsightsHub() {
  const { data: raw = [] } = useInsights();
  const { dismissedInsights, dismissInsight } = useDashboardStore();
  const visible = raw.filter(i => !dismissedInsights.includes(i.id));
  if (!visible.length) return null;

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} style={{ marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <p style={{ fontSize:14, fontWeight:700, color:DS.textPrimary, marginBottom:2 }}>Smart Insights</p>
          <p style={{ fontSize:10, color:DS.textMuted }}>Ranked by urgency · click × to snooze</p>
        </div>
        <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, background:`linear-gradient(135deg,${DS.indigo},${DS.purple})`, color:'#fff', fontWeight:600 }}>
          ✨ AI
        </span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:10 }}>
        <AnimatePresence>
          {visible.map((ins, i) => {
            const cfg = INS_CFG[ins.severity];
            const Icon = cfg.icon;
            return (
              <motion.div key={ins.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, scale:0.95 }} transition={{ delay:i*0.04 }}
                style={{ display:'flex', gap:10, padding:'13px 14px', borderRadius:14, background:cfg.bg, border:`1px solid ${cfg.border}`, backdropFilter:'blur(8px)' }}>
                <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`${cfg.c}18`, display:'flex', alignItems:'center', justifyContent:'center', color:cfg.c }}>
                  <Icon size={14}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontSize:8, fontWeight:700, letterSpacing:1, color:cfg.c, textTransform:'uppercase' }}>{cfg.tag}</span>
                  <p style={{ fontWeight:700, fontSize:12, color:DS.textPrimary, lineHeight:1.3, marginTop:2, marginBottom:2 }}>{ins.title}</p>
                  <p style={{ fontSize:10, color:DS.textSecondary, lineHeight:1.5 }}>{ins.body}</p>
                </div>
                <button onClick={() => dismissInsight(ins.id)}
                  style={{ width:18, height:18, borderRadius:5, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:DS.textMuted, flexShrink:0 }}>
                  <X size={10}/>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
 *  4. TREEMAP HEATMAP — cell size ∝ portfolio weight
 * ══════════════════════════════════════════════════ */
function TreemapHeatmap() {
  const { data: wealth }  = useWealth();
  const { isMasked }      = useDashboardStore();
  const [tooltip, setTooltip] = useState<{ x:number; y:number; item:any } | null>(null);

  const items = useMemo(() => {
    const mf  = (wealth?.mfHoldings  ?? []).map(h => ({ name:h.schemeName,    val:h.currentValue,           pct:h.pnlPct, kind:'MF',    badge:'MF'       }));
    const stk = (wealth?.stockHoldings?? []).map(h => ({ name:h.companyName,  val:h.currentValue,           pct:h.pnlPct, kind:'STOCK', badge:h.exchange  }));
    const ast = (wealth?.assets       ?? []).map(a => ({ name:a.name,          val:a.currentValueInCents/100, pct:0,       kind:'ASSET', badge:a.type      }));
    return [...mf,...stk,...ast].sort((a,b)=>b.val-a.val).slice(0,10);
  }, [wealth]);

  if (!items.length) return null;

  const totalVal = items.reduce((s,h)=>s+h.val,0) || 1;

  const cellBg = (pct: number, kind: string) => {
    if (kind==='ASSET') return 'rgba(108,116,255,0.12)';
    if (pct > 20) return 'rgba(13,220,155,0.7)';
    if (pct > 8)  return 'rgba(13,220,155,0.42)';
    if (pct > 0)  return 'rgba(13,220,155,0.18)';
    if (pct > -8) return 'rgba(255,92,103,0.2)';
    if (pct > -20)return 'rgba(255,92,103,0.45)';
    return 'rgba(255,92,103,0.7)';
  };

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} style={{ marginBottom:20 }}>
      <GlassCard style={{ background:'rgba(22,27,41,0.7)', padding:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:DS.textPrimary, marginBottom:2 }}>Portfolio TreeMap</p>
            <p style={{ fontSize:10, color:DS.textMuted }}>Cell size = value · Color = P&L · Hover for details</p>
          </div>
          <div style={{ display:'flex', gap:14, fontSize:10 }}>
            {[{c:DS.gain, l:'Gain'},{c:DS.loss, l:'Loss'},{c:DS.indigo, l:'Manual'}].map(s => (
              <span key={s.l} style={{ display:'flex', alignItems:'center', gap:5, color:DS.textMuted }}>
                <span style={{ width:8, height:8, borderRadius:2, background:s.c }}/>{s.l}
              </span>
            ))}
          </div>
        </div>

        {/* Treemap grid — flex wrap with flex-basis proportional to value */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, position:'relative' }}
          onMouseLeave={() => setTooltip(null)}>
          {items.map((h, i) => {
            const weight = (h.val / totalVal) * 100;
            const minW = weight > 20 ? '45%' : weight > 10 ? '30%' : weight > 5 ? '22%' : '18%';
            const minH = weight > 20 ? 110 : weight > 10 ? 90 : 72;
            return (
              <motion.div key={h.name+i}
                initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.05 }}
                whileHover={{ scale:1.03, zIndex:10 }}
                onHoverStart={(e) => {
                  const rect = (e.target as HTMLElement).closest('[data-cell]')?.getBoundingClientRect();
                  setTooltip({ x: 0, y: 0, item: h });
                }}
                data-cell="true"
                style={{
                  borderRadius:12, padding:'12px 14px', minHeight:minH, flexBasis:minW, flexGrow:1,
                  background:cellBg(h.pct,h.kind),
                  border:'1px solid rgba(255,255,255,0.06)',
                  cursor:'default', display:'flex', flexDirection:'column', justifyContent:'space-between',
                  position:'relative', overflow:'hidden',
                }}
              >
                {/* Shimmer highlight */}
                <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',pointerEvents:'none' }}/>
                <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.3, marginBottom:8 }}>
                  {h.name}
                </p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <span style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.95)' }}>
                    {fmtShort(h.val, isMasked)}
                  </span>
                  {h.kind !== 'ASSET' && (
                    <span style={{ fontFamily:MONO, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>
                      {h.pct>=0?'+':''}{h.pct.toFixed(1)}%
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ position:'fixed', top:20, right:20, zIndex:999, padding:'12px 16px', borderRadius:14, background:'rgba(22,27,41,0.98)', border:`1px solid rgba(108,116,255,0.3)`, boxShadow:DS.shadowLg, backdropFilter:'blur(12px)', maxWidth:240 }}>
              <p style={{ fontWeight:700, fontSize:13, color:DS.textPrimary, marginBottom:6 }}>{tooltip.item.name}</p>
              <p style={{ fontSize:11, color:DS.textSecondary, marginBottom:2 }}>Value: <span style={{ fontFamily:MONO, color:DS.textPrimary }}>{fmtINR(tooltip.item.val, isMasked)}</span></p>
              {tooltip.item.kind !== 'ASSET' && (
                <p style={{ fontSize:11, color: tooltip.item.pct>=0?DS.gain:DS.loss }}>P&L: {tooltip.item.pct>=0?'+':''}{tooltip.item.pct.toFixed(2)}%</p>
              )}
              <p style={{ fontSize:10, color:DS.textMuted, marginTop:4 }}>{tooltip.item.badge}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
 *  5. FORECAST CHART
 * ══════════════════════════════════════════════════ */
function ForecastChart() {
  const { data: forecast = [], isLoading } = useForecast();
  const { isMasked, chartPreference, setChartPreference } = useDashboardStore();

  const todayKey = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; })();

  const chartData = forecast.length > 0
    ? forecast.map(f => ({
        name: f.month,
        income:  f.actualIncome  !== undefined ? Math.round(f.actualIncome)  : Math.round(f.projectedIncome),
        expense: f.actualExpense !== undefined ? Math.round(f.actualExpense) : Math.round(f.projectedExpense),
        isProj:  f.isProjected,
      }))
    : Array.from({ length:12 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth()-3+i);
        return { name: d.toLocaleString('en-IN',{month:'short',year:'numeric'}), income:0, expense:0, isProj:i>3 };
      });

  const todayLabel = forecast.find(f=>f.key===todayKey)?.month;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active||!payload?.length) return null;
    const isP = chartData.find(d=>d.name===label)?.isProj;
    return (
      <div style={{ background:'rgba(22,27,41,0.98)', border:`1px solid rgba(108,116,255,0.25)`, borderRadius:14, padding:'12px 16px', backdropFilter:'blur(12px)', boxShadow:DS.shadowLg }}>
        <p style={{ fontWeight:700, marginBottom:8, color:DS.textPrimary, fontSize:12 }}>
          {label} {isP && <span style={{ fontSize:9, color:DS.textMuted, fontWeight:400 }}>· Projected</span>}
        </p>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:DS.textSecondary }}>{p.name}:</span>
            <span style={{ fontFamily:MONO, fontSize:11, color:DS.textPrimary, fontWeight:600 }}>{isMasked?'••••':fmtShort(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <GlassCard style={{ background:'rgba(22,27,41,0.7)', padding:22 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, flexWrap:'wrap', gap:8 }}>
        <div>
          <p style={{ fontSize:14, fontWeight:700, color:DS.textPrimary, marginBottom:2 }}>12-Month Forecast</p>
          <p style={{ fontSize:10, color:DS.textMuted }}>Solid = actual · Faded = projected from 6-month avg</p>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {(['area','bar'] as const).map(p => (
            <button key={p} onClick={() => setChartPreference(p)}
              style={{ padding:'4px 12px', borderRadius:8, fontSize:11, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit', background:chartPreference===p?DS.indigo:'rgba(255,255,255,0.06)', color:chartPreference===p?'#fff':DS.textMuted, transition:'all 0.2s' }}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading
        ? <div style={{ height:230 }}><Skeleton w="100%" h={230} r={10}/></div>
        : (
          <div style={{ width:'100%', height:230 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartPreference==='area' ? (
                <AreaChart data={chartData} margin={{ top:8, right:4, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="gc-inc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={DS.gain} stopOpacity={0.4}/>
                      <stop offset="100%" stopColor={DS.gain} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gc-exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={DS.loss} stopOpacity={0.35}/>
                      <stop offset="100%" stopColor={DS.loss} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:DS.textMuted, fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtShort} tick={{ fill:DS.textMuted, fontSize:10 }} axisLine={false} tickLine={false} width={48}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  {todayLabel && <ReferenceLine x={todayLabel} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3" label={{ value:'Today', position:'insideTopRight', fill:DS.textMuted, fontSize:9 }}/>}
                  <Area type="monotone" dataKey="income" name="Income" stroke={DS.gain} strokeWidth={2} fill="url(#gc-inc)" dot={false} activeDot={{ r:4, fill:DS.gain, strokeWidth:0 }}/>
                  <Area type="monotone" dataKey="expense" name="Expense" stroke={DS.loss} strokeWidth={2} fill="url(#gc-exp)" dot={false} activeDot={{ r:4, fill:DS.loss, strokeWidth:0 }}/>
                </AreaChart>
              ) : (
                <BarChart data={chartData} barGap={3} barCategoryGap="22%" margin={{ top:8, right:4, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:DS.textMuted, fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtShort} tick={{ fill:DS.textMuted, fontSize:10 }} axisLine={false} tickLine={false} width={48}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize:10, paddingTop:8 }}/>
                  <Bar dataKey="income" name="Income" radius={[4,4,0,0]}>
                    {chartData.map((d,i) => <Cell key={i} fill={d.isProj?`${DS.gain}55`:DS.gain}/>)}
                  </Bar>
                  <Bar dataKey="expense" name="Expense" radius={[4,4,0,0]}>
                    {chartData.map((d,i) => <Cell key={i} fill={d.isProj?`${DS.loss}55`:DS.loss}/>)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )
      }
    </GlassCard>
  );
}

/* ══════════════════════════════════════════════════
 *  6. MoM CHART
 * ══════════════════════════════════════════════════ */
function MoMChart() {
  const { data: comparisons = [], isLoading } = useComparisons();
  const { isMasked } = useDashboardStore();

  const chartData = comparisons.length > 0 ? comparisons : Array.from({ length:6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth()-5+i);
    return { label: d.toLocaleString('en-IN',{month:'short',year:'numeric'}), income:0, expense:0, net:0 };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{ background:'rgba(22,27,41,0.98)', border:`1px solid rgba(108,116,255,0.25)`, borderRadius:14, padding:'12px 16px', backdropFilter:'blur(12px)' }}>
        <p style={{ fontWeight:700, marginBottom:8, color:DS.textPrimary, fontSize:12 }}>{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:p.color }}/>
            <span style={{ fontSize:11, color:DS.textSecondary }}>{p.name}:</span>
            <span style={{ fontFamily:MONO, fontSize:11, color:DS.textPrimary, fontWeight:600 }}>{isMasked?'••••':fmtShort(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <GlassCard style={{ background:'rgba(22,27,41,0.7)', padding:22 }}>
      <div style={{ marginBottom:6 }}>
        <p style={{ fontSize:14, fontWeight:700, color:DS.textPrimary, marginBottom:2 }}>Month-over-Month</p>
        <p style={{ fontSize:10, color:DS.textMuted }}>6-month income · expenses · net savings</p>
      </div>
      {isLoading
        ? <div style={{ height:230 }}><Skeleton w="100%" h={230} r={10}/></div>
        : (
          <div style={{ width:'100%', height:230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="25%" margin={{ top:8, right:4, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="label" tick={{ fill:DS.textMuted, fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmtShort} tick={{ fill:DS.textMuted, fontSize:10 }} axisLine={false} tickLine={false} width={48}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize:10, paddingTop:8 }}/>
                <Bar dataKey="income" name="Income" fill={DS.gain} radius={[4,4,0,0]}/>
                <Bar dataKey="expense" name="Expense" fill={DS.loss} radius={[4,4,0,0]}/>
                <Bar dataKey="net" name="Net" radius={[4,4,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={(d.net??0)>=0 ? DS.indigo : DS.loss}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }
    </GlassCard>
  );
}

/* ══════════════════════════════════════════════════
 *  7. RECENT TRANSACTIONS
 * ══════════════════════════════════════════════════ */
const STATUS_PIP: Record<string, string> = { income:'#0DDC9B', expense:'#6C74FF' };
const EM: Record<string,string> = { Food:'🍔',Transport:'🚗',Shopping:'🛍️',Entertainment:'🎬',Healthcare:'💊',Utilities:'⚡',Salary:'💼',Investment:'📈',Other:'📦' };

function RecentTxns() {
  const { data: txns = [], isLoading } = useTransactions();
  const { isMasked } = useDashboardStore();
  const recent = [...txns].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  if (!isLoading && !recent.length) return null;

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
      <GlassCard style={{ background:'rgba(22,27,41,0.7)', padding:22, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <p style={{ fontSize:14, fontWeight:700, color:DS.textPrimary }}>Recent Transactions</p>
          <Link href="/transactions" style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:DS.indigo, fontWeight:600, textDecoration:'none' }}>
            View all <ChevronRight size={12}/>
          </Link>
        </div>
        <div>
          {isLoading
            ? Array.from({length:4}).map((_,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <Skeleton w={36} h={36} r={10}/>
                  <div style={{ flex:1 }}><Skeleton w="60%" h={12} r={4}/><div style={{ marginTop:6 }}><Skeleton w="40%" h={10} r={4}/></div></div>
                  <Skeleton w={60} h={14} r={4}/>
                </div>
              ))
            : recent.map((t, i) => (
              <motion.div key={t.id}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 8px', borderRadius:10, borderBottom: i<recent.length-1?`1px solid rgba(255,255,255,0.04)`:'none', cursor:'default', transition:'background 0.15s' }}
                whileHover={{ backgroundColor:'rgba(108,116,255,0.06)' }}
              >
                {/* Status pip */}
                <div style={{ position:'relative', width:36, height:36, borderRadius:10, flexShrink:0, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>
                  {EM[t.category]??'💳'}
                  <div style={{ position:'absolute', top:2, right:2, width:6, height:6, borderRadius:'50%', background:STATUS_PIP[t.type]??DS.indigo, boxShadow:`0 0 6px ${STATUS_PIP[t.type]??DS.indigo}` }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:12, color:DS.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{t.merchant}</p>
                  <p style={{ fontSize:10, color:DS.textMuted }}>{t.category} · {new Date(t.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color: t.type==='income'?DS.gain:DS.textPrimary }}>
                    {t.type==='income'?'+':'-'}{isMasked?'••••':fmtINR(t.amount)}
                  </p>
                  <p style={{ fontSize:9, color:DS.textMuted, marginTop:1 }}>{t.type==='income'?'Income':'Expense'}</p>
                </div>
              </motion.div>
            ))
          }
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
 *  MAIN PAGE
 * ══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const user    = useAppStore(s => s.user);
  const { isMasked } = useDashboardStore();
  const { isLoading: wealthLoading } = useWealth();

  const greeting = (() => { const h = new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; })();
  const name = user?.email?.split('@')[0] ?? 'there';

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer     { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes border-pulse{
          0%,100%{opacity:0.6}
          50%{opacity:1}
        }
        @keyframes beam-spin {
          from { --beam-angle: 0deg; }
          to   { --beam-angle: 360deg; }
        }
        @property --beam-angle {
          syntax: '<angle>'; initial-value: 0deg; inherits: false;
        }

        /* ── Layout grids ── */
        .dash-hdr {
          display: grid;
          grid-template-columns: 1.25fr 1fr 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }
        .kpi-strip {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 12px;
        }
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        /* ── Tablet ── */
        @media (max-width:1100px){
          .dash-hdr { grid-template-columns: 1fr 1fr; }
          .dash-hdr > *:first-child { grid-column: span 2; }
          .kpi-strip { grid-template-columns: repeat(3,1fr); }
        }
        /* ── Mobile ── */
        @media (max-width:700px){
          .dash-hdr { grid-template-columns: 1fr; }
          .dash-hdr > *:first-child { grid-column: span 1; }
          .kpi-strip { grid-template-columns: 1fr 1fr; }
          .charts-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth:1280 }}>
        {/* Greeting */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <h1 style={{ fontSize:28, fontWeight:800, color:DS.textPrimary, letterSpacing:-0.8, marginBottom:4 }}>
                {greeting},{' '}
                <span style={{ background:`linear-gradient(135deg,${DS.indigo},${DS.purple})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  {name}
                </span>
              </h1>
              <p style={{ fontSize:12, color:DS.textMuted }}>
                {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
              </p>
            </div>
            {isMasked && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:DS.textMuted, padding:'6px 12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <EyeOff size={12}/> Privacy mode
              </div>
            )}
          </div>
        </motion.div>

        {/* 1. Wealth header */}
        {!wealthLoading && <WealthHeaderCard />}

        {/* 2. KPI strip */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} style={{ marginBottom:18 }}>
          <KpiStrip />
        </motion.div>

        {/* 3. Insights */}
        <InsightsHub />

        {/* 4. Treemap */}
        <TreemapHeatmap />

        {/* 5+6. Charts */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}>
          <div className="charts-row">
            <ForecastChart />
            <MoMChart />
          </div>
        </motion.div>

        {/* 7. Transactions */}
        <RecentTxns />
      </div>
    </>
  );
}