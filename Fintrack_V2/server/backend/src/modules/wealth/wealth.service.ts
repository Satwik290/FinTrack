import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MutualFundsService } from '../mutual-funds/mutual-funds.service';
import { StocksService } from '../stocks/stocks.service';

export type LiabilityCategory =
  | 'Home Loan'
  | 'Car Loan'
  | 'Personal Loan'
  | 'Education Loan'
  | 'Credit Card'
  | 'Other';

@Injectable()
export class WealthService {
  private readonly logger = new Logger(WealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    // Delegates — WealthService READS from these; does NOT query their tables directly
    private readonly mfService: MutualFundsService,
    private readonly stocksService: StocksService,
  ) {}

  /* ────────────────────────────────────────────────
   * PRIMARY AGGREGATOR — single source of truth
   * ──────────────────────────────────────────────── */
  async getFullSummary(userId: string) {
    // 1. Fetch each module's data via their own service
    const [
      mfPortfolio,
      stockPortfolio,
      assets,
      liabilities,
      budgets,
      insurances,
    ] = await Promise.all([
      this.mfService.getPortfolio(userId),
      this.stocksService.getPortfolio(userId),
      this.prisma.asset.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.liability.findMany({
        where: { userId },
        orderBy: { interestRate: 'desc' },
      }),
      this.prisma.budget.findMany({
        where: { userId },
      }),
      this.prisma.insurance.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    // 2. Compute each pillar's total
    const mfCurrentValue = mfPortfolio.summary.totalCurrent;
    const mfInvested = mfPortfolio.summary.totalInvested;
    const stockCurrentValue = stockPortfolio.summary.totalCurrent;
    const stockInvested = stockPortfolio.summary.totalInvested;
    const manualAssetValue = assets.reduce(
      (s, a) => s + a.currentValueInCents / 100,
      0,
    );
    const totalLiabilities = liabilities.reduce(
      (s, l) => s + l.remainingBalanceInCents / 100,
      0,
    );

    // 3. True net worth
    const totalAssets = mfCurrentValue + stockCurrentValue + manualAssetValue;
    const netWorth = totalAssets - totalLiabilities;

    // 4. Total P&L (investments only — manual assets have no "buy price")
    const totalInvested = mfInvested + stockInvested;
    const totalPnl = mfCurrentValue + stockCurrentValue - totalInvested;
    const totalPnlPct =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // 5. Allocation breakdown (for donut chart)
    const allocation = [
      {
        label: 'Mutual Funds',
        value: Math.round(mfCurrentValue * 100) / 100,
        color: '#6366f1',
      },
      {
        label: 'Stocks',
        value: Math.round(stockCurrentValue * 100) / 100,
        color: '#f59e0b',
      },
      {
        label: 'Manual Assets',
        value: Math.round(manualAssetValue * 100) / 100,
        color: '#10b981',
      },
    ].filter((a) => a.value > 0);

    // 6. Top 5 performers across MF + Stocks (by pnlPct descending)
    const allHoldings = [
      ...mfPortfolio.holdings.map((h) => ({
        id: h.id,
        name: h.schemeName,
        type: 'MF' as const,
        currentValue: h.currentValue,
        pnl: h.pnl,
        pnlPct: h.pnlPct,
        badge: h.category,
      })),
      ...stockPortfolio.holdings.map((h) => ({
        id: h.id,
        name: h.companyName,
        type: 'STOCK' as const,
        currentValue: h.currentValue,
        pnl: h.pnl,
        pnlPct: h.pnlPct,
        badge: h.exchange,
      })),
    ].sort((a, b) => b.pnlPct - a.pnlPct);

    const top5Performers = allHoldings.slice(0, 5);
    const top5Losers = [...allHoldings]
      .sort((a, b) => a.pnlPct - b.pnlPct)
      .slice(0, 3);

    // 7. Data freshness
    const latestStockUpdate = stockPortfolio.holdings.reduce((latest, h) => {
      const t = h.priceLastUpdated ? new Date(h.priceLastUpdated).getTime() : 0;
      return t > latest ? t : latest;
    }, 0);
    const latestMfUpdate = mfPortfolio.holdings.reduce((latest, h) => {
      const t = h.navLastUpdated ? new Date(h.navLastUpdated).getTime() : 0;
      return t > latest ? t : latest;
    }, 0);

    // 8. Debt metrics
    const totalPrincipal = liabilities.reduce(
      (s, l) => s + l.totalPrincipalInCents / 100,
      0,
    );
    const debtToAsset =
      totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const financialFreedomPct =
      totalPrincipal > 0
        ? Math.min(
            ((totalPrincipal - totalLiabilities) / totalPrincipal) * 100,
            100,
          )
        : 100;

    // 9. Insurance & HLV (Human Life Value)
    const annualExpenses = budgets.reduce((sum, b) => sum + b.limit, 0) * 12;
    const liquidAssets = stockCurrentValue + mfCurrentValue;
    const requiredCoverage = Math.max(
      annualExpenses * 20 + totalLiabilities - liquidAssets,
      0,
    );
    const totalInsuranceCoverage = insurances.reduce(
      (sum, inc) => sum + Number(inc.sumInsured) / 100,
      0,
    );
    const gap = Math.max(requiredCoverage - totalInsuranceCoverage, 0);

    const formattedInsurances = insurances.map((i) => ({
      ...i,
      sumInsured: Number(i.sumInsured) / 100,
      premiumAmount: Number(i.premiumAmount) / 100,
    }));

    return {
      // Core numbers
      netWorth: Math.round(netWorth * 100) / 100,
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      totalPnlPct: Math.round(totalPnlPct * 100) / 100,
      // Breakdowns
      allocation,
      mfSummary: mfPortfolio.summary,
      stockSummary: stockPortfolio.summary,
      manualAssetsValue: Math.round(manualAssetValue * 100) / 100,
      // Detail data for tabs
      mfHoldings: mfPortfolio.holdings,
      stockHoldings: stockPortfolio.holdings,
      assets,
      liabilities,
      // Intelligence
      top5Performers,
      top5Losers,
      debtToAsset: Math.round(debtToAsset * 100) / 100,
      financialFreedomPct: Math.round(financialFreedomPct * 100) / 100,
      // Freshness
      lastSynced: {
        stocks: latestStockUpdate
          ? new Date(latestStockUpdate).toISOString()
          : null,
        mutualFunds: latestMfUpdate
          ? new Date(latestMfUpdate).toISOString()
          : null,
        manualAssets:
          assets.length > 0
            ? assets.reduce((l, a) => {
                const t = new Date(a.updatedAt).getTime();
                return t > l ? t : l;
              }, 0)
            : null,
      },
      // Insurance
      insurancePolicies: formattedInsurances,
      totalInsuranceCoverage: Math.round(totalInsuranceCoverage * 100) / 100,
      hlvMetrics: {
        requiredCoverage: Math.round(requiredCoverage * 100) / 100,
        gap: Math.round(gap * 100) / 100,
      },
    };
  }

  /* ── Asset CRUD ─────────────────────────────────── */
  async addAsset(
    userId: string,
    data: {
      name: string;
      type: string;
      ticker?: string;
      quantity?: number;
      currentValueInCents: number;
    },
  ) {
    return this.prisma.asset.create({
      data: { userId, ...data, quantity: data.quantity ?? 1 },
    });
  }

  async removeAsset(userId: string, id: string) {
    await this.prisma.asset.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.asset.delete({ where: { id } });
  }

  /* ── Liability CRUD ─────────────────────────────── */
  async addLiability(
    userId: string,
    data: {
      loanName: string;
      category: LiabilityCategory;
      totalPrincipalInCents: number;
      interestRate: number;
      remainingBalanceInCents: number;
      emiInCents?: number;
      dueDate?: string;
    },
  ) {
    return this.prisma.liability.create({ data: { userId, ...data } });
  }

  async removeliability(userId: string, id: string) {
    await this.prisma.liability.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.liability.delete({ where: { id } });
  }
}
