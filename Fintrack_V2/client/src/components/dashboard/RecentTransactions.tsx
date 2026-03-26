'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Transaction, CATEGORY_COLORS } from '@/hooks/useTransactions';

interface Props { transactions: Transaction[] }

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function RecentTransactions({ transactions }: Props) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
      style={{ padding: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Recent Transactions</h3>
        <Link href="/transactions" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--indigo-600)', fontWeight: 600, textDecoration: 'none' }}>
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recent.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 8px', borderRadius: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: CATEGORY_COLORS[t.category] + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15,
            }}>
              {getCategoryEmoji(t.category)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.merchant}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t.category} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span style={{
              fontWeight: 700, fontSize: 14, flexShrink: 0,
              color: t.type === 'income' ? 'var(--success)' : 'var(--text-primary)',
            }}>
              {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Healthcare: '💊', Utilities: '⚡', Salary: '💼', Investment: '📈', Other: '📦',
  };
  return map[cat] ?? '💳';
}
