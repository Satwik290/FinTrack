import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { createTransactionSchema } from '../transaction.schema';

export class UpdateTransactionDto extends createZodDto(
  createTransactionSchema.partial(),
) {
  @ApiPropertyOptional({
    example: 'Updated Grocery Shopping',
    description: 'The title of the transaction',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 75.25,
    description: 'Updated amount',
  })
  amount?: number;

  @ApiPropertyOptional({
    enum: ['INCOME', 'EXPENSE'],
    example: 'EXPENSE',
  })
  type?: 'INCOME' | 'EXPENSE';

  @ApiPropertyOptional({
    example: 'Food & Dining',
    description: 'Updated category',
  })
  category?: string;
}
