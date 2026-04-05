'use client';
import { useWealth }        from '@/hooks/usewealth';
import { useTransactions }  from '@/hooks/useTransactions';
import { useBudgets }       from '@/hooks/useBudgets';
import { Transaction, Budget } from '../../../utils/dashboard/types';
import { ThemeProvider, useTheme } from '@/hooks/usetheme';
import { CommandHero }        from '../../../components/dashboard/components/CommandHero';
import { MacroBento }         from '../../../components/dashboard/components/MacroBento';
import { KpiRow }             from '../../../components/dashboard/components/KpiRow';
import { IncomeChart }        from '../../../components/dashboard/components/IncomeChart';
import { PortfolioHeatmap }   from '../../../components/dashboard/components/PortfolioHeatmap';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactions } from '../../../components/dashboard/components/RecentTransactions';
import { InsightsPanel } from '@/components/dashboard/components/InsightsPanel';


export default function DashboardPage() {
  const { isLoading: wealthLoading }         = useWealth();
  const { data: txns = [], isLoading: txnL } = useTransactions() as { data: Transaction[]; isLoading: boolean };
  const { data: budgets = [] }               = useBudgets() as { data: Budget[] };

  return (
    <ThemeProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

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

        *, *::before, *::after { box-sizing: border-box; }

        body {
          background: var(--ft-bg);
          color: var(--ft-text0);
          transition: background 0.3s ease, color 0.3s ease;
        }

        @keyframes spin         { from { transform: rotate(0deg) }   to { transform: rotate(360deg) } }
        @keyframes shimmer      { 0%   { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes border-pulse { 0%, 100% { opacity: 0.55 } 50% { opacity: 1 } }

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

        @media (max-width: 1100px) {
          .bento-macro     { grid-template-columns: 1fr 1fr; }
          .engine-kpi-row  { grid-template-columns: repeat(3, 1fr); }
          .tactical-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .bento-macro     { grid-template-columns: 1fr 1fr; }
          .engine-kpi-row  { grid-template-columns: 1fr 1fr; }
          .tactical-bottom { grid-template-columns: 1fr; }
        }

        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--ft-border); border-radius: 99px; }

        input::placeholder { color: var(--ft-text2); }
      `}</style>

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
        transition: 'background 0.3s ease',
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
    </ThemeProvider>
  );
}