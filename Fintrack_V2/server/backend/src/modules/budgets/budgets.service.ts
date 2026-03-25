import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createBudgetDto: CreateBudgetDto,
  ): Promise<Budget> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Budget[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Budget> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const budget: Budget | null = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(
    userId: string,
    id: string,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<Budget> {
    await this.findOne(userId, id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  async remove(userId: string, id: string): Promise<Budget> {
    await this.findOne(userId, id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.budget.delete({
      where: { id },
    });
  }
}
