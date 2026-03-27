'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank,
  Sparkles, Target, Settings, TrendingUp,
  ChevronLeft, ChevronRight, LogOut, X, Menu,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';

/* ─── Nav config ─────────────────────────────────────────── */
const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { href: '/budget',       icon: PiggyBank,       label: 'Budget' },
  { href: '/insights',     icon: Sparkles,        label: 'Insights' },
  { href: '/goals',        icon: Target,          label: 'Goals' },
];

/* ─── Desktop Sidebar ────────────────────────────────────── */
function DesktopSidebar() {
  const pathname  = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle    = useAppStore((s) => s.toggleSidebar);
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
        <Link href="/settings" className={`nav-item ${pathname.startsWith('/settings') ? 'active' : ''}`} title={collapsed ? 'Settings' : undefined}>
          <Settings className="nav-icon" />
          {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Settings</span>}
        </Link>
        <button onClick={logout} className="nav-item" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer' }} title={collapsed ? 'Logout' : undefined}>
          <LogOut className="nav-icon" style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
        </button>
        <button onClick={toggle} className="btn btn-icon" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}

/* ─── Mobile Drawer ──────────────────────────────────────── */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 45, backdropFilter: 'blur(2px)',
            }}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0, width: 280,
              background: 'var(--bg-surface)', zIndex: 50,
              display: 'flex', flexDirection: 'column',
              borderRight: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={19} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>FinTrack</span>
              </div>
              <button onClick={onClose} className="btn btn-icon" style={{ width: 32, height: 32 }}><X size={16} /></button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} onClick={onClose} style={{ fontSize: 15, padding: '12px 16px' }}>
                    <Icon size={20} style={{ flexShrink: 0 }} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link href="/settings" className={`nav-item ${pathname.startsWith('/settings') ? 'active' : ''}`} onClick={onClose} style={{ fontSize: 15, padding: '12px 16px' }}>
                <Settings size={20} style={{ flexShrink: 0 }} /><span>Settings</span>
              </Link>
              <button onClick={() => { logout(); onClose(); }} className="nav-item" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontSize: 15, padding: '12px 16px' }}>
                <LogOut size={20} style={{ flexShrink: 0 }} /><span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile TopBar ──────────────────────────────────────── */
function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const isDark     = useAppStore((s) => s.isDarkMode);
  const toggleDark = useAppStore((s) => s.toggleDarkMode);
  const user       = useAppStore((s) => s.user);
  const initials   = user?.email?.slice(0, 2).toUpperCase() ?? 'FT';

  return (
    <header style={{
      height: 'var(--mobile-topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 12,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      <button onClick={onMenuOpen} className="btn btn-icon" style={{ width: 36, height: 36, flexShrink: 0 }}>
        <Menu size={18} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={15} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>FinTrack</span>
      </div>
      <button onClick={toggleDark} className="btn btn-icon" style={{ width: 36, height: 36 }}>
        {isDark ? '☀️' : '🌙'}
      </button>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
        {initials}
      </div>
    </header>
  );
}

/* ─── Desktop TopBar ─────────────────────────────────────── */
function DesktopTopBar() {
  const user       = useAppStore((s) => s.user);
  const isDark     = useAppStore((s) => s.isDarkMode);
  const toggleDark = useAppStore((s) => s.toggleDarkMode);
  const initials   = user?.email?.slice(0, 2).toUpperCase() ?? 'FT';

  return (
    <header style={{
      height: 64, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
        <input type="text" placeholder="Search transactions, budgets…" className="input" style={{ paddingLeft: 36, height: 38, fontSize: 13 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <button onClick={toggleDark} className="btn btn-icon">{isDark ? '☀️' : '🌙'}</button>
        <button className="btn btn-icon" style={{ position: 'relative' }}>
          🔔
          <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--bg-surface)' }} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
          {initials}
        </div>
      </div>
    </header>
  );
}

/* ─── Bottom Navigation (mobile) ─────────────────────────── */
function BottomNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const items = [
    { href: '/dashboard',    icon: LayoutDashboard, label: 'Home'   },
    { href: '/transactions', icon: ArrowLeftRight,  label: 'Txns'   },
    { href: '/budget',       icon: PiggyBank,       label: 'Budget' },
    { href: '/insights',     icon: Sparkles,        label: 'Insights'},
    { href: '/goals',        icon: Target,          label: 'Goals'  },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`bottom-nav-item ${active ? 'active' : ''}`}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Main Layout ────────────────────────────────────────── */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fintrack_token');
    if (!token) router.push('/auth');
  }, [router]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const sidebarW = collapsed ? 68 : 240;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="app-main" style={{ flex: 1, padding: '16px', paddingBottom: 'calc(64px + 16px)', minWidth: 0 }}>
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DesktopSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: sidebarW, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)', minWidth: 0 }}>
        <DesktopTopBar />
        <main className="app-main" style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}