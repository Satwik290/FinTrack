import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Add this interface
interface RequestUser {
  sub: string;
  email: string;
}

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully.' })
  create(
    @CurrentUser() user: RequestUser,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    // Fixed
    return this.budgetsService.create(user.sub, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for the current user' })
  @ApiResponse({ status: 200, description: 'Returns an array of budgets.' })
  findAll(@CurrentUser() user: RequestUser) {
    // Fixed
    return this.budgetsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    // Fixed
    return this.budgetsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing budget' })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    // Fixed
    return this.budgetsService.update(user.sub, id, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    // Fixed
    return this.budgetsService.remove(user.sub, id);
  }
}
