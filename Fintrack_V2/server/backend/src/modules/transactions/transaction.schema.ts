import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  note: z.string().optional(),
});
