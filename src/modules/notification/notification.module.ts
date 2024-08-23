import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
  ],
  providers: [NotificationService, ],
  exports: [NotificationService],
})
export class NotificationModule {}
