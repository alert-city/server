import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@/modules/auth/token.service';
import { UserService } from '@/modules/user/services/user.service';
import {
  LoginRequestDto,
  OAuthLoginRequestDto,
} from '@/modules/auth/dtos/login-request.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { TwoFADto } from '@/modules/auth/dtos/login-response.dto';
import * as crypto from 'crypto';
import base32 from 'base32.js';
import * as speakeasy from 'speakeasy';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
import { ConfigService } from '@nestjs/config';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { I18nService } from '@/modules/i18n/i18n.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AUTHORIZATION_ERROR } from '@/common/constants/code';

@Injectable()
export class AuthService {
  private readonly errorContext: ErrorContext;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly userUtilsService: UserUtilsService,
    private readonly configService: ConfigService,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
    private readonly httpService: HttpService,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  private async handleTokens(
    user: UserResponseDto,
    isStaySignedIn: boolean,
  ): Promise<UserResponseDto> {
    await this.generateAccessToken(user);
    return await this.generateRefreshToken(user.id, isStaySignedIn);
  }

  async login(input: LoginRequestDto): Promise<UserResponseDto> {
    const { username, password, isStaySignedIn } = input;
    const isAccountTypeOAuth =
      await this.userUtilsService.isAccountTypeOAuth(username);
    await this.errorContext.execute({
      type: 'TRUE_OR_FALSE',
      trueOrFalse: !isAccountTypeOAuth,
      message: this.t('OAuthAccount'),
    });
    const user = await this.userService.findUserByUsername(username);
    await this.errorContext.execute({
      type: 'IS_ACCOUNT_ACTIVATED',
      singleObj: user,
      id: user.id,
    });
    await this.errorContext.execute({
      type: 'NORMAL_ACCOUNT_NOT_ALLOWED',
      singleObj: user,
    });
    await this.errorContext.execute({
      type: 'IS_PASSWORD_VALID',
      password: { passwordFromFE: password, passwordFromDB: user.password },
    });
    return await this.handleTokens(user, isStaySignedIn);
  }

  async OAuthLogin(input: OAuthLoginRequestDto): Promise<UserResponseDto> {
    const { OAuthProvider, providerId, accessToken, isStaySignedIn, username } =
      input;
    await this.verifyOAuthToken(
      OAuthProvider,
      accessToken,
      providerId,
      username,
    );
    const isOAuthAccountExist = await this.userUtilsService.isOAuthAccountExist(
      providerId,
      OAuthProvider,
    );
    const providerKey = OAuthProvider === 'google' ? `googleId` : `facebookId`;
    if (!isOAuthAccountExist) {
      const userInfo = {
        ...input,
        [providerKey]: providerId,
      };
      delete userInfo.OAuthProvider;
      delete userInfo.providerId;
      const newUser = await this.userService.createOAuthUser(userInfo);
      return await this.handleTokens(newUser, isStaySignedIn);
    }
    const foundUser = await this.userService.findOneOAuthUser(
      providerKey,
      providerId,
    );
    return await this.handleTokens(foundUser, isStaySignedIn);
  }

  async generateAccessToken(user: UserResponseDto): Promise<string> {
    const accessToken = await this.userUtilsService.generateToken(user.id);
    await this.userService.updateUser(user.id, { accessToken });
    return accessToken;
  }

  async generateRefreshToken(
    id: string,
    isStaySignedIn: boolean,
  ): Promise<UserResponseDto> {
    const periodOneDay = 1000 * 60 * 60 * 24;
    const periodOneWeek = periodOneDay * 7;
    const expiresFreshToken = isStaySignedIn ? periodOneWeek : periodOneDay;
    const refreshToken = this.jwtService.sign(
      { id: id },
      { expiresIn: expiresFreshToken },
    );
    return await this.userService.updateUser(id, { refreshToken });
  }

  async revokeTokens(context: any): Promise<boolean> {
    const req = context.req;
    const { id } = await this.tokenService.processToken(req);
    const updatedUser = await this.userService.updateUser(id, {
      refreshToken: '',
      accessToken: '',
    });
    return !!updatedUser;
  }

  async generate2FA(issuer: string, id: string): Promise<TwoFADto> {
    await this.errorContext.execute({ type: 'ID_VALIDATION', id });
    const foundUser = await this.userService.findOneUser(id);
    const secretBuffer = crypto.randomBytes(20);
    const company = this.configService.get('COMPANY_NAME');
    const secret = new base32.Encoder({ type: 'rfc4648', lc: true })
      .write(secretBuffer)
      .finalize();
    const totpURI = `otpauth://totp/${company}:${foundUser.username}?secret=${secret}&issuer=${issuer}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(totpURI)}`;
    await this.userService.updateUser(id, { twoFASecret: secret });
    return { secret, qrCodeUrl };
  }

  async verify2FACode(id: string, code: string): Promise<boolean> {
    await this.errorContext.execute({ type: 'ID_VALIDATION', id });
    const foundUser = await this.userService.findOneUser(id);
    const secret = foundUser.twoFASecret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 3, // 可选，允许的时间偏移窗口，通常是1
    });
    await this.errorContext.execute({
      type: 'TRUE_OR_FALSE',
      trueOrFalse: verified,
      message: this.t('invalid2FACode'),
    });
    return verified;
  }

  private async verifyOAuthToken(
    OAuthProvider: string,
    accessToken: string,
    providerId: string,
    username: string,
  ): Promise<boolean> {
    const clientID =
      OAuthProvider === 'google'
        ? this.configService.get('GOOGLE_CLIENT_ID')
        : this.configService.get('FACEBOOK_CLIENT_ID');
    const urlEnum = {
      google: 'https://oauth2.googleapis.com/tokeninfo?access_token=',
      facebook: 'https://graph.facebook.com/me',
    };
    const url = `${urlEnum[OAuthProvider]}${accessToken}`;
    const response = await lastValueFrom(
      this.httpService.get(url).pipe(
        map((res) => res.data),
        catchError((error) => {
          throw new Error('Invalid Google access token');
        }),
      ),
    );
    const clientId =
      OAuthProvider === 'google'
        ? this.configService.get('GOOGLE_CLIENT_ID')
        : this.configService.get('FACEBOOK_CLIENT_ID');
    if (
      response.sub !== providerId ||
      response.aud !== clientId ||
      response.email !== username ||
      response.email_verified !== 'true'
    ) {
      await this.errorContext.execute({
        type: 'DIRECT_THROW',
        message: this.t('OAuthValidation'),
        code: AUTHORIZATION_ERROR,
      });
    }
    return true;
  }
}
