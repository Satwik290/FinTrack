import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

// Add this interface
interface RequestUser {
  sub: string;
  email: string;
}

@Resolver('Budget')
@UseGuards(JwtAuthGuard)
export class BudgetsResolver {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Mutation('createBudget')
  create(
    @CurrentUser() user: RequestUser,
    @Args('createBudgetInput') createBudgetDto: CreateBudgetDto,
  ) {
    // Fixed
    return this.budgetsService.create(user.sub, createBudgetDto);
  }

  @Query('budgets')
  findAll(@CurrentUser() user: RequestUser) {
    // Fixed
    return this.budgetsService.findAll(user.sub);
  }

  @Query('budget')
  findOne(@CurrentUser() user: RequestUser, @Args('id') id: string) {
    // Fixed
    return this.budgetsService.findOne(user.sub, id);
  }

  @Mutation('updateBudget')
  update(
    @CurrentUser() user: RequestUser, // Fixed
    @Args('id') id: string,
    @Args('updateBudgetInput') updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.sub, id, updateBudgetDto);
  }

  @Mutation('removeBudget')
  remove(@CurrentUser() user: RequestUser, @Args('id') id: string) {
    // Fixed
    return this.budgetsService.remove(user.sub, id);
  }
}
