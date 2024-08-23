import { Injectable } from '@nestjs/common';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserService } from './user.service';
import { CustomException } from '@/common/exceptions/user.exception';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import {
  VERIFICATION_CODE_EXPIRED,
  VERIFICATION_CODE_NOT_MATCH,
  VERIFICATION_CODE_INVALID,
  UPDATE_ERROR,
  SAME_PASSWORD,
} from '@/common/constants/code';
import { NotificationService } from '@/modules/notification/notification.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PasswordResetResponseDto } from '@/modules/user/dtos/user-response.dto';

@Injectable()
export class UserPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly userUtilsService: UserUtilsService,
    private readonly notificationService: NotificationService,
    @InjectModel('PasswordReset') private readonly passwordResetModel: Model<PasswordResetResponseDto>,
  ) {}

  async sendVerificationEmail(username: string): Promise<boolean> {
    return await this.notificationService.sendPasswordResetEmail(username);
  }

  async resetPassword(
    username: string,
    input: UpdateUserRequestDto,
  ): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    const id = user.id;
    const records = await this.passwordResetModel.find({ userId: id }).sort({ createdAt: -1 }).exec();
    const latestRecord = records[0];
    const passwordStored = user.password;
    const isPasswordSame = await this.userUtilsService.comparePassword(input.password, passwordStored);

    if (isPasswordSame) {
      throw new CustomException('New password cannot be the same as the old password', 'SAME_PASSWORD', SAME_PASSWORD);
    } else if (!latestRecord) {
      throw new CustomException('Verification code invalid', 'VERIFICATION_CODE_INVALID', VERIFICATION_CODE_INVALID);
    }
    const { verificationCode, expires } = latestRecord;
    const now = new Date();

    if (input.verificationCode !== verificationCode) {
      throw new CustomException('Verification code is not match', 'VERIFICATION_CODE_NOT_MATCH', VERIFICATION_CODE_NOT_MATCH);
    } else if (expires < now) {
      throw new CustomException('Verification code is expired', 'VERIFICATION_CODE_EXPIRED', VERIFICATION_CODE_EXPIRED);
    }

    input.password = await this.userUtilsService.hashPassword(input.password);
    input.verificationCode = input.verificationCode.trim();

    const updatedUser = await this.userService.updateUser(id, input);
    if (!updatedUser) {
      throw new CustomException('User not updated', 'UPDATE_ERROR', UPDATE_ERROR);
    }
    await this.passwordResetModel.deleteMany({ userId: id });
    return true;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
