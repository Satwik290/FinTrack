'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Lightbulb, Zap, X, RefreshCw, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useInsights, useDashboardStore } from '@/hooks/useDashboard';
import { V, MONO, SYNE, SANS } from '../../../utils/dashboard/tokens';
import { Shard } from './Shard';

/* ── Mock insights (used when API returns nothing) ── */
const MOCK_INSIGHTS = [
  {
    id: 'mock-1',
    severity: 'warning' as const,
    type: 'anomaly' as const,
    title: 'Food spending up 34% this month',
    body: 'You\'ve spent ₹8,200 on food vs ₹6,100 last month. Three restaurant visits over ₹1,500 each drove the spike.',
  },
  {
    id: 'mock-2',
    severity: 'success' as const,
    type: 'achievement' as const,
    title: 'Savings rate hit 28% — personal best!',
    body: 'You saved ₹18,400 this month. That\'s 8% higher than your 3-month average. Keep it up.',
  },
  {
    id: 'mock-3',
    severity: 'info' as const,
    type: 'tip' as const,
    title: 'SIP due in 3 days',
    body: 'Your ₹5,000 SIP in Axis Bluechip Fund is scheduled for Apr 9. Ensure your account has sufficient balance.',
  },
  {
    id: 'mock-4',
    severity: 'danger' as const,
    type: 'forecast' as const,
    title: 'Budget 92% exhausted — 8 days left',
    body: 'Entertainment budget (₹4,600 / ₹5,000) is nearly full. At this rate you\'ll overshoot by ₹1,200.',
  },
];

const INS_CFG = {
  danger: {
    c: '#FF5C67',
    bg: 'var(--ins-danger-bg)',
    border: 'var(--ins-danger-border)',
    icon: Flame,
    tag: 'Urgent',
    tagBg: 'rgba(255,92,103,0.12)',
  },
  warning: {
    c: '#F59E0B',
    bg: 'var(--ins-warning-bg)',
    border: 'var(--ins-warning-border)',
    icon: Zap,
    tag: 'Watch',
    tagBg: 'rgba(245,158,11,0.12)',
  },
  success: {
    c: '#0DDC9B',
    bg: 'var(--ins-success-bg)',
    border: 'var(--ins-success-border)',
    icon: CheckCircle,
    tag: 'Win',
    tagBg: 'rgba(13,220,155,0.12)',
  },
  info: {
    c: '#6C74FF',
    bg: 'var(--ins-info-bg)',
    border: 'var(--ins-info-border)',
    icon: Lightbulb,
    tag: 'Tip',
    tagBg: 'rgba(108,116,255,0.12)',
  },
} as const;

const THEME_STYLE = `
  :root, [data-theme="dark"] {
    --ins-danger-bg:     rgba(255,92,103,0.07);
    --ins-danger-border: rgba(255,92,103,0.2);
    --ins-warning-bg:    rgba(245,158,11,0.07);
    --ins-warning-border:rgba(245,158,11,0.2);
    --ins-success-bg:    rgba(13,220,155,0.06);
    --ins-success-border:rgba(13,220,155,0.2);
    --ins-info-bg:       rgba(108,116,255,0.07);
    --ins-info-border:   rgba(108,116,255,0.2);
    --ins-title-color:   #F0F4FA;
    --ins-body-color:    #8897A7;
    --ins-dismiss-color: #3D4F61;
  }
  [data-theme="light"] {
    --ins-danger-bg:     rgba(255,92,103,0.06);
    --ins-danger-border: rgba(255,92,103,0.18);
    --ins-warning-bg:    rgba(245,158,11,0.06);
    --ins-warning-border:rgba(245,158,11,0.18);
    --ins-success-bg:    rgba(13,220,155,0.05);
    --ins-success-border:rgba(13,220,155,0.18);
    --ins-info-bg:       rgba(108,116,255,0.06);
    --ins-info-border:   rgba(108,116,255,0.18);
    --ins-title-color:   #0D1117;
    --ins-body-color:    #4A5568;
    --ins-dismiss-color: #94A3B8;
  }
`;

