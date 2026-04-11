'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

/* ─────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────── */
const FORECAST_DATA = [
  { m: 'Jan', v: 250000 }, { m: 'Feb', v: 280000 }, { m: 'Mar', v: 310000 },
  { m: 'Apr', v: 380000 }, { m: 'May', v: 360000 }, { m: 'Jun', v: 450000 },
  { m: 'Jul', v: 510000 }, { m: 'Aug', v: 600000 }, { m: 'Sep', v: 850000 },
  { m: 'Oct', v: -200000, label: 'Capital Call' },
  { m: 'Nov', v: 1200000 }, { m: 'Dec', v: 1500000 },
];

const FEATURES = [
  {
    icon: '⌗', color: '#0DDC9B', bg: 'rgba(13,220,155,0.08)', border: 'rgba(13,220,155,0.15)',
    title: 'Integer Precision',
    desc: 'Zero floating-point errors. Every paisa stored in BigInt, displayed flawlessly.',
    demo: (
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <div style={{ background: '#0A0D17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace' }}>
          <span style={{ color: '#475569', textDecoration: 'line-through', fontSize: 12, marginRight: 12 }}>49.990001</span>
          <span style={{ color: '#0DDC9B', fontWeight: 700, fontSize: 16 }}>₹50.00</span>
        </div>
      </div>
    ),
  },
  {
    icon: '↗', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)',
    title: 'Live Market Data',
    desc: 'Real-time feeds from Yahoo Finance, CoinGecko, MFAPI & Frankfurter FX.',
    demo: null,
  },
  {
    icon: '◎', color: '#6C74FF', bg: 'rgba(108,116,255,0.08)', border: 'rgba(108,116,255,0.15)',
    title: '12-Month Forecasting',
    desc: 'AI-powered projection models predict your exact net worth trajectory.',
    demo: null,
  },
  {
    icon: '⬡', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)',
    title: 'Neural AI Copilot',
    desc: 'Gemini 2.5 RAG pipeline with dual CA & CFA financial personas.',
    demo: (
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <div style={{ display: 'flex', background: '#0A0D17', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)', gap: 4 }}>
          <div style={{ flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderRadius: 8, border: '1px solid rgba(139,92,246,0.2)' }}>CA Mode</div>
          <div style={{ flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>CFA Mode</div>
        </div>
      </div>
    ),
  },
  {
    icon: '⚠', color: '#FF5C67', bg: 'rgba(255,92,103,0.08)', border: 'rgba(255,92,103,0.15)',
    title: 'Anomaly Detection',
    desc: 'Instant alerts on unusual spending patterns and budget spikes.',
    demo: (
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0D17', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,92,103,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5C67' }} />
            <span style={{ fontSize: 13, color: '#cbd5e1' }}>AWS Hosting</span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#FF5C67', background: 'rgba(255,92,103,0.1)', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>+450%</span>
        </div>
      </div>
    ),
  },
  {
    icon: '⊘', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)',
    title: 'Privacy Mode',
    desc: 'Obscure all financial data with a single toggle. Zero data leaks.',
    demo: null,
  },
];

const INTEGRATIONS = [
  { name: 'Gemini 2.5 Flash', role: 'Neural AI Core', icon: '🧠' },
  { name: 'Yahoo! Finance', role: 'Live Equity Data', icon: '📈' },
  { name: 'CoinGecko', role: 'Crypto Pricing', icon: '🦎' },
  { name: 'MFAPI', role: 'Mutual Fund NAV', icon: '💰' },
  { name: 'Frankfurter', role: 'FX Conversion', icon: '💱' },
  { name: 'PostgreSQL', role: 'ACID Storage', icon: '🛢️' },
  { name: 'NestJS', role: 'Backend Runtime', icon: '⚙️' },
  { name: 'Prisma ORM', role: 'Type-safe Queries', icon: '🔷' },
];

