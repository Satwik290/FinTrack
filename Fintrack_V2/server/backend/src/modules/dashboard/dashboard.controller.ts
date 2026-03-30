import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface ReqUser {
  sub: string;
  email: string;
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('forecast')
  @ApiOperation({
    summary: '12-month income/expense forecast from historic averages',
  })
  getForecast(@CurrentUser() user: ReqUser) {
    return this.svc.getForecast(user.sub);
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Smart insights: anomaly detection, budget alerts, achievements',
  })
  getInsights(@CurrentUser() user: ReqUser) {
    return this.svc.getInsights(user.sub);
  }

  @Get('comparisons')
  @ApiOperation({ summary: '6-month MoM comparison data' })
  getComparisons(@CurrentUser() user: ReqUser) {
    return this.svc.getComparisons(user.sub);
  }
}
