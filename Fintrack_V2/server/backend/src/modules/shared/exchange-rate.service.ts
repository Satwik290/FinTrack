import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private usdToInr = 83.5; // safe fallback
  private lastFetchedAt = 0;
  private readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

  constructor(private readonly http: HttpService) {}

  async getUsdToInr(): Promise<number> {
    const now = Date.now();
    if (now - this.lastFetchedAt < this.CACHE_TTL_MS) return this.usdToInr;

    try {
      // Frankfurter - free, no key, EU Central Bank rates
      const res = await firstValueFrom(
        this.http.get('https://api.frankfurter.app/latest?from=USD&to=INR'),
      );
      const rate = res.data?.rates?.INR;
      if (rate && rate > 0) {
        this.usdToInr = rate;
        this.lastFetchedAt = now;
        this.logger.log(`USD→INR rate updated: ${rate}`);
      }
    } catch (e: any) {
      this.logger.warn(
        `Exchange rate fetch failed, using cached ${this.usdToInr}: ${e.message}`,
      );
    }
    return this.usdToInr;
  }
}
