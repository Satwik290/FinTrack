'use client';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Wallet } from 'lucide-react';
import { useRef } from 'react';

const assets = [
  { name: 'Equities', pct: 32, val: '₹16.2L', color: '#0DDC9B', gridCol: 'span 2', gridRow: 'span 2' },
  { name: 'Crypto', pct: 18, val: '₹9.1L', color: '#0DDC9B', gridCol: 'span 1', gridRow: 'span 2' },
  { name: 'Mutual Funds', pct: 22, val: '₹11.1L', color: '#6C74FF', gridCol: 'span 1', gridRow: 'span 1' },
  { name: 'Bonds', pct: 15, val: '₹7.6L', color: '#0DDC9B', gridCol: 'span 1', gridRow: 'span 1' },
  { name: 'Real Estate', pct: 8, val: '₹4.0L', color: '#FF5C67', gridCol: 'span 1', gridRow: 'span 1' },
  { name: 'Cash', pct: 5, val: '₹2.5L', color: '#475569', gridCol: 'span 1', gridRow: 'span 1' },
];

export default function DashboardShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-28 md:py-36 bg-[#080B14] relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* FIXED: Proper container with padding */}
      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-8">

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-20 md:mb-24 max-w-2xl mx-auto"
        >
          <p className="text-[12px] font-mono text-teal-400 tracking-[0.12em] uppercase mb-4">◇ Unified Dashboard</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Visual Harmony.{' '}
            <span className="text-slate-400">Zero Eye-Strain.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Jade for gains. Terracotta for losses. A meticulously crafted palette for instant, calm cognitive processing.
          </p>
        </motion.div>

        {/* Main Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full rounded-[20px] bg-[#161B29]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.5)] p-6 md:p-8 relative overflow-hidden group"
        >
          <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-teal-500/10 via-transparent to-transparent pointer-events-none" />

          {/* FIXED: Responsive 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 relative z-10">

            {/* Left: Portfolio Heatmap */}
            <div className="lg:col-span-2 bg-[#0F121C] rounded-2xl border border-white/[0.06] p-5 md:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5 gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-base flex items-center gap-2.5 mb-1">
                    <Wallet size={16} className="text-teal-400 flex-shrink-0" />
                    <span className="truncate">Portfolio Allocation</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono tracking-widest">TRAILING 30D</p>
                </div>
                <span className="text-[11px] font-mono text-[#0DDC9B] bg-[#0DDC9B]/10 px-3 py-1.5 rounded-lg flex-shrink-0 font-bold">
                  +8.4%
                </span>
              </div>

              {/* FIXED: Heatmap grid with inline styles for reliable spanning */}
              <div className="grid grid-cols-3 gap-2 flex-1" style={{ gridTemplateRows: 'repeat(2, minmax(120px, 1fr))', minHeight: '260px' }}>
                {assets.map((a, i) => (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="rounded-xl flex flex-col justify-between p-3 md:p-4 relative overflow-hidden cursor-default group/cell transition-all hover:shadow-lg"
                    style={{
                      gridColumn: a.gridCol,
                      gridRow: a.gridRow,
                      backgroundColor: `${a.color}15`,
                      border: `1px solid ${a.color}25`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${a.color}10, transparent)` }}
                    />

                    <span className="text-xs font-semibold text-slate-300 relative z-10 leading-tight block">
                      {a.name}
                    </span>

                    <div className="relative z-10 pt-2">
                      <span className="font-mono text-sm md:text-base font-bold block leading-tight" style={{ color: a.color }}>
                        {a.val}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{a.pct}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Gauges */}
            <div className="flex flex-col gap-4">
              {/* Financial Freedom */}
              <div className="flex-1 bg-[#0F121C] rounded-2xl border border-white/[0.06] p-5 md:p-6 flex flex-col justify-between" style={{ minHeight: '140px' }}>
                <div>
                  <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mb-2">Financial Freedom</p>
                  <div className="flex items-end gap-1.5 mb-4">
                    <p className="text-3xl md:text-4xl font-bold text-white font-mono leading-none">45</p>
                    <p className="text-sm text-slate-500 font-mono mb-1">%</p>
                  </div>
                </div>
                <div>
                  <div className="w-full h-2.5 rounded-full bg-[#1E2538] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '45%' } : {}}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-teal-500 to-[#0DDC9B] rounded-full shadow-[0_0_12px_rgba(13,220,155,0.4)]"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2.5 font-mono">PAID: ₹24L / ₹53L</p>
                </div>
              </div>

              {/* Passive Income */}
              <div className="flex-1 bg-[#0F121C] rounded-2xl border border-white/[0.06] p-5 md:p-6 flex flex-col justify-between" style={{ minHeight: '140px' }}>
                <div>
                  <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mb-2">Passive Income</p>
                  <div className="flex items-end gap-1.5 mb-4">
                    <p className="text-3xl md:text-4xl font-bold text-[#0DDC9B] font-mono leading-none">₹12K</p>
                    <p className="text-sm text-slate-500 mb-1">/mo</p>
                  </div>
                </div>
                <div>
                  <div className="w-full h-2.5 rounded-full bg-[#1E2538] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '15%' } : {}}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.7 }}
                      className="h-full bg-[#0DDC9B] rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2.5 font-mono">TARGET: ₹80K/MO</p>
                </div>
              </div>

              {/* Total Net Worth */}
              <div className="bg-[#0F121C] rounded-2xl border border-white/[0.06] p-5 md:p-6">
                <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mb-3">Total Net Worth</p>
                <div className="flex items-end justify-between gap-3 flex-wrap">
                  <p className="text-3xl md:text-4xl font-bold text-white font-mono">₹50.5L</p>
                  <span className="text-xs font-mono text-[#0DDC9B] bg-[#0DDC9B]/10 px-3 py-1.5 rounded-lg flex-shrink-0 font-bold">
                    ↑ 12.3%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[20px]" />
        </motion.div>
      </div>
    </section>
  );
}