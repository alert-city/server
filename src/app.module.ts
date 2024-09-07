import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
import { I18nModule } from '@/modules/i18n/i18n.module';
import { LocaleMiddleware } from '@/modules/i18n/localeMiddleware';
import { EventModule } from './modules/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    FileModule,
    NotificationModule,
    I18nModule,
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
    EventModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GqlHttpExceptionFilter,
    },
    GridFsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LocaleMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

}
