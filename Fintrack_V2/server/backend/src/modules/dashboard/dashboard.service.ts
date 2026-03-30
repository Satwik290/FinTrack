import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface InsightAlert {
  id: string;
  type: 'anomaly' | 'forecast' | 'tip' | 'achievement';
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  body: string;
  action?: string;
  category?: string;
  value?: number;
  threshold?: number;
}

export interface ForecastMonth {
  month: string; // 'Jan 2026'
  key: string; // 'YYYY-MM'
  projectedIncome: number;
  projectedExpense: number;
  projectedNet: number;
  actualIncome?: number;
  actualExpense?: number;
  isProjected: boolean;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /* ── 12-month forecast ────────────────────────── */
  async getForecast(userId: string): Promise<ForecastMonth[]> {
    // Fetch last 6 months of transactions for baseline
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoff = sixMonthsAgo.toISOString().split('T')[0];

    const txns = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: cutoff } },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const byMonth: Record<string, { income: number; expense: number }> = {};
    for (const t of txns) {
      const key = t.date.slice(0, 7); // YYYY-MM
      if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
      if (t.type === 'income') byMonth[key].income += t.amount;
      else byMonth[key].expense += t.amount;
    }

    // Compute averages from completed months (exclude current)
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const historicKeys = Object.keys(byMonth).filter((k) => k < currentKey);

    const avgIncome =
      historicKeys.length > 0
        ? historicKeys.reduce((s, k) => s + byMonth[k].income, 0) /
          historicKeys.length
        : 0;
    const avgExpense =
      historicKeys.length > 0
        ? historicKeys.reduce((s, k) => s + byMonth[k].expense, 0) /
          historicKeys.length
        : 0;

    // Build 12-month array: 3 past + current + 8 future
    const result: ForecastMonth[] = [];
    for (let i = -3; i <= 8; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const month = d.toLocaleString('en-IN', {
        month: 'short',
        year: 'numeric',
      });
      const isPast = key < currentKey;
      const isCurrent = key === currentKey;
      const actual = byMonth[key];

      result.push({
        month,
        key,
        projectedIncome: Math.round(avgIncome),
        projectedExpense: Math.round(avgExpense),
        projectedNet: Math.round(avgIncome - avgExpense),
        actualIncome: actual?.income,
        actualExpense: actual?.expense,
        isProjected: !isPast && !isCurrent,
      });
    }
    return result;
  }

  /* ── Anomaly detection + insights ────────────── */
  async getInsights(userId: string): Promise<InsightAlert[]> {
    const now = new Date();
    const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastMonthStart = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    })();
    const sixMonthsAgo = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    })();

    const [thisMonthTxns, lastMonthTxns, sixMonthTxns, budgets] =
      await Promise.all([
        this.prisma.transaction.findMany({
          where: { userId, date: { gte: thisMonthStart } },
        }),
        this.prisma.transaction.findMany({
          where: { userId, date: { gte: lastMonthStart, lt: thisMonthStart } },
        }),
        this.prisma.transaction.findMany({
          where: { userId, date: { gte: sixMonthsAgo, lt: thisMonthStart } },
        }),
        this.prisma.budget.findMany({ where: { userId } }),
      ]);

    const insights: InsightAlert[] = [];

    // Helper: group by category
    const groupByCat = (txns: typeof thisMonthTxns) => {
      const m: Record<string, number> = {};
      for (const t of txns.filter((x) => x.type === 'expense')) {
        m[t.category] = (m[t.category] ?? 0) + t.amount;
      }
      return m;
    };

    const thisCat = groupByCat(thisMonthTxns);
    const lastCat = groupByCat(lastMonthTxns);

    // Compute 6-month category averages (per month)
    const sixMonthsByCat: Record<string, number[]> = {};
    for (const t of sixMonthTxns.filter((x) => x.type === 'expense')) {
      const mo = t.date.slice(0, 7);
      const key = `${t.category}__${mo}`;
      if (!sixMonthsByCat[t.category]) sixMonthsByCat[t.category] = [];
      const existing = sixMonthsByCat[t.category];
      // aggregate by month
      const idx = existing.findIndex((_, i) => i === 0); // simplified
      sixMonthsByCat[t.category].push(t.amount);
    }

    // --- Anomaly: spending 2x above last month by category ---
    for (const [cat, amount] of Object.entries(thisCat)) {
      const last = lastCat[cat] ?? 0;
      if (last > 0 && amount > last * 1.5) {
        const pct = Math.round(((amount - last) / last) * 100);
        insights.push({
          id: `anomaly-${cat}`,
          type: 'anomaly',
          severity: pct > 100 ? 'danger' : 'warning',
          title: `${cat} spending up ${pct}% vs last month`,
          body: `You've spent ${fmtINR(amount)} on ${cat} this month vs ${fmtINR(last)} last month.`,
          action: 'Review transactions',
          category: cat,
          value: amount,
          threshold: last,
        });
      }
    }

    // --- Budget alerts (80% / 100% thresholds) ---
    for (const budget of budgets) {
      const spent = thisCat[budget.category] ?? 0;
      const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      if (pct >= 100) {
        insights.push({
          id: `budget-over-${budget.category}`,
          type: 'forecast',
          severity: 'danger',
          title: `${budget.category} budget exceeded`,
          body: `Spent ${fmtINR(spent)} of ${fmtINR(budget.limit)} limit (${Math.round(pct)}%). Pause discretionary buys.`,
          action: 'View budget',
          category: budget.category,
          value: spent,
          threshold: budget.limit,
        });
      } else if (pct >= 80) {
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();
        const daysLeft = daysInMonth - now.getDate();
        insights.push({
          id: `budget-warn-${budget.category}`,
          type: 'forecast',
          severity: 'warning',
          title: `${budget.category} at ${Math.round(pct)}% — ${daysLeft}d left`,
          body: `${fmtINR(budget.limit - spent)} remaining for the rest of the month.`,
          action: 'View budget',
          category: budget.category,
          value: spent,
          threshold: budget.limit,
        });
      }
    }

    // --- Savings achievement ---
    const totalIncome = thisMonthTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = thisMonthTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate >= 40) {
        insights.push({
          id: 'savings-great',
          type: 'achievement',
          severity: 'success',
          title: `Saving ${Math.round(savingsRate)}% of income this month`,
          body: `You've saved ${fmtINR(totalIncome - totalExpense)} out of ${fmtINR(totalIncome)}. Excellent discipline!`,
          action: 'View goals',
        });
      } else if (savingsRate < 10 && totalIncome > 0) {
        insights.push({
          id: 'savings-low',
          type: 'tip',
          severity: 'warning',
          title: `Low savings rate: ${Math.round(savingsRate)}%`,
          body: `Target is 20%+ savings. Review your largest expense categories this month.`,
          action: 'View insights',
        });
      }
    }

    // Sort: danger first, then warning, then success, then tip
    const order = { danger: 0, warning: 1, success: 2, info: 3 };
    return insights.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  /* ── Comparison data (MoM / YoY) ─────────────── */
  async getComparisons(userId: string) {
    const now = new Date();
    const periods = [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: d.toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
        };
      })
      .reverse();

    const txns = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: periods[0].key + '-01' } },
    });

    return periods.map((p) => {
      const monthTxns = txns.filter((t) => t.date.startsWith(p.key));
      const income = monthTxns
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expense = monthTxns
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      return {
        ...p,
        income: Math.round(income),
        expense: Math.round(expense),
        net: Math.round(income - expense),
      };
    });
  }
}

function fmtINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}
