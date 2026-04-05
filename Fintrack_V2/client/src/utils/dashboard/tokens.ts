export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ── CSS variable names ── */
export const V = {
  bg:       'var(--ft-bg)',
  surface:  'var(--ft-surface)',
  raised:   'var(--ft-raised)',
  border:   'var(--ft-border)',
  borderHi: 'var(--ft-border-hi)',
  text0:    'var(--ft-text0)',
  text1:    'var(--ft-text1)',
  text2:    'var(--ft-text2)',
  jade:     '#0DDC9B',
  terra:    '#FF5C67',
  indigo:   '#6C74FF',
  violet:   '#7E5BFB',
  amber:    '#F59E0B',
  glow:     (col: string, a = 0.22) => `rgba(${hexToRgb(col)},${a})`,
} as const;

export const C = V;

export const MONO = "'Space Mono','JetBrains Mono',monospace";
export const SYNE = "'Syne','Plus Jakarta Sans',sans-serif";
export const SANS = "'DM Sans','Outfit',sans-serif";

export const fmtINR = (n: number, m = false) =>
  m ? '₹ ••••' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const fmtAxis = (n: number) => {
  if (n === 0) return '₹0';
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 10_000_000) return `${s}₹${(a / 10_000_000).toFixed(1)}Cr`;
  if (a >= 100_000)    return `${s}₹${(a / 100_000).toFixed(1)}L`;
  if (a >= 1_000)      return `${s}₹${(a / 1_000).toFixed(0)}k`;
  return `${s}₹${Math.round(a)}`;
};

export const fmtShort = (n: number, m = false) => m ? '••••' : fmtAxis(n);
export const fmtPct   = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

export function timeAgo(iso: string | null | undefined | number) {
  if (!iso) return '—';
  const m = Math.floor((Date.now() - new Date(iso as string).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Healthcare: '💊', Utilities: '⚡', Salary: '💼', Investment: '📈',
  Other: '📦', Insurance: '🛡️',
};

export const THEME_CSS = `
  :root, [data-theme="dark"] {
    --ft-bg:         #080B14;
    --ft-surface:    #0D1117;
    --ft-raised:     #131920;
    --ft-border:     rgba(255,255,255,0.055);
    --ft-border-hi:  rgba(108,116,255,0.35);
    --ft-text0:      #F0F4FA;
    --ft-text1:      #8897A7;
    --ft-text2:      #3D4F61;
    --ft-shadow:     rgba(0,0,0,0.5);
    --ft-chart-grid: rgba(255,255,255,0.04);
    --ft-hover-bg:   rgba(255,255,255,0.02);
    --ft-tag-bg:     rgba(255,255,255,0.05);
    --ft-grain-op:   0.4;
  }
  [data-theme="light"] {
    --ft-bg:         #EEF2F7;
    --ft-surface:    #FFFFFF;
    --ft-raised:     #F6F8FB;
    --ft-border:     rgba(0,0,0,0.08);
    --ft-border-hi:  rgba(108,116,255,0.5);
    --ft-text0:      #0D1117;
    --ft-text1:      #4A5568;
    --ft-text2:      #94A3B8;
    --ft-shadow:     rgba(0,0,0,0.07);
    --ft-chart-grid: rgba(0,0,0,0.05);
    --ft-hover-bg:   rgba(0,0,0,0.02);
    --ft-tag-bg:     rgba(0,0,0,0.04);
    --ft-grain-op:   0;
  }
`;