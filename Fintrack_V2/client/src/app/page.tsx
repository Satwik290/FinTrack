'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('fintrack_token') : null;
    
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: '#f4f5f9'
    }}>
      <p style={{ fontSize: '18px', color: '#666' }}>Loading FinTrack...</p>
    </div>
  );
}