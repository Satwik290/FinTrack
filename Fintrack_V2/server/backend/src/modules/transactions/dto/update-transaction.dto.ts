import { createZodDto } from 'nestjs-zod';
import { createTransactionSchema } from '../transaction.schema';

export class UpdateTransactionDto extends createZodDto(
  createTransactionSchema.partial(),
) {}
