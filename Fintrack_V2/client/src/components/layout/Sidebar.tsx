'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank,
  Sparkles, Target, Settings, TrendingUp,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { href: '/budget',       icon: PiggyBank,       label: 'Budget' },
  { href: '/insights',     icon: Sparkles,        label: 'AI Insights' },
  { href: '/goals',        icon: Target,          label: 'Goals' },
   { href: "/mutual-funds", icon: BookOpen,        label: "Funds"  },
  { href: "/stocks",       icon: BarChart2,       label: "Stocks" },
];

const BOTTOM_NAV = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const { logout } = useAuth();

  const W = collapsed ? 68 : 240;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: W, minHeight: '100vh', flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0,
        zIndex: 30, overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 14px' : '0 20px',
        borderBottom: '1px solid var(--border)', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={19} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontWeight: 800, fontSize: 18, whiteSpace: 'nowrap', letterSpacing: '-0.5px', overflow: 'hidden' }}
            >
              FinTrack
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} title={collapsed ? label : undefined}>
              <Icon className="nav-icon" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} title={collapsed ? label : undefined}>
              <Icon className="nav-icon" />
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="nav-item"
          title={collapsed ? 'Logout' : undefined}
          style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}
        >
          <LogOut className="nav-icon" style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggle}
          id="sidebar-toggle"
          className="btn btn-icon"
          style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
