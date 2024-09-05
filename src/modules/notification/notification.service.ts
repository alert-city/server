import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UserService } from '@/modules/user/services/user.service';
import * as nodemailer from 'nodemailer';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
import { ConfigService } from '@nestjs/config';
import {
  EmailCodeValidationResponseDto,
  EmailLinkValidationResponseDto,
} from '@/modules/notification/dtos/notification-response.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface SendActivationLinkEmailParams {
  user: UserResponseDto;
  emailInfoType: number;
  newUsername?: string;
  locale?: string;
}

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private codeEmailInfo: { [key: number]: string[] } = {
    1: ['Reset Your Password', 'Reset Password Request - Verification Code'],
    2: ['Update Your Username', 'Update Username Request - Verification Code'],
  };

  private linkEmailInfo: { [key: number]: string[] } = {
    1: ['Activate Your Account', 'Activate Your Alert City Account', 'To complete your registration, please click the link below to activate your account:'],
    2: ['Update Your Username', 'Update Your Username Request', 'To complete your username update, please click the link below:'],
  };

  constructor(
    @InjectModel(
      'EmailLinkValidation') private readonly emailLinkValidationModel: Model<EmailLinkValidationResponseDto>,
    @InjectModel(
      'EmailCodeValidation') private readonly emailCodeValidationModel: Model<EmailCodeValidationResponseDto>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
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

  async sendVerificationCodeEmail(
    username: string,
    emailInfoType: number,
  ): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    const verificationCode = this.generateVerificationCode();
    const expiresIn = 10 * 60 * 1000;
    const expirationTime = new Date(Date.now() + expiresIn);

    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    let greeting = '';
    if (user?.accountType === 'Organization') {
      greeting = `To ${user.orgName}:`;
    } else if (user?.accountType === 'Personal') {
      greeting = `Dear ${user.firstName}:`;
    }

    let head = '';
    let subject = '';
    if (emailInfoType === 1) {
      head = this.codeEmailInfo[1][0];
      subject = this.codeEmailInfo[1][1];
    } else if (emailInfoType === 2) {
      head = this.codeEmailInfo[2][0];
      subject = this.codeEmailInfo[2][1];
    }

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center;">
      <img src="${baseUrl}/images/alertcity-light.png" alt="Alert City Logo" style="width: 100px; height: 100px; margin-bottom: 20px;">
    </div>
    <h2 style="text-align: center; margin-top: 0;">${head}</h2>
    <p>${greeting}</p>
    <p>Your verification code is:</p>
    <h1 style="color: #007BFF; text-align: center;">${verificationCode}</h1>
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
      subject: subject,
      html: htmlContent,
      headers: {
        'X-Priority': '1', // 1 = High, 3 = Normal, 5 = Low
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await this.emailCodeValidationModel.create({ userId: user.id, verificationCode, expires: expirationTime });
      return true;
    } catch (error) {
      return false;
    }
  }

  async sendActivationLinkEmail(
    { user, emailInfoType, newUsername, locale } :SendActivationLinkEmailParams
  ): Promise<boolean> {
    let greeting = '';
    if (user?.accountType === 'Organization') {
      greeting = `To ${user.orgName}:`;
    } else if (user?.accountType === 'Personal') {
      greeting = `Dear ${user.firstName}:`;
    }

    let head = '';
    let subject = '';
    let description = '';
    if (emailInfoType === 1) {
      head = this.linkEmailInfo[1][0];
      subject = this.linkEmailInfo[1][1];
      description = this.linkEmailInfo[1][2];
    } else if (emailInfoType === 2) {
      head = this.linkEmailInfo[2][0];
      subject = this.linkEmailInfo[2][1];
      description = this.linkEmailInfo[2][2];
    }

    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const token = await this.userUtilsService.generateToken(user.id);
    const emailType = emailInfoType === 2 ? 'update' : 'activate';
    const activationLink = newUsername ? `${baseUrl}/${locale}/${emailType}?token=${token}&id=${user.id}&newUsername=${newUsername}&emailInfoType=${emailInfoType}` : `${baseUrl}/${locale}/${emailType}?token=${token}&id=${user.id}&emailInfoType=${emailInfoType}`;
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center;">
      <img src="${baseUrl}/images/alertcity-light.png" alt="Alert City Logo" style="width: 100px; height: 100px; margin-bottom: 20px;">
    </div>
    <h2 style="text-align: center; margin-top: 0; margin-bottom:10px;">${head}</h2>
    <p>${greeting}</p>
    <p>${description}</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${activationLink}" style="background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate Account</a>
    </div>
    <p style="text-align: center;">This link will expire in <strong style="color: #FF0000;">1</strong> hour.</p>
    <p>If you did not create an account, please ignore this email or contact us ASAP!</p>
    <p>Best regards,<br>Alert City</p>
    <hr style="margin: 20px 0;">
    <p>If you have any questions or need help, please <a href="https://support.alertcity.com" style="color: #007BFF;">contact our support team</a>.</p>
</div>
`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: emailInfoType === 2 ? newUsername : user.username,
      subject: subject,
      html: htmlContent,
      headers: {
        'X-Priority': '1', // 1 = High, 3 = Normal, 5 = Low
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      if (emailInfoType === 1) {
        await this.emailLinkValidationModel.create({ userId: user.id, activationToken: token });
      }
      if (emailInfoType === 2) {
        await this.emailLinkValidationModel.create({ userId: user.id, activationToken: token, newUsername });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
