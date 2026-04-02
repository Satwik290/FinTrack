import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

// Shape returned to the frontend — matches the Goal interface in page.tsx
export interface GoalResponse {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string | null;
  icon: string;
  color: string;
}

const PRESET_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Maps Prisma DB row → GoalResponse (frontend shape).
   *  icon/color are String? in the schema so they arrive as string | null. */
  private mapGoal(g: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date | null;
    icon: string | null;
    color: string | null;
  }): GoalResponse {
    return {
      id: g.id,
      title: g.name,
      target: g.targetAmount,
      current: g.currentAmount ?? 0,
      deadline: g.targetDate ? g.targetDate.toISOString() : null,
      icon: g.icon ?? '🎯',
      color: g.color ?? '#6366f1',
    };
  }

  private randomColor(): string {
    return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  async create(userId: string, dto: CreateGoalDto): Promise<GoalResponse> {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        name: dto.title,
        targetAmount: Number(dto.target),
        targetDate: dto.deadline ? new Date(dto.deadline) : null,
        color: dto.color ?? this.randomColor(),
        icon: dto.icon ?? '🎯',
        // currentAmount defaults to 0 via Prisma schema default
      },
    });

    return this.mapGoal(goal);
  }

  async findAll(userId: string): Promise<GoalResponse[]> {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' },
    });

    return goals.map((g) => this.mapGoal(g));
  }

  async findOne(userId: string, id: string): Promise<GoalResponse> {
    const goal = await this.prisma.goal.findUnique({ where: { id } });

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException(`Goal with id "${id}" not found`);
    }

    return this.mapGoal(goal);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateGoalDto,
  ): Promise<GoalResponse> {
    const existing = await this.prisma.goal.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`Goal with id "${id}" not found`);
    }

    // Only include fields that were actually sent in the request
    const data: Record<string, string | number | Date | null> = {};
    if (dto.title !== undefined) data.name = dto.title;
    if (dto.target !== undefined) data.targetAmount = Number(dto.target);
    if (dto.deadline !== undefined)
      data.targetDate = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;

    const updated = await this.prisma.goal.update({ where: { id }, data });
    return this.mapGoal(updated);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const existing = await this.prisma.goal.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`Goal with id "${id}" not found`);
    }

    await this.prisma.goal.delete({ where: { id } });
    return { message: 'Goal successfully deleted' };
  }

  // ---------------------------------------------------------------------------
  // Progress update (called from transactions module when a linked goal is hit)
  // ---------------------------------------------------------------------------

  async updateProgress(
    userId: string,
    id: string,
    amount: number,
  ): Promise<GoalResponse> {
    const existing = await this.prisma.goal.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`Goal with id "${id}" not found`);
    }

    const updated = await this.prisma.goal.update({
      where: { id },
      data: { currentAmount: amount },
    });

    return this.mapGoal(updated);
  }
}
