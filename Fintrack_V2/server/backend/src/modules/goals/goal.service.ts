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

    const newGoal = await this.prisma.goal.create({
      data: {
        ...data,
        userId,
        target: Number(data.target),
        deadline: new Date(data.deadline),
        color: data.color || randomColor,
        icon: data.icon || '🎯',
      },
    });

    return newGoal;
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });

    return goals;
  }

  async update(userId: string, id: string, updateGoalDto: UpdateGoalDto) {
    const existingGoal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!existingGoal || existingGoal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    const dataToUpdate: Record<string, string | number | Date> = {
      ...updateGoalDto,
    };

    if (updateGoalDto.deadline) {
      dataToUpdate.deadline = new Date(updateGoalDto.deadline);
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: dataToUpdate,
    });

    return updatedGoal;
  }

  async remove(userId: string, id: string) {
    const existingGoal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!existingGoal || existingGoal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    await this.prisma.goal.delete({
      where: { id },
    });

    return { message: 'Goal successfully deleted' };
  }
}
