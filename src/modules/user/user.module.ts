import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@/modules/user/schemas/user.schema';
import { UserService } from './services/user.service';
import { UserResolver } from '@/modules/user/user.resolver';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
import { UserPasswordService } from '@/modules/user/services/user.password.service';
import { NotificationModule } from '@/modules/notification/notification.module';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [UserService, UserResolver, UserUtilsService, UserPasswordService, UnifiedErrorStrategyImpl],
  exports: [UserService, UserUtilsService, MongooseModule],
})
export class UserModule {
}