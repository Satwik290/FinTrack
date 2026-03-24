import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { createTransactionSchema } from '../transaction.schema';

export class CreateTransactionDto extends createZodDto(
  createTransactionSchema,
) {
  @ApiProperty({ example: 'Grocery Shopping' })
  title!: string; // Added '!'

  @ApiProperty({ example: 50.75 })
  amount!: number; // Added '!'

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' })
  type!: 'INCOME' | 'EXPENSE'; // Added '!'

  @ApiProperty({ example: 'Food' })
  category!: string; // Added '!'
}
