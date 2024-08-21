import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule} from '@nestjs/config';
import { DatabaseModule } from '@/modules/database/database.module';
import  { UserModule } from '@/modules/user/user.module';
import  { GqlHttpExceptionFilter } from '@/common/filters/error.exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { FileResolver } from './modules/file/file.resolver';
import { GridFsService } from './modules/file/file.service';
import { graphqlUploadExpress } from 'graphql-upload';
import { FilesController } from './modules/file/file.controller';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true, // set as a global configuration
    }),
    DatabaseModule,
    AuthModule,
    FileModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // 自动生成 schema 文件
      playground: true,
      csrfPrevention: false,
      formatError: (error) => {
        return {
          message: error.message,
          path: error.path,
          extensions: error.extensions,
        };
      },
      context: ({ req, res }) => ({ req, res,refreshToken: req['refreshToken'], })
    }),
    UserModule,
  ],
  controllers: [FilesController],
  providers: [
  {
    provide: APP_FILTER,
    useClass: GqlHttpExceptionFilter,
  },
  FileResolver,
  GridFsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
