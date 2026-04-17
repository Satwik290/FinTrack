"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown,
  Plus, Trash2, ChevronDown, Search, X, Loader2,
  Landmark, BarChart2, BookOpen, Shield, AlertTriangle,
  Calendar, CheckCircle2, Clock, Zap, Star,
  ArrowUpRight, AlertCircle, ChevronRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import {
  useWealth, useAddAsset, useDeleteAsset, useAddLiability,
  useDeleteLiability, useAddMFLumpsum, useAddMFSip, useDeleteMFHolding,
  useAddStock, useDeleteStock, useAddInsurance, useDeleteInsurance,
  usePayPremium, useMFNavHistory, useMFSearch, useStockSearch,
  type WealthSummary, type Liability, type InsurancePolicy,
} from "@/hooks/usewealth";
import { useWealthStore } from "@/store/useWealthStore";

/* ─── Design tokens ──────────────────────────────────────────── */
const SYNE = "'Syne', 'Plus Jakarta Sans', sans-serif";
const SANS = "'DM Sans', 'Outfit', sans-serif";
const MONO = "'Space Mono', 'JetBrains Mono', monospace";
const GAIN   = "#0DDC9B";
const LOSS   = "#FF5C67";
const INDIGO = "#6C74FF";
const VIOLET = "#7E5BFB";
const AMBER  = "#F59E0B";

/* ─── Global styles injected once ───────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

  /* ── Token bridge: dark (default) ── */
  :root, [data-theme="dark"] {
    --w-bg:       #080B14;
    --w-surface:  #0D1117;
    --w-raised:   #131920;
    --w-raised2:  #1A2230;
    --w-border:   rgba(255,255,255,0.06);
    --w-border-hi:rgba(108,116,255,0.4);
    --w-text0:    #F0F4FA;
    --w-text1:    #8897A7;
    --w-text2:    #3D4F61;
    --w-shadow:   rgba(0,0,0,0.55);
    --w-hover:    rgba(255,255,255,0.025);
  }
  /* ── Light override ── */
  [data-theme="light"] {
    --w-bg:       #EEF2F7;
    --w-surface:  #FFFFFF;
    --w-raised:   #F6F8FB;
    --w-raised2:  #EDF0F5;
    --w-border:   rgba(0,0,0,0.07);
    --w-border-hi:rgba(99,102,241,0.45);
    --w-text0:    #0D1117;
    --w-text1:    #4A5568;
    --w-text2:    #94A3B8;
    --w-shadow:   rgba(0,0,0,0.06);
    --w-hover:    rgba(0,0,0,0.025);
  }

  @keyframes w-spin    { to { transform: rotate(360deg) } }
  @keyframes w-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes w-aurora  { 0%,100%{opacity:0.6;transform:scale(1) translate(0,0)} 33%{opacity:0.9;transform:scale(1.05) translate(10px,-10px)} 66%{opacity:0.7;transform:scale(0.97) translate(-8px,8px)} }
  @keyframes w-pulse   { 0%,100%{opacity:0.5} 50%{opacity:1} }

  .w-card {
    background: var(--w-raised);
    border: 1px solid var(--w-border);
    border-radius: 20px;
    box-shadow: 0 4px 20px var(--w-shadow);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .w-card::before {
    content:'';
    position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
    pointer-events:none;
  }
  .w-card:hover {
    border-color: var(--w-border-hi);
    box-shadow: 0 0 0 1px var(--w-border-hi), 0 8px 32px var(--w-shadow);
    transform: translateY(-1px);
  }

  .w-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
  .w-overview-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }

  /* ── Tab scroll rail ── */
  .w-tab-rail {
    display:flex; gap:4px; overflow-x:auto; padding:4px;
    background:var(--w-raised); border-radius:16px;
    border:1px solid var(--w-border);
    scrollbar-width:none; margin-bottom:24px;
    -webkit-overflow-scrolling: touch;
  }
  .w-tab-rail::-webkit-scrollbar { display:none; }

  /* ── Tag / badge ── */
  .w-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:700; font-family:${MONO};
    padding:2px 8px; border-radius:99px; line-height:1.6;
    letter-spacing:0.4px;
  }

  /* ── Shard button ── */
  .w-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:10px; border:1px solid var(--w-border);
    background:var(--w-raised); color:var(--w-text1);
    font-size:12px; font-family:${SANS}; font-weight:600;
    cursor:pointer; transition:all 0.2s; white-space:nowrap;
  }
  .w-btn:hover { border-color:var(--w-border-hi); color:var(--w-text0); background:var(--w-raised2); }
  .w-btn-primary {
    background:linear-gradient(135deg,${INDIGO},${VIOLET}) !important;
    border-color:transparent !important; color:#fff !important;
    box-shadow:0 4px 14px rgba(108,116,255,0.3);
  }
  .w-btn-primary:hover { box-shadow:0 6px 20px rgba(108,116,255,0.45) !important; transform:translateY(-1px); }
  .w-btn-icon {
    width:30px;height:30px;padding:0;border-radius:8px;
    justify-content:center;flex-shrink:0;
  }

  /* ── Input ── */
  .w-input {
    width:100%; padding:10px 14px;
    background:var(--w-raised); border:1px solid var(--w-border);
    border-radius:10px; color:var(--w-text0);
    font-size:13px; font-family:${SANS};
    outline:none; transition:border-color 0.2s, box-shadow 0.2s;
    box-sizing:border-box;
  }
  .w-input:focus { border-color:${INDIGO}; box-shadow:0 0 0 3px rgba(108,116,255,0.12); }
  .w-input::placeholder { color:var(--w-text2); }
  select.w-input { appearance:none; cursor:pointer; }
  .w-label {
    display:block; font-size:11px; font-weight:700;
    font-family:${SANS}; color:var(--w-text1);
    letter-spacing:0.3px; margin-bottom:6px;
    text-transform:uppercase;
  }

  /* ── Progress bar ── */
  .w-prog-track { height:6px; background:var(--w-raised2); border-radius:99px; overflow:hidden; }

  /* ── Responsive ── */
  @media(max-width:1024px) {
    .w-stat-grid { grid-template-columns:repeat(2,1fr); }
    .w-overview-grid { grid-template-columns:1fr; }
  }
  @media(max-width:640px) {
    .w-stat-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .w-overview-grid { grid-template-columns:1fr; }
    .w-ins-grid  { grid-template-columns:1fr !important; }
    .w-asset-grid { grid-template-columns:1fr !important; }
    .w-2col { grid-template-columns:1fr !important; }
    .w-hide-sm { display:none !important; }
  }
  @media(max-width:400px) {
    .w-stat-grid { grid-template-columns:1fr; }
  }

  /* ── Recharts light mode ── */
  [data-theme="light"] .recharts-cartesian-grid line { stroke:rgba(0,0,0,0.05); }
  [data-theme="light"] .recharts-tooltip-cursor { fill:rgba(0,0,0,0.03); }

  /* ── Modal ── */
  .w-modal-backdrop {
    position:fixed;inset:0;background:rgba(0,0,0,0.7);
    backdrop-filter:blur(8px);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:16px;
  }
  .w-modal-box {
    background:var(--w-surface);border:1px solid var(--w-border);
    border-radius:22px;width:100%;max-width:520px;
    box-shadow:0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px var(--w-border-hi);
    max-height:90vh;overflow-y:auto;
    padding:28px;
  }

  /* ── Scrollbar ── */
  .w-modal-box::-webkit-scrollbar { width:4px; }
  .w-modal-box::-webkit-scrollbar-track { background:transparent; }
  .w-modal-box::-webkit-scrollbar-thumb { background:var(--w-border); border-radius:99px; }
