import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from '@/modules/auth/token.service';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from '@/modules/user/schemas/user.schema';
import { UserModule } from '@/modules/user/user.module';
import { FilesController } from '@/modules/file/file.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { GridFsService } from '@/modules/file/file.service';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { I18nService } from '@/modules/i18n/i18n.service';
import { I18nModule } from '@/modules/i18n/i18n.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => I18nModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    UserModule,
  ],
  controllers: [FilesController],
  providers: [TokenService, GridFsService, UnifiedErrorStrategyImpl, I18nService],
})
export class FileModule {
}
