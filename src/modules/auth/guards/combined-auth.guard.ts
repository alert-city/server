import { Injectable, CanActivate, ExecutionContext, UnauthorizedException,ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '@/modules/auth/auth.service';
import { AccessTokenGuard } from './jwt-access-auth.guard';
import { RefreshTokenGuard } from './jwt-refresh-auth.guard';
import { TokenService } from '@/modules/auth/token.service';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  ACCESS_TOKEN_NOT_MATCH,
  FORBIDDEN
} from '@/common/constants/code';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly refreshTokenGuard: RefreshTokenGuard,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req: any;
    let res: any;

    // 判断请求是否为 GraphQL 请求
    if (GqlExecutionContext.create(context).getType() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      req = gqlContext.getContext().req;
      res = gqlContext.getContext().res;
    } else {
      // 非 GraphQL 请求，默认为 REST API 请求
      req = context.switchToHttp().getRequest();
      res = context.switchToHttp().getResponse();
    }

    const { accessTokenFromRequest,accessTokenFromDB} = await this.tokenService.processToken(req);

    if(accessTokenFromRequest !== accessTokenFromDB){
      res.setHeader('x-auth-status', 'invalid');
      throw new CustomException('Access token not match', 'ACCESS_TOKEN_NOT_MATCH', ACCESS_TOKEN_NOT_MATCH);
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
            const newAccessToken = await this.authService.generateAccessToken(user);
            res.setHeader('x-new-access-token', newAccessToken);
            return true;
          }
        } catch (refreshTokenErr) {
          res.setHeader('x-auth-status', 'invalid');
          throw new CustomException('Both tokens are invalid. Please re-login.', 'FORBIDDEN', FORBIDDEN);
        }
      }
    }
    return false;
  }
}