`;

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtINR = (n: number, masked = false) =>
  masked ? "₹ ••••••" :
  new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n);
const fmtINRPrecise = (n: number, masked = false) =>
  masked ? "••••" :
  new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtShort = (n: number, masked = false) => {
  if (masked) return "₹ ••••";
  if (Math.abs(n) >= 1e7) return `₹${(n/1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n/1e5).toFixed(2)}L`;
  return fmtINR(n);
};
function timeAgo(iso: string | null | number): string {
  if (!iso) return "Never";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

/* ─── Tab config ─────────────────────────────────────────────── */
type Tab = "overview"|"stocks"|"mutual-funds"|"assets"|"liabilities"|"insurance";
const TABS: {id:Tab;label:string;icon:React.ElementType;emoji:string}[] = [
  { id:"overview",      label:"Overview",      icon:Landmark,      emoji:"📊" },
  { id:"stocks",        label:"Stocks",        icon:BarChart2,     emoji:"📈" },
  { id:"mutual-funds",  label:"Funds",         icon:BookOpen,      emoji:"💰" },
  { id:"assets",        label:"Assets",        icon:Shield,        emoji:"🏠" },
  { id:"liabilities",   label:"Liabilities",   icon:AlertTriangle, emoji:"🔴" },
  { id:"insurance",     label:"Insurance",     icon:Shield,        emoji:"🛡️" },
];
const EXCHANGE_CFG = {
  NSE:    { label:"NSE",    color:INDIGO,  emoji:"🇮🇳" },
  US:     { label:"US",     color:AMBER,   emoji:"🇺🇸" },
  CRYPTO: { label:"Crypto", color:"#f97316", emoji:"₿" },
} as const;
const POLICY_META: Record<string,{icon:string;color:string;bg:string;label:string}> = {
  TERM_LIFE: { icon:"🛡️", color:INDIGO,  bg:"rgba(108,116,255,0.10)", label:"Term Life" },
  HEALTH:    { icon:"🏥", color:GAIN,    bg:"rgba(13,220,155,0.10)",  label:"Health" },
  MOTOR:     { icon:"🚗", color:AMBER,   bg:"rgba(245,158,11,0.10)",  label:"Motor" },
  HOME:      { icon:"🏠", color:"#3b82f6", bg:"rgba(59,130,246,0.10)", label:"Home" },
};
const LIABILITY_CATEGORIES = ["Home Loan","Car Loan","Personal Loan","Education Loan","Credit Card","Other"];

/* ─── WealthShard — styled card wrapper ─────────────────────── */
function WCard({ children, style={}, className="" }: { children:React.ReactNode; style?:React.CSSProperties; className?:string }) {
  return (
    <div className={`w-card ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─── StatCard ───────────────────────────────────────────────── */
function StatCard({ label, value, sub, color="#F0F4FA", icon, bg, delay=0 }:
  { label:string; value:string; sub?:string; color?:string; icon?:string; bg?:string; delay?:number }) {
  return (
    <motion.div
      className="w-card"
      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.35, ease:[0.16,1,0.3,1] }}
      style={{ padding:"16px 18px" }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <p style={{ fontSize:10, fontWeight:700, color:"var(--w-text2)", fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.8px" }}>{label}</p>
        {icon && (
          <div style={{ width:28, height:28, borderRadius:8, background:bg??`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{icon}</div>
        )}
      </div>
      <p style={{ fontFamily:MONO, fontSize:18, fontWeight:700, color, letterSpacing:-0.5, lineHeight:1, marginBottom:4 }}>{value}</p>
      {sub && <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS }}>{sub}</p>}
    </motion.div>
  );
}

/* ─── NetWorthHeader ─────────────────────────────────────────── */
function NetWorthHeader({ data, masked, onToggleMask, onSync, syncing }:
  { data:WealthSummary; masked:boolean; onToggleMask:()=>void; onSync:()=>void; syncing:boolean }) {
  const isPos = data.netWorth >= 0;

  return (
    <motion.div
      initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
      style={{
        borderRadius:28, marginBottom:24,
        position:"relative", overflow:"hidden",
        background:"linear-gradient(160deg,#080B14 0%,#0F1520 55%,#0D1117 100%)",
        border:"1px solid rgba(255,255,255,0.07)",
        boxShadow:`0 24px 64px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Aurora glows */}
      <div style={{ position:"absolute", top:-80, right:-40, width:320, height:320, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(108,116,255,0.12) 0%,transparent 70%)",
        animation:"w-aurora 8s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-60, left:60, width:200, height:200, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(13,220,155,0.08) 0%,transparent 70%)",
        animation:"w-aurora 10s ease-in-out infinite 2s", pointerEvents:"none" }} />
      {/* Border gradient */}
      <div style={{ position:"absolute", inset:0, borderRadius:"inherit", padding:1,
        background:"linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0),rgba(108,116,255,0.12))",
        WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite:"xor", maskComposite:"exclude", pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:2, padding:"28px 32px" }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:24 }}>
          <div>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase", fontFamily:SANS, marginBottom:8 }}>Net Worth</p>
            <motion.p
              key={String(masked)}
              initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              style={{ fontFamily:SYNE, fontSize:"clamp(32px,5vw,52px)", fontWeight:800,
                color:"#FAFAFA", letterSpacing:-2, lineHeight:1, marginBottom:12 }}
            >
              {fmtShort(data.netWorth, masked)}
            </motion.p>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:13, fontWeight:700,
                padding:"4px 12px", borderRadius:99,
                background: isPos ? "rgba(13,220,155,0.12)" : "rgba(255,92,103,0.12)",
                color: isPos ? GAIN : LOSS,
                border: `1px solid ${isPos ? "rgba(13,220,155,0.2)" : "rgba(255,92,103,0.2)"}` }}>
                {isPos ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                {fmtPct(data.totalPnlPct)} P&L
              </span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:SANS }}>
                {masked ? "•••• invested" : `${fmtShort(data.totalInvested)} invested`}
              </span>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12 }}>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onSync} disabled={syncing} className="w-btn">
                <RefreshCw size={13} style={{ animation: syncing ? "w-spin 1s linear infinite" : "none" }} />
                <span className="w-hide-sm">Sync All</span>
              </button>
              <button onClick={onToggleMask} className="w-btn">
                {masked ? <EyeOff size={13}/> : <Eye size={13}/>}
                <span className="w-hide-sm">{masked ? "Show" : "Hide"}</span>
              </button>
            </div>
            <div style={{ display:"flex", gap:18 }}>
              {[
                { label:"Assets",      value:data.totalAssets,      color:"rgba(255,255,255,0.9)" },
                { label:"Liabilities", value:data.totalLiabilities, color:LOSS },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"right" }}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:3, fontFamily:SANS }}>{s.label}</p>
                  <p style={{ fontFamily:MONO, fontSize:15, fontWeight:700, color:s.color }}>{fmtShort(s.value, masked)}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", fontFamily:SANS }}>
              Stocks {timeAgo(data.lastSynced.stocks)} · MF {timeAgo(data.lastSynced.mutualFunds)}
            </p>
          </div>
        </div>

        {/* Freedom bar */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:10, letterSpacing:1.5, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:SANS }}>
              Financial Freedom — {Math.round(data.financialFreedomPct)}%
            </span>
            <span style={{ fontFamily:MONO, fontSize:11, color:GAIN }}>D/A: {data.debtToAsset.toFixed(1)}%</span>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(data.financialFreedomPct,100)}%` }}
              transition={{ duration:1.6, ease:[0.16,1,0.3,1] }}
              style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,#047857,${GAIN})`,
                boxShadow:`0 0 10px rgba(13,220,155,0.3)` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Overview Tab ───────────────────────────────────────────── */
