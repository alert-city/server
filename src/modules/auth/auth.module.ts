import { Module, forwardRef } from  '@nestjs/common';
import { AuthResolver } from  './auth.resolver'
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { UserModule } from '@/modules/user/user.module';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { AccessTokenGuard } from '@/modules/auth/guards/jwt-access-auth.guard';
import { RefreshTokenGuard } from '@/modules/auth/guards/jwt-refresh-auth.guard';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { AccessJwtStrategy }  from './strategies/access-jwt.strategy';
import { UserUtilsService } from '@/modules/user/user-utils.service';


@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [AuthResolver, AuthService,TokenService, AccessJwtStrategy,RefreshJwtStrategy,AccessTokenGuard, RefreshTokenGuard, CombinedAuthGuard, UserUtilsService],
  exports: [AuthResolver, AuthService,TokenService, AccessJwtStrategy,RefreshJwtStrategy,AccessTokenGuard, RefreshTokenGuard, CombinedAuthGuard],
})

export class AuthModule {}