import { z } from 'zod';

export const CreateGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  target: z.number().positive('Target must be a positive number'),
  deadline: z.string().datetime({ message: 'Must be a valid ISO date string' }),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#([0-9a-f]{3}){1,2}$/i, 'Must be a valid hex color')
    .optional(),
});
export const UpdateGoalSchema = CreateGoalSchema.partial();
