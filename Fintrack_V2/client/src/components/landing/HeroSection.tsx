'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BrainCircuit, ArrowRight, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const mockData = [
  { month: 'Jan', netWorth: 250000 },
  { month: 'Feb', netWorth: 280000 },
  { month: 'Mar', netWorth: 310000 },
  { month: 'Apr', netWorth: 380000 },
  { month: 'May', netWorth: 360000 },
  { month: 'Jun', netWorth: 450000 },
  { month: 'Jul', netWorth: 510000 },
  { month: 'Aug', netWorth: 600000 },
  { month: 'Sep', netWorth: 850000 },
  { month: 'Oct', netWorth: -200000, label: 'Capital Call' },
  { month: 'Nov', netWorth: 1200000 },
  { month: 'Dec', netWorth: 1500000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const isGain = val >= 0;
    return (
      <div className="bg-[#0F121C]/95 border border-white/10 rounded-xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-[0.08em] mb-1">
          {payload[0].payload.month} 2025
        </p>
        <p className="font-mono text-lg font-bold flex items-center gap-1.5" style={{ color: isGain ? '#0DDC9B' : '#FF5C67' }}>
          {val < 0 ? '-' : '+'}₹{Math.abs(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        {payload[0]?.payload?.label && (
          <p className="text-[10px] text-[#FF5C67] mt-1 font-mono font-bold tracking-wider">
            {payload[0].payload.label}
          </p>
        )}
      </div>
    );
  }
  return null;
};

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 0%, #0F121C 70%)', zIndex: 2 }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(108,116,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] left-[20%] w-[600px] h-[600px] bg-[#6C74FF]/15 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-[#7E5BFB]/10 rounded-full blur-[140px]"
      />
    </div>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const chartY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const chartScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen pt-40 pb-24 flex flex-col items-center justify-center overflow-hidden bg-[#0F121C]"
    >
      <GridBackground />

      {/* FIXED: Proper centered container, no overflow issues */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] font-semibold text-slate-300 mb-8 backdrop-blur-xl"
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DDC9B] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0DDC9B]" />
          </span>
          <span>FinTrack V2 — Now with Gemini 2.5 Flash</span>
          <Zap size={12} className="text-amber-400 flex-shrink-0" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-8"
        >
          Your Financial Intelligence{' '}
          <span className="relative inline-block mt-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C74FF] via-[#9F7AEA] to-[#7E5BFB]">
              Command Center.
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#6C74FF] to-[#7E5BFB]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left' }}
            />
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          Not another expense tracker. A precision-engineered, AI-native wealth platform that models your future, not just your past.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="/auth"
            className="relative inline-flex items-center gap-2.5 bg-[#7E5BFB] text-white px-8 py-4 rounded-full text-base font-bold shadow-[0_4px_30px_rgba(126,91,251,0.5)] hover:shadow-[0_6px_40px_rgba(126,91,251,0.65)] hover:bg-[#8B6BFF] transition-all duration-300 hover:-translate-y-0.5 group whitespace-nowrap"
          >
            <span>Start Forecasting</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#features"
            className="text-slate-400 font-medium hover:text-white px-8 py-4 transition-colors duration-200 group flex items-center gap-2 text-base whitespace-nowrap"
          >
            Explore Architecture
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>

        {/* FIXED: Quick stats strip - static, not broken counters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex items-center justify-center gap-6 sm:gap-10 mb-16 flex-wrap"
        >
          {[
            { val: 'BigInt', label: 'Precision Storage' },
            { val: '12mo', label: 'Forecast Window' },
            { val: '6+', label: 'Data Oracles' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6 sm:gap-10">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">{stat.val}</p>
                <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mt-1">{stat.label}</p>
              </div>
              {i < 2 && <div className="h-8 w-px bg-white/10 hidden sm:block" />}
            </div>
          ))}
        </motion.div>

        {/* Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring', bounce: 0.25 }}
          style={{ y: chartY, scale: chartScale }}
          className="w-full rounded-[20px] bg-[#161B29]/70 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(108,116,255,0.08)] p-6 md:p-8 relative"
        >
          {/* Glow edge */}
          <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-[#6C74FF]/15 via-transparent to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
            <div className="text-left">
              <h3 className="text-white font-bold text-base md:text-lg flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <BrainCircuit className="text-violet-400" size={16} />
                </div>
                12-Month Net Worth Forecast
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-2 tracking-wider">
                MODEL: GEMINI-2.5-FLASH · PRECISION: BIGINT
              </p>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0DDC9B]/10 text-[#0DDC9B] px-4 py-2.5 rounded-full border border-[#0DDC9B]/15 flex-shrink-0 self-start sm:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DDC9B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0DDC9B]" />
              </span>
              <span className="text-[11px] font-bold font-mono tracking-wider">LIVE SIMULATION</span>
            </div>
          </div>

          <div className="h-[280px] md:h-[340px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0DDC9B" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0DDC9B" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5C67" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#FF5C67" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                  dy={10}
                />
                <YAxis hide domain={[-400000, 1700000]} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,116,255,0.04)', radius: 4 } as any} />
                <Bar dataKey="netWorth" radius={[6, 6, 2, 2]} animationDuration={2000} animationEasing="ease-out">
                  {mockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.netWorth >= 0 ? 'url(#gainGrad)' : 'url(#lossGrad)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 rounded-b-[20px] bg-gradient-to-t from-[#161B29] to-transparent pointer-events-none z-20" />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080B14] to-transparent pointer-events-none" />
    </section>
  );
}