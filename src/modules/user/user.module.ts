import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@/modules/user/schemas/user.schema';
import { UserService } from './user.service';
import { UserResolver } from '@/modules/user/user.resolver';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { UserPasswordService } from '@/modules/user/user.password.service';
import { AccountActivationSchema } from '@/modules/user/schemas/account-activation.schema';
import { NotificationModule } from '@/modules/notification/notification.module';
import { PasswordResetSchema } from '@/modules/user/schemas/password-reset.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'AccountActivation', schema: AccountActivationSchema },
      { name: 'PasswordReset', schema: PasswordResetSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [UserService, UserResolver, UserUtilsService, UserPasswordService],
  exports: [UserService, UserUtilsService, MongooseModule],
})
export class UserModule {
}