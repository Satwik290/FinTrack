'use client';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style = {} }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <Skeleton style={{ height: 14, width: '40%', marginBottom: 16 }} />
      <Skeleton style={{ height: 32, width: '60%', marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: '30%' }} />
    </div>
  );
}
