import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PriceWorker {
  private readonly logger = new Logger(PriceWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async handlePriceUpdates() {
    this.logger.log('Starting scheduled price update for market assets...');
    try {
      const marketAssets = await this.prisma.asset.findMany({
        where: { type: 'Market' },
      });

      for (const asset of marketAssets) {
        if (!asset.ticker) continue;

        try {
          let price = 0;

          // Using Yahoo Finance's public query endpoint which supports both crypto (e.g., 'BTC-USD') and stocks (e.g., 'AAPL')
          const response = await firstValueFrom(
            this.httpService.get(
              `https://query1.finance.yahoo.com/v8/finance/chart/${asset.ticker}`,
            ),
          );

          const meta = response.data?.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice) {
            price = meta.regularMarketPrice;
          }

          if (price > 0) {
            // Calculating the total value in cents (e.g. price * quantity * 100)
            const currentValueInCents = Math.round(
              price * (asset.quantity || 0) * 100,
            );
            await this.prisma.asset.update({
              where: { id: asset.id },
              data: { currentValueInCents },
            });
            this.logger.log(
              `Updated ${asset.ticker} to price: ${price}, total value: ${currentValueInCents} cents`,
            );
          }
        } catch (error: any) {
          this.logger.error(
            `Failed to fetch price for ${asset.ticker}: ${error.message}`,
          );
        }
      }
    } catch (error: any) {
      this.logger.error(`Price update worker failed: ${error.message}`);
    }
  }
}
