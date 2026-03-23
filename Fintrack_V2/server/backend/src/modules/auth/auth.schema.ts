import { z } from 'zod';

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginSchema = signupSchema;
