import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBudgetSchema } from '../budget.schema';

export class UpdateBudgetDto extends createZodDto(
  CreateBudgetSchema.partial(),
) {
  @ApiPropertyOptional({ example: 'Food & Dining' })
  category?: string;

  @ApiPropertyOptional({ example: 600.0 })
  limit?: number;

  @ApiPropertyOptional({ enum: ['monthly', 'yearly'] })
  period?: 'monthly' | 'yearly';
}
