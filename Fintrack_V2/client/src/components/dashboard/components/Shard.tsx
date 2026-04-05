'use client';
import { useState } from 'react';
import { motion }   from 'framer-motion';

interface ShardProps {
  children:   React.ReactNode;
  className?: string;
  style?:     React.CSSProperties;
  glow?:      boolean;
  glowColor?: string;
  onClick?:   () => void;
}

export function Shard({ children, className = '', style = {}, glow = false, glowColor = '#6C74FF', onClick }: ShardProps) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      className={className}
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        background: 'var(--ft-raised)',
        border: `1px solid ${hov ? 'var(--ft-border-hi)' : 'var(--ft-border)'}`,
        boxShadow: hov
          ? `0 0 0 1px var(--ft-border-hi), 0 8px 32px var(--ft-shadow)${glow ? `, 0 0 40px rgba(${glowColor},0.15)` : ''}`
          : `0 4px 16px var(--ft-shadow)${glow ? `, 0 0 24px rgba(${glowColor},0.08)` : ''}`,
        transition: 'border-color 0.25s, box-shadow 0.25s, background 0.3s',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)', pointerEvents: 'none' }} />
      {children}
    </motion.div>
  );
}

interface SkelProps { w?: string | number; h?: number; r?: number; }
export function Skel({ w = '100%', h = 12, r = 6 }: SkelProps) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,var(--ft-border) 25%,var(--ft-border-hi, rgba(108,116,255,0.1)) 50%,var(--ft-border) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s ease-in-out infinite' }} />
  );
}