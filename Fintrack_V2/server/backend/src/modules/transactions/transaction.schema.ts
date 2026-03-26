import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  type: z.enum(['income', 'expense']),
  merchant: z.string(),
  date: z.string(),
  note: z.string().optional(),
});