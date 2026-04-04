'use client';
import { useWealth }        from '@/hooks/usewealth';
import { useTransactions }  from '@/hooks/useTransactions';
import { useBudgets }       from '@/hooks/useBudgets';
import { Transaction, Budget } from '../../../utils/dashboard/types';

import { CommandHero }        from '../../../components/dashboard/components/CommandHero';
import { MacroBento }         from '../../../components/dashboard/components/MacroBento';
import { KpiRow }             from '../../../components/dashboard/components/KpiRow';
import { IncomeChart }        from '../../../components/dashboard/components/IncomeChart';
import { PortfolioHeatmap }   from '../../../components/dashboard/components/PortfolioHeatmap';
// import { InsightsPanel }      from '../../../components/dashboard/components/InsightsPanel';
import { RecentTransactions } from '../../../components/dashboard/components/RecentTransactions';

export default function DashboardPage() {
  const { isLoading: wealthLoading }      = useWealth();
  const { data: txns = [], isLoading: txnL } = useTransactions() as { data: Transaction[]; isLoading: boolean };
  const { data: budgets = [] }            = useBudgets() as { data: Budget[] };
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
 
        @keyframes spin         { from { transform: rotate(0deg)   } to { transform: rotate(360deg) } }
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
          margin-bottom: 12px;
          align-items: start;
        }
 
        @media (max-width: 1100px) {
          .bento-macro      { grid-template-columns: 1fr 1fr; }
          .engine-kpi-row   { grid-template-columns: repeat(3, 1fr); }
          .tactical-bottom  { grid-template-columns: 1fr; }
        }
 
        @media (max-width: 700px) {
          .bento-macro      { grid-template-columns: 1fr 1fr; }
          .engine-kpi-row   { grid-template-columns: 1fr 1fr; }
          .tactical-bottom  { grid-template-columns: 1fr; }
        }
 
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>
 
      {/* Ambient grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.025\'/%3E%3C/svg%3E")', pointerEvents: 'none', zIndex: 0, opacity: 0.4 }} />
 
      <div style={{ maxWidth: 1320, width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
 
        {/* Zone 1 — Greeting + actions */}
        <CommandHero />
 
        {/* Zone 2 — Net Worth, Assets, Liabilities, Shield */}
        {!wealthLoading && <MacroBento />}
 
        {/* Zone 3 — Monthly KPIs + Income chart */}
        <div className="engine-room">
          <KpiRow txns={txns} budgets={budgets} txnLoading={txnL} />
          <IncomeChart txns={txns} />
        </div>
 
        {/* Zone 4 — Portfolio heatmap */}
        <div className="tactical-floor">
          <PortfolioHeatmap />
        </div>
 
        {/* Zone 5 — Insights + Recent transactions */}
        <div className="tactical-bottom">
          {/* <InsightsPanel /> */}
          <RecentTransactions txns={txns} />
        </div>
 
      </div>
    </>
  );
}
 