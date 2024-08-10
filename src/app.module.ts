import { Module} from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@/modules/database/database.module';
import  { UserModule } from '@/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { buildContext } from 'graphql-passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true, // 设置为全局模块
    }),
    DatabaseModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // 自动生成 schema 文件
      playground: true,
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
  controllers: [],
  providers: [],
})
export class AppModule {
}
