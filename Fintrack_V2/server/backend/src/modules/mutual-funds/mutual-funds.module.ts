import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MutualFundsService } from './mutual-funds.service';
import { MutualFundsController } from './mutual-funds.controller';
// MarketDataService + ExchangeRateService provided globally by SharedModule

@Module({
  imports: [HttpModule], // needed so HttpService injects into MutualFundsService
  controllers: [MutualFundsController],
  providers: [MutualFundsService],
  exports: [MutualFundsService],
})
export class MutualFundsModule {}