function OverviewTab({ data, masked }: { data:WealthSummary; masked:boolean }) {
  const pnlData = [
    { name:"Mutual Funds", pnl:data.mfSummary.totalPnl,    color:INDIGO },
    { name:"Stocks",       pnl:data.stockSummary.totalPnl,  color:AMBER },
  ];
  return (
    <div className="w-overview-grid">
      <WCard style={{ padding:24 }}>
        <p style={{ fontFamily:SYNE, fontWeight:700, fontSize:14, color:"var(--w-text0)", marginBottom:3 }}>Portfolio Allocation</p>
        <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS, marginBottom:16 }}>Total: {fmtShort(data.totalAssets, masked)}</p>
        {data.allocation.length === 0 ? (
          <EmptyState icon="📊" message="Add investments to see allocation" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.allocation} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                {data.allocation.map((s,i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v:any) => [fmtINR(v as number, masked),"Value"]}
                contentStyle={{ background:"var(--w-raised)", border:"1px solid var(--w-border)", borderRadius:12, fontSize:12, fontFamily:SANS }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, fontFamily:SANS }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </WCard>

      <WCard style={{ padding:24 }}>
        <p style={{ fontFamily:SYNE, fontWeight:700, fontSize:14, color:"var(--w-text0)", marginBottom:3 }}>P&L by Category</p>
        <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS, marginBottom:16 }}>Unrealised gain / loss</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pnlData} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill:"var(--w-text2)", fontSize:11, fontFamily:SANS }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v:any) => [fmtINR(v as number, masked),"P&L"]}
              contentStyle={{ background:"var(--w-raised)", border:"1px solid var(--w-border)", borderRadius:12, fontSize:12 }} />
            <Bar dataKey="pnl" radius={[6,6,0,0]}>
              {pnlData.map((d,i) => <Cell key={i} fill={d.pnl >= 0 ? GAIN : LOSS} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </WCard>

      <WCard style={{ padding:24, gridColumn:"span 2" }}>
        <p style={{ fontFamily:SYNE, fontWeight:700, fontSize:14, color:"var(--w-text0)", marginBottom:16 }}>Top 5 Performers</p>
        {data.top5Performers.length === 0 ? (
          <EmptyState icon="🏆" message="Add holdings to see your top performers" />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {data.top5Performers.map((h,i) => (
              <motion.div key={h.id}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.05 }}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 10px",
                  borderRadius:12, cursor:"default", transition:"background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background="var(--w-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
              >
                <span style={{ fontFamily:MONO, fontSize:12, color:"var(--w-text2)", width:18, textAlign:"center" }}>#{i+1}</span>
                <div style={{ width:34, height:34, borderRadius:9, flexShrink:0,
                  background: h.type==="MF" ? "rgba(108,116,255,0.1)" : "rgba(245,158,11,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
                  {h.type==="MF" ? "📈" : "📊"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:13, color:"var(--w-text0)", fontFamily:SANS,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.name}</p>
                  <span className="w-tag" style={{ background:"var(--w-raised2)", color:"var(--w-text2)" }}>{h.badge}</span>
                </div>
                <p style={{ fontFamily:MONO, fontSize:13, color:"var(--w-text1)", flexShrink:0 }}>{fmtShort(h.currentValue, masked)}</p>
                <span style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:h.pnl>=0?GAIN:LOSS, flexShrink:0, minWidth:68, textAlign:"right" }}>
                  {fmtPct(h.pnlPct)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </WCard>

      {data.debtToAsset > 30 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ gridColumn:"span 2", padding:"14px 20px", borderRadius:14,
            background:"rgba(255,92,103,0.07)", border:"1px solid rgba(255,92,103,0.18)",
            display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>💡</span>
          <p style={{ fontSize:13, color:"var(--w-text1)", lineHeight:1.55, fontFamily:SANS }}>
            Your debt-to-asset ratio is <strong style={{ color:LOSS }}>{data.debtToAsset.toFixed(1)}%</strong>.
            {" "}Financial advisors recommend keeping this below 30%.
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Stocks Tab ─────────────────────────────────────────────── */
function StocksTab({ data, masked }: { data:WealthSummary; masked:boolean }) {
  const deleteStock = useDeleteStock();
  const [showModal, setShowModal] = useState(false);
  const [filterEx, setFilterEx] = useState<"ALL"|"NSE"|"US"|"CRYPTO">("ALL");
  const filtered = data.stockHoldings.filter(h => filterEx==="ALL" || h.exchange===filterEx);

  return (
    <div>
      <div className="w-stat-grid">
        {[
          { label:"Invested", value:fmtShort(data.stockSummary.totalInvested,masked), icon:"💵", color:"var(--w-text0)" },
          { label:"Current",  value:fmtShort(data.stockSummary.totalCurrent,masked),  icon:"📊", color:"var(--w-text0)" },
          { label:"P&L",      value:fmtShort(data.stockSummary.totalPnl,masked),       icon: data.stockSummary.totalPnl>=0?"📈":"📉",
            color: data.stockSummary.totalPnl>=0?GAIN:LOSS },
          { label:"Holdings", value:String(data.stockSummary.holdingsCount), icon:"🗂️", color:INDIGO },
        ].map((s,i) => <StatCard key={s.label} {...s} delay={i*0.05} />)}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {(["ALL","NSE","US","CRYPTO"] as const).map(e => {
          const cfg = EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG];
          const active = filterEx === e;
          return (
            <button key={e} onClick={() => setFilterEx(e)} className="w-btn"
              style={{ background: active ? (e==="ALL"?INDIGO:cfg.color) : "var(--w-raised)",
                color: active ? "#fff" : "var(--w-text1)",
                borderColor: active ? "transparent" : "var(--w-border)" }}>
              {e==="ALL" ? "All" : `${cfg.emoji} ${cfg.label}`}
            </button>
          );
        })}
        <button className="w-btn w-btn-primary" style={{ marginLeft:"auto" }} onClick={() => setShowModal(true)}>
          <Plus size={13}/> Add Stock
        </button>
      </div>

      <WCard>
        {filtered.length === 0 ? (
          <EmptyState icon="📊" message="No stock holdings. Add NSE, US or crypto." action={() => setShowModal(true)} actionLabel="Add Holding" />
        ) : (
          filtered.map((h,i) => {
            const cfg = EXCHANGE_CFG[h.exchange as keyof typeof EXCHANGE_CFG];
            const isG = h.pnl >= 0;
            return (
              <motion.div key={h.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px",
                  borderBottom: i<filtered.length-1 ? "1px solid var(--w-border)" : "none",
                  transition:"background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background="var(--w-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
              >
                <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:`${cfg.color}18`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{cfg.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:13, color:"var(--w-text0)", fontFamily:SANS,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.companyName}</p>
                  <div style={{ display:"flex", gap:7, marginTop:3 }}>
                    <span className="w-tag" style={{ background:`${cfg.color}18`, color:cfg.color }}>{h.ticker}</span>
                    <span style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>×{h.quantity}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }} className="w-hide-sm">
                  <p style={{ fontFamily:MONO, fontSize:12, color:"var(--w-text1)" }}>{fmtINRPrecise(h.currentPrice,masked)}</p>
                  <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>avg {fmtINRPrecise(h.avgBuyPrice,masked)}</p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0, minWidth:80 }}>
                  <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:"var(--w-text0)" }}>{fmtShort(h.currentValue,masked)}</p>
                  <p style={{ fontFamily:MONO, fontSize:11, color:isG?GAIN:LOSS }}>{fmtPct(h.pnlPct)}</p>
                </div>
                <button className="w-btn w-btn-icon" onClick={() => deleteStock.mutate(h.id)}
                  style={{ border:"none", background:"transparent", color:LOSS }}>
                  <Trash2 size={13}/>
                </button>
              </motion.div>
            );
          })
        )}
      </WCard>
      <AnimatePresence>{showModal && <AddStockModal onClose={() => setShowModal(false)} />}</AnimatePresence>
    </div>
  );
}

/* ─── Mutual Funds Tab ───────────────────────────────────────── */
function MutualFundsTab({ data, masked }: { data:WealthSummary; masked:boolean }) {
  const deleteMF = useDeleteMFHolding();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [navPeriod, setNavPeriod] = useState<"1Y"|"3Y"|"5Y">("1Y");
  const [filterType, setFilterType] = useState<"all"|"lumpsum"|"sip">("all");
  const filtered = data.mfHoldings.filter(h => filterType==="all" ? true : filterType==="sip" ? h.isSIP : !h.isSIP);

  return (
    <div>
      <div className="w-stat-grid">
        {[
          { label:"Invested", value:fmtShort(data.mfSummary.totalInvested,masked), icon:"💵", color:"var(--w-text0)" },
          { label:"Current",  value:fmtShort(data.mfSummary.totalCurrent,masked),  icon:"📊", color:"var(--w-text0)" },
          { label:"P&L",      value:fmtShort(data.mfSummary.totalPnl,masked),       icon: data.mfSummary.totalPnl>=0?"📈":"📉",
            color: data.mfSummary.totalPnl>=0?GAIN:LOSS },
          { label:"Schemes",  value:String(data.mfSummary.holdingsCount), icon:"📑", color:INDIGO },
        ].map((s,i) => <StatCard key={s.label} {...s} delay={i*0.05} />)}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {(["all","lumpsum","sip"] as const).map(f => (
          <button key={f} onClick={() => setFilterType(f)} className="w-btn"
            style={{ background: filterType===f ? INDIGO : "var(--w-raised)",
              color: filterType===f ? "#fff" : "var(--w-text1)",
              borderColor: filterType===f ? "transparent" : "var(--w-border)" }}>
            {f==="all"?"All": f==="sip"?"🔄 SIP":"💰 Lumpsum"}
          </button>
        ))}
        <button className="w-btn w-btn-primary" style={{ marginLeft:"auto" }} onClick={() => setShowModal(true)}>
          <Plus size={13}/> Add Fund
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📈" message="No mutual fund holdings." action={() => setShowModal(true)} actionLabel="Add Fund" />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map((h,i) => {
            const isG = h.pnl >= 0;
            const expanded = expandedId === h.id;
            return (
              <motion.div key={h.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                <WCard style={{ padding:20 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
                      background:"rgba(108,116,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>
                      {h.isSIP ? "🔄" : "📈"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:"var(--w-text0)", fontFamily:SANS, marginBottom:5 }}>{h.schemeName}</p>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <span className="w-tag" style={{ background:"rgba(108,116,255,0.1)", color:INDIGO }}>{h.category}</span>
                        {h.isSIP && <span className="w-tag" style={{ background:"rgba(13,220,155,0.1)", color:GAIN }}>
                          SIP ₹{(h.sipAmount??0).toLocaleString("en-IN")}/mo</span>}
                        {h.nextSipDate && <span style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS }}>Next: {h.nextSipDate}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:"var(--w-text0)" }}>{fmtShort(h.currentValue,masked)}</p>
                        <p style={{ fontFamily:MONO, fontSize:11, color:isG?GAIN:LOSS }}>{fmtPct(h.pnlPct)}</p>
                      </div>
                      <button className="w-btn w-btn-icon" onClick={() => setExpandedId(expanded?null:h.id)}
                        style={{ border:"1px solid var(--w-border)" }}>
                        <ChevronDown size={13} style={{ transform:expanded?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
                      </button>
                      <button className="w-btn w-btn-icon" onClick={() => deleteMF.mutate(h.id)}
                        style={{ border:"none", background:"transparent", color:LOSS }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:14 }} className="w-2col">
                    {[
                      { l:"Invested", v:fmtShort(h.investedAmount,masked) },
                      { l:"Current",  v:fmtShort(h.currentValue,masked) },
                      { l:"P&L",      v:`${h.pnl>=0?"+":""}${fmtShort(h.pnl,masked)}`, c:isG?GAIN:LOSS },
                      { l:"NAV",      v:fmtINRPrecise(h.currentNAV,masked) },
                    ].map(s => (
                      <div key={s.l} style={{ padding:"8px 10px", borderRadius:8, background:"var(--w-raised2)", textAlign:"center" }}>
                        <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS, marginBottom:2 }}>{s.l}</p>
                        <p style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:(s as any).c??"var(--w-text0)" }}>{s.v}</p>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}>
                        <MiniNavChart schemeCode={h.schemeCode} period={navPeriod} onPeriodChange={setNavPeriod} masked={masked} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </WCard>
              </motion.div>
            );
          })}
        </div>
      )}
      <AnimatePresence>{showModal && <AddMFModal onClose={() => setShowModal(false)} />}</AnimatePresence>
    </div>
  );
}

