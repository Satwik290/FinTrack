import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

function fmtShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10_000_000)
    return `${sign}₹${(abs / 10_000_000).toFixed(2)} Crore`;
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)} Lakh`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}k`;
  return `${sign}₹${Math.round(abs)}`;
}

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') || 'dummy_key';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async processQuery(userId: string, transcript: string): Promise<string> {
    const snapshot = await this.buildFullSnapshot(userId);

    const systemPrompt = `
You are the AI Wealth Copilot for FinTrack, an Indian personal finance app.
CRITICAL RULES — follow these always:
1. ALL monetary values are in Indian Rupees (₹ / INR). NEVER mention dollars or USD.
2. Use Indian number system: Lakh (1,00,000), Crore (1,00,00,000). E.g. "₹4.3 Lakh" not "₹430,000".
3. Be conversational, concise (2-4 sentences), and speak directly to the user as "you".
4. You have TWO personas — activate the right one:
   - CA (Chartered Accountant): budget defense, overspending, tax, daily money management
   - CFA (Chartered Financial Analyst): investments, wealth growth, portfolio, long-term goals
5. Respond ONLY with the final spoken text. No markdown, no asterisks, no bullet points.
6. When the user asks about net worth, investments, or portfolio — use EXACT numbers from the snapshot.
7. If data shows 0 or missing, say "I don't see any data for that yet" — don't invent numbers.

USER'S COMPLETE FINANCIAL SNAPSHOT (all values in Indian Rupees ₹):
${JSON.stringify(snapshot, null, 2)}

User query: "${transcript}"

Respond naturally, like a trusted financial advisor who knows all their numbers.
`.trim();

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
      const result = await model.generateContent(systemPrompt);
      const output = result.response
        .text()
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .replace(/\*+/g, '')
        .trim();
      return output || "I couldn't generate a response. Please try again.";
    } catch (error: any) {
      this.logger.error('Gemini error: ' + error.message);
      return "I'm currently unable to access my intelligence network. Please check the GEMINI_API_KEY configuration.";
    }
  }

  /* ══════════════════════════════════════════════════
   *  FULL WEALTH SNAPSHOT
   *  Each query is wrapped with .catch(() => []) so a
   *  missing/unmigrated table never crashes the whole
   *  snapshot build.
   * ══════════════════════════════════════════════════ */
  private async buildFullSnapshot(userId: string) {
    const now = new Date();
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthPrefix = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    const threeMonthsAgo = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    })();

    const [
      assets,
      liabilities,
      budgets,
      allTxns,
      mfHoldings,
      stockHoldings,
      insurancePolicies,
      goals,
    ] = await Promise.all([
      this.prisma.asset.findMany({ where: { userId } }).catch(() => []),
      this.prisma.liability.findMany({ where: { userId } }).catch(() => []),
      this.prisma.budget.findMany({ where: { userId } }).catch(() => []),
      this.prisma.transaction
        .findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 200,
        })
        .catch(() => []),
      this.prisma.mutualFundHolding
        .findMany({ where: { userId } })
        .catch(() => []),
      this.prisma.stockHolding.findMany({ where: { userId } }).catch(() => []),
      // FIX: Insurance may not be migrated yet
      this.safeInsuranceFetch(userId),
      // FIX: Goal is a stub on PrismaService
      this.safeGoalFetch(userId),
    ]);

    const thisMoTxns = allTxns.filter((t: any) =>
      t.date.startsWith(thisMonthPrefix),
    );
    const lastMoTxns = allTxns.filter((t: any) =>
      t.date.startsWith(lastMonthPrefix),
    );
    const last3MoTxns = allTxns.filter((t: any) => t.date >= threeMonthsAgo);

    const sumTxns = (txns: any[], type: string) =>
      txns
        .filter((t: any) => t.type === type)
        .reduce((s: number, t: any) => s + t.amount, 0);

    const thisIncome = sumTxns(thisMoTxns, 'income');
    const thisExpense = sumTxns(thisMoTxns, 'expense');
    const lastIncome = sumTxns(lastMoTxns, 'income');
    const lastExpense = sumTxns(lastMoTxns, 'expense');

    const categorySpend: Record<string, number> = {};
    for (const t of thisMoTxns.filter((t: any) => t.type === 'expense')) {
      categorySpend[(t as any).category] =
        (categorySpend[(t as any).category] ?? 0) + (t as any).amount;
    }

    const budgetHealth = budgets.map((b: any) => ({
      category: b.category,
      limitINR: b.limit,
      spentINR: categorySpend[b.category] ?? 0,
      pctUsed:
        b.limit > 0
          ? Math.round(((categorySpend[b.category] ?? 0) / b.limit) * 100)
          : 0,
      status:
        (categorySpend[b.category] ?? 0) >= b.limit
          ? 'EXCEEDED'
          : (categorySpend[b.category] ?? 0) >= b.limit * 0.8
            ? 'WARNING'
            : 'OK',
    }));

    const mfPortfolio = mfHoldings.map((h: any) => {
      const invested = h.isSIP
        ? (h.sipAmount ?? 0) * h.totalSipInstallments
        : h.units * h.avgNAV;
      const current = h.units * h.currentNAV;
      const pnl = current - invested;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
      return {
        schemeName: h.schemeName,
        category: h.category,
        investedINR: Math.round(invested),
        currentValueINR: Math.round(current),
        pnlINR: Math.round(pnl),
        pnlPct: Math.round(pnlPct * 100) / 100,
        isSIP: h.isSIP,
        sipAmountINR: h.sipAmount,
      };
    });

    const mfTotalInvested = mfPortfolio.reduce(
      (s: number, h: any) => s + h.investedINR,
      0,
    );
    const mfTotalCurrent = mfPortfolio.reduce(
      (s: number, h: any) => s + h.currentValueINR,
      0,
    );

    const stockPortfolio = stockHoldings.map((h: any) => {
      const invested = h.quantity * h.avgBuyPrice;
      const current = h.quantity * h.currentPrice;
      const pnl = current - invested;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
      return {
        companyName: h.companyName,
        ticker: h.ticker,
        exchange: h.exchange,
        quantity: h.quantity,
        avgBuyPriceINR: h.avgBuyPrice,
        currentPriceINR: h.currentPrice,
        investedINR: Math.round(invested),
        currentValueINR: Math.round(current),
        pnlINR: Math.round(pnl),
        pnlPct: Math.round(pnlPct * 100) / 100,
      };
    });

    const stockTotalInvested = stockPortfolio.reduce(
      (s: number, h: any) => s + h.investedINR,
      0,
    );
    const stockTotalCurrent = stockPortfolio.reduce(
      (s: number, h: any) => s + h.currentValueINR,
      0,
    );

    const manualAssets = assets.map((a: any) => ({
      name: a.name,
      type: a.type,
      currentValueINR: Math.round(a.currentValueInCents / 100),
    }));
    const manualAssetsTotal = manualAssets.reduce(
      (s: number, a: any) => s + a.currentValueINR,
      0,
    );

    const totalAssetsINR =
      mfTotalCurrent + stockTotalCurrent + manualAssetsTotal;
    const totalLiabilitiesINR = liabilities.reduce(
      (s: number, l: any) => s + l.remainingBalanceInCents / 100,
      0,
    );
    const netWorthINR = totalAssetsINR - totalLiabilitiesINR;
    const totalInvestedINR = mfTotalInvested + stockTotalInvested;
    const totalPnlINR = mfTotalCurrent + stockTotalCurrent - totalInvestedINR;
    const totalPnlPct =
      totalInvestedINR > 0 ? (totalPnlINR / totalInvestedINR) * 100 : 0;
    const debtToAsset =
      totalAssetsINR > 0 ? (totalLiabilitiesINR / totalAssetsINR) * 100 : 0;
    const totalPrincipal = liabilities.reduce(
      (s: number, l: any) => s + l.totalPrincipalInCents / 100,
      0,
    );
    const financialFreedomPct =
      totalPrincipal > 0
        ? Math.min(
            ((totalPrincipal - totalLiabilitiesINR) / totalPrincipal) * 100,
            100,
          )
        : 100;

    const insuranceDetail = insurancePolicies.map((p: any) => ({
      policyName: p.policyName,
      type: p.type,
      provider: p.provider,
      sumInsuredINR: Math.round(Number(p.sumInsured) / 100),
      premiumINR: Math.round(Number(p.premiumAmount) / 100),
      frequency: p.frequency,
      nextDueDateISO: p.nextDueDate,
    }));
    const totalCoverageINR = insuranceDetail.reduce(
      (s: number, p: any) => s + p.sumInsuredINR,
      0,
    );

    const goalsDetail = goals.map((g: any) => ({
      name: g.name ?? g.title ?? 'Goal',
      targetAmountINR: g.targetAmount ?? g.target ?? 0,
      currentAmountINR: g.currentAmount ?? g.current ?? 0,
      progressPct:
        (g.targetAmount ?? g.target ?? 0) > 0
          ? Math.round(
              ((g.currentAmount ?? g.current ?? 0) /
                (g.targetAmount ?? g.target ?? 1)) *
                100,
            )
          : 0,
      targetDate: g.targetDate ?? g.deadline,
    }));

    const spendingByCategory: Record<string, number> = {};
    for (const t of last3MoTxns.filter((t: any) => t.type === 'expense')) {
      spendingByCategory[(t as any).category] =
        (spendingByCategory[(t as any).category] ?? 0) + (t as any).amount;
    }
    const topSpendingCategories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, total]) => ({
        category: cat,
        totalLast3MonthsINR: Math.round(total),
        avgMonthlyINR: Math.round(total / 3),
      }));

    const recentTxns = allTxns
      .slice(0, 10)
      .map((t: any) => ({
        date: t.date,
        type: t.type,
        merchant: t.merchant,
        category: t.category,
        amountINR: t.amount,
      }));

    const savingsRatePct =
      thisIncome > 0
        ? Math.round(((thisIncome - thisExpense) / thisIncome) * 100)
        : 0;
    const allHoldingsPnl = [...mfPortfolio, ...stockPortfolio].sort(
      (a: any, b: any) => b.pnlPct - a.pnlPct,
    );
    const bestPerformer = allHoldingsPnl[0];
    const worstPerformer = allHoldingsPnl[allHoldingsPnl.length - 1];

    return {
      currency: 'INR (Indian Rupees ₹)',
      snapshotDate: now.toISOString().split('T')[0],
      currentMonth: thisMonthPrefix,
      netWorth: {
        totalINR: Math.round(netWorthINR),
        formatted: fmtShort(netWorthINR),
        totalAssetsINR: Math.round(totalAssetsINR),
        totalLiabilitiesINR: Math.round(totalLiabilitiesINR),
        totalInvestedINR: Math.round(totalInvestedINR),
        totalPnlINR: Math.round(totalPnlINR),
        totalPnlPct: Math.round(totalPnlPct * 100) / 100,
        debtToAssetPct: Math.round(debtToAsset * 100) / 100,
        financialFreedomPct: Math.round(financialFreedomPct * 100) / 100,
      },
      thisMonthCashflow: {
        incomeINR: Math.round(thisIncome),
        expenseINR: Math.round(thisExpense),
        savedINR: Math.round(thisIncome - thisExpense),
        savingsRatePct,
        txnCount: thisMoTxns.length,
      },
      lastMonthCashflow: {
        incomeINR: Math.round(lastIncome),
        expenseINR: Math.round(lastExpense),
        savedINR: Math.round(lastIncome - lastExpense),
        savingsRatePct:
          lastIncome > 0
            ? Math.round(((lastIncome - lastExpense) / lastIncome) * 100)
            : 0,
      },
      budgets: budgetHealth,
      topSpendingCategories,
      recentTransactions: recentTxns,
      investments: {
        mutualFunds: {
          totalInvestedINR: mfTotalInvested,
          currentValueINR: mfTotalCurrent,
          pnlINR: Math.round(mfTotalCurrent - mfTotalInvested),
          holdingsCount: mfHoldings.length,
          holdings: mfPortfolio,
        },
        stocks: {
          totalInvestedINR: stockTotalInvested,
          currentValueINR: stockTotalCurrent,
          pnlINR: Math.round(stockTotalCurrent - stockTotalInvested),
          holdingsCount: stockHoldings.length,
          holdings: stockPortfolio,
        },
        manualAssets: { totalValueINR: manualAssetsTotal, items: manualAssets },
        bestPerformer: bestPerformer
          ? {
              name:
                (bestPerformer as any).schemeName ||
                (bestPerformer as any).companyName,
              pnlPct: (bestPerformer as any).pnlPct,
            }
          : null,
        worstPerformer: worstPerformer
          ? {
              name:
                (worstPerformer as any).schemeName ||
                (worstPerformer as any).companyName,
              pnlPct: (worstPerformer as any).pnlPct,
            }
          : null,
      },
      liabilities: liabilities.map((l: any) => ({
        name: l.loanName,
        category: l.category,
        totalPrincipalINR: Math.round(l.totalPrincipalInCents / 100),
        remainingINR: Math.round(l.remainingBalanceInCents / 100),
        interestRatePct: l.interestRate,
        emiINR: l.emiInCents ? Math.round(l.emiInCents / 100) : null,
        repaidPct:
          l.totalPrincipalInCents > 0
            ? Math.round(
                ((l.totalPrincipalInCents - l.remainingBalanceInCents) /
                  l.totalPrincipalInCents) *
                  100,
              )
            : 0,
      })),
      insurance: {
        totalCoverageINR,
        policiesCount: insurancePolicies.length,
        policies: insuranceDetail,
      },
      goals: goalsDetail,
    };
  }

  /* ── Safe accessors ── */
  private async safeInsuranceFetch(userId: string): Promise<any[]> {
    try {
      const acc = (this.prisma as any).insurance;
      if (!acc) return [];
      return await acc.findMany({ where: { userId, isActive: true } });
    } catch (err: any) {
      this.logger.warn(`Insurance fetch skipped: ${err.message}`);
      return [];
    }
  }

  private async safeGoalFetch(userId: string): Promise<any[]> {
    try {
      const acc = (this.prisma as any).goal;
      if (!acc || typeof acc.findMany !== 'function') return [];
      return await acc.findMany({ where: { userId } });
    } catch (err: any) {
      this.logger.warn(`Goal fetch skipped: ${err.message}`);
      return [];
    }
  }
}
