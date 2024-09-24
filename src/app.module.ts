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
import { OrganizationEventOModule } from './modules/event/organization/event.o.module';
import * as process from 'node:process';
import { PersonalEventModule } from './modules/event/personal/event.p.module';

@Module({
  imports: [
    ConfigModule.forRoot({
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
      introspection: process.env.NODE_ENV === 'development',
      csrfPrevention: false,
      subscriptions: {
        'graphql-ws': true,
      },
      formatError: (error) => {
        return {
          message: error.message,
          path: error.path,
          extensions: error.extensions,
        };
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    UserModule,
    OrganizationEventOModule,
    PersonalEventModule,
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