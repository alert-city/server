import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { VALIDATION_ERROR } from '@/common/constants/code';
import { I18nService } from '@/modules/i18n/i18n.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class UserUtilsService {
  private readonly errorContext: ErrorContext;

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UnifiedErrorStrategyImpl))
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
    private readonly httpService: HttpService,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async isRecaptchaTokenValid(
    secretKey: string,
    recaptchaToken: string,
  ): Promise<boolean> {
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const response = await lastValueFrom(
      this.httpService
        .post(recaptchaUrl, null, {
          params: {
            secret: secretKey,
            response: recaptchaToken,
          },
        })
        .pipe(
          map((res) => {
            return res.data;
          }),
          catchError(async (err) => {
            await this.errorContext.execute({
              type: 'DIRECT_THROW',
              message: this.t('recaptchaError'),
              code: VALIDATION_ERROR,
            });
          }),
        ),
    );

    if (!response.success) {
      await this.errorContext.execute({
        type: 'DIRECT_THROW',
        message: this.t('recaptchaError'),
        code: VALIDATION_ERROR,
      });
    }
    return response.success;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const foundUser = await this.userModel.findOne({ username });
    return !!foundUser;
  }

  async isUsernameTakenNotActivate(
    username: string,
  ): Promise<{ result: boolean; id?: string }> {
    const foundUser = await this.userModel.findOne({ username });
    if (!foundUser) {
      return { result: null };
    }
    if (foundUser && !foundUser.isAccountActivated) {
      return { result: true, id: foundUser.id };
    } else if (foundUser && foundUser.isAccountActivated) {
      return { result: false };
    }
  }

  async isOAuthAccountExist(
    providerId: string,
    OAuthProvider: string,
  ): Promise<boolean> {
    const providerKey = OAuthProvider === 'google' ? `googleId` : `facebookId`;
    const foundUser = await this.userModel.exists({
      [providerKey]: providerId,
    });
    return !!foundUser;
  }

  async isAccountTypeOAuth(username: string): Promise<boolean> {
    const foundUser = await this.userModel.find({
      username,
      $or: [{ googleId: { $exists: true } }, { facebookId: { $exists: true } }],
    });
    return foundUser.length >= 1;
  }

  async isOrgExist(orgName: string): Promise<boolean> {
    const foundUsers = await this.userModel.find({ orgName }).exec();
    return foundUsers.length >= 1;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateToken(id: string): Promise<string> {
    return this.jwtService.sign({ id }, { expiresIn: '1h' });
  }

  async getIdFromToken(token: string): Promise<string> {
    const decoded = this.jwtService.decode(token);
    await this.errorContext.execute({
      type: 'TRUE_OR_FALSE',
      trueOrFalse: decoded,
      message: this.t('tokenInvalid'),
    });
    return decoded.id;
  }

  async verifyToken(token: string, tokenFromFB: string): Promise<boolean> {
    await this.errorContext.execute({
      type: 'COMPARE_TWO_STRINGS_NOT_EQUAL',
      string: { string1: token, string2: tokenFromFB },
      message: this.t('tokenNotMatch'),
    });
    try {
      this.jwtService.verify(token);
      return true;
    } catch (e) {
      await this.errorContext.execute({
        type: 'DIRECT_THROW',
        message: this.t('tokenExpired'),
        code: VALIDATION_ERROR,
      });
    }
  }
}
