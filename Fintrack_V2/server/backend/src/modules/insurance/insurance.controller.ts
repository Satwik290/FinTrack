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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InsuranceService, CreateInsuranceDto } from './insurance.service';

interface ReqUser {
  sub: string;
  email: string;
}

@ApiTags('Insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly svc: InsuranceService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new insurance policy' })
  addPolicy(@CurrentUser() user: ReqUser, @Body() body: CreateInsuranceDto) {
    return this.svc.create(user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance policies for user' })
  getPolicies(@CurrentUser() user: ReqUser) {
    return this.svc.findAll(user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a policy' })
  removePolicy(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.remove(user.sub, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay premium and update next due date' })
  payPremium(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.svc.payPremium(user.sub, id);
  }
}
