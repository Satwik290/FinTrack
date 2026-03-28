import { Module } from '@nestjs/common';
import { WealthService } from './wealth.service';
import { WealthController } from './wealth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { PriceWorker } from './workers/price.worker';
import { SnapshotWorker } from './workers/snapshot.worker';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [WealthController],
  providers: [WealthService, PriceWorker, SnapshotWorker],
})
export class WealthModule {}
