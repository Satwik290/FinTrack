import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsController } from './transactions.controller';

@Module({
  providers: [TransactionsService, TransactionsResolver],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
