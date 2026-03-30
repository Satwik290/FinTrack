'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, TrendingUp, TrendingDown, RefreshCw,
  AlertTriangle, CheckCircle, Lightbulb, Zap, X,
  ArrowUpRight, BarChart2, Activity, Wallet,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, Legend,
} from 'recharts';
import { useTransactions }  from '@/hooks/useTransactions';
import { useBudgets }       from '@/hooks/useBudgets';
import { useWealth }        from '@/hooks/usewealth';
import {
  useInsights, useForecast, useComparisons, useDashboardStore,
} from '@/hooks/useDashboard';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

/* ─── Design tokens ──────────────────────────────── */
const MONO  = "'Space Mono','Courier New',monospace";
const JADE  = '#22c55e';
const CORAL = '#f87171';
const JADE_DIM  = 'rgba(34,197,94,0.15)';
const CORAL_DIM = 'rgba(248,113,113,0.15)';

/* ─── Count-up hook ──────────────────────────────── */
function useCountUp(target: number, duration = 1100) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

/* ─── Formatters ─────────────────────────────────── */
const fmtINR = (n: number, masked = false) =>
  masked ? '₹ ••••' :
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(1)}Cr` :
  n >= 100000   ? `₹${(n / 100000).toFixed(1)}L`    :
  n >= 1000     ? `₹${(n / 1000).toFixed(0)}k`      : `₹${n}`;

const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

function timeAgo(iso: string | null | number | undefined): string {
  if (!iso) return 'Never';
  const ms = Date.now() - new Date(iso as string).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Shared tooltip style ───────────────────────── */
const ttStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 12,
  boxShadow: 'var(--shadow-md)',
};

/* ══════════════════════════════════════════════════
 *  SECTION WRAPPER
 * ══════════════════════════════════════════════════ */
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
 *  1. WEALTH HEADER — 3 GLASS CARDS
 * ══════════════════════════════════════════════════ */
function WealthHeaderCard() {
  const { data: wealth, refetch, isFetching } = useWealth();
  const { isMasked, togglePrivacyMode } = useDashboardStore();
  const nw     = wealth?.netWorth ?? 0;
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
    <div className="dash-header-grid">
      {/* ── Card 1 · Net Worth ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="net-worth-card">
        {/* Background orbs */}
        <div style={{ position:'absolute',top:-60,right:-40,width:220,height:220,borderRadius:'50%',background:'rgba(99,102,241,0.07)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-40,left:30,width:130,height:130,borderRadius:'50%',background:'rgba(34,197,94,0.05)',pointerEvents:'none' }}/>

        <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          {/* Top row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:2, color:'rgba(255,255,255,0.35)', textTransform:'uppercase' }}>Net Worth</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => refetch()} className="glass-btn" title="Sync">
                <RefreshCw size={12} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }}/>
              </button>
              <button onClick={togglePrivacyMode} className="glass-btn" title={isMasked ? 'Show' : 'Hide'}>
                {isMasked ? <EyeOff size={12}/> : <Eye size={12}/>}
              </button>
            </div>
          </div>

          {/* Main figure */}
          <div>
            <p style={{ fontFamily:MONO, fontSize:clamp(28, 36), fontWeight:700, color:'#fff', letterSpacing:-1, marginBottom:6, lineHeight:1 }}>
              {isMasked ? '₹ ••••••••' : fmtShort(animNW)}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span className={`pnl-badge ${isPos ? 'pnl-pos' : 'pnl-neg'}`}>
                {isPos ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                {fmtPct(wealth?.totalPnlPct ?? 0)} P&L
              </span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>on investments</span>
            </div>
          </div>

          {/* Freshness + freedom bar */}
          <div>
            <div style={{ display:'flex', gap:14, marginBottom:10, fontSize:10, color:'rgba(255,255,255,0.22)' }}>
              <span>📊 {timeAgo(wealth?.lastSynced?.stocks)}</span>
              <span>📈 {timeAgo(wealth?.lastSynced?.mutualFunds)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:10, letterSpacing:1.2, color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>Financial Freedom</span>
              <span style={{ fontFamily:MONO, fontSize:10, color:JADE }}>{(wealth?.financialFreedomPct ?? 0).toFixed(0)}%</span>
            </div>
            <div style={{ height:3, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${wealth?.financialFreedomPct ?? 0}%` }}
                transition={{ duration:1.6, ease:[0.16,1,0.3,1] }}
                style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${JADE},#86efac)` }}/>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Card 2 · Asset Breakdown ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.07 }} className="card dash-sub-card">
        <p className="card-eyebrow">Assets</p>
        <p style={{ fontFamily:MONO, fontSize:24, fontWeight:800, color:'var(--text-primary)', marginBottom:16 }}>
          {fmtINR(wealth?.totalAssets ?? 0, isMasked)}
        </p>
        {[
          { label:'Stocks',       value: wealth?.stockSummary?.totalCurrent ?? 0, pct: alloc.stocks, color:'#f59e0b' },
          { label:'Mutual Funds', value: wealth?.mfSummary?.totalCurrent ?? 0,    pct: alloc.mf,     color:'#6366f1' },
          { label:'Manual',       value: wealth?.manualAssetsValue ?? 0,           pct: alloc.manual, color:JADE      },
        ].map((a, i) => (
          <div key={a.label} style={{ marginBottom: i < 2 ? 10 : 0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{a.label}</span>
              <span style={{ fontFamily:MONO, fontSize:12, color:'var(--text-primary)', fontWeight:600 }}>
                {isMasked ? '••••' : fmtShort(a.value)}
              </span>
            </div>
            <div style={{ height:4, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(a.pct, 100)}%` }}
                transition={{ duration:0.9, delay:i*0.1 + 0.1, ease:[0.16,1,0.3,1] }}
                style={{ height:'100%', borderRadius:99, background:a.color }}/>
            </div>
          </div>
        ))}
        <Link href="/wealth" className="card-link">View all assets <ArrowUpRight size={11}/></Link>
      </motion.div>

      {/* ── Card 3 · Liabilities ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }} className="card dash-sub-card">
        <p className="card-eyebrow">Liabilities</p>
        <p style={{ fontFamily:MONO, fontSize:24, fontWeight:800, color: CORAL, marginBottom:12 }}>
          {fmtINR(wealth?.totalLiabilities ?? 0, isMasked)}
        </p>

        {/* D/A gauge */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>Debt-to-Asset</span>
            <span style={{ fontFamily:MONO, fontSize:11, fontWeight:700,
              color: (wealth?.debtToAsset ?? 0) <= 30 ? JADE : (wealth?.debtToAsset ?? 0) <= 50 ? 'var(--warning)' : CORAL }}>
              {(wealth?.debtToAsset ?? 0).toFixed(1)}%
            </span>
          </div>
          <div style={{ height:8, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden', position:'relative' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(wealth?.debtToAsset ?? 0, 100)}%` }}
              transition={{ duration:0.9 }}
              style={{ height:'100%', borderRadius:99,
                background: (wealth?.debtToAsset ?? 0) <= 30 ? JADE : (wealth?.debtToAsset ?? 0) <= 50 ? 'var(--warning)' : CORAL }}/>
            {[30,50].map(m => (
              <div key={m} style={{ position:'absolute',top:0,bottom:0,left:`${m}%`,width:1.5,background:'rgba(255,255,255,0.25)' }}/>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, fontSize:9, color:'var(--text-muted)' }}>
            <span>Safe &lt;30%</span><span>Caution 50%</span><span>High Risk</span>
          </div>
        </div>

        {fastest && (
          <div style={{ padding:'10px 12px', borderRadius:10, background:'var(--bg-surface-2)', marginBottom:10 }}>
            <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>Fastest payoff →</p>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fastest.loanName}</p>
            <p style={{ fontSize:11, color:CORAL, fontFamily:MONO, marginTop:1 }}>
              {isMasked ? '₹ ••••' : fmtINR(fastest.remainingBalanceInCents / 100)} left
            </p>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'var(--text-muted)' }}>Avg rate: <strong style={{ color:'var(--text-primary)' }}>{avgRate.toFixed(1)}%</strong></span>
          <Link href="/wealth" className="card-link">Details <ArrowUpRight size={11}/></Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  2. KPI STRIP
 * ══════════════════════════════════════════════════ */
function KpiStrip() {
  const { data: txns = [] }    = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { isMasked }           = useDashboardStore();

  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const mo  = txns.filter(t => t.date.startsWith(key));

  const income    = mo.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses  = mo.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const saved     = income - expenses;
  const saveRate  = income > 0 ? (saved / income) * 100 : 0;
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetPct   = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;

  const tiles = [
    { icon:<TrendingUp size={16}/>,  label:'Income',       val: fmtINR(income, isMasked),   sub:`${mo.filter(t=>t.type==='income').length} sources`,    color:JADE,             bg:JADE_DIM  },
    { icon:<TrendingDown size={16}/>,label:'Expenses',     val: fmtINR(expenses, isMasked), sub:`${mo.filter(t=>t.type==='expense').length} txns`,        color:CORAL,            bg:CORAL_DIM },
    { icon:<Activity size={16}/>,    label:'Savings Rate', val:`${saveRate.toFixed(1)}%`,   sub: isMasked?'this month':`Saved ${fmtINR(saved)}`,
      color: saveRate>=20?JADE : saveRate>=10?'var(--warning)':CORAL,
      bg: saveRate>=20?JADE_DIM:'rgba(245,158,11,0.1)' },
    { icon:<BarChart2 size={16}/>,   label:'Budget Used',  val:`${Math.round(budgetPct)}%`, sub: isMasked?'of budget':`of ${fmtINR(totalBudget)}`,
      color: budgetPct>=100?CORAL : budgetPct>=80?'var(--warning)':JADE,
      bg: budgetPct>=80?'rgba(245,158,11,0.1)':JADE_DIM },
    { icon:<Wallet size={16}/>,      label:'Transactions', val:`${mo.length}`,              sub:'this month',                                              color:'var(--indigo-400)', bg:'rgba(99,102,241,0.1)' },
  ];

  return (
    <div className="kpi-strip">
      {tiles.map((t, i) => (
        <motion.div key={t.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 + 0.1 }} className="card kpi-tile">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500, letterSpacing:0.3 }}>{t.label}</p>
            <div style={{ width:30, height:30, borderRadius:8, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', color:t.color }}>
              {t.icon}
            </div>
          </div>
          <p style={{ fontFamily:MONO, fontSize:20, fontWeight:800, color:t.color, letterSpacing:-0.5, marginBottom:3 }}>{t.val}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>{t.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  3. INSIGHTS HUB
 * ══════════════════════════════════════════════════ */
const INS_CFG = {
  danger:  { c:CORAL,               bg:CORAL_DIM,               border:`${CORAL}30`,              icon:AlertTriangle, tag:'Urgent'      },
  warning: { c:'var(--warning)',    bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)',   icon:Zap,           tag:'Attention'   },
  success: { c:JADE,                bg:JADE_DIM,                 border:`${JADE}30`,               icon:CheckCircle,   tag:'Achievement' },
  info:    { c:'var(--info)',       bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.25)',   icon:Lightbulb,     tag:'Tip'         },
} as const;

function InsightsHub() {
  const { data: raw = [] }  = useInsights();
  const { dismissedInsights, dismissInsight } = useDashboardStore();
  const visible = raw.filter(i => !dismissedInsights.includes(i.id));
  if (!visible.length) return null;

  return (
    <Section delay={0.2}>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <p className="section-title">Smart Insights</p>
            <p className="section-sub">Ranked by urgency · Dismiss to snooze</p>
          </div>
          <span style={{ fontSize:11, padding:'4px 12px', borderRadius:99, background:'linear-gradient(135deg,var(--indigo-500),#7c3aed)', color:'#fff', fontWeight:600, letterSpacing:0.3 }}>
            ✨ AI-Powered
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
          <AnimatePresence>
            {visible.map((ins, i) => {
              const cfg = INS_CFG[ins.severity];
              const Icon = cfg.icon;
              return (
                <motion.div key={ins.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, scale:0.95, transition:{ duration:0.15 } }}
                  transition={{ delay: i*0.05 }}
                  style={{ display:'flex', gap:12, padding:'14px 16px', borderRadius:14, background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                  <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:`${cfg.c}18`, display:'flex', alignItems:'center', justifyContent:'center', color:cfg.c }}>
                    <Icon size={15}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:0.8, color:cfg.c, textTransform:'uppercase' }}>{cfg.tag}</span>
                      {ins.category && <span style={{ fontSize:9, color:'var(--text-muted)', padding:'1px 6px', borderRadius:99, background:'var(--bg-surface)' }}>{ins.category}</span>}
                    </div>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', lineHeight:1.3, marginBottom:3 }}>{ins.title}</p>
                    <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.5 }}>{ins.body}</p>
                  </div>
                  <button onClick={() => dismissInsight(ins.id)}
                    style={{ width:20, height:20, flexShrink:0, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', alignSelf:'flex-start', marginTop:2 }}>
                    <X size={11}/>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════════
 *  4. PORTFOLIO HEATMAP
 * ══════════════════════════════════════════════════ */
function PortfolioHeatmap() {
  const { data: wealth } = useWealth();
  const { isMasked }     = useDashboardStore();

  const holdings = useMemo(() => {
    const mf  = (wealth?.mfHoldings ?? []).map(h => ({ name:h.schemeName,    val:h.currentValue,              pct:h.pnlPct,  kind:'MF',    badge:'MF'           }));
    const stk = (wealth?.stockHoldings ?? []).map(h => ({ name:h.companyName, val:h.currentValue,             pct:h.pnlPct,  kind:'STOCK', badge:h.exchange     }));
    const ast = (wealth?.assets ?? []).map(a => ({         name:a.name,        val:a.currentValueInCents/100,  pct:0,         kind:'ASSET', badge:a.type         }));
    return [...mf, ...stk, ...ast].sort((a, b) => b.val - a.val).slice(0, 12);
  }, [wealth]);

  if (!holdings.length) return null;

  const cellBg = (pct: number, kind: string) => {
    if (kind === 'ASSET') return 'var(--bg-surface-2)';
    if (pct > 15) return 'rgba(34,197,94,0.75)';
    if (pct > 5)  return 'rgba(34,197,94,0.4)';
    if (pct > 0)  return 'rgba(34,197,94,0.18)';
    if (pct > -5) return 'rgba(248,113,113,0.18)';
    if (pct > -15)return 'rgba(248,113,113,0.4)';
    return 'rgba(248,113,113,0.7)';
  };
  const textCol = (pct: number, kind: string) => kind === 'ASSET' ? 'var(--text-primary)' : pct >= 0 ? '#fff' : '#fff';

  return (
    <Section delay={0.25}>
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div>
            <p className="section-title">Portfolio Heatmap</p>
            <p className="section-sub">Cell size = value · Color = P&L · Hover for details</p>
          </div>
          <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text-muted)' }}>
            {[{c:JADE,                   l:'Gain'},{c:CORAL,                  l:'Loss'},{c:'var(--bg-surface-2)', l:'Manual'}].map(s => (
              <span key={s.l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:9, height:9, borderRadius:3, background:s.c, display:'inline-block' }}/>{s.l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
          {holdings.map((h, i) => (
            <motion.div key={h.name + i}
              initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.04 }}
              whileHover={{ scale:1.03, zIndex:2 }}
              title={`${h.name} · ${fmtINR(h.val)} · ${h.pct >= 0 ? '+' : ''}${h.pct.toFixed(1)}%`}
              style={{
                borderRadius:12, padding:'14px 16px', minHeight:80,
                background:cellBg(h.pct, h.kind),
                border:'1px solid rgba(255,255,255,0.06)',
                cursor:'default', display:'flex', flexDirection:'column', justifyContent:'space-between',
              }}
            >
              <p style={{ fontSize:11, fontWeight:600, color:textCol(h.pct,h.kind), overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3, marginBottom:10 }}>
                {h.name}
              </p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <span style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:textCol(h.pct,h.kind) }}>
                  {isMasked ? '••••' : fmtShort(h.val)}
                </span>
                {h.kind !== 'ASSET' && (
                  <span style={{ fontFamily:MONO, fontSize:11, color:textCol(h.pct,h.kind), fontWeight:700, opacity:0.9 }}>
                    {h.pct >= 0 ? '+' : ''}{h.pct.toFixed(1)}%
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════════
 *  5. FORECAST CHART  — FIX: explicit pixel height on wrapper
 * ══════════════════════════════════════════════════ */
function ForecastChart() {
  const { data: forecast = [], isLoading } = useForecast();
  const { isMasked, chartPreference, setChartPreference } = useDashboardStore();

  const todayKey = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  })();

  // ── build display rows, use actual when available ──
  const displayData = forecast.map(f => ({
    name:    f.month,
    income:  f.actualIncome  !== undefined ? Math.round(f.actualIncome)  : Math.round(f.projectedIncome),
    expense: f.actualExpense !== undefined ? Math.round(f.actualExpense) : Math.round(f.projectedExpense),
    net:     (f.actualIncome  !== undefined ? f.actualIncome  : f.projectedIncome)
           - (f.actualExpense !== undefined ? f.actualExpense : f.projectedExpense),
    isProj:  f.isProjected,
  }));

  // Fall back to empty placeholder bars so chart still renders even with 0 data
  const chartData = displayData.length > 0 ? displayData : Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 3 + i);
    return { name: d.toLocaleString('en-IN', { month:'short', year:'numeric' }), income:0, expense:0, net:0, isProj: i > 3 };
  });

  const todayLabel = forecast.find(f => f.key === todayKey)?.month;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const isP = chartData.find(d => d.name === label)?.isProj;
    return (
      <div style={ttStyle}>
        <p style={{ fontWeight:700, marginBottom:6, color:'var(--text-primary)', fontSize:12 }}>
          {label} {isP && <span style={{ fontSize:10, color:'var(--text-muted)' }}>· Projected</span>}
        </p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color:p.color, fontSize:12, marginBottom:2 }}>
            {p.name}: {isMasked ? '••••' : fmtShort(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="card" style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, flexWrap:'wrap', gap:8 }}>
        <div>
          <p className="section-title">12-Month Forecast</p>
          <p className="section-sub">Solid = actual · Faded = projected from 6-month avg</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(['area','bar'] as const).map(p => (
            <button key={p} onClick={() => setChartPreference(p)} className="btn btn-sm"
              style={{ fontSize:11, border:'none', background:chartPreference===p?'var(--indigo-500)':'var(--bg-surface-2)', color:chartPreference===p?'#fff':'var(--text-secondary)', textTransform:'capitalize' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:13 }}>
          Loading forecast…
        </div>
      ) : (
        /* FIX: explicit px height on the wrapper div — ResponsiveContainer needs a sized parent */
        <div style={{ width:'100%', height:240 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartPreference === 'area' ? (
              <AreaChart data={chartData} margin={{ top:8, right:4, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="fg-inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={JADE} stopOpacity={0.4}/>
                    <stop offset="100%" stopColor={JADE} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fg-exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CORAL} stopOpacity={0.4}/>
                    <stop offset="100%" stopColor={CORAL} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmtShort} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={48}/>
                <Tooltip content={<CustomTooltip/>}/>
                {todayLabel && (
                  <ReferenceLine x={todayLabel} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3"
                    label={{ value:'Today', position:'insideTopRight', fill:'var(--text-muted)', fontSize:9 }}/>
                )}
                <Area type="monotone" dataKey="income" name="Income" stroke={JADE} strokeWidth={2}
                  fill="url(#fg-inc)" dot={false} activeDot={{ r:4, fill:JADE, strokeWidth:0 }}
                  strokeDasharray={(d: any) => d?.isProj ? '5 3' : undefined}/>
                <Area type="monotone" dataKey="expense" name="Expense" stroke={CORAL} strokeWidth={2}
                  fill="url(#fg-exp)" dot={false} activeDot={{ r:4, fill:CORAL, strokeWidth:0 }}/>
              </AreaChart>
            ) : (
              <BarChart data={chartData} barGap={3} barCategoryGap="22%" margin={{ top:8, right:4, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={fmtShort} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={48}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize:11, paddingTop:8 }}/>
                <Bar dataKey="income" name="Income" radius={[4,4,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.isProj ? `${JADE}55` : JADE}/>)}
                </Bar>
                <Bar dataKey="expense" name="Expense" radius={[4,4,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.isProj ? `${CORAL}55` : CORAL}/>)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  6. MoM COMPARISONS — FIX: same explicit height pattern
 * ══════════════════════════════════════════════════ */
function MoMChart() {
  const { data: comparisons = [], isLoading } = useComparisons();
  const { isMasked } = useDashboardStore();

  // Fallback placeholder so chart always renders
  const chartData = comparisons.length > 0 ? comparisons : Array.from({ length:6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
    return { label: d.toLocaleString('en-IN', { month:'short', year:'numeric' }), income:0, expense:0, net:0 };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={ttStyle}>
        <p style={{ fontWeight:700, marginBottom:5, color:'var(--text-primary)', fontSize:12 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color:p.color, fontSize:12, marginBottom:2 }}>
            {p.name}: {isMasked ? '••••' : fmtShort(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="card" style={{ padding:24 }}>
      <div style={{ marginBottom:6 }}>
        <p className="section-title">Month-over-Month</p>
        <p className="section-sub">6-month income · expenses · net savings</p>
      </div>

      {isLoading ? (
        <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:13 }}>
          Loading comparisons…
        </div>
      ) : (
        /* FIX: explicit px height */
        <div style={{ width:'100%', height:240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4} barCategoryGap="25%" margin={{ top:8, right:4, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={fmtShort} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={48}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:11, paddingTop:8 }}/>
              <Bar dataKey="income" name="Income" fill={JADE} radius={[4,4,0,0]}/>
              <Bar dataKey="expense" name="Expense" fill={CORAL} radius={[4,4,0,0]}/>
              <Bar dataKey="net" name="Net" radius={[4,4,0,0]}>
                {chartData.map((d, i) => <Cell key={i} fill={(d.net ?? 0) >= 0 ? '#818cf8' : CORAL}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  7. RECENT TRANSACTIONS
 * ══════════════════════════════════════════════════ */
function RecentTxns() {
  const { data: txns = [] } = useTransactions();
  const { isMasked }        = useDashboardStore();
  const recent = [...txns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const EM: Record<string,string> = { Food:'🍔',Transport:'🚗',Shopping:'🛍️',Entertainment:'🎬',Healthcare:'💊',Utilities:'⚡',Salary:'💼',Investment:'📈',Other:'📦' };

  if (!recent.length) return null;

  return (
    <Section delay={0.3}>
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <p className="section-title" style={{ marginBottom:0 }}>Recent Transactions</p>
          <Link href="/transactions" style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--indigo-500)', fontWeight:600, textDecoration:'none' }}>
            View all <ChevronRight size={13}/>
          </Link>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {recent.map((t, i) => (
            <div key={t.id}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:10, transition:'background 0.15s', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:'var(--bg-surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>
                {EM[t.category] ?? '💳'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:1 }}>{t.merchant}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
              </div>
              <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, flexShrink:0, color: t.type==='income' ? JADE : 'var(--text-primary)' }}>
                {t.type==='income'?'+':'-'}{isMasked ? '••••' : fmtINR(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ══════════════════════════════════════════════════
 *  DASHBOARD PAGE
 * ══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const user    = useAppStore(s => s.user);
  const { isMasked } = useDashboardStore();
  const { isLoading: wealthLoading } = useWealth();

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();
  const name = user?.email?.split('@')[0] ?? 'there';

  return (
    <>
      {/* ── Scoped styles ───────────────────────────── */}
      <style>{`
        /* Responsive grid */
        .dash-header-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .kpi-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        /* Tablet */
        @media (max-width: 1100px) {
          .dash-header-grid { grid-template-columns: 1fr 1fr; }
          .dash-header-grid > *:first-child { grid-column: span 2; }
          .kpi-strip { grid-template-columns: repeat(3, 1fr); }
        }
        /* Mobile */
        @media (max-width: 700px) {
          .dash-header-grid { grid-template-columns: 1fr; }
          .dash-header-grid > *:first-child { grid-column: span 1; }
          .kpi-strip { grid-template-columns: 1fr 1fr; }
          .charts-row { grid-template-columns: 1fr; }
        }

        /* Net worth dark card */
        .net-worth-card {
          border-radius: 22px;
          padding: 26px;
          background: linear-gradient(145deg, #0d1017 0%, #171d2f 55%, #1a1228 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
          position: relative;
          overflow: hidden;
          min-height: 220px;
        }
        /* Sub-cards */
        .dash-sub-card {
          padding: 22px;
          display: flex;
          flex-direction: column;
        }
        /* Glass button */
        .glass-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5);
          transition: background 0.15s;
        }
        .glass-btn:hover { background: rgba(255,255,255,0.1); }
        /* P&L badge */
        .pnl-badge {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 99px;
        }
        .pnl-pos { background: rgba(34,197,94,0.18); color: ${JADE}; }
        .pnl-neg { background: rgba(248,113,113,0.18); color: ${CORAL}; }
        /* KPI tile */
        .kpi-tile { padding: 18px 18px; }
        /* Typography helpers */
        .section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        .section-sub   { font-size: 11px; color: var(--text-muted); }
        .card-eyebrow  { font-size: 10px; font-weight: 600; letter-spacing: 1.8px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .card-link     { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--indigo-500); font-weight: 600; text-decoration: none; margin-top: auto; padding-top: 12px; }
        .card-link:hover { color: var(--indigo-400); }
        /* Spin */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1280 }}>
        {/* Greeting */}
        <Section>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:10 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', letterSpacing:-0.5, marginBottom:3 }}>
                {greeting},{' '}
                <span style={{ background:'linear-gradient(135deg,var(--indigo-400),#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  {name}
                </span>
              </h1>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </p>
            </div>
            {isMasked && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text-muted)', padding:'6px 12px', borderRadius:10, background:'var(--bg-surface-2)', border:'1px solid var(--border)' }}>
                <EyeOff size={12}/> Privacy mode on
              </div>
            )}
          </div>
        </Section>

        {/* 1. Wealth header */}
        {!wealthLoading && <WealthHeaderCard />}

        {/* 2. KPI strip */}
        <Section delay={0.1}><KpiStrip /></Section>

        {/* 3. Insights */}
        <InsightsHub />

        {/* 4. Heatmap */}
        <PortfolioHeatmap />

        {/* 5 + 6. Charts row — both in same grid */}
        <Section delay={0.28}>
          <div className="charts-row">
            <ForecastChart />
            <MoMChart />
          </div>
        </Section>

        {/* 7. Recent transactions */}
        <RecentTxns />
      </div>
    </>
  );
}

// tiny helper — returns value clamped between min and max (for font-size)
function clamp(min: number, max: number): number {
  return max; // actual CSS clamp used inline via responsive classes
}