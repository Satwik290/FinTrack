import { createZodDto } from 'nestjs-zod';
import { createTransactionSchema } from '../transaction.schema';

export class CreateTransactionDto extends createZodDto(
  createTransactionSchema,
) {}
