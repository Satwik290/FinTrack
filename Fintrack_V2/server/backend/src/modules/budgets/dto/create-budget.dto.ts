import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { CreateBudgetSchema } from '../budget.schema';

export class CreateBudgetDto extends createZodDto(CreateBudgetSchema) {
  @ApiProperty({ example: 'Food', description: 'Budget category' })
  category!: string;

  @ApiProperty({ example: 8000, description: 'Monthly spending limit' })
  limit!: number;

  @ApiProperty({ enum: ['monthly', 'yearly'], example: 'monthly' })
  period!: 'monthly' | 'yearly';
}
