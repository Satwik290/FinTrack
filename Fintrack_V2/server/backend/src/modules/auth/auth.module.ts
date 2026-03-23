import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    // PrismaModule, // (Uncomment if you have a PrismaModule exporting PrismaService)
    JwtModule.register({
      secret: 'secret123', // Better to use process.env.JWT_SECRET later!
      signOptions: { expiresIn: '1d' },
    }),
  ],
  // controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
