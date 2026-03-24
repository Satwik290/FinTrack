import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './auth.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {} //

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' }) //
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  async signup(@Body() body: SignupDto) {
    // Await the service call to fix the 'require-await' ESLint error
    // Ensure both email and password are passed to match AuthService.signup(email, pass)
    return await this.authService.signup(body.email, body.password); //
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and return JWT token' }) //
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: LoginDto) {
    // Await the service call and pass both required arguments
    return await this.authService.login(body.email, body.password); //
  }
}
