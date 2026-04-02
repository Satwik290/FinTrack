import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GoalsService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string; // userId
  email: string;
}

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  // ---------------------------------------------------------------------------
  // POST /goals
  // ---------------------------------------------------------------------------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new financial goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    return this.goalsService.create(user.sub, createGoalDto);
  }

  // ---------------------------------------------------------------------------
  // GET /goals
  // ---------------------------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Retrieve all goals for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns array of goals.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.goalsService.findAll(user.sub);
  }

  // ---------------------------------------------------------------------------
  // GET /goals/:id
  // ---------------------------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single goal by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the goal' })
  @ApiResponse({ status: 200, description: 'Returns the goal.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.goalsService.findOne(user.sub, id);
  }

  // ---------------------------------------------------------------------------
  // PATCH /goals/:id
  // ---------------------------------------------------------------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Partially update an existing financial goal' })
  @ApiParam({ name: 'id', description: 'UUID of the goal to update' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.sub, id, updateGoalDto);
  }

  // ---------------------------------------------------------------------------
  // PATCH /goals/:id/progress
  // ---------------------------------------------------------------------------
  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update the current saved amount for a goal' })
  @ApiParam({ name: 'id', description: 'UUID of the goal' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  updateProgress(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.goalsService.updateProgress(user.sub, id, amount);
  }

  // ---------------------------------------------------------------------------
  // DELETE /goals/:id
  // ---------------------------------------------------------------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial goal' })
  @ApiParam({ name: 'id', description: 'UUID of the goal to delete' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.goalsService.remove(user.sub, id);
  }
}
