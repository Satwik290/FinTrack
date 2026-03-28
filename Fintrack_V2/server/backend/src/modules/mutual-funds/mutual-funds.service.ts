import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketDataService } from '../shared/market-data.service';

export interface AddLumpsumDto {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
  category?: string;
  units: number;
  avgNAV: number;
  investedAt?: string;
}

export interface AddSipDto {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
  category?: string;
  sipAmount: number;
  sipDay: number;
  sipStartDate: string;
  units?: number;
  avgNAV?: number;
}

function calcSipInstallments(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  if (start > now) return 0;
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth()) +
    1
  );
}

function nextSipDate(sipDay: number): string {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), sipDay);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, sipDay);
  return d.toISOString().split('T')[0];
}

@Injectable()
export class MutualFundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly market: MarketDataService,
    // Inject HttpService directly so getNavHistory can use firstValueFrom
    private readonly http: HttpService,
  ) {}

  /* ── Search ─────────────────────────────────────── */
  async search(query: string) {
    return this.market.searchMutualFunds(query);
  }

  /* ── Add lumpsum ────────────────────────────────── */
  async addLumpsum(userId: string, dto: AddLumpsumDto) {
    const navData = await this.market.fetchMfNav(dto.schemeCode);
    const currentNAV = navData?.nav ?? dto.avgNAV;

    return this.prisma.mutualFundHolding.create({
      data: {
        userId,
        schemeCode: dto.schemeCode,
        schemeName: dto.schemeName,
        fundHouse: dto.fundHouse ?? '',
        category: dto.category ?? 'Equity',
        units: dto.units,
        avgNAV: dto.avgNAV,
        currentNAV,
        investedAt: dto.investedAt ?? new Date().toISOString().split('T')[0],
        isSIP: false,
        navLastUpdated: navData ? new Date() : null,
      },
    });
  }

  /* ── Add SIP ────────────────────────────────────── */
  async addSip(userId: string, dto: AddSipDto) {
    const navData = await this.market.fetchMfNav(dto.schemeCode);
    const currentNAV = navData?.nav ?? dto.avgNAV ?? 0;
    const installments = calcSipInstallments(dto.sipStartDate);

    return this.prisma.mutualFundHolding.create({
      data: {
        userId,
        schemeCode: dto.schemeCode,
        schemeName: dto.schemeName,
        fundHouse: dto.fundHouse ?? '',
        category: dto.category ?? 'Equity',
        units: dto.units ?? 0,
        avgNAV: dto.avgNAV ?? currentNAV,
        currentNAV,
        isSIP: true,
        sipAmount: dto.sipAmount,
        sipDay: dto.sipDay,
        sipStartDate: dto.sipStartDate,
        totalSipInstallments: installments,
        navLastUpdated: navData ? new Date() : null,
      },
    });
  }

  /* ── Portfolio with P&L ─────────────────────────── */
  async getPortfolio(userId: string) {
    const holdings = await this.prisma.mutualFundHolding.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = holdings.map((h) => {
      const investedAmount = h.isSIP
        ? (h.sipAmount ?? 0) * h.totalSipInstallments
        : h.units * h.avgNAV;

      const currentValue = h.units * h.currentNAV;
      const pnl = currentValue - investedAmount;
      const pnlPct = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;

      return {
        ...h,
        investedAmount: Math.round(investedAmount * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        pnlPct: Math.round(pnlPct * 100) / 100,
        nextSipDate: h.isSIP && h.sipDay ? nextSipDate(h.sipDay) : null,
      };
    });

    const totalInvested = enriched.reduce((s, h) => s + h.investedAmount, 0);
    const totalCurrent = enriched.reduce((s, h) => s + h.currentValue, 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return {
      holdings: enriched,
      summary: {
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalCurrent: Math.round(totalCurrent * 100) / 100,
        totalPnl: Math.round(totalPnl * 100) / 100,
        totalPnlPct: Math.round(totalPnlPct * 100) / 100,
        holdingsCount: holdings.length,
      },
    };
  }

  /* ── NAV history for chart ──────────────────────── */
  // FIX: was using this.market['http'] (private field access → Observable, no .data)
  // Now uses injected HttpService + firstValueFrom correctly.
  async getNavHistory(
    schemeCode: string,
    period: '1Y' | '3Y' | '5Y' = '1Y',
  ): Promise<{ date: string; nav: number }[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: { date: string; nav: string }[] }>(
          `https://api.mfapi.in/mf/${schemeCode}`,
          { timeout: 10000 },
        ),
      );

      const allData = res.data?.data ?? [];
      const years = period === '1Y' ? 1 : period === '3Y' ? 3 : 5;
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - years);

      return allData
        .filter((d) => {
          // MFAPI returns dates as DD-MM-YYYY
          const [dd, mm, yyyy] = d.date.split('-');
          return new Date(`${yyyy}-${mm}-${dd}`) >= cutoff;
        })
        .map((d) => ({ date: d.date, nav: parseFloat(d.nav) }))
        .reverse(); // chronological order
    } catch {
      return [];
    }
  }

  /* ── Delete ─────────────────────────────────────── */
  async remove(userId: string, id: string) {
    const h = await this.prisma.mutualFundHolding.findFirst({
      where: { id, userId },
    });
    if (!h) throw new NotFoundException('Holding not found');
    return this.prisma.mutualFundHolding.delete({ where: { id } });
  }

  /* ── Price worker refresh ───────────────────────── */
  async refreshAllNavs(userId?: string) {
    const where = userId ? { userId } : {};
    const holdings = await this.prisma.mutualFundHolding.findMany({ where });
    const unique = [...new Set(holdings.map((h) => h.schemeCode))];

    for (const code of unique) {
      const navData = await this.market.fetchMfNav(code);
      if (!navData) continue;
      await this.prisma.mutualFundHolding.updateMany({
        where: { schemeCode: code },
        data: { currentNAV: navData.nav, navLastUpdated: new Date() },
      });
      // Recalculate SIP installments for any SIP holdings on this scheme
      const sipHoldings = holdings.filter(
        (h) => h.schemeCode === code && h.isSIP && h.sipStartDate,
      );
      for (const h of sipHoldings) {
        await this.prisma.mutualFundHolding.update({
          where: { id: h.id },
          data: { totalSipInstallments: calcSipInstallments(h.sipStartDate!) },
        });
      }
    }
  }
}
