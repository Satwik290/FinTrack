'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Lightbulb, Zap, X } from 'lucide-react';
import { useInsights, useDashboardStore } from '@/hooks/useDashboard';
import { V, MONO, SYNE, SANS } from '../../../utils/dashboard/tokens';
import { Shard } from './Shard';

const INS_CFG = {
  danger:  { c: V.terra,    bg: 'rgba(255,92,103,0.07)',  border: 'rgba(255,92,103,0.18)',  icon: AlertTriangle, tag: 'Urgent' },
  warning: { c: V.amber,    bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.18)',  icon: Zap,           tag: 'Watch'  },
  success: { c: V.jade,     bg: 'rgba(13,220,155,0.06)',  border: 'rgba(13,220,155,0.18)',  icon: CheckCircle,   tag: 'Win'    },
  info:    { c: '#42A5F5',  bg: 'rgba(66,165,245,0.07)',  border: 'rgba(66,165,245,0.18)',  icon: Lightbulb,     tag: 'Tip'    },
} as const;

export function InsightsPanel() {
  const { data: raw = [] } = useInsights();
  const { dismissedInsights, dismissInsight } = useDashboardStore();
  const visible = raw.filter(i => !dismissedInsights.includes(i.id)).slice(0, 4);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.4 }}>
      <Shard style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: 'var(--ft-text0)' }}>Insights</p>
          <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: `linear-gradient(135deg,${V.indigo},${V.violet})`, color: '#fff', fontWeight: 700, fontFamily: MONO }}>✦ AI</span>
        </div>
        {!visible.length ? (
          <div style={{ padding: '12px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--ft-text1)', fontFamily: SANS }}>No urgent alerts right now ✓</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <AnimatePresence>
              {visible.map((ins, idx) => {
                const cfg = INS_CFG[ins.severity];
                const Icon = cfg.icon;
                return (
                  <motion.div key={ins.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ delay: idx * 0.04 }}
                    style={{ display: 'flex', gap: 9, padding: '9px 11px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon size={13} color={cfg.c} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: cfg.c, letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: MONO }}>{cfg.tag}</span>
                        <button onClick={() => dismissInsight(ins.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ft-text2)', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <X size={9} />
                        </button>
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ft-text0)', lineHeight: 1.3, marginBottom: 2, fontFamily: SANS }}>{ins.title}</p>
                      <p style={{ fontSize: 10, color: 'var(--ft-text1)', lineHeight: 1.4, fontFamily: SANS }}>{ins.body}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Shard>
    </motion.div>
  );
}