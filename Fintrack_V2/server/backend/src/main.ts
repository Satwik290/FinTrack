import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Dynamic origin handling for CORS
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL, // This should be your deployed frontend URL
  ].filter(Boolean) as string[];

  // Must register CORS before any routes
  await app.register(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@fastify/cors'),
    {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription('Personal Finance API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Use the PORT environment variable provided by the host
  const port = process.env.PORT || 3001;

  // Listening on '0.0.0.0' is required for many cloud environments
  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();
  console.log(`Application is running on: ${url}/api`);
}

bootstrap().catch((err) => console.error(err));
