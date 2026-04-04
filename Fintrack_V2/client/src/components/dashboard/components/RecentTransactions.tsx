'use client';
import { motion }            from 'framer-motion';
import { ChevronRight }      from 'lucide-react';
import Link                  from 'next/link';
import { useDashboardStore } from '@/hooks/useDashboard';
import { C, MONO, SYNE, SANS, fmtINR, CATEGORY_EMOJI } from '../../../utils/dashboard/tokens';
import { Transaction }       from '../../../utils/dashboard/types';
import { Shard }             from './Shard';

interface RecentTransactionsProps { txns: Transaction[]; }

export function RecentTransactions({ txns }: RecentTransactionsProps) {
  const { isMasked } = useDashboardStore();
  const recent = [...txns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}>
      <Shard style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontFamily: SYNE, fontSize: 13, fontWeight: 700, color: C.text0 }}>Recent Transactions</p>
          <Link href="/transactions" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: C.indigo, textDecoration: 'none', fontFamily: SANS }}>
            Ledger <ChevronRight size={11} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!recent.length ? (
            <p style={{ fontSize: 11, color: C.text1, textAlign: 'center', padding: '12px 0', fontFamily: SANS }}>No transactions yet</p>
          ) : recent.map((t, i) => (
            <motion.div key={t.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 6px', borderBottom: i < recent.length - 1 ? `1px solid ${C.border}` : 'none', borderRadius: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, position: 'relative' }}>
                {CATEGORY_EMOJI[t.category] ?? '💳'}
                <div style={{ position: 'absolute', top: 1, right: 1, width: 5, height: 5, borderRadius: '50%', background: t.type === 'income' ? C.jade : C.indigo }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.text0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: SANS }}>{t.merchant}</p>
                <p style={{ fontSize: 9, color: C.text2, fontFamily: SANS }}>{t.category} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: t.type === 'income' ? C.jade : C.text0, flexShrink: 0 }}>
                {t.type === 'income' ? '+' : '-'}{isMasked ? '••••' : fmtINR(t.amount)}
              </p>
            </motion.div>
          ))}
        </div>
      </Shard>
    </motion.div>
  );
}