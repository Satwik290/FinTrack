'use client';
import { motion }              from 'framer-motion';
import { Eye, EyeOff, RefreshCw, Plus, Sun, Moon } from 'lucide-react';
import { useRouter }           from 'next/navigation';
import { useWealth }           from '@/hooks/usewealth';
import { useDashboardStore }   from '@/hooks/useDashboard';
import { useAppStore }         from '@/store/useAppStore';
import { useTheme }            from '../../../hooks/usetheme';
import { V, SYNE, SANS }       from '../../../utils/dashboard/tokens';
import { CopilotOmnibar }      from './CopilotOmnibar';

export function CommandHero() {
  const user     = useAppStore(s => s.user);
  const { isMasked, togglePrivacyMode } = useDashboardStore();
  const { refetch, isFetching }         = useWealth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const router   = useRouter();

  const name     = user?.email?.split('@')[0] ?? 'there';
  const hr       = new Date().getHours();
  const greeting = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const date     = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const iconBtn = (onClick: () => void, active: boolean, children: React.ReactNode) => (
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${active ? V.borderHi : V.border}`, background: active ? 'rgba(108,116,255,0.12)' : V.raised, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? V.indigo : V.text1, transition: 'all 0.2s' }}>
      {children}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>

      <div style={{ minWidth: 0, flexShrink: 1 }}>
        <h1 style={{ fontFamily: SYNE, fontSize: 26, fontWeight: 800, color: V.text0, letterSpacing: -0.5, marginBottom: 3, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.3s' }}>
          {greeting},{' '}
          <span style={{ background: `linear-gradient(135deg,${V.indigo},${V.violet})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {name}
          </span>
        </h1>
        <p style={{ fontSize: 11, color: V.text2, fontFamily: SANS, transition: 'color 0.3s' }}>{date}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <CopilotOmnibar />

        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/transactions')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${V.border}`, background: V.raised, cursor: 'pointer', fontFamily: SANS, color: V.text1, fontSize: 12, transition: 'all 0.2s' }}>
          <Plus size={13} color={V.jade} /> Add Transaction
        </motion.button>

        {iconBtn(() => refetch(), false,
          <RefreshCw size={13} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none', color: isFetching ? V.indigo : V.text1 }} />
        )}
        {iconBtn(togglePrivacyMode, isMasked,
          isMasked ? <EyeOff size={13} /> : <Eye size={13} />
        )}
        {iconBtn(toggleTheme, false,
          isDark ? <Sun size={13} /> : <Moon size={13} />
        )}
      </div>
    </motion.div>
  );
}