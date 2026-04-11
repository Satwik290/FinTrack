'use client';
import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

/* ── Schemas ─────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
const signupSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});
type LoginForm  = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

/* ── Password strength ───────────────────────────────────── */
function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_COLOR = ['#ef4444', '#f59e0b', '#10b981', '#059669'];

/* ── Social icons ────────────────────────────────────────── */
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
      <path d="M23.95 4.57a10 10 0 01-2.82.77 4.96 4.96 0 002.16-2.72c-.95.56-2 .96-3.12 1.19a4.92 4.92 0 00-8.38 4.49A13.96 13.96 0 011.64 3.16a4.92 4.92 0 001.52 6.57 4.9 4.9 0 01-2.23-.61v.06a4.92 4.92 0 003.95 4.83 4.94 4.94 0 01-2.22.08 4.93 4.93 0 004.6 3.42A9.87 9.87 0 010 19.54a13.94 13.94 0 007.55 2.21c9.06 0 14.01-7.5 14.01-14.02l-.02-.64A10 10 0 0024 4.59l-.05-.02z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.84 3.35-1.84 3.59 0 4.25 2.36 4.25 5.43v6.3zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/* ── Shared styles ───────────────────────────────────────── */
const inputStyle = (hasError = false): React.CSSProperties => ({
  width: '100%',
  padding: '14px 18px',
  borderRadius: 12,
  border: 'none',
  background: hasError ? '#fff0f2' : '#f5f4f9',
  fontFamily: "'Poppins', sans-serif",
  fontSize: 14,
  color: '#1a1033',
  outline: 'none',
  boxShadow: hasError
    ? '0 0 0 2.5px rgba(220,60,80,0.35)'
    : 'inset 0 2px 4px rgba(0,0,0,0.02)',
  transition: 'background 0.3s ease, box-shadow 0.3s ease',
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#7a709d',
  marginBottom: 8,
  fontFamily: "'Poppins', sans-serif",
};

const errStyle: React.CSSProperties = {
  color: '#dc3c50',
  fontSize: 12,
  marginTop: 6,
  fontFamily: "'Poppins', sans-serif",
};

const socialBtnStyle: React.CSSProperties = {
  width: 48, height: 48,
  borderRadius: '50%',
  border: '1.5px solid #eae6f7',
  background: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

/* ── Animation Variants ──────────────────────────────────── */
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

/* ── Main ────────────────────────────────────────────────── */
export default function AuthPage() {
  const [mode, setMode]   = useState<'login' | 'signup'>('login');
  const [pwVal, setPwVal] = useState('');

  const { loginMutation, signupMutation } = useAuth() || {
    loginMutation:  { mutate: console.log, isPending: false },
    signupMutation: { mutate: console.log, isPending: false },
  };

  const isLogin = mode === 'login';

  const loginForm  = useForm<LoginForm>({  resolver: zodResolver(loginSchema)  });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const strength = pwStrength(pwVal);

  function onLogin(data: LoginForm) {
    loginMutation.mutate({ email: data.email, password: data.password });
  }
  function onSignup(data: SignupForm) {
    signupMutation.mutate({ email: data.email, password: data.password });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Input focus & hover */
        .ft-input::placeholder { color: #bcb5d4; }
        .ft-input:focus {
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(107,92,231,0.25), 0 4px 12px rgba(0,0,0,0.05) !important;
        }

        /* Social button hover */
        .ft-social:hover {
          border-color: #6b5ce7 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(107,92,231,0.15);
        }

        /* Ghost button (overlay) */
        .ft-ghost:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: #fff !important;
          transform: scale(1.02);
        }

        /* Primary submit */
        .ft-primary { background: linear-gradient(135deg, #6b5ce7, #4a3aff); }
        .ft-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(107,92,231,0.4) !important;
        }
        .ft-primary:active { transform: scale(0.98); }

        /* ── RESPONSIVE CARD LAYOUT ────────────────────────────
           Desktop  (≥ 768px): side-by-side, sliding overlay
           Mobile   (< 768px): single-column, tab switcher on top
        ───────────────────────────────────────────────────── */

        .auth-card {
          width: 1024px;
          min-height: 640px;
          max-width: 100%;
          border-radius: 32px;
          background: #fff;
          box-shadow: 0 40px 100px rgba(80,60,200,0.12), 0 10px 40px rgba(0,0,0,0.06);
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* Form panels sit side-by-side on desktop */
        .auth-form-panel {
          flex: 1;
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        /* Overlay takes up half width on desktop */
        .auth-overlay {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
        }

        /* ── Mobile: stack vertically ── */
        @media (max-width: 767px) {
          .auth-card {
            flex-direction: column;
            border-radius: 24px;
            min-height: unset;
            width: 100%;
          }

          /* Overlay becomes a branded header strip at the top */
          .auth-overlay {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            left: auto !important;
            border-radius: 20px 20px 0 0 !important;
            padding: 32px 24px 28px !important;
          }

          /* Hide the large decorative circles on mobile (they overflow) */
          .auth-overlay-circle { display: none; }

          /* Logo mark smaller on mobile */
          .auth-overlay-logo {
            width: 48px !important;
            height: 48px !important;
            border-radius: 14px !important;
            margin-bottom: 20px !important;
          }

          /* Smaller headline */
          .auth-overlay-headline { font-size: 24px !important; margin-bottom: 10px !important; }
          .auth-overlay-sub      { font-size: 13px !important; margin-bottom: 20px !important; }

          /* Feature list: horizontal chips instead of vertical list */
          .auth-feature-list {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            margin-bottom: 20px !important;
          }
          .auth-feature-item {
            background: rgba(255,255,255,0.15) !important;
            border-radius: 20px !important;
            padding: 5px 10px 5px 8px !important;
            font-size: 12px !important;
          }

          /* Switch button full-width on mobile */
          .auth-switch-btn {
            width: 100% !important;
            padding: 12px 24px !important;
            font-size: 13px !important;
          }

          /* Form panel full width, less padding */
          .auth-form-panel {
            padding: 28px 24px 36px !important;
          }

          /* Name row: stack on very small screens */
          .name-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }

        /* Fine-tune for small phones (≤ 390px) */
        @media (max-width: 390px) {
          .auth-overlay { padding: 24px 18px 22px !important; }
          .auth-form-panel { padding: 22px 18px 32px !important; }
          .auth-overlay-headline { font-size: 22px !important; }
        }

        /* Outer page padding — comfortable breathing room on all sizes */
        .auth-page-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 4vw, 32px);
          background: #f4f5f9;
          font-family: 'Poppins', sans-serif;

          /* iOS safe areas */
          padding-top:    max(clamp(16px, 4vw, 32px), env(safe-area-inset-top));
          padding-bottom: max(clamp(16px, 4vw, 32px), env(safe-area-inset-bottom));
          padding-left:   max(clamp(16px, 4vw, 32px), env(safe-area-inset-left));
          padding-right:  max(clamp(16px, 4vw, 32px), env(safe-area-inset-right));
        }
      `}</style>

      <div className="auth-page-wrap">
        <div className="auth-card">

          {/* ── LOGIN FORM ── */}
          <div className="auth-form-panel">
            <AnimatePresence mode="wait">
              {isLogin && (
                <motion.div
                  key="login"
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  variants={staggerContainer}
                >
                  <motion.h2 variants={fadeUpVariant}
                    style={{ fontSize: 32, fontWeight: 700, color: '#1a1033', marginBottom: 8 }}>
                    Welcome back
                  </motion.h2>
                  <motion.p variants={fadeUpVariant}
                    style={{ fontSize: 14, color: '#8a80a8', marginBottom: 32 }}>
                    Sign in to your FinTrack account
                  </motion.p>

                  {/* Social */}
                  <motion.div variants={fadeUpVariant} style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                    {[<FacebookIcon key="fb"/>, <TwitterIcon key="tw"/>, <LinkedInIcon key="li"/>].map((icon, i) => (
                      <button key={i} className="ft-social" style={socialBtnStyle}>{icon}</button>
                    ))}
                  </motion.div>

                  <motion.div variants={fadeUpVariant}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{ flex: 1, height: 1, background: '#f0eef5' }} />
                    <span style={{ fontSize: 13, color: '#b5aeca', fontWeight: 500 }}>or use your email</span>
                    <div style={{ flex: 1, height: 1, background: '#f0eef5' }} />
                  </motion.div>

                  <form onSubmit={loginForm.handleSubmit(onLogin)}>
                    <motion.div variants={fadeUpVariant} style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Email address</label>
                      <input
                        {...loginForm.register('email')}
                        type="email" placeholder="hello@fintrack.app"
                        className="ft-input"
                        style={inputStyle(!!loginForm.formState.errors.email)}
                      />
                      {loginForm.formState.errors.email && (
                        <p style={errStyle}>{loginForm.formState.errors.email.message}</p>
                      )}
                    </motion.div>

                    <motion.div variants={fadeUpVariant} style={{ marginBottom: 8 }}>
                      <label style={labelStyle}>Password</label>
                      <input
                        {...loginForm.register('password')}
                        type="password" placeholder="••••••••"
                        className="ft-input"
                        style={inputStyle(!!loginForm.formState.errors.password)}
                      />
                      {loginForm.formState.errors.password && (
                        <p style={errStyle}>{loginForm.formState.errors.password.message}</p>
                      )}
                    </motion.div>

                    <motion.div variants={fadeUpVariant}
                      style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                      <span style={{ fontSize: 13, color: '#6b5ce7', fontWeight: 600, cursor: 'pointer' }}>
                        Forgot password?
                      </span>
                    </motion.div>

                    <motion.button
                      variants={fadeUpVariant}
                      type="submit"
                      className="ft-primary"
                      disabled={loginMutation.isPending}
                      style={{
                        width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                        color: '#fff', fontFamily: "'Poppins', sans-serif",
                        fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        letterSpacing: '0.5px',
                        boxShadow: '0 8px 24px rgba(107,92,231,0.3)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SIGNUP FORM ── */}
          <div className="auth-form-panel">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup"
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  variants={staggerContainer}
                >
                  <motion.h2 variants={fadeUpVariant}
                    style={{ fontSize: 32, fontWeight: 700, color: '#1a1033', marginBottom: 8 }}>
                    Create account
                  </motion.h2>
                  <motion.p variants={fadeUpVariant}
                    style={{ fontSize: 14, color: '#8a80a8', marginBottom: 28 }}>
                    Join FinTrack and take control
                  </motion.p>

                  <motion.div variants={fadeUpVariant} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    {[<FacebookIcon key="fb"/>, <TwitterIcon key="tw"/>, <LinkedInIcon key="li"/>].map((icon, i) => (
                      <button key={i} className="ft-social" style={socialBtnStyle}>{icon}</button>
                    ))}
                  </motion.div>

                  <motion.div variants={fadeUpVariant}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: '#f0eef5' }} />
                    <span style={{ fontSize: 13, color: '#b5aeca', fontWeight: 500 }}>or use your email</span>
                    <div style={{ flex: 1, height: 1, background: '#f0eef5' }} />
                  </motion.div>

                  <form onSubmit={signupForm.handleSubmit(onSignup)}>
                    {/* Name row — stacks to 1 col on small phones via .name-grid */}
                    <motion.div variants={fadeUpVariant}
                      className="name-grid"
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>First name</label>
                        <input {...signupForm.register('firstName')} type="text" placeholder="Astra"
                          className="ft-input"
                          style={inputStyle(!!signupForm.formState.errors.firstName)} />
                        {signupForm.formState.errors.firstName && (
                          <p style={errStyle}>{signupForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Last name</label>
                        <input {...signupForm.register('lastName')} type="text" placeholder="Doe"
                          className="ft-input"
                          style={inputStyle(!!signupForm.formState.errors.lastName)} />
                        {signupForm.formState.errors.lastName && (
                          <p style={errStyle}>{signupForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeUpVariant} style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Email address</label>
                      <input {...signupForm.register('email')} type="email" placeholder="hello@fintrack.app"
                        className="ft-input"
                        style={inputStyle(!!signupForm.formState.errors.email)} />
                      {signupForm.formState.errors.email && (
                        <p style={errStyle}>{signupForm.formState.errors.email.message}</p>
                      )}
                    </motion.div>

                    <motion.div variants={fadeUpVariant} style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Password</label>
                      <input
                        {...signupForm.register('password')}
                        type="password" placeholder="Min. 8 characters"
                        className="ft-input"
                        style={inputStyle(!!signupForm.formState.errors.password)}
                        onChange={(e) => {
                          setPwVal(e.target.value);
                          signupForm.setValue('password', e.target.value);
                        }}
                      />
                      {pwVal && (
                        <div style={{
                          height: 6, borderRadius: 6,
                          background: '#f0eef5',
                          marginTop: 10, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 6,
                            width: `${strength * 25}%`,
                            background: STRENGTH_COLOR[strength - 1] ?? '#f0eef5',
                            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
                          }} />
                        </div>
                      )}
                      {signupForm.formState.errors.password && (
                        <p style={errStyle}>{signupForm.formState.errors.password.message}</p>
                      )}
                    </motion.div>

                    <motion.button
                      variants={fadeUpVariant}
                      type="submit"
                      className="ft-primary"
                      disabled={signupMutation.isPending}
                      style={{
                        width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                        color: '#fff', fontFamily: "'Poppins', sans-serif",
                        fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        marginTop: 16, letterSpacing: '0.5px',
                        boxShadow: '0 8px 24px rgba(107,92,231,0.3)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {signupMutation.isPending ? 'Creating account…' : 'Create Account'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SLIDING OVERLAY (desktop) / HEADER STRIP (mobile) ── */}
          <motion.div
            className="auth-overlay"
            animate={{ left: isLogin ? '50%' : '0%' }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            style={{
              background: 'linear-gradient(145deg, #6b5ce7 0%, #5a4bdf 50%, #4032ba 100%)',
              borderRadius: isLogin ? '0 32px 32px 0' : '32px 0 0 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 48px',
              textAlign: 'center',
              zIndex: 10,
              overflow: 'hidden',
              boxShadow: isLogin
                ? '-10px 0 30px rgba(0,0,0,0.05)'
                : '10px 0 30px rgba(0,0,0,0.05)',
            }}
          >
            {/* Decorative circles — hidden on mobile via .auth-overlay-circle */}
            <motion.div
              className="auth-overlay-circle"
              animate={{ scale: [1, 1.05, 1], opacity: [0.06, 0.08, 0.06] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                background: '#fff', top: -80, right: -80, pointerEvents: 'none',
              }}
            />
            <motion.div
              className="auth-overlay-circle"
              animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.06, 0.04] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{
                position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                background: '#fff', bottom: -50, left: -50, pointerEvents: 'none',
              }}
            />

            {/* Logo mark */}
            <motion.div
              className="auth-overlay-logo"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 32, flexShrink: 0,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <path d="M4 20 L10 12 L16 16 L22 6"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="22" cy="6" r="3" fill="white" />
              </svg>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', zIndex: 1, width: '100%',
                }}
              >
                <h2 className="auth-overlay-headline"
                  style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
                  {isLogin ? 'New here?' : 'Welcome back!'}
                </h2>
                <p className="auth-overlay-sub"
                  style={{
                    fontSize: 15, color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.6, marginBottom: 36, maxWidth: 280,
                  }}>
                  {isLogin
                    ? 'Sign up and start tracking your finances smarter — budgets, goals, and AI insights.'
                    : 'Already have an account? Sign in and pick up right where you left off.'}
                </p>

                {isLogin && (
                  <div
                    className="auth-feature-list"
                    style={{
                      display: 'flex', flexDirection: 'column',
                      gap: 14, marginBottom: 36, alignSelf: 'stretch',
                    }}
                  >
                    {['Real-time analytics', 'AI-powered insights', 'Bank-grade security'].map((f) => (
                      <div
                        key={f}
                        className="auth-feature-item"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500,
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              className="ft-ghost auth-switch-btn"
              onClick={() => setMode(isLogin ? 'signup' : 'login')}
              style={{
                padding: '14px 40px', borderRadius: 14,
                border: '2px solid rgba(255,255,255,0.8)',
                background: 'transparent', color: '#fff',
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                letterSpacing: '1px', textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                zIndex: 1,
              }}
            >
              {isLogin ? 'SIGN UP' : 'LOGIN'}
            </button>
          </motion.div>

        </div>
      </div>
    </>
  );
}