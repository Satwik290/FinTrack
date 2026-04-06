'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence }     from 'framer-motion';

/* ════════════════════════════════════════════════════════════
 *  DASHBOARD LOADER
 *  Animated skeleton that mirrors the exact dashboard layout.
 *  Uses --ft-* CSS variables → works in dark & light mode.
 * ════════════════════════════════════════════════════════════ */

/* ── helpers ─────────────────────────────────────────── */
const SYNE = "'Syne','Plus Jakarta Sans',sans-serif";
const SANS = "'DM Sans','Outfit',sans-serif";
const MONO = "'Space Mono','JetBrains Mono',monospace";

/* Shimmer pulse block */
function Bone({
  w = '100%', h = 14, r = 7,
  style = {} as React.CSSProperties,
}) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--ft-border) 25%, var(--ft-hover-bg) 50%, var(--ft-border) 75%)',
      backgroundSize: '400% 100%',
      animation: 'ft-shimmer 1.6s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

/* Glass card wrapper */
function Ghost({
  children,
  style = {} as React.CSSProperties,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 16,
        background: 'var(--ft-raised)',
        border: '1px solid var(--ft-border)',
        boxShadow: '0 4px 16px var(--ft-shadow)',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}>
      {/* shimmer top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />
      {children}
    </motion.div>
  );
}

/* ── Top Progress Beam ───────────────────────────────── */
function ProgressBeam() {
  const beamRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Rapid at first, then slow near 90% (never reaches 100 until exit)
    const steps = [
      { to: 35, dur: 300 }, { to: 60, dur: 500 },
      { to: 78, dur: 700 }, { to: 88, dur: 1200 },
    ];
    let total = 0;
    steps.forEach(({ to, dur }) => {
      setTimeout(() => setPct(to), total);
      total += dur;
    });
  }, []);

  // Rotating comet angle on the beam
  const cometRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = 0, raf: number;
    const tick = () => {
      x = (x + 1.8) % 100;
      if (cometRef.current) cometRef.current.style.left = `${x}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3,
      background: 'var(--ft-border)', zIndex: 10001,
    }}>
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          background: 'linear-gradient(90deg, #6C74FF, #7E5BFB, #0DDC9B)',
          boxShadow: '0 0 12px rgba(108,116,255,0.8), 0 0 24px rgba(108,116,255,0.4)',
        }}>
        {/* Comet head */}
        <div ref={cometRef} style={{
          position: 'absolute', top: -2, width: 60, height: 7,
          borderRadius: 99, transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </motion.div>
    </div>
  );
}

/* ── Greeting skeleton ───────────────────────────────── */
function HeroSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Bone w={280} h={28} r={8} />
        <Bone w={140} h={11} r={5} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Bone w={140} h={36} r={10} />
        <Bone w={120} h={36} r={10} />
        <Bone w={36}  h={36} r={10} />
        <Bone w={36}  h={36} r={10} />
        <Bone w={36}  h={36} r={10} />
      </div>
    </motion.div>
  );
}

/* ── Bento top row — 4 equal cards ──────────────────── */
function BentoSkeleton() {
  const cards = [
    // Net Worth — taller
    { delay: 0.06, content: (
      <div style={{ padding: '22px 26px', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Bone w={120} h={9} r={4} />
          <Bone w={80}  h={9} r={4} />
        </div>
        <div>
          <Bone w={180} h={48} r={10} style={{ marginBottom: 12 }} />
          <Bone w={120} h={22} r={99} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Bone w={110} h={9} r={4} />
            <Bone w={30}  h={9} r={4} />
          </div>
          <Bone w="100%" h={4} r={99} />
        </div>
      </div>
    )},
    // Assets
    { delay: 0.1, content: (
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <Bone w={60} h={9} r={4} />
          <Bone w={28} h={9} r={4} />
        </div>
        <Bone w={140} h={28} r={7} style={{ marginBottom: 18 }} />
        {[0,1,2].map(i => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Bone w={80}  h={10} r={4} />
              <Bone w={40}  h={10} r={4} />
            </div>
            <Bone w="100%" h={3} r={99} />
          </div>
        ))}
      </div>
    )},
    // Liabilities
    { delay: 0.14, content: (
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <Bone w={80} h={9} r={4} />
          <Bone w={30} h={9} r={4} />
        </div>
        <Bone w={100} h={28} r={7} style={{ marginBottom: 16 }} />
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <Bone w={90} h={10} r={4} />
            <Bone w={35} h={10} r={4} />
          </div>
          <Bone w="100%" h={5} r={99} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 24 }}>
          <Bone w={55} h={10} r={4} />
          <Bone w={30} h={10} r={4} />
          <Bone w={25} h={10} r={4} />
        </div>
      </div>
    )},
    // Shield
    { delay: 0.18, content: (
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <Bone w={60} h={9} r={4} />
          <Bone w={50} h={9} r={4} />
        </div>
        <Bone w={110} h={28} r={7} style={{ marginBottom: 16 }} />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <Bone w={90} h={10} r={4} />
            <Bone w={30} h={10} r={4} />
          </div>
          <Bone w="100%" h={5} r={99} style={{ marginBottom: 12 }} />
        </div>
        <Bone w="100%" h={36} r={8} />
      </div>
    )},
  ];

  return (
    <div className="bento-macro" style={{ marginBottom: 12 }}>
      {cards.map((c, i) => (
        <Ghost key={i} delay={c.delay}>{c.content}</Ghost>
      ))}
    </div>
  );
}

/* ── KPI row — 5 cards ───────────────────────────────── */
function KpiSkeleton() {
  return (
    <div className="engine-kpi-row" style={{ marginBottom: 10 }}>
      {[0,1,2,3,4].map(i => (
        <Ghost key={i} delay={0.22 + i * 0.04}>
          <div style={{ padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Bone w={24} h={24} r={7} />
                <Bone w={50} h={10} r={4} />
              </div>
              <Bone w={32} h={16} r={99} />
            </div>
            <Bone w={80} h={22} r={5} style={{ marginBottom: 5 }} />
            <Bone w={60} h={9}  r={4} />
          </div>
        </Ghost>
      ))}
    </div>
  );
}

/* ── Chart skeleton ──────────────────────────────────── */
function ChartSkeleton() {
  return (
    <Ghost delay={0.44} style={{ padding: '18px 20px', marginBottom: 12 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <Bone w={100} h={30} r={7} />
          <Bone w={110} h={30} r={7} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Bone w={46} h={28} r={6} />
          <Bone w={38} h={28} r={6} />
        </div>
      </div>
      {/* Chart bars — fake area chart */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <ChartWave />
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
        {['#0DDC9B','#FF5C67','#6C74FF'].map(c => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 16, height: 2, borderRadius: 99, background: c, opacity: 0.4 }} />
            <Bone w={38} h={9} r={4} />
          </div>
        ))}
      </div>
    </Ghost>
  );
}

/* Animated fake chart wave */
function ChartWave() {
  const paths = [
    { color: '#0DDC9B', delay: 0,   d: 'M0,200 C80,180 160,60 240,40 C320,20 400,10 480,5 C560,0 620,3 640,3 L640,220 L0,220Z' },
    { color: '#FF5C67', delay: 0.2, d: 'M0,210 C60,208 140,205 220,200 C300,195 380,185 460,170 C540,155 590,140 640,130 L640,220 L0,220Z' },
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 640 220" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        {paths.map((p, i) => (
          <linearGradient key={i} id={`cg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={p.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {paths.map((p, i) => (
        <motion.path key={i} d={p.d} fill={`url(#cg${i})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.5, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
      {/* Y-axis lines */}
      {[40, 80, 120, 160, 200].map(y => (
        <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="var(--ft-chart-grid)" strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ── Heatmap skeleton ────────────────────────────────── */
function HeatmapSkeleton() {
  const cells = [
    { flex: '0 0 44%', h: 90 }, { flex: '0 0 29%', h: 90 }, { flex: '0 0 20%', h: 90 },
    { flex: '0 0 29%', h: 70 }, { flex: '0 0 44%', h: 70 }, { flex: '0 0 20%', h: 70 },
  ];
  return (
    <Ghost delay={0.52} style={{ padding: '18px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <Bone w={140} h={13} r={5} style={{ marginBottom: 6 }} />
          <Bone w={180} h={10} r={4} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['#0DDC9B','#FF5C67','#6C74FF'].map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 1, background: c, opacity: 0.5 }} />
              <Bone w={28} h={9} r={4} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {cells.map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.56 + i * 0.05, duration: 0.35 }}
            style={{ flex: c.flex, minHeight: c.h, borderRadius: 8, background: 'var(--ft-border)', flexGrow: 1, animation: 'ft-shimmer 2s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </Ghost>
  );
}

/* ── Bottom row: Insights + Recent Txns ─────────────── */
function BottomSkeleton() {
  return (
    <div className="tactical-bottom">
      {/* Insights */}
      <Ghost delay={0.6} style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <Bone w={70}  h={13} r={5} />
          <Bone w={36}  h={18} r={99} />
        </div>
        {[0,1,2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 9, padding: '10px 11px', borderRadius: 10, background: 'var(--ft-hover-bg)', marginBottom: 7 }}>
            <Bone w={13} h={13} r={4} />
            <div style={{ flex: 1 }}>
              <Bone w="40%" h={9}  r={4} style={{ marginBottom: 6 }} />
              <Bone w="90%" h={11} r={4} style={{ marginBottom: 4 }} />
              <Bone w="70%" h={10} r={4} />
            </div>
          </div>
        ))}
      </Ghost>

      {/* Recent Transactions */}
      <Ghost delay={0.64} style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <Bone w={160} h={13} r={5} />
          <Bone w={50}  h={12} r={4} />
        </div>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 6px', borderBottom: i < 5 ? '1px solid var(--ft-border)' : 'none' }}>
            <Bone w={30} h={30} r={8} />
            <div style={{ flex: 1 }}>
              <Bone w="55%" h={11} r={4} style={{ marginBottom: 5 }} />
              <Bone w="35%" h={9}  r={4} />
            </div>
            <Bone w={60} h={11} r={4} />
          </div>
        ))}
      </Ghost>
    </div>
  );
}

/* ── Loading status text with typewriter feel ────────── */
const PHASES = [
  'Syncing portfolios…',
  'Crunching numbers…',
  'Fetching wealth data…',
  'Almost there…',
];

function StatusText() {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        setPhase(p => (p + 1) % PHASES.length);
        setVisible(true);
      }, 300);
    };
    const id = setInterval(cycle, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.p
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      style={{ fontFamily: MONO, fontSize: 11, color: 'var(--ft-text2)', letterSpacing: '0.5px', marginBottom: 16, textAlign: 'right' }}>
      {PHASES[phase]}
    </motion.p>
  );
}

/* ════════════════════════════════════════════════════════════
 *  MAIN EXPORT
 * ════════════════════════════════════════════════════════════ */
export function DashboardLoader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    // Auto-dismiss after 1.8s — replace with real data-ready signal if preferred
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        key="dash-loader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
        style={{ minHeight: '100vh', background: 'var(--ft-bg)', position: 'relative' }}>

        <style>{`
          @keyframes ft-shimmer {
            0%   { background-position: 200% 0 }
            100% { background-position: -200% 0 }
          }
          .bento-macro {
            display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 12px; align-items: stretch;
          }
          .engine-kpi-row {
            display: grid; grid-template-columns: repeat(5,1fr); gap: 10px;
          }
          .tactical-bottom {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; align-items: start;
          }
          @media (max-width: 1100px) {
            .bento-macro    { grid-template-columns: 1fr 1fr; }
            .engine-kpi-row { grid-template-columns: repeat(3,1fr); }
            .tactical-bottom{ grid-template-columns: 1fr; }
          }
          @media (max-width: 700px) {
            .bento-macro    { grid-template-columns: 1fr 1fr; }
            .engine-kpi-row { grid-template-columns: 1fr 1fr; }
            .tactical-bottom{ grid-template-columns: 1fr; }
          }
        `}</style>

        {/* Top progress beam */}
        <ProgressBeam />

        <div style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: '0 4px', paddingTop: 6 }}>
          <HeroSkeleton />
          <BentoSkeleton />

          {/* KPI + chart zone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 12 }}>
            <KpiSkeleton />
            <ChartSkeleton />
          </div>

          <HeatmapSkeleton />

          <StatusText />

          <BottomSkeleton />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════════════════
 *  WRAPPER — drop-in replacement in your page.tsx
 *
 *  Usage in DashboardPage:
 *
 *  const [loaded, setLoaded] = useState(false);
 *  if (!loaded) return <DashboardLoader onDone={() => setLoaded(true)} />;
 *
 * ════════════════════════════════════════════════════════════ */