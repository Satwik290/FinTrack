import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

export interface BudgetWithSpent {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: CreateBudgetDto,
  ): Promise<BudgetWithSpent> {
    const budget = await this.prisma.budget.create({
      data: { ...data, userId },
    });
    return { ...budget, spent: 0 };
  }

  async findAll(userId: string): Promise<BudgetWithSpent[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get current month boundaries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    // Compute spent for each budget category from transactions this month
    const spentByCategory = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'expense',
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const spentMap: Record<string, number> = {};
    for (const row of spentByCategory) {
      spentMap[row.category] = row._sum.amount ?? 0;
    }

    return budgets.map((b) => ({
      ...b,
      spent: spentMap[b.category] ?? 0,
    }));
  }

  async findOne(userId: string, id: string): Promise<BudgetWithSpent> {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found.`);
    }

    return { ...budget, spent: 0 };
  }

  async update(
    userId: string,
    id: string,
    data: UpdateBudgetDto,
  ): Promise<BudgetWithSpent> {
    await this.findOne(userId, id);
    const updated = await this.prisma.budget.update({ where: { id }, data });
    return { ...updated, spent: 0 };
  }

  async remove(userId: string, id: string): Promise<BudgetWithSpent> {
    await this.findOne(userId, id);
    const deleted = await this.prisma.budget.delete({ where: { id } });
    return { ...deleted, spent: 0 };
  }
}
