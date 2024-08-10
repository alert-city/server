import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {  ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    exposedHeaders: ['x-auth.ts-status'],
    credentials: true,
  })
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 51004;
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap().then(() => {});
