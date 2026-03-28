import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MutualFundsService } from '../../mutual-funds/mutual-funds.service';
import { StocksService } from '../../stocks/stocks.service';

@Injectable()
export class PriceWorker {
  private readonly logger = new Logger(PriceWorker.name);

  constructor(
    private readonly mfService: MutualFundsService,
    private readonly stocksService: StocksService,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async handlePriceUpdates() {
    this.logger.log('Price worker: refreshing NAVs and stock prices…');
    try {
      await this.mfService.refreshAllNavs();
      this.logger.log('✓ Mutual fund NAVs updated');
    } catch (e: any) {
      this.logger.error(`MF NAV refresh failed: ${e.message}`);
    }
    try {
      await this.stocksService.refreshAllPrices();
      this.logger.log('✓ Stock prices updated');
    } catch (e: any) {
      this.logger.error(`Stock price refresh failed: ${e.message}`);
    }
  }
}
