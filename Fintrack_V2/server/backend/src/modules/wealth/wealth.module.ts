import { Module } from '@nestjs/common';
import { WealthService } from './wealth.service';
import { WealthController } from './wealth.controller';
import { SnapshotWorker } from './workers/snapshot.worker';
import { PriceWorker } from './workers/price.worker';
import { MutualFundsModule } from '../mutual-funds/mutual-funds.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [
    MutualFundsModule, // exports MutualFundsService → injected into WealthService
    StocksModule, // exports StocksService      → injected into WealthService
  ],
  controllers: [WealthController],
  providers: [WealthService, PriceWorker, SnapshotWorker],
})
export class WealthModule {}
