// src/modules/budgets/budgets.module.ts
import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { BudgetsResolver } from './budgets.resolver';
// import { PrismaModule } from '../../prisma/prisma.module'; // Uncomment if needed

@Module({
  // imports: [PrismaModule],
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetsResolver],
  exports: [BudgetsService],
})
export class BudgetsModule {}
