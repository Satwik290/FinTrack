import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { createTransactionSchema } from '../transaction.schema';

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {
  @ApiProperty({ example: 50.75 })
  amount!: number;

  @ApiProperty({ example: 'Food' })
  category!: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  type!: 'income' | 'expense';

  @ApiProperty({ example: 'Swiggy' })
  merchant!: string;

  @ApiProperty({ example: '2026-03-26' })
  date!: string;

  @ApiProperty({ example: 'Dinner', required: false })
  note?: string;
}