'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown,
  Plus, Trash2, ChevronDown, Search, X, Loader2,
  Landmark, BarChart2, BookOpen, Shield, AlertTriangle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import {
  useWealth, useAddAsset, useDeleteAsset,
  useAddLiability, useDeleteLiability,
  useAddMFLumpsum, useAddMFSip, useDeleteMFHolding,
  useAddStock, useDeleteStock,
  useMFNavHistory, useMFSearch, useStockSearch,
  type WealthSummary, type Liability,
} from '@/hooks/usewealth';
import { useWealthStore } from '@/store/useWealthStore';
import api from '@/lib/api';

/* ─── Design tokens ──────────────────────────────── */
const MONO  = "'Space Mono', 'JetBrains Mono', 'Courier New', monospace";
const GAIN  = '#2D9664';   // Jade — calm growth
const LOSS  = '#C0614A';   // Terracotta — action required, not panic
const CARD  = 'var(--bg-surface)';

/* ─── Formatters ─────────────────────────────────── */
const fmtINR = (n: number, masked = false) =>
  masked ? '₹ ••••••' :
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtINRPrecise = (n: number, masked = false) =>
  masked ? '••••' :
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

function timeAgo(iso: string | null | number): string {
  if (!iso) return 'Never';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Tab config ─────────────────────────────────── */
type Tab = 'overview' | 'stocks' | 'mutual-funds' | 'assets' | 'liabilities';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',      label: 'Overview',      icon: Landmark   },
  { id: 'stocks',        label: 'Stocks',         icon: BarChart2  },
  { id: 'mutual-funds',  label: 'Mutual Funds',   icon: BookOpen   },
  { id: 'assets',        label: 'Assets',         icon: Shield     },
  { id: 'liabilities',   label: 'Liabilities',    icon: AlertTriangle },
];

const LIABILITY_CATEGORIES = ['Home Loan','Car Loan','Personal Loan','Education Loan','Credit Card','Other'];

const EXCHANGE_CFG = {
  NSE:    { label: 'NSE', color: '#6366f1', emoji: '🇮🇳' },
  US:     { label: 'US',  color: '#f59e0b', emoji: '🇺🇸' },
  CRYPTO: { label: 'Crypto', color: '#f97316', emoji: '₿'  },
} as const;

/* ══════════════════════════════════════════════════
 *  NET WORTH HEADER (Sticky)
 * ══════════════════════════════════════════════════ */