const TESTIMONIALS = [
  {
    name: 'Arjun M.', role: 'Sr. Engineering Manager', init: 'AM',
    quote: "The BigInt architecture is why I switched. Every other platform loses precision on my crypto fractional shares. FinTrack's integer storage is the first system I genuinely trust.",
  },
  {
    name: 'Priya S.', role: 'Independent Consultant', init: 'PS',
    quote: "The 12-month Net Worth Forecast isn't just a chart — it's a crystal ball. Seeing exactly when I hit my Freedom Goal changed how I think about money completely.",
  },
  {
    name: 'Rahul T.', role: 'Angel Investor', init: 'RT',
    quote: "Having Gemini switch between a conservative CA persona for taxes and a sharp CFA persona for portfolio risk? That's not a feature — it's a competitive advantage.",
  },
];

const BOT_RESPONSES: Record<string, string> = {
  'Am I over budget this month?': '🛡️ CA Mode active.\n\nYou are ₹12,500 over budget in "Dining Out" (₹17,500 / ₹5,000 limit). Overall cash flow remains positive at +₹45,000 this month.\n\n→ Reallocate ₹8,000 from surplus "Entertainment" budget to cover the deficit.',
  'Rebalance my portfolio': '📈 CFA Mode active.\n\nBased on 10Y-2Y yield curve inversion and your Aggressive risk profile:\n\n• Shift 15% Tech Equities → Short-term AAA Bonds\n• Risk reduction: ~22%\n• Return impact: -1.2% annualized\n\nConfirm to run rebalance simulation?',
};

/* ─────────────────────────────────────────────────
   TYPES & SHARED COMPONENTS
───────────────────────────────────────────────── */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      m: string;
      label?: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div style={{ background: 'rgba(10,13,23,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
      <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{payload[0].payload.m} 2025</p>
      <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: val >= 0 ? '#0DDC9B' : '#FF5C67', margin: 0 }}>
        {val < 0 ? '-' : '+'}₹{Math.abs(val).toLocaleString('en-IN')}
      </p>
      {payload[0].payload.label && <p style={{ fontSize: 10, color: '#FF5C67', marginTop: 4, fontFamily: 'monospace', fontWeight: 700 }}>{payload[0].payload.label}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   WORD-BY-WORD ANIMATED TEXT
───────────────────────────────────────────────── */
function AnimatedWords({ text, delay = 0, color, highlight }: {
  text: string; delay?: number; color?: string; highlight?: Record<string, string>;
}) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline' }}>
      {words.map((word, i) => {
        const hColor = highlight?.[word] || highlight?.[word + '.'] || highlight?.[word + ','];
        const cleanWord = word.replace(/[.,]/g, '');
        const punct = word.slice(cleanWord.length);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, delay: delay + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block', marginRight: i < words.length - 1 ? '0.28em' : 0 }}
          >
            {hColor ? (
              <span style={{ background: hColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>{cleanWord}</span>
            ) : (
              <span style={{ color: color || 'inherit' }}>{cleanWord}</span>
            )}
            {punct && <span style={{ color: color || 'inherit' }}>{punct}</span>}
          </motion.span>
        );
      })}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────────────── */
const PARTICLE_SEED = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: (i % 4) * 0.6 + 0.9,
  dur: (i % 6) * 2 + 10,
  delay: (i % 8) * 1.1,
  color: i % 5 === 0 ? '#6C74FF' : i % 7 === 0 ? '#0DDC9B' : 'rgba(255,255,255,0.35)',
}));