function MiniNavChart({ schemeCode, period, onPeriodChange, masked }:
  { schemeCode:string; period:"1Y"|"3Y"|"5Y"; onPeriodChange:(p:"1Y"|"3Y"|"5Y")=>void; masked:boolean }) {
  const { data=[], isLoading } = useMFNavHistory(schemeCode, period);
  return (
    <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--w-border)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--w-text2)", fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.8px" }}>NAV History</p>
        <div style={{ display:"flex", gap:5 }}>
          {(["1Y","3Y","5Y"] as const).map(p => (
            <button key={p} onClick={() => onPeriodChange(p)} className="w-btn"
              style={{ padding:"3px 9px", fontSize:10, background: period===p?INDIGO:"var(--w-raised2)",
                color: period===p?"#fff":"var(--w-text2)", borderColor: period===p?"transparent":"var(--w-border)" }}>
              {p}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div style={{ height:100, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--w-text2)" }}>
          <Loader2 size={16} style={{ animation:"w-spin 1s linear infinite" }}/>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={data} margin={{ top:4, right:0, left:0, bottom:0 }}>
            <defs>
              <linearGradient id={`ng-${schemeCode}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INDIGO} stopOpacity={0.25}/>
                <stop offset="100%" stopColor={INDIGO} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-border)" vertical={false}/>
            <XAxis dataKey="date" tick={{ fill:"var(--w-text2)", fontSize:9, fontFamily:SANS }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
            <YAxis hide domain={["auto","auto"]}/>
            <Tooltip formatter={(v:any) => [fmtINRPrecise(v as number, masked),"NAV"]}
              contentStyle={{ background:"var(--w-raised)", border:"1px solid var(--w-border)", borderRadius:10, fontSize:11 }}/>
            <Area type="monotone" dataKey="nav" stroke={INDIGO} strokeWidth={2}
              fill={`url(#ng-${schemeCode})`} dot={false} activeDot={{ r:3, fill:INDIGO }}/>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ─── Assets Tab ─────────────────────────────────────────────── */
const ASSET_EMOJI: Record<string,string> = {
  Property:"🏠","Fixed Deposit":"🏦",Gold:"🪙",Vehicle:"🚗","Mutual Fund":"📈",Stock:"📊",Crypto:"₿",Other:"💼"
};

function AssetsTab({ data, masked }: { data:WealthSummary; masked:boolean }) {
  const deleteAsset = useDeleteAsset();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ fontFamily:SYNE, fontWeight:700, fontSize:16, color:"var(--w-text0)" }}>Manual Assets</p>
          <p style={{ fontSize:12, color:"var(--w-text2)", fontFamily:SANS, marginTop:3 }}>
            Total: <span style={{ fontFamily:MONO, fontWeight:700, color:GAIN }}>{fmtShort(data.manualAssetsValue,masked)}</span>
          </p>
        </div>
        <button className="w-btn w-btn-primary" onClick={() => setShowModal(true)}><Plus size={13}/> Add Asset</button>
      </div>

      {data.assets.length === 0 ? (
        <EmptyState icon="🏠" message="Add property, FD, gold, or vehicles." action={() => setShowModal(true)} actionLabel="Add Asset"/>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:16 }} className="w-asset-grid">
          {data.assets.map((a,i) => (
            <motion.div key={a.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
              <WCard style={{ padding:20 }}>
                {/* Accent strip */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
                  background:`linear-gradient(90deg,${GAIN},rgba(13,220,155,0.3))` }}/>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:"rgba(13,220,155,0.1)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                      {ASSET_EMOJI[a.type]??"💼"}
                    </div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:14, color:"var(--w-text0)", fontFamily:SANS }}>{a.name}</p>
                      <span className="w-tag" style={{ background:"rgba(13,220,155,0.1)", color:GAIN }}>{a.type}</span>
                    </div>
                  </div>
                  <button className="w-btn w-btn-icon" onClick={() => deleteAsset.mutate(a.id)}
                    style={{ border:"none", background:"transparent", color:LOSS }}>
                    <Trash2 size={12}/>
                  </button>
                </div>
                <p style={{ fontFamily:MONO, fontSize:22, fontWeight:800, color:"var(--w-text0)", letterSpacing:-0.5 }}>
                  {masked ? "₹ ••••••" : fmtINR(a.currentValueInCents/100)}
                </p>
                {a.ticker && <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS, marginTop:5 }}>
                  {a.ticker} · Qty: {a.quantity}</p>}
              </WCard>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>{showModal && <AddAssetModal onClose={() => setShowModal(false)}/>}</AnimatePresence>
    </div>
  );
}

/* ─── Liabilities Tab ────────────────────────────────────────── */
const LIAB_EMOJI: Record<string,string> = {
  "Home Loan":"🏠","Car Loan":"🚗","Personal Loan":"💳","Education Loan":"🎓","Credit Card":"💳","Other":"📋"
};

function LiabilitiesTab({ data, masked }: { data:WealthSummary; masked:boolean }) {
  const deleteLiability = useDeleteLiability();
  const [showModal, setShowModal] = useState(false);
  const sorted = [...data.liabilities].sort((a,b) => b.interestRate - a.interestRate);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ fontFamily:SYNE, fontWeight:700, fontSize:16, color:"var(--w-text0)" }}>Liabilities</p>
          <p style={{ fontSize:12, color:"var(--w-text2)", fontFamily:SANS, marginTop:3 }}>
            Total: <span style={{ fontFamily:MONO, fontWeight:700, color:LOSS }}>{fmtShort(data.totalLiabilities,masked)}</span>
            {" "}· D/A: <strong style={{ color:"var(--w-text1)" }}>{data.debtToAsset.toFixed(1)}%</strong>
          </p>
        </div>
        <button className="w-btn w-btn-primary" onClick={() => setShowModal(true)}><Plus size={13}/> Add Loan</button>
      </div>

      {/* Freedom progress card */}
      <WCard style={{ padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <p style={{ fontWeight:700, fontSize:13, color:"var(--w-text0)", fontFamily:SANS }}>Financial Freedom Progress</p>
          <p style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:GAIN }}>{data.financialFreedomPct.toFixed(1)}%</p>
        </div>
        <div className="w-prog-track" style={{ height:8 }}>
          <motion.div initial={{ width:0 }} animate={{ width:`${data.financialFreedomPct}%` }}
            transition={{ duration:1.3, ease:[0.16,1,0.3,1] }}
            style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,#047857,${GAIN})` }}/>
        </div>
        <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS, marginTop:8 }}>100% = fully debt-free.</p>
      </WCard>

      {sorted.length === 0 ? (
        <EmptyState icon="🎉" message="No liabilities! You're debt-free." />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {sorted.map((l,i) => {
            const repaidPct = l.totalPrincipalInCents > 0
              ? ((l.totalPrincipalInCents - l.remainingBalanceInCents) / l.totalPrincipalInCents) * 100 : 0;
            const rateColor = l.interestRate > 10 ? LOSS : l.interestRate > 6 ? AMBER : GAIN;
            return (
              <motion.div key={l.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                <WCard style={{ padding:22 }}>
                  {/* Rate-color accent strip */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
                    background:`linear-gradient(90deg,${rateColor},${rateColor}40)` }}/>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:16 }}>
                    <div style={{ width:42, height:42, borderRadius:11, flexShrink:0,
                      background:"rgba(255,92,103,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                      {LIAB_EMOJI[l.category]??"📋"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:14, color:"var(--w-text0)", fontFamily:SANS, marginBottom:5 }}>{l.loanName}</p>
                      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                        <span className="w-tag" style={{ background:"rgba(255,92,103,0.1)", color:LOSS }}>{l.category}</span>
                        <span className="w-tag" style={{ background:`${rateColor}18`, color:rateColor }}>{l.interestRate}% p.a.</span>
                        {l.dueDate && <span style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS }}>EMI due: {l.dueDate}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontFamily:MONO, fontSize:18, fontWeight:800, color:LOSS }}>
                        {masked?"₹ ••••••":fmtShort(l.remainingBalanceInCents/100)}
                      </p>
                      <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>
                        of {masked?"₹ ••••":fmtShort(l.totalPrincipalInCents/100)}
                      </p>
                    </div>
                    <button className="w-btn w-btn-icon" onClick={() => deleteLiability.mutate(l.id)}
                      style={{ border:"none", background:"transparent", color:LOSS }}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>Repaid</span>
                      <span style={{ fontFamily:MONO, fontSize:11, color:GAIN, fontWeight:700 }}>{repaidPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-prog-track">
                      <motion.div initial={{ width:0 }} animate={{ width:`${repaidPct}%` }}
                        transition={{ duration:0.9, delay:i*0.06+0.2, ease:[0.16,1,0.3,1] }}
                        style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,#047857,${GAIN})` }}/>
                    </div>
                  </div>
                  {l.emiInCents && (
                    <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS, marginTop:10 }}>
                      EMI: <span style={{ fontFamily:MONO, fontWeight:700, color:"var(--w-text1)" }}>
                        {masked?"••••":fmtINR(l.emiInCents/100)}
                      </span>/mo
                    </p>
                  )}
                </WCard>
              </motion.div>
            );
          })}
        </div>
      )}
      <AnimatePresence>{showModal && <AddLiabilityModal onClose={() => setShowModal(false)}/>}</AnimatePresence>
    </div>
  );
}

