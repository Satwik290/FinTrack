'use client';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

function ThemeSyncer() {
  const [mounted, setMounted] = useState(false);
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Don't render until client-side
  if (!mounted) return null;
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSyncer />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: 'var(--shadow-md)',
          },
        }}
      />
    </QueryClientProvider>
  );
}