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
  month: string;
  key: string;
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

  /* ══════════════════════════════════════════════
   *  12-MONTH FORECAST
   *  FIX: When there are no completed historic months
   *  (new user / all data in current month), use the
   *  current month's partial data as the baseline so
   *  charts render real numbers instead of flat ₹0.
   * ══════════════════════════════════════════════ */
  async getForecast(userId: string): Promise<ForecastMonth[]> {
    // Pull ALL transactions — no date filter, so new users with only
    // current-month data still get real numbers
    const txns = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Group every transaction by YYYY-MM
    const byMonth: Record<string, { income: number; expense: number }> = {};
    for (const t of txns) {
      const key = t.date.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
      if (t.type === 'income') byMonth[key].income += t.amount;
      else byMonth[key].expense += t.amount;
    }

    // Completed months = any month strictly before current month
    const historicKeys = Object.keys(byMonth)
      .filter((k) => k < currentKey)
      .sort();

    let avgIncome: number;
    let avgExpense: number;

    if (historicKeys.length > 0) {
      // Normal case: average over completed months
      avgIncome =
        historicKeys.reduce((s, k) => s + byMonth[k].income, 0) /
        historicKeys.length;
      avgExpense =
        historicKeys.reduce((s, k) => s + byMonth[k].expense, 0) /
        historicKeys.length;
    } else {
      // New user: no completed months yet — use current month as baseline.
      // Scale partial-month data to full month for a realistic projection.
      const dayOfMonth = now.getDate();
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const scaleFactor = dayOfMonth > 0 ? daysInMonth / dayOfMonth : 1;

      const currentData = byMonth[currentKey] ?? { income: 0, expense: 0 };
      avgIncome = currentData.income * scaleFactor;
      avgExpense = currentData.expense * scaleFactor;
    }

    // Build 12-month window: 3 months back → current → 8 months forward
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
        // For past & current months, show actual numbers if they exist
        actualIncome: actual?.income ?? (isPast || isCurrent ? 0 : undefined),
        actualExpense: actual?.expense ?? (isPast || isCurrent ? 0 : undefined),
        isProjected: !isPast && !isCurrent,
      });
    }

    return result;
  }

  /* ══════════════════════════════════════════════
   *  INSIGHTS / ANOMALY DETECTION
   * ══════════════════════════════════════════════ */
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

    const [thisMonthTxns, lastMonthTxns, budgets] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: thisMonthStart } },
      }),
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: lastMonthStart, lt: thisMonthStart } },
      }),
      this.prisma.budget.findMany({ where: { userId } }),
    ]);

    const insights: InsightAlert[] = [];

    const groupByCat = (txns: typeof thisMonthTxns) => {
      const m: Record<string, number> = {};
      for (const t of txns.filter((x) => x.type === 'expense')) {
        m[t.category] = (m[t.category] ?? 0) + t.amount;
      }
      return m;
    };

    const thisCat = groupByCat(thisMonthTxns);
    const lastCat = groupByCat(lastMonthTxns);

    // Anomaly: category spending 50%+ above last month
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

    // Budget alerts
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

    // Savings achievement / warning
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
      } else if (savingsRate < 10) {
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

    const order: Record<string, number> = {
      danger: 0,
      warning: 1,
      success: 2,
      info: 3,
    };
    return insights.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  /* ══════════════════════════════════════════════
   *  MONTH-OVER-MONTH COMPARISONS
   *  FIX: Pull ALL transactions (no hard cutoff) so
   *  a user with only current-month data still sees
   *  a real bar for that month instead of all zeros.
   * ══════════════════════════════════════════════ */
  async getComparisons(userId: string) {
    const now = new Date();

    // Build 6 months of period keys (oldest → newest)
    const periods = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
      };
    });

    // Pull ALL transactions — no date filter so we never miss anything
    const txns = await this.prisma.transaction.findMany({
      where: { userId },
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
