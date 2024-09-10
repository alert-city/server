import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/services/user.service';
import { Request } from 'express';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { NOT_FOUND_ERROR } from '@/common/constants/code';
import { I18nService } from '@/modules/i18n/i18n.service';

export interface RefreshTokenResponse {
  id: string;
  accessTokenFromRequest: string;
  accessTokenFromDB: string;
}

@Injectable()
export class TokenService {
  private readonly errorContext: ErrorContext;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async processToken(req: Request): Promise<RefreshTokenResponse> {
    let accessTokenFromRequest = '';
    const cookies = req.headers.cookie;
    if (cookies) {
      const cookieArray = cookies.split(';');
      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.startsWith('access_token=')) {
          accessTokenFromRequest = cookie.substring('access_token='.length);
        }
      }
    }
    await this.errorContext.execute({
      type: 'TRUE_OR_FALSE',
      trueOrFalse: accessTokenFromRequest,
      message: this.t('accessTokenNotExists'),
      code: NOT_FOUND_ERROR,
    });
    let id: string;
    let accessTokenFromDB: string;
    let refreshTokenFromDB: string;
    const decoded = this.jwtService.decode(accessTokenFromRequest);
    id = decoded.id;
    const foundUser = await this.userService.findOneUser(id);
    await this.errorContext.execute({
      type: 'IS_SINGLE_OBJ_EXIST',
      singleObj: foundUser,
      message: this.t('idNotFound'),
      code: NOT_FOUND_ERROR,
    });
    refreshTokenFromDB = foundUser.refreshToken;
    accessTokenFromDB = foundUser.accessToken;
    req.headers['Refresh-Token'] = refreshTokenFromDB;
    return { accessTokenFromRequest, accessTokenFromDB, id };
  }
}
