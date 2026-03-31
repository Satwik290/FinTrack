import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Insurance, InsuranceType } from '@prisma/client';

export class CreateInsuranceDto {
  type: InsuranceType;
  policyName: string;
  provider: string;
  sumInsuredInCents: number;
  premiumInCents: number;
  frequency: string;
  startDate: string;
}

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateInsuranceDto): Promise<any> {
    const startDate = new Date(data.startDate);
    const nextDueDate = this.calculateNextDueDate(startDate, data.frequency);

    const ins = await this.prisma.insurance.create({
      data: {
        userId,
        type: data.type,
        policyName: data.policyName,
        provider: data.provider,
        sumInsured: BigInt(data.sumInsuredInCents || 0),
        premiumAmount: BigInt(data.premiumInCents || 0),
        frequency: data.frequency,
        startDate: startDate,
        nextDueDate: nextDueDate,
      },
    });
    return this.mapInsurance(ins);
  }

  async findAll(userId: string): Promise<any[]> {
    const insurances = await this.prisma.insurance.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    });
    return insurances.map((i) => this.mapInsurance(i));
  }

  async remove(userId: string, id: string): Promise<any> {
    const insurance = await this.prisma.insurance.findFirst({
      where: { id, userId },
    });
    if (!insurance) throw new NotFoundException('Insurance policy not found');

    const deleted = await this.prisma.insurance.delete({
      where: { id },
    });
    return this.mapInsurance(deleted);
  }

  async payPremium(userId: string, id: string): Promise<any> {
    const insurance = await this.prisma.insurance.findFirst({
      where: { id, userId },
    });
    if (!insurance) throw new NotFoundException('Insurance policy not found');

    // 1. Calculate new next due date
    const currentDue = new Date(insurance.nextDueDate);
    const newDueDate = this.calculateNextDueDate(currentDue, insurance.frequency);

    // 2. Insert into Transactions
    await this.prisma.transaction.create({
      data: {
        userId,
        amount: Number(insurance.premiumAmount) / 100, // Assuming transaction stores standard currency or wait, transaction.amount is Float, so standard INR
        type: 'expense',
        category: 'Insurance',
        merchant: insurance.provider,
        date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
        note: `Premium for ${insurance.policyName}`,
      },
    });

    // 3. Update Policy
    const updated = await this.prisma.insurance.update({
      where: { id },
      data: { nextDueDate: newDueDate },
    });
    return this.mapInsurance(updated);
  }

  private mapInsurance(insurance: Insurance) {
    return {
      ...insurance,
      sumInsured: Number(insurance.sumInsured),
      premiumAmount: Number(insurance.premiumAmount),
    };
  }

  private calculateNextDueDate(from: Date, frequency: string): Date {
    const next = new Date(from);
    switch (frequency.toLowerCase()) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
      case 'annual':
      case 'annually':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setFullYear(next.getFullYear() + 1);
    }
    return next;
  }
}
