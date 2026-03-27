import { z } from 'zod';

export const CreateBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Budget limit must be greater than 0'),
  period: z.enum(['monthly', 'yearly']).default('monthly'),
});
