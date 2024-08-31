import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {  ConfigService } from '@nestjs/config';
import compression from 'compression';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    exposedHeaders: ['x-auth-status', 'x-new-access-token'],
    credentials: true,
  })
  app.use(compression());
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 51004;
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap().then(() => {});
