import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { createTransactionSchema } from '../transaction.schema';

export class UpdateTransactionDto extends createZodDto(
  createTransactionSchema.partial(),
) {
  @ApiPropertyOptional({ example: 75.25 })
  amount?: number;

  @ApiPropertyOptional({ example: 'Food' })
  category?: string;

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ example: 'Swiggy' })
  merchant?: string;

  @ApiPropertyOptional({ example: '2026-03-26' })
  date?: string;

  @ApiPropertyOptional({ example: 'Dinner' })
  note?: string;
}