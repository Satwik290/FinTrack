import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // ❌ REMOVED: goal: any;

  constructor(config: ConfigService) {
    const pool = new Pool({
      connectionString: config.get<string>('DATABASE_URL'),
    });

    // The 'as any' safely bypasses the strict version mismatch for now
    const adapter = new PrismaPg(pool as any);

    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
