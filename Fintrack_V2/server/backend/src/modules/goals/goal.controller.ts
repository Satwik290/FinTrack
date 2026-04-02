import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
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

interface ReqUser {
  sub: string; // JwtAuthGuard sets sub, not id
  email: string;
}

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @CurrentUser() user: ReqUser,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    // FIX: was req.user.id — JwtAuthGuard puts userId in user.sub
    return this.goalsService.create(user.sub, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all goals for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns array of goals.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@CurrentUser() user: ReqUser) {
    return this.goalsService.findAll(user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update an existing financial goal' })
  @ApiParam({ name: 'id', description: 'The UUID of the goal to update' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async update(
    @CurrentUser() user: ReqUser,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.sub, id, updateGoalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial goal' })
  @ApiParam({ name: 'id', description: 'The UUID of the goal to delete' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async remove(@CurrentUser() user: ReqUser, @Param('id') id: string) {
    return this.goalsService.remove(user.sub, id);
  }
}
