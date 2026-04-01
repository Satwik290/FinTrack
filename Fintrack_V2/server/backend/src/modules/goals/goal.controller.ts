import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
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

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial goal' })
  @ApiResponse({
    status: 201,
    description: 'The goal has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Request() req: any, @Body() createGoalDto: CreateGoalDto) {
    return await this.goalsService.create(req.user.id, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all goals for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of the user’s goals.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Request() req: any) {
    return await this.goalsService.findAll(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update an existing financial goal' })
  @ApiParam({ name: 'id', description: 'The UUID of the goal to update' })
  @ApiResponse({
    status: 200,
    description: 'The goal has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return await this.goalsService.update(req.user.id, id, updateGoalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial goal' })
  @ApiParam({ name: 'id', description: 'The UUID of the goal to delete' })
  @ApiResponse({
    status: 200,
    description: 'The goal has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return await this.goalsService.remove(req.user.id, id);
  }
}
