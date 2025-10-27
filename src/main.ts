import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [
      'https://alertcities.com',
      'https://www.alertcities.com',
      'http://localhost:3000',
      'http://macstudio:3000',
    ],
    exposedHeaders: ['Auth-Status', 'New-Access-Token'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
  app.use(compression());
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(new ZodValidationPipe());
  const port = configService.get<number>('PORT') || 65005;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on http://localhost:${port}`);
}

bootstrap().then(() => {});
