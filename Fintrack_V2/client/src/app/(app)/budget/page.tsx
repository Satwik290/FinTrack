'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Flame } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgets, useCreateBudget, MOCK_BUDGETS, CATEGORY_COLORS } from '@/hooks/useBudgets';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Other'];

const schema = z.object({
  category: z.string().min(1),
  limit: z.preprocess((v) => Number(v), z.number().positive('Limit must be positive')),
});
type FormData = { category: string; limit: number };

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function getProgressColor(pct: number): 'safe' | 'warn' | 'danger' {
  if (pct >= 100) return 'danger';
  if (pct >= 80)  return 'warn';
  return 'safe';
}

export default function BudgetPage() {
  const { data: budgets = MOCK_BUDGETS } = useBudgets();
  const createBudget = useCreateBudget();
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { category: 'Food' },
  });

  const totalBudget   = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget    = budgets.filter((b) => b.spent > b.limit).length;
  const overallPct    = Math.round((totalSpent / totalBudget) * 100);

  function onSubmit(data: FormData) {
    createBudget.mutate({ ...data, period: 'monthly' }, { onSuccess: () => { setShowModal(false); reset(); } });
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Monthly budgets — {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" id="add-budget-btn" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add Budget
        </button>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 20, padding: 24, marginBottom: 24, color: '#fff',
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          display: 'flex', alignItems: 'center', gap: 32,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ opacity: 0.75, fontSize: 13, marginBottom: 4 }}>Total Spent</p>
          <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{fmt(totalSpent)}</p>
          <p style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>of {fmt(totalBudget)} budgeted</p>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Overall</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{overallPct}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(overallPct, 100)}%` }}
              transition={{ duration: 1, ease: [0.16,1,0.3,1] }}
              style={{ height: '100%', background: '#fff', borderRadius: 99 }}
            />
          </div>
          {overBudget > 0 && (
            <p style={{ fontSize: 12, opacity: 0.85, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Flame size={13} /> {overBudget} budget{overBudget > 1 ? 's' : ''} exceeded
            </p>
          )}
        </div>
      </motion.div>

      {/* Budget cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {budgets.map((b, i) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const level = getProgressColor(pct);
          const color = CATEGORY_COLORS[b.category] ?? '#6366f1';
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card"
              style={{ padding: 22 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                  }}>
                    {getCatEmoji(b.category)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{b.category}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly</p>
                  </div>
                </div>
                {pct >= 100 && <Flame size={20} style={{ color: 'var(--danger)' }} />}
                {pct >= 80 && pct < 100 && <span className="badge badge-warning">80%+</span>}
              </div>

              <div className="progress-track" style={{ marginBottom: 10 }}>
                <motion.div
                  className={`progress-fill ${level}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.9, delay: i * 0.07 + 0.2, ease: [0.16,1,0.3,1] }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {fmt(b.spent)} spent
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: level === 'danger' ? 'var(--danger)' : level === 'warn' ? 'var(--warning)' : 'var(--text-primary)',
                }}>
                  {pct}% of {fmt(b.limit)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <div className="modal-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>Add Budget</h2>
                <button className="btn btn-icon" onClick={() => setShowModal(false)} style={{ width: 32, height: 32 }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select {...register('category')} className="input">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Monthly limit (₹)</label>
                  <input {...register('limit')} type="number" placeholder="0" className={`input ${errors.limit ? 'input-error' : ''}`} />
                  {errors.limit && <p style={errStyle}>{errors.limit.message}</p>}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" id="save-budget-btn" className="btn btn-primary" style={{ flex: 2 }} disabled={createBudget.isPending}>
                    {createBudget.isPending ? 'Saving…' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getCatEmoji(cat: string): string {
  const map: Record<string, string> = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Healthcare: '💊', Utilities: '⚡', Other: '📦',
  };
  return map[cat] ?? '💰';
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' };
const errStyle: React.CSSProperties = { color: 'var(--danger)', fontSize: 12, marginTop: 4 };
