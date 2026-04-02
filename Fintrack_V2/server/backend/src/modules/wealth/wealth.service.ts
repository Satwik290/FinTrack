import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MutualFundsService } from '../mutual-funds/mutual-funds.service';
import { StocksService } from '../stocks/stocks.service';
import type { Liability, Asset, Insurance, Budget } from '@prisma/client';

/* ══════════════════════════════════════════════════
 * EXPORTED TYPES  (imported by wealth.controller.ts)
 * ══════════════════════════════════════════════════ */
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
    private readonly mfService: MutualFundsService,
    private readonly stocksService: StocksService,
  ) {}

  /* ─────────────────────────────────────────────────
   * PRIMARY AGGREGATOR — single source of truth
   * ───────────────────────────────────────────────── */
  async getFullSummary(userId: string) {
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
      // Explicit return types on catch() prevent TypeScript inferring never[]
      this.prisma.asset
        .findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
        .catch((): Asset[] => []),
      this.prisma.liability
        .findMany({ where: { userId }, orderBy: { interestRate: 'desc' } })
        .catch((): Liability[] => []),
      this.prisma.budget
        .findMany({ where: { userId } })
        .catch((): Budget[] => []),
      this.fetchInsurances(userId),
    ]);

    /* ── Compute each pillar ── */
    const mfCurrentValue = mfPortfolio.summary.totalCurrent;
    const mfInvested = mfPortfolio.summary.totalInvested;
    const stockCurrentValue = stockPortfolio.summary.totalCurrent;
    const stockInvested = stockPortfolio.summary.totalInvested;

    const manualAssetValue = assets.reduce(
      (s: number, a) => s + a.currentValueInCents / 100,
      0,
    );

    // Number() cast: schema stores these as Int (pg integer),
    // but PrismaPg adapter occasionally returns them as bigint strings.
    const totalLiabilitiesNum = liabilities.reduce(
      (s: number, l) => s + Number(l.remainingBalanceInCents) / 100,
      0,
    );
    const totalPrincipalNum = liabilities.reduce(
      (s: number, l) => s + Number(l.totalPrincipalInCents) / 100,
      0,
    );

    const totalAssets = mfCurrentValue + stockCurrentValue + manualAssetValue;
    const netWorth = totalAssets - totalLiabilitiesNum;
    const totalInvested = mfInvested + stockInvested;
    const totalPnl = mfCurrentValue + stockCurrentValue - totalInvested;
    const totalPnlPct =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const debtToAsset =
      totalAssets > 0 ? (totalLiabilitiesNum / totalAssets) * 100 : 0;
    const financialFreedomPct =
      totalPrincipalNum > 0
        ? Math.min(
            ((totalPrincipalNum - totalLiabilitiesNum) / totalPrincipalNum) *
              100,
            100,
          )
        : 100;

    /* ── Allocation breakdown ── */
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

    /* ── Top performers ── */
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

    /* ── Freshness ── */
    const latestStockUpdate = stockPortfolio.holdings.reduce((l: number, h) => {
      const t = h.priceLastUpdated ? new Date(h.priceLastUpdated).getTime() : 0;
      return t > l ? t : l;
    }, 0);
    const latestMfUpdate = mfPortfolio.holdings.reduce((l: number, h) => {
      const t = h.navLastUpdated ? new Date(h.navLastUpdated).getTime() : 0;
      return t > l ? t : l;
    }, 0);

    /* ── Insurance & HLV ── */
    const annualExpenses =
      budgets.reduce((sum: number, b) => sum + b.limit, 0) * 12;
    const liquidAssets = stockCurrentValue + mfCurrentValue;
    const requiredCoverage = Math.max(
      annualExpenses * 20 + totalLiabilitiesNum - liquidAssets,
      0,
    );
    const totalInsuranceCoverage = insurances.reduce(
      (sum: number, i) => sum + Number(i.sumInsured) / 100,
      0,
    );
    const gap = Math.max(requiredCoverage - totalInsuranceCoverage, 0);
    const formattedInsurances = insurances.map((i) => ({
      ...i,
      sumInsured: Number(i.sumInsured) / 100,
      premiumAmount: Number(i.premiumAmount) / 100,
    }));

    return {
      netWorth: Math.round(netWorth * 100) / 100,
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalLiabilities: Math.round(totalLiabilitiesNum * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      totalPnlPct: Math.round(totalPnlPct * 100) / 100,
      allocation,
      mfSummary: mfPortfolio.summary,
      stockSummary: stockPortfolio.summary,
      manualAssetsValue: Math.round(manualAssetValue * 100) / 100,
      mfHoldings: mfPortfolio.holdings,
      stockHoldings: stockPortfolio.holdings,
      assets,
      liabilities,
      top5Performers,
      top5Losers,
      debtToAsset: Math.round(debtToAsset * 100) / 100,
      financialFreedomPct: Math.round(financialFreedomPct * 100) / 100,
      lastSynced: {
        stocks: latestStockUpdate
          ? new Date(latestStockUpdate).toISOString()
          : null,
        mutualFunds: latestMfUpdate
          ? new Date(latestMfUpdate).toISOString()
          : null,
        manualAssets:
          assets.length > 0
            ? assets.reduce((l: number, a) => {
                const t = new Date(a.updatedAt).getTime();
                return t > l ? t : l;
              }, 0)
            : null,
      },
      insurancePolicies: formattedInsurances,
      totalInsuranceCoverage: Math.round(totalInsuranceCoverage * 100) / 100,
      hlvMetrics: {
        requiredCoverage: Math.round(requiredCoverage * 100) / 100,
        gap: Math.round(gap * 100) / 100,
      },
    };
  }

  /* ── Insurance: safe fetch ── */
  private async fetchInsurances(userId: string): Promise<Insurance[]> {
    try {
      return await this.prisma.insurance.findMany({
        where: { userId, isActive: true },
      });
    } catch (err: any) {
      this.logger.warn(`Insurance query failed: ${err.message}`);
      return [];
    }
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
