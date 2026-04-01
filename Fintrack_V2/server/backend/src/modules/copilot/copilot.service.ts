import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

/* ─── INR formatters (server-side, no Intl locale issues) ── */
function fmtINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

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
5. Respond ONLY with the final spoken text. No markdown, no asterisks, no bullet points, no thought blocks.
6. When the user asks about their net worth, investments, or portfolio — use the EXACT numbers from the snapshot below.
7. If data shows 0 or missing, say "I don't see any data for that yet" — don't invent numbers.

USER'S COMPLETE FINANCIAL SNAPSHOT (all values in Indian Rupees ₹):
${JSON.stringify(snapshot, null, 2)}

User query: "${transcript}"

Respond naturally, like a trusted financial advisor who knows all their numbers. Be specific — use the actual figures from the snapshot.
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
   *  FULL WEALTH SNAPSHOT — queries ALL data sources
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

    /* ── Fetch everything in parallel ── */
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
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.liability.findMany({ where: { userId } }),
      this.prisma.budget.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 200,
      }),
      this.prisma.mutualFundHolding.findMany({ where: { userId } }),
      this.prisma.stockHolding.findMany({ where: { userId } }),
      this.prisma.insurance.findMany({ where: { userId, isActive: true } }),
      this.prisma.goal.findMany({ where: { userId } }).catch(() => []),
    ]);

    /* ── Transaction grouping ── */
    const thisMoTxns = allTxns.filter((t) =>
      t.date.startsWith(thisMonthPrefix),
    );
    const lastMoTxns = allTxns.filter((t) =>
      t.date.startsWith(lastMonthPrefix),
    );
    const last3MoTxns = allTxns.filter((t) => t.date >= threeMonthsAgo);

    const sum = (txns: typeof allTxns, type: string) =>
      txns.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

    const thisIncome = sum(thisMoTxns, 'income');
    const thisExpense = sum(thisMoTxns, 'expense');
    const lastIncome = sum(lastMoTxns, 'income');
    const lastExpense = sum(lastMoTxns, 'expense');

    /* ── Category breakdown this month ── */
    const categorySpend: Record<string, number> = {};
    for (const t of thisMoTxns.filter((t) => t.type === 'expense')) {
      categorySpend[t.category] = (categorySpend[t.category] ?? 0) + t.amount;
    }

    /* ── Budget health ── */
    const budgetHealth = budgets.map((b) => ({
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

    /* ── Mutual Fund portfolio ── */
    const mfPortfolio = mfHoldings.map((h) => {
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

    const mfTotalInvested = mfPortfolio.reduce((s, h) => s + h.investedINR, 0);
    const mfTotalCurrent = mfPortfolio.reduce(
      (s, h) => s + h.currentValueINR,
      0,
    );

    /* ── Stock portfolio ── */
    const stockPortfolio = stockHoldings.map((h) => {
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
      (s, h) => s + h.investedINR,
      0,
    );
    const stockTotalCurrent = stockPortfolio.reduce(
      (s, h) => s + h.currentValueINR,
      0,
    );

    /* ── Manual assets ── */
    const manualAssets = assets.map((a) => ({
      name: a.name,
      type: a.type,
      currentValueINR: Math.round(a.currentValueInCents / 100),
    }));
    const manualAssetsTotal = manualAssets.reduce(
      (s, a) => s + a.currentValueINR,
      0,
    );

    /* ── Net worth ── */
    const totalAssetsINR =
      mfTotalCurrent + stockTotalCurrent + manualAssetsTotal;
    const totalLiabilitiesINR = liabilities.reduce(
      (s, l) => s + l.remainingBalanceInCents / 100,
      0,
    );
    const netWorthINR = totalAssetsINR - totalLiabilitiesINR;
    const totalInvestedINR = mfTotalInvested + stockTotalInvested;
    const totalPnlINR = mfTotalCurrent + stockTotalCurrent - totalInvestedINR;
    const totalPnlPct =
      totalInvestedINR > 0 ? (totalPnlINR / totalInvestedINR) * 100 : 0;

    /* ── Debt metrics ── */
    const debtToAsset =
      totalAssetsINR > 0 ? (totalLiabilitiesINR / totalAssetsINR) * 100 : 0;
    const totalPrincipal = liabilities.reduce(
      (s, l) => s + l.totalPrincipalInCents / 100,
      0,
    );
    const financialFreedomPct =
      totalPrincipal > 0
        ? Math.min(
            ((totalPrincipal - totalLiabilitiesINR) / totalPrincipal) * 100,
            100,
          )
        : 100;

    /* ── Liabilities detail ── */
    const liabilitiesDetail = liabilities.map((l) => ({
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
    }));

    /* ── Insurance ── */
    const insuranceDetail = insurancePolicies.map((p) => ({
      policyName: p.policyName,
      type: p.type,
      provider: p.provider,
      sumInsuredINR: Math.round(Number(p.sumInsured) / 100),
      premiumINR: Math.round(Number(p.premiumAmount) / 100),
      frequency: p.frequency,
      nextDueDateISO: p.nextDueDate,
    }));
    const totalCoverageINR = insuranceDetail.reduce(
      (s, p) => s + p.sumInsuredINR,
      0,
    );

    /* ── Goals ── */
    const goalsDetail = (goals as any[]).map((g) => ({
      name: g.name,
      targetAmountINR: g.targetAmount ?? 0,
      currentAmountINR: g.currentAmount ?? 0,
      progressPct:
        g.targetAmount > 0
          ? Math.round((g.currentAmount / g.targetAmount) * 100)
          : 0,
      targetDate: g.targetDate,
      monthlyNeeded:
        g.targetDate && g.currentAmount < g.targetAmount
          ? Math.round(
              (g.targetAmount - g.currentAmount) /
                Math.max(
                  Math.ceil(
                    (new Date(g.targetDate).getTime() - Date.now()) /
                      2_592_000_000,
                  ),
                  1,
                ),
            )
          : 0,
    }));

    /* ── 3-month spending trends ── */
    const spendingByCategory: Record<string, number> = {};
    for (const t of last3MoTxns.filter((t) => t.type === 'expense')) {
      spendingByCategory[t.category] =
        (spendingByCategory[t.category] ?? 0) + t.amount;
    }
    const topSpendingCategories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, total]) => ({
        category: cat,
        totalLast3MonthsINR: Math.round(total),
        avgMonthlyINR: Math.round(total / 3),
      }));

    /* ── Recent 10 transactions ── */
    const recentTxns = allTxns.slice(0, 10).map((t) => ({
      date: t.date,
      type: t.type,
      merchant: t.merchant,
      category: t.category,
      amountINR: t.amount,
    }));

    /* ── Savings rate ── */
    const savingsRatePct =
      thisIncome > 0
        ? Math.round(((thisIncome - thisExpense) / thisIncome) * 100)
        : 0;

    /* ── Best & worst performers ── */
    const allHoldings = [...mfPortfolio, ...stockPortfolio];
    const bestPerformer = allHoldings.sort((a, b) => b.pnlPct - a.pnlPct)[0];
    const worstPerformer = allHoldings.sort((a, b) => a.pnlPct - b.pnlPct)[0];

    /* ── Build the final snapshot object ── */
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
        manualAssets: {
          totalValueINR: manualAssetsTotal,
          items: manualAssets,
        },
        bestPerformer: bestPerformer
          ? {
              name:
                (bestPerformer as any).schemeName ||
                (bestPerformer as any).companyName,
              pnlPct: bestPerformer.pnlPct,
            }
          : null,
        worstPerformer: worstPerformer
          ? {
              name:
                (worstPerformer as any).schemeName ||
                (worstPerformer as any).companyName,
              pnlPct: worstPerformer.pnlPct,
            }
          : null,
      },

      liabilities: liabilitiesDetail,

      insurance: {
        totalCoverageINR,
        policiesCount: insurancePolicies.length,
        policies: insuranceDetail,
      },

      goals: goalsDetail,
    };
  }
}
