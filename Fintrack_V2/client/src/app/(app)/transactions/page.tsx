'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransactions, useCreateTransaction, useDeleteTransaction, CATEGORY_COLORS, MOCK_TRANSACTIONS } from '@/hooks/useTransactions';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Salary', 'Investment', 'Other'];

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.preprocess((v) => Number(v), z.number().positive('Amount must be positive')),
  category: z.string().min(1),
  merchant: z.string().min(1, 'Merchant is required'),
  date: z.string().min(1),
  note: z.string().optional(),
});
type FormData = {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  merchant: string;
  date: string;
  note?: string;
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Healthcare: '💊', Utilities: '⚡', Salary: '💼', Investment: '📈', Other: '📦',
  };
  return map[cat] ?? '💳';
}

export default function TransactionsPage() {
  const { data: transactions = MOCK_TRANSACTIONS } = useTransactions();
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0] },
  });

  const filtered = transactions
    .filter((t) => filterType === 'all' || t.type === filterType)
    .filter((t) =>
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  function onSubmit(data: FormData) {
    createMutation.mutate(data, { onSuccess: () => { setShowModal(false); reset(); } });
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{transactions.length} transactions this month</p>
        </div>
        <button className="btn btn-primary" id="add-transaction-btn" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input" placeholder="Search transactions…"
            style={{ paddingLeft: 36, height: 38 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="btn btn-sm"
              style={{
                background: filterType === t ? 'var(--indigo-500)' : 'var(--bg-surface-2)',
                color: filterType === t ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            No transactions found
          </div>
        ) : (
          <div>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: (CATEGORY_COLORS[t.category] ?? '#94a3b8') + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>
                  {getCategoryEmoji(t.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{t.merchant}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge badge-${t.type === 'income' ? 'success' : 'indigo'}`}>{t.category}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontWeight: 700, fontSize: 15, flexShrink: 0,
                  color: t.type === 'income' ? 'var(--success)' : 'var(--text-primary)',
                }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
                <button
                  className="btn btn-icon"
                  onClick={() => setDeleteId(t.id)}
                  style={{ width: 32, height: 32, color: 'var(--danger)', marginLeft: 4 }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
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
                <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>Add Transaction</h2>
                <button className="btn btn-icon" onClick={() => setShowModal(false)} style={{ width: 32, height: 32 }}>
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Type */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Type</label>
                    <select {...register('type')} className="input">
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  {/* Amount */}
                  <div>
                    <label style={labelStyle}>Amount (₹)</label>
                    <input {...register('amount')} type="number" placeholder="0.00" className={`input ${errors.amount ? 'input-error' : ''}`} />
                    {errors.amount && <p style={errStyle}>{errors.amount.message}</p>}
                  </div>
                  {/* Category */}
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select {...register('category')} className="input">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Merchant */}
                  <div>
                    <label style={labelStyle}>Merchant / Source</label>
                    <input {...register('merchant')} placeholder="e.g. Swiggy" className={`input ${errors.merchant ? 'input-error' : ''}`} />
                    {errors.merchant && <p style={errStyle}>{errors.merchant.message}</p>}
                  </div>
                  {/* Date */}
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input {...register('date')} type="date" className="input" />
                  </div>
                  {/* Note */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Note (optional)</label>
                    <input {...register('note')} placeholder="Any note…" className="input" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button
                    type="submit" id="save-transaction-btn"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Saving…' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 32, maxWidth: 360, width: '100%' }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Delete transaction?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                <button
                  className="btn"
                  style={{ flex: 1, background: 'var(--danger)', color: '#fff' }}
                  onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' };
const errStyle: React.CSSProperties = { color: 'var(--danger)', fontSize: 12, marginTop: 4 };
