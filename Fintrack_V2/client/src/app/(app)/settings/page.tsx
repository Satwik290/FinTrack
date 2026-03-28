'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Moon, 
  Sun, 
  Bell, 
  CreditCard, 
  ChevronRight, 
  Check, 
  LogOut, 
  Settings2, 
  Database,
  Lock
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';

// --- Types & Constants ---
type TabId = 'profile' | 'appearance' | 'notifications' | 'security' | 'data';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Settings2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data & Privacy', icon: Database },
] as const;

// --- Sub-components ---

const SECTION = (label: string) => (
  <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground mt-8 mb-3">
    {label}
  </p>
);

function SettingRow({ icon: Icon, label, description, control, danger = false }: {
  icon: React.ElementType; label: string; description?: string; control: React.ReactNode; danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0 group">
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors
        ${danger ? 'bg-red-500/10 text-red-500' : 'bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-secondary'}`}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${danger ? 'text-red-500' : 'text-foreground'}`}>
          {label}
        </p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">
        {control}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${value ? 'bg-primary' : 'bg-muted'}`}
      role="switch"
      aria-checked={value}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-0 w-4 h-4 rounded-full bg-background shadow-sm"
      />
    </button>
  );
}

// --- Main Page Component ---

export default function SettingsPage() {
  const isDark = useAppStore((s) => s.isDarkMode);
  const toggleDark = useAppStore((s) => s.toggleDarkMode);
  const user = useAppStore((s) => s.user);
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Fallback data
  const userInitials = user?.email?.slice(0, 2).toUpperCase() ?? 'FT';
  const userName = user?.email?.split('@')[0] ?? 'FinTrack User';
  const userEmail = user?.email ?? 'user@fintrack.app';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 flex flex-col gap-1 flex-shrink-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                  ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon size={18} className={isActive ? 'text-primary' : ''} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* --- PROFILE TAB --- */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-inner">
                      {userInitials}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-lg text-foreground">{userName}</h2>
                      <p className="text-sm text-muted-foreground">{userEmail}</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                      Edit Profile
                    </button>
                  </div>

                  {SECTION('Account Management')}
                  <div className="bg-card border border-border rounded-2xl px-5 shadow-sm">
                    <SettingRow
                      icon={LogOut}
                      label="Sign out"
                      description="Securely log out of this device."
                      danger
                      control={
                        <button
                          onClick={logout}
                          className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          Sign out
                        </button>
                      }
                    />
                  </div>
                </div>
              )}

              {/* --- APPEARANCE TAB --- */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {SECTION('Interface')}
                  <div className="bg-card border border-border rounded-2xl px-5 shadow-sm">
                    <SettingRow
                      icon={isDark ? Moon : Sun}
                      label="Dark mode"
                      description="Switch between light and dark interface themes."
                      control={<Toggle value={isDark} onChange={toggleDark} />}
                    />
                  </div>
                </div>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  {SECTION('Alerts')}
                  <div className="bg-card border border-border rounded-2xl px-5 shadow-sm">
                    <SettingRow
                      icon={Bell}
                      label="Budget Threshold Alerts"
                      description="Get notified when you hit 50%, 80%, and 100% of your category budgets."
                      control={<Toggle value={notifEnabled} onChange={() => setNotifEnabled(!notifEnabled)} />}
                    />
                  </div>
                </div>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {SECTION('Access')}
                  <div className="bg-card border border-border rounded-2xl px-5 shadow-sm">
                    <SettingRow
                      icon={Shield}
                      label="Two-Factor Authentication (2FA)"
                      description="Protect your financial data with an extra layer of security."
                      control={
                        mfaEnabled
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20"><Check size={12} /> Enabled</span>
                          : <button className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors" onClick={() => setMfaEnabled(true)}>Enable</button>
                      }
                    />
                    <SettingRow
                      icon={Lock}
                      label="Change Password"
                      description="Update your account password."
                      control={<ChevronRight size={18} className="text-muted-foreground" />}
                    />
                  </div>
                </div>
              )}

              {/* --- DATA TAB --- */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {SECTION('Integrations')}
                  <div className="bg-card border border-border rounded-2xl px-5 shadow-sm">
                     <SettingRow
                      icon={CreditCard}
                      label="Connected Accounts"
                      description="Manage bank connections for automatic transaction sync."
                      control={<ChevronRight size={18} className="text-muted-foreground" />}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}