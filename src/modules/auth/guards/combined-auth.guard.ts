import { Injectable, CanActivate, ExecutionContext, UnauthorizedException,ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '@/modules/auth/auth.service';
import { AccessTokenGuard } from './jwt-access-auth.guard';
import { RefreshTokenGuard } from './jwt-refresh-auth.guard';
import { TokenService } from '@/modules/auth/token.service';


@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly refreshTokenGuard: RefreshTokenGuard,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    const res = ctx.res;
    const req = ctx.req;

    const { accessTokenFromRequest,accessTokenFromDB} = await this.tokenService.processToken(req);

    if(accessTokenFromRequest !== accessTokenFromDB){
      res.setHeader('x-auth-status', 'invalid');
      throw new UnauthorizedException('Access token is invalid');
    }

    try {
      const canActivate = await this.accessTokenGuard.canActivate(context);
      if (canActivate) {
        return true;
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        // access token 验证失败，验证 refresh token
        // console.log('access token 无效');
        try {
          const canActivate = await this.refreshTokenGuard.canActivate(context);
          if (canActivate) {
            // console.log('refresh token 验证成功，开始生成新的 access token');
            const user = ctx.req.user;
            const newAccessToken = await this.authService.generateAccessToken(user);
            res.setHeader('x-new-access-token', newAccessToken);
            return true;
          }
        } catch (refreshTokenErr) {
          // console.log('refresh token 无效');
          res.setHeader('x-auth-status', 'invalid');
          throw new ForbiddenException('Both tokens are invalid. Please re-login.');
        }
      }
    }
    return false;
  }
}