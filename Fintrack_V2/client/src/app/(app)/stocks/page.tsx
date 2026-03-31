'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, Search, X, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  useStockPortfolio, useStockSearch, useAddStock, useDeleteStock,
  type StockHolding,
} from '@/hooks/useStocks';

/* ── Formatters ─────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const EXCHANGE_CONFIG = {
  NSE:    { label: 'NSE India', color: '#6366f1', emoji: '🇮🇳', hint: 'e.g. TCS, INFY, RELIANCE' },
  US:     { label: 'US Market', color: '#f59e0b', emoji: '🇺🇸', hint: 'e.g. AAPL, GOOGL, TSLA' },
  CRYPTO: { label: 'Crypto',    color: '#f97316', emoji: '₿',   hint: 'e.g. BTC-USD, ETH-USD' },
} as const;

/* ── Holding row ────────────────────────────────── */
function HoldingRow({ h, onDelete }: { h: StockHolding; onDelete: () => void }) {
  const isGain = h.pnl >= 0;
  const cfg = EXCHANGE_CONFIG[h.exchange];

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

      {/* Icon */}
      <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: cfg.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {cfg.emoji}
      </div>

      {/* Name + ticker */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {h.companyName}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge" style={{ background: cfg.color + '18', color: cfg.color, fontSize: 11 }}>{h.ticker}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>×{h.quantity}</span>
        </div>
      </div>

      {/* Prices */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{fmtPrice(h.currentPrice)}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>avg {fmtPrice(h.avgBuyPrice)}</p>
      </div>

      {/* Values */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 110 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(h.currentValue)}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(h.investedAmount)} invested</p>
      </div>

      {/* P&L */}
      <div style={{ flexShrink: 0, minWidth: 90, textAlign: 'right' }}>
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
          fontSize: 13, fontWeight: 700,
          color: isGain ? 'var(--success)' : 'var(--danger)',
        }}>
          {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
        </span>
        <p style={{ fontSize: 12, color: isGain ? 'var(--success)' : 'var(--danger)' }}>
          {h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)}
        </p>
      </div>

      <button className="btn btn-icon" onClick={onDelete} style={{ width: 30, height: 30, color: 'var(--danger)', flexShrink: 0 }}>
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

