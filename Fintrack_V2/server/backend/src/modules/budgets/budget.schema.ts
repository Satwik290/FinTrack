// src/modules/budgets/budget.schema.ts
import { z } from 'zod';

export const CreateBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Budget amount must be greater than 0'),
  period: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
});