function NetWorthHeader({
  data, masked, onToggleMask, onSync, syncing,
}: {
  data: WealthSummary; masked: boolean;
  onToggleMask: () => void; onSync: () => void; syncing: boolean;
}) {
  const isPos = data.netWorth >= 0;

  return (
    <div style={{
      borderRadius: 24, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg,#0f1117 0%,#1a1f2e 60%,#1e1628 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    }}>
      {/* Subtle background orbs */}
      <div style={{ position:'absolute',top:-60,right:-40,width:220,height:220,borderRadius:'50%',background:'rgba(99,102,241,0.07)',pointerEvents:'none' }} />
      <div style={{ position:'absolute',bottom:-40,left:60,width:140,height:140,borderRadius:'50%',background:'rgba(45,150,100,0.06)',pointerEvents:'none' }} />

      <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        {/* Left — primary metric */}
        <div>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:2, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:8 }}>
            Net Worth
          </p>
          <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
            <span style={{ fontFamily:MONO, fontSize:44, fontWeight:700, color:'#fff', letterSpacing:-1 }}>
              {masked ? '₹ ••••••••' : new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(data.netWorth)}
            </span>
            <span style={{
              display:'flex', alignItems:'center', gap:4, fontSize:15, fontWeight:700,
              padding:'4px 12px', borderRadius:99,
              background: isPos ? 'rgba(45,150,100,0.2)' : 'rgba(192,97,74,0.2)',
              color: isPos ? GAIN : LOSS,
            }}>
              {isPos ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
              {fmtPct(data.totalPnlPct)}
            </span>
          </div>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:6, fontFamily:MONO }}>
            {masked ? '•••• invested' : `${fmtINR(data.totalInvested)} invested`}
            &nbsp;·&nbsp;
            <span style={{ color: data.totalPnl >= 0 ? GAIN : LOSS }}>
              {data.totalPnl >= 0 ? '+' : ''}{masked ? '••••' : fmtINR(data.totalPnl)} P&L
            </span>
          </p>
        </div>

        {/* Right — controls + quick stats */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12 }}>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onSync} disabled={syncing}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:12, fontWeight:600 }}>
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              Sync All
            </button>
            <button onClick={onToggleMask}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background: masked ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:12, fontWeight:600 }}>
              {masked ? <EyeOff size={13}/> : <Eye size={13}/>}
              {masked ? 'Show' : 'Hide'}
            </button>
          </div>

          {/* Quick pillar stats */}
          <div style={{ display:'flex', gap:20 }}>
            {[
              { label:'Assets',      value: data.totalAssets,      color:'rgba(255,255,255,0.85)' },
              { label:'Liabilities', value: data.totalLiabilities, color: LOSS },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'right' }}>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:2 }}>{s.label}</p>
                <p style={{ fontFamily:MONO, fontSize:15, fontWeight:700, color:s.color }}>
                  {masked ? '••••' : fmtINR(s.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Freshness strip */}
          <div style={{ display:'flex', gap:12, fontSize:10, color:'rgba(255,255,255,0.25)' }}>
            <span>📊 Stocks: {timeAgo(data.lastSynced.stocks)}</span>
            <span>📈 MF: {timeAgo(data.lastSynced.mutualFunds)}</span>
          </div>
        </div>
      </div>

      {/* Debt-to-asset progress bar */}
      <div style={{ marginTop:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:1, textTransform:'uppercase' }}>
            Financial Freedom — {Math.round(data.financialFreedomPct)}% of debt repaid
          </span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>
            D/A: {data.debtToAsset.toFixed(1)}%
          </span>
        </div>
        <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden' }}>
          <motion.div
            initial={{ width:0 }}
            animate={{ width:`${Math.min(data.financialFreedomPct,100)}%` }}
            transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
            style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${GAIN},#34d399)` }}
          />
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  OVERVIEW TAB
 * ══════════════════════════════════════════════════ */
function OverviewTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const allPnlData = [
    { name:'MF',     pnl: data.mfSummary.totalPnl,    color:'#6366f1' },
    { name:'Stocks', pnl: data.stockSummary.totalPnl,  color:'#f59e0b' },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

      {/* Allocation donut */}
      <div className="card" style={{ padding:24 }}>
        <p style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:4 }}>Portfolio Allocation</p>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Total: {fmtINR(data.totalAssets, masked)}</p>
        {data.allocation.length === 0 ? (
          <EmptyState icon="📊" message="Add investments to see allocation" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.allocation} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {data.allocation.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v:number) => [fmtINR(v, masked), 'Value']}
                contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:12, fontSize:12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* P&L waterfall */}
      <div className="card" style={{ padding:24 }}>
        <p style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:4 }}>P&L by Category</p>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Unrealised gain/loss</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={allPnlData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v:number) => [fmtINR(v, masked), 'P&L']}
              contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:12, fontSize:12 }} />
            <Bar dataKey="pnl" radius={[6,6,0,0]}>
              {allPnlData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? GAIN : LOSS} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 performers */}
      <div className="card" style={{ padding:24, gridColumn:'span 2' }}>
        <p style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>Top 5 Performers</p>
        {data.top5Performers.length === 0
          ? <EmptyState icon="🏆" message="Add holdings to see your top performers" />
          : (
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {data.top5Performers.map((h, i) => (
                <div key={h.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 8px', borderRadius:10, transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-surface-2)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <span style={{ fontFamily:MONO, fontSize:13, color:'var(--text-muted)', width:20, textAlign:'center' }}>#{i+1}</span>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background: h.type==='MF' ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                    {h.type === 'MF' ? '📈' : '📊'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.name}</p>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--bg-surface-2)', color:'var(--text-muted)' }}>{h.badge}</span>
                  </div>
                  <p style={{ fontFamily:MONO, fontSize:13, color:'var(--text-primary)', flexShrink:0 }}>{fmtINR(h.currentValue, masked)}</p>
                  <span style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color: h.pnl>=0 ? GAIN : LOSS, flexShrink:0, minWidth:70, textAlign:'right' }}>
                    {fmtPct(h.pnlPct)}
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Insights strip */}
      {data.debtToAsset > 30 && (
        <div style={{ gridColumn:'span 2', padding:'14px 20px', borderRadius:14, background:'rgba(192,97,74,0.08)', border:'1px solid rgba(192,97,74,0.2)', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>💡</span>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
            Your debt-to-asset ratio is <strong style={{ color:LOSS }}>{data.debtToAsset.toFixed(1)}%</strong>.
            Financial advisors recommend keeping this below 30%.
            Consider accelerating loan repayments or increasing investments.
          </p>
        </div>
      )}
      {data.stockSummary.byExchange?.CRYPTO > 0 && data.totalAssets > 0 &&
        (data.stockSummary.byExchange.CRYPTO / data.totalAssets) * 100 > 30 && (
        <div style={{ gridColumn:'span 2', padding:'14px 20px', borderRadius:14, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
            Crypto is over <strong style={{ color:'var(--warning)' }}>{((data.stockSummary.byExchange.CRYPTO / data.totalAssets) * 100).toFixed(0)}%</strong> of your total wealth.
            Consider rebalancing towards Mutual Funds to reduce volatility.
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  STOCKS TAB
 * ══════════════════════════════════════════════════ */
function StocksTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const deleteStock = useDeleteStock();
  const [showModal, setShowModal] = useState(false);
  const [filterEx, setFilterEx] = useState<'ALL'|'NSE'|'US'|'CRYPTO'>('ALL');

  const filtered = data.stockHoldings.filter(h => filterEx === 'ALL' || h.exchange === filterEx);

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { l:'Invested',   v: fmtINR(data.stockSummary.totalInvested, masked) },
          { l:'Current',    v: fmtINR(data.stockSummary.totalCurrent, masked)  },
          { l:'P&L',        v: `${data.stockSummary.totalPnl>=0?'+':''}${fmtINR(data.stockSummary.totalPnl, masked)}`,
            c: data.stockSummary.totalPnl>=0 ? GAIN : LOSS },
          { l:'Holdings',   v: String(data.stockSummary.holdingsCount) },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding:'16px 18px' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{s.l}</p>
            <p style={{ fontFamily:MONO, fontSize:18, fontWeight:700, color:(s as any).c ?? 'var(--text-primary)' }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {(['ALL','NSE','US','CRYPTO'] as const).map(e => (
          <button key={e} onClick={()=>setFilterEx(e)} className="btn btn-sm"
            style={{ border:'none', background: filterEx===e ? (e==='ALL'?'var(--indigo-500)':EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG]?.color) : 'var(--bg-surface-2)', color: filterEx===e?'#fff':'var(--text-secondary)' }}>
            {e==='ALL' ? 'All' : `${EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG].emoji} ${EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG].label}`}
          </button>
        ))}
        <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }} onClick={()=>setShowModal(true)}>
          <Plus size={14}/> Add Stock
        </button>
      </div>

      {/* Holdings list */}
      <div className="card" style={{ overflow:'hidden' }}>
        {filtered.length === 0
          ? <EmptyState icon="📊" message="No stock holdings yet. Add NSE, US stocks, or crypto." action={()=>setShowModal(true)} actionLabel="Add Holding" />
          : filtered.map((h, i) => {
              const cfg = EXCHANGE_CFG[h.exchange as keyof typeof EXCHANGE_CFG];
              const isG = h.pnl >= 0;
              return (
                <div key={h.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i<filtered.length-1?'1px solid var(--border)':'none', transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-surface-2)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:cfg.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{cfg.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.companyName}</p>
                    <div style={{ display:'flex', gap:8 }}>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:cfg.color+'18', color:cfg.color }}>{h.ticker}</span>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>×{h.quantity}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{fmtINRPrecise(h.currentPrice, masked)}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>avg {fmtINRPrecise(h.avgBuyPrice, masked)}</p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, minWidth:90 }}>
                    <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{fmtINR(h.currentValue, masked)}</p>
                    <p style={{ fontFamily:MONO, fontSize:12, color: isG?GAIN:LOSS }}>{isG?'+':''}{fmtPct(h.pnlPct)}</p>
                  </div>
                  <button className="btn btn-icon" onClick={()=>deleteStock.mutate(h.id)} style={{ width:28, height:28, color:'var(--danger)', flexShrink:0 }}><Trash2 size={13}/></button>
                </div>
              );
            })
        }
      </div>

      <AnimatePresence>
        {showModal && <AddStockModal onClose={()=>setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  MUTUAL FUNDS TAB
 * ══════════════════════════════════════════════════ */
function MutualFundsTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const deleteMF = useDeleteMFHolding();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [navPeriod, setNavPeriod] = useState<'1Y'|'3Y'|'5Y'>('1Y');
  const [filterType, setFilterType] = useState<'all'|'lumpsum'|'sip'>('all');

  const filtered = data.mfHoldings.filter(h =>
    filterType === 'all' ? true : filterType === 'sip' ? h.isSIP : !h.isSIP
  );

  return (
    <div>
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { l:'Invested',  v: fmtINR(data.mfSummary.totalInvested, masked) },
          { l:'Current',   v: fmtINR(data.mfSummary.totalCurrent, masked)  },
          { l:'P&L',       v: `${data.mfSummary.totalPnl>=0?'+':''}${fmtINR(data.mfSummary.totalPnl, masked)}`,
            c: data.mfSummary.totalPnl>=0 ? GAIN : LOSS },
          { l:'Schemes',   v: String(data.mfSummary.holdingsCount) },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding:'16px 18px' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{s.l}</p>
            <p style={{ fontFamily:MONO, fontSize:18, fontWeight:700, color:(s as any).c??'var(--text-primary)' }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {(['all','lumpsum','sip'] as const).map(f => (
          <button key={f} onClick={()=>setFilterType(f)} className="btn btn-sm"
            style={{ border:'none', background:filterType===f?'var(--indigo-500)':'var(--bg-surface-2)', color:filterType===f?'#fff':'var(--text-secondary)', textTransform:'capitalize' }}>
            {f==='all'?'All':f==='sip'?'🔄 SIP':'💰 Lumpsum'}
          </button>
        ))}
        <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }} onClick={()=>setShowModal(true)}>
          <Plus size={14}/> Add Fund
        </button>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="📈" message="No mutual fund holdings. Add a lumpsum or SIP." action={()=>setShowModal(true)} actionLabel="Add Fund" />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map(h => {
              const isG = h.pnl >= 0;
              const expanded = expandedId === h.id;
              return (
                <div key={h.id} className="card" style={{ padding:20 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>
                      {h.isSIP ? '🔄' : '📈'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', marginBottom:3 }}>{h.schemeName}</p>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span className="badge badge-info" style={{ fontSize:10 }}>{h.category}</span>
                        {h.isSIP && <span className="badge badge-indigo" style={{ fontSize:10 }}>SIP ₹{(h.sipAmount??0).toLocaleString('en-IN')}/mo</span>}
                        {h.nextSipDate && <span style={{ fontSize:10, color:'var(--text-muted)' }}>Next: {h.nextSipDate}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{fmtINR(h.currentValue, masked)}</p>
                        <p style={{ fontFamily:MONO, fontSize:12, color:isG?GAIN:LOSS }}>{isG?'+':''}{fmtPct(h.pnlPct)}</p>
                      </div>
                      <button className="btn btn-icon" onClick={()=>setExpandedId(expanded?null:h.id)} style={{ width:28, height:28 }}>
                        <ChevronDown size={13} style={{ transform:expanded?'rotate(180deg)':'none', transition:'transform 0.2s' }} />
                      </button>
                      <button className="btn btn-icon" onClick={()=>deleteMF.mutate(h.id)} style={{ width:28, height:28, color:'var(--danger)' }}><Trash2 size={13}/></button>
                    </div>
                  </div>

                  {/* Key stats row */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:14 }}>
                    {[
                      { l:'Invested', v:fmtINR(h.investedAmount, masked) },
                      { l:'Current',  v:fmtINR(h.currentValue, masked)   },
                      { l:'P&L',      v:`${h.pnl>=0?'+':''}${fmtINR(h.pnl, masked)}`, c:isG?GAIN:LOSS },
                      { l:'NAV',      v:fmtINRPrecise(h.currentNAV, masked) },
                    ].map(s => (
                      <div key={s.l} style={{ padding:'8px 12px', borderRadius:8, background:'var(--bg-surface-2)', textAlign:'center' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>{s.l}</p>
                        <p style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:(s as any).c??'var(--text-primary)' }}>{s.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Expanded NAV chart */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}>
                        <MiniNavChart schemeCode={h.schemeCode} period={navPeriod} onPeriodChange={setNavPeriod} masked={masked} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )
      }

      <AnimatePresence>
        {showModal && <AddMFModal onClose={()=>setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ── Mini NAV chart ─────────────────────────────── */
function MiniNavChart({ schemeCode, period, onPeriodChange, masked }: {
  schemeCode:string; period:'1Y'|'3Y'|'5Y'; onPeriodChange:(p:'1Y'|'3Y'|'5Y')=>void; masked:boolean;
}) {
  const { data=[], isLoading } = useMFNavHistory(schemeCode, period);
  return (
    <div style={{ marginTop:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>NAV History</p>
        <div style={{ display:'flex', gap:6 }}>
          {(['1Y','3Y','5Y'] as const).map(p => (
            <button key={p} onClick={()=>onPeriodChange(p)} className="btn btn-sm"
              style={{ padding:'3px 8px', fontSize:11, border:'none', background:period===p?'var(--indigo-500)':'var(--bg-surface-2)', color:period===p?'#fff':'var(--text-secondary)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>
      {isLoading
        ? <div style={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/></div>
        : (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} margin={{ top:4, right:0, left:0, bottom:0 }}>
              <defs>
                <linearGradient id={`ng-${schemeCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:9 }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis hide domain={['auto','auto']}/>
              <Tooltip formatter={(v:number)=>[fmtINRPrecise(v,masked),'NAV']}
                contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:11 }}/>
              <Area type="monotone" dataKey="nav" stroke="#6366f1" strokeWidth={2} fill={`url(#ng-${schemeCode})`} dot={false} activeDot={{ r:3, fill:'#6366f1' }}/>
            </AreaChart>
          </ResponsiveContainer>
        )
      }
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  ASSETS TAB
 * ══════════════════════════════════════════════════ */
function AssetsTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const deleteAsset = useDeleteAsset();
  const [showModal, setShowModal] = useState(false);

  const ASSET_EMOJI: Record<string,string> = {
    Property:'🏠', 'Fixed Deposit':'🏦', Gold:'🪙', Vehicle:'🚗',
    'Mutual Fund':'📈', Stock:'📊', Crypto:'₿', Other:'💼',
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <p style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>Manual Assets</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
            Total: <span style={{ fontFamily:MONO, fontWeight:700, color:'var(--text-primary)' }}>{fmtINR(data.manualAssetsValue, masked)}</span>
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>
          <Plus size={14}/> Add Asset
        </button>
      </div>

      {data.assets.length === 0
        ? <EmptyState icon="🏠" message="Add manual assets like property, FD, gold, or vehicles." action={()=>setShowModal(true)} actionLabel="Add Asset" />
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {data.assets.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                className="card" style={{ padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'rgba(16,185,129,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      {ASSET_EMOJI[a.type] ?? '💼'}
                    </div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{a.name}</p>
                      <span className="badge badge-success" style={{ fontSize:10 }}>{a.type}</span>
                    </div>
                  </div>
                  <button className="btn btn-icon" onClick={()=>deleteAsset.mutate(a.id)} style={{ width:28, height:28, color:'var(--danger)', flexShrink:0 }}><Trash2 size={12} /></button>
                </div>
                <p style={{ fontFamily:MONO, fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>
                  {masked ? '₹ ••••••' : fmtINR(a.currentValueInCents/100)}
                </p>
                {a.ticker && <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Ticker: {a.ticker} · Qty: {a.quantity}</p>}
              </motion.div>
            ))}
          </div>
        )
      }

      <AnimatePresence>
        {showModal && <AddAssetModal onClose={()=>setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  LIABILITIES TAB
 * ══════════════════════════════════════════════════ */
const LIABILITY_CATEGORY_EMOJI: Record<string,string> = {
  'Home Loan':'🏠', 'Car Loan':'🚗', 'Personal Loan':'💳',
  'Education Loan':'🎓', 'Credit Card':'💳', 'Other':'📋',
};

function LiabilitiesTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const deleteLiability = useDeleteLiability();
  const [showModal, setShowModal] = useState(false);

  const sorted = [...data.liabilities].sort((a,b) => b.interestRate - a.interestRate);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <p style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>Liabilities</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
            Total: <span style={{ fontFamily:MONO, fontWeight:700, color:LOSS }}>{fmtINR(data.totalLiabilities, masked)}</span>
            &nbsp;·&nbsp;D/A ratio: <strong>{data.debtToAsset.toFixed(1)}%</strong>
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>
          <Plus size={14}/> Add Loan
        </button>
      </div>

      {/* Financial freedom bar */}
      <div className="card" style={{ padding:20, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <p style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>Financial Freedom Progress</p>
          <p style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:GAIN }}>{data.financialFreedomPct.toFixed(1)}%</p>
        </div>
        <div style={{ height:10, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
          <motion.div initial={{ width:0 }} animate={{ width:`${data.financialFreedomPct}%` }}
            transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
            style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${GAIN},#34d399)` }}/>
        </div>
        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>
          Based on principal repaid across all loans. 100% = debt-free.
        </p>
      </div>

      {sorted.length === 0
        ? <EmptyState icon="🎉" message="No liabilities! You're debt-free." />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {sorted.map((l, i) => {
              const repaidPct = l.totalPrincipalInCents > 0
                ? ((l.totalPrincipalInCents - l.remainingBalanceInCents) / l.totalPrincipalInCents) * 100
                : 0;
              const rateColor = l.interestRate > 10 ? LOSS : l.interestRate > 6 ? 'var(--warning)' : GAIN;

              return (
                <motion.div key={l.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                  className="card" style={{ padding:22 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 }}>
                    <div style={{ width:42, height:42, borderRadius:10, flexShrink:0, background:'rgba(192,97,74,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      {LIABILITY_CATEGORY_EMOJI[l.category] ?? '📋'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:3 }}>{l.loanName}</p>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span className="badge badge-danger" style={{ fontSize:10 }}>{l.category}</span>
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background: `${rateColor}18`, color:rateColor, fontWeight:700 }}>
                          {l.interestRate}% p.a.
                        </span>
                        {l.dueDate && <span style={{ fontSize:11, color:'var(--text-muted)' }}>EMI due: {l.dueDate}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontFamily:MONO, fontSize:18, fontWeight:800, color:LOSS }}>
                        {masked ? '₹ ••••••' : fmtINR(l.remainingBalanceInCents/100)}
                      </p>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                        of {masked ? '₹ ••••' : fmtINR(l.totalPrincipalInCents/100)}
                      </p>
                    </div>
                    <button className="btn btn-icon" onClick={()=>deleteLiability.mutate(l.id)} style={{ width:28, height:28, color:'var(--danger)', flexShrink:0 }}><Trash2 size={12} /></button>
                  </div>

                  {/* Repayment progress */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>Repaid</span>
                      <span style={{ fontFamily:MONO, fontSize:11, color:GAIN, fontWeight:700 }}>{repaidPct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height:6, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${repaidPct}%` }}
                        transition={{ duration:0.9, delay:i*0.06+0.2, ease:[0.16,1,0.3,1] }}
                        style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${GAIN},#34d399)` }}/>
                    </div>
                  </div>

                  {l.emiInCents && (
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>
                      Monthly EMI: <span style={{ fontFamily:MONO, fontWeight:700, color:'var(--text-primary)' }}>{masked ? '••••' : fmtINR(l.emiInCents/100)}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )
      }

      <AnimatePresence>
        {showModal && <AddLiabilityModal onClose={()=>setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  MODALS
 * ══════════════════════════════════════════════════ */
function AddStockModal({ onClose }: { onClose:()=>void }) {
  const [exchange, setExchange] = useState<'NSE'|'US'|'CRYPTO'>('NSE');
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState<{ticker:string;name:string}|null>(null);
  const [qty, setQty] = useState(''); const [price, setPrice] = useState('');
  const { data:results=[] } = useStockSearch(searchQ, exchange);
  const addStock = useAddStock();

  return (
    <Modal title="Add Stock / Crypto" onClose={onClose}>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['NSE','US','CRYPTO'] as const).map(e => (
          <button key={e} onClick={()=>{setExchange(e);setSearchQ('');setSelected(null);}} className="btn btn-sm"
            style={{ flex:1, border:'none', background:exchange===e?EXCHANGE_CFG[e].color:'var(--bg-surface-2)', color:exchange===e?'#fff':'var(--text-secondary)', fontSize:12 }}>
            {EXCHANGE_CFG[e].emoji} {EXCHANGE_CFG[e].label}
          </button>
        ))}
      </div>
      <SearchDropdown label={`Search ${EXCHANGE_CFG[exchange].label}`} query={searchQ} setQuery={setSearchQ}
        results={results.map(r=>({key:r.ticker, primary:r.ticker, secondary:r.name}))}
        onSelect={r=>{setSelected({ticker:r.key,name:r.primary==='NSE'?r.secondary:r.primary});setSearchQ(r.secondary);}} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
        <FormField label="Quantity" value={qty} onChange={setQty} type="number" placeholder="10" />
        <FormField label="Avg Buy Price (₹)" value={price} onChange={setPrice} type="number" placeholder="1500.00" />
      </div>
      <ModalActions onClose={onClose} onSubmit={()=>addStock.mutate({ticker:selected!.ticker,exchange,companyName:selected!.name,quantity:parseFloat(qty),avgBuyPrice:parseFloat(price)},{onSuccess:onClose})}
        disabled={!selected||!qty||!price} loading={addStock.isPending} label="Add Stock" />
    </Modal>
  );
}

function AddMFModal({ onClose }: { onClose:()=>void }) {
  const [mode, setMode] = useState<'lumpsum'|'sip'>('lumpsum');
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState<{schemeCode:string;schemeName:string}|null>(null);
  const [f, setF] = useState({ units:'', avgNAV:'', investedAt:new Date().toISOString().split('T')[0], sipAmount:'', sipDay:'5', sipStartDate:new Date().toISOString().split('T')[0] });
  const { data:results=[] } = useMFSearch(searchQ);
  const addLumpsum = useAddMFLumpsum();
  const addSip = useAddMFSip();

  const submit = () => {
    if (!selected) return;
    if (mode==='lumpsum') addLumpsum.mutate({ schemeCode:selected.schemeCode, schemeName:selected.schemeName, units:parseFloat(f.units), avgNAV:parseFloat(f.avgNAV), investedAt:f.investedAt }, { onSuccess:onClose });
    else addSip.mutate({ schemeCode:selected.schemeCode, schemeName:selected.schemeName, sipAmount:parseFloat(f.sipAmount), sipDay:parseInt(f.sipDay), sipStartDate:f.sipStartDate }, { onSuccess:onClose });
  };

  return (
    <Modal title="Add Mutual Fund" onClose={onClose}>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['lumpsum','sip'] as const).map(m => (
          <button key={m} onClick={()=>setMode(m)} className="btn btn-sm"
            style={{ flex:1, border:'none', background:mode===m?'var(--indigo-500)':'var(--bg-surface-2)', color:mode===m?'#fff':'var(--text-secondary)' }}>
            {m==='lumpsum'?'💰 Lumpsum':'🔄 SIP'}
          </button>
        ))}
      </div>
      <SearchDropdown label="Search Scheme" query={searchQ} setQuery={setSearchQ}
        results={results.map(r=>({key:r.schemeCode, primary:r.schemeName, secondary:`#${r.schemeCode}`}))}
        onSelect={r=>{setSelected({schemeCode:r.key,schemeName:r.primary});setSearchQ(r.primary);}} />
      {mode==='lumpsum' ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
          <FormField label="Units" value={f.units} onChange={v=>setF(p=>({...p,units:v}))} type="number" placeholder="100.000" />
          <FormField label="Avg NAV (₹)" value={f.avgNAV} onChange={v=>setF(p=>({...p,avgNAV:v}))} type="number" placeholder="45.50" />
          <div style={{ gridColumn:'span 2' }}><FormField label="Investment Date" value={f.investedAt} onChange={v=>setF(p=>({...p,investedAt:v}))} type="date" /></div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
          <FormField label="Monthly SIP (₹)" value={f.sipAmount} onChange={v=>setF(p=>({...p,sipAmount:v}))} type="number" placeholder="5000" />
          <FormField label="SIP Day (1-28)" value={f.sipDay} onChange={v=>setF(p=>({...p,sipDay:v}))} type="number" placeholder="5" />
          <div style={{ gridColumn:'span 2' }}><FormField label="Start Date" value={f.sipStartDate} onChange={v=>setF(p=>({...p,sipStartDate:v}))} type="date" /></div>
        </div>
      )}
      <ModalActions onClose={onClose} onSubmit={submit}
        disabled={!selected||(mode==='lumpsum'?!f.units||!f.avgNAV:!f.sipAmount)}
        loading={addLumpsum.isPending||addSip.isPending} label={mode==='sip'?'Add SIP':'Add Holding'} />
    </Modal>
  );
}

function AddAssetModal({ onClose }: { onClose:()=>void }) {
  const [f, setF] = useState({ name:'', type:'Property', currentValue:'' });
  const addAsset = useAddAsset();
  const TYPES = ['Property','Fixed Deposit','Gold','Vehicle','Other'];
  return (
    <Modal title="Add Manual Asset" onClose={onClose}>
      <FormField label="Asset Name" value={f.name} onChange={v=>setF(p=>({...p,name:v}))} placeholder="e.g. Mumbai Apartment" />
      <div style={{ marginTop:14 }}>
        <label style={LS}>Type</label>
        <select className="input" value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))}>
          {TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginTop:14 }}>
        <FormField label="Current Value (₹)" value={f.currentValue} onChange={v=>setF(p=>({...p,currentValue:v}))} type="number" placeholder="5000000" />
        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Enter value in ₹ — stored in paise internally</p>
      </div>
      <ModalActions onClose={onClose} onSubmit={()=>addAsset.mutate({ name:f.name, type:f.type, currentValueInCents:Math.round(parseFloat(f.currentValue)*100) },{onSuccess:onClose})}
        disabled={!f.name||!f.currentValue} loading={addAsset.isPending} label="Add Asset" />
    </Modal>
  );
}

function AddLiabilityModal({ onClose }: { onClose:()=>void }) {
  const [f, setF] = useState({ loanName:'', category:'Home Loan', totalPrincipal:'', remainingBalance:'', interestRate:'', emi:'', dueDate:'' });
  const addLiability = useAddLiability();
  return (
    <Modal title="Add Liability" onClose={onClose}>
      <FormField label="Loan Name" value={f.loanName} onChange={v=>setF(p=>({...p,loanName:v}))} placeholder="e.g. SBI Home Loan" />
      <div style={{ marginTop:14 }}>
        <label style={LS}>Category</label>
        <select className="input" value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))}>
          {LIABILITY_CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
        <FormField label="Total Principal (₹)" value={f.totalPrincipal} onChange={v=>setF(p=>({...p,totalPrincipal:v}))} type="number" placeholder="2000000" />
        <FormField label="Remaining Balance (₹)" value={f.remainingBalance} onChange={v=>setF(p=>({...p,remainingBalance:v}))} type="number" placeholder="1500000" />
        <FormField label="Interest Rate (%)" value={f.interestRate} onChange={v=>setF(p=>({...p,interestRate:v}))} type="number" placeholder="8.5" />
        <FormField label="Monthly EMI (₹) — optional" value={f.emi} onChange={v=>setF(p=>({...p,emi:v}))} type="number" placeholder="18000" />
        <div style={{ gridColumn:'span 2' }}><FormField label="Next EMI Due Date — optional" value={f.dueDate} onChange={v=>setF(p=>({...p,dueDate:v}))} type="date" /></div>
      </div>
      <ModalActions onClose={onClose} onSubmit={()=>addLiability.mutate({
        loanName:f.loanName, category:f.category as any,
        totalPrincipalInCents:Math.round(parseFloat(f.totalPrincipal)*100),
        remainingBalanceInCents:Math.round(parseFloat(f.remainingBalance)*100),
        interestRate:parseFloat(f.interestRate),
        emiInCents:f.emi?Math.round(parseFloat(f.emi)*100):undefined,
        dueDate:f.dueDate||undefined,
      },{onSuccess:onClose})} disabled={!f.loanName||!f.totalPrincipal||!f.remainingBalance||!f.interestRate} loading={addLiability.isPending} label="Add Liability" />
    </Modal>
  );
}

/* ── Shared UI primitives ────────────────────────── */
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontWeight:700, fontSize:18, color:'var(--text-primary)' }}>{title}</h2>
          <button className="btn btn-icon" onClick={onClose} style={{ width:30, height:30 }}><X size={15}/></button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function SearchDropdown({ label, query, setQuery, results, onSelect }: {
  label:string; query:string; setQuery:(v:string)=>void;
  results:{key:string;primary:string;secondary:string}[];
  onSelect:(r:{key:string;primary:string;secondary:string})=>void;
}) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <div style={{ position:'relative' }}>
        <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
        <input className="input" style={{ paddingLeft:34 }} placeholder="Type to search…" value={query} onChange={e=>setQuery(e.target.value)}/>
      </div>
      {results.length > 0 && (
        <div style={{ border:'1px solid var(--border)', borderRadius:10, marginTop:4, maxHeight:160, overflowY:'auto', background:'var(--bg-surface)' }}>
          {results.map(r => (
            <button key={r.key} onClick={()=>onSelect(r)}
              style={{ display:'block', width:'100%', padding:'9px 14px', textAlign:'left', background:'none', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer', fontSize:13, color:'var(--text-primary)' }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-surface-2)')}
              onMouseLeave={e=>(e.currentTarget.style.background='none')}>
              <span style={{ fontWeight:600 }}>{r.primary}</span>
              <span style={{ color:'var(--text-muted)', marginLeft:8, fontSize:11 }}>{r.secondary}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type='text', placeholder='' }: {
  label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string;
}) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input className="input" type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>
    </div>
  );
}

function ModalActions({ onClose, onSubmit, disabled, loading, label }: {
  onClose:()=>void; onSubmit:()=>void; disabled:boolean; loading:boolean; label:string;
}) {
  return (
    <div style={{ display:'flex', gap:10, marginTop:20 }}>
      <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" style={{ flex:2 }} onClick={onSubmit} disabled={disabled||loading}>
        {loading ? 'Saving…' : label}
      </button>
    </div>
  );
}

function EmptyState({ icon, message, action, actionLabel }: { icon:string; message:string; action?:()=>void; actionLabel?:string }) {
  return (
    <div className="card" style={{ padding:48, textAlign:'center', color:'var(--text-muted)' }}>
      <p style={{ fontSize:36, marginBottom:12 }}>{icon}</p>
      <p style={{ fontWeight:600, fontSize:14, marginBottom:4, color:'var(--text-secondary)' }}>{message}</p>
      {action && actionLabel && (
        <button className="btn btn-primary btn-sm" style={{ marginTop:16 }} onClick={action}>
          <Plus size={13}/> {actionLabel}
        </button>
      )}
    </div>
  );
}

const LS: React.CSSProperties = { display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-primary)' };

/* ══════════════════════════════════════════════════
 *  MAIN PAGE
 * ══════════════════════════════════════════════════ */
export default function WealthPage() {
  const { data, isLoading, isError, refetch, isFetching } = useWealth();
  const { isMasked, togglePrivacyMode } = useWealthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (isLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, gap:12, color:'var(--text-muted)' }}>
        <Loader2 size={22} style={{ animation:'spin 1s linear infinite' }}/>
        Loading your wealth data…
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
        <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:16, padding:'24px 32px', color:'var(--danger)', textAlign:'center' }}>
          <p style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Failed to load wealth data</p>
          <p style={{ fontSize:13, opacity:0.8 }}>Ensure the backend is running and you are logged in.</p>
          <button className="btn btn-sm btn-ghost" style={{ marginTop:12 }} onClick={()=>refetch()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Wealth & Investments</h1>
          <p className="page-subtitle">Your complete financial picture — single source of truth</p>
        </div>
      </div>

      {/* Net worth header */}
      <NetWorthHeader
        data={data} masked={isMasked}
        onToggleMask={togglePrivacyMode}
        onSync={()=>refetch()} syncing={isFetching}
      />

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--bg-surface-2)', padding:4, borderRadius:14, width:'fit-content' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{
                display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:10,
                border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                background: active ? 'var(--bg-surface)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
                transition:'all 0.2s',
              }}>
              <tab.icon size={15}/>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          {activeTab === 'overview'     && <OverviewTab     data={data} masked={isMasked} />}
          {activeTab === 'stocks'       && <StocksTab       data={data} masked={isMasked} />}
          {activeTab === 'mutual-funds' && <MutualFundsTab  data={data} masked={isMasked} />}
          {activeTab === 'assets'       && <AssetsTab       data={data} masked={isMasked} />}
          {activeTab === 'liabilities'  && <LiabilitiesTab  data={data} masked={isMasked} />}
        </motion.div>
      </AnimatePresence>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}