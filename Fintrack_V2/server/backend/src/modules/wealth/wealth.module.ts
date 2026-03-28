import { Module } from '@nestjs/common';
import { WealthService } from './wealth.service';
import { WealthController } from './wealth.controller';
import { PriceWorker } from './workers/price.worker';
import { SnapshotWorker } from './workers/snapshot.worker';
import { MutualFundsModule } from '../mutual-funds/mutual-funds.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [
    MutualFundsModule, // gives PriceWorker access to MutualFundsService
    StocksModule, // gives PriceWorker access to StocksService
  ],
  controllers: [WealthController],
  providers: [WealthService, PriceWorker, SnapshotWorker],
})
export class WealthModule {}
