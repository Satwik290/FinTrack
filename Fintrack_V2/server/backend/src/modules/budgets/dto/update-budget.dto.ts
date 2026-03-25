// src/modules/budgets/dto/update-budget.dto.ts
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBudgetSchema } from '../budget.schema';

export class UpdateBudgetDto extends createZodDto(
  CreateBudgetSchema.partial(),
) {
  @ApiPropertyOptional({ example: 'Food & Dining' })
  category?: string;

  @ApiPropertyOptional({ example: 600.0 })
  amount?: number;

  @ApiPropertyOptional({ enum: ['MONTHLY', 'YEARLY'] })
  period?: 'MONTHLY' | 'YEARLY';
}
