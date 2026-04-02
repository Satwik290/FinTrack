import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateGoalDto) {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // FIX: schema fields are name/targetAmount/targetDate NOT title/target/deadline
    return this.prisma.goal.create({
      data: {
        userId,
        name: data.title, // title → name
        targetAmount: Number(data.target), // target → targetAmount
        targetDate: data.deadline // deadline → targetDate
          ? new Date(data.deadline)
          : null,
        color: data.color ?? randomColor,
        icon: data.icon ?? '🎯',
        // currentAmount defaults to 0 per schema
      },
    });
  }

  async findAll(userId: string) {
    // FIX: orderBy targetDate not deadline
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' },
    });
  }

  async update(userId: string, id: string, updateGoalDto: UpdateGoalDto) {
    const existing = await this.prisma.goal.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    // FIX: map DTO fields (title/target/deadline) to schema fields (name/targetAmount/targetDate)
    const dataToUpdate: Record<string, string | number | Date | null> = {};

    if (updateGoalDto.title !== undefined)
      dataToUpdate.name = updateGoalDto.title;
    if (updateGoalDto.target !== undefined)
      dataToUpdate.targetAmount = Number(updateGoalDto.target);
    if (updateGoalDto.deadline !== undefined)
      dataToUpdate.targetDate = updateGoalDto.deadline
        ? new Date(updateGoalDto.deadline)
        : null;
    if (updateGoalDto.icon !== undefined)
      dataToUpdate.icon = updateGoalDto.icon;
    if (updateGoalDto.color !== undefined)
      dataToUpdate.color = updateGoalDto.color;

    return this.prisma.goal.update({ where: { id }, data: dataToUpdate });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.goal.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }
    await this.prisma.goal.delete({ where: { id } });
    return { message: 'Goal successfully deleted' };
  }
}
