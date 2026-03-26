'use client';
import { useTransactions, MOCK_TRANSACTIONS } from '@/hooks/useTransactions';
import { NetWorthCard } from '@/components/dashboard/NetWorthCard';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { data: transactions = MOCK_TRANSACTIONS, isLoading } = useTransactions();

  const income    = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses  = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance   = income - expenses;

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Loading your financial overview…</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[1,2,3,4,5,6].map((k) => <SkeletonCard key={k} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview for March 2026</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
      }}>
        {/* Row 1: Net Worth (wide) + Pie */}
        <NetWorthCard balance={balance} income={income} expenses={expenses} />
        <CategoryPieChart transactions={transactions} />

        {/* Row 2: Spending chart */}
        <SpendingChart />

        {/* Row 3: Recent + AI */}
        <RecentTransactions transactions={transactions} />
        <AIInsightCard />
      </div>
    </div>
  );
}
