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
  UPDATE_ERROR,
  SAME_PASSWORD,
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
    const user = await this.userService.findUserByUsername(username);
    const code = this.generateVerificationCode();
    const expiresIn = 10 * 60 * 1000;
    const expirationTime = new Date(Date.now() + expiresIn);
    const verificationInfo = {
      code,
      expires: expirationTime,
    };
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    let greeting = '';
    if (user?.name?.firstName) {
      greeting = `Dear ${user.name.firstName}:`;
    } else if (user?.orgName) {
      greeting = `To ${user.orgName}:`;
    }

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center;">
      <img src="${baseUrl}/favicon.png" alt="Alert City Logo" style="width: 100px; height: 100px; margin-bottom: 20px;">
    </div>
    <h2 style="text-align: center; margin-top: 0;">Your Verification Code</h2>
    <p>${greeting}</p>
    <p>Your verification code is:</p>
    <h1 style="color: #007BFF; text-align: center;">${code}</h1>
    <p style="text-align: center;">This code will expire in <strong style="color: #FF0000;">10</strong> minutes.</p>
    <p>If you did not request this code, please ignore this email or contact us ASAP!</p>
    <p>Best regards,<br>Alert City</p>
    <hr style="margin: 20px 0;">
    <p>If you have any questions or need help, please <a href="https://support.alertcity.com" style="color: #007BFF;">contact our support team</a>.</p>
</div>
`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: username,
      subject: 'Password Reset Request - Verification Code',
      html: htmlContent,
      headers: {
        'X-Priority': '1', // 1 = High, 3 = Normal, 5 = Low
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await this.userService.updateUser(user.id, { verificationInfo });
      return true;
    } catch (error) {
      return false;
    }
  }

  async resetPassword(
    username: string,
    input: UpdateUserRequestDto,
  ): Promise<boolean> {
    console.log('开始重置密码');
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
