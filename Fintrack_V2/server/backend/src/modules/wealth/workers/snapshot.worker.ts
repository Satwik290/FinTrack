import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SnapshotWorker {
  private readonly logger = new Logger(SnapshotWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs at 00:00 on the 1st of every month
  @Cron('0 0 1 * *')
  async takeMonthlySnapshot() {
    this.logger.log('Starting monthly wealth snapshot generation...');
    try {
      // Get all distinct users
      const users = await this.prisma.user.findMany({ select: { id: true } });

      for (const user of users) {
        const assets = await this.prisma.asset.findMany({
          where: { userId: user.id },
        });
        const liabilities = await this.prisma.liability.findMany({
          where: { userId: user.id },
        });

        const totalAssetsInCents = assets.reduce(
          (acc, curr) => acc + curr.currentValueInCents,
          0,
        );
        const totalLiabsInCents = liabilities.reduce(
          (acc, curr) => acc + curr.remainingBalanceInCents,
          0,
        );
        const netWorthInCents = totalAssetsInCents - totalLiabsInCents;

        await this.prisma.netWorthSnapshot.create({
          data: {
            userId: user.id,
            totalAssetsInCents,
            totalLiabsInCents,
            netWorthInCents,
          },
        });

        this.logger.log(
          `Snapshot created for user ${user.id}: NetWorth = ${netWorthInCents} cents`,
        );
      }
    } catch (error: any) {
      this.logger.error(`Snapshot worker failed: ${error.message}`);
    }
  }
}
