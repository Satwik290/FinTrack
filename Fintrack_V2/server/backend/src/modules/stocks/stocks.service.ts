import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketDataService } from '../shared/market-data.service';

export interface AddStockDto {
  ticker: string;
  exchange: 'NSE' | 'US' | 'CRYPTO';
  companyName: string;
  quantity: number;
  avgBuyPrice: number; // always in ₹
}

function tickerForExchange(ticker: string, exchange: string): string {
  if (exchange === 'NSE')
    return ticker.endsWith('.NS') ? ticker : `${ticker}.NS`;
  if (exchange === 'CRYPTO') {
    // Normalise to BTC-USD format for Yahoo + CoinGecko mapping
    return ticker.includes('-')
      ? ticker.toUpperCase()
      : `${ticker.toUpperCase()}-USD`;
  }
  return ticker.toUpperCase(); // US stocks as-is
}

@Injectable()
export class StocksService {
  constructor(
    private prisma: PrismaService,
    private market: MarketDataService,
  ) {}

  async search(query: string, exchange: string) {
    return this.market.searchYahoo(query);
  }

  async addHolding(userId: string, dto: AddStockDto) {
    const ticker = tickerForExchange(dto.ticker, dto.exchange);
    let currentPrice = dto.avgBuyPrice; // fallback to buy price

    if (dto.exchange === 'CRYPTO') {
      const prices = await this.market.fetchCryptoPrices([ticker]);
      const p = prices.get(ticker);
      if (p) currentPrice = p.priceInr;
    } else {
      const p = await this.market.fetchYahooPrice(ticker);
      if (p) currentPrice = p.priceInr;
    }

    return this.prisma.stockHolding.create({
      data: {
        userId,
        ticker,
        exchange: dto.exchange,
        companyName: dto.companyName,
        quantity: dto.quantity,
        avgBuyPrice: dto.avgBuyPrice,
        currentPrice,
        currency: 'INR',
        priceLastUpdated: new Date(),
      },
    });
  }

  async getPortfolio(userId: string) {
    const holdings = await this.prisma.stockHolding.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = holdings.map((h) => {
      const investedAmount = h.quantity * h.avgBuyPrice;
      const currentValue = h.quantity * h.currentPrice;
      const pnl = currentValue - investedAmount;
      const pnlPct = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;
      return {
        ...h,
        investedAmount: Math.round(investedAmount * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        pnlPct: Math.round(pnlPct * 100) / 100,
      };
    });

    const totalInvested = enriched.reduce((s, h) => s + h.investedAmount, 0);
    const totalCurrent = enriched.reduce((s, h) => s + h.currentValue, 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Group by exchange for allocation view
    const byExchange = enriched.reduce(
      (acc, h) => {
        acc[h.exchange] = (acc[h.exchange] ?? 0) + h.currentValue;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      holdings: enriched,
      summary: {
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalCurrent: Math.round(totalCurrent * 100) / 100,
        totalPnl: Math.round(totalPnl * 100) / 100,
        totalPnlPct: Math.round(totalPnlPct * 100) / 100,
        holdingsCount: holdings.length,
        byExchange,
      },
    };
  }

  async remove(userId: string, id: string) {
    const h = await this.prisma.stockHolding.findFirst({
      where: { id, userId },
    });
    if (!h) throw new NotFoundException('Holding not found');
    return this.prisma.stockHolding.delete({ where: { id } });
  }

  /* ── Called by price worker ─────────────────── */
  async refreshAllPrices(userId?: string) {
    const where = userId ? { userId } : {};
    const holdings = await this.prisma.stockHolding.findMany({ where });

    const nse = [
      ...new Set(
        holdings.filter((h) => h.exchange === 'NSE').map((h) => h.ticker),
      ),
    ];
    const us = [
      ...new Set(
        holdings.filter((h) => h.exchange === 'US').map((h) => h.ticker),
      ),
    ];
    const crypto = [
      ...new Set(
        holdings.filter((h) => h.exchange === 'CRYPTO').map((h) => h.ticker),
      ),
    ];

    // Fetch crypto in batch
    const cryptoPrices = await this.market.fetchCryptoPrices(crypto);

    // Fetch NSE + US one by one (Yahoo doesn't support true batching in free tier)
    const priceMap = new Map<string, number>(
      [...cryptoPrices.entries()].map(([k, v]) => [k, v.priceInr]),
    );
    for (const ticker of [...nse, ...us]) {
      const p = await this.market.fetchYahooPrice(ticker);
      if (p) priceMap.set(ticker, p.priceInr);
    }

    // Bulk update
    for (const [ticker, price] of priceMap.entries()) {
      await this.prisma.stockHolding.updateMany({
        where: { ticker },
        data: { currentPrice: price, priceLastUpdated: new Date() },
      });
    }
  }
}
