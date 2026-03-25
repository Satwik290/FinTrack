// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(
    email: string,
    pass: string,
  ): Promise<{ id: string; email: string }> {
    const hashed = await bcrypt.hash(pass, 10);

    // Use type assertion (as User) to bypass the unsafe-assignment linting error
    const user = (await this.prisma.user.create({
      data: { email, password: hashed },
    })) as User;

    return { id: user.id, email: user.email };
  }

  async login(email: string, pass: string): Promise<{ token: string }> {
    // Use type assertion here as well
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as User | null;

    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ userId: user.id });
    return { token };
  }
}
