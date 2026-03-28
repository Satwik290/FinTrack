import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WealthService } from './wealth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface RequestUser {
  sub: string;
  email: string;
}

@ApiTags('Wealth')
@ApiBearerAuth()
@Controller('wealth') // ← was 'api/v2/wealth' which made it /api/api/v2/wealth
@UseGuards(JwtAuthGuard)
export class WealthController {
  constructor(private readonly wealthService: WealthService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get wealth summary: assets, liabilities, net worth',
  })
  @ApiResponse({ status: 200, description: 'Summary returned successfully' })
  async getSummary(@CurrentUser() user: RequestUser) {
    return this.wealthService.getSummary(user.sub);
  }

  @Post('assets')
  @ApiOperation({ summary: 'Add a new asset' })
  async addAsset(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.wealthService.addAsset(user.sub, body);
  }

  @Post('liabilities')
  @ApiOperation({ summary: 'Add a new liability' })
  async addLiability(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.wealthService.addLiability(user.sub, body);
  }
}
