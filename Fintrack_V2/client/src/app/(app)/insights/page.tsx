'use client';
import { motion } from 'framer-motion';
import {
  TrendingDown, TrendingUp, AlertTriangle, PiggyBank,
  Lightbulb, ShoppingCart, Zap, BarChart3,
} from 'lucide-react';

const INSIGHTS = [
  {
    id: 1, type: 'warning', icon: TrendingDown, color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    tag: 'Spending Alert',
    title: 'Food spending up 30% this week',
    body: 'You\'ve spent ₹6,200 on food, which is 30% more than last week. Your highest spend was at Restaurant (₹1,800). Consider cooking at home more often.',
    action: 'Set a food alert',
  },
  {
    id: 2, type: 'danger', icon: AlertTriangle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    tag: 'Budget Overrun',
    title: 'Shopping budget exceeded by ₹700',
    body: 'Your shopping limit was ₹5,000 but you\'ve spent ₹5,700. Recent purchases include Amazon (₹3,200) and Myntra (₹2,500). Consider pausing discretionary spends.',
    action: 'Review budget',
  },
  {
    id: 3, type: 'success', icon: PiggyBank, color: 'var(--success)', bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    tag: 'Great Job!',
    title: 'You saved 66% of income this month',
    body: 'You saved ₹56,000 out of ₹85,000 total income. This puts you ahead of your 3-month emergency fund goal. Keep it up!',
    action: 'View goals',
  },
  {
    id: 4, type: 'info', icon: Lightbulb, color: 'var(--info)', bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    tag: 'Tip',
    title: 'Optimize your subscription costs',
    body: 'You spent ₹299 on Netflix this month. Your total recurring subscriptions add up to ₹999/month. Consider auditing which ones you actually use.',
    action: 'View subscriptions',
  },
  {
    id: 5, type: 'success', icon: TrendingUp, color: 'var(--success)', bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    tag: 'Investment',
    title: 'Dividend income received',
    body: 'You received a ₹5,000 dividend payment. Reinvesting this could grow your portfolio by an estimated 0.6% over the next year.',
    action: 'Explore options',
  },
  {
    id: 6, type: 'warning', icon: Zap, color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    tag: 'Anomaly',
    title: 'Utilities bill 37% higher than usual',
    body: 'Your electricity bill was ₹620 this month, compared to your 6-month average of ₹452. This could indicate an appliance running inefficiently.',
    action: 'Check bill',
  },
];

const STATS = [
  { label: 'Spending vs last month', value: '-18%', positive: true, icon: TrendingDown },
  { label: 'Budget adherence', value: '83%', positive: true, icon: BarChart3 },
  { label: 'Avg daily spend', value: '₹935', positive: false, icon: ShoppingCart },
  { label: 'Potential savings', value: '₹4,200', positive: true, icon: PiggyBank },
];

export default function InsightsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Insights</h1>
          <p className="page-subtitle">Personalized analysis powered by your spending data</p>
        </div>
        <span className="badge badge-indigo" style={{ padding: '6px 14px', fontSize: 13 }}>
          ✨ AI-Powered
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
            style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: s.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.icon size={20} style={{ color: s.positive ? 'var(--success)' : 'var(--danger)' }} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.positive ? 'var(--success)' : 'var(--danger)', letterSpacing: -0.5 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger animate-fade-in">
        {INSIGHTS.map((ins, i) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: ins.bg,
              border: `1px solid ${ins.border}`,
              borderRadius: 16, padding: 22,
              display: 'flex', alignItems: 'flex-start', gap: 16,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: ins.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ins.icon size={20} style={{ color: ins.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                  color: ins.color, textTransform: 'uppercase',
                }}>
                  {ins.tag}
                </span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
                {ins.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins.body}</p>
            </div>
            <button className="btn btn-sm btn-ghost" style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: 12 }}>
              {ins.action}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
