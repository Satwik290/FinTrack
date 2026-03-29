import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { WealthService, LiabilityCategory } from './wealth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface ReqUser {
  sub: string;
  email: string;
}

interface AddAssetBody {
  name: string;
  type: string;
  ticker?: string;
  quantity?: number;
  currentValueInCents: number;
}

interface AddLiabilityBody {
  loanName: string;
  category: LiabilityCategory;
  totalPrincipalInCents: number;
  interestRate: number;
  remainingBalanceInCents: number;
  emiInCents?: number;
  dueDate?: string;
}

@ApiTags('Wealth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wealth')
export class WealthController {
  constructor(private readonly svc: WealthService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Full aggregated wealth summary — single source of truth',
  })
  getSummary(@CurrentUser() user: ReqUser) {
    return this.svc.getFullSummary(user.sub);
  }

  @Post('assets')
  @ApiOperation({ summary: 'Add a manual asset' })
  addAsset(@CurrentUser() user: ReqUser, @Body() body: AddAssetBody) {
    return this.svc.addAsset(user.sub, body);
  }

  @Delete('assets/:id')
  @ApiOperation({ summary: 'Remove an asset' })
  removeAsset(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.removeAsset(user.sub, id);
  }

  @Post('liabilities')
  @ApiOperation({ summary: 'Add a liability' })
  addLiability(@CurrentUser() user: ReqUser, @Body() body: AddLiabilityBody) {
    return this.svc.addLiability(user.sub, body);
  }

  @Delete('liabilities/:id')
  @ApiOperation({ summary: 'Remove a liability' })
  removeLiability(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.removeliability(user.sub, id);
  }
}
