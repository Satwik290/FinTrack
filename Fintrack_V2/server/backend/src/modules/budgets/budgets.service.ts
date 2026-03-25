import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateBudgetDto): Promise<Budget> {
    return await this.prisma.budget.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Budget[]> {
    return await this.prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Budget> {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found.`);
    }

    return budget;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateBudgetDto,
  ): Promise<Budget> {
    await this.findOne(userId, id);

    return await this.prisma.budget.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string): Promise<Budget> {
    await this.findOne(userId, id);

    return await this.prisma.budget.delete({
      where: { id },
    });
  }
}
