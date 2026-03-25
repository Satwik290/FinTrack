// src/modules/budgets/dto/create-budget.dto.ts
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { CreateBudgetSchema } from '../budget.schema';

export class CreateBudgetDto extends createZodDto(CreateBudgetSchema) {
  @ApiProperty({ example: 'Food & Dining', description: 'Budget category' })
  category!: string;

  @ApiProperty({ example: 500.0, description: 'Maximum amount allowed' })
  amount!: number;

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' })
  period!: 'MONTHLY' | 'YEARLY';
}
