import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { UserModule } from '@/modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailLinkValidationSchema } from '@/modules/notification/schemas/email-link-validation.schema';
import { EmailCodeValidationSchema } from '@/modules/notification/schemas/email-code-validation.schema';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: 'EmailLinkValidation', schema: EmailLinkValidationSchema },
      { name: 'EmailCodeValidation', schema: EmailCodeValidationSchema },
    ]),
  ],
  providers: [NotificationService],
  exports: [NotificationService, MongooseModule],
})
export class NotificationModule {}
