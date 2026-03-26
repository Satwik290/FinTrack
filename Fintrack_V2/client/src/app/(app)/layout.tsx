'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    const token = localStorage.getItem('fintrack_token');
    if (!token) router.push('/auth');
  }, [router]);

  const sidebarW = collapsed ? 68 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        marginLeft: sidebarW, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)',
        minWidth: 0,
      }}>
        <TopBar />
        <main style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
