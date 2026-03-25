import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: CreateTransactionDto,
  ): Promise<Transaction> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Transaction[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const transaction: Transaction | null =
      await this.prisma.transaction.findFirst({
        where: { id, userId },
      });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }

    return transaction;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateTransactionDto,
  ): Promise<Transaction> {
    await this.findOne(userId, id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string): Promise<Transaction> {
    await this.findOne(userId, id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
