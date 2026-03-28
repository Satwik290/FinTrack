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
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Inline to avoid TS1272 with isolatedModules + emitDecoratorMetadata
interface AddStockBody {
  ticker: string;
  exchange: 'NSE' | 'US' | 'CRYPTO';
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
}

interface ReqUser {
  sub: string;
  email: string;
}

@ApiTags('Stocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly svc: StocksService) {}

  @Get('search')
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({
    name: 'exchange',
    required: false,
    enum: ['NSE', 'US', 'CRYPTO'],
  })
  @ApiOperation({ summary: 'Search stocks/crypto via Yahoo Finance' })
  search(@Query('q') q: string, @Query('exchange') exchange = 'NSE') {
    return this.svc.search(q ?? '', exchange);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get all holdings with live P&L in ₹' })
  getPortfolio(@CurrentUser() user: ReqUser) {
    return this.svc.getPortfolio(user.sub);
  }

  @Post('holdings')
  @ApiOperation({ summary: 'Add a stock/crypto holding' })
  add(@CurrentUser() user: ReqUser, @Body() dto: AddStockBody) {
    return this.svc.addHolding(user.sub, dto);
  }

  @Delete('holdings/:id')
  @ApiOperation({ summary: 'Remove a holding' })
  remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.remove(user.sub, id);
  }
}
