import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupSchema, loginSchema } from './auth.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body) {
    const parsed = signupSchema.parse(body);

    return this.authService.signup(parsed.email, parsed.password);
  }

  @Post('login')
  async login(@Body() body) {
    const parsed = loginSchema.parse(body);

    return this.authService.login(parsed.email, parsed.password);
  }
}
