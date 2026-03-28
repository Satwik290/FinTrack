import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WealthService {
  private readonly logger = new Logger(WealthService.name);

  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const assets = await this.prisma.asset.findMany({ where: { userId } });
    const liabilities = await this.prisma.liability.findMany({
      where: { userId },
    });

    const totalAssetsInCents = assets.reduce(
      (acc, curr) => acc + curr.currentValueInCents,
      0,
    );
    const totalLiabilitiesInCents = liabilities.reduce(
      (acc, curr) => acc + curr.remainingBalanceInCents,
      0,
    );
    const netWorthInCents = totalAssetsInCents - totalLiabilitiesInCents;

    return {
      totalAssetsInCents,
      totalLiabilitiesInCents,
      netWorthInCents,
      assets,
      liabilities,
    };
  }

  async addAsset(userId: string, data: any) {
    return this.prisma.asset.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async addLiability(userId: string, data: any) {
    return this.prisma.liability.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
