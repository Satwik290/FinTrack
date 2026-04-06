'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════
 *  PAGE LOADER — full-screen animated splash
 * ══════════════════════════════════════════════════ */
export function PageLoader({ text = 'Loading FinTrack…' }: { text?: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: 28,
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Orb */}
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          {/* Outer spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: 'var(--indigo-500)',
              borderRightColor: 'var(--violet-500)',
            }}
          />
          {/* Counter-spin ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: -18,
              borderRadius: '50%',
              border: '1.5px dashed rgba(99,102,241,0.25)',
            }}
          />
          {/* Core orb */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 30px rgba(99,102,241,0.4)',
                '0 0 55px rgba(99,102,241,0.7)',
                '0 0 30px rgba(99,102,241,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <path d="M4 20 L10 12 L16 16 L22 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22" cy="6" r="2.5" fill="white"/>
            </svg>
          </motion.div>
        </div>

        {/* Bouncing dots */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--indigo-500)',
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* Text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.5px',
          }}
        >
          {text}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════
 *  INLINE SPINNER
 * ══════════════════════════════════════════════════ */
export function Spinner({ size = 18, color = 'var(--indigo-500)' }: { size?: number; color?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${size > 20 ? 3 : 2}px solid var(--border-strong)`,
        borderTopColor: color,
        flexShrink: 0,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════
 *  SKELETON LOADERS
 * ══════════════════════════════════════════════════ */
export function SkeletonLine({ width = '100%', height = 14, radius = 6 }: {
  width?: string | number;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <SkeletonLine width={40} height={40} radius={10} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="55%" height={14} radius={6} />
          <div style={{ marginTop: 6 }}><SkeletonLine width="35%" height={11} radius={5} /></div>
        </div>
      </div>
      <SkeletonLine width="70%" height={28} radius={7} />
      <div style={{ marginTop: 8 }}><SkeletonLine width="40%" height={11} radius={5} /></div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
      <SkeletonLine width={42} height={42} radius={10} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="50%" height={13} radius={5} />
        <div style={{ marginTop: 5 }}><SkeletonLine width="30%" height={11} radius={4} /></div>
      </div>
      <SkeletonLine width={70} height={16} radius={6} />
    </div>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', borderRadius: 10 }}>
      <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 10 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  TOP PROGRESS BAR
 * ══════════════════════════════════════════════════ */
export function TopProgressBar() {
  return (
    <motion.div
      initial={{ scaleX: 0, transformOrigin: 'left' }}
      animate={{ scaleX: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))',
        zIndex: 9999,
        transformOrigin: 'left',
        boxShadow: '0 0 12px rgba(99,102,241,0.6)',
      }}
    />
  );
}