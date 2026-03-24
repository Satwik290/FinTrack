import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  // Add the engine property required by the SchemaEngineConfigClassic type
  engine: 'classic',
});
