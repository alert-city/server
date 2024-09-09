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
import { I18nService } from '@/modules/i18n/i18n.service';

interface SendActivationLinkEmailParams {
  user: UserResponseDto;
  emailInfoType: number;
  newUsername?: string;
  locale?: string;
}

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(
      'EmailLinkValidation') private readonly emailLinkValidationModel: Model<EmailLinkValidationResponseDto>,
    @InjectModel(
      'EmailCodeValidation') private readonly emailCodeValidationModel: Model<EmailCodeValidationResponseDto>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly userUtilsService: UserUtilsService,
    private readonly i18nService: I18nService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
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

    const head = this.t(`email.emailInfo.code.${emailInfoType}.title`);
    const subject = this.t(`email.emailInfo.code.${emailInfoType}.subject`);
    const description = this.t(`email.emailInfo.code.${emailInfoType}.description`);

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center;">
      <img src="${baseUrl}/images/alertcity-dark.png" alt="Alert City Logo" style="width: 100px; height: 100px; margin-bottom: 20px;">
    </div>
    <h2 style="text-align: center; margin-top: 0;">${head}</h2>
    <p>${greeting}</p>
    <p>${description}</p>
    <h1 style="color: #007BFF; text-align: center;">${verificationCode}</h1>
    <p style="text-align: center;">${this.t('email.expiration.codeExpires')}</p>
    <p>${this.t('email.footer.ignore')}</p>
    <p>${this.t('email.footer.bestRegards')}<br>${this.t('email.footer.alertCity')}</p>
    <hr style="margin: 20px 0;">
    <p>${this.t('email.footer.support')}</p>
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
    { user, emailInfoType, newUsername, locale }: SendActivationLinkEmailParams,
  ): Promise<boolean> {
    let greeting = '';
    if (user?.accountType === 'Organization') {
      greeting = `${this.t('email.greeting.organization')} ${user.orgName}${this.t('email.greeting.colon')}`;
    } else if (user?.accountType === 'Personal') {
      greeting = `${this.t('email.greeting.personal')} ${user.firstName}${this.t('email.greeting.colon')}`;
    }

    const head = this.t(`email.emailInfo.link.${emailInfoType}.title`);
    const subject = this.t(`email.emailInfo.link.${emailInfoType}.subject`);
    const description = this.t(`email.emailInfo.link.${emailInfoType}.description`);
    const buttonContent = this.t(`email.emailInfo.link.${emailInfoType}.button`);

    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const token = await this.userUtilsService.generateToken(user.id);
    const emailType = emailInfoType === 2 ? 'update' : 'activate';
    const activationLink = newUsername ? `${baseUrl}/${locale}/${emailType}?token=${token}&id=${user.id}&newUsername=${newUsername}&emailInfoType=${emailInfoType}` : `${baseUrl}/${locale}/${emailType}?token=${token}&id=${user.id}&emailInfoType=${emailInfoType}`;
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center;">
      <img src="${baseUrl}/images/alertcity-dark.png" alt="Alert City Logo" style="width: 100px; height: 100px; margin-bottom: 20px;">
    </div>
    <h2 style="text-align: center; margin-top: 0; margin-bottom:10px;">${head}</h2>
    <p>${greeting}</p>
    <p>${description}</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${activationLink}" style="background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${buttonContent}</a>
    </div>
    <p style="text-align: center;">${this.t('email.expiration.linkExpires')}</p>
    <p>${this.t('email.footer.ignore')}</p>
    <p>${this.t('email.footer.bestRegards')}<br>${this.t('email.footer.alertCity')}</p>
    <hr style="margin: 20px 0;">
    <p>${this.t('email.footer.support')}</p>
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
