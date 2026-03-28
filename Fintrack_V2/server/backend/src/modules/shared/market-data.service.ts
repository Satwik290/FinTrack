import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ExchangeRateService } from './exchange-rate.service';

export interface PriceResult {
  ticker: string;
  priceInr: number; // always INR
  originalPrice: number; // in source currency
  currency: string;
  companyName?: string;
  change1dPct?: number;
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    private readonly http: HttpService,
    private readonly fx: ExchangeRateService,
  ) {}

  /* ── Yahoo Finance (NSE + US stocks) ─────────── */
  async fetchYahooPrice(ticker: string): Promise<PriceResult | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      const res = await firstValueFrom(this.http.get(url, { timeout: 8000 }));
      const meta = res.data?.chart?.result?.[0]?.meta;
      if (!meta?.regularMarketPrice) return null;

      const price: number = meta.regularMarketPrice;
      const prev: number = meta.previousClose ?? price;
      const change1dPct = prev > 0 ? ((price - prev) / prev) * 100 : 0;
      const currency: string = meta.currency ?? 'USD';
      const usdToInr = await this.fx.getUsdToInr();

      // NSE stocks are in INR already; USD stocks need conversion
      const priceInr = currency === 'INR' ? price : price * usdToInr;

      return {
        ticker,
        priceInr: Math.round(priceInr * 100) / 100,
        originalPrice: price,
        currency,
        companyName: meta.longName ?? meta.shortName ?? ticker,
        change1dPct: Math.round(change1dPct * 100) / 100,
      };
    } catch (e: any) {
      this.logger.warn(`Yahoo price fetch failed for ${ticker}: ${e.message}`);
      return null;
    }
  }

  /* ── CoinGecko (crypto) ───────────────────────── */
  // ticker format expected: 'BTC-USD', 'ETH-USD', 'SOL-USD'
  async fetchCryptoPrices(
    tickers: string[],
  ): Promise<Map<string, PriceResult>> {
    const results = new Map<string, PriceResult>();
    if (tickers.length === 0) return results;

    // Map common ticker → CoinGecko id
    const idMap = this.buildCoinGeckoIdMap(tickers);
    const ids = [...new Set(Object.values(idMap))].join(',');

    try {
      const usdToInr = await this.fx.getUsdToInr();
      const res = await firstValueFrom(
        this.http.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { timeout: 8000 },
        ),
      );

      for (const ticker of tickers) {
        const cgId = idMap[ticker];
        if (!cgId || !res.data?.[cgId]) continue;
        const usdPrice: number = res.data[cgId].usd;
        const change1dPct: number = res.data[cgId].usd_24h_change ?? 0;
        results.set(ticker, {
          ticker,
          priceInr: Math.round(usdPrice * usdToInr * 100) / 100,
          originalPrice: usdPrice,
          currency: 'USD',
          companyName: cgId.charAt(0).toUpperCase() + cgId.slice(1),
          change1dPct: Math.round(change1dPct * 100) / 100,
        });
      }
    } catch (e: any) {
      this.logger.warn(`CoinGecko fetch failed: ${e.message}`);
    }
    return results;
  }

  /* ── MFAPI.in — mutual fund NAV ──────────────── */
  async fetchMfNav(
    schemeCode: string,
  ): Promise<{ nav: number; date: string } | null> {
    try {
      const res = await firstValueFrom(
        this.http.get(`https://api.mfapi.in/mf/${schemeCode}`, {
          timeout: 8000,
        }),
      );
      const latest = res.data?.data?.[0];
      if (!latest?.nav) return null;
      return { nav: parseFloat(latest.nav), date: latest.date };
    } catch (e: any) {
      this.logger.warn(`MFAPI fetch failed for ${schemeCode}: ${e.message}`);
      return null;
    }
  }

  async searchMutualFunds(
    query: string,
  ): Promise<{ schemeCode: string; schemeName: string }[]> {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`,
          { timeout: 8000 },
        ),
      );
      return (res.data ?? []).slice(0, 20).map((s: any) => ({
        schemeCode: String(s.schemeCode),
        schemeName: s.schemeName,
      }));
    } catch {
      return [];
    }
  }

  async searchYahoo(
    query: string,
  ): Promise<{ ticker: string; name: string; exchange: string }[]> {
    try {
      const res = await firstValueFrom(
        this.http.get(
          `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0&quotesCount=10`,
          { timeout: 8000 },
        ),
      );
      return (res.data?.quotes ?? [])
        .filter(
          (q: any) =>
            q.quoteType === 'EQUITY' || q.quoteType === 'CRYPTOCURRENCY',
        )
        .slice(0, 10)
        .map((q: any) => ({
          ticker: q.symbol,
          name: q.longname ?? q.shortname ?? q.symbol,
          exchange: q.exchange ?? '',
        }));
    } catch {
      return [];
    }
  }

  private buildCoinGeckoIdMap(tickers: string[]): Record<string, string> {
    // Common crypto tickers → CoinGecko IDs
    const known: Record<string, string> = {
      'BTC-USD': 'bitcoin',
      'ETH-USD': 'ethereum',
      'BNB-USD': 'binancecoin',
      'SOL-USD': 'solana',
      'XRP-USD': 'ripple',
      'ADA-USD': 'cardano',
      'DOGE-USD': 'dogecoin',
      'DOT-USD': 'polkadot',
      'MATIC-USD': 'matic-network',
      'LTC-USD': 'litecoin',
      'AVAX-USD': 'avalanche-2',
      'LINK-USD': 'chainlink',
    };
    const map: Record<string, string> = {};
    for (const t of tickers) {
      if (known[t]) {
        map[t] = known[t];
        continue;
      }
      // Fallback: strip -USD and lowercase
      map[t] = t.replace('-USD', '').replace('-INR', '').toLowerCase();
    }
    return map;
  }
}