function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PARTICLE_SEED.map(p => (
        <motion.div key={p.id}
          style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.color, opacity: 0.5 }}
          animate={{ y: [0, -55, 0], opacity: [0, 0.65, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all 0.4s',
        padding: scrolled ? '10px 0' : '18px 0',
        background: scrolled ? 'rgba(8,11,20,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6C74FF, #7E5BFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(108,116,255,0.35)', fontSize: 16, flexShrink: 0 }}>⬡</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#f0f4fa', letterSpacing: '-0.02em' }}>FinTrack <span style={{ fontWeight: 400, color: '#475569', fontSize: 13 }}>v2</span></span>
          </Link>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hidden-mobile">
            {['Platform', 'Intelligence', 'AI Copilot', 'Customers'].map((l, i) => (
              <a key={l} href={['#hero', '#features', '#copilot', '#testimonials'][i]}
                style={{ padding: '8px 14px', fontSize: 13, color: '#94a3b8', textDecoration: 'none', borderRadius: 8, transition: 'all 0.2s', fontWeight: 500 }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f0f4fa'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; (e.target as HTMLElement).style.background = 'transparent'; }}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/auth" className="hidden-mobile" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', padding: '8px 12px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#f0f4fa'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}>Sign In</a>
            <a href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7E5BFB', color: '#fff', padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(126,91,251,0.45)', transition: 'all 0.3s' }}
              onMouseEnter={e => { (e.currentTarget).style.background = '#8B6BFF'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget).style.background = '#7E5BFB'; (e.currentTarget).style.transform = 'translateY(0)'; }}>Initialize Copilot ↗</a>
            <button onClick={() => setOpen(!open)} className="show-mobile" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 36, height: 36, color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>{open ? '✕' : '☰'}</button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: 'fixed', top: 64, left: 16, right: 16, zIndex: 99, background: 'rgba(22,27,41,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
            {['Platform', 'Intelligence', 'AI Copilot', 'Customers'].map((l, i) => (
              <a key={l} href={['#hero', '#features', '#copilot', '#testimonials'][i]} onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>{l}</a>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
            <a href="/auth" style={{ display: 'block', padding: '12px 16px', background: '#7E5BFB', color: '#fff', textDecoration: 'none', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>Initialize Copilot</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────
   HERO — PREMIUM REDESIGN
───────────────────────────────────────────────── */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });
  const orb1X = useTransform(springX, v => v * 0.035);
  const orb1Y = useTransform(springY, v => v * 0.035);
  const orb2X = useTransform(springX, v => v * -0.025);
  const orb2Y = useTransform(springY, v => v * -0.025);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const chartY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={ref} id="hero"
      onMouseMove={handleMouseMove}
      style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0B0E1A 0%, #0F121C 60%, #080B14 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 32px 80px', position: 'relative', overflow: 'hidden' }}
    >
      {/* BG layers */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(108,116,255,0.22) 1px, transparent 1px)', backgroundSize: '36px 36px', opacity: 0.13 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.011) 3px, rgba(255,255,255,0.011) 4px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,7,14,0.65) 100%)' }} />
      </div>

      {/* Parallax orbs */}
      <motion.div style={{ x: orb1X, y: orb1Y, position: 'absolute', width: 720, height: 720, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,116,255,0.18) 0%, transparent 70%)', filter: 'blur(60px)', top: '-12%', left: '3%', pointerEvents: 'none' }} />
      <motion.div style={{ x: orb2X, y: orb2Y, position: 'absolute', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,91,251,0.13) 0%, transparent 70%)', filter: 'blur(80px)', bottom: '3%', right: '-2%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,220,155,0.07) 0%, transparent 70%)', filter: 'blur(80px)', top: '40%', right: '22%', pointerEvents: 'none' }} />

      <Particles />

      {/* CONTENT */}
      <motion.div style={{ y: contentY, opacity: contentOpacity, maxWidth: 900, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 50, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 12, color: '#94a3b8', marginBottom: 36, fontWeight: 600, backdropFilter: 'blur(16px)', boxShadow: '0 0 0 1px rgba(108,116,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#0DDC9B', opacity: 0.4, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0DDC9B', display: 'block', position: 'relative', margin: 'auto' }} />
          </span>
          FinTrack V2 — Now with Gemini 2.5 Flash ⚡
        </motion.div>

        {/* Headline — word by word */}
        <h1 style={{ fontSize: 'clamp(44px, 6.5vw, 82px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: 32, color: '#f0f4fa' }}>
          <div style={{ display: 'block', marginBottom: 6 }}>
            <AnimatedWords text="Your Financial Intelligence" delay={0.08} color="#f0f4fa" />
          </div>
          <div style={{ display: 'block' }}>
            <AnimatedWords text="Command Center." delay={0.28}
              highlight={{
                'Command': 'linear-gradient(90deg, #6C74FF, #9F7AEA, #C084FC)',
                'Center.': 'linear-gradient(90deg, #9F7AEA, #7E5BFB)',
              }}
            />
          </div>
        </h1>

        {/* Subheading — 3-part staggered word animation */}
        <div style={{ fontSize: 'clamp(15px, 1.7vw, 19px)', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 44px', fontWeight: 400 }}>
          <div style={{ marginBottom: 2 }}>
            <AnimatedWords text="Not another expense tracker." delay={0.52} color="#3d4f68" />
          </div>
          <div style={{ marginBottom: 2 }}>
            <AnimatedWords
              text="A precision-engineered, AI-native wealth platform"
              delay={0.70}
              color="#94a3b8"
              highlight={{
                'precision-engineered,': 'linear-gradient(90deg, #6C74FF, #9F7AEA)',
                'AI-native': 'linear-gradient(90deg, #8B5CF6, #6C74FF)',
              }}
            />
          </div>
          <div>
            <AnimatedWords
              text="that models your future, not just your past."
              delay={0.97}
              color="#64748b"
              highlight={{
                'future,': 'linear-gradient(90deg, #0DDC9B, #14b8a6)',
              }}
            />
          </div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.35 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 60 }}
        >
          <motion.a href="/auth" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7E5BFB, #6C74FF)', color: '#fff', padding: '15px 32px', borderRadius: 50, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 32px rgba(126,91,251,0.55), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            <span>Start Forecasting</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: 16 }}>→</motion.span>
          </motion.a>
          <motion.a href="#features" whileHover={{ scale: 1.02 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', padding: '15px 28px', borderRadius: 50, fontWeight: 500, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', transition: 'color 0.25s, border-color 0.25s' }}
            onMouseEnter={e => { (e.currentTarget).style.color = '#f0f4fa'; (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget).style.color = '#64748b'; (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.06)'; }}>
            Explore Architecture →
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.55 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 4vw, 60px)', marginBottom: 56, flexWrap: 'wrap' }}
        >
          {[['BigInt', 'Precision Storage'], ['12mo', 'Forecast Window'], ['6+', 'Data Oracles'], ['3-Role', 'RBAC System']].map(([val, label], i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.55 + i * 0.1 }}
              style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: '#f0f4fa', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{val}</p>
              <p style={{ fontSize: 10, color: '#2d3a4f', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'monospace', margin: 0 }}>{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart card */}
        <motion.div
          initial={{ opacity: 0, y: 56 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.62, type: 'spring', bounce: 0.18 }}
          style={{ y: chartY, position: 'relative' } as any}
        >
          {/* Halo glow behind */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -40, width: '65%', height: 80, background: 'rgba(108,116,255,0.22)', filter: 'blur(44px)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ background: 'rgba(18,22,36,0.88)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 'clamp(20px, 3vw, 32px)', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(108,116,255,0.07), inset 0 1px 0 rgba(255,255,255,0.06)', position: 'relative', textAlign: 'left' }}>
            {/* Shimmer top edge */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, borderRadius: '24px 24px 0 0', background: 'linear-gradient(90deg, transparent 0%, rgba(108,116,255,0.55) 30%, rgba(159,122,234,0.55) 60%, transparent 100%)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, borderRadius: '24px 24px 0 0', background: 'linear-gradient(180deg, rgba(108,116,255,0.06) 0%, transparent 100%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <div>
                <h3 style={{ color: '#f0f4fa', fontWeight: 700, fontSize: 16, margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>⬡</span>
                  12-Month Net Worth Forecast
                </h3>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#2d3a4f', margin: 0, letterSpacing: '0.09em' }}>MODEL: GEMINI-2.5-FLASH · PRECISION: BIGINT · CONFIDENCE: 94%</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(13,220,155,0.07)', border: '1px solid rgba(13,220,155,0.18)', borderRadius: 50, padding: '7px 14px', flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0DDC9B', boxShadow: '0 0 8px #0DDC9B', display: 'block' }} />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0DDC9B', fontWeight: 700, letterSpacing: '0.08em' }}>LIVE SIMULATION</span>
              </div>
            </div>

            <div style={{ height: 'clamp(240px, 28vw, 320px)', position: 'relative', zIndex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FORECAST_DATA} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gGain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0DDC9B" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#0DDC9B" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF5C67" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#FF5C67" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#2d3a4f', fontSize: 11, fontFamily: 'monospace' }} dy={8} />
                  <YAxis hide domain={[-400000, 1700000]} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,116,255,0.05)', radius: 4 } as React.SVGProps<SVGRectElement>} />
                  <Bar dataKey="v" radius={[6, 6, 2, 2]} animationDuration={1800} animationEasing="ease-out">
                    {FORECAST_DATA.map((d, i) => <Cell key={i} fill={d.v >= 0 ? 'url(#gGain)' : 'url(#gLoss)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', marginTop: 12, position: 'relative', zIndex: 1 }}>
              {[['#0DDC9B', 'Gains'], ['#FF5C67', 'Capital Events']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2d3a4f' }}>{l}</span>
                </div>
              ))}
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, borderRadius: '0 0 24px 24px', background: 'linear-gradient(to top, rgba(18,22,36,0.95), transparent)', pointerEvents: 'none', zIndex: 2 }} />
          </div>
        </motion.div>
      </motion.div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, #080B14, transparent)', pointerEvents: 'none' }} />
    </section>
  );
}

/* ─────────────────────────────────────────────────
   INTEGRATION STRIP
───────────────────────────────────────────────── */
function IntegrationStrip() {
  const doubled = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <div style={{ background: '#080B14', padding: '56px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
      <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: '#2d3a4f', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 36 }}>Powered by Live Data Oracles</p>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, #080B14, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, #080B14, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 12, width: 'max-content' }}>
          {doubled.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', minWidth: 200, cursor: 'default', flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(108,116,255,0.2)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.05)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.02)'; }}>
              <span style={{ fontSize: 20, opacity: 0.7 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', margin: 0, lineHeight: 1.3 }}>{item.name}</p>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569', margin: 0 }}>{item.role}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   BENTO FEATURES
───────────────────────────────────────────────── */
function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{ background: 'rgba(22,27,41,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', minHeight: 240, position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)', cursor: 'default' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${f.color}55, transparent)` }} />
      <div style={{ width: 42, height: 42, borderRadius: 12, background: f.bg, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16, color: f.color, fontWeight: 700 }}>{f.icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f4fa', margin: '0 0 8px' }}>{f.title}</h3>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: 0, flex: 1 }}>{f.desc}</p>
      {f.demo}
    </motion.div>
  );
}

function BentoFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id="features" style={{ background: '#080B14', padding: 'clamp(80px, 8vw, 140px) 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, borderRadius: '50%', background: 'rgba(108,116,255,0.05)', filter: 'blur(140px)', pointerEvents: 'none' }} />
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6C74FF', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>◇ Core Architecture</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#f0f4fa', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
            Engineered for{' '}
            <span style={{ background: 'linear-gradient(90deg, #6C74FF, #9F7AEA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Absolute Clarity</span>
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>Six pillars of financial intelligence, built from the ground up.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   COPILOT
───────────────────────────────────────────────── */
function CopilotSection() {
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'FinTrack Copilot initialized. I have analyzed your portfolio across 4 asset classes. What would you like to model today?' }]);
  const [typing, setTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  /* Scroll ONLY inside the chat container */
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [msgs, typing]);

  const send = (q: string) => {
    if (typing) return;
    setMsgs(p => [...p, { from: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs(p => [...p, { from: 'bot', text: BOT_RESPONSES[q] || 'Processing...' }]);
      setTyping(false);
    }, 1600);
  };

  return (
    <section id="copilot" ref={ref} style={{ background: '#0F121C', padding: 'clamp(80px, 8vw, 140px) 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(140px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'start' }}>
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8B5CF6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>◇ AI Wealth Engine</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800, color: '#f0f4fa', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 20px' }}>
              Chat with your{' '}
              <span style={{ background: 'linear-gradient(90deg, #8B5CF6, #6C74FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Wealth Copilot.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
              A powerful RAG pipeline connects Gemini 2.5 Flash directly to your financial database. Dual personas — the meticulous <strong style={{ color: '#94a3b8', fontWeight: 600 }}>CA</strong> and the strategic <strong style={{ color: '#94a3b8', fontWeight: 600 }}>CFA</strong> — deliver context-aware insights with zero hallucinations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {Object.keys(BOT_RESPONSES).map(q => (
                <button key={q} onClick={() => send(q)} disabled={typing}
                  style={{ textAlign: 'left', padding: '14px 18px', borderRadius: 12, background: 'rgba(30,37,56,0.8)', border: '1px solid rgba(255,255,255,0.07)', cursor: typing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, transition: 'all 0.25s', opacity: typing ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!typing) { (e.currentTarget).style.borderColor = 'rgba(139,92,246,0.3)'; (e.currentTarget).style.background = 'rgba(35,42,64,0.9)'; } }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget).style.background = 'rgba(30,37,56,0.8)'; }}>
                  <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>&quot;{q}&quot;</span>
                  <span style={{ fontSize: 14, color: '#475569', flexShrink: 0 }}>→</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Gemini 2.5 Flash', 'RAG Pipeline', 'Web Speech API', 'TTS Output'].map(t => (
                <span key={t} style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Right: Chat */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.15 }}>
            <div style={{ background: '#161B29', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', height: 520 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6C74FF, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, boxShadow: '0 0 12px rgba(108,116,255,0.35)' }}>⬡</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f4fa', margin: 0 }}>AI Wealth Copilot</p>
                    <p style={{ fontSize: 11, color: '#475569', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0DDC9B', display: 'inline-block' }} />
                      Active · Gemini 2.5
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 18 }}>
                  {[0, 0.15, 0.3, 0.45, 0.3].map((d, i) => (
                    <motion.div key={i} animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                      style={{ width: 3, borderRadius: 2, background: 'linear-gradient(to top, #6C74FF, #8B5CF6)' }} />
                  ))}
                </div>
              </div>

              {/* Scrollable chat */}
              <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {msgs.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                    style={{ display: 'flex', gap: 8, maxWidth: '90%', alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.from === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: m.from === 'bot' ? 'rgba(108,116,255,0.15)' : 'rgba(71,85,105,0.4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{m.from === 'bot' ? '✦' : '·'}</div>
                    <div style={{ padding: '10px 14px', borderRadius: m.from === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-line', background: m.from === 'user' ? 'rgba(30,36,53,1)' : 'rgba(108,116,255,0.07)', border: m.from === 'user' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(108,116,255,0.15)', color: m.from === 'user' ? '#f0f4fa' : '#cbd5e1' }}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(108,116,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(108,116,255,0.07)', border: '1px solid rgba(108,116,255,0.15)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {[0, 0.15, 0.3].map(d => <motion.div key={d} animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: d }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C74FF' }} />)}
                    </div>
                  </motion.div>
                )}
              </div>

              <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <input readOnly placeholder="Ask anything about your wealth..." style={{ width: '100%', background: '#0F121C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 88px 10px 14px', fontSize: 13, color: '#94a3b8', outline: 'none', boxSizing: 'border-box' }} />
                  <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                    <button style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13 }}>🎤</button>
                    <button style={{ width: 30, height: 30, borderRadius: 8, background: '#6C74FF', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, boxShadow: '0 0 12px rgba(108,116,255,0.4)' }}>→</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────── */
function DashboardSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section style={{ background: '#080B14', padding: 'clamp(80px, 8vw, 140px) 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'rgba(20,184,166,0.05)', filter: 'blur(140px)', pointerEvents: 'none' }} />
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#14b8a6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>◇ Unified Dashboard</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#f0f4fa', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
            Visual Harmony. <span style={{ color: '#475569' }}>Zero Eye-Strain.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>Jade for gains. Terracotta for losses. A meticulously crafted palette for instant, calm cognitive processing.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ background: 'rgba(22,27,41,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(20px, 3vw, 32px)', boxShadow: '0 20px 80px rgba(0,0,0,0.5)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -1, borderRadius: 20, background: 'linear-gradient(180deg, rgba(20,184,166,0.08) 0%, transparent 30%)', pointerEvents: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ background: '#0F121C', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#f0f4fa', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: '#14b8a6' }}>◈</span> Portfolio Allocation
                  </h4>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569', margin: 0, letterSpacing: '0.1em' }}>TRAILING 30D</p>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0DDC9B', background: 'rgba(13,220,155,0.1)', padding: '4px 10px', borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>+8.4%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '80px 80px 64px', gap: 8 }}>
                {[
                  { name: 'Equities', val: '₹16.2L', pct: '32%', color: '#0DDC9B', col: '1 / 3', row: '1 / 3', fs: 18 },
                  { name: 'Crypto', val: '₹9.1L', pct: '18%', color: '#0DDC9B', col: '3 / 4', row: '1 / 3', fs: 14 },
                  { name: 'Mutual Funds', val: '₹11.1L', pct: '22%', color: '#6C74FF', col: '1 / 2', row: '3 / 4', fs: 12 },
                  { name: 'Bonds', val: '₹7.6L', pct: '15%', color: '#0DDC9B', col: '2 / 3', row: '3 / 4', fs: 12 },
                  { name: 'Real Estate', val: '₹4.0L', pct: '8%', color: '#FF5C67', col: '3 / 4', row: '3 / 4', fs: 12 },
                ].map((a, i) => (
                  <motion.div key={a.name}
                    initial={{ opacity: 0, scale: 0.88 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    style={{ gridColumn: a.col, gridRow: a.row, borderRadius: 12, background: `rgba(${a.color === '#0DDC9B' ? '13,220,155' : a.color === '#6C74FF' ? '108,116,255' : '255,92,103'},0.08)`, border: `1px solid rgba(${a.color === '#0DDC9B' ? '13,220,155' : a.color === '#6C74FF' ? '108,116,255' : '255,92,103'},0.18)`, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', lineHeight: 1.2 }}>{a.name}</span>
                    <div>
                      <p style={{ fontFamily: 'monospace', fontSize: a.fs, fontWeight: 700, color: a.color, margin: '0 0 2px' }}>{a.val}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569', margin: 0 }}>{a.pct}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Financial Freedom', value: '45', unit: '%', pct: '45%', sub: 'PAID: ₹24L / ₹53L', d: 0.5 },
                { label: 'Passive Income', value: '₹12K', unit: '/mo', pct: '15%', sub: 'TARGET: ₹80K/MO', d: 0.7 },
              ].map(g => (
                <div key={g.label} style={{ background: '#0F121C', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 20, flex: 1 }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>{g.label}</p>
                  <p style={{ fontSize: 36, fontWeight: 800, fontFamily: 'monospace', color: '#0DDC9B', margin: '0 0 14px', lineHeight: 1 }}>
                    {g.value}<span style={{ fontSize: 14, color: '#475569', fontWeight: 400 }}>{g.unit}</span>
                  </p>
                  <div style={{ height: 8, borderRadius: 50, background: 'rgba(30,37,56,1)', overflow: 'hidden', marginBottom: 8 }}>
                    <motion.div initial={{ width: 0 }} animate={inView ? { width: g.pct } : {}} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: g.d }}
                      style={{ height: '100%', borderRadius: 50, background: 'linear-gradient(90deg, #14b8a6, #0DDC9B)', boxShadow: '0 0 10px rgba(13,220,155,0.3)' }} />
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569', margin: 0 }}>{g.sub}</p>
                </div>
              ))}
              <div style={{ background: '#0F121C', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>Total Net Worth</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 32, fontWeight: 800, fontFamily: 'monospace', color: '#f0f4fa', margin: 0, lineHeight: 1 }}>₹50.5L</p>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#0DDC9B', background: 'rgba(13,220,155,0.1)', padding: '5px 10px', borderRadius: 8, fontWeight: 700 }}>↑ 12.3%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   TESTIMONIALS + CTA + FOOTER
───────────────────────────────────────────────── */
function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });
  return (
    <>
      <section id="testimonials" ref={ref} style={{ background: '#0F121C', padding: 'clamp(80px, 8vw, 140px) 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, borderRadius: '50%', background: 'rgba(108,116,255,0.05)', filter: 'blur(140px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6C74FF', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>◇ Testimonials</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#f0f4fa', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
              Built for{' '}
              <span style={{ background: 'linear-gradient(90deg, #6C74FF, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Power Users.</span>
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28, filter: 'blur(5px)' }} animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -4 }}
                style={{ background: 'rgba(22,27,41,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 26, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(108,116,255,0.4), transparent)' }} />
                <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>{[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 13 }}>★</span>)}</div>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.7, flex: 1, marginBottom: 20, fontStyle: 'italic' }}>&quot;{t.quote}&quot;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6C74FF, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.init}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f4fa', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} style={{ background: '#080B14', padding: 'clamp(80px, 8vw, 140px) 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 300, borderRadius: '50%', background: 'rgba(126,91,251,0.07)', filter: 'blur(140px)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={ctaInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
          style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6C74FF', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>◇ Get Started</p>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 900, color: '#f0f4fa', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 12px' }}>Stop recording the past.</h2>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 48px', background: 'linear-gradient(90deg, #6C74FF, #9F7AEA, #7E5BFB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Start modeling your future.
          </h2>
          <motion.a href="/auth" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0F121C', padding: '16px 32px', borderRadius: 50, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 30px rgba(255,255,255,0.1)' }}>
            Initialize Your Wealth Engine →
          </motion.a>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#2d3a4f', marginTop: 24 }}>Free forever · No credit card · Open source</p>
        </motion.div>
      </section>

      <footer style={{ background: '#04060E', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#f0f4fa', fontSize: 14 }}>FinTrack</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 6 }}>v2.0.0</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="https://github.com/Satwik290/FinTrack" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#f0f4fa'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#475569'}>⌘ Source</a>
            <a href="/docs/api" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#f0f4fa'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#475569'}>⎈ API Docs</a>
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#2d3a4f', margin: 0 }}>© {new Date().getFullYear()} FinTrack Intelligence</p>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────── */
export default function FinTrackLanding() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    /* Disable browser scroll restoration so it can't jump to #copilot */
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    /* Always start at top — instant, no animation */
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080B14; overflow-x: hidden; }
        @keyframes ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080B14; }
        ::-webkit-scrollbar-thumb { background: rgba(108,116,255,0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(108,116,255,0.45); }
        ::selection { background: rgba(108,116,255,0.3); }
      `}</style>
      <div style={{ background: '#080B14', color: '#f0f4fa', fontFamily: '-apple-system, "Segoe UI", sans-serif', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
        <Navbar />
        <HeroSection />
        <IntegrationStrip />
        <BentoFeatures />
        <CopilotSection />
        <DashboardSection />
        <TestimonialsSection />
      </div>
    </>
  );
}