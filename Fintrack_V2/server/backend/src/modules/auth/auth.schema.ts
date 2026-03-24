import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class SignupDto extends createZodDto(signupSchema) {}

export const loginSchema = signupSchema;

export class LoginDto extends createZodDto(loginSchema) {}