/* ── Add Stock Modal ─────────────────────────────── */
function AddStockModal({ onClose }: { onClose: () => void }) {
  const [exchange, setExchange] = useState<'NSE' | 'US' | 'CRYPTO'>('NSE');
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState<{ ticker: string; name: string } | null>(null);
  const [form, setForm] = useState({ quantity: '', avgBuyPrice: '' });

  const { data: results = [], isLoading: searching } = useStockSearch(searchQ, exchange);
  const addStock = useAddStock();

  function handleSubmit() {
    if (!selected) return;
    addStock.mutate({
      ticker: selected.ticker,
      exchange,
      companyName: selected.name,
      quantity: parseFloat(form.quantity),
      avgBuyPrice: parseFloat(form.avgBuyPrice),
    }, { onSuccess: onClose });
  }

  const cfg = EXCHANGE_CONFIG[exchange];

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>Add Stock / Crypto</h2>
          <button className="btn btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}><X size={16} /></button>
        </div>

        {/* Exchange toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(Object.entries(EXCHANGE_CONFIG) as [keyof typeof EXCHANGE_CONFIG, typeof EXCHANGE_CONFIG[keyof typeof EXCHANGE_CONFIG]][]).map(([key, c]) => (
            <button key={key} onClick={() => { setExchange(key); setSearchQ(''); setSelected(null); }}
              className="btn btn-sm" style={{ flex: 1, background: exchange === key ? c.color : 'var(--bg-surface-2)', color: exchange === key ? '#fff' : 'var(--text-secondary)', border: 'none', fontSize: 12 }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <label style={L}>Search {cfg.label}</label>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{cfg.hint}</p>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search…"
              value={searchQ} onChange={e => { setSearchQ(e.target.value); setSelected(null); }} />
          </div>
          {searching && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Searching…</p>}
          {results.length > 0 && !selected && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, maxHeight: 160, overflowY: 'auto', background: 'var(--bg-surface)' }}>
              {(results||[]).filter(Boolean).map((r: any) => (
                <button key={r.ticker} onClick={() => { setSelected(r); setSearchQ(r.name); }}
                  style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <span style={{ fontWeight: 600 }}>{r.ticker}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={L}>Quantity / Units</label>
            <input className="input" type="number" step="0.0001" placeholder={exchange === 'CRYPTO' ? '0.05' : '10'}
              value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div>
            <label style={L}>Avg. Buy Price (₹)</label>
            <input className="input" type="number" step="0.01" placeholder="4500.00"
              value={form.avgBuyPrice} onChange={e => setForm(f => ({ ...f, avgBuyPrice: e.target.value }))} />
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          {exchange !== 'NSE' ? '💡 Enter price in ₹ — we fetch live USD→INR rate for current value' : ''}
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit}
            disabled={!selected || !form.quantity || !form.avgBuyPrice || addStock.isPending}>
            {addStock.isPending ? 'Saving…' : 'Add Holding'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function StocksPage() {
  const { data, isLoading, isError } = useStockPortfolio();
  const deleteStock = useDeleteStock();
  const [showModal, setShowModal] = useState(false);
  const [filterExchange, setFilterExchange] = useState<'ALL' | 'NSE' | 'US' | 'CRYPTO'>('ALL');

  const portfolio = data ?? { holdings: [], summary: { totalInvested: 0, totalCurrent: 0, totalPnl: 0, totalPnlPct: 0, holdingsCount: 0, byExchange: {} } };
  const { summary } = portfolio;
  const isGain = summary.totalPnl >= 0;

  const filtered = portfolio.holdings.filter(h => filterExchange === 'ALL' || h.exchange === filterExchange);

  // Allocation donut data
  const pieData = Object.entries(summary.byExchange).map(([exchange, value]) => ({
    name: EXCHANGE_CONFIG[exchange as keyof typeof EXCHANGE_CONFIG]?.label ?? exchange,
    value: Math.round(value),
    color: EXCHANGE_CONFIG[exchange as keyof typeof EXCHANGE_CONFIG]?.color ?? '#94a3b8',
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stocks & Crypto</h1>
          <p className="page-subtitle">Yahoo Finance (15 min delay) · CoinGecko · All values in ₹</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add Holding
        </button>
      </div>

      {/* Summary + Allocation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { label: 'Total Invested', value: fmt(summary.totalInvested) },
            { label: 'Current Value',  value: fmt(summary.totalCurrent)  },
            { label: 'Total P&L',      value: `${summary.totalPnl >= 0 ? '+' : ''}${fmt(summary.totalPnl)}`,
              sub: `${summary.totalPnlPct >= 0 ? '+' : ''}${summary.totalPnlPct.toFixed(2)}%`,
              color: isGain ? 'var(--success)' : 'var(--danger)' },
            { label: 'Holdings', value: String(summary.holdingsCount), sub: 'positions' },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{item.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: (item as any).color ?? 'var(--text-primary)', letterSpacing: -0.5 }}>{item.value}</p>
              {(item as any).sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{(item as any).sub}</p>}
            </div>
          ))}
        </div>

        {/* Allocation Donut */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Allocation</p>
          {pieData.length === 0 ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v), 'Value']}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Exchange filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ALL', 'NSE', 'US', 'CRYPTO'] as const).map(e => (
          <button key={e} onClick={() => setFilterExchange(e)} className="btn btn-sm"
            style={{
              background: filterExchange === e ? (e === 'ALL' ? 'var(--indigo-500)' : EXCHANGE_CONFIG[e as keyof typeof EXCHANGE_CONFIG]?.color) : 'var(--bg-surface-2)',
              color: filterExchange === e ? '#fff' : 'var(--text-secondary)',
              border: 'none',
            }}>
            {e === 'ALL' ? 'All' : `${EXCHANGE_CONFIG[e as keyof typeof EXCHANGE_CONFIG].emoji} ${EXCHANGE_CONFIG[e as keyof typeof EXCHANGE_CONFIG].label}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading portfolio…
          </div>
        )}
        {isError && <div style={{ padding: 48, textAlign: 'center', color: 'var(--danger)' }}>Failed to load.</div>}
        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No holdings yet</p>
            <p style={{ fontSize: 13 }}>Add NSE stocks, US equities, or crypto to track your portfolio</p>
          </div>
        )}
        {!isLoading && filtered.map(h => (
          <HoldingRow key={h.id} h={h} onDelete={() => deleteStock.mutate(h.id)} />
        ))}
      </div>

      <AnimatePresence>
        {showModal && <AddStockModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const L: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' };