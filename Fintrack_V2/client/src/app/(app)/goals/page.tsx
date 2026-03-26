'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
}

const NOW = new Date('2026-03-26').getTime();

const GOALS: Goal[] = [
  { id: '1', title: 'Emergency Fund', target: 300000, current: 180000, deadline: '2026-12-31', icon: '🛡️', color: '#6366f1' },
  { id: '2', title: 'Europe Trip',    target: 200000, current: 45000,  deadline: '2027-06-30', icon: '✈️', color: '#ec4899' },
  { id: '3', title: 'New Laptop',     target: 80000,  current: 60000,  deadline: '2026-06-30', icon: '💻', color: '#10b981' },
  { id: '4', title: 'Investment Fund',target: 500000, current: 95000,  deadline: '2028-01-01', icon: '📈', color: '#f59e0b' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function CircleProgress({ pct, color, size = 100 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-surface-2)" strokeWidth={10} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export default function GoalsPage() {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  function onSubmit(data: unknown) {
    console.log('New goal:', data);
    setShowModal(false);
    reset();
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">Track your financial milestones</p>
        </div>
        <button className="btn btn-primary" id="add-goal-btn" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add Goal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {GOALS.map((g, i) => {
          const pct = Math.round((g.current / g.target) * 100);
          const daysLeft = Math.ceil((new Date(g.deadline).getTime() - NOW) / 86400000);
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 24 }}>{g.icon}</span>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginTop: 6 }}>{g.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </p>
                </div>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <CircleProgress pct={pct} color={g.color} size={88} />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: g.color }}>{pct}%</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmt(g.current)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(g.target)}</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    style={{ background: `linear-gradient(90deg, ${g.color}, ${g.color}aa)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {fmt(g.target - g.current)} remaining · due {new Date(g.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>New Goal</h2>
                <button className="btn btn-icon" onClick={() => setShowModal(false)} style={{ width: 32, height: 32 }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Goal title</label>
                  <input {...register('title')} placeholder="e.g. Emergency Fund" className="input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Target amount (₹)</label>
                    <input {...register('target')} type="number" placeholder="100000" className="input" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Deadline</label>
                    <input {...register('deadline')} type="date" className="input" required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" id="save-goal-btn" className="btn btn-primary" style={{ flex: 2 }}>Create Goal</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' };
