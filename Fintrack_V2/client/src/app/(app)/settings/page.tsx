'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Moon, Sun, Bell, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';

const SECTION = (label: string) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10, marginTop: 24 }}>
    {label}
  </p>
);

function SettingRow({ icon: Icon, label, description, control, danger = false }: {
  icon: React.ElementType; label: string; description?: string; control: React.ReactNode; danger?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: danger ? 'rgba(239,68,68,0.1)' : 'var(--bg-surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} style={{ color: danger ? 'var(--danger)' : 'var(--text-secondary)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: danger ? 'var(--danger)' : 'var(--text-primary)' }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{description}</p>}
      </div>
      {control}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, position: 'relative',
        background: value ? 'var(--indigo-500)' : 'var(--border-strong)',
        border: 'none', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: 2, width: 20, height: 20,
          borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const isDark = useAppStore((s) => s.isDarkMode);
  const toggleDark = useAppStore((s) => s.toggleDarkMode);
  const user = useAppStore((s) => s.user);
  const { logout } = useAuth();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 660 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 18 }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 24, flexShrink: 0,
        }}>
          {user?.email?.slice(0, 2).toUpperCase() ?? 'FT'}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
            {user?.email?.split('@')[0] ?? 'FinTrack User'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email ?? 'user@fintrack.app'}</p>
        </div>
        <button className="btn btn-ghost btn-sm">Edit profile</button>
      </motion.div>

      {/* Appearance */}
      {SECTION('Appearance')}
      <div className="card" style={{ padding: '0 20px' }}>
        <SettingRow
          icon={isDark ? Moon : Sun}
          label="Dark mode"
          description="Switch between light and dark interface"
          control={<Toggle value={isDark} onChange={toggleDark} />}
        />
      </div>

      {/* Notifications */}
      {SECTION('Notifications')}
      <div className="card" style={{ padding: '0 20px' }}>
        <SettingRow
          icon={Bell}
          label="Budget alerts"
          description="Get notified at 50%, 80%, and 100% of budget"
          control={<Toggle value={notifEnabled} onChange={() => setNotifEnabled(!notifEnabled)} />}
        />
      </div>

      {/* Security */}
      {SECTION('Security')}
      <div className="card" style={{ padding: '0 20px' }}>
        <SettingRow
          icon={Shield}
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          control={
            mfaEnabled
              ? <span className="badge badge-success"><Check size={11} /> Enabled</span>
              : <button className="btn btn-sm btn-ghost" onClick={() => setMfaEnabled(true)}>Enable</button>
          }
        />
        <SettingRow
          icon={CreditCard}
          label="Connected accounts"
          description="Link your bank accounts for automatic import"
          control={<ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
        />
      </div>

      {/* Danger zone */}
      {SECTION('Account')}
      <div className="card" style={{ padding: '0 20px' }}>
        <SettingRow
          icon={User}
          label="Sign out"
          description="Sign out from all devices"
          control={
            <button
              className="btn btn-sm"
              id="signout-btn"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
              onClick={logout}
            >
              Sign out
            </button>
          }
          danger
        />
      </div>
    </div>
  );
}
