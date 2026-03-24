import { Resolver, Query } from '@nestjs/graphql';
import { TransactionsService } from './transactions.service'; // Fixed to plural

@Resolver()
export class TransactionsResolver {
  constructor(private readonly service: TransactionsService) {} // Fixed to plural

  @Query(() => [String]) // Temporary type until we create the ObjectType
  async transactions() {
    // Removed the unused @Context() ctx
    const userId = 'demo-user-id';

    const data = await this.service.findAll(userId);

    return data.map((t) => JSON.stringify(t));
  }
}
