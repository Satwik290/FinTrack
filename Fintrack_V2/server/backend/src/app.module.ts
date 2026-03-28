import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { WealthModule } from './modules/wealth/wealth.module';
import { MutualFundsModule } from './modules/mutual-funds/mutual-funds.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { SharedModule } from './modules/shared/shared.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SharedModule, // global: ExchangeRateService + MarketDataService
    AuthModule,
    JwtModule.register({
      global: true,
      secret: 'secret123',
      signOptions: { expiresIn: '1d' },
    }),
    TransactionsModule,
    BudgetsModule,
    WealthModule,
    MutualFundsModule,
    StocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
