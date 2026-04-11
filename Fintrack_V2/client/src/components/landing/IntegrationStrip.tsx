'use client';
import { motion } from 'framer-motion';

const integrations = [
  { name: 'Gemini 2.5 Flash', role: 'Neural AI Core', icon: '🧠' },
  { name: 'Yahoo! Finance', role: 'Live Equity Data', icon: '📈' },
  { name: 'CoinGecko', role: 'Crypto Pricing', icon: '🦎' },
  { name: 'MFAPI', role: 'Mutual Fund NAV', icon: '💰' },
  { name: 'Frankfurter', role: 'FX Conversion', icon: '💱' },
  { name: 'PostgreSQL', role: 'ACID Storage', icon: '🛢️' },
  { name: 'Neon DB', role: 'Serverless Postgres', icon: '⚡' },
  { name: 'Prisma ORM', role: 'Type-Safe Queries', icon: '🔷' },
];

// Triple the items for a truly seamless loop
const tripled = [...integrations, ...integrations, ...integrations];

export default function IntegrationStrip() {
  return (
    <div className="w-full bg-[#080B14] py-16 border-y border-white/[0.04] overflow-hidden relative">
      {/* Label */}
      <p className="text-[11px] text-slate-500 font-mono tracking-[0.15em] uppercase text-center mb-12 px-6">
        Powered by Live Data Oracles
      </p>

      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-r from-[#080B14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-l from-[#080B14] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track — uses CSS animation for perfectly seamless loop */}
      <div className="flex overflow-hidden">
        <motion.div
          className="flex shrink-0 gap-4"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        >
          {tripled.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-300 cursor-default group flex-shrink-0"
              style={{ minWidth: '230px' }}
            >
              <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-slate-300 group-hover:text-white transition-colors block leading-tight truncate">
                  {item.name}
                </span>
                <span className="text-[11px] font-mono text-slate-500 group-hover:text-indigo-400 transition-all duration-300 block leading-tight">
                  {item.role}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}