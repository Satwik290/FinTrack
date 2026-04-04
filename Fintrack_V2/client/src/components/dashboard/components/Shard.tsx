'use client';
import { useState } from 'react';
import { motion }   from 'framer-motion';
import { C }        from '../../../utils/dashboard/tokens';

interface ShardProps {
  children:   React.ReactNode;
  className?: string;
  style?:     React.CSSProperties;
  glow?:      boolean;
  glowColor?: string;
  onClick?:   () => void;
}

export function Shard({ children, className = '', style = {}, glow = false, glowColor = C.indigo, onClick }: ShardProps) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      className={className}
      onClick={onClick}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        background: C.raised,
        border: `1px solid ${hov ? C.borderHi : C.border}`,
        boxShadow: hov
          ? `0 0 0 1px ${C.borderHi}, 0 8px 32px rgba(0,0,0,0.6)${glow ? `, 0 0 40px ${C.glow(glowColor, 0.15)}` : ''}`
          : `0 4px 16px rgba(0,0,0,0.4)${glow ? `, 0 0 24px ${C.glow(glowColor, 0.08)}` : ''}`,
        transition: 'border-color 0.25s, box-shadow 0.25s',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', pointerEvents: 'none' }} />
      {children}
    </motion.div>
  );
}

interface SkelProps { w?: string | number; h?: number; r?: number; }
export function Skel({ w = '100%', h = 12, r = 6 }: SkelProps) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s ease-in-out infinite' }} />
  );
}