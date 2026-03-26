'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export function useAuth() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await api.post('/auth/login', { email, password });
      return res.data as { token: string };
    },
    onSuccess: (data) => {
      localStorage.setItem('fintrack_token', data.token);
      // Decode basic info from token (email from payload)
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        setUser({ id: payload.userId, email: payload.email || '' });
      } catch {
        setUser({ id: 'user', email: '' });
      }
      toast.success('Welcome back! 👋');
      router.push('/dashboard');
    },
    onError: () => {
      toast.error('Invalid email or password');
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await api.post('/auth/signup', { email, password });
      return res.data as { id: string; email: string };
    },
    onSuccess: (data) => {
      toast.success('Account created! Please log in.');
      setUser({ id: data.id, email: data.email });
    },
    onError: () => {
      toast.error('Could not create account. Email may already be in use.');
    },
  });

  const logout = () => {
    localStorage.removeItem('fintrack_token');
    setUser(null);
    router.push('/auth');
  };

  return { loginMutation, signupMutation, logout };
}
