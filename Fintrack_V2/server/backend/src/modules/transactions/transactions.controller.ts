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
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Interface to fix ESLint 'unsafe member access' errors
 * by providing a type for the authenticated user object.
 */
interface RequestUser {
  sub: string;
  email: string;
}

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return await this.transactionsService.create(
      user.sub,
      createTransactionDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions returned successfully.',
  })
  async findAll(@CurrentUser() user: RequestUser) {
    return await this.transactionsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific transaction by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the transaction' })
  @ApiResponse({ status: 200, description: 'Transaction details returned.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return await this.transactionsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing transaction' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the transaction to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully.',
  })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.update(
      user.sub,
      id,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the transaction to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully.',
  })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return await this.transactionsService.remove(user.sub, id);
  }
}
