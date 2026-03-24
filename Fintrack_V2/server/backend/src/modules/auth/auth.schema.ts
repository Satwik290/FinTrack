import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export class SignupDto extends createZodDto(SignupSchema) {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class LoginDto extends createZodDto(LoginSchema) {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The registered email address of the user',
  })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'The user password',
    format: 'password',
  })
  password!: string;
}