export function InsightsPanel() {
  const { data: raw = [], isLoading, refetch, isFetching } = useInsights();
  const { dismissedInsights, dismissInsight } = useDashboardStore();
  const [showMock, setShowMock] = useState(false);

  /* Use real data if available, otherwise fall back to mocks */
  const source = raw.length > 0 ? raw : MOCK_INSIGHTS;
  const isMockData = raw.length === 0;
  const visible = source.filter(i => !dismissedInsights.includes(i.id)).slice(0, 4);

  /* Severity order for sorting: danger → warning → info → success */
  const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2, success: 3 };
  const sorted = [...visible].sort((a, b) =>
    (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
  );

  return (
    <>
      <style>{THEME_STYLE}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.4 }}
      >
        <Shard style={{ padding: '16px 18px', minHeight: 180 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: 'var(--ins-title-color)', margin: 0 }}>
                Insights
              </p>
              {isMockData && (
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 99,
                  background: 'rgba(108,116,255,0.1)',
                  color: '#6C74FF',
                  fontFamily: MONO, fontWeight: 700,
                  border: '1px solid rgba(108,116,255,0.2)',
                }}>
                  DEMO
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: '1px solid var(--ft-border)',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ins-dismiss-color)',
                }}
              >
                <RefreshCw size={11} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
              </motion.button>
              <span style={{
                fontSize: 9, padding: '2px 8px', borderRadius: 99,
                background: 'linear-gradient(135deg,#6C74FF,#7E5BFB)',
                color: '#fff', fontWeight: 700, fontFamily: MONO,
              }}>
                ✦ AI
              </span>
            </div>
          </div>

          {/* Summary badges */}
          {sorted.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {(['danger', 'warning', 'info', 'success'] as const).map(sev => {
                const count = sorted.filter(i => i.severity === sev).length;
                if (!count) return null;
                const cfg = INS_CFG[sev];
                return (
                  <span key={sev} style={{
                    fontSize: 9, fontFamily: MONO, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 99,
                    background: cfg.tagBg, color: cfg.c,
                    border: `1px solid ${cfg.border}`,
                  }}>
                    {count} {cfg.tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Insights list */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 64, borderRadius: 10,
                  background: 'linear-gradient(90deg, var(--ft-border) 25%, var(--ft-border-hi, rgba(108,116,255,0.08)) 50%, var(--ft-border) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : !sorted.length ? (
            <div style={{ padding: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={24} color="#0DDC9B" />
              <p style={{ fontSize: 12, color: 'var(--ins-body-color)', fontFamily: SANS, margin: 0 }}>
                All clear — no alerts right now
              </p>
              <p style={{ fontSize: 10, color: 'var(--ins-dismiss-color)', fontFamily: SANS, margin: 0 }}>
                Add transactions for AI-powered insights
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <AnimatePresence>
                {sorted.map((ins, idx) => {
                  const cfg = INS_CFG[ins.severity];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={ins.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, scale: 0.97 }}
                      transition={{ delay: idx * 0.05, duration: 0.25 }}
                      layout
                      style={{
                        display: 'flex', gap: 9, padding: '10px 12px',
                        borderRadius: 10,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {/* Severity accent strip */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 2.5,
                        background: cfg.c, borderRadius: '10px 0 0 10px',
                      }} />

                      <Icon size={13} color={cfg.c} style={{ flexShrink: 0, marginTop: 2 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{
                            fontSize: 8, fontWeight: 700, color: cfg.c,
                            letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: MONO,
                          }}>
                            {cfg.tag}
                          </span>
                          <button
                            onClick={() => dismissInsight(ins.id)}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              color: 'var(--ins-dismiss-color)', padding: 0,
                              display: 'flex', alignItems: 'center',
                              borderRadius: 4, width: 16, height: 16,
                              justifyContent: 'center',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <X size={9} />
                          </button>
                        </div>
                        <p style={{
                          fontSize: 11, fontWeight: 600,
                          color: 'var(--ins-title-color)',
                          lineHeight: 1.35, marginBottom: 3, fontFamily: SANS,
                        }}>
                          {ins.title}
                        </p>
                        <p style={{
                          fontSize: 10, color: 'var(--ins-body-color)',
                          lineHeight: 1.45, fontFamily: SANS, margin: 0,
                        }}>
                          {ins.body}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Footer: mock data nudge */}
          {isMockData && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{
                marginTop: 12, padding: '8px 10px', borderRadius: 8,
                background: 'rgba(108,116,255,0.06)',
                border: '1px dashed rgba(108,116,255,0.2)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <TrendingUp size={11} color="#6C74FF" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 9, color: '#6C74FF', fontFamily: SANS, margin: 0, lineHeight: 1.4 }}>
                Add real transactions to unlock live AI insights based on your spending patterns.
              </p>
            </motion.div>
          )}
        </Shard>
      </motion.div>
    </>
  );
}