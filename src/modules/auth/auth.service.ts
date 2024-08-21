import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@/modules/auth/token.service';
import { UserService } from '@/modules/user/user.service';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { TwoFADto } from '@/modules/auth/dtos/login-response.dto';
import * as crypto from 'crypto';
import base32 from 'base32.js';
import * as speakeasy from 'speakeasy';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  PASSWORD_NOT_MATCH,
  UPDATE_ERROR,
  USER_NOT_FOUND, INVALID_2FA_CODE, ACCOUNT_NOT_ACTIVATED,
} from '@/common/constants/code';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly userUtilsService: UserUtilsService,
    private readonly configService: ConfigService,
  ) {
  }

  async login(
    input: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const { username, password, isStaySignedIn } = input;
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', USER_NOT_FOUND);
    }

    if (!user?.isAccountActivated) {
      throw new CustomException('Account not activated', 'ACCOUNT_NOT_ACTIVATED', ACCOUNT_NOT_ACTIVATED);
    }

    const isPasswordValid = await this.userUtilsService.comparePassword(password, user.password);
    const periodOneDay = 1000 * 60 * 60 * 24;
    const periodOneWeek = periodOneDay * 7;
    const expiresFreshToken = isStaySignedIn ? periodOneWeek : periodOneDay;
    if (user && isPasswordValid) {
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: expiresFreshToken });

      //set refresh token into database
      await this.userService.updateUser(user.id, { refreshToken });

      return {
        id: user.id,
        accessToken,
        name: user.name,
        role: user.role,
        accountType: user.accountType,
        organization: user.organization,
        username: user.username,
      };
    } else if (!isPasswordValid) {
      throw new CustomException('Password not match', 'PASSWORD_NOT_MATCH', PASSWORD_NOT_MATCH);
    }
  }

  async generateAccessToken(user: UserResponseDto): Promise<string> {
    let accessToken: string;
    accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    //set access token into database
    await this.userService.updateUser(user.id, { accessToken, verificationInfo: null });
    return accessToken;
  }

  async revokeTokens(context: any): Promise<boolean> {
    const req = context.req;
    const { id } = await this.tokenService.processToken(req);
    const updatedUser = await this.userService.updateUser(id, { refreshToken: '', accessToken: '' });
    if (!updatedUser) {
      throw new CustomException('Update user failed', 'UPDATE_ERROR', UPDATE_ERROR);
    }
    return true;
  }

  async generate2FA(
    issuer: string,
    username: string,
  ): Promise<TwoFADto> {
    const secretBuffer = crypto.randomBytes(20);
    const company = this.configService.get('COMPANY_NAME');
    const secret = new base32.Encoder({ type: 'rfc4648', lc: true }).write(secretBuffer).finalize();
    const totpURI = `otpauth://totp/${company}:${username}?secret=${secret}&issuer=${issuer}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(totpURI)}`;
    const id = await this.userService.getIdByUsername(username);
    await this.userService.updateUser(id, { twoFASecret: secret });
    return { secret, qrCodeUrl };
  }

  async verify2FACode(
    username: string,
    code: string,
  ): Promise<boolean> {
    const foundUser = await this.userService.findUserByUsername(username);
    const secret = foundUser.twoFASecret;
    console.log('secret', secret);
    console.log('code', code);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 3, // 可选，允许的时间偏移窗口，通常是1
    });

    if (!verified) {
      console.log('Invalid 2FA code');
      throw new CustomException('Invalid 2FA code', 'INVALID_2FA_CODE', INVALID_2FA_CODE);
    }
    console.log('verified', verified);
    return verified;
  }

}