/* ─── Insurance Tab ──────────────────────────────────────────── */
function InsuranceTab({ data, masked }: { data:WealthSummary; masked:boolean }) {
  const deletePolicy = useDeleteInsurance();
  const payPremium = usePayPremium();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");

  const policies: InsurancePolicy[] = (data as any).insurancePolicies ?? [];
  const hlv = (data as any).hlvMetrics ?? null;
  const totalCoverage = policies.reduce((s,p) => s+(p.sumInsured??0), 0);
  const termPolicies  = policies.filter(p => p.type==="TERM_LIFE");
  const termCoverage  = termPolicies.reduce((s,p) => s+(p.sumInsured??0), 0);
  const annualPremium = policies.reduce((s,p) => {
    const amt = p.premiumAmount??0;
    const f = (p.frequency??"").toLowerCase();
    return s + (f==="monthly"?amt*12:f==="quarterly"?amt*4:f==="semi_annual"?amt*2:amt);
  }, 0);
  const urgentRenewals = policies.filter(p => { const d=daysUntil(p.nextDueDate); return d>=0&&d<=30; });
  const recommended    = hlv?.requiredCoverage ?? 0;
  const coverageRatio  = recommended > 0 ? Math.min((termCoverage/recommended)*100, 120) : null;
  const coverageGap    = recommended > 0 ? Math.max(recommended-termCoverage, 0) : 0;
  const filtered       = selectedType==="ALL" ? policies : policies.filter(p => p.type===selectedType);

  return (
    <div>
      <div className="w-stat-grid">
        {[
          { label:"Total Coverage", value:fmtShort(totalCoverage,masked), icon:"🛡️", color:INDIGO },
          { label:"Annual Premium", value:fmtShort(annualPremium,masked),  icon:"💳", color:LOSS },
          { label:"Term Coverage",  value:fmtShort(termCoverage,masked),   icon:"📋", color:GAIN },
          { label:"Renewals Due",   value:String(urgentRenewals.length),
            icon: urgentRenewals.length>0?"⚠️":"✅",
            color: urgentRenewals.length>0 ? AMBER : GAIN },
        ].map((s,i) => <StatCard key={s.label} {...s} delay={i*0.05}/>)}
      </div>

      {/* HLV Shield */}
      {recommended > 0 && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          style={{ marginBottom:20, borderRadius:18, overflow:"hidden", position:"relative",
            background: coverageGap>0 ? "rgba(255,92,103,0.06)" : "rgba(13,220,155,0.06)",
            border:`1px solid ${coverageGap>0?"rgba(255,92,103,0.2)":"rgba(13,220,155,0.2)"}`,
            padding:"20px 24px" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
            background:`linear-gradient(90deg,${coverageGap>0?LOSS:GAIN},transparent)` }}/>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:22 }}>{coverageGap>0?"⚠️":"✅"}</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:"var(--w-text0)", fontFamily:SYNE, marginBottom:2 }}>
                    {coverageGap>0?"Coverage Gap Detected":"Protection Goal Met"}
                  </p>
                  <p style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>HLV-based life insurance analysis</p>
                </div>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>Coverage vs Recommended</span>
                  <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:coverageGap>0?LOSS:GAIN }}>
                    {coverageRatio?.toFixed(0)??0}%
                  </span>
                </div>
                <div className="w-prog-track" style={{ height:8 }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(coverageRatio??0,100)}%` }}
                    transition={{ duration:1, ease:[0.16,1,0.3,1] }}
                    style={{ height:"100%", borderRadius:99,
                      background: coverageGap>0?`linear-gradient(90deg,${LOSS},#f87171)`:`linear-gradient(90deg,#047857,${GAIN})` }}/>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
              {[
                { label:"You Have",    value:fmtShort(termCoverage,masked),   color:"var(--w-text0)" },
                { label:"Recommended", value:fmtShort(recommended,masked),    color:"var(--w-text1)" },
                ...(coverageGap>0?[{ label:"Gap", value:fmtShort(coverageGap,masked), color:LOSS }]:[]),
              ].map(s => (
                <div key={s.label} style={{ textAlign:"right" }}>
                  <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS, marginBottom:3 }}>{s.label}</p>
                  <p style={{ fontFamily:MONO, fontSize:14, fontWeight:700, color:s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Urgent renewals */}
      <AnimatePresence>
        {urgentRenewals.length > 0 && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ marginBottom:16, padding:"12px 18px", borderRadius:14,
              background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)",
              display:"flex", alignItems:"center", gap:12 }}>
            <Clock size={15} style={{ color:AMBER, flexShrink:0 }}/>
            <p style={{ fontSize:13, color:"var(--w-text1)", fontFamily:SANS, lineHeight:1.5 }}>
              <strong style={{ color:"var(--w-text0)" }}>{urgentRenewals.length} renewal{urgentRenewals.length>1?"s":""} due soon: </strong>
              {urgentRenewals.map(p => { const d=daysUntil(p.nextDueDate); return `${p.policyName} (${d===0?"today":`${d}d`})`; }).join(" · ")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter + add */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        {(["ALL","TERM_LIFE","HEALTH","MOTOR","HOME"] as const).map(t => {
          const meta = t==="ALL" ? null : POLICY_META[t];
          const active = selectedType===t;
          return (
            <button key={t} onClick={() => setSelectedType(t)} className="w-btn"
              style={{ background: active?(meta?.color??INDIGO):"var(--w-raised)",
                color: active?"#fff":"var(--w-text1)",
                borderColor: active?"transparent":"var(--w-border)" }}>
              {meta ? `${meta.icon} ${meta.label}` : "All Policies"}
            </button>
          );
        })}
        <button className="w-btn w-btn-primary" style={{ marginLeft:"auto" }} onClick={() => setShowModal(true)}>
          <Plus size={13}/> Add Policy
        </button>
      </div>

      {/* Policy cards */}
      {filtered.length === 0 ? (
        <EmptyState icon="🛡️" message={policies.length===0?"No insurance policies. Protect your wealth!":"No policies match this filter."}
          action={policies.length===0?()=>setShowModal(true):undefined} actionLabel="Add Policy"/>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }} className="w-ins-grid">
          {filtered.map((p,i) => {
            const meta = POLICY_META[p.type] ?? { icon:"📋", color:INDIGO, bg:"rgba(108,116,255,0.08)", label:p.type };
            const days = daysUntil(p.nextDueDate);
            const overdue = days < 0;
            const urgent  = !overdue && days <= 7;
            const soon    = !overdue && days <= 30;
            const dueColor = overdue||urgent ? LOSS : soon ? AMBER : "var(--w-text2)";
            const dueBg    = overdue||urgent ? "rgba(255,92,103,0.08)" : soon ? "rgba(245,158,11,0.08)" : "var(--w-raised2)";

            return (
              <motion.div key={p.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                <WCard style={{ padding:0, display:"flex", flexDirection:"column" }}>
                  {/* Header strip */}
                  <div style={{ height:4, background:meta.color, opacity:0.9 }}/>
                  <div style={{ padding:"18px 20px", flex:1, display:"flex", flexDirection:"column" }}>
                    {/* Top */}
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:44, height:44, borderRadius:13, background:meta.bg,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                          {meta.icon}
                        </div>
                        <div>
                          <p style={{ fontWeight:700, fontSize:14, color:"var(--w-text0)", fontFamily:SANS, lineHeight:1.25, marginBottom:4 }}>{p.policyName}</p>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span className="w-tag" style={{ background:meta.bg, color:meta.color }}>{meta.label}</span>
                            <span style={{ fontSize:11, color:"var(--w-text2)", fontFamily:SANS }}>{p.provider}</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-btn w-btn-icon" onClick={() => deletePolicy.mutate(p.id)}
                        style={{ border:"none", background:"transparent", color:LOSS }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>

                    {/* Sum insured */}
                    <div style={{ marginBottom:16 }}>
                      <p style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, color:"var(--w-text2)",
                        textTransform:"uppercase", fontFamily:SANS, marginBottom:4 }}>Sum Insured</p>
                      <p style={{ fontFamily:MONO, fontSize:24, fontWeight:800, color:"var(--w-text0)", letterSpacing:-0.5 }}>
                        {masked?"₹ ••••••••":fmtINR(p.sumInsured)}
                      </p>
                    </div>

                    {/* Stats 2-col */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                      <div style={{ padding:"10px 12px", borderRadius:10, background:"var(--w-raised2)" }}>
                        <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS, marginBottom:3 }}>Premium</p>
                        <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:LOSS }}>{masked?"••••":fmtINR(p.premiumAmount)}</p>
                        <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS }}>{p.frequency?.toLowerCase?.()}</p>
                      </div>
                      <div style={{ padding:"10px 12px", borderRadius:10, background:dueBg }}>
                        <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS, marginBottom:3 }}>Next Due</p>
                        <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color:dueColor }}>
                          {overdue?"Overdue":days===0?"Today":`${days}d`}
                        </p>
                        <p style={{ fontSize:10, color:"var(--w-text2)", fontFamily:SANS }}>
                          {new Date(p.nextDueDate).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div style={{ marginTop:"auto" }}>
                      <motion.button whileHover={{ scale:1.015 }} whileTap={{ scale:0.985 }}
                        onClick={() => payPremium.mutate(p.id)}
                        disabled={payPremium.isPending}
                        style={{
                          width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                          padding:"10px 16px", borderRadius:11, border:"none", cursor:"pointer",
                          background: overdue||urgent ? `linear-gradient(135deg,${LOSS},#e87c6a)` :
                                      soon ? "linear-gradient(135deg,#f59e0b,#fbbf24)" :
                                      "var(--w-raised2)",
                          color: (overdue||urgent||soon) ? "#fff" : "var(--w-text1)",
                          fontSize:13, fontWeight:700, fontFamily:SANS,
                          boxShadow: overdue||urgent ? `0 4px 16px ${LOSS}40` : soon ? "0 4px 16px rgba(245,158,11,0.3)" : "none",
                          transition:"all 0.2s",
                        }}>
                        {payPremium.isPending ? (
                          <><Loader2 size={13} style={{ animation:"w-spin 1s linear infinite" }}/> Processing…</>
                        ) : (
                          <><CheckCircle2 size={13}/> {overdue||soon?"Mark Premium as Paid":"Mark as Paid"}</>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </WCard>
              </motion.div>
            );
          })}
        </div>
      )}
      <AnimatePresence>{showModal && <AddInsuranceModal onClose={() => setShowModal(false)}/>}</AnimatePresence>
    </div>
  );
}

