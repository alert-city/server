import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserService } from '@/modules/user/user.service';
import { CustomException } from '@/common/exceptions/user.exception';
import * as nodemailer from 'nodemailer';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { ConfigService } from '@nestjs/config';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivationResponseDto } from '@/modules/user/dtos/user-response.dto';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel('Activation') private readonly activationModel: Model<ActivationResponseDto>,
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

  async sendVerificationEmail(username: string): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    const code = this.generateVerificationCode();
    const expiresIn = 10 * 60 * 1000;
    const expirationTime = new Date(Date.now() + expiresIn);
    const verificationInfo = {
      code,
      expires: expirationTime,
    };
    // const username = user.username;
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    let greeting = '';
    if (user?.accountType === 'Organization') {
      greeting = `To ${user.orgName}:`;
    } else if (user?.accountType === 'Personal') {
      greeting = `Dear ${user.name.firstName}:`;
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

  async sendActivationEmail(user: UserResponseDto): Promise<boolean> {
    let greeting = '';
    if (user?.accountType === 'Organization') {
      greeting = `To ${user.orgName}:`;
    } else if (user?.accountType === 'Personal') {
      greeting = `Dear ${user.name.firstName}:`;
    }
    const username = user.username;
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const token = await this.userUtilsService.generateToken(user.id);
    const activationLink = `${baseUrl}/activate?token=${token}&username=${username}`;
    const createdAt = new Date();

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="text-align: center;">
      <img src="${baseUrl}/favicon.png" alt="Alert City Logo" style="width: 100px; height: 100px; margin-bottom: 20px;">
    </div>
    <h2 style="text-align: center; margin-top: 0; margin-bottom:10px;">Activate Your Account</h2>
    <p>${greeting}</p>
    <p>To complete your registration, please click the link below to activate your account:</p>
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
      to: username,
      subject: 'Activate Your Alert City Account',
      html: htmlContent,
      headers: {
        'X-Priority': '1', // 1 = High, 3 = Normal, 5 = Low
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      await this.activationModel.create({ userId: user.id, activationToken: token,createdAt:createdAt });
      return true;
    } catch (error) {
      return false;
    }
  }


  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
