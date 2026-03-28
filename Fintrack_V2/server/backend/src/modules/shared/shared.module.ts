import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarketDataService } from './market-data.service';
import { ExchangeRateService } from './exchange-rate.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [MarketDataService, ExchangeRateService],
  exports: [MarketDataService, ExchangeRateService],
})
export class SharedModule {}
