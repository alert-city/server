import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/modules/database/database.module';
import { UserModule } from '@/modules/user/user.module';
import { GqlHttpExceptionFilter } from '@/common/filters/error.exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { GridFsService } from './modules/file/file.service';
import { FileModule } from './modules/file/file.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveStaticOptions: {
        cacheControl: true,
        maxAge: '7d',
      },
    }),
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    FileModule,
    NotificationModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      csrfPrevention: false,
      formatError: (error) => {
        return {
          message: error.message,
          path: error.path,
          extensions: error.extensions,
        };
      },
      context: ({ req, res }) => ({ req, res, refreshToken: req['refreshToken'] }),
    }),
    UserModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GqlHttpExceptionFilter,
    },
    GridFsService,
  ],
})
export class AppModule {}
