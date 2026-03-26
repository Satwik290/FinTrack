'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail, Lock, Eye, EyeOff, TrendingUp,
  Shield, Zap, ArrowRight, Check, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/* ── Zod Schemas ─────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[0-9]/, 'One number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

/* ── Password Strength Helper ─────────────────────────────── */
function getPasswordStrength(pw: string) {
  let score = 0;
  const rules = [
    { label: 'Min 8 characters', met: pw.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(pw) },
    { label: 'Number', met: /[0-9]/.test(pw) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(pw) },
  ];
  score = rules.filter((r) => r.met).length;
  return { score, rules };
}

/* ── Feature Points for the Hero Pane ──────────────────────── */
const features = [
  { icon: TrendingUp, text: 'Real-time spending analytics' },
  { icon: Shield, text: 'Bank-grade security' },
  { icon: Zap, text: 'AI-powered insights' },
];

/* ── Main Page ───────────────────────────────────────────── */
export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { loginMutation, signupMutation } = useAuth();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });
  const watchedPassword = signupForm.watch('password', '');
  const { score, rules } = getPasswordStrength(watchedPassword);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score] ?? '';
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981', '#059669'][score] ?? '';

  function onLogin(data: LoginForm) {
    loginMutation.mutate({ email: data.email, password: data.password });
  }
  function onSignup(data: SignupForm) {
    signupMutation.mutate({ email: data.email, password: data.password });
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }} />
      </div>

      {/* Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', width: '100%', maxWidth: 900,
          borderRadius: 28, overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.18)',
        }}
      >
        {/* ── Hero Pane (slides) ───────────────────────── */}
        <motion.div
          animate={{ order: isLogin ? 1 : 2 }}
          style={{
            flex: '0 0 45%',
            background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)',
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
          }}
          className="hidden md:flex"
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />

          {/* Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={22} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>FinTrack</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
                  {isLogin ? 'Welcome back!' : 'Start your journey'}
                </h1>
                <p style={{ opacity: 0.8, fontSize: 15, lineHeight: 1.6 }}>
                  {isLogin
                    ? 'Your financial command center awaits. Pick up where you left off.'
                    : 'Join thousands of people who take control of their finances with FinTrack.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <f.icon size={17} />
                </div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Switch CTA */}
          <div style={{
            marginTop: 32, padding: '18px 20px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              onClick={() => { setMode(isLogin ? 'signup' : 'login'); setShowPassword(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#fff', fontWeight: 600, fontSize: 14,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              {isLogin ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* ── Form Pane ─────────────────────────────────── */}
        <div style={{
          flex: 1,
          background: 'var(--bg-surface)',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }} className="flex md:hidden">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20 }}>FinTrack</span>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
              >
                <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Sign in
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
                  Enter your credentials to access your account
                </p>

                {/* Email */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }} />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      placeholder="you@example.com"
                      id="login-email"
                      className={`input ${loginForm.formState.errors.email ? 'input-error' : ''}`}
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }} />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      id="login-password"
                      className={`input ${loginForm.formState.errors.password ? 'input-error' : ''}`}
                      style={{ paddingLeft: 42, paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      display: 'flex',
                    }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="login-submit"
                  disabled={loginMutation.isPending}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: 20 }}
                >
                  {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                </button>

                {/* Mobile mode switch */}
                <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }} className="flex md:hidden justify-center">
                  No account?{' '}
                  <button type="button" onClick={() => setMode('signup')} style={{
                    marginLeft: 6, color: 'var(--indigo-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                  }}>
                    Sign up
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={signupForm.handleSubmit(onSignup)}
              >
                <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Create account
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                  Start your financial journey today
                </p>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      {...signupForm.register('email')}
                      type="email"
                      placeholder="you@example.com"
                      id="signup-email"
                      className={`input ${signupForm.formState.errors.email ? 'input-error' : ''}`}
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      {...signupForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      id="signup-password"
                      className={`input ${signupForm.formState.errors.password ? 'input-error' : ''}`}
                      style={{ paddingLeft: 42, paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                    }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {watchedPassword && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n} style={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: n <= score ? strengthColor : 'var(--border)',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: strengthColor }}>{strengthLabel}</span>
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {rules.map((r, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <motion.div animate={{ scale: r.met ? 1 : 0.8 }} transition={{ type: 'spring', stiffness: 400 }}>
                              {r.met
                                ? <Check size={13} style={{ color: 'var(--success)' }} />
                                : <X size={13} style={{ color: 'var(--text-muted)' }} />}
                            </motion.div>
                            <span style={{ color: r.met ? 'var(--success)' : 'var(--text-muted)' }}>{r.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {signupForm.formState.errors.password && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Confirm password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      {...signupForm.register('confirm')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      id="signup-confirm"
                      className={`input ${signupForm.formState.errors.confirm ? 'input-error' : ''}`}
                      style={{ paddingLeft: 42, paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                    }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirm && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{signupForm.formState.errors.confirm.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="signup-submit"
                  disabled={signupMutation.isPending}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: 20 }}
                >
                  {signupMutation.isPending ? 'Creating account…' : 'Create account'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }} className="flex md:hidden justify-center">
                  Have an account?{' '}
                  <button type="button" onClick={() => setMode('login')} style={{
                    marginLeft: 6, color: 'var(--indigo-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                  }}>
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
