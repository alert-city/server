import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '@/modules/auth/auth.service';
import { AccessTokenGuard } from './jwt-access-auth.guard';
import { RefreshTokenGuard } from './jwt-refresh-auth.guard';
import { TokenService } from '@/modules/auth/token.service';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { FORBIDDEN_ERROR } from '@/common/constants/code';
import { I18nService } from '@/modules/i18n/i18n.service';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  private readonly errorContext: ErrorContext;

  constructor(
    private readonly authService: AuthService,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly refreshTokenGuard: RefreshTokenGuard,
    private readonly tokenService: TokenService,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req: any;
    let res: any;

    if (GqlExecutionContext.create(context).getType() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      req = gqlContext.getContext().req;
      res = gqlContext.getContext().res;
    } else {
      req = context.switchToHttp().getRequest();
      res = context.switchToHttp().getResponse();
    }

    const { accessTokenFromRequest, accessTokenFromDB } =
      await this.tokenService.processToken(req);

    if (accessTokenFromRequest !== accessTokenFromDB) {
      res.setHeader('Auth-Status', 'invalid');
      await this.errorContext.execute({
        type: 'COMPARE_TWO_STRINGS_NOT_EQUAL',
        string: { string1: accessTokenFromRequest, string2: accessTokenFromDB },
        message: this.t('accessTokenNotMatch'),
      });
    }

    try {
      const canActivate = await this.accessTokenGuard.canActivate(context);
      if (canActivate) {
        return true;
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        try {
          const canActivate = await this.refreshTokenGuard.canActivate(context);
          if (canActivate) {
            const user = req.user;
            const newAccessToken =
              await this.authService.generateAccessToken(user);
            res.setHeader('New-Access-Token', newAccessToken);
            return true;
          }
        } catch (refreshTokenErr) {
          res.setHeader('Auth-Status', 'invalid');
          await this.errorContext.execute({
            type: 'DIRECT_THROW',
            message: this.t('bothTokenInvalid'),
            code: FORBIDDEN_ERROR,
          });
        }
      }
    }
    return false;
  }
}
