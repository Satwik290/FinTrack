'use client';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const isDark = useAppStore((s) => s.isDarkMode);
  const toggleDark = useAppStore((s) => s.toggleDarkMode);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'FT';

  return (
    <header style={{
      height: 64, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <Search size={15} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          type="text"
          placeholder="Search transactions, budgets…"
          id="topbar-search"
          className="input"
          style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        {/* Theme toggle */}
        <button onClick={toggleDark} id="theme-toggle" className="btn btn-icon" title="Toggle theme">
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-icon" id="notifications-btn" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={17} />
          <span style={{
            position: 'absolute', top: 8, right: 8, width: 7, height: 7,
            borderRadius: '50%', background: 'var(--danger)',
            border: '2px solid var(--bg-surface)',
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          flexShrink: 0,
        }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
