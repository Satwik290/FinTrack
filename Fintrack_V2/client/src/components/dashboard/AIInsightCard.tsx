'use client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, AlertTriangle, PiggyBank, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const INSIGHTS = [
  {
    id: 1, type: 'warning', icon: TrendingDown,
    title: 'Food spending up 30%',
    body: 'You spent ₹6,200 on food this month, 30% more than last month. Consider meal prepping!',
    color: 'var(--warning)', bg: 'var(--warning-bg)',
  },
  {
    id: 2, type: 'danger', icon: AlertTriangle,
    title: 'Shopping budget exceeded',
    body: 'Your shopping budget of ₹5,000 has been exceeded by ₹700. Review your recent purchases.',
    color: 'var(--danger)', bg: 'var(--danger-bg)',
  },
  {
    id: 3, type: 'success', icon: PiggyBank,
    title: 'Great savings this month!',
    body: 'You saved ₹56,000 this month (66% of income). You\'re on track for your emergency fund goal.',
    color: 'var(--success)', bg: 'var(--success-bg)',
  },
];

export function AIInsightCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
      style={{ padding: 24, gridColumn: 'span 2' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>AI Insights</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Personalized for you</p>
          </div>
        </div>
        <Link href="/insights" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--indigo-600)', fontWeight: 600, textDecoration: 'none' }}>
          All insights <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {INSIGHTS.map((ins, i) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.08 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', borderRadius: 12,
              background: ins.bg, border: `1px solid ${ins.color}30`,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: ins.color + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ins.icon size={15} style={{ color: ins.color }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{ins.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
