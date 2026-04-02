import { Module } from '@nestjs/common';
import { GoalsController } from './goal.controller';
import { GoalsService } from './goal.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
