import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

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
    // 1. Generate Wealth Snapshot
    const snapshot = await this.generateWealthSnapshot(userId);

    // 2. Prepare Prompt
    const systemPrompt = `
You are the AI Wealth Copilot for the FinTrack app. You have a dual-persona intelligence:
- "CA Persona" (Chartered Accountant): Focuses on defense (budgets, overspending, taxes, daily expenses, risk mitigation).
- "CFA Persona" (Chartered Financial Analyst): Focuses on offense (investments, wealth growth, savings rates, long-term goals).

Dynamically adopt the correct persona based on the user's prompt. 
Format your internal logic in a <thought> block before giving the response, but do not speak the thought block.
Make your ONLY final output the actual text you want to be read aloud to the user (keep it concise, conversational, and direct). DO NOT use markdown like asterisks or formatting in your spoken response, as it will be piped directly to Text-to-Speech.

User's Financial Snapshot (JSON):
${JSON.stringify(snapshot)}

User Query: "${transcript}"
`.trim();

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent(systemPrompt);
      const output = result.response.text();

      // Clean up thought block if necessary
      const finalSpokenText = output
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .trim();
      return (
        finalSpokenText ||
        "I'm sorry, I couldn't process that request right now."
      );
    } catch (error: any) {
      this.logger.error('Gemini error: ' + error.message);
      return "I'm currently unable to access my intelligence network. Please check my API key configuration.";
    }
  }

  private async generateWealthSnapshot(userId: string) {
    // Basic aggregation
    const [assets, liabilities, budgets, txns] = await Promise.all([
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.liability.findMany({ where: { userId } }),
      this.prisma.budget.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 100, // last 100 txns to save context
      }),
    ]);

    const totalAssetsCents = assets.reduce(
      (s, a) => s + a.currentValueInCents,
      0,
    );
    const totalLiabilitiesCents = liabilities.reduce(
      (s, l) => s + l.remainingBalanceInCents,
      0,
    );
    const netWorth = (totalAssetsCents - totalLiabilitiesCents) / 100;

    // This month tracking
    const now = new Date();
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTxns = txns.filter((t) =>
      t.date.startsWith(thisMonthPrefix),
    );
    const thisMonthExpenses = thisMonthTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const thisMonthIncome = thisMonthTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const activeBudgets = budgets.map((b) => {
      const spent = thisMonthTxns
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      return { category: b.category, limit: b.limit, spent };
    });

    return {
      netWorthBase: netWorth,
      thisMonthStart: thisMonthPrefix,
      thisMonthIncome,
      thisMonthExpenses,
      savingsRatePct:
        thisMonthIncome > 0
          ? Math.round(
              ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100,
            )
          : 0,
      activeBudgets,
    };
  }
}
