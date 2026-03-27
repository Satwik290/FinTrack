'use client';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, PiggyBank, Lightbulb, ShoppingCart, Zap, BarChart3 } from 'lucide-react';

const INSIGHTS = [
  { id: 1, icon: TrendingDown,  color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', tag: 'Spending Alert',  title: 'Food spending up 30% this week',        body: 'You\'ve spent ₹6,200 on food, 30% more than last week. Your highest spend was at Restaurant (₹1,800).', action: 'Set alert' },
  { id: 2, icon: AlertTriangle, color: 'var(--danger)',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  tag: 'Budget Overrun', title: 'Shopping budget exceeded by ₹700',       body: 'Your shopping limit was ₹5,000 but you\'ve spent ₹5,700. Consider pausing discretionary spends.', action: 'Review budget' },
  { id: 3, icon: PiggyBank,     color: 'var(--success)', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', tag: 'Great Job!',      title: 'You saved 66% of income this month',    body: 'You saved ₹56,000 out of ₹85,000 total income. You\'re on track for your emergency fund goal.', action: 'View goals' },
  { id: 4, icon: Lightbulb,     color: 'var(--info)',    bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', tag: 'Tip',            title: 'Optimize your subscription costs',       body: 'Your total recurring subscriptions add up to ₹999/month. Consider auditing which ones you use.', action: 'View subs' },
  { id: 5, icon: TrendingUp,    color: 'var(--success)', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', tag: 'Investment',     title: 'Dividend income received',               body: 'You received a ₹5,000 dividend. Reinvesting this could grow your portfolio by 0.6% over a year.', action: 'Explore' },
  { id: 6, icon: Zap,           color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', tag: 'Anomaly',        title: 'Utilities bill 37% higher than usual', body: 'Your electricity bill was ₹620 vs your 6-month average of ₹452. An appliance may be inefficient.', action: 'Check bill' },
];

const STATS = [
  { label: 'vs last month',     value: '-18%',   positive: true,  icon: TrendingDown },
  { label: 'Budget adherence',  value: '83%',    positive: true,  icon: BarChart3    },
  { label: 'Avg daily spend',   value: '₹935',   positive: false, icon: ShoppingCart },
  { label: 'Potential savings', value: '₹4,200', positive: true,  icon: PiggyBank    },
];

export default function InsightsPage() {
  return (
    <>
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        @media (max-width: 1023px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        }
        .insight-card {
          display: flex; align-items: flex-start; gap: 14px;
          border-radius: 16px; padding: 18px;
        }
        @media (max-width: 480px) {
          .insight-card { padding: 14px; gap: 10px; }
          .insight-action { display: none; }
        }
      `}</style>

      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">AI Insights</h1>
            <p className="page-subtitle">Personalized analysis from your data</p>
          </div>
          <span className="badge badge-indigo" style={{ padding: '6px 14px', fontSize: 12 }}>✨ AI-Powered</span>
        </div>

        <div className="stats-grid">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: s.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} style={{ color: s.positive ? 'var(--success)' : 'var(--danger)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.positive ? 'var(--success)' : 'var(--danger)', letterSpacing: -0.5 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, lineHeight: 1.3 }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {INSIGHTS.map((ins, i) => (
            <motion.div key={ins.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="insight-card"
              style={{ background: ins.bg, border: `1px solid ${ins.border}` }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: ins.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ins.icon size={18} style={{ color: ins.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: ins.color, textTransform: 'uppercase' }}>{ins.tag}</span>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: '4px 0', lineHeight: 1.3 }}>{ins.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins.body}</p>
              </div>
              <button className="btn btn-sm btn-ghost insight-action" style={{ flexShrink: 0, fontSize: 12, whiteSpace: 'nowrap' }}>{ins.action}</button>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}