import { Injectable } from '@nestjs/common';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserService } from './user.service';
import { CustomException } from '@/common/exceptions/user.exception';
import * as nodemailer from 'nodemailer';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { ConfigService } from '@nestjs/config';
import {
  VERIFICATION_CODE_EXPIRED,
  VERIFICATION_CODE_NOT_MATCH,
  VERIFICATION_CODE_NOT_EXIST,
  UPDATE_ERROR
} from '@/common/constants/code';

@Injectable()
export class UserPasswordService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly userUtilsService: UserUtilsService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(username: string): Promise<boolean> {
    const id = await this.userService.getIdByUsername(username);
    const code = this.generateVerificationCode();
    const expiresIn = 10 * 60 * 1000; // 10 minutes expiration
    const expirationTime = new Date(Date.now() + expiresIn); // 计算过期时间
    const verificationInfo = {
      code,
      expires: expirationTime,
    };

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: username,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await this.userService.updateUser(id, { verificationInfo });
      return true;
    } catch (error) {
      return false;
    }
  }

  async resetPassword(
    username: string,
    input: UpdateUserRequestDto,
  ): Promise<boolean> {
    const { verificationCode } = input;
    input.password = await this.userUtilsService.hashPassword(input.password);
    input.verificationCode = input.verificationCode.trim();

    const id = await this.userService.getIdByUsername(username);

    const verificationInfo = await this.userService.getVerificationInfo(id);
    if (!verificationInfo) {
      throw new CustomException('Verification code is not exist', 'VERIFICATION_CODE_NOT_EXIST', VERIFICATION_CODE_NOT_EXIST);
    }
    const { code, expires } = verificationInfo;
    const now = new Date();

    if (input.verificationCode !== code) {
      throw new CustomException('Verification code is not match', 'VERIFICATION_CODE_NOT_MATCH', VERIFICATION_CODE_NOT_MATCH);
    } else if (expires < now) {
      throw new CustomException('Verification code is expired', 'VERIFICATION_CODE_EXPIRED', VERIFICATION_CODE_EXPIRED);
    }
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
