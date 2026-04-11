'use client';
import { motion, useInView } from 'framer-motion';
import { Brain, ShieldAlert, LineChart, Target, EyeOff, Code2 } from 'lucide-react';
import { useState, useRef } from 'react';

const cardVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function BentoFeatures() {
  const [privacyMode, setPrivacyMode] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const features = [
    {
      icon: <Code2 className="text-[#0DDC9B]" size={22} />,
      iconBg: 'bg-[#0DDC9B]/10',
      title: 'Integer Precision',
      desc: 'Zero floating-point errors. Every transaction stored in cents, displayed flawlessly.',
      accent: '#0DDC9B',
      visual: (
        <div className="mt-auto pt-6">
          <div className="px-4 py-3.5 bg-[#0F121C] rounded-xl border border-white/[0.06] font-mono text-center relative overflow-hidden">
            <span className="text-slate-600 line-through text-xs mr-3">49.990001</span>
            <span className="text-[#0DDC9B] font-bold text-base">₹50.00</span>
          </div>
        </div>
      ),
    },
    {
      icon: <LineChart className="text-orange-400" size={22} />,
      iconBg: 'bg-orange-500/10',
      title: 'Live Market Data',
      desc: 'Real-time feeds from Yahoo Finance, CoinGecko, and MFAPI.',
      accent: '#f97316',
      visual: (
        <div className="mt-auto pt-6">
          <div className="flex items-end gap-[3px] h-14 px-1">
            {[35, 25, 45, 35, 65, 55, 85, 75, 100, 90, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={isInView ? { height: `${h}%` } : {}}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="flex-1 bg-gradient-to-t from-orange-500/40 to-orange-400 rounded-t-sm"
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Target className="text-indigo-400" size={22} />,
      iconBg: 'bg-indigo-500/10',
      title: '12-Month Forecasting',
      desc: 'AI-powered projection models predict your exact net worth trajectory.',
      accent: '#6C74FF',
      visual: (
        <div className="mt-auto pt-8">
          <div className="relative h-10 flex items-center px-1">
            <div className="absolute left-1 right-1 h-[2px] bg-slate-800/60 rounded-full" />
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: '70%' } : {}}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="absolute left-1 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            />
            <div className="absolute left-[10%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <motion.div
              initial={{ left: '10%' }}
              animate={isInView ? { left: '70%' } : {}}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="absolute w-3.5 h-3.5 bg-indigo-400 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)]"
            />
            <span className="absolute left-[10%] -bottom-6 text-[9px] text-slate-500 font-mono -translate-x-1/2 whitespace-nowrap">TODAY</span>
            <span className="absolute left-[70%] -top-6 text-[9px] text-indigo-400 font-mono font-bold -translate-x-1/2 whitespace-nowrap">+12 MO</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Brain className="text-violet-400" size={22} />,
      iconBg: 'bg-violet-500/10',
      title: 'Neural AI Copilot',
      desc: 'Gemini 2.5 RAG pipeline with dual CA & CFA financial personas.',
      accent: '#8B5CF6',
      visual: (
        <div className="mt-auto pt-6">
          <div className="flex bg-[#0F121C] rounded-xl p-1 border border-white/[0.06] gap-1">
            <div className="flex-1 py-2.5 text-center text-xs font-bold bg-gradient-to-r from-violet-500/15 to-indigo-500/15 text-indigo-300 rounded-lg border border-indigo-500/20">
              🛡️ CA Mode
            </div>
            <div className="flex-1 py-2.5 text-center text-xs font-bold text-slate-600">📈 CFA Mode</div>
          </div>
        </div>
      ),
    },
    {
      icon: <ShieldAlert className="text-[#FF5C67]" size={22} />,
      iconBg: 'bg-[#FF5C67]/10',
      title: 'Anomaly Detection',
      desc: 'Instant alerts on unusual spending patterns and budget spikes.',
      accent: '#FF5C67',
      visual: (
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between px-3.5 py-3 bg-[#0F121C] rounded-xl border border-[#FF5C67]/15">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#FF5C67] animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-slate-300 truncate">AWS Hosting</span>
            </div>
            <span className="text-[11px] font-mono text-[#FF5C67] bg-[#FF5C67]/10 px-2.5 py-1 rounded-md font-bold flex-shrink-0 ml-2">
              +450%
            </span>
          </div>
        </div>
      ),
    },
    {
      icon: <EyeOff className="text-teal-400" size={22} />,
      iconBg: 'bg-teal-500/10',
      title: 'Privacy Mode',
      desc: 'Obscure all financial data with a single toggle. Zero data leaks.',
      accent: '#14b8a6',
      visual: (
        <div className="mt-auto pt-6">
          <div className="px-4 py-3.5 bg-[#0F121C] rounded-xl border border-white/[0.06] flex justify-between items-center gap-3">
            <span className="text-sm text-slate-400 flex-shrink-0">Net Worth</span>
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="font-mono text-white text-base transition-all duration-500 truncate"
                style={{ filter: privacyMode ? 'blur(8px)' : 'none', userSelect: privacyMode ? 'none' : 'auto' }}
              >
                ₹45,00,000
              </span>
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 ${
                  privacyMode ? 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.4)]' : 'bg-slate-700'
                }`}
              >
                <motion.div
                  animate={{ x: privacyMode ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-28 md:py-36 bg-[#080B14] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* FIXED: Proper container with centering */}
      <div ref={sectionRef} className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

        {/* FIXED: Section header - truly centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-20 md:mb-24 max-w-2xl mx-auto"
        >
          <p className="text-[12px] font-mono text-indigo-400 tracking-[0.12em] uppercase mb-4">◇ Core Architecture</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Engineered for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C74FF] to-[#9F7AEA]">
              Absolute Clarity
            </span>
          </h2>
          <p className="text-slate-400 font-medium text-lg leading-relaxed">
            Six pillars of financial intelligence, built from the ground up.
          </p>
        </motion.div>

        {/* FIXED: Grid with equal card heights via grid-rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="bg-[#161B29]/80 border border-white/[0.07] rounded-2xl p-6 md:p-7 relative overflow-hidden flex flex-col min-h-[260px] group backdrop-blur-sm"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${f.accent}40, transparent)` }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${f.accent}08, transparent 70%)` }}
              />

              {/* Icon */}
              <div className={`${f.iconBg} w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0`}>
                {f.icon}
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.desc}</p>

              {/* Visual stays at bottom */}
              {f.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}