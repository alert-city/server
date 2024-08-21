import { Injectable } from '@nestjs/common';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserService } from './user.service';
import { CustomException } from '@/common/exceptions/user.exception';
import * as nodemailer from 'nodemailer';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import {
  VERIFICATION_CODE_EXPIRED,
  VERIFICATION_CODE_NOT_MATCH,
  VERIFICATION_CODE_NOT_EXIST,
  UPDATE_ERROR,
  SAME_PASSWORD,
} from '@/common/constants/code';
import { NotificationService } from '@/modules/notification/notification.service';

@Injectable()
export class UserPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly userUtilsService: UserUtilsService,
    private readonly notificationService: NotificationService,
  ) {}

  async sendVerificationEmail(username: string): Promise<boolean> {
    // const user = await this.userService.findUserByUsername(username);
    return await this.notificationService.sendVerificationEmail(username);
  }

  async resetPassword(
    username: string,
    input: UpdateUserRequestDto,
  ): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    const id = user.id;
    const verificationInfo = user.verificationInfo;
    const passwordStored = user.password;
    const isPasswordSame = await this.userUtilsService.comparePassword(input.password, passwordStored);

    if (isPasswordSame) {
      throw new CustomException('New password cannot be the same as the old password', 'SAME_PASSWORD', SAME_PASSWORD);
    } else if (!verificationInfo) {
      throw new CustomException('Verification code is not exist', 'VERIFICATION_CODE_NOT_EXIST', VERIFICATION_CODE_NOT_EXIST);
    }
    const { code, expires } = verificationInfo;
    const now = new Date();

    if (input.verificationCode !== code) {
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
    await this.userService.updateUser(id, { verificationInfo: null });
    return true;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
