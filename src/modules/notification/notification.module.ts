import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { ActivationSchema } from '@/modules/user/schemas/activation.schema';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'Activation', schema: ActivationSchema }]),
    forwardRef(() => UserModule),
    // UserModule
  ],
  providers: [NotificationService, ],
  exports: [NotificationService],
})
export class NotificationModule {}

// UserUtilsService,