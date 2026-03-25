import { Resolver, Query } from '@nestjs/graphql';
import { TransactionsService } from './transactions.service';
import { Transaction } from '@prisma/client';

@Resolver()
export class TransactionsResolver {
  constructor(private readonly service: TransactionsService) {}

  @Query(() => [String])
  async transactions(): Promise<string[]> {
    const userId = 'demo-user-id';
    const data: Transaction[] = await this.service.findAll(userId);
    return data.map((t) => JSON.stringify(t));
  }
}
