import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InsuranceWorker {
  private readonly logger = new Logger(InsuranceWorker.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringPolicies() {
    this.logger.log('Starting daily check for expiring insurance policies...');

    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const expiring = await this.prisma.insurance.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: in7Days,
          gte: now,
        },
      },
      include: { user: true },
    });

    if (expiring.length === 0) {
      this.logger.log('No policies expiring within 7 days.');
      return;
    }

    this.logger.warn(`Found ${expiring.length} policies expiring within 7 days.`);
    
    // Future enhancement: Send email notifications or create in-app InsightAlerts
    for (const policy of expiring) {
      this.logger.warn(
        `[WARNING] Policy '${policy.policyName}' for user ${policy.user.email} is expiring on ${policy.nextDueDate.toDateString()}!`,
      );
    }
  }
}
