import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, pass: string) {
    // FIX: Changed 'password' to 'pass' to match your argument name
    const hashed = await bcrypt.hash(pass, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed },
    });

    return { id: user.id, email: user.email };
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    // FIX: Changed 'password' to 'pass' to match your argument name
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ userId: user.id });
    return { token };
  }
}
