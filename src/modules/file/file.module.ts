import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from '@/modules/auth/token.service';
import  { UserService } from '@/modules/user/services/user.service';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from '@/modules/user/schemas/user.schema';
import { UserModule } from '@/modules/user/user.module';
import { FilesController } from '@/modules/file/file.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { GridFsService } from '@/modules/file/file.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
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
  providers: [ TokenService, GridFsService,],
})
export class FileModule {}
