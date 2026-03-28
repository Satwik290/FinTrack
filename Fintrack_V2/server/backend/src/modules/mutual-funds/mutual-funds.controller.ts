import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { MutualFundsService } from './mutual-funds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Inline the DTO interfaces here — importing types from service causes
// TS1272 when isolatedModules + emitDecoratorMetadata are both on.
interface AddLumpsumBody {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
  category?: string;
  units: number;
  avgNAV: number;
  investedAt?: string;
}

interface AddSipBody {
  schemeCode: string;
  schemeName: string;
  fundHouse?: string;
  category?: string;
  sipAmount: number;
  sipDay: number;
  sipStartDate: string;
  units?: number;
  avgNAV?: number;
}

interface ReqUser {
  sub: string;
  email: string;
}

@ApiTags('Mutual Funds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mutual-funds')
export class MutualFundsController {
  constructor(private readonly svc: MutualFundsService) {}

  @Get('search')
  @ApiQuery({ name: 'q', required: true })
  @ApiOperation({ summary: 'Search mutual fund schemes via MFAPI.in' })
  search(@Query('q') q: string) {
    return this.svc.search(q ?? '');
  }

  @Get('history/:schemeCode')
  @ApiQuery({ name: 'period', enum: ['1Y', '3Y', '5Y'], required: false })
  @ApiOperation({ summary: 'Get NAV history for a scheme' })
  history(
    @Param('schemeCode') schemeCode: string,
    @Query('period') period: '1Y' | '3Y' | '5Y' = '1Y',
  ) {
    return this.svc.getNavHistory(schemeCode, period);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get all holdings with live P&L' })
  getPortfolio(@CurrentUser() user: ReqUser) {
    return this.svc.getPortfolio(user.sub);
  }

  @Post('holdings/lumpsum')
  @ApiOperation({ summary: 'Add a lumpsum holding' })
  addLumpsum(@CurrentUser() user: ReqUser, @Body() dto: AddLumpsumBody) {
    return this.svc.addLumpsum(user.sub, dto);
  }

  @Post('holdings/sip')
  @ApiOperation({ summary: 'Add a SIP holding' })
  addSip(@CurrentUser() user: ReqUser, @Body() dto: AddSipBody) {
    return this.svc.addSip(user.sub, dto);
  }

  @Delete('holdings/:id')
  @ApiOperation({ summary: 'Remove a holding' })
  remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.remove(user.sub, id);
  }
}
