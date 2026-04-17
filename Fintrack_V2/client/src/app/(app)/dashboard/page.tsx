'use client';
import { useState, useEffect } from 'react';
import { useWealth }           from '@/hooks/usewealth';
import { useTransactions }     from '@/hooks/useTransactions';
import { useBudgets }          from '@/hooks/useBudgets';
import { useAppStore }         from '@/store/useAppStore';
import { Transaction, Budget } from '../../../utils/dashboard/types';
import { DashboardLoader }     from '../../../components/dashboard/components/Dashboardloader';
import { CommandHero }         from '../../../components/dashboard/components/CommandHero';
import { MacroBento }          from '../../../components/dashboard/components/MacroBento';
import { KpiRow }              from '../../../components/dashboard/components/KpiRow';
import { IncomeChart }         from '../../../components/dashboard/components/IncomeChart';
import { PortfolioHeatmap }    from '../../../components/dashboard/components/PortfolioHeatmap';
import { RecentTransactions }  from '../../../components/dashboard/components/RecentTransactions';
import { InsightsPanel }       from '@/components/dashboard/components/InsightsPanel';

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const isDark = useAppStore(s => s.isDarkMode);

  const { isLoading: wealthLoading }         = useWealth();
  const { data: txns = [], isLoading: txnL } = useTransactions() as { data: Transaction[]; isLoading: boolean };
  const { data: budgets = [] }               = useBudgets() as { data: Budget[] };

  // Sync --ft-* CSS variables with the global app theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (!loaded) {
    return <DashboardLoader onDone={() => setLoaded(true)} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

        /* ── Dark (default) ── */
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
          --ft-hover-bg:   rgba(255,255,255,0.025);
          --ft-tag-bg:     rgba(255,255,255,0.05);
          --ft-grain-op:   0.4;
          --ft-input-bg:   rgba(255,255,255,0.04);
          --ft-shard-bg:   #131920;
        }

        /* ── Light ── */
        [data-theme="light"] {
          --ft-bg:         #EEF2F7;
          --ft-surface:    #FFFFFF;
          --ft-raised:     #F6F8FB;
          --ft-border:     rgba(0,0,0,0.07);
          --ft-border-hi:  rgba(99,102,241,0.45);
          --ft-text0:      #0D1117;
          --ft-text1:      #4A5568;
          --ft-text2:      #94A3B8;
          --ft-shadow:     rgba(0,0,0,0.06);
          --ft-chart-grid: rgba(0,0,0,0.04);
          --ft-hover-bg:   rgba(0,0,0,0.025);
          --ft-tag-bg:     rgba(0,0,0,0.04);
          --ft-grain-op:   0;
          --ft-input-bg:   rgba(0,0,0,0.03);
          --ft-shard-bg:   #FFFFFF;
        }

        *, *::before, *::after { box-sizing: border-box; }

        body {
          background: var(--ft-bg);
          color: var(--ft-text0);
          transition: background 0.35s ease, color 0.35s ease;
        }

        /* ── Shard overrides for light mode ── */
        [data-theme="light"] .ft-shard {
          background: #FFFFFF !important;
          border-color: rgba(0,0,0,0.07) !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
        }
        [data-theme="light"] .ft-shard:hover {
          border-color: rgba(99,102,241,0.35) !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.2) !important;
        }

        /* ── Recharts in light mode ── */
        [data-theme="light"] .recharts-cartesian-grid line { stroke: rgba(0,0,0,0.06); }
        [data-theme="light"] .recharts-tooltip-wrapper .recharts-default-tooltip {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
          border-radius: 12px !important;
        }

        /* ── Input / form elements ── */
        [data-theme="light"] input::placeholder { color: rgba(0,0,0,0.35); }
        [data-theme="dark"]  input::placeholder { color: var(--ft-text2); }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--ft-border); border-radius: 99px; }

        /* ── Animations ── */
        @keyframes spin    { from { transform: rotate(0deg) }   to { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes border-pulse { 0%, 100% { opacity: 0.55 } 50% { opacity: 1 } }

        /* ── Grid layouts ── */
        .bento-macro {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 12px;
          align-items: stretch;
        }
        .engine-room {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 12px;
          align-items: start;
        }
        .engine-kpi-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        .tactical-floor {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 12px;
          align-items: start;
        }
        .tactical-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
          align-items: start;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .bento-macro     { grid-template-columns: 1fr 1fr; }
          .engine-kpi-row  { grid-template-columns: repeat(3, 1fr); }
          .tactical-bottom { grid-template-columns: 1fr; }
        }

        /* ── Tablet (768px) ── */
        @media (max-width: 768px) {
          .bento-macro     { grid-template-columns: 1fr 1fr; gap: 8px; }
          .engine-kpi-row  { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .tactical-bottom { grid-template-columns: 1fr; gap: 8px; }
          .engine-room     { gap: 8px; }
          .tactical-floor  { gap: 8px; }
        }

        /* ── Mobile (480px) ── */
        @media (max-width: 480px) {
          .bento-macro     { grid-template-columns: 1fr; gap: 8px; }
          .engine-kpi-row  { grid-template-columns: 1fr 1fr; gap: 8px; }
          .tactical-bottom { grid-template-columns: 1fr; }

          /* Tighten the CommandHero on mobile */
          .hero-greeting h1  { font-size: 20px !important; }
          .hero-greeting p   { font-size: 10px !important; }

          /* Hide "Add Transaction" text, keep icon */
          .hide-xs { display: none; }
        }

        /* ── KPI card text in light mode ── */
        [data-theme="light"] .kpi-label   { color: #4A5568 !important; }
        [data-theme="light"] .kpi-sublabel { color: #94A3B8 !important; }

        /* ── MacroBento Net Worth card always dark ── */
        .nw-card {
          background: linear-gradient(160deg, #0A0D14 0%, #05070A 100%) !important;
        }
        [data-theme="light"] .nw-card-text-muted { color: rgba(255,255,255,0.45) !important; }

        /* ── Chart tooltip light mode text ── */
        [data-theme="light"] .chart-tip-label  { color: #0D1117 !important; }
        [data-theme="light"] .chart-tip-value  { color: #0D1117 !important; }
        [data-theme="light"] .chart-tip-name   { color: #4A5568 !important; }

        /* ── Recent transactions hover ── */
        [data-theme="light"] .tx-row:hover { background: rgba(0,0,0,0.025) !important; }

        /* ── Heatmap cells light mode ── */
        [data-theme="light"] .heatmap-cell { border-color: rgba(0,0,0,0.08) !important; }

        /* ── Portfolio heatmap empty state ── */
        [data-theme="light"] .heatmap-empty-text { color: #4A5568 !important; }

        /* ── Mobile touch improvements ── */
        @media (hover: none) {
          /* Larger tap targets on touch devices */
          button { min-height: 36px; }
        }

        /* ── Copilot omnibar mobile ── */
        @media (max-width: 480px) {
          .copilot-trigger span:not(.copilot-shortcut) { display: none; }
          .copilot-shortcut { display: none; }
        }
      `}</style>

      {/* Film grain overlay — hidden in light mode via --ft-grain-op */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 'var(--ft-grain-op)' as unknown as number,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }} />

      <div style={{
        maxWidth: 1320, width: '100%', margin: '0 auto',
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        background: 'var(--ft-bg)',
        transition: 'background 0.35s ease',
        padding: '0 4px',
      }}>
        <CommandHero />

        {!wealthLoading && <MacroBento />}

        <div className="engine-room">
          <KpiRow txns={txns} budgets={budgets} txnLoading={txnL} />
          <IncomeChart txns={txns} />
        </div>

        <div className="tactical-floor">
          <PortfolioHeatmap />
        </div>

        <div className="tactical-bottom">
          <InsightsPanel />
          <RecentTransactions txns={txns} />
        </div>
      </div>
    </>
  );
}