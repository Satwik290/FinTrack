import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { InsuranceWorker } from './workers/insurance.worker';

@Module({
  imports: [PrismaModule],
  controllers: [InsuranceController],
  providers: [InsuranceService, InsuranceWorker],
  exports: [InsuranceService],
})
export class InsuranceModule {}