/* ─── Modals ─────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <motion.div className="w-modal-backdrop"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div className="w-modal-box"
        initial={{ opacity:0, scale:0.96, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.96, y:20 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ fontFamily:SYNE, fontWeight:700, fontSize:18, color:"var(--w-text0)" }}>{title}</h2>
          <button className="w-btn w-btn-icon" onClick={onClose} style={{ border:"none" }}><X size={15}/></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function SearchDropdown({ label, query, setQuery, results, onSelect }:
  { label:string; query:string; setQuery:(v:string)=>void;
    results:{key:string;primary:string;secondary:string}[];
    onSelect:(r:{key:string;primary:string;secondary:string})=>void }) {
  return (
    <div>
      <label className="w-label">{label}</label>
      <div style={{ position:"relative" }}>
        <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--w-text2)" }}/>
        <input className="w-input" style={{ paddingLeft:34 }} placeholder="Type to search…"
          value={query} onChange={e => setQuery(e.target.value)}/>
      </div>
      {results.length > 0 && (
        <div style={{ border:"1px solid var(--w-border)", borderRadius:12, marginTop:4,
          maxHeight:156, overflowY:"auto", background:"var(--w-surface)", zIndex:10, position:"relative" }}>
          {results.map(r => (
            <button key={r.key} onClick={() => onSelect(r)}
              style={{ display:"block", width:"100%", padding:"9px 14px", textAlign:"left",
                background:"none", border:"none", borderBottom:"1px solid var(--w-border)",
                cursor:"pointer", fontSize:13, fontFamily:SANS, color:"var(--w-text0)", transition:"background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background="var(--w-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background="none")}>
              <span style={{ fontWeight:600 }}>{r.primary}</span>
              <span style={{ color:"var(--w-text2)", marginLeft:8, fontSize:11 }}>{r.secondary}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type="text", placeholder="" }:
  { label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string }) {
  return (
    <div>
      <label className="w-label">{label}</label>
      <input className="w-input" type={type} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}

function ModalActions({ onClose, onSubmit, disabled, loading, label }:
  { onClose:()=>void; onSubmit:()=>void; disabled:boolean; loading:boolean; label:string }) {
  return (
    <div style={{ display:"flex", gap:10, marginTop:22 }}>
      <button className="w-btn" style={{ flex:1, justifyContent:"center" }} onClick={onClose}>Cancel</button>
      <motion.button whileHover={!disabled?{ scale:1.02 }:{}} whileTap={!disabled?{ scale:0.98 }:{}}
        className="w-btn w-btn-primary" style={{ flex:2, justifyContent:"center" }}
        onClick={onSubmit} disabled={disabled||loading}>
        {loading ? "Saving…" : label}
      </motion.button>
    </div>
  );
}

function AddStockModal({ onClose }: { onClose:()=>void }) {
  const [exchange, setExchange] = useState<"NSE"|"US"|"CRYPTO">("NSE");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<{ticker:string;name:string}|null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const { data: results=[] } = useStockSearch(searchQ, exchange);
  const addStock = useAddStock();

  return (
    <Modal title="Add Stock / Crypto" onClose={onClose}>
      <div style={{ display:"flex", gap:7, marginBottom:16 }}>
        {(["NSE","US","CRYPTO"] as const).map(e => (
          <button key={e} onClick={() => { setExchange(e); setSearchQ(""); setSelected(null); }}
            className="w-btn" style={{ flex:1, justifyContent:"center",
              background: exchange===e ? EXCHANGE_CFG[e].color : "var(--w-raised)",
              color: exchange===e?"#fff":"var(--w-text1)", borderColor: exchange===e?"transparent":"var(--w-border)" }}>
            {EXCHANGE_CFG[e].emoji} {EXCHANGE_CFG[e].label}
          </button>
        ))}
      </div>
      <SearchDropdown label={`Search ${EXCHANGE_CFG[exchange].label}`} query={searchQ} setQuery={setSearchQ}
        results={(results??[]).filter(Boolean).map((r:any) => ({
          key: r.ticker??r.symbol??"", primary: r.ticker??r.symbol??"",
          secondary: r.name??r.companyName??r.schemeName??"" }))}
        onSelect={r => { setSelected({ ticker:r.key, name:r.secondary||r.key }); setSearchQ(r.secondary||r.key); }}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
        <FormField label="Quantity" value={qty} onChange={setQty} type="number" placeholder="10"/>
        <FormField label="Avg Buy Price (₹)" value={price} onChange={setPrice} type="number" placeholder="1500.00"/>
      </div>
      {selected && (
        <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8, background:"var(--w-raised2)",
          display:"flex", alignItems:"center", gap:8 }}>
          <CheckCircle2 size={13} style={{ color:GAIN }}/>
          <span style={{ fontSize:12, color:"var(--w-text1)", fontFamily:SANS }}>
            <strong style={{ color:"var(--w-text0)" }}>{selected.ticker}</strong>
            {selected.name&&selected.name!==selected.ticker&&` — ${selected.name}`}
          </span>
        </div>
      )}
      <ModalActions onClose={onClose}
        onSubmit={() => { if(!selected||!qty||!price) return;
          addStock.mutate({ ticker:selected.ticker, exchange, companyName:selected.name,
            quantity:parseFloat(qty), avgBuyPrice:parseFloat(price) }, { onSuccess:onClose }); }}
        disabled={selected===null||!qty||!price||isNaN(parseFloat(qty))||isNaN(parseFloat(price))}
        loading={addStock.isPending} label="Add Stock"/>
    </Modal>
  );
}

function AddMFModal({ onClose }: { onClose:()=>void }) {
  const [mode, setMode] = useState<"lumpsum"|"sip">("lumpsum");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<{schemeCode:string;schemeName:string}|null>(null);
  const [f, setF] = useState({ units:"", avgNAV:"", investedAt:new Date().toISOString().split("T")[0],
    sipAmount:"", sipDay:"5", sipStartDate:new Date().toISOString().split("T")[0] });
  const { data: results=[] } = useMFSearch(searchQ);
  const addLumpsum = useAddMFLumpsum();
  const addSip = useAddMFSip();
  const fld = (k:string) => (v:string) => setF(p => ({...p,[k]:v}));

  return (
    <Modal title="Add Mutual Fund" onClose={onClose}>
      <div style={{ display:"flex", gap:7, marginBottom:16 }}>
        {(["lumpsum","sip"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className="w-btn"
            style={{ flex:1, justifyContent:"center", background:mode===m?INDIGO:"var(--w-raised)",
              color:mode===m?"#fff":"var(--w-text1)", borderColor:mode===m?"transparent":"var(--w-border)" }}>
            {m==="lumpsum"?"💰 Lumpsum":"🔄 SIP"}
          </button>
        ))}
      </div>
      <SearchDropdown label="Search Scheme" query={searchQ} setQuery={setSearchQ}
        results={(results||[]).filter(Boolean).map((r:any) => ({ key:r.schemeCode, primary:r.schemeName, secondary:`#${r.schemeCode}` }))}
        onSelect={r => { setSelected({ schemeCode:r.key, schemeName:r.primary }); setSearchQ(r.primary); }}/>
      {mode==="lumpsum" ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
          <FormField label="Units" value={f.units} onChange={fld("units")} type="number" placeholder="100.000"/>
          <FormField label="Avg NAV (₹)" value={f.avgNAV} onChange={fld("avgNAV")} type="number" placeholder="45.50"/>
          <div style={{ gridColumn:"span 2" }}>
            <FormField label="Investment Date" value={f.investedAt} onChange={fld("investedAt")} type="date"/>
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
          <FormField label="Monthly SIP (₹)" value={f.sipAmount} onChange={fld("sipAmount")} type="number" placeholder="5000"/>
          <FormField label="SIP Day (1-28)" value={f.sipDay} onChange={fld("sipDay")} type="number" placeholder="5"/>
          <div style={{ gridColumn:"span 2" }}>
            <FormField label="Start Date" value={f.sipStartDate} onChange={fld("sipStartDate")} type="date"/>
          </div>
        </div>
      )}
      <ModalActions onClose={onClose}
        onSubmit={() => { if(!selected) return;
          if(mode==="lumpsum") addLumpsum.mutate({ schemeCode:selected.schemeCode, schemeName:selected.schemeName,
            units:parseFloat(f.units), avgNAV:parseFloat(f.avgNAV), investedAt:f.investedAt }, { onSuccess:onClose });
          else addSip.mutate({ schemeCode:selected.schemeCode, schemeName:selected.schemeName,
            sipAmount:parseFloat(f.sipAmount), sipDay:parseInt(f.sipDay), sipStartDate:f.sipStartDate }, { onSuccess:onClose }); }}
        disabled={!selected||(mode==="lumpsum"?!f.units||!f.avgNAV:!f.sipAmount)}
        loading={addLumpsum.isPending||addSip.isPending} label={mode==="sip"?"Add SIP":"Add Holding"}/>
    </Modal>
  );
}

function AddAssetModal({ onClose }: { onClose:()=>void }) {
  const [f, setF] = useState({ name:"", type:"Property", currentValue:"" });
  const addAsset = useAddAsset();
  return (
    <Modal title="Add Manual Asset" onClose={onClose}>
      <FormField label="Asset Name" value={f.name} onChange={v => setF(p=>({...p,name:v}))} placeholder="e.g. Mumbai Apartment"/>
      <div style={{ marginTop:14 }}>
        <label className="w-label">Type</label>
        <select className="w-input" value={f.type} onChange={e => setF(p=>({...p,type:e.target.value}))}>
          {["Property","Fixed Deposit","Gold","Vehicle","Other"].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginTop:14 }}>
        <FormField label="Current Value (₹)" value={f.currentValue} onChange={v => setF(p=>({...p,currentValue:v}))} type="number" placeholder="5000000"/>
      </div>
      <ModalActions onClose={onClose} onSubmit={() => addAsset.mutate({
        name:f.name, type:f.type, currentValueInCents:Math.round(parseFloat(f.currentValue)*100)
      },{ onSuccess:onClose })} disabled={!f.name||!f.currentValue} loading={addAsset.isPending} label="Add Asset"/>
    </Modal>
  );
}

function AddLiabilityModal({ onClose }: { onClose:()=>void }) {
  const [f, setF] = useState({ loanName:"", category:"Home Loan", totalPrincipal:"",
    remainingBalance:"", interestRate:"", emi:"", dueDate:"" });
  const addLiability = useAddLiability();
  const fld = (k:string) => (v:string) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title="Add Liability" onClose={onClose}>
      <FormField label="Loan Name" value={f.loanName} onChange={fld("loanName")} placeholder="e.g. SBI Home Loan"/>
      <div style={{ marginTop:14 }}>
        <label className="w-label">Category</label>
        <select className="w-input" value={f.category} onChange={e => setF(p=>({...p,category:e.target.value}))}>
          {LIABILITY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
        <FormField label="Total Principal (₹)" value={f.totalPrincipal} onChange={fld("totalPrincipal")} type="number" placeholder="2000000"/>
        <FormField label="Remaining Balance (₹)" value={f.remainingBalance} onChange={fld("remainingBalance")} type="number" placeholder="1500000"/>
        <FormField label="Interest Rate (%)" value={f.interestRate} onChange={fld("interestRate")} type="number" placeholder="8.5"/>
        <FormField label="Monthly EMI (₹) — optional" value={f.emi} onChange={fld("emi")} type="number" placeholder="18000"/>
        <div style={{ gridColumn:"span 2" }}>
          <FormField label="Next EMI Due Date — optional" value={f.dueDate} onChange={fld("dueDate")} type="date"/>
        </div>
      </div>
      <ModalActions onClose={onClose} onSubmit={() => addLiability.mutate({
        loanName:f.loanName, category:f.category as any,
        totalPrincipalInCents:Math.round(parseFloat(f.totalPrincipal)*100),
        remainingBalanceInCents:Math.round(parseFloat(f.remainingBalance)*100),
        interestRate:parseFloat(f.interestRate),
        emiInCents:f.emi?Math.round(parseFloat(f.emi)*100):undefined,
        dueDate:f.dueDate||undefined },{ onSuccess:onClose })}
        disabled={!f.loanName||!f.totalPrincipal||!f.remainingBalance||!f.interestRate}
        loading={addLiability.isPending} label="Add Liability"/>
    </Modal>
  );
}

function AddInsuranceModal({ onClose }: { onClose:()=>void }) {
  const [f, setF] = useState({ policyName:"", provider:"", type:"TERM_LIFE",
    sumInsured:"", premiumAmount:"", frequency:"ANNUAL", startDate:new Date().toISOString().split("T")[0] });
  const addPolicy = useAddInsurance();
  const fld = (k:string) => (v:string) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title="Add Insurance Policy" onClose={onClose}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ gridColumn:"span 2" }}>
          <FormField label="Policy Name" value={f.policyName} onChange={fld("policyName")} placeholder="e.g. Max Life Term Plan"/>
        </div>
        <FormField label="Provider" value={f.provider} onChange={fld("provider")} placeholder="e.g. Max Life"/>
        <div>
          <label className="w-label">Type</label>
          <select className="w-input" value={f.type} onChange={e => setF(p=>({...p,type:e.target.value}))}>
            {Object.entries(POLICY_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
        <FormField label="Sum Insured (₹)" value={f.sumInsured} onChange={fld("sumInsured")} type="number" placeholder="10000000"/>
        <div>
          <label className="w-label">Frequency</label>
          <select className="w-input" value={f.frequency} onChange={e => setF(p=>({...p,frequency:e.target.value}))}>
            {[["ANNUAL","Annual"],["SEMI_ANNUAL","Semi-Annual"],["QUARTERLY","Quarterly"],["MONTHLY","Monthly"]]
              .map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <FormField label="Premium Amount (₹)" value={f.premiumAmount} onChange={fld("premiumAmount")} type="number" placeholder="12000"/>
        <FormField label="Start Date" value={f.startDate} onChange={fld("startDate")} type="date"/>
      </div>
      <ModalActions onClose={onClose} onSubmit={() => addPolicy.mutate({
        policyName:f.policyName, provider:f.provider, type:f.type as any, frequency:f.frequency as any,
        sumInsuredInCents:Math.round(parseFloat(f.sumInsured)*100),
        premiumInCents:Math.round(parseFloat(f.premiumAmount)*100), startDate:f.startDate },{ onSuccess:onClose })}
        disabled={!f.policyName||!f.provider||!f.sumInsured||!f.premiumAmount}
        loading={addPolicy.isPending} label="Add Policy"/>
    </Modal>
  );
}

/* ─── Empty State ────────────────────────────────────────────── */
function EmptyState({ icon, message, action, actionLabel }:
  { icon:string; message:string; action?:()=>void; actionLabel?:string }) {
  return (
    <WCard style={{ padding:"48px 32px", textAlign:"center" }}>
      <p style={{ fontSize:36, marginBottom:12 }}>{icon}</p>
      <p style={{ fontWeight:600, fontSize:14, fontFamily:SANS, color:"var(--w-text1)", marginBottom:4 }}>{message}</p>
      {action && actionLabel && (
        <button className="w-btn w-btn-primary" style={{ marginTop:16, display:"inline-flex" }} onClick={action}>
          <Plus size={13}/> {actionLabel}
        </button>
      )}
    </WCard>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function WealthPage() {
  const { data, isLoading, isError, refetch, isFetching } = useWealth();
  const { isMasked, togglePrivacyMode } = useWealthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (isLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400, gap:12, color:"var(--w-text2)", fontFamily:SANS }}>
      <Loader2 size={20} style={{ animation:"w-spin 1s linear infinite" }}/> Loading wealth data…
    </div>
  );

  if (isError || !data) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
      <WCard style={{ padding:"28px 36px", textAlign:"center", maxWidth:360 }}>
        <p style={{ fontWeight:700, fontSize:16, fontFamily:SYNE, color:LOSS, marginBottom:6 }}>Failed to load</p>
        <p style={{ fontSize:13, color:"var(--w-text2)", fontFamily:SANS, marginBottom:16 }}>Ensure the backend is running and you are logged in.</p>
        <button className="w-btn" style={{ width:"100%", justifyContent:"center" }} onClick={() => refetch()}>
          <RefreshCw size={13}/> Try Again
        </button>
      </WCard>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }}/>
      <div style={{ maxWidth:1380, width:"100%", margin:"0 auto" }}>
        {/* Page header */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          style={{ marginBottom:20 }}>
          <h1 style={{ fontFamily:SYNE, fontSize:"clamp(22px,4vw,30px)", fontWeight:800,
            color:"var(--w-text0)", letterSpacing:-0.5, marginBottom:4 }}>Wealth &amp; Investments</h1>
          <p style={{ fontSize:13, color:"var(--w-text2)", fontFamily:SANS }}>Your complete financial picture</p>
        </motion.div>

        <NetWorthHeader data={data} masked={isMasked} onToggleMask={togglePrivacyMode}
          onSync={() => refetch()} syncing={isFetching}/>

        {/* Tab rail */}
        <div className="w-tab-rail">
          {TABS.map((tab,i) => {
            const active = activeTab === tab.id;
            return (
              <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale:0.97 }}
                style={{
                  display:"flex", alignItems:"center", gap:7, padding:"8px 16px",
                  borderRadius:12, border:"none", cursor:"pointer",
                  fontSize:13, fontWeight:600, fontFamily:SANS, whiteSpace:"nowrap",
                  background: active ? "var(--w-surface)" : "transparent",
                  color: active ? "var(--w-text0)" : "var(--w-text2)",
                  boxShadow: active ? `0 2px 8px var(--w-shadow), 0 0 0 1px var(--w-border)` : "none",
                  transition:"all 0.2s", flexShrink:0,
                }}>
                <span style={{ fontSize:14 }}>{tab.emoji}</span>
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-4 }} transition={{ duration:0.2 }}>
            {activeTab==="overview"     && <OverviewTab     data={data} masked={isMasked}/>}
            {activeTab==="stocks"       && <StocksTab       data={data} masked={isMasked}/>}
            {activeTab==="mutual-funds" && <MutualFundsTab  data={data} masked={isMasked}/>}
            {activeTab==="assets"       && <AssetsTab       data={data} masked={isMasked}/>}
            {activeTab==="liabilities"  && <LiabilitiesTab  data={data} masked={isMasked}/>}
            {activeTab==="insurance"    && <InsuranceTab    data={data} masked={isMasked}/